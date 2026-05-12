import { analyzeBed } from "./companions";
import { canPlace, getFootprintById } from "./footprint";
import { getPlant } from "./plants";
import type {
  BedConditions,
  CompatibilityIssue,
  GardenBed,
  PlacedPlant,
  Plant,
  SunRequirement,
} from "./types";

/**
 * Provided by the planner page; matches subset of the zustand store.
 */
export interface FixActions {
  bed: GardenBed;
  setConditions: (c: Partial<BedConditions>) => void;
  movePlant: (instanceId: string, x: number, y: number) => void;
  removePlant: (instanceId: string) => void;
}

export interface FixOption {
  /** Short label shown on the button. */
  label: string;
  /** Optional longer description for tooltip. */
  detail?: string;
  /** Apply the fix. */
  apply: (a: FixActions) => void;
}

function plantById(id: string): Plant | undefined {
  return getPlant(id) ?? undefined;
}

function getPlaced(bed: GardenBed, instanceId: string): PlacedPlant | undefined {
  return bed.plants.find((p) => p.instanceId === instanceId);
}

function chebyshev(a: PlacedPlant, b: PlacedPlant): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

/** Find a spot in `bed` for `plantId` that maximises min-distance to `avoid` placements. */
function findFurthestSpot(
  bed: GardenBed,
  plantId: string,
  avoid: PlacedPlant[],
  ignoreInstanceId: string,
  minDistance: number,
): { x: number; y: number } | null {
  const fp = getFootprintById(plantId);
  if (!fp) return null;
  let best: { x: number; y: number; d: number } | null = null;
  for (let y = 0; y <= bed.height - fp.h; y++) {
    for (let x = 0; x <= bed.width - fp.w; x++) {
      if (!canPlace(bed, plantId, x, y, ignoreInstanceId)) continue;
      // Compute min Chebyshev distance from this position to all avoid points.
      let minD = Infinity;
      const candidate: PlacedPlant = { instanceId: ignoreInstanceId, plantId, x, y };
      for (const a of avoid) {
        const d = chebyshev(candidate, a);
        if (d < minD) minD = d;
      }
      if (minD < minDistance) continue;
      if (!best || minD > best.d) best = { x, y, d: minD };
    }
  }
  return best ? { x: best.x, y: best.y } : null;
}

/** Heuristic — required Chebyshev separation between two placements (in cells). */
function requiredSeparation(plant: Plant): number {
  // Antagonist / companion distance threshold is 2 in analyzeBed; spacing
  // is per-plant.
  return Math.max(2, Math.round(plant.spacingIn / 12));
}

/**
 * Return user-facing auto-fix options for a single compatibility issue.
 * Returns an empty array for issues we can't fix automatically (e.g. info).
 */
export function getFixesForIssue(
  issue: CompatibilityIssue,
  bed: GardenBed,
): FixOption[] {
  if (issue.level === "info") return [];
  const fixes: FixOption[] = [];

  if (issue.kind === "antagonist") {
    // Collect involved placements & their plants.
    const placements = issue.instanceIds
      .map((id) => getPlaced(bed, id))
      .filter((p): p is PlacedPlant => !!p);
    if (placements.length < 2) return [];
    const names = new Map<string, string>();
    for (const p of placements) {
      const pl = plantById(p.plantId);
      if (pl) names.set(p.instanceId, pl.name);
    }

    fixes.push({
      label: "Move them apart",
      detail: "Relocate one of each conflicting pair to the farthest free spot.",
      apply: ({ movePlant, bed: liveBed }) => {
        // Re-run analysis from the live bed in case state changed.
        let working = liveBed;
        const issues = analyzeBed(working).filter((i) => i.kind === "antagonist");
        for (const grp of issues) {
          for (let i = 0; i < grp.instanceIds.length; i++) {
            for (let j = i + 1; j < grp.instanceIds.length; j++) {
              const a = getPlaced(working, grp.instanceIds[i]);
              const b = getPlaced(working, grp.instanceIds[j]);
              if (!a || !b) continue;
              if (chebyshev(a, b) > 2) continue;
              // Try to move b away from a.
              const pl = plantById(b.plantId);
              if (!pl) continue;
              const spot = findFurthestSpot(working, b.plantId, [a], b.instanceId, 3);
              if (spot) {
                movePlant(b.instanceId, spot.x, spot.y);
                working = {
                  ...working,
                  plants: working.plants.map((pp) =>
                    pp.instanceId === b.instanceId ? { ...pp, x: spot.x, y: spot.y } : pp,
                  ),
                };
              }
            }
          }
        }
      },
    });

    // One remove-button per distinct plant name involved.
    const seen = new Set<string>();
    for (const p of placements) {
      const pl = plantById(p.plantId);
      if (!pl || seen.has(pl.id)) continue;
      seen.add(pl.id);
      const ids = placements.filter((q) => q.plantId === pl.id).map((q) => q.instanceId);
      fixes.push({
        label: `Remove ${pl.name}${ids.length > 1 ? ` (${ids.length})` : ""}`,
        apply: ({ removePlant }) => {
          for (const id of ids) removePlant(id);
        },
      });
    }
    return fixes;
  }

  if (issue.kind === "spacing") {
    const placements = issue.instanceIds
      .map((id) => getPlaced(bed, id))
      .filter((p): p is PlacedPlant => !!p);
    if (placements.length < 2) return [];
    const plant = plantById(placements[0].plantId);
    if (!plant) return [];

    fixes.push({
      label: "Spread them out",
      detail: `Relocate crowded ${plant.name} to respect ${plant.spacingIn}\" spacing.`,
      apply: ({ movePlant, bed: liveBed }) => {
        let working = liveBed;
        let pass = 0;
        const required = requiredSeparation(plant);
        // Multiple passes — each pass tries to fix one crowding pair.
        while (pass < 16) {
          const current = analyzeBed(working).filter(
            (i) => i.kind === "spacing" && i.instanceIds.some((id) => placements.find((p) => p.instanceId === id)),
          );
          if (!current.length) break;
          const grp = current[0];
          const a = getPlaced(working, grp.instanceIds[0]);
          const b = getPlaced(working, grp.instanceIds[1]);
          if (!a || !b) break;
          const others = working.plants.filter((p) => p.instanceId !== b.instanceId);
          const spot = findFurthestSpot(working, b.plantId, others, b.instanceId, required);
          if (!spot) break;
          movePlant(b.instanceId, spot.x, spot.y);
          working = {
            ...working,
            plants: working.plants.map((p) =>
              p.instanceId === b.instanceId ? { ...p, x: spot.x, y: spot.y } : p,
            ),
          };
          pass++;
        }
      },
    });

    fixes.push({
      label: `Remove extra ${plant.name}`,
      detail: "Remove the crowded duplicate.",
      apply: ({ removePlant }) => {
        // Remove every placement after the first.
        const sorted = [...placements].sort((a, b) => a.instanceId.localeCompare(b.instanceId));
        for (let i = 1; i < sorted.length; i++) removePlant(sorted[i].instanceId);
      },
    });
    return fixes;
  }

  if (issue.kind === "sun") {
    const placed = getPlaced(bed, issue.instanceIds[0]);
    const plant = placed ? plantById(placed.plantId) : undefined;
    if (!plant) return [];
    const sunLabel = plant.sun.replace("-", " ");
    fixes.push({
      label: `Set bed sun to ${sunLabel}`,
      detail: `Change the bed sun condition to match ${plant.name}.`,
      apply: ({ setConditions }) => setConditions({ sun: plant.sun as SunRequirement }),
    });
    fixes.push({
      label: `Remove ${plant.name}`,
      apply: ({ removePlant }) => {
        for (const id of issue.instanceIds) removePlant(id);
      },
    });
    return fixes;
  }

  if (issue.kind === "zone") {
    const placed = getPlaced(bed, issue.instanceIds[0]);
    const plant = placed ? plantById(placed.plantId) : undefined;
    if (!plant) return [];
    const target = Math.min(
      Math.max(bed.conditions.zone, plant.zones[0]),
      plant.zones[1],
    );
    fixes.push({
      label: `Set bed zone to ${target}`,
      detail: `Change the bed zone to fit ${plant.name}'s range (${plant.zones[0]}–${plant.zones[1]}).`,
      apply: ({ setConditions }) => setConditions({ zone: target }),
    });
    fixes.push({
      label: `Remove ${plant.name}`,
      apply: ({ removePlant }) => {
        for (const id of issue.instanceIds) removePlant(id);
      },
    });
    return fixes;
  }

  return fixes;
}
