import { heuristicAI } from "../core/agents";
import { bankSellValue } from "../core/claimLedger";
import {
  applyAction,
  resolveCharterChoiceIfAi,
  resolveAuctionIfAi,
  getLegalActions,
  netWorth,
  resolveDuelAiFully,
} from "../core/rules";
import { createGame, currentPlayer } from "../core/state";
import {
  normalizeAiDifficulty,
  type AiDifficulty,
  type GameState,
  type MoveDirection,
} from "../core/types";
import type {
  SimExperiment,
  SimGameResult,
  SimPropertyCash,
  SimSeatResult,
} from "./types";

export const DEFAULT_MAX_TURNS = 3000;
export const DEFAULT_SEED_STRIDE = 997;

export function applyExperiment(
  state: GameState,
  experiment: SimExperiment,
): void {
  const n = state.players.length;
  for (let i = 0; i < n; i++) {
    const p = state.players[i]!;
    switch (experiment) {
      case "prograde":
        p.canBidirectional = false;
        p.moveDirection = "forward";
        p.directionLocked = true;
        break;
      case "retrograde":
        p.canBidirectional = false;
        p.moveDirection = "backward";
        p.directionLocked = true;
        break;
      case "choice":
        p.canBidirectional = true;
        p.moveDirection = "forward";
        p.directionLocked = false;
        break;
      case "mixed": {
        const retro = i >= Math.floor(n / 2);
        p.canBidirectional = false;
        p.moveDirection = retro ? "backward" : "forward";
        p.directionLocked = true;
        break;
      }
      case "default":
      default:
        break;
    }
  }
}

function countLog(state: GameState, re: RegExp): number {
  let n = 0;
  for (const line of state.log) {
    if (re.test(line)) n++;
  }
  return n;
}

/** Difficulty for each seat: human proxy on humanSeat, pack elsewhere. */
export function seatDifficulties(
  players: number,
  humanSeat: number,
  humanDifficulty: AiDifficulty,
  packDifficulty: AiDifficulty,
): AiDifficulty[] {
  const h = Math.min(players - 1, Math.max(0, humanSeat));
  const human = normalizeAiDifficulty(humanDifficulty);
  const pack = normalizeAiDifficulty(packDifficulty);
  return Array.from({ length: players }, (_, i) => (i === h ? human : pack));
}

function seatSnapshot(
  state: GameState,
  winnerId: string | null,
  diffs: AiDifficulty[],
  humanSeat: number,
): SimSeatResult[] {
  return state.players.map((p, seat) => ({
    seat,
    playerId: p.id,
    name: p.name,
    propellant: p.propellant,
    moveDirection: p.moveDirection as MoveDirection,
    canBidirectional: p.canBidirectional,
    directionLocked: p.directionLocked,
    eliminated: p.eliminated,
    eliminatedOnRound: p.eliminatedOnRound,
    eliminatedReason: p.eliminatedReason,
    cash: p.cash,
    netWorth: netWorth(state, p),
    fuel: p.fuel,
    properties: p.properties.length,
    circuitsCompleted: p.circuitsCompleted,
    parkCount: p.parkCount,
    winner: winnerId !== null && p.id === winnerId,
    difficulty: diffs[seat] ?? "normal",
    isHumanProxy: seat === humanSeat,
  }));
}

function snapshotPropertyCash(state: GameState): SimPropertyCash[] {
  const led = state.propertyLedger;
  if (!led) return [];
  const out: SimPropertyCash[] = [];
  for (const row of Object.values(led)) {
    const strikes = row.strikesCollected ?? 0;
    if (
      row.claims === 0 &&
      row.invested === 0 &&
      row.rentCollected === 0 &&
      strikes === 0
    ) {
      continue;
    }
    const node = state.board.nodes[row.nodeId];
    const listPrice = node?.price ?? 0;
    out.push({
      nodeId: row.nodeId,
      name: node?.name ?? row.nodeId,
      group: node?.group ?? null,
      kind: node?.kind ?? "space",
      invested: row.invested,
      rentCollected: row.rentCollected,
      strikesCollected: strikes,
      listPrice,
      mark: bankSellValue(listPrice),
      landings: row.landings,
      claims: row.claims,
    });
  }
  return out;
}

function difficultyForCurrent(
  state: GameState,
  diffs: AiDifficulty[],
): AiDifficulty {
  const idx = state.currentPlayerIndex;
  return diffs[idx] ?? normalizeAiDifficulty(state.config.aiDifficulty);
}

export function playOneGame(opts: {
  seed: number;
  players: number;
  gameIndex: number;
  experiment: SimExperiment;
  /** @deprecated use packDifficulty; still accepted as pack default */
  aiDifficulty?: AiDifficulty;
  humanDifficulty?: AiDifficulty;
  packDifficulty?: AiDifficulty;
  humanSeat?: number;
  maxTurns?: number;
}): SimGameResult {
  const maxTurns = opts.maxTurns ?? DEFAULT_MAX_TURNS;
  const pack = normalizeAiDifficulty(
    opts.packDifficulty ?? opts.aiDifficulty ?? "normal",
  );
  const human = normalizeAiDifficulty(opts.humanDifficulty ?? pack);
  const humanSeat = Math.min(
    opts.players - 1,
    Math.max(0, opts.humanSeat ?? 0),
  );
  const diffs = seatDifficulties(opts.players, humanSeat, human, pack);

  let state: GameState = createGame({
    playerCount: opts.players,
    humanSeat: false,
    seed: opts.seed,
    maxRounds: 0,
    // Config field is pack skill; human override is applied per action
    aiDifficulty: pack,
  });
  applyExperiment(state, opts.experiment);
  state.propertyLedger = {};

  let turns = 0;
  while (state.phase !== "game_over" && turns < maxTurns) {
    // Cards have no UI in sim — dismiss so the next round can fire.
    if (state.pendingAnnouncement) state.pendingAnnouncement = null;
    state = resolveDuelAiFully(state);
    if (state.phase === "game_over") break;
    if (state.pendingCharterChoice) {
      state = resolveCharterChoiceIfAi(state);
      turns++;
      continue;
    }
    if (state.pendingAuction) {
      state = resolveAuctionIfAi(state);
      turns++;
      continue;
    }

    if (state.phase === "await_duel") {
      const d = difficultyForCurrent(state, diffs);
      state = applyAction(state, heuristicAI(state, d));
      turns++;
      continue;
    }

    const p = currentPlayer(state);
    if (p.eliminated) {
      state = applyAction(state, { type: "end_turn" });
      turns++;
      continue;
    }

    const d = difficultyForCurrent(state, diffs);
    let action = heuristicAI(state, d);
    const legal = getLegalActions(state);
    if (
      state.phase === "await_move" &&
      action.type !== "move" &&
      action.type !== "set_break" &&
      action.type !== "set_direction"
    ) {
      action = { type: "move" };
    }
    if (action.type === "end_turn" && !legal.endTurn) action = { type: "roll" };
    if (action.type === "roll" && !legal.roll) action = { type: "end_turn" };
    if (action.type === "move" && !legal.move) {
      action = { type: "set_break", spaces: 0 };
    }
    if (action.type === "buy" && !legal.buy) action = { type: "end_turn" };
    state = applyAction(state, action);
    turns++;
  }

  const unfinished = state.phase !== "game_over";
  const winnerId = unfinished ? null : state.winnerId;
  const winnerName = winnerId
    ? (state.players.find((x) => x.id === winnerId)?.name ?? winnerId)
    : null;
  const winnerSeat = winnerId
    ? state.players.findIndex((x) => x.id === winnerId)
    : -1;
  const humanWon = unfinished
    ? null
    : winnerSeat === humanSeat;

  return {
    schemaVersion: 1,
    gameIndex: opts.gameIndex,
    seed: opts.seed,
    unfinished,
    winnerId,
    winnerName,
    endReason: unfinished ? "max_turns" : state.endReason,
    rounds: state.round,
    turns,
    counters: {
      duelLines: countLog(state, /\bduel\b/i),
      feralLines: countLog(state, /\bferal\b/i),
      depotPlaceLines: countLog(state, /\bdepot\b/i),
      claimLines: countLog(state, /\bclaims\b/i),
    },
    seats: seatSnapshot(state, winnerId, diffs, humanSeat),
    humanWon,
    propertyCash: snapshotPropertyCash(state),
  };
}
