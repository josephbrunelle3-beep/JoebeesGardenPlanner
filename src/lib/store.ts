import { create } from "zustand";
import type { BedConditions, GardenBed, PlacedPlant } from "./types";
import { canPlace, findFreeSpot } from "./footprint";

interface PlannerState {
  bed: GardenBed;
  selectedInstanceId: string | null;
  pendingPrompt: string | null;
  setBed: (bed: GardenBed) => void;
  loadBed: (bed: GardenBed) => void;
  resizeBed: (width: number, height: number) => void;
  setConditions: (c: Partial<BedConditions>) => void;
  addPlant: (plantId: string, x: number, y: number) => void;
  movePlant: (instanceId: string, x: number, y: number) => void;
  removePlant: (instanceId: string) => void;
  clearBed: () => void;
  select: (id: string | null) => void;
  replacePlants: (plants: PlacedPlant[]) => void;
  setPendingPrompt: (p: string | null) => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const initialBed: GardenBed = {
  id: "default",
  name: "My Garden Bed",
  width: 8,
  height: 6,
  conditions: { sun: "full-sun", soil: "loam", ph: "neutral", zone: 6 },
  plants: [],
};

export const usePlanner = create<PlannerState>((set) => ({
  bed: initialBed,
  selectedInstanceId: null,
  pendingPrompt: null,
  setPendingPrompt: (p) => set({ pendingPrompt: p }),
  setBed: (bed) => set({ bed }),
  loadBed: (bed) => set({ bed, selectedInstanceId: null }),
  resizeBed: (width, height) =>
    set((s) => {
      const w = Math.max(1, width);
      const h = Math.max(1, height);
      // Keep only plants whose entire footprint still fits in the new bed.
      const newBed = { ...s.bed, width: w, height: h };
      const kept: PlacedPlant[] = [];
      for (const p of s.bed.plants) {
        if (canPlace({ ...newBed, plants: kept }, p.plantId, p.x, p.y)) {
          kept.push(p);
        }
      }
      return { bed: { ...newBed, plants: kept } };
    }),
  setConditions: (c) =>
    set((s) => ({ bed: { ...s.bed, conditions: { ...s.bed.conditions, ...c } } })),
  addPlant: (plantId, x, y) =>
    set((s) => {
      if (!canPlace(s.bed, plantId, x, y)) return s;
      return {
        bed: {
          ...s.bed,
          plants: [...s.bed.plants, { instanceId: uid(), plantId, x, y }],
        },
      };
    }),
  movePlant: (instanceId, x, y) =>
    set((s) => {
      const placed = s.bed.plants.find((p) => p.instanceId === instanceId);
      if (!placed) return s;
      if (!canPlace(s.bed, placed.plantId, x, y, instanceId)) return s;
      return {
        bed: {
          ...s.bed,
          plants: s.bed.plants.map((p) =>
            p.instanceId === instanceId ? { ...p, x, y } : p,
          ),
        },
      };
    }),
  removePlant: (instanceId) =>
    set((s) => ({
      bed: {
        ...s.bed,
        plants: s.bed.plants.filter((p) => p.instanceId !== instanceId),
      },
      selectedInstanceId:
        s.selectedInstanceId === instanceId ? null : s.selectedInstanceId,
    })),
  clearBed: () => set((s) => ({ bed: { ...s.bed, plants: [] }, selectedInstanceId: null })),
  select: (id) => set({ selectedInstanceId: id }),
  replacePlants: (plants) =>
    set((s) => {
      // Validate & relocate AI-generated placements so footprints don't overlap
      // and stay inside the bed.
      const fresh: PlacedPlant[] = [];
      const tempBed: GardenBed = { ...s.bed, plants: fresh };
      for (const p of plants) {
        const instanceId = p.instanceId || uid();
        let x = p.x;
        let y = p.y;
        if (!canPlace(tempBed, p.plantId, x, y)) {
          const spot = findFreeSpot(tempBed, p.plantId, x, y);
          if (!spot) continue;
          x = spot.x;
          y = spot.y;
        }
        fresh.push({ instanceId, plantId: p.plantId, x, y });
      }
      return {
        bed: { ...s.bed, plants: fresh },
        selectedInstanceId: null,
      };
    }),
}));
