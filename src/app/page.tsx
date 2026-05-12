import Link from "next/link";
import Image from "next/image";
import { Leaf, MessageCircle, Sprout, Sun } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-leaf-700">
          <Leaf className="h-6 w-6" />
          <span className="text-lg font-semibold">JoeBees</span>
        </div>
        <Link
          href="/planner"
          className="btn-primary rounded-full px-4 py-2 text-sm font-medium sm:px-5"
        >
          Open Planner
        </Link>
      </header>

      <section className="mt-10 grid items-center gap-8 sm:mt-20 sm:gap-12 md:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-leaf-100 px-3 py-1 text-xs font-medium text-leaf-800">
            <Sprout className="h-3.5 w-3.5" /> Built for raised-bed beginners
          </span>
          <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-leaf-900 sm:text-5xl">
            Grow your first raised bed with confidence.
          </h1>
          <p className="mt-4 text-base text-leaf-800/80 sm:mt-5 sm:text-lg">
            A friendly planning tool and built-in gardening tutor. Get a smart
            layout in seconds, then ask <strong>JoeBee</strong> — your AI
            garden buddy — anything: soil mixes, watering, pests, what to plant when.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
            <Link
              href="/planner"
              className="btn-primary rounded-full px-6 py-3 text-sm font-medium"
            >
              Start planning
            </Link>
            <a
              href="#features"
              className="rounded-full border border-leaf-300 bg-white px-6 py-3 text-sm font-medium text-leaf-800 hover:bg-leaf-50"
            >
              How it works
            </a>
          </div>
        </div>
        <div className="rounded-2xl border border-leaf-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-6 gap-1">
            {Array.from({ length: 36 }).map((_, i) => {
              const e = ["🍅", "🌿", "🥕", "🥬", "🧅", "🌼"][i % 6];
              return (
                <div
                  key={i}
                  className="soil-bg flex aspect-square items-center justify-center rounded text-xl"
                >
                  {i % 2 === 0 ? e : ""}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-leaf-700">
            Describe your dream bed — the AI designs it for you, then teaches
            you how to care for it.
          </p>
        </div>
      </section>

      <section id="features" className="mt-16 grid gap-6 sm:mt-24 md:grid-cols-3">
        <Feature
          icon={<Image src="/joebee.png" alt="JoeBee" width={24} height={24} className="h-6 w-6" />}
          title="Ask JoeBee anything"
          body="A built-in AI tutor answers beginner questions about soil, watering, pests, and seasons — kindly and in plain English."
        />
        <Feature
          icon={<Sprout className="h-5 w-5" />}
          title="Raised-bed first"
          body="Designed for raised beds where you control the soil mix, drainage, and depth. Recommendations assume good drainage and a custom soil blend."
        />
        <Feature
          icon={<Sun className="h-5 w-5" />}
          title="Companion + climate smart"
          body="Pairs friends like tomato + basil, keeps antagonists apart, and tailors picks to your sun and USDA zone."
        />
      </section>

      <footer className="mt-16 border-t border-leaf-200 pt-6 text-sm text-leaf-700/70 sm:mt-24">
        © {new Date().getFullYear()} JoeBees. Built with Next.js & Claude — with a love of dirt under the fingernails.
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-leaf-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-leaf-700">
        {icon}
        <h3 className="font-display text-base font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-leaf-800/80">{body}</p>
    </div>
  );
}
