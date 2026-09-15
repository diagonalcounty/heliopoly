/**
 * Urinal-rule Parking campaign (#251).
 * Run: npx tsx src/lab/urpCampaign.test.ts
 */
import {
  URP_PRODUCT_BLURB,
  URP_PRODUCT_TITLE,
  URP_SCENARIOS,
  buildScenarioPool,
  emptyUrpProgress,
  formatUrpRunScore,
  isUrpScenarioUnlocked,
  loadUrpProgress,
  nextUrpScenario,
  pairFullyJammed,
  recordUrpRun,
  saveUrpProgress,
  startUrpScenario,
  type UrpScenarioId,
} from "./urpCampaign";
import {
  canOrbit,
  currentUrpPair,
  hasLegalPad,
  landUrp,
  orbitUrp,
  selectUrpArea,
  gradeScreen,
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

assert(URP_PRODUCT_TITLE === "Urinal-rule Parking", "human product title");
assert(
  URP_PRODUCT_BLURB ===
    "Orbit the apron. Leave a buffer. Land rude and the fine sticks.",
  "locked product blurb",
);
assert(URP_SCENARIOS.length === 5, "five scenarios on the shelf");
assert(
  URP_SCENARIOS.map((s) => s.id).join(",") ===
    "quiet-apron,rush-hour,both-sides-bad,dead-orbit,final-approach",
  "shelf order; Enforcement Lottery cut",
);
assert(
  !URP_SCENARIOS.some((s) => /homeschool|curriculum|manners|etiquette/i.test(s.blurb)),
  "no homeschool / manners sanitize in blurbs",
);

{
  let p = emptyUrpProgress();
  assert(isUrpScenarioUnlocked("quiet-apron", p), "Quiet Apron always unlocked");
  assert(!isUrpScenarioUnlocked("rush-hour", p), "Rush Hour locked at start");
  assert(!isUrpScenarioUnlocked("final-approach", p), "Final locked at start");

  p = recordUrpRun(p, { scenarioId: "quiet-apron", outcome: "fine", orbitsUsed: 0 });
  assert(!isUrpScenarioUnlocked("rush-hour", p), "fine does not unlock next");
  assert(p.totals.fine === 1 && p.totals.clear === 0, "fine tallied");

  p = recordUrpRun(p, { scenarioId: "quiet-apron", outcome: "good", orbitsUsed: 2 });
  assert(isUrpScenarioUnlocked("rush-hour", p), "clear Quiet → unlock Rush");
  assert(p.cleared.includes("quiet-apron"), "Quiet recorded cleared");
  assert(p.totals.clear === 1 && p.totals.orbit === 2, "clear + orbits tallied");

  for (const id of ["rush-hour", "both-sides-bad", "dead-orbit"] as UrpScenarioId[]) {
    p = recordUrpRun(p, { scenarioId: id, outcome: "good", orbitsUsed: 1 });
  }
  assert(isUrpScenarioUnlocked("final-approach", p), "linear unlock reaches Final");
  assert(!p.shelfOpen, "shelf stays linear until Final clear");

  p = recordUrpRun(p, { scenarioId: "final-approach", outcome: "good", orbitsUsed: 2 });
  assert(p.shelfOpen, "Final clear opens shelf");
  assert(
    URP_SCENARIOS.every((s) => isUrpScenarioUnlocked(s.id, p)),
    "open shelf unlocks all five",
  );
}

{
  assert(nextUrpScenario("quiet-apron") === "rush-hour", "next after Quiet");
  assert(nextUrpScenario("dead-orbit") === "final-approach", "next after Dead Orbit");
  assert(nextUrpScenario("final-approach") === null, "no next after Final");
}

{
  const mem: Record<string, string> = {};
  const storage = {
    getItem: (k: string) => mem[k] ?? null,
    setItem: (k: string, v: string) => {
      mem[k] = v;
    },
  };
  let p = emptyUrpProgress();
  p = recordUrpRun(p, { scenarioId: "quiet-apron", outcome: "good", orbitsUsed: 1 });
  saveUrpProgress(p, storage);
  const loaded = loadUrpProgress(storage);
  assert(loaded.cleared.includes("quiet-apron"), "progress persists cleared");
  assert(loaded.totals.orbit === 1, "progress persists orbit total");
}

{
  assert(
    formatUrpRunScore("good", 2) === "Clear 1 · Fine 0 · Orbit 2",
    "run score clear line",
  );
  assert(
    formatUrpRunScore("fine", 0) === "Clear 0 · Fine 1 · Orbit 0",
    "run score fine line",
  );
}

const seeds = [1, 7, 42, 99, 188, 251, 20260911];
for (const id of URP_SCENARIOS.map((s) => s.id)) {
  for (const seed of seeds) {
    const pool = buildScenarioPool(id, seed);
    assert(pool.length === 6, `${id}/${seed} pool size 6`);
    assert(pool.some(hasLegalPad), `${id}/${seed} ≥1 legal screen`);
    assert(
      hasLegalPad(pool[4]!) || hasLegalPad(pool[5]!),
      `${id}/${seed} look 3 has a clear path`,
    );
    if (id === "dead-orbit") {
      assert(
        !hasLegalPad(pool[0]!) && !hasLegalPad(pool[1]!),
        `${id}/${seed} look 1 fully jammed`,
      );
      assert(pairFullyJammed([pool[0]!, pool[1]!]), `${id}/${seed} pairFullyJammed look 1`);
    }
    if (id === "rush-hour") {
      assert(
        pool.every((s) => s.padCount === 7),
        `${id}/${seed} all 7-pad`,
      );
    }
    if (id === "quiet-apron") {
      assert(
        pool.every((s) => s.padCount === 5),
        `${id}/${seed} all 5-pad`,
      );
    }
    if (id === "both-sides-bad") {
      for (let look = 1; look <= 3; look++) {
        const a = pool[(look - 1) * 2]!;
        const b = pool[(look - 1) * 2 + 1]!;
        const legalCount = (hasLegalPad(a) ? 1 : 0) + (hasLegalPad(b) ? 1 : 0);
        assert(legalCount === 1, `${id}/${seed} look ${look} exactly one legal area`);
      }
    }
  }
}

{
  // Dead Orbit: orbit past jam, then land legal on look 3 → clear.
  let s = startUrpScenario("dead-orbit", 42);
  assert(pairFullyJammed(currentUrpPair(s)), "Dead Orbit start pair jammed");
  assert(canOrbit(s), "can orbit away from jam");
  s = orbitUrp(s);
  if (pairFullyJammed(currentUrpPair(s)) && canOrbit(s)) {
    s = orbitUrp(s);
  }
  const pair = currentUrpPair(s);
  const area = hasLegalPad(pair[0]) ? 0 : 1;
  s = selectUrpArea(s, area as 0 | 1);
  const legal = gradeScreen(pair[area]!);
  assert(legal.kind === "pad", "Dead Orbit find legal after orbits");
  if (legal.kind !== "pad") throw new Error("unreachable");
  const land = landUrp(s, legal.index);
  assert(land.ok && land.state.outcome === "good", "Dead Orbit orbit-then-clear path");
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll urp campaign checks passed.");
