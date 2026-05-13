"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { usePlanner } from "@/lib/store";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STARTER_QUESTIONS = [
  "I'm brand new — where do I start?",
  "What soil mix should I use in a raised bed?",
  "What grows well together?",
  "How often should I water?",
];

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm **JoeBee** 🐝 — your gardening buddy. I'll help you set up a thriving raised bed, even if this is your first time. Ask me anything: soil mixes, what to plant when, watering, pests, you name it.",
};

export function ChatAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bed = usePlanner((s) => s.bed);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Close on Escape, and when clicking/tapping anywhere outside the panel.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointer(e: PointerEvent) {
      const panel = panelRef.current;
      if (!panel) return;
      const target = e.target as Node | null;
      if (target && !panel.contains(target)) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    // Use pointerdown so the dismiss fires before any click handlers on the
    // page, and capture so we hear it before stopPropagation in children.
    window.addEventListener("pointerdown", onPointer, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer, true);
    };
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setStreaming(true);

    // Add placeholder for the assistant message.
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next,
          context: {
            width: bed.width,
            height: bed.height,
            conditions: bed.conditions,
            plantedIds: bed.plants.map((p) => p.plantId),
          },
        }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text();
        setError(errText || `Request failed (${res.status})`);
        setMessages((m) => m.slice(0, -1));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  }

  // Hide the assistant entirely on the printable garden sheet.
  if (pathname?.startsWith("/planner/print")) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          onMouseEnter={() => {
            const v = videoRef.current;
            if (!v) return;
            v.currentTime = 0;
            v.play().catch(() => {});
          }}
          onMouseLeave={() => {
            const v = videoRef.current;
            if (!v) return;
            v.pause();
            v.currentTime = 0;
          }}
          onFocus={() => {
            const v = videoRef.current;
            if (!v) return;
            v.currentTime = 0;
            v.play().catch(() => {});
          }}
          onBlur={() => {
            const v = videoRef.current;
            if (!v) return;
            v.pause();
            v.currentTime = 0;
          }}
          aria-label="Open JoeBee assistant"
          className="group fixed bottom-3 left-3 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-amber-200 via-amber-300 to-yellow-400 p-0.5 pr-1.5 text-amber-950 opacity-90 shadow-lg ring-1 ring-amber-500/40 transition hover:scale-105 hover:opacity-100 hover:shadow-xl sm:bottom-4 sm:left-4 sm:gap-2 sm:py-1 sm:pl-1 sm:pr-3"
        >
          <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white shadow-inner ring-1 ring-amber-400 sm:h-10 sm:w-10">
            <video
              ref={videoRef}
              src="/JOEBEE.mp4"
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden
              className="absolute inset-0 h-full w-full scale-125 object-cover object-center"
            />
          </span>
          {/* Mobile-only chat indicator badge */}
          <span
            aria-hidden
            className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-leaf-600 text-white shadow ring-2 ring-white sm:hidden"
          >
            <MessageCircle className="h-2.5 w-2.5" fill="currentColor" />
          </span>
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="text-[9px] font-semibold uppercase tracking-wide text-amber-800/80">
              Ask
            </span>
            <span className="text-sm font-bold">JoeBee</span>
          </span>
        </button>
      )}

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="JoeBee assistant"
          className="fixed bottom-20 right-3 left-3 z-40 flex h-[min(70vh,560px)] flex-col overflow-hidden rounded-2xl border border-leaf-200 bg-white shadow-2xl sm:right-auto sm:left-5 sm:w-[min(92vw,380px)]"
        >
          <header className="flex items-center gap-2 border-b border-leaf-100 bg-leaf-50 px-3 py-2">
            <span className="relative flex h-8 w-8 overflow-hidden rounded-full bg-white ring-1 ring-amber-300">
              <video
                src="/JOEBEE.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden
                className="absolute inset-0 h-full w-full scale-125 object-cover object-center"
              />
            </span>
            <div className="flex flex-1 flex-col leading-tight">
              <span className="text-sm font-semibold text-leaf-900">JoeBee</span>
              <span className="text-[11px] text-leaf-700/70">
                Your beginner-friendly gardening tutor
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close JoeBee assistant"
              className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-leaf-700 hover:bg-leaf-100 hover:text-leaf-900"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-3 py-3"
          >
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {streaming && messages[messages.length - 1]?.content === "" && (
              <div className="flex items-center gap-2 text-xs text-leaf-700/60">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                JoeBee is thinking...
              </div>
            )}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                {error}
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1 border-t border-leaf-100 bg-white px-3 py-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-leaf-200 bg-leaf-50 px-2.5 py-1 text-[11px] text-leaf-800 hover:bg-leaf-100"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 border-t border-leaf-100 p-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask anything about your raised bed..."
              rows={1}
              className="max-h-28 flex-1 resize-none rounded-md border border-leaf-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-leaf-400"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="btn-primary inline-flex h-8 w-8 items-center justify-center rounded-md disabled:opacity-50"
              aria-label="Send"
            >
              {streaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Bubble({ role, content }: { role: ChatMessage["role"]; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs leading-relaxed ${
          isUser
            ? "bg-leaf-600 text-white"
            : "border border-leaf-100 bg-leaf-50 text-leaf-900"
        }`}
      >
        {renderInlineMarkdown(content)}
      </div>
    </div>
  );
}

/** Minimal inline markdown: **bold** and bullet lines starting with "- ". */
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const isBullet = /^\s*[-*]\s+/.test(line);
    const body = isBullet ? line.replace(/^\s*[-*]\s+/, "") : line;
    const parts = body.split(/(\*\*[^*]+\*\*)/g).map((seg, j) => {
      if (seg.startsWith("**") && seg.endsWith("**")) {
        return <strong key={j}>{seg.slice(2, -2)}</strong>;
      }
      return <span key={j}>{seg}</span>;
    });
    return (
      <div key={i} className={isBullet ? "flex gap-1.5" : ""}>
        {isBullet && <span className="select-none">•</span>}
        <span>{parts}</span>
      </div>
    );
  });
}
