import type { Player } from "./types";

/** Human seat is named "You" — third-person templates break ("You is…", "You Prevails"). */
export function isSecondPerson(p: Pick<Player, "name" | "agent">): boolean {
  return p.agent === "human" || p.name === "You";
}

/** "You" vs pilot name for narrative subjects. */
export function pilotName(p: Pick<Player, "name" | "agent">): string {
  return isSecondPerson(p) ? "You" : p.name;
}

/** "You prevail" / "AI 2 prevails" (title case words as needed by caller). */
export function prevailsHeadline(p: Pick<Player, "name" | "agent">): string {
  return isSecondPerson(p) ? "You Prevail" : `${p.name} Prevails`;
}

export function lastPilotFlying(p: Pick<Player, "name" | "agent">): string {
  return isSecondPerson(p)
    ? "You are the last pilot flying."
    : `${p.name} is the last pilot flying.`;
}

export function abandonedCharter(p: Pick<Player, "name" | "agent">): string {
  return isSecondPerson(p)
    ? "You abandoned the charter."
    : `${p.name} abandoned the charter.`;
}

/** Round-limit / NW lead line with correct person. */
export function leadsWithWorth(
  p: Pick<Player, "name" | "agent">,
  worthLabel: string,
): string {
  return isSecondPerson(p)
    ? `You lead with ${worthLabel}.`
    : `${p.name} leads with ${worthLabel}.`;
}
