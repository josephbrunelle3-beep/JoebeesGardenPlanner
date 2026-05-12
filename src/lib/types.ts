export type SunRequirement = "full-sun" | "part-sun" | "part-shade" | "shade";
export type SoilType = "loam" | "sandy" | "clay" | "silty" | "chalky" | "peaty";
export type SoilPh = "acidic" | "neutral" | "alkaline";
export type WaterNeed = "low" | "medium" | "high";
export type PlantCategory =
  | "vegetable"
  | "fruit"
  | "herb"
  | "flower"
  | "cover-crop";

export interface Plant {
  id: string;
  name: string;
  category: PlantCategory;
  emoji: string;
  /** Spacing between plants in inches. */
  spacingIn: number;
  sun: SunRequirement;
  water: WaterNeed;
  soil: SoilType[];
  ph: SoilPh[];
  /** USDA hardiness zones it grows in (inclusive). */
  zones: [number, number];
  /** Months (1-12) recommended for sowing/planting in the northern hemisphere. */
  plantMonths: number[];
  harvestMonths: number[];
  daysToMaturity?: number;
  /** Plant ids that benefit when planted together. */
  companions: string[];
  /** Plant ids that should NOT be planted near this. */
  antagonists: string[];
  notes?: string;
  /**
   * Real-world cultivars / varieties commonly stocked at retailers. The
   * `shopSearch` field on the parent plant is used to build retailer search
   * links so users can buy seeds/starts/supplies.
   */
  varieties?: PlantVariety[];
  /**
   * Search term used to build retailer links (seeds / live plants). Defaults
   * to the plant `name` if omitted.
   */
  shopSearch?: string;
}

export interface PlantVariety {
  name: string;
  /** Short, beginner-friendly description (1 sentence). */
  description?: string;
  daysToMaturity?: number;
  /** Sold primarily as live plants ("start"), seeds, or both. */
  form?: "seed" | "start" | "both";
}

export interface PlacedPlant {
  /** Unique placement id (instance on the canvas). */
  instanceId: string;
  plantId: string;
  /** Position in grid cells from top-left of the bed. */
  x: number;
  y: number;
}

export interface GardenBed {
  id: string;
  name: string;
  /** Width / height in grid cells (1 cell = 12 inches by default). */
  width: number;
  height: number;
  conditions: BedConditions;
  plants: PlacedPlant[];
}

export interface BedConditions {
  sun: SunRequirement;
  soil: SoilType;
  ph: SoilPh;
  zone: number;
}

export interface CompatibilityIssue {
  level: "warning" | "error" | "info";
  message: string;
  /** Instance ids involved. */
  instanceIds: string[];
  /** Categorizes the issue so the UI can offer targeted auto-fixes. */
  kind?: "antagonist" | "companion" | "spacing" | "sun" | "zone";
}
