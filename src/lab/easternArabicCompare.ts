/**
 * Lab drill: Eastern Arabic digit literacy via "which number is larger?" (#81).
 * Pure logic — no DOM.
 */

const EASTERN_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

export type CompareRound = 1 | 2 | 3;
export type CompareSide = "left" | "right";
export type ComparePhase = "playing" | "won";

export interface ComparePair {
  left: number;
  right: number;
}

export interface CompareDrillState {
  round: CompareRound;
  left: number;
  right: number;
  phase: ComparePhase;
}

export type Rng = () => number;

/** Western integer → Eastern Arabic digit string (no leading-zero padding). */
export function toEasternArabic(n: number): string {
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    throw new RangeError(`toEasternArabic expects non-negative integer, got ${n}`);
  }
  return String(n).replace(/\d/g, (d) => EASTERN_DIGITS[Number(d)]!);
}

export function largerSide(left: number, right: number): CompareSide {
  if (left === right) {
    throw new Error("largerSide requires unequal values");
  }
  return left > right ? "left" : "right";
}

function rangeForRound(round: CompareRound): { min: number; max: number } {
  if (round === 1) return { min: 0, max: 9 };
  if (round === 2) return { min: 10, max: 99 };
  return { min: 100, max: 999 };
}

function randomInt(min: number, max: number, rng: Rng): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Two unequal numbers in the range for the given round (no leading zeros on R2/R3). */
export function makeUnequalPair(round: CompareRound, rng: Rng = Math.random): ComparePair {
  const { min, max } = rangeForRound(round);
  const left = randomInt(min, max, rng);
  let right = randomInt(min, max, rng);
  let guard = 0;
  while (right === left && guard++ < 32) {
    right = randomInt(min, max, rng);
  }
  if (right === left) {
    // Degenerate rng: force a neighbor in range
    right = left >= max ? left - 1 : left + 1;
  }
  return { left, right };
}

export function freshRoundState(round: CompareRound, rng: Rng = Math.random): CompareDrillState {
  const { left, right } = makeUnequalPair(round, rng);
  return { round, left, right, phase: "playing" };
}

export function startCompareDrill(rng: Rng = Math.random): CompareDrillState {
  return freshRoundState(1, rng);
}

/**
 * Apply a player choice. Wrong answers: no feedback payload — only state change.
 * R1 wrong → stay R1 new pair; R2/R3 wrong → R1; R3 correct → won.
 */
export function applyCompareChoice(
  state: CompareDrillState,
  choice: CompareSide,
  rng: Rng = Math.random,
): CompareDrillState {
  if (state.phase === "won") return state;

  const correct = largerSide(state.left, state.right);
  if (choice !== correct) {
    // Fail R1: stay; fail R2/R3: back to R1
    return freshRoundState(1, rng);
  }

  if (state.round === 1) return freshRoundState(2, rng);
  if (state.round === 2) return freshRoundState(3, rng);
  return { ...state, phase: "won" };
}

export function playAgainCompareDrill(rng: Rng = Math.random): CompareDrillState {
  return startCompareDrill(rng);
}
