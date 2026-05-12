import Link from "next/link";
import Image from "next/image";
import { Leaf, Sparkles, Sprout, Sun } from "lucide-react";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Decorative background blobs — fixed so they don't shift layout. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-leaf-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-10rem] h-[24rem] w-[24rem] rounded-full bg-amber-200/30 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
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

        {/* Hero */}
        <section className="relative mt-8 grid items-center gap-8 sm:mt-12 md:grid-cols-[1.05fr_1fr] md:gap-10">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full border border-leaf-200 bg-white/70 px-3 py-1 text-xs font-medium text-leaf-800 backdrop-blur-sm">
              <Sprout className="h-3.5 w-3.5" /> Built for raised-bed beginners
            </span>
            <h1 className="font-display mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-leaf-900 sm:text-5xl lg:text-[3.5rem]">
              Grow your first raised bed{" "}
              <span className="text-leaf-700">with confidence.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-leaf-800/80 sm:text-lg">
              A friendly planning tool and built-in gardening tutor. Get a smart
              layout in seconds, then ask <strong>JoeBee</strong> — your AI garden
              buddy — anything: soil mixes, watering, pests, what to plant when.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/planner"
                className="btn-primary rounded-full px-6 py-3 text-sm font-semibold shadow-sm"
              >
                Start planning →
              </Link>
              <a
                href="#features"
                className="rounded-full border border-leaf-300 bg-white px-6 py-3 text-sm font-medium text-leaf-800 transition hover:bg-leaf-50"
              >
                How it works
              </a>
              <span className="inline-flex items-center gap-1 text-xs text-leaf-700/70">
                <Sparkles className="h-3.5 w-3.5" /> Free · no signup
              </span>
            </div>

            {/* Trust strip */}
            <ul className="mt-8 grid grid-cols-3 gap-3 text-center sm:max-w-md">
              <Stat n="60+" label="plants" />
              <Stat n="USDA" label="zones 3–11" />
              <Stat n="2 min" label="to a layout" />
            </ul>
          </div>

          {/* Hero bed preview */}
          <div className="relative">
            <div className="rounded-3xl border border-leaf-200 bg-white p-4 shadow-xl shadow-leaf-900/5 sm:p-5">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                  <span className="inline-block h-2 w-2 rounded-full bg-leaf-500" />
                </div>
                <span className="rounded-full bg-leaf-100 px-2 py-0.5 text-[10px] font-medium text-leaf-800">
                  4 × 6 ft · zone 6
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1 rounded-xl">
                {Array.from({ length: 30 }).map((_, i) => {
                  const layout = [
                    "🍅", "", "🌿", "🌿", "", "🌼",
                    "🍅", "", "🌿", "🌿", "", "🌼",
                    "🥕", "🥕", "🥬", "🥬", "🥕", "🥕",
                    "🥕", "🥕", "🥬", "🥬", "🥕", "🥕",
                    "🧅", "🧅", "🌼", "🌼", "🧅", "🧅",
                  ];
                  return (
                    <div
                      key={i}
                      className="soil-bg relative flex aspect-square items-center justify-center rounded text-xl shadow-inner"
                    >
                      {layout[i] && (
                        <span className="drop-shadow-sm">{layout[i]}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-leaf-50/80 px-3 py-2 text-xs text-leaf-800">
                <Sparkles className="h-3.5 w-3.5 text-leaf-700" />
                <span>
                  <strong className="font-semibold">AI tip:</strong> basil keeps aphids off your tomatoes.
                </span>
              </div>
            </div>
            {/* Floating accent card */}
            <div className="absolute -bottom-3 -left-3 hidden rounded-xl border border-leaf-200 bg-white px-3 py-2 text-[11px] font-medium text-leaf-800 shadow-md sm:block">
              ✅ Companions paired
            </div>
            <div className="absolute -top-3 -right-3 hidden rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-900 shadow-md sm:block">
              🌞 Tall plants → back
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mt-14 grid gap-4 sm:mt-20 md:grid-cols-3">
          <Feature
            icon={
              <Image
                src="/joebee.png"
                alt="JoeBee"
                width={28}
                height={28}
                className="h-7 w-7 rounded-full"
              />
            }
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

        {/* CTA strip */}
        <section className="mt-14 overflow-hidden rounded-3xl border border-leaf-200 bg-gradient-to-br from-leaf-700 via-leaf-700 to-leaf-800 p-6 text-leaf-50 shadow-lg sm:mt-20 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                Ready to dig in?
              </h2>
              <p className="mt-1 text-sm text-leaf-100/85 sm:text-base">
                Open the planner, drop in your bed size, and you'll have a layout in under two minutes.
              </p>
            </div>
            <Link
              href="/planner"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-leaf-800 shadow-sm transition hover:bg-leaf-50"
            >
              Open the planner →
            </Link>
          </div>
        </section>

        <footer className="mt-10 border-t border-leaf-200 pt-5 text-xs text-leaf-700/70 sm:mt-14">
          © {new Date().getFullYear()} JoeBees. Built with Next.js &amp; Claude — with a love of dirt under the fingernails.
        </footer>
      </div>
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
    <div className="group rounded-2xl border border-leaf-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-2 text-leaf-700">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-leaf-100 text-leaf-700">
          {icon}
        </span>
        <h3 className="font-display text-base font-semibold text-leaf-900">
          {title}
        </h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-leaf-800/80">{body}</p>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <li className="rounded-xl border border-leaf-200 bg-white/70 px-2 py-2 backdrop-blur-sm">
      <div className="font-display text-lg font-bold leading-none text-leaf-900">
        {n}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wide text-leaf-700/70">
        {label}
      </div>
    </li>
  );
}

