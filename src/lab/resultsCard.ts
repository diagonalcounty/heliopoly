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
 *
 * Render: `mountResultsCard(hostEl, card, [againBtn, doneBtn])`.
 * Inputs are plain strings; markup is HTML-escaped. Empty `stats` hides
 * the stats line. First consumers: Bot Evolution end screen, URP Tower.
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

const ESC: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function esc(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESC[ch]!);
}

/**
 * Card markup (no DOM needed, so it is unit-testable). The caller sets it
 * as innerHTML and may move its own buttons into `.results-card-actions`.
 * Styles: `.results-card*` in `src/style.css`.
 */
export function resultsCardMarkup(card: ResultsCard): string {
  return (
    `<article class="results-card">` +
    `<div class="results-card-art" role="img" aria-label="The clerk" ` +
    `style="background-image: url('${esc(card.image)}')"></div>` +
    `<div class="results-card-copy">` +
    `<p class="results-card-kicker">${esc(card.gameName)}</p>` +
    `<h3 class="results-card-headline">${esc(card.headline)}</h3>` +
    `<p class="results-card-stats">${esc(card.stats)}</p>` +
    `<div class="results-card-actions"></div>` +
    `</div></article>`
  );
}

/** Mount a card into `host`, moving `actions` (buttons) into its action row. */
export function mountResultsCard(
  host: HTMLElement,
  card: ResultsCard,
  actions: Element[] = [],
): void {
  host.innerHTML = resultsCardMarkup(card);
  host.querySelector(".results-card-actions")?.append(...actions);
}

export function buildResultsCard(input: ResultsCardInput): ResultsCard {
  return {
    image: RESULTS_CLERK_IMAGE,
    gameName: input.gameName,
    headline: `Congratulations, you made it to level ${input.level}.`,
    stats: input.stats,
  };
}
