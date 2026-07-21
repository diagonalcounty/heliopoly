import { getNode, isPurchasable } from "./board";
import { formatMoney } from "./currency";
import { gravityClassOf, leaveBurnCost } from "./fuel";
import { walkMovePath } from "./path";
import { PROPELLANTS } from "./propellant";
import {
  cloneState,
  currentPlayer,
  livingPlayers,
} from "./state";
import type {
  GameState,
  LegalActions,
  Player,
  PlayerAction,
} from "./types";

export { walkMovePath } from "./path";
export type { MovePath, PathFrame } from "./path";

function pushLog(state: GameState, msg: string): void {
  state.log.push(msg);
  if (state.log.length > 200) state.log.splice(0, state.log.length - 200);
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

function groupOwnedCount(
  state: GameState,
  ownerId: string,
  group: string | undefined,
): number {
  if (!group) return 1;
  let n = 0;
  for (const [nodeId, oid] of Object.entries(state.owners)) {
    if (oid !== ownerId) continue;
    const node = state.board.nodes[nodeId];
    if (node?.group === group) n++;
  }
  return Math.max(1, n);
}

function rentDue(state: GameState, nodeId: string, ownerId: string): number {
  const node = getNode(state.board, nodeId);
  const base = node.rent ?? 0;
  const owned = groupOwnedCount(state, ownerId, node.group);
  const mult = owned === 1 ? 1 : owned === 2 ? 1.75 : owned === 3 ? 2.5 : 3.5;
  const stationBonus = state.stations[nodeId] ? 1.5 : 1;
  return Math.floor(base * mult * stationBonus);
}

function netWorth(state: GameState, p: Player): number {
  let deeds = 0;
  for (const id of p.properties) {
    deeds += getNode(state.board, id).price ?? 0;
  }
  const stationsPlaced = p.properties.filter((id) => state.stations[id]).length;
  return p.cash + deeds + stationsPlaced * 500 + p.stationsInHand * 500;
}

function eliminate(
  state: GameState,
  player: Player,
  reason: string,
): void {
  if (player.eliminated) return;
  player.eliminated = true;
  pushLog(state, `${player.name} eliminated: ${reason}`);
  for (const prop of [...player.properties]) {
    delete state.owners[prop];
  }
  player.properties = [];
  player.cash = 0;
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
    pushLog(state, `Winner: ${alive[0].name}`);
    return;
  }
  if (alive.length === 0) {
    state.phase = "game_over";
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
  pushLog(
    state,
    `Round limit (${state.config.maxRounds}): ${alive[0].name} wins on net worth (${formatMoney(netWorth(state, alive[0]))}).`,
  );
  return true;
}

function advanceTurn(state: GameState): void {
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
  if (forceEndByRounds(state)) return;
  const p = currentPlayer(state);
  pushLog(state, `— Round ${state.round}: ${p.name}'s turn —`);
}

export function refuelInfo(state: GameState): {
  allowed: boolean;
  max: number;
  costPer: number;
} {
  const p = currentPlayer(state);
  if (p.eliminated || state.phase === "game_over") {
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
    buy: false,
    buyPrice: 0,
    placeStation: false,
    endTurn: false,
    leaveBurnPreview: 0,
  };
  if (state.phase === "game_over") return empty;

  const p = currentPlayer(state);
  if (p.eliminated) return empty;

  const fuel = refuelInfo(state);
  const node = getNode(state.board, p.position);
  const previewSteps = state.lastRoll?.total ?? 7;
  const leaveBurnPreview = leaveBurnCost(node, previewSteps, p.propellant);

  if (state.phase === "await_action") {
    return {
      refuel: fuel.allowed && fuel.max > 0,
      refuelMax: fuel.max,
      refuelCostPer: fuel.costPer,
      roll: true,
      buy: false,
      buyPrice: 0,
      placeStation: false,
      endTurn: false,
      leaveBurnPreview,
    };
  }

  const unowned = isPurchasable(node) && !state.owners[node.id];
  const canBuy = unowned && p.cash >= (node.price ?? 0);
  const ownsHere = state.owners[node.id] === p.id;
  const canStation =
    ownsHere &&
    (node.kind === "planet" || node.kind === "moon") &&
    !state.stations[node.id] &&
    p.stationsInHand > 0;

  return {
    refuel: fuel.allowed && fuel.max > 0,
    refuelMax: fuel.max,
    refuelCostPer: fuel.costPer,
    roll: false,
    buy: canBuy,
    buyPrice: node.price ?? 0,
    placeStation: canStation,
    endTurn: true,
    leaveBurnPreview,
  };
}

function applyLeaveRisk(state: GameState, p: Player, nodeName: string): void {
  const def = PROPELLANTS[p.propellant];
  if (def.leaveRisk <= 0) return;
  if (mulberryNext(state) > def.leaveRisk) return;

  const loss = Math.min(p.fuel, rngInt(state, 1, 2));
  if (loss <= 0) return;
  p.fuel -= loss;
  if (p.propellant === "hydrogen") {
    pushLog(
      state,
      `${p.name} H₂ boil-off leaving ${nodeName}: −${loss} fuel (risk event).`,
    );
  } else {
    pushLog(
      state,
      `${p.name} CH₄ feed glitch leaving ${nodeName}: −${loss} fuel (rare).`,
    );
  }
}

function movePlayer(state: GameState, steps: number): void {
  const p = currentPlayer(state);
  let pos = p.position;
  const startNode = getNode(state.board, pos);
  const g = gravityClassOf(startNode);
  const burn = leaveBurnCost(startNode, steps, p.propellant);

  // Leave costs fuel; insertion is free (no cost on arrival).
  if (burn > 0) {
    if (p.fuel < burn) {
      pushLog(
        state,
        `${p.name} cannot leave ${startNode.name} (g${g}): need ${burn} fuel for roll ${steps} on ${PROPELLANTS[p.propellant].short}, have ${p.fuel}.`,
      );
      resolveLanding(state, true);
      return;
    }
    p.fuel -= burn;
    pushLog(
      state,
      `${p.name} burns ${burn} fuel leaving ${startNode.name} (g${g} · ${PROPELLANTS[p.propellant].short} · roll ${steps}).`,
    );
    applyLeaveRisk(state, p, startNode.name);
  }

  const path = walkMovePath(state.board, pos, steps);
  for (const frame of path.frames) {
    if (frame.passThrough) {
      pushLog(
        state,
        `${p.name} is pulled through ${getNode(state.board, frame.nodeId).name}.`,
      );
    }
  }
  p.position = path.endId;
  resolveLanding(state, false);
}

function resolveLanding(state: GameState, stayed: boolean): void {
  const p = currentPlayer(state);
  const node = getNode(state.board, p.position);
  if (!stayed) {
    pushLog(state, `${p.name} lands on ${node.name} (insertion free).`);
  }

  if (node.landingBonus && node.landingBonus > 0 && !stayed) {
    p.cash += node.landingBonus;
    pushLog(
      state,
      `${p.name} collects ${formatMoney(node.landingBonus)} from ${node.name}.`,
    );
  }

  const ownerId = state.owners[node.id];
  if (ownerId && ownerId !== p.id && isPurchasable(node)) {
    const owner = state.players.find((x) => x.id === ownerId)!;
    const rent = rentDue(state, node.id, ownerId);
    if (p.cash >= rent) {
      p.cash -= rent;
      owner.cash += rent;
      pushLog(
        state,
        `${p.name} pays ${formatMoney(rent)} rent to ${owner.name}.`,
      );
    } else {
      owner.cash += p.cash;
      pushLog(
        state,
        `${p.name} cannot pay ${formatMoney(rent)} rent.`,
      );
      for (const prop of p.properties) {
        state.owners[prop] = owner.id;
        owner.properties.push(prop);
      }
      p.properties = [];
      eliminate(state, p, "bankruptcy");
      return;
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

  if (state.phase !== "game_over") {
    state.phase = "await_post_land";
  }
}

function canRefuelAtAll(state: GameState, p: Player): boolean {
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
  pushLog(
    state,
    `${p.name} claims ${node.name} for ${formatMoney(legal.buyPrice)}.`,
  );
}

function doPlaceStation(state: GameState): void {
  const p = currentPlayer(state);
  const legal = getLegalActions(state);
  if (!legal.placeStation) {
    pushLog(state, `${p.name} cannot place a station here.`);
    return;
  }
  p.stationsInHand -= 1;
  state.stations[p.position] = true;
  pushLog(
    state,
    `${p.name} places a fuel station on ${getNode(state.board, p.position).name}.`,
  );
}

export function applyAction(state: GameState, action: PlayerAction): GameState {
  const next = cloneState(state);
  if (next.phase === "game_over") return next;

  const p = currentPlayer(next);
  if (p.eliminated) {
    advanceTurn(next);
    return next;
  }

  switch (action.type) {
    case "refuel":
      doRefuel(next, action.amount);
      break;
    case "roll": {
      if (next.phase !== "await_action") break;
      const d1 = rngInt(next, 1, 6);
      const d2 = rngInt(next, 1, 6);
      const roll = { d1, d2, total: d1 + d2, doubles: d1 === d2 };
      next.lastRoll = roll;
      pushLog(
        next,
        `${p.name} rolls ${d1}+${d2}=${roll.total}${roll.doubles ? " (doubles — solar weather TBD)" : ""}.`,
      );
      movePlayer(next, roll.total);
      break;
    }
    case "buy":
      if (next.phase === "await_post_land") doBuy(next);
      break;
    case "place_station":
      if (next.phase === "await_post_land") doPlaceStation(next);
      break;
    case "end_turn":
      if (next.phase === "await_post_land") advanceTurn(next);
      break;
  }

  return next;
}

export function runUntilHumanOrEnd(
  state: GameState,
  choose: (s: GameState) => PlayerAction,
  maxSteps = 500,
): GameState {
  let s = state;
  let steps = 0;
  while (steps < maxSteps && s.phase !== "game_over") {
    const p = currentPlayer(s);
    if (!p.eliminated && p.agent === "human") break;
    if (p.eliminated) {
      s = applyAction(s, { type: "end_turn" });
      if (currentPlayer(s).eliminated && s.phase !== "game_over") {
        const n = cloneState(s);
        advanceTurnPublic(n);
        s = n;
      }
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
