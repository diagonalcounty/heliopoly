/**
 * Lab scenarios — isolated setups for minigame / UX testing.
 * Not used in normal Launch flow.
 */
import { forceGravityDuel } from "../core/rules";
import { createGame } from "../core/state";
import type { GameState } from "../core/types";

/**
 * Lab menu sections (order of first appearance in LAB_SCENARIOS).
 * `which-is-larger` = multi-script compare drills (#76 umbrella; EA = #81).
 * `minigame` = other drills (e.g. single Gravity Duel entry).
 */
export type LabScenarioGroup = "which-is-larger" | "minigame" | "end" | "economy";

/** Charter GameState drop-in (replaces current game). */
export interface LabGameScenario {
  id: string;
  title: string;
  blurb: string;
  group: LabScenarioGroup;
  kind: "game";
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
  /** Stable id for shell handlers (e.g. eastern-arabic-compare). */
  standaloneId: string;
}

export type LabScenario = LabGameScenario | LabStandaloneScenario;

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
  // —— Which is larger? (#76 section; packs ship as separate issues; EA = #81) ——
  {
    id: "eastern-arabic-compare",
    title: "Eastern Arabic",
    blurb:
      "Pick which of two numbers is larger (٠–٩). One-, two-, then three-digit ladder; hints don’t count toward progress. Up to 12 tries. Does not replace your charter.",
    group: "which-is-larger",
    kind: "standalone",
    standaloneId: "eastern-arabic-compare",
  },
  // Future packs (same drill shell): Chinese, Korean, Hebrew, binary, … — add here under which-is-larger.

  // —— Other minigames (single Gravity Duel entry) ——
  {
    id: "duel-you-challenger",
    title: "Gravity Duel",
    blurb:
      "You arrive on a belt blank occupied by an AI pilot. Stance (Low/High), then roll. Replaces the current charter with this duel setup.",
    group: "minigame",
    kind: "game",
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
