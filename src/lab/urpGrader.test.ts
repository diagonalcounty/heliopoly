/**
 * urinal-rule-parking grader (#188).
 * Run: npx tsx src/lab/urpGrader.test.ts
 */
import { applyUrpChoice, gradePads, startUrpDrill, URP_LADDER, URP_ROUNDS } from "./urpGrader";

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
  const c = gradePads(5, []);
  assert(c.kind === "pad" && c.index === 4, "empty 5 → highest index 4");
}

{
  const c = gradePads(7, []);
  assert(c.kind === "pad" && c.index === 6, "empty 7 → highest index 6");
}

{
  const c = gradePads(5, [4]);
  assert(c.kind === "pad" && c.index === 0, "buffer 5 occupied far → pad 0");
}

{
  const c = gradePads(5, [0]);
  assert(c.kind === "pad" && c.index === 4, "buffer 5 occupied near hatch → pad 4");
}

{
  const c = gradePads(5, [2]);
  assert(c.kind === "pad" && c.index === 4, "buffer 5 middle, tie ends → highest index 4");
}

{
  const c = gradePads(7, [0, 6]);
  assert(c.kind === "pad" && c.index === 3, "buffer 7 both ends → middle 3");
}

{
  const c = gradePads(7, [3]);
  assert(c.kind === "pad" && c.index === 6, "buffer 7 middle → furthest end 6");
}

{
  const c = gradePads(7, [1, 3, 5]);
  assert(c.kind === "go-around", "jam-7 every vacant adjacent → Go around");
}

{
  const c = gradePads(5, [1, 3]);
  assert(c.kind === "go-around", "jam-5 every vacant adjacent → Go around");
}

{
  const c = gradePads(5, [0, 1, 2, 3, 4]);
  assert(c.kind === "go-around", "full row → Go around");
}

{
  const c = gradePads(5, [1]);
  assert(c.kind === "pad" && c.index === 4, "occupied is illegal; buffered far pad wins");
}

assert(URP_LADDER.length === URP_ROUNDS, "ladder is 6 rounds");
assert(URP_LADDER[0]?.padCount === 5 && URP_LADDER[0].occupied.length === 0, "round 1 empty 5");
assert(URP_LADDER[5]?.padCount === 7, "round 6 is 7 pads");
assert(gradePads(7, URP_LADDER[5]!.occupied).kind === "go-around", "round 6 is jam-7");

{
  let s = startUrpDrill();
  assert(s.round === 1 && s.padCount === 5, "start on round 1 / 5 pads");
  const wrong = applyUrpChoice(s, { kind: "go-around" });
  assert(!wrong.ok && wrong.state.round === 1, "wrong Go around does not advance");
  const ok = applyUrpChoice(s, { kind: "pad", index: 4 });
  assert(ok.ok && ok.state.round === 2, "correct empty-row pad advances");
}

{
  let s = startUrpDrill();
  const steps: Parameters<typeof applyUrpChoice>[1][] = [
    { kind: "pad", index: 4 },
    { kind: "pad", index: 0 },
    { kind: "pad", index: 4 },
    { kind: "pad", index: 3 },
    { kind: "pad", index: 6 },
    { kind: "go-around" },
  ];
  for (const choice of steps) {
    const next = applyUrpChoice(s, choice);
    assert(next.ok, `ladder step round ${s.round} accepted`);
    s = next.state;
  }
  assert(s.phase === "done" && s.round === 6, "sixth correct ends the ladder");
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll urp grader checks passed.");
