/**
 * Shared charter clock: one tick per pilot *seat turn* (including skips).
 * Timed content runs at seat-turn start, before that pilot’s first movement dice roll.
 * See decision log: Game clock — turn count.
 */
import type { GameState } from "./types";

/**
 * Hook for discovery, market events, etc.
 * Called immediately after `gameTurn` increments, before Roll (or skip resolution).
 */
export function processTimedEvents(state: GameState): void {
  // One-time teaser until real timed content ships
  if (state.futureTeaserShown) return;
  if (state.gameTurn < 4) return;
  if (state.pendingAnnouncement) return;
  state.futureTeaserShown = true;
  state.pendingAnnouncement = {
    kind: "info",
    title: "Something exciting will happen here in a future version",
    body: "To help shape what that is, keep an eye on when the game's GitHub repo becomes public.",
  };
  state.log.push(
    "Timed event teaser: future content — watch for a public GitHub repo.",
  );
}

/** +1 seat turn and run timed events (before dice). */
export function tickSeatTurn(state: GameState): void {
  state.gameTurn += 1;
  processTimedEvents(state);
}
