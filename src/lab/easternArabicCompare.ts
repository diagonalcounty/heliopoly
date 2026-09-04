/**
 * Lab drill: "which number is larger?" ladder (#81 core; #76 multi-script).
 * Pure logic — no DOM. Display glyphs live in `numberScripts.ts`.
 *
 * Win: clear R1 → R2 → R3 with **clean** (no-hint) correct answers in a row.
 * Hint: reveal one side in Western digits; a correct answer after a hint does
 * **not** advance the ladder — player must clear that digit level again clean.
 * Fail R1: stay R1; fail R2/R3: back to R1 (wipes clean-clear recap).
 * Cap: MAX_COMPARE_ROUNDS answers total; then lost if not won.
 * On win: `cleanClears` holds the three pairs for a recap (script + Western).
 *
 * #104: R2/R3 deals bias toward same leading digit so place value is the test.
 */

export { toEasternArabic } from "./numberScripts";

/** Total answers allowed per run (then win or lose). */
export const MAX_COMPARE_ROUNDS = 12;

export type CompareRound = 1 | 2 | 3;
export type CompareSide = "left" | "right";
export type ComparePhase = "playing" | "won" | "lost";

export interface ComparePair {
  left: number;
  right: number;
}

/** One clean (no-hint) ladder clear — used for end-of-win recap. */
export interface CleanClear {
  round: CompareRound;
  left: number;
  right: number;
  /** Side the player correctly picked as larger. */
  larger: CompareSide;
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
  /** Clean clears this streak (wiped when ladder resets to R1 on fail). */
  cleanClears: CleanClear[];
  /** Last miss shared a leading digit (place-value trap, #104). */
  lastMissSameLead: boolean;
}

export type Rng = () => number;

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

/** Share of R2/R3 deals that share a leading digit (place-value lever, #104). */
export const SAME_LEAD_RATE = 0.55;
/** Of R3 same-hundreds pairs, share that also match tens so only ones decide. */
export const SAME_HUNDREDS_TENS_RATE = 0.4;

/** Handbook / drill one-liner for the place-value trap. */
export const SAME_LEAD_HINT = "Same first digit — check the next place.";

export function tensPlace(n: number): number {
  return Math.floor(n / 10) % 10;
}

export function hundredsPlace(n: number): number {
  return Math.floor(n / 100) % 10;
}

/** R2: same tens digit. R3: same hundreds digit. R1: never. */
export function sharesLeadingDigit(
  left: number,
  right: number,
  round: CompareRound,
): boolean {
  if (round === 1) return false;
  if (round === 2) return Math.floor(left / 10) === Math.floor(right / 10);
  return Math.floor(left / 100) === Math.floor(right / 100);
}

/** R3 only: hundreds and tens match, so ones place decides. */
export function sharesHundredsAndTens(left: number, right: number): boolean {
  return left >= 100 && right >= 100 && Math.floor(left / 10) === Math.floor(right / 10);
}

function makeSameLeadR2(rng: Rng): ComparePair {
  const tens = randomInt(1, 9, rng);
  const onesA = randomInt(0, 9, rng);
  let onesB = randomInt(0, 9, rng);
  let guard = 0;
  while (onesB === onesA && guard++ < 16) {
    onesB = randomInt(0, 9, rng);
  }
  if (onesB === onesA) onesB = onesA === 9 ? 8 : onesA + 1;
  return { left: tens * 10 + onesA, right: tens * 10 + onesB };
}

function makeSameLeadR3(rng: Rng): ComparePair {
  const hundreds = randomInt(1, 9, rng);
  const shareTens = rng() < SAME_HUNDREDS_TENS_RATE;
  if (shareTens) {
    const tens = randomInt(0, 9, rng);
    const onesA = randomInt(0, 9, rng);
    let onesB = randomInt(0, 9, rng);
    let guard = 0;
    while (onesB === onesA && guard++ < 16) {
      onesB = randomInt(0, 9, rng);
    }
    if (onesB === onesA) onesB = onesA === 9 ? 8 : onesA + 1;
    return {
      left: hundreds * 100 + tens * 10 + onesA,
      right: hundreds * 100 + tens * 10 + onesB,
    };
  }
  const tensA = randomInt(0, 9, rng);
  let tensB = randomInt(0, 9, rng);
  let guard = 0;
  while (tensB === tensA && guard++ < 16) {
    tensB = randomInt(0, 9, rng);
  }
  if (tensB === tensA) tensB = tensA === 9 ? 8 : tensA + 1;
  const onesA = randomInt(0, 9, rng);
  const onesB = randomInt(0, 9, rng);
  return {
    left: hundreds * 100 + tensA * 10 + onesA,
    right: hundreds * 100 + tensB * 10 + onesB,
  };
}

/** Two unequal numbers in the range for the given round (no leading zeros on R2/R3). */
export function makeUnequalPair(round: CompareRound, rng: Rng = Math.random): ComparePair {
  if (round === 2 && rng() < SAME_LEAD_RATE) {
    return makeSameLeadR2(rng);
  }
  if (round === 3 && rng() < SAME_LEAD_RATE) {
    return makeSameLeadR3(rng);
  }
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
  cleanClears: CleanClear[],
  rng: Rng,
  lastMissSameLead = false,
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
    cleanClears,
    lastMissSameLead,
  };
}

export function startCompareDrill(rng: Rng = Math.random): CompareDrillState {
  return dealPair(1, 0, [], rng);
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

function recordClean(state: CompareDrillState): CleanClear[] {
  return [
    ...state.cleanClears,
    {
      round: state.round,
      left: state.left,
      right: state.right,
      larger: largerSide(state.left, state.right),
    },
  ];
}

/**
 * Apply a player choice.
 * - Wrong: R1 stay / R2–R3 → R1 (clears recap); attempt +1
 * - Correct + hint: stay on same digit level; attempt +1 (must clear again clean)
 * - Correct clean: record pair for recap; advance ladder; R3 clean → won
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
    // Ladder fail → wipe clean streak recap
    const missSameLead = sharesLeadingDigit(state.left, state.right, state.round);
    const next = dealPair(1, attempts, [], rng, missSameLead);
    if (attempts >= MAX_COMPARE_ROUNDS) {
      return { ...next, phase: "lost" };
    }
    return next;
  }

  // Correct but hinted — does not count toward the clean ladder
  if (state.hintUsed) {
    const next = dealPair(state.round, attempts, state.cleanClears, rng);
    if (attempts >= MAX_COMPARE_ROUNDS) {
      return { ...next, phase: "lost" };
    }
    return next;
  }

  // Clean correct — record for win recap
  const cleanClears = recordClean(state);

  if (state.round === 3) {
    return {
      ...state,
      attempts,
      phase: "won",
      hintUsed: false,
      hintSide: null,
      cleanClears,
      lastMissSameLead: false,
    };
  }

  const nextRound = (state.round + 1) as CompareRound;
  const next = dealPair(nextRound, attempts, cleanClears, rng);
  if (attempts >= MAX_COMPARE_ROUNDS) {
    return { ...next, phase: "lost", cleanClears: [] };
  }
  return next;
}

export function resetCompareDrill(rng: Rng = Math.random): CompareDrillState {
  return startCompareDrill(rng);
}

export function playAgainCompareDrill(rng: Rng = Math.random): CompareDrillState {
  return startCompareDrill(rng);
}
