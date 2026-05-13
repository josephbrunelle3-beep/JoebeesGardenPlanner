"use client";

import { useMemo } from "react";
import { usePlanner } from "@/lib/store";
import { getPlant } from "@/lib/plants";
import { GlossaryChip } from "@/components/GlossaryChip";
import type { Plant } from "@/lib/types";

/**
 * Care list for every unique plant placed in the bed. Replaces the
 * single-plant info panel in Step 4 so users see care guidance for the
 * whole garden at once.
 */
export function BedCareList() {
  const placed = usePlanner((s) => s.bed.plants);

  const plants = useMemo(() => {
    const seen = new Map<string, { plant: Plant; count: number }>();
    for (const p of placed) {
      const def = getPlant(p.plantId);
      if (!def) continue;
      const entry = seen.get(def.id);
      if (entry) entry.count += 1;
      else seen.set(def.id, { plant: def, count: 1 });
    }
    return Array.from(seen.values()).sort((a, b) =>
      a.plant.name.localeCompare(b.plant.name),
    );
  }, [placed]);

  if (plants.length === 0) {
    return (
      <p className="text-xs text-leaf-700/70">
        Add plants in Step 3 to see care details for each one here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-base font-semibold text-leaf-900">
          Care for everything in your bed
        </h3>
        <span className="text-[11px] text-leaf-700/60">
          {plants.length} {plants.length === 1 ? "plant" : "plants"}
        </span>
      </div>
      <ul className="grid gap-2">
        {plants.map(({ plant, count }) => (
          <li
            key={plant.id}
            className="rounded-lg border border-leaf-200 bg-white p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>
                  {plant.emoji}
                </span>
                <div>
                  <div className="text-sm font-semibold text-leaf-900">
                    {plant.name}
                    {count > 1 && (
                      <span className="ml-1.5 rounded-full bg-leaf-100 px-1.5 py-0.5 text-[10px] font-medium text-leaf-700">
                        ×{count}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] capitalize text-leaf-700/70">
                    {plant.category}
                    {plant.daysToMaturity
                      ? ` · ${plant.daysToMaturity} days to maturity`
                      : ""}
                  </div>
                </div>
              </div>
            </div>

            <dl className="mt-2 grid grid-cols-2 gap-1 text-[11px] sm:grid-cols-4">
              <CareCell
                label={<GlossaryChip term="sun">Sun</GlossaryChip>}
                value={plant.sun.replace("-", " ")}
              />
              <CareCell label="Water" value={plant.water} />
              <CareCell
                label={<GlossaryChip term="soil">Soil</GlossaryChip>}
                value={plant.soil.join(", ")}
              />
              <CareCell
                label={<GlossaryChip term="ph">pH</GlossaryChip>}
                value={plant.ph.join(", ")}
              />
              <CareCell label="Spacing" value={`${plant.spacingIn}"`} />
              <CareCell
                label={<GlossaryChip term="zone">Zones</GlossaryChip>}
                value={`${plant.zones[0]}–${plant.zones[1]}`}
              />
            </dl>

            {plant.notes && (
              <p className="mt-2 rounded bg-leaf-50 p-2 text-[11px] leading-snug text-leaf-800">
                {plant.notes}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CareCell({
  label,
  value,
}: {
  label: React.ReactNode;
  value: string;
}) {
  return (
    <div className="rounded border border-leaf-100 bg-leaf-50/40 px-2 py-1">
      <dt className="text-[9px] uppercase tracking-wide text-leaf-700/60">
        {label}
      </dt>
      <dd className="text-leaf-900">{value}</dd>
    </div>
  );
}
