import type { PropellantId } from "./types";

export interface PropellantDef {
  id: PropellantId;
  label: string;
  short: string;
  /** Multiplier on leave-burn (lower = more efficient). */
  leaveMult: number;
  /** Chance [0–1] of boil-off / leak when leaving a gravity body. */
  leaveRisk: number;
  blurb: string;
}

export const PROPELLANTS: Record<PropellantId, PropellantDef> = {
  methane: {
    id: "methane",
    label: "Methane (CH₄)",
    short: "CH₄",
    leaveMult: 1.0,
    leaveRisk: 0.02,
    blurb: "Stable storage. Common ISRU path. Steady burns.",
  },
  hydrogen: {
    id: "hydrogen",
    label: "Hydrogen (H₂)",
    short: "H₂",
    leaveMult: 0.85,
    leaveRisk: 0.12,
    blurb: "Efficient exit burns. Boil-off risk when leaving deep wells.",
  },
};

export function propellantLabel(id: PropellantId): string {
  return PROPELLANTS[id].short;
}
