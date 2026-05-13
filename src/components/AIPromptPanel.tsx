"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { usePlanner } from "@/lib/store";
import { GARDEN_PRESETS, expandPromptForAI } from "@/lib/presets";
import {
  consumeGeneration,
  getGenerationsRemaining,
  GENERATIONS_PER_DAY,
} from "@/lib/rateLimit";

export { GARDEN_PRESETS } from "@/lib/presets";

export function AIPromptPanel() {
  const bed = usePlanner((s) => s.bed);
  const replacePlants = usePlanner((s) => s.replacePlants);
  const pendingPrompt = usePlanner((s) => s.pendingPrompt);
  const setPendingPrompt = usePlanner((s) => s.setPendingPrompt);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [rationale, setRationale] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(GENERATIONS_PER_DAY);

  useEffect(() => {
    setRemaining(getGenerationsRemaining());
  }, []);

  useEffect(() => {
    if (pendingPrompt) {
      setPrompt(pendingPrompt);
      setPendingPrompt(null);
    }
  }, [pendingPrompt, setPendingPrompt]);

  async function generate() {
    if (remaining <= 0) {
      setError(
        "You’ve used today’s free AI generations. Drag plants from the palette to build your layout manually, or check back tomorrow.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    setRationale(null);
    try {
      const res = await fetch("/api/ai/layout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: expandPromptForAI(prompt),
          width: bed.width,
          height: bed.height,
          conditions: bed.conditions,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "AI request failed.");
      } else {
        setRemaining(consumeGeneration());
        setRationale(data.rationale);
        replacePlants(data.plants);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const capped = remaining <= 0;

  return (
    <div id="ai-prompt-panel" className="flex h-full flex-col gap-3">
      <div className="rounded-2xl border border-leaf-200 bg-gradient-to-br from-leaf-50 via-white to-white p-4 shadow-sm sm:p-5">
        <label
          htmlFor="ai-prompt-textarea"
          className="block text-sm font-medium text-leaf-900"
        >
          What do you want to grow?
        </label>
        <p className="mt-0.5 text-xs text-leaf-700/80">
          One sentence is enough. We&apos;ll select the plants and lay them out
          for your bed size, sun exposure, and hardiness zone.
        </p>
        <textarea
          id="ai-prompt-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="mt-2 min-h-[96px] w-full resize-y rounded-lg border border-leaf-200 bg-white p-3 text-sm shadow-inner focus:border-leaf-400 focus:outline-none focus:ring-2 focus:ring-leaf-200"
          placeholder="e.g. A salsa garden for a family of four — tomatoes, peppers, cilantro, onions."
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            disabled={loading || !prompt.trim() || capped}
            onClick={generate}
            className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Generating layout…" : "Generate my layout"}
          </button>
          <span
            className={`text-[11px] ${
              capped ? "text-amber-700" : "text-leaf-700/70"
            }`}
          >
            {remaining} of {GENERATIONS_PER_DAY} free generations left today
          </span>
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-leaf-700/70">
          Or start from a preset
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GARDEN_PRESETS.map((p) => {
            const active = prompt === p.prompt;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setPrompt(p.prompt)}
                title={p.prompt}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
                  active
                    ? "border-leaf-600 bg-leaf-600 text-white"
                    : "border-leaf-200 bg-white text-leaf-800 hover:bg-leaf-50"
                }`}
              >
                <span aria-hidden>{p.emoji}</span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
          {error}
        </p>
      )}
      {rationale && (
        <div className="rounded-lg border border-leaf-200 bg-leaf-50 p-3 text-xs text-leaf-800">
          <strong className="font-semibold">Why this layout: </strong>
          {rationale}
        </div>
      )}
    </div>
  );
}
