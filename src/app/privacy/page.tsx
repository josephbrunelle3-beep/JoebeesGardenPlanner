import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy · JoeBees",
  description:
    "How JoeBees handles your data: minimal collection, no tracking, no ads, no selling.",
};

const CONTACT_EMAIL = "joebeesgarden@gmail.com";
const LAST_UPDATED = "May 13, 2026";

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-leaf-700 hover:text-leaf-900"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/joebee.png"
          alt="JoeBees"
          className="h-6 w-6 rounded-full"
        />
        <span className="font-semibold">JoeBees</span>
      </Link>

      <h1 className="font-display mt-6 text-3xl font-semibold text-leaf-900">
        Privacy Policy
      </h1>
      <p className="mt-1 text-xs text-leaf-700/70">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="prose prose-sm mt-6 max-w-none text-leaf-800/90">
        <p>
          JoeBees is a free raised-bed garden planner. The site is built to
          collect as little information about you as technically possible.
          This page explains exactly what data we touch and why.
        </p>

        <h2 className="font-display mt-6 text-xl font-semibold text-leaf-900">
          The short version
        </h2>
        <ul>
          <li>No account is required to use the planner.</li>
          <li>
            Your bed (size, plants, ZIP and zone, preferences) is saved in
            your own browser via <code>localStorage</code>. It never leaves
            your device unless you use a feature that requires the network.
          </li>
          <li>
            We do not sell, rent, or share your information with anyone.
          </li>
        </ul>

        <h2 className="font-display mt-6 text-xl font-semibold text-leaf-900">
          What we collect
        </h2>
        <h3 className="font-semibold text-leaf-900">
          Information stored in your browser
        </h3>
        <p>
          The planner writes your current bed layout to{" "}
          <code>localStorage</code> so it’s waiting for you on your next
          visit. Clear it at any time with the “Clear bed” button in the
          planner header, or by clearing your browser’s site data.
        </p>

        <h3 className="font-semibold text-leaf-900">Information sent to us</h3>
        <p>
          A network request is made only when you use the AI assistant or AI
          layout generator. In that case the request includes:
        </p>
        <ul>
          <li>The text you typed into the chat or prompt box.</li>
          <li>
            A short context summary of your current bed (dimensions,
            hardiness zone, sun setting, and the plants currently placed) so
            the AI can answer accurately.
          </li>
        </ul>
        <p>
          The request is forwarded to Anthropic (Claude) for the response.
          Anthropic’s handling is governed by their{" "}
          <a
            href="https://www.anthropic.com/legal/privacy"
            target="_blank"
            rel="noreferrer noopener"
          >
            privacy policy
          </a>
          . We don’t retain prompts beyond what’s needed to complete the
          request, and we don’t associate them with an identity.
        </p>

        <h3 className="font-semibold text-leaf-900">Server logs</h3>
        <p>
          Our hosting provider (Vercel) retains short-lived request logs
          including IP address, requested URL, and timing. These are used
          strictly for security and abuse prevention.
        </p>

        <h2 className="font-display mt-6 text-xl font-semibold text-leaf-900">
          What we don&apos;t do
        </h2>
        <ul>
          <li>No advertising or ad-tracking cookies.</li>
          <li>No analytics that build a profile of you.</li>
          <li>
            No selling, renting, or sharing of personal information with
            third parties.
          </li>
          <li>No third-party social trackers (no Meta pixel, etc.).</li>
        </ul>

        <h2 className="font-display mt-6 text-xl font-semibold text-leaf-900">
          ZIP codes
        </h2>
        <p>
          You can enter a 5-digit US ZIP to set your USDA hardiness zone. The
          lookup runs entirely in your browser against a built-in table — your
          ZIP is not sent to us or to any third party. For ZIPs not in the
          built-in table (rare prefixes, territories, military), we fall back
          to a public zone API and send only the ZIP itself.
        </p>

        <h2 className="font-display mt-6 text-xl font-semibold text-leaf-900">
          Children
        </h2>
        <p>
          JoeBees is family-friendly. We do not knowingly collect personal
          information from anyone under 13. If you believe a child has
          provided personal information, contact us and we will delete it.
        </p>

        <h2 className="font-display mt-6 text-xl font-semibold text-leaf-900">
          Your choices
        </h2>
        <ul>
          <li>
            <strong>Delete saved data:</strong> use “Clear bed” in the
            planner, or clear your browser’s site data for this domain.
          </li>
          <li>
            <strong>Skip the AI:</strong> the planner is fully usable without
            ever pressing “Generate” or opening the chat. Nothing leaves
            your device unless you do.
          </li>
        </ul>

        <h2 className="font-display mt-6 text-xl font-semibold text-leaf-900">
          Changes to this policy
        </h2>
        <p>
          Material changes are reflected by an updated date above. Continued
          use of JoeBees after a change constitutes acceptance.
        </p>

        <h2 className="font-display mt-6 text-xl font-semibold text-leaf-900">
          Contact
        </h2>
        <p>
          Privacy questions: email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or use the{" "}
          <Link href="/contact">contact page</Link>.
        </p>
      </div>
    </main>
  );
}
