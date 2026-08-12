/**
 * Batch gameplay sim harness (#89).
 *
 * Usage (from repo root):
 *   npm run sim -- --games 100 --experiment retrograde
 *   npx tsx src/sim/run.ts --help
 *
 * See scripts/README-sim.md
 */

import { mkdirSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";
import { normalizeAiDifficulty, type AiDifficulty } from "../core/types";
import { playOneGame, DEFAULT_MAX_TURNS, DEFAULT_SEED_STRIDE } from "./play";
import type {
  SimExperiment,
  SimGameResult,
  SimRunConfig,
  SimSummary,
} from "./types";

const EXPERIMENTS: SimExperiment[] = [
  "default",
  "prograde",
  "retrograde",
  "choice",
  "mixed",
];

function gitCommit(): string {
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

function parseArgs(argv: string[]): {
  games: number;
  players: number;
  baseSeed: number;
  experiment: SimExperiment;
  aiDifficulty: AiDifficulty;
  out?: string;
  maxTurns: number;
  seedStride: number;
  help: boolean;
  quiet: boolean;
} {
  let games = 100;
  let players = 4;
  let baseSeed = 1000;
  let experiment: SimExperiment = "default";
  let aiDifficulty: AiDifficulty = "normal";
  let out: string | undefined;
  let maxTurns = DEFAULT_MAX_TURNS;
  let seedStride = DEFAULT_SEED_STRIDE;
  let help = false;
  let quiet = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    const next = () => argv[++i] ?? "";
    if (a === "--help" || a === "-h") help = true;
    else if (a === "--quiet" || a === "-q") quiet = true;
    else if (a === "--games" || a === "-n") games = Math.max(1, Number(next()) || 1);
    else if (a === "--players" || a === "-p")
      players = Math.min(6, Math.max(2, Number(next()) || 4));
    else if (a === "--seed") baseSeed = Number(next()) >>> 0;
    else if (a === "--seed-stride")
      seedStride = Math.max(1, Number(next()) || DEFAULT_SEED_STRIDE);
    else if (a === "--max-turns")
      maxTurns = Math.max(100, Number(next()) || DEFAULT_MAX_TURNS);
    else if (a === "--experiment" || a === "-e") {
      const v = next() as SimExperiment;
      if (!EXPERIMENTS.includes(v)) {
        console.error(
          `Unknown experiment "${v}". Use: ${EXPERIMENTS.join(", ")}`,
        );
        process.exit(2);
      }
      experiment = v;
    } else if (a === "--difficulty" || a === "-d") {
      aiDifficulty = normalizeAiDifficulty(next());
    } else if (a === "--out" || a === "-o") out = next();
    else if (a.startsWith("-")) {
      console.error(`Unknown flag: ${a}`);
      process.exit(2);
    }
  }

  return {
    games,
    players,
    baseSeed,
    experiment,
    aiDifficulty,
    out,
    maxTurns,
    seedStride,
    help,
    quiet,
  };
}

function printHelp(): void {
  console.log(`Heliopoly batch sim (#89) — TypeScript core (source of truth)

Usage:
  npm run sim -- [options]
  npx tsx src/sim/run.ts [options]

Options:
  --games, -n N          Number of games (default 100)
  --players, -p N        AI seats 2–6 (default 4)
  --seed N               Base seed (default 1000)
  --seed-stride N        seed_i = base + i * stride (default ${DEFAULT_SEED_STRIDE})
  --experiment, -e MODE  ${EXPERIMENTS.join(" | ")} (default default)
  --difficulty, -d LVL   easy | normal | hard | expert (default normal)
  --max-turns N          Cap per game (default ${DEFAULT_MAX_TURNS})
  --out, -o DIR          Output directory (default sim-results/<runId>)
  --quiet, -q            Less progress
  --help, -h             This help

Experiments:
  default     Palindrome callsigns may choose direction (#47); others prograde
  prograde    All seats locked prograde (forward)
  retrograde  All seats locked retrograde (backward)
  choice      All seats may choose direction once (AI heuristic)
  mixed       First half prograde-locked, second half retrograde-locked

Output:
  <dir>/config.json     Run metadata
  <dir>/games.ndjson    One JSON object per game
  <dir>/summary.json    Aggregates for humans / AI review

Seed formula (reproducible):
  seed_i = baseSeed + i * seedStride

Docs: scripts/README-sim.md
Report: python3 scripts/sim_report.py <dir>
`);
}

function runIdNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `run-${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function emptyWinRate(): Record<string, { n: number; wins: number; rate: number }> {
  return {};
}

function bumpRate(
  map: Record<string, { n: number; wins: number; rate: number }>,
  key: string,
  win: boolean,
): void {
  const cur = map[key] ?? { n: 0, wins: 0, rate: 0 };
  cur.n += 1;
  if (win) cur.wins += 1;
  cur.rate = cur.n ? cur.wins / cur.n : 0;
  map[key] = cur;
}

function silenceCoreDebugNoise(): void {
  // createGame / rules emit console.debug (seed crumbs). tsx surfaces them;
  // quiet the channel for batch runs so progress lines stay readable.
  if (typeof console !== "undefined" && console.debug) {
    console.debug = () => {};
  }
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  silenceCoreDebugNoise();

  const runId = runIdNow();
  const outDir = resolve(
    args.out ?? join("sim-results", `${runId}-${args.experiment}`),
  );
  mkdirSync(outDir, { recursive: true });

  const config: SimRunConfig = {
    schemaVersion: 1,
    runId,
    createdAt: new Date().toISOString(),
    gitCommit: gitCommit(),
    engine: "typescript-core",
    engineNote:
      "Live src/core/** via tsx; not the optional Python port (heliopoly_retrograde_sim.py).",
    games: args.games,
    players: args.players,
    baseSeed: args.baseSeed,
    seedStride: args.seedStride,
    maxTurns: args.maxTurns,
    experiment: args.experiment,
    aiDifficulty: args.aiDifficulty,
    cliArgs: process.argv.slice(2),
  };

  writeFileSync(join(outDir, "config.json"), JSON.stringify(config, null, 2));
  const ndjsonPath = join(outDir, "games.ndjson");
  if (existsSync(ndjsonPath)) {
    writeFileSync(ndjsonPath, "");
  }

  const winsByName: Record<string, number> = {};
  const winsBySeat: Record<string, number> = {};
  const winsByDirection: Record<string, number> = {};
  const winsByPropellant: Record<string, number> = {};
  const winRateByDirection = emptyWinRate();
  const winRateByPropellant = emptyWinRate();
  const winRateBySeat = emptyWinRate();

  let totalRounds = 0;
  let totalTurns = 0;
  let unfinished = 0;

  console.log(
    `Heliopoly sim · ${args.games} games · ${args.players} AI · experiment=${args.experiment} · AI=${args.aiDifficulty}`,
  );
  console.log(`  out: ${outDir}`);
  console.log(
    `  seeds: ${args.baseSeed} + i*${args.seedStride} · maxTurns ${args.maxTurns}`,
  );

  const t0 = Date.now();
  const progressEvery = Math.max(1, Math.floor(args.games / 20));

  for (let i = 0; i < args.games; i++) {
    const seed = (args.baseSeed + i * args.seedStride) >>> 0;
    const game: SimGameResult = playOneGame({
      seed,
      players: args.players,
      gameIndex: i,
      experiment: args.experiment,
      aiDifficulty: args.aiDifficulty,
      maxTurns: args.maxTurns,
    });

    appendFileSync(ndjsonPath, `${JSON.stringify(game)}\n`);

    totalRounds += game.rounds;
    totalTurns += game.turns;
    if (game.unfinished) unfinished++;
    else if (game.winnerName) {
      winsByName[game.winnerName] = (winsByName[game.winnerName] ?? 0) + 1;
    }

    for (const s of game.seats) {
      const seatKey = String(s.seat);
      const dirKey = s.moveDirection;
      const propKey = s.propellant;
      if (!game.unfinished) {
        bumpRate(winRateBySeat, seatKey, s.winner);
        bumpRate(winRateByDirection, dirKey, s.winner);
        bumpRate(winRateByPropellant, propKey, s.winner);
        if (s.winner) {
          winsBySeat[seatKey] = (winsBySeat[seatKey] ?? 0) + 1;
          winsByDirection[dirKey] = (winsByDirection[dirKey] ?? 0) + 1;
          winsByPropellant[propKey] = (winsByPropellant[propKey] ?? 0) + 1;
        }
      }
    }

    if (!args.quiet && ((i + 1) % progressEvery === 0 || i + 1 === args.games)) {
      const elapsed = (Date.now() - t0) / 1000;
      const rate = (i + 1) / Math.max(elapsed, 1e-6);
      const left = args.games - (i + 1);
      const eta = left / Math.max(rate, 1e-6);
      process.stdout.write(
        `  … ${i + 1}/${args.games}  ${rate.toFixed(1)} g/s  ETA ${eta.toFixed(0)}s\n`,
      );
    }
  }

  const wallMs = Date.now() - t0;
  const gamesPerSec = args.games / Math.max(wallMs / 1000, 1e-6);

  const summary: SimSummary = {
    schemaVersion: 1,
    runId,
    config,
    games: args.games,
    unfinished,
    unfinishedRate: unfinished / args.games,
    meanRounds: totalRounds / args.games,
    meanTurns: totalTurns / args.games,
    wallMs,
    gamesPerSec,
    winsByName,
    winsBySeat,
    winsByDirection,
    winsByPropellant,
    winRateByDirection,
    winRateByPropellant,
    winRateBySeat,
  };

  writeFileSync(join(outDir, "summary.json"), JSON.stringify(summary, null, 2));

  console.log("\nDone.");
  console.log(`  wall: ${(wallMs / 1000).toFixed(2)}s · ${gamesPerSec.toFixed(1)} games/s`);
  console.log(`  mean rounds: ${summary.meanRounds.toFixed(1)}`);
  console.log(
    `  unfinished: ${unfinished} (${(summary.unfinishedRate * 100).toFixed(1)}%)`,
  );
  const sorted = Object.entries(winsByName).sort((a, b) => b[1] - a[1]);
  for (const [name, n] of sorted) {
    console.log(`  ${name}: ${n} (${((n / args.games) * 100).toFixed(1)}%)`);
  }
  console.log(`\n  summary: ${join(outDir, "summary.json")}`);
  console.log(`  report:  python3 scripts/sim_report.py ${outDir}`);
}

main();
