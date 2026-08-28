/**
 * Lab drill: urinal-rule-parking (#188).
 * Pure 1D ICUP grader — no DOM. Pads 0..n-1, index 0 nearest the hatch.
 *
 * Occupied is illegal. If any vacant pad has no occupied neighbor, pick the
 * vacant buffered pad that maximizes min-distance to the nearest occupied
 * (ties → highest index, furthest from hatch). Empty row → highest index.
 * If every vacant pad is adjacent to an occupied pad, Go around.
 */

export const URP_ROUNDS = 6;

export type UrpChoice = { kind: "pad"; index: number } | { kind: "go-around" };

export type UrpPhase = "playing" | "done";

export interface UrpRound {
  padCount: 5 | 7;
  occupied: readonly number[];
}

export interface UrpState {
  round: number;
  padCount: 5 | 7;
  occupied: readonly number[];
  phase: UrpPhase;
}

/** v1 ladder: 5-pad empty/buffer, then 7-pad buffer, punchline jam-7. */
export const URP_LADDER: readonly UrpRound[] = [
  { padCount: 5, occupied: [] },
  { padCount: 5, occupied: [4] },
  { padCount: 5, occupied: [0] },
  { padCount: 7, occupied: [0, 6] },
  { padCount: 7, occupied: [3] },
  { padCount: 7, occupied: [1, 3, 5] },
];

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

/** Legal move for a pad row. Occupied indices outside 0..n-1 are ignored. */
export function gradePads(padCount: number, occupied: readonly number[]): UrpChoice {
  const occ = occupiedSet(occupied.filter((i) => i >= 0 && i < padCount));
  const vacant: number[] = [];
  for (let i = 0; i < padCount; i++) {
    if (!occ.has(i)) vacant.push(i);
  }
  const buffered = vacant.filter((i) => !hasOccupiedNeighbor(i, occ));
  if (buffered.length === 0) {
    return { kind: "go-around" };
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

export function choicesEqual(a: UrpChoice, b: UrpChoice): boolean {
  if (a.kind === "go-around" || b.kind === "go-around") {
    return a.kind === "go-around" && b.kind === "go-around";
  }
  return a.index === b.index;
}

function stateForRound(round: number): UrpState {
  const idx = Math.min(Math.max(round, 1), URP_ROUNDS) - 1;
  const spec = URP_LADDER[idx]!;
  return {
    round,
    padCount: spec.padCount,
    occupied: spec.occupied,
    phase: "playing",
  };
}

export function startUrpDrill(): UrpState {
  return stateForRound(1);
}

export function applyUrpChoice(state: UrpState, choice: UrpChoice): {
  state: UrpState;
  ok: boolean;
  legal: UrpChoice;
} {
  const legal = gradePads(state.padCount, state.occupied);
  if (state.phase !== "playing") {
    return { state, ok: false, legal };
  }
  if (!choicesEqual(choice, legal)) {
    return { state, ok: false, legal };
  }
  if (state.round >= URP_ROUNDS) {
    return { state: { ...state, phase: "done" }, ok: true, legal };
  }
  return { state: stateForRound(state.round + 1), ok: true, legal };
}
