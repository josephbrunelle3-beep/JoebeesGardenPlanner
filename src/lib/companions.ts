import type {
  BedConditions,
  CompatibilityIssue,
  GardenBed,
  PlacedPlant,
  Plant,
} from "./types";
import { getPlant } from "./plants";

/** Grid distance (Chebyshev) between two placements. */
function gridDistance(a: PlacedPlant, b: PlacedPlant) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

/**
 * Analyze a bed and return human-readable issues / warnings about plant
 * placement, growing conditions, and companion compatibility.
 */
export function analyzeBed(bed: GardenBed): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];
  const placed = bed.plants;

  // Pairwise companion / antagonist checks (only for "near" plants — within 2 cells).
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const a = placed[i];
      const b = placed[j];
      const dist = gridDistance(a, b);
      if (dist > 2) continue;

      const pa = getPlant(a.plantId);
      const pb = getPlant(b.plantId);
      if (!pa || !pb) continue;

      if (pa.antagonists.includes(pb.id) || pb.antagonists.includes(pa.id)) {
        issues.push({
          level: "error",
          message: `${pa.name} and ${pb.name} should not be planted near each other.`,
          instanceIds: [a.instanceId, b.instanceId],
        });
      } else if (pa.companions.includes(pb.id) || pb.companions.includes(pa.id)) {
        issues.push({
          level: "info",
          message: `${pa.name} + ${pb.name} are great companions.`,
          instanceIds: [a.instanceId, b.instanceId],
        });
      }
    }
  }

  // Condition checks per plant.
  for (const p of placed) {
    const plant = getPlant(p.plantId);
    if (!plant) continue;
    const condIssues = checkConditions(plant, bed.conditions);
    for (const msg of condIssues) {
      issues.push({
        level: "warning",
        message: `${plant.name}: ${msg}`,
        instanceIds: [p.instanceId],
      });
    }

    // Spacing — flag if two of same plant are closer than spacing requires.
    for (const other of placed) {
      if (other.instanceId === p.instanceId) continue;
      if (other.plantId !== p.plantId) continue;
      const cells = gridDistance(p, other);
      const requiredCells = Math.max(1, Math.round(plant.spacingIn / 12));
      if (cells < requiredCells) {
        issues.push({
          level: "warning",
          message: `${plant.name} is crowded — needs ~${plant.spacingIn}\" spacing.`,
          instanceIds: [p.instanceId, other.instanceId],
        });
      }
    }
  }

  // Group identical messages (same level + text). Merge their instanceIds and
  // append a "× N" suffix when the same issue appears more than once so the
  // panel doesn't flood with duplicates.
  const groups = new Map<string, CompatibilityIssue & { _count: number }>();
  for (const i of issues) {
    const key = `${i.level}|${i.message}`;
    const existing = groups.get(key);
    if (existing) {
      existing._count += 1;
      for (const id of i.instanceIds) {
        if (!existing.instanceIds.includes(id)) existing.instanceIds.push(id);
      }
    } else {
      groups.set(key, { ...i, instanceIds: [...i.instanceIds], _count: 1 });
    }
  }
  return Array.from(groups.values()).map(({ _count, ...rest }) => ({
    ...rest,
    message: _count > 1 ? `${rest.message} (×${_count})` : rest.message,
  }));
}

export function checkConditions(plant: Plant, c: BedConditions): string[] {
  const out: string[] = [];
  if (!sunCompatible(plant.sun, c.sun)) {
    out.push(`prefers ${plant.sun.replace("-", " ")}, bed is ${c.sun.replace("-", " ")}.`);
  }
  if (c.zone < plant.zones[0] || c.zone > plant.zones[1]) {
    out.push(`hardiness zone ${plant.zones[0]}–${plant.zones[1]}, bed is zone ${c.zone}.`);
  }
  return out;
}

const SUN_ORDER = ["shade", "part-shade", "part-sun", "full-sun"] as const;

function sunCompatible(needs: Plant["sun"], has: BedConditions["sun"]) {
  // A bed with more sun than the plant requires is fine for shade-tolerant plants
  // up to a point; we accept exact match or one step adjacent.
  const i = SUN_ORDER.indexOf(needs);
  const j = SUN_ORDER.indexOf(has);
  return Math.abs(i - j) <= 1;
}
