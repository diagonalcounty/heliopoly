/**
 * Urinal-rule Parking generated rows (#292).
 * Run: npx tsx src/lab/urpTower.test.ts
 */
import {
  URP_MAX_CLEARANCES,
  URP_START_CLEARANCES,
  assignUrpTower,
  formatUrpTowerStatus,
  gradeTower,
  layoutForScreen,
  padsForScreen,
  pointsForPads,
  roundForScreen,
  startUrpTower,
  type UrpTowerState,
} from "./urpTower";

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
  const c = gradeTower(4, []);
  assert(c?.index === 0, "empty row → pad 0, the hatch");
}
{
  const c = gradeTower(5, [2]);
  assert(c?.index === 0, "equal gaps tie to the hatch");
}
{
  const c = gradeTower(7, [1, 3, 5]);
  assert(c?.index === 0, "no gap left → lowest vacant pad");
}
{
  assert(gradeTower(4, [0, 1, 2, 3]) === null, "full row has no pad");
}

assert(padsForScreen(1) === 4 && roundForScreen(1) === 1, "opens at 4.1");
assert(padsForScreen(3) === 4 && roundForScreen(3) === 3, "third screen is still 4.3");
assert(padsForScreen(4) === 5 && roundForScreen(4) === 1, "fourth screen grows to 5.1");
assert(padsForScreen(13) === 8 && roundForScreen(13) === 1, "8.1 is the first eight-pad row");
assert(padsForScreen(16) === 8 && roundForScreen(16) === 4, "after 8.3 the round keeps climbing");
assert(pointsForPads(4) === 100, "4 pads pay 100");
assert(pointsForPads(8) === 500, "8 pads pay 500");

{
  const a = layoutForScreen(11, 2);
  const b = layoutForScreen(11, 2);
  const c = layoutForScreen(11, 5);
  assert(JSON.stringify(a) === JSON.stringify(b), "same seed and level, same row");
  assert(c.padCount === 5, "level 5.1 is a wider row");
  assert(JSON.stringify(a) !== JSON.stringify(c), "the next size is a new calculated row");
  assert(a.occupied.length >= 1, "a row starts with a ship already down");
  assert(a.occupied.length + a.asks < a.padCount, "a wrong pad stays open through the sequence");
  assert(a.asks >= 1, "every screen asks for at least one park");
}

function wrongPad(state: UrpTowerState): number {
  const answer = gradeTower(state.padCount, state.occupied)!.index;
  for (let i = 0; i < state.padCount; i++) {
    if (i !== answer && !state.occupied.includes(i)) return i;
  }
  throw new Error("no wrong pad");
}

function parkCorrect(state: UrpTowerState): UrpTowerState {
  const g = gradeTower(state.padCount, state.occupied);
  if (!g) throw new Error("no pad");
  return assignUrpTower(state, g.index).state;
}

{
  const start = startUrpTower(7);
  assert(start.clearances === URP_START_CLEARANCES, "three clearances");
  assert(start.padCount === 4 && start.round === 1, "level label 4.1");
  assert(start.step === 0, "first ship of the screen");
  assert(formatUrpTowerStatus(start) === "Where does this ship park?", "ask copy");

  const wrong = assignUrpTower(start, wrongPad(start));
  assert(wrong.accepted, "a wrong empty pad is an answer");
  assert(wrong.state.clearances === 2, "a bad call costs one clearance");
  assert(wrong.state.occupied.length === start.occupied.length, "a bad call does not land");
  assert(wrong.state.screen === 1, "a miss stays on this row");
  assert(formatUrpTowerStatus(wrong.state) === "Too close. One clearance.", "miss copy");

  const taken = assignUrpTower(start, start.occupied[0]!);
  assert(!taken.accepted, "an occupied pad is not an answer");
  assert(taken.state.clearances === 3, "a taken pad is free");
}

{
  let dying: UrpTowerState = { ...startUrpTower(4), clearances: 1 };
  dying = assignUrpTower(dying, wrongPad(dying)).state;
  assert(dying.phase === "over", "zero clearances ends the run");
  assert(dying.screen === 1, "the end stays on the row they missed");
}

{
  let s = startUrpTower(21);
  const asks = s.asks;
  for (let i = 0; i < asks; i++) s = parkCorrect(s);
  assert(s.screen === 2, "finishing the sequence opens the next calculated row");
  assert(s.step === 0, "the next row starts at the first ship");
  assert(s.score === 100 * asks, "each park on a 4-pad row pays 100");
  assert(formatUrpTowerStatus(s).startsWith("Next row. Level 4.2."), "next-row copy");
}

{
  let s = startUrpTower(3);
  let guard = 0;
  while (s.padCount === 4 && s.phase === "playing" && guard++ < 12) s = parkCorrect(s);
  assert(s.padCount === 5 && s.round === 1, "three screens of 4 pads, then 5.1");
  assert(s.clearances === URP_START_CLEARANCES + 1, "a larger row restores one clearance");
  assert(formatUrpTowerStatus(s).includes("One clearance back."), "restore copy");
}

{
  let s: UrpTowerState = { ...startUrpTower(9), clearances: URP_MAX_CLEARANCES, screen: 3, round: 3 };
  const layout = layoutForScreen(s.seed, 3);
  s = { ...s, ...layout, step: layout.asks - 1, occupied: layout.occupied };
  s = parkCorrect(s);
  assert(s.padCount === 5, "screen 3 finishes into 5.1");
  assert(s.clearances === URP_MAX_CLEARANCES, "restore stops at 5");
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
