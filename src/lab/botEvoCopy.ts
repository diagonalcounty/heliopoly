/**
 * Player-facing Bot Evolution copy (#247 / #249).
 * HUD never says C3 / bare level. Progress is a save bar, not a battery.
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
        "Live pins have to meet. A chain of <strong>three</strong> morphs into a box — that’s a save, not a blast. Color is the family: cream four-pin, cyan straight, apricot corner, mint tee. They fall as they are. No turning. Overflow a column and the drill is over. Lab practice; the expedition stays put.",
      action: isContinue ? "Continue" : "Begin",
    };
  }
  if (n === 6) {
    return {
      title: "Hardest job. Link six.",
      bodyHtml: `The bay is <strong>six</strong> across and stays this wide. Link <strong>${word}</strong>. Boxes still fill the save bar. They fall as they are. No turning.`,
      action: "Continue",
    };
  }
  return {
    title: `Harder job. Link ${word}. Wider field.`,
    bodyHtml: `The bay is ${word} across now. A chain of <strong>${word}</strong> morphs into a box. Same rule: save, not blast. They still fall as they are.`,
    action: "Continue",
  };
}

export function playHint(n: number): string {
  const widen =
    n < 6
      ? " The field widens as the job gets harder."
      : " This is the widest field.";
  return `Bots fall as they are — no turning. Tap a column to steer. When claws hook, they snap. A chain of ${n} morphs into a box.${widen} Untimed Lab practice.`;
}
