import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://joebees.us";

export const metadata: Metadata = {
  title: "Raised Garden Bed Planner — Drag, Drop, Print",
  description:
    "Drag plants onto a true-to-size raised bed grid, check companion planting, get AI layout suggestions, and print a take-outside garden sheet. Free, no signup.",
  alternates: { canonical: "/planner" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/planner`,
    title: "JoeBees Raised Garden Bed Planner — Drag, Drop, Print",
    description:
      "Plan your raised bed in minutes with an AI gardening tutor and printable take-outside sheet.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JoeBees Raised Garden Bed Planner",
    description:
      "Drag plants onto a true-to-size grid. Free, no signup.",
  },
};

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
