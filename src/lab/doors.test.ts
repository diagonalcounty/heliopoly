/**
 * Home door membership and Lab unlock (#276–#279).
 * Run: npx tsx src/lab/doors.test.ts
 */
import { LAB_SCENARIOS } from "./scenarios";
import {
  ARCADE_SCENARIO_IDS,
  ARCADE_SESSIONS_KEY,
  HOME_DOOR_COPY,
  HOME_DOOR_ORDER,
  classifyScenarios,
  isLabUnlocked,
  isOperatorExperimentGroup,
  readArcadeSessionsCompleted,
  recordArcadeSessionExit,
  scenarioShelf,
  scenariosForShelf,
} from "./doors";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

assert(HOME_DOOR_ORDER[0] === "arcade", "Arcade is the first door");
assert(
  HOME_DOOR_ORDER.join(",") === "arcade,journey,lab",
  "exactly three doors in Arcade, Journey, Lab order",
);
assert(HOME_DOOR_COPY.arcade.hook === "On the rocket", "Arcade hook");
assert(HOME_DOOR_COPY.arcade.kicker === "Play for a minute", "Arcade kicker");
assert(HOME_DOOR_COPY.journey.hook === "Fly the charter", "Journey hook");
assert(HOME_DOOR_COPY.journey.kicker === "Full game", "Journey kicker");
assert(HOME_DOOR_COPY.lab.hook === "Experiments", "Lab hook");
assert(HOME_DOOR_COPY.lab.kicker === "Nerdy tools", "Lab kicker");
assert(
  ARCADE_SESSIONS_KEY === "heliopoly.arcadeSessionsCompleted",
  "Lab gate key is documented",
);

{
  const { arcade, lab } = classifyScenarios(LAB_SCENARIOS);
  assert(
    arcade.join(",") === ARCADE_SCENARIO_IDS.join(","),
    "Arcade allowlist is Bot Evolution, Backup fuel, Hull panel",
  );
  assert(arcade.length === 3, "Arcade has three toys");
  assert(!arcade.includes("duel-you-challenger"), "Gravity Duel practice is not Arcade");
  assert(!arcade.includes("deseret-match"), "Deseret stays Lab");
  assert(!arcade.includes("urinal-rule-parking"), "URP stays Lab");
  assert(!arcade.includes("eastern-arabic-compare"), "literacy stays Lab");
  assert(!arcade.includes("end-you-win"), "end screens stay Lab");
  assert(!arcade.includes("going-under-warnings"), "economy drills stay Lab");
  assert(lab.includes("duel-you-challenger"), "Lab keeps Gravity Duel practice");
  assert(lab.includes("deseret-match"), "Lab keeps Deseret");
  assert(lab.includes("urinal-rule-parking"), "Lab keeps URP");
  assert(lab.includes("eastern-arabic-compare"), "Lab keeps Eastern Arabic");
  assert(lab.includes("chinese-compare"), "Lab keeps Chinese");
  assert(lab.includes("korean-compare"), "Lab keeps Korean");
  assert(lab.includes("hebrew-compare"), "Lab keeps Hebrew");
  assert(lab.includes("binary-compare"), "Lab keeps Binary");
  assert(lab.includes("end-you-win"), "Lab keeps win end screen");
  assert(lab.includes("end-ai-wins"), "Lab keeps lose end screen");
  assert(lab.includes("claim-ledger"), "Lab keeps remote sell");
  assert(lab.includes("h2-leak-repair"), "Lab keeps H2 leak");
  assert(lab.includes("parking-feral-risk"), "Lab keeps parking/feral");
  assert(lab.includes("hub-network-rent-x4"), "Lab keeps hub rent");
  assert(lab.includes("stranded-elimination"), "Lab keeps stranded");
  assert(lab.includes("resource-strike-gusher"), "Lab keeps resource strike");
  assert(
    arcade.length + lab.length === LAB_SCENARIOS.length,
    "every scenario is on exactly one shelf",
  );
  assert(
    scenariosForShelf(LAB_SCENARIOS, "arcade").every(
      (sc) => scenarioShelf(sc.id) === "arcade",
    ),
    "arcade shelf matches scenarioShelf",
  );
}

assert(scenarioShelf("not-a-real-id") === "lab", "unknown ids stay Lab");
assert(isOperatorExperimentGroup("end"), "end is an operator experiment");
assert(isOperatorExperimentGroup("economy"), "economy is an operator experiment");
assert(
  !isOperatorExperimentGroup("which-is-larger"),
  "literacy is on the Lab shelf, not behind the operator toggle only",
);
assert(!isOperatorExperimentGroup("minigame"), "practice minigames are Lab primary");

{
  const operator = LAB_SCENARIOS.filter((sc) => isOperatorExperimentGroup(sc.group));
  assert(
    operator.every((sc) => scenarioShelf(sc.id) === "lab"),
    "operator experiments are not Arcade",
  );
  assert(operator.length >= 8, "end and economy drills are still classified");
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

assert(readArcadeSessionsCompleted(null) === 0, "no storage reads as zero");
assert(!isLabUnlocked(0), "cold install keeps Lab locked");
assert(isLabUnlocked(1), "one Arcade exit unlocks Lab");
assert(isLabUnlocked(4), "later sessions stay unlocked");

{
  const store = memStore();
  assert(readArcadeSessionsCompleted(store) === 0, "empty key is zero");
  store.setItem(ARCADE_SESSIONS_KEY, "nope");
  assert(readArcadeSessionsCompleted(store) === 0, "garbage key is zero");
  store.setItem(ARCADE_SESSIONS_KEY, "-2");
  assert(readArcadeSessionsCompleted(store) === 0, "negative key is zero");
  store.setItem(ARCADE_SESSIONS_KEY, "2.9");
  assert(readArcadeSessionsCompleted(store) === 2, "fractional key floors");
  const after = recordArcadeSessionExit(store);
  assert(after === 3, "exit increments the stored count");
  assert(readArcadeSessionsCompleted(store) === 3, "exit persists");
  assert(isLabUnlocked(readArcadeSessionsCompleted(store)), "persisted count unlocks");
}

{
  assert(recordArcadeSessionExit(null) === 1, "null storage still reports the exit");
  assert(readArcadeSessionsCompleted(null) === 0, "null storage does not pretend to persist");
}

if (failed > 0) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nall doors tests passed");
