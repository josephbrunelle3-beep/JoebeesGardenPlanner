"use client";

import { useDraggable } from "@dnd-kit/core";
import { X } from "lucide-react";
import { getPlant } from "@/lib/plants";
import { usePlanner } from "@/lib/store";
import type { Plant } from "@/lib/types";

interface Props {
  pendingPlantId: string | null;
  onPick: (plant: Plant) => void;
}

/**
 * Mobile-only horizontal strip of pinned plants for quick tap-to-place.
 * Each tile arms that plant for placement. Tap × to unpin.
 * Sits just above the "Pick plants" FAB.
 */
export function MobileQuickPalette({ pendingPlantId, onPick }: Props) {
  const pinnedIds = usePlanner((s) => s.pinnedPlantIds);
  const togglePinned = usePlanner((s) => s.togglePinned);

  if (pinnedIds.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-[8.5rem] z-30 px-3 md:hidden"
      role="region"
      aria-label="Quick plant palette"
    >
      <div className="mx-auto flex max-w-md items-center gap-1.5 overflow-x-auto rounded-2xl border border-leaf-200 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur">
        {pinnedIds.map((id) => {
          const plant = getPlant(id);
          if (!plant) return null;
          return (
            <QuickTile
              key={id}
              plant={plant}
              armed={pendingPlantId === id}
              onPick={onPick}
              onUnpin={() => togglePinned(id)}
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
  onUnpin,
}: {
  plant: Plant;
  armed: boolean;
  onPick: (plant: Plant) => void;
  onUnpin: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `quick:${plant.id}`,
    data: { type: "palette", plantId: plant.id },
  });
  return (
    <div className="relative flex-none">
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        type="button"
        onClick={() => onPick(plant)}
        aria-label={`Place ${plant.name}`}
        title={plant.name}
        className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl border text-[9px] leading-none transition ${
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
      {/* Unpin button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onUnpin(); }}
        aria-label={`Remove ${plant.name} from quick palette`}
        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-leaf-700 text-white shadow hover:bg-leaf-900"
      >
        <X className="h-2.5 w-2.5" strokeWidth={3} />
      </button>
    </div>
  );
}
