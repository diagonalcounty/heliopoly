/**
 * Urinal-rule Parking Tower — escalating stages (#292).
 * Run: npx tsx src/lab/urpTower.test.ts
 */
import {
  URP_MAX_CLEARANCES,
  URP_START_CLEARANCES,
  URP_STAGE_COUNT,
  URP_STAGES,
  acknowledgeDeparture,
  acknowledgePromotion,
  assignUrpTower,
  barQuota,
  firstScreenFor,
  formatUrpTowerMeter,
  formatUrpTowerStatus,
  gradeTower,
  handleTimeout,
  pointsForStage,
  stageConfig,
  startUrpTower,
  urpRuleText,
  urpStageHint,
  urpTowerLevelLabel,
  urpTowerStatsLine,
  type UrpAssignResult,
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

// ── gradeTower with gap=1 ────────────────────────────────────────────

{
  const c = gradeTower(4, [], 1);
  assert(c?.index === 0, "empty row gap=1 → pad 0 (hatch)");
}
{
  const c = gradeTower(5, [2], 1);
  assert(c?.index === 0, "gap=1: equal gaps tie to the hatch");
}
{
  const c = gradeTower(7, [1, 3, 5], 1);
  assert(c !== null && c.tight, "gap=1: no buffered pad → tight park");
  assert(c?.index === 0, "gap=1: tight → lowest vacant pad");
}
{
  assert(gradeTower(4, [0, 1, 2, 3], 1) === null, "full row has no pad");
}

// ── gradeTower with gap=2 ────────────────────────────────────────────

{
  const c = gradeTower(7, [0], 2);
  assert(c !== null && !c.tight, "gap=2: buffered pads available");
  assert(c!.index === 3 || c!.index === 4 || c!.index === 5 || c!.index === 6,
    "gap=2: answer is at least 3 away from occupied 0");
}
{
  const c = gradeTower(5, [0, 4], 2);
  assert(c !== null && c.tight, "gap=2: 5 pads with ends occupied → tight");
}
{
  const c = gradeTower(8, [0, 7], 2);
  assert(c !== null && !c.tight, "gap=2: 8 pads with ends → buffered pads exist");
  assert(c!.index >= 3 && c!.index <= 4, "gap=2: answer maximizes min-distance");
}

// ── gradeTower with gap=3 ────────────────────────────────────────────

{
  const c = gradeTower(9, [0], 3);
  assert(c !== null && !c.tight, "gap=3: buffered pads available on 9 pads");
  assert(c!.index >= 4, "gap=3: answer is at least 4 away from occupied 0");
}
{
  const c = gradeTower(6, [0, 5], 3);
  assert(c !== null && c.tight, "gap=3: 6 pads with ends → all within gap");
}

// ── startUrpTower ────────────────────────────────────────────────────

{
  const start = startUrpTower(7);
  assert(start.clearances === URP_START_CLEARANCES, "three clearances at start");
  assert(start.stageIndex === 0, "starts at stage 0");
  assert(start.padCount === 4, "first screen has 4 pads");
  assert(start.step === 0, "first ship of the screen");
  assert(start.phase === "playing", "phase is playing");
  assert(start.isFirstScreen, "first screen flag set");
  assert(start.note === "ask", "note is ask");
  assert(start.score === 0, "score starts at 0");
  assert(start.parks === 0, "parks starts at 0");
  assert(start.barFill === 0, "barFill starts at 0");
  assert(start.barsCompleted === 0, "barsCompleted starts at 0");
  assert(formatUrpTowerStatus(start) === "Where does this rocket park?", "ask copy");
}

// ── Correct park ─────────────────────────────────────────────────────

function correctPad(state: UrpTowerState): number {
  const stage = stageConfig(state);
  const g = gradeTower(state.padCount, state.occupied, stage.gap);
  if (!g) throw new Error("no legal pad");
  return g.index;
}

function wrongPad(state: UrpTowerState): number {
  const answer = correctPad(state);
  for (let i = 0; i < state.padCount; i++) {
    if (i !== answer && !state.occupied.includes(i)) return i;
  }
  throw new Error("no wrong pad");
}

function parkCorrect(state: UrpTowerState): UrpAssignResult {
  return assignUrpTower(state, correctPad(state));
}

{
  const start = startUrpTower(7);
  const res = parkCorrect(start);
  assert(res.accepted, "correct park is accepted");
  assert(res.sfx === "ok" || res.sfx === "bar", "correct park sfx is ok or bar");
  assert(res.state.score === pointsForStage(0), "correct park adds points");
  assert(res.state.parks === 1, "correct park increments parks");
  assert(res.state.barFill >= 0, "barFill is non-negative after correct park");
}

// ── Wrong park ───────────────────────────────────────────────────────

{
  const start = startUrpTower(7);
  const wp = wrongPad(start);
  const res = assignUrpTower(start, wp);
  assert(res.accepted, "wrong pad is accepted (it's still an answer)");
  assert(res.state.clearances === URP_START_CLEARANCES - 1, "wrong park costs 1 clearance");
  assert(res.state.note === "wrong", "wrong park sets note to wrong");
  assert(res.state.correctIndex !== null, "wrong park reveals correct index");
  assert(res.sfx === "bad", "wrong park sfx is bad");
  assert(res.state.occupied.length === start.occupied.length, "wrong park does not land");
}

// ── Occupied pad ─────────────────────────────────────────────────────

{
  const start = startUrpTower(7);
  const res = assignUrpTower(start, start.occupied[0]!);
  assert(!res.accepted, "occupied pad is not accepted");
  assert(res.state.clearances === URP_START_CLEARANCES, "occupied pad is free");
  assert(res.state.note === "taken", "occupied pad note is taken");
}

// ── Game over ────────────────────────────────────────────────────────

{
  let dying: UrpTowerState = { ...startUrpTower(4), clearances: 1 };
  const res = assignUrpTower(dying, wrongPad(dying));
  assert(res.state.phase === "over", "zero clearances ends the run");
  assert(res.state.note === "over", "game over note");
  assert(res.sfx === "over", "game over sfx");
}

// ── Bar completion and stage promotion ───────────────────────────────

{
  let s = startUrpTower(21);
  s = { ...s, clearances: URP_MAX_CLEARANCES };
  let totalParks = 0;
  let promoted = false;
  for (let guard = 0; guard < 200 && s.phase === "playing"; guard++) {
    const res = parkCorrect(s);
    s = res.state;
    totalParks++;
    if (s.phase === "promoting") {
      promoted = true;
      break;
    }
  }
  assert(promoted, "enough correct parks trigger a promotion");
  assert(s.stageIndex === 0, "still at stage 0 before acknowledge");

  const after = acknowledgePromotion(s);
  assert(after.stageIndex === 1, "acknowledgePromotion advances to stage 1");
  assert(after.phase === "playing", "promotion returns to playing");
  assert(after.barsCompleted === 0, "bars reset on promotion");
  assert(after.barFill === 0, "barFill reset on promotion");
  assert(after.isFirstScreen, "first screen flag set after promotion");
  assert(after.clearances <= URP_MAX_CLEARANCES, "clearances capped at max");
}

// ── Timeout ──────────────────────────────────────────────────────────

{
  const start = startUrpTower(7);
  const after = handleTimeout(start);
  assert(after.clearances === URP_START_CLEARANCES - 1, "timeout costs 1 clearance");
  assert(after.note === "timeout", "timeout note");
}
{
  const dying: UrpTowerState = { ...startUrpTower(7), clearances: 1 };
  const after = handleTimeout(dying);
  assert(after.phase === "over", "timeout at 1 clearance ends game");
  assert(after.note === "over", "timeout game over note");
}

// ── Departures ───────────────────────────────────────────────────────

{
  // Stage 3 has dep=3 (departure every 3 correct parks)
  let s = startUrpTower(42);
  s = {
    ...s,
    stageIndex: 2,
    clearances: URP_MAX_CLEARANCES,
    isFirstScreen: false,
  };
  s = {
    ...s,
    padCount: 8,
    occupied: [0, 7],
    asks: 5,
    step: 0,
    depCounter: 0,
    pendingDeparture: null,
  };

  let depFound = false;
  for (let guard = 0; guard < 10 && s.phase === "playing"; guard++) {
    const res = parkCorrect(s);
    s = res.state;
    if (s.pendingDeparture !== null) {
      depFound = true;
      const before = s.occupied.length;
      s = acknowledgeDeparture(s);
      assert(
        s.occupied.length === before - 1,
        "acknowledgeDeparture removes one pad from occupied",
      );
      assert(s.pendingDeparture === null, "departure cleared after acknowledge");
      break;
    }
  }
  assert(depFound, "stage 3 triggers a departure after enough correct parks");
}

// ── firstScreenFor validity ──────────────────────────────────────────

for (let si = 0; si < URP_STAGE_COUNT; si++) {
  const layout = firstScreenFor(si);
  const stage = URP_STAGES[si]!;
  const g = gradeTower(layout.padCount, [...layout.occupied], stage.gap);
  assert(g !== null, `firstScreenFor(${si}) has a legal answer`);
}

// ── Format functions ─────────────────────────────────────────────────

{
  const s = startUrpTower(7);
  assert(formatUrpTowerMeter(s).includes("Stage 1"), "meter shows stage");
  assert(urpTowerLevelLabel(s) === "1", "level label is stage number");
  assert(urpTowerStatsLine(s).includes("0 points"), "stats line shows score");
  assert(urpRuleText(1) === "Leave 1 empty", "rule text gap=1");
  assert(urpRuleText(2) === "Leave 2 empty", "rule text gap=2");
  assert(urpRuleText(3) === "Leave 3 empty", "rule text gap=3");
  assert(urpStageHint(0).length > 0, "stage 0 has a hint");
  assert(urpStageHint(4).length > 0, "stage 4 has a hint");
}

// ── Constants sanity ─────────────────────────────────────────────────

assert(URP_STAGES.length === URP_STAGE_COUNT, "stage count matches");
assert(URP_STAGES[0]!.gap === 1, "stage 1 gap is 1");
assert(URP_STAGES[4]!.gap === 3, "stage 5 gap is 3");
assert(URP_STAGES[4]!.timed, "stage 5 is timed");
assert(!URP_STAGES[0]!.timed, "stage 1 is not timed");
assert(barQuota(URP_STAGES[0]!, 0) === 3, "base bar quota for stage 1 is 3");
assert(barQuota(URP_STAGES[0]!, 1) === 4, "bar quota grows with bars completed");
assert(pointsForStage(0) === 100, "stage 1 pays 100");
assert(pointsForStage(4) === 500, "stage 5 pays 500");

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
