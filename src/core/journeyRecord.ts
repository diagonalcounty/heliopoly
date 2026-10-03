/**
 * Journey win record (#342): local-device tally of games the human has
 * beaten, each tagged with the player count and expedition (AI difficulty)
 * for that round. Selfplay (no human seat) and resignation never record.
 */
import type { AiDifficulty } from "./types";

export const JOURNEY_WINS_KEY = "heliopoly-journey-wins";

export interface JourneyWin {
  playerCount: number;
  difficulty: AiDifficulty;
}

function isAiDifficulty(v: unknown): v is AiDifficulty {
  return v === "easy" || v === "normal" || v === "hard" || v === "expert";
}

function isJourneyWin(v: unknown): v is JourneyWin {
  if (!v || typeof v !== "object") return false;
  const w = v as Record<string, unknown>;
  return typeof w.playerCount === "number" && isAiDifficulty(w.difficulty);
}

/** Wins recorded so far. Missing/corrupt storage reads as no wins. */
export function loadJourneyWins(
  storage: Pick<Storage, "getItem"> | null,
): JourneyWin[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(JOURNEY_WINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isJourneyWin) : [];
  } catch {
    return [];
  }
}

/** Append one win and persist. Returns the updated list (for the counter). */
export function recordJourneyWin(
  storage: Pick<Storage, "getItem" | "setItem"> | null,
  win: JourneyWin,
): JourneyWin[] {
  const wins = [...loadJourneyWins(storage), win];
  try {
    storage?.setItem(JOURNEY_WINS_KEY, JSON.stringify(wins));
  } catch {
    // Storage full/unavailable: keep the in-memory count for this session.
  }
  return wins;
}
