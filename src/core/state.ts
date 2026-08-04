import { createV0Board } from "./board";
import { formatMoney } from "./currency";
import { pickAiNames, sanitizePilotName } from "./pilotNames";
import { PROPELLANTS } from "./propellant";
import { tickSeatTurn } from "./turnClock";
import type { GameConfig, GameState, Player, PropellantId } from "./types";

const COLORS = ["#6ec8ff", "#ffc857", "#5ddea0", "#ff6b7a", "#c792ea", "#ff9f43"];

export const DEFAULT_CONFIG: GameConfig = {
  playerCount: 4,
  humanSeat: true,
  humanName: "Venture",
  humanPropellant: "methane",
  aiDifficulty: "normal",
  startingCash: 1500,
  startingFuel: 20,
  stationsEach: 3,
  maxFuel: 25,
  maxRounds: 0, // 0 = no round limit; game ends by elimination only
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
  const humanLabel = sanitizePilotName(config.humanName ?? "", "Venture");
  /** Dev / playtest cheat: callsign "Heliopolis" → 4× starting cash. */
  const heliopolisCheat =
    config.humanSeat && /^heliopolis$/i.test(humanLabel.trim());
  const humanCash = heliopolisCheat
    ? config.startingCash * 4
    : config.startingCash;
  const aiNeeded = config.humanSeat ? count - 1 : count;
  const aiNames = pickAiNames(aiNeeded, seed);
  let aiIdx = 0;

  for (let i = 0; i < count; i++) {
    const isHuman = config.humanSeat && i === 0;
    const propellant: PropellantId = isHuman
      ? config.humanPropellant
      : pickAiPropellant(i, seed);
    const name = isHuman
      ? humanLabel
      : (aiNames[aiIdx++] ?? `Pilot ${i + 1}`);
    players.push({
      id: `p${i}`,
      name,
      color: COLORS[i % COLORS.length],
      agent: isHuman ? "human" : "ai",
      cash: isHuman ? humanCash : config.startingCash,
      fuel: config.startingFuel,
      position: board.startId,
      propellant,
      properties: [],
      stationsInHand: config.stationsEach,
      eliminated: false,
      eliminatedOnTurn: null,
      eliminatedOnRound: null,
      eliminatedReason: null,
      skipTurns: 0,
      rentWaiversAgainst: [],
      ephemerisBodyId: null,
      circuitActive: false,
      circuitsCompleted: 0,
      neglectClock: 0,
      skippedRoll: false,
      rolledThisTurn: false,
      movedThisTurn: false,
      parkCount: 0,
      pendingLeak: false,
      monolithEarthPending: false,
      freeBreakPending: false,
      warpCharges: 0,
    });
  }

  if (!config.humanSeat) {
    aiIdx = 0;
    const allAi = pickAiNames(count, seed ^ 0x9e37);
    for (let i = 0; i < players.length; i++) {
      players[i].name = allAi[i] ?? `Pilot ${i + 1}`;
      players[i].agent = "ai";
      players[i].propellant = pickAiPropellant(i, seed);
    }
  }

  const propSummary = players
    .map((p) => `${p.name}:${PROPELLANTS[p.propellant].short}`)
    .join(" · ");

  const state: GameState = {
    board,
    players,
    owners: {},
    stations: {},
    currentPlayerIndex: 0,
    phase: "await_action",
    round: 1,
    gameTurn: 0,
    lastRoll: null,
    breakSpaces: 0,
    log: [
      `Heliopoly · Free Enterprise In Space`,
      `Game start: ${count} pilots · bank ${formatMoney(config.startingCash)} each`,
      `Propellants: ${propSummary}`,
      `Path: Earth→Venus→Mercury→Mars→Belt→Jupiter→Saturn→Earth`,
      `Monopoly rent ×2 · park 5+ no-move → feral risk (50% then doubles) · depots lost on feral/out`,
      `Earth: land ⍼400 / pass ⍼200 (+⍼10 per your rotations) · ⍼1000 at rotation 10/20/30…`,
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
    gusherPaid: {},
    pendingAnnouncement: null,
    timedEvent: {
      roundsSinceLast: 0,
      lastProcessedRound: 0,
      rollChance: 0,
      lastEventId: null,
      firedIds: [],
    },
    config: { ...config, seed },
    rngState: seed || 1,
  };

  // Seed + AI difficulty for bug reports — not the player log (#56)
  if (typeof console !== "undefined" && console.debug) {
    console.debug(
      `[heliopoly] seed ${seed} · AI ${config.aiDifficulty}${
        config.humanSeat ? ` · human ${PROPELLANTS[config.humanPropellant].short}` : " · self-play"
      }`,
    );
  }

  // First seat turn: tick clock + timed events before first dice roll
  tickSeatTurn(state);
  const opener = state.players[0];
  state.log.push(
    `— Turn ${state.gameTurn} · Round ${state.round}: ${opener.name}'s turn —`,
  );
  if (heliopolisCheat) {
    state.log.push(
      `Genesis injection: callsign Heliopolis — AIL seed funding ×4 (${formatMoney(humanCash)}).`,
    );
  }
  return state;
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
    gusherPaid: { ...state.gusherPaid },
    pendingAnnouncement: state.pendingAnnouncement
      ? { ...state.pendingAnnouncement }
      : null,
    timedEvent: {
      ...state.timedEvent,
      firedIds: [...(state.timedEvent.firedIds ?? [])],
    },
    config: { ...state.config },
  };
}
