import { rocketTitle } from "./pilotNames";
import type { Player } from "./types";

/**
 * Second-person templates only when the display name is literally "You".
 * Named humans ("Jacob", "Ada") use third person like AI seats.
 */
export function isSecondPerson(p: Pick<Player, "name" | "agent">): boolean {
  return p.name === "You";
}

/** Display name for narrative (AI ships titled; no rewrite unless still "You"). */
export function pilotName(p: Pick<Player, "name" | "agent">): string {
  return rocketTitle(p);
}

/** "You Prevail" / "The Ada Prevails". */
export function prevailsHeadline(p: Pick<Player, "name" | "agent">): string {
  return isSecondPerson(p) ? "You Prevail" : `${rocketTitle(p)} Prevails`;
}

/** "You win!" / "The Ada wins!" — duel splash & similar. Pass a display title. */
export function winsHeadline(name: string): string {
  return name === "You" ? "You win!" : `${name} wins!`;
}

function displayOrYou(p: Pick<Player, "name" | "agent">): string {
  return isSecondPerson(p) ? "You" : rocketTitle(p);
}

/** Full duel resolution line (grammar-safe for "You"; AI ships titled). */
export function duelWinSummary(
  winner: Pick<Player, "name" | "agent">,
  loser: Pick<Player, "name" | "agent">,
): string {
  const winnerName = displayOrYou(winner);
  const loserName = displayOrYou(loser);
  const winBit =
    winnerName === "You" ? "You win!" : `${winnerName} wins!`;
  const loseBit =
    loserName === "You"
      ? "You lose a turn and are knocked back one space"
      : `${loserName} loses a turn and is knocked back one space`;
  const passOwner = winnerName === "You" ? "You get" : `${winnerName} gets`;
  const claimOf =
    loserName === "You" ? "your claims" : `${loserName}'s claims`;
  return `${winBit} ${loseBit} · ${passOwner} a rent free-pass on ${claimOf}.`;
}

export function lastPilotFlying(p: Pick<Player, "name" | "agent">): string {
  return isSecondPerson(p)
    ? "You are the last rocket flying."
    : `${rocketTitle(p)} is the last rocket flying.`;
}

export function abandonedCharter(p: Pick<Player, "name" | "agent">): string {
  return isSecondPerson(p)
    ? "You left the expedition."
    : `${rocketTitle(p)} left the expedition.`;
}

/** Round-limit / NW lead line with correct person. */
export function leadsWithWorth(
  p: Pick<Player, "name" | "agent">,
  worthLabel: string,
): string {
  return isSecondPerson(p)
    ? `You lead with ${worthLabel}.`
    : `${rocketTitle(p)} leads with ${worthLabel}.`;
}

/*
 * Gravity Duel result footer — deadpan Oregon Trail–style one-liners.
 * Second-person pools are for duels the human is in; neutral pool covers
 * AI-vs-AI ceremonies (lab scenario).
 */
const DUEL_PUNCH_WIN = [
  "You win and Han shot first.",
  "Clean roll — the lane is yours.",
  "Your dice behaved for once.",
  "Gravity picked your side this round.",
  "Claim held. Rent waived. Take a lap.",
  "The high-stakes dice never lie. This time they love you.",
] as const;

const DUEL_PUNCH_LOSE = [
  "You're benched. The lane belongs to a rival.",
  "While you're sitting here you can speed-run King's Quest 2.",
  "The dice giveth, and the dice taketh.",
  "Somewhere, a fuel depot just got cheaper for the winner.",
  "Your claim slips to the other pilot. Stewardship, suspended.",
  "Gravity has no favorites. Today it has a least favorite.",
] as const;

const DUEL_PUNCH_DRAW = [
  "Dead heat. Nobody gets the corner office.",
  "Both hold the lane. Cramped, but intact.",
  "Gravity calls it even.",
  "A draw — no claims change hands.",
  "Two low rollers, zero outcomes. Move along.",
] as const;

/** AI-vs-AI ceremonies observed in the lab (no "You" in the room). */
const DUEL_PUNCH_NEUTRAL = [
  "The dice have spoken.",
  "A lane decided by two quick rolls.",
  "Gravity settles it in seconds.",
  "High stakes, low math.",
] as const;

function pickFrom<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Punchy footer line for a resolved duel.
 * `humanName` null (self-play / AI-vs-AI lab) → neutral pool.
 */
export function duelPunchLine(
  outcome: "win" | "tie",
  humanWon: boolean,
  humanInDuel: boolean,
): string {
  if (!humanInDuel) return pickFrom(DUEL_PUNCH_NEUTRAL);
  if (outcome === "tie") return pickFrom(DUEL_PUNCH_DRAW);
  return pickFrom(humanWon ? DUEL_PUNCH_WIN : DUEL_PUNCH_LOSE);
}
