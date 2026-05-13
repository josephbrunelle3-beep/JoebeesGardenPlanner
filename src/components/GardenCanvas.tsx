"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { Trash2 } from "lucide-react";
import { usePlanner } from "@/lib/store";
import { getPlant } from "@/lib/plants";
import { analyzeBed } from "@/lib/companions";
import { getFootprint } from "@/lib/footprint";
import { getFixesForIssue, type FixOption } from "@/lib/fixes";
import { FitLegend } from "@/components/FitLegend";
import type { CompatibilityIssue, GardenBed, PlacedPlant } from "@/lib/types";

const CELL_PX_MAX_DESKTOP = 88;
const CELL_PX_MAX_MOBILE = 56;
const CELL_PX_MIN = 32;

/**
 * Compute the largest cell size that lets the whole bed fit inside the
 * available container width/height — so users don't have to scroll a giant
 * bed. Falls back to a sensible default until the container is measured.
 */
function useCellPx(
  bedW: number,
  bedH: number,
  hostRef: React.RefObject<HTMLDivElement | null>,
) {
  const [cell, setCell] = useState(CELL_PX_MAX_DESKTOP);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = hostRef.current;
    if (!el) return;
    const compute = () => {
      const isMobile = window.matchMedia("(max-width: 640px)").matches;
      const maxCell = isMobile ? CELL_PX_MAX_MOBILE : CELL_PX_MAX_DESKTOP;
      // 24px of horizontal padding inside the bed container (p-3 = 12px × 2).
      const availW = Math.max(0, el.clientWidth - 24);
      // Cap height to ~85vh so the bed never pushes other UI off-screen.
      const availH = Math.max(0, window.innerHeight * 0.85 - 24);
      const byW = Math.floor(availW / Math.max(1, bedW));
      const byH = Math.floor(availH / Math.max(1, bedH));
      const next = Math.max(CELL_PX_MIN, Math.min(maxCell, byW, byH));
      setCell((prev) => (prev === next ? prev : next));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [bedW, bedH, hostRef]);
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
  const removePlant = usePlanner((s) => s.removePlant);
  const select = usePlanner((s) => s.select);
  const selected = usePlanner((s) => s.selectedInstanceId);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const CELL_PX = useCellPx(bed.width, bed.height, hostRef);

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

  function handleCellClick(x: number, y: number) {
    if (pendingPlantId) {
      addPlant(pendingPlantId, x, y);
      onConsumePending();
    } else {
      select(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-leaf-900">{bed.name}</h2>
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

        <div className="relative">
          <CompassBadge />
          <div
            ref={hostRef}
            className="relative max-w-full overflow-auto rounded-xl border border-soil-300 bg-soil-100 p-3 shadow-inner"
          >
            <FitLegend className="mb-2" />
            <div
              className="relative mx-auto grid"
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

          {bed.plants.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3">
              <div className="pointer-events-auto w-full max-w-sm rounded-xl border border-leaf-200 bg-white/95 px-4 py-3 text-center shadow-md backdrop-blur-sm">
                <div className="mb-1 flex items-center justify-center gap-1 opacity-80">
                  <span className="text-2xl">🌱</span>
                  <span className="text-2xl">🌼</span>
                  <span className="text-2xl">🍅</span>
                </div>
                <p className="font-display text-sm font-semibold text-leaf-900">
                  Your bed is empty
                </p>
                <p className="mt-1 text-[11px] leading-snug text-leaf-700/80">
                  Go to <strong>Step 2</strong> to describe your garden, or drag
                  a plant from the palette.
                </p>
              </div>
            </div>
          )}
        </div>

        <IssuesList issues={issues} />
        {children}
      </div>
  );
}

/**
 * North compass + click-to-open explainer. Points to the top of the grid so
 * users place tall plants (which we put at low y) on the north side, where
 * they won't shade the rest of the bed.
 *
 * Click-only (no hover) so it doesn't flicker while the user scrolls the
 * adjacent bed canvas with the mouse wheel.
 */
function CompassBadge() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={wrapRef} className="absolute right-3 top-3 z-20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="North indicator — tap for orientation tips"
        aria-expanded={open}
        className="group flex h-14 w-14 flex-col items-center justify-center rounded-full border border-leaf-300 bg-white/95 shadow-md backdrop-blur-sm transition hover:shadow-lg"
      >
        <span className="font-display text-[10px] font-bold uppercase tracking-widest text-leaf-700">
          N
        </span>
        <span aria-hidden className="-mt-0.5 text-lg leading-none text-leaf-700">
          ↑
        </span>
        <span className="mt-0.5 text-[8px] font-medium uppercase tracking-wide text-leaf-700/60">
          info
        </span>
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute right-0 top-16 z-20 w-72 rounded-xl border border-leaf-200 bg-white p-3 text-[11px] leading-snug text-leaf-800 shadow-lg"
        >
          <p className="font-display text-xs font-semibold text-leaf-900">
            Which way is north?
          </p>
          <p className="mt-1">
            The <strong>top of the bed</strong> on this map represents the{" "}
            <strong>north side</strong> of your garden.
          </p>
          <p className="mt-2 font-semibold text-leaf-900">Why it matters</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>
              The sun travels across the southern sky, so anything tall on the
              <em> north</em> side won&apos;t shade the rest of the bed.
            </li>
            <li>
              Place <strong>tall plants</strong> (tomatoes, corn, trellised
              beans) along the top.
            </li>
            <li>
              Put <strong>short or shade-tolerant plants</strong> (lettuce,
              herbs, radishes) along the bottom — the south side.
            </li>
          </ul>
          <p className="mt-2 text-[10px] text-leaf-700/70">
            Tip: stand at the bottom of your bed facing the map. North is up.
          </p>
        </div>
      )}
    </div>
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
  // Aim to fit comfortably inside the chip; emoji glyphs render larger than
  // their nominal font-size, so we leave headroom to avoid overflow.
  const dotFontSize = showsGrid
    ? Math.max(8, Math.floor((innerSize / perRow) * 0.55))
    : fp.w === 1
      ? Math.floor(cellPx * 0.46)
      : Math.min(64, Math.floor(cellPx * 0.46) + (innerSize - cellPx) * 0.32);

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
      className={`group pointer-events-auto absolute flex items-center justify-center overflow-hidden rounded-2xl bg-white/85 shadow ${ringClass} ${
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
              className="flex items-center justify-center overflow-hidden"
              style={{
                fontSize: dotFontSize,
                lineHeight: 1,
                width: dotFontSize,
                height: dotFontSize,
              }}
            >
              {plant.emoji}
            </span>
          ))}
        </div>
      ) : (
        <span
          aria-hidden
          className="flex items-center justify-center overflow-hidden"
          style={{
            fontSize: dotFontSize,
            lineHeight: 1,
            width: dotFontSize,
            height: dotFontSize,
          }}
        >
          {plant.emoji}
        </span>
      )}
      <span
        className={`pointer-events-none absolute top-0.5 left-0.5 rounded-full bg-leaf-700/85 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm transition-opacity ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {fp.label}
        {fp.perCell > 1 ? ` · ${fp.perCell}` : ""}
      </span>
    </div>
  );
}

function IssuesList({ issues }: { issues: CompatibilityIssue[] }) {
  const bed = usePlanner((s) => s.bed);
  const setConditions = usePlanner((s) => s.setConditions);
  const movePlant = usePlanner((s) => s.movePlant);
  const removePlant = usePlanner((s) => s.removePlant);

  function runFix(fix: FixOption) {
    fix.apply({ bed: usePlanner.getState().bed, setConditions, movePlant, removePlant });
  }

  if (!issues.length) {
    if (bed.plants.length === 0) return null;
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
        <span aria-hidden className="text-base">✅</span>
        <span>
          <strong>Looks good!</strong> No compatibility issues with your current
          plants.
        </span>
      </div>
    );
  }

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const info = issues.filter((i) => i.level === "info");
  const seriousCount = errors.length + warnings.length;

  return (
    <div className="flex flex-col gap-2">
      {seriousCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
          <span aria-hidden className="text-base">⚠️</span>
          <span className="text-xs font-semibold text-amber-900">
            {seriousCount === 1
              ? "1 issue to look at"
              : `${seriousCount} issues to look at`}
          </span>
          <span className="text-[11px] text-amber-800/80">
            — tap a suggested fix below to resolve it
          </span>
          {errors.length > 0 && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              {errors.length} serious
            </span>
          )}
          {warnings.length > 0 && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              {warnings.length} caution
            </span>
          )}
        </div>
      )}
      <div className="grid gap-2 text-xs">
        {errors.map((i, idx) => (
          <IssueRow key={`e${idx}`} issue={i} bed={bed} tone="error" onFix={runFix} />
        ))}
        {warnings.map((i, idx) => (
          <IssueRow key={`w${idx}`} issue={i} bed={bed} tone="warning" onFix={runFix} />
        ))}
        {info.slice(0, 5).map((i, idx) => (
          <div key={`i${idx}`} className="rounded border border-leaf-200 bg-leaf-50 px-3 py-2 text-leaf-800">
            ✓ {i.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function IssueRow({
  issue,
  bed,
  tone,
  onFix,
}: {
  issue: CompatibilityIssue;
  bed: GardenBed;
  tone: "error" | "warning";
  onFix: (f: FixOption) => void;
}) {
  const fixes = getFixesForIssue(issue, bed);
  const wrap =
    tone === "error"
      ? "rounded border border-red-200 bg-red-50 px-3 py-2 text-red-800"
      : "rounded border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800";
  const btnBase =
    tone === "error"
      ? "inline-flex items-center gap-1 rounded-full border border-red-300 bg-white px-2 py-0.5 text-[11px] font-medium text-red-700 hover:bg-red-100"
      : "inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-2 py-0.5 text-[11px] font-medium text-amber-800 hover:bg-amber-100";
  return (
    <div className={wrap}>
      <div>
        {tone === "error" ? "⛔" : "⚠"} {issue.message}
      </div>
      {fixes.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {fixes.map((f, i) => (
            <button
              key={i}
              type="button"
              title={f.detail}
              onClick={() => onFix(f)}
              className={btnBase}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

