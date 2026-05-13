"use client";

import { useDraggable } from "@dnd-kit/core";
import { Star } from "lucide-react";
import { getPlant } from "@/lib/plants";
import { usePlanner } from "@/lib/store";
import type { Plant } from "@/lib/types";

interface Props {
  pendingPlantId: string | null;
  onPick: (plant: Plant) => void;
}

/**
 * Mobile-only horizontal strip of "starred" plants for quick tap-to-place
 * (up to 5). Sits above the floating "Add plants" button so users can plan
 * a few favorites and drop them onto the bed without re-opening the full
 * palette sheet every time. Each tile is also draggable into the bed.
 */
export function MobileQuickPalette({ pendingPlantId, onPick }: Props) {
  const pinnedIds = usePlanner((s) => s.pinnedPlantIds);
  if (pinnedIds.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-[5.25rem] z-30 px-3 md:hidden"
      role="region"
      aria-label="Quick plant palette"
    >
      <div className="mx-auto flex max-w-md items-center gap-1.5 overflow-x-auto rounded-2xl border border-leaf-200 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur">
        <span className="flex flex-none items-center gap-1 pl-1 pr-0.5 text-[10px] font-semibold uppercase tracking-wide text-leaf-700/70">
          <Star
            className="h-3 w-3 text-amber-500"
            fill="currentColor"
            strokeWidth={2}
          />
          Quick
        </span>
        {pinnedIds.map((id) => {
          const plant = getPlant(id);
          if (!plant) return null;
          return (
            <QuickTile
              key={id}
              plant={plant}
              armed={pendingPlantId === id}
              onPick={onPick}
            />
          );
        })}
      </div>
    </div>
  );
}

function QuickTile({
  plant,
  armed,
  onPick,
}: {
  plant: Plant;
  armed: boolean;
  onPick: (plant: Plant) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `quick:${plant.id}`,
    data: { type: "palette", plantId: plant.id },
  });
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      onClick={() => onPick(plant)}
      aria-label={`Place ${plant.name}`}
      title={plant.name}
      className={`relative flex h-12 w-12 flex-none flex-col items-center justify-center rounded-xl border text-[9px] leading-none transition ${
        armed
          ? "border-leaf-500 bg-leaf-100 ring-2 ring-leaf-500/40"
          : "border-leaf-200 bg-white hover:border-leaf-400 hover:bg-leaf-50"
      } ${isDragging ? "opacity-40" : ""}`}
    >
      <span className="text-xl leading-none" aria-hidden>
        {plant.emoji}
      </span>
      <span
        className="mt-0.5 block w-full truncate px-0.5 text-center text-[9px] font-medium text-leaf-900"
        aria-hidden
      >
        {plant.name.split(" ")[0]}
      </span>
    </button>
  );
}
