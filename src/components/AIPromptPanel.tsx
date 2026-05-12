"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { usePlanner } from "@/lib/store";
import { GARDEN_PRESETS } from "@/lib/presets";

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

  useEffect(() => {
    if (pendingPrompt) {
      setPrompt(pendingPrompt);
      setPendingPrompt(null);
    }
  }, [pendingPrompt, setPendingPrompt]);

  async function generate() {
    setLoading(true);
    setError(null);
    setRationale(null);
    try {
      const res = await fetch("/api/ai/layout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt,
          width: bed.width,
          height: bed.height,
          conditions: bed.conditions,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "AI request failed.");
      } else {
        setRationale(data.rationale);
        replacePlants(data.plants);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="ai-prompt-panel" className="flex h-full flex-col gap-2">
      <h3 className="font-display flex items-center gap-2 text-base font-semibold text-leaf-900">
        <Sparkles className="h-4 w-4 text-leaf-600" /> Design my bed
        <span className="ml-1 text-[11px] font-normal text-leaf-700/70">
          — describe what you want to grow
        </span>
      </h3>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[72px] max-h-[140px] resize-none rounded-md border border-leaf-200 bg-white p-2 text-xs"
        placeholder="e.g. Three-sisters bed for a family of four..."
      />
      <button
        type="button"
        disabled={loading || !prompt.trim()}
        onClick={generate}
        className="btn-primary inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Designing..." : "Generate layout"}
      </button>

      <div className="mt-1">
        <div className="mb-1 text-[11px] font-semibold text-leaf-700/70">
          Or pick a starter garden
        </div>
        <div className="flex flex-wrap gap-1">
          {GARDEN_PRESETS.map((p) => {
            const active = prompt === p.prompt;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setPrompt(p.prompt)}
                title={p.prompt}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] transition ${
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
        <p className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </p>
      )}
      {rationale && (
        <div className="rounded border border-leaf-200 bg-leaf-50 p-2 text-xs text-leaf-800">
          <strong>Rationale: </strong>
          {rationale}
        </div>
      )}
    </div>
  );
}
