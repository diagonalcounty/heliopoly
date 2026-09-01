/**
 * Gameplay version catalog (#132).
 * Run: npx tsx src/core/gameplayMode.test.ts
 */
import {
  GAMEPLAY_MODES,
  V1_BUILD,
  buildForMode,
  modeSelectLabel,
  parseStoredMode,
  shippedModes,
} from "./gameplayMode";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

assert(parseStoredMode(null) === "v1", "parseStoredMode(null) defaults to v1");
assert(parseStoredMode("") === "v1", "parseStoredMode empty string defaults to v1");
assert(parseStoredMode("garbage") === "v1", "parseStoredMode garbage defaults to v1");
assert(parseStoredMode("V1") === "v1", "parseStoredMode wrong case is not a valid id");
assert(parseStoredMode("v1") === "v1", "parseStoredMode v1 stays v1");
assert(
  parseStoredMode("v2") === "v2",
  "parseStoredMode v2 keeps the valid unshipped id",
);
assert(parseStoredMode("v3") === "v3", "parseStoredMode v3 keeps the valid unshipped id");
assert(parseStoredMode("v4") === "v4", "parseStoredMode v4 keeps the valid unshipped id");

assert(GAMEPLAY_MODES.length === 4, "GAMEPLAY_MODES has four entries");
assert(
  GAMEPLAY_MODES.filter((m) => m.shipped).length === 1 &&
    GAMEPLAY_MODES[0]?.id === "v1" &&
    GAMEPLAY_MODES[0]?.shipped === true,
  "only v1 is shipped",
);
assert(
  GAMEPLAY_MODES.slice(1).every((m) => m.shipped === false),
  "v2–v4 are unshipped",
);
assert(
  shippedModes().length === 1 && shippedModes()[0]?.id === "v1",
  "shippedModes() is only v1",
);

{
  const label = modeSelectLabel("v1");
  assert(
    label.includes("V1 Boardgame") && label.includes("1.1.0"),
    `modeSelectLabel(v1) includes V1 Boardgame and 1.1.0 (got ${label})`,
  );
  assert(
    modeSelectLabel("v1", "1.2.0").includes("1.2.0"),
    "modeSelectLabel v1 honors an explicit build override",
  );
}

{
  const v2 = modeSelectLabel("v2");
  const v3 = modeSelectLabel("v3");
  const v4 = modeSelectLabel("v4");
  assert(v2.includes("V2"), `locked catalog still lists V2 (got ${v2})`);
  assert(v3.includes("V3"), `locked catalog still lists V3 (got ${v3})`);
  assert(v4.includes("V4"), `locked catalog still lists V4 (got ${v4})`);
  assert(
    v2.includes("unshipped") && v3.includes("unshipped") && v4.includes("unshipped"),
    "locked labels mark unshipped",
  );
}

assert(V1_BUILD === "1.1.0", "V1_BUILD matches package.json 1.1.0");
assert(buildForMode("v1") === "1.1.0", "buildForMode v1 is 1.1.0");
assert(buildForMode("v2") === "2.x.x", "buildForMode v2 is 2.x.x");
assert(buildForMode("v3") === "3.x.x", "buildForMode v3 is 3.x.x");
assert(buildForMode("v4") === "4.x.x", "buildForMode v4 is 4.x.x");

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll gameplay-mode checks passed.");
