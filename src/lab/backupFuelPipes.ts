/**
 * Lab drill: backup-fuel pipe routing (#77 / #201).
 * Rotate-only 6×6; tank and engine on the perimeter (deal-to-deal);
 * Hamiltonian tank→engine so every cell is on the unique solved run.
 * Untimed. No Mainline / src/core.
 */
export const PIPE_GRID = 6;

export const DIR_N = 1;
export const DIR_E = 2;
export const DIR_S = 4;
export const DIR_W = 8;

export type PipeCell = { r: number; c: number };

export type PipePhase = "playing" | "won";

export interface PipeState {
  tiles: number[][];
  tank: PipeCell;
  engine: PipeCell;
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

export function isPipeFixture(
  r: number,
  c: number,
  tank: PipeCell,
  engine: PipeCell,
): boolean {
  return (r === tank.r && c === tank.c) || (r === engine.r && c === engine.c);
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

function perimeterCells(): PipeCell[] {
  const cells: PipeCell[] = [];
  const n = PIPE_GRID;
  for (let c = 0; c < n; c++) {
    cells.push({ r: 0, c });
    cells.push({ r: n - 1, c });
  }
  for (let r = 1; r < n - 1; r++) {
    cells.push({ r, c: 0 });
    cells.push({ r, c: n - 1 });
  }
  return cells;
}

function unusedNeighbors(
  r: number,
  c: number,
  used: boolean[][],
): PipeCell[] {
  const out: PipeCell[] = [];
  if (r > 0 && !used[r - 1]![c]) out.push({ r: r - 1, c });
  if (r + 1 < PIPE_GRID && !used[r + 1]![c]) out.push({ r: r + 1, c });
  if (c > 0 && !used[r]![c - 1]) out.push({ r, c: c - 1 });
  if (c + 1 < PIPE_GRID && !used[r]![c + 1]) out.push({ r, c: c + 1 });
  return out;
}

/** Unused cells reachable from (sr,sc), which itself must be unused. */
function unusedComponent(
  sr: number,
  sc: number,
  used: boolean[][],
  engine: PipeCell,
): { size: number; hitEngine: boolean } {
  const seen: boolean[][] = Array.from({ length: PIPE_GRID }, () =>
    Array(PIPE_GRID).fill(false),
  );
  const q: PipeCell[] = [{ r: sr, c: sc }];
  seen[sr]![sc] = true;
  let size = 0;
  let hitEngine = false;
  while (q.length) {
    const { r, c } = q.pop()!;
    size++;
    if (r === engine.r && c === engine.c) hitEngine = true;
    for (const n of unusedNeighbors(r, c, used)) {
      if (seen[n.r]![n.c]) continue;
      seen[n.r]![n.c] = true;
      q.push(n);
    }
  }
  return { size, hitEngine };
}

function findHamPath(
  tank: PipeCell,
  engine: PipeCell,
  rng: () => number,
): PipeCell[] | null {
  const n = PIPE_GRID * PIPE_GRID;
  const path: PipeCell[] = [{ ...tank }];
  const used: boolean[][] = Array.from({ length: PIPE_GRID }, () =>
    Array(PIPE_GRID).fill(false),
  );
  used[tank.r]![tank.c] = true;
  let visits = 0;
  const cap = 80_000;

  function dfs(): boolean {
    visits++;
    if (visits > cap) return false;
    if (path.length === n) {
      const last = path[n - 1]!;
      return last.r === engine.r && last.c === engine.c;
    }
    const cur = path[path.length - 1]!;
    const remain = n - path.length;
    let opts = unusedNeighbors(cur.r, cur.c, used);
    if (remain === 1) {
      opts = opts.filter((p) => p.r === engine.r && p.c === engine.c);
    } else {
      opts = opts.filter((p) => !(p.r === engine.r && p.c === engine.c));
    }
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = opts[i]!;
      opts[i] = opts[j]!;
      opts[j] = tmp;
    }
    opts.sort(
      (a, b) =>
        unusedNeighbors(a.r, a.c, used).length -
        unusedNeighbors(b.r, b.c, used).length,
    );
    opts = opts.filter((p) => {
      const { size, hitEngine } = unusedComponent(p.r, p.c, used, engine);
      return hitEngine && size === remain;
    });
    for (const nxt of opts) {
      used[nxt.r]![nxt.c] = true;
      path.push(nxt);
      if (dfs()) return true;
      path.pop();
      used[nxt.r]![nxt.c] = false;
    }
    return false;
  }

  return dfs() ? path.map((p) => ({ ...p })) : null;
}

/** Even-row L→R, odd-row R→L snake. Always a Hamiltonian path. */
function serpentinePath(): PipeCell[] {
  const path: PipeCell[] = [];
  for (let r = 0; r < PIPE_GRID; r++) {
    if (r % 2 === 0) {
      for (let c = 0; c < PIPE_GRID; c++) path.push({ r, c });
    } else {
      for (let c = PIPE_GRID - 1; c >= 0; c--) path.push({ r, c });
    }
  }
  return path;
}

function transformPath(path: PipeCell[], k: number): PipeCell[] {
  const last = PIPE_GRID - 1;
  const rot = k % 4;
  const flip = k >= 4;
  return path.map(({ r, c }) => {
    let rr = r;
    let cc = flip ? last - c : c;
    for (let i = 0; i < rot; i++) {
      const tr = cc;
      const tc = last - rr;
      rr = tr;
      cc = tc;
    }
    return { r: rr, c: cc };
  });
}

function dealPath(rng: () => number): {
  tank: PipeCell;
  engine: PipeCell;
  path: PipeCell[];
} {
  const peri = perimeterCells();
  for (let attempt = 0; attempt < 48; attempt++) {
    const tank = peri[Math.floor(rng() * peri.length)]!;
    const cands = peri.filter(
      (p) =>
        (p.r !== tank.r || p.c !== tank.c) &&
        ((p.r + p.c) & 1) !== ((tank.r + tank.c) & 1),
    );
    if (!cands.length) continue;
    const engine = cands[Math.floor(rng() * cands.length)]!;
    const path = findHamPath(tank, engine, rng);
    if (path) return { tank, engine, path };
  }
  const k = Math.floor(rng() * 8);
  const rev = rng() < 0.5;
  let path = transformPath(serpentinePath(), k);
  if (rev) path = path.slice().reverse();
  return {
    tank: path[0]!,
    engine: path[path.length - 1]!,
    path,
  };
}

export function tilesFromPath(path: readonly PipeCell[]): number[][] {
  const tiles = Array.from({ length: PIPE_GRID }, () =>
    Array<number>(PIPE_GRID).fill(0),
  );
  for (let i = 0; i < path.length; i++) {
    const { r, c } = path[i]!;
    if (i > 0) {
      const prev = path[i - 1]!;
      tiles[r]![c]! |= dirTo(r, c, prev.r, prev.c);
    }
    if (i < path.length - 1) {
      const next = path[i + 1]!;
      tiles[r]![c]! |= dirTo(r, c, next.r, next.c);
    }
  }
  return tiles;
}

function cloneTiles(tiles: number[][]): number[][] {
  return tiles.map((row) => row.slice());
}

function scrambleTiles(
  tiles: number[][],
  tank: PipeCell,
  engine: PipeCell,
  seed: number,
): number[][] {
  const out = cloneTiles(tiles);
  const rng = mulberry32(seed ^ 0x9e3779b9);
  for (let r = 0; r < PIPE_GRID; r++) {
    for (let c = 0; c < PIPE_GRID; c++) {
      if (isPipeFixture(r, c, tank, engine)) continue;
      const turns = 1 + Math.floor(rng() * 3);
      for (let i = 0; i < turns; i++) out[r]![c] = rotateMask(out[r]![c]!);
    }
  }
  if (isPathComplete({ tiles: out, tank, engine })) {
    for (let r = 0; r < PIPE_GRID; r++) {
      for (let c = 0; c < PIPE_GRID; c++) {
        if (isPipeFixture(r, c, tank, engine)) continue;
        const mask = out[r]![c]!;
        const bits =
          (mask & 1) + ((mask >> 1) & 1) + ((mask >> 2) & 1) + ((mask >> 3) & 1);
        if (bits !== 2) continue;
        const opposite =
          (mask & DIR_N && mask & DIR_S) || (mask & DIR_E && mask & DIR_W);
        if (opposite) continue;
        out[r]![c] = rotateMask(mask);
        return out;
      }
    }
  }
  return out;
}

/** Cells fed from the tank through matching openings (path highlight). */
export function flowFromTank(state: PipeState): Set<string> {
  const seen = new Set<string>();
  const q: Array<[number, number]> = [[state.tank.r, state.tank.c]];
  seen.add(cellKey(state.tank.r, state.tank.c));
  while (q.length) {
    const [r, c] = q.pop()!;
    const mask = state.tiles[r]![c]!;
    for (const dir of [DIR_N, DIR_E, DIR_S, DIR_W]) {
      if ((mask & dir) === 0) continue;
      const [dr, dc] = DELTA[dir]!;
      const nr = r + dr;
      const nc = c + dc;
      if (!inGrid(nr, nc)) continue;
      if ((state.tiles[nr]![nc]! & OPPOSITE[dir]!) === 0) continue;
      const k = cellKey(nr, nc);
      if (seen.has(k)) continue;
      seen.add(k);
      q.push([nr, nc]);
    }
  }
  return seen;
}

export function isPathComplete(state: Pick<PipeState, "tiles" | "tank" | "engine">): boolean {
  return flowFromTank({
    tiles: state.tiles,
    tank: state.tank,
    engine: state.engine,
    rotates: 0,
    phase: "playing",
  }).has(cellKey(state.engine.r, state.engine.c));
}

export function startPipes(seed?: number): PipeState {
  const s = seed ?? (Date.now() ^ 0x7e77) >>> 0;
  const rng = mulberry32(s);
  const { tank, engine, path } = dealPath(rng);
  return {
    tiles: scrambleTiles(tilesFromPath(path), tank, engine, s),
    tank,
    engine,
    rotates: 0,
    phase: "playing",
  };
}

export function rotateTile(state: PipeState, r: number, c: number): PipeState {
  if (state.phase !== "playing") return state;
  if (!inGrid(r, c) || isPipeFixture(r, c, state.tank, state.engine)) return state;
  const tiles = cloneTiles(state.tiles);
  tiles[r]![c] = rotateMask(tiles[r]![c]!);
  const next: PipeState = {
    tiles,
    tank: state.tank,
    engine: state.engine,
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
  tank: PipeCell,
  engine: PipeCell,
): "tank" | "engine" | "pipe" {
  if (r === tank.r && c === tank.c) return "tank";
  if (r === engine.r && c === engine.c) return "engine";
  return "pipe";
}
