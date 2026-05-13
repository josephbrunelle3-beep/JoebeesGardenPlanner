"use client";

import { useState } from "react";
import { ExternalLink, Info as InfoIcon, MapPin, ShoppingCart, Sprout } from "lucide-react";
import { usePlanner } from "@/lib/store";
import { getPlant } from "@/lib/plants";
import { getLocalSuppliers, getShopLinks } from "@/lib/sources";
import {
  COMPANION_PRINCIPLES,
  getPairReason,
} from "@/lib/companion-reasons";
import { GlossaryChip } from "@/components/GlossaryChip";

export function PlantInfoPanel() {
  const selectedId = usePlanner((s) => s.selectedInstanceId);
  const bedPlants = usePlanner((s) => s.bed.plants);
  const select = usePlanner((s) => s.select);
  const placed = bedPlants.find((p) => p.instanceId === selectedId);
  const zip = usePlanner((s) => s.bed.conditions.zip);
  const plant = placed ? getPlant(placed.plantId) : null;
  const [tab, setTab] = useState<"details" | "varieties" | "shop">("details");

  // Group bed plants by plantId so we can render a compact chooser.
  const groupedRows = (() => {
    const counts = new Map<string, { count: number; firstId: string }>();
    for (const p of bedPlants) {
      const existing = counts.get(p.plantId);
      if (existing) existing.count += 1;
      else counts.set(p.plantId, { count: 1, firstId: p.instanceId });
    }
    return Array.from(counts.entries())
      .map(([plantId, { count, firstId }]) => ({
        plantId,
        count,
        firstId,
        plant: getPlant(plantId),
      }))
      .filter((r) => r.plant)
      .sort((a, b) => a.plant!.name.localeCompare(b.plant!.name));
  })();

  if (!plant) {
    if (bedPlants.length === 0) {
      return (
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-base font-semibold text-leaf-900">
            Plant details
          </h3>
          <p className="text-xs text-leaf-700/70">
            No plants in the bed yet. Drag from the palette or generate a layout
            to get started.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 text-xs text-leaf-900">
        <h3 className="font-display text-base font-semibold text-leaf-900">
          Plant details
        </h3>
        <p className="text-[11px] text-leaf-700/70">
          {bedPlants.length} plant{bedPlants.length === 1 ? "" : "s"} in the
          bed. Tap one to see details.
        </p>
        <ul className="flex flex-col gap-1">
          {groupedRows.map((r) => (
            <li key={r.plantId}>
              <button
                type="button"
                onClick={() => select(r.firstId)}
                className="flex w-full items-center justify-between gap-2 rounded-md border border-leaf-200 bg-white px-2 py-1.5 text-left hover:bg-leaf-50"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base leading-none">
                    {r.plant!.emoji}
                  </span>
                  <span className="font-medium">{r.plant!.name}</span>
                </span>
                {r.count > 1 && (
                  <span className="rounded-full bg-leaf-100 px-1.5 text-[10px] font-semibold text-leaf-800">
                    ×{r.count}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const shopTerm = plant.shopSearch ?? plant.name;
  const shopLinks = getShopLinks(shopTerm);
  const localSuppliers = zip ? getLocalSuppliers(zip, shopTerm) : [];

  return (
    <div className="flex flex-col gap-2 text-xs text-leaf-900">
      <h3 className="font-display text-base font-semibold text-leaf-900">
        Plant details
      </h3>
      {groupedRows.length > 1 && (
        <div className="-mx-0.5 flex gap-1 overflow-x-auto pb-1">
          {groupedRows.map((r) => {
            const isActive = r.plantId === plant.id;
            return (
              <button
                key={r.plantId}
                type="button"
                onClick={() => select(r.firstId)}
                className={`flex flex-none items-center gap-1 rounded-full border px-2 py-1 text-[11px] transition ${
                  isActive
                    ? "border-leaf-500 bg-leaf-100 text-leaf-900"
                    : "border-leaf-200 bg-white text-leaf-700 hover:bg-leaf-50"
                }`}
                aria-pressed={isActive}
              >
                <span aria-hidden>{r.plant!.emoji}</span>
                <span className="font-medium">{r.plant!.name}</span>
                {r.count > 1 && (
                  <span
                    className={`rounded-full px-1 text-[10px] font-semibold ${
                      isActive
                        ? "bg-white/70 text-leaf-800"
                        : "bg-leaf-100 text-leaf-800"
                    }`}
                  >
                    ×{r.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-3xl">{plant.emoji}</span>
        <div>
          <div className="text-sm font-semibold">{plant.name}</div>
          <div className="text-[11px] capitalize text-leaf-700/70">
            {plant.category}
          </div>
        </div>
      </div>

      <div className="flex gap-1 rounded-md bg-leaf-50 p-0.5">
        <TabBtn active={tab === "details"} onClick={() => setTab("details")}>
          Details
        </TabBtn>
        <TabBtn
          active={tab === "varieties"}
          onClick={() => setTab("varieties")}
        >
          <Sprout className="mr-1 inline h-3 w-3" />
          Varieties
        </TabBtn>
        <TabBtn active={tab === "shop"} onClick={() => setTab("shop")}>
          <ShoppingCart className="mr-1 inline h-3 w-3" />
          Buy
        </TabBtn>
      </div>

      {tab === "details" && (
        <>
          <ul className="grid grid-cols-2 gap-1">
            <Info label={<GlossaryChip term="sun">Sun</GlossaryChip>} value={plant.sun.replace("-", " ")} />
            <Info label="Water" value={plant.water} />
            <Info label={<GlossaryChip term="soil">Soil</GlossaryChip>} value={plant.soil.join(", ")} />
            <Info label={<GlossaryChip term="ph">pH</GlossaryChip>} value={plant.ph.join(", ")} />
            <Info label={<GlossaryChip term="zone">Zones</GlossaryChip>} value={`${plant.zones[0]}–${plant.zones[1]}`} />
            <Info label="Spacing" value={`${plant.spacingIn}"`} />
            {plant.daysToMaturity && (
              <Info label="To maturity" value={`${plant.daysToMaturity} days`} />
            )}
          </ul>
          {plant.companions.length > 0 && (
            <CompanionList
              kind="like"
              plantId={plant.id}
              ids={plant.companions}
            />
          )}
          {plant.antagonists.length > 0 && (
            <CompanionList
              kind="avoid"
              plantId={plant.id}
              ids={plant.antagonists}
            />
          )}
          {(plant.companions.length > 0 || plant.antagonists.length > 0) && (
            <PrinciplesDisclosure />
          )}
        </>
      )}

      {tab === "varieties" && (
        <div className="flex flex-col gap-2">
          {plant.varieties?.length ? (
            plant.varieties.map((v) => (
              <div
                key={v.name}
                className="rounded-md border border-leaf-100 bg-white p-2"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-[12px] font-semibold text-leaf-900">
                    {v.name}
                  </div>
                  {v.daysToMaturity && (
                    <span className="text-[10px] text-leaf-700/60">
                      {v.daysToMaturity}d
                    </span>
                  )}
                </div>
                {v.description && (
                  <p className="mt-0.5 text-[11px] text-leaf-800/80">
                    {v.description}
                  </p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  {v.form && (
                    <span className="inline-block rounded-full bg-leaf-100 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-leaf-800">
                      {v.form === "both"
                        ? "seed or start"
                        : v.form === "seed"
                        ? "seed"
                        : "live plant"}
                    </span>
                  )}
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      `${v.name} ${plant.name} buy`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-[10px] text-leaf-700 underline hover:text-leaf-900"
                  >
                    Find <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-leaf-700/70">
              No varieties listed yet.
            </p>
          )}
        </div>
      )}

      {tab === "shop" && (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] text-leaf-700/80">
              Search top retailers for{" "}
              <strong className="text-leaf-900">{shopTerm}</strong>:
            </p>
            <ul className="mt-1 flex flex-col gap-1">
              {shopLinks.map((l) => (
                <li key={l.retailer}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-md border border-leaf-200 bg-white px-2 py-1.5 text-[12px] font-medium text-leaf-900 hover:bg-leaf-50"
                  >
                    <span className="flex items-center gap-2">
                      {l.retailer}
                      <span className="rounded-full bg-leaf-100 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-leaf-700">
                        {l.best === "both" ? "seeds & supplies" : l.best}
                      </span>
                    </span>
                    <ExternalLink className="h-3 w-3 text-leaf-700/60" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {zip ? (
            <div>
              <p className="flex items-center gap-1 text-[11px] font-semibold text-leaf-800">
                <MapPin className="h-3 w-3 text-leaf-600" /> Near you ({zip})
              </p>
              <ul className="mt-1 flex flex-col gap-1">
                {localSuppliers.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start justify-between gap-2 rounded-md border border-leaf-200 bg-leaf-50/60 px-2 py-1.5 text-[12px] font-medium text-leaf-900 hover:bg-leaf-50"
                    >
                      <span className="flex flex-col">
                        <span>{s.label}</span>
                        {s.note && (
                          <span className="text-[10px] font-normal text-leaf-700/70">
                            {s.note}
                          </span>
                        )}
                      </span>
                      <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-leaf-700/60" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-leaf-200 bg-leaf-50/40 px-2 py-1.5 text-[11px] text-leaf-700/80">
              <MapPin className="mr-1 inline h-3 w-3" />
              Add a ZIP code in the bed setup to also see local garden centers,
              nurseries, and stores nearby.
            </div>
          )}

          <p className="text-[10px] text-leaf-700/60">
            Links open the retailer&apos;s search results — availability and
            pricing vary by season and location.
          </p>
        </div>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded px-2 py-1 text-[11px] font-medium transition ${
        active
          ? "bg-white text-leaf-900 shadow-sm"
          : "text-leaf-700/70 hover:text-leaf-900"
      }`}
    >
      {children}
    </button>
  );
}

function Info({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <li className="rounded border border-leaf-100 bg-white px-2 py-1">
      <div className="text-[10px] uppercase tracking-wide text-leaf-700/60">
        {label}
      </div>
      <div className="text-leaf-900">{value}</div>
    </li>
  );
}

function CompanionList({
  kind,
  plantId,
  ids,
}: {
  kind: "like" | "avoid";
  plantId: string;
  ids: string[];
}) {
  const heading =
    kind === "like" ? (
      <GlossaryChip term="companion">Likes</GlossaryChip>
    ) : (
      <GlossaryChip term="antagonist">Avoid</GlossaryChip>
    );
  const headColor = kind === "like" ? "text-leaf-700" : "text-red-700";
  const accent =
    kind === "like"
      ? "border-leaf-100 bg-white"
      : "border-red-100 bg-white";
  const dot = kind === "like" ? "text-leaf-600" : "text-red-500";
  return (
    <div>
      <div className={`text-[11px] font-semibold ${headColor}`}>{heading}:</div>
      <ul className="mt-1 grid gap-1">
        {ids.map((id) => {
          const other = getPlant(id);
          const name = other?.name ?? id;
          const reason = getPairReason(plantId, id, kind);
          return (
            <li
              key={id}
              className={`rounded border px-2 py-1 text-[11px] text-leaf-800 ${accent}`}
            >
              <span className={`mr-1 ${dot}`}>•</span>
              <span className="font-medium text-leaf-900">{name}</span>
              {reason ? (
                <span className="text-leaf-800/80"> — {reason}</span>
              ) : (
                <span className="text-leaf-700/60">
                  {" "}
                  — {kind === "like" ? "shares similar growing needs." : "competes or shares pests / disease."}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PrinciplesDisclosure() {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="mt-1 rounded border border-leaf-100 bg-leaf-50/60 px-2 py-1.5"
    >
      <summary className="flex cursor-pointer list-none items-center gap-1 text-[11px] font-semibold text-leaf-800">
        <InfoIcon className="h-3 w-3 text-leaf-600" />
        What makes good or bad companions?
      </summary>
      <ul className="mt-2 grid gap-1.5">
        {COMPANION_PRINCIPLES.map((p) => (
          <li key={p.title} className="text-[11px] leading-snug text-leaf-800/90">
            <span className="font-semibold text-leaf-900">{p.title}.</span>{" "}
            {p.body}
          </li>
        ))}
      </ul>
    </details>
  );
}
