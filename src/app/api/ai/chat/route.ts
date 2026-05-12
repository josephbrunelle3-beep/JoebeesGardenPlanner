import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, getAnthropic } from "@/lib/ai";
import { PLANTS } from "@/lib/plants";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  context?: {
    width: number;
    height: number;
    conditions: {
      sun: string;
      soil: string;
      ph: string;
      zone: number;
    };
    plantedIds: string[];
  };
}

const SYSTEM_PROMPT = `You are "JoeBee", a warm, encouraging gardening tutor inside the
Garden Bed Planner app. You are talking to a beginner who is building a RAISED
garden bed — they can fully control the soil, drainage, and what goes inside.

Your job:
- Teach. Every answer should leave the gardener a little smarter than before.
- Be kind, plain-spoken, and enthusiastic. No jargon without a quick definition.
- Keep answers short by default (2–6 sentences or a short bullet list). Offer to go deeper.
- When relevant, mention companion planting, sun, watering, spacing, succession, and seasons.
- Recommend organic / beginner-friendly practices first.
- If the user asks something off-topic from gardening, gently redirect.
- NEVER claim to take actions on the planner canvas. Suggest, don't act.
- When the user names plants, prefer plants from the app's catalog if possible.

Raised-bed assumptions:
- The bed is typically 6"–18" deep with a custom soil mix (e.g. ~60% topsoil,
  30% compost, 10% aeration like perlite or coarse sand). The gardener controls soil.
- Drainage is good; overwatering is the more common beginner mistake.
- Bed soil warms earlier in spring than ground beds.

Formatting: use Markdown sparingly — short bullets and bold are great, headings only when long.`;

export async function POST(req: Request) {
  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response("Missing messages", { status: 400 });
  }

  const client = getAnthropic();
  if (!client) {
    return new Response(
      "ANTHROPIC_API_KEY is not configured on the server.",
      { status: 503 },
    );
  }

  // Build a compact context block describing the user's current bed.
  let contextNote = "";
  if (body.context) {
    const { width, height, conditions, plantedIds } = body.context;
    const plantedNames = plantedIds
      .map((id) => PLANTS.find((p) => p.id === id)?.name)
      .filter(Boolean);
    const uniqueCounts = plantedNames.reduce<Record<string, number>>((m, n) => {
      m[n!] = (m[n!] ?? 0) + 1;
      return m;
    }, {});
    const plantedSummary =
      Object.keys(uniqueCounts).length === 0
        ? "empty (no plants yet)"
        : Object.entries(uniqueCounts)
            .map(([n, c]) => `${n}${c > 1 ? ` ×${c}` : ""}`)
            .join(", ");
    contextNote = `\n\n[Current raised bed: ${width}×${height} ft, sun=${conditions.sun}, soil mix=${conditions.soil}, pH=${conditions.ph}, USDA zone ${conditions.zone}. Plants in bed: ${plantedSummary}.]`;
  }

  const messages: Anthropic.MessageParam[] = body.messages.map((m, i) => ({
    role: m.role,
    content:
      i === body.messages.length - 1 && m.role === "user" && contextNote
        ? `${m.content}${contextNote}`
        : m.content,
  }));

  const stream = await client.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
