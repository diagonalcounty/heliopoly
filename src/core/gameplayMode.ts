/**
 * Gameplay version catalog (#132).
 * Major version = distinct ruleset. Only V1 is shipped; V2–V4 are listed, locked.
 */

export type GameplayModeId = "v1" | "v2" | "v3" | "v4";

export type GameplayModeDef = {
  id: GameplayModeId;
  label: string;
  blurb: string;
  shipped: boolean;
  buildMajor: 1 | 2 | 3 | 4;
};

/** Keep in sync with package.json version. */
export const V1_BUILD = "1.1.0";

export const GAMEPLAY_MODE_KEY = "heliopoly-gameplay-mode";

export const GAMEPLAY_MODES: readonly GameplayModeDef[] = [
  {
    id: "v1",
    label: "V1 Boardgame",
    blurb: "Board-game loop — claims, rent, duels, and the charter clock.",
    shipped: true,
    buildMajor: 1,
  },
  {
    id: "v2",
    label: "V2 Orbital economics",
    blurb: "Investment and light terraforming. Not shipped.",
    shipped: false,
    buildMajor: 2,
  },
  {
    id: "v3",
    label: "V3 Settlement",
    blurb: "Colonization. Not shipped.",
    shipped: false,
    buildMajor: 3,
  },
  {
    id: "v4",
    label: "V4 Governance",
    blurb: "Laws as code. Not shipped.",
    shipped: false,
    buildMajor: 4,
  },
];

export function isGameplayModeId(v: unknown): v is GameplayModeId {
  return v === "v1" || v === "v2" || v === "v3" || v === "v4";
}

/** Invalid or empty storage becomes v1. Valid unshipped ids are kept. */
export function parseStoredMode(raw: string | null): GameplayModeId {
  if (isGameplayModeId(raw)) return raw;
  return "v1";
}

export function modeDef(id: GameplayModeId): GameplayModeDef {
  const found = GAMEPLAY_MODES.find((m) => m.id === id);
  return found ?? GAMEPLAY_MODES[0]!;
}

export function shippedModes(): readonly GameplayModeDef[] {
  return GAMEPLAY_MODES.filter((m) => m.shipped);
}

export function buildForMode(id: GameplayModeId): string {
  if (id === "v1") return V1_BUILD;
  return `${modeDef(id).buildMajor}.x.x`;
}

/** Closed-row / option label. Shipped includes build; locked stay visible. */
export function modeSelectLabel(id: GameplayModeId, build?: string): string {
  const def = modeDef(id);
  if (def.shipped) {
    return `${def.label} · ${build ?? buildForMode(id)}`;
  }
  return `${def.label} (unshipped)`;
}
