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
import { formatMoney } from "./currency";
import { lunarRangeCmForDate } from "./lunarRangeTable";
import type { GameState, Player } from "./types";

/** Rounds after a fire (or start) before the first 50% roll. */
export const TIMED_EVENT_GAP_ROUNDS = 5;
/** Chance on the first eligible round after the gap. */
export const TIMED_EVENT_BASE_CHANCE = 0.5;

/** Monolith: one-time cash on next Earth land or pass (per rocket). */
export const MONOLITH_EARTH_BONUS = 300;
/** Captain Harlock hail: fuel top-up per active rocket (capped at maxFuel). */
export const HARLOCK_FUEL_BONUS = 4;
/** Quantum ledger dividend: cash now per active rocket. */
export const LEDGER_DIVIDEND_CASH = 250;
/** Asteroid ice survey: fuel depots added to hand per rocket. */
export const ASTEROID_DEPOTS = 1;

export type TimedEventId =
  | "monolith"
  | "mms_free_break"
  | "kings_quest"
  | "harlock_fuel"
  | "asteroid_depot"
  | "ledger_dividend"
  | "comet_free_leave"
  | "rent_holiday";

/** Human rocket’s 3rd character code.
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

const POOL: TimedEventId[] = [
  "monolith",
  "mms_free_break",
  "kings_quest",
  "harlock_fuel",
  "asteroid_depot",
  "ledger_dividend",
  "comet_free_leave",
  "rent_holiday",
];

function activeRockets(state: GameState): Player[] {
  return state.players.filter((p) => !p.eliminated);
}

/** Remaining pool events not yet fired this charter (each fires at most once). */
function remainingPool(state: GameState): TimedEventId[] {
  const fired = new Set(state.timedEvent.firedIds ?? []);
  return POOL.filter((id) => !fired.has(id));
}

function pickTimedEvent(state: GameState): TimedEventId | null {
  const list = remainingPool(state);
  if (list.length === 0) return null;
  const roll = charterEventRoll01(state);
  const idx = Math.min(list.length - 1, Math.floor(roll * list.length));
  return list[idx]!;
}

function fireMonolith(state: GameState): void {
  const list = activeRockets(state);
  for (const p of list) p.monolithEarthPending = true;
  state.pendingAnnouncement = {
    kind: "info",
    title: "Monolith on Earth's Moon",
    body: [
      "A black slab has been catalogued on the lunar farside.",
      `Every active rocket: one-time ${formatMoney(MONOLITH_EARTH_BONUS)} on your next Earth land or pass.`,
      `(${list.length} charter(s) marked.)`,
    ].join("\n"),
  };
  state.log.push(
    `Charter alert: Monolith — next Earth visit pays +${formatMoney(MONOLITH_EARTH_BONUS)} once per rocket.`,
  );
}

function fireMmsFreeBreak(state: GameState): void {
  const list = activeRockets(state);
  for (const p of list) p.freeBreakPending = true;
  state.pendingAnnouncement = {
    kind: "info",
    title: "Blue and brown M&Ms are back",
    body: [
      "You brought back the blue and brown M&Ms.",
      "Every active rocket gets one free brake on their next turn — if they want it.",
      "Break ≥1 space costs 0 fuel once; unused token expires at end of that seat turn.",
      `(${list.length} rocket(s) stocked.)`,
    ].join("\n"),
  };
  state.log.push(
    "Charter alert: blue & brown M&Ms — one free brake on each rocket's next seat turn.",
  );
}

function fireKingsQuest(state: GameState): void {
  const list = activeRockets(state);
  for (const p of list) p.warpCharges += 1;
  state.pendingAnnouncement = {
    kind: "info",
    title: "King's Quest speed-run record",
    body: [
      "A lonely spacer kills time on an old terminal and sets a new King's Quest record.",
      "Every active rocket: one warp — instead of rolling, click any beacon on the board.",
      "Teleport: no en-route stops, rent, or duels. Landing rules still apply at the destination.",
      `(${list.length} rocket(s) charted.)`,
    ].join("\n"),
  };
  state.log.push(
    "Charter alert: King's Quest — one board-wide warp charge per active rocket (click destination).",
  );
}

/** Space Pirate Captain Harlock — free-enterprise hail from the Arcadia. */
function fireHarlockFuel(state: GameState): void {
  const maxF = state.config.maxFuel;
  const list = activeRockets(state);
  for (const p of list) {
    const before = p.fuel;
    p.fuel = Math.min(maxF, p.fuel + HARLOCK_FUEL_BONUS);
    const gained = p.fuel - before;
    if (gained > 0) {
      // per-rocket log kept light; announcement carries the story
    }
  }
  state.pendingAnnouncement = {
    kind: "info",
    title: "Arcadia on the Mainline",
    body: [
      "Captain Harlock salutes free enterprise — the Arcadia dumps spare tanks for every charter.",
      `Every active rocket: +${HARLOCK_FUEL_BONUS} fuel (capped at tank max ${maxF}).`,
      `(${list.length} rocket(s) topped.)`,
    ].join("\n"),
  };
  state.log.push(
    `Charter alert: Captain Harlock / Arcadia — +${HARLOCK_FUEL_BONUS} fuel per active rocket.`,
  );
}

/** #33 lite — ice survey without board topology change. */
function fireAsteroidDepot(state: GameState): void {
  const list = activeRockets(state);
  for (const p of list) p.stationsInHand += ASTEROID_DEPOTS;
  state.pendingAnnouncement = {
    kind: "info",
    title: "Belt ice survey",
    body: [
      "A survey drone marks a rich carbonaceous rock — freeze-dried tanks for anyone who can claim a pad later.",
      `Every active rocket: +${ASTEROID_DEPOTS} fuel depot in hand.`,
      `(${list.length} rocket(s) stocked.)`,
    ].join("\n"),
  };
  state.log.push(
    `Charter alert: belt ice survey — +${ASTEROID_DEPOTS} depot in hand per active rocket.`,
  );
}

function fireLedgerDividend(state: GameState): void {
  const list = activeRockets(state);
  for (const p of list) p.cash += LEDGER_DIVIDEND_CASH;
  state.pendingAnnouncement = {
    kind: "info",
    title: "Quantum ledger dividend",
    body: [
      "The Automated Interplanetary Asset Ledger pays a rare universal dividend.",
      `Every active rocket: +${formatMoney(LEDGER_DIVIDEND_CASH)} now.`,
      `(${list.length} wallet(s) credited.)`,
    ].join("\n"),
  };
  state.log.push(
    `Charter alert: AIL dividend — +${formatMoney(LEDGER_DIVIDEND_CASH)} per active rocket.`,
  );
}

function fireCometFreeLeave(state: GameState): void {
  const list = activeRockets(state);
  for (const p of list) p.freeLeavePending = true;
  state.pendingAnnouncement = {
    kind: "info",
    title: "Comet dust trail",
    body: [
      "A dirty snowball sheds a trail across the Mainline — outbound burns ride the stream for free once.",
      "Every active rocket: next leave from a gravity well costs 0 fuel (then clears).",
      `(${list.length} rocket(s) marked.)`,
    ].join("\n"),
  };
  state.log.push(
    "Charter alert: comet dust — one free leave burn per active rocket.",
  );
}

function fireRentHoliday(state: GameState): void {
  const list = activeRockets(state);
  for (const p of list) p.nextRentWaived = true;
  state.pendingAnnouncement = {
    kind: "info",
    title: "Port authority holiday",
    body: [
      "Station councils declare a one-claim rent holiday under the free-port compact.",
      "Every active rocket: next rent you would pay is waived (once), then normal rates resume.",
      `(${list.length} rocket(s) stamped.)`,
    ].join("\n"),
  };
  state.log.push(
    "Charter alert: port holiday — next rent payment waived once per active rocket.",
  );
}

function fireTimedEvent(state: GameState, id: TimedEventId): void {
  switch (id) {
    case "monolith":
      fireMonolith(state);
      break;
    case "mms_free_break":
      fireMmsFreeBreak(state);
      break;
    case "kings_quest":
      fireKingsQuest(state);
      break;
    case "harlock_fuel":
      fireHarlockFuel(state);
      break;
    case "asteroid_depot":
      fireAsteroidDepot(state);
      break;
    case "ledger_dividend":
      fireLedgerDividend(state);
      break;
    case "comet_free_leave":
      fireCometFreeLeave(state);
      break;
    case "rent_holiday":
      fireRentHoliday(state);
      break;
    default: {
      const _exhaustive: never = id;
      void _exhaustive;
    }
  }
  state.timedEvent.lastEventId = id;
  if (!state.timedEvent.firedIds) state.timedEvent.firedIds = [];
  if (!state.timedEvent.firedIds.includes(id)) {
    state.timedEvent.firedIds.push(id);
  }
}

/**
 * Called after each seat tick. Only advances the alert cadence when
 * `state.round` has increased (once per full table pass).
 *
 * Cadence (#106): after GAP rounds, roll at 50%; only on a real miss does
 * chance midpoint toward 100%. Open popups skip the roll without burning
 * midpoints. After fire, wait GAP rounds again.
 */
export function processTimedEvents(state: GameState): void {
  const te = state.timedEvent;
  // One cadence step per **round**, not per seat turn
  if (te.lastProcessedRound === state.round) return;
  te.lastProcessedRound = state.round;
  te.roundsSinceLast += 1;

  // Pool exhausted — no more charter alerts this game
  if (remainingPool(state).length === 0) return;

  // Still in post-fire / start gap
  if (te.roundsSinceLast < TIMED_EVENT_GAP_ROUNDS) return;

  // Don't stack alerts; gap still counted above. Do not midpoint without a roll.
  if (state.pendingAnnouncement) return;

  // Enter (or stay in) the roll window
  if (te.rollChance <= 0) {
    te.rollChance = TIMED_EVENT_BASE_CHANCE;
  }

  const roll = charterEventRoll01(state);
  if (roll >= te.rollChance) {
    // Miss — only midpoints after an actual attempt
    te.rollChance = midpointTowardCertain(te.rollChance);
    return;
  }

  const id = pickTimedEvent(state);
  if (!id) return;

  fireTimedEvent(state, id);
  te.roundsSinceLast = 0;
  te.rollChance = 0;
}

/** +1 seat turn (`gameTurn`); may process a **round**-scoped timed event. */
export function tickSeatTurn(state: GameState): void {
  state.gameTurn += 1;
  processTimedEvents(state);
}
