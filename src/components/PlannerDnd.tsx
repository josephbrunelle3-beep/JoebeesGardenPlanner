"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { usePlanner } from "@/lib/store";
import { getPlant } from "@/lib/plants";

type ActiveDrag =
  | { kind: "palette"; plantId: string }
  | { kind: "placed"; plantId: string };

/**
 * Wraps the planner step that contains both the palette and the garden bed,
 * so draggables from the palette can be dropped on the bed grid (they must
 * share a single DndContext).
 */
export function PlannerDnd({ children }: { children: React.ReactNode }) {
  const addPlant = usePlanner((s) => s.addPlant);
  const movePlant = usePlanner((s) => s.movePlant);
  const bed = usePlanner((s) => s.bed);
  const [active, setActive] = useState<ActiveDrag | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  function handleDragStart(e: DragStartEvent) {
    const d = e.active.data.current as
      | { type: "palette"; plantId: string }
      | { type: "placed"; instanceId: string }
      | undefined;
    if (!d) return;
    if (d.type === "palette") {
      setActive({ kind: "palette", plantId: d.plantId });
    } else {
      const placed = bed.plants.find((p) => p.instanceId === d.instanceId);
      if (placed) setActive({ kind: "placed", plantId: placed.plantId });
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    setActive(null);
    const overData = e.over?.data.current as
      | { type: "cell"; x: number; y: number }
      | undefined;
    const activeData = e.active.data.current as
      | { type: "palette"; plantId: string }
      | { type: "placed"; instanceId: string }
      | undefined;
    if (!overData || !activeData) return;
    if (activeData.type === "palette") {
      addPlant(activeData.plantId, overData.x, overData.y);
    } else {
      movePlant(activeData.instanceId, overData.x, overData.y);
    }
  }

  const activePlant = active ? getPlant(active.plantId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActive(null)}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activePlant && (
          <div className="pointer-events-none inline-flex w-max items-center gap-1.5 whitespace-nowrap rounded-full border border-leaf-300 bg-white px-3 py-1.5 text-sm font-medium text-leaf-900 shadow-lg">
            <span aria-hidden className="text-lg leading-none">
              {activePlant.emoji}
            </span>
            <span>{activePlant.name}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
