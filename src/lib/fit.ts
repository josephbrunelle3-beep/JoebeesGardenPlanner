import type { BedConditions, Plant, SunRequirement } from "./types";

const SUN_RANK: Record<SunRequirement, number> = {
  "full-sun": 3,
  "part-sun": 2,
  "part-shade": 1,
  shade: 0,
};

export type FitLevel = "good" | "warn" | "bad";

export interface FitResult {
  level: FitLevel;
  reasons: string[];
}

/**
 * Score how well a plant fits the bed's conditions plus the plants
 * already placed in it. Used to color the palette buttons.
 */
export function scorePlantFit(
  plant: Plant,
  conditions: BedConditions,
  placedPlantIds: readonly string[],
): FitResult {
  const reasons: string[] = [];
  let level: FitLevel = "good";

  // Zone — hard mismatch.
  const [zMin, zMax] = plant.zones;
  if (conditions.zone < zMin || conditions.zone > zMax) {
    reasons.push(`Outside zones ${zMin}–${zMax}`);
    level = "bad";
  }

  // Antagonist — hard conflict with anything already in the bed.
  for (const id of placedPlantIds) {
    if (plant.antagonists.includes(id)) {
      reasons.push(`Conflicts with ${id}`);
      level = "bad";
    }
  }

  // Sun — within 1 step is OK, further apart warns.
  const sunGap = Math.abs(SUN_RANK[conditions.sun] - SUN_RANK[plant.sun]);
  if (sunGap >= 2) {
    reasons.push(`Wants ${plant.sun}`);
    if (level !== "bad") level = "warn";
  }

  // Soil — warn if bed soil not listed.
  if (!plant.soil.includes(conditions.soil)) {
    reasons.push(`Prefers ${plant.soil.join("/")}`);
    if (level !== "bad") level = "warn";
  }

  // pH — warn if bed pH not listed.
  if (!plant.ph.includes(conditions.ph)) {
    reasons.push(`Prefers ${plant.ph.join("/")} pH`);
    if (level !== "bad") level = "warn";
  }

  return { level, reasons };
}
