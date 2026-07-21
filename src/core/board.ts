import type { Board, BoardNode, GravityClass } from "./types";

/** Simplified board: inner system ring + Jupiter moon loop. Original layout. */

function n(
  partial: Omit<BoardNode, "next" | "refuel" | "fuelToLeave" | "gravityClass"> & {
    next?: string[];
    refuel?: BoardNode["refuel"];
    fuelToLeave?: boolean;
    gravityClass?: GravityClass;
  },
): BoardNode {
  const { next, refuel, fuelToLeave, gravityClass, ...rest } = partial;
  const g = gravityClass ?? (fuelToLeave ? 2 : 0);
  return {
    ...rest,
    next: next ?? [],
    refuel: refuel ?? "none",
    gravityClass: g,
    fuelToLeave: g > 0 || !!fuelToLeave,
  };
}

/**
 * Layout is abstract (not a commercial board clone).
 * Path: Earth → Mercury → Venus → Beacon I → Mars → dock → Jupiter loop → Earth.
 */
export function createV0Board(): Board {
  const nodes: BoardNode[] = [
    n({
      id: "earth",
      name: "Earth",
      kind: "planet",
      x: 0.5,
      y: 0.88,
      landingBonus: 500,
      refuel: "free",
      gravityClass: 3,
      price: 0,
    }),
    n({ id: "s1", name: "Transit", kind: "space", x: 0.32, y: 0.82 }),
    n({
      id: "mercury",
      name: "Mercury",
      kind: "planet",
      x: 0.18,
      y: 0.7,
      price: 400,
      rent: 50,
      group: "inner",
      gravityClass: 2,
      refuel: "station",
    }),
    n({ id: "s2", name: "Transit", kind: "space", x: 0.12, y: 0.55 }),
    n({
      id: "venus",
      name: "Venus",
      kind: "planet",
      x: 0.14,
      y: 0.38,
      price: 500,
      rent: 70,
      group: "inner",
      gravityClass: 3,
      refuel: "station",
    }),
    n({ id: "s3", name: "Transit", kind: "space", x: 0.22, y: 0.24 }),
    n({
      id: "fs1",
      name: "Charter Beacon I",
      kind: "federation",
      x: 0.38,
      y: 0.14,
      landingBonus: 300,
      refuel: "none",
    }),
    n({ id: "s4", name: "Transit", kind: "space", x: 0.55, y: 0.1 }),
    n({
      id: "mars",
      name: "Mars",
      kind: "planet",
      x: 0.72,
      y: 0.16,
      price: 600,
      rent: 80,
      group: "mars",
      gravityClass: 2,
      refuel: "station",
    }),
    n({
      id: "dock",
      name: "Mars Space Dock",
      kind: "dock",
      x: 0.86,
      y: 0.28,
      price: 450,
      rent: 40,
      group: "docks",
      refuel: "paid",
      gravityClass: 0,
    }),
    n({ id: "s5", name: "Transit", kind: "space", x: 0.9, y: 0.44 }),
    n({
      id: "j_approach",
      name: "Jupiter Approach",
      kind: "space",
      x: 0.88,
      y: 0.6,
    }),
    n({
      id: "j_grav_in",
      name: "Jupiter Gravity",
      kind: "gravity",
      x: 0.78,
      y: 0.72,
    }),
    n({
      id: "io",
      name: "Io",
      kind: "moon",
      x: 0.68,
      y: 0.78,
      price: 350,
      rent: 45,
      group: "jupiter",
      gravityClass: 2,
      refuel: "station",
    }),
    n({
      id: "europa",
      name: "Europa",
      kind: "moon",
      x: 0.58,
      y: 0.72,
      price: 400,
      rent: 55,
      group: "jupiter",
      gravityClass: 2,
      refuel: "station",
    }),
    n({
      id: "ganymede",
      name: "Ganymede",
      kind: "moon",
      x: 0.55,
      y: 0.58,
      price: 550,
      rent: 90,
      group: "jupiter",
      gravityClass: 2,
      refuel: "station",
    }),
    n({
      id: "callisto",
      name: "Callisto",
      kind: "moon",
      x: 0.65,
      y: 0.48,
      price: 500,
      rent: 75,
      group: "jupiter",
      gravityClass: 2,
      refuel: "station",
    }),
    n({
      id: "fs2",
      name: "Charter Beacon II",
      kind: "federation",
      x: 0.78,
      y: 0.5,
      landingBonus: 400,
      refuel: "none",
    }),
    n({
      id: "j_exit",
      name: "Jupiter Exit",
      kind: "space",
      x: 0.7,
      y: 0.36,
    }),
    n({ id: "s6", name: "Transit", kind: "space", x: 0.58, y: 0.28 }),
    n({ id: "s7", name: "Home Stretch", kind: "space", x: 0.5, y: 0.4 }),
    n({ id: "s8", name: "Transit", kind: "space", x: 0.5, y: 0.62 }),
  ];

  const byId: Record<string, BoardNode> = {};
  for (const node of nodes) byId[node.id] = node;

  const chain: Array<[string, string]> = [
    ["earth", "s1"],
    ["s1", "mercury"],
    ["mercury", "s2"],
    ["s2", "venus"],
    ["venus", "s3"],
    ["s3", "fs1"],
    ["fs1", "s4"],
    ["s4", "mars"],
    ["mars", "dock"],
    ["dock", "s5"],
    ["s5", "j_approach"],
    ["j_approach", "j_grav_in"],
    ["j_grav_in", "io"],
    ["io", "europa"],
    ["europa", "ganymede"],
    ["ganymede", "callisto"],
    ["callisto", "fs2"],
    ["fs2", "j_exit"],
    ["j_exit", "s6"],
    ["s6", "s7"],
    ["s7", "s8"],
    ["s8", "earth"],
  ];

  for (const [from, to] of chain) {
    byId[from].next = [to];
  }

  return { nodes: byId, startId: "earth" };
}

export function getNode(board: Board, id: string): BoardNode {
  const node = board.nodes[id];
  if (!node) throw new Error(`Unknown node: ${id}`);
  return node;
}

export function isPurchasable(node: BoardNode): boolean {
  return (
    (node.kind === "planet" ||
      node.kind === "moon" ||
      node.kind === "dock") &&
    typeof node.price === "number" &&
    node.price > 0
  );
}

export function nodeList(board: Board): BoardNode[] {
  return Object.values(board.nodes);
}
