"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Bug, Mail, Shield, RefreshCw } from "lucide-react";

const TIPS = [
  "Water deeply 2–3 times a week, not a little every day. Deep watering drives roots downward, where the soil stays cooler and damper through heat waves.",
  "Mulch with 1–2 inches of straw or shredded leaves once seedlings are up. Mulch conserves moisture, suppresses weeds, moderates soil temperature, and feeds the bed as it breaks down.",
  "Plant basil beside your tomatoes. Basil’s aromatic oils mask the scent cues that draw hornworms and whiteflies to the tomato foliage.",
  "Pinch the first set of flowers off peppers and eggplants for the first 2–3 weeks after transplanting. The plant invests that energy in roots and structure, producing a much larger harvest over the season.",
  "Rotate nightshades — tomatoes, peppers, eggplant, potatoes — to a different part of the bed each year. They share early and late blight pathogens that overwinter in the soil.",
  "Harvest leafy greens like lettuce and kale from the outer leaves first. The plant keeps producing new growth from the center for weeks.",
  "Edge the bed with marigolds. They release alpha-terthienyl from their roots, which suppresses root-knot nematodes, and their blooms attract hoverflies and parasitic wasps that prey on aphids.",
  "Succession-sow fast crops — lettuce, radishes, spinach, bush beans — every 2 weeks instead of all at once. You’ll harvest steadily instead of facing a glut and then a gap.",
  "Check soil moisture before watering by pushing a finger 1 inch down. If it’s damp, skip the day. Overwatering is the most common cause of failure in raised beds because drainage is too good to hide the mistake.",
  "Mix a handful of finished compost into every planting hole. It buffers pH, feeds soil biology, and improves both drainage and water retention.",
];

/**
 * Footer for the planner page — provides scroll room past the floating
 * JoeBee FAB, plus helpful info, links, and a rotating beginner tip block
 * so the bottom of the page feels finished rather than abruptly cut off.
 */
export function PlannerFooter() {
  const year = new Date().getFullYear();
  const [tipIdx, setTipIdx] = useState(0);
  function nextTip() {
    setTipIdx((i) => {
      if (TIPS.length <= 1) return i;
      let next = Math.floor(Math.random() * TIPS.length);
      if (next === i) next = (i + 1) % TIPS.length;
      return next;
    });
  }

  return (
    <footer className="mt-8 border-t border-leaf-200 pt-6 pb-24 text-sm text-leaf-800/80 sm:pb-12">
      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-leaf-700/70">
            About
          </div>
          <div className="mt-2 flex items-center gap-2 text-leaf-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/joebee.png"
              alt="JoeBees"
              className="h-5 w-5 rounded-full"
            />
            <span className="font-display text-sm font-semibold">JoeBees</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-leaf-700/80">
            A true-to-size raised garden bed planner. Set your zone, describe
            what you want to grow, and the AI lays out a season — spacing,
            companions, and timing handled.
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-leaf-700/70">
            Quick links
          </div>
          <ul className="mt-2 space-y-1.5 text-xs">
            <li>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-leaf-700 hover:text-leaf-900 hover:underline"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Home
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/josephbrunelle3-beep/JoebeesGardenPlanner/issues/new"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-leaf-700 hover:text-leaf-900 hover:underline"
              >
                <Bug className="h-3.5 w-3.5" aria-hidden /> Report a bug
              </a>
            </li>
            <li>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-leaf-700 hover:text-leaf-900 hover:underline"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden /> Contact
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-1.5 text-leaf-700 hover:text-leaf-900 hover:underline"
              >
                <Shield className="h-3.5 w-3.5" aria-hidden /> Privacy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-leaf-700/70">
            Gardening tip
          </div>
          <p
            key={tipIdx}
            className="mt-2 text-xs leading-relaxed text-leaf-700/80"
          >
            {TIPS[tipIdx]}
          </p>
          <button
            type="button"
            onClick={nextTip}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-leaf-200 bg-white px-2.5 py-1 text-[11px] font-medium text-leaf-700 transition hover:bg-leaf-50 hover:text-leaf-900"
          >
            <RefreshCw className="h-3 w-3" aria-hidden />
            Show another tip
          </button>
        </div>
      </div>

      <div className="mt-6 border-t border-leaf-100 pt-4 text-[11px] text-leaf-700/60">
        © {year} JoeBees.
      </div>
    </footer>
  );
}
