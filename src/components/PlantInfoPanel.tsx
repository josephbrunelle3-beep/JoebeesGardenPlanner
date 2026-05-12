"use client";

import { useState } from "react";
import { ExternalLink, ShoppingCart, Sprout } from "lucide-react";
import { usePlanner } from "@/lib/store";
import { getPlant } from "@/lib/plants";
import { getShopLinks } from "@/lib/sources";

export function PlantInfoPanel() {
  const selectedId = usePlanner((s) => s.selectedInstanceId);
  const placed = usePlanner((s) =>
    s.bed.plants.find((p) => p.instanceId === selectedId),
  );
  const plant = placed ? getPlant(placed.plantId) : null;
  const [tab, setTab] = useState<"details" | "varieties" | "shop">("details");

  if (!plant) {
    return (
      <p className="text-xs text-leaf-700/70">
        Select a plant in the bed to see its details, varieties, and where to
        buy seeds or starts.
      </p>
    );
  }

  const shopTerm = plant.shopSearch ?? plant.name;
  const shopLinks = getShopLinks(shopTerm);

  return (
    <div className="flex flex-col gap-2 text-xs text-leaf-900">
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
            <Info label="Sun" value={plant.sun.replace("-", " ")} />
            <Info label="Water" value={plant.water} />
            <Info label="Soil" value={plant.soil.join(", ")} />
            <Info label="pH" value={plant.ph.join(", ")} />
            <Info label="Zones" value={`${plant.zones[0]}–${plant.zones[1]}`} />
            <Info label="Spacing" value={`${plant.spacingIn}"`} />
            {plant.daysToMaturity && (
              <Info label="To maturity" value={`${plant.daysToMaturity} days`} />
            )}
          </ul>
          {plant.companions.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-leaf-700">
                Likes:
              </div>
              <div className="text-[11px] text-leaf-800/80">
                {plant.companions.map((c) => getPlant(c)?.name ?? c).join(", ")}
              </div>
            </div>
          )}
          {plant.antagonists.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-red-700">
                Avoid:
              </div>
              <div className="text-[11px] text-red-800/80">
                {plant.antagonists.map((c) => getPlant(c)?.name ?? c).join(", ")}
              </div>
            </div>
          )}
          {plant.notes && (
            <p className="rounded bg-leaf-50 p-2 text-[11px] text-leaf-800">
              {plant.notes}
            </p>
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
        <div className="flex flex-col gap-2">
          <p className="text-[11px] text-leaf-700/80">
            Search top retailers for{" "}
            <strong className="text-leaf-900">{shopTerm}</strong>:
          </p>
          <ul className="flex flex-col gap-1">
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <li className="rounded border border-leaf-100 bg-white px-2 py-1">
      <div className="text-[10px] uppercase tracking-wide text-leaf-700/60">
        {label}
      </div>
      <div className="text-leaf-900">{value}</div>
    </li>
  );
}
