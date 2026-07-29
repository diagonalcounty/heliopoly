/**
 * Shared charter clocks + timed charter alerts.
 *
 * ## Time vocabulary (locked)
 * - **Turn** — one rocket’s seat: roll (or skip/park) through end turn. `gameTurn` counts these.
 * - **Round** — every seat has had a turn (wrap of the player order). `state.round`.
 * - **Rotation** — one rocket completes a full board circuit (leave Earth → return). Personal; also `boardRotations` totals.
 *
 * Charter alerts fire on **round** boundaries, not every seat turn.
 * RNG: third letter of human rocket × USNO→Apollo-11 range cm (daily table).
 */
import { GITHUB_REPO_URL } from "./links";
import { lunarRangeCmForDate } from "./lunarRangeTable";
import type { GameState } from "./types";

/** Rounds after a fire (or start) before the first 50% roll. */
export const TIMED_EVENT_GAP_ROUNDS = 5;
/** Chance on the first eligible round after the gap. */
export const TIMED_EVENT_BASE_CHANCE = 0.5;

/**
 * Human rocket’s 3rd character code.
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
  return any?.name ?? "Venture";
}

/**
 * Seed material: thirdLetter × lunar range cm (table), mixed with round + rngState.
 */
export function charterEventRoll01(state: GameState, at: Date = new Date()): number {
  const letter = thirdLetterCode(charterRocketName(state));
  const rangeCm = lunarRangeCmForDate(at);
  const mixed =
    Math.imul(letter | 0, (rangeCm % 2147483647) | 0) +
    Math.imul(state.round | 0, 9973) +
    Math.imul(state.gameTurn | 0, 131) +
    (state.rngState | 0);
  let s = mixed | 0;
  s = (Math.imul(s ^ (s >>> 16), 2246822507) | 0) ^ state.round;
  s = Math.imul(s ^ (s >>> 13), 3266489909) | 0;
  s = (s ^ (s >>> 16)) >>> 0;
  if (s === 0) s = 1;
  let x = s | 0;
  x = (Math.imul(x, 1664525) + 1013904223) | 0;
  return (x >>> 0) / 4294967296;
}

/**
 * Next chance after a miss: halfway from current toward 100%.
 * e.g. 50% → 75% → 87.5% → …
 */
export function midpointTowardCertain(currentChance: number): number {
  const c = Math.min(1, Math.max(0, currentChance));
  return c + (1 - c) / 2;
}

function fireFutureTeaser(state: GameState): void {
  state.pendingAnnouncement = {
    kind: "info",
    title: "Something exciting will happen here in a future version",
    body: `Help shape what that is — open an issue or PR on GitHub:\n${GITHUB_REPO_URL}`,
  };
  state.log.push(
    `Charter alert: future content teaser — ${GITHUB_REPO_URL}`,
  );
}

/**
 * Called after each seat tick. Only advances the alert cadence when
 * `state.round` has increased (once per full table pass).
 */
export function processTimedEvents(state: GameState): void {
  const te = state.timedEvent;
  // One cadence step per **round**, not per seat turn
  if (te.lastProcessedRound === state.round) return;
  te.lastProcessedRound = state.round;
  te.roundsSinceLast += 1;

  // Count the round even if another popup is open; don't stack alerts
  if (state.pendingAnnouncement) return;

  if (te.roundsSinceLast < TIMED_EVENT_GAP_ROUNDS) return;

  if (te.roundsSinceLast === TIMED_EVENT_GAP_ROUNDS) {
    te.rollChance = TIMED_EVENT_BASE_CHANCE;
  } else {
    // Missed earlier in this window — halfway from current % toward 100%
    te.rollChance = midpointTowardCertain(
      te.rollChance > 0 ? te.rollChance : TIMED_EVENT_BASE_CHANCE,
    );
  }

  const roll = charterEventRoll01(state);
  if (roll >= te.rollChance) {
    // Miss — stay in window; next round midpoints again
    return;
  }

  fireFutureTeaser(state);
  te.roundsSinceLast = 0;
  te.rollChance = 0;
}

/** +1 seat turn (`gameTurn`); may process a **round**-scoped timed event. */
export function tickSeatTurn(state: GameState): void {
  state.gameTurn += 1;
  processTimedEvents(state);
}
