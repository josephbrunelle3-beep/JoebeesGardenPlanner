"use client";

import type { FitLevel } from "@/lib/fit";

const STYLES: Record<FitLevel, { dot: string; label: string; hint: string }> = {
  good: {
    dot: "bg-emerald-500",
    label: "Great fit",
    hint: "Loves your conditions",
  },
  warn: {
    dot: "bg-amber-500",
    label: "Needs care",
    hint: "Will grow but isn't ideal",
  },
  bad: {
    dot: "bg-rose-500",
    label: "Risky",
    hint: "Wrong zone or fights its neighbors",
  },
};

/**
 * Compact horizontal legend explaining the red/amber/green fit dots used on
 * palette chips and placed plants. Sticky-friendly: pure CSS, no JS state.
 */
export function FitLegend({ className = "" }: { className?: string }) {
  return (
    <div
      role="note"
      aria-label="Fit color legend"
      className={`inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-md border border-leaf-200 bg-leaf-50/80 px-2 py-0.5 text-[10px] leading-tight text-leaf-800 ${className}`}
    >
      {(Object.keys(STYLES) as FitLevel[]).map((level) => {
        const s = STYLES[level];
        return (
          <span
            key={level}
            className="inline-flex items-center gap-1"
            title={s.hint}
          >
            <span aria-hidden className={`h-2 w-2 rounded-full ${s.dot}`} />
            <span className="font-medium">{s.label}</span>
          </span>
        );
      })}
    </div>
  );
}
