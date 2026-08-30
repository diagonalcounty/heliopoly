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
  connectedComponents,
  dropPiece,
  gravityMs,
  hasSocket,
  liveChainCells,
  quotaForLevel,
  socketsMeet,
  startBotEvo,
  tick,
  type BotGrid,
  type BotState,
  type PieceId,
} from "./botEvolution";

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
assert(BOT_QUEUE === 3, "preview queue is 3");
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
  assert(a.queue.length === BOT_QUEUE, "queue length 3");
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
  assert(s.queue.length === BOT_QUEUE, "queue stays length 3");
  assert(s.queue[2] !== undefined, "queue refilled");
}

{
  const s0 = startBotEvo(11);
  assert(s0.phase === "falling" && s0.fallRow === 0, "open starts a fall");
  const ticked = tick(s0);
  assert(ticked.phase === "falling" && ticked.fallRow === 1, "gravity steps one row");
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

if (failed) {
  throw new Error(`${failed} botEvolution assertion(s) failed`);
}
console.log("\nbotEvolution tests passed");
