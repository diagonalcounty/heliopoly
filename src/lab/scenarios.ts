/**
 * Lab scenarios — practice games and canned setups.
 * Not used in normal Launch flow.
 *
 * Menu UX: top-level **categories** expand to show items under them
 * (Which is larger? → numbering packs; Minigames → most mature first).
 */
import { grantClaim } from "../core/claimLedger";
import { forceGravityDuel } from "../core/rules";
import { createGame } from "../core/state";
import type { GameState } from "../core/types";

/**
 * Lab accordion categories (stable order for the menu).
 * `which-is-larger` = multi-script compare drills (#76; EA pack = #81).
 * `minigame` = Lab drills, listed most mature first (Bot Evolution on top).
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
    "Pick the larger of two numbers, written in another numbering system.",
  minigame:
    "Bot Evolution, Gravity Duel, Deseret letters, Backup fuel, Hull panel, Urinal-rule Parking.",
  end: "How a game can end — you win, or the computer does.",
  economy: "Tight cash, going-under warnings, selling a claim from Earth.",
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
  // —— Which is larger? (#76 — same ladder as #81; packs via numberScripts) ——
  // Western Arabic omitted (player's home system — not a literacy target).
  {
    id: "eastern-arabic-compare",
    title: "Eastern Arabic (٠–٩)",
    blurb:
      "Pick which of two numbers is larger. One-, two-, then three-digit ladder; hints don’t count toward progress. Up to 12 tries.",
    group: "which-is-larger",
    kind: "standalone",
    available: true,
    standaloneId: "eastern-arabic-compare",
  },
  {
    id: "chinese-compare",
    title: "Chinese (〇–九)",
    blurb: "Same ladder with Chinese digit characters per place (〇一二三四五六七八九).",
    group: "which-is-larger",
    kind: "standalone",
    available: true,
    standaloneId: "chinese-compare",
  },
  {
    id: "korean-compare",
    title: "Korean Sino (영–구)",
    blurb: "Same ladder with Sino-Korean digit words per place (영 일 이 삼 사 오 육 칠 팔 구).",
    group: "which-is-larger",
    kind: "standalone",
    available: true,
    standaloneId: "korean-compare",
  },
  {
    id: "hebrew-compare",
    title: "Hebrew (א–ט)",
    blurb: "Same ladder with Hebrew letter-numerals (א=1 … ט=9; ○ for 0) per place.",
    group: "which-is-larger",
    kind: "standalone",
    available: true,
    standaloneId: "hebrew-compare",
  },
  {
    id: "binary-compare",
    title: "Binary",
    blurb: "Same ladder; numbers written with 0s and 1s (13 is 1101).",
    group: "which-is-larger",
    kind: "standalone",
    available: true,
    standaloneId: "binary-compare",
  },

  // —— Minigames, most mature first (menu order) ——
  {
    id: "egg-bot-evolution",
    title: "Bot Evolution",
    blurb:
      "Drop bots into a 3-wide field. Link three whose pins touch; they become a box. Harder jobs need four, then five, then six, and the field gets wider. Your rocket on the board is unchanged.",
    group: "minigame",
    kind: "standalone",
    available: true,
    standaloneId: "egg-bot-evolution",
  },
  {
    id: "duel-you-challenger",
    title: "Gravity Duel",
    blurb:
      "You arrive on a belt lane already held by a computer pilot. Pick High or Low, then roll. This replaces the current game.",
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
    id: "deseret-match",
    title: "Deseret letters",
    blurb:
      "Twelve Deseret capitals. Two Latin letters: pick the match. Eight of ten wins; misses show the answer.",
    group: "minigame",
    kind: "standalone",
    available: true,
    standaloneId: "deseret-match",
  },
  {
    id: "backup-fuel-pipes",
    title: "Backup fuel",
    blurb:
      "Reroute backup fuel: rotate pipes on a 6×6 until the tank feeds the engine. Your rocket on the board is unchanged.",
    group: "minigame",
    kind: "standalone",
    available: true,
    standaloneId: "backup-fuel-pipes",
  },
  {
    id: "hull-panel",
    title: "Hull panel",
    blurb:
      "Slide numbered hull plates 1–8 back into order. Your rocket on the board is unchanged.",
    group: "minigame",
    kind: "standalone",
    available: true,
    standaloneId: "hull-panel",
  },
  {
    id: "urinal-rule-parking",
    title: "Urinal-rule Parking",
    blurb: "Circular pads. Tap an empty circle.",
    group: "minigame",
    kind: "standalone",
    available: true,
    standaloneId: "urinal-rule-parking",
  },
  {
    id: "end-you-win",
    title: "End screen — you win",
    blurb: "You are the last rocket flying. Opens the end of a game you won.",
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
      // Paying books so the end story shows mark + income (#138);
      // ganymede earns nothing and is cut by the top-3 cap.
      grantClaim(s, you.id, "enceladus", { rentCollected: 756 });
      grantClaim(s, you.id, "venus", { rentCollected: 900 });
      grantClaim(s, you.id, "elon", { rentCollected: 500 });
      grantClaim(s, you.id, "ganymede", { rentCollected: 0 });
      s.log.push(`Winner: ${you.name} (lab)`);
      return tagLab(s, `End · ${you.name} wins`);
    },
  },
  {
    id: "end-ai-wins",
    title: "End screen — the computer wins",
    blurb: "You are out. One computer rocket is still flying.",
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
    blurb: "You're on a rival's world with no fuel and little cash. Standings show a warning.",
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
  {
    id: "claim-ledger",
    title: "Claim ledger / remote sell",
    blurb:
      "You're on Earth with Elon (almost paid back) and Venus. Cash is tight. Open the ledger — sell or auction Elon (a rival holds the rest of Mars).",
    group: "economy",
    kind: "game",
    build: () => {
      const s = baseGame(3);
      const you = s.players[0];
      const ai1 = s.players[1];
      const ai2 = s.players[2];
      you.position = "earth";
      you.cash = 80;
      you.fuel = 18;
      grantClaim(s, you.id, "elon", { rentCollected: 400 });
      grantClaim(s, you.id, "venus", { rentCollected: 0 });
      grantClaim(s, ai1.id, "mars", { rentCollected: 90, depot: true });
      grantClaim(s, ai1.id, "phobos", { rentCollected: 40 });
      grantClaim(s, ai1.id, "deimos", { rentCollected: 20 });
      ai1.cash = 1200;
      ai1.position = "earth";
      grantClaim(s, ai2.id, "europa", { rentCollected: 30 });
      ai2.cash = 220;
      ai2.position = "earth";
      s.phase = "await_action";
      return tagLab(s, "Claim ledger / remote sell");
    },
  },
];

export function getLabScenario(id: string): LabScenario | undefined {
  return LAB_SCENARIOS.find((x) => x.id === id);
}
