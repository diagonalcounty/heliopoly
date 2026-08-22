/**
 * Shared charter clocks + timed charter alerts.
 *
 * ## Time vocabulary (locked)
 * - **Turn** — one rocket’s seat: roll (or skip/park) through end turn. `gameTurn` counts these.
 * - **Round** — every seat has had a turn (wrap of the player order). `state.round`.
 * - **Rotation** — one rocket completes a full board circuit (leave Earth → return). Personal; also `boardRotations` totals.
 *
 * Pool alerts fire on **round** boundaries, not every seat turn.
 * Kostka is a separate Earth-landing clock (not in the pool).
 * RNG: third letter of human rocket × USNO→Apollo-11 range cm (daily table).
 */
import { closeClaimBook } from "./claimLedger";
import { formatMoney } from "./currency";
import { lunarRangeCmForDate } from "./lunarRangeTable";
import { STATION_HUB_IDS, isStationHub } from "./systems";
import type { GameState, Player } from "./types";

function easyTable(state: GameState): boolean {
  return state.config.aiDifficulty === "easy";
}

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
/** Hot mic: cash fine + skip (#135). */
export const DISNEY_ROYALTY_CASH = 50;
/** Error 47 fuel dump (#135). */
export const ERROR47_FUEL = 2;
/** Kostka adoption bounty on Earth (#135). Own clock, not the round pool. */
export const KOSTKA_CASH = 200;
/** Table-wide Earth transits (land or pass) before the landing window opens. */
export const KOSTKA_TRANSIT_GAP = 5;
/** First Earth landing after the gap. */
export const KOSTKA_BASE_CHANCE = 0.3;
/** Added on each later Earth landing miss. */
export const KOSTKA_CHANCE_STEP = 0.1;

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
  | "strongbad_email"
  | "disney_royalties"
  | "tuesday_boy"
  | "error_47";
// vibe_kick is NOT in the regular pool — special one-shot at round ≥60
// kostka_dog is NOT in the regular pool — Earth-transit clock, then landings

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
export function charterEventRoll01(
  state: GameState,
  at: Date = new Date(),
  salt = 0,
): number {
  const letter = thirdLetterCode(charterRocketName(state));
  const rangeCm = lunarRangeCmForDate(at);
  const mixed =
    Math.imul(letter | 0, (rangeCm % 2147483647) | 0) +
    Math.imul(state.round | 0, 9973) +
    Math.imul(state.gameTurn | 0, 131) +
    Math.imul(salt | 0, 7919) +
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
  "disney_royalties",
  "tuesday_boy",
  "error_47",
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
 * Tesla hits only **beyond Mars** planetoids (#115).
 * Stations (Holst / Daktulios / Elon) move out of the way.
 * Fuel depots on moons/planets cannot.
 */
export const TESLA_TARGET_GROUPS = ["jupiter", "saturn"] as const;

export function isTeslaTargetNode(state: GameState, nodeId: string): boolean {
  if (isStationHub(nodeId)) return false;
  const group = state.board.nodes[nodeId]?.group;
  return group === "jupiter" || group === "saturn";
}

/** Owned Jupiter/Saturn deeds Tesla may hit. */
export function teslaTargetClaims(state: GameState): string[] {
  const out: string[] = [];
  for (const [nodeId, ownerId] of Object.entries(state.owners)) {
    if (!ownerId) continue;
    if (!isTeslaTargetNode(state, nodeId)) continue;
    const node = state.board.nodes[nodeId];
    if (!node || (node.kind !== "planet" && node.kind !== "moon")) {
      continue;
    }
    if (node.price == null) continue;
    const owner = state.players.find((p) => p.id === ownerId && !p.eliminated);
    if (!owner) continue;
    // Easy: Tesla may only hurt AI seats
    if (easyTable(state) && owner.agent === "human") continue;
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
    closeClaimBook(p, nodeId);
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

/** Prize card: one random living rocket this round — never “lead seat.” */
export function prizeRocket(state: GameState): Player | null {
  const list = activeRockets(state);
  if (list.length === 0) return null;
  return list[pickIndex(state, list.length, 3)]!;
}

/** Hazard card: one rocket; Easy never picks the human. */
function hazardRocket(state: GameState): Player | null {
  let list = activeRockets(state);
  if (easyTable(state)) list = list.filter((p) => p.agent === "ai");
  if (list.length === 0) return null;
  return list[pickIndex(state, list.length)]!;
}

function youOrName(p: Player, youLine: string, theyLine: string): string {
  return p.agent === "human" ? youLine : theyLine;
}

/** Opponent claims for blockchain steal. */
export function stealableClaims(state: GameState, chooserId: string): string[] {
  return Object.entries(state.owners)
    .filter(([nodeId, ownerId]) => {
      if (!ownerId || ownerId === chooserId) return false;
      const owner = state.players.find((p) => p.id === ownerId && !p.eliminated);
      if (!owner) return false;
      // Easy: rivals cannot steal the human's deeds
      if (easyTable(state) && owner.agent === "human") return false;
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
    // Late-game only: Karen. Easy: only if an AI can take the skip.
    if (id === "karen_skip") {
      if (state.round < KAREN_MIN_ROUND) return false;
      if (
        easyTable(state) &&
        !activeRockets(state).some((p) => p.agent === "ai")
      ) {
        return false;
      }
    }
    // Tesla needs an owned Jupiter/Saturn claim (#115)
    if (id === "rogue_tesla" && teslaTargetClaims(state).length === 0) return false;
    if (
      (id === "disney_royalties" || id === "error_47") &&
      easyTable(state) &&
      !activeRockets(state).some((p) => p.agent === "ai")
    ) {
      return false;
    }
    // Blockchain needs an opponent claim
    if (id === "blockchain_steal") {
      const ok = activeRockets(state).some(
        (c) => stealableClaims(state, c.id).length > 0,
      );
      if (!ok) return false;
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
      `(${list.length} rocket(s) marked.)`,
    ].join("\n"),
  };
  state.log.push(
    `Ledger event: Monolith — next Earth visit pays +${formatMoney(MONOLITH_EARTH_BONUS)} once per rocket.`,
  );
}

function fireMmsFreeBreak(state: GameState): void {
  const p = prizeRocket(state);
  if (!p) return;
  p.freeBreakPending = true;
  state.pendingAnnouncement = {
    kind: "info",
    title: "Blue and brown M&Ms are back",
    body: [
      youOrName(
        p,
        "You brought back the blue and brown M&Ms.",
        `${p.name} brought back the blue and brown M&Ms.`,
      ),
      "One free brake on their next turn (break ≥1 space costs 0 fuel once; unused expires at end of that seat).",
    ].join("\n"),
  };
  state.log.push(
    `Ledger event: blue & brown M&Ms — ${p.name} gets one free brake.`,
  );
}

function fireKingsQuest(state: GameState): void {
  const p = prizeRocket(state);
  if (!p) return;
  p.warpCharges += 1;
  state.pendingAnnouncement = {
    kind: "info",
    title: "King's Quest speed-run record",
    body: [
      youOrName(
        p,
        "You kill time on an old terminal and set a King's Quest record.",
        `${p.name} kills time on an old terminal and sets a King's Quest record.`,
      ),
      "One warp: instead of rolling, click any beacon. No stops on the way; landing rules still apply where you arrive.",
    ].join("\n"),
  };
  state.log.push(
    `Ledger event: King's Quest — ${p.name} gets one warp charge.`,
  );
}

/** Homestar Runner: Strong Bad answers your email → Warp. */
function fireStrongBadEmail(state: GameState): void {
  const p = prizeRocket(state);
  if (!p) return;
  p.warpCharges += 1;
  state.pendingAnnouncement = {
    kind: "info",
    title: "Strong Bad answers your email",
    body: [
      youOrName(
        p,
        "You emailed Strong Bad from a deep-space relay. He typed one word and hit send.",
        `${p.name} emailed Strong Bad from a deep-space relay. He typed one word and hit send.`,
      ),
      "WARP.",
      "One warp: click any beacon instead of rolling. No stops on the way; landing rules still apply where you arrive.",
    ].join("\n"),
  };
  state.log.push(
    `Ledger event: Strong Bad Email — WARP — ${p.name} gets one warp charge.`,
  );
}

/** Space Pirate Captain Harlock — orbital-economics hail from the Arcadia. */
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
      "Captain Harlock salutes orbital economics — the Arcadia dumps spare tanks for every rocket.",
      `Every active rocket: +${HARLOCK_FUEL_BONUS} fuel (capped at tank max ${maxF}).`,
      `(${list.length} rocket(s) topped.)`,
    ].join("\n"),
  };
  state.log.push(
    `Ledger event: Captain Harlock / Arcadia — +${HARLOCK_FUEL_BONUS} fuel per active rocket.`,
  );
}

/** #33 lite — ice survey without board topology change. */
function fireAsteroidDepot(state: GameState): void {
  const p = prizeRocket(state);
  if (!p) return;
  p.stationsInHand += ASTEROID_DEPOTS;
  state.pendingAnnouncement = {
    kind: "info",
    title: "Belt ice survey",
    body: [
      "A survey drone marks a rich carbonaceous rock.",
      youOrName(
        p,
        `You take +${ASTEROID_DEPOTS} fuel depot in hand.`,
        `${p.name} takes +${ASTEROID_DEPOTS} fuel depot in hand.`,
      ),
    ].join("\n"),
  };
  state.log.push(
    `Ledger event: belt ice survey — ${p.name} +${ASTEROID_DEPOTS} depot in hand.`,
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
    `Ledger event: AIL dividend — +${formatMoney(LEDGER_DIVIDEND_CASH)} per active rocket.`,
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
    "Ledger event: comet dust — one free leave burn per active rocket.",
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
    "Ledger event: port holiday — next rent payment waived once per active rocket.",
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
      `A Tesla Roadster fell out of a long orbit and hit ${node.name}.`,
      `${owner.name} loses the claim${hadDepot ? " — and the fuel depot with it" : ""}.`,
    ].join("\n"),
  };
  state.log.push(
    `Ledger event: rogue Tesla Roadster destroyed ${owner.name}'s claim on ${node.name}${hadDepot ? " (depot lost)" : ""}.`,
  );
}

function fireOlbersStation(state: GameState): void {
  const chooser = prizeRocket(state);
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
    `Ledger event: Olbers award — ${chooser.name} may warp to a station hub for ${formatMoney(OLBERS_AWARD_CASH)}.`,
  );
}

function fireKarenSkip(state: GameState): void {
  let list = activeRockets(state);
  if (easyTable(state)) list = list.filter((p) => p.agent === "ai");
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
    `Ledger event: Karen distraction — ${victim.name} will skip a turn.`,
  );
}

function fireBlockchainSteal(state: GameState): void {
  const candidates = activeRockets(state).filter(
    (p) => stealableClaims(state, p.id).length > 0,
  );
  if (candidates.length === 0) return;
  const chooser = candidates[pickIndex(state, candidates.length, 5)]!;
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
    `Ledger event: blockchain reassignment — ${chooser.name} steals one opponent claim + depot.`,
  );
}

function fireDisneyRoyalties(state: GameState): void {
  const p = hazardRocket(state);
  if (!p) return;
  const fine = Math.min(DISNEY_ROYALTY_CASH, Math.max(0, p.cash));
  p.cash -= fine;
  p.skipTurns += 1;
  state.pendingAnnouncement = {
    kind: "info",
    title: "Hot microphone",
    body: [
      youOrName(
        p,
        "You sing a Disney song. The mic was live.",
        `${p.name} sings a Disney song. The mic was live.`,
      ),
      `Royalties ${formatMoney(fine)}. Miss the next seat turn.`,
    ].join("\n"),
  };
  state.log.push(
    `Ledger event: hot microphone — ${p.name} pays ${formatMoney(fine)} and skips a turn.`,
  );
}

function fireTuesdayBoy(state: GameState): void {
  const p = prizeRocket(state);
  if (!p) return;
  const before = p.parkCount;
  p.parkCount = Math.max(0, p.parkCount - 1);
  state.pendingAnnouncement = {
    kind: "info",
    title: "The Tuesday boy paradox",
    body: [
      youOrName(
        p,
        "You prove the Tuesday boy paradox is 13/27.",
        `${p.name} proves the Tuesday boy paradox is 13/27.`,
      ),
      before > 0
        ? "Park count −1. Feral is one park further away."
        : "Park count is already 0. The proof still stands.",
    ].join("\n"),
  };
  state.log.push(
    `Ledger event: Tuesday boy — ${p.name} park count ${before} → ${p.parkCount}.`,
  );
}

function fireError47(state: GameState): void {
  const p = hazardRocket(state);
  if (!p) return;
  const lost = Math.min(ERROR47_FUEL, p.fuel);
  p.fuel = Math.max(0, p.fuel - ERROR47_FUEL);
  state.pendingAnnouncement = {
    kind: "info",
    title: "Error 47: not an object",
    body: [
      "The terminal prints Error 47: not an object.",
      youOrName(
        p,
        `You dump ${lost} fuel.`,
        `${p.name} dumps ${lost} fuel.`,
      ),
    ].join("\n"),
  };
  state.log.push(
    `Ledger event: Error 47 — ${p.name} loses ${lost} fuel.`,
  );
}

function fireKostka(state: GameState, p: Player): void {
  p.cash += KOSTKA_CASH;
  state.pendingAnnouncement = {
    kind: "info",
    title: "Kostka",
    body: [
      youOrName(
        p,
        `On Earth, you adopt a dog named Kostka. +${formatMoney(KOSTKA_CASH)}.`,
        `On Earth, ${p.name} adopts a dog named Kostka. +${formatMoney(KOSTKA_CASH)}.`,
      ),
    ].join("\n"),
  };
  state.log.push(
    `Ledger event: Kostka — ${p.name} +${formatMoney(KOSTKA_CASH)} (Earth).`,
  );
  if (!state.timedEvent.firedIds.includes("kostka_dog")) {
    state.timedEvent.firedIds.push("kostka_dog");
  }
  state.timedEvent.lastEventId = "kostka_dog";
}

/**
 * Count an Earth land or pass. After 5 table-wide transits, each later
 * **landing** rolls Kostka (30%, then +10% per miss). Passes only count.
 * The rocket that just landed is the one who adopts.
 */
export function noteEarthTransit(
  state: GameState,
  p: Player,
  kind: "land" | "pass",
): void {
  const te = state.timedEvent;
  te.earthTransits = (te.earthTransits ?? 0) + 1;
  if (kind !== "land") return;
  tryKostkaOnEarthLanding(state, p);
}

function tryKostkaOnEarthLanding(state: GameState, p: Player): void {
  const te = state.timedEvent;
  if ((te.firedIds ?? []).includes("kostka_dog")) return;
  if ((te.earthTransits ?? 0) <= KOSTKA_TRANSIT_GAP) return;
  if (p.eliminated) return;
  // Don't clobber a leak/gusher card; retry on a later landing without burning chance.
  if (state.pendingAnnouncement) return;
  if (!te.kostkaChance || te.kostkaChance <= 0) {
    te.kostkaChance = KOSTKA_BASE_CHANCE;
  }
  const u = charterEventRoll01(state, new Date(), 17 + (te.earthTransits ?? 0));
  if (u >= te.kostkaChance) {
    te.kostkaChance = Math.min(1, te.kostkaChance + KOSTKA_CHANCE_STEP);
    return;
  }
  fireKostka(state, p);
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
      "Kick one rival rocket off the ledger.",
      chooser.agent === "human"
        ? "Dismiss this, then click an AI rocket in standings."
        : `${chooser.name} will uninvite a rival.`,
    ].join("\n"),
  };
  state.log.push(
    `Ledger event: vibe-code authority — ${chooser.name} may eliminate one rival.`,
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
    case "disney_royalties":
      fireDisneyRoyalties(state);
      break;
    case "tuesday_boy":
      fireTuesdayBoy(state);
      break;
    case "error_47":
      fireError47(state);
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
      `Ledger note: vibe-code authority did not unlock (round ${state.round}, 50% miss).`,
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
