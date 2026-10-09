/**
 * Urinal-rule Parking (#292). One generated row per level, like the slide
 * puzzle's 3.1, 3.2, … sequence. Nothing is a saved map.
 *
 * Level P.R uses P pads. R is the screen inside that size (1, 2, 3), then
 * the next size starts. After 8 pads the round keeps climbing (8.4, 8.5, …).
 * The ships already down are a pure function of the run seed and the level.
 *
 * A screen asks for R parks, in order. Each tap is graded against the row
 * as it stands. A correct park updates that row and the next ship is graded
 * again. A wrong empty pad costs one clearance and does not land. There is
 * no second area and no go-around.
 *
 * Origin is pad 0, the hatch. Among vacant pads that keep a gap, pick the
 * one farthest from the nearest occupied pad. Ties go to the lowest index.
 * An empty row assigns pad 0. If every vacant pad touches an occupied pad,
 * the correct pad is the lowest vacant index.
 *
 * Clearances start at 3 and cap at 5. A larger row restores 1. A correct
 * park scores 100 × (pads − 3). The run ends at 0 clearances.
 */

export const URP_TOWER_TITLE = "Urinal-rule Parking";
export const URP_TOWER_BLURB =
  "Each row is built from the level. Park the ships in order. Leave a gap when you can. Closest to the hatch breaks a tie.";

export const URP_START_CLEARANCES = 3;
export const URP_MAX_CLEARANCES = 5;
export const URP_MIN_PADS = 4;
export const URP_MAX_PADS = 8;
export const URP_ROUNDS_PER_SIZE = 3;
export const URP_POINTS_PER_LEVEL = 100;

export type UrpTowerPhase = "playing" | "over";
export type UrpTowerNote = "ask" | "taken" | "parked" | "next" | "wrong" | "over";

export interface UrpTowerState {
  seed: number;
  /** 1-based screen in the endless run. */
  screen: number;
  padCount: number;
  /** 1-based screen inside this pad count. Keeps climbing after 8 pads. */
  round: number;
  /** How many ships this screen asks for. */
  asks: number;
  /** How many of those ships are already parked this screen. */
  step: number;
  occupied: readonly number[];
  clearances: number;
  score: number;
  parkedCorrect: number;
  phase: UrpTowerPhase;
  lastParked: number | null;
  lastPoints: number;
  lastClearanceLost: boolean;
  tightPark: boolean;
  restoredClearance: boolean;
  note: UrpTowerNote;
}

export function padsForScreen(screen: number): number {
  const band = Math.floor(Math.max(0, screen - 1) / URP_ROUNDS_PER_SIZE);
  return Math.min(URP_MAX_PADS, URP_MIN_PADS + band);
}

export function roundForScreen(screen: number): number {
  const index = Math.max(0, screen - 1);
  const band = Math.floor(index / URP_ROUNDS_PER_SIZE);
  if (URP_MIN_PADS + band <= URP_MAX_PADS) return (index % URP_ROUNDS_PER_SIZE) + 1;
  const firstCapped = (URP_MAX_PADS - URP_MIN_PADS) * URP_ROUNDS_PER_SIZE + 1;
  return screen - firstCapped + 1;
}

export function pointsForPads(padCount: number): number {
  return URP_POINTS_PER_LEVEL * Math.max(1, padCount - (URP_MIN_PADS - 1));
}

export function stepUrpRng(rng: number): { value: number; rng: number } {
  let a = rng >>> 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, rng: a >>> 0 };
}

function mixSeed(seed: number, screen: number): number {
  const mixed = (seed ^ Math.imul(screen, 0x9e3779b1)) >>> 0;
  return mixed === 0 ? 1 : mixed;
}

function hasOccupiedNeighbor(index: number, occupied: ReadonlySet<number>): boolean {
  return occupied.has(index - 1) || occupied.has(index + 1);
}

function minDist(index: number, occupied: readonly number[]): number {
  if (occupied.length === 0) return Number.POSITIVE_INFINITY;
  let min = Number.POSITIVE_INFINITY;
  for (const o of occupied) {
    const d = Math.abs(o - index);
    if (d < min) min = d;
  }
  return min;
}

/** Correct vacant pad, or null when the row is full. */
export function gradeTower(
  padCount: number,
  occupied: readonly number[],
): { index: number } | null {
  const occ = new Set(occupied.filter((i) => i >= 0 && i < padCount));
  const vacant: number[] = [];
  for (let i = 0; i < padCount; i++) {
    if (!occ.has(i)) vacant.push(i);
  }
  if (vacant.length === 0) return null;
  const buffered = vacant.filter((i) => !hasOccupiedNeighbor(i, occ));
  const pool = buffered.length > 0 ? buffered : vacant;
  let best = pool[0]!;
  let bestDist = minDist(best, occupied);
  for (let k = 1; k < pool.length; k++) {
    const i = pool[k]!;
    const d = minDist(i, occupied);
    if (d > bestDist || (d === bestDist && i < best)) {
      best = i;
      bestDist = d;
    }
  }
  return { index: best };
}

function correctIsTight(padCount: number, occupied: readonly number[]): boolean {
  const grade = gradeTower(padCount, occupied);
  if (!grade) return false;
  return hasOccupiedNeighbor(grade.index, new Set(occupied));
}

function pickIndices(padCount: number, count: number, rng: number): { indices: number[]; rng: number } {
  const bag = Array.from({ length: padCount }, (_, i) => i);
  const picked: number[] = [];
  let state = rng;
  for (let n = 0; n < count; n++) {
    const roll = stepUrpRng(state);
    state = roll.rng;
    const slot = Math.floor(roll.value * (bag.length - n));
    const index = bag[slot]!;
    bag[slot] = bag[bag.length - 1 - n]!;
    picked.push(index);
  }
  picked.sort((a, b) => a - b);
  return { indices: picked, rng: state };
}

export interface UrpScreenLayout {
  padCount: number;
  round: number;
  asks: number;
  occupied: readonly number[];
}

/** Ships already down, plus how many the player must still park, for one screen. */
export function layoutForScreen(seed: number, screen: number): UrpScreenLayout {
  const padCount = padsForScreen(screen);
  const round = roundForScreen(screen);
  // Leave one decoy pad so the last ship in the sequence is still a choice.
  const asks = Math.min(round, padCount - 2);
  const maxOccupied = padCount - asks - 1;
  const minOccupied = 1;
  let rng = mixSeed(seed, screen);
  const span = maxOccupied - minOccupied + 1;
  const roll = stepUrpRng(rng);
  rng = roll.rng;
  const occCount = minOccupied + Math.floor(roll.value * span);
  const picked = pickIndices(padCount, occCount, rng);
  return { padCount, round, asks, occupied: picked.indices };
}

function screenState(
  seed: number,
  screen: number,
  carried: Pick<UrpTowerState, "clearances" | "score" | "parkedCorrect">,
  note: UrpTowerNote,
  restoredClearance: boolean,
): UrpTowerState {
  const layout = layoutForScreen(seed, screen);
  return {
    seed,
    screen,
    padCount: layout.padCount,
    round: layout.round,
    asks: layout.asks,
    step: 0,
    occupied: layout.occupied,
    clearances: carried.clearances,
    score: carried.score,
    parkedCorrect: carried.parkedCorrect,
    phase: "playing",
    lastParked: null,
    lastPoints: 0,
    lastClearanceLost: false,
    tightPark: false,
    restoredClearance,
    note,
  };
}

export function startUrpTower(seed: number = Date.now() >>> 0): UrpTowerState {
  return screenState(
    seed >>> 0,
    1,
    {
      clearances: URP_START_CLEARANCES,
      score: 0,
      parkedCorrect: 0,
    },
    "ask",
    false,
  );
}

export interface UrpAssignResult {
  state: UrpTowerState;
  accepted: boolean;
}

export function assignUrpTower(state: UrpTowerState, index: number): UrpAssignResult {
  if (state.phase !== "playing") return { state, accepted: false };
  if (index < 0 || index >= state.padCount || state.occupied.includes(index)) {
    return { state: { ...state, note: "taken", restoredClearance: false }, accepted: false };
  }
  const grade = gradeTower(state.padCount, state.occupied);
  if (!grade) return { state, accepted: false };
  if (grade.index !== index) {
    const clearances = state.clearances - 1;
    return {
      state: {
        ...state,
        clearances,
        phase: clearances <= 0 ? "over" : "playing",
        note: clearances <= 0 ? "over" : "wrong",
        lastParked: null,
        lastPoints: 0,
        lastClearanceLost: true,
        tightPark: false,
        restoredClearance: false,
      },
      accepted: true,
    };
  }
  const points = pointsForPads(state.padCount);
  const occupied = [...state.occupied, index].sort((a, b) => a - b);
  const step = state.step + 1;
  const parkedCorrect = state.parkedCorrect + 1;
  const score = state.score + points;
  const tightPark = correctIsTight(state.padCount, state.occupied);
  if (step < state.asks) {
    return {
      state: {
        ...state,
        occupied,
        step,
        score,
        parkedCorrect,
        lastParked: index,
        lastPoints: points,
        lastClearanceLost: false,
        tightPark,
        restoredClearance: false,
        note: "parked",
      },
      accepted: true,
    };
  }
  const nextScreen = state.screen + 1;
  const nextPads = padsForScreen(nextScreen);
  const grew = nextPads > state.padCount;
  const restored = Math.min(
    URP_MAX_CLEARANCES,
    state.clearances + (grew ? 1 : 0),
  );
  const next = screenState(
    state.seed,
    nextScreen,
    { clearances: restored, score, parkedCorrect },
    "next",
    restored > state.clearances,
  );
  return { state: next, accepted: true };
}

export function formatUrpTowerMeter(state: UrpTowerState): string {
  const ship = state.phase === "playing" ? state.step + 1 : state.asks;
  return `Level ${state.padCount}.${state.round} · Ship ${ship} of ${state.asks} · ${state.score} · Clearances ${state.clearances}`;
}

export function formatUrpTowerStatus(state: UrpTowerState): string {
  if (state.note === "taken") return "That pad is taken.";
  if (state.note === "ask") return "Where does this ship park?";
  if (state.note === "wrong") return "Too close. One clearance.";
  if (state.note === "over") return "No clearances left.";
  if (state.note === "next") {
    const back = state.restoredClearance ? " One clearance back." : "";
    return `Next row. Level ${state.padCount}.${state.round}.${back}`;
  }
  if (state.tightPark) return `No gap was open. Parked. +${state.lastPoints}.`;
  return `Parked. +${state.lastPoints}. Next ship.`;
}

export function urpTowerLevelLabel(state: UrpTowerState): string {
  return `${state.padCount}.${state.round}`;
}

export function urpTowerStatsLine(state: UrpTowerState): string {
  const ships =
    state.parkedCorrect === 1 ? "1 parked clean" : `${state.parkedCorrect} parked clean`;
  return `${state.score} points · ${ships}`;
}
