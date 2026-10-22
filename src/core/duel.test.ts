/**
 * Pure Gravity Duel helpers.
 * Run: npx tsx src/core/duel.test.ts
 */
import {
  aiDuelStance,
  duelWinner,
  newPendingDuel,
  pickDefender,
  sameLastRoll,
} from "./duel";
import { createGame } from "./state";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

// duelWinner
assert(duelWinner("low", "low", 5, 8, 7) === "challenger", "low/low 5 vs 8 → challenger");
assert(duelWinner("low", "low", 9, 4, 7) === "defender", "low/low 9 vs 4 → defender");
assert(duelWinner("low", "low", 6, 6, 7) === "tie", "low/low 6 vs 6 → tie");
assert(duelWinner("high", "high", 10, 7, 7) === "challenger", "high/high 10 vs 7 → challenger");
assert(duelWinner("high", "high", 3, 11, 7) === "defender", "high/high 3 vs 11 → defender");
assert(duelWinner("high", "high", 8, 8, 7) === "tie", "high/high 8 vs 8 → tie");
assert(duelWinner("high", "low", 7, 10, 7) === "challenger", "mixed c-high 7 vs 10 → challenger");
assert(duelWinner("high", "low", 2, 8, 7) === "defender", "mixed c-high 2 vs 8 → defender");
assert(duelWinner("high", "low", 5, 9, 7) === "tie", "mixed c-high 5 vs 9 → tie");
assert(duelWinner("low", "high", 12, 6, 7) === "defender", "mixed c-low 12 vs 6 → defender");
assert(duelWinner("high", "low", 7, 8, 7.25) === "challenger", "mixed mean 7.25: 7 vs 8 → challenger");

// aiDuelStance
assert(aiDuelStance(13) === "high", "aiDuelStance(13) → high");
assert(aiDuelStance(12) === "low", "aiDuelStance(12) → low");
assert(aiDuelStance(0) === "low", "aiDuelStance(0) → low");

// newPendingDuel
{
  const d = newPendingDuel("belt1", "p0", "p1");
  assert(
    d.nodeId === "belt1" && d.challengerId === "p0" && d.defenderId === "p1",
    "newPendingDuel ids",
  );
  assert(
    d.challengerStance === null &&
      d.defenderStance === null &&
      d.challengerRoll === null &&
      d.defenderRoll === null,
    "newPendingDuel stances and rolls null",
  );
}

// pickDefender
{
  const NODE = "belt1";
  const fresh = () => {
    const s = createGame({ playerCount: 4 });
    for (const p of s.players) p.position = "earth";
    s.encounterMem = {};
    return s;
  };
  const ids = (s: ReturnType<typeof fresh>) => s.players.map((p) => p.id);

  let s = fresh();
  s.players[0].position = NODE;
  assert(pickDefender(s, NODE, ids(s)[0]) === null, "pickDefender: alone → null");

  s = fresh();
  const [p0, p1, p2] = s.players;
  p0.position = NODE;
  p1.position = NODE;
  p1.eliminated = true;
  assert(pickDefender(s, NODE, p0.id) === null, "pickDefender: only eliminated → null");

  s = fresh();
  s.players[0].position = NODE;
  s.players[1].position = NODE;
  s.players[2].position = NODE;
  assert(pickDefender(s, NODE, s.players[0].id)?.id === s.players[1].id, "pickDefender: first in order");

  s.encounterMem[NODE] = { lastRollerId: s.players[2].id, championId: null };
  assert(pickDefender(s, NODE, s.players[0].id)?.id === s.players[2].id, "pickDefender: lastRoller");

  s.encounterMem[NODE] = { lastRollerId: s.players[3].id, championId: s.players[2].id };
  assert(
    pickDefender(s, NODE, s.players[0].id)?.id === s.players[2].id,
    "pickDefender: lastRoller off node → champion",
  );

  s.encounterMem[NODE] = { lastRollerId: s.players[1].id, championId: s.players[2].id };
  assert(pickDefender(s, NODE, s.players[0].id)?.id === s.players[1].id, "pickDefender: lastRoller beats champion");

  s.encounterMem[NODE] = { lastRollerId: s.players[0].id, championId: s.players[0].id };
  assert(pickDefender(s, NODE, s.players[0].id)?.id !== s.players[0].id, "pickDefender: never the challenger");
  void p2;
}

// sameLastRoll
{
  const r = { d1: 3, d2: 4, total: 7, doubles: false };
  assert(sameLastRoll(r, { ...r }), "sameLastRoll equal → true");
  assert(!sameLastRoll(r, null) && !sameLastRoll(null, r), "sameLastRoll one null → false");
  assert(!sameLastRoll(r, { ...r, doubles: true }), "sameLastRoll doubles differs → false");
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll duel checks passed.");
