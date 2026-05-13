"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { usePlanner } from "@/lib/store";
import { lookupZoneByZip } from "@/lib/zip-zones";
import { GlossaryChip } from "@/components/GlossaryChip";
import type { BedConditions } from "@/lib/types";

const SUN: BedConditions["sun"][] = ["full-sun", "part-sun", "part-shade", "shade"];

const BED_PRESETS: { label: string; width: number; height: number; note: string }[] = [
  { label: "2 × 4", width: 2, height: 4, note: "Patio / herbs" },
  { label: "3 × 6", width: 3, height: 6, note: "Small starter" },
  { label: "4 × 4", width: 4, height: 4, note: "Classic square-foot" },
  { label: "4 × 8", width: 4, height: 8, note: "Most popular" },
  { label: "4 × 12", width: 4, height: 12, note: "Family-size" },
  { label: "5 × 10", width: 5, height: 10, note: "Bigger family" },
];

export function Conditions() {
  const conditions = usePlanner((s) => s.bed.conditions);
  const setConditions = usePlanner((s) => s.setConditions);
  const bed = usePlanner((s) => s.bed);
  const resizeBed = usePlanner((s) => s.resizeBed);

  const [zip, setZip] = useState("");
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  // Restore previously saved ZIP into the input.
  useEffect(() => {
    if (conditions.zip && !zip) setZip(conditions.zip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditions.zip]);

  async function lookupZip() {
    setZipError(null);
    if (!/^\d{5}$/.test(zip)) {
      setZipError("Enter a 5-digit US ZIP code.");
      return;
    }

    // Try the built-in offline lookup first — instant, no network.
    const offline = lookupZoneByZip(zip);
    if (offline != null) {
      setConditions({ zone: offline, zip });
      return;
    }

    // Fall back to the API only for ZIPs not in our table (rare US prefixes,
    // territories, military). This keeps the common path zero-network.
    setZipLoading(true);
    try {
      const res = await fetch(`/api/zone/${zip}`);
      const data = await res.json();
      if (!res.ok) {
        setZipError(data.error ?? "Couldn't find that ZIP.");
      } else {
        setConditions({ zone: data.zone, zip });
      }
    } catch (e) {
      setZipError(e instanceof Error ? e.message : "Lookup failed.");
    } finally {
      setZipLoading(false);
    }
  }

  const hasZone = !!conditions.zip;

  return (
    <div className="flex flex-col gap-4">
      {/* Location — prominent ZIP card with derived zone */}
      <div className="rounded-xl border border-leaf-200 bg-gradient-to-br from-leaf-50 via-white to-white p-4 shadow-sm">
        <label
          htmlFor="zip-input"
          className="flex items-center gap-1.5 text-sm font-semibold text-leaf-900"
        >
          <MapPin className="h-4 w-4 text-leaf-600" /> Your location (US ZIP)
        </label>
        <p className="mt-0.5 text-xs text-leaf-700/80">
          We use this to find your{" "}
          <GlossaryChip term="zone">USDA hardiness zone</GlossaryChip> so plant
          picks match your climate.
        </p>
        <div className="mt-2 flex gap-2">
          <input
            id="zip-input"
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="e.g. 30301"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/[^\d]/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                lookupZip();
              }
            }}
            className="flex-1 rounded-lg border border-leaf-300 bg-white px-3 py-2 text-base font-medium tracking-wider shadow-inner focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200"
          />
          <button
            type="button"
            disabled={zipLoading || zip.length !== 5}
            onClick={lookupZip}
            className="btn-primary inline-flex items-center justify-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {zipLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Find zone
          </button>
        </div>
        {hasZone && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-leaf-100 px-3 py-1 text-xs text-leaf-800">
            <span className="font-semibold">Zone {conditions.zone}</span>
            <span className="text-leaf-700/70">
              · set from {conditions.zip}
            </span>
          </div>
        )}
        {zipError && (
          <p className="mt-2 text-xs text-red-700">{zipError}</p>
        )}
      </div>

      {/* Sun */}
      <div>
        <label className="text-sm font-semibold text-leaf-900">
          <GlossaryChip term="sun">Sun</GlossaryChip>
        </label>
        <p className="mt-0.5 text-xs text-leaf-700/80">
          How much direct sun your bed gets at midsummer.
        </p>
        <select
          className="mt-2 w-full rounded-lg border border-leaf-300 bg-white px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200"
          value={conditions.sun}
          onChange={(e) => setConditions({ sun: e.target.value as BedConditions["sun"] })}
        >
          {SUN.map((v) => (
            <option key={v} value={v}>
              {v.replace("-", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Bed size */}
      <div>
        <label className="text-sm font-semibold text-leaf-900">
          Bed size
        </label>
        <p className="mt-0.5 text-xs text-leaf-700/80">
          Pick a common size, or enter your own dimensions below. 1 cell ≈ 1
          square foot.
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BED_PRESETS.map((p) => {
            const active = bed.width === p.width && bed.height === p.height;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => resizeBed(p.width, p.height)}
                title={p.note}
                className={`rounded-lg border px-3 py-2 text-left transition ${
                  active
                    ? "border-leaf-600 bg-leaf-600 text-white shadow-sm"
                    : "border-leaf-200 bg-white text-leaf-800 hover:border-leaf-400 hover:bg-leaf-50"
                }`}
              >
                <div className="text-sm font-semibold">{p.label} ft</div>
                <div
                  className={`text-[11px] ${
                    active ? "text-white/85" : "text-leaf-700/60"
                  }`}
                >
                  {p.note}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 rounded-lg border border-leaf-200 bg-leaf-50/60 p-3">
          <div className="text-xs font-semibold text-leaf-900">
            Or enter a custom size
          </div>
          <p className="mt-0.5 text-[11px] text-leaf-700/70">
            Any rectangle from 1 × 1 up to 40 × 40 ft.
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-3 text-sm text-leaf-800">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium uppercase tracking-wide text-leaf-700/70">
                Width
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={40}
                  className="w-20 rounded-md border border-leaf-300 bg-white px-2 py-1.5 text-base font-medium focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200"
                  value={bed.width}
                  onChange={(e) =>
                    resizeBed(
                      Math.max(1, Math.min(40, Number(e.target.value) || 1)),
                      bed.height,
                    )
                  }
                />
                <span className="text-xs text-leaf-700/70">ft</span>
              </div>
            </label>
            <span className="pb-2 text-base font-medium text-leaf-700/60">×</span>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium uppercase tracking-wide text-leaf-700/70">
                Length
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={40}
                  className="w-20 rounded-md border border-leaf-300 bg-white px-2 py-1.5 text-base font-medium focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200"
                  value={bed.height}
                  onChange={(e) =>
                    resizeBed(
                      bed.width,
                      Math.max(1, Math.min(40, Number(e.target.value) || 1)),
                    )
                  }
                />
                <span className="text-xs text-leaf-700/70">ft</span>
              </div>
            </label>
            <span className="pb-2 text-xs text-leaf-700/70">
              = {bed.width * bed.height} sq ft
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
