/**
 * Lab drill: hull-panel 8-puzzle (#78).
 * 3×3 sliding tiles 1–8 + empty; solvable scrambles only. No src/core.
 */
export const TILE_N = 3;
export const TILE_CELLS = TILE_N * TILE_N;
export const EMPTY = 0;
export const SOLVED_TILES: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 0];

export type TilePhase = "playing" | "won";

export interface TileState {
  board: number[];
  moves: number;
  phase: TilePhase;
}

export function indexOf(r: number, c: number): number {
  return r * TILE_N + c;
}

export function rowOf(i: number): number {
  return Math.floor(i / TILE_N);
}

export function colOf(i: number): number {
  return i % TILE_N;
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

/** 8-puzzle (odd width): even inversion count is solvable. */
export function isSolvable(board: readonly number[]): boolean {
  return board.length === TILE_CELLS && inversionCount(board) % 2 === 0;
}

export function isSolved(board: readonly number[]): boolean {
  if (board.length !== TILE_CELLS) return false;
  for (let i = 0; i < TILE_CELLS; i++) {
    if (board[i] !== SOLVED_TILES[i]) return false;
  }
  return true;
}

export function emptyIndex(board: readonly number[]): number {
  return board.indexOf(EMPTY);
}

export function isAdjacentToEmpty(board: readonly number[], tileIndex: number): boolean {
  const e = emptyIndex(board);
  if (e < 0 || tileIndex < 0 || tileIndex >= TILE_CELLS || tileIndex === e) return false;
  const dr = Math.abs(rowOf(tileIndex) - rowOf(e));
  const dc = Math.abs(colOf(tileIndex) - colOf(e));
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

function shuffle(board: number[], rng: () => number): void {
  for (let i = board.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = board[i];
    board[i] = board[j];
    board[j] = tmp;
  }
}

export function scrambleTiles(seed: number): number[] {
  const rng = mulberry32(seed);
  const board = SOLVED_TILES.slice();
  for (let attempt = 0; attempt < 64; attempt++) {
    shuffle(board, rng);
    if (isSolvable(board) && !isSolved(board)) return board.slice();
  }
  // Last-resort even permutation that is not identity: swap 1 and 2, then 2 and 3? 
  // 1↔2 is one inversion (odd, unsolvable). Swap 7↔8 as well → two inversions.
  return [2, 1, 3, 4, 5, 6, 8, 7, 0];
}

export function startTiles(seed?: number): TileState {
  const s = seed ?? (Date.now() ^ 0x1578) >>> 0;
  return {
    board: scrambleTiles(s),
    moves: 0,
    phase: "playing",
  };
}

export function slideTile(state: TileState, tileIndex: number): TileState {
  if (state.phase !== "playing") return state;
  if (!isAdjacentToEmpty(state.board, tileIndex)) return state;
  const board = state.board.slice();
  const e = emptyIndex(board);
  board[e] = board[tileIndex];
  board[tileIndex] = EMPTY;
  const next: TileState = {
    board,
    moves: state.moves + 1,
    phase: "playing",
  };
  if (isSolved(board)) next.phase = "won";
  return next;
}

export function playAgainTiles(seed?: number): TileState {
  return startTiles(seed);
}
