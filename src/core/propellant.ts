import type { PropellantId } from "./types";

export interface PropellantDef {
  id: PropellantId;
  label: string;
  /** Display with unicode subscripts (handbook, roomy UI). */
  short: string;
  /**
   * Dense UI label without unicode subscripts (CH4 / H2).
   * Subscripts (₄ ₂) inflate line boxes and blow standings row height.
   */
  uiShort: string;
  /** Multiplier on leave-burn (lower = more efficient). */
  leaveMult: number;
  /** Chance [0–1] of tank leak when **landing** (insertion), not on leave burn. */
  leaveRisk: number;
  blurb: string;
}

export const PROPELLANTS: Record<PropellantId, PropellantDef> = {
  methane: {
    id: "methane",
    label: "Methane (CH₄)",
    short: "CH₄",
    uiShort: "CH4",
    leaveMult: 1.0,
    leaveRisk: 0, // no tank leaks
    blurb:
      "Stable tanks. Fuel strike on Titan or Enceladus with a depot. No leak risk.",
  },
  hydrogen: {
    id: "hydrogen",
    label: "Hydrogen (H₂)",
    short: "H₂",
    uiShort: "H2",
    leaveMult: 0.85,
    /** Landing insertion → chance of catastrophic half-tank leak. */
    leaveRisk: 0.1,
    blurb:
      "Cheaper leave burns. Ice strikes on Enceladus/Mars/Europa/Ganymede with a depot. Leak on landing: half fuel + lose a turn to repair.",
  },
};

export function propellantLabel(id: PropellantId): string {
  return PROPELLANTS[id].short;
}

/** Standings / telemetry / tight chrome — no subscript glyphs. */
export function propellantUiShort(id: PropellantId): string {
  return PROPELLANTS[id].uiShort;
}
