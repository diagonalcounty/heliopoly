import { getNode, isPurchasable } from "./board";
import { formatMoney } from "./currency";
import { leaveBurnCost } from "./fuel";
import { PROPELLANTS } from "./propellant";
import {
  depotPlaceCashCost,
  netWorth,
  parkFeralChance,
  PARK_FERAL_THRESHOLD,
} from "./rules";
import { hasSystemMonopoly, systemOfGroup } from "./systems";
import type { GameState, Player } from "./types";
import { ephemerisForBody } from "./ephemeris";

export interface BodyInspect {
  title: string;
  lines: string[];
}

/** Tooltip content for a body under the current pilot’s perspective. */
export function inspectBody(
  state: GameState,
  nodeId: string,
  viewer: Player | null,
): BodyInspect {
  const node = getNode(state.board, nodeId);
  const lines: string[] = [];
  const sys = systemOfGroup(node.group);

  lines.push(`Type: ${node.kind}${node.paint ? ` (${node.paint})` : ""}`);
  if (sys) lines.push(`System: ${sys.name}`);

  const ownerId = state.owners[nodeId];
  if (ownerId) {
    const owner = state.players.find((p) => p.id === ownerId);
    const mono =
      !!sys &&
      !!owner &&
      hasSystemMonopoly(state.owners, owner.id, sys.id);
    lines.push(
      `Owner: ${owner?.name ?? ownerId}${mono ? " · SYSTEM MONOPOLY (rent ×2)" : ""}`,
    );
  } else if (isPurchasable(node)) {
    lines.push(`Owner: unclaimed — available`);
  } else {
    lines.push(`Owner: n/a (not a claim)`);
  }

  if (isPurchasable(node)) {
    lines.push(`Buy price: ${formatMoney(node.price ?? 0)}`);
    const base = node.rent ?? 0;
    let rentNow = base;
    if (ownerId) {
      const owner = state.players.find((p) => p.id === ownerId)!;
      const mono =
        !!sys && hasSystemMonopoly(state.owners, owner.id, sys.id);
      rentNow = Math.floor(base * (mono ? 2 : 1) * (state.stations[nodeId] ? 1.5 : 1));
    }
    lines.push(
      `Rent: base ${formatMoney(base)}${ownerId ? ` · now ${formatMoney(rentNow)}` : ""}`,
    );
    if (state.stations[nodeId]) lines.push(`Fuel depot: yes (built)`);
    else if (node.kind === "planet" || node.kind === "moon")
      lines.push(`Fuel depot: none`);
  }

  // Escape fuel for viewer
  if (viewer && !viewer.eliminated) {
    const prop = PROPELLANTS[viewer.propellant];
    const samples = [2, 7, 12].map((steps) => {
      const c = leaveBurnCost(node, steps, viewer.propellant);
      return `roll ${steps}→${c}`;
    });
    lines.push(
      `Leave fuel (${prop.short}, you have ${viewer.fuel}): ${samples.join(" · ")}`,
    );
    if (node.refuel === "free" || node.id === "earth")
      lines.push(`Refuel here: free (Earth/home rate)`);
    else if (node.refuel === "paid")
      lines.push(`Refuel here: paid dock/station rates`);
    else if (node.refuel === "station")
      lines.push(`Refuel here: only with a fuel depot (yours free / foe paid)`);
    else lines.push(`Refuel here: none`);
  }

  // Feral risk from owner's cumulative no-move parks
  if (ownerId && isPurchasable(node)) {
    const owner = state.players.find((p) => p.id === ownerId)!;
    const parks = owner.parkCount;
    const chance = parkFeralChance(parks);
    lines.push(`Owner park count: ${parks}`);
    if (chance <= 0) {
      const until = Math.max(0, PARK_FERAL_THRESHOLD - parks);
      lines.push(
        until === 0
          ? `Feral checks start at park ${PARK_FERAL_THRESHOLD}+ (no-move seat turns).`
          : `${until} more park(s) until feral checks (threshold ${PARK_FERAL_THRESHOLD}).`,
      );
    } else {
      lines.push(
        `Feral risk ${Math.round(chance * 100)}% per claim on each no-move park (all claims roll independently).`,
      );
    }
  }

  // Light real-world flavor
  const eph = ephemerisForBody(nodeId);
  if (eph && nodeId !== "earth" && isPurchasable(node)) {
    lines.push(
      `Ephemeris table (AU-ish): near ${eph.nearest} · avg ${eph.average} · far ${eph.furthest}`,
    );
  }

  if (viewer && ownerId === viewer.id) {
    lines.push(`Your net worth: ${formatMoney(netWorth(state, viewer))}`);
    const book = viewer.claimBooks[nodeId];
    if (book) {
      const earned = book.rentCollected + book.gusherCollected;
      if (book.cashInvested > 0) {
        const pct = Math.round((earned / book.cashInvested) * 100);
        lines.push(
          `This claim: ${pct}% recovered (${formatMoney(earned)} / ${formatMoney(book.cashInvested)})`,
        );
      } else if (earned > 0) {
        lines.push(`This claim: no cash in · ${formatMoney(earned)} earned`);
      }
    }
  }

  // Buy / depot hints for current body when viewer is here
  if (viewer && viewer.position === nodeId) {
    if (isPurchasable(node) && !ownerId) {
      const afford = viewer.cash >= (node.price ?? 0);
      lines.push(
        afford
          ? `You can BUY this (${formatMoney(node.price ?? 0)}; you have ${formatMoney(viewer.cash)})`
          : `Cannot buy — need ${formatMoney(node.price ?? 0)}, have ${formatMoney(viewer.cash)}`,
      );
    } else if (ownerId && ownerId !== viewer.id) {
      lines.push(`Cannot buy — owned by another pilot`);
    } else if (ownerId === viewer.id) {
      if (state.stations[nodeId]) lines.push(`Depot already built here`);
      else if (viewer.stationsInHand <= 0)
        lines.push(`Cannot build depot — no depots left in hand`);
      else if (node.kind === "planet" || node.kind === "moon") {
        const cost = depotPlaceCashCost(
          viewer.depotsPlacedThisCircuit,
          node.price,
        );
        const costBit =
          cost === 0
            ? "first this circuit FREE"
            : `${formatMoney(cost)} (10% of claim)`;
        lines.push(
          `You can place a FUEL DEPOT here (${viewer.stationsInHand} left · ${costBit})`,
        );
      } else lines.push(`Cannot build depot on stations/hubs — only planets & moons`);
    }
  }

  return { title: node.name, lines };
}
