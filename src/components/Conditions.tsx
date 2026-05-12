"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { usePlanner } from "@/lib/store";
import type { BedConditions } from "@/lib/types";

const SUN: BedConditions["sun"][] = ["full-sun", "part-sun", "part-shade", "shade"];

const BED_PRESETS: { label: string; width: number; height: number; note?: string }[] = [
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
  const [zipMessage, setZipMessage] = useState<string | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);

  async function lookupZip() {
    setZipError(null);
    setZipMessage(null);
    if (!/^\d{5}$/.test(zip)) {
      setZipError("Enter a 5-digit US ZIP code.");
      return;
    }
    setZipLoading(true);
    try {
      const res = await fetch(`/api/zone/${zip}`);
      const data = await res.json();
      if (!res.ok) {
        setZipError(data.error ?? "Couldn't find that ZIP.");
      } else {
        setConditions({ zone: data.zone });
        setZipMessage(`Zone ${data.label} — set!`);
      }
    } catch (e) {
      setZipError(e instanceof Error ? e.message : "Lookup failed.");
    } finally {
      setZipLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-leaf-900">Your raised bed</h3>

      <div className="grid grid-cols-2 gap-2">
        <Row label="Sun" hint="Hours of direct sun your spot gets.">
          <select
            className="select"
            value={conditions.sun}
            onChange={(e) => setConditions({ sun: e.target.value as BedConditions["sun"] })}
          >
            {SUN.map((v) => (
              <option key={v} value={v}>
                {v.replace("-", " ")}
              </option>
            ))}
          </select>
        </Row>

        <Row label="Zone" hint="USDA hardiness zone.">
          <input
            type="number"
            min={1}
            max={13}
            className="select w-16"
            value={conditions.zone}
            onChange={(e) =>
              setConditions({ zone: Math.max(1, Math.min(13, Number(e.target.value) || 1)) })
            }
          />
        </Row>
      </div>

      <div className="rounded-md border border-leaf-100 bg-leaf-50/60 p-2">
        <label className="flex items-center gap-1 text-[11px] font-medium text-leaf-800">
          <MapPin className="h-3 w-3" /> Find zone by ZIP (US)
        </label>
        <div className="mt-1 flex gap-1">
          <input
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
            className="select flex-1"
          />
          <button
            type="button"
            disabled={zipLoading || zip.length !== 5}
            onClick={lookupZip}
            className="inline-flex items-center justify-center rounded-md bg-leaf-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
          >
            {zipLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Find"}
          </button>
        </div>
        {zipMessage && (
          <p className="mt-1 text-[11px] text-leaf-700">{zipMessage}</p>
        )}
        {zipError && (
          <p className="mt-1 text-[11px] text-red-700">{zipError}</p>
        )}
      </div>

      <div className="my-0.5 h-px bg-leaf-200" />
      <div className="text-[11px] font-semibold text-leaf-700/70">
        Bed size (1 cell ≈ 1 ft)
      </div>

      <div className="grid grid-cols-3 gap-1">
        {BED_PRESETS.map((p) => {
          const active = bed.width === p.width && bed.height === p.height;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => resizeBed(p.width, p.height)}
              title={p.note}
              className={`rounded-md border px-1.5 py-1 text-[11px] transition ${
                active
                  ? "border-leaf-600 bg-leaf-600 text-white"
                  : "border-leaf-200 bg-white text-leaf-800 hover:bg-leaf-50"
              }`}
            >
              <div className="font-medium">{p.label}</div>
              {p.note && (
                <div
                  className={`text-[9px] ${
                    active ? "text-white/80" : "text-leaf-700/60"
                  }`}
                >
                  {p.note}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-leaf-700/70">
        <span>Custom:</span>
        <input
          type="number"
          min={1}
          max={40}
          className="select w-14"
          value={bed.width}
          onChange={(e) => resizeBed(Math.max(1, Number(e.target.value) || 1), bed.height)}
        />
        <span>×</span>
        <input
          type="number"
          min={1}
          max={40}
          className="select w-14"
          value={bed.height}
          onChange={(e) => resizeBed(bed.width, Math.max(1, Number(e.target.value) || 1))}
        />
        <span>ft</span>
      </div>

      <style>{`.select { border: 1px solid #bee5be; background: white; border-radius: 0.375rem; padding: 0.25rem 0.5rem; font-size: 0.8125rem; }`}</style>
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className="flex items-center justify-between gap-3 text-xs text-leaf-800"
      title={hint}
    >
      <span className="capitalize">{label}</span>
      {children}
    </label>
  );
}
