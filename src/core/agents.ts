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
  hasSystemMonopoly,
  isStationHub,
  systemOfGroup,
  STATION_HUB_IDS,
} from "./systems";
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
    if (legal.warp && p.warpCharges > 0) {
      const dest = chooseWarpDestination(state, difficulty);
      if (dest) return { type: "warp", destination: dest };
    }
    return { type: "roll" };
  }

  if (state.phase === "await_move") {
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
    if (!legal.move && state.breakSpaces > 0) {
      return { type: "set_break", spaces: 0 };
    }
    return { type: "move" };
  }

  if (legal.buy && p.cash >= legal.buyPrice + (difficulty === "easy" ? 250 : 150)) {
    return { type: "buy" };
  }
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

/** How deep into the roll the AI may break (travel skill scale — #87). */
function maxBreakConsidered(
  difficulty: AiDifficulty,
  legalMax: number,
  rollTotal: number,
): number {
  if (legalMax <= 0 || rollTotal <= 0) return 0;
  switch (difficulty) {
    case "easy":
      return 0;
    case "normal":
      // Only tiny shave when leave is unaffordable (handled separately)
      return Math.min(legalMax, 2);
    case "hard":
      // Up to half the roll (rounded up), not the full "break to 1 space"
      return Math.min(legalMax, Math.max(2, Math.ceil(rollTotal / 2)));
    case "expert":
      // Full depth: break total−1 allowed (land one space ahead)
      return legalMax;
    default:
      return Math.min(legalMax, 2);
  }
}

/** Score how good it is to *land* on endId for this pilot. */
function scoreLanding(
  state: GameState,
  pilotId: string,
  cash: number,
  endId: string,
  difficulty: AiDifficulty,
): number {
  const end = getNode(state.board, endId);
  let score = 0;

  // Buy opportunity
  if (
    isPurchasable(end) &&
    !state.owners[endId] &&
    (end.price ?? 0) <= cash - 80
  ) {
    score += 40 + Math.min(35, (end.price ?? 0) / 35);
    // Hub stations: high strategic value
    if (isStationHub(endId)) {
      score += difficulty === "expert" ? 55 : difficulty === "hard" ? 35 : 15;
      const hubsOwned = STATION_HUB_IDS.filter(
        (id) => state.owners[id] === pilotId,
      ).length;
      if (hubsOwned === 2) score += difficulty === "expert" ? 80 : 40; // complete hub net
      else if (hubsOwned === 1) score += difficulty === "expert" ? 30 : 12;
    }
    // System monopoly completion
    const sys = systemOfGroup(end.group);
    if (sys) {
      const owned = sys.deedIds.filter((id) => state.owners[id] === pilotId)
        .length;
      const need = sys.deedIds.length;
      if (owned === need - 1) {
        // This landing completes monopoly
        score += difficulty === "expert" ? 100 : difficulty === "hard" ? 55 : 20;
      } else if (owned >= Math.floor(need / 2)) {
        score += difficulty === "expert" ? 25 : difficulty === "hard" ? 12 : 4;
      }
    }
  }

  if (state.owners[endId] === pilotId) {
    score += 18;
    if (state.stations[endId]) score += 10; // free refuel home
  }

  // Landing ON Earth (not pass) — advanced AI strongly prefers this
  if (endId === "earth") {
    score +=
      difficulty === "expert" ? 70 : difficulty === "hard" ? 40 : 28;
  }

  const ownerId = state.owners[endId];
  if (ownerId && ownerId !== pilotId && isPurchasable(end)) {
    const rent = end.rent ?? 0;
    const mono =
      !!systemOfGroup(end.group) &&
      hasSystemMonopoly(
        state.owners,
        ownerId,
        systemOfGroup(end.group)!.id,
      );
    const rentNow = Math.floor(rent * (mono ? 2 : 1) * (state.stations[endId] ? 1.5 : 1));
    score -= 25 + rentNow / 4;
    if (cash < rentNow) score -= 55;
    if (difficulty === "expert") score -= 20 + rentNow / 5;
    if (isStationHub(endId)) score -= difficulty === "expert" ? 35 : 15;
  }

  if (end.kind === "space") {
    // Blank: no leave burn next turn — fuel conservation value
    score += difficulty === "expert" ? 14 : difficulty === "hard" ? 6 : 0;
    score -= 4; // duel risk slight
  }

  return score;
}

/** True if this move rests on Earth mid-path then continues (pass pay), not final land. */
function pathPassesEarth(
  state: GameState,
  fromId: string,
  steps: number,
  direction: "forward" | "backward",
): boolean {
  if (steps <= 1) return false;
  const path = walkMovePath(state.board, fromId, steps, direction);
  if (path.endId === "earth") return false;
  return path.stops.some((id) => id === "earth");
}

function chooseMoveDirection(
  state: GameState,
  difficulty: AiDifficulty,
): "forward" | "backward" {
  const p = currentPlayer(state);
  if (difficulty === "easy") return "forward";

  const total = state.lastRoll?.total ?? 7;
  const scoreDir = (dir: "forward" | "backward") =>
    scoreLanding(state, p.id, p.cash, walkMovePath(state.board, p.position, total, dir).endId, difficulty) +
    (difficulty === "normal" && dir === "forward" ? 2 : 0) +
    (difficulty === "hard" && dir === "forward" ? 1 : 0);

  const fwd = scoreDir("forward");
  const back = scoreDir("backward");
  const need =
    difficulty === "expert" ? 3 : difficulty === "hard" ? 5 : 8;
  return back > fwd + need ? "backward" : "forward";
}

function chooseWarpDestination(
  state: GameState,
  difficulty: AiDifficulty,
): string | null {
  const p = currentPlayer(state);
  if (difficulty === "easy" && p.fuel > 6) return null;

  let bestId: string | null = null;
  let bestScore = -1e9;
  for (const id of Object.keys(state.board.nodes)) {
    if (id === p.position) continue;
    let score = scoreLanding(state, p.id, p.cash, id, difficulty);
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

  if (difficulty === "easy") return 0;

  // —— Normal: only shave when full leave burn is unaffordable (cap 2) ——
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

  // —— Hard / Expert: score every break up to difficulty-capped depth ——
  const expert = difficulty === "expert";
  const maxBr = maxBreakConsidered(difficulty, legal.maxBreak, total);
  let bestBr = 0;
  let bestScore = -1e9;

  for (let br = 0; br <= maxBr; br++) {
    const bCost = effectiveBreakFuelCost(p.freeBreakPending, br);
    if (p.fuel + 1e-9 < bCost) continue;
    const steps = total - br;
    if (steps < 1) continue;

    const leaveAfter = leaveBurnCost(node, steps, p.propellant);
    if (p.fuel + 1e-9 < bCost + leaveAfter) {
      // Still consider if we were worse without break
      const fullLeave = leaveBurnCost(node, total, p.propellant);
      if (!(p.fuel < fullLeave && p.fuel >= bCost)) continue;
    }

    const path = walkMovePath(
      state.board,
      p.position,
      steps,
      p.moveDirection,
    );
    let score = scoreLanding(state, p.id, p.cash, path.endId, difficulty);

    // Prefer *landing* on Earth over *passing* Earth on a longer move
    if (path.endId === "earth") {
      score += expert ? 25 : 12;
    } else if (
      pathPassesEarth(state, p.position, total, p.moveDirection) &&
      !path.stops.includes("earth")
    ) {
      // Full roll would pass Earth; this break still doesn't land Earth — small penalty for hard/expert
      if (expert || difficulty === "hard") score -= 8;
    }
    // Bonus if full roll passes Earth but this break lands on Earth
    if (
      path.endId === "earth" &&
      pathPassesEarth(state, p.position, total, p.moveDirection)
    ) {
      score += expert ? 45 : 22;
    }

    // Fuel: break cost vs leave savings / blank parking
    score -= bCost * (expert ? 1.2 : 2.5);
    if (p.freeBreakPending && br >= 1) score += expert ? 14 : 6;
    if (expert && p.fuel < 14) {
      const fullLeave = leaveBurnCost(node, total, p.propellant);
      score += Math.max(0, fullLeave - leaveAfter) * 2.5;
    }
    // Blank landing: next leave is free (no gravity)
    const end = getNode(state.board, path.endId);
    if (end.kind === "space" && expert) {
      score += 8;
    }

    if (score > bestScore) {
      bestScore = score;
      bestBr = br;
    }
  }

  // Require meaningful improvement over break-0
  if (bestBr > 0) {
    const basePath = walkMovePath(
      state.board,
      p.position,
      total,
      p.moveDirection,
    );
    const baseScore = scoreLanding(
      state,
      p.id,
      p.cash,
      basePath.endId,
      difficulty,
    );
    const margin = expert ? 2 : difficulty === "hard" ? 6 : 8;
    if (bestScore < baseScore + margin) return 0;
  }

  return bestBr;
}
