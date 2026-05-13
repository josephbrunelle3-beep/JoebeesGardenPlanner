"use client";

import { useEffect, useState } from "react";
import { Sprout, X } from "lucide-react";
import { PlantPalette } from "@/components/PlantPalette";
import type { Plant } from "@/lib/types";

interface Props {
  pendingPlantId: string | null;
  onPick: (plant: Plant) => void;
  onCancelPending: () => void;
}

/**
 * Mobile-only floating button + bottom sheet that hosts the plant palette.
 * Tapping a plant arms placement (via onPick) and closes the sheet, so the
 * user can drop it onto a cell. Desktop layouts hide this entirely.
 */
export function MobilePaletteButton({
  pendingPlantId,
  onPick,
  onCancelPending,
}: Props) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function handlePick(plant: Plant) {
    onPick(plant);
    setOpen(false);
  }

  return (
    <>
      {/* Floating action button (mobile only) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-leaf-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-leaf-700 md:hidden"
        aria-label="Open plant palette"
      >
        <Sprout className="h-5 w-5" />
        {pendingPlantId ? "Pick another" : "Add plants"}
      </button>

      {pendingPlantId && (
        <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-leaf-100 px-3 py-1.5 text-xs font-medium text-leaf-900 shadow md:hidden">
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
                <span aria-hidden className="text-lg">🎨</span>
                <h2 className="font-display text-base font-semibold text-leaf-900">
                  Pick a plant
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-leaf-700 hover:bg-leaf-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="border-b border-leaf-100 px-4 py-2 text-[11px] text-leaf-700/80">
              Tap a plant, then tap a cell on the bed to place it. Tap the
              ☆ on any plant to pin it to your quick palette (up to 5).
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              <PlantPalette onPick={handlePick} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
