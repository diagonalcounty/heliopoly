/**
 * Bot Evolution engine (#203 / #240 / #241).
 * Run: npx tsx src/lab/botEvolution.test.ts
 */
import {
  BASE_GRAVITY_MS,
  BOT_QUEUE,
  BOT_ROWS,
  BOT_STAGE_MAX,
  BOT_STAGE_MIN,
  BOXES_TO_CONNECT_6,
  DIR_E,
  DIR_N,
  DIR_S,
  DIR_W,
  MIN_GRAVITY_MS,
  PIECE_IDS,
  PIECE_SOCKETS,
  SPEED_MUL,
  aimColumn,
  barStep,
  centerCol,
  clampStage,
  connectedComponents,
  dropPiece,
  gravityMs,
  hasSocket,
  liveChainCells,
  landingPreview,
  LOCK_GRACE_TICKS,
  quotaForStageBar,
  quotaForState,
  pieceArt,
  queueMosaicSpin,
  queuePixelStrength,
  recycleBottomRow,
  SHELL_FILL,
  connectorKind,
  eggTokenSvg,
  eggBodyFor,
  EGG_BODY_DEFAULTS,
  EGG_BODY_STRAIGHT,
  socketCount,
  socketJoins,
  socketsMeet,
  startBotEvo,
  startBotEvoAt,
  tick,
  type BotGrid,
  type BotState,
  type PieceId,
} from "./botEvolution";
import {
  availableLookKinds,
  blankDirs,
  botFaceSvg,
  liveDirs,
  LOCKED_FACE,
  pickLookDir,
} from "./botevoFaces";
import {
  BOTEVO_SAVE_ARIA,
  BOTEVO_TITLE,
  connectLabel,
  playHint,
  stageTeach,
} from "./botEvoCopy";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

function countPieces(grid: BotGrid): number {
  let n = 0;
  for (const row of grid) for (const cell of row) if (cell) n++;
  return n;
}

function columnHeight(grid: BotGrid, col: number): number {
  let n = 0;
  for (let r = 0; r < BOT_ROWS; r++) if (grid[r]![col]) n++;
  return n;
}

function lowestPiece(grid: BotGrid, col: number): PieceId | null {
  for (let r = BOT_ROWS - 1; r >= 0; r--) {
    if (grid[r]![col]) return grid[r]![col];
  }
  return null;
}

assert(BOT_STAGE_MIN === 3 && BOT_STAGE_MAX === 6, "stages 3→6");
assert(BOT_ROWS === 8, "height stays 8");
assert(BOT_QUEUE === 6, "preview queue is 6");
assert(clampStage(2) === 3 && clampStage(7) === 6, "clamp rejects 2 and 7+");
assert(centerCol(3) === 1 && centerCol(4) === 1 && centerCol(5) === 2 && centerCol(6) === 2, "spawn column is center-left");
assert(barStep(3) === 1 && barStep(4) === 1 && barStep(5) === 1 && barStep(6) === 1, "20% of N rounds to 1");
assert(quotaForStageBar(3, 0) === 3 && quotaForStageBar(3, 1) === 4, "C3 bars 3 then 4");
assert(quotaForStageBar(4, 0) === 4 && quotaForStageBar(4, 1) === 5, "C4 bars 4 then 5");
assert(quotaForStageBar(5, 0) === 5 && quotaForStageBar(5, 1) === 6, "C5 bars 5 then 6");
assert(quotaForStageBar(6, 0) === 6 && quotaForStageBar(6, 1) === 7 && quotaForStageBar(6, 2) === 8, "C6 6,7,8…");
assert(BOXES_TO_CONNECT_6 === 3 + 4 + 4 + 5 + 5 + 6, "27 boxes to first C6");
assert(gravityMs(3, 0) === BASE_GRAVITY_MS, "C3 gravity is baseline");
assert(gravityMs(3, 1) === BASE_GRAVITY_MS, "C3 second bar is not faster");
assert(gravityMs(4, 1) === BASE_GRAVITY_MS, "C4 is not faster");
assert(gravityMs(5, 1) === BASE_GRAVITY_MS, "C5 is not faster");
assert(gravityMs(6, 0) === BASE_GRAVITY_MS, "first C6 bar is still baseline");
assert(
  gravityMs(6, 1) === Math.round(BASE_GRAVITY_MS / SPEED_MUL),
  "C6 speeds up after the first 6×8 bar",
);
assert(
  gravityMs(6, 2) === Math.round(BASE_GRAVITY_MS / SPEED_MUL ** 2),
  "C6 second speedup is ×1.10 again",
);
assert(gravityMs(6, 99) === MIN_GRAVITY_MS, "gravity floor");

assert(PIECE_SOCKETS.plus === (DIR_N | DIR_E | DIR_S | DIR_W), "plus is NESW");
assert(PIECE_SOCKETS.i === (DIR_N | DIR_S), "I is NS only");
assert(PIECE_SOCKETS.dash === (DIR_E | DIR_W), "dash is EW only");
assert(PIECE_SOCKETS["l-ne"] === (DIR_N | DIR_E), "L example is N+E");
assert(!hasSocket("i", DIR_E) && !hasSocket("i", DIR_W), "I never grows side pipes");
assert(!hasSocket("dash", DIR_N) && !hasSocket("dash", DIR_S), "dash has no vertical sockets");
assert(PIECE_IDS.length === 11, "piece set is plus + I + dash + 4 L + 4 T");
assert(pieceArt("plus") === "/lab/botevo/plus.png", "plus has its own art");
assert(pieceArt("dash") === "/lab/botevo/dash.png", "dash is not a rotated I");
assert(socketCount("plus") === 4 && socketCount("t-n") === 3, "plus is 4, T is 3");
assert(socketCount("i") === 2 && socketCount("l-ne") === 2, "I and L are both 2-pin");
assert(connectorKind("i") === "straight" && connectorKind("dash") === "straight", "I and dash share a shell");
assert(connectorKind("t-n") === connectorKind("t-w"), "every T shares a shell");
assert(connectorKind("l-ne") === connectorKind("l-sw"), "every L shares a shell");
assert(connectorKind("l-ne") !== connectorKind("dash"), "corner L is not the straight shell");
assert(eggTokenSvg("i").includes(SHELL_FILL.straight), "straight shell is cyan");
assert(eggTokenSvg("dash").includes(SHELL_FILL.straight), "dash uses the straight shell");
assert(eggTokenSvg("t-e").includes(SHELL_FILL.three), "T shell is mint");
assert(eggTokenSvg("plus").includes(SHELL_FILL.four), "plus shell is cream");
assert(eggTokenSvg("l-es").includes(SHELL_FILL.corner), "L shell is apricot");

{
  const wide = eggBodyFor("plus");
  const tall = eggBodyFor("i");
  const tallDash = eggBodyFor("dash");
  assert(wide.eggRx === EGG_BODY_DEFAULTS.eggRx && wide.eggRy === EGG_BODY_DEFAULTS.eggRy, "plus keeps review-tool egg");
  assert(wide.eggRx === 30 && wide.eggRy === 28.5, "review-tool body defaults (not inflated rx=41)");
  assert(Math.abs(wide.eggRx - wide.eggRy) <= 2, "non-blue shells stay near-round");
  assert(EGG_BODY_DEFAULTS.armLength === 12, "shortened arm length (caps near rim)");
  assert(EGG_BODY_DEFAULTS.endCapSize === 8, "slightly smaller gold end-caps");
  assert(EGG_BODY_DEFAULTS.endCapAspect === 0.42, "review-tool end-cap aspect");
  assert(EGG_BODY_DEFAULTS.highlightOpacity === 0.18, "soft shell highlight");
  assert(tall.eggRy > tall.eggRx, "straight I egg is taller than wide");
  assert(tallDash.eggRy === EGG_BODY_STRAIGHT.eggRy && tallDash.eggRx === EGG_BODY_STRAIGHT.eggRx, "dash shares tall straight body");
  assert(tall.eggRy > wide.eggRy, "blue straight is taller than cream shell");
  assert(tall.eggRx < wide.eggRx, "straight swaps/bias rx smaller");
  const svgI = eggTokenSvg("i");
  const svgPlus = eggTokenSvg("plus");
  assert(svgI.includes(`ry="${EGG_BODY_STRAIGHT.eggRy}"`), "I SVG bakes tall ry");
  assert(svgI.includes(`rx="${EGG_BODY_STRAIGHT.eggRx}"`), "I SVG bakes tall rx");
  assert(svgPlus.includes(`ry="${EGG_BODY_DEFAULTS.eggRy}"`), "plus SVG bakes review ry");
  assert(svgPlus.includes(`rx="${EGG_BODY_DEFAULTS.eggRx}"`), "plus SVG bakes review rx");

  assert(svgPlus.includes("radialGradient"), "shell uses radial gradient");
  assert(svgPlus.includes("rgba(255,255,255,"), "shell has soft white highlight");
  assert(!svgI.includes("Q ") && !svgPlus.includes("Q "), "blank shells have no baked smile path");
  assert(svgI.includes(EGG_BODY_DEFAULTS.connectorMetal), "arms use connector metal");
  assert(svgI.includes(EGG_BODY_DEFAULTS.endCapFill), "arms use gold flat end-caps");
  // Topology: rect end-caps (not ellipses) — plus has four gold caps.
  assert((svgPlus.match(/c9a24a/g) || []).length >= 4, "plus has four gold rect caps");
  assert(!/<ellipse[^>]*fill="#c9a24a"/.test(svgPlus), "end-caps are rects not ellipses");
}

assert(socketsMeet("plus", "plus", DIR_E), "plus-plus meet east");
assert(socketsMeet("i", "i", DIR_S), "I-I meet south");
assert(!socketsMeet("i", "i", DIR_E), "I-I do not meet east");
assert(!socketsMeet("dash", "dash", DIR_S), "dash-dash do not meet south");
assert(socketsMeet("dash", "plus", DIR_E), "dash-plus meet east");
assert(!socketsMeet("i", "dash", DIR_E), "I has no east pin");
assert(socketsMeet("l-ne", "dash", DIR_E), "L-NE meets dash to the east");
assert(!socketsMeet("l-ne", "i", DIR_S), "L-NE has no south pin");

{
  const a = startBotEvo(203);
  const b = startBotEvo(203);
  assert(a.current === b.current, "same seed: current piece");
  assert(a.queue.join() === b.queue.join(), "same seed: queue");
  assert(a.queue.length === BOT_QUEUE, "queue length 6");
  assert(a.recycleSharp.length === BOT_QUEUE, "recycleSharp length 6");
  assert(a.recycleSharp.every((v) => v === false), "start not sharp");
  assert(a.phase === "falling", "starts falling");
  assert(a.fallRow === 0, "spawn at the top row");
  assert(a.n === 3 && a.grid[0]!.length === 3, "starts Connect 3 on 3×8");
  assert(a.aimCol === 1, "C3 spawn is center column");
  assert(a.grid.length === BOT_ROWS, "height 8");
  assert(a.level === 1 && a.segments === 0 && a.boxes === 0, "L1 empty bar");
  assert(a.barsCompletedThisStage === 0 && !a.pendingWiden, "no bars yet");
  assert(quotaForState(a) === 3, "C3 first bar is 3");
}

{
  const s = startBotEvo(1);
  assert(s.n === BOT_STAGE_MIN, "cannot start above 3");
  const c6 = startBotEvoAt(6, 1);
  assert(c6.n === 6 && c6.grid[0]!.length === 6, "test helper can sit at C6");
  const over = startBotEvoAt(6, 1);
  over.n = 6;
  over.barsCompletedThisStage = 99;
  assert(clampStage(over.n + 1) === 6, "cannot go past 6 width");
}

{
  const s0 = startBotEvo(1);
  const s = dropPiece(s0, 0, "dash");
  assert(s.phase === "falling" || s.phase === "lost", "next egg auto-falls after a land");
  assert(columnHeight(s.grid, 0) === 1, "one dash lands in col 0");
  assert(lowestPiece(s.grid, 0) === "dash", "lands at the bottom");
  assert(s.grid[BOT_ROWS - 1]![0] === "dash", "bottom row occupied");
  assert(s.grid[0]![0] === null, "top row still empty");
}

{
  let s = startBotEvo(2);
  s = dropPiece(s, 1, "i");
  s = dropPiece(s, 1, "i");
  assert(columnHeight(s.grid, 1) === 2, "two I's do not morph at C3");
  assert(s.boxes === 0, "no box yet");
  s = dropPiece(s, 1, "i");
  assert(s.boxes === 1, "third I morphs one box");
  assert(columnHeight(s.grid, 1) === 0, "morphed I's are removed");
  assert(s.segments === 1, "bar gained one segment");
  assert(s.justMorphed.length >= 3, "morph flash records the chain");
  assert(s.phase === "falling", "next egg falls while the morph flies up");
}

{
  let s = startBotEvo(3);
  for (let i = 0; i < 3; i++) s = dropPiece(s, 2, "dash");
  assert(columnHeight(s.grid, 2) === 3, "three dashes stacked do not connect");
  assert(s.boxes === 0, "no vertical dash chain");
}

{
  let s = startBotEvo(4);
  s = dropPiece(s, 0, "dash");
  s = dropPiece(s, 1, "dash");
  assert(s.boxes === 0, "two dashes do not morph at C3");
  s = dropPiece(s, 2, "dash");
  assert(s.boxes === 1, "three dashes in a row morph at C3");
  assert(countPieces(s.grid) === 0, "row morph clears the floor");
}

{
  for (const n of [3, 4, 5, 6] as const) {
    let s = startBotEvoAt(n, 40 + n);
    for (let i = 0; i < n - 1; i++) s = dropPiece(s, 1, "i");
    assert(s.boxes === 0, `${n - 1} I's do not morph at C${n}`);
    s = dropPiece(s, 1, "i");
    assert(s.boxes === 1, `${n} I's morph at C${n}`);
    assert(s.grid[0]!.length === n, `width stays ${n} after morph`);
  }
}

{
  for (const n of [3, 4, 5, 6] as const) {
    let s = startBotEvoAt(n, 50 + n);
    for (let c = 0; c < n - 1; c++) s = dropPiece(s, c, "dash");
    assert(s.boxes === 0, `${n - 1}-wide dash is short of C${n}`);
    s = dropPiece(s, n - 1, "dash");
    assert(s.boxes === 1, `${n}-wide dash morphs at C${n}`);
  }
}

{
  let s = startBotEvo(5);
  s = dropPiece(s, 0, "plus");
  s = dropPiece(s, 1, "plus");
  const live = liveChainCells(s.grid);
  assert(live.size === 2, "two adjacent pluses glow");
  assert(live.has(`${BOT_ROWS - 1},0`) && live.has(`${BOT_ROWS - 1},1`), "glow on the pair");
  assert(
    (socketJoins(s.grid, BOT_ROWS - 1, 0) & DIR_E) !== 0,
    "left plus joins east",
  );
  assert(
    (socketJoins(s.grid, BOT_ROWS - 1, 1) & DIR_W) !== 0,
    "right plus joins west",
  );
}

{
  let s = startBotEvo(6);
  s = dropPiece(s, 0, "plus");
  s = dropPiece(s, 0, "plus");
  s = dropPiece(s, 0, "i");
  assert(s.boxes === 1, "plus stack + I still morphs (NS sockets)");
  assert(columnHeight(s.grid, 0) === 0, "cascade cleared the column");
}

{
  let s = startBotEvo(7);
  s = dropPiece(s, 0, "plus");
  s = dropPiece(s, 0, "plus");
  s = dropPiece(s, 0, "dash");
  assert(columnHeight(s.grid, 0) === 3, "dash does not join a vertical plus chain");
  assert(s.boxes === 0, "no morph");
}

{
  let s = startBotEvo(8);
  for (let n = 0; n < 2; n++) {
    for (let i = 0; i < 3; i++) s = dropPiece(s, 0, "i");
  }
  s = dropPiece(s, 2, "dash");
  for (let i = 0; i < 3; i++) s = dropPiece(s, 0, "i");
  assert(s.boxes === 3, "three boxes fill C3 bar 1");
  assert(s.n === 3, "still Connect 3 after first bar");
  assert(s.level === 2, "promotion to L2");
  assert(s.segments === 0, "bar resets on promotion");
  assert(s.justRecycled.some((b) => b.piece === "dash"), "non-widen bar recycles leftover bots");
  assert(
    gravityMs(s.n, s.barsCompletedThisStage) === BASE_GRAVITY_MS,
    "C3 does not speed up after a bar",
  );
}

{
  let s = startBotEvo(9);
  for (let i = 0; i < BOT_ROWS - 1; i++) s = dropPiece(s, 2, "dash");
  assert(s.phase !== "lost", "seven dashes still leave a spawn row");
  s = dropPiece(s, 2, "dash");
  assert(columnHeight(s.grid, 2) === BOT_ROWS, "column topped");
  assert(s.phase === "lost", "overflow / top-out loses the drill");
}

{
  let s = startBotEvo(10);
  s = dropPiece(s, 2, "plus");
  const q = s.queue.slice();
  s = dropPiece(s, 2, "plus");
  assert(s.current === q[0], "next current comes from the queue");
  assert(s.queue.length === BOT_QUEUE, "queue stays length 6");
  assert(s.queue[5] !== undefined, "queue refilled");
}

{
  let s = startBotEvoAt(5, 20);
  const slot0 = s.queue[0]!;
  const bottom = BOT_ROWS - 1;
  // Stack a plus above col 1 so gravity is observable after recycle.
  s = {
    ...s,
    grid: s.grid.map((row) => row.slice()),
    queue: s.queue.slice(),
    bag: s.bag.slice(),
    recycleSharp: s.recycleSharp.slice(),
    justRecycled: [],
  };
  s.grid[bottom]![0] = "dash";
  s.grid[bottom]![1] = "i";
  s.grid[bottom]![2] = "plus";
  s.grid[bottom]![3] = "t-n";
  s.grid[bottom]![4] = "l-ne";
  s.grid[bottom - 1]![1] = "dash";
  const bagBefore = s.bag.length;
  const recycled = recycleBottomRow(s);
  assert(recycled.queue[0] === slot0, "recycle keeps slot 1 / queue[0]");
  assert(recycled.queue.length === BOT_QUEUE, "recycle queue stays length 6");
  assert(
    recycled.queue.slice(1, 6).join() === "dash,i,plus,t-n,l-ne",
    "recycled bots fill slots 2–6 L→R",
  );
  assert(
    recycled.grid[bottom]!.every((c) => c === null) ||
      recycled.grid[bottom]![1] === "dash",
    "bottom row cleared then gravity fills from above",
  );
  assert(recycled.grid[bottom]![1] === "dash", "column gravity after recycle");
  assert(recycled.grid[bottom - 1]![1] === null, "stack above dropped");
  assert(recycled.bag.length === bagBefore + 5, "bag received returned ids");
  for (const id of ["dash", "i", "plus", "t-n", "l-ne"] as PieceId[]) {
    assert(recycled.bag.includes(id), `bag includes returned ${id}`);
  }
  assert(recycled.justRecycled.length === 5, "justRecycled lists five bots");
  assert(recycled.recycleSharp[0] === false, "slot 1 not marked sharp");
  assert(
    recycled.recycleSharp.slice(1).every(Boolean),
    "recycled slots 2–6 start sharp",
  );
}

{
  let s = startBotEvo(21);
  const slot0 = s.queue[0]!;
  const priorTail = s.queue.slice(1);
  const bottom = BOT_ROWS - 1;
  s = {
    ...s,
    grid: s.grid.map((row) => row.slice()),
    queue: s.queue.slice(),
    bag: s.bag.slice(),
    recycleSharp: s.recycleSharp.slice(),
    justRecycled: [],
  };
  s.grid[bottom]![0] = "plus";
  s.grid[bottom]![2] = "dash";
  // col 1 empty on 3-wide — skip, no ghost bots
  const recycled = recycleBottomRow(s);
  assert(recycled.queue[0] === slot0, "partial recycle keeps slot 1");
  assert(recycled.queue[1] === "plus" && recycled.queue[2] === "dash", "L→R occupied only");
  assert(
    recycled.queue.slice(3).join() === priorTail.slice(0, 3).join(),
    "remaining slots 4–6 fill from prior queue tail (no holes)",
  );
  assert(recycled.justRecycled.length === 2, "empty bottom cells skipped");
  assert(recycled.recycleSharp[1] && recycled.recycleSharp[2], "recycled slots sharp");
  assert(!recycled.recycleSharp[3], "tail-filled slot not sharp");
}

{
  const sharp = [false, false, false, false, false, false];
  assert(queuePixelStrength(0, sharp) === null, "slot 1 never mosaic");
  assert(queuePixelStrength(1, sharp) === null, "slot 2 sharp in normal play");
  assert(queuePixelStrength(2, sharp) === null, "slot 3 sharp in normal play");
  assert(queuePixelStrength(3, sharp) === "light", "slot 4 light mosaic");
  assert(queuePixelStrength(4, sharp) === "medium", "slot 5 medium mosaic");
  assert(queuePixelStrength(5, sharp) === "heavy", "slot 6 heavy mosaic");
  assert(queueMosaicSpin(5, "heavy") === "cw", "slot 6 pixel grid clockwise");
  assert(queueMosaicSpin(4, "medium") === "ccw", "slot 5 pixel grid anticlockwise");
  assert(queueMosaicSpin(3, "light") === "cw", "slot 4 pixel grid clockwise");
  assert(queueMosaicSpin(0, null) === null, "no spin when sharp");
  const recycledSharp = [false, true, true, true, true, true];
  assert(queuePixelStrength(5, recycledSharp) === null, "recycled slot 6 stays sharp");
  assert(queuePixelStrength(3, recycledSharp) === null, "recycled slot 4 stays sharp");
}

{
  let s = startBotEvoAt(5, 20);
  const bottom = BOT_ROWS - 1;
  s = {
    ...s,
    grid: s.grid.map((row) => row.slice()),
    queue: s.queue.slice(),
    bag: s.bag.slice(),
    recycleSharp: s.recycleSharp.slice(),
    justRecycled: [],
  };
  s.grid[bottom]![0] = "dash";
  s.grid[bottom]![1] = "i";
  s.grid[bottom]![2] = "plus";
  s.grid[bottom]![3] = "t-n";
  s.grid[bottom]![4] = "l-ne";
  const recycled = recycleBottomRow(s);
  assert(
    recycled.recycleSharp.slice(1).every(Boolean),
    "recycle marks 2–6 sharp",
  );
  const after = dropPiece(recycled, 0);
  assert(after.recycleSharp[5] === false, "new bag draw at slot 6 is not sharp");
  assert(queuePixelStrength(5, after.recycleSharp) === "heavy", "slot 6 mosaic returns first");
  assert(after.recycleSharp[4] === true, "remaining recycle occupancy stays sharp");
  assert(queuePixelStrength(4, after.recycleSharp) === null, "slot 5 still recycle-sharp");
}

{
  let s = startBotEvo(8);
  for (let n = 0; n < 3; n++) {
    for (let i = 0; i < 3; i++) s = dropPiece(s, 0, "i");
  }
  assert(s.level === 2, "promotion still reaches L2");
  assert(s.n === 3, "first bar does not widen");
  assert(s.queue.length === BOT_QUEUE, "promoted game keeps 6-slot queue");
  assert(s.recycleSharp.length === BOT_QUEUE, "promoted recycleSharp length 6");
}

{
  let s = startBotEvo(80);
  for (let box = 0; box < 7; box++) {
    for (let i = 0; i < 3; i++) s = dropPiece(s, 0, "i");
  }
  assert(s.boxes === 7, "C3 two bars are 3+4 boxes");
  assert(s.n === 4 && s.grid[0]!.length === 4, "second bar rebuilds 4×8");
  assert(countPieces(s.grid) === 0, "widen rebuilds empty");
  assert(s.justRecycled.length === 0, "skip recycle on the bar that rebuilds");
  assert(s.barsCompletedThisStage === 0, "stage change resets bar count");
  assert(quotaForState(s) === 4, "C4 first bar is 4");
  assert(s.level === 3, "career level kept across widen");
  assert(
    gravityMs(s.n, s.barsCompletedThisStage) === BASE_GRAVITY_MS,
    "C4 still at baseline gravity",
  );
}

{
  let s = startBotEvo(81);
  while (s.n < 6 && s.phase !== "lost" && s.boxes < 40) {
    const need = s.n;
    for (let i = 0; i < need; i++) s = dropPiece(s, 0, "i");
  }
  assert(s.n === 6 && s.grid[0]!.length === 6, "reaches Connect 6");
  assert(s.boxes === BOXES_TO_CONNECT_6, "27 boxes to first C6");
  assert(
    gravityMs(s.n, s.barsCompletedThisStage) === BASE_GRAVITY_MS,
    "arrive at C6 still at baseline speed",
  );
  const levelAtC6 = s.level;
  for (let box = 0; box < 5; box++) {
    for (let i = 0; i < 6; i++) s = dropPiece(s, 0, "i");
  }
  s = dropPiece(s, 5, "dash");
  for (let i = 0; i < 6; i++) s = dropPiece(s, 0, "i");
  assert(s.n === 6, "C6 stays 6×8 after a bar");
  assert(s.level === levelAtC6 + 1, "C6 bar still promotes gravity");
  assert(
    gravityMs(s.n, s.barsCompletedThisStage) < BASE_GRAVITY_MS,
    "C6 speeds up only after a 6×8 bar",
  );
  assert(s.justRecycled.some((b) => b.piece === "dash"), "C6 bar recycles (does not widen)");
}

{
  const s0 = startBotEvo(11);
  assert(s0.phase === "falling" && s0.fallRow === 0, "open starts a fall");
  const ticked = tick(s0);
  assert(ticked.phase === "falling" && ticked.fallRow === 1, "gravity steps one row");
}

{
  const s = startBotEvo(14);
  const drawn = new Set<PieceId>([s.current, ...s.queue, ...s.bag]);
  assert(drawn.size === PIECE_IDS.length, "one bag is all 11 bots");
}

{
  const s0 = startBotEvo(16);
  const ghost = landingPreview(s0);
  assert(ghost !== null && ghost.row === BOT_ROWS - 1, "ghost sits on the floor");
  assert(!ghost!.live && !ghost!.morph, "empty floor is not a chain");
}

{
  let s = startBotEvo(17);
  s = dropPiece(s, 1, "plus");
  s = aimColumn(s, 1);
  // Force a plus so the ghost will join the stack.
  const falling: BotState = { ...s, current: "plus" };
  const ghost = landingPreview(falling);
  assert(ghost && ghost.live, "ghost plus on a plus stack glows");
}

{
  let s = startBotEvo(18);
  for (let i = 0; i < 7; i++) s = dropPiece(s, 2, "dash");
  assert(s.phase === "falling" && s.fallRow === 0, "spawn on a 7-high dash stack");
  s = { ...s, current: "dash", aimCol: 2, lockTicks: 0 };
  const once = tick(s);
  assert(once.phase === "falling" && once.fallRow === 0, "floor grace: first tick does not lock");
  assert(once.lockTicks === LOCK_GRACE_TICKS, "grace tick counted");
  const twice = tick(once);
  assert(twice.grid[0]![2] === "dash" || twice.phase === "lost", "second tick locks");
}

{
  const groups = connectedComponents(
    startBotEvo(12).grid,
  );
  assert(groups.length === 0, "empty grid has no components");
}

{
  let s: BotState = startBotEvo(13);
  s = dropPiece(s, 0, "dash");
  s = dropPiece(s, 1, "dash");
  assert(s.boxes === 0, "two-wide dash is short of 3");
  s = dropPiece(s, 2, "i");
  assert(s.boxes === 0, "I does not complete a horizontal dash");
  assert(countPieces(s.grid) === 3, "all three pieces remain");
}

{
  assert(liveDirs("plus").length === 4, "plus has 4 live look dirs");
  assert(blankDirs("plus").length === 0, "plus has no blank sides");
  assert(availableLookKinds("plus").join() === "live", "plus only looks at live");
  assert(pickLookDir("plus", "blank") === null, "plus cannot look at blank");
  const plusLive = pickLookDir("plus", "live", () => 0);
  assert(plusLive !== null && plusLive.mouth === "smile", "live look smiles");
  assert(
    plusLive !== null && (PIECE_SOCKETS.plus & plusLive.dir) !== 0,
    "live look dir is a plus socket",
  );

  assert(liveDirs("i").join() === `${DIR_N},${DIR_S}`, "I live is N+S");
  assert(blankDirs("i").join() === `${DIR_E},${DIR_W}`, "I blank is E+W");
  const iBlank = pickLookDir("i", "blank", () => 0);
  assert(iBlank !== null && iBlank.mouth === "hope", "blank look is hopeful");
  assert(iBlank !== null && iBlank.name === "e", "rng 0 picks first blank (E)");
  assert(
    iBlank !== null && (PIECE_SOCKETS.i & iBlank.dir) === 0,
    "blank look dir is not an I socket",
  );

  const dashLive = pickLookDir("dash", "live", () => 0.99);
  assert(
    dashLive !== null && (dashLive.name === "e" || dashLive.name === "w"),
    "dash live look is E or W only",
  );
  assert(pickLookDir("dash", "blank", () => 0)?.name === "n", "dash blank can be N");
}

{
  const face = botFaceSvg(SHELL_FILL.four, { look: "c", mouth: "smile", blink: false }, "plus-test");
  assert(face.includes("radialGradient"), "face has eye-well gradient");
  assert(face.includes("eyeWell-"), "face gradient id is unique-prefixed");
  assert(face.includes(`rx="${LOCKED_FACE.eyeSize}"`), "glasses use locked eye size");
  assert(face.includes("botevo-pupil"), "face has pupils");
  assert(face.includes("botevo-mouth"), "face has mouth");
  const blink = botFaceSvg(SHELL_FILL.four, { look: "c", mouth: "smile", blink: true }, "plus-blink");
  assert(blink.includes("botevo-lid"), "blink paints lids");
  const look = botFaceSvg(SHELL_FILL.straight, { look: "e", mouth: "hope", blink: false }, "i-look");
  assert(look.includes("botevo-mouth"), "hope mouth present");
}


{
  assert(BOTEVO_TITLE === "Bot Evolution", "product title is Bot Evolution");
  assert(BOTEVO_SAVE_ARIA === "Boxes to next stage", "progress aria is boxes, not battery or save");
  assert(connectLabel(3) === "Connect 3", "HUD is Connect 3, not C3");
  assert(connectLabel(6) === "Connect 6", "HUD is Connect 6");
  assert(!connectLabel(3).includes("C3"), "no cryptic C3");
  const t3 = stageTeach(3, false);
  assert(t3.action === "Begin", "first bay Begin");
  assert(t3.title.includes("three"), "Connect 3 teaches three");
  assert(t3.bodyHtml.includes("three"), "Connect 3 body names three");
  assert(t3.bodyHtml.includes("become a box"), "Connect 3 says they become a box");
  const banned = /blast|battery|cruise|C3|morph|save/i;
  assert(!banned.test(t3.title + t3.bodyHtml), "Connect 3 has no insider contrast");
  const t4 = stageTeach(4, true);
  assert(t4.action === "Continue", "later bay Continue");
  assert(t4.title.toLowerCase().includes("four"), "Connect 4 teaches four");
  assert(!banned.test(t4.title + t4.bodyHtml), "Connect 4 has no insider contrast");
  const t6 = stageTeach(6, true);
  assert(t6.title.toLowerCase().includes("six"), "Connect 6 teaches six");
  const h3 = playHint(3);
  assert(h3.includes("Link 3"), "in-play hint uses 3");
  assert(!h3.includes("chain of 5"), "no leftover chain of 5 on Connect 3");
  assert(!banned.test(h3), "hint has no insider contrast");
  const h5 = playHint(5);
  assert(h5.includes("Link 5"), "in-play hint updates at 5");
}

if (failed) {
  throw new Error(`${failed} botEvolution assertion(s) failed`);
}
console.log("\nbotEvolution tests passed");
