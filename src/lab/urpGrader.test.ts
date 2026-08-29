/**
 * urinal-rule-parking grader (#188).
 * Run: npx tsx src/lab/urpGrader.test.ts
 */
import {
  buildUrpPool,
  canOrbit,
  gradePads,
  hasLegalPad,
  hintUrp,
  landUrp,
  orbitUrp,
  startUrpDrill,
  startUrpFromPool,
  urpLooksChrome,
  type UrpScreen,
} from "./urpGrader";

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
  assert(c.kind === "none", "jam-7 every vacant adjacent → no legal pad");
}

{
  const c = gradePads(5, [1, 3]);
  assert(c.kind === "none", "jam-5 every vacant adjacent → no legal pad");
}

{
  const c = gradePads(5, [0, 1, 2, 3, 4]);
  assert(c.kind === "none", "full row → no legal pad");
}

{
  const c = gradePads(5, [1]);
  assert(c.kind === "pad" && c.index === 4, "occupied is illegal; buffered far pad wins");
}

{
  const legal: UrpScreen = { padCount: 5, occupied: [0] };
  const jam: UrpScreen = { padCount: 5, occupied: [1, 3] };
  const jam7: UrpScreen = { padCount: 7, occupied: [1, 3, 5] };
  const pool: UrpScreen[] = [legal, jam, jam7, jam, jam7, jam];
  assert(pool.length === 6, "fixture pool is six screens");
  assert(pool.some(hasLegalPad), "pool ≥1 legal screen");
  assert(pool.filter((s) => !hasLegalPad(s)).length === 5, "other screens may be violation-only");

  {
    const s = startUrpFromPool(pool);
    assert(urpLooksChrome(s) === "3/3", "start remaining looks 3/3");
    assert(s.hintsLeft === 2, "start two hint charges");
    const good = landUrp(s, 4);
    assert(good.ok && good.state.outcome === "good" && good.state.phase === "landed", "legal empty → Good job. No fine.");
    assert(good.state.lastLanded === 4, "player rocket lands on legal pad");
    const occupiedTap = landUrp(s, 0);
    assert(!occupiedTap.ok && occupiedTap.state.phase === "playing", "occupied is not a land");
  }

  {
    const s = startUrpFromPool(pool);
    const rude = landUrp(s, 2);
    assert(rude.ok && rude.state.outcome === "fine", "adjacent/rude empty → Fine");
    assert(rude.state.lastLanded === 2, "rude land still places the ship");
  }

  {
    let s = startUrpFromPool(pool);
    const first = s.screenIndex;
    const occupied0 = [...s.screens[first]!.occupied];
    s = orbitUrp(s);
    assert(s.look === 2 && s.screenIndex !== first, "orbit loads a different snapshot");
    assert(JSON.stringify(s.screens[s.screenIndex]!.occupied) !== JSON.stringify(occupied0) || s.screens[s.screenIndex]!.padCount !== 5, "orbit occupancy/map changes");
    assert(urpLooksChrome(s) === "2/3", "after one orbit 2/3");
    assert(s.screens[s.screenIndex] === jam, "fixture orbit 1 → jam 5");
  }

  {
    let s = startUrpFromPool(pool);
    s = orbitUrp(s);
    s = orbitUrp(s);
    assert(s.look === 3 && urpLooksChrome(s) === "1/3", "third look 1/3");
    assert(!canOrbit(s), "three-look cap: orbit dead");
    const stuck = orbitUrp(s);
    assert(stuck.look === 3 && stuck.screenIndex === s.screenIndex, "orbit no-op on third look");
    const land = landUrp(s, 0);
    assert(land.ok && land.state.phase === "landed", "third look must land");
    assert(urpLooksChrome(land.state) === "0/3", "after land remaining looks 0/3");
    assert(!canOrbit(land.state), "orbit stays dead after land");
  }

  {
    let s = startUrpFromPool(pool);
    assert(hasLegalPad(s.screens[s.screenIndex]!), "look 1 is the legal screen");
    s = orbitUrp(s);
    s = orbitUrp(s);
    assert(!hasLegalPad(s.screens[s.screenIndex]!), "skipping legal can leave only violation screens");
    const empty = [0, 1, 2, 3, 4].find((i) => !s.screens[s.screenIndex]!.occupied.includes(i))!;
    const land = landUrp(s, empty);
    assert(land.ok && land.state.outcome === "fine", "violation-only look still lands, Fine");
  }

  {
    let s = startUrpFromPool(pool);
    const h1 = hintUrp(s);
    assert(h1.state.hintsLeft === 1 && h1.flashIndex === 4, "hint 2→1 flashes legal pad");
    const h2 = hintUrp(h1.state);
    assert(h2.state.hintsLeft === 0 && h2.flashIndex === 4, "hint 1→0 still flashes legal pad");
    const h3 = hintUrp(h2.state);
    assert(h3.state.hintsLeft === 0 && h3.flashIndex === null, "hint at 0 does not spend or flash");

    let jamState = startUrpFromPool(pool);
    jamState = orbitUrp(jamState);
    const jamHint = hintUrp(jamState);
    assert(jamHint.state.hintsLeft === 1 && jamHint.flashIndex === null, "violation-only hint does not invent a legal pad");
  }
}

{
  for (const seed of [1, 7, 42, 188, 20260828]) {
    const pool = buildUrpPool(seed);
    assert(pool.length === 6, `seed ${seed} pool size 6`);
    assert(
      pool.every((s) => s.padCount === 5 || s.padCount === 7),
      `seed ${seed} 5-pad or 7-pad only`,
    );
    assert(
      pool.every((s) => s.occupied.length >= 1 && s.occupied.length < s.padCount),
      `seed ${seed} some occupied, at least one empty`,
    );
    assert(pool.some(hasLegalPad), `seed ${seed} pool ≥1 legal screen`);
    const drill = startUrpDrill(seed);
    assert(drill.look === 1 && drill.hintsLeft === 2 && drill.phase === "playing", `seed ${seed} start looks/hints`);
  }
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll urp grader checks passed.");
