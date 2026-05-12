import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://joebees.us";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/planner/print"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
