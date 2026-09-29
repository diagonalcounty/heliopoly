/**
 * Hull panel sliding tiles (#293).
 * Run: npx tsx src/lab/slidingTiles.test.ts
 */
import {
  EMPTY,
  SOLVED_TILES,
  continueTiles,
  inversionCount,
  isAdjacentToEmpty,
  isSolvable,
  isSolved,
  nextLevel,
  scrambleTiles,
  slideTile,
  solvedBoard,
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

function playing(board: number[], n = 3, round = 1): TileState {
  return { n, round, board, moves: 0, phase: "playing" };
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
  for (const n of [3, 4, 5, 6, 7]) {
    const solved = solvedBoard(n);
    assert(isSolved(solved), `solved ${n}×${n} is solved`);
    assert(isSolvable(solved), `solved ${n}×${n} is solvable`);
    const swapped = solved.slice();
    swapped[0] = solved[1]!;
    swapped[1] = solved[0]!;
    assert(!isSolvable(swapped), `swapped first two of ${n}×${n} is not solvable`);
    if (n === 3) {
      assert(swapped.join(",") === "2,1,3,4,5,6,7,8,0", "3×3 swap is 2,1,3,…,0");
    }
  }
}

{
  for (const n of [3, 4, 5, 6, 7]) {
    for (const seed of [1, 2, 3, 4, 5]) {
      const board = scrambleTiles(seed, n);
      assert(isSolvable(board), `N=${n} seed ${seed} is solvable`);
      assert(!isSolved(board), `N=${n} seed ${seed} is not solved`);
      assert(board.length === n * n, `N=${n} seed ${seed} has ${n * n} cells`);
      assert(board.filter((cell) => cell === EMPTY).length === 1, `N=${n} seed ${seed} has one gap`);
    }
  }
  const a = scrambleTiles(1, 3);
  const b = scrambleTiles(2, 3);
  assert(a.join(",") !== b.join(","), "seed 1 and seed 2 differ at N=3");
  assert(scrambleTiles(1, 3).join(",") === a.join(","), "same seed returns the same board");
}

{
  for (const seed of [1, 78, 188, 2026]) {
    const board = scrambleTiles(seed);
    assert(isSolvable(board), `scramble seed ${seed} is solvable`);
    assert(!isSolved(board), `scramble seed ${seed} is not identity`);
    assert(board.filter((cell) => cell === EMPTY).length === 1, `scramble ${seed} has one gap`);
    const nums = board.filter((cell) => cell !== EMPTY).sort((x, y) => x - y);
    assert(nums.join(",") === "1,2,3,4,5,6,7,8", `scramble ${seed} is 1–8`);
  }
}

{
  const a = scrambleTiles(78);
  const b = scrambleTiles(78);
  assert(a.join(",") === b.join(","), "same seed yields the same scramble");
}

{
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
  assert(s.n === 3 && s.round === 1, "start is level 3.1");
  assert(isSolvable(s.board), "startTiles only deals solvable boards");
}

{
  const step = nextLevel(3, 1);
  assert(step?.n === 3 && step.round === 2, "nextLevel(3, 1) is 3.2");
  const up = nextLevel(3, 3);
  assert(up?.n === 4 && up.round === 1, "nextLevel(3, 3) is 4.1");
  const seven = nextLevel(6, 6);
  assert(seven?.n === 7 && seven.round === 1, "nextLevel(6, 6) is 7.1");
  assert(nextLevel(7, 49) === null, "nextLevel(7, 49) ends the run");
}

{
  const won = slideTile(playing([1, 2, 3, 4, 5, 6, 7, 0, 8], 3, 1), 8);
  assert(won.phase === "won", "fixture reaches won");
  const next = continueTiles(won, 4);
  assert(next.n === 3 && next.round === 2, "Next stays on 3 and advances the round");
  assert(next.moves === 0 && next.phase === "playing", "Next resets the move count");
  assert(isSolvable(next.board) && !isSolved(next.board), "Next deals a fresh scramble");
  const last = playing(solvedBoard(7), 7, 49);
  last.phase = "won";
  const stuck = continueTiles(last, 9);
  assert(stuck.n === 7 && stuck.round === 49, "7.49 does not advance");
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nslidingTiles tests passed");
