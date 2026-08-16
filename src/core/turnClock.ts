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
import { STATION_HUB_IDS, isStationHub } from "./systems";
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
/** Olbers award cash when warping to a station hub (#107). */
export const OLBERS_AWARD_CASH = 350;
/** Vibe-code kick: first eligible round and one-shot chance (#107). */
export const VIBE_KICK_MIN_ROUND = 60;
export const VIBE_KICK_CHANCE = 0.5;
/** Karen distraction: only after this round (#107). */
export const KAREN_MIN_ROUND = 30;

/** Falcon Heavy payload was a Tesla Roadster (Starman). Not a Model 3/Y/S/X. (#109) */

export type TimedEventId =
  | "monolith"
  | "mms_free_break"
  | "kings_quest"
  | "harlock_fuel"
  | "asteroid_depot"
  | "ledger_dividend"
  | "comet_free_leave"
  | "rent_holiday"
  | "rogue_tesla"
  | "olbers_station"
  | "karen_skip"
  | "blockchain_steal"
  | "strongbad_email";
// vibe_kick is NOT in the regular pool — special one-shot at round ≥60

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
  "rogue_tesla",
  "olbers_station",
  "karen_skip",
  "blockchain_steal",
  "strongbad_email",
];

function activeRockets(state: GameState): Player[] {
  return state.players.filter((p) => !p.eliminated);
}

function pickIndex(state: GameState, n: number, salt = 0): number {
  if (n <= 0) return 0;
  const u = (charterEventRoll01(state) + salt * 0.6180339887) % 1;
  return Math.min(n - 1, Math.floor(u * n));
}

/** Mars orbit (Elon hub + Mars + moons) — immune to rogue Tesla (#107). */
export function isMarsOrbitNode(state: GameState, nodeId: string): boolean {
  const node = state.board.nodes[nodeId];
  return node?.group === "mars";
}

/**
 * Tesla hits only **beyond Mars**: Jupiter + Saturn deeds (#115).
 * Not Mercury/Venus/Earth, not Mars system, not belt blanks.
 */
export const TESLA_TARGET_GROUPS = ["jupiter", "saturn"] as const;

export function isTeslaTargetNode(state: GameState, nodeId: string): boolean {
  const group = state.board.nodes[nodeId]?.group;
  return (
    group === "jupiter" ||
    group === "saturn"
  );
}

/** Owned Jupiter/Saturn deeds Tesla may hit. */
export function teslaTargetClaims(state: GameState): string[] {
  const out: string[] = [];
  for (const [nodeId, ownerId] of Object.entries(state.owners)) {
    if (!ownerId) continue;
    if (!isTeslaTargetNode(state, nodeId)) continue;
    const node = state.board.nodes[nodeId];
    if (!node || (node.kind !== "planet" && node.kind !== "moon" && node.kind !== "federation")) {
      continue;
    }
    if (node.price == null && node.kind !== "federation") continue;
    const owner = state.players.find((p) => p.id === ownerId && !p.eliminated);
    if (!owner) continue;
    out.push(nodeId);
  }
  return out;
}

function stripClaimInline(state: GameState, nodeId: string): void {
  delete state.owners[nodeId];
  if (state.stations[nodeId]) delete state.stations[nodeId];
  for (const p of state.players) {
    if (!p.properties.includes(nodeId)) continue;
    p.properties = p.properties.filter((id) => id !== nodeId);
    if (p.ephemerisBodyId === nodeId) {
      p.ephemerisBodyId = p.properties[0] ?? null;
    }
  }
}

function preferredChooser(state: GameState): Player | null {
  const human = state.players.find((p) => p.agent === "human" && !p.eliminated);
  if (human) return human;
  return activeRockets(state)[0] ?? null;
}

/** Opponent claims for blockchain steal. */
export function stealableClaims(state: GameState, chooserId: string): string[] {
  return Object.entries(state.owners)
    .filter(([nodeId, ownerId]) => {
      if (!ownerId || ownerId === chooserId) return false;
      const owner = state.players.find((p) => p.id === ownerId && !p.eliminated);
      if (!owner) return false;
      const node = state.board.nodes[nodeId];
      return !!node && node.price != null;
    })
    .map(([id]) => id);
}

/** Remaining pool events not yet fired this charter (each fires at most once). */
function remainingPool(state: GameState): TimedEventId[] {
  const fired = new Set(state.timedEvent.firedIds ?? []);
  return POOL.filter((id) => {
    if (fired.has(id)) return false;
    // Late-game only: Karen
    if (id === "karen_skip" && state.round < KAREN_MIN_ROUND) return false;
    // Tesla needs an owned Jupiter/Saturn claim (#115)
    if (id === "rogue_tesla" && teslaTargetClaims(state).length === 0) return false;
    // Blockchain needs an opponent claim
    if (id === "blockchain_steal") {
      const chooser = preferredChooser(state);
      if (!chooser || stealableClaims(state, chooser.id).length === 0) return false;
    }
    // Olbers always possible (station hubs exist)
    return true;
  });
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

/** Homestar Runner: Strong Bad answers your email → Warp. */
function fireStrongBadEmail(state: GameState): void {
  const list = activeRockets(state);
  for (const p of list) p.warpCharges += 1;
  state.pendingAnnouncement = {
    kind: "info",
    title: "Strong Bad answers your email",
    body: [
      "You emailed Strong Bad from a deep-space relay. He typed one word and hit send.",
      "WARP.",
      "Every active rocket: one board-wide warp (click any beacon instead of rolling). No en-route stops; landing rules still apply.",
      `(${list.length} rocket(s) got the email.)`,
    ].join("\n"),
  };
  state.log.push(
    "Charter alert: Strong Bad Email — WARP — one board-wide warp charge per active rocket.",
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

/** #107 / #109 / #115 — Roadster; Jupiter+Saturn only (not Mars, not inner). */
function fireRogueTesla(state: GameState): void {
  const targets = teslaTargetClaims(state);
  if (targets.length === 0) return;
  // Separate mixer from the event-pick roll so the same 01 is not reused.
  const nodeId = targets[pickIndex(state, targets.length, 1)]!;
  const node = state.board.nodes[nodeId]!;
  const ownerId = state.owners[nodeId]!;
  const owner = state.players.find((p) => p.id === ownerId)!;
  const hadDepot = !!state.stations[nodeId];
  stripClaimInline(state, nodeId);
  state.pendingAnnouncement = {
    kind: "info",
    title: "Rogue Tesla Roadster",
    body: [
      `A derelict Tesla Roadster dropped out of a long-transfer orbit and hit ${node.name}.`,
      `${owner.name}'s claim is gone${hadDepot ? " — fuel depot destroyed" : ""}.`,
      "(Beyond Mars only. Elon's car will not hit Elon — Mars orbit is immune.)",
    ].join("\n"),
  };
  state.log.push(
    `Charter alert: rogue Tesla Roadster destroyed ${owner.name}'s claim on ${node.name}${hadDepot ? " (depot lost)" : ""}.`,
  );
}

function fireOlbersStation(state: GameState): void {
  const chooser = preferredChooser(state);
  if (!chooser) return;
  state.pendingCharterChoice = {
    kind: "olbers_station",
    chooserId: chooser.id,
  };
  state.pendingAnnouncement = {
    kind: "info",
    title: "Olbers' paradox, Netflix optional",
    body: [
      "During a streaming outage you accidentally prove Olbers' paradox with a napkin and a star map.",
      `Award: warp to any station hub (Elon · Holst · Daktulios — not Earth) and collect ${formatMoney(OLBERS_AWARD_CASH)}.`,
      chooser.agent === "human"
        ? "Dismiss this, then click a station hub on the board."
        : `${chooser.name} will chart a hub.`,
    ].join("\n"),
  };
  state.log.push(
    `Charter alert: Olbers award — ${chooser.name} may warp to a station hub for ${formatMoney(OLBERS_AWARD_CASH)}.`,
  );
}

function fireKarenSkip(state: GameState): void {
  const list = activeRockets(state);
  if (list.length === 0) return;
  const victim = list[pickIndex(state, list.length)]!;
  victim.skipTurns += 1;
  state.pendingAnnouncement = {
    kind: "info",
    title: "Karen in the comments",
    body: [
      "Someone named Karen left a novel-length social-media essay under your last telemetry selfie.",
      `${victim.name} misses a critical ship maneuver — lose one full seat turn.`,
    ].join("\n"),
  };
  state.log.push(
    `Charter alert: Karen distraction — ${victim.name} will skip a turn.`,
  );
}

function fireBlockchainSteal(state: GameState): void {
  const chooser = preferredChooser(state);
  if (!chooser) return;
  if (stealableClaims(state, chooser.id).length === 0) return;
  state.pendingCharterChoice = {
    kind: "blockchain_steal",
    chooserId: chooser.id,
  };
  state.pendingAnnouncement = {
    kind: "info",
    title: "Invalid claim on the ledger",
    body: [
      "You read the AIL chain and prove an opponent's deed hash never finalised.",
      "The ledger reassigns the body to you — with a fuel depot already bolted down.",
      chooser.agent === "human"
        ? "Dismiss this, then click an opponent's claim on the board."
        : `${chooser.name} will reassign a deed.`,
    ].join("\n"),
  };
  state.log.push(
    `Charter alert: blockchain reassignment — ${chooser.name} steals one opponent claim + depot.`,
  );
}

/** Rare: one 50% roll when the charter first hits round ≥60 (#107). */
function fireVibeKick(state: GameState): void {
  const chooser = preferredChooser(state);
  if (!chooser) return;
  const victims = activeRockets(state).filter(
    (p) => p.id !== chooser.id && p.agent === "ai",
  );
  // Full AI field: any other rocket
  const targets =
    victims.length > 0
      ? victims
      : activeRockets(state).filter((p) => p.id !== chooser.id);
  if (targets.length === 0) return;

  state.pendingCharterChoice = {
    kind: "vibe_kick",
    chooserId: chooser.id,
  };
  state.pendingAnnouncement = {
    kind: "info",
    title: "You vibe-coded the rules",
    body: [
      "You shipped a video game about monopoly in space. Congrats — you write the patch notes now.",
      "Kick one rival rocket out of this charter.",
      chooser.agent === "human"
        ? "Dismiss this, then click an AI rocket in Charter standings."
        : `${chooser.name} will uninvite a rival.`,
    ].join("\n"),
  };
  state.log.push(
    `Charter alert: vibe-code authority — ${chooser.name} may eliminate one rival.`,
  );
  // Mark as fired via special id in firedIds
  if (!state.timedEvent.firedIds.includes("vibe_kick")) {
    state.timedEvent.firedIds.push("vibe_kick");
  }
  state.timedEvent.lastEventId = "vibe_kick";
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
    case "strongbad_email":
      fireStrongBadEmail(state);
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
    case "rogue_tesla":
      fireRogueTesla(state);
      break;
    case "olbers_station":
      fireOlbersStation(state);
      break;
    case "karen_skip":
      fireKarenSkip(state);
      break;
    case "blockchain_steal":
      fireBlockchainSteal(state);
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
  if (te.vibeKickChecked === undefined) te.vibeKickChecked = false;

  // One cadence step per **round**, not per seat turn
  if (te.lastProcessedRound === state.round) return;
  te.lastProcessedRound = state.round;
  te.roundsSinceLast += 1;

  // Open popup or pending pick — count gap time only
  if (state.pendingAnnouncement || state.pendingCharterChoice) return;

  // Rare one-shot: vibe-code kick at round ≥60, 50% once (#107)
  if (
    !te.vibeKickChecked &&
    state.round >= VIBE_KICK_MIN_ROUND &&
    !(te.firedIds ?? []).includes("vibe_kick")
  ) {
    te.vibeKickChecked = true;
    if (charterEventRoll01(state) < VIBE_KICK_CHANCE) {
      fireVibeKick(state);
      te.roundsSinceLast = 0;
      te.rollChance = 0;
      return;
    }
    state.log.push(
      `Charter note: vibe-code authority did not unlock (round ${state.round}, 50% miss).`,
    );
  }

  // Pool exhausted — no more regular charter alerts
  if (remainingPool(state).length === 0) return;

  // Still in post-fire / start gap
  if (te.roundsSinceLast < TIMED_EVENT_GAP_ROUNDS) return;

  // Enter (or stay in) the roll window
  if (te.rollChance <= 0) {
    te.rollChance = TIMED_EVENT_BASE_CHANCE;
  }

  const roll = charterEventRoll01(state);
  if (roll >= te.rollChance) {
    te.rollChance = midpointTowardCertain(te.rollChance);
    return;
  }

  const id = pickTimedEvent(state);
  if (!id) return;

  fireTimedEvent(state, id);
  te.roundsSinceLast = 0;
  te.rollChance = 0;
}

/** Station hub ids for Olbers pick (not Earth). */
export function olbersStationIds(): readonly string[] {
  return STATION_HUB_IDS;
}

export function isOlbersStation(nodeId: string): boolean {
  return isStationHub(nodeId);
}

/** +1 seat turn (`gameTurn`); may process a **round**-scoped timed event. */
export function tickSeatTurn(state: GameState): void {
  state.gameTurn += 1;
  processTimedEvents(state);
}
