/**
 * Bot Evolution engine (#203 / #204 / #205).
 * Run: npx tsx src/lab/botEvolution.test.ts
 */
import {
  BASE_GRAVITY_MS,
  BASE_QUOTA,
  BOT_COLS,
  BOT_QUEUE,
  BOT_ROWS,
  DIR_E,
  DIR_N,
  DIR_S,
  DIR_W,
  MIN_GRAVITY_MS,
  MORPH_SIZE,
  PIECE_IDS,
  PIECE_SOCKETS,
  SPEED_MUL,
  aimColumn,
  connectedComponents,
  dropPiece,
  gravityMs,
  hasSocket,
  liveChainCells,
  landingPreview,
  LOCK_GRACE_TICKS,
  quotaForLevel,
  pieceArt,
  queuePixelStrength,
  recycleBottomRow,
  SHELL_FILL,
  connectorKind,
  eggTokenSvg,
  socketCount,
  socketJoins,
  socketsMeet,
  startBotEvo,
  tick,
  type BotGrid,
  type BotState,
  type PieceId,
} from "./botEvolution";
import {
  availableLookKinds,
  blankDirs,
  liveDirs,
  pickLookDir,
} from "./botevoFaces";

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

assert(BOT_COLS === 5 && BOT_ROWS === 8, "playfield is 5×8");
assert(BOT_QUEUE === 6, "preview queue is 6");
assert(MORPH_SIZE === 5, "morph at 5");
assert(quotaForLevel(1) === 5, "L1 quota is 5");
assert(quotaForLevel(2) === 6, "L2 quota is 6");
assert(quotaForLevel(3) === 7, "L3 quota is 7");
assert(gravityMs(1) === BASE_GRAVITY_MS, "L1 gravity is baseline");
assert(
  gravityMs(2) === Math.round(BASE_GRAVITY_MS / SPEED_MUL),
  "L2 gravity is L1 / 1.10",
);
assert(
  gravityMs(3) === Math.round(BASE_GRAVITY_MS / SPEED_MUL ** 2),
  "L3 gravity is L1 / 1.10^2",
);
assert(gravityMs(99) === MIN_GRAVITY_MS, "gravity floor");

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
  assert(a.grid.length === BOT_ROWS && a.grid[0]!.length === BOT_COLS, "grid shape");
  assert(a.level === 1 && a.segments === 0 && a.boxes === 0, "L1 empty bar");
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
  for (let i = 0; i < 4; i++) s = dropPiece(s, 1, "i");
  assert(columnHeight(s.grid, 1) === 4, "four I's do not morph");
  assert(s.boxes === 0, "no box yet");
  s = dropPiece(s, 1, "i");
  assert(s.boxes === 1, "fifth I morphs one box");
  assert(columnHeight(s.grid, 1) === 0, "morphed I's are removed");
  assert(s.segments === 1, "bar gained one segment");
  assert(s.justMorphed.length >= 5, "morph flash records the chain");
  assert(s.phase === "falling", "next egg falls while the morph flies up");
}

{
  let s = startBotEvo(3);
  for (let i = 0; i < 5; i++) s = dropPiece(s, 2, "dash");
  assert(columnHeight(s.grid, 2) === 5, "five dashes stacked do not connect");
  assert(s.boxes === 0, "no vertical dash chain");
}

{
  let s = startBotEvo(4);
  for (let c = 0; c < 5; c++) s = dropPiece(s, c, "dash");
  assert(s.boxes === 1, "five dashes in a row morph");
  assert(countPieces(s.grid) === 0, "row morph clears the floor");
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
  for (let i = 0; i < 4; i++) s = dropPiece(s, 0, "plus");
  s = dropPiece(s, 0, "i");
  assert(s.boxes === 1, "plus stack + I still morphs (NS sockets)");
  assert(columnHeight(s.grid, 0) === 0, "cascade cleared the column");
}

{
  let s = startBotEvo(7);
  for (let i = 0; i < 3; i++) s = dropPiece(s, 4, "plus");
  s = dropPiece(s, 4, "dash");
  assert(columnHeight(s.grid, 4) === 4, "dash does not join a vertical plus chain");
  assert(s.boxes === 0, "no morph");
}

{
  let s = startBotEvo(8);
  for (let n = 0; n < BASE_QUOTA; n++) {
    for (let i = 0; i < 5; i++) s = dropPiece(s, 0, "i");
  }
  assert(s.boxes === BASE_QUOTA, "five boxes in L1");
  assert(s.level === 2, "promotion to L2");
  assert(s.segments === 0, "bar resets on promotion");
  assert(gravityMs(s.level) < gravityMs(1), "L2 is faster");
}

{
  let s = startBotEvo(9);
  for (let i = 0; i < BOT_ROWS - 1; i++) s = dropPiece(s, 3, "dash");
  assert(s.phase !== "lost", "seven dashes still leave a spawn row");
  s = dropPiece(s, 3, "dash");
  assert(columnHeight(s.grid, 3) === BOT_ROWS, "column topped");
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
  let s = startBotEvo(20);
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
  // cols 1,3,4 empty — skip, no ghost bots
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
  let s = startBotEvo(8);
  for (let n = 0; n < BASE_QUOTA; n++) {
    for (let i = 0; i < 5; i++) s = dropPiece(s, 0, "i");
  }
  assert(s.level === 2, "promotion still reaches L2");
  // After the promoting morph, bottom row was recycled (column may be empty).
  assert(s.queue.length === BOT_QUEUE, "promoted game keeps 6-slot queue");
  assert(s.recycleSharp.length === BOT_QUEUE, "promoted recycleSharp length 6");
}

{
  const none = [false, false, false, false, false, false];
  assert(queuePixelStrength(0, none) === null, "slot 1 always sharp");
  assert(queuePixelStrength(1, none) === null, "slot 2 sharp by default");
  assert(queuePixelStrength(2, none) === null, "slot 3 sharp by default");
  assert(queuePixelStrength(3, none) === "light", "slot 4 light");
  assert(queuePixelStrength(4, none) === "medium", "slot 5 medium");
  assert(queuePixelStrength(5, none) === "heavy", "slot 6 heavy");

  const recycled = [false, true, true, true, true, true];
  assert(queuePixelStrength(0, recycled) === null, "slot 1 stays sharp on recycle");
  assert(queuePixelStrength(1, recycled) === null, "recycled slot 2 sharp");
  assert(queuePixelStrength(5, recycled) === null, "recycled slot 6 sharp");

  // New bag bot enters slot 6 while older recycle occupants remain sharp above.
  const fading = [false, true, true, true, true, false];
  assert(queuePixelStrength(5, fading) === "heavy", "new slot 6 is heavy");
  assert(queuePixelStrength(4, fading) === null, "still-recycled slot 5 sharp");
  assert(queuePixelStrength(3, fading) === null, "still-recycled slot 4 sharp");
}

{
  let s = startBotEvo(22);
  const bottom = BOT_ROWS - 1;
  s = {
    ...s,
    grid: s.grid.map((row) => row.slice()),
    queue: s.queue.slice(),
    bag: s.bag.slice(),
    recycleSharp: s.recycleSharp.slice(),
    justRecycled: [],
  };
  for (let c = 0; c < BOT_COLS; c++) s.grid[bottom]![c] = "dash";
  s = recycleBottomRow(s);
  assert(
    s.recycleSharp.slice(1).every(Boolean),
    "full recycle marks 2–6 sharp",
  );
  assert(queuePixelStrength(3, s.recycleSharp) === null, "recycle beat slot 4 sharp");
  assert(queuePixelStrength(5, s.recycleSharp) === null, "recycle beat slot 6 sharp");

  // Each spawn shifts sharp flags; new bag piece at the end is not sharp.
  s = dropPiece(s, 0, "plus");
  assert(s.recycleSharp[5] === false, "new bag bot in slot 6 not sharp");
  assert(queuePixelStrength(5, s.recycleSharp) === "heavy", "post-recycle slot 6 heavy");
  assert(s.recycleSharp[4] === true, "prior recycle occupant still sharp in slot 5");
  assert(queuePixelStrength(4, s.recycleSharp) === null, "slot 5 still sharp");

  s = dropPiece(s, 1, "plus");
  assert(s.recycleSharp[4] === false, "next new bot lands in slot 5");
  assert(queuePixelStrength(4, s.recycleSharp) === "medium", "slot 5 medium after refill");
  assert(queuePixelStrength(3, s.recycleSharp) === null, "slot 4 still recycled-sharp");

  s = dropPiece(s, 2, "plus");
  assert(s.recycleSharp[3] === false, "third new bot lands in slot 4");
  assert(queuePixelStrength(3, s.recycleSharp) === "light", "slot 4 light after refill");
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
  for (let i = 0; i < 7; i++) s = dropPiece(s, 4, "dash");
  assert(s.phase === "falling" && s.fallRow === 0, "spawn on a 7-high dash stack");
  s = { ...s, current: "dash", aimCol: 4, lockTicks: 0 };
  const once = tick(s);
  assert(once.phase === "falling" && once.fallRow === 0, "floor grace: first tick does not lock");
  assert(once.lockTicks === LOCK_GRACE_TICKS, "grace tick counted");
  const twice = tick(once);
  assert(twice.grid[0]![4] === "dash" || twice.phase === "lost", "second tick locks");
}

{
  const groups = connectedComponents(
    startBotEvo(12).grid,
  );
  assert(groups.length === 0, "empty grid has no components");
}

{
  let s: BotState = startBotEvo(13);
  for (let c = 0; c < 4; c++) s = dropPiece(s, c, "dash");
  assert(s.boxes === 0, "four-wide dash is short of 5");
  s = dropPiece(s, 4, "i");
  assert(s.boxes === 0, "I does not complete a horizontal dash");
  assert(countPieces(s.grid) === 5, "all five pieces remain");
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

if (failed) {
  throw new Error(`${failed} botEvolution assertion(s) failed`);
}
console.log("\nbotEvolution tests passed");
