/**
 * Journey win record (#342): local-device win tally by player count + expedition.
 * Run: npx tsx src/core/journeyRecord.test.ts
 */
import {
  JOURNEY_WINS_KEY,
  loadJourneyWins,
  recordJourneyWin,
} from "./journeyRecord";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

function memStore() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => {
      m.set(k, v);
    },
  };
}

assert(
  JOURNEY_WINS_KEY === "heliopoly-journey-wins",
  "win record storage key is documented",
);

assert(loadJourneyWins(null).length === 0, "no storage reads as no wins");

{
  const store = memStore();
  assert(loadJourneyWins(store).length === 0, "empty key is no wins");

  const after1 = recordJourneyWin(store, { playerCount: 4, difficulty: "normal" });
  assert(after1.length === 1, "first win recorded");
  assert(
    after1[0]!.playerCount === 4 && after1[0]!.difficulty === "normal",
    "first win stores player count and expedition",
  );

  const after2 = recordJourneyWin(store, { playerCount: 6, difficulty: "expert" });
  assert(after2.length === 2, "second win appends, does not replace");
  assert(
    after2[1]!.playerCount === 6 && after2[1]!.difficulty === "expert",
    "second win stores its own player count and expedition",
  );

  assert(loadJourneyWins(store).length === 2, "wins persist across loads");
}

{
  const store = memStore();
  store.setItem(JOURNEY_WINS_KEY, "not json");
  assert(loadJourneyWins(store).length === 0, "corrupt JSON reads as no wins");

  store.setItem(JOURNEY_WINS_KEY, JSON.stringify([{ playerCount: 2 }]));
  assert(loadJourneyWins(store).length === 0, "entries missing a valid difficulty are dropped");

  store.setItem(
    JOURNEY_WINS_KEY,
    JSON.stringify([{ playerCount: 3, difficulty: "hard" }, { playerCount: 2, difficulty: "nope" }]),
  );
  assert(loadJourneyWins(store).length === 1, "only well-formed entries count");
}

{
  const after = recordJourneyWin(null, { playerCount: 2, difficulty: "easy" });
  assert(after.length === 1, "null storage still reports the win for this session");
  assert(loadJourneyWins(null).length === 0, "null storage does not pretend to persist");
}

if (failed > 0) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nall journeyRecord tests passed");
