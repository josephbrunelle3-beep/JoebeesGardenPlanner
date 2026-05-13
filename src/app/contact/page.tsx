"use client";

import { useState } from "react";
import Link from "next/link";
import { Bug, Lightbulb, Mail, MessageCircle } from "lucide-react";

const CONTACT_EMAIL = "joebeesgarden@gmail.com";

const REASONS: { id: string; label: string; icon: typeof Mail }[] = [
  { id: "feedback", label: "Feedback or a question", icon: MessageCircle },
  { id: "bug", label: "Something is broken", icon: Bug },
  { id: "idea", label: "Feature idea", icon: Lightbulb },
  { id: "other", label: "Something else", icon: Mail },
];

/**
 * Contact page — no server-side form. Composes a `mailto:` link populated
 * with the user's draft so messages reach my inbox without me needing to
 * stand up a backend / email service.
 */
export default function ContactPage() {
  const [reason, setReason] = useState<string>("feedback");
  const [body, setBody] = useState("");

  const reasonLabel =
    REASONS.find((r) => r.id === reason)?.label ?? "Hello";
  const subject = encodeURIComponent(`JoeBees · ${reasonLabel}`);
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodeURIComponent(body)}`;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
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
        Get in touch
      </h1>
      <p className="mt-2 text-sm text-leaf-700/80">
        Bugs, feature requests, gardening questions, or feedback — send them
        my way. Every message is read.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-leaf-200 bg-white p-3 text-sm text-leaf-800">
        <Mail className="h-4 w-4 text-leaf-700" aria-hidden />
        <span>Or email directly:</span>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="font-medium text-leaf-700 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = mailto;
        }}
        className="mt-6 space-y-4 rounded-2xl border border-leaf-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wide text-leaf-700/70">
            What&apos;s this about?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {REASONS.map((r) => {
              const Icon = r.icon;
              const active = r.id === reason;
              return (
                <label
                  key={r.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    active
                      ? "border-leaf-500 bg-leaf-50 text-leaf-900"
                      : "border-leaf-200 bg-white text-leaf-800 hover:bg-leaf-50/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.id}
                    checked={active}
                    onChange={() => setReason(r.id)}
                    className="sr-only"
                  />
                  <Icon className="h-4 w-4 flex-none text-leaf-700" aria-hidden />
                  <span>{r.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="message"
            className="block text-xs font-semibold uppercase tracking-wide text-leaf-700/70"
          >
            Your message
          </label>
          <textarea
            id="message"
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What’s on your mind?"
            className="mt-1 w-full rounded-lg border border-leaf-200 bg-white px-3 py-2 text-sm text-leaf-900 placeholder:text-leaf-700/40 focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/30"
          />
          <p className="mt-1 text-[11px] text-leaf-700/60">
            Submitting opens your email app with the message ready to send.
            Nothing is stored on this page.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/planner"
            className="text-sm text-leaf-700 hover:text-leaf-900 hover:underline"
          >
            Back to the planner
          </Link>
          <button
            type="submit"
            disabled={body.trim().length === 0}
            className="inline-flex items-center gap-1.5 rounded-md bg-leaf-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Open in email app
          </button>
        </div>
      </form>

      <p className="mt-6 text-xs text-leaf-700/60">
        Curious how your data is handled?{" "}
        <Link href="/privacy" className="underline hover:text-leaf-900">
          Read the privacy policy
        </Link>
        .
      </p>
    </main>
  );
}
