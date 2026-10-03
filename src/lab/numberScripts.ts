/**
 * Numbering-system packs for Lab "Which is larger?" (#76 / #81).
 * Same compare ladder; only the display glyphs change (except binary:
 * whole integer → base-2 string).
 */

export type NumberScriptId =
  | "eastern-arabic"
  | "chinese"
  | "korean"
  | "hebrew"
  | "binary";

export interface NumberScriptPack {
  id: NumberScriptId;
  /** Lab menu / panel title */
  title: string;
  /** Short name kept for shelf grouping; overlay uses kicker + overlayTitle */
  shortName: string;
  /** Overlay kicker, one per script */
  kicker: string;
  /** Overlay heading */
  overlayTitle: string;
  /** How numbers are written for the player */
  format: (n: number) => string;
  /** Level labels (binary uses value ranges, not digit count wording) */
  levelLabel: (round: 1 | 2 | 3) => string;
  /** First sentences of the hint. Shared rest is appended as plain text. */
  hintLead: string;
}

/** Shared hint after each pack's first sentences. Plain text, no markup. */
export const COMPARE_HINT_REST =
  "You win by finishing all three levels in a row with no hint on those tries. If the first digits match, check the next place. Hint shows one number in the digits you know, but that try does not count, and you must finish that level again with no hint. You get 12 tries. Reset starts over.";

export function compareHint(pack: NumberScriptPack): string {
  return `${pack.hintLead} ${COMPARE_HINT_REST}`;
}

const EASTERN = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;
const CHINESE = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"] as const;
/** Sino-Korean digit names (common literacy form). */
const KOREAN = ["영", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"] as const;
/**
 * Hebrew letter-numerals for 1–9; 0 has no classical letter — use a hollow mark
 * so multi-digit place-value practice still works digit-by-digit (#76).
 * א=1 … ט=9
 */
const HEBREW = ["○", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"] as const;

function assertNonNegInt(n: number, label: string): void {
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    throw new RangeError(`${label} expects non-negative integer, got ${n}`);
  }
}

/** Map each Western digit 0–9 through a glyph table (place-value digit string). */
function mapDigits(n: number, table: readonly string[], label: string): string {
  assertNonNegInt(n, label);
  return String(n)
    .split("")
    .map((d) => table[Number(d)]!)
    .join("");
}

export function toEasternArabic(n: number): string {
  return mapDigits(n, EASTERN, "toEasternArabic");
}

export function toChineseDigits(n: number): string {
  return mapDigits(n, CHINESE, "toChineseDigits");
}

/** Sino-Korean digits, thin-space separated for multi-digit readability. */
export function toKoreanSino(n: number): string {
  assertNonNegInt(n, "toKoreanSino");
  return String(n)
    .split("")
    .map((d) => KOREAN[Number(d)]!)
    .join(n >= 10 ? "\u2009" : "");
}

export function toHebrewLetters(n: number): string {
  return mapDigits(n, HEBREW, "toHebrewLetters");
}

/** Binary encoding of the full integer (not digit-by-digit). */
export function toBinary(n: number): string {
  assertNonNegInt(n, "toBinary");
  return n.toString(2);
}

const digitLevel = (round: 1 | 2 | 3): string => {
  if (round === 1) return "Level 1 · one digit (one place)";
  if (round === 2) return "Level 2 · two digits (two places)";
  return "Level 3 · three digits (three places)";
};

const binaryLevel = (round: 1 | 2 | 3): string => {
  if (round === 1) return "Level 1 · values 0–9";
  if (round === 2) return "Level 2 · values 10–99";
  return "Level 3 · values 100–999";
};

export const NUMBER_SCRIPT_PACKS: Record<NumberScriptId, NumberScriptPack> = {
  "eastern-arabic": {
    id: "eastern-arabic",
    title: "Eastern Arabic (٠–٩)",
    shortName: "Eastern Arabic",
    kicker: "Lab · Eastern Arabic (number shapes)",
    overlayTitle: "Which is larger? · Eastern Arabic shapes",
    format: toEasternArabic,
    levelLabel: digitLevel,
    hintLead:
      "Two numbers show up in Eastern Arabic digits, other shapes for 0 to 9. Tap the larger one, or point to that side with the arrow keys.",
  },
  chinese: {
    id: "chinese",
    title: "Chinese (〇–九)",
    shortName: "Chinese",
    kicker: "Lab · Chinese (number marks)",
    overlayTitle: "Which is larger? · Chinese marks",
    format: toChineseDigits,
    levelLabel: digitLevel,
    hintLead:
      "Two numbers show up as Chinese number marks (〇一二三四五六七八九), one mark per place. Tap the larger one.",
  },
  korean: {
    id: "korean",
    title: "Korean Sino (영–구)",
    shortName: "Korean",
    kicker: "Lab · Korean (number words)",
    overlayTitle: "Which is larger? · Korean words",
    format: toKoreanSino,
    levelLabel: digitLevel,
    hintLead:
      "Two numbers show up as Korean number words (영 일 이 삼 사 오 육 칠 팔 구), one word per place. Tap the larger one.",
  },
  hebrew: {
    id: "hebrew",
    title: "Hebrew (א–ט)",
    shortName: "Hebrew",
    kicker: "Lab · Hebrew (number letters)",
    overlayTitle: "Which is larger? · Hebrew letters",
    format: toHebrewLetters,
    levelLabel: digitLevel,
    hintLead:
      "Two numbers show up as Hebrew number letters (א=1 … ט=9; ○ is 0), one mark per place. Tap the larger one.",
  },
  binary: {
    id: "binary",
    title: "Binary",
    shortName: "Binary",
    kicker: "Lab · Binary (only 0 and 1)",
    overlayTitle: "Which is larger? · Binary (0 and 1)",
    format: toBinary,
    levelLabel: binaryLevel,
    hintLead:
      "Two numbers show up in binary, a row of only 0 and 1. Read each row as a normal number and tap the larger one.",
  },
};

export function formatNumberScript(script: NumberScriptId, n: number): string {
  return NUMBER_SCRIPT_PACKS[script].format(n);
}

/** Map Lab standaloneId → script pack (western omitted by product choice). */
export const STANDALONE_TO_SCRIPT: Record<string, NumberScriptId> = {
  "eastern-arabic-compare": "eastern-arabic",
  "chinese-compare": "chinese",
  "korean-compare": "korean",
  "hebrew-compare": "hebrew",
  "binary-compare": "binary",
};
