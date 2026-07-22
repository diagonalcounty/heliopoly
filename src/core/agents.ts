import { breakFuelCost, getLegalActions, refuelInfo } from "./rules";
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
      if (d.challengerStance && d.defenderStance && roll === null) {
        return { type: "duel_roll" };
      }
    }
    return { type: "duel_stance", stance: "low" };
  }

  const p = currentPlayer(state);
  const legal = getLegalActions(state);
  const fuel = refuelInfo(state);

  if (state.phase === "await_action") {
    if (legal.sell && p.cash < 200 && legal.sellValue > 0) {
      return { type: "sell", nodeId: legal.sellNodeId! };
    }
    if (
      legal.refuel &&
      fuel.max > 0 &&
      (p.fuel <= 12 || legal.leaveBurnPreview > p.fuel)
    ) {
      const want = Math.min(fuel.max, Math.max(5, 18 - p.fuel));
      if (fuel.costPer === 0 || p.cash > want * fuel.costPer + 150) {
        return { type: "refuel", amount: want };
      }
    }
    if (legal.sell && p.cash < 100 && p.properties.length > 2) {
      return { type: "sell", nodeId: legal.sellNodeId! };
    }
    return { type: "roll" };
  }

  if (state.phase === "await_move") {
    // Cheap break if low fuel for full leave on a high-g body
    let br = 0;
    if (p.fuel < legal.leaveBurnPreview && legal.maxBreak > 0) {
      br = Math.min(legal.maxBreak, 2);
      while (br > 0 && p.fuel < breakFuelCost(br)) br--;
    }
    if (br !== state.breakSpaces && br > 0) {
      return { type: "set_break", spaces: br };
    }
    return { type: "move" };
  }

  if (legal.buy && p.cash >= legal.buyPrice + 150) {
    return { type: "buy" };
  }
  if (legal.placeStation && p.fuel <= 14) {
    return { type: "place_station" };
  }
  if (legal.sell && p.cash < legal.buyPrice && legal.sellValue > 0) {
    // raise cash to buy — optional; skip if not trying to buy
  }
  if (legal.refuel && p.fuel <= 8 && fuel.costPer === 0) {
    return { type: "refuel", amount: Math.min(fuel.max, 10) };
  }
  return { type: "end_turn" };
}
