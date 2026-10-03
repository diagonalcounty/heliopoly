/**
 * Gravity Duel early-reader copy (#305). Shared by Journey and Lab practice.
 * Run: npx tsx src/core/duelCopy.test.ts
 */
import {
  DUEL_HINT,
  DUEL_PICKS_HIDDEN,
  DUEL_PICKS_LOCKED,
  DUEL_ROLL_LABEL,
  DUEL_SHELF_BLURB,
  DUEL_TIE_HEADLINE,
  DUEL_TITLE,
  winsHeadline,
} from "./pilotCopy";
import { LAB_SCENARIOS } from "../lab/scenarios";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

assert(DUEL_TITLE === "Gravity Duel (lane fight)", "title");
assert(
  DUEL_HINT ===
    "Your pick stays secret until both of you have rolled two dice. You are on the right.",
  "hint",
);
assert(DUEL_ROLL_LABEL === "Roll dice", "roll button");
assert(DUEL_PICKS_HIDDEN === "Picks stay hidden until both have rolled.", "hidden status");
assert(DUEL_PICKS_LOCKED === "Both picks are in. Roll when ready.", "locked status");
assert(DUEL_TIE_HEADLINE === "Tie. You both keep the lane.", "tie headline");
assert(winsHeadline("You") === "You win!", "you wins stays");
assert(winsHeadline("The Ada") === "The Ada wins!", "named wins stays");
assert(
  DUEL_SHELF_BLURB ===
    "You land on a lane the computer’s rocket already holds. Each of you secretly picks High or Low, then you both roll two dice. You do not see the other pick until both have rolled. The result says who keeps the lane. This throws away the big game and starts a new one.",
  "shelf blurb",
);
const card = LAB_SCENARIOS.find((sc) => sc.id === "duel-you-challenger");
assert(card?.title === DUEL_TITLE, "lab shelf title");
assert(card?.blurb === DUEL_SHELF_BLURB, "lab shelf blurb");

if (failed) throw new Error(`${failed} assertion(s) failed`);
console.log("\nduel copy tests passed");
