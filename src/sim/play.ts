import { heuristicAI } from "../core/agents";
import { applyAction, getLegalActions, netWorth, resolveDuelAiFully } from "../core/rules";
import { createGame, currentPlayer } from "../core/state";
import type { AiDifficulty, GameState, MoveDirection } from "../core/types";
import type { SimExperiment, SimGameResult, SimSeatResult } from "./types";

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
        // Every seat may pick direction once (AI heuristic).
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
        // Palindrome callsigns keep hidden #47 unlock; others stay prograde.
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

function seatSnapshot(state: GameState, winnerId: string | null): SimSeatResult[] {
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
  }));
}

export function playOneGame(opts: {
  seed: number;
  players: number;
  gameIndex: number;
  experiment: SimExperiment;
  aiDifficulty: AiDifficulty;
  maxTurns?: number;
}): SimGameResult {
  const maxTurns = opts.maxTurns ?? DEFAULT_MAX_TURNS;
  let state: GameState = createGame({
    playerCount: opts.players,
    humanSeat: false,
    seed: opts.seed,
    maxRounds: 0,
    aiDifficulty: opts.aiDifficulty,
  });
  applyExperiment(state, opts.experiment);

  let turns = 0;
  while (state.phase !== "game_over" && turns < maxTurns) {
    state = resolveDuelAiFully(state);
    if (state.phase === "game_over") break;

    if (state.phase === "await_duel") {
      state = applyAction(state, heuristicAI(state));
      turns++;
      continue;
    }

    const p = currentPlayer(state);
    if (p.eliminated) {
      state = applyAction(state, { type: "end_turn" });
      turns++;
      continue;
    }

    let action = heuristicAI(state);
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
    seats: seatSnapshot(state, winnerId),
  };
}
