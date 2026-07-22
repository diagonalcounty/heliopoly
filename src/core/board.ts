import type { Board, BoardNode, GravityClass } from "./types";

/** Place a body on an orbital ring (normalized coords, sun at 0.5,0.5). */
function onRing(
  ringIndex: number,
  angleDeg: number,
  ringRadii: number[],
): { x: number; y: number; ring: number } {
  const r = ringRadii[Math.min(ringIndex, ringRadii.length - 1)] ?? 0.2;
  const a = ((angleDeg - 90) * Math.PI) / 180; // 0° = top
  return {
    x: 0.5 + r * Math.cos(a),
    y: 0.5 + r * Math.sin(a),
    ring: ringIndex,
  };
}

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
 * Orbital-ring layout (visual B) + directed flight path.
 * Rings: 0 Mercury … outer Jupiter system.
 */
export function createV0Board(): Board {
  // Keep max radius ≤ ~0.40 so nodes + labels stay inside the unit square
  // (draw code also fit-zooms to the full graph with padding).
  const ringRadii = [0.11, 0.18, 0.25, 0.32, 0.38, 0.4];

  // Spread angles so labels don’t stack; path still follows `chain` below.
  const pos = {
    mercury: onRing(0, 15, ringRadii),
    s1: onRing(0, 70, ringRadii),
    venus: onRing(1, 110, ringRadii),
    s2: onRing(1, 160, ringRadii),
    earth: onRing(2, 200, ringRadii),
    s3: onRing(2, 245, ringRadii),
    fs1: onRing(2, 290, ringRadii),
    s4: onRing(3, 330, ringRadii),
    mars: onRing(3, 20, ringRadii),
    dock: onRing(3, 55, ringRadii),
    s5: onRing(4, 90, ringRadii),
    j_approach: onRing(4, 125, ringRadii),
    j_grav_in: onRing(5, 150, ringRadii),
    io: onRing(5, 185, ringRadii),
    europa: onRing(5, 220, ringRadii),
    ganymede: onRing(5, 255, ringRadii),
    callisto: onRing(5, 290, ringRadii),
    fs2: onRing(5, 325, ringRadii),
    j_exit: onRing(4, 0, ringRadii),
    s6: onRing(3, 170, ringRadii),
    s7: onRing(2, 140, ringRadii),
    s8: onRing(1, 40, ringRadii),
  };

  const nodes: BoardNode[] = [
    n({
      id: "earth",
      name: "Earth",
      kind: "planet",
      ...pos.earth,
      landingBonus: 500,
      refuel: "free",
      gravityClass: 3,
      price: 0,
    }),
    n({ id: "s1", name: "Transit", kind: "space", ...pos.s1 }),
    n({
      id: "mercury",
      name: "Mercury",
      kind: "planet",
      ...pos.mercury,
      price: 400,
      rent: 50,
      group: "inner",
      gravityClass: 2,
      refuel: "station",
    }),
    n({ id: "s2", name: "Transit", kind: "space", ...pos.s2 }),
    n({
      id: "venus",
      name: "Venus",
      kind: "planet",
      ...pos.venus,
      price: 500,
      rent: 70,
      group: "inner",
      gravityClass: 3,
      refuel: "station",
    }),
    n({ id: "s3", name: "Transit", kind: "space", ...pos.s3 }),
    n({
      id: "fs1",
      name: "Charter Beacon I",
      kind: "federation",
      ...pos.fs1,
      landingBonus: 300,
      refuel: "none",
    }),
    n({ id: "s4", name: "Transit", kind: "space", ...pos.s4 }),
    n({
      id: "mars",
      name: "Mars",
      kind: "planet",
      ...pos.mars,
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
      ...pos.dock,
      price: 450,
      rent: 40,
      group: "docks",
      refuel: "paid",
      gravityClass: 0,
    }),
    n({ id: "s5", name: "Transit", kind: "space", ...pos.s5 }),
    n({
      id: "j_approach",
      name: "Jupiter Approach",
      kind: "space",
      ...pos.j_approach,
    }),
    n({
      id: "j_grav_in",
      name: "Jupiter Gravity",
      kind: "gravity",
      ...pos.j_grav_in,
    }),
    n({
      id: "io",
      name: "Io",
      kind: "moon",
      ...pos.io,
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
      ...pos.europa,
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
      ...pos.ganymede,
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
      ...pos.callisto,
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
      ...pos.fs2,
      landingBonus: 400,
      refuel: "none",
    }),
    n({
      id: "j_exit",
      name: "Jupiter Exit",
      kind: "space",
      ...pos.j_exit,
    }),
    n({ id: "s6", name: "Transit", kind: "space", ...pos.s6 }),
    n({ id: "s7", name: "Home Stretch", kind: "space", ...pos.s7 }),
    n({ id: "s8", name: "Transit", kind: "space", ...pos.s8 }),
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

  return { nodes: byId, startId: "earth", rings: ringRadii };
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
