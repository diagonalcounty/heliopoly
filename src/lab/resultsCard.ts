/**
 * Shared Arcade / Lab end-of-run card (#296).
 *
 * Inputs: game name, level string (for example "4.0"), and one stats line.
 * The card opens on the clerk portrait at `/handbook/cards/clerk-canonical.jpg`
 * (file: `public/handbook/cards/clerk-canonical.jpg`).
 *
 * Example:
 *   buildResultsCard({
 *     gameName: "Urinal-rule Parking",
 *     level: "2.0",
 *     stats: "400 points · 4 parked clean",
 *   })
 *   → headline "Congratulations, you made it to level 2.0."
 */
export const RESULTS_CLERK_IMAGE = "/handbook/cards/clerk-canonical.jpg";

export interface ResultsCardInput {
  gameName: string;
  /** Display level, such as "4.0" or "7.49". */
  level: string;
  /** One line under the congratulations sentence. */
  stats: string;
}

export interface ResultsCard {
  image: string;
  gameName: string;
  headline: string;
  stats: string;
}

export function buildResultsCard(input: ResultsCardInput): ResultsCard {
  return {
    image: RESULTS_CLERK_IMAGE,
    gameName: input.gameName,
    headline: `Congratulations, you made it to level ${input.level}.`,
    stats: input.stats,
  };
}
