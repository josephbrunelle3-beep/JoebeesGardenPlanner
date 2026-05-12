"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Printer } from "lucide-react";
import { loadFromLocal } from "@/lib/persistence";
import { getPlant } from "@/lib/plants";
import { getFootprint } from "@/lib/footprint";
import { analyzeBed } from "@/lib/companions";
import type { GardenBed, PlacedPlant, Plant } from "@/lib/types";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface ShoppingItem {
  plant: Plant;
  count: number;       // physical placements
  totalUnits: number;  // accounting for perCell
  form: "seed" | "start" | "both";
  preferredVariety?: string;
}

function buildShoppingList(bed: GardenBed): ShoppingItem[] {
  const grouped = new Map<string, { plant: Plant; placements: PlacedPlant[] }>();
  for (const placed of bed.plants) {
    const plant = getPlant(placed.plantId);
    if (!plant) continue;
    const existing = grouped.get(plant.id);
    if (existing) existing.placements.push(placed);
    else grouped.set(plant.id, { plant, placements: [placed] });
  }
  const items: ShoppingItem[] = [];
  for (const { plant, placements } of grouped.values()) {
    const fp = getFootprint(plant);
    const totalUnits = placements.length * fp.perCell;
    const form: ShoppingItem["form"] =
      plant.varieties?.[0]?.form ?? (plant.category === "vegetable" ? "both" : "start");
    items.push({
      plant,
      count: placements.length,
      totalUnits,
      form,
      preferredVariety: plant.varieties?.[0]?.name,
    });
  }
  return items.sort((a, b) => a.plant.name.localeCompare(b.plant.name));
}

export default function PrintSheetPage() {
  const [bed, setBed] = useState<GardenBed | null>(null);
  const [includeShopping, setIncludeShopping] = useState(true);
  const [includeMap, setIncludeMap] = useState(true);
  const [includeCalendar, setIncludeCalendar] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [blackAndWhite, setBlackAndWhite] = useState(false);

  useEffect(() => {
    setBed(loadFromLocal());
  }, []);

  const shoppingList = useMemo(() => (bed ? buildShoppingList(bed) : []), [bed]);
  const issues = useMemo(() => (bed ? analyzeBed(bed) : []), [bed]);

  if (!bed) {
    return (
      <div className="min-h-screen bg-leaf-50 p-8 text-leaf-900">
        <h1 className="font-display text-2xl font-semibold">No saved bed</h1>
        <p className="mt-2 text-sm">
          Open the planner first, set up your bed, then come back to print.
        </p>
        <a
          href="/planner"
          className="mt-4 inline-block rounded-md border border-leaf-200 bg-white px-3 py-1.5 text-sm text-leaf-800 hover:bg-leaf-100"
        >
          ← Back to planner
        </a>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-leaf-50/40 print:bg-white ${
        blackAndWhite ? "print-bw" : ""
      }`}
    >
      {/* Toolbar — hidden when printing */}
      <div className="sticky top-0 z-10 border-b border-leaf-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3">
          <a
            href="/planner"
            className="text-xs text-leaf-700 underline hover:text-leaf-900"
          >
            ← Back to planner
          </a>
          <h1 className="font-display text-sm font-semibold text-leaf-900">
            Printable garden sheet
          </h1>
          <div className="ml-auto flex flex-wrap items-center gap-3 text-xs text-leaf-800">
            <Toggle label="Bed map" checked={includeMap} onChange={setIncludeMap} />
            <Toggle label="Calendar" checked={includeCalendar} onChange={setIncludeCalendar} />
            <Toggle label="Care notes" checked={includeNotes} onChange={setIncludeNotes} />
            <Toggle label="Shopping list" checked={includeShopping} onChange={setIncludeShopping} />
            <Toggle label="Black & white" checked={blackAndWhite} onChange={setBlackAndWhite} />
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-primary inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* Sheet */}
      <main className="mx-auto max-w-4xl space-y-6 px-6 py-6 text-[12.5px] leading-snug text-leaf-900 print:max-w-none print:space-y-4 print:px-0 print:py-0 print:text-[11px]">
        <Header bed={bed} />

        {includeMap && <BedMap bed={bed} />}

        <PlantTable bed={bed} />

        {issues.length > 0 && <IssuesSection issues={issues} />}

        {includeCalendar && <CalendarSection bed={bed} />}

        {includeNotes && <NotesSection bed={bed} />}

        {includeShopping && shoppingList.length > 0 && (
          <ShoppingListSection items={shoppingList} />
        )}

        <footer className="mt-6 border-t border-leaf-200 pt-3 text-[10px] text-leaf-700/60">
          Generated by JoeBees Garden Bed Planner — joebees.us · printed{" "}
          {new Date().toLocaleDateString()}
        </footer>
      </main>

      <BrandMark />

      <style>{`
        @media print {
          @page { size: letter; margin: 0.5in; }
          .page-break { break-before: page; }
          .avoid-break { break-inside: avoid; }
        }
        /* Black & white mode — ink-saving, high-contrast monochrome. */
        .print-bw,
        .print-bw * {
          color: #000 !important;
          border-color: #000 !important;
        }
        .print-bw {
          background: #fff !important;
          /* Strip color from emoji glyphs and raster images (logo, etc.). */
          filter: grayscale(100%) contrast(1.05);
        }
        .print-bw *:not(svg):not(svg *) {
          background-color: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
        }
        .print-bw svg text { fill: #000 !important; }
        .print-bw svg line { stroke: #000 !important; }
        .print-bw svg rect { stroke: #000 !important; fill: #fff !important; }
        .print-bw .btn-primary {
          background: #000 !important;
          color: #fff !important;
        }
      `}</style>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1 text-xs">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-leaf-600"
      />
      {label}
    </label>
  );
}

function Header({ bed }: { bed: GardenBed }) {
  return (
    <section className="avoid-break flex flex-wrap items-end justify-between gap-3 border-b-2 border-leaf-700 pb-3">
      <div>
        <h1 className="font-display text-2xl font-bold leading-tight text-leaf-900">
          {bed.name || "My Garden Bed"}
        </h1>
        <p className="mt-0.5 text-[11px] text-leaf-700">
          {bed.width} × {bed.height} ft raised bed · {bed.plants.length} placements
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-leaf-800 sm:grid-cols-4">
        <Field label="Sun" value={bed.conditions.sun.replace("-", " ")} />
        <Field label="Soil" value={bed.conditions.soil} />
        <Field label="pH" value={bed.conditions.ph} />
        <Field label="Zone" value={`${bed.conditions.zone}`} />
        {bed.conditions.zip && <Field label="ZIP" value={bed.conditions.zip} />}
      </dl>
    </section>
  );
}

/**
 * Floating brand mark — a still frame from the JoeBee intro video, shown
 * in the same bottom-right spot where the "Ask JoeBee" chat button lives
 * on the planner. Renders inline on screen and on the printed page.
 */
function BrandMark() {
  const ref = useRef<HTMLVideoElement | null>(null);
  // Force the first frame to be drawn so the <video> shows a still even
  // when paused (some browsers won't render a frame until currentTime moves).
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onLoaded = () => {
      try {
        v.currentTime = 0.05;
      } catch {
        /* ignore */
      }
    };
    v.addEventListener("loadedmetadata", onLoaded);
    return () => v.removeEventListener("loadedmetadata", onLoaded);
  }, []);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-20 print:bottom-3 print:right-3">
      <video
        ref={ref}
        src="/JOEBEE.mp4"
        muted
        playsInline
        preload="auto"
        aria-hidden
        className="h-14 w-14 rounded-full border border-leaf-300 bg-white object-cover shadow-md print:h-16 print:w-16 print:shadow-none"
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1">
      <dt className="font-semibold uppercase tracking-wide text-leaf-700/70">{label}:</dt>
      <dd className="capitalize">{value}</dd>
    </div>
  );
}

function BedMap({ bed }: { bed: GardenBed }) {
  // SVG-based map so it scales cleanly when printing. Larger cells +
  // numbered legend below keeps the grid uncluttered.
  const CELL = 56;
  const W = bed.width * CELL;
  const H = bed.height * CELL;

  // Build a stable legend: each unique plant gets a number.
  const order: string[] = [];
  for (const p of bed.plants) if (!order.includes(p.plantId)) order.push(p.plantId);
  const indexById = new Map(order.map((id, i) => [id, i + 1]));
  const legend = order
    .map((id) => {
      const plant = getPlant(id);
      if (!plant) return null;
      const fp = getFootprint(plant);
      const count = bed.plants.filter((pp) => pp.plantId === id).length;
      const totalUnits = count * fp.perCell;
      return {
        id,
        n: indexById.get(id)!,
        plant,
        count,
        totalUnits,
        perCell: fp.perCell,
      };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <section className="avoid-break">
      <SectionTitle>Bed map</SectionTitle>
      <p className="text-[10px] text-leaf-700/70">
        Each square = 1 ft. Numbers match the legend on the right.
      </p>
      <div className="mt-2 flex flex-wrap items-start gap-4">
        <div className="rounded-md border border-leaf-300 bg-white p-2">
          <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Grid */}
            {Array.from({ length: bed.width + 1 }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={i * CELL}
                x2={i * CELL}
                y1={0}
                y2={H}
                stroke="#a8c3a0"
                strokeWidth={i === 0 || i === bed.width ? 1.5 : 0.5}
              />
            ))}
            {Array.from({ length: bed.height + 1 }).map((_, i) => (
              <line
                key={`h${i}`}
                x1={0}
                x2={W}
                y1={i * CELL}
                y2={i * CELL}
                stroke="#a8c3a0"
                strokeWidth={i === 0 || i === bed.height ? 1.5 : 0.5}
              />
            ))}
            {/* Plants */}
            {bed.plants.map((p) => {
              const plant = getPlant(p.plantId);
              if (!plant) return null;
              const fp = getFootprint(plant);
              const pad = 3;
              const x = p.x * CELL + pad;
              const y = p.y * CELL + pad;
              const w = fp.w * CELL - pad * 2;
              const h = fp.h * CELL - pad * 2;
              const n = indexById.get(p.plantId) ?? 0;
              const emojiSize = Math.min(28, w * 0.55);
              return (
                <g key={p.instanceId}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={5}
                    fill="#ffffff"
                    stroke="#3f6d3a"
                    strokeWidth={0.75}
                  />
                  {/* Number badge in top-left corner */}
                  <circle
                    cx={x + 8}
                    cy={y + 8}
                    r={6.5}
                    fill="#3f6d3a"
                  />
                  <text
                    x={x + 8}
                    y={y + 8}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={8}
                    fontWeight={700}
                    fill="#ffffff"
                  >
                    {n}
                  </text>
                  {/* Plant emoji centered */}
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={emojiSize}
                  >
                    {plant.emoji}
                  </text>
                  {/* Per-sqft count badge (only when >1) */}
                  {fp.perCell > 1 && (
                    <text
                      x={x + w - 3}
                      y={y + h - 3}
                      textAnchor="end"
                      fontSize={8}
                      fontWeight={600}
                      fill="#3a4a36"
                    >
                      ×{fp.perCell}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        {legend.length > 0 && (
          <ol className="min-w-[160px] flex-1 space-y-0.5 text-[11px]">
            {legend.map((row) => (
              <li key={row.id} className="flex items-baseline gap-2">
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-leaf-700 text-[9px] font-bold text-white">
                  {row.n}
                </span>
                <span className="text-base leading-none" aria-hidden>
                  {row.plant.emoji}
                </span>
                <span className="flex-1">
                  <span className="font-medium">{row.plant.name}</span>
                  <span className="text-leaf-700/70">
                    {" "}
                    — {row.totalUnits}
                    {row.totalUnits === 1 ? " plant" : " plants"}
                    {row.perCell > 1 ? ` (${row.count} sqft × ${row.perCell})` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function PlantTable({ bed }: { bed: GardenBed }) {
  // Group by plant id for a clean table.
  const groups = new Map<string, { plant: Plant; count: number }>();
  for (const placed of bed.plants) {
    const plant = getPlant(placed.plantId);
    if (!plant) continue;
    const g = groups.get(plant.id);
    if (g) g.count += 1;
    else groups.set(plant.id, { plant, count: 1 });
  }
  const rows = Array.from(groups.values()).sort((a, b) =>
    a.plant.name.localeCompare(b.plant.name),
  );
  if (rows.length === 0) {
    return (
      <section className="avoid-break">
        <SectionTitle>Plants in this bed</SectionTitle>
        <p className="text-[11px] text-leaf-700/70">No plants placed yet.</p>
      </section>
    );
  }
  return (
    <section className="avoid-break">
      <SectionTitle>Plants in this bed</SectionTitle>
      <table className="mt-1 w-full border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-leaf-300 text-left text-[10px] uppercase tracking-wide text-leaf-700/70">
            <th className="py-1 pr-2">Plant</th>
            <th className="py-1 pr-2">Footprint</th>
            <th className="py-1 pr-2">Sun</th>
            <th className="py-1 pr-2">Water</th>
            <th className="py-1 pr-2">Spacing</th>
            <th className="py-1 pr-2">Days to harvest</th>
            <th className="py-1 pr-2">Plants × Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ plant, count }) => {
            const fp = getFootprint(plant);
            const totalUnits = count * fp.perCell;
            return (
              <tr key={plant.id} className="border-b border-leaf-100 align-top">
                <td className="py-1 pr-2 font-medium">
                  <span className="mr-1" aria-hidden>
                    {plant.emoji}
                  </span>
                  {plant.name}
                </td>
                <td className="py-1 pr-2">{fp.label}</td>
                <td className="py-1 pr-2 capitalize">{plant.sun.replace("-", " ")}</td>
                <td className="py-1 pr-2 capitalize">{plant.water}</td>
                <td className="py-1 pr-2">{plant.spacingIn}&quot;</td>
                <td className="py-1 pr-2">{plant.daysToMaturity ?? "—"}</td>
                <td className="py-1 pr-2">
                  {count}
                  {fp.perCell > 1 ? ` (×${fp.perCell}/sqft = ${totalUnits})` : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function IssuesSection({
  issues,
}: {
  issues: ReturnType<typeof analyzeBed>;
}) {
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  if (errors.length === 0 && warnings.length === 0) return null;
  return (
    <section className="avoid-break rounded-md border border-amber-300 bg-amber-50 p-2 text-[11px]">
      <SectionTitle>Heads up</SectionTitle>
      <ul className="mt-1 space-y-0.5">
        {errors.map((i, idx) => (
          <li key={`e${idx}`} className="text-rose-700">
            • {i.message}
          </li>
        ))}
        {warnings.map((i, idx) => (
          <li key={`w${idx}`} className="text-amber-800">
            • {i.message}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CalendarSection({ bed }: { bed: GardenBed }) {
  const uniquePlants = Array.from(
    new Map(
      bed.plants.map((p) => [p.plantId, getPlant(p.plantId)] as const),
    ).values(),
  ).filter((p): p is Plant => !!p);
  if (uniquePlants.length === 0) return null;
  return (
    <section className="avoid-break">
      <SectionTitle>Plant &amp; harvest calendar</SectionTitle>
      <p className="text-[10px] text-leaf-700/70">
        Approximate windows for a typical year. ● = sow / plant, ◆ = harvest.
      </p>
      <table className="mt-1 w-full border-collapse text-[10px]">
        <thead>
          <tr>
            <th className="py-0.5 pr-2 text-left text-[10px] uppercase tracking-wide text-leaf-700/70">
              Plant
            </th>
            {MONTH_NAMES.map((m) => (
              <th
                key={m}
                className="border-l border-leaf-100 py-0.5 text-center text-[9px] font-medium text-leaf-700/70"
              >
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {uniquePlants
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((plant) => (
              <tr key={plant.id} className="border-t border-leaf-100">
                <td className="py-0.5 pr-2 font-medium">
                  <span className="mr-1" aria-hidden>
                    {plant.emoji}
                  </span>
                  {plant.name}
                </td>
                {MONTH_NAMES.map((_, mi) => {
                  const monthNum = mi + 1;
                  const sow = plant.plantMonths.includes(monthNum);
                  const harvest = plant.harvestMonths.includes(monthNum);
                  return (
                    <td
                      key={mi}
                      className="border-l border-leaf-100 text-center"
                    >
                      <span className="inline-flex gap-0.5">
                        {sow && <span className="text-leaf-700">●</span>}
                        {harvest && <span className="text-amber-700">◆</span>}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  );
}

function NotesSection({ bed }: { bed: GardenBed }) {
  const uniquePlants = Array.from(
    new Map(
      bed.plants.map((p) => [p.plantId, getPlant(p.plantId)] as const),
    ).values(),
  ).filter((p): p is Plant => !!p);
  const withNotes = uniquePlants.filter((p) => p.notes);
  return (
    <section className="avoid-break">
      <SectionTitle>Care notes</SectionTitle>
      {withNotes.length > 0 ? (
        <ul className="mt-1 space-y-0.5 text-[11px]">
          {withNotes.map((p) => (
            <li key={p.id}>
              <span className="font-semibold">
                <span aria-hidden className="mr-1">
                  {p.emoji}
                </span>
                {p.name}:
              </span>{" "}
              <span className="text-leaf-800">{p.notes}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[10px] text-leaf-700/70">
          No special care notes for plants in this bed.
        </p>
      )}
      <h3 className="mt-3 font-display text-[11px] font-semibold text-leaf-900">
        General reminders
      </h3>
      <ul className="mt-0.5 list-inside list-disc space-y-0.5 text-[11px] text-leaf-800">
        <li>Water deeply 1–2× per week; raised beds dry out faster in heat.</li>
        <li>Mulch 2–3&quot; deep to hold moisture and suppress weeds.</li>
        <li>Pinch herbs often to keep them bushy and prevent flowering.</li>
        <li>Rotate plant families year-to-year to reduce disease.</li>
      </ul>
    </section>
  );
}

function ShoppingListSection({ items }: { items: ShoppingItem[] }) {
  return (
    <section className="page-break avoid-break">
      <SectionTitle>Shopping list</SectionTitle>
      <p className="text-[10px] text-leaf-700/70">
        Tear off and take to the garden center. Check boxes once you have each item.
      </p>
      <table className="mt-1 w-full border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-leaf-300 text-left text-[10px] uppercase tracking-wide text-leaf-700/70">
            <th className="py-1 pr-2 w-6">Got</th>
            <th className="py-1 pr-2">Plant</th>
            <th className="py-1 pr-2">Variety to look for</th>
            <th className="py-1 pr-2">Quantity</th>
            <th className="py-1 pr-2">Form</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.plant.id} className="border-b border-leaf-100 align-top">
              <td className="py-1 pr-2 text-center">
                <span className="inline-block h-3 w-3 border border-leaf-700" />
              </td>
              <td className="py-1 pr-2 font-medium">
                <span aria-hidden className="mr-1">
                  {it.plant.emoji}
                </span>
                {it.plant.name}
              </td>
              <td className="py-1 pr-2 text-leaf-800">
                {it.preferredVariety ?? "Any"}
              </td>
              <td className="py-1 pr-2">
                {it.totalUnits} {it.totalUnits === 1 ? "plant" : "plants"}
                {it.count !== it.totalUnits ? ` (${it.count} sqft)` : ""}
              </td>
              <td className="py-1 pr-2 capitalize">
                {it.form === "both" ? "seeds or starts" : it.form === "seed" ? "seed packet" : "live plant"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="mt-4 font-display text-[11px] font-semibold text-leaf-900">
        Don&apos;t forget
      </h3>
      <ul className="mt-0.5 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-leaf-800">
        {[
          "Raised bed soil mix",
          "Compost / amendment",
          "Mulch (straw or wood chips)",
          "Trellis or stakes",
          "Plant labels",
          "Watering can or drip hose",
          "Gloves &amp; hand trowel",
          "Slow-release fertilizer",
        ].map((label) => (
          <li key={label} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 border border-leaf-700" />
            <span dangerouslySetInnerHTML={{ __html: label }} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-leaf-700">
      {children}
    </h2>
  );
}
