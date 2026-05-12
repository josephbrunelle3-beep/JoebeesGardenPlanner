import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Printable Garden Sheet",
  description:
    "Printable summary of your planned raised garden bed — bed map, plant list, calendar, care notes, and shopping list.",
  alternates: { canonical: "/planner/print" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function PlannerPrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
