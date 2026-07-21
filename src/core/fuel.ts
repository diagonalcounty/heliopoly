import { PROPELLANTS } from "./propellant";
import type { BoardNode, GravityClass, Player, PropellantId } from "./types";

/** Leave-burn multiplier by gravity class (0 = free leave / no well). */
export const GRAVITY_LEAVE_MULT: Record<GravityClass, number> = {
  0: 0,
  1: 0.75,
  2: 1.0,
  3: 1.4,
  4: 1.85,
};

export function gravityClassOf(node: BoardNode): GravityClass {
  if (node.gravityClass !== undefined) return node.gravityClass;
  if (node.fuelToLeave) return 2;
  return 0;
}

/**
 * Fuel to leave a body. Insertion is free — only departure costs.
 * `steps` is the dice total (or planned burn distance proxy).
 */
export function leaveBurnCost(
  node: BoardNode,
  steps: number,
  propellant: PropellantId,
): number {
  const g = gravityClassOf(node);
  const gMult = GRAVITY_LEAVE_MULT[g];
  if (gMult <= 0 || steps <= 0) return 0;
  const pMult = PROPELLANTS[propellant].leaveMult;
  return Math.max(1, Math.ceil(steps * gMult * pMult));
}

export function canAffordLeave(
  player: Player,
  node: BoardNode,
  steps: number,
): boolean {
  const cost = leaveBurnCost(node, steps, player.propellant);
  return player.fuel >= cost;
}
