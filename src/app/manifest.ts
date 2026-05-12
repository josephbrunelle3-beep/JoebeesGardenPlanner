import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JoeBees — Raised Garden Bed Planner",
    short_name: "JoeBees",
    description:
      "Free raised garden bed planner with an AI gardening tutor. Drag plants onto a true-to-size grid and print a take-outside garden sheet.",
    start_url: "/planner",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f3f7ef",
    theme_color: "#1f6a3a",
    categories: ["lifestyle", "productivity", "utilities"],
    icons: [
      {
        src: "/joebee.png",
        sizes: "166x166",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/joebee.png",
        sizes: "166x166",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
