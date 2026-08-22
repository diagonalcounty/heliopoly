/**
 * Prize cards pick a random rocket this round; Easy hazards skip the human.
 * Run: npx tsx src/core/turnClock.test.ts
 */
import { applyAction, getLegalActions } from "./rules";
import { createGame, currentPlayer } from "./state";
import {
  KOSTKA_CASH,
  KOSTKA_TRANSIT_GAP,
  noteEarthTransit,
  prizeRocket,
  stealableClaims,
  teslaTargetClaims,
  tickSeatTurn,
  type TimedEventId,
} from "./turnClock";
import { grantClaim } from "./claimLedger";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

const POOL: TimedEventId[] = [
  "monolith",
  "mms_free_break",
  "kings_quest",
  "harlock_fuel",
  "asteroid_depot",
  "ledger_dividend",
  "comet_free_leave",
  "rent_holiday",
  "rogue_tesla",
  "olbers_station",
  "karen_skip",
  "blockchain_steal",
  "strongbad_email",
  "disney_royalties",
  "tuesday_boy",
  "error_47",
];

function primePoolEvent(state: ReturnType<typeof createGame>, keep: TimedEventId): void {
  state.round = Math.max(6, state.round);
  state.timedEvent.lastProcessedRound = state.round - 1;
  state.timedEvent.roundsSinceLast = 5;
  state.timedEvent.rollChance = 1;
  state.timedEvent.firedIds = POOL.filter((id) => id !== keep);
  state.pendingAnnouncement = null;
  state.pendingCharterChoice = null;
}

{
  const winners = new Set<string>();
  for (let i = 0; i < 48; i++) {
    const s = createGame({
      playerCount: 4,
      humanSeat: false,
      seed: 1100 + i * 31,
    });
    s.round = 8 + (i % 11);
    s.gameTurn = 28 + i;
    const p = prizeRocket(s);
    if (p) winners.add(p.id);
  }
  assert(
    winners.size >= 2,
    `all-AI prizeRocket is not always the lead seat (got ${winners.size} distinct rockets)`,
  );
}

{
  let aiHits = 0;
  for (let i = 0; i < 48; i++) {
    const s = createGame({
      playerCount: 4,
      humanSeat: true,
      humanName: "Venture",
      seed: 2200 + i * 29,
    });
    s.round = 7 + (i % 13);
    s.gameTurn = 24 + i;
    const p = prizeRocket(s);
    if (p?.agent === "ai") aiHits++;
  }
  assert(aiHits > 0, "with a human seated, prizeRocket can still land on an AI");
}

{
  const s = createGame({
    playerCount: 4,
    humanSeat: false,
    seed: 7,
  });
  primePoolEvent(s, "kings_quest");
  tickSeatTurn(s);
  const warped = s.players.filter((p) => p.warpCharges > 0);
  assert(warped.length === 1, "King's Quest prizes exactly one rocket");
  assert(s.timedEvent.lastEventId === "kings_quest", "King's Quest actually fired");
}

{
  const s = createGame({
    playerCount: 3,
    humanSeat: true,
    humanName: "Venture",
    seed: 7,
    aiDifficulty: "easy",
  });
  grantClaim(s, s.players[0].id, "io");
  grantClaim(s, s.players[1].id, "europa");
  const fromAi = stealableClaims(s, s.players[1].id);
  const fromHuman = stealableClaims(s, s.players[0].id);
  assert(!fromAi.includes("io"), "Easy: AI cannot steal the human's Io");
  assert(fromHuman.includes("europa"), "Easy: human can still steal an AI Europa");
  const hits = teslaTargetClaims(s);
  assert(!hits.includes("io"), "Easy Tesla will not hit the human's Io");
  assert(hits.includes("europa"), "Easy Tesla can still hit an AI Europa");
}

{
  let resolvedAiChooser = false;
  for (let i = 0; i < 40 && !resolvedAiChooser; i++) {
    const s = createGame({
      playerCount: 4,
      humanSeat: true,
      humanName: "Venture",
      seed: 3300 + i * 19,
    });
    s.currentPlayerIndex = 3;
    s.phase = "await_action";
    s.players[3].rolledThisTurn = true;
    s.players[3].movedThisTurn = true;
    primePoolEvent(s, "olbers_station");
    const after = applyAction(s, { type: "end_turn" });
    const human = after.players[0];
    assert(currentPlayer(after).id === human.id, "end-turn wrap seats the human");
    const pc = after.pendingCharterChoice;
    if (pc) {
      const chooser = after.players.find((p) => p.id === pc.chooserId);
      assert(
        chooser?.agent === "human",
        "pending Olbers pick is the human, never a stuck AI chooser",
      );
    } else {
      const legal = getLegalActions(after);
      assert(legal.roll, "human can roll after an AI Olbers auto-resolve");
      resolvedAiChooser = true;
    }
  }
  assert(resolvedAiChooser, "at least one seed auto-resolved an AI Olbers chooser");
}

{
  const s = createGame({
    playerCount: 3,
    humanSeat: true,
    humanName: "Venture",
    seed: 11,
  });
  const you = s.players[0]!;
  const ai = s.players[1]!;
  const cash0 = you.cash;
  for (let i = 0; i < KOSTKA_TRANSIT_GAP; i++) {
    noteEarthTransit(s, you, i % 2 === 0 ? "pass" : "land");
  }
  assert(s.timedEvent.earthTransits === KOSTKA_TRANSIT_GAP, "five transits counted");
  assert(
    !(s.timedEvent.firedIds ?? []).includes("kostka_dog"),
    "Kostka does not fire on the fifth transit",
  );
  assert(you.cash === cash0, "no Kostka cash during the gap");

  s.timedEvent.kostkaChance = 1;
  const aiCash = ai.cash;
  noteEarthTransit(s, ai, "pass");
  assert(
    !(s.timedEvent.firedIds ?? []).includes("kostka_dog"),
    "a pass after the gap does not roll Kostka",
  );
  noteEarthTransit(s, ai, "land");
  assert(
    (s.timedEvent.firedIds ?? []).includes("kostka_dog"),
    "next Earth landing after the gap can fire Kostka",
  );
  assert(ai.cash === aiCash + KOSTKA_CASH, "the landing rocket gets the bounty");
  assert(you.cash === cash0, "other rockets do not get Kostka");
  const before = ai.cash;
  s.timedEvent.kostkaChance = 1;
  noteEarthTransit(s, ai, "land");
  assert(ai.cash === before, "Kostka fires at most once");
}

{
  const s = createGame({
    playerCount: 2,
    humanSeat: true,
    humanName: "Venture",
    seed: 13,
  });
  const p = s.players[0]!;
  for (let i = 0; i < KOSTKA_TRANSIT_GAP + 1; i++) {
    noteEarthTransit(s, p, "pass");
  }
  s.timedEvent.kostkaChance = 0.3;
  s.pendingAnnouncement = { kind: "leak", title: "Leak", body: "hold" };
  noteEarthTransit(s, p, "land");
  assert(
    !(s.timedEvent.firedIds ?? []).includes("kostka_dog"),
    "Kostka waits if another card is already up",
  );
  assert(s.timedEvent.kostkaChance === 0.3, "skipped landing does not burn chance");
}

{
  const s = createGame({
    playerCount: 2,
    humanSeat: true,
    humanName: "Venture",
    seed: 19,
  });
  const p = s.players[0]!;
  for (let i = 0; i < KOSTKA_TRANSIT_GAP + 1; i++) {
    noteEarthTransit(s, p, "pass");
  }
  s.timedEvent.kostkaChance = 1e-15;
  noteEarthTransit(s, p, "land");
  assert(
    !(s.timedEvent.firedIds ?? []).includes("kostka_dog"),
    "a near-zero roll misses Kostka",
  );
  assert(
    Math.abs((s.timedEvent.kostkaChance ?? 0) - 0.1) < 1e-9,
    "missed landing adds 10% to the next Earth landing",
  );
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll turn-clock checks passed.");
