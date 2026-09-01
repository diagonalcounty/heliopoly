/**
 * Lab drill: egg-bot-evolution (#203 / #204 / #205).
 * 5×8 egg-socket matching. Untimed. No Mainline / src/core.
 *
 * Grammar: every piece is a centered plus with unused arms erased.
 * Connection uses socket flags, not sprite shape. No rotation — each
 * piece id is a fixed bot. Shell color is by connector family
 * (4 / 3 / straight-2 / corner-2), not by facing.
 */

export const BOT_COLS = 5;
export const BOT_ROWS = 8;
export const BOT_QUEUE = 3;
export const BASE_QUOTA = 5;
export const SPEED_MUL = 1.1;
export const BASE_GRAVITY_MS = 700;
export const MIN_GRAVITY_MS = 80;
export const MORPH_SIZE = 5;
/** Extra gravity ticks on the floor so you can slide before lock. */
export const LOCK_GRACE_TICKS = 1;

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

/** Shell color follows connector family, not facing. */
export type ConnectorKind = "four" | "three" | "straight" | "corner";

export const SHELL_FILL: Record<ConnectorKind, string> = {
  four: "#f3ead2",
  three: "#b5d9c4",
  straight: "#9ec9e8",
  corner: "#e8c4a0",
};

export function socketCount(id: PieceId): number {
  const mask = PIECE_SOCKETS[id];
  let n = 0;
  for (const dir of [DIR_N, DIR_E, DIR_S, DIR_W]) {
    if (mask & dir) n++;
  }
  return n;
}

export function connectorKind(id: PieceId): ConnectorKind {
  const n = socketCount(id);
  if (n === 4) return "four";
  if (n === 3) return "three";
  if (id === "i" || id === "dash") return "straight";
  return "corner";
}

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

export type BotPhase = "aiming" | "falling" | "morphing" | "lost";

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
  /** Remaining bots in the current 11-bag. */
  bag: PieceId[];
  /** Gravity ticks spent sitting on the stack (resets on slide). */
  lockTicks: number;
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
    bag: state.bag.slice(),
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

function shuffleBag(rng: number): { rng: number; bag: PieceId[] } {
  const bag = PIECE_IDS.slice();
  let r = rng;
  for (let i = bag.length - 1; i > 0; i--) {
    const step = stepRng(r);
    r = step.rng;
    const j = Math.floor(step.n * (i + 1));
    const tmp = bag[i]!;
    bag[i] = bag[j]!;
    bag[j] = tmp;
  }
  return { rng: r, bag };
}

function drawPiece(
  rng: number,
  bag: PieceId[],
): { rng: number; bag: PieceId[]; piece: PieceId } {
  let r = rng;
  let nextBag = bag.slice();
  if (!nextBag.length) {
    const shuffled = shuffleBag(r);
    r = shuffled.rng;
    nextBag = shuffled.bag;
  }
  const piece = nextBag.shift()!;
  return { rng: r, bag: nextBag, piece };
}

function fillQueue(
  rng: number,
  bag: PieceId[],
  n: number,
): { rng: number; bag: PieceId[]; queue: PieceId[] } {
  const queue: PieceId[] = [];
  let r = rng;
  let b = bag.slice();
  for (let i = 0; i < n; i++) {
    const next = drawPiece(r, b);
    r = next.rng;
    b = next.bag;
    queue.push(next.piece);
  }
  return { rng: r, bag: b, queue };
}

export function startBotEvo(seed?: number): BotState {
  let rng = (seed ?? (Date.now() ^ 0xb07e) >>> 0) >>> 0;
  const currentPick = drawPiece(rng, []);
  rng = currentPick.rng;
  const filled = fillQueue(rng, currentPick.bag, BOT_QUEUE);
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
    bag: filled.bag,
    lockTicks: 0,
    justMorphed: [],
  };
  startFall(state);
  return state;
}

export function playAgainBotEvo(seed?: number): BotState {
  return startBotEvo(seed);
}

/** Unique illustrated bot for this piece; faces stay upright. */
export function pieceArt(id: PieceId): string {
  return `/lab/botevo/${id}.png`;
}

/** Cream token SVG: Kostka face, gold pegs, shell tinted by connector family. */
export function eggTokenSvg(id: PieceId): string {
  const mask = PIECE_SOCKETS[id];
  const kind = connectorKind(id);
  const fill = SHELL_FILL[kind];
  const nsOnly = kind === "straight" && (mask & DIR_N) !== 0;
  const ewOnly = kind === "straight" && (mask & DIR_E) !== 0;
  const rx = nsOnly ? 30 : ewOnly ? 50 : 38;
  const ry = nsOnly ? 50 : ewOnly ? 32 : 46;
  const cx = 64;
  const cy = 64;
  const hx = cx;
  const hy = cy + 14;
  const arm = 16;
  const thick = 6;
  const navy = "#1a2744";
  const gold = "#c9a227";
  const goldDk = "#8a7340";
  const cyan = "#5aa8d4";
  const parts: string[] = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">',
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${navy}" stroke-width="3"/>`,
  ];
  if (mask & DIR_N) {
    parts.push(
      `<rect x="${hx - thick / 2}" y="${hy - arm}" width="${thick}" height="${arm}" fill="${gold}"/>`,
    );
  }
  if (mask & DIR_S) {
    parts.push(
      `<rect x="${hx - thick / 2}" y="${hy}" width="${thick}" height="${arm}" fill="${gold}"/>`,
    );
  }
  if (mask & DIR_W) {
    parts.push(
      `<rect x="${hx - arm}" y="${hy - thick / 2}" width="${arm}" height="${thick}" fill="${gold}"/>`,
    );
  }
  if (mask & DIR_E) {
    parts.push(
      `<rect x="${hx}" y="${hy - thick / 2}" width="${arm}" height="${thick}" fill="${gold}"/>`,
    );
  }
  parts.push(
    `<rect x="${hx - 5}" y="${hy - 5}" width="10" height="10" rx="1.5" fill="${gold}"/>`,
  );
  if (kind === "four") {
    parts.push(
      `<rect x="${hx - 1.5}" y="${hy - 6}" width="3" height="12" fill="${cyan}"/>`,
      `<rect x="${hx - 6}" y="${hy - 1.5}" width="12" height="3" fill="${cyan}"/>`,
    );
  }
  const pegL = 15;
  const pegT = 10;
  if (mask & DIR_N) {
    parts.push(
      `<rect x="${cx - pegT / 2}" y="${cy - ry - 10}" width="${pegT}" height="${pegL}" rx="3.5" fill="${gold}" stroke="${goldDk}" stroke-width="1.1"/>`,
    );
  }
  if (mask & DIR_S) {
    parts.push(
      `<rect x="${cx - pegT / 2}" y="${cy + ry - 5}" width="${pegT}" height="${pegL}" rx="3.5" fill="${gold}" stroke="${goldDk}" stroke-width="1.1"/>`,
    );
  }
  if (mask & DIR_E) {
    parts.push(
      `<rect x="${cx + rx - 5}" y="${cy - pegT / 2}" width="${pegL}" height="${pegT}" rx="3.5" fill="${gold}" stroke="${goldDk}" stroke-width="1.1"/>`,
    );
  }
  if (mask & DIR_W) {
    parts.push(
      `<rect x="${cx - rx - 10}" y="${cy - pegT / 2}" width="${pegL}" height="${pegT}" rx="3.5" fill="${gold}" stroke="${goldDk}" stroke-width="1.1"/>`,
    );
  }
  parts.push(
    `<ellipse cx="${cx - 11}" cy="${cy - 12}" rx="5.2" ry="6.6" fill="${navy}"/>`,
    `<ellipse cx="${cx + 11}" cy="${cy - 12}" rx="5.2" ry="6.6" fill="${navy}"/>`,
    `<path d="M ${cx - 9} ${cy + 4} Q ${cx} ${cy + 10} ${cx + 9} ${cy + 4}" fill="none" stroke="${navy}" stroke-width="2.3" stroke-linecap="round"/>`,
    "</svg>",
  );
  return parts.join("\n") + "\n";
}

/** Directions on `r,c` that currently plug into a neighbor. */
export function socketJoins(grid: BotGrid, r: number, c: number): number {
  const here = grid[r]![c];
  if (!here) return 0;
  let mask = 0;
  for (const dir of [DIR_N, DIR_E, DIR_S, DIR_W]) {
    const [dr, dc] = DELTA[dir]!;
    const nr = r + dr;
    const nc = c + dc;
    if (!inGrid(nr, nc)) continue;
    const there = grid[nr]![nc];
    if (!there) continue;
    if (socketsMeet(here, there, dir)) mask |= dir;
  }
  return mask;
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
  state.lockTicks = 0;
  state.phase = "falling";
}

function spawnNext(state: BotState): void {
  const q = state.queue.slice();
  const next = q.shift();
  if (!next) {
    state.phase = "lost";
    return;
  }
  const picked = drawPiece(state.rng, state.bag);
  q.push(picked.piece);
  state.queue = q;
  state.current = next;
  state.rng = picked.rng;
  state.bag = picked.bag;
  state.fallRow = null;
  state.lockTicks = 0;
  if (state.phase === "lost") return;
  startFall(state);
}

/** Clear the morph flash after the fly-up FX. Gameplay already resumed. */
export function resumeAfterMorph(state: BotState): BotState {
  if (state.phase === "lost") return state;
  const next = cloneState(state);
  next.justMorphed = [];
  if (next.phase === "morphing" || next.phase === "aiming") startFall(next);
  return next;
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
    if (next.aimCol !== col) next.lockTicks = 0;
    next.aimCol = col;
    return next;
  }
  if (next.aimCol !== col) next.lockTicks = 0;
  next.aimCol = col;
  return next;
}

export interface LandingPreview {
  row: number;
  live: boolean;
  morph: boolean;
}

/** Where the falling egg will sit, and whether that join glows / morphs. */
export function landingPreview(state: BotState): LandingPreview | null {
  if (state.phase !== "falling" || state.fallRow === null) return null;
  const c = state.aimCol;
  let r = state.fallRow;
  while (r + 1 < BOT_ROWS && state.grid[r + 1]![c] === null) r++;
  const grid = cloneGrid(state.grid);
  grid[r]![c] = state.current;
  const key = cellKey(r, c);
  const group = connectedComponents(grid).find((g) => g.includes(key));
  const size = group?.length ?? 1;
  return {
    row: r,
    live: size >= 2,
    morph: size >= MORPH_SIZE,
  };
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
    if (next.lockTicks < LOCK_GRACE_TICKS) {
      next.lockTicks += 1;
      return next;
    }
    landFalling(next);
    return next;
  }
  next.fallRow = below;
  next.lockTicks = 0;
  return next;
}

export function hardDrop(state: BotState): BotState {
  if (state.phase === "lost") return state;
  let next =
    state.phase === "falling" ? cloneState(state) : release(state);
  let guard = 0;
  while (next.phase === "falling" && next.fallRow !== null && guard++ < BOT_ROWS + 4) {
    const r = next.fallRow;
    const c = next.aimCol;
    const blocked = r + 1 >= BOT_ROWS || next.grid[r + 1]![c] !== null;
    if (blocked) {
      const landed = cloneState(next);
      landFalling(landed);
      return landed;
    }
    next = tick(next);
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
