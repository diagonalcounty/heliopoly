/**
 * Offline approximate AU stats (Earth–body style distances).
 * Fake table for seeding — not live Horizons. Replace later with real ephemeris.
 */
import type { EphemerisStat } from "./types";

export interface BodyDistanceTable {
  id: string;
  name: string;
  /** AU-scale placeholders (illustrative). */
  nearest: number;
  furthest: number;
  average: number;
}

/** Keys match board node ids where possible. */
export const EPHEMERIS_TABLE: Record<string, BodyDistanceTable> = {
  earth: {
    id: "earth",
    name: "Earth",
    nearest: 0.983,
    furthest: 1.017,
    average: 1.0,
  },
  mercury: {
    id: "mercury",
    name: "Mercury",
    nearest: 0.307,
    furthest: 0.467,
    average: 0.387,
  },
  venus: {
    id: "venus",
    name: "Venus",
    nearest: 0.718,
    furthest: 0.728,
    average: 0.723,
  },
  mars: {
    id: "mars",
    name: "Mars",
    nearest: 1.381,
    furthest: 1.666,
    average: 1.524,
  },
  dock: {
    id: "dock",
    name: "Mars Space Dock",
    nearest: 1.38,
    furthest: 1.67,
    average: 1.52,
  },
  io: {
    id: "io",
    name: "Io",
    nearest: 4.95,
    furthest: 5.46,
    average: 5.2,
  },
  europa: {
    id: "europa",
    name: "Europa",
    nearest: 4.95,
    furthest: 5.46,
    average: 5.2,
  },
  ganymede: {
    id: "ganymede",
    name: "Ganymede",
    nearest: 4.95,
    furthest: 5.46,
    average: 5.2,
  },
  callisto: {
    id: "callisto",
    name: "Callisto",
    nearest: 4.95,
    furthest: 5.46,
    average: 5.2,
  },
  charon: {
    id: "charon",
    name: "Charon",
    nearest: 29.7,
    furthest: 49.3,
    average: 39.5,
  },
};

const STATS: EphemerisStat[] = ["nearest", "furthest", "average"];

export function ephemerisForBody(bodyId: string | null | undefined): BodyDistanceTable {
  if (bodyId && EPHEMERIS_TABLE[bodyId]) return EPHEMERIS_TABLE[bodyId];
  return EPHEMERIS_TABLE.earth;
}

export function pickStat(rand01: number): EphemerisStat {
  return STATS[Math.floor(rand01 * 3) % 3];
}

export function distanceAu(
  bodyId: string | null | undefined,
  stat: EphemerisStat,
): number {
  const row = ephemerisForBody(bodyId);
  return row[stat];
}
