"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { usePlanner } from "@/lib/store";

const GARDEN_PRESETS: { label: string; emoji: string; prompt: string }[] = [
  {
    label: "Salsa",
    emoji: "🌶️",
    prompt:
      "Salsa garden: tomatoes, jalapeño & sweet peppers, onions, cilantro, garlic. Beginner friendly.",
  },
  {
    label: "Three Sisters",
    emoji: "🌽",
    prompt:
      "Classic Three Sisters bed: sweet corn, pole beans climbing the corn, and winter squash sprawling at the base.",
  },
  {
    label: "Salad bowl",
    emoji: "🥗",
    prompt:
      "Cut-and-come-again salad bed: butterhead and leaf lettuce, spinach, radishes, scallions, parsley.",
  },
  {
    label: "Italian kitchen",
    emoji: "🍅",
    prompt:
      "Italian kitchen garden: slicing tomatoes, sweet basil, oregano, garlic, bell peppers, and a row of parsley.",
  },
  {
    label: "Pizza garden",
    emoji: "🍕",
    prompt:
      "Pizza garden: Roma tomatoes, sweet basil, oregano, sweet peppers, red onions, and a little rosemary.",
  },
  {
    label: "Herb sampler",
    emoji: "🌿",
    prompt:
      "Compact culinary herb sampler: basil, parsley, rosemary, plus a marigold border for pests.",
  },
  {
    label: "Pollinator mix",
    emoji: "🌼",
    prompt:
      "Pollinator-friendly bed: sunflowers along the back, marigolds, basil flowers, and a few tomatoes for bonus food.",
  },
  {
    label: "Kid favorites",
    emoji: "🧒",
    prompt:
      "Kid-friendly garden: cherry tomatoes, sugar snap peas, carrots, strawberries, sunflowers.",
  },
  {
    label: "Stir-fry",
    emoji: "🥢",
    prompt:
      "Asian stir-fry bed: bok choy and other brassicas, snap peas, cucumbers, scallions, sweet peppers.",
  },
  {
    label: "Roots & berries",
    emoji: "🥕",
    prompt:
      "Roots & berries patch: carrots, radishes, potatoes in one corner, strawberries along the front edge.",
  },
];

export function AIPromptPanel() {
  const bed = usePlanner((s) => s.bed);
  const replacePlants = usePlanner((s) => s.replacePlants);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [rationale, setRationale] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex h-full flex-col gap-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-leaf-900">
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
        className="inline-flex items-center justify-center gap-2 rounded-md bg-leaf-600 px-3 py-2 text-xs font-medium text-white shadow hover:bg-leaf-700 disabled:opacity-50"
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
