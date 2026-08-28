/**
 * urinal-rule-parking grader (#188).
 * Run: npx tsx src/lab/urpGrader.test.ts
 */
import { applyUrpChoice, gradePads, startUrpDrill } from "./urpGrader";

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

{
  const afterEnds = gradePads(5, [4, 0]);
  assert(afterEnds.kind === "pad" && afterEnds.index === 2, "5-pad fill: after ends, middle");
  assert(gradePads(5, [4, 0, 2]).kind === "go-around", "5-pad fill jam");
  assert(gradePads(7, [6, 0, 3]).kind === "go-around", "7-pad fill jam");
}

{
  let s = startUrpDrill();
  assert(s.act === 1 && s.padCount === 5 && s.occupied.length === 0, "start empty 5-pad apron");
  const wrong = applyUrpChoice(s, { kind: "go-around" });
  assert(!wrong.ok && wrong.state.act === 1 && wrong.state.occupied.length === 0, "wrong Go around does not start the 7");
  const land = applyUrpChoice(s, { kind: "pad", index: 4 });
  assert(land.ok && land.state.occupied.length === 1 && land.state.occupied[0] === 4, "landing stays on the apron");
  assert(land.state.act === 1 && land.state.padCount === 5, "same apron after a land");
}

{
  let s = startUrpDrill();
  const five: Parameters<typeof applyUrpChoice>[1][] = [
    { kind: "pad", index: 4 },
    { kind: "pad", index: 0 },
    { kind: "pad", index: 2 },
    { kind: "go-around" },
  ];
  for (const choice of five) {
    const next = applyUrpChoice(s, choice);
    assert(next.ok, `5-pad step ${choice.kind} ${"index" in choice ? choice.index : ""}`);
    s = next.state;
  }
  assert(s.act === 2 && s.padCount === 7 && s.occupied.length === 0, "Go around opens the 7-pad apron");

  const seven: Parameters<typeof applyUrpChoice>[1][] = [
    { kind: "pad", index: 6 },
    { kind: "pad", index: 0 },
    { kind: "pad", index: 3 },
    { kind: "go-around" },
  ];
  for (const choice of seven) {
    const next = applyUrpChoice(s, choice);
    assert(next.ok, `7-pad step ${choice.kind} ${"index" in choice ? choice.index : ""}`);
    s = next.state;
  }
  assert(s.phase === "done" && s.padCount === 7, "second Go around ends the drill");
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll urp grader checks passed.");
