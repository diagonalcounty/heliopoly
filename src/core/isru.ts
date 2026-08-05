/**
 * ISRU / propellant body rankings — fuel-strike eligibility.
 * Order = easiest extraction first (design tables 2026-07-26).
 * Announcement titles: Oregon Trail–style, no “gusher.”
 */
import type { PropellantId } from "./types";

/** Top H₂ harvest sites — strike if claim + fuel depot. */
export const HYDROGEN_GUSHER_BODIES = [
  "enceladus",
  "mars",
  "europa",
  "ganymede",
] as const;

/** Top CH₄ harvest sites — strike if claim + fuel depot. */
export const METHANE_GUSHER_BODIES = ["titan", "enceladus"] as const;

/** 50% of default starting cash (1500). */
export const GUSHER_BONUS = 750;

/**
 * Deadpan headlines — hydrogen strike.
 * Valence must read as a *win* on first glance (no “breached” / damage words).
 */
export const HYDROGEN_STRIKE_LINES = [
  "You've struck pure ice!",
  "Hydrogen vein tapped!",
  "Massive ice pocket uncovered!",
  "You've hit a hydrogen-rich layer!",
  "Clean ice motherlode found!",
  "Electrolysis goldmine discovered!",
  "Deep ice reserve tapped!",
] as const;

/**
 * Deadpan headlines — methane strike.
 * Same rule: strike / tapped / uncovered — never tower-defence “breach.”
 */
export const METHANE_STRIKE_LINES = [
  "You've struck liquid methane!",
  "Methane reservoir tapped!",
  "Hydrocarbon lake discovered!",
  "You've hit a methane sea!",
  "Rich methane pocket tapped!",
  "Surface hydrocarbon strike!",
  "You've uncovered a fuel lake!",
] as const;

export function gusherBodiesFor(prop: PropellantId): readonly string[] {
  return prop === "hydrogen" ? HYDROGEN_GUSHER_BODIES : METHANE_GUSHER_BODIES;
}

export function isGusherBody(prop: PropellantId, nodeId: string): boolean {
  return gusherBodiesFor(prop).includes(nodeId);
}

export function strikeLinesFor(prop: PropellantId): readonly string[] {
  return prop === "hydrogen" ? HYDROGEN_STRIKE_LINES : METHANE_STRIKE_LINES;
}

/**
 * Pick a strike headline (caller supplies rand01 in [0,1)).
 * Human seat: second person ("You've…").
 * AI seat: third person with rocket name — never "You've" (#17).
 */
export function pickStrikeHeadline(
  prop: PropellantId,
  rand01: number,
  playerName: string,
  isHuman: boolean,
): string {
  const lines = strikeLinesFor(prop);
  const i = Math.min(lines.length - 1, Math.floor(rand01 * lines.length));
  const line = lines[i] ?? lines[0];
  if (isHuman) return line;
  // "You've struck …" → "Turing struck …"
  if (/^You've\s+/i.test(line)) {
    return line.replace(/^You've\s+/i, `${playerName} `);
  }
  // "Hydrogen vein tapped!" → "Turing: Hydrogen vein tapped!"
  return `${playerName}: ${line}`;
}

/** Body lines for the resource-strike popup (person matches striker seat). */
export function strikeAnnouncementBody(
  playerName: string,
  bodyName: string,
  bonusLabel: string,
  isHuman: boolean,
): string {
  const where = `${playerName} on ${bodyName}.`;
  const cash = `${bonusLabel} on the charter ledger.`;
  const depot = isHuman
    ? "Your depot tapped a natural fuel reservoir — sell excess propellant to pilots who land here."
    : `${playerName}'s depot tapped a natural fuel reservoir — excess propellant can be sold to pilots who land here.`;
  return [where, cash, depot].join("\n");
}
