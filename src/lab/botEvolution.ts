/**
 * Lab drill: Bot Evolution (#203 / #204 / #205).
 * 5×8 egg-socket matching. Untimed. No Mainline / src/core.
 *
 * Grammar: every piece is a centered plus with unused arms erased.
 * Connection uses socket flags, not sprite shape. No rotation in v1 —
 * orientation is baked into the piece id.
 */

export const BOT_COLS = 5;
export const BOT_ROWS = 8;
export const BOT_QUEUE = 3;
export const BASE_QUOTA = 5;
export const SPEED_MUL = 1.1;
export const BASE_GRAVITY_MS = 700;
export const MIN_GRAVITY_MS = 80;
export const MORPH_SIZE = 5;

export const DIR_N = 1;
export const DIR_E = 2;
export const DIR_S = 4;
export const DIR_W = 8;

export type PieceId =
  | "plus"
  | "i"
  | "dash"
  | "l-ne"
  | "l-es"
  | "l-sw"
  | "l-wn"
  | "t-n"
  | "t-e"
  | "t-s"
  | "t-w";

export const PIECE_SOCKETS: Record<PieceId, number> = {
  plus: DIR_N | DIR_E | DIR_S | DIR_W,
  i: DIR_N | DIR_S,
  dash: DIR_E | DIR_W,
  "l-ne": DIR_N | DIR_E,
  "l-es": DIR_E | DIR_S,
  "l-sw": DIR_S | DIR_W,
  "l-wn": DIR_W | DIR_N,
  "t-n": DIR_N | DIR_E | DIR_W,
  "t-e": DIR_N | DIR_E | DIR_S,
  "t-s": DIR_E | DIR_S | DIR_W,
  "t-w": DIR_N | DIR_S | DIR_W,
};

export const PIECE_IDS: readonly PieceId[] = [
  "plus",
  "i",
  "dash",
  "l-ne",
  "l-es",
  "l-sw",
  "l-wn",
  "t-n",
  "t-e",
  "t-s",
  "t-w",
] as const;

const OPPOSITE: Record<number, number> = {
  [DIR_N]: DIR_S,
  [DIR_E]: DIR_W,
  [DIR_S]: DIR_N,
  [DIR_W]: DIR_E,
};

const DELTA: Record<number, readonly [number, number]> = {
  [DIR_N]: [-1, 0],
  [DIR_E]: [0, 1],
  [DIR_S]: [1, 0],
  [DIR_W]: [0, -1],
};

export type BotPhase = "aiming" | "falling" | "lost";

export type BotGrid = (PieceId | null)[][];

export interface BotState {
  grid: BotGrid;
  queue: PieceId[];
  current: PieceId;
  aimCol: number;
  fallRow: number | null;
  level: number;
  segments: number;
  boxes: number;
  phase: BotPhase;
  rng: number;
  /** Cells that morphed on the last land (for box flash). */
  justMorphed: string[];
}

export function socketsOf(id: PieceId): number {
  return PIECE_SOCKETS[id];
}

export function hasSocket(id: PieceId, dir: number): boolean {
  return (PIECE_SOCKETS[id] & dir) !== 0;
}

export function quotaForLevel(level: number): number {
  return BASE_QUOTA + (level - 1);
}

export function gravityMs(level: number): number {
  const ms = BASE_GRAVITY_MS / SPEED_MUL ** (level - 1);
  return Math.max(MIN_GRAVITY_MS, Math.round(ms));
}

export function emptyGrid(): BotGrid {
  return Array.from({ length: BOT_ROWS }, () =>
    Array<PieceId | null>(BOT_COLS).fill(null),
  );
}

export function inGrid(r: number, c: number): boolean {
  return r >= 0 && r < BOT_ROWS && c >= 0 && c < BOT_COLS;
}

export function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}

function cloneGrid(grid: BotGrid): BotGrid {
  return grid.map((row) => row.slice());
}

function cloneState(state: BotState): BotState {
  return {
    ...state,
    grid: cloneGrid(state.grid),
    queue: state.queue.slice(),
    justMorphed: state.justMorphed.slice(),
  };
}

function stepRng(rng: number): { rng: number; n: number } {
  const a = (rng + 0x6d2b79f5) >>> 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const n = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { rng: a, n };
}

function pickPiece(rng: number): { rng: number; piece: PieceId } {
  const step = stepRng(rng);
  const piece = PIECE_IDS[Math.floor(step.n * PIECE_IDS.length)]!;
  return { rng: step.rng, piece };
}

function fillQueue(rng: number, n: number): { rng: number; queue: PieceId[] } {
  const queue: PieceId[] = [];
  let r = rng;
  for (let i = 0; i < n; i++) {
    const next = pickPiece(r);
    r = next.rng;
    queue.push(next.piece);
  }
  return { rng: r, queue };
}

export function startBotEvo(seed?: number): BotState {
  let rng = (seed ?? (Date.now() ^ 0xb07e) >>> 0) >>> 0;
  const currentPick = pickPiece(rng);
  rng = currentPick.rng;
  const filled = fillQueue(rng, BOT_QUEUE);
  const state: BotState = {
    grid: emptyGrid(),
    queue: filled.queue,
    current: currentPick.piece,
    aimCol: 2,
    fallRow: null,
    level: 1,
    segments: 0,
    boxes: 0,
    phase: "aiming",
    rng: filled.rng,
    justMorphed: [],
  };
  startFall(state);
  return state;
}

export function playAgainBotEvo(seed?: number): BotState {
  return startBotEvo(seed);
}

export function socketsMeet(
  a: PieceId,
  b: PieceId,
  dirFromA: number,
): boolean {
  const opp = OPPOSITE[dirFromA];
  if (!opp) return false;
  return hasSocket(a, dirFromA) && hasSocket(b, opp);
}

export function connectedComponents(grid: BotGrid): string[][] {
  const seen = new Set<string>();
  const groups: string[][] = [];
  for (let r = 0; r < BOT_ROWS; r++) {
    for (let c = 0; c < BOT_COLS; c++) {
      const piece = grid[r]![c];
      if (!piece) continue;
      const start = cellKey(r, c);
      if (seen.has(start)) continue;
      const group: string[] = [];
      const q: Array<[number, number]> = [[r, c]];
      seen.add(start);
      while (q.length) {
        const [cr, cc] = q.pop()!;
        group.push(cellKey(cr, cc));
        const here = grid[cr]![cc];
        if (!here) continue;
        for (const dir of [DIR_N, DIR_E, DIR_S, DIR_W]) {
          const [dr, dc] = DELTA[dir]!;
          const nr = cr + dr;
          const nc = cc + dc;
          if (!inGrid(nr, nc)) continue;
          const there = grid[nr]![nc];
          if (!there) continue;
          if (!socketsMeet(here, there, dir)) continue;
          const k = cellKey(nr, nc);
          if (seen.has(k)) continue;
          seen.add(k);
          q.push([nr, nc]);
        }
      }
      groups.push(group);
    }
  }
  return groups;
}

/** Landed cells that belong to a 2+ matching chain (glow). */
export function liveChainCells(grid: BotGrid): Set<string> {
  const out = new Set<string>();
  for (const group of connectedComponents(grid)) {
    if (group.length >= 2) {
      for (const k of group) out.add(k);
    }
  }
  return out;
}

function applyColumnGravity(grid: BotGrid): BotGrid {
  const next = emptyGrid();
  for (let c = 0; c < BOT_COLS; c++) {
    const stack: PieceId[] = [];
    for (let r = 0; r < BOT_ROWS; r++) {
      const piece = grid[r]![c];
      if (piece) stack.push(piece);
    }
    let r = BOT_ROWS - stack.length;
    for (const piece of stack) {
      next[r]![c] = piece;
      r++;
    }
  }
  return next;
}

function creditBoxes(state: BotState, n: number): void {
  state.boxes += n;
  state.segments += n;
  while (state.segments >= quotaForLevel(state.level)) {
    state.segments -= quotaForLevel(state.level);
    state.level += 1;
  }
}

function resolveMorphs(state: BotState): void {
  const flash: string[] = [];
  let guard = 0;
  while (guard++ < BOT_ROWS * BOT_COLS) {
    const groups = connectedComponents(state.grid).filter(
      (g) => g.length >= MORPH_SIZE,
    );
    if (!groups.length) break;
    const kill = new Set<string>();
    for (const g of groups) {
      for (const k of g) kill.add(k);
    }
    for (const k of kill) flash.push(k);
    creditBoxes(state, groups.length);
    const grid = cloneGrid(state.grid);
    for (const k of kill) {
      const [rs, cs] = k.split(",");
      grid[Number(rs)]![Number(cs)] = null;
    }
    state.grid = applyColumnGravity(grid);
  }
  state.justMorphed = flash;
}

function startFall(state: BotState): void {
  if (state.phase === "lost") return;
  if (state.grid[0]![state.aimCol] !== null) {
    state.phase = "lost";
    state.fallRow = null;
    return;
  }
  state.fallRow = 0;
  state.phase = "falling";
}

function spawnNext(state: BotState): void {
  const q = state.queue.slice();
  const next = q.shift();
  if (!next) {
    state.phase = "lost";
    return;
  }
  const picked = pickPiece(state.rng);
  q.push(picked.piece);
  state.queue = q;
  state.current = next;
  state.rng = picked.rng;
  state.fallRow = null;
  if (state.phase !== "lost") startFall(state);
}

function landFalling(state: BotState): void {
  if (state.fallRow === null) return;
  const r = state.fallRow;
  const c = state.aimCol;
  if (!inGrid(r, c) || state.grid[r]![c]) {
    state.phase = "lost";
    state.fallRow = null;
    return;
  }
  state.grid = cloneGrid(state.grid);
  state.grid[r]![c] = state.current;
  state.fallRow = null;
  resolveMorphs(state);
  spawnNext(state);
}

export function aimColumn(state: BotState, col: number): BotState {
  if (state.phase === "lost") return state;
  if (col < 0 || col >= BOT_COLS) return state;
  const next = cloneState(state);
  if (next.phase === "falling" && next.fallRow !== null) {
    if (next.grid[next.fallRow]![col] !== null) return state;
    next.aimCol = col;
    return next;
  }
  next.aimCol = col;
  return next;
}

export function release(state: BotState): BotState {
  if (state.phase === "lost" || state.phase === "falling") return state;
  const next = cloneState(state);
  startFall(next);
  return next;
}

export function tick(state: BotState): BotState {
  if (state.phase !== "falling" || state.fallRow === null) return state;
  const next = cloneState(state);
  const r = next.fallRow;
  if (r === null) return state;
  const c = next.aimCol;
  const below = r + 1;
  if (below >= BOT_ROWS || next.grid[below]![c] !== null) {
    landFalling(next);
    return next;
  }
  next.fallRow = below;
  return next;
}

export function hardDrop(state: BotState): BotState {
  if (state.phase === "lost") return state;
  let next = state.phase === "aiming" ? release(state) : cloneState(state);
  let guard = 0;
  while (next.phase === "falling" && next.fallRow !== null && guard++ < BOT_ROWS + 2) {
    next = tick(next);
    if (next.phase !== "falling") break;
    if (next.fallRow === 0) break;
  }
  return next;
}

/** Instant drop of `piece` (or current) into a column. Tests + tap-to-drop. */
export function dropPiece(
  state: BotState,
  col: number,
  piece?: PieceId,
): BotState {
  if (state.phase === "lost") return state;
  let next = cloneState(state);
  if (piece) next.current = piece;
  next = aimColumn(next, col);
  return hardDrop(next);
}

export function fallingOccupies(
  state: BotState,
  r: number,
  c: number,
): boolean {
  return (
    state.phase === "falling" &&
    state.fallRow === r &&
    state.aimCol === c
  );
}
