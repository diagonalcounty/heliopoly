import { getNode, isPurchasable } from "./board";
import { leaveBurnCost } from "./fuel";
import { walkMovePath } from "./path";
import { breakFuelCost, getLegalActions, refuelInfo } from "./rules";
import { currentPlayer } from "./state";
import type { AiDifficulty, GameState, PlayerAction } from "./types";

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
  const difficulty: AiDifficulty = state.config.aiDifficulty ?? "normal";

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
    const br = chooseBreak(state, legal, difficulty);
    if (br !== state.breakSpaces) {
      return { type: "set_break", spaces: br };
    }
    // If we still cannot afford break fuel, force break 0 then move
    if (!legal.move && state.breakSpaces > 0) {
      return { type: "set_break", spaces: 0 };
    }
    return { type: "move" };
  }

  if (legal.buy && p.cash >= legal.buyPrice + 150) {
    return { type: "buy" };
  }
  // Prefer depot on gusher-ish own claims when fuel ok
  if (legal.placeStation && (p.fuel <= 14 || p.stationsInHand >= 2)) {
    return { type: "place_station" };
  }
  if (legal.refuel && p.fuel <= 8 && fuel.costPer === 0) {
    return { type: "refuel", amount: Math.min(fuel.max, 10) };
  }
  return { type: "end_turn" };
}

function chooseBreak(
  state: GameState,
  legal: ReturnType<typeof getLegalActions>,
  difficulty: AiDifficulty,
): number {
  const p = currentPlayer(state);
  const total = state.lastRoll?.total ?? 0;
  if (total <= 0 || legal.maxBreak <= 0) return 0;

  // —— Normal: only shave when full leave burn is unaffordable ——
  // IMPORTANT: decide from the *full roll*, not legal.leaveBurnPreview.
  // Preview uses current breakSpaces — using it caused set_break to oscillate
  // 0↔2 forever (leave cost drops after break, AI clears break, leave rises again).
  if (difficulty === "normal") {
    const node = getNode(state.board, p.position);
    const fullLeave = leaveBurnCost(node, Math.max(1, total), p.propellant);
    let br = 0;
    if (p.fuel < fullLeave && legal.maxBreak > 0) {
      br = Math.min(legal.maxBreak, 2);
      while (br > 0) {
        const bCost = breakFuelCost(br);
        const leaveAfter = leaveBurnCost(
          node,
          Math.max(1, total - br),
          p.propellant,
        );
        // Need fuel for break + subsequent leave (best effort); at least afford break
        if (p.fuel + 1e-9 >= bCost + leaveAfter) break;
        if (p.fuel + 1e-9 >= bCost && p.fuel < fullLeave) break; // still better than full
        br--;
      }
      while (br > 0 && p.fuel + 1e-9 < breakFuelCost(br)) br--;
    }
    return br;
  }

  // —— Difficult: score destinations for rent dodge / buy / Earth / own care ——
  let bestBr = 0;
  let bestScore = -1e9;
  const maxBr = legal.maxBreak;
  for (let br = 0; br <= maxBr; br++) {
    const bCost = breakFuelCost(br);
    if (p.fuel < bCost) continue;
    const steps = total - br;
    // leave burn scales with steps; rough check using leaveBurnPreview for full roll
    // Prefer not stranding: need some fuel after break for leave
    const path = walkMovePath(state.board, p.position, steps);
    const endId = path.endId;
    const end = getNode(state.board, endId);
    let score = 0;

    // Prefer open purchasable deeds we can afford
    if (
      isPurchasable(end) &&
      !state.owners[endId] &&
      (end.price ?? 0) <= p.cash - 100
    ) {
      score += 40 + Math.min(30, (end.price ?? 0) / 40);
    }
    // Prefer own claims (feral care / depot)
    if (state.owners[endId] === p.id) score += 18;
    // Prefer Earth (cash + circuit)
    if (endId === "earth") score += 28;
    // Avoid enemy rent we can't pay / expensive
    const ownerId = state.owners[endId];
    if (ownerId && ownerId !== p.id && isPurchasable(end)) {
      const rent = end.rent ?? 0;
      score -= 25 + rent / 4;
      if (p.cash < rent) score -= 50;
    }
    // Slight cost for break fuel
    score -= bCost * 3;
    // Prefer landing rather than overshooting nothing
    if (br === 0) score += 2;

    if (score > bestScore) {
      bestScore = score;
      bestBr = br;
    }
  }

  // If best is barely better than 0, don't bother
  if (bestBr > 0) {
    const basePath = walkMovePath(state.board, p.position, total);
    const baseEnd = getNode(state.board, basePath.endId);
    let baseScore = 0;
    if (basePath.endId === "earth") baseScore += 28;
    if (state.owners[basePath.endId] === p.id) baseScore += 18;
    if (
      isPurchasable(baseEnd) &&
      !state.owners[basePath.endId] &&
      (baseEnd.price ?? 0) <= p.cash - 100
    ) {
      baseScore += 40;
    }
    if (bestScore < baseScore + 8) return 0;
  }

  return bestBr;
}
