import { NextResponse } from "next/server";
import { GARDEN_PRESETS, expandPromptForAI } from "@/lib/presets";
import { analyzeBed } from "@/lib/companions";
import type { BedConditions, GardenBed, PlacedPlant } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Internal dev-only sanity check. Runs every preset through /api/ai/layout
// against the planner's default bed and returns the issues each produces.
// Disabled in production unless the caller passes ?token=<DEV_TEST_TOKEN>.
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!process.env.DEV_TEST_TOKEN || token !== process.env.DEV_TEST_TOKEN) {
      return NextResponse.json({ error: "Not available." }, { status: 404 });
    }
  }

  const url = new URL(req.url);
  const width = Number(url.searchParams.get("width") ?? 8);
  const height = Number(url.searchParams.get("height") ?? 6);
  const sun = (url.searchParams.get("sun") ?? "full-sun") as BedConditions["sun"];
  const zone = Number(url.searchParams.get("zone") ?? 6);

  const conditions: BedConditions = {
    sun,
    soil: "loam",
    ph: "neutral",
    zone,
  };

  const origin = `${url.protocol}//${url.host}`;

  const results = await Promise.all(
    GARDEN_PRESETS.map(async (preset) => {
      try {
        const res = await fetch(`${origin}/api/ai/layout`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            prompt: expandPromptForAI(preset.prompt),
            width,
            height,
            conditions,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          return {
            label: preset.label,
            ok: false,
            error: data?.error ?? `HTTP ${res.status}`,
          };
        }
        const plants = (data.plants ?? []) as PlacedPlant[];
        const bed: GardenBed = {
          id: "dev-test",
          name: "Dev test",
          width,
          height,
          conditions,
          plants,
        };
        const issues = analyzeBed(bed);
        const errors = issues.filter((i) => i.level === "error");
        const warnings = issues.filter((i) => i.level === "warning");
        return {
          label: preset.label,
          ok: errors.length === 0,
          plantCount: plants.length,
          rationale: data.rationale,
          errors: errors.map((i) => i.message),
          warnings: warnings.map((i) => i.message),
        };
      } catch (e) {
        return {
          label: preset.label,
          ok: false,
          error: e instanceof Error ? e.message : "Unknown error",
        };
      }
    }),
  );

  const summary = {
    total: results.length,
    clean: results.filter((r) => r.ok && !("error" in r && r.error)).length,
    withErrors: results.filter(
      (r) => "errors" in r && Array.isArray(r.errors) && r.errors.length > 0,
    ).length,
    failed: results.filter((r) => "error" in r && r.error).length,
  };

  return NextResponse.json({ summary, results });
}
