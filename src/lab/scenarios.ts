/**
 * Lab scenarios — isolated setups for minigame / UX testing.
 * Not used in normal Launch flow.
 */
import { forceGravityDuel } from "../core/rules";
import { createGame } from "../core/state";
import type { GameState } from "../core/types";

export type LabScenarioGroup = "minigame" | "end" | "economy";

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
  {
    id: "eastern-arabic-compare",
    title: "Eastern Arabic — which is larger?",
    blurb:
      "Lab literacy drill (#81). Eastern Arabic digits only. Clean clears climb 1→2→3 digit levels (win). Hint reveals one value in Western digits but that clear does not count. Wrong on ladder 2/3 resets to 1. Max 12 answers. Click or ← → / < >. Reset anytime. Does not replace your charter.",
    group: "minigame",
    kind: "standalone",
    standaloneId: "eastern-arabic-compare",
  },
  {
    id: "duel-you-challenger",
    title: "Gravity Duel — you challenge",
    blurb: "Venture arrives on a belt blank occupied by an AI pilot. Stance, then roll.",
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
    id: "duel-you-defender",
    title: "Gravity Duel — you defend",
    blurb: "AI arrives on your blank. You are defender (stance + roll when prompted).",
    group: "minigame",
    kind: "game",
    build: () => {
      const s = baseGame(2);
      const you = s.players[0];
      const ai = s.players[1];
      // Challenger is AI; current seat becomes AI for the duel
      forceGravityDuel(s, ai.id, you.id, "belt3");
      return tagLab(s, `Duel ${ai.name} (challenger) vs ${you.name} (defender)`);
    },
  },
  {
    id: "duel-ai-vs-ai",
    title: "Gravity Duel — AI vs AI",
    blurb: "Two AI seats duel; shell auto-plays. Use to watch ceremony / splash.",
    group: "minigame",
    kind: "game",
    build: () => {
      const s = createGame({
        playerCount: 2,
        humanSeat: false,
        seed: (Date.now() ^ 0x2cd) >>> 0,
      });
      forceGravityDuel(s, s.players[0].id, s.players[1].id, "belt1");
      return tagLab(s, "Duel AI vs AI");
    },
  },
  {
    id: "duel-multi-audience",
    title: "Gravity Duel — 4 pilots (you challenge)",
    blurb: "Full pilot count; you vs AI 1 on a blank (others elsewhere).",
    group: "minigame",
    kind: "game",
    build: () => {
      const s = baseGame(4);
      forceGravityDuel(s, s.players[0].id, s.players[1].id, "belt4");
      // Park others on Earth so they are not in the lane
      for (let i = 2; i < s.players.length; i++) {
        s.players[i].position = "earth";
      }
      return tagLab(s, "Duel You vs AI · 4 pilots");
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
