/**
 * Which is larger? deal + ladder (#81) and same-lead bias (#104).
 * Run: npx tsx src/lab/easternArabicCompare.test.ts
 */
import {
  MAX_COMPARE_ROUNDS,
  SAME_LEAD_HINT,
  applyCompareChoice,
  largerSide,
  makeUnequalPair,
  sharesHundredsAndTens,
  sharesLeadingDigit,
  startCompareDrill,
  type CompareRound,
  type Rng,
} from "./easternArabicCompare";
import { COMPARE_HINT_REST, NUMBER_SCRIPT_PACKS, compareHint } from "./numberScripts";

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


{
  assert(
    SAME_LEAD_HINT === "The first digits match. Check the next place.",
    "same-lead miss copy",
  );
  const rest =
    "You win by finishing all three levels in a row with no hint on those tries. If the first digits match, check the next place. Hint shows one number in the digits you know, but that try does not count, and you must finish that level again with no hint. You get 12 tries. Reset starts over.";
  assert(COMPARE_HINT_REST === rest, "shared hint rest");
  const expect: Record<string, { kicker: string; title: string; lead: string; levels: string[] }> = {
    "eastern-arabic": {
      kicker: "Lab · Eastern Arabic (number shapes)",
      title: "Which is larger? · Eastern Arabic shapes",
      lead: "Two numbers show up in Eastern Arabic digits, other shapes for 0 to 9. Tap the larger one, or point to that side with the arrow keys.",
      levels: [
        "Level 1 · one digit (one place)",
        "Level 2 · two digits (two places)",
        "Level 3 · three digits (three places)",
      ],
    },
    chinese: {
      kicker: "Lab · Chinese (number marks)",
      title: "Which is larger? · Chinese marks",
      lead: "Two numbers show up as Chinese number marks (〇一二三四五六七八九), one mark per place. Tap the larger one.",
      levels: [
        "Level 1 · one digit (one place)",
        "Level 2 · two digits (two places)",
        "Level 3 · three digits (three places)",
      ],
    },
    korean: {
      kicker: "Lab · Korean (number words)",
      title: "Which is larger? · Korean words",
      lead: "Two numbers show up as Korean number words (영 일 이 삼 사 오 육 칠 팔 구), one word per place. Tap the larger one.",
      levels: [
        "Level 1 · one digit (one place)",
        "Level 2 · two digits (two places)",
        "Level 3 · three digits (three places)",
      ],
    },
    hebrew: {
      kicker: "Lab · Hebrew (number letters)",
      title: "Which is larger? · Hebrew letters",
      lead: "Two numbers show up as Hebrew number letters (א=1 … ט=9; ○ is 0), one mark per place. Tap the larger one.",
      levels: [
        "Level 1 · one digit (one place)",
        "Level 2 · two digits (two places)",
        "Level 3 · three digits (three places)",
      ],
    },
    binary: {
      kicker: "Lab · Binary (only 0 and 1)",
      title: "Which is larger? · Binary (0 and 1)",
      lead: "Two numbers show up in binary, a row of only 0 and 1. Read each row as a normal number and tap the larger one.",
      levels: ["Level 1 · values 0–9", "Level 2 · values 10–99", "Level 3 · values 100–999"],
    },
  };
  for (const [id, want] of Object.entries(expect)) {
    const pack = NUMBER_SCRIPT_PACKS[id as keyof typeof NUMBER_SCRIPT_PACKS];
    assert(pack.kicker === want.kicker, `${id} kicker`);
    assert(pack.overlayTitle === want.title, `${id} title`);
    assert(pack.hintLead === want.lead, `${id} hint lead`);
    assert(compareHint(pack) === `${want.lead} ${rest}`, `${id} full hint is plain text`);
    assert(!compareHint(pack).includes("<"), `${id} hint has no markup`);
    assert(pack.levelLabel(1) === want.levels[0], `${id} level 1`);
    assert(pack.levelLabel(2) === want.levels[1], `${id} level 2`);
    assert(pack.levelLabel(3) === want.levels[2], `${id} level 3`);
  }
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\neasternArabicCompare tests passed");
