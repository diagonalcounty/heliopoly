/**
 * PendingDuel field compare used by resolveDuelAiFully (#25).
 * Run: npx tsx src/core/samePendingDuel.test.ts
 */
import { samePendingDuel } from "./rules";
import type { PendingDuel } from "./types";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

const base: PendingDuel = {
  nodeId: "t_ev",
  challengerId: "p0",
  defenderId: "p1",
  challengerStance: "high",
  defenderStance: null,
  challengerRoll: { d1: 3, d2: 4, total: 7, doubles: false },
  defenderRoll: null,
};

assert(samePendingDuel(null, null), "null === null");
assert(!samePendingDuel(base, null), "object !== null");
assert(samePendingDuel(base, { ...base }), "shallow copy equal");
assert(
  samePendingDuel(base, {
    ...base,
    challengerRoll: { d1: 3, d2: 4, total: 7, doubles: false },
  }),
  "nested roll copy equal",
);
assert(
  !samePendingDuel(base, { ...base, challengerStance: "low" }),
  "stance change differs",
);
assert(
  !samePendingDuel(base, {
    ...base,
    challengerRoll: { d1: 1, d2: 1, total: 2, doubles: true },
  }),
  "roll change differs",
);
assert(
  samePendingDuel(base, {
    ...base,
    defenderRoll: null,
    defenderStance: null,
  }),
  "explicit null fields equal",
);

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll samePendingDuel checks passed.");
