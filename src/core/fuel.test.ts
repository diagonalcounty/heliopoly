/**
 * Gravity classes and leave-burn cost.
 * Run: npx tsx src/core/fuel.test.ts
 */
import { GRAVITY_LEAVE_MULT, gravityClassOf, leaveBurnCost } from "./fuel";
import type { BoardNode, GravityClass, PropellantId } from "./types";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

function node(extra: Partial<BoardNode>): BoardNode {
  return {
    id: "x",
    name: "x",
    kind: "moon",
    next: [],
    x: 0,
    y: 0,
    ...extra,
  } as BoardNode;
}

function gnode(g: number): BoardNode {
  return node({ gravityClass: g as GravityClass });
}

// --- GRAVITY_LEAVE_MULT ---
assert(
  JSON.stringify(GRAVITY_LEAVE_MULT) ===
    JSON.stringify({ 0: 0, 1: 0.75, 2: 1.0, 3: 1.4, 4: 1.85 }),
  "GRAVITY_LEAVE_MULT is exactly {0:0, 1:0.75, 2:1, 3:1.4, 4:1.85}",
);

// --- gravityClassOf ---
assert(gravityClassOf(gnode(3)) === 3, "gravityClassOf: explicit class 3 -> 3");
assert(
  gravityClassOf(node({ fuelToLeave: true })) === 2,
  "gravityClassOf: fuelToLeave without class -> 2",
);
assert(
  gravityClassOf(node({ fuelToLeave: true, gravityClass: 0 })) === 0,
  "gravityClassOf: explicit class 0 wins over fuelToLeave",
);
assert(
  gravityClassOf(node({ fuelToLeave: false })) === 0,
  "gravityClassOf: fuelToLeave false -> 0",
);
assert(gravityClassOf(node({})) === 0, "gravityClassOf: empty node -> 0");

// --- leaveBurnCost table ---
const M: PropellantId = "methane";
const H: PropellantId = "hydrogen";
const rows: [string, BoardNode, number, PropellantId, number][] = [
  ["g2 x7 methane (baseline)", gnode(2), 7, M, 7],
  ["g2 x7 hydrogen (5.95 ceil)", gnode(2), 7, H, 6],
  ["g1 x7 methane (5.25 ceil)", gnode(1), 7, M, 6],
  ["g1 x4 methane (exact 3)", gnode(1), 4, M, 3],
  ["g1 x1 hydrogen (floor of 1)", gnode(1), 1, H, 1],
  ["g2 x1 methane (minimum)", gnode(2), 1, M, 1],
  ["g3 x7 methane (9.8 ceil)", gnode(3), 7, M, 10],
  ["g3 x2 hydrogen (2.38 ceil)", gnode(3), 2, H, 3],
  ["g4 x12 methane (22.2 ceil)", gnode(4), 12, M, 23],
  ["g4 x12 hydrogen (18.87 ceil)", gnode(4), 12, H, 19],
  ["g4 x1 hydrogen (1.5725 ceil)", gnode(4), 1, H, 2],
  ["g2 x20 hydrogen (exact 17)", gnode(2), 20, H, 17],
  ["g2 x2.5 methane (fractional ceil)", gnode(2), 2.5, M, 3],
  ["g0 x12 methane (no well)", gnode(0), 12, M, 0],
  ["g4 x0 methane (zero steps)", gnode(4), 0, M, 0],
  ["g4 x-3 methane (negative steps)", gnode(4), -3, M, 0],
  ["legacy fuelToLeave x7 hydrogen", node({ fuelToLeave: true }), 7, H, 6],
  ["no flag, no class x7 methane", node({}), 7, M, 0],
];
for (const [label, n, steps, p, want] of rows) {
  const got = leaveBurnCost(n, steps, p);
  assert(got === want, `leaveBurnCost ${label} = ${want} (got ${got})`);
}

// --- invariants ---
{
  let atLeastOne = true;
  let monotone = true;
  let hydrogenCheaper = true;
  for (let g = 1; g <= 4; g++) {
    let prevM = 0;
    let prevH = 0;
    for (let steps = 1; steps <= 12; steps++) {
      const m = leaveBurnCost(gnode(g), steps, M);
      const h = leaveBurnCost(gnode(g), steps, H);
      if (m < 1 || h < 1) atLeastOne = false;
      if (m < prevM || h < prevH) monotone = false;
      if (h > m) hydrogenCheaper = false;
      prevM = m;
      prevH = h;
    }
  }
  assert(atLeastOne, "invariant: cost >= 1 for g1..4, steps 1..12");
  assert(monotone, "invariant: cost never decreases as steps increase");
  assert(hydrogenCheaper, "invariant: hydrogen <= methane for same inputs");
}

// --- invalid inputs (current behaviour) ---
{
  const xenon = "xenon" as PropellantId;
  let threw: unknown = null;
  try {
    leaveBurnCost(gnode(2), 3, xenon);
  } catch (e) {
    threw = e;
  }
  assert(
    threw instanceof TypeError,
    "unknown propellant with g2 throws TypeError",
  );
  assert(
    leaveBurnCost(gnode(0), 3, xenon) === 0,
    "unknown propellant with g0 returns 0 (early return skips lookup)",
  );
}

// KNOWN GAP: steps = NaN slips past the `steps <= 0` guard and the result is
// NaN. Documented only; deliberately not asserted as correct.
{
  const got = leaveBurnCost(gnode(2), Number.NaN, M);
  console.log(`note  KNOWN GAP: leaveBurnCost(g2, NaN, methane) = ${got}`);
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll fuel checks passed.");
