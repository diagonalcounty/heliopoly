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
}
