import { NextResponse } from "next/server";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, extractJson, getAnthropic } from "@/lib/ai";
import { PLANTS } from "@/lib/plants";
import type { PlacedPlant } from "@/lib/types";

export const runtime = "nodejs";

/**
 * Strip technical jargon and translate axis/zone talk into plain language
 * if the model slips them through, then clamp to two short sentences.
 */
function cleanRationale(text: string): string {
  let out = text.trim();
  // Drop bracketed coordinate annotations like "(y=0-1)" or "[x=2, y=3]".
  out = out.replace(/\s*[\(\[]\s*[xy]\s*[=:][^\)\]]*[\)\]]/gi, "");
  // Translate axis words.
  out = out
    .replace(/\b(?:low|high)\s+y\b/gi, (m) =>
      /low/i.test(m) ? "back of the bed" : "front of the bed",
    )
    .replace(/\b(?:low|high)\s+x\b/gi, (m) =>
      /low/i.test(m) ? "left side" : "right side",
    )
    .replace(/\b(?:north|south)\s+(?:side|end|row)\b/gi, (m) =>
      /north/i.test(m) ? "back of the bed" : "front of the bed",
    )
    .replace(/\bnorth\b/gi, "back")
    .replace(/\bsouth\b/gi, "front")
    .replace(/\bantagonist[s]?\b/gi, "plants that don't get along")
    .replace(/\bcompanion planting\b/gi, "good plant pairings")
    .replace(/\bsuccession\b/gi, "staggered")
    .replace(/\boptimized\b/gi, "set up")
    .replace(/\bprioritiz(?:e|es|ed|ing)\b/gi, "focus on")
    .replace(/\bsqft\b/gi, "square foot")
    .replace(/\bzone\s*\d+\b/gi, "your area")
    .replace(/\bfull-?sun\b/gi, "plenty of sun")
    .replace(/\bpart-?(?:sun|shade)\b/gi, "partial sun")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;])/g, "$1");
  // Limit to first 2 sentences.
  const sentences = out.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 2) {
    out = sentences.slice(0, 2).join(" ").trim();
  }
  return out.trim();
}

const RequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  width: z.number().int().min(1).max(40),
  height: z.number().int().min(1).max(40),
  conditions: z.object({
    sun: z.enum(["full-sun", "part-sun", "part-shade", "shade"]),
    soil: z.enum(["loam", "sandy", "clay", "silty", "chalky", "peaty"]),
    ph: z.enum(["acidic", "neutral", "alkaline"]),
    zone: z.number().int().min(1).max(13),
  }),
});

const ResponseSchema = z.object({
  rationale: z.string(),
  plants: z
    .array(
      z.object({
        plantId: z.string(),
        x: z.number().int().min(0),
        y: z.number().int().min(0),
      }),
    )
    .max(200),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const client = getAnthropic();
  if (!client) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 503 },
    );
  }

  const { prompt, width, height, conditions } = parsed.data;

  const plantCatalog = PLANTS.map((p) => {
    const spacing = Math.max(1, p.spacingIn);
    const footprintCells =
      spacing > 12 ? Math.ceil(spacing / 12) : 1;
    const perCell =
      spacing > 12 ? 1 : Math.max(1, Math.round(12 / spacing)) ** 2;
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      sun: p.sun,
      soil: p.soil,
      ph: p.ph,
      zones: p.zones,
      spacingIn: p.spacingIn,
      footprintCells, // side length in 1ft cells (1 means it occupies a single cell)
      perCell, // how many of this plant fit per single 1ft cell when footprintCells===1
      companions: p.companions,
      antagonists: p.antagonists,
    };
  });

  const systemPrompt = `You are an expert horticulturist and garden designer.
You will design a planting layout for a single raised bed represented as a grid
of 12-inch (1-foot) cells. Use ONLY plants from the provided catalog (by id).

True-to-size sizing rules — VERY IMPORTANT:
- Every cell is 12in × 12in. A plant's footprint is a SQUARE of
  "footprintCells" × "footprintCells" cells in the catalog.
- A plant occupies its ENTIRE footprint. Do not place any other plant in
  any cell covered by another plant's footprint. Footprints must NOT overlap.
- footprintCells === 1 plants (e.g. lettuce, carrot, onion) only occupy one
  cell — but ${"`perCell`"} of them grow inside that single cell (Square Foot Gardening).
  Still only emit ONE placement per cell for those plants; the planner shows
  the per-cell count automatically.
- Keep coordinates inside the grid: 0 <= x, 0 <= y, and
  x + footprintCells <= width, y + footprintCells <= height.
- Leave breathing room, but fill the bed well. A good beginner bed uses
  80–95% of cells. Aim for at least width*height*0.8 placements (for a
  typical 4×8 bed that's ~25–30 plants). Empty cells are fine only to
  separate antagonists or leave a narrow access path on very wide beds.

Companion rules — ALSO CRITICAL:
- Before finalizing, double-check that NO two plants whose footprints are
  within 2 cells of each other appear in each other's "antagonists" list.
  If a conflict exists, REMOVE one of them or relocate it >= 3 cells away.
- Common antagonist traps to avoid: brassicas next to tomato/pepper/strawberry,
  fennel next to almost anything, onion/garlic family next to bean/pea,
  dill next to carrot, potato next to tomato/cucumber/squash/sunflower.
- Maximize companion bonuses where present (basil+tomato, carrot+onion,
  marigold near nightshades, beans climbing corn, etc.).

Condition rules:
- Respect the bed's growing conditions (sun, soil, pH, USDA zone).
- Skip plants whose zone range excludes the bed's zone.
- Skip full-sun-only plants if the bed is part-shade or shade.

Layout rules:
- Group tall plants (corn, sunflower, pole beans on trellis) along the back
  (lowest y values) so they don't shade shorter plants.
- Put low/edge-friendly plants (lettuce, strawberry, herbs) along the front
  (highest y values).
- Cluster companions, separate antagonists.

Output rules:
- Output JSON only. No prose outside the JSON.
- Write a SHORT, friendly rationale: 1–2 sentences, 30 words MAX, aimed at
  a brand-new gardener who has never planted anything before.
- Use ONLY plain everyday words. Talk about "front of the bed" or
  "back of the bed", never coordinates, axes, cell numbers, or letters like
  x or y.
- Banned words/phrases in the rationale: "x", "y", "y=", "x=", "coordinates",
  "grid", "cell", "sqft", "square foot", "antagonist", "companion planting",
  "succession", "profile", "prioritize", "optimized", "zone 6" (or any other
  zone number), "full-sun", "part-sun", "part-shade", "shade" (as a category
  label), "high y", "low y", "north", "south".
- Focus on what the gardener GETS: "Basil keeps pests off the tomatoes, and
  the lettuce sits at the front so it's easy to pick."

JSON shape:
{
  "rationale": "string",
  "plants": [{ "plantId": "string (must exist in catalog)", "x": number, "y": number }]
}`;

  const userMessage = `Bed: ${width} cells wide x ${height} cells tall (each cell = 12 inches).
Conditions: sun=${conditions.sun}, soil=${conditions.soil}, pH=${conditions.ph}, USDA zone=${conditions.zone}.

Gardener's goal: ${prompt}

Plant catalog (JSON):
${JSON.stringify(plantCatalog)}

Return the JSON layout now.`;

  try {
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const raw = extractJson(text);
    const result = ResponseSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json(
        { error: "AI returned malformed layout.", details: result.error.flatten(), raw },
        { status: 502 },
      );
    }

    // Filter to known plants and clamp coords.
    const knownIds = new Set(PLANTS.map((p) => p.id));
    const initial: PlacedPlant[] = result.data.plants
      .filter((p) => knownIds.has(p.plantId))
      .map((p) => ({
        instanceId: Math.random().toString(36).slice(2, 10),
        plantId: p.plantId,
        x: Math.min(width - 1, Math.max(0, p.x)),
        y: Math.min(height - 1, Math.max(0, p.y)),
      }));

    // --- Safety net: clean up obvious mistakes the AI sometimes makes. ---
    const plantById = new Map(PLANTS.map((p) => [p.id, p]));
    const footprintCells = (id: string) => {
      const sp = plantById.get(id)?.spacingIn ?? 12;
      return sp > 12 ? Math.ceil(sp / 12) : 1;
    };
    const occupied = new Set<string>();
    const placements: PlacedPlant[] = [];
    const cheby = (a: PlacedPlant, b: PlacedPlant) =>
      Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

    for (const p of initial) {
      const fp = footprintCells(p.plantId);
      if (p.x + fp > width || p.y + fp > height) continue;
      // Reject overlap with already-accepted placements.
      let overlaps = false;
      for (let dx = 0; dx < fp; dx++) {
        for (let dy = 0; dy < fp; dy++) {
          if (occupied.has(`${p.x + dx}:${p.y + dy}`)) {
            overlaps = true;
            break;
          }
        }
        if (overlaps) break;
      }
      if (overlaps) continue;
      // Reject antagonist within 2 cells of an already-accepted placement.
      const plant = plantById.get(p.plantId);
      if (!plant) continue;
      let antagonistNear = false;
      for (const acc of placements) {
        if (cheby(p, acc) > 2) continue;
        const other = plantById.get(acc.plantId);
        if (!other) continue;
        if (
          plant.antagonists.includes(other.id) ||
          other.antagonists.includes(plant.id)
        ) {
          antagonistNear = true;
          break;
        }
      }
      if (antagonistNear) continue;
      // Accept.
      placements.push(p);
      for (let dx = 0; dx < fp; dx++) {
        for (let dy = 0; dy < fp; dy++) {
          occupied.add(`${p.x + dx}:${p.y + dy}`);
        }
      }
    }

    return NextResponse.json({
      rationale: cleanRationale(result.data.rationale),
      plants: placements,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `AI request failed: ${msg}` }, { status: 502 });
  }
}
