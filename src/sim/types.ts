/**
 * Stable JSON schema for batch sims (#89).
 * Field names are intentional — keep stable so report scripts / AI can load runs later.
 */

import type { AiDifficulty, MoveDirection, PropellantId } from "../core/types";

export type SimExperiment =
  | "default"
  | "prograde"
  | "retrograde"
  | "choice"
  | "mixed";

export interface SimRunConfig {
  schemaVersion: 1;
  runId: string;
  createdAt: string;
  gitCommit: string;
  engine: "typescript-core";
  engineNote: string;
  games: number;
  players: number;
  baseSeed: number;
  /** seed_i = baseSeed + i * seedStride */
  seedStride: number;
  maxTurns: number;
  experiment: SimExperiment;
  /**
   * Legacy single-table difficulty (equals `aiDifficulty` when mixed skill).
   * Prefer humanDifficulty + aiDifficulty.
   */
  aiDifficulty: AiDifficulty;
  /** Skill for the human-proxy seat (same scale as AI: easy…expert). */
  humanDifficulty: AiDifficulty;
  /** Skill for all other seats. */
  packDifficulty: AiDifficulty;
  /** Seat index treated as human proxy (default 0 = first to launch). */
  humanSeat: number;
  cliArgs: string[];
}

export interface SimSeatResult {
  seat: number;
  playerId: string;
  name: string;
  propellant: PropellantId;
  /** Final locked (or last) travel direction. */
  moveDirection: MoveDirection;
  canBidirectional: boolean;
  directionLocked: boolean;
  eliminated: boolean;
  eliminatedOnRound: number | null;
  eliminatedReason: string | null;
  cash: number;
  netWorth: number;
  fuel: number;
  properties: number;
  circuitsCompleted: number;
  parkCount: number;
  winner: boolean;
  /** Skill used for this seat in the sim (human proxy or pack). */
  difficulty: AiDifficulty;
  isHumanProxy: boolean;
}

/** Per-node cash in one game (only nodes that were claimed or collected rent). */
export interface SimPropertyCash {
  nodeId: string;
  name: string;
  group: string | null;
  kind: string;
  invested: number;
  rentCollected: number;
  /** Fuel-strike cash; 0/omit when the ledger does not track strikes. */
  strikesCollected?: number;
  /** Board list price (MSRP). */
  listPrice?: number;
  /** Bank dump floor: half list via bankSellValue; depot not included. */
  mark?: number;
  landings: number;
  claims: number;
}

export interface SimGameResult {
  schemaVersion: 1;
  gameIndex: number;
  seed: number;
  unfinished: boolean;
  winnerId: string | null;
  winnerName: string | null;
  endReason: string | null;
  rounds: number;
  turns: number;
  /** Log-derived counters (approximate; stable enough for A/B). */
  counters: {
    duelLines: number;
    feralLines: number;
    depotPlaceLines: number;
    claimLines: number;
  };
  seats: SimSeatResult[];
  /** Seat 0 (or humanSeat) won this finished game. */
  humanWon: boolean | null;
  /** Empirical claim+depot spend vs income + mark (#127 / #142). */
  propertyCash: SimPropertyCash[];
}

/** Batch-level property books (finished games). Array name `propertyRoi` is stable. */
export interface PropertyRoiRow {
  nodeId: string;
  name: string;
  group: string | null;
  kind: string;
  /** Finished games where this node was claimed or collected rent. */
  n: number;
  meanInvested: number;
  /** Rent-only mean (strikes excluded when the ledger splits them). */
  meanRentCollected: number;
  /**
   * Rent + fuel strikes when the ledger tracked them; else same as rent.
   * UI / reports read this as income.
   */
  meanIncome: number;
  /** Half list (bank floor via bankSellValue); depot cash is not included. */
  meanMark: number;
  meanLandings: number;
  /** mean(income + mark − invested) — bank-exit book. */
  meanBankExitNet: number;
  /** Pooled income / invested; null if nothing was paid. Demoted old ROI%. */
  roiCash: number | null;
  /**
   * @deprecated alias of meanBankExitNet so old "net" includes residual mark.
   */
  meanNet: number;
  /** @deprecated alias of roiCash */
  roi: number | null;
  /** Mean of per-game income/invested where invested > 0. */
  meanRoi: number | null;
}

export interface SimSummary {
  schemaVersion: 1;
  runId: string;
  config: SimRunConfig;
  games: number;
  unfinished: number;
  unfinishedRate: number;
  meanRounds: number;
  meanTurns: number;
  wallMs: number;
  gamesPerSec: number;
  winsByName: Record<string, number>;
  winsBySeat: Record<string, number>;
  winsByDirection: Record<string, number>;
  winsByPropellant: Record<string, number>;
  /**
   * Share of **finished games** whose **winner** had this attribute.
   * `n` = finished game count (same denominator for every row).
   * `rate` = wins / n — rates across keys sum to ~1.0 (e.g. all-retro → backward 100%).
   * Not seat-observations (that wrongly baselined 4-player tables at 25%).
   */
  winRateByDirection: Record<string, { n: number; wins: number; rate: number }>;
  winRateByPropellant: Record<
    string,
    { n: number; wins: number; rate: number }
  >;
  winRateBySeat: Record<string, { n: number; wins: number; rate: number }>;
  /** Finished games used as denominator for win-rate tables. */
  finishedGames: number;
  /** Finished games won by human-proxy seat. */
  humanWins: number;
  /** humanWins / finishedGames */
  humanWinRate: number;
  /** 1 / players */
  fairShare: number;
  /** humanWinRate − fairShare (percentage points as fraction) */
  humanLiftVsFair: number;
  /**
   * Plain-language, non-LLM narrative for operators
   * (human skill vs pack, seat bias, propellant, etc.).
   */
  outcomeSummary: string;
  /**
   * When human proxy **loses**: distribution of elimination rounds vs game length.
   * Example story: human out ~R15, pack AIs out later, game ends ~R55.
   */
  humanLossTiming: HumanLossTiming | null;
  /**
   * Place-order elimination densities for **all finished games**
   * (horizontal axis = game round; KDE-style curves like classic sim charts).
   */
  eliminationPlaceCurves: EliminationPlaceCurves | null;
  /**
   * Claimable bodies ranked by bank-exit book (#142): mark + income − invested.
   * `roiCash` is the demoted old rent/invested ratio. Earth investor cash is
   * not folded in — rows are claimable bodies only.
   */
  propertyRoi: PropertyRoiRow[];
}

/** One density curve along the round axis (precomputed for the browser). */
export interface DensityCurve {
  label: string;
  /** Short id for styling: seat0 | seat1 | … | gameEnd | firstOut | … */
  id: string;
  mean: number;
  p50: number;
  n: number;
  /**
   * Stroke/fill color — seat curves use the same palette as the board
   * (`#6ec8ff`, `#ffc857`, …).
   */
  color: string;
  /** Seat index when this curve is a player; omit for aggregate series. */
  seat?: number;
  /** Evenly spaced x from 0..xMax */
  xs: number[];
  /** Density y (same length as xs) */
  ys: number[];
}

/**
 * Per-seat elimination densities (when each rocket leaves / wins).
 * Seat colors match `createGame` board palette.
 */
export interface EliminationPlaceCurves {
  games: number;
  xMax: number;
  curves: DensityCurve[];
  caption: string;
}

/** Board rocket colors — keep in sync with `src/core/state.ts` COLORS. */
export const SIM_PLAYER_COLORS = [
  "#6ec8ff",
  "#ffc857",
  "#5ddea0",
  "#ff6b7a",
  "#c792ea",
  "#ff9f43",
] as const;

/** Histogram bucket for round-number distributions. */
export interface RoundHistBucket {
  /** Inclusive low round (1-based game rounds). */
  lo: number;
  /** Inclusive high round. */
  hi: number;
  label: string;
  count: number;
}

export interface RoundDist {
  n: number;
  min: number;
  max: number;
  mean: number;
  p25: number;
  p50: number;
  p75: number;
  /** Fixed-width buckets for charts (empty if n=0). */
  histogram: RoundHistBucket[];
}

/**
 * Aggregates only over finished games where human proxy did **not** win.
 * Rounds are game `round` values (same as eliminatedOnRound / game length).
 */
export interface HumanLossTiming {
  /** Finished games human lost. */
  games: number;
  /** When the human seat was eliminated (or game end if never tagged). */
  humanElimRound: RoundDist;
  /** Full game length (winner’s last round / state.round). */
  gameLengthRounds: RoundDist;
  /**
   * Elimination rounds of pack seats (AI) in those same games —
   * each AI seat that left contributes one sample.
   */
  packElimRound: RoundDist;
  /**
   * Median gap: gameLength − humanElim (how long the table runs after human is out).
   */
  medianRoundsAfterHumanOut: number;
  /** Short caption for the chart. */
  caption: string;
}
