import type { Board, BoardNode, GravityClass } from "./types";

function onRing(
  ringIndex: number,
  angleDeg: number,
  ringRadii: number[],
): { x: number; y: number; ring: number } {
  const r = ringRadii[Math.min(ringIndex, ringRadii.length - 1)] ?? 0.2;
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: 0.5 + r * Math.cos(a),
    y: 0.5 + r * Math.sin(a),
    ring: ringIndex,
  };
}

function n(
  partial: Omit<
    BoardNode,
    "next" | "refuel" | "fuelToLeave" | "gravityClass"
  > & {
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
 * Path: Earth → Venus → Mercury → Mars system → belt blanks →
 * Jupiter ring → Saturn ring → Earth.
 * Rings outward: Mercury, Venus, Earth, Mars, Belt, Jupiter, Saturn.
 */
export function createV0Board(): Board {
  const ringRadii = [0.1, 0.16, 0.22, 0.28, 0.34, 0.4, 0.46];

  const nodes: BoardNode[] = [
    // —— Earth (not purchasable) ——
    n({
      id: "earth",
      name: "Earth",
      kind: "planet",
      ...onRing(2, 0, ringRadii),
      landingBonus: 400,
      refuel: "free",
      gravityClass: 3,
      price: 0,
    }),
    n({
      id: "t_ev",
      name: "Transit",
      kind: "space",
      ...onRing(2, 40, ringRadii),
    }),

    // —— Venus ——
    n({
      id: "venus",
      name: "Venus",
      kind: "planet",
      ...onRing(1, 80, ringRadii),
      price: 500,
      rent: 70,
      group: "venus",
      gravityClass: 3,
      refuel: "station",
    }),
    n({
      id: "t_vm",
      name: "Transit",
      kind: "space",
      ...onRing(1, 120, ringRadii),
    }),

    // —— Mercury ——
    n({
      id: "mercury",
      name: "Mercury",
      kind: "planet",
      ...onRing(0, 160, ringRadii),
      price: 400,
      rent: 60,
      group: "mercury",
      gravityClass: 2,
      refuel: "station",
    }),
    n({
      id: "t_mm",
      name: "Transit",
      kind: "space",
      ...onRing(0, 200, ringRadii),
    }),

    // —— Mars system: Elon, Mars, Phobos, Deimos ——
    n({
      id: "elon",
      name: "Elon",
      kind: "federation",
      ...onRing(3, 220, ringRadii),
      price: 550,
      rent: 75,
      group: "mars",
      refuel: "paid",
      gravityClass: 0,
    }),
    n({
      id: "mars",
      name: "Mars",
      kind: "planet",
      ...onRing(3, 250, ringRadii),
      price: 600,
      rent: 85,
      group: "mars",
      gravityClass: 2,
      refuel: "station",
    }),
    n({
      id: "phobos",
      name: "Phobos",
      kind: "moon",
      ...onRing(3, 280, ringRadii),
      price: 250,
      rent: 30,
      group: "mars",
      gravityClass: 1,
      refuel: "station",
    }),
    n({
      id: "deimos",
      name: "Deimos",
      kind: "moon",
      ...onRing(3, 310, ringRadii),
      price: 250,
      rent: 30,
      group: "mars",
      gravityClass: 1,
      refuel: "station",
    }),
    // Deimos @ 310°; belt chain toward Deimos for home-arc clearance (#99),
    // then each hop nudged +40% of the way to the *next* belt/Holst stop
    // so pips sit farther from the Earth-return curve (still not on Holst).
    n({
      id: "t_mb",
      name: "Transit",
      kind: "space",
      // was 325 → belt1@345; +40% of 20° → 333
      ...onRing(3, 333, ringRadii),
    }),

    // —— Asteroid belt (blanks — combat) ——
    n({
      id: "belt1",
      name: "Belt",
      kind: "space",
      // was 345 → belt2@15 (30° fwd); +40% → 357
      ...onRing(4, 357, ringRadii),
    }),
    n({
      id: "belt2",
      name: "Belt",
      kind: "space",
      // Deimos +3; was 15 → belt3@50; +40% of 35° → 29
      ...onRing(4, 29, ringRadii),
    }),
    n({
      id: "belt3",
      name: "Belt",
      kind: "space",
      // was 50 → 95; +40% of 45° → 68
      ...onRing(4, 68, ringRadii),
    }),
    n({
      id: "belt4",
      name: "Belt",
      kind: "space",
      // was 95 → 140; +40% → 113
      ...onRing(4, 113, ringRadii),
    }),
    n({
      id: "belt5",
      name: "Belt",
      kind: "space",
      // was 140 → 185; +40% → 158
      ...onRing(4, 158, ringRadii),
    }),
    n({
      id: "belt6",
      name: "Belt",
      kind: "space",
      // was 185 → Holst@240; +40% of 55° → 207
      ...onRing(4, 207, ringRadii),
    }),

    // —— Jupiter: Holst + moons (orange) + blanks ——
    n({
      id: "holst",
      name: "Holst Space Station",
      kind: "federation",
      ...onRing(5, 240, ringRadii),
      price: 700,
      rent: 100,
      group: "jupiter",
      refuel: "paid",
      gravityClass: 0,
    }),
    n({
      id: "j_b1",
      name: "J Transit",
      kind: "space",
      ...onRing(5, 265, ringRadii),
    }),
    n({
      id: "io",
      name: "Io",
      kind: "moon",
      ...onRing(5, 290, ringRadii),
      price: 350,
      rent: 45,
      group: "jupiter",
      gravityClass: 2,
      refuel: "station",
      paint: "jupiter-moon",
    }),
    n({
      id: "j_b2",
      name: "J Transit",
      kind: "space",
      ...onRing(5, 315, ringRadii),
    }),
    n({
      id: "europa",
      name: "Europa",
      kind: "moon",
      ...onRing(5, 340, ringRadii),
      price: 400,
      rent: 55,
      group: "jupiter",
      gravityClass: 2,
      refuel: "station",
      paint: "jupiter-moon",
    }),
    n({
      id: "j_b3",
      name: "J Transit",
      kind: "space",
      ...onRing(5, 5, ringRadii),
    }),
    n({
      id: "ganymede",
      name: "Ganymede",
      kind: "moon",
      ...onRing(5, 30, ringRadii),
      price: 550,
      rent: 90,
      group: "jupiter",
      gravityClass: 2,
      refuel: "station",
      paint: "jupiter-moon",
    }),
    n({
      id: "j_b4",
      name: "J Transit",
      kind: "space",
      ...onRing(5, 55, ringRadii),
    }),
    n({
      id: "callisto",
      name: "Callisto",
      kind: "moon",
      ...onRing(5, 80, ringRadii),
      price: 500,
      rent: 75,
      group: "jupiter",
      gravityClass: 2,
      refuel: "station",
      paint: "jupiter-moon",
    }),
    n({
      id: "j_b5",
      name: "J Transit",
      kind: "space",
      ...onRing(5, 105, ringRadii),
    }),

    // —— Saturn: Daktulios + moons (yellow) + blanks ——
    n({
      id: "daktulios",
      name: "Daktulios",
      kind: "federation",
      ...onRing(6, 130, ringRadii),
      price: 800,
      rent: 120,
      group: "saturn",
      refuel: "paid",
      gravityClass: 0,
    }),
    n({
      id: "titan",
      name: "Titan",
      kind: "moon",
      ...onRing(6, 155, ringRadii),
      price: 600,
      rent: 95,
      group: "saturn",
      gravityClass: 2,
      refuel: "station",
      paint: "saturn-moon",
    }),
    n({
      id: "s_b1",
      name: "S Transit",
      kind: "space",
      ...onRing(6, 175, ringRadii),
    }),
    n({
      id: "enceladus",
      name: "Enceladus",
      kind: "moon",
      ...onRing(6, 195, ringRadii),
      price: 320,
      rent: 40,
      group: "saturn",
      gravityClass: 1,
      refuel: "station",
      paint: "saturn-moon",
    }),
    n({
      id: "s_b2",
      name: "S Transit",
      kind: "space",
      ...onRing(6, 215, ringRadii),
    }),
    n({
      id: "iapetus",
      name: "Iapetus",
      kind: "moon",
      ...onRing(6, 235, ringRadii),
      price: 380,
      rent: 50,
      group: "saturn",
      gravityClass: 1,
      refuel: "station",
      paint: "saturn-moon",
    }),
    n({
      id: "s_b3",
      name: "S Transit",
      kind: "space",
      ...onRing(6, 255, ringRadii),
    }),
    n({
      id: "mimas",
      name: "Mimas",
      kind: "moon",
      ...onRing(6, 275, ringRadii),
      price: 280,
      rent: 35,
      group: "saturn",
      gravityClass: 1,
      refuel: "station",
      paint: "saturn-moon",
    }),
    n({
      id: "s_b4",
      name: "S Transit",
      kind: "space",
      ...onRing(6, 295, ringRadii),
    }),
    n({
      id: "rhea",
      name: "Rhea",
      kind: "moon",
      ...onRing(6, 315, ringRadii),
      price: 420,
      rent: 60,
      group: "saturn",
      gravityClass: 1,
      refuel: "station",
      paint: "saturn-moon",
    }),
    n({
      id: "s_b5",
      name: "S Transit",
      kind: "space",
      ...onRing(6, 335, ringRadii),
    }),
    n({
      id: "dione",
      name: "Dione",
      kind: "moon",
      ...onRing(6, 355, ringRadii),
      price: 400,
      rent: 55,
      group: "saturn",
      gravityClass: 1,
      refuel: "station",
      paint: "saturn-moon",
    }),
    n({
      id: "s_b6",
      name: "S Transit",
      kind: "space",
      ...onRing(6, 20, ringRadii),
    }),
    n({
      id: "tethys",
      name: "Tethys",
      kind: "moon",
      ...onRing(6, 40, ringRadii),
      price: 360,
      rent: 48,
      group: "saturn",
      gravityClass: 1,
      refuel: "station",
      paint: "saturn-moon",
    }),
    n({
      id: "t_se",
      name: "Homeward",
      kind: "space",
      ...onRing(5, 70, ringRadii),
    }),
  ];

  const byId: Record<string, BoardNode> = {};
  for (const node of nodes) byId[node.id] = node;

  const chain: Array<[string, string]> = [
    ["earth", "t_ev"],
    ["t_ev", "venus"],
    ["venus", "t_vm"],
    ["t_vm", "mercury"],
    ["mercury", "t_mm"],
    ["t_mm", "elon"],
    ["elon", "mars"],
    ["mars", "phobos"],
    ["phobos", "deimos"],
    ["deimos", "t_mb"],
    ["t_mb", "belt1"],
    ["belt1", "belt2"],
    ["belt2", "belt3"],
    ["belt3", "belt4"],
    ["belt4", "belt5"],
    ["belt5", "belt6"],
    ["belt6", "holst"],
    ["holst", "j_b1"],
    ["j_b1", "io"],
    ["io", "j_b2"],
    ["j_b2", "europa"],
    ["europa", "j_b3"],
    ["j_b3", "ganymede"],
    ["ganymede", "j_b4"],
    ["j_b4", "callisto"],
    ["callisto", "j_b5"],
    ["j_b5", "daktulios"],
    ["daktulios", "titan"],
    ["titan", "s_b1"],
    ["s_b1", "enceladus"],
    ["enceladus", "s_b2"],
    ["s_b2", "iapetus"],
    ["iapetus", "s_b3"],
    ["s_b3", "mimas"],
    ["mimas", "s_b4"],
    ["s_b4", "rhea"],
    ["rhea", "s_b5"],
    ["s_b5", "dione"],
    ["dione", "s_b6"],
    ["s_b6", "tethys"],
    ["tethys", "t_se"],
    ["t_se", "earth"],
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
    typeof node.price === "number" &&
    node.price > 0 &&
    (node.kind === "planet" ||
      node.kind === "moon" ||
      node.kind === "federation" ||
      node.kind === "dock")
  );
}

export function nodeList(board: Board): BoardNode[] {
  return Object.values(board.nodes);
}
