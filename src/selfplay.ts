import { heuristicAI } from "./core/agents";
import { applyAction, getLegalActions, resolveDuelAiFully } from "./core/rules";
import { createGame, currentPlayer } from "./core/state";
import type { GameState } from "./core/types";

function playGame(seed: number, players: number): {
  winner: string | null;
  rounds: number;
  turns: number;
} {
  let state: GameState = createGame({
    playerCount: players,
    humanSeat: false,
    seed,
    maxRounds: 50,
  });

  let turns = 0;
  const maxTurns = 3000;
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
    if (action.type === "end_turn" && !legal.endTurn) action = { type: "roll" };
    if (action.type === "roll" && !legal.roll) action = { type: "end_turn" };
    state = applyAction(state, action);
    turns++;
  }

  const winner = state.winnerId
    ? state.players.find((x) => x.id === state.winnerId)?.name ?? state.winnerId
    : null;

  return { winner, rounds: state.round, turns };
}

function main(): void {
  const games = Number(process.argv[2] ?? 10);
  const players = Number(process.argv[3] ?? 4);
  const wins = new Map<string, number>();
  let totalRounds = 0;
  let unfinished = 0;

  console.log(`Self-play: ${games} games · ${players} AI · heuristic`);

  for (let i = 0; i < games; i++) {
    const result = playGame(1000 + i * 997, players);
    totalRounds += result.rounds;
    if (!result.winner) unfinished++;
    else wins.set(result.winner, (wins.get(result.winner) ?? 0) + 1);
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
