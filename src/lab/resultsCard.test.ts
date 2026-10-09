/**
 * Shared results card (#296).
 * Run: npx tsx src/lab/resultsCard.test.ts
 */
import { buildResultsCard, RESULTS_CLERK_IMAGE } from "./resultsCard";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

{
  const card = buildResultsCard({
    gameName: "Urinal-rule Parking",
    level: "2.0",
    stats: "400 points · 4 parked clean",
  });
  assert(card.gameName === "Urinal-rule Parking", "game name passes through");
  assert(
    card.headline === "Congratulations, you made it to level 2.0.",
    "headline matches the clerk sentence",
  );
  assert(card.stats === "400 points · 4 parked clean", "stats line passes through");
  assert(card.image === RESULTS_CLERK_IMAGE, "clerk portrait path");
  assert(
    card.image === "/handbook/cards/clerk-canonical.jpg",
    "portrait is the canonical clerk",
  );
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
