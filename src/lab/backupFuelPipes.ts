/**
 * Lab drill: backup-fuel pipe routing (#77 / #201).
 * Rotate-only 6×6; tank and engine on the perimeter (deal-to-deal).
 * A scrambled tank→engine path of ~8–16 cells is always restorable;
 * leftover cells are decoy pipes. Untimed. No Mainline / src/core.
 *
 * v1 5×5 used a full-grid Hamiltonian snake. On 6×6 that is one 36-cell
 * unique run — theoretically solvable, practically unwinnable (#201 HITL).
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

const ELBOWS = [DIR_N | DIR_E, DIR_E | DIR_S, DIR_S | DIR_W, DIR_W | DIR_N];
const STRAIGHTS = [DIR_N | DIR_S, DIR_E | DIR_W];

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

function neighborsOf(r: number, c: number): PipeCell[] {
  const out: PipeCell[] = [];
  if (r > 0) out.push({ r: r - 1, c });
  if (r + 1 < PIPE_GRID) out.push({ r: r + 1, c });
  if (c > 0) out.push({ r, c: c - 1 });
  if (c + 1 < PIPE_GRID) out.push({ r, c: c + 1 });
  return out;
}

function shortestPath(from: PipeCell, to: PipeCell, blocked: Set<string>): PipeCell[] | null {
  const startK = cellKey(from.r, from.c);
  const prev = new Map<string, string | null>();
  prev.set(startK, null);
  const q: PipeCell[] = [from];
  while (q.length) {
    const cur = q.shift()!;
    if (cur.r === to.r && cur.c === to.c) {
      const path: PipeCell[] = [];
      let k: string | null = cellKey(cur.r, cur.c);
      while (k) {
        const [rs, cs] = k.split(",");
        path.push({ r: Number(rs), c: Number(cs) });
        k = prev.get(k) ?? null;
      }
      path.reverse();
      return path;
    }
    for (const n of neighborsOf(cur.r, cur.c)) {
      const k = cellKey(n.r, n.c);
      if (prev.has(k)) continue;
      if (blocked.has(k) && !(n.r === to.r && n.c === to.c)) continue;
      prev.set(k, cellKey(cur.r, cur.c));
      q.push(n);
    }
  }
  return null;
}

function wanderPath(tank: PipeCell, engine: PipeCell, rng: () => number): PipeCell[] {
  const target = 8 + Math.floor(rng() * 9);
  for (let attempt = 0; attempt < 36; attempt++) {
    const path: PipeCell[] = [{ ...tank }];
    const used = new Set([cellKey(tank.r, tank.c)]);
    while (path.length < target) {
      const cur = path[path.length - 1]!;
      if (cur.r === engine.r && cur.c === engine.c) break;
      let opts = neighborsOf(cur.r, cur.c).filter((n) => !used.has(cellKey(n.r, n.c)));
      if (path.length < target - 1) {
        const withoutEng = opts.filter((n) => n.r !== engine.r || n.c !== engine.c);
        if (withoutEng.length) opts = withoutEng;
      }
      if (!opts.length) break;
      const nxt = opts[Math.floor(rng() * opts.length)]!;
      path.push(nxt);
      used.add(cellKey(nxt.r, nxt.c));
    }
    const last = path[path.length - 1]!;
    if (last.r === engine.r && last.c === engine.c && path.length >= 6) return path;
    const blocked = new Set(used);
    blocked.delete(cellKey(last.r, last.c));
    const tail = shortestPath(last, engine, blocked);
    if (tail && tail.length > 1) {
      const combined = path.concat(tail.slice(1));
      if (combined.length >= 6) return combined;
    }
  }
  return shortestPath(tank, engine, new Set()) ?? [tank, engine];
}

function pickFixtures(rng: () => number): { tank: PipeCell; engine: PipeCell } {
  const peri = perimeterCells();
  for (let i = 0; i < 24; i++) {
    const tank = peri[Math.floor(rng() * peri.length)]!;
    const cands = peri.filter((p) => {
      if (p.r === tank.r && p.c === tank.c) return false;
      const man = Math.abs(p.r - tank.r) + Math.abs(p.c - tank.c);
      return man >= 3;
    });
    if (!cands.length) continue;
    return { tank, engine: cands[Math.floor(rng() * cands.length)]! };
  }
  return { tank: { r: 0, c: 0 }, engine: { r: PIPE_GRID - 1, c: PIPE_GRID - 1 } };
}

function dealPath(rng: () => number): {
  tank: PipeCell;
  engine: PipeCell;
  path: PipeCell[];
} {
  const { tank, engine } = pickFixtures(rng);
  const path = wanderPath(tank, engine, rng);
  return { tank: path[0]!, engine: path[path.length - 1]!, path };
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

function fillDecoys(tiles: number[][], rng: () => number): void {
  for (let r = 0; r < PIPE_GRID; r++) {
    for (let c = 0; c < PIPE_GRID; c++) {
      if (tiles[r]![c]) continue;
      const pool = rng() < 0.35 ? STRAIGHTS : ELBOWS;
      tiles[r]![c] = pool[Math.floor(rng() * pool.length)]!;
    }
  }
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

export function solvedDeal(seed: number): {
  tiles: number[][];
  tank: PipeCell;
  engine: PipeCell;
  pathLen: number;
} {
  const rng = mulberry32(seed);
  const { tank, engine, path } = dealPath(rng);
  const tiles = tilesFromPath(path);
  fillDecoys(tiles, rng);
  return { tiles, tank, engine, pathLen: path.length };
}

export function startPipes(seed?: number): PipeState {
  const s = seed ?? (Date.now() ^ 0x7e77) >>> 0;
  const solved = solvedDeal(s);
  return {
    tiles: scrambleTiles(solved.tiles, solved.tank, solved.engine, s),
    tank: solved.tank,
    engine: solved.engine,
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
