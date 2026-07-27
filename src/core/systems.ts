/** System / monopoly definitions for Heliopoly board. */

export type SystemId =
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn";

export interface SystemDef {
  id: SystemId;
  name: string;
  /** All deed node ids in the set (must own all for monopoly). */
  deedIds: string[];
  /** Moon paint for UI */
  moonColor?: string;
}

export const SYSTEMS: Record<SystemId, SystemDef> = {
  mercury: {
    id: "mercury",
    name: "Mercury",
    deedIds: ["mercury"],
  },
  venus: {
    id: "venus",
    name: "Venus",
    deedIds: ["venus"],
  },
  mars: {
    id: "mars",
    name: "Mars",
    deedIds: ["elon", "mars", "phobos", "deimos"],
  },
  jupiter: {
    id: "jupiter",
    name: "Jupiter",
    deedIds: ["holst", "io", "europa", "ganymede", "callisto"],
    moonColor: "#ff9f43", // orange
  },
  saturn: {
    id: "saturn",
    name: "Saturn",
    deedIds: [
      "daktulios",
      "titan",
      "enceladus",
      "iapetus",
      "mimas",
      "rhea",
      "dione",
      "tethys",
    ],
    moonColor: "#f6e58d", // yellow
  },
};

export function systemOfGroup(group: string | undefined): SystemDef | null {
  if (!group) return null;
  return SYSTEMS[group as SystemId] ?? null;
}

export function hasSystemMonopoly(
  owners: Record<string, string>,
  ownerId: string,
  systemId: SystemId,
): boolean {
  const sys = SYSTEMS[systemId];
  return sys.deedIds.every((id) => owners[id] === ownerId);
}

/**
 * Space-station hubs (Monopoly “railroads”): Elon · Holst · Daktulios.
 * Own all three → higher rent when opponents land on any hub.
 */
export const STATION_HUB_IDS = ["elon", "holst", "daktulios"] as const;

export type StationHubId = (typeof STATION_HUB_IDS)[number];

export function isStationHub(nodeId: string): boolean {
  return (STATION_HUB_IDS as readonly string[]).includes(nodeId);
}

/** How many of the three hubs this pilot owns. */
export function stationHubsOwned(
  owners: Record<string, string>,
  ownerId: string,
): number {
  return STATION_HUB_IDS.filter((id) => owners[id] === ownerId).length;
}

/** Full station network (all three hubs). */
export function hasStationNetwork(
  owners: Record<string, string>,
  ownerId: string,
): boolean {
  return stationHubsOwned(owners, ownerId) === STATION_HUB_IDS.length;
}

/**
 * Rent multiplier on a hub from the station set.
 * 1 hub → ×1, 2 → ×2, 3 (full network) → ×4 (railroad-style scale).
 * Non-hubs → ×1.
 */
export function stationNetworkRentMult(
  owners: Record<string, string>,
  ownerId: string,
  nodeId: string,
): number {
  if (!isStationHub(nodeId)) return 1;
  const n = stationHubsOwned(owners, ownerId);
  if (n <= 1) return 1;
  if (n === 2) return 2;
  return 4; // all three
}
