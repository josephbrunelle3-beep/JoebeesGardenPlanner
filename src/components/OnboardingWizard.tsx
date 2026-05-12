"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Sparkles, Sun, X } from "lucide-react";
import { usePlanner } from "@/lib/store";
import { GARDEN_PRESETS } from "@/components/AIPromptPanel";
import type { BedConditions } from "@/lib/types";

const ONBOARDED_KEY = "joebees:onboarded";

type SunChoice = BedConditions["sun"];

const SUN_OPTIONS: { value: SunChoice; label: string; hint: string; emoji: string }[] = [
  { value: "full-sun", label: "Full sun", hint: "6+ hours direct sun", emoji: "☀️" },
  { value: "part-sun", label: "Part sun", hint: "4–6 hours", emoji: "🌤️" },
  { value: "part-shade", label: "Part shade", hint: "2–4 hours", emoji: "⛅" },
  { value: "shade", label: "Shade", hint: "< 2 hours", emoji: "🌑" },
];

export function OnboardingWizard() {
  const setConditions = usePlanner((s) => s.setConditions);
  const setPendingPrompt = usePlanner((s) => s.setPendingPrompt);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [zip, setZip] = useState("");
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [zipLookedUp, setZipLookedUp] = useState(false);
  const [sun, setSun] = useState<SunChoice | null>(null);
  const [picks, setPicks] = useState<string[]>([]);

  useEffect(() => {
    try {
      if (localStorage.getItem(ONBOARDED_KEY) !== "true") setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(ONBOARDED_KEY, "true");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  async function lookupZip() {
    if (!/^\d{5}$/.test(zip)) {
      setZipError("Enter a 5-digit ZIP code.");
      return;
    }
    setZipLoading(true);
    setZipError(null);
    try {
      const res = await fetch(`/api/zone/${zip}`);
      const data = await res.json();
      if (!res.ok || typeof data.zone !== "number") {
        setZipError(data.error ?? "Couldn't look that up.");
      } else {
        setConditions({ zone: data.zone });
        setZipLookedUp(true);
      }
    } catch {
      setZipError("Network error — try again.");
    } finally {
      setZipLoading(false);
    }
  }

  function pickSun(value: SunChoice) {
    setSun(value);
    setConditions({ sun: value });
  }

  function togglePick(label: string) {
    setPicks((cur) => (cur.includes(label) ? cur.filter((p) => p !== label) : [...cur, label]));
  }

  function finish() {
    if (picks.length > 0) {
      const chosen = GARDEN_PRESETS.filter((p) => picks.includes(p.label));
      const combined =
        chosen.length === 1
          ? chosen[0].prompt
          : `Blend of: ${chosen.map((c) => c.label).join(", ")}. ${chosen
              .map((c) => c.prompt)
              .join(" ")}`;
      setPendingPrompt(combined);
      // Defer scroll so the prompt panel has re-rendered with new value.
      setTimeout(() => {
        const el = document.getElementById("ai-prompt-panel");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
    dismiss();
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
      className="fixed inset-0 z-50 flex items-center justify-center bg-leaf-900/40 p-3 backdrop-blur-sm dark:bg-black/60"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-leaf-200 bg-white p-5 shadow-2xl dark:border-night-50 dark:bg-night-200">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-leaf-700 hover:bg-leaf-50 dark:text-leaf-200 dark:hover:bg-night-100"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-wide text-leaf-700/70 dark:text-leaf-300/70">
          <span>Step {step} of 3</span>
          <div className="flex flex-1 gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  s <= step
                    ? "bg-gradient-to-r from-leaf-500 to-leaf-700"
                    : "bg-leaf-100 dark:bg-night-50"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div>
            <h2 className="font-display flex items-center gap-2 text-xl font-semibold text-leaf-900">
              <MapPin className="h-5 w-5 text-leaf-600" /> Where are you growing?
            </h2>
            <p className="mt-1 text-xs text-leaf-700/80">
              Your ZIP lets us look up your USDA hardiness zone so picks match your climate.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                value={zip}
                onChange={(e) => {
                  setZip(e.target.value.replace(/\D/g, "").slice(0, 5));
                  setZipError(null);
                  setZipLookedUp(false);
                }}
                placeholder="e.g. 97214"
                inputMode="numeric"
                className="flex-1 rounded-md border border-leaf-200 bg-white px-3 py-2 text-sm outline-none focus:border-leaf-400"
              />
              <button
                type="button"
                onClick={lookupZip}
                disabled={zipLoading}
                className="btn-primary inline-flex items-center gap-1 rounded-md px-3 py-2 text-xs font-medium disabled:opacity-50"
              >
                {zipLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Find zone
              </button>
            </div>
            {zipError && <p className="mt-2 text-xs text-rose-600">{zipError}</p>}
            {zipLookedUp && (
              <p className="mt-2 text-xs text-leaf-700">Got it — zone saved.</p>
            )}
            <div className="mt-5 flex justify-between">
              <button
                type="button"
                onClick={dismiss}
                className="text-xs text-leaf-700/70 underline hover:text-leaf-900"
              >
                Skip setup
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-md border border-leaf-200 bg-white px-3 py-1.5 text-xs font-medium text-leaf-800 hover:bg-leaf-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display flex items-center gap-2 text-xl font-semibold text-leaf-900">
              <Sun className="h-5 w-5 text-leaf-600" /> How much sun?
            </h2>
            <p className="mt-1 text-xs text-leaf-700/80">
              Look at the spot where the bed sits at midsummer.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {SUN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => pickSun(opt.value)}
                  className={`rounded-lg border p-3 text-left transition ${
                    sun === opt.value
                      ? "border-leaf-500 bg-leaf-50 ring-2 ring-leaf-300"
                      : "border-leaf-200 bg-white hover:bg-leaf-50"
                  }`}
                >
                  <div className="text-xl">{opt.emoji}</div>
                  <div className="mt-1 text-sm font-medium text-leaf-900">{opt.label}</div>
                  <div className="text-[11px] text-leaf-700/70">{opt.hint}</div>
                </button>
              ))}
            </div>
            <div className="mt-5 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-leaf-700/70 underline hover:text-leaf-900"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!sun}
                className="rounded-md border border-leaf-200 bg-white px-3 py-1.5 text-xs font-medium text-leaf-800 hover:bg-leaf-50 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display flex items-center gap-2 text-xl font-semibold text-leaf-900">
              <Sparkles className="h-5 w-5 text-leaf-600" /> What would you love to grow?
            </h2>
            <p className="mt-1 text-xs text-leaf-700/80">
              Pick a few — we&apos;ll seed the AI prompt for you. You can edit before generating.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {GARDEN_PRESETS.map((p) => {
                const active = picks.includes(p.label);
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => togglePick(p.label)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
                      active
                        ? "border-leaf-500 bg-leaf-100 text-leaf-900"
                        : "border-leaf-200 bg-white text-leaf-800 hover:bg-leaf-50"
                    }`}
                  >
                    <span>{p.emoji}</span>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-leaf-700/70 underline hover:text-leaf-900"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={finish}
                className="btn-primary inline-flex items-center gap-1 rounded-md px-3 py-2 text-xs font-medium"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {picks.length > 0 ? "Use these picks" : "Finish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
