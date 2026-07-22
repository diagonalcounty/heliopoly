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
