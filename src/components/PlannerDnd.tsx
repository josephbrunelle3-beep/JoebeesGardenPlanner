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
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { usePlanner } from "@/lib/store";
import { getPlant } from "@/lib/plants";
import { getFootprint } from "@/lib/footprint";

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
  const cellPx = usePlanner((s) => s.canvasCellPx);
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
    const dragged = active;
    setActive(null);
    const overData = e.over?.data.current as
      | { type: "cell"; x: number; y: number }
      | undefined;
    const activeData = e.active.data.current as
      | { type: "palette"; plantId: string }
      | { type: "placed"; instanceId: string }
      | undefined;
    if (!overData || !activeData) return;

    // The overlay is centered on the cursor, so the cell under the cursor is
    // the *center* of the footprint. Translate to the top-left so the placed
    // chip lines up with what was visible during the drag.
    const plantId = dragged?.plantId;
    const fp = plantId ? getFootprint(getPlant(plantId)!) : null;
    const offsetX = fp ? Math.floor((fp.w - 1) / 2) : 0;
    const offsetY = fp ? Math.floor((fp.h - 1) / 2) : 0;
    const targetX = clamp(overData.x - offsetX, 0, bed.width - (fp?.w ?? 1));
    const targetY = clamp(overData.y - offsetY, 0, bed.height - (fp?.h ?? 1));

    if (activeData.type === "palette") {
      addPlant(activeData.plantId, targetX, targetY);
    } else {
      movePlant(activeData.instanceId, targetX, targetY);
    }
  }

  const activePlant = active ? getPlant(active.plantId) : null;
  const activeFp = activePlant ? getFootprint(activePlant) : null;
  const overlayCell = Math.max(32, cellPx || 64);
  const overlayW = activeFp ? activeFp.w * overlayCell : overlayCell;
  const overlayH = activeFp ? activeFp.h * overlayCell : overlayCell;
  const emojiSize = Math.floor(overlayCell * 0.55);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActive(null)}
    >
      {children}
      <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
        {activePlant && (
          <div
            className="pointer-events-none flex items-center justify-center rounded-2xl border-2 border-leaf-500 bg-white/85 shadow-lg ring-2 ring-leaf-500/40"
            style={{
              width: overlayW,
              height: overlayH,
              fontSize: emojiSize,
              lineHeight: 1,
            }}
          >
            <span aria-hidden>{activePlant.emoji}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
