import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null | undefined;

export function getAnthropic(): Anthropic | null {
  if (_client !== undefined) return _client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    _client = null;
    return null;
  }
  _client = new Anthropic({ apiKey: key });
  return _client;
}

export const CLAUDE_MODEL = "claude-sonnet-4-5";

/**
 * Strip Markdown / commentary around a JSON blob so we can JSON.parse it.
 */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("AI response did not contain JSON.");
  }
  return JSON.parse(body.slice(start, end + 1));
}
