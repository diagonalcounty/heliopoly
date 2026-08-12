/**
 * Quick self-play to stdout (legacy convenience).
 * For JSON batch / experiments / reports, use: npm run sim -- --help
 * Docs: scripts/README-sim.md  (#89)
 */
import { playOneGame } from "./sim/play";

function main(): void {
  if (typeof console !== "undefined" && console.debug) {
    console.debug = () => {};
  }
  const games = Number(process.argv[2] ?? 10);
  const players = Number(process.argv[3] ?? 4);
  const wins = new Map<string, number>();
  let totalRounds = 0;
  let unfinished = 0;

  console.log(`Self-play: ${games} games · ${players} AI · heuristic`);
  console.log(`(JSON batch harness: npm run sim -- --help · scripts/README-sim.md)`);

  for (let i = 0; i < games; i++) {
    const result = playOneGame({
      seed: 1000 + i * 997,
      players,
      gameIndex: i,
      experiment: "default",
      aiDifficulty: "normal",
    });
    totalRounds += result.rounds;
    if (result.unfinished || !result.winnerName) unfinished++;
    else wins.set(result.winnerName, (wins.get(result.winnerName) ?? 0) + 1);
    if ((i + 1) % 5 === 0) process.stdout.write(`  … ${i + 1}/${games}\n`);
  }

  console.log("\nResults:");
  console.log(`  avg rounds: ${(totalRounds / games).toFixed(1)}`);
  console.log(`  unfinished: ${unfinished}`);
  for (const [name, n] of [...wins.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${name}: ${n} (${((n / games) * 100).toFixed(0)}%)`);
  }
}

main();
