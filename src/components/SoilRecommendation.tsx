"use client";

import { ExternalLink, FlaskConical, Sparkles } from "lucide-react";
import { usePlanner } from "@/lib/store";
import { recommendSoil, phNote } from "@/lib/soil";
import { SUPPLY_LINKS } from "@/lib/sources";

export function SoilRecommendation() {
  const bed = usePlanner((s) => s.bed);
  const rec = recommendSoil(bed);

  return (
    <div className="flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50/60 p-3 break-words">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-amber-700" />
        <h3 className="font-display text-base font-semibold text-amber-900">
          Soil recommendation
        </h3>
      </div>

      {!rec.hasPlants ? (
        <p className="text-[11px] text-amber-900/70">
          Add a few plants and we’ll recommend a soil mix, pH target, and
          amendments tuned to what you’re growing — plus where to buy them.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-1">
            <div className="rounded border border-amber-200 bg-white px-2 py-1">
              <div className="text-[10px] uppercase tracking-wide text-amber-700/70">
                Soil
              </div>
              <div className="text-[13px] font-semibold capitalize text-amber-900">
                {rec.soil}
              </div>
            </div>
            <div className="rounded border border-amber-200 bg-white px-2 py-1">
              <div className="text-[10px] uppercase tracking-wide text-amber-700/70">
                pH
              </div>
              <div className="text-[13px] font-semibold capitalize text-amber-900">
                {rec.ph}
              </div>
            </div>
          </div>

          <p className="text-[11px] leading-snug text-amber-900/90">
            {rec.mixDescription}
          </p>
          <p className="text-[11px] leading-snug text-amber-900/70">
            <FlaskConical className="mr-1 inline h-3 w-3" />
            {phNote(rec.ph)}
          </p>

          <div>
            <div className="text-[11px] font-semibold text-amber-900">
              Amendments
            </div>
            <ul className="ml-4 list-disc text-[11px] text-amber-900/90">
              {rec.amendments.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>

          {rec.outliers.length > 0 && (
            <div className="rounded border border-amber-300 bg-amber-100/60 p-2 text-[11px] text-amber-900">
              <div className="font-semibold">Heads up — special needs:</div>
              <ul className="ml-4 list-disc">
                {rec.outliers.map((o) => (
                  <li key={o.plantName}>
                    <strong>{o.plantName}</strong> prefers {o.need}. Consider a
                    separate pot or amended corner.
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-1">
            <div className="text-[11px] font-semibold text-amber-900">
              Where to get it
            </div>
            <ul className="mt-1 flex flex-col gap-1">
              <SupplyRow
                label="Raised-bed soil mix"
                links={SUPPLY_LINKS.raisedBedSoil}
              />
              <SupplyRow label="Compost" links={SUPPLY_LINKS.compost} />
              {rec.ph === "acidic" && (
                <SupplyRow
                  label="Peat moss / sulfur"
                  links={[
                    {
                      retailer: "Home Depot",
                      url: "https://www.homedepot.com/s/peat%20moss",
                    },
                    {
                      retailer: "Lowe's",
                      url: "https://www.lowes.com/search?searchTerm=peat+moss",
                    },
                  ]}
                />
              )}
              {rec.ph === "alkaline" && (
                <SupplyRow
                  label="Garden lime"
                  links={[
                    {
                      retailer: "Home Depot",
                      url: "https://www.homedepot.com/s/garden%20lime",
                    },
                    {
                      retailer: "Lowe's",
                      url: "https://www.lowes.com/search?searchTerm=garden+lime",
                    },
                  ]}
                />
              )}
              <SupplyRow
                label="Soil pH test kit"
                links={[
                  {
                    retailer: "Home Depot",
                    url: "https://www.homedepot.com/s/soil%20ph%20tester",
                  },
                  {
                    retailer: "Lowe's",
                    url: "https://www.lowes.com/search?searchTerm=soil+ph+tester",
                  },
                ]}
              />
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function SupplyRow({
  label,
  links,
}: {
  label: string;
  links: { retailer: string; url: string }[];
}) {
  return (
    <li className="rounded border border-amber-200 bg-white px-2 py-1.5">
      <div className="text-[11px] font-medium text-amber-900">{label}</div>
      <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
        {links.map((l) => (
          <a
            key={l.retailer}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[10px] text-amber-800 underline hover:text-amber-900"
          >
            {l.retailer} <ExternalLink className="h-2.5 w-2.5" />
          </a>
        ))}
      </div>
    </li>
  );
}
