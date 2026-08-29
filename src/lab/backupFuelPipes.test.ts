/**
 * Backup-fuel pipe routing (#77).
 * Run: npx tsx src/lab/backupFuelPipes.test.ts
 */
import {
  DIR_E,
  DIR_W,
  ENGINE,
  PIPE_GRID,
  SOLVED_PATH,
  TANK,
  cellKey,
  flowFromTank,
  isPathComplete,
  isPipeFixture,
  rotateMask,
  rotateTile,
  solvedTiles,
  startPipes,
  type PipeState,
} from "./backupFuelPipes";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

function playing(tiles: number[][]): PipeState {
  return { tiles, rotates: 0, phase: "playing" };
}

{
  assert(SOLVED_PATH.length === PIPE_GRID * PIPE_GRID, "solved path visits all 25 cells");
  const [sr, sc] = SOLVED_PATH[0];
  const [er, ec] = SOLVED_PATH[SOLVED_PATH.length - 1];
  assert(sr === TANK.r && sc === TANK.c, "path starts at tank");
  assert(er === ENGINE.r && ec === ENGINE.c, "path ends at engine");
}

{
  const tiles = solvedTiles();
  const tankMask = tiles[TANK.r][TANK.c];
  const engineMask = tiles[ENGINE.r][ENGINE.c];
  assert(tankMask === DIR_E, "tank opens east only");
  assert(engineMask === DIR_W, "engine opens west only");
  const s = playing(tiles);
  assert(isPathComplete(s), "path-complete: solved tank→engine is continuous");
  assert(flowFromTank(s).size === 25, "path-complete: solved flow covers the grid");
}

{
  const tiles = solvedTiles();
  // (2,1) is the first interior cell after the tank (east-west + north).
  const before = tiles[2][1];
  const s0 = playing(tiles);
  const s1 = rotateTile(s0, 2, 1);
  assert(s1.rotates === 1, "rotate: counter increments");
  assert(s1.tiles[2][1] === rotateMask(before), "rotate: tile turns 90° clockwise");
  assert(!isPathComplete(s1), "rotate: breaking a solved joint disconnects tank→engine");
  assert(!flowFromTank(s1).has(cellKey(ENGINE.r, ENGINE.c)), "rotate: engine leaves the flow");
  const s2 = rotateTile(s1, 2, 1);
  const s3 = rotateTile(s2, 2, 1);
  const s4 = rotateTile(s3, 2, 1);
  assert(s4.tiles[2][1] === before, "rotate: four turns restore the joint");
  assert(isPathComplete(s4), "rotate: restoring the joint completes the path again");
  assert(s4.phase === "won", "rotate: complete path marks the drill won");
}

{
  const tiles = solvedTiles();
  const tankBefore = tiles[TANK.r][TANK.c];
  const s = rotateTile(playing(tiles), TANK.r, TANK.c);
  assert(s.rotates === 0, "rotate: tank fixture does not count");
  assert(s.tiles[TANK.r][TANK.c] === tankBefore, "rotate: tank stays fixed");
  const engineBefore = tiles[ENGINE.r][ENGINE.c];
  const s2 = rotateTile(playing(tiles), ENGINE.r, ENGINE.c);
  assert(s2.tiles[ENGINE.r][ENGINE.c] === engineBefore, "rotate: engine stays fixed");
}

{
  const s = startPipes(77);
  assert(!isPathComplete(s), "scramble seed 77 is not already complete");
  assert(s.phase === "playing", "scramble starts in playing");
  assert(s.rotates === 0, "scramble rotate counter is zero");
  assert(isPipeFixture(TANK.r, TANK.c) && isPipeFixture(ENGINE.r, ENGINE.c), "fixtures helper");
}

{
  const solved = solvedTiles();
  const s = startPipes(188);
  assert(!isPathComplete(s), "scramble seed 188 is not already complete");
  // Rotate each interior mask back to the solved orientation (≤3 turns).
  // Do this on a cloned grid so a lucky mid-path win does not freeze rotates.
  const restored = s.tiles.map((row) => row.slice());
  for (let r = 0; r < PIPE_GRID; r++) {
    for (let c = 0; c < PIPE_GRID; c++) {
      if (isPipeFixture(r, c)) continue;
      let turns = 0;
      while (restored[r][c] !== solved[r][c] && turns < 4) {
        restored[r][c] = rotateMask(restored[r][c]);
        turns++;
      }
      assert(restored[r][c] === solved[r][c], `scramble restore ${r},${c}`);
    }
  }
  assert(isPathComplete({ tiles: restored }), "path-complete: a scramble restores to tank→engine");
}

{
  const a = startPipes(1);
  const b = startPipes(1);
  assert(
    JSON.stringify(a.tiles) === JSON.stringify(b.tiles),
    "same seed yields the same scramble",
  );
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nbackupFuelPipes tests passed");
