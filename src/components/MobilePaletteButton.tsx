"use client";

import { useEffect, useState } from "react";
import { Check, Sprout, X } from "lucide-react";
import { PlantPalette } from "@/components/PlantPalette";
import { usePlanner } from "@/lib/store";

interface Props {
  pendingPlantId: string | null;
  onCancelPending: () => void;
}

/**
 * Mobile-only floating button + bottom sheet.
 * In the sheet, tapping a plant pins/unpins it (no placement).
 * Users then tap a pinned plant in the quick palette to arm it for placement.
 */
export function MobilePaletteButton({ pendingPlantId, onCancelPending }: Props) {
  const [open, setOpen] = useState(false);
  const pinnedCount = usePlanner((s) => s.pinnedPlantIds.length);

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Floating action button (mobile only) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-leaf-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-leaf-700 md:hidden"
        aria-label="Open plant palette"
      >
        <Sprout className="h-5 w-5" />
        {pinnedCount > 0 ? `Plants (${pinnedCount})` : "Pick plants"}
      </button>

      {pendingPlantId && (
        <div className="fixed bottom-[8.5rem] left-1/2 z-40 -translate-x-1/2 rounded-full bg-leaf-100 px-3 py-1.5 text-xs font-medium text-leaf-900 shadow md:hidden">
          Tap a cell to place —{" "}
          <button onClick={onCancelPending} className="underline">
            cancel
          </button>
        </div>
      )}

      {/* Bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col md:hidden">
          <button
            type="button"
            aria-label="Close palette"
            onClick={() => setOpen(false)}
            className="flex-1 bg-black/30"
          />
          <div className="flex h-[78vh] flex-col rounded-t-2xl border-t border-leaf-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-leaf-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <span aria-hidden className="text-lg">🌱</span>
                <h2 className="font-display text-base font-semibold text-leaf-900">
                  Select your plants
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-md bg-leaf-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-leaf-700"
                aria-label="Done"
              >
                <Check className="h-3.5 w-3.5" />
                Done
              </button>
            </div>
            <p className="border-b border-leaf-100 px-4 py-2 text-[11px] text-leaf-700/80">
              Tap plants to add them to your quick palette. Tap again to remove.
              Then close this sheet and tap a plant from the bar to place it.
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              <PlantPalette pinMode />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
