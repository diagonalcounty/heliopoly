/**
 * Hull panel sliding tiles (#293).
 * One run: 3×3 through 7×7. Legal-slide scrambles only. No src/core.
 */
export const EMPTY = 0;

/** Solved 3×3, kept for the original plate checks. */
export const SOLVED_TILES: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 0];

export const ROUNDS: Record<number, number> = { 3: 3, 4: 4, 5: 5, 6: 6, 7: 49 };

export type TilePhase = "playing" | "won";

export interface TileState {
  n: number;
  round: number;
  board: number[];
  moves: number;
  phase: TilePhase;
}

export function nextLevel(n: number, round: number): { n: number; round: number } | null {
  if (round < ROUNDS[n]) return { n, round: round + 1 };
  if (n < 7) return { n: n + 1, round: 1 };
  return null;
}

export function boardSize(board: readonly number[]): number {
  return Math.round(Math.sqrt(board.length));
}

export function solvedBoard(n: number): number[] {
  const cells = n * n;
  const board: number[] = [];
  for (let i = 1; i < cells; i++) board.push(i);
  board.push(EMPTY);
  return board;
}

export function rowOf(i: number, n: number): number {
  return Math.floor(i / n);
}

export function colOf(i: number, n: number): number {
  return i % n;
}

export function inversionCount(board: readonly number[]): number {
  const tiles = board.filter((n) => n !== EMPTY);
  let inv = 0;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) inv++;
    }
  }
  return inv;
}

/** Gap row counting from the bottom. The bottom row is 1. */
export function gapRowFromBottom(board: readonly number[]): number {
  const n = boardSize(board);
  const empty = board.indexOf(EMPTY);
  const rowFromTop = Math.floor(empty / n);
  return n - rowFromTop;
}

/**
 * Odd N: even inversion count.
 * Even N: odd gap-row-from-bottom wants an even count; even row wants an odd count.
 */
export function isSolvable(board: readonly number[]): boolean {
  const n = boardSize(board);
  if (n < 2 || n * n !== board.length) return false;
  const inv = inversionCount(board);
  if (n % 2 === 1) return inv % 2 === 0;
  const row = gapRowFromBottom(board);
  if (row % 2 === 1) return inv % 2 === 0;
  return inv % 2 === 1;
}

export function isSolved(board: readonly number[]): boolean {
  const n = boardSize(board);
  if (n * n !== board.length) return false;
  const goal = solvedBoard(n);
  for (let i = 0; i < goal.length; i++) {
    if (board[i] !== goal[i]) return false;
  }
  return true;
}

export function emptyIndex(board: readonly number[]): number {
  return board.indexOf(EMPTY);
}

export function isAdjacentToEmpty(board: readonly number[], tileIndex: number): boolean {
  const n = boardSize(board);
  const cells = n * n;
  const e = emptyIndex(board);
  if (e < 0 || tileIndex < 0 || tileIndex >= cells || tileIndex === e) return false;
  const dr = Math.abs(rowOf(tileIndex, n) - rowOf(e, n));
  const dc = Math.abs(colOf(tileIndex, n) - colOf(e, n));
  return dr + dc === 1;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function neighborIndices(board: readonly number[], n: number): number[] {
  const e = emptyIndex(board);
  const r = rowOf(e, n);
  const c = colOf(e, n);
  const out: number[] = [];
  if (r > 0) out.push(e - n);
  if (r < n - 1) out.push(e + n);
  if (c > 0) out.push(e - 1);
  if (c < n - 1) out.push(e + 1);
  return out;
}

function applySlide(board: number[], tileIndex: number): void {
  const e = emptyIndex(board);
  board[e] = board[tileIndex];
  board[tileIndex] = EMPTY;
}

/** 40–80 legal slides from solved. One extra slide if that lands on solved. */
export function scrambleTiles(seed: number, n = 3): number[] {
  const rng = mulberry32(seed);
  const board = solvedBoard(n);
  const steps = 40 + Math.floor(rng() * 41);
  for (let i = 0; i < steps; i++) {
    const choices = neighborIndices(board, n);
    const pick = choices[Math.floor(rng() * choices.length)]!;
    applySlide(board, pick);
  }
  if (isSolved(board)) {
    const choices = neighborIndices(board, n);
    const pick = choices[Math.floor(rng() * choices.length)]!;
    applySlide(board, pick);
  }
  return board;
}

export function startTiles(seed?: number): TileState {
  const s = seed ?? (Date.now() >>> 0);
  return {
    n: 3,
    round: 1,
    board: scrambleTiles(s, 3),
    moves: 0,
    phase: "playing",
  };
}

export function slideTile(state: TileState, tileIndex: number): TileState {
  if (state.phase !== "playing") return state;
  if (!isAdjacentToEmpty(state.board, tileIndex)) return state;
  const board = state.board.slice();
  applySlide(board, tileIndex);
  const next: TileState = {
    n: state.n,
    round: state.round,
    board,
    moves: state.moves + 1,
    phase: "playing",
  };
  if (isSolved(board)) next.phase = "won";
  return next;
}

/** Next puzzle in the run. A finished 7.49 stays put. */
export function continueTiles(state: TileState, seed?: number): TileState {
  const upcoming = nextLevel(state.n, state.round);
  if (!upcoming) return state;
  const s = seed ?? (Date.now() >>> 0);
  return {
    n: upcoming.n,
    round: upcoming.round,
    board: scrambleTiles(s, upcoming.n),
    moves: 0,
    phase: "playing",
  };
}

export function playAgainTiles(seed?: number): TileState {
  return startTiles(seed);
}

export function levelLabel(state: Pick<TileState, "n" | "round">): string {
  return `Level ${state.n}.${state.round}`;
}

export function tilesHint(n: number): string {
  return `Tap a piece next to the empty spot. Put 1 through ${n * n - 1} in order. The empty spot ends in the corner.`;
}

export function tilesEndLine(n: number, round: number): string {
  return `You finished level ${n}.${round}.`;
}

export const TILES_END_LINE = tilesEndLine(7, 49);
