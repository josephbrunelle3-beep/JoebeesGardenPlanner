import type { GardenBed, PlacedPlant } from "./types";

const STORAGE_KEY = "joebees:bed";
const SCHEMA_VERSION = 1;

export interface SavedBed {
  schemaVersion: number;
  savedAt: string;
  bed: GardenBed;
}

function isPlacedPlant(v: unknown): v is PlacedPlant {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.instanceId === "string" &&
    typeof o.plantId === "string" &&
    typeof o.x === "number" &&
    typeof o.y === "number"
  );
}

export function isGardenBed(v: unknown): v is GardenBed {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.width === "number" &&
    typeof o.height === "number" &&
    !!o.conditions &&
    Array.isArray(o.plants) &&
    o.plants.every(isPlacedPlant)
  );
}

export function saveToLocal(bed: GardenBed): void {
  try {
    const payload: SavedBed = {
      schemaVersion: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      bed,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota or unavailable — ignore */
  }
}

export function loadFromLocal(): GardenBed | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedBed>;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
    if (!isGardenBed(parsed.bed)) return null;
    return parsed.bed;
  } catch {
    return null;
  }
}

export function clearLocal(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function exportBedJson(bed: GardenBed): string {
  const payload: SavedBed = {
    schemaVersion: SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    bed,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseBedJson(text: string): GardenBed | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const obj = parsed as Record<string, unknown>;
    // Accept either a wrapped SavedBed or a raw GardenBed.
    const candidate = isGardenBed(obj) ? obj : obj.bed;
    if (!isGardenBed(candidate)) return null;
    return candidate;
  } catch {
    return null;
  }
}

export function downloadJson(filename: string, text: string): void {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
