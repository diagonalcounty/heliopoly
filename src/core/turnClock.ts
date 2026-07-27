/**
 * Shared charter clock: one tick per pilot *seat turn* (including skips).
 * Timed content runs at seat-turn start, before that pilot’s first movement dice roll.
 *
 * Charter alerts: after 5 seat-turns since last fire (or start), 50% chance;
 * doubles each miss until trigger; then wait 5 again.
 * RNG: third letter of human rocket name × USNO→Apollo-11 range (cm, daily table).
 */
import { lunarRangeCmForDate } from "./lunarRangeTable";
import type { GameState } from "./types";

/** Seat turns after a fire (or game start) before first 50% roll. */
export const TIMED_EVENT_GAP_TURNS = 5;
/** Chance on first eligible turn after the gap. */
export const TIMED_EVENT_BASE_CHANCE = 0.5;

/**
 * Human rocket’s 3rd character code (1-based letter position in name).
 * Short names fall back to first printable char or 67 ('C').
 */
export function thirdLetterCode(rocketName: string): number {
  const t = rocketName.trim();
  if (t.length >= 3) return t.charCodeAt(2);
  if (t.length >= 1) return t.charCodeAt(0);
  return 67;
}

/** Human rocket name if seated; else lead AI / Captain. */
export function charterRocketName(state: GameState): string {
  const human = state.players.find((p) => p.agent === "human" && !p.eliminated);
  if (human) return human.name;
  const any = state.players.find((p) => !p.eliminated) ?? state.players[0];
  return any?.name ?? "Captain";
}

/**
 * Seed material: thirdLetter × lunar range cm (table), mixed with turn + rngState.
 * Range = generic-year daily distance USNO→Apollo 11 reflector proxy (cm).
 */
export function charterEventRoll01(state: GameState, at: Date = new Date()): number {
  const letter = thirdLetterCode(charterRocketName(state));
  const rangeCm = lunarRangeCmForDate(at);
  // Keep in 32-bit space; rangeCm ~ 3.6e10
  const mixed =
    Math.imul(letter | 0, (rangeCm % 2147483647) | 0) +
    Math.imul(state.gameTurn | 0, 9973) +
    (state.rngState | 0);
  let s = mixed | 0;
  s = (Math.imul(s ^ (s >>> 16), 2246822507) | 0) ^ state.gameTurn;
  s = Math.imul(s ^ (s >>> 13), 3266489909) | 0;
  s = (s ^ (s >>> 16)) >>> 0;
  if (s === 0) s = 1;
  // Mulberry-ish unit interval without mutating game rngState (event stream separate)
  let x = s | 0;
  x = (Math.imul(x, 1664525) + 1013904223) | 0;
  return (x >>> 0) / 4294967296;
}

/** Chance after `turnsSinceLast` seat turns since last trigger/start. 0 if still in gap. */
export function timedEventChance(turnsSinceLast: number): number {
  if (turnsSinceLast < TIMED_EVENT_GAP_TURNS) return 0;
  const exp = turnsSinceLast - TIMED_EVENT_GAP_TURNS; // 0 → 50%, 1 → 100%, …
  return Math.min(1, TIMED_EVENT_BASE_CHANCE * 2 ** exp);
}

function fireFutureTeaser(state: GameState): void {
  state.pendingAnnouncement = {
    kind: "info",
    title: "Something exciting will happen here in a future version",
    body: "To help shape what that is, keep an eye on when the game's GitHub repo becomes public.",
  };
  state.log.push(
    "Charter alert: future content teaser — watch for a public GitHub repo.",
  );
}

/**
 * Called immediately after `gameTurn` increments, before Roll (or skip resolution).
 */
export function processTimedEvents(state: GameState): void {
  if (state.pendingAnnouncement) return;

  state.timedEvent.turnsSinceLast += 1;
  const n = state.timedEvent.turnsSinceLast;
  const chance = timedEventChance(n);
  if (chance <= 0) return;

  const roll = charterEventRoll01(state);
  if (roll >= chance) {
    // Miss — chance doubles next seat turn until hit (silent; avoid log spam)
    return;
  }

  fireFutureTeaser(state);
  state.timedEvent.turnsSinceLast = 0;
}

/** +1 seat turn and run timed events (before dice). */
export function tickSeatTurn(state: GameState): void {
  state.gameTurn += 1;
  processTimedEvents(state);
}
