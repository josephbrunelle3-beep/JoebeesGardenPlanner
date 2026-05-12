/**
 * Retailer search-link helpers.
 *
 * We intentionally use each retailer's public search URL rather than hardcoded
 * product URLs, so the links remain valid as catalogs change. Users can refine
 * by adding the variety name to the search.
 */

export interface ShopSource {
  retailer: string;
  /** What this retailer is best for. */
  best: "seeds" | "starts" | "supplies" | "both";
  url: string;
}

const RETAILERS: { name: string; best: ShopSource["best"]; build: (q: string) => string }[] = [
  {
    name: "Bonnie Plants",
    best: "starts",
    build: (q) => `https://bonnieplants.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    name: "Burpee",
    best: "seeds",
    build: (q) => `https://www.burpee.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    name: "True Leaf Market",
    best: "seeds",
    build: (q) => `https://trueleafmarket.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    name: "Home Depot",
    best: "both",
    build: (q) => `https://www.homedepot.com/s/${encodeURIComponent(q)}`,
  },
  {
    name: "Lowe's",
    best: "both",
    build: (q) => `https://www.lowes.com/search?searchTerm=${encodeURIComponent(q)}`,
  },
];

export function getShopLinks(searchTerm: string): ShopSource[] {
  return RETAILERS.map((r) => ({
    retailer: r.name,
    best: r.best,
    url: r.build(searchTerm),
  }));
}

/**
 * Soil, compost, and raised-bed material links.
 */
export const SUPPLY_LINKS = {
  raisedBedSoil: [
    {
      retailer: "Home Depot",
      url: "https://www.homedepot.com/s/raised%20bed%20soil",
    },
    {
      retailer: "Lowe's",
      url: "https://www.lowes.com/search?searchTerm=raised+bed+soil",
    },
  ],
  compost: [
    {
      retailer: "Home Depot",
      url: "https://www.homedepot.com/s/organic%20compost",
    },
    {
      retailer: "Lowe's",
      url: "https://www.lowes.com/search?searchTerm=organic+compost",
    },
  ],
  raisedBedKits: [
    {
      retailer: "Home Depot",
      url: "https://www.homedepot.com/s/raised%20garden%20bed",
    },
    {
      retailer: "Lowe's",
      url: "https://www.lowes.com/search?searchTerm=raised+garden+bed",
    },
  ],
};
