/**
 * urinal-rule-parking grader (#188).
 * Run: npx tsx src/lab/urpGrader.test.ts
 */
import {
  buildUrpPool,
  canOrbit,
  currentUrpPair,
  currentUrpScreen,
  gradePads,
  hasLegalPad,
  hintUrp,
  landUrp,
  orbitUrp,
  selectUrpArea,
  startUrpDrill,
  startUrpFromPool,
  urpLooksChrome,
  urpPairStart,
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
  // look 1 = legal+jam; look 2 = jam7+jam; look 3 = jam7+jam
  const pool: UrpScreen[] = [legal, jam, jam7, jam, jam7, jam];
  assert(pool.length === 6, "fixture pool is six screens");
  assert(pool.some(hasLegalPad), "pool ≥1 legal screen");
  assert(pool.filter((s) => !hasLegalPad(s)).length === 5, "other screens may be violation-only");
  assert(urpPairStart(1) === 0 && urpPairStart(2) === 2 && urpPairStart(3) === 4, "pair packing offsets 0,2,4");

  {
    const s = startUrpFromPool(pool);
    const pair = currentUrpPair(s);
    assert(pair[0] === legal && pair[1] === jam, "look 1 pair = screens[0]+[1]");
    assert(s.selectedArea === 0 && currentUrpScreen(s) === legal, "start area 0 of pair 1");
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
    s = selectUrpArea(s, 1);
    assert(s.selectedArea === 1 && currentUrpScreen(s) === jam, "selector switch → area 2 of pair 1");
    s = selectUrpArea(s, 0);
    assert(s.selectedArea === 0 && currentUrpScreen(s) === legal, "selector switch back → area 1");
  }

  {
    let s = startUrpFromPool(pool);
    s = selectUrpArea(s, 1);
    const land = landUrp(s, 0);
    assert(land.ok && land.state.outcome === "fine", "land on selected (jam) area → Fine");
    assert(land.state.selectedArea === 1, "land stays on selected area");
    const frozen = selectUrpArea(land.state, 0);
    assert(frozen.selectedArea === 1, "selector frozen after land");
  }

  {
    let s = startUrpFromPool(pool);
    const firstPair = currentUrpPair(s);
    s = orbitUrp(s);
    const nextPair = currentUrpPair(s);
    assert(s.look === 2 && s.selectedArea === 0, "orbit advances look and resets area 0");
    assert(nextPair[0] === jam7 && nextPair[1] === jam, "orbit to next pair = screens[2]+[3]");
    assert(nextPair[0] !== firstPair[0] && nextPair[1] !== firstPair[0], "orbit pair is not look-1 pair");
    assert(urpLooksChrome(s) === "2/3", "after one orbit 2/3");
  }

  {
    let s = startUrpFromPool(pool);
    s = orbitUrp(s);
    s = orbitUrp(s);
    assert(s.look === 3 && urpLooksChrome(s) === "1/3", "third look 1/3");
    const lastPair = currentUrpPair(s);
    assert(lastPair[0] === jam7 && lastPair[1] === jam, "look 3 pair = screens[4]+[5]");
    assert(!canOrbit(s), "three-look cap: orbit dead");
    const stuck = orbitUrp(s);
    assert(stuck.look === 3 && stuck.selectedArea === s.selectedArea, "orbit no-op on third look");
    const land = landUrp(s, 0);
    assert(land.ok && land.state.phase === "landed", "third look must land");
    assert(urpLooksChrome(land.state) === "0/3", "after land remaining looks 0/3");
    assert(!canOrbit(land.state), "orbit stays dead after land");
  }

  {
    let s = startUrpFromPool(pool);
    const visited: UrpScreen[] = [];
    for (let look = 1; look <= 3; look++) {
      const pair = currentUrpPair(s);
      visited.push(pair[0], pair[1]);
      if (look < 3) s = orbitUrp(s);
    }
    assert(visited.length === 6, "3 looks × 2 areas = 6 screens");
    assert(
      visited.every((scr, i) => scr === pool[i]),
      "visiting both areas of each pair covers the pool in order",
    );
  }

  {
    let s = startUrpFromPool(pool);
    assert(hasLegalPad(currentUrpPair(s)[0]!), "look 1 area 1 is the legal screen");
    s = orbitUrp(s);
    s = orbitUrp(s);
    const pair = currentUrpPair(s);
    assert(!hasLegalPad(pair[0]) && !hasLegalPad(pair[1]), "skip pair-1 legal → later pair can be violation-only");
    s = selectUrpArea(s, 0);
    const empty = [0, 1, 2, 3, 4, 5, 6].find((i) => i < pair[0]!.padCount && !pair[0]!.occupied.includes(i))!;
    const land = landUrp(s, empty);
    assert(land.ok && land.state.outcome === "fine", "violation-only pair still lands, Fine");
  }

  {
    let s = startUrpFromPool(pool);
    const h1 = hintUrp(s);
    assert(h1.state.hintsLeft === 1 && h1.flashIndex === 4, "hint on selected legal area flashes that pad");
    const h2 = hintUrp(h1.state);
    assert(h2.state.hintsLeft === 0 && h2.flashIndex === 4, "hint 1→0 still flashes selected legal pad");
    const h3 = hintUrp(h2.state);
    assert(h3.state.hintsLeft === 0 && h3.flashIndex === null, "hint at 0 does not spend or flash");

    let jamState = startUrpFromPool(pool);
    jamState = selectUrpArea(jamState, 1);
    const jamHint = hintUrp(jamState);
    assert(jamHint.state.hintsLeft === 1 && jamHint.flashIndex === null, "hint on selected jam area does not invent a pad");

    let other = startUrpFromPool(pool);
    other = orbitUrp(other);
    const laterHint = hintUrp(other);
    assert(laterHint.flashIndex === null, "hint never flashes a pad on the other / unselected area");
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
    assert(drill.look === 1 && drill.selectedArea === 0 && drill.hintsLeft === 2 && drill.phase === "playing", `seed ${seed} start looks/area/hints`);
    const p1 = currentUrpPair(drill);
    assert(p1[0] === drill.screens[0] && p1[1] === drill.screens[1], `seed ${seed} look 1 packed as [0]+[1]`);
  }
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll urp grader checks passed.");
