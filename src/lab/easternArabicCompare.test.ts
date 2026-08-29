/**
 * Which is larger? deal + ladder (#81) and same-lead bias (#104).
 * Run: npx tsx src/lab/easternArabicCompare.test.ts
 */
import {
  MAX_COMPARE_ROUNDS,
  applyCompareChoice,
  largerSide,
  makeUnequalPair,
  sharesHundredsAndTens,
  sharesLeadingDigit,
  startCompareDrill,
  type CompareRound,
  type Rng,
} from "./easternArabicCompare";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function inRange(n: number, round: CompareRound): boolean {
  if (round === 1) return n >= 0 && n <= 9;
  if (round === 2) return n >= 10 && n <= 99;
  return n >= 100 && n <= 999;
}

{
  const rng = mulberry32(81);
  for (const round of [1, 2, 3] as CompareRound[]) {
    for (let i = 0; i < 80; i++) {
      const p = makeUnequalPair(round, rng);
      assert(p.left !== p.right, `r${round} deal ${i}: unequal`);
      assert(inRange(p.left, round) && inRange(p.right, round), `r${round} deal ${i}: in range`);
      if (round >= 2) {
        assert(String(p.left)[0] !== "0" && String(p.right)[0] !== "0", `r${round} deal ${i}: no leading zero`);
      }
    }
  }
}

{
  const rng = mulberry32(104);
  const n = 200;
  let sameR2 = 0;
  for (let i = 0; i < n; i++) {
    const p = makeUnequalPair(2, rng);
    if (sharesLeadingDigit(p.left, p.right, 2)) sameR2++;
  }
  assert(sameR2 >= 80, `R2 same tens digit on a real share (${sameR2}/${n})`);
  assert(sameR2 < n, `R2 is biased, not always same-lead (${sameR2}/${n})`);
}

{
  const rng = mulberry32(1043);
  const n = 200;
  let sameHundreds = 0;
  let sameHundredsTens = 0;
  for (let i = 0; i < n; i++) {
    const p = makeUnequalPair(3, rng);
    if (sharesLeadingDigit(p.left, p.right, 3)) sameHundreds++;
    if (sharesHundredsAndTens(p.left, p.right)) sameHundredsTens++;
  }
  assert(sameHundreds >= 80, `R3 same hundreds on a real share (${sameHundreds}/${n})`);
  assert(sameHundredsTens >= 20, `R3 sometimes hundreds+tens so only ones decide (${sameHundredsTens}/${n})`);
}

{
  const rng = mulberry32(1);
  const n = 80;
  let sameLead = 0;
  for (let i = 0; i < n; i++) {
    const p = makeUnequalPair(1, rng);
    if (sharesLeadingDigit(p.left, p.right, 1)) sameLead++;
    assert(p.left >= 0 && p.left <= 9 && p.right >= 0 && p.right <= 9, `R1 deal ${i} is one digit`);
  }
  assert(sameLead === 0, "R1 one-digit: sharesLeadingDigit is always false");
}

{
  const a = makeUnequalPair(2, mulberry32(55));
  const b = makeUnequalPair(2, mulberry32(55));
  assert(a.left === b.left && a.right === b.right, "deterministic rng repeats the deal");
}

{
  // Win ladder still clean 1→2→3 (do not change #81).
  const rng = mulberry32(12);
  let s = startCompareDrill(rng);
  assert(s.round === 1, "start on R1");
  s = applyCompareChoice(s, largerSide(s.left, s.right), rng);
  assert(s.round === 2 && s.phase === "playing", "clean R1 advances to R2");
  s = applyCompareChoice(s, largerSide(s.left, s.right), rng);
  assert(s.round === 3 && s.phase === "playing", "clean R2 advances to R3");
  s = applyCompareChoice(s, largerSide(s.left, s.right), rng);
  assert(s.phase === "won", "clean R3 wins");
  assert(s.cleanClears.length === 3, "win recap keeps three pairs");
}

{
  const rng = mulberry32(99);
  let s = startCompareDrill(rng);
  s = applyCompareChoice(s, largerSide(s.left, s.right), rng); // R2
  const missSide = largerSide(s.left, s.right) === "left" ? "right" : "left";
  const wasSame = sharesLeadingDigit(s.left, s.right, s.round);
  s = applyCompareChoice(s, missSide, rng);
  assert(s.round === 1, "R2/R3 miss still drops to R1");
  assert(s.lastMissSameLead === wasSame, "lastMissSameLead tracks the failed pair");
  assert(s.cleanClears.length === 0, "miss wipes the clean recap");
}

{
  assert(MAX_COMPARE_ROUNDS === 12, "attempt cap unchanged");
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\neasternArabicCompare tests passed");
