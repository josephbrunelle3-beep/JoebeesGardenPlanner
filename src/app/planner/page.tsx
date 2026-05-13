"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { GardenCanvas } from "@/components/GardenCanvas";
import { PlantPalette } from "@/components/PlantPalette";
import { Conditions } from "@/components/Conditions";
import { AIPromptPanel } from "@/components/AIPromptPanel";
import { CalendarView } from "@/components/CalendarView";
import { PlantInfoPanel } from "@/components/PlantInfoPanel";
import { SoilRecommendation } from "@/components/SoilRecommendation";
import { SaveExportMenu } from "@/components/SaveExportMenu";
import { PlannerShell, type PlannerSection } from "@/components/PlannerShell";
import { PlannerDnd } from "@/components/PlannerDnd";
import { MobilePaletteButton } from "@/components/MobilePaletteButton";
import { MobileQuickPalette } from "@/components/MobileQuickPalette";
import { usePlanner } from "@/lib/store";
import { loadFromLocal, saveToLocal } from "@/lib/persistence";
import type { Plant } from "@/lib/types";

export default function PlannerPage() {
  const [pendingPlantId, setPendingPlantId] = useState<string | null>(null);
  const bed = usePlanner((s) => s.bed);
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

  const sections: PlannerSection[] = [
    {
      id: "space",
      step: 1,
      label: "Your space",
      emoji: "📍",
      title: "Tell us about your growing site",
      intro:
        "Set your ZIP, the daily sun exposure, and the dimensions of your raised bed. These drive every plant recommendation that follows.",
      content: <Conditions />,
    },
    {
      id: "describe",
      step: 2,
      label: "Describe",
      emoji: "✨",
      title: "Describe your goal — we’ll lay it out",
      intro:
        "Type what you want to grow in one sentence, or pick a starter theme. The AI builds a layout that respects spacing, companions, and your hardiness zone.",
      content: <AIPromptPanel />,
    },
    {
      id: "garden",
      step: 3,
      label: "Your garden",
      emoji: "🌿",
      title: "Refine the layout",
      intro:
        "Drag plants to reposition them, tap one to see why it fits, or add more from the palette. Companion conflicts are flagged automatically.",
      content: (
        <PlannerDnd>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              <GardenCanvas
                pendingPlantId={pendingPlantId}
                onConsumePending={() => setPendingPlantId(null)}
              />
              {pendingPlantId && (
                <div className="mt-2 hidden items-center gap-2 rounded-full bg-leaf-100 px-3 py-1 text-xs text-leaf-800 md:inline-flex">
                  Click a cell to place —{" "}
                  <button
                    className="underline"
                    onClick={() => setPendingPlantId(null)}
                  >
                    cancel
                  </button>
                </div>
              )}
            </div>
            <div className="hidden min-w-0 md:block md:sticky md:top-20 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto md:pr-1">
              <PlantPalette onPick={handlePick} />
            </div>
          </div>
          <MobilePaletteButton
            pendingPlantId={pendingPlantId}
            onCancelPending={() => setPendingPlantId(null)}
          />
          <MobileQuickPalette
            pendingPlantId={pendingPlantId}
            onPick={handlePick}
          />
        </PlannerDnd>
      ),
    },
    {
      id: "care",
      step: 4,
      label: "Care & timing",
      emoji: "💧",
      title: "Soil, schedule, and care",
      intro:
        "Your recommended soil mix and amendments, planting and harvest windows for your zone, and a per-plant care reference.",
      content: (
        <div className="flex flex-col gap-6">
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
          <div className="flex flex-col items-start gap-2 rounded-xl border border-leaf-200 bg-leaf-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-display text-base font-semibold text-leaf-900">
                Save or share your plan
              </div>
              <p className="text-xs text-leaf-700/80">
                Export a printable layout or shopping list, or save this bed for later.
              </p>
            </div>
            <SaveExportMenu />
          </div>
        </div>
      ),
    },
  ];

  return <PlannerShell sections={sections} />;
}
