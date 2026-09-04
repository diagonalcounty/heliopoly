/**
 * Deseret alphabet flash-match (#79).
 * Run: npx tsx src/lab/deseretMatch.test.ts
 */
import {
  CHOICE_COUNT,
  DESERET_INVENTORY,
  PREVIEW_TICKS,
  ROUND_LENGTH,
  WIN_CORRECT,
  advanceDeseret,
  applyDeseretChoice,
  dealPrompt,
  glyphChar,
  isCorrectChoice,
  latinLabels,
  playAgainDeseret,
  startDeseretMatch,
  tickPreview,
  type DeseretState,
  type Rng,
} from "./deseretMatch";

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

/** Advance the 3-2-1 chart without a real timer. */
function skipPreview(s: DeseretState): DeseretState {
  let next = s;
  for (let i = 0; i < PREVIEW_TICKS; i++) next = tickPreview(next);
  return next;
}

{
  assert(DESERET_INVENTORY.length === 12, "inventory is 12 glyphs");
  const expected: Array<[number, string]> = [
    [0x10408, "A"],
    [0x10406, "I"],
    [0x10407, "E"],
    [0x10401, "AY"],
    [0x10404, "O"],
    [0x10413, "T"],
    [0x10414, "D"],
    [0x10417, "K"],
    [0x1041d, "S"],
    [0x10422, "L"],
    [0x10423, "M"],
    [0x10424, "N"],
  ];
  for (let i = 0; i < expected.length; i++) {
    const g = DESERET_INVENTORY[i]!;
    const [cp, latin] = expected[i]!;
    assert(g.codepoint === cp, `${g.id} codepoint U+${cp.toString(16).toUpperCase()}`);
    assert(g.latin === latin, `${g.id} latin is ${latin}`);
    assert(g.codepoint >= 0x10400 && g.codepoint <= 0x10427, `${g.id} is a Deseret capital`);
  }
  const labels = latinLabels();
  assert(new Set(labels).size === 12, "latin labels are unique");
  assert(glyphChar(DESERET_INVENTORY[0]!) === String.fromCodePoint(0x10408), "glyphChar uses the codepoint");
}

{
  const rng = mulberry32(79);
  for (let i = 0; i < 40; i++) {
    const p = dealPrompt(rng);
    assert(p.choices.length === CHOICE_COUNT, `deal ${i}: 2 choices`);
    assert(p.choices.includes(p.glyph.latin), `deal ${i}: correct latin is among choices`);
    assert(new Set(p.choices).size === CHOICE_COUNT, `deal ${i}: choices are unique`);
    const inventory = new Set(latinLabels());
    assert(
      p.choices.every((c) => inventory.has(c)),
      `deal ${i}: distractors come from inventory`,
    );
    const others = p.choices.filter((c) => c !== p.glyph.latin);
    assert(others.length === CHOICE_COUNT - 1, `deal ${i}: one distractor`);
  }
}

{
  const rng = mulberry32(104);
  const a = dealPrompt(rng, []);
  const b = dealPrompt(mulberry32(104), []);
  assert(a.glyph.id === b.glyph.id, "same rng seed deals the same target");
  assert(a.choices.join(",") === b.choices.join(","), "same rng seed deals the same choices");
}

{
  const rng = mulberry32(1);
  const s0 = startDeseretMatch(rng);
  assert(s0.phase === "preview", "startDrill begins in preview");
  assert(s0.previewCountdown === 3, "preview countdown starts at 3");
  assert(s0.asked === 0 && s0.correct === 0, "start counters are zero");
  assert(s0.prompt.choices.length === CHOICE_COUNT, "preview already holds the first deal");
  const ignored = applyDeseretChoice(s0, s0.prompt.glyph.latin, rng);
  assert(ignored.phase === "preview" && ignored.asked === 0, "preview ignores latin picks");
  const s1 = tickPreview(s0);
  assert(s1.phase === "preview" && s1.previewCountdown === 2, "tick 1 shows 2");
  const s2 = tickPreview(s1);
  assert(s2.phase === "preview" && s2.previewCountdown === 1, "tick 2 shows 1");
  const s3 = tickPreview(s2);
  assert(s3.phase === "playing" && s3.previewCountdown === 0, "tick 3 starts the quiz");
  assert(s3.prompt.choices.length === CHOICE_COUNT, "playing has 2 options");
  assert(s3.prompt.glyph.id === s0.prompt.glyph.id, "first quiz glyph is the deal from start");
  assert(isCorrectChoice(s3, s3.prompt.glyph.latin), "grade: correct latin matches glyph");
  assert(!isCorrectChoice(s3, "ZZ"), "grade: unknown latin is wrong");
  assert(tickPreview(s3).phase === "playing", "tick while playing is a no-op");
}

{
  const rng = mulberry32(8);
  let s: DeseretState = skipPreview(startDeseretMatch(rng));
  for (let i = 0; i < ROUND_LENGTH; i++) {
    s = applyDeseretChoice(s, s.prompt.glyph.latin, rng);
  }
  assert(s.asked === ROUND_LENGTH, "win path asks 10");
  assert(s.correct === ROUND_LENGTH, "win path is 10/10");
  assert(s.phase === "won", "8/10 (here 10/10) is a win");
  assert(s.correct >= WIN_CORRECT, "win meets the 8-correct bar");
}

{
  const rng = mulberry32(7);
  let s: DeseretState = skipPreview(startDeseretMatch(rng));
  // 7 correct, then 3 misses → 7/10 lose
  for (let i = 0; i < 7; i++) {
    s = applyDeseretChoice(s, s.prompt.glyph.latin, rng);
  }
  for (let i = 0; i < 3; i++) {
    const wrong = s.prompt.choices.find((c) => c !== s.prompt.glyph.latin)!;
    s = applyDeseretChoice(s, wrong, rng);
    assert(s.phase === "reveal", `miss ${i}: shows the answer`);
    assert(s.revealedLatin === s.prompt.glyph.latin, `miss ${i}: revealed latin is the answer`);
    assert(
      s.prompt.choices.includes(s.revealedLatin!),
      `miss ${i}: answer is one of the two buttons`,
    );
    s = advanceDeseret(s, rng);
  }
  assert(s.asked === ROUND_LENGTH, "lose path asks 10");
  assert(s.correct === 7, "7/10 is below the bar");
  assert(s.phase === "lost", "7/10 is a loss");
}

{
  const rng = mulberry32(80);
  let s: DeseretState = skipPreview(startDeseretMatch(rng));
  for (let i = 0; i < 8; i++) {
    s = applyDeseretChoice(s, s.prompt.glyph.latin, rng);
  }
  for (let i = 0; i < 2; i++) {
    const wrong = s.prompt.choices.find((c) => c !== s.prompt.glyph.latin)!;
    s = applyDeseretChoice(s, wrong, rng);
    s = advanceDeseret(s, rng);
  }
  assert(s.correct === 8, "exactly 8 correct");
  assert(s.phase === "won", "8/10 is a win");
}

{
  const rng = mulberry32(12);
  const s0 = skipPreview(startDeseretMatch(rng));
  const frozen = applyDeseretChoice(
    { ...s0, phase: "won" },
    s0.prompt.glyph.latin,
    rng,
  );
  assert(frozen.asked === s0.asked, "won state ignores further picks");
}

{
  const rng = mulberry32(9);
  let s: DeseretState = skipPreview(startDeseretMatch(rng));
  for (let i = 0; i < ROUND_LENGTH; i++) {
    s = applyDeseretChoice(s, s.prompt.glyph.latin, rng);
  }
  assert(s.phase === "won", "setup: won before Play again");
  s = playAgainDeseret(rng);
  assert(s.phase === "preview", "Play again returns to preview");
  assert(s.previewCountdown === 3, "Play again countdown is 3");
  assert(s.asked === 0 && s.correct === 0, "Play again resets counters");
  s = skipPreview(s);
  assert(s.phase === "playing", "after preview ticks, Play again is playing");
  assert(s.prompt.choices.length === CHOICE_COUNT, "Play again deal has 2 options");
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\ndeseretMatch tests passed");
