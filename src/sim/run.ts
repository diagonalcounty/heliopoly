/**
 * Batch gameplay sim harness (#89).
 *
 * Usage (from repo root):
 *   npm run sim -- --games 100 --experiment retrograde
 *   npx tsx src/sim/run.ts --help
 *
 * See scripts/README-sim.md · Sim Lab: npm run sim-lab (#91)
 */

import { resolve, join } from "node:path";
import type { AiDifficulty } from "../core/types";
import { normalizeAiDifficulty } from "../core/types";
import { runBatch, makeRunId } from "./batch";
import { DEFAULT_MAX_TURNS, DEFAULT_SEED_STRIDE } from "./play";
import type { SimExperiment } from "./types";

const EXPERIMENTS: SimExperiment[] = [
  "default",
  "prograde",
  "retrograde",
  "choice",
  "mixed",
];

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
    else if (a === "--games" || a === "-n")
      games = Math.max(1, Number(next()) || 1);
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
  npm run sim-lab          # browser UI (#91)

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

Docs: scripts/README-sim.md
`);
}

function silenceCoreDebugNoise(): void {
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

  const runId = makeRunId();
  const outDir = resolve(
    args.out ?? join("sim-results", `${runId}-${args.experiment}`),
  );

  console.log(
    `Heliopoly sim · ${args.games} games · ${args.players} AI · experiment=${args.experiment} · AI=${args.aiDifficulty}`,
  );
  console.log(`  out: ${outDir}`);
  console.log(
    `  seeds: ${args.baseSeed} + i*${args.seedStride} · maxTurns ${args.maxTurns}`,
  );

  const { summary } = runBatch({
    games: args.games,
    players: args.players,
    baseSeed: args.baseSeed,
    seedStride: args.seedStride,
    maxTurns: args.maxTurns,
    experiment: args.experiment,
    aiDifficulty: args.aiDifficulty,
    saveDir: outDir,
    runId,
    cliArgs: process.argv.slice(2),
    onProgress: args.quiet
      ? undefined
      : (p) => {
          process.stdout.write(
            `  … ${p.done}/${p.total}  ${p.rate.toFixed(1)} g/s  ETA ${p.etaSec.toFixed(0)}s\n`,
          );
        },
  });

  console.log("\nDone.");
  console.log(
    `  wall: ${(summary.wallMs / 1000).toFixed(2)}s · ${summary.gamesPerSec.toFixed(1)} games/s`,
  );
  console.log(`  mean rounds: ${summary.meanRounds.toFixed(1)}`);
  console.log(
    `  unfinished: ${summary.unfinished} (${(summary.unfinishedRate * 100).toFixed(1)}%)`,
  );
  const sorted = Object.entries(summary.winsByName).sort((a, b) => b[1] - a[1]);
  for (const [name, n] of sorted) {
    console.log(
      `  ${name}: ${n} (${((n / summary.games) * 100).toFixed(1)}%)`,
    );
  }
  console.log(`\n  summary: ${join(outDir, "summary.json")}`);
  console.log(`  report:  python3 scripts/sim_report.py ${outDir}`);
  console.log(`  lab:     npm run sim-lab`);
}

main();
