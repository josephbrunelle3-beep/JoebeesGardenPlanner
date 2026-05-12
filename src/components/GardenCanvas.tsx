"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Trash2 } from "lucide-react";
import { usePlanner } from "@/lib/store";
import { getPlant } from "@/lib/plants";
import { analyzeBed } from "@/lib/companions";
import { getFootprint } from "@/lib/footprint";
import type { CompatibilityIssue, PlacedPlant } from "@/lib/types";

const CELL_PX_DESKTOP = 64;
const CELL_PX_MOBILE = 44;

function useCellPx() {
  const [cell, setCell] = useState(CELL_PX_DESKTOP);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setCell(mq.matches ? CELL_PX_MOBILE : CELL_PX_DESKTOP);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return cell;
}

export function GardenCanvas({
  pendingPlantId,
  onConsumePending,
  children,
}: {
  pendingPlantId: string | null;
  onConsumePending: () => void;
  children?: React.ReactNode;
}) {
  const bed = usePlanner((s) => s.bed);
  const addPlant = usePlanner((s) => s.addPlant);
  const movePlant = usePlanner((s) => s.movePlant);
  const removePlant = usePlanner((s) => s.removePlant);
  const select = usePlanner((s) => s.select);
  const selected = usePlanner((s) => s.selectedInstanceId);
  const CELL_PX = useCellPx();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const issues = useMemo(() => analyzeBed(bed), [bed]);
  const issuesByInstance = useMemo(() => {
    const m = new Map<string, CompatibilityIssue[]>();
    for (const i of issues) {
      for (const id of i.instanceIds) {
        const arr = m.get(id) ?? [];
        arr.push(i);
        m.set(id, arr);
      }
    }
    return m;
  }, [issues]);

  function handleDragEnd(e: DragEndEvent) {
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

  function handleCellClick(x: number, y: number) {
    if (pendingPlantId) {
      addPlant(pendingPlantId, x, y);
      onConsumePending();
    } else {
      select(null);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-leaf-900">{bed.name}</h2>
            <p className="text-xs text-leaf-700/70">
              {bed.width} × {bed.height} ft · drag plants in, or use the AI
            </p>
          </div>
          {selected && (
            <button
              type="button"
              onClick={() => removePlant(selected)}
              className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove selected
            </button>
          )}
        </div>

        <div
          className="relative inline-block max-w-full overflow-auto rounded-xl border border-soil-300 bg-soil-100 p-3 shadow-inner"
          style={{ maxHeight: "70vh" }}
        >
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `repeat(${bed.width}, ${CELL_PX}px)`,
              gridTemplateRows: `repeat(${bed.height}, ${CELL_PX}px)`,
              width: bed.width * CELL_PX,
              height: bed.height * CELL_PX,
            }}
          >
            {Array.from({ length: bed.width * bed.height }).map((_, i) => {
              const x = i % bed.width;
              const y = Math.floor(i / bed.width);
              return (
                <Cell
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  size={CELL_PX}
                  onClick={() => handleCellClick(x, y)}
                />
              );
            })}

            {bed.plants.map((p) => (
              <PlacedPlantChip
                key={p.instanceId}
                placed={p}
                cellPx={CELL_PX}
                selected={selected === p.instanceId}
                issues={issuesByInstance.get(p.instanceId) ?? []}
                onSelect={() => select(p.instanceId)}
              />
            ))}
          </div>
        </div>

        <IssuesList issues={issues} />
        {children}
      </div>
    </DndContext>
  );
}

function Cell({
  x,
  y,
  size,
  onClick,
}: {
  x: number;
  y: number;
  size: number;
  onClick: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `cell:${x}:${y}`,
    data: { type: "cell", x, y },
  });
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`soil-bg cursor-pointer border border-soil-300/40 transition ${
        isOver ? "ring-2 ring-leaf-500 ring-inset" : ""
      }`}
      style={{ width: size, height: size }}
    />
  );
}

function PlacedPlantChip({
  placed,
  cellPx,
  selected,
  issues,
  onSelect,
}: {
  placed: PlacedPlant;
  cellPx: number;
  selected: boolean;
  issues: CompatibilityIssue[];
  onSelect: () => void;
}) {
  const plant = getPlant(placed.plantId);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `placed:${placed.instanceId}`,
    data: { type: "placed", instanceId: placed.instanceId },
  });
  const ref = useRef<HTMLDivElement | null>(null);

  if (!plant) return null;

  const fp = getFootprint(plant);
  const hasError = issues.some((i) => i.level === "error");
  const hasWarn = issues.some((i) => i.level === "warning");

  let ringClass = "";
  if (selected) ringClass = "ring-2 ring-leaf-600";
  else if (hasError) ringClass = "ring-2 ring-red-500";
  else if (hasWarn) ringClass = "ring-2 ring-amber-400";

  // For multi-per-sqft plants, render a grid of mini emoji "plantings" so
  // 16 carrots actually look like 16 carrots. perRow = sqrt(perCell).
  const perRow = Math.round(Math.sqrt(fp.perCell));
  const showsGrid = fp.perCell > 1;
  const innerSize = fp.w * cellPx - 12;
  // Aim for ~70% of the available slot.
  const dotFontSize = showsGrid
    ? Math.max(10, Math.floor((innerSize / perRow) * 0.7))
    : fp.w === 1
      ? Math.floor(cellPx * 0.5)
      : Math.min(72, Math.floor(cellPx * 0.5) + (innerSize - cellPx) * 0.4);

  return (
    <div
      ref={(el) => {
        ref.current = el;
        setNodeRef(el);
      }}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      title={`${plant.name} · ${fp.label}${
        fp.perCell > 1 ? ` (${fp.perCell}/sqft)` : ""
      }${issues.length ? "\n" + issues.map((i) => i.message).join("\n") : ""}`}
      className={`pointer-events-auto absolute flex items-center justify-center rounded-2xl bg-white/85 shadow ${ringClass} ${
        isDragging ? "opacity-40" : ""
      }`}
      style={{
        left: placed.x * cellPx + 6,
        top: placed.y * cellPx + 6,
        width: fp.w * cellPx - 12,
        height: fp.h * cellPx - 12,
        cursor: "grab",
      }}
    >
      {showsGrid ? (
        <div
          className="grid h-full w-full place-items-center gap-0 p-1"
          style={{
            gridTemplateColumns: `repeat(${perRow}, 1fr)`,
            gridTemplateRows: `repeat(${perRow}, 1fr)`,
          }}
        >
          {Array.from({ length: fp.perCell }).map((_, i) => (
            <span
              key={i}
              aria-hidden
              style={{ fontSize: dotFontSize, lineHeight: 1 }}
            >
              {plant.emoji}
            </span>
          ))}
        </div>
      ) : (
        <span aria-hidden style={{ fontSize: dotFontSize, lineHeight: 1 }}>
          {plant.emoji}
        </span>
      )}
      <span className="absolute top-0.5 left-0.5 rounded-full bg-leaf-700/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
        {fp.label}
        {fp.perCell > 1 ? ` · ${fp.perCell}` : ""}
      </span>
    </div>
  );
}

function IssuesList({ issues }: { issues: CompatibilityIssue[] }) {
  if (!issues.length) {
    return (
      <p className="text-xs text-leaf-700/70">
        No compatibility issues detected.
      </p>
    );
  }

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const info = issues.filter((i) => i.level === "info");

  return (
    <div className="grid gap-2 text-xs">
      {errors.map((i, idx) => (
        <div key={`e${idx}`} className="rounded border border-red-200 bg-red-50 px-3 py-2 text-red-800">
          ⛔ {i.message}
        </div>
      ))}
      {warnings.map((i, idx) => (
        <div key={`w${idx}`} className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
          ⚠ {i.message}
        </div>
      ))}
      {info.slice(0, 5).map((i, idx) => (
        <div key={`i${idx}`} className="rounded border border-leaf-200 bg-leaf-50 px-3 py-2 text-leaf-800">
          ✓ {i.message}
        </div>
      ))}
    </div>
  );
}

