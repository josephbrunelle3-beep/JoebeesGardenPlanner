import { getPlant } from "./plants";
import type { GardenBed, PlacedPlant, Plant } from "./types";

/**
 * Square-foot-gardening style sizing.
 *
 * Every cell in the bed = 12 inches × 12 inches.
 *
 * - Plants with spacingIn > 12 are "big" plants and occupy a square block of
 *   cells (cellsPerSide = ceil(spacingIn / 12)). One plant per block.
 * - Plants with spacingIn <= 12 fit multiple per square foot. perRow plants
 *   per side of the cell ≈ round(12 / spacingIn), so e.g. carrots (3") = 16/sqft.
 */
export interface Footprint {
  /** Width in cells (square footprint, so w === h). */
  w: number;
  /** Height in cells. */
  h: number;
  /** How many of this plant fit per 1×1 cell (>=1). */
  perCell: number;
  /** Short human label e.g. "2×2 ft", "1 ft", "4 / sqft". */
  label: string;
}

export function getFootprint(plant: Plant): Footprint {
  const spacing = Math.max(1, plant.spacingIn);
  if (spacing > 12) {
    const side = Math.ceil(spacing / 12);
    return {
      w: side,
      h: side,
      perCell: 1,
      label: `${side}×${side} ft`,
    };
  }
  const perRow = Math.max(1, Math.round(12 / spacing));
  const perCell = perRow * perRow;
  return {
    w: 1,
    h: 1,
    perCell,
    label: `1×1 ft`,
  };
}

export function getFootprintById(plantId: string): Footprint | null {
  const p = getPlant(plantId);
  return p ? getFootprint(p) : null;
}

/** Returns the set of cell keys ("x,y") a placement occupies. */
export function cellsOf(placed: PlacedPlant): string[] {
  const fp = getFootprintById(placed.plantId);
  if (!fp) return [];
  const cells: string[] = [];
  for (let dy = 0; dy < fp.h; dy++) {
    for (let dx = 0; dx < fp.w; dx++) {
      cells.push(`${placed.x + dx},${placed.y + dy}`);
    }
  }
  return cells;
}

/**
 * Can a plant be placed at (x,y) without going out of bounds or overlapping
 * any other placement? If `ignoreInstanceId` is provided, that placement is
 * ignored (useful when moving an existing plant).
 */
export function canPlace(
  bed: GardenBed,
  plantId: string,
  x: number,
  y: number,
  ignoreInstanceId?: string,
): boolean {
  const fp = getFootprintById(plantId);
  if (!fp) return false;
  if (x < 0 || y < 0) return false;
  if (x + fp.w > bed.width || y + fp.h > bed.height) return false;

  const occupied = new Set<string>();
  for (const p of bed.plants) {
    if (p.instanceId === ignoreInstanceId) continue;
    for (const c of cellsOf(p)) occupied.add(c);
  }
  for (let dy = 0; dy < fp.h; dy++) {
    for (let dx = 0; dx < fp.w; dx++) {
      if (occupied.has(`${x + dx},${y + dy}`)) return false;
    }
  }
  return true;
}

/**
 * Try to find a free spot near (x,y) for a plant by spiraling outward.
 * Useful for AI-generated placements that overlap.
 */
export function findFreeSpot(
  bed: GardenBed,
  plantId: string,
  startX: number,
  startY: number,
): { x: number; y: number } | null {
  const fp = getFootprintById(plantId);
  if (!fp) return null;
  const maxR = Math.max(bed.width, bed.height);
  for (let r = 0; r <= maxR; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const x = startX + dx;
        const y = startY + dy;
        if (canPlace(bed, plantId, x, y)) return { x, y };
      }
    }
  }
  return null;
}
