"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Plain-English definitions for gardening jargon used throughout the app.
 * Keys are case-insensitive lookup tokens.
 */
const TERMS: Record<string, { label: string; body: string }> = {
  zone: {
    label: "USDA hardiness zone",
    body: "A number (1–13) for how cold winters get where you live. Lower = colder. Plants are rated for the zones they survive. We use your ZIP to find yours.",
  },
  ph: {
    label: "pH",
    body: "How acidic or alkaline your soil is on a 0–14 scale. Most veg likes near-neutral (≈6.5). Blueberries need acidic; brassicas like slightly sweet (alkaline). A $10 home test kit works.",
  },
  antagonist: {
    label: "Antagonist plants",
    body: "Plants that grow worse near each other — they may compete for nutrients, share pests, or release growth-slowing chemicals. We flag pairs that should be at least a few feet apart.",
  },
  companion: {
    label: "Companion plants",
    body: "Plants that help each other when grown nearby — by repelling pests, attracting pollinators, fixing nitrogen, or providing shade. Basil & tomato are a classic pair.",
  },
  sun: {
    label: "Sun levels",
    body: "Full-sun = 6+ hrs direct sun. Part-sun = 4–6 hrs. Part-shade = 2–4 hrs. Shade = under 2 hrs. Measure at midsummer when the sun is highest.",
  },
  soil: {
    label: "Soil types",
    body: "Loam (ideal — crumbly, holds water but drains). Sandy (drains fast, needs more water/compost). Clay (holds water, gets compacted). Most raised beds start as loam from bagged mix.",
  },
};

interface GlossaryChipProps {
  /** Lookup key. e.g. "zone", "ph". */
  term: keyof typeof TERMS;
  /** Visible text. Defaults to a capitalized version of the term. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Inline jargon term with a hover/tap definition popover. Renders as
 * an underlined chip with a faint "?" hint.
 */
export function GlossaryChip({ term, children, className = "" }: GlossaryChipProps) {
  const def = TERMS[term];
  const id = useId();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!def) return <>{children ?? term}</>;

  return (
    <span ref={wrapRef} className={`group/glossary relative inline ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="inline cursor-help underline decoration-leaf-400 decoration-dotted decoration-1 underline-offset-2 hover:decoration-leaf-700 focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:rounded"
      >
        {children ?? def.label}
      </button>
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute left-0 top-full z-30 mt-1 w-64 rounded-lg border border-leaf-200 bg-white p-2.5 text-left text-[11px] leading-snug text-leaf-800 shadow-lg transition-opacity duration-150 ${
          open
            ? "pointer-events-auto opacity-100"
            : "opacity-0 group-hover/glossary:opacity-100 group-focus-within/glossary:opacity-100 group-hover/glossary:pointer-events-auto"
        }`}
      >
        <span className="block text-xs font-semibold text-leaf-900">
          {def.label}
        </span>
        <span className="mt-1 block text-leaf-800/90">{def.body}</span>
      </span>
    </span>
  );
}
