/**
 * Lab drill: backup-fuel pipe routing (#77).
 * Rotate-only 5×5; fixed tank → engine; untimed. No Mainline / src/core.
 */
export const PIPE_GRID = 5;

export const DIR_N = 1;
export const DIR_E = 2;
export const DIR_S = 4;
export const DIR_W = 8;

export const TANK = { r: 2, c: 0 } as const;
export const ENGINE = { r: 2, c: 4 } as const;

/** Hamiltonian path tank → engine so every cell is on the unique solved run. */
export const SOLVED_PATH: ReadonlyArray<readonly [number, number]> = [
  [2, 0],
  [2, 1],
  [1, 1],
  [1, 0],
  [0, 0],
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 4],
  [1, 3],
  [1, 2],
  [2, 2],
  [3, 2],
  [3, 1],
  [3, 0],
  [4, 0],
  [4, 1],
  [4, 2],
  [4, 3],
  [4, 4],
  [3, 4],
  [3, 3],
  [2, 3],
  [2, 4],
];

export type PipePhase = "playing" | "won";

export interface PipeState {
  tiles: number[][];
  rotates: number;
  phase: PipePhase;
}

const DELTA: Record<number, readonly [number, number]> = {
  [DIR_N]: [-1, 0],
  [DIR_E]: [0, 1],
  [DIR_S]: [1, 0],
  [DIR_W]: [0, -1],
};

const OPPOSITE: Record<number, number> = {
  [DIR_N]: DIR_S,
  [DIR_E]: DIR_W,
  [DIR_S]: DIR_N,
  [DIR_W]: DIR_E,
};

export function isPipeFixture(r: number, c: number): boolean {
  return (r === TANK.r && c === TANK.c) || (r === ENGINE.r && c === ENGINE.c);
}

export function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}

function inGrid(r: number, c: number): boolean {
  return r >= 0 && r < PIPE_GRID && c >= 0 && c < PIPE_GRID;
}

function dirTo(fr: number, fc: number, tr: number, tc: number): number {
  const dr = tr - fr;
  const dc = tc - fc;
  if (dr === -1 && dc === 0) return DIR_N;
  if (dr === 0 && dc === 1) return DIR_E;
  if (dr === 1 && dc === 0) return DIR_S;
  if (dr === 0 && dc === -1) return DIR_W;
  throw new Error(`backup-fuel: ${fr},${fc} is not adjacent to ${tr},${tc}`);
}

export function rotateMask(mask: number): number {
  let next = 0;
  if (mask & DIR_N) next |= DIR_E;
  if (mask & DIR_E) next |= DIR_S;
  if (mask & DIR_S) next |= DIR_W;
  if (mask & DIR_W) next |= DIR_N;
  return next;
}

export function solvedTiles(): number[][] {
  const tiles = Array.from({ length: PIPE_GRID }, () =>
    Array<number>(PIPE_GRID).fill(0),
  );
  for (let i = 0; i < SOLVED_PATH.length; i++) {
    const [r, c] = SOLVED_PATH[i];
    if (i > 0) {
      const [pr, pc] = SOLVED_PATH[i - 1];
      tiles[r][c] |= dirTo(r, c, pr, pc);
    }
    if (i < SOLVED_PATH.length - 1) {
      const [nr, nc] = SOLVED_PATH[i + 1];
      tiles[r][c] |= dirTo(r, c, nr, nc);
    }
  }
  return tiles;
}

function cloneTiles(tiles: number[][]): number[][] {
  return tiles.map((row) => row.slice());
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

/** Cells fed from the tank through matching openings (path highlight). */
export function flowFromTank(state: PipeState): Set<string> {
  const seen = new Set<string>();
  const q: Array<[number, number]> = [[TANK.r, TANK.c]];
  seen.add(cellKey(TANK.r, TANK.c));
  while (q.length) {
    const [r, c] = q.pop()!;
    const mask = state.tiles[r][c];
    for (const dir of [DIR_N, DIR_E, DIR_S, DIR_W]) {
      if ((mask & dir) === 0) continue;
      const [dr, dc] = DELTA[dir];
      const nr = r + dr;
      const nc = c + dc;
      if (!inGrid(nr, nc)) continue;
      if ((state.tiles[nr][nc] & OPPOSITE[dir]) === 0) continue;
      const k = cellKey(nr, nc);
      if (seen.has(k)) continue;
      seen.add(k);
      q.push([nr, nc]);
    }
  }
  return seen;
}

export function isPathComplete(state: Pick<PipeState, "tiles">): boolean {
  return flowFromTank({
    tiles: state.tiles,
    rotates: 0,
    phase: "playing",
  }).has(cellKey(ENGINE.r, ENGINE.c));
}

function scrambleTiles(seed: number): number[][] {
  const tiles = solvedTiles();
  const rng = mulberry32(seed);
  for (let r = 0; r < PIPE_GRID; r++) {
    for (let c = 0; c < PIPE_GRID; c++) {
      if (isPipeFixture(r, c)) continue;
      const turns = 1 + Math.floor(rng() * 3);
      for (let i = 0; i < turns; i++) tiles[r][c] = rotateMask(tiles[r][c]);
    }
  }
  // Straights look the same at 180°. Nudge an elbow if the scramble is still live.
  if (isPathComplete({ tiles })) {
    for (let r = 0; r < PIPE_GRID; r++) {
      for (let c = 0; c < PIPE_GRID; c++) {
        if (isPipeFixture(r, c)) continue;
        const mask = tiles[r][c];
        const bits = (mask & 1) + ((mask >> 1) & 1) + ((mask >> 2) & 1) + ((mask >> 3) & 1);
        if (bits !== 2) continue;
        const opposite = (mask & DIR_N && mask & DIR_S) || (mask & DIR_E && mask & DIR_W);
        if (opposite) continue;
        tiles[r][c] = rotateMask(mask);
        return tiles;
      }
    }
  }
  return tiles;
}

export function startPipes(seed?: number): PipeState {
  const s = seed ?? (Date.now() ^ 0x7e77) >>> 0;
  return {
    tiles: scrambleTiles(s),
    rotates: 0,
    phase: "playing",
  };
}

export function rotateTile(state: PipeState, r: number, c: number): PipeState {
  if (state.phase !== "playing") return state;
  if (!inGrid(r, c) || isPipeFixture(r, c)) return state;
  const tiles = cloneTiles(state.tiles);
  tiles[r][c] = rotateMask(tiles[r][c]);
  const next: PipeState = {
    tiles,
    rotates: state.rotates + 1,
    phase: "playing",
  };
  if (isPathComplete(next)) next.phase = "won";
  return next;
}

export function playAgainPipes(seed?: number): PipeState {
  return startPipes(seed);
}

export function cellKind(
  r: number,
  c: number,
): "tank" | "engine" | "pipe" {
  if (r === TANK.r && c === TANK.c) return "tank";
  if (r === ENGINE.r && c === ENGINE.c) return "engine";
  return "pipe";
}
