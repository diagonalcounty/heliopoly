import { getNode, isPurchasable } from "./board";
import { formatMoney } from "./currency";
import { gravityClassOf, leaveBurnCost } from "./fuel";
import {
  GUSHER_BONUS,
  isGusherBody,
  pickStrikeHeadline,
  strikeAnnouncementBody,
} from "./isru";
import { stepBackAlong, walkMovePath } from "./path";
import {
  abandonedCharter,
  duelWinSummary,
  lastPilotFlying,
  leadsWithWorth,
} from "./pilotCopy";
import { PROPELLANTS } from "./propellant";
import { reseedForActivePilot } from "./seed";
import {
  cloneState,
  currentPlayer,
  livingPlayers,
} from "./state";
import {
  hasSystemMonopoly,
  stationNetworkRentMult,
  systemOfGroup,
  type SystemId,
} from "./systems";
import { MONOLITH_EARTH_BONUS, tickSeatTurn } from "./turnClock";
import type {
  DuelStance,
  GameState,
  LastRoll,
  LegalActions,
  Player,
  PlayerAction,
} from "./types";

/** Parks before first feral check (inclusive). */
export const PARK_FERAL_THRESHOLD = 5;
/** Chance at parkCount === threshold; each further park closes half the gap to 1 (#92). */
export const PARK_FERAL_BASE_CHANCE = 0.5;

/**
 * Feral chance for a pilot who just parked `parkCount` times (0 if under threshold).
 * Half-gap asymptotic: park 5 → 50%, 6 → 75%, 7 → 87.5%, … never forced to 100% on the next park.
 */
export function parkFeralChance(parkCount: number): number {
  if (parkCount < PARK_FERAL_THRESHOLD) return 0;
  const steps = parkCount - PARK_FERAL_THRESHOLD; // 0 at park 5
  return 1 - PARK_FERAL_BASE_CHANCE ** (steps + 1);
}

export { walkMovePath } from "./path";
export type { MovePath, PathFrame } from "./path";

/** Retain enough lines for marathon 4p charters (UI still shows a recent window). */
export const LOG_RETAIN_MAX = 5000;

function pushLog(state: GameState, msg: string): void {
  state.log.push(msg);
  if (state.log.length > LOG_RETAIN_MAX) {
    state.log.splice(0, state.log.length - LOG_RETAIN_MAX);
  }
}

function delta(state: GameState, line: string): void {
  state.turnDeltas.push(line);
}

function mulberryNext(state: GameState): number {
  let s = state.rngState | 0;
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  state.rngState = s;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function rngInt(state: GameState, min: number, maxInclusive: number): number {
  return min + Math.floor(mulberryNext(state) * (maxInclusive - min + 1));
}

function roll2d6(state: GameState, pilot: Player): LastRoll {
  const crumb = reseedForActivePilot(state, pilot);
  const d1 = rngInt(state, 1, 6);
  const d2 = rngInt(state, 1, 6);
  const total = d1 + d2;
  state.diceTotals.push(total);
  // Engine reseed crumb — developer console only (not player log / #56)
  if (typeof console !== "undefined" && console.debug) {
    console.debug(`↺ ${crumb}`);
  }
  return { d1, d2, total, doubles: d1 === d2 };
}

export function meanDiceTotal(state: GameState): number {
  if (state.diceTotals.length === 0) return 7;
  const sum = state.diceTotals.reduce((a, b) => a + b, 0);
  return sum / state.diceTotals.length;
}

export function netWorth(state: GameState, p: Player): number {
  let deeds = 0;
  for (const id of p.properties) {
    deeds += getNode(state.board, id).price ?? 0;
  }
  const stationsPlaced = p.properties.filter((id) => state.stations[id]).length;
  return p.cash + deeds + stationsPlaced * 500 + p.stationsInHand * 500;
}

export function rankings(
  state: GameState,
): { player: Player; worth: number; rank: number }[] {
  const alive = livingPlayers(state)
    .map((player) => ({ player, worth: netWorth(state, player) }))
    .sort((a, b) => b.worth - a.worth);
  return alive.map((row, i) => ({ ...row, rank: i + 1 }));
}

export function rentDue(state: GameState, nodeId: string, ownerId: string): number {
  const node = getNode(state.board, nodeId);
  const base = node.rent ?? 0;
  const sys = systemOfGroup(node.group);
  const monopoly =
    !!sys && hasSystemMonopoly(state.owners, ownerId, sys.id as SystemId);
  // Full planetary system → rent ×2. Station hubs also scale like railroads.
  const mult = monopoly ? 2 : 1;
  const hubMult = stationNetworkRentMult(state.owners, ownerId, nodeId);
  // Fuel depot (player-built) still bumps rent on planets/moons only in practice
  const depotBonus = state.stations[nodeId] ? 1.5 : 1;
  return Math.floor(base * mult * hubMult * depotBonus);
}

/** Earth GO pay: land 400 / pass 200, each +10 per completed rotation. */
export const EARTH_LAND_BASE = 400;
export const EARTH_PASS_BASE = 200;
export const EARTH_PER_ROTATION = 10;
/** One-time cash when a pilot’s circuitsCompleted hits 10, 20, 30… */
export const EARTH_DECADE_BONUS = 1000;

export function earthVisitPay(base: number, circuitsCompleted: number): number {
  return base + EARTH_PER_ROTATION * Math.max(0, circuitsCompleted);
}

function payEarthVisit(
  state: GameState,
  p: Player,
  kind: "land" | "pass",
): void {
  const base = kind === "land" ? EARTH_LAND_BASE : EARTH_PASS_BASE;
  const amount = earthVisitPay(base, p.circuitsCompleted);
  p.cash += amount;
  const label = kind === "land" ? "lands on" : "passes";
  pushLog(
    state,
    `${p.name} ${label} Earth: +${formatMoney(amount)} (base ${formatMoney(base)} + ${formatMoney(EARTH_PER_ROTATION)}×${p.circuitsCompleted} rotations).`,
  );
  delta(state, `+${formatMoney(amount)} Earth ${kind}`);

  // Timed charter: Monolith — one-time bonus on next Earth land or pass
  if (p.monolithEarthPending) {
    p.monolithEarthPending = false;
    p.cash += MONOLITH_EARTH_BONUS;
    pushLog(
      state,
      `${p.name} claims Monolith stipend on Earth: +${formatMoney(MONOLITH_EARTH_BONUS)}.`,
    );
    delta(state, `+${formatMoney(MONOLITH_EARTH_BONUS)} Monolith`);
  }
}

/**
 * Pilot finished a full board circuit (returned to Earth after leaving).
 * Depot resupply; rotation counter; decade bonus at 10/20/30…
 */
function onCircuitComplete(state: GameState, pilot: Player): void {
  state.boardRotations += 1;
  pilot.circuitActive = false;
  pilot.circuitsCompleted += 1;

  pushLog(
    state,
    `Circuit complete: ${pilot.name} · rotation ${pilot.circuitsCompleted} (board loops ${state.boardRotations}).`,
  );

  if (pilot.circuitsCompleted > 0 && pilot.circuitsCompleted % 10 === 0) {
    pilot.cash += EARTH_DECADE_BONUS;
    pushLog(
      state,
      `${pilot.name} decade charter bonus (rotation ${pilot.circuitsCompleted}): +${formatMoney(EARTH_DECADE_BONUS)}.`,
    );
    delta(state, `+${formatMoney(EARTH_DECADE_BONUS)} decade rotation`);
  }

  const resupply = state.config.stationsEach;
  pilot.stationsInHand += resupply;
  // Next circuit: first planetoid depot is free again (#45 Option C)
  pilot.depotsPlacedThisCircuit = 0;
  pushLog(
    state,
    `${pilot.name} resupplies at Earth: +${resupply} fuel depot(s) in hand (now ${pilot.stationsInHand}).`,
  );
  delta(state, `+${resupply} fuel depots (Earth resupply)`);
}

/** Fraction of body price for 2nd+ depot this circuit (#45). */
export const DEPOT_PLACE_COST_FRACTION = 0.1;

/**
 * Cash cost to place a fuel depot on a planetoid you own.
 * First depot per circuit is free; later ones are 10% of purchase price.
 * Hub stations are not depot sites (planet/moon only).
 */
export function depotPlaceCashCost(
  depotsPlacedThisCircuit: number,
  bodyPrice: number | undefined,
): number {
  if (depotsPlacedThisCircuit <= 0) return 0;
  return Math.floor(Math.max(0, bodyPrice ?? 0) * DEPOT_PLACE_COST_FRACTION);
}

/** Fuel cost to break N spaces: 0.5 per space. */
export function breakFuelCost(spaces: number): number {
  return Math.max(0, spaces) * 0.5;
}

/**
 * Effective break fuel for the current pilot (0 when free-break token is live).
 * Does not consume the token — only `doMove` does.
 */
export function effectiveBreakFuelCost(
  freeBreakPending: boolean,
  spaces: number,
): number {
  if (spaces <= 0) return 0;
  if (freeBreakPending) return 0;
  return breakFuelCost(spaces);
}

function releaseClaimToBank(state: GameState, nodeId: string): void {
  delete state.owners[nodeId];
  if (state.stations[nodeId]) {
    delete state.stations[nodeId];
  }
}

/**
 * No-move seat turn: +1 park (cumulative). At 5+ parks, each claim may go feral
 * (50% at 5, then half remaining gap to 100% each park after — #92).
 */
function applyParkingTick(state: GameState, pilot: Player): void {
  if (pilot.eliminated) return;
  pilot.parkCount += 1;
  const n = pilot.parkCount;
  const chance = parkFeralChance(n);
  pushLog(
    state,
    `${pilot.name} parks (no move) · park count ${n}${
      chance > 0 ? ` · feral risk ${Math.round(chance * 100)}% per claim` : ""
    }.`,
  );
  delta(state, `${pilot.name} park #${n}`);

  if (chance <= 0 || pilot.properties.length === 0) return;

  for (const nodeId of [...pilot.properties]) {
    if (mulberryNext(state) >= chance) {
      const node = getNode(state.board, nodeId);
      pushLog(
        state,
        `${node.name} stays held (${pilot.name} park #${n}, ${Math.round(chance * 100)}% resisted).`,
      );
      continue;
    }
    const node = getNode(state.board, nodeId);
    pilot.properties = pilot.properties.filter((id) => id !== nodeId);
    releaseClaimToBank(state, nodeId);
    pushLog(
      state,
      `${node.name} goes FERAL — ${pilot.name} park #${n} (${Math.round(chance * 100)}%). Depot lost if any.`,
    );
    delta(state, `feral: ${node.name}`);
    if (pilot.ephemerisBodyId === nodeId) {
      pilot.ephemerisBodyId = pilot.properties[0] ?? null;
    }
  }
}

function eliminate(
  state: GameState,
  player: Player,
  reason: string,
): void {
  if (player.eliminated) return;
  player.eliminated = true;
  player.eliminatedOnTurn = state.gameTurn;
  player.eliminatedOnRound = state.round;
  player.eliminatedReason = reason;
  pushLog(
    state,
    `${player.name} eliminated (round ${state.round}, turn ${state.gameTurn}): ${reason}`,
  );
  delta(state, `OUT ${player.name}: ${reason}`);
  // Oregon Trail–style interrupt so the field does not vanish unnoticed
  state.pendingAnnouncement = {
    kind: "out",
    title: "OUT!",
    body: `${player.name} is out of the charter.\n${reason}\nRound ${state.round}.`,
  };
  // Deeds return to bank; fuel depots destroyed
  for (const prop of [...player.properties]) {
    releaseClaimToBank(state, prop);
  }
  player.properties = [];
  player.cash = 0;
  player.ephemerisBodyId = null;
  checkWinner(state);
  if (
    state.phase !== "game_over" &&
    state.players[state.currentPlayerIndex]?.id === player.id
  ) {
    advanceTurn(state);
  }
}

function checkWinner(state: GameState): void {
  const alive = livingPlayers(state);
  if (alive.length === 1) {
    state.winnerId = alive[0].id;
    state.phase = "game_over";
    state.endReason = lastPilotFlying(alive[0]);
    pushLog(state, `Winner: ${alive[0].name}`);
    return;
  }
  if (alive.length === 0) {
    state.phase = "game_over";
    state.endReason = "No survivors among the stars.";
    pushLog(state, "No survivors.");
  }
}

function forceEndByRounds(state: GameState): boolean {
  if (state.config.maxRounds <= 0) return false;
  if (state.round <= state.config.maxRounds) return false;
  const alive = livingPlayers(state);
  if (alive.length === 0) return false;
  alive.sort((a, b) => netWorth(state, b) - netWorth(state, a));
  state.winnerId = alive[0].id;
  state.phase = "game_over";
  const lead = leadsWithWorth(
    alive[0],
    formatMoney(netWorth(state, alive[0])),
  );
  state.endReason = `Charter term ended (round ${state.config.maxRounds}). ${lead}`;
  pushLog(
    state,
    `Round limit: ${alive[0].name} wins on net worth (${formatMoney(netWorth(state, alive[0]))}).`,
  );
  return true;
}

function advanceTurn(state: GameState): void {
  if (state.phase === "game_over") return;
  // Free-break token is "next seat turn only" — expire unused when leaving the seat
  const ending = state.players[state.currentPlayerIndex];
  if (ending?.freeBreakPending) {
    ending.freeBreakPending = false;
  }
  // Preserve turn deltas for UI until next action of new player starts
  const n = state.players.length;
  let idx = state.currentPlayerIndex;
  let guarded = 0;
  do {
    idx = (idx + 1) % n;
    if (idx === 0) state.round += 1;
    guarded++;
  } while (state.players[idx].eliminated && guarded <= n + 1);

  state.currentPlayerIndex = idx;
  state.phase = "await_action";
  state.lastRoll = null;
  state.breakSpaces = 0;
  state.pendingDuel = null;

  if (forceEndByRounds(state)) return;

  // Seat turn begins: clock + timed events *before* first dice roll (or skip)
  tickSeatTurn(state);

  const p = currentPlayer(state);
  if (p.skipTurns > 0) {
    // Skipped seat still consumed a turn tick (already counted above)
    p.skipTurns -= 1;
    p.movedThisTurn = false;
    pushLog(
      state,
      `— Turn ${state.gameTurn} · Round ${state.round}: ${p.name} skips (Gravity Duel forfeit) —`,
    );
    delta(state, `${p.name}: skipped turn`);
    state.turnDeltas = [`${p.name}: skipped turn (duel loss)`];
    applyParkingTick(state, p); // no move → park risk
    advanceTurn(state);
    return;
  }

  p.rolledThisTurn = false;
  p.movedThisTurn = false;
  state.turnDeltas = [];
  pushLog(
    state,
    `— Turn ${state.gameTurn} · Round ${state.round}: ${p.name}'s turn —`,
  );
}

export function refuelInfo(state: GameState): {
  allowed: boolean;
  max: number;
  costPer: number;
} {
  const p = currentPlayer(state);
  if (p.eliminated || state.phase === "game_over" || state.phase === "await_duel") {
    return { allowed: false, max: 0, costPer: 0 };
  }
  const node = getNode(state.board, p.position);
  const room = state.config.maxFuel - p.fuel;
  if (room <= 0) return { allowed: false, max: 0, costPer: 0 };

  if (node.refuel === "free" || node.id === "earth") {
    return { allowed: true, max: room, costPer: 0 };
  }

  if (node.refuel === "paid") {
    const ownerId = state.owners[node.id];
    if (ownerId && ownerId !== p.id) {
      const cost = 50;
      const afford = Math.floor(p.cash / cost);
      return { allowed: afford > 0, max: Math.min(room, afford), costPer: cost };
    }
    const cost = 25;
    const afford = Math.floor(p.cash / cost);
    return {
      allowed: afford > 0 || ownerId === p.id,
      max: ownerId === p.id ? room : Math.min(room, afford),
      costPer: ownerId === p.id ? 0 : cost,
    };
  }

  if (node.refuel === "station") {
    const ownerId = state.owners[node.id];
    const hasStation = !!state.stations[node.id];
    if (ownerId === p.id && hasStation) {
      return { allowed: true, max: room, costPer: 0 };
    }
    if (ownerId && ownerId !== p.id && hasStation) {
      const cost = 40;
      const afford = Math.floor(p.cash / cost);
      return { allowed: afford > 0, max: Math.min(room, afford), costPer: cost };
    }
  }

  return { allowed: false, max: 0, costPer: 0 };
}

export function getLegalActions(state: GameState): LegalActions {
  const empty: LegalActions = {
    refuel: false,
    refuelMax: 0,
    refuelCostPer: 0,
    roll: false,
    move: false,
    maxBreak: 0,
    breakSpaces: 0,
    breakFuelCost: 0,
    buy: false,
    buyPrice: 0,
    sell: false,
    sellNodeId: null,
    sellValue: 0,
    placeStation: false,
    placeStationCost: 0,
    endTurn: false,
    leaveBurnPreview: 0,
    duelStance: false,
    duelRoll: false,
    warp: false,
    setDirection: false,
    moveDirection: "forward",
    directionLocked: true,
    canBidirectional: false,
  };
  if (state.phase === "game_over") return empty;

  const p = currentPlayer(state);
  if (p.eliminated) return empty;

  if (state.phase === "await_duel" && state.pendingDuel) {
    const d = state.pendingDuel;
    const isChallenger = p.id === d.challengerId;
    const isDefender = p.id === d.defenderId;
    let needStance = false;
    let needRoll = false;
    if (isChallenger) {
      needStance = d.challengerStance === null;
      needRoll =
        d.challengerStance !== null &&
        d.defenderStance !== null &&
        d.challengerRoll === null;
    }
    if (isDefender) {
      needStance = d.defenderStance === null;
      needRoll =
        d.challengerStance !== null &&
        d.defenderStance !== null &&
        d.defenderRoll === null;
    }
    return {
      ...empty,
      duelStance: needStance,
      duelRoll: needRoll,
    };
  }

  const fuel = refuelInfo(state);
  const node = getNode(state.board, p.position);
  const ownsHere = state.owners[node.id] === p.id;
  // Depots: planetoids only (planet/moon) — never hub space stations
  const depotSite =
    ownsHere &&
    (node.kind === "planet" || node.kind === "moon") &&
    !state.stations[node.id] &&
    p.stationsInHand > 0;
  const placeStationCost = depotSite
    ? depotPlaceCashCost(p.depotsPlacedThisCircuit, node.price)
    : 0;
  const canStation = depotSite && p.cash >= placeStationCost;

  const sellValue = ownsHere && isPurchasable(node)
    ? Math.floor((node.price ?? 0) / 2)
    : 0;
  const canSell = ownsHere && isPurchasable(node) && sellValue > 0;

  if (state.phase === "await_move" && state.lastRoll) {
    const maxBreak = state.lastRoll.total;
    const br = Math.min(Math.max(0, state.breakSpaces), maxBreak);
    const steps = state.lastRoll.total - br;
    const bCost = effectiveBreakFuelCost(p.freeBreakPending, br);
    let leavePreview = leaveBurnCost(node, Math.max(1, steps), p.propellant);
    if (p.freeLeavePending) leavePreview = 0;
    const canAffordBreak = p.fuel + 1e-9 >= bCost;
    return {
      ...empty,
      refuel: false,
      roll: false,
      move: canAffordBreak,
      maxBreak,
      breakSpaces: br,
      breakFuelCost: bCost,
      leaveBurnPreview: leavePreview,
      sell: canSell,
      sellNodeId: canSell ? node.id : null,
      sellValue,
      placeStation: canStation,
      placeStationCost,
      endTurn: false,
      setDirection: p.canBidirectional && !p.directionLocked,
      moveDirection: p.moveDirection,
      directionLocked: p.directionLocked,
      canBidirectional: p.canBidirectional,
    };
  }

  const previewSteps = state.lastRoll?.total ?? 7;
  let leaveBurnPreview = leaveBurnCost(node, previewSteps, p.propellant);
  if (p.freeLeavePending) leaveBurnPreview = 0;

  // Buy underfoot when unowned + affordable — on land *or* later before leave (#88)
  const unowned = isPurchasable(node) && !state.owners[node.id];
  const canBuy = unowned && p.cash >= (node.price ?? 0);
  const buyPrice = node.price ?? 0;

  if (state.phase === "await_action") {
    return {
      refuel: fuel.allowed && fuel.max > 0,
      refuelMax: fuel.max,
      refuelCostPer: fuel.costPer,
      roll: true,
      move: false,
      maxBreak: 0,
      breakSpaces: 0,
      breakFuelCost: 0,
      buy: canBuy,
      buyPrice,
      sell: canSell,
      sellNodeId: canSell ? node.id : null,
      sellValue,
      placeStation: canStation,
      placeStationCost,
      endTurn: true,
      leaveBurnPreview,
      duelStance: false,
      duelRoll: false,
      warp: p.warpCharges > 0,
      setDirection: p.canBidirectional && !p.directionLocked,
      moveDirection: p.moveDirection,
      directionLocked: p.directionLocked,
      canBidirectional: p.canBidirectional,
    };
  }

  return {
    refuel: fuel.allowed && fuel.max > 0,
    refuelMax: fuel.max,
    refuelCostPer: fuel.costPer,
    roll: false,
    move: false,
    maxBreak: 0,
    breakSpaces: 0,
    breakFuelCost: 0,
    buy: canBuy,
    buyPrice,
    sell: canSell,
    sellNodeId: canSell ? node.id : null,
    sellValue,
    placeStation: canStation,
    placeStationCost,
    endTurn: true,
    leaveBurnPreview,
    duelStance: false,
    duelRoll: false,
    warp: false,
    setDirection: false,
    moveDirection: p.moveDirection,
    directionLocked: p.directionLocked,
    canBidirectional: p.canBidirectional,
  };
}

/**
 * H₂ tank leak risk on **landing** only (not on leave burn).
 * Qualifying landings = planet/moon only (stations & transit never rupture tanks).
 * RNG stress on a non-body is deferred via `pendingLeak` until the next body.
 */
function applyLandingLeak(
  state: GameState,
  p: Player,
  nodeName: string,
  qualifies: boolean,
): void {
  const def = PROPELLANTS[p.propellant];
  if (def.leaveRisk <= 0) return;

  let due = p.pendingLeak;
  if (!due) {
    if (mulberryNext(state) > def.leaveRisk) return;
    due = true;
  }

  if (!qualifies) {
    p.pendingLeak = true;
    return;
  }

  p.pendingLeak = false;
  // H₂: catastrophic half-tank leak (Oregon Trail interrupt)
  const loss =
    p.propellant === "hydrogen"
      ? Math.max(1, Math.floor(p.fuel / 2))
      : Math.min(p.fuel, rngInt(state, 1, 2));
  if (loss <= 0 || p.fuel <= 0) return;
  p.fuel -= loss;
  if (p.propellant === "hydrogen") {
    p.skipTurns += 1; // grounded for tank repair
    pushLog(
      state,
      `${p.name} LEAK on landing ${nodeName}: −${loss} fuel (half tanks) · loses next turn to repair.`,
    );
    delta(state, `−${loss} fuel LEAK · +1 skip repair`);
    if (!state.pendingAnnouncement) {
      state.pendingAnnouncement = {
        kind: "leak",
        title: "LEAK!",
        body: `${p.name}'s H₂ tanks failed landing on ${nodeName}.\n−${loss} fuel (half the tanks).\nLoses next turn to repair.`,
      };
    }
  } else {
    pushLog(
      state,
      `${p.name} propellant glitch landing on ${nodeName}: −${loss} fuel`,
    );
    delta(state, `−${loss} fuel (${p.propellant})`);
  }
}

function othersOnNode(state: GameState, nodeId: string, exceptId: string): Player[] {
  return state.players.filter(
    (x) => !x.eliminated && x.position === nodeId && x.id !== exceptId,
  );
}

function pickDefender(
  state: GameState,
  nodeId: string,
  challengerId: string,
): Player | null {
  const others = othersOnNode(state, nodeId, challengerId);
  if (others.length === 0) return null;
  const mem = state.encounterMem[nodeId];
  if (mem?.lastRollerId) {
    const lr = others.find((o) => o.id === mem.lastRollerId);
    if (lr) return lr;
  }
  if (mem?.championId) {
    const ch = others.find((o) => o.id === mem.championId);
    if (ch) return ch;
  }
  return others[0] ?? null;
}

function beginDuel(
  state: GameState,
  challenger: Player,
  defender: Player,
  nodeId: string,
): void {
  state.pendingDuel = {
    nodeId,
    challengerId: challenger.id,
    defenderId: defender.id,
    challengerStance: null,
    defenderStance: null,
    challengerRoll: null,
    defenderRoll: null,
  };
  state.phase = "await_duel";
  // Keep turn on challenger for UI; AI defender resolved in apply/auto
  const idx = state.players.findIndex((p) => p.id === challenger.id);
  if (idx >= 0) state.currentPlayerIndex = idx;
  pushLog(
    state,
    `Gravity Duel on ${getNode(state.board, nodeId).name}: ${challenger.name} vs ${defender.name}!`,
  );
  delta(state, `Duel vs ${defender.name}`);
}

/**
 * Lab / tests: force a Gravity Duel between two living pilots on a space node.
 * Mutates `state` in place (caller should pass a clone when needed).
 */
export function forceGravityDuel(
  state: GameState,
  challengerId: string,
  defenderId: string,
  nodeId?: string,
): void {
  const challenger = state.players.find((p) => p.id === challengerId);
  const defender = state.players.find((p) => p.id === defenderId);
  if (!challenger || !defender || challenger.eliminated || defender.eliminated) {
    throw new Error("forceGravityDuel: need two living pilots");
  }
  if (challengerId === defenderId) {
    throw new Error("forceGravityDuel: challenger and defender must differ");
  }
  const blank =
    nodeId ??
    Object.values(state.board.nodes).find((n) => n.kind === "space")?.id ??
    "belt1";
  challenger.position = blank;
  defender.position = blank;
  state.lastDuelResult = null;
  beginDuel(state, challenger, defender, blank);
}

function resolveDuelIfComplete(state: GameState): void {
  const d = state.pendingDuel;
  if (!d) return;
  if (
    !d.challengerStance ||
    !d.defenderStance ||
    !d.challengerRoll ||
    !d.defenderRoll
  ) {
    return;
  }

  const c = state.players.find((p) => p.id === d.challengerId)!;
  const def = state.players.find((p) => p.id === d.defenderId)!;
  const ct = d.challengerRoll.total;
  const dt = d.defenderRoll.total;
  const mean = meanDiceTotal(state);

  pushLog(
    state,
    `Reveal: ${c.name} ${d.challengerStance.toUpperCase()} ${ct} · ${def.name} ${d.defenderStance.toUpperCase()} ${dt} · mean ${mean.toFixed(2)}`,
  );

  let winner: Player | null = null;
  let loser: Player | null = null;

  if (d.challengerStance === "low" && d.defenderStance === "low") {
    if (ct < dt) {
      winner = c;
      loser = def;
    } else if (dt < ct) {
      winner = def;
      loser = c;
    }
  } else if (d.challengerStance === "high" && d.defenderStance === "high") {
    if (ct > dt) {
      winner = c;
      loser = def;
    } else if (dt > ct) {
      winner = def;
      loser = c;
    }
  } else {
    const cDist = Math.abs(ct - mean);
    const dDist = Math.abs(dt - mean);
    if (cDist < dDist) {
      winner = c;
      loser = def;
    } else if (dDist < cDist) {
      winner = def;
      loser = c;
    }
  }

  const mem = state.encounterMem[d.nodeId] ?? {
    lastRollerId: null,
    championId: null,
  };
  // Last to roll: challenger (arriver) for next multi-ship rule on tie or otherwise
  mem.lastRollerId = d.challengerId;

  if (!winner || !loser) {
    const summary = `TIE — both hold the transit. No forfeit.`;
    pushLog(state, `Gravity Duel: ${summary}`);
    delta(state, `Duel TIE — both occupy`);
    mem.championId = null;
    state.encounterMem[d.nodeId] = mem;
    state.lastDuelResult = {
      nodeName: getNode(state.board, d.nodeId).name,
      challengerName: c.name,
      defenderName: def.name,
      challengerStance: d.challengerStance,
      defenderStance: d.defenderStance,
      challengerRoll: d.challengerRoll,
      defenderRoll: d.defenderRoll,
      mean,
      outcome: "tie",
      winnerName: null,
      loserName: null,
      summary,
    };
    state.pendingDuel = null;
    state.phase = "await_post_land";
    return;
  }

  mem.championId = winner.id;
  state.encounterMem[d.nodeId] = mem;

  loser.skipTurns += 1;
  if (!winner.rentWaiversAgainst.includes(loser.id)) {
    winner.rentWaiversAgainst.push(loser.id);
  }
  // #48: loser is also knocked back one Mainline space (in addition to skip + waiver)
  knockBackOneSpace(state, loser);
  const summary = duelWinSummary(winner.name, loser.name);
  pushLog(state, `Gravity Duel: ${summary}`);
  delta(state, `Duel WIN ${winner.name} / ${loser.name} skips + knockback + waiver`);
  state.lastDuelResult = {
    nodeName: getNode(state.board, d.nodeId).name,
    challengerName: c.name,
    defenderName: def.name,
    challengerStance: d.challengerStance,
    defenderStance: d.defenderStance,
    challengerRoll: d.challengerRoll,
    defenderRoll: d.defenderRoll,
    mean,
    outcome: "win",
    winnerName: winner.name,
    loserName: loser.name,
    summary,
  };
  state.pendingDuel = null;
  state.phase = "await_post_land";
}

/**
 * Gravity Duel forfeit (#48): move loser one hop reverse on the Mainline.
 * No leave fuel. Applies light landing (rent / Earth / leak) at the new node;
 * does **not** start a new duel (avoids cascade mid-resolution).
 * Cannot be pushed off Earth further back while already on Earth.
 */
function knockBackOneSpace(state: GameState, loser: Player): void {
  if (loser.eliminated) return;
  const fromId = loser.position;
  const fromName = getNode(state.board, fromId).name;

  if (fromId === "earth") {
    pushLog(
      state,
      `${loser.name} holds Earth — cannot be knocked further back.`,
    );
    return;
  }

  const backId = stepBackAlong(state.board, fromId);
  if (!backId || backId === fromId) {
    pushLog(state, `${loser.name} cannot be knocked back from ${fromName}.`);
    return;
  }

  const backName = getNode(state.board, backId).name;
  loser.position = backId;
  pushLog(
    state,
    `${loser.name} is knocked back ${fromName} → ${backName} (duel forfeit).`,
  );
  delta(state, `${loser.name}: knockback → ${backName}`);

  applyKnockbackLanding(state, loser);
}

/** Rent / Earth / leak for a pilot who was shoved (not the seat current). */
function applyKnockbackLanding(state: GameState, p: Player): void {
  if (p.eliminated || state.phase === "game_over") return;
  const node = getNode(state.board, p.position);

  if (node.id === "earth") {
    payEarthVisit(state, p, "land");
    if (p.circuitActive) {
      onCircuitComplete(state, p);
    }
  } else if (node.landingBonus && node.landingBonus > 0) {
    p.cash += node.landingBonus;
    pushLog(
      state,
      `${p.name} collects ${formatMoney(node.landingBonus)} from ${node.name} (knockback).`,
    );
    delta(state, `+${formatMoney(node.landingBonus)} ${node.name}`);
  }

  const qualifies = node.kind === "planet" || node.kind === "moon";
  applyLandingLeak(state, p, node.name, qualifies);

  const ownerId = state.owners[node.id];
  if (ownerId && ownerId !== p.id && isPurchasable(node)) {
    const owner = state.players.find((x) => x.id === ownerId);
    if (!owner || owner.eliminated) return;
    if (p.nextRentWaived) {
      p.nextRentWaived = false;
      pushLog(
        state,
        `${p.name} uses port holiday — no rent to ${owner.name} (knockback).`,
      );
      delta(state, `rent holiday vs ${owner.name}`);
      return;
    }
    const waiverIdx = p.rentWaiversAgainst.indexOf(owner.id);
    if (waiverIdx >= 0) {
      p.rentWaiversAgainst.splice(waiverIdx, 1);
      pushLog(
        state,
        `${p.name} uses Gravity Duel free pass — no rent to ${owner.name} (knockback).`,
      );
      delta(state, `rent waived vs ${owner.name}`);
    } else {
      const rent = rentDue(state, node.id, ownerId);
      if (p.cash >= rent) {
        p.cash -= rent;
        owner.cash += rent;
        pushLog(
          state,
          `${p.name} pays ${formatMoney(rent)} rent to ${owner.name} (knockback).`,
        );
        delta(state, `−${formatMoney(rent)} rent → ${owner.name}`);
      } else {
        owner.cash += p.cash;
        pushLog(
          state,
          `${p.name} cannot pay ${formatMoney(rent)} rent (knockback).`,
        );
        delta(state, `bankrupt to ${owner.name}`);
        eliminate(state, p, "bankruptcy");
      }
    }
  }
}

function movePlayer(state: GameState, steps: number): void {
  const p = currentPlayer(state);
  let pos = p.position;
  const startNode = getNode(state.board, pos);
  const g = gravityClassOf(startNode);
  let burn = leaveBurnCost(startNode, steps, p.propellant);
  // Timed charter: comet dust / free leave once
  if (burn > 0 && p.freeLeavePending) {
    p.freeLeavePending = false;
    pushLog(
      state,
      `${p.name} rides free leave from ${startNode.name} (comet dust token · g${g}).`,
    );
    delta(state, `free leave ${startNode.name}`);
    burn = 0;
  }

  if (burn > 0) {
    if (p.fuel < burn) {
      pushLog(
        state,
        `${p.name} cannot leave ${startNode.name} (g${g}): need ${burn} fuel, have ${p.fuel}.`,
      );
      delta(state, `stuck on ${startNode.name} (no leave fuel)`);
      resolveLanding(state, true);
      return;
    }
    p.fuel -= burn;
    pushLog(
      state,
      `${p.name} burns ${burn} fuel leaving ${startNode.name} (g${g} · ${PROPELLANTS[p.propellant].short}).`,
    );
    delta(state, `−${burn} fuel leave ${startNode.name}`);
  }

  // Leaving Earth starts a circuit toward a full board rotation
  if (startNode.id === "earth") {
    p.circuitActive = true;
  }

  // #47: lock facing after first Move (permanent for the charter)
  if (p.canBidirectional && !p.directionLocked) {
    p.directionLocked = true;
  }

  const dir = p.moveDirection;
  const path = walkMovePath(state.board, pos, steps, dir);
  for (const frame of path.frames) {
    if (frame.passThrough) {
      pushLog(
        state,
        `${p.name} is pulled through ${getNode(state.board, frame.nodeId).name}.`,
      );
    }
  }

  // Earth pass: intermediate die-stops on Earth (not the final rest)
  if (path.stops.length > 1) {
    for (let i = 0; i < path.stops.length - 1; i++) {
      if (path.stops[i] === "earth") {
        payEarthVisit(state, p, "pass");
      }
    }
  }

  p.position = path.endId;

  // Earth land/pass cash uses circuitsCompleted *before* this return increments
  resolveLanding(state, false);

  if (path.endId === "earth" && p.circuitActive) {
    onCircuitComplete(state, p);
  }
}

function doSetDirection(
  state: GameState,
  direction: "forward" | "backward",
): void {
  const p = currentPlayer(state);
  if (!p.canBidirectional || p.directionLocked) {
    pushLog(state, `${p.name} cannot change course.`);
    return;
  }
  if (direction !== "forward" && direction !== "backward") return;
  if (p.moveDirection === direction) return;
  p.moveDirection = direction;
  pushLog(
    state,
    `${p.name} sets course ${direction === "backward" ? "retrograde" : "prograde"} on the Mainline.`,
  );
  delta(state, `course ${direction}`);
}

function resolveLanding(state: GameState, stayed: boolean): void {
  const p = currentPlayer(state);
  const node = getNode(state.board, p.position);
  if (!stayed) {
    pushLog(state, `${p.name} lands on ${node.name} (insertion free).`);
    // Tank stress on insertion — planet/moon only; transit/station may defer
    const qualifies = node.kind === "planet" || node.kind === "moon";
    applyLandingLeak(state, p, node.name, qualifies);
  }

  // Earth land uses rotation-scaled pay; other bodies keep landingBonus if any
  if (!stayed && node.id === "earth") {
    payEarthVisit(state, p, "land");
  } else if (node.landingBonus && node.landingBonus > 0 && !stayed) {
    p.cash += node.landingBonus;
    pushLog(
      state,
      `${p.name} collects ${formatMoney(node.landingBonus)} from ${node.name}.`,
    );
    delta(state, `+${formatMoney(node.landingBonus)} ${node.name}`);
  }

  const ownerId = state.owners[node.id];
  // Rent on landing OR on failed leave (stayed) — intentional second charge
  if (ownerId && ownerId !== p.id && isPurchasable(node)) {
    const owner = state.players.find((x) => x.id === ownerId)!;
    if (p.nextRentWaived) {
      p.nextRentWaived = false;
      pushLog(
        state,
        `${p.name} uses port holiday — no rent to ${owner.name}.`,
      );
      delta(state, `rent holiday vs ${owner.name}`);
    } else {
      const waiverIdx = p.rentWaiversAgainst.indexOf(owner.id);
      if (waiverIdx >= 0) {
        p.rentWaiversAgainst.splice(waiverIdx, 1);
        pushLog(
          state,
          `${p.name} uses Gravity Duel free pass — no rent to ${owner.name}.`,
        );
        delta(state, `rent waived vs ${owner.name}`);
      } else {
        const rent = rentDue(state, node.id, ownerId);
        if (p.cash >= rent) {
          p.cash -= rent;
          owner.cash += rent;
          pushLog(
            state,
            `${p.name} pays ${formatMoney(rent)} rent to ${owner.name}.`,
          );
          delta(state, `−${formatMoney(rent)} rent → ${owner.name}`);
        } else {
          // Creditor gets remaining cash only; deeds go to bank on eliminate
          owner.cash += p.cash;
          pushLog(
            state,
            `${p.name} cannot pay ${formatMoney(rent)} rent.`,
          );
          delta(state, `bankrupt to ${owner.name}`);
          eliminate(state, p, "bankruptcy");
          return;
        }
      }
    }
  }

  if (
    (node.kind === "planet" || node.kind === "moon") &&
    p.fuel <= 1 &&
    !canRefuelAtAll(state, p)
  ) {
    eliminate(state, p, "stranded — cannot fuel an exit");
    return;
  }

  if (state.phase === "game_over") return;

  // Gravity Duel on blank transit / belt (kind space)
  if (!stayed && node.kind === "space") {
    const defender = pickDefender(state, node.id, p.id);
    if (defender) {
      beginDuel(state, p, defender, node.id);
      return;
    }
  }

  state.phase = "await_post_land";
}

export function canRefuelAtAll(state: GameState, p: Player): boolean {
  const node = getNode(state.board, p.position);
  if (node.refuel === "free" || node.id === "earth") return true;
  if (node.refuel === "paid") return true;
  if (node.refuel === "station" && state.stations[node.id]) return true;
  return false;
}

function doRefuel(state: GameState, amount: number): void {
  const info = refuelInfo(state);
  const p = currentPlayer(state);
  const qty = Math.max(0, Math.min(amount, info.max));
  if (!info.allowed || qty <= 0) {
    pushLog(state, `${p.name} cannot refuel here.`);
    return;
  }
  const cost = qty * info.costPer;
  if (p.cash < cost) {
    pushLog(state, `${p.name} cannot afford refuel.`);
    return;
  }
  p.cash -= cost;
  p.fuel += qty;
  const node = getNode(state.board, p.position);
  const ownerId = state.owners[node.id];
  if (cost > 0 && ownerId && ownerId !== p.id) {
    const owner = state.players.find((x) => x.id === ownerId);
    if (owner) owner.cash += cost;
  }
  pushLog(
    state,
    `${p.name} refuels +${qty} fuel${cost ? ` for ${formatMoney(cost)}` : " (free)"}.`,
  );
  delta(
    state,
    `+${qty} fuel${cost ? ` (−${formatMoney(cost)})` : " free"}`,
  );
}

function doBuy(state: GameState): void {
  const p = currentPlayer(state);
  const node = getNode(state.board, p.position);
  const legal = getLegalActions(state);
  if (!legal.buy) {
    pushLog(state, `${p.name} cannot buy ${node.name}.`);
    return;
  }
  p.cash -= legal.buyPrice;
  state.owners[node.id] = p.id;
  p.properties.push(node.id);
  if (!p.ephemerisBodyId) {
    p.ephemerisBodyId = node.id;
    pushLog(
      state,
      `${p.name}'s ephemeris anchor is now ${node.name} (first claim).`,
    );
  }
  const sys = systemOfGroup(node.group);
  const mono =
    !!sys && hasSystemMonopoly(state.owners, p.id, sys.id as SystemId);
  pushLog(
    state,
    `${p.name} claims ${node.name} for ${formatMoney(legal.buyPrice)}${mono ? ` · ${sys!.name} MONOPOLY (rent ×2)` : ""}.`,
  );
  delta(state, `−${formatMoney(legal.buyPrice)} claim ${node.name}`);
}

function doPlaceStation(state: GameState): void {
  const p = currentPlayer(state);
  const legal = getLegalActions(state);
  if (!legal.placeStation) {
    pushLog(state, `${p.name} cannot place a fuel depot here.`);
    return;
  }
  const body = getNode(state.board, p.position);
  // Planetoids only (planet/moon); hubs are never depot sites
  if (body.kind !== "planet" && body.kind !== "moon") {
    pushLog(state, `${p.name} cannot place a depot on ${body.name}.`);
    return;
  }
  const cost = depotPlaceCashCost(p.depotsPlacedThisCircuit, body.price);
  if (p.cash < cost) {
    pushLog(
      state,
      `${p.name} cannot afford depot on ${body.name} (${formatMoney(cost)}).`,
    );
    return;
  }
  if (cost > 0) {
    p.cash -= cost;
  }
  p.stationsInHand -= 1;
  p.depotsPlacedThisCircuit += 1;
  state.stations[p.position] = true;
  const freeNote =
    cost === 0
      ? " (first this circuit free)"
      : ` for ${formatMoney(cost)} (10% of claim)`;
  pushLog(
    state,
    `${p.name} places a fuel depot on ${body.name}${freeNote}.`,
  );
  delta(
    state,
    cost > 0
      ? `+depot ${body.name} (−${formatMoney(cost)})`
      : `+depot ${body.name} free`,
  );
  maybeStrikeGusher(state, p, p.position);
}

/** Claim + fuel depot on a top ISRU body for your propellant → one-time cash strike. */
function maybeStrikeGusher(
  state: GameState,
  p: Player,
  nodeId: string,
): void {
  if (state.owners[nodeId] !== p.id) return;
  if (!state.stations[nodeId]) return;
  if (state.gusherPaid[nodeId]) return;
  if (!isGusherBody(p.propellant, nodeId)) return;

  const bonus =
    state.config.startingCash > 0
      ? Math.floor(state.config.startingCash * 0.5)
      : GUSHER_BONUS;
  state.gusherPaid[nodeId] = true;
  p.cash += bonus;
  const body = getNode(state.board, nodeId);
  const fuelWord = PROPELLANTS[p.propellant].short;
  const isHuman = p.agent === "human";
  const headline = pickStrikeHeadline(
    p.propellant,
    mulberryNext(state),
    p.name,
    isHuman,
  );
  // Log always names the striker (title may be second-person for human)
  const logHeadline = isHuman ? `${headline} (${p.name})` : headline;
  pushLog(
    state,
    `${logHeadline} · ${body.name} · +${formatMoney(bonus)} (${fuelWord}).`,
  );
  delta(state, `+${formatMoney(bonus)} fuel strike ${body.name}`);
  state.pendingAnnouncement = {
    kind: "gusher",
    title: headline,
    body: strikeAnnouncementBody(
      p.name,
      body.name,
      `+${formatMoney(bonus)}`,
      isHuman,
    ),
  };
}

/** Sell claim underfoot for half price; depot destroyed. */
function doSell(state: GameState, nodeId: string): void {
  const p = currentPlayer(state);
  const node = getNode(state.board, nodeId);
  if (state.owners[nodeId] !== p.id || !isPurchasable(node)) {
    pushLog(state, `${p.name} cannot sell ${node.name}.`);
    return;
  }
  const value = Math.floor((node.price ?? 0) / 2);
  p.cash += value;
  p.properties = p.properties.filter((id) => id !== nodeId);
  const hadDepot = !!state.stations[nodeId];
  releaseClaimToBank(state, nodeId);
  if (p.ephemerisBodyId === nodeId) {
    p.ephemerisBodyId = p.properties[0] ?? null;
  }
  pushLog(
    state,
    `${p.name} sells ${node.name} for ${formatMoney(value)}${hadDepot ? " (depot scrapped)" : ""}.`,
  );
  delta(state, `+${formatMoney(value)} sold ${node.name}`);
}

function doSetBreak(state: GameState, spaces: number): void {
  if (state.phase !== "await_move" || !state.lastRoll) return;
  const max = state.lastRoll.total;
  state.breakSpaces = Math.min(max, Math.max(0, Math.floor(spaces)));
}

/**
 * King's Quest warp: teleport to any node (no leave burn, no en-route).
 * Landing effects (rent, leak, Earth pay, duel on space) still apply.
 */
function doWarp(state: GameState, destination: string): void {
  const p = currentPlayer(state);
  if (state.phase !== "await_action") return;
  if (p.warpCharges <= 0) {
    pushLog(state, `${p.name} has no warp charge.`);
    return;
  }
  const dest = state.board.nodes[destination];
  if (!dest) {
    pushLog(state, `${p.name} cannot warp — unknown beacon.`);
    return;
  }
  if (destination === p.position) {
    pushLog(state, `${p.name} is already at ${dest.name}.`);
    return;
  }

  p.warpCharges -= 1;
  const fromId = p.position;
  const fromName = getNode(state.board, fromId).name;

  // Leaving Earth starts a circuit (same as a normal leave)
  if (fromId === "earth") {
    p.circuitActive = true;
  }

  p.position = destination;
  p.rolledThisTurn = true;
  p.movedThisTurn = true;
  state.lastRoll = null;
  state.breakSpaces = 0;

  pushLog(
    state,
    `${p.name} warps ${fromName} → ${dest.name} (King's Quest · ${p.warpCharges} charge(s) left).`,
  );
  delta(state, `warp → ${dest.name}`);

  resolveLanding(state, false);

  if (destination === "earth" && p.circuitActive) {
    onCircuitComplete(state, p);
  }
  if (state.pendingDuel) autoDuelAi(state);
}

function doMove(state: GameState): void {
  const p = currentPlayer(state);
  if (state.phase !== "await_move" || !state.lastRoll) return;
  const total = state.lastRoll.total;
  const br = Math.min(state.breakSpaces, total);
  const usedFreeBreak = br > 0 && p.freeBreakPending;
  const cost = effectiveBreakFuelCost(p.freeBreakPending, br);
  if (p.fuel + 1e-9 < cost) {
    pushLog(state, `${p.name} cannot afford break (${cost} fuel for −${br} spaces).`);
    return;
  }
  if (br > 0) {
    if (usedFreeBreak) {
      p.freeBreakPending = false;
    }
    p.fuel -= cost;
    // Avoid float dust
    p.fuel = Math.round(p.fuel * 2) / 2;
    pushLog(
      state,
      usedFreeBreak
        ? `${p.name} breaks −${br} space(s) free (M&Ms token) (roll ${total} → move ${total - br}).`
        : `${p.name} breaks −${br} space(s) for ${cost} fuel (roll ${total} → move ${total - br}).`,
    );
    delta(
      state,
      usedFreeBreak
        ? `free break (−${br} spaces)`
        : `−${cost} fuel break (−${br} spaces)`,
    );
  }
  const steps = total - br;
  state.breakSpaces = 0;
  if (steps <= 0) {
    pushLog(state, `${p.name} breaks full roll — stays put.`);
    delta(state, `stay (full break)`);
    // No path advance → not a move for parking
    state.phase = "await_post_land";
    return;
  }
  const from = p.position;
  movePlayer(state, steps);
  if (p.position !== from) {
    p.movedThisTurn = true;
  }
  if (state.pendingDuel) autoDuelAi(state);
}

function autoDuelAi(state: GameState): void {
  const d = state.pendingDuel;
  if (!d) return;
  const c = state.players.find((p) => p.id === d.challengerId)!;
  const def = state.players.find((p) => p.id === d.defenderId)!;

  const pickStance = (pl: Player): DuelStance => {
    // Slight fuel bias
    return pl.fuel > 12 ? "high" : "low";
  };

  if (c.agent === "ai" && d.challengerStance === null) {
    d.challengerStance = pickStance(c);
  }
  if (def.agent === "ai" && d.defenderStance === null) {
    d.defenderStance = pickStance(def);
  }
  if (
    d.challengerStance &&
    d.defenderStance &&
    d.challengerRoll === null &&
    c.agent === "ai"
  ) {
    d.challengerRoll = roll2d6(state, c);
    pushLog(
      state,
      `${c.name} rolls duel dice ${d.challengerRoll.d1}+${d.challengerRoll.d2}=${d.challengerRoll.total}.`,
    );
  }
  if (
    d.challengerStance &&
    d.defenderStance &&
    d.defenderRoll === null &&
    def.agent === "ai"
  ) {
    d.defenderRoll = roll2d6(state, def);
    pushLog(
      state,
      `${def.name} rolls duel dice ${d.defenderRoll.d1}+${d.defenderRoll.d2}=${d.defenderRoll.total}.`,
    );
  }
  resolveDuelIfComplete(state);
}

export function applyAction(state: GameState, action: PlayerAction): GameState {
  const next = cloneState(state);
  if (next.phase === "game_over") return next;

  // Auto-progress AI duel sides whenever we enter apply
  if (next.phase === "await_duel") {
    autoDuelAi(next);
    if (next.phase !== "await_duel") return next;
  }

  const p = currentPlayer(next);
  if (p.eliminated && action.type !== "duel_stance" && action.type !== "duel_roll") {
    advanceTurn(next);
    return next;
  }

  switch (action.type) {
    case "refuel":
      if (next.phase === "await_action" || next.phase === "await_post_land") {
        doRefuel(next, action.amount);
      }
      break;
    case "warp":
      if (next.phase === "await_action") {
        doWarp(next, action.destination);
      }
      break;
    case "roll": {
      if (next.phase !== "await_action") break;
      const roll = roll2d6(next, p);
      next.lastRoll = roll;
      next.breakSpaces = 0;
      p.rolledThisTurn = true;
      pushLog(
        next,
        `${p.name} rolls ${roll.d1}+${roll.d2}=${roll.total}${roll.doubles ? " (doubles)" : ""}, Break=${next.breakSpaces}, Move`,
      );
      delta(next, `roll ${roll.total}`);
      next.phase = "await_move";
      break;
    }
    case "set_direction":
      if (
        next.phase === "await_action" ||
        next.phase === "await_move" ||
        next.phase === "await_post_land"
      ) {
        doSetDirection(next, action.direction);
      }
      break;
    case "set_break":
      doSetBreak(next, action.spaces);
      break;
    case "move":
      doMove(next);
      break;
    case "buy":
      // Claim underfoot after landing *or* on a later turn before leave (#88)
      if (next.phase === "await_post_land" || next.phase === "await_action") {
        doBuy(next);
      }
      break;
    case "sell":
      if (
        next.phase === "await_action" ||
        next.phase === "await_move" ||
        next.phase === "await_post_land"
      ) {
        doSell(next, action.nodeId);
      }
      break;
    case "place_station":
      if (
        next.phase === "await_post_land" ||
        next.phase === "await_action" ||
        next.phase === "await_move"
      ) {
        doPlaceStation(next);
      }
      break;
    case "end_turn":
      if (next.phase === "await_post_land" || next.phase === "await_action") {
        if (!p.rolledThisTurn) {
          pushLog(next, `${p.name} ends turn without rolling (camping).`);
        }
        if (!p.movedThisTurn) {
          applyParkingTick(next, p);
        }
        advanceTurn(next);
      }
      break;
    case "duel_stance": {
      const d = next.pendingDuel;
      if (!d || next.phase !== "await_duel") break;
      if (p.id === d.challengerId && d.challengerStance === null) {
        d.challengerStance = action.stance;
        pushLog(next, `${p.name} locks a secret stance.`);
      } else if (p.id === d.defenderId && d.defenderStance === null) {
        d.defenderStance = action.stance;
        pushLog(next, `${p.name} locks a secret stance.`);
      }
      autoDuelAi(next);
      break;
    }
    case "duel_roll": {
      const d = next.pendingDuel;
      if (!d || next.phase !== "await_duel") break;
      if (
        d.challengerStance === null ||
        d.defenderStance === null
      ) {
        break;
      }
      if (p.id === d.challengerId && d.challengerRoll === null) {
        d.challengerRoll = roll2d6(next, p);
        pushLog(
          next,
          `${p.name} rolls duel ${d.challengerRoll.d1}+${d.challengerRoll.d2}=${d.challengerRoll.total}.`,
        );
      } else if (p.id === d.defenderId && d.defenderRoll === null) {
        d.defenderRoll = roll2d6(next, p);
        pushLog(
          next,
          `${p.name} rolls duel ${d.defenderRoll.d1}+${d.defenderRoll.d2}=${d.defenderRoll.total}.`,
        );
      }
      autoDuelAi(next);
      resolveDuelIfComplete(next);
      break;
    }
  }

  return next;
}

/** Flush AI duel until needs human or done. */
export function resolveDuelAiFully(state: GameState): GameState {
  let s = state;
  let guard = 0;
  while (s.phase === "await_duel" && s.pendingDuel && guard++ < 20) {
    const before = JSON.stringify(s.pendingDuel);
    const n = cloneState(s);
    autoDuelAi(n);
    resolveDuelIfComplete(n);
    s = n;
    if (JSON.stringify(s.pendingDuel) === before && s.phase === "await_duel") {
      // Needs human input
      break;
    }
  }
  return s;
}

export function runUntilHumanOrEnd(
  state: GameState,
  choose: (s: GameState) => PlayerAction,
  maxSteps = 800,
): GameState {
  let s = state;
  let steps = 0;
  while (steps < maxSteps && s.phase !== "game_over") {
    s = resolveDuelAiFully(s);
    if (s.phase === "game_over") break;

    const p = currentPlayer(s);
    if (s.phase === "await_duel" && s.pendingDuel) {
      const d = s.pendingDuel;
      const humanInDuel =
        (s.players.find((x) => x.id === d.challengerId)?.agent === "human" &&
          (d.challengerStance === null ||
            (d.challengerStance &&
              d.defenderStance &&
              d.challengerRoll === null))) ||
        (s.players.find((x) => x.id === d.defenderId)?.agent === "human" &&
          (d.defenderStance === null ||
            (d.challengerStance &&
              d.defenderStance &&
              d.defenderRoll === null)));
      if (humanInDuel) break;
    }

    if (!p.eliminated && p.agent === "human" && s.phase !== "await_duel") break;
    if (p.eliminated) {
      s = applyAction(s, { type: "end_turn" });
      steps++;
      continue;
    }
    if (s.phase === "await_duel") {
      s = applyAction(s, { type: "duel_stance", stance: "low" });
      steps++;
      continue;
    }
    const action = choose(s);
    s = applyAction(s, action);
    steps++;
  }
  return s;
}

export function advanceTurnPublic(state: GameState): void {
  advanceTurn(state);
}

export function resignGame(state: GameState, playerId: string): GameState {
  const next = cloneState(state);
  const p = next.players.find((x) => x.id === playerId);
  if (!p || next.phase === "game_over") return next;
  next.phase = "game_over";
  p.eliminated = true;
  p.eliminatedOnTurn = next.gameTurn;
  p.eliminatedOnRound = next.round;
  p.eliminatedReason = "abandoned the charter";
  next.endReason = abandonedCharter(p);
  next.pendingAnnouncement = {
    kind: "out",
    title: "OUT!",
    body: `${p.name} abandoned the charter.\nRound ${next.round}.`,
  };
  const others = livingPlayers(next).filter((x) => x.id !== playerId);
  if (others.length === 1) next.winnerId = others[0].id;
  else if (others.length > 1) {
    others.sort((a, b) => netWorth(next, b) - netWorth(next, a));
    next.winnerId = others[0].id;
  }
  pushLog(next, next.endReason);
  return next;
}
