/** Mulberry32 — deterministic PRNG for self-play. */

export function createRng(seed = Date.now() >>> 0): {
  next: () => number;
  int: (min: number, maxInclusive: number) => number;
  getState: () => number;
  setState: (s: number) => void;
} {
  let state = seed || 1;
  const next = () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int(min, maxInclusive) {
      return min + Math.floor(next() * (maxInclusive - min + 1));
    },
    getState: () => state,
    setState: (s: number) => {
      state = s;
    },
  };
}

export function roll2d6(rng: { int: (a: number, b: number) => number }): {
  d1: number;
  d2: number;
  total: number;
  doubles: boolean;
} {
  const d1 = rng.int(1, 6);
  const d2 = rng.int(1, 6);
  return { d1, d2, total: d1 + d2, doubles: d1 === d2 };
}
