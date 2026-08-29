/**
 * Lab drill: Deseret alphabet flash-match (#79).
 * Show a capital Deseret glyph → pick the Latin letter. 8/10 wins.
 * Practice only — no GameState / src/core.
 */

export const ROUND_LENGTH = 10;
export const WIN_CORRECT = 8;
export const CHOICE_COUNT = 4;

export type DeseretPhase = "playing" | "reveal" | "won" | "lost";

export type Rng = () => number;

export interface DeseretGlyph {
  /** Stable id (unicode name slug). */
  id: string;
  /** Unicode character name, without the DESERET CAPITAL LETTER prefix. */
  name: string;
  /** Deseret capital codepoint (U+10400 block). */
  codepoint: number;
  /** Latin teaching label shown on the choice buttons. */
  latin: string;
}

/**
 * v1 inventory — 12 high-frequency Deseret capitals (#79 table).
 * Latin pick for LONG E is AY (not Ē).
 */
export const DESERET_INVENTORY: readonly DeseretGlyph[] = [
  { id: "short-a", name: "SHORT A", codepoint: 0x10408, latin: "A" },
  { id: "short-i", name: "SHORT I", codepoint: 0x10406, latin: "I" },
  { id: "short-e", name: "SHORT E", codepoint: 0x10407, latin: "E" },
  { id: "long-e", name: "LONG E", codepoint: 0x10401, latin: "AY" },
  { id: "long-o", name: "LONG O", codepoint: 0x10404, latin: "O" },
  { id: "tee", name: "TEE", codepoint: 0x10413, latin: "T" },
  { id: "dee", name: "DEE", codepoint: 0x10414, latin: "D" },
  { id: "kay", name: "KAY", codepoint: 0x10417, latin: "K" },
  { id: "es", name: "ES", codepoint: 0x1041d, latin: "S" },
  { id: "el", name: "EL", codepoint: 0x10422, latin: "L" },
  { id: "em", name: "EM", codepoint: 0x10423, latin: "M" },
  { id: "en", name: "EN", codepoint: 0x10424, latin: "N" },
] as const;

export interface DeseretPrompt {
  glyph: DeseretGlyph;
  /** Four Latin labels: 1 correct + 3 inventory distractors. */
  choices: string[];
}

export interface DeseretState {
  phase: DeseretPhase;
  /** Prompts answered this round (0 … ROUND_LENGTH). */
  asked: number;
  correct: number;
  prompt: DeseretPrompt;
  /** Glyph ids already used this round (avoid repeats while inventory lasts). */
  usedIds: string[];
  /** On reveal: the Latin that should have been picked. */
  revealedLatin: string | null;
}

export function glyphChar(g: DeseretGlyph): string {
  return String.fromCodePoint(g.codepoint);
}

export function latinLabels(): string[] {
  return DESERET_INVENTORY.map((g) => g.latin);
}

function randomInt(min: number, max: number, rng: Rng): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[randomInt(0, items.length - 1, rng)]!;
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

function pickDistinct<T>(pool: readonly T[], n: number, rng: Rng): T[] {
  const bag = pool.slice();
  const out: T[] = [];
  while (out.length < n && bag.length) {
    const i = randomInt(0, bag.length - 1, rng);
    out.push(bag.splice(i, 1)[0]!);
  }
  return out;
}

/** 4-choice prompt; distractors are other inventory Latin labels. */
export function dealPrompt(
  rng: Rng = Math.random,
  usedIds: readonly string[] = [],
): DeseretPrompt {
  const unused = DESERET_INVENTORY.filter((g) => !usedIds.includes(g.id));
  const pool = unused.length ? unused : DESERET_INVENTORY;
  const glyph = pick(pool, rng);
  const distractorPool = latinLabels().filter((l) => l !== glyph.latin);
  const distractors = pickDistinct(distractorPool, CHOICE_COUNT - 1, rng);
  const choices = shuffle([glyph.latin, ...distractors], rng);
  return { glyph, choices };
}

function finishIfComplete(state: DeseretState): DeseretState {
  if (state.asked < ROUND_LENGTH) return state;
  return {
    ...state,
    phase: state.correct >= WIN_CORRECT ? "won" : "lost",
    revealedLatin: null,
  };
}

export function startDeseretMatch(rng: Rng = Math.random): DeseretState {
  return {
    phase: "playing",
    asked: 0,
    correct: 0,
    prompt: dealPrompt(rng, []),
    usedIds: [],
    revealedLatin: null,
  };
}

export function isCorrectChoice(state: DeseretState, latin: string): boolean {
  return latin === state.prompt.glyph.latin;
}

/**
 * Apply a Latin pick.
 * - Correct: next prompt (or won at 8/10).
 * - Miss: phase → reveal with the answer; caller advances after the flash.
 */
export function applyDeseretChoice(
  state: DeseretState,
  latin: string,
  rng: Rng = Math.random,
): DeseretState {
  if (state.phase !== "playing") return state;
  const usedIds = [...state.usedIds, state.prompt.glyph.id];
  if (latin === state.prompt.glyph.latin) {
    const next: DeseretState = {
      phase: "playing",
      asked: state.asked + 1,
      correct: state.correct + 1,
      prompt: state.prompt,
      usedIds,
      revealedLatin: null,
    };
    const done = finishIfComplete(next);
    if (done.phase !== "playing") return done;
    return { ...done, prompt: dealPrompt(rng, usedIds) };
  }
  return {
    ...state,
    phase: "reveal",
    usedIds,
    revealedLatin: state.prompt.glyph.latin,
  };
}

/** After a miss flash, count the try and deal the next glyph (or lose). */
export function advanceDeseret(
  state: DeseretState,
  rng: Rng = Math.random,
): DeseretState {
  if (state.phase !== "reveal") return state;
  const next: DeseretState = {
    phase: "playing",
    asked: state.asked + 1,
    correct: state.correct,
    prompt: state.prompt,
    usedIds: state.usedIds,
    revealedLatin: null,
  };
  const done = finishIfComplete(next);
  if (done.phase !== "playing") return done;
  return { ...done, prompt: dealPrompt(rng, state.usedIds) };
}

export function playAgainDeseret(rng: Rng = Math.random): DeseretState {
  return startDeseretMatch(rng);
}
