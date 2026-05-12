import type { GardenBed, SoilPh, SoilType } from "./types";
import { getPlant } from "./plants";

export interface SoilRecommendation {
  /** Best matching soil type for the chosen plants. */
  soil: SoilType;
  /** Best matching pH band for the chosen plants. */
  ph: SoilPh;
  /** Short, beginner-friendly description of the recommended mix. */
  mixDescription: string;
  /** Bullet-point amendments to add. */
  amendments: string[];
  /** Plants that have special soil needs and may need their own spot/amendment. */
  outliers: { plantName: string; need: string }[];
  /** Whether there are placed plants to base this on. */
  hasPlants: boolean;
}

const SOIL_MIX_NOTES: Record<SoilType, string> = {
  loam: "A loamy mix (60% screened topsoil + 30% compost + 10% perlite) — the all-purpose raised-bed standard.",
  sandy:
    "A sandy / well-draining mix (50% sandy loam + 30% compost + 20% coarse sand or perlite). Great for root crops and drought-lovers.",
  clay: "A heavier loam (skip extra sand; rely on compost + topsoil). Most raised beds avoid pure clay — amend generously.",
  silty: "A rich silty loam (topsoil + leaf mold + compost). Holds moisture well; add a bit of perlite for drainage.",
  chalky: "An alkaline-leaning mix (loam + a little garden lime if needed). Rare for raised beds — most stores sell a neutral mix.",
  peaty:
    "A peaty / acidic mix (loam + peat moss or pine bark fines + compost). Good for blueberries and other acid-lovers.",
};

const PH_NOTES: Record<SoilPh, string> = {
  acidic: "Slightly acidic (pH ~5.5–6.5). Add elemental sulfur or peat moss if your mix tests too high.",
  neutral: "Neutral (pH ~6.5–7.0) — the sweet spot for most vegetables and herbs.",
  alkaline: "Slightly alkaline (pH ~7.0–7.5). Add garden lime if your mix tests too low.",
};

function pickMode<T extends string>(items: T[][]): T | null {
  const counts = new Map<T, number>();
  for (const list of items) {
    for (const v of list) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best: T | null = null;
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      bestCount = c;
      best = v;
    }
  }
  return best;
}

export function recommendSoil(bed: GardenBed): SoilRecommendation {
  const plants = bed.plants
    .map((p) => getPlant(p.plantId))
    .filter((p): p is NonNullable<ReturnType<typeof getPlant>> => Boolean(p));

  if (plants.length === 0) {
    return {
      soil: "loam",
      ph: "neutral",
      mixDescription: SOIL_MIX_NOTES.loam,
      amendments: [
        "Add 2–3 inches of finished compost when filling the bed.",
        "Mix in a slow-release organic fertilizer at planting.",
      ],
      outliers: [],
      hasPlants: false,
    };
  }

  const soil = (pickMode(plants.map((p) => p.soil)) ?? "loam") as SoilType;
  const ph = (pickMode(plants.map((p) => p.ph)) ?? "neutral") as SoilPh;

  // Outliers: plants whose soil or pH doesn't match the consensus.
  const outliers: { plantName: string; need: string }[] = [];
  const seen = new Set<string>();
  for (const p of plants) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    const needs: string[] = [];
    if (!p.soil.includes(soil)) needs.push(`${p.soil.join("/")} soil`);
    if (!p.ph.includes(ph)) needs.push(`${p.ph.join("/")} pH`);
    if (needs.length) {
      outliers.push({ plantName: p.name, need: needs.join(" and ") });
    }
  }

  const amendments: string[] = [
    "Top with 2–3 inches of finished compost before planting.",
    "Mix in a balanced organic fertilizer (5-5-5) at planting time.",
  ];
  if (ph === "acidic") {
    amendments.push("Acidify with peat moss or elemental sulfur if your tap pH is high.");
  } else if (ph === "alkaline") {
    amendments.push("Sweeten with garden lime if your mix tests below 7.0.");
  }
  if (soil === "sandy") amendments.push("Add extra compost mid-season — sandy mixes dry out fast.");
  if (soil === "peaty") amendments.push("Pair with mulched pine bark to keep things acidic over time.");

  return {
    soil,
    ph,
    mixDescription: SOIL_MIX_NOTES[soil],
    amendments,
    outliers,
    hasPlants: true,
  };
}

export function phNote(ph: SoilPh) {
  return PH_NOTES[ph];
}
