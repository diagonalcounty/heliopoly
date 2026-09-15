/**
 * Seat order at createGame — human is not forced to seat 0 (#16).
 * Run: npx tsx src/core/state.test.ts
 */
import { rocketTitle } from "./pilotNames";
import { createGame, shuffleSeats } from "./state";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

{
  const box = { rngState: 1 };
  const a = [0, 1, 2, 3];
  shuffleSeats(a, box);
  assert(a.length === 4, "shuffle keeps length");
  assert(new Set(a).size === 4, "shuffle is a permutation");
}

{
  const humanIndexes = new Set<number>();
  for (let i = 0; i < 64; i++) {
    const s = createGame({
      playerCount: 4,
      humanSeat: true,
      humanName: "Venture",
      seed: 1000 + i * 997,
    });
    const hi = s.players.findIndex((p) => p.agent === "human");
    assert(hi >= 0, `seed ${1000 + i * 997} seats a human`);
    humanIndexes.add(hi);
    assert(
      s.log.some((line) => line.startsWith("Launch order:")),
      `seed ${s.config.seed} logs Launch order`,
    );
    const orderLine = s.log.find((line) => line.startsWith("Launch order:"))!;
    const titles = s.players.map((p) => rocketTitle(p));
    assert(
      orderLine.includes(titles.join(" → ")),
      "Launch order lists rockets in seat order",
    );
  }
  assert(
    humanIndexes.size >= 2,
    `across seeds human is not always the same seat (got seats ${[...humanIndexes].sort().join(",")})`,
  );
  assert(
    ![...humanIndexes].every((i) => i === 0),
    "human is not always first to act (seat 0)",
  );
}

{
  const a = createGame({
    playerCount: 4,
    humanSeat: true,
    humanName: "Venture",
    seed: 4242,
  });
  const b = createGame({
    playerCount: 4,
    humanSeat: true,
    humanName: "Venture",
    seed: 4242,
  });
  assert(
    a.players.map((p) => p.id).join(",") === b.players.map((p) => p.id).join(","),
    "same seed → same seat permutation (selfplay-reproducible)",
  );
  assert(
    a.players.map((p) => p.agent).join(",") ===
      b.players.map((p) => p.agent).join(","),
    "same seed → same agent order",
  );
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll state seat-order checks passed.");
