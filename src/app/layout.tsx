import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ChatAssistant } from "@/components/ChatAssistant";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontDisplay = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://joebees.us";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "JoeBees — Beginner-friendly raised garden bed planner",
    template: "%s · JoeBees",
  },
  description:
    "Plan a thriving raised garden bed in minutes. Drag plants onto a true-to-size grid, get AI layout suggestions, and ask JoeBee, your friendly gardening tutor.",
  applicationName: "JoeBees",
  keywords: [
    "garden planner",
    "raised bed planner",
    "square foot gardening",
    "companion planting",
    "vegetable garden layout",
    "AI garden assistant",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "JoeBees",
    title: "JoeBees — Plan your raised garden bed",
    description:
      "True-to-size garden bed planner with an AI gardening tutor. Free, beginner-friendly.",
    images: [{ url: "/joebee.png", width: 512, height: 512, alt: "JoeBee the bee" }],
  },
  twitter: {
    card: "summary",
    title: "JoeBees — Garden bed planner",
    description:
      "True-to-size garden bed planner with an AI gardening tutor.",
    images: ["/joebee.png"],
  },
  icons: {
    icon: "/joebee.png",
    apple: "/joebee.png",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1f6a3a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <ChatAssistant />
      </body>
    </html>
  );
}
