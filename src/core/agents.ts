import { getLegalActions, refuelInfo } from "./rules";
import { currentPlayer } from "./state";
import type { GameState, PlayerAction } from "./types";

export function heuristicAI(state: GameState): PlayerAction {
  if (state.phase === "await_duel" && state.pendingDuel) {
    const d = state.pendingDuel;
    const p = currentPlayer(state);
    if (p.id === d.challengerId || p.id === d.defenderId) {
      const stance =
        p.id === d.challengerId ? d.challengerStance : d.defenderStance;
      const roll =
        p.id === d.challengerId ? d.challengerRoll : d.defenderRoll;
      if (stance === null) {
        return { type: "duel_stance", stance: p.fuel > 12 ? "high" : "low" };
      }
      if (
        d.challengerStance &&
        d.defenderStance &&
        roll === null
      ) {
        return { type: "duel_roll" };
      }
    }
    return { type: "duel_stance", stance: "low" };
  }

  const p = currentPlayer(state);
  const legal = getLegalActions(state);
  const fuel = refuelInfo(state);

  if (state.phase === "await_action") {
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
