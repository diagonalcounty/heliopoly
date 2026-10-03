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
  URP_KICKER,
  formatUrpCampaignTotals,
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
import { LAB_SCENARIOS } from "./scenarios";
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

assert(URP_PRODUCT_TITLE === "Urinal-rule Parking (leave a gap)", "human product title");
assert(URP_KICKER === "Practice list", "practice list kicker");
assert(
  URP_PRODUCT_BLURB ===
    "Leave an empty pad between ships when you can. Park beside someone when a gap was open, and you pay a fine. If no good pad is left, go around again.",
  "product sign",
);
assert(
  formatUrpCampaignTotals({ clear: 0, fine: 0, orbit: 0 }, false) === "Cleared 0 · Fine 0 · Laps 0",
  "totals at zero",
);
assert(
  formatUrpCampaignTotals({ clear: 2, fine: 1, orbit: 3 }, true) ===
    "Shelf open · Cleared 2 · Fine 1 · Laps 3",
  "totals keep shelf-open prefix",
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
    formatUrpRunScore("good", 2) === "Cleared 1 · Fine 0 · Laps 2",
    "run score clear line",
  );
  assert(
    formatUrpRunScore("fine", 0) === "Cleared 0 · Fine 1 · Laps 0",
    "run score fine line",
  );
}


{
  const want: Record<string, { title: string; blurb: string }> = {
    "quiet-apron": {
      title: "Quiet Apron (few ships)",
      blurb: "Leave an empty pad between ships. Pick the farthest empty pad that still leaves a gap.",
    },
    "rush-hour": {
      title: "Rush Hour (crowded)",
      blurb: "Seven pads. Sometimes you are not shown a good pad. Park badly and you still pay a fine.",
    },
    "both-sides-bad": {
      title: "Both Sides Bad (one is worse)",
      blurb: "Pick your side before you land.",
    },
    "dead-orbit": {
      title: "Dead Orbit (go around)",
      blurb: "No pad you may use on this pass. Going around is the right move.",
    },
    "final-approach": {
      title: "Final Approach (the last one)",
      blurb: "Use everything you’ve seen. Finish with no fine.",
    },
  };
  for (const sc of URP_SCENARIOS) {
    assert(sc.title === want[sc.id]!.title, `${sc.id} title`);
    assert(sc.blurb === want[sc.id]!.blurb, `${sc.id} blurb`);
  }
  const card = LAB_SCENARIOS.find((sc) => sc.id === "urinal-rule-parking");
  assert(card?.title === URP_PRODUCT_TITLE, "lab shelf title");
  assert(card?.blurb === URP_PRODUCT_BLURB, "lab shelf blurb");
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
