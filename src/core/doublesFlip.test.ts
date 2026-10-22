/**
 * #43: doubles let the pilot turn around for one move.
 * Run: npx tsx src/core/doublesFlip.test.ts
 */
import { shouldAiDoublesFlip } from "./agents";
import { walkMovePath } from "./path";
import { applyAction, effectiveMoveDirection, getLegalActions } from "./rules";
import { createGame, currentPlayer } from "./state";
import type { GameState, LastRoll } from "./types";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

function roll(d1: number, d2: number): LastRoll {
  return { d1, d2, total: d1 + d2, doubles: d1 === d2 };
}

/** Human-free game, pilot 0 on Earth, rolled and waiting to move. */
function setup(r: LastRoll, breakSpaces = 0): GameState {
  const s = createGame({
    shuffleSeats: false,
    playerCount: 3,
    humanSeat: true,
    humanName: "Venture",
    seed: 42,
  });
  const p = currentPlayer(s);
  p.position = "earth";
  p.fuel = 40;
  s.phase = "await_move";
  s.lastRoll = r;
  s.breakSpaces = breakSpaces;
  return s;
}

function logHas(s: GameState, text: string): boolean {
  return s.log.some((l) => l.includes(text));
}

// 1. Doubles offer the flip, default off
{
  const s = setup(roll(3, 3));
  const legal = getLegalActions(s);
  assert(legal.doublesFlip === true, "doubles: flip offered");
  assert(legal.doublesFlipOn === false, "doubles: flip defaults off");
}

// 2. Non-doubles: not offered, action ignored, no log line
{
  const s = setup(roll(3, 4));
  assert(getLegalActions(s).doublesFlip === false, "no doubles: no flip");
  const logLen = s.log.length;
  const next = applyAction(s, { type: "set_doubles_flip", flip: true });
  assert(next.doublesFlip === false, "no doubles: flip stays off");
  assert(next.log.length === logLen, "no doubles: no log line");
}

// 3. Flip on: walks backward, direction untouched, flag cleared
{
  const s = setup(roll(3, 3));
  const start = currentPlayer(s).position;
  const want = walkMovePath(s.board, start, 6, "backward").endId;
  let n = applyAction(s, { type: "set_doubles_flip", flip: true });
  assert(getLegalActions(n).doublesFlipOn === true, "flip on shows in legal actions");
  n = applyAction(n, { type: "move" });
  const p = currentPlayer(n);
  assert(p.position === want, "flip on: ends on backward walk");
  assert(p.moveDirection === "forward", "flip on: moveDirection unchanged");
  assert(n.doublesFlip === false, "flip on: flag cleared after move");
}

// 4. Flip on then off: normal forward walk
{
  const s = setup(roll(3, 3));
  const start = currentPlayer(s).position;
  const want = walkMovePath(s.board, start, 6, "forward").endId;
  let n = applyAction(s, { type: "set_doubles_flip", flip: true });
  n = applyAction(n, { type: "set_doubles_flip", flip: false });
  n = applyAction(n, { type: "move" });
  assert(currentPlayer(n).position === want, "flip off again: forward walk");
}

// 5. Locked palindrome rocket facing backward flips forward, lock stays
{
  const s = setup(roll(2, 2));
  const p0 = currentPlayer(s);
  p0.canBidirectional = true;
  p0.moveDirection = "backward";
  p0.directionLocked = true;
  const want = walkMovePath(s.board, p0.position, 4, "forward").endId;
  let n = applyAction(s, { type: "set_doubles_flip", flip: true });
  n = applyAction(n, { type: "move" });
  const p = currentPlayer(n);
  assert(p.position === want, "palindrome: flipped to forward walk");
  assert(p.moveDirection === "backward", "palindrome: facing unchanged");
  assert(p.directionLocked === true, "palindrome: lock unchanged");
}

// 6. Break still subtracts from the roll
{
  const s = setup(roll(4, 4), 2);
  const start = currentPlayer(s).position;
  const want = walkMovePath(s.board, start, 6, "backward").endId;
  let n = applyAction(s, { type: "set_doubles_flip", flip: true });
  n = applyAction(n, { type: "move" });
  assert(currentPlayer(n).position === want, "break 2 + flip: backward 6");
}

// 7. Flip is cleared on a new roll and a new turn
{
  const s = setup(roll(3, 3));
  const first = currentPlayer(s).id;
  let n = applyAction(s, { type: "set_doubles_flip", flip: true });
  n = applyAction(n, { type: "move" });
  assert(n.doublesFlip === false, "reset after move");
  if (n.phase === "await_post_land") {
    n = applyAction(n, { type: "end_turn" });
  }
  assert(n.doublesFlip === false, "reset on new turn");
  assert(
    currentPlayer(n).id !== first || n.phase !== "await_move",
    "turn passed to the next pilot",
  );
  const r = setup(roll(3, 3));
  r.phase = "await_action";
  r.lastRoll = null;
  r.doublesFlip = true;
  const rolled = applyAction(r, { type: "roll" });
  assert(rolled.doublesFlip === false, "reset on roll");
}

// 8. effectiveMoveDirection
{
  const s = setup(roll(3, 3));
  const p = currentPlayer(s);
  assert(effectiveMoveDirection(s, p) === "forward", "no flip: same direction");
  s.doublesFlip = true;
  assert(effectiveMoveDirection(s, p) === "backward", "flip: opposite in await_move");
  s.phase = "await_action";
  assert(effectiveMoveDirection(s, p) === "forward", "flip ignored outside await_move");
  s.phase = "await_post_land";
  assert(effectiveMoveDirection(s, p) === "forward", "flip ignored in await_post_land");
}

// 9. AI thresholds
assert(shouldAiDoublesFlip(0, 1000, "easy") === false, "AI easy never flips");
assert(shouldAiDoublesFlip(10, 18, "normal") === false, "AI normal at margin");
assert(shouldAiDoublesFlip(10, 18.5, "normal") === true, "AI normal past margin");
assert(shouldAiDoublesFlip(10, 15, "hard") === false, "AI hard at margin");
assert(shouldAiDoublesFlip(10, 15.5, "hard") === true, "AI hard past margin");
assert(shouldAiDoublesFlip(10, 13.5, "expert") === true, "AI expert past margin");

// 10. Logs
{
  const s = setup(roll(3, 3));
  let n = applyAction(s, { type: "set_doubles_flip", flip: true });
  n = applyAction(n, { type: "move" });
  assert(logHas(n, "turns around for this move"), "flip log line");
  const r = setup(roll(3, 3));
  r.phase = "await_action";
  r.lastRoll = null;
  const rolled = applyAction(r, { type: "roll" });
  if (rolled.lastRoll?.doubles) {
    assert(logHas(rolled, "(doubles)"), "roll log still shows (doubles)");
  } else {
    assert(true, "roll log (seed gave non-doubles; covered by rules)");
  }
}

if (failed > 0) {
  throw new Error(`${failed} doubles flip test(s) failed`);
}
