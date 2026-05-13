"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Leaf, Trash2, ArrowRight, Check, ArrowUp, ArrowDown } from "lucide-react";
import { usePlanner } from "@/lib/store";

export interface PlannerSection {
  id: string;
  step: number;
  label: string;
  title: string;
  intro: string;
  emoji: string;
  content: React.ReactNode;
}

interface PlannerShellProps {
  sections: PlannerSection[];
}

export function PlannerShell({ sections }: PlannerShellProps) {
  const clearBed = usePlanner((s) => s.clearBed);
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Height of the sticky progress nav, used so the section title isn't hidden
  // beneath it after we scroll.
  const STICKY_OFFSET = 80;

  function jumpToStep(id: string) {
    if (id === activeId) {
      // Already open — just scroll without re-triggering the open animation.
      scrollToStep(id);
      return;
    }
    setActiveId(id);
    // Wait two frames so React commits the new open/closed state and the
    // browser finishes the resulting layout pass. Otherwise the smooth scroll
    // starts toward a target whose final Y position keeps changing as the
    // previously-open section collapses, which feels jumpy.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToStep(id));
    });
  }

  function scrollToStep(id: string) {
    const el = sectionRefs.current[id];
    if (!el) return;
    const top =
      el.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 overflow-x-hidden px-3 py-3 sm:px-4 sm:py-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 text-leaf-700">
          <Leaf className="h-5 w-5" />
          <span className="font-semibold">JoeBees</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={clearBed}
            className="inline-flex items-center gap-1 rounded-md border border-leaf-200 bg-white px-3 py-1.5 text-xs font-medium text-leaf-800 hover:bg-leaf-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear bed
          </button>
        </div>
      </header>

      {/* Sticky scroll-aware progress header */}
      <nav
        aria-label="Planner progress"
        className="sticky top-0 z-30 -mx-3 border-b border-leaf-200 bg-white/85 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4"
      >
        <ol className="flex items-stretch gap-1 overflow-x-auto sm:gap-2">
          {sections.map((s) => {
            const isActive = s.id === activeId;
            return (
              <li key={s.id} className="flex-1 min-w-[120px]">
                <button
                  type="button"
                  onClick={() => jumpToStep(s.id)}
                  className={`group flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition ${
                    isActive
                      ? "border-leaf-500 bg-leaf-50"
                      : "border-transparent hover:bg-leaf-50/60"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span
                    className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-semibold ${
                      isActive
                        ? "bg-leaf-600 text-white"
                        : "bg-leaf-100 text-leaf-700"
                    }`}
                  >
                    {s.step}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-[11px] uppercase tracking-wide ${
                        isActive ? "text-leaf-800" : "text-leaf-700/60"
                      }`}
                    >
                      Step {s.step}
                    </span>
                    <span
                      className={`block truncate text-sm font-medium ${
                        isActive ? "text-leaf-900" : "text-leaf-800"
                      }`}
                    >
                      {s.label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {sections.map((s, idx) => {
        const isOpen = s.id === activeId;
        const next = sections[idx + 1];
        const activeIdx = sections.findIndex((sec) => sec.id === activeId);
        const isBefore = activeIdx >= 0 && idx < activeIdx;
        return (
          <section
            key={s.id}
            id={s.id}
            ref={(el) => {
              sectionRefs.current[s.id] = el;
            }}
            aria-labelledby={`${s.id}-title`}
            className={`scroll-mt-24 overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 ease-out ${
              isOpen
                ? "border-leaf-300 p-3 sm:p-4"
                : "border-leaf-200 p-2 sm:p-2.5"
            }`}
          >
            <button
              type="button"
              onClick={() => jumpToStep(s.id)}
              aria-expanded={isOpen}
              aria-controls={`${s.id}-body`}
              className={`flex w-full items-start gap-3 text-left ${
                isOpen ? "border-b border-leaf-100 pb-3" : ""
              }`}
            >
              <span
                aria-hidden
                className={`flex flex-none items-center justify-center rounded-full bg-leaf-50 transition ${
                  isOpen ? "h-9 w-9 text-lg" : "h-7 w-7 text-base"
                }`}
              >
                {s.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-leaf-700/70">
                  Step {s.step} · {s.label}
                </div>
                <h2
                  id={`${s.id}-title`}
                  className={`font-display font-semibold text-leaf-900 ${
                    isOpen ? "text-lg" : "text-sm"
                  }`}
                >
                  {s.title}
                </h2>
                {isOpen && (
                  <p className="mt-0.5 text-xs text-leaf-700/80">{s.intro}</p>
                )}
              </div>
              {!isOpen && (
                <span className="ml-auto flex items-center gap-1 self-center text-[11px] font-medium text-leaf-600">
                  {isBefore ? (
                    <>
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                      Go back
                    </>
                  ) : (
                    <>
                      Jump to
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                    </>
                  )}
                </span>
              )}
            </button>
            {isOpen && (
              <div
                id={`${s.id}-body`}
                key={s.id}
                className="animate-step-open mt-3 min-w-0"
              >
                {s.content}
                <div className="mt-4 flex justify-end border-t border-leaf-100 pt-3">
                  {next ? (
                    <button
                      type="button"
                      onClick={() => jumpToStep(next.id)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-leaf-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-leaf-700"
                    >
                      Next: {next.label}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-leaf-50 px-4 py-2 text-sm font-medium text-leaf-800">
                      <Check className="h-4 w-4" aria-hidden />
                      All steps done
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </main>
  );
}
