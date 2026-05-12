"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Leaf, Trash2 } from "lucide-react";
import { GardenCanvas } from "@/components/GardenCanvas";
import { PlantPalette } from "@/components/PlantPalette";
import { Conditions } from "@/components/Conditions";
import { AIPromptPanel } from "@/components/AIPromptPanel";
import { CalendarView } from "@/components/CalendarView";
import { PlantInfoPanel } from "@/components/PlantInfoPanel";
import { SoilRecommendation } from "@/components/SoilRecommendation";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { SaveExportMenu } from "@/components/SaveExportMenu";
import { usePlanner } from "@/lib/store";
import { loadFromLocal, saveToLocal } from "@/lib/persistence";
import type { Plant } from "@/lib/types";

export default function PlannerPage() {
  const [pendingPlantId, setPendingPlantId] = useState<string | null>(null);
  const bed = usePlanner((s) => s.bed);
  const clearBed = usePlanner((s) => s.clearBed);
  const loadBed = usePlanner((s) => s.loadBed);
  const hydrated = useRef(false);

  // Restore saved bed (if any) on first mount.
  useEffect(() => {
    const saved = loadFromLocal();
    if (saved) loadBed(saved);
    hydrated.current = true;
  }, [loadBed]);

  // Auto-save bed changes after hydration (debounced).
  useEffect(() => {
    if (!hydrated.current) return;
    const t = window.setTimeout(() => saveToLocal(bed), 400);
    return () => window.clearTimeout(t);
  }, [bed]);

  function handlePick(plant: Plant) {
    setPendingPlantId(plant.id);
  }

  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 overflow-x-hidden px-3 py-3 sm:px-4 sm:py-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 text-leaf-700">
          <Leaf className="h-5 w-5" />
          <span className="font-semibold">JoeBees</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {pendingPlantId && (
            <span className="rounded-full bg-leaf-100 px-3 py-1 text-xs text-leaf-800">
              Click a cell to place — or{" "}
              <button
                className="underline"
                onClick={() => setPendingPlantId(null)}
              >
                cancel
              </button>
            </span>
          )}
          <button
            onClick={clearBed}
            className="inline-flex items-center gap-1 rounded-md border border-leaf-200 bg-white px-3 py-1.5 text-xs font-medium text-leaf-800 hover:bg-leaf-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear bed
          </button>
          <SaveExportMenu />
        </div>
      </header>

      {/* Setup + Planner — one consolidated card */}
      <section className="overflow-hidden rounded-2xl border border-leaf-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="min-w-0">
            <AIPromptPanel />
          </div>
          <div className="min-w-0">
            <Conditions />
          </div>
        </div>

        <div className="my-4 h-px bg-leaf-100" />

        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <div className="min-w-0">
            <GardenCanvas
              pendingPlantId={pendingPlantId}
              onConsumePending={() => setPendingPlantId(null)}
            />
          </div>
          <div className="min-w-0 lg:max-h-[72vh] lg:overflow-y-auto lg:pr-1">
            <PlantPalette onPick={handlePick} />
          </div>
        </div>
      </section>

      {/* Less critical info — beneath the planner */}
      <section className="overflow-hidden rounded-2xl border border-leaf-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="min-w-0">
            <SoilRecommendation />
          </div>
          <div className="min-w-0">
            <PlantInfoPanel />
          </div>
          <div className="min-w-0 md:col-span-2 xl:col-span-1">
            <CalendarView />
          </div>
        </div>
      </section>
      <OnboardingWizard />
    </main>
  );
}
