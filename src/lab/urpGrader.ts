/**
 * Lab drill: urinal-rule-parking (#188).
 * Pure 1D ICUP grader — no DOM. Pads 0..n-1, index 0 nearest the hatch.
 *
 * Occupied is illegal. If any vacant pad has no occupied neighbor, pick the
 * vacant buffered pad that maximizes min-distance to the nearest occupied
 * (ties → highest index, furthest from hatch). Empty row → highest index.
 * If every vacant pad is adjacent to an occupied pad, Go around.
 *
 * Play is one accumulating apron, then a bigger one: 5-pad fill until jam,
 * Go around, 7-pad fill until jam. Landings stay; the jam is the punchline.
 */

export const URP_ACTS = 2;

export type UrpChoice = { kind: "pad"; index: number } | { kind: "go-around" };

export type UrpPhase = "playing" | "done";

export type UrpAct = 1 | 2;

export interface UrpState {
  act: UrpAct;
  padCount: 5 | 7;
  occupied: readonly number[];
  lastLanded: number | null;
  phase: UrpPhase;
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

export function startUrpDrill(): UrpState {
  return {
    act: 1,
    padCount: 5,
    occupied: [],
    lastLanded: null,
    phase: "playing",
  };
}

export function applyUrpChoice(
  state: UrpState,
  choice: UrpChoice,
): {
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
  if (choice.kind === "pad") {
    return {
      state: {
        ...state,
        occupied: [...state.occupied, choice.index],
        lastLanded: choice.index,
      },
      ok: true,
      legal,
    };
  }
  if (state.act === 1) {
    return {
      state: {
        act: 2,
        padCount: 7,
        occupied: [],
        lastLanded: null,
        phase: "playing",
      },
      ok: true,
      legal,
    };
  }
  return {
    state: { ...state, phase: "done", lastLanded: null },
    ok: true,
    legal,
  };
}
