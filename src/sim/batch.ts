/**
 * Shared batch runner for CLI (`run.ts`) and Sim Lab (#91).
 */
import { mkdirSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import type { AiDifficulty } from "../core/types";
import { playOneGame, DEFAULT_MAX_TURNS, DEFAULT_SEED_STRIDE } from "./play";
import type {
  SimExperiment,
  SimGameResult,
  SimRunConfig,
  SimSummary,
} from "./types";

export interface BatchParams {
  games: number;
  players: number;
  baseSeed: number;
  seedStride?: number;
  maxTurns?: number;
  experiment: SimExperiment;
  aiDifficulty: AiDifficulty;
  /** Optional directory to write config / ndjson / summary */
  saveDir?: string;
  runId?: string;
  cliArgs?: string[];
  /** Keep last N full game records for UI sample (default 30) */
  sampleLimit?: number;
  onProgress?: (p: {
    done: number;
    total: number;
    rate: number;
    etaSec: number;
  }) => void;
}

export function gitCommitShort(): string {
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

export function makeRunId(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `run-${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

export function runBatch(params: BatchParams): {
  summary: SimSummary;
  sampleGames: SimGameResult[];
  outDir?: string;
} {
  const games = Math.max(1, Math.floor(params.games));
  const players = Math.min(6, Math.max(2, Math.floor(params.players)));
  const baseSeed = params.baseSeed >>> 0;
  const seedStride = params.seedStride ?? DEFAULT_SEED_STRIDE;
  const maxTurns = params.maxTurns ?? DEFAULT_MAX_TURNS;
  const sampleLimit = params.sampleLimit ?? 30;
  const runId = params.runId ?? makeRunId();

  const config: SimRunConfig = {
    schemaVersion: 1,
    runId,
    createdAt: new Date().toISOString(),
    gitCommit: gitCommitShort(),
    engine: "typescript-core",
    engineNote:
      "Live src/core/**; Sim Lab / CLI share playOneGame + batch runner (#89 #91).",
    games,
    players,
    baseSeed,
    seedStride,
    maxTurns,
    experiment: params.experiment,
    aiDifficulty: params.aiDifficulty,
    cliArgs: params.cliArgs ?? [],
  };

  let outDir: string | undefined;
  let ndjsonPath: string | undefined;
  if (params.saveDir) {
    outDir = params.saveDir;
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "config.json"), JSON.stringify(config, null, 2));
    ndjsonPath = join(outDir, "games.ndjson");
    if (existsSync(ndjsonPath)) writeFileSync(ndjsonPath, "");
  }

  const winsByName: Record<string, number> = {};
  const winsBySeat: Record<string, number> = {};
  const winsByDirection: Record<string, number> = {};
  const winsByPropellant: Record<string, number> = {};

  let totalRounds = 0;
  let totalTurns = 0;
  let unfinished = 0;
  const sampleGames: SimGameResult[] = [];

  const t0 = Date.now();
  const progressEvery = Math.max(1, Math.floor(games / 25));

  for (let i = 0; i < games; i++) {
    const seed = (baseSeed + i * seedStride) >>> 0;
    const game = playOneGame({
      seed,
      players,
      gameIndex: i,
      experiment: params.experiment,
      aiDifficulty: params.aiDifficulty,
      maxTurns,
    });

    if (ndjsonPath) {
      appendFileSync(ndjsonPath, `${JSON.stringify(game)}\n`);
    }
    if (sampleGames.length < sampleLimit) {
      sampleGames.push(game);
    }

    totalRounds += game.rounds;
    totalTurns += game.turns;
    if (game.unfinished) {
      unfinished++;
      // progress only
    } else {
      // Game-level: count the winner once (not every seat) — #91 metric fix
      const winner =
        game.seats.find((s) => s.winner) ??
        game.seats.find((s) => s.playerId === game.winnerId);
      if (winner) {
        const name = game.winnerName ?? winner.name;
        winsByName[name] = (winsByName[name] ?? 0) + 1;
        const seatKey = String(winner.seat);
        const dirKey = winner.moveDirection;
        const propKey = winner.propellant;
        winsBySeat[seatKey] = (winsBySeat[seatKey] ?? 0) + 1;
        winsByDirection[dirKey] = (winsByDirection[dirKey] ?? 0) + 1;
        winsByPropellant[propKey] = (winsByPropellant[propKey] ?? 0) + 1;
      }
    }

    if (
      params.onProgress &&
      ((i + 1) % progressEvery === 0 || i + 1 === games)
    ) {
      const elapsed = (Date.now() - t0) / 1000;
      const rate = (i + 1) / Math.max(elapsed, 1e-6);
      const left = games - (i + 1);
      params.onProgress({
        done: i + 1,
        total: games,
        rate,
        etaSec: left / Math.max(rate, 1e-6),
      });
    }
  }

  const finishedGames = games - unfinished;
  /** Share of finished games won by this key (rates sum to ~100%). */
  function shareOfFinished(
    wins: Record<string, number>,
  ): Record<string, { n: number; wins: number; rate: number }> {
    const out: Record<string, { n: number; wins: number; rate: number }> = {};
    for (const [key, w] of Object.entries(wins)) {
      out[key] = {
        n: finishedGames,
        wins: w,
        rate: finishedGames > 0 ? w / finishedGames : 0,
      };
    }
    return out;
  }

  const wallMs = Date.now() - t0;
  const summary: SimSummary = {
    schemaVersion: 1,
    runId,
    config,
    games,
    unfinished,
    unfinishedRate: unfinished / games,
    meanRounds: totalRounds / games,
    meanTurns: totalTurns / games,
    wallMs,
    gamesPerSec: games / Math.max(wallMs / 1000, 1e-6),
    winsByName,
    winsBySeat,
    winsByDirection,
    winsByPropellant,
    winRateByDirection: shareOfFinished(winsByDirection),
    winRateByPropellant: shareOfFinished(winsByPropellant),
    winRateBySeat: shareOfFinished(winsBySeat),
    finishedGames,
  };

  if (outDir) {
    writeFileSync(join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  }

  return { summary, sampleGames, outDir };
}
