import { getNode, isPurchasable } from "./board";
import { leaveBurnCost } from "./fuel";
import { walkMovePath } from "./path";
import {
  effectiveBreakFuelCost,
  getLegalActions,
  refuelInfo,
} from "./rules";
import { currentPlayer } from "./state";
import {
  normalizeAiDifficulty,
  type AiDifficulty,
  type GameState,
  type PlayerAction,
} from "./types";

export { normalizeAiDifficulty };

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
        // Easy: timid Low; expert: fuel-aware High more often
        const difficulty = normalizeAiDifficulty(state.config.aiDifficulty);
        if (difficulty === "easy") {
          return { type: "duel_stance", stance: "low" };
        }
        if (difficulty === "expert") {
          return {
            type: "duel_stance",
            stance: p.fuel > 8 ? "high" : "low",
          };
        }
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
  const difficulty = normalizeAiDifficulty(state.config.aiDifficulty);

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
    // King's Quest: use warp when charged (prefer strong destinations / low fuel)
    if (legal.warp && p.warpCharges > 0) {
      const dest = chooseWarpDestination(state, difficulty);
      if (dest) return { type: "warp", destination: dest };
    }
    return { type: "roll" };
  }

  if (state.phase === "await_move") {
    // #47 palindrome: pick permanent Mainline facing before first move
    if (legal.setDirection && p.canBidirectional && !p.directionLocked) {
      const dir = chooseMoveDirection(state, difficulty);
      if (dir !== p.moveDirection) {
        return { type: "set_direction", direction: dir };
      }
    }
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

  if (legal.buy && p.cash >= legal.buyPrice + (difficulty === "easy" ? 250 : 150)) {
    return { type: "buy" };
  }
  // Prefer depot on gusher-ish own claims when fuel ok (respect cash cost #45)
  if (legal.placeStation && (p.fuel <= 14 || p.stationsInHand >= 2)) {
    const cost = legal.placeStationCost;
    if (cost === 0 || p.cash >= cost + 120) {
      return { type: "place_station" };
    }
  }
  if (legal.refuel && p.fuel <= 8 && fuel.costPer === 0) {
    return { type: "refuel", amount: Math.min(fuel.max, 10) };
  }
  return { type: "end_turn" };
}

/** Palindrome AI: compare forward vs reverse landing quality for full roll. */
function chooseMoveDirection(
  state: GameState,
  difficulty: AiDifficulty,
): "forward" | "backward" {
  const p = currentPlayer(state);
  // Easy: never consider retrograde
  if (difficulty === "easy") return "forward";

  const total = state.lastRoll?.total ?? 7;
  const scoreDir = (dir: "forward" | "backward") => {
    const path = walkMovePath(state.board, p.position, total, dir);
    const end = getNode(state.board, path.endId);
    let score = 0;
    if (
      isPurchasable(end) &&
      !state.owners[path.endId] &&
      (end.price ?? 0) <= p.cash - 100
    ) {
      score += 40;
    }
    if (state.owners[path.endId] === p.id) score += 18;
    if (path.endId === "earth") score += 28;
    const ownerId = state.owners[path.endId];
    if (ownerId && ownerId !== p.id && isPurchasable(end)) {
      score -= 25 + (end.rent ?? 0) / 4;
      if (p.cash < (end.rent ?? 0)) score -= 50;
      // Expert: stronger rent dodge
      if (difficulty === "expert") score -= 15;
    }
    if (end.kind === "space") score -= 8;
    if (difficulty === "normal") score += dir === "forward" ? 2 : 0;
    if (difficulty === "hard" && dir === "forward") score += 1;
    return score;
  };
  const fwd = scoreDir("forward");
  const back = scoreDir("backward");
  // Threshold: easy N/A; normal needs clear win; expert switches on small edge
  const need =
    difficulty === "expert" ? 3 : difficulty === "hard" ? 5 : 8;
  return back > fwd + need ? "backward" : "forward";
}

/** Score board nodes for a one-shot warp teleport. */
function chooseWarpDestination(
  state: GameState,
  difficulty: AiDifficulty,
): string | null {
  const p = currentPlayer(state);
  // Easy: rarely warp
  if (difficulty === "easy" && p.fuel > 6) return null;

  let bestId: string | null = null;
  let bestScore = -1e9;
  for (const id of Object.keys(state.board.nodes)) {
    if (id === p.position) continue;
    const end = getNode(state.board, id);
    let score = 0;
    if (
      isPurchasable(end) &&
      !state.owners[id] &&
      (end.price ?? 0) <= p.cash - 80
    ) {
      score += 50 + Math.min(40, (end.price ?? 0) / 30);
    }
    if (state.owners[id] === p.id) score += 22;
    if (id === "earth") score += 30;
    if (end.refuel === "free" || id === "earth") score += 12;
    const ownerId = state.owners[id];
    if (ownerId && ownerId !== p.id && isPurchasable(end)) {
      const rent = end.rent ?? 0;
      score -= 30 + rent / 3;
      if (p.cash < rent) score -= 80;
    }
    if (end.kind === "space") score -= 8;
    if (difficulty === "normal") score += Math.random() * 4;
    else if (difficulty === "easy") score += Math.random() * 8;
    else score += Math.random() * 2;
    if (p.fuel <= 4) score += 15;
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }
  const minScore = difficulty === "expert" ? 5 : difficulty === "hard" ? 8 : 10;
  if (bestScore < minScore && p.fuel > 8) return null;
  return bestId;
}

function chooseBreak(
  state: GameState,
  legal: ReturnType<typeof getLegalActions>,
  difficulty: AiDifficulty,
): number {
  const p = currentPlayer(state);
  const total = state.lastRoll?.total ?? 0;
  if (total <= 0 || legal.maxBreak <= 0) return 0;

  const node = getNode(state.board, p.position);

  // —— Easy: never break (accept strand risk) ——
  if (difficulty === "easy") {
    return 0;
  }

  // —— Normal: only shave when full leave burn is unaffordable ——
  // Decide from the *full roll*, not legal.leaveBurnPreview (avoids 0↔n oscillation).
  if (difficulty === "normal") {
    const fullLeave = leaveBurnCost(node, Math.max(1, total), p.propellant);
    let br = 0;
    if (p.fuel < fullLeave && legal.maxBreak > 0) {
      br = Math.min(legal.maxBreak, 2);
      while (br > 0) {
        const bCost = effectiveBreakFuelCost(p.freeBreakPending, br);
        const leaveAfter = leaveBurnCost(
          node,
          Math.max(1, total - br),
          p.propellant,
        );
        if (p.fuel + 1e-9 >= bCost + leaveAfter) break;
        if (p.fuel + 1e-9 >= bCost && p.fuel < fullLeave) break;
        br--;
      }
      while (
        br > 0 &&
        p.fuel + 1e-9 < effectiveBreakFuelCost(p.freeBreakPending, br)
      ) {
        br--;
      }
    }
    return br;
  }

  // —— Hard / Expert: score every break amount for landing quality ——
  const expert = difficulty === "expert";
  let bestBr = 0;
  let bestScore = -1e9;
  const maxBr = legal.maxBreak;
  for (let br = 0; br <= maxBr; br++) {
    const bCost = effectiveBreakFuelCost(p.freeBreakPending, br);
    if (p.fuel < bCost) continue;
    const steps = Math.max(0, total - br);
    if (steps <= 0 && br > 0) continue;

    const leaveAfter = leaveBurnCost(
      node,
      Math.max(1, steps || 1),
      p.propellant,
    );
    // Must be able to leave after move (or free-break edge)
    if (p.fuel + 1e-9 < bCost + leaveAfter && steps > 0) {
      // Expert: still allow if break alone is affordable and leave was worse without
      if (!expert || p.fuel + 1e-9 < bCost) continue;
    }

    const path = walkMovePath(
      state.board,
      p.position,
      Math.max(1, steps || 1),
      p.moveDirection,
    );
    const endId = path.endId;
    const end = getNode(state.board, endId);
    let score = 0;

    if (
      isPurchasable(end) &&
      !state.owners[endId] &&
      (end.price ?? 0) <= p.cash - 100
    ) {
      score += 40 + Math.min(30, (end.price ?? 0) / 40);
    }
    if (state.owners[endId] === p.id) score += 18;
    if (endId === "earth") score += 28;
    const ownerId = state.owners[endId];
    if (ownerId && ownerId !== p.id && isPurchasable(end)) {
      const rent = end.rent ?? 0;
      score -= 25 + rent / 4;
      if (p.cash < rent) score -= 50;
      if (expert) score -= 20 + rent / 5; // stronger rent dodge
    }
    // Free break token: prefer using it when available
    if (p.freeBreakPending && br >= 1) score += expert ? 12 : 6;
    score -= bCost * (expert ? 1.5 : 3);
    // Expert: value shaving leave cost when tank is tight
    if (expert && p.fuel < 14) {
      const fullLeave = leaveBurnCost(node, Math.max(1, total), p.propellant);
      score += Math.max(0, fullLeave - leaveAfter) * 2;
    }
    if (br === 0) score += expert ? 0 : 2;
    // Hard: slight inertia against break
    if (!expert && br > 0) score -= 1;

    if (score > bestScore) {
      bestScore = score;
      bestBr = br;
    }
  }

  // If best is barely better than 0, don't bother (lower bar for expert)
  if (bestBr > 0) {
    const basePath = walkMovePath(
      state.board,
      p.position,
      total,
      p.moveDirection,
    );
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
    const ownerId = state.owners[basePath.endId];
    if (ownerId && ownerId !== p.id && isPurchasable(baseEnd)) {
      baseScore -= 25 + (baseEnd.rent ?? 0) / 4;
      if (p.cash < (baseEnd.rent ?? 0)) baseScore -= 50;
    }
    const margin = expert ? 3 : 8;
    if (bestScore < baseScore + margin) return 0;
  }

  return bestBr;
}
