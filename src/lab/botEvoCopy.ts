/**
 * Player-facing Bot Evolution copy (#247 / #249).
 * First-play: state the job. Never contrast an unshown system
 * (blast, battery, save-as-slogan, C3).
 */
import type { BotStage } from "./botEvolution";

export const BOTEVO_TITLE = "Bot Evolution";
export const BOTEVO_SAVE_ARIA = "Boxes to next stage";

export function connectLabel(n: number): string {
  return `Connect ${n}`;
}

export interface StageTeach {
  /** Clerk card heading. */
  title: string;
  /** Clerk card body (HTML; one quirk, rest procedural). */
  bodyHtml: string;
  /** Begin on first bay; Continue on later bays. */
  action: "Begin" | "Continue";
}

const WORD: Record<BotStage, string> = {
  3: "three",
  4: "four",
  5: "five",
  6: "six",
};

export function stageTeach(n: BotStage, isContinue: boolean): StageTeach {
  const word = WORD[n];
  if (n === 3) {
    return {
      title: "Simple bots. Link three.",
      bodyHtml:
        "Link <strong>three</strong> bots whose pins touch. They become a box. Boxes fill the row at the top. Bots drop as they are — they do not turn. Fill a column to the top and the game ends.",
      action: isContinue ? "Continue" : "Begin",
    };
  }
  if (n === 6) {
    return {
      title: "Hardest job. Link six.",
      bodyHtml: `The field is <strong>six</strong> across now and stays this wide. Link <strong>${word}</strong>. Pins touch; they become a box. They still do not turn.`,
      action: "Continue",
    };
  }
  return {
    title: `Harder job. Link ${word}. Wider field.`,
    bodyHtml: `The field is ${word} across. Link <strong>${word}</strong>. Pins touch; they become a box. They still do not turn.`,
    action: "Continue",
  };
}

export function playHint(n: number): string {
  const widen =
    n < 6
      ? " Later, the field gets wider."
      : " This is as wide as it gets.";
  return `Bots drop as they are — they do not turn. Tap a column to steer. Link ${n} whose pins touch; they become a box.${widen}`;
}
