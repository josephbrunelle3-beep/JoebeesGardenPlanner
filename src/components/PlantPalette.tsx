"use client";

import { useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { PLANTS, getPlant } from "@/lib/plants";
import { getFootprint } from "@/lib/footprint";
import { scorePlantFit, type FitLevel } from "@/lib/fit";
import { getPairReason } from "@/lib/companion-reasons";
import { usePlanner } from "@/lib/store";
import type { Plant, PlantCategory } from "@/lib/types";
import { ReasonPopover } from "@/components/ReasonPopover";

const CATEGORY_META: Record<
  PlantCategory,
  { label: string; emoji: string; order: number; tint: string; accent: string }
> = {
  vegetable: {
    label: "Vegetables",
    emoji: "🥕",
    order: 0,
    tint: "bg-emerald-50/70",
    accent: "bg-emerald-400",
  },
  fruit: {
    label: "Fruit",
    emoji: "🍓",
    order: 1,
    tint: "bg-rose-50/70",
    accent: "bg-rose-400",
  },
  herb: {
    label: "Herbs",
    emoji: "🌿",
    order: 2,
    tint: "bg-lime-50/70",
    accent: "bg-lime-500",
  },
  flower: {
    label: "Flowers",
    emoji: "🌼",
    order: 3,
    tint: "bg-violet-50/70",
    accent: "bg-violet-400",
  },
  "cover-crop": {
    label: "Cover crops",
    emoji: "🌱",
    order: 4,
    tint: "bg-amber-50/70",
    accent: "bg-amber-400",
  },
};

// Sub-grouping inside a top-level category.
// Plants not listed here fall into an "Other" bucket.
const SUBCATEGORY_OF: Record<string, string> = {
  // Vegetables — Leafy greens
  lettuce: "Leafy greens",
  spinach: "Leafy greens",
  kale: "Leafy greens",
  "swiss-chard": "Leafy greens",
  arugula: "Leafy greens",
  "bok-choy": "Leafy greens",
  collards: "Leafy greens",
  "mustard-greens": "Leafy greens",
  // Vegetables — Brassicas
  brassica: "Brassicas",
  cauliflower: "Brassicas",
  "brussels-sprouts": "Brassicas",
  kohlrabi: "Brassicas",
  // Vegetables — Roots
  carrot: "Roots",
  radish: "Roots",
  beet: "Roots",
  turnip: "Roots",
  potato: "Roots",
  "sweet-potato": "Roots",
  parsnip: "Roots",
  // Vegetables — Alliums
  onion: "Alliums",
  garlic: "Alliums",
  leek: "Alliums",
  scallion: "Alliums",
  shallot: "Alliums",
  // Vegetables — Fruiting
  tomato: "Fruiting",
  pepper: "Fruiting",
  eggplant: "Fruiting",
  okra: "Fruiting",
  tomatillo: "Fruiting",
  // Vegetables — Cucurbits
  cucumber: "Cucurbits",
  squash: "Cucurbits",
  zucchini: "Cucurbits",
  "winter-squash": "Cucurbits",
  cantaloupe: "Cucurbits",
  watermelon: "Cucurbits",
  // Vegetables — Legumes
  bean: "Legumes",
  pea: "Legumes",
  "pole-bean": "Legumes",
  edamame: "Legumes",
  // Vegetables — Stalks & grains
  celery: "Stalks & grains",
  corn: "Stalks & grains",
  // Vegetables — Perennials
  asparagus: "Perennials",
  rhubarb: "Perennials",
  // Fruit — Berries
  strawberry: "Berries",
  blueberry: "Berries",
  raspberry: "Berries",
  blackberry: "Berries",
  currant: "Berries",
  gooseberry: "Berries",
  // Fruit — Vines
  grape: "Vines",
  // Herbs — Mediterranean
  basil: "Mediterranean",
  rosemary: "Mediterranean",
  oregano: "Mediterranean",
  thyme: "Mediterranean",
  sage: "Mediterranean",
  lavender: "Mediterranean",
  tarragon: "Mediterranean",
  fennel: "Mediterranean",
  // Herbs — Leafy & cool
  parsley: "Leafy & cool",
  cilantro: "Leafy & cool",
  dill: "Leafy & cool",
  chives: "Leafy & cool",
  mint: "Leafy & cool",
  "lemon-balm": "Leafy & cool",
  chamomile: "Leafy & cool",
  // Flowers — Pollinator
  sunflower: "Pollinator",
  zinnia: "Pollinator",
  cosmos: "Pollinator",
  calendula: "Pollinator",
  borage: "Pollinator",
  "bachelors-button": "Pollinator",
  snapdragon: "Pollinator",
  // Flowers — Companion
  marigold: "Companion",
  nasturtium: "Companion",
  "sweet-alyssum": "Companion",
  // Cover crops — Legume cover
  "crimson-clover": "Legume cover",
  "hairy-vetch": "Legume cover",
  // Cover crops — Grass & smother
  buckwheat: "Grass & smother",
  "winter-rye": "Grass & smother",
};

const SUBCATEGORY_ORDER: Record<PlantCategory, string[]> = {
  vegetable: [
    "Leafy greens",
    "Brassicas",
    "Roots",
    "Alliums",
    "Fruiting",
    "Cucurbits",
    "Legumes",
    "Stalks & grains",
    "Perennials",
  ],
  fruit: ["Berries", "Vines"],
  herb: ["Mediterranean", "Leafy & cool"],
  flower: ["Pollinator", "Companion"],
  "cover-crop": ["Legume cover", "Grass & smother"],
};

type SubGroup = { label: string; plants: Plant[] };

export function PlantPalette({
  onPick,
}: {
  onPick?: (plant: Plant) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const conditions = usePlanner((s) => s.bed.conditions);
  const placedPlants = usePlanner((s) => s.bed.plants);
  const placedPlantIds = useMemo(
    () => placedPlants.map((p) => p.plantId),
    [placedPlants],
  );

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups = new Map<PlantCategory, Plant[]>();
    for (const p of PLANTS) {
      if (q && !p.name.toLowerCase().includes(q)) continue;
      const arr = groups.get(p.category) ?? [];
      arr.push(p);
      groups.set(p.category, arr);
    }
    const entries: Array<[PlantCategory, Plant[], SubGroup[]]> = [];
    for (const [cat, plants] of groups) {
      const subMap = new Map<string, Plant[]>();
      for (const p of plants) {
        const sub = SUBCATEGORY_OF[p.id] ?? "Other";
        const arr = subMap.get(sub) ?? [];
        arr.push(p);
        subMap.set(sub, arr);
      }
      const order = SUBCATEGORY_ORDER[cat] ?? [];
      const subs: SubGroup[] = [];
      for (const name of order) {
        const arr = subMap.get(name);
        if (arr && arr.length) subs.push({ label: name, plants: arr });
      }
      const other = subMap.get("Other");
      if (other && other.length) subs.push({ label: "Other", plants: other });
      entries.push([cat, plants, subs]);
    }
    return entries.sort(
      (a, b) => CATEGORY_META[a[0]].order - CATEGORY_META[b[0]].order,
    );
  }, [query]);

  const isSearching = query.trim().length > 0;

  function toggle(cat: string) {
    setOpen((o) => ({ ...o, [cat]: !o[cat] }));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <span aria-hidden className="text-base">🎨</span>
        <h3 className="font-display text-sm font-semibold text-leaf-900">
          Plant palette
        </h3>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-leaf-600/60" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search plants..."
          className="w-full rounded-md border border-leaf-200 bg-white py-1.5 pl-7 pr-2 text-xs outline-none focus:border-leaf-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        {grouped.length === 0 && (
          <p className="px-1 py-2 text-xs text-leaf-700/60">
            No plants match “{query}”.
          </p>
        )}
        {grouped.map(([cat, plants, subs]) => {
          const meta = CATEGORY_META[cat];
          const expanded = isSearching || open[cat];
          const showSubs = subs.length > 1;
          return (
            <div
              key={cat}
              className={`relative overflow-hidden rounded-lg border border-leaf-200 ${meta.tint}`}
            >
              <span
                aria-hidden
                className={`absolute inset-y-0 left-0 w-1 ${meta.accent}`}
              />
              <button
                type="button"
                onClick={() => toggle(cat)}
                className="flex w-full items-center justify-between gap-2 pl-3 pr-2 py-1.5 text-left text-xs font-medium text-leaf-900 hover:bg-white/40"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{meta.emoji}</span>
                  {meta.label}
                  <span className="text-[10px] font-normal text-leaf-700/60">
                    {plants.length}
                  </span>
                </span>
                {expanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-leaf-600" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-leaf-600" />
                )}
              </button>
              {expanded && (
                <div className="flex flex-col gap-1.5 border-t border-leaf-100 bg-white/70 p-1.5">
                  {showSubs ? (
                    subs.map((sub) => (
                      <div key={sub.label} className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 px-0.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-leaf-700/70">
                            {sub.label}
                          </span>
                          <span className="text-[10px] text-leaf-700/50">
                            {sub.plants.length}
                          </span>
                          <span className="ml-1 h-px flex-1 bg-leaf-100" />
                        </div>
                        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
                          {sub.plants.map((p) => (
                            <PaletteItem
                              key={p.id}
                              plant={p}
                              onPick={onPick}
                              fit={scorePlantFit(p, conditions, placedPlantIds)}
                              placedPlantIds={placedPlantIds}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
                      {plants.map((p) => (
                        <PaletteItem
                          key={p.id}
                          plant={p}
                          onPick={onPick}
                          fit={scorePlantFit(p, conditions, placedPlantIds)}
                          placedPlantIds={placedPlantIds}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const FIT_STYLES: Record<FitLevel, { wrap: string; dot: string }> = {
  good: {
    wrap: "border-emerald-300 bg-emerald-50/60 hover:border-emerald-500 hover:bg-emerald-50",
    dot: "bg-emerald-500",
  },
  warn: {
    wrap: "border-amber-300 bg-amber-50/60 hover:border-amber-500 hover:bg-amber-50",
    dot: "bg-amber-500",
  },
  bad: {
    wrap: "border-rose-300 bg-rose-50/60 hover:border-rose-500 hover:bg-rose-50",
    dot: "bg-rose-500",
  },
};

function PaletteItem({
  plant,
  onPick,
  fit,
  placedPlantIds,
}: {
  plant: Plant;
  onPick?: (plant: Plant) => void;
  fit: { level: FitLevel; reasons: string[] };
  placedPlantIds: readonly string[];
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${plant.id}`,
    data: { type: "palette", plantId: plant.id },
  });
  const fp = getFootprint(plant);
  const styles = FIT_STYLES[fit.level];

  // Build companion notes against currently-placed plants so users
  // see *why* this picks rings green/amber/red in the context of THEIR bed.
  const companionNotes = useMemo(() => {
    const seen = new Set<string>();
    const notes: { label: string; reason: string; kind: "like" | "avoid" }[] = [];
    for (const id of placedPlantIds) {
      if (id === plant.id || seen.has(id)) continue;
      seen.add(id);
      const other = getPlant(id);
      if (!other) continue;
      if (plant.antagonists.includes(id) || other.antagonists.includes(plant.id)) {
        const reason =
          getPairReason(plant.id, id, "avoid") ??
          "These plants tend to compete for nutrients or share pests.";
        notes.push({ label: `⚠ near ${other.name.toLowerCase()}`, reason, kind: "avoid" });
      } else if (plant.companions.includes(id) || other.companions.includes(plant.id)) {
        const reason =
          getPairReason(plant.id, id, "like") ??
          "Classic companion pairing.";
        notes.push({ label: `👍 with ${other.name.toLowerCase()}`, reason, kind: "like" });
      }
    }
    return notes;
  }, [plant, placedPlantIds]);

  return (
    <ReasonPopover
      plantName={plant.name}
      fitLevel={fit.level}
      fitReasons={fit.reasons}
      companionNotes={companionNotes}
    >
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={() => onPick?.(plant)}
        className={`relative flex w-full flex-col items-center gap-0.5 overflow-hidden rounded-md border px-1 py-1.5 text-[11px] leading-tight transition ${
          styles.wrap
        } ${isDragging ? "opacity-40" : ""}`}
      >
        <span
          className={`absolute left-1 top-1 h-1.5 w-1.5 rounded-full ${styles.dot}`}
          aria-hidden
        />
        <span className="text-xl leading-none">{plant.emoji}</span>
        <span
          className="block w-full text-center text-[10px] font-medium leading-tight text-leaf-900"
          style={{ overflowWrap: "anywhere", hyphens: "auto" }}
        >
          {plant.name}
        </span>
        <span className="text-[9px] text-leaf-700/60">
          {fp.label}
          {fp.perCell > 1 ? ` · ${fp.perCell}/sqft` : ""}
        </span>
      </button>
    </ReasonPopover>
  );
}
