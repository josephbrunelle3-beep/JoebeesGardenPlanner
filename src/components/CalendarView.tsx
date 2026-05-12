"use client";

import { useMemo } from "react";
import { usePlanner } from "@/lib/store";
import { getPlant } from "@/lib/plants";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function CalendarView() {
  const bed = usePlanner((s) => s.bed);

  const rows = useMemo(() => {
    const unique = new Map<string, number>();
    for (const p of bed.plants) {
      unique.set(p.plantId, (unique.get(p.plantId) ?? 0) + 1);
    }
    return [...unique.entries()].map(([id, count]) => ({
      plant: getPlant(id)!,
      count,
    })).filter((r) => r.plant);
  }, [bed.plants]);

  if (!rows.length) {
    return (
      <p className="text-xs text-leaf-700/70">
        Add plants to see your seasonal planting & harvest calendar.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-leaf-900">Seasonal calendar</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-1 text-xs">
          <thead>
            <tr className="text-leaf-700/70">
              <th className="sticky left-0 bg-leaf-50 px-2 py-1 text-left">Plant</th>
              {MONTHS.map((m) => (
                <th key={m} className="px-1 py-1 text-center font-normal">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ plant, count }) => (
              <tr key={plant.id} className="bg-white">
                <td className="sticky left-0 bg-white px-2 py-1 font-medium text-leaf-900">
                  <span className="mr-1">{plant.emoji}</span>
                  {plant.name}
                  <span className="ml-1 text-leaf-700/60">×{count}</span>
                </td>
                {MONTHS.map((_, i) => {
                  const m = i + 1;
                  const plantM = plant.plantMonths.includes(m);
                  const harvestM = plant.harvestMonths.includes(m);
                  let bg = "";
                  let label = "";
                  if (plantM && harvestM) {
                    bg = "bg-gradient-to-r from-leaf-300 to-amber-300";
                    label = "P/H";
                  } else if (plantM) {
                    bg = "bg-leaf-300";
                    label = "P";
                  } else if (harvestM) {
                    bg = "bg-amber-300";
                    label = "H";
                  }
                  return (
                    <td key={m} className="px-0.5 py-0.5 text-center">
                      <div
                        className={`mx-auto h-5 w-7 rounded text-[10px] leading-5 text-leaf-900 ${bg}`}
                      >
                        {label}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-leaf-700/70">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-4 rounded bg-leaf-300" /> Plant
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-4 rounded bg-amber-300" /> Harvest
        </span>
      </div>
    </div>
  );
}
