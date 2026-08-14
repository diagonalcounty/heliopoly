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
  /** Short name in status/hint copy */
  shortName: string;
  /** How numbers are written for the player */
  format: (n: number) => string;
  /** Level labels (binary uses value ranges, not digit count wording) */
  levelLabel: (round: 1 | 2 | 3) => string;
  /** Hint paragraph (HTML-safe plain text; kbd tags added by shell if needed) */
  hintLead: string;
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
  if (round === 1) return "Level 1 · one digit";
  if (round === 2) return "Level 2 · two digits";
  return "Level 3 · three digits";
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
    format: toEasternArabic,
    levelLabel: digitLevel,
    hintLead:
      "Two numbers appear in Eastern Arabic digits. Choose the larger one by tapping it, or use the arrow keys / < > to point at that side.",
  },
  chinese: {
    id: "chinese",
    title: "Chinese (〇–九)",
    shortName: "Chinese",
    format: toChineseDigits,
    levelLabel: digitLevel,
    hintLead:
      "Two numbers appear as Chinese digit characters (〇一二三四五六七八九), one character per place. Choose the larger value.",
  },
  korean: {
    id: "korean",
    title: "Korean Sino (영–구)",
    shortName: "Korean",
    format: toKoreanSino,
    levelLabel: digitLevel,
    hintLead:
      "Two numbers appear in Sino-Korean digit words (영 일 이 삼 사 오 육 칠 팔 구), one word per place. Choose the larger value.",
  },
  hebrew: {
    id: "hebrew",
    title: "Hebrew (א–ט)",
    shortName: "Hebrew",
    format: toHebrewLetters,
    levelLabel: digitLevel,
    hintLead:
      "Two numbers appear as Hebrew letter-numerals (א=1 … ט=9; ○ for 0), one mark per place. Choose the larger value.",
  },
  binary: {
    id: "binary",
    title: "Binary",
    shortName: "Binary",
    format: toBinary,
    levelLabel: binaryLevel,
    hintLead:
      "Two numbers appear in binary (base 2). Read the bit string as an integer and choose the larger value.",
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
