// Soft per-browser rate limit for AI layout generations.
// Lives in localStorage; resets each calendar day (local time).

export const GENERATIONS_PER_DAY = 10;
const STORAGE_KEY = "joebees:ai-generations";

interface State {
  day: string;
  count: number;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function read(): State {
  if (typeof window === "undefined") return { day: todayKey(), count: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { day: todayKey(), count: 0 };
    const parsed = JSON.parse(raw) as State;
    if (parsed.day !== todayKey()) return { day: todayKey(), count: 0 };
    return parsed;
  } catch {
    return { day: todayKey(), count: 0 };
  }
}

function write(state: State) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / disabled storage */
  }
}

export function getGenerationsRemaining(): number {
  const { count } = read();
  return Math.max(0, GENERATIONS_PER_DAY - count);
}

/**
 * Increment today's count and return the new remaining value.
 * Call after a successful generation.
 */
export function consumeGeneration(): number {
  const state = read();
  const next: State = { day: state.day, count: state.count + 1 };
  write(next);
  return Math.max(0, GENERATIONS_PER_DAY - next.count);
}
