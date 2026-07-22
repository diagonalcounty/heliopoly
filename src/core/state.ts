import { createV0Board } from "./board";
import { formatMoney } from "./currency";
import { PROPELLANTS } from "./propellant";
import type { GameConfig, GameState, Player, PropellantId } from "./types";

const COLORS = ["#6ec8ff", "#ffc857", "#5ddea0", "#ff6b7a", "#c792ea", "#ff9f43"];

export const DEFAULT_CONFIG: GameConfig = {
  playerCount: 4,
  humanSeat: true,
  humanPropellant: "methane",
  startingCash: 1500,
  startingFuel: 20,
  stationsEach: 3,
  maxFuel: 25,
  maxRounds: 40,
};

function pickAiPropellant(index: number, seed: number): PropellantId {
  const bit = (seed + index * 17) & 1;
  return bit === 0 ? "methane" : "hydrogen";
}

export function createGame(partial: Partial<GameConfig> = {}): GameState {
  const config: GameConfig = { ...DEFAULT_CONFIG, ...partial };
  const count = Math.min(6, Math.max(2, config.playerCount));
  config.playerCount = count;

  const board = createV0Board();
  const seed = config.seed ?? (Date.now() >>> 0);
  const players: Player[] = [];

  for (let i = 0; i < count; i++) {
    const isHuman = config.humanSeat && i === 0;
    const propellant: PropellantId = isHuman
      ? config.humanPropellant
      : pickAiPropellant(i, seed);
    players.push({
      id: `p${i}`,
      name: isHuman ? "You" : `AI ${i}`,
      color: COLORS[i % COLORS.length],
      agent: isHuman ? "human" : "ai",
      cash: config.startingCash,
      fuel: config.startingFuel,
      position: board.startId,
      propellant,
      properties: [],
      stationsInHand: config.stationsEach,
      eliminated: false,
      skipTurns: 0,
      rentWaiversAgainst: [],
      ephemerisBodyId: null,
      circuitActive: false,
    });
  }

  if (!config.humanSeat) {
    for (let i = 0; i < players.length; i++) {
      players[i].name = `AI ${i}`;
      players[i].agent = "ai";
      players[i].propellant = pickAiPropellant(i, seed);
    }
  }

  const propSummary = players
    .map((p) => `${p.name}:${PROPELLANTS[p.propellant].short}`)
    .join(" · ");

  return {
    board,
    players,
    owners: {},
    stations: {},
    currentPlayerIndex: 0,
    phase: "await_action",
    round: 1,
    lastRoll: null,
    log: [
      `Heliopoly · Free Enterprise In Space`,
      `Game start: ${count} pilots · seed ${seed} · bank ${formatMoney(config.startingCash)} each`,
      `Propellants: ${propSummary}`,
      `Path: Earth→Venus→Mercury→Mars→Belt→Jupiter→Saturn→Earth`,
      `Monopoly rent ×2 · feral after 10 board rotations · depots lost on feral/out`,
      config.humanSeat
        ? "Seat 0 is human; others AI."
        : "Self-play: all seats AI.",
    ],
    turnDeltas: [],
    diceTotals: [],
    pendingDuel: null,
    lastDuelResult: null,
    encounterMem: {},
    boardRotations: 0,
    claimCareRotations: {},
    winnerId: null,
    endReason: null,
    config: { ...config, seed },
    rngState: seed || 1,
  };
}

export function livingPlayers(state: GameState): Player[] {
  return state.players.filter((p) => !p.eliminated);
}

export function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

export function cloneState(state: GameState): GameState {
  return {
    ...state,
    board: state.board,
    players: state.players.map((p) => ({
      ...p,
      properties: [...p.properties],
      rentWaiversAgainst: [...p.rentWaiversAgainst],
    })),
    owners: { ...state.owners },
    stations: { ...state.stations },
    lastRoll: state.lastRoll ? { ...state.lastRoll } : null,
    log: [...state.log],
    turnDeltas: [...state.turnDeltas],
    diceTotals: [...state.diceTotals],
    pendingDuel: state.pendingDuel
      ? {
          ...state.pendingDuel,
          challengerRoll: state.pendingDuel.challengerRoll
            ? { ...state.pendingDuel.challengerRoll }
            : null,
          defenderRoll: state.pendingDuel.defenderRoll
            ? { ...state.pendingDuel.defenderRoll }
            : null,
        }
      : null,
    lastDuelResult: state.lastDuelResult
      ? {
          ...state.lastDuelResult,
          challengerRoll: { ...state.lastDuelResult.challengerRoll },
          defenderRoll: { ...state.lastDuelResult.defenderRoll },
        }
      : null,
    encounterMem: { ...state.encounterMem },
    claimCareRotations: { ...state.claimCareRotations },
    config: { ...state.config },
  };
}
