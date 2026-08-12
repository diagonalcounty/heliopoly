/**
 * Shared batch runner for CLI (`run.ts`) and Sim Lab (#91).
 */
import { mkdirSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { normalizeAiDifficulty, type AiDifficulty } from "../core/types";
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
  /** Pack (non-human) skill; alias for packDifficulty */
  aiDifficulty?: AiDifficulty;
  humanDifficulty?: AiDifficulty;
  packDifficulty?: AiDifficulty;
  humanSeat?: number;
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

const LEVEL_LABEL: Record<AiDifficulty, string> = {
  easy: "easy (novice)",
  normal: "normal",
  hard: "hard",
  expert: "expert",
};

/** Deterministic plain-language summary (no LLM). */
export function buildOutcomeSummary(opts: {
  players: number;
  humanSeat: number;
  humanDifficulty: AiDifficulty;
  packDifficulty: AiDifficulty;
  finishedGames: number;
  humanWins: number;
  humanWinRate: number;
  fairShare: number;
  winRateBySeat: Record<string, { n: number; wins: number; rate: number }>;
  winRateByPropellant: Record<
    string,
    { n: number; wins: number; rate: number }
  >;
  experiment: SimExperiment;
  unfinished: number;
  games: number;
}): string {
  const {
    players,
    humanSeat,
    humanDifficulty,
    packDifficulty,
    finishedGames,
    humanWins,
    humanWinRate,
    fairShare,
    winRateBySeat,
    winRateByPropellant,
    experiment,
    unfinished,
    games,
  } = opts;

  if (finishedGames <= 0) {
    return `No finished games (${unfinished} unfinished of ${games}). Increase max turns or lower game length pressure.`;
  }

  const lines: string[] = [];
  const hLab = LEVEL_LABEL[humanDifficulty];
  const pLab = LEVEL_LABEL[packDifficulty];
  const fairPct = (100 * fairShare).toFixed(1);
  const humPct = (100 * humanWinRate).toFixed(1);
  const liftPp = 100 * (humanWinRate - fairShare);
  const mixedSkill = humanDifficulty !== packDifficulty;

  lines.push(
    `Setup: seat ${humanSeat} is the human proxy at ${hLab}; the other ${players - 1} seat(s) play at ${pLab}. Experiment=${experiment}.`,
  );
  lines.push(
    `Human proxy won ${humanWins} of ${finishedGames} finished games (${humPct}%). Fair share with ${players} equal seats would be ~${fairPct}% each.`,
  );

  if (!mixedSkill) {
    lines.push(
      `All seats used the same skill (${hLab}). Launch-order win rates near ${fairPct}% mean the table is skill-even — dice and early landings dominate, which is healthy for AI-vs-AI balance.`,
    );
  } else if (humanWinRate + 0.02 < fairShare) {
    lines.push(
      `Human at ${hLab} underperforms fair share by ${Math.abs(liftPp).toFixed(1)} percentage points against a ${pLab} pack — the higher skill level is converting into more wins via better break/travel decisions, not seat order alone.`,
    );
  } else if (humanWinRate > fairShare + 0.02) {
    lines.push(
      `Human at ${hLab} beats fair share by ${liftPp.toFixed(1)} percentage points vs a ${pLab} pack — the proxy’s skill edge is visible over ${finishedGames} finished games.`,
    );
  } else {
    lines.push(
      `Human (${hLab}) vs pack (${pLab}) is near fair share (${humPct}% vs ${fairPct}%). Skill gap may be small at this N, or board variance is washing out the difference — try more games.`,
    );
  }

  // Seat ranking
  const seats = Object.entries(winRateBySeat)
    .map(([k, v]) => ({ seat: Number(k), rate: v.rate, wins: v.wins }))
    .sort((a, b) => b.rate - a.rate);
  if (seats.length) {
    const top = seats[0]!;
    const bot = seats[seats.length - 1]!;
    lines.push(
      `Launch order: strongest seat ${top.seat} (${(100 * top.rate).toFixed(1)}% wins), weakest seat ${bot.seat} (${(100 * bot.rate).toFixed(1)}%).`,
    );
  }

  const props = Object.entries(winRateByPropellant).sort(
    (a, b) => b[1].rate - a[1].rate,
  );
  if (props.length >= 2) {
    const [a, b] = props;
    const gap = 100 * (a![1].rate - b![1].rate);
    if (Math.abs(gap) >= 3) {
      lines.push(
        `Propellant: winners favored ${a![0]} (${(100 * a![1].rate).toFixed(1)}%) over ${b![0]} (${(100 * b![1].rate).toFixed(1)}%) — gap ${gap.toFixed(1)} pp among game winners.`,
      );
    } else {
      lines.push(
        `Propellant split among winners is fairly even (CH₄ vs H₂ within ~3 pp).`,
      );
    }
  }

  if (unfinished > 0) {
    lines.push(
      `Note: ${unfinished} games hit the turn cap (unfinished) and are excluded from win shares.`,
    );
  }

  return lines.join(" ");
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
  const packDifficulty = normalizeAiDifficulty(
    params.packDifficulty ?? params.aiDifficulty ?? "normal",
  );
  const humanDifficulty = normalizeAiDifficulty(
    params.humanDifficulty ?? packDifficulty,
  );
  const humanSeat = Math.min(
    players - 1,
    Math.max(0, params.humanSeat ?? 0),
  );

  const config: SimRunConfig = {
    schemaVersion: 1,
    runId,
    createdAt: new Date().toISOString(),
    gitCommit: gitCommitShort(),
    engine: "typescript-core",
    engineNote:
      "Live src/core/**; Sim Lab / CLI share playOneGame + batch runner (#89 #91). Human proxy seat uses humanDifficulty; others packDifficulty.",
    games,
    players,
    baseSeed,
    seedStride,
    maxTurns,
    experiment: params.experiment,
    aiDifficulty: packDifficulty,
    humanDifficulty,
    packDifficulty,
    humanSeat,
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
  let humanWins = 0;
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
      humanDifficulty,
      packDifficulty,
      humanSeat,
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
    } else {
      // Game-level: count the winner once (not every seat)
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
        if (game.humanWon || winner.seat === humanSeat) humanWins++;
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
  const fairShare = 1 / players;
  const humanWinRate = finishedGames > 0 ? humanWins / finishedGames : 0;
  const winRateByDirection = shareOfFinished(winsByDirection);
  const winRateByPropellant = shareOfFinished(winsByPropellant);
  const winRateBySeat = shareOfFinished(winsBySeat);
  const outcomeSummary = buildOutcomeSummary({
    players,
    humanSeat,
    humanDifficulty,
    packDifficulty,
    finishedGames,
    humanWins,
    humanWinRate,
    fairShare,
    winRateBySeat,
    winRateByPropellant,
    experiment: params.experiment,
    unfinished,
    games,
  });

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
    winRateByDirection,
    winRateByPropellant,
    winRateBySeat,
    finishedGames,
    humanWins,
    humanWinRate,
    fairShare,
    humanLiftVsFair: humanWinRate - fairShare,
    outcomeSummary,
  };

  if (outDir) {
    writeFileSync(join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  }

  return { summary, sampleGames, outDir };
}
