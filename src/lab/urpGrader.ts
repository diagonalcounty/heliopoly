/**
 * Lab drill: urinal-rule-parking (#188).
 * Pure 1D ICUP grader — no DOM. Pads 0..n-1, index 0 nearest the hatch.
 *
 * Occupied is illegal. If any vacant pad has no occupied neighbor, pick the
 * vacant buffered pad that maximizes min-distance to the nearest occupied
 * (ties → highest index, furthest from hatch). Empty row → highest index.
 * If every vacant pad is adjacent to an occupied pad, there is no legal pad.
 *
 * Jacob is the incoming ship. Occupied pads are others already down.
 * Play is a pool of six occupancy snapshots (5-pad and 7-pad). Three looks.
 * Orbit loads a different snapshot; landings do not accumulate. After the
 * third look, Orbit is dead and they must land. A legal empty pad is no fine;
 * a rude/adjacent empty is a fine. Occupied is not a land.
 */

export const URP_LOOKS = 3;
export const URP_HINTS = 2;
export const URP_POOL = 6;

export type UrpPadCount = 5 | 7;

export interface UrpScreen {
  padCount: UrpPadCount;
  occupied: readonly number[];
}

export type UrpGrade = { kind: "pad"; index: number } | { kind: "none" };

export type UrpPhase = "playing" | "landed";

export type UrpOutcome = "good" | "fine";

export interface UrpState {
  screens: readonly UrpScreen[];
  /** 1-based look (1..URP_LOOKS). */
  look: number;
  screenIndex: number;
  usedScreenIndices: readonly number[];
  hintsLeft: number;
  phase: UrpPhase;
  lastLanded: number | null;
  outcome: UrpOutcome | null;
}

function occupiedSet(occupied: readonly number[]): Set<number> {
  return new Set(occupied);
}

function hasOccupiedNeighbor(index: number, occupied: Set<number>): boolean {
  return occupied.has(index - 1) || occupied.has(index + 1);
}

function minDistToOccupied(index: number, occupied: readonly number[]): number {
  if (occupied.length === 0) return Number.POSITIVE_INFINITY;
  let min = Number.POSITIVE_INFINITY;
  for (const o of occupied) {
    const d = Math.abs(o - index);
    if (d < min) min = d;
  }
  return min;
}

/** Legal pad for a row, or none when every vacant pad is adjacent to occupied. */
export function gradePads(padCount: number, occupied: readonly number[]): UrpGrade {
  const occ = occupiedSet(occupied.filter((i) => i >= 0 && i < padCount));
  const vacant: number[] = [];
  for (let i = 0; i < padCount; i++) {
    if (!occ.has(i)) vacant.push(i);
  }
  const buffered = vacant.filter((i) => !hasOccupiedNeighbor(i, occ));
  if (buffered.length === 0) {
    return { kind: "none" };
  }
  let best = buffered[0]!;
  let bestDist = minDistToOccupied(best, occupied);
  for (let k = 1; k < buffered.length; k++) {
    const i = buffered[k]!;
    const d = minDistToOccupied(i, occupied);
    if (d > bestDist || (d === bestDist && i > best)) {
      best = i;
      bestDist = d;
    }
  }
  return { kind: "pad", index: best };
}

export function gradeScreen(screen: UrpScreen): UrpGrade {
  return gradePads(screen.padCount, screen.occupied);
}

export function hasLegalPad(screen: UrpScreen): boolean {
  return gradeScreen(screen).kind === "pad";
}

export function currentUrpScreen(state: UrpState): UrpScreen {
  return state.screens[state.screenIndex]!;
}

/** Remaining looks including the current one (3/3 … 1/3). 0 after landing. */
export function urpLooksChrome(state: UrpState): string {
  if (state.phase === "landed") return `0/${URP_LOOKS}`;
  return `${URP_LOOKS - state.look + 1}/${URP_LOOKS}`;
}

export function canOrbit(state: UrpState): boolean {
  return state.phase === "playing" && state.look < URP_LOOKS;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(arr: T[], rnd: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

function randomOccupied(padCount: number, rnd: () => number): number[] {
  const k = 1 + Math.floor(rnd() * (padCount - 1));
  const idx = Array.from({ length: padCount }, (_, i) => i);
  shuffleInPlace(idx, rnd);
  return idx.slice(0, k).sort((a, b) => a - b);
}

/** Six occupancy snapshots; at least one has a legal skip-a-pad landing. */
export function buildUrpPool(seed: number): UrpScreen[] {
  const rnd = mulberry32(seed);
  const screens: UrpScreen[] = [];
  for (let i = 0; i < URP_POOL; i++) {
    const padCount: UrpPadCount = i % 2 === 0 ? 5 : 7;
    screens.push({ padCount, occupied: randomOccupied(padCount, rnd) });
  }
  shuffleInPlace(screens, rnd);
  if (!screens.some(hasLegalPad)) {
    screens[0] = { padCount: 5, occupied: [0] };
  }
  return screens;
}

function freshState(screens: readonly UrpScreen[], screenIndex: number): UrpState {
  return {
    screens,
    look: 1,
    screenIndex,
    usedScreenIndices: [screenIndex],
    hintsLeft: URP_HINTS,
    phase: "playing",
    lastLanded: null,
    outcome: null,
  };
}

export function startUrpDrill(seed: number = Date.now() >>> 0): UrpState {
  return freshState(buildUrpPool(seed), 0);
}

/** Test helper: start on a known pool (screen 0 first). */
export function startUrpFromPool(screens: readonly UrpScreen[]): UrpState {
  if (screens.length < 1) throw new Error("urp pool empty");
  return freshState(screens, 0);
}

function nextUnusedScreen(state: UrpState): number | null {
  const n = state.screens.length;
  const used = new Set(state.usedScreenIndices);
  for (let k = 1; k < n; k++) {
    const i = (state.screenIndex + k) % n;
    if (!used.has(i)) return i;
  }
  return null;
}

/** Load a different snapshot. No-op after the third look or after landing. */
export function orbitUrp(state: UrpState): UrpState {
  if (!canOrbit(state)) return state;
  const next = nextUnusedScreen(state);
  if (next == null) return state;
  return {
    ...state,
    look: state.look + 1,
    screenIndex: next,
    usedScreenIndices: [...state.usedScreenIndices, next],
    lastLanded: null,
    outcome: null,
  };
}

export function landUrp(
  state: UrpState,
  index: number,
): { state: UrpState; ok: boolean } {
  if (state.phase !== "playing") return { state, ok: false };
  const screen = currentUrpScreen(state);
  if (index < 0 || index >= screen.padCount) return { state, ok: false };
  if (screen.occupied.includes(index)) return { state, ok: false };
  const legal = gradeScreen(screen);
  const good = legal.kind === "pad" && legal.index === index;
  return {
    state: {
      ...state,
      phase: "landed",
      lastLanded: index,
      outcome: good ? "good" : "fine",
    },
    ok: true,
  };
}

/**
 * Spend one hint charge (2 → 1 → 0).
 * flashIndex is the legal empty pad on this screen, or null on a
 * violation-only screen (hint does not invent a legal pad).
 */
export function hintUrp(state: UrpState): { state: UrpState; flashIndex: number | null } {
  if (state.phase !== "playing" || state.hintsLeft <= 0) {
    return { state, flashIndex: null };
  }
  const legal = gradeScreen(currentUrpScreen(state));
  return {
    state: { ...state, hintsLeft: state.hintsLeft - 1 },
    flashIndex: legal.kind === "pad" ? legal.index : null,
  };
}
