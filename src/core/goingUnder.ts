/** Soft "going under" death-risk signal (#3) — display only, never a rules change. */

import { getNode, isPurchasable } from "./board";
import type { BoardNode } from "./types";
import { formatMoney } from "./currency";
import { leaveBurnCost } from "./fuel";
import { canRefuelAtAll, rentDue } from "./rules";
import type { GameState, Player } from "./types";

export interface GoingUnderFlags {
  /** Stuck in a gravity well: no fuel to leave and no refuel here. */
  noFuelInWell: boolean;
  /** Trapped on an opponent claim with no fuel to leave — failed leave charges rent again. */
  stuckOnEnemyClaim: boolean;
  /** Cash below the worst rent any living rival could charge on landing. */
  belowKnownRent: boolean;
  /** True when any of the above is set. */
  atRisk: boolean;
  /** Short human-readable reasons (tooltip / log line). */
  reasons: string[];
}

export function goingUnderFlags(
  state: GameState,
  p: Player,
): GoingUnderFlags {
  const flags: GoingUnderFlags = {
    noFuelInWell: false,
    stuckOnEnemyClaim: false,
    belowKnownRent: false,
    atRisk: false,
    reasons: [],
  };
  if (p.eliminated || state.phase === "game_over") return flags;

  const node = getNode(state.board, p.position);
  const minLeave = leaveBurnCost(node, 1, p.propellant);
  const refuelHere = canRefuelAtAll(state, p);
  const ownerId = state.owners[node.id];

  if (minLeave > 0 && p.fuel < minLeave && !refuelHere) {
    flags.noFuelInWell = true;
    flags.reasons.push(`no fuel to leave ${node.name} (no refuel here)`);
  }

  if (ownerId && ownerId !== p.id && isPurchasable(node)) {
    const owner = state.players.find((x) => x.id === ownerId);
    if (owner && !owner.eliminated && minLeave > 0 && p.fuel < minLeave) {
      const rent = rentDue(state, node.id, ownerId);
      flags.stuckOnEnemyClaim = true;
      flags.reasons.push(
        `stuck on ${owner.name}'s ${node.name} — failed leave owes ${formatMoney(rent)} rent again`,
      );
    }
  }

  let worstRent = 0;
  let worstNode: BoardNode | null = null;
  for (const [nodeId, oid] of Object.entries(state.owners)) {
    if (oid === p.id) continue;
    const n = getNode(state.board, nodeId);
    if (!isPurchasable(n)) continue;
    const owner = state.players.find((x) => x.id === oid);
    if (!owner || owner.eliminated) continue;
    const r = rentDue(state, nodeId, oid);
    if (r > worstRent) {
      worstRent = r;
      worstNode = n;
    }
  }
  if (worstRent > 0 && p.cash < worstRent) {
    flags.belowKnownRent = true;
    flags.reasons.push(
      `cash ${formatMoney(p.cash)} below worst rent ${formatMoney(worstRent)}${worstNode ? ` (${worstNode.name})` : ""}`,
    );
  }

  flags.atRisk =
    flags.noFuelInWell || flags.stuckOnEnemyClaim || flags.belowKnownRent;
  return flags;
}
