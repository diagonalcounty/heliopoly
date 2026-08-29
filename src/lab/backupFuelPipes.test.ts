/**
 * Backup-fuel pipe routing (#77 / #201).
 * Run: npx tsx src/lab/backupFuelPipes.test.ts
 */
import {
  PIPE_GRID,
  cellKey,
  cellKind,
  flowFromTank,
  isPathComplete,
  isPipeFixture,
  rotateMask,
  rotateTile,
  startPipes,
  tilesFromPath,
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

function playing(s: PipeState): PipeState {
  return { ...s, rotates: 0, phase: "playing" };
}

assert(PIPE_GRID === 6, "grid is 6×6");

{
  const s = startPipes(77);
  assert(s.tiles.length === 6 && s.tiles[0]!.length === 6, "tiles are 6×6");
  assert(
    s.tank.r !== s.engine.r || s.tank.c !== s.engine.c,
    "tank and engine are distinct",
  );
  const peri =
    s.tank.r === 0 ||
    s.tank.r === 5 ||
    s.tank.c === 0 ||
    s.tank.c === 5;
  const periE =
    s.engine.r === 0 ||
    s.engine.r === 5 ||
    s.engine.c === 0 ||
    s.engine.c === 5;
  assert(peri, "tank is on the perimeter");
  assert(periE, "engine is on the perimeter");
  assert(
    ((s.tank.r + s.tank.c) & 1) !== ((s.engine.r + s.engine.c) & 1),
    "tank and engine are opposite chessboard colors",
  );
}

{
  const tanks = new Set<string>();
  const engines = new Set<string>();
  let tankLeftMid = 0;
  let engineRightMid = 0;
  for (let seed = 1; seed <= 24; seed++) {
    const s = startPipes(seed);
    tanks.add(cellKey(s.tank.r, s.tank.c));
    engines.add(cellKey(s.engine.r, s.engine.c));
    // Old 5×5 tell, mapped to 6×6: tank left-middle-ish col 0 row 2 or 3;
    // engine right-middle col 5 row 2 or 3.
    if (s.tank.c === 0 && (s.tank.r === 2 || s.tank.r === 3)) tankLeftMid++;
    if (s.engine.c === PIPE_GRID - 1 && (s.engine.r === 2 || s.engine.r === 3)) {
      engineRightMid++;
    }
  }
  assert(tanks.size >= 4, `tank moves around the rim (${tanks.size} unique in 24 deals)`);
  assert(engines.size >= 4, `engine moves around the rim (${engines.size} unique in 24 deals)`);
  assert(tankLeftMid < 24, "tank is not always left-middle");
  assert(engineRightMid < 24, "engine is not always right-middle");
}

{
  const s = startPipes(201);
  assert(!isPathComplete(s), "scramble seed 201 is not already complete");
  assert(s.phase === "playing", "scramble starts in playing");
  assert(s.rotates === 0, "scramble rotate counter is zero");
  assert(
    isPipeFixture(s.tank.r, s.tank.c, s.tank, s.engine) &&
      isPipeFixture(s.engine.r, s.engine.c, s.tank, s.engine),
    "fixtures helper",
  );
  const tankBits =
    (s.tiles[s.tank.r]![s.tank.c]! & 1) +
    ((s.tiles[s.tank.r]![s.tank.c]! >> 1) & 1) +
    ((s.tiles[s.tank.r]![s.tank.c]! >> 2) & 1) +
    ((s.tiles[s.tank.r]![s.tank.c]! >> 3) & 1);
  const engineBits =
    (s.tiles[s.engine.r]![s.engine.c]! & 1) +
    ((s.tiles[s.engine.r]![s.engine.c]! >> 1) & 1) +
    ((s.tiles[s.engine.r]![s.engine.c]! >> 2) & 1) +
    ((s.tiles[s.engine.r]![s.engine.c]! >> 3) & 1);
  assert(tankBits === 1, "tank opens one way only");
  assert(engineBits === 1, "engine opens one way only");
}

{
  const a = startPipes(1);
  const b = startPipes(1);
  assert(
    JSON.stringify(a.tiles) === JSON.stringify(b.tiles) &&
      a.tank.r === b.tank.r &&
      a.tank.c === b.tank.c &&
      a.engine.r === b.engine.r &&
      a.engine.c === b.engine.c,
    "same seed yields the same deal",
  );
}

{
  const s0 = startPipes(9);
  const tankBefore = s0.tiles[s0.tank.r]![s0.tank.c];
  const s = rotateTile(playing(s0), s0.tank.r, s0.tank.c);
  assert(s.rotates === 0, "rotate: tank fixture does not count");
  assert(s.tiles[s0.tank.r]![s0.tank.c] === tankBefore, "rotate: tank stays fixed");
  const engineBefore = s0.tiles[s0.engine.r]![s0.engine.c];
  const s2 = rotateTile(playing(s0), s0.engine.r, s0.engine.c);
  assert(s2.tiles[s0.engine.r]![s0.engine.c] === engineBefore, "rotate: engine stays fixed");
}

{
  // Build an unscrambled solved grid from a deal's fixtures by rotating interiors
  // back is hard without the path. Instead: startPipes scramble, then prove that
  // rotating a connected interior pipe can break flow, four turns restore it —
  // pick a cell adjacent to the tank that is not the engine.
  const s0 = startPipes(12);
  let br = -1;
  let bc = -1;
  for (const [dr, dc] of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ] as const) {
    const r = s0.tank.r + dr;
    const c = s0.tank.c + dc;
    if (r < 0 || r >= PIPE_GRID || c < 0 || c >= PIPE_GRID) continue;
    if (r === s0.engine.r && c === s0.engine.c) continue;
    br = r;
    bc = c;
    break;
  }
  assert(br >= 0, "tank has an interior/perimeter neighbor to rotate");
  const before = s0.tiles[br]![bc]!;
  const s1 = rotateTile(s0, br, bc);
  assert(s1.rotates === 1, "rotate: counter increments");
  assert(s1.tiles[br]![bc] === rotateMask(before), "rotate: tile turns 90° clockwise");
}

{
  const s = startPipes(44);
  assert(cellKind(s.tank.r, s.tank.c, s.tank, s.engine) === "tank", "cellKind tank");
  assert(cellKind(s.engine.r, s.engine.c, s.tank, s.engine) === "engine", "cellKind engine");
  const r = s.tank.r === 0 ? 1 : 0;
  const c = s.tank.c === 0 ? 1 : 0;
  if (!(r === s.engine.r && c === s.engine.c)) {
    assert(cellKind(r, c, s.tank, s.engine) === "pipe", "cellKind pipe");
  }
}

{
  const snake: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < 6; r++) {
    if (r % 2 === 0) {
      for (let c = 0; c < 6; c++) snake.push({ r, c });
    } else {
      for (let c = 5; c >= 0; c--) snake.push({ r, c });
    }
  }
  const tiles = tilesFromPath(snake);
  const tank = snake[0]!;
  const engine = snake[snake.length - 1]!;
  const solved: PipeState = {
    tiles,
    tank,
    engine,
    rotates: 0,
    phase: "playing",
  };
  assert(isPathComplete(solved), "path-complete: snake tank→engine is continuous");
  assert(flowFromTank(solved).size === 36, "path-complete: solved flow covers the grid");
  const firstInterior = snake[1]!;
  const s1 = rotateTile(solved, firstInterior.r, firstInterior.c);
  assert(!isPathComplete(s1), "rotate: breaking a solved joint disconnects tank→engine");
  assert(
    !flowFromTank(s1).has(cellKey(engine.r, engine.c)),
    "rotate: engine leaves the flow",
  );
  const s2 = rotateTile(s1, firstInterior.r, firstInterior.c);
  const s3 = rotateTile(s2, firstInterior.r, firstInterior.c);
  const s4 = rotateTile(s3, firstInterior.r, firstInterior.c);
  assert(isPathComplete(s4), "rotate: four turns restore the joint");
  assert(s4.phase === "won", "rotate: complete path marks the drill won");
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nbackupFuelPipes tests passed");
