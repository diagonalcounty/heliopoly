/**
 * Player-facing Bot Evolution copy (#247 / #249).
 * First-play: state the job. Never contrast an unshown system
 * (blast, battery, save-as-slogan, C3).
 */
import type { BotStage } from "./botEvolution";

export const BOTEVO_TITLE = "Make a bigger bot";
export const BOTEVO_SAVE_ARIA = "Joins to the next level";

/** Resume gate (#301). Early reader; the line stays under 50 characters. */
export const BOTEVO_RESUME_LINE = "You have a game saved on this device.";
export const BOTEVO_KEEP_GOING = "Keep going";
export const BOTEVO_START_OVER = "Start over";

export function connectLabel(n: number): string {
  return `Join ${n}`;
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
      title: "Join three bots",
      bodyHtml:
        "Join three bots that touch. They become one bigger bot. Those fill the top row. Bots fall as they are and do not turn. A full column ends the game.",
      action: isContinue ? "Continue" : "Begin",
    };
  }
  if (n === 6) {
    return {
      title: "Hardest job. Join six.",
      bodyHtml: `The board is <strong>six</strong> across now and stays this wide. Join <strong>${word}</strong> that touch. They become one bigger bot. They still do not turn.`,
      action: "Continue",
    };
  }
  return {
    title: `Harder job. Join ${word}. Wider board.`,
    bodyHtml: `The board is ${word} across. Join <strong>${word}</strong> that touch. They become one bigger bot. They still do not turn.`,
    action: "Continue",
  };
}

export function playHint(n: number): string {
  const widen =
    n < 6
      ? " Later the board gets wider."
      : " This is as wide as it gets.";
  return `Bots fall as they are and do not turn. Tap a column to aim it. Join ${n} that touch. They become one bigger bot.${widen}`;
}
