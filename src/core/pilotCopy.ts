import type { Player } from "./types";

/**
 * Second-person templates only when the display name is literally "You".
 * Named humans ("Jacob", "Ada") use third person like AI seats.
 */
export function isSecondPerson(p: Pick<Player, "name" | "agent">): boolean {
  return p.name === "You";
}

/** Display name for narrative (no rewrite unless still "You"). */
export function pilotName(p: Pick<Player, "name" | "agent">): string {
  return p.name;
}

/** "You Prevail" / "Hopper Prevails". */
export function prevailsHeadline(p: Pick<Player, "name" | "agent">): string {
  return isSecondPerson(p) ? "You Prevail" : `${p.name} Prevails`;
}

/** "You win!" / "Hopper wins!" — duel splash & similar. */
export function winsHeadline(name: string): string {
  return name === "You" ? "You win!" : `${name} wins!`;
}

/** Full duel resolution line (grammar-safe for "You"). */
export function duelWinSummary(winnerName: string, loserName: string): string {
  const winBit =
    winnerName === "You" ? "You win!" : `${winnerName} wins!`;
  const loseBit =
    loserName === "You"
      ? "You lose a turn"
      : `${loserName} loses a turn`;
  const passOwner = winnerName === "You" ? "You get" : `${winnerName} gets`;
  const claimOf =
    loserName === "You" ? "your claims" : `${loserName}'s claims`;
  return `${winBit} ${loseBit} · ${passOwner} a rent free-pass on ${claimOf}.`;
}

export function lastPilotFlying(p: Pick<Player, "name" | "agent">): string {
  return isSecondPerson(p)
    ? "You are the last rocket flying."
    : `${p.name} is the last rocket flying.`;
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
