"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";
import type { FitLevel } from "@/lib/fit";

interface CompanionNote {
  /** "👍 with basil" / "⚠ near onion" — short label */
  label: string;
  /** Plain-English reason. */
  reason: string;
  /** "like" | "avoid" */
  kind: "like" | "avoid";
}

interface ReasonPopoverProps {
  /** Anything that triggers the popover (e.g., the palette button). */
  children: React.ReactNode;
  plantName: string;
  fitLevel: FitLevel;
  fitReasons: string[];
  companionNotes?: CompanionNote[];
}

const FIT_LABELS: Record<FitLevel, { title: string; tone: string }> = {
  good: { title: "Great fit for your bed", tone: "text-emerald-700" },
  warn: { title: "Needs care to thrive here", tone: "text-amber-700" },
  bad: { title: "Risky in your current bed", tone: "text-rose-700" },
};

/**
 * Wraps a trigger element with a hover/focus-revealed popover showing
 * fit reasons + companion notes. On touch devices it's reachable via the
 * little (i) button that appears in the top-right of the trigger.
 */
export function ReasonPopover({
  children,
  plantName,
  fitLevel,
  fitReasons,
  companionNotes = [],
}: ReasonPopoverProps) {
  const id = useId();
  const [openOnTap, setOpenOnTap] = useState(false);
  const [align, setAlign] = useState<"center" | "left" | "right">("center");
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Keep the popover inside whatever scroll container is clipping us
  // (palette sidebar on desktop, bottom sheet on mobile). Falls back to
  // the viewport when no scrollable ancestor is found.
  const recompute = () => {
    const el = wrapRef.current;
    if (!el) return;
    // Find nearest ancestor that clips overflow.
    let anc: HTMLElement | null = el.parentElement;
    let bounds = { left: 0, right: window.innerWidth };
    while (anc) {
      const cs = getComputedStyle(anc);
      if (
        cs.overflow !== "visible" ||
        cs.overflowX !== "visible" ||
        cs.overflowY !== "visible"
      ) {
        const r = anc.getBoundingClientRect();
        bounds = { left: r.left, right: r.right };
        break;
      }
      anc = anc.parentElement;
    }
    const r = el.getBoundingClientRect();
    const POP_W = 240; // matches w-60
    const center = r.left + r.width / 2;
    const margin = 8;
    if (center - POP_W / 2 < bounds.left + margin) setAlign("left");
    else if (center + POP_W / 2 > bounds.right - margin) setAlign("right");
    else setAlign("center");
  };

  useEffect(() => {
    recompute();
    window.addEventListener("resize", recompute);
    window.addEventListener("scroll", recompute, true);
    return () => {
      window.removeEventListener("resize", recompute);
      window.removeEventListener("scroll", recompute, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close on outside click / Escape when opened by tap.
  useEffect(() => {
    if (!openOnTap) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpenOnTap(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenOnTap(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [openOnTap]);

  const meta = FIT_LABELS[fitLevel];
  const hasAny = fitReasons.length > 0 || companionNotes.length > 0;

  return (
    <div
      ref={wrapRef}
      onMouseEnter={recompute}
      onFocusCapture={recompute}
      className="group/reason relative"
    >
      {children}
      <button
        type="button"
        aria-label={`Why ${plantName} is ${fitLevel === "good" ? "a great fit" : fitLevel === "warn" ? "tricky" : "risky"}`}
        aria-expanded={openOnTap}
        aria-controls={id}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          recompute();
          setOpenOnTap((v) => !v);
        }}
        className="absolute right-0.5 top-0.5 z-10 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/85 text-leaf-700 opacity-70 shadow-sm transition hover:opacity-100 hover:text-leaf-900 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-leaf-400"
      >
        <Info className="h-3 w-3" />
      </button>
      <div
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute top-full z-30 mt-1 w-60 rounded-lg border border-leaf-200 bg-white p-2.5 text-left text-[11px] leading-snug text-leaf-800 shadow-lg transition-opacity duration-150 ${
          align === "center"
            ? "left-1/2 -translate-x-1/2"
            : align === "left"
              ? "left-0"
              : "right-0"
        } ${
          openOnTap
            ? "pointer-events-auto opacity-100"
            : "opacity-0 group-hover/reason:opacity-100 group-focus-within/reason:opacity-100 group-hover/reason:pointer-events-auto"
        }`}
      >
        <p className={`text-xs font-semibold ${meta.tone}`}>{meta.title}</p>
        {!hasAny && (
          <p className="mt-1 text-leaf-700/70">
            Nothing notable — it should do fine.
          </p>
        )}
        {fitReasons.length > 0 && (
          <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
            {fitReasons.map((r, i) => (
              <li key={`fr-${i}`}>{r}</li>
            ))}
          </ul>
        )}
        {companionNotes.length > 0 && (
          <div className="mt-2 border-t border-leaf-100 pt-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-leaf-700/70">
              With plants in your bed
            </p>
            <ul className="mt-1 space-y-1">
              {companionNotes.map((n, i) => (
                <li key={`cn-${i}`}>
                  <span
                    className={
                      n.kind === "like"
                        ? "font-medium text-emerald-700"
                        : "font-medium text-rose-700"
                    }
                  >
                    {n.label}
                  </span>{" "}
                  <span className="text-leaf-800">— {n.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
