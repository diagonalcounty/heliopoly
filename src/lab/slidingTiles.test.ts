/**
 * Hull-panel 8-puzzle (#78).
 * Run: npx tsx src/lab/slidingTiles.test.ts
 */
import {
  EMPTY,
  SOLVED_TILES,
  inversionCount,
  isAdjacentToEmpty,
  isSolvable,
  isSolved,
  scrambleTiles,
  slideTile,
  startTiles,
  type TileState,
} from "./slidingTiles";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

function playing(board: number[]): TileState {
  return { board, moves: 0, phase: "playing" };
}

{
  assert(SOLVED_TILES.length === 9, "3×3 has nine cells");
  assert(isSolved([...SOLVED_TILES]), "goal is 1–8 then empty");
  assert(isSolvable(SOLVED_TILES), "solved permutation is even / solvable");
  assert(inversionCount(SOLVED_TILES) === 0, "solved has zero inversions");
}

{
  const odd = [1, 2, 3, 4, 5, 6, 8, 7, 0];
  assert(inversionCount(odd) === 1, "7↔8 is one inversion");
  assert(!isSolvable(odd), "odd permutation is not a legal scramble");
}

{
  const even = [2, 1, 3, 4, 5, 6, 8, 7, 0];
  assert(inversionCount(even) === 2, "two swaps is even");
  assert(isSolvable(even), "even permutation is solvable");
  assert(!isSolved(even), "even scramble is not already won");
}

{
  for (const seed of [1, 78, 188, 2026]) {
    const board = scrambleTiles(seed);
    assert(isSolvable(board), `scramble seed ${seed} is solvable`);
    assert(!isSolved(board), `scramble seed ${seed} is not identity`);
    assert(board.filter((n) => n === EMPTY).length === 1, `scramble ${seed} has one gap`);
    const nums = board.filter((n) => n !== EMPTY).sort((a, b) => a - b);
    assert(nums.join(",") === "1,2,3,4,5,6,7,8", `scramble ${seed} is 1–8`);
  }
}

{
  const a = scrambleTiles(78);
  const b = scrambleTiles(78);
  assert(a.join(",") === b.join(","), "same seed yields the same scramble");
}

{
  // Empty at bottom-right; 8 is left of it.
  const s0 = playing([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  assert(isAdjacentToEmpty(s0.board, 7), "8 is adjacent to the gap");
  assert(!isAdjacentToEmpty(s0.board, 0), "1 is not adjacent to the gap");
  const noop = slideTile(s0, 0);
  assert(noop.moves === 0, "non-adjacent tap does not move");
  assert(noop.board.join(",") === s0.board.join(","), "non-adjacent tap leaves the board");
  const s1 = slideTile(s0, 7);
  assert(s1.moves === 1, "adjacent slide increments the move counter");
  assert(s1.board.join(",") === "1,2,3,4,5,6,7,0,8", "8 slides into the gap");
  assert(s1.phase === "playing", "one slide off solved is not a win");
  const s2 = slideTile(s1, 8);
  assert(s2.phase === "won", "sliding 8 back wins exact order");
  assert(isSolved(s2.board), "won board is 1–8 + empty");
  const frozen = slideTile(s2, 7);
  assert(frozen.board.join(",") === s2.board.join(","), "won board ignores further taps");
}

{
  const s = startTiles(78);
  assert(s.phase === "playing", "start is playing");
  assert(s.moves === 0, "start move counter is zero");
  assert(isSolvable(s.board), "startTiles only deals solvable boards");
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nslidingTiles tests passed");
