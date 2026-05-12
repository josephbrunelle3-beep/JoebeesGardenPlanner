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
    default: "JoeBees — Free Raised Garden Bed Planner with AI Tutor",
    template: "%s · JoeBees",
  },
  description:
    "Plan a thriving raised garden bed in minutes. Free, no signup. Drag plants onto a true-to-size grid, get AI layout suggestions, check companion planting, and ask JoeBee — your friendly gardening tutor.",
  applicationName: "JoeBees",
  authors: [{ name: "JoeBees" }],
  creator: "JoeBees",
  publisher: "JoeBees",
  category: "lifestyle",
  keywords: [
    "garden planner",
    "raised bed planner",
    "raised garden bed planner",
    "square foot gardening",
    "square foot garden planner",
    "companion planting chart",
    "companion plants",
    "vegetable garden layout",
    "vegetable garden planner",
    "AI garden assistant",
    "AI garden planner",
    "free garden planner",
    "beginner garden planner",
    "garden bed layout tool",
    "USDA hardiness zone",
    "frost dates",
    "what to plant in raised bed",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "JoeBees",
    locale: "en_US",
    title: "JoeBees — Free Raised Garden Bed Planner",
    description:
      "True-to-size raised bed planner with an AI gardening tutor. Drag plants, check companions, print a take-outside sheet. Free, no signup.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "JoeBees raised garden bed planner",
      },
      {
        url: "/joebee.png",
        width: 166,
        height: 166,
        alt: "JoeBee the bee mascot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JoeBees — Free Raised Garden Bed Planner",
    description:
      "True-to-size raised bed planner with an AI gardening tutor. Free, no signup.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/joebee.png", type: "image/png" },
    ],
    apple: [
      { url: "/joebee.png", sizes: "166x166", type: "image/png" },
    ],
    shortcut: "/joebee.png",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    // Fill these in once accounts are created — leaving placeholders disabled
    // so nothing renders incorrectly:
    // google: "<google-site-verification-code>",
    // other: { "msvalidate.01": "<bing-code>" },
  },
};

export const viewport: Viewport = {
  themeColor: "#1f6a3a",
  width: "device-width",
  initialScale: 1,
};

// Structured data — invisible to users, used by Google for rich results.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "JoeBees",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/joebee.png`,
        width: 166,
        height: 166,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "JoeBees",
      description:
        "Free raised garden bed planner with an AI gardening tutor.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: "JoeBees Garden Bed Planner",
      url: `${SITE_URL}/planner`,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires a modern browser with JavaScript enabled.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Drag-and-drop raised bed layout",
        "True-to-size square-foot gardening grid",
        "AI layout suggestions",
        "Companion planting and antagonist warnings",
        "USDA hardiness zone lookup by ZIP",
        "Printable take-outside garden sheet",
        "Plant & harvest calendar",
      ],
      isAccessibleForFree: true,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is JoeBees free?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes — JoeBees is completely free to use, with no signup required. Plan a raised bed, ask the AI gardening tutor questions, and print a take-outside sheet at no cost.",
          },
        },
        {
          "@type": "Question",
          name: "How big should my raised garden bed be?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "A 4×8 foot raised bed is the most common starter size. It gives you 32 square feet — enough for a varied salad/herb/tomato mix — while staying narrow enough to reach the middle from either side without stepping in.",
          },
        },
        {
          "@type": "Question",
          name: "What is square-foot gardening?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Square-foot gardening divides a raised bed into 1-foot squares and plants a specific number of plants per square based on their mature size. JoeBees uses this method to fit more plants into less space while preventing crowding.",
          },
        },
        {
          "@type": "Question",
          name: "Does JoeBees support companion planting?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. JoeBees automatically warns you when plants that don't grow well together are placed too close, and the AI layout tool groups good companions and separates antagonists by default.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <script
          type="application/ld+json"
          // Static, server-rendered JSON-LD — safe to dangerouslySetInnerHTML.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <ChatAssistant />
      </body>
    </html>
  );
}
