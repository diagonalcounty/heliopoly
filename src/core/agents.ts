import { getLegalActions, refuelInfo } from "./rules";
import { currentPlayer } from "./state";
import type { GameState, PlayerAction } from "./types";

/**
 * Heuristic AI for v0:
 * - Refuel when fuel is low and free/cheap
 * - Buy if affordable and cash remains for buffer
 * - Place station on first owned body if fuel often tight
 * - Otherwise roll / end turn
 */
export function heuristicAI(state: GameState): PlayerAction {
  const p = currentPlayer(state);
  const legal = getLegalActions(state);
  const fuel = refuelInfo(state);

  if (state.phase === "await_action") {
    // Prefer topping up when leave burn may exceed tank (preview uses ~7)
    const need = legal.leaveBurnPreview;
    if (
      legal.refuel &&
      fuel.max > 0 &&
      (p.fuel <= 12 || (need > 0 && p.fuel < need + 2))
    ) {
      const want = Math.min(fuel.max, Math.max(5, 18 - p.fuel));
      if (fuel.costPer === 0 || p.cash > want * fuel.costPer + 200) {
        return { type: "refuel", amount: want };
      }
    }
    return { type: "roll" };
  }

  // post-land
  if (legal.buy && p.cash >= legal.buyPrice + 150) {
    return { type: "buy" };
  }

  if (legal.placeStation && p.fuel <= 14) {
    return { type: "place_station" };
  }

  if (legal.refuel && p.fuel <= 8 && fuel.costPer === 0) {
    return { type: "refuel", amount: Math.min(fuel.max, 10) };
  }

  return { type: "end_turn" };
}

/** Random legal action — smoke tests. */
export function randomAI(
  state: GameState,
  rnd: () => number = Math.random,
): PlayerAction {
  const legal = getLegalActions(state);
  const options: PlayerAction[] = [];

  if (state.phase === "await_action") {
    if (legal.refuel) options.push({ type: "refuel", amount: Math.max(1, Math.floor(legal.refuelMax / 2)) });
    options.push({ type: "roll" });
  } else {
    if (legal.buy) options.push({ type: "buy" });
    if (legal.placeStation) options.push({ type: "place_station" });
    if (legal.refuel) options.push({ type: "refuel", amount: 3 });
    options.push({ type: "end_turn" });
  }

  return options[Math.floor(rnd() * options.length)] ?? { type: "end_turn" };
}
