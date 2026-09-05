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
export const BOT_QUEUE = 6;
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

/** Bottom-row bot cleared on level promotion (chrome fly → Next 2–6). */
export interface RecycledBot {
  col: number;
  piece: PieceId;
}

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
  /**
   * Per-slot sharp flag for queue pixelation (#219).
   * Recycled occupants in indices 1–5 start true; do not infer from piece id.
   */
  recycleSharp: boolean[];
  /** Bottom-row bots recycled on the last promotion (chrome FX). */
  justRecycled: RecycledBot[];
  /** Level-ups during the current morph resolve; applied after spawnNext. */
  pendingPromotions: number;
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
    recycleSharp: state.recycleSharp.slice(),
    justRecycled: state.justRecycled.map((r) => ({ ...r })),
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
    recycleSharp: Array.from({ length: BOT_QUEUE }, () => false),
    justRecycled: [],
    pendingPromotions: 0,
  };
  startFall(state);
  return state;
}

export function playAgainBotEvo(seed?: number): BotState {
  return startBotEvo(seed);
}

/** Blank-shell body geometry from face-review HITL (viewBox 0 0 100 100). */
export interface EggBodyTune {
  eggRx: number;
  eggRy: number;
  eggCx: number;
  eggCy: number;
  armLength: number;
  armThickness: number;
  endCapSize: number;
  /** Flat-disc thickness as fraction of endCapSize (minor axis). */
  endCapAspect: number;
  socketSize: number;
  bodyStroke: number;
  armRoundness: number;
  connectorMetal: string;
  endCapFill: string;
  endCapStroke: string;
  bodyOutline: string;
  highlightOpacity: number;
}

/** Review-tool body defaults — do not re-inflate eggRx to fill cells. */
export const EGG_BODY_DEFAULTS: EggBodyTune = {
  eggRx: 30,
  eggRy: 28.5,
  eggCx: 50,
  eggCy: 51.5,
  armLength: 18,
  armThickness: 6,
  endCapSize: 9.5,
  endCapAspect: 0.42,
  socketSize: 10,
  bodyStroke: 2.1,
  armRoundness: 2.9,
  connectorMetal: "#8a96a4",
  endCapFill: "#c9a24a",
  endCapStroke: "#8a6a28",
  bodyOutline: "rgba(20,16,12,0.4)",
  highlightOpacity: 0.18,
};

/**
 * Straight / blueish family is clearly taller than the near-circular shell.
 * Same arm/face language; only rx/ry bias changes.
 */
export const EGG_BODY_STRAIGHT: Pick<EggBodyTune, "eggRx" | "eggRy"> = {
  eggRx: 26.5,
  eggRy: 36,
};

/** Unique illustrated bot for this piece; faces stay upright. */
export function pieceArt(id: PieceId): string {
  return `/lab/botevo/${id}.png`;
}

export function eggBodyFor(id: PieceId): EggBodyTune {
  const kind = connectorKind(id);
  if (kind === "straight") {
    return { ...EGG_BODY_DEFAULTS, ...EGG_BODY_STRAIGHT };
  }
  return EGG_BODY_DEFAULTS;
}

export function shadeHex(hex: string, amount: number): string {
  const n = hex.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(n.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(n.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(n.slice(4, 6), 16) + amount));
  return (
    "#" +
    [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
  );
}

function svgNum(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? String(r) : String(r);
}

type ArmDirName = "N" | "E" | "S" | "W";

const DIR_NAME: Record<number, ArmDirName> = {
  [DIR_N]: "N",
  [DIR_E]: "E",
  [DIR_S]: "S",
  [DIR_W]: "W",
};

/** Retro connector: socket at body, rod, flatter rect end-cap (face-review). */
function connectorArm(
  dir: ArmDirName,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  body: EggBodyTune,
): string {
  const L = body.armLength;
  const t = body.armThickness;
  const capW = body.endCapSize;
  const capD = Math.max(0.5, body.endCapSize * body.endCapAspect);
  const sock = body.socketSize;
  const rr = body.armRoundness;
  const metal = body.connectorMetal;
  const capF = body.endCapFill;
  const capS = body.endCapStroke;
  const sockFill = shadeHex(metal, 28);
  const halfT = t / 2;
  const halfSock = sock / 2;
  const halfCapW = capW / 2;
  const capRx = Math.min(rr, halfCapW, capD / 2);
  const rodRx = Math.min(rr, halfT);

  if (dir === "N") {
    const y0 = cy - ry;
    return (
      `<rect x="${svgNum(cx - halfSock)}" y="${svgNum(y0 - sock * 0.35)}" width="${svgNum(sock)}" height="${svgNum(sock * 0.7)}" rx="${svgNum(rr)}" fill="${sockFill}" stroke="rgba(20,16,12,0.35)" stroke-width="0.5"/>` +
      `<rect x="${svgNum(cx - halfT)}" y="${svgNum(y0 - L)}" width="${svgNum(t)}" height="${svgNum(L)}" rx="${svgNum(rodRx)}" fill="${metal}"/>` +
      `<rect x="${svgNum(cx - halfCapW)}" y="${svgNum(y0 - L - capD)}" width="${svgNum(capW)}" height="${svgNum(capD)}" rx="${svgNum(capRx)}" fill="${capF}" stroke="${capS}" stroke-width="0.65"/>`
    );
  }
  if (dir === "S") {
    const y0 = cy + ry;
    return (
      `<rect x="${svgNum(cx - halfSock)}" y="${svgNum(y0 - sock * 0.35)}" width="${svgNum(sock)}" height="${svgNum(sock * 0.7)}" rx="${svgNum(rr)}" fill="${sockFill}" stroke="rgba(20,16,12,0.35)" stroke-width="0.5"/>` +
      `<rect x="${svgNum(cx - halfT)}" y="${svgNum(y0)}" width="${svgNum(t)}" height="${svgNum(L)}" rx="${svgNum(rodRx)}" fill="${metal}"/>` +
      `<rect x="${svgNum(cx - halfCapW)}" y="${svgNum(y0 + L)}" width="${svgNum(capW)}" height="${svgNum(capD)}" rx="${svgNum(capRx)}" fill="${capF}" stroke="${capS}" stroke-width="0.65"/>`
    );
  }
  if (dir === "W") {
    const x0 = cx - rx;
    return (
      `<rect x="${svgNum(x0 - sock * 0.35)}" y="${svgNum(cy - halfSock)}" width="${svgNum(sock * 0.7)}" height="${svgNum(sock)}" rx="${svgNum(rr)}" fill="${sockFill}" stroke="rgba(20,16,12,0.35)" stroke-width="0.5"/>` +
      `<rect x="${svgNum(x0 - L)}" y="${svgNum(cy - halfT)}" width="${svgNum(L)}" height="${svgNum(t)}" rx="${svgNum(rodRx)}" fill="${metal}"/>` +
      `<rect x="${svgNum(x0 - L - capD)}" y="${svgNum(cy - halfCapW)}" width="${svgNum(capD)}" height="${svgNum(capW)}" rx="${svgNum(capRx)}" fill="${capF}" stroke="${capS}" stroke-width="0.65"/>`
    );
  }
  // E
  const x0 = cx + rx;
  return (
    `<rect x="${svgNum(x0 - sock * 0.35)}" y="${svgNum(cy - halfSock)}" width="${svgNum(sock * 0.7)}" height="${svgNum(sock)}" rx="${svgNum(rr)}" fill="${sockFill}" stroke="rgba(20,16,12,0.35)" stroke-width="0.5"/>` +
    `<rect x="${svgNum(x0)}" y="${svgNum(cy - halfT)}" width="${svgNum(L)}" height="${svgNum(t)}" rx="${svgNum(rodRx)}" fill="${metal}"/>` +
    `<rect x="${svgNum(x0 + L)}" y="${svgNum(cy - halfCapW)}" width="${svgNum(capD)}" height="${svgNum(capW)}" rx="${svgNum(capRx)}" fill="${capF}" stroke="${capS}" stroke-width="0.65"/>`
  );
}

let eggSvgSeq = 0;

/**
 * Blank SVG egg shell + retro arms matching face-review chassisSVG.
 * Gradient shell + soft highlight; rect gold end-caps. No baked face.
 */
export function eggTokenSvg(id: PieceId): string {
  const mask = PIECE_SOCKETS[id];
  const kind = connectorKind(id);
  const fill = SHELL_FILL[kind];
  const body = eggBodyFor(id);
  const { eggCx: cx, eggCy: cy, eggRx: rx, eggRy: ry } = body;
  const dirs = [DIR_N, DIR_E, DIR_S, DIR_W].filter((d) => (mask & d) !== 0);
  eggSvgSeq += 1;
  const gid = `body-${id}-${eggSvgSeq}`;
  const hi = shadeHex(fill, 36);
  const mid = fill;
  const mid2 = shadeHex(fill, -22);
  const deep = shadeHex(fill, -48);
  const arms = dirs
    .map((d) => connectorArm(DIR_NAME[d]!, cx, cy, rx, ry, body))
    .join("");
  const hiOp = body.highlightOpacity;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" overflow="visible">` +
    `<defs>` +
    `<radialGradient id="${gid}" cx="40%" cy="32%" r="70%">` +
    `<stop offset="0%" stop-color="${hi}"/>` +
    `<stop offset="45%" stop-color="${mid}"/>` +
    `<stop offset="78%" stop-color="${mid2}"/>` +
    `<stop offset="100%" stop-color="${deep}"/>` +
    `</radialGradient>` +
    `</defs>` +
    arms +
    `<ellipse class="botevo-shell" cx="${svgNum(cx)}" cy="${svgNum(cy)}" rx="${svgNum(rx)}" ry="${svgNum(ry)}" fill="url(#${gid})" stroke="${body.bodyOutline}" stroke-width="${svgNum(body.bodyStroke)}"/>` +
    `<ellipse cx="${svgNum(cx - rx * 0.28)}" cy="${svgNum(cy - ry * 0.35)}" rx="${svgNum(rx * 0.38)}" ry="${svgNum(ry * 0.22)}" fill="rgba(255,255,255,${hiOp})"/>` +
    `</svg>\n`
  );
}

/** data: URL for recycle flies / img fallbacks. */
export function eggTokenDataUrl(id: PieceId): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(eggTokenSvg(id))}`;
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

export function applyColumnGravity(grid: BotGrid): BotGrid {
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
    state.pendingPromotions += 1;
  }
}

/**
 * Clear the bottom playfield row into the bag and rewrite Next slots 2–6.
 * Keeps queue[0]. Empty bottom cells are skipped. Call after spawnNext on
 * promotion so the falling piece is not stolen and slot 1 stays next-to-drop.
 */
export function recycleBottomRow(state: BotState): BotState {
  const next = cloneState(state);
  recycleBottomRowInPlace(next);
  return next;
}

function recycleBottomRowInPlace(state: BotState): void {
  const bottom = BOT_ROWS - 1;
  const recycled: RecycledBot[] = [];
  const grid = cloneGrid(state.grid);
  for (let c = 0; c < BOT_COLS; c++) {
    const piece = grid[bottom]![c];
    if (!piece) continue;
    recycled.push({ col: c, piece });
    grid[bottom]![c] = null;
  }

  for (const item of recycled) {
    state.bag.push(item.piece);
  }

  state.grid = applyColumnGravity(grid);

  const keep = state.queue[0];
  if (!keep) return;
  const priorTail = state.queue.slice(1);
  const slots: PieceId[] = [];
  for (const item of recycled) {
    if (slots.length >= BOT_QUEUE - 1) break;
    slots.push(item.piece);
  }
  let ti = 0;
  while (slots.length < BOT_QUEUE - 1 && ti < priorTail.length) {
    slots.push(priorTail[ti++]!);
  }
  while (slots.length < BOT_QUEUE - 1) {
    const drawn = drawPiece(state.rng, state.bag);
    state.rng = drawn.rng;
    state.bag = drawn.bag;
    slots.push(drawn.piece);
  }

  const nRecycled = Math.min(recycled.length, BOT_QUEUE - 1);
  const sharp = state.recycleSharp.slice();
  sharp[0] = false;
  for (let i = 1; i < BOT_QUEUE; i++) {
    sharp[i] = i <= nRecycled;
  }

  state.queue = [keep, ...slots];
  state.recycleSharp = sharp;
  state.justRecycled = recycled;
}

/** Clear recycle FX flash after muted flies settle. */
export function clearJustRecycled(state: BotState): BotState {
  if (!state.justRecycled.length) return state;
  const next = cloneState(state);
  next.justRecycled = [];
  return next;
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
  const sharp = state.recycleSharp.slice();
  sharp.shift();
  sharp.push(false);
  state.recycleSharp = sharp;
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
  state.justRecycled = [];
  state.pendingPromotions = 0;
  resolveMorphs(state);
  const promotions = state.pendingPromotions;
  state.pendingPromotions = 0;
  spawnNext(state);
  // Recycle after spawn so queue[0] is the live next-to-drop (slot 1 stays).
  for (let i = 0; i < promotions; i++) {
    recycleBottomRowInPlace(state);
  }
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
