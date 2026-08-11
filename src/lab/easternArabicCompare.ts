/**
 * Lab drill: Eastern Arabic digit literacy via "which number is larger?" (#81).
 * Pure logic — no DOM.
 *
 * Win: clear R1 → R2 → R3 with **clean** (no-hint) correct answers in a row.
 * Hint: reveal one side in Western digits; a correct answer after a hint does
 * **not** advance the ladder — player must clear that digit level again clean.
 * Fail R1: stay R1; fail R2/R3: back to R1.
 * Cap: MAX_COMPARE_ROUNDS answers total; then lost if not won.
 */

const EASTERN_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

/** Total answers allowed per run (then win or lose). */
export const MAX_COMPARE_ROUNDS = 12;

export type CompareRound = 1 | 2 | 3;
export type CompareSide = "left" | "right";
export type ComparePhase = "playing" | "won" | "lost";

export interface ComparePair {
  left: number;
  right: number;
}

export interface CompareDrillState {
  /** Digit difficulty / clean ladder step (1 → 2 → 3). */
  round: CompareRound;
  left: number;
  right: number;
  phase: ComparePhase;
  /** Answers submitted this run (0 … MAX_COMPARE_ROUNDS). */
  attempts: number;
  /** Hint used on the current pair. */
  hintUsed: boolean;
  /** Which side is shown in Western digits (if hinted). */
  hintSide: CompareSide | null;
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
    right = left >= max ? left - 1 : left + 1;
  }
  return { left, right };
}

function dealPair(
  round: CompareRound,
  attempts: number,
  rng: Rng,
): CompareDrillState {
  const { left, right } = makeUnequalPair(round, rng);
  return {
    round,
    left,
    right,
    phase: "playing",
    attempts,
    hintUsed: false,
    hintSide: null,
  };
}

export function startCompareDrill(rng: Rng = Math.random): CompareDrillState {
  return dealPair(1, 0, rng);
}

/**
 * Reveal one of the two numbers in Western digits (once per pair).
 * Marks the pair as hinted so a correct answer will not advance the clean ladder.
 */
export function useCompareHint(
  state: CompareDrillState,
  rng: Rng = Math.random,
): CompareDrillState {
  if (state.phase !== "playing" || state.hintUsed) return state;
  const side: CompareSide = rng() < 0.5 ? "left" : "right";
  return { ...state, hintUsed: true, hintSide: side };
}

/**
 * Apply a player choice.
 * - Wrong: R1 stay / R2–R3 → R1; attempt +1
 * - Correct + hint: stay on same digit level; attempt +1 (must clear again clean)
 * - Correct clean: advance ladder; R3 clean → won
 * - After answer, if attempts ≥ MAX and not won → lost
 */
export function applyCompareChoice(
  state: CompareDrillState,
  choice: CompareSide,
  rng: Rng = Math.random,
): CompareDrillState {
  if (state.phase !== "playing") return state;

  const attempts = state.attempts + 1;
  const correct = largerSide(state.left, state.right);

  if (choice !== correct) {
    const next = dealPair(1, attempts, rng);
    if (attempts >= MAX_COMPARE_ROUNDS) {
      return { ...next, phase: "lost" };
    }
    return next;
  }

  // Correct but hinted — does not count toward the clean ladder
  if (state.hintUsed) {
    const next = dealPair(state.round, attempts, rng);
    if (attempts >= MAX_COMPARE_ROUNDS) {
      return { ...next, phase: "lost" };
    }
    return next;
  }

  // Clean correct
  if (state.round === 3) {
    return {
      ...state,
      attempts,
      phase: "won",
      hintUsed: false,
      hintSide: null,
    };
  }

  const nextRound = (state.round + 1) as CompareRound;
  const next = dealPair(nextRound, attempts, rng);
  // Still need more clean rounds but out of attempts
  if (attempts >= MAX_COMPARE_ROUNDS) {
    return { ...next, phase: "lost" };
  }
  return next;
}

export function resetCompareDrill(rng: Rng = Math.random): CompareDrillState {
  return startCompareDrill(rng);
}

export function playAgainCompareDrill(rng: Rng = Math.random): CompareDrillState {
  return startCompareDrill(rng);
}
