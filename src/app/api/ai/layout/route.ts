import { NextResponse } from "next/server";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, extractJson, getAnthropic } from "@/lib/ai";
import { PLANTS } from "@/lib/plants";
import type { PlacedPlant } from "@/lib/types";

export const runtime = "nodejs";

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

Other rules:
- Output JSON only. No prose outside the JSON.
- Respect the bed's growing conditions (sun, soil, pH, USDA zone).
- Maximize companion-planting benefits; never place two antagonists adjacent.
- Group tall plants (corn, sunflower) to the north (low y) so they don't shade shorter plants.
- Include a short rationale (1-3 sentences) explaining the strategy.

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
    const placements: PlacedPlant[] = result.data.plants
      .filter((p) => knownIds.has(p.plantId))
      .map((p) => ({
        instanceId: Math.random().toString(36).slice(2, 10),
        plantId: p.plantId,
        x: Math.min(width - 1, Math.max(0, p.x)),
        y: Math.min(height - 1, Math.max(0, p.y)),
      }));

    return NextResponse.json({
      rationale: result.data.rationale,
      plants: placements,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `AI request failed: ${msg}` }, { status: 502 });
  }
}
