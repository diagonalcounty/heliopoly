/** Pure Gravity Duel helpers (no rules.ts imports; orchestrators live in rules.ts). */
import type {
  DuelStance,
  GameState,
  LastRoll,
  PendingDuel,
  Player,
} from "./types";

/** AI goes HIGH above this fuel, otherwise LOW. */
export const DUEL_AI_HIGH_FUEL = 12;

export function othersOnNode(state: GameState, nodeId: string, exceptId: string): Player[] {
  return state.players.filter(
    (x) => !x.eliminated && x.position === nodeId && x.id !== exceptId,
  );
}

export function pickDefender(
  state: GameState,
  nodeId: string,
  challengerId: string,
): Player | null {
  const others = othersOnNode(state, nodeId, challengerId);
  if (others.length === 0) return null;
  const mem = state.encounterMem[nodeId];
  if (mem?.lastRollerId) {
    const lr = others.find((o) => o.id === mem.lastRollerId);
    if (lr) return lr;
  }
  if (mem?.championId) {
    const ch = others.find((o) => o.id === mem.championId);
    if (ch) return ch;
  }
  return others[0] ?? null;
}

export function sameLastRoll(a: LastRoll | null, b: LastRoll | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.d1 === b.d1 &&
    a.d2 === b.d2 &&
    a.total === b.total &&
    a.doubles === b.doubles
  );
}

/** Field-by-field PendingDuel equality (avoids JSON.stringify in the AI loop). */
export function samePendingDuel(
  a: PendingDuel | null,
  b: PendingDuel | null,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.nodeId === b.nodeId &&
    a.challengerId === b.challengerId &&
    a.defenderId === b.defenderId &&
    a.challengerStance === b.challengerStance &&
    a.defenderStance === b.defenderStance &&
    sameLastRoll(a.challengerRoll, b.challengerRoll) &&
    sameLastRoll(a.defenderRoll, b.defenderRoll)
  );
}

/** Low/low: lower total wins. High/high: higher wins. Mixed: closest to mean wins. */
export function duelWinner(
  cStance: DuelStance,
  dStance: DuelStance,
  ct: number,
  dt: number,
  mean: number,
): "challenger" | "defender" | "tie" {
  if (cStance === "low" && dStance === "low") {
    if (ct < dt) return "challenger";
    if (dt < ct) return "defender";
  } else if (cStance === "high" && dStance === "high") {
    if (ct > dt) return "challenger";
    if (dt > ct) return "defender";
  } else {
    const cDist = Math.abs(ct - mean);
    const dDist = Math.abs(dt - mean);
    if (cDist < dDist) return "challenger";
    if (dDist < cDist) return "defender";
  }
  return "tie";
}

/** Slight fuel bias: rich AI goes high. */
export function aiDuelStance(fuel: number): DuelStance {
  return fuel > DUEL_AI_HIGH_FUEL ? "high" : "low";
}

export function newPendingDuel(
  nodeId: string,
  challengerId: string,
  defenderId: string,
): PendingDuel {
  return {
    nodeId,
    challengerId,
    defenderId,
    challengerStance: null,
    defenderStance: null,
    challengerRoll: null,
    defenderRoll: null,
  };
}
