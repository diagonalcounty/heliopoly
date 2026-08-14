/**
 * Lab scenarios — isolated setups for minigame / UX testing.
 * Not used in normal Launch flow.
 *
 * Menu UX: top-level **categories** expand to show items under them
 * (Which is larger? → numbering packs; Minigames → Gravity Duel; …).
 */
import { forceGravityDuel } from "../core/rules";
import { createGame } from "../core/state";
import type { GameState } from "../core/types";

/**
 * Lab accordion categories (stable order for the menu).
 * `which-is-larger` = multi-script compare drills (#76; EA pack = #81).
 * `minigame` = other drills (e.g. single Gravity Duel entry).
 */
export type LabScenarioGroup = "which-is-larger" | "minigame" | "end" | "economy";

export const LAB_GROUP_ORDER: readonly LabScenarioGroup[] = [
  "which-is-larger",
  "minigame",
  "end",
  "economy",
] as const;

export const LAB_GROUP_LABELS: Record<LabScenarioGroup, string> = {
  "which-is-larger": "Which is larger?",
  minigame: "Minigames",
  end: "End screens",
  economy: "Economy",
};

export const LAB_GROUP_BLURBS: Record<LabScenarioGroup, string> = {
  "which-is-larger":
    "Literacy drills: pick the larger of two numbers in a target numbering system.",
  minigame: "Standalone practice modes (e.g. Gravity Duel).",
  end: "Canned charter end screens for UI / copy checks.",
  economy: "Economy and risk edge cases.",
};

/** Charter GameState drop-in (replaces current game). */
export interface LabGameScenario {
  id: string;
  title: string;
  blurb: string;
  group: LabScenarioGroup;
  kind: "game";
  /** When false, listed in the menu but not runnable yet. Default true. */
  available?: boolean;
  /** Build a fresh GameState ready to drop into the shell. */
  build: () => GameState;
}

/**
 * Standalone Lab drill/overlay — does not replace charter state.
 * Shell opens the drill UI when the scenario is chosen.
 */
export interface LabStandaloneScenario {
  id: string;
  title: string;
  blurb: string;
  group: LabScenarioGroup;
  kind: "standalone";
  /** When false, listed in the menu but not runnable yet. Default true. */
  available?: boolean;
  /** Stable id for shell handlers (e.g. eastern-arabic-compare). */
  standaloneId: string;
}

export type LabScenario = LabGameScenario | LabStandaloneScenario;

export function labScenarioAvailable(sc: LabScenario): boolean {
  return sc.available !== false;
}

function baseGame(playerCount = 2): GameState {
  return createGame({
    playerCount,
    humanSeat: true,
    humanName: "Venture",
    humanPropellant: "methane",
    seed: (Date.now() ^ 0x1ab) >>> 0,
  });
}

function tagLab(s: GameState, label: string): GameState {
  s.log.push(`—— Lab: ${label} ——`);
  s.turnDeltas = [`Lab · ${label}`];
  return s;
}

export const LAB_SCENARIOS: LabScenario[] = [
  // —— Which is larger? (#76 umbrella — all packs listed; EA ships under #81) ——
  {
    id: "western-arabic-compare",
    title: "Western Arabic (0–9)",
    blurb: "Home glyphs — same compare ladder in familiar digits. Coming soon.",
    group: "which-is-larger",
    kind: "standalone",
    available: false,
    standaloneId: "western-arabic-compare",
  },
  {
    id: "eastern-arabic-compare",
    title: "Eastern Arabic (٠–٩)",
    blurb:
      "Pick which of two numbers is larger. One-, two-, then three-digit ladder; hints don’t count toward progress. Up to 12 tries. Does not replace your charter.",
    group: "which-is-larger",
    kind: "standalone",
    available: true,
    standaloneId: "eastern-arabic-compare",
  },
  {
    id: "chinese-compare",
    title: "Chinese (零/〇, 一…九)",
    blurb: "Han characters for digits (also Kanji / traditional Hanja context). Coming soon.",
    group: "which-is-larger",
    kind: "standalone",
    available: false,
    standaloneId: "chinese-compare",
  },
  {
    id: "korean-compare",
    title: "Korean (Sino / native)",
    blurb: "Hangul (and words) — Sino-Korean and native systems by context. Coming soon.",
    group: "which-is-larger",
    kind: "standalone",
    available: false,
    standaloneId: "korean-compare",
  },
  {
    id: "hebrew-compare",
    title: "Hebrew letter-numerals",
    blurb: "א=1 … ט=9 — letter values, not pure place-value; no traditional 0. Coming soon.",
    group: "which-is-larger",
    kind: "standalone",
    available: false,
    standaloneId: "hebrew-compare",
  },
  {
    id: "binary-compare",
    title: "Binary / other bases",
    blurb: "Encoded forms in other bases (which bases TBD). Coming soon.",
    group: "which-is-larger",
    kind: "standalone",
    available: false,
    standaloneId: "binary-compare",
  },

  // —— Other minigames (single Gravity Duel entry) ——
  {
    id: "duel-you-challenger",
    title: "Gravity Duel",
    blurb:
      "You arrive on a belt blank occupied by an AI pilot. Stance (Low/High), then roll. Replaces the current charter with this duel setup.",
    group: "minigame",
    kind: "game",
    available: true,
    build: () => {
      const s = baseGame(2);
      const you = s.players[0];
      const ai = s.players[1];
      forceGravityDuel(s, you.id, ai.id, "belt2");
      return tagLab(s, `Duel ${you.name} (challenger) vs ${ai.name}`);
    },
  },
  {
    id: "end-you-win",
    title: "End screen — you prevail",
    blurb: "All other pilots eliminated; opens charter end UI.",
    group: "end",
    kind: "game",
    build: () => {
      const s = baseGame(4);
      const you = s.players[0];
      let t = 8;
      for (const p of s.players) {
        if (p.id === you.id) continue;
        p.eliminated = true;
        p.eliminatedOnTurn = t;
        p.eliminatedOnRound = Math.max(1, Math.floor(t / 4));
        p.eliminatedReason = "lab elimination";
        p.cash = 0;
        p.properties = [];
        t += 5;
      }
      s.gameTurn = t;
      s.round = Math.max(1, Math.floor(t / 4));
      s.winnerId = you.id;
      s.phase = "game_over";
      s.endReason = `${you.name} is the last pilot flying.`;
      s.log.push(`Winner: ${you.name} (lab)`);
      return tagLab(s, `End · ${you.name} wins`);
    },
  },
  {
    id: "end-ai-wins",
    title: "End screen — AI prevails",
    blurb: "Human out; one AI remains (grammar / postmortem check).",
    group: "end",
    kind: "game",
    build: () => {
      const s = baseGame(3);
      const you = s.players[0];
      const ai1 = s.players[1];
      you.eliminated = true;
      you.eliminatedOnTurn = 12;
      you.eliminatedOnRound = 4;
      you.eliminatedReason = "lab elimination";
      you.cash = 0;
      s.players[2].eliminated = true;
      s.players[2].eliminatedOnTurn = 20;
      s.players[2].eliminatedOnRound = 7;
      s.players[2].eliminatedReason = "lab elimination";
      s.players[2].cash = 0;
      s.gameTurn = 24;
      s.round = 8;
      s.winnerId = ai1.id;
      s.phase = "game_over";
      s.endReason = `${ai1.name} is the last pilot flying.`;
      return tagLab(s, `End · ${ai1.name} wins`);
    },
  },
  {
    id: "going-under-warnings",
    title: "Going-under warnings",
    blurb: "You're stranded on a rival's claim with no fuel and low cash — standings show ⚠ risk badges.",
    group: "economy",
    kind: "game",
    build: () => {
      const s = baseGame(2);
      const you = s.players[0];
      const ai = s.players[1];
      s.owners["europa"] = ai.id;
      s.owners["callisto"] = ai.id;
      ai.properties = ["europa", "callisto"];
      you.position = "europa";
      you.fuel = 0;
      you.cash = 10;
      ai.position = "earth";
      ai.fuel = 25;
      return tagLab(s, "Going-under risk badges (standings)");
    },
  },
];

export function getLabScenario(id: string): LabScenario | undefined {
  return LAB_SCENARIOS.find((x) => x.id === id);
}
