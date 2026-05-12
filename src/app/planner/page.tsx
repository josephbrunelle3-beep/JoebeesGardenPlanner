"use client";

import Link from "next/link";
import { useState } from "react";
import { Leaf, Trash2 } from "lucide-react";
import { GardenCanvas } from "@/components/GardenCanvas";
import { PlantPalette } from "@/components/PlantPalette";
import { Conditions } from "@/components/Conditions";
import { AIPromptPanel } from "@/components/AIPromptPanel";
import { CalendarView } from "@/components/CalendarView";
import { PlantInfoPanel } from "@/components/PlantInfoPanel";
import { SoilRecommendation } from "@/components/SoilRecommendation";
import { usePlanner } from "@/lib/store";
import type { Plant } from "@/lib/types";

export default function PlannerPage() {
  const [pendingPlantId, setPendingPlantId] = useState<string | null>(null);
  const clearBed = usePlanner((s) => s.clearBed);

  function handlePick(plant: Plant) {
    setPendingPlantId(plant.id);
  }

  return (
    <main className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4">
      <header className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-leaf-700">
          <Leaf className="h-5 w-5" />
          <span className="font-semibold">JoeBees</span>
        </Link>
        <div className="flex items-center gap-2">
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
        </div>
      </header>

      {/* Setup + Planner — one consolidated card */}
      <section className="rounded-2xl border border-leaf-200 bg-white p-4 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          <AIPromptPanel />
          <Conditions />
        </div>

        <div className="my-4 h-px bg-leaf-100" />

        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <GardenCanvas
            pendingPlantId={pendingPlantId}
            onConsumePending={() => setPendingPlantId(null)}
          />
          <div className="lg:max-h-[72vh] lg:overflow-y-auto lg:pr-1">
            <PlantPalette onPick={handlePick} />
          </div>
        </div>
      </section>

      {/* Less critical info — beneath the planner */}
      <section className="rounded-2xl border border-leaf-200 bg-white p-4 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <SoilRecommendation />
          <PlantInfoPanel />
          <div className="sm:col-span-2 xl:col-span-1">
            <CalendarView />
          </div>
        </div>
      </section>
    </main>
  );
}
