/**
 * AI ship titles are display-only; stored callsigns stay bare (#144 / palindrome #47).
 * Run: npx tsx src/core/pilotNames.test.ts
 */
import { rivalPilotTopics, rivalPilotsIndexTopic } from "../handbook/pilots";
import {
  AI_PILOTS,
  isPalindromeRocketName,
  pickAiNames,
  rocketTitle,
  titledCallsign,
} from "./pilotNames";
import { createGame } from "./state";

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
  const expected: Record<string, string> = {
    Recorde: "The Recorde",
    "K-127": "The K-127",
    Turing: "The Turing",
    Ada: "The Ada",
    Sagan: "The Sagan",
    Asimov: "The Asimov",
    Clarke: "The Clarke",
    Goddard: "The Goddard",
    "von Braun": "The von Braun",
  };
  for (const [callsign, title] of Object.entries(expected)) {
    assert(
      titledCallsign(callsign) === title,
      `titledCallsign(${JSON.stringify(callsign)}) === ${JSON.stringify(title)}`,
    );
  }
  assert(
    titledCallsign("The Ada") === "The Ada",
    "titledCallsign leaves an existing The prefix",
  );
  assert(
    titledCallsign("  Ada  ") === "The Ada",
    "titledCallsign trims before prefixing",
  );
}

{
  assert(
    rocketTitle({ name: "Ada", agent: "ai" }) === "The Ada",
    "rocketTitle titles an AI Ada",
  );
  assert(
    rocketTitle({ name: "Venture", agent: "human" }) === "Venture",
    "rocketTitle leaves human Venture",
  );
  assert(
    rocketTitle({ name: "Ada", agent: "human" }) === "Ada",
    "human who types Ada stays Ada",
  );
  assert(
    rocketTitle({ name: "You", agent: "human" }) === "You",
    "human You stays You",
  );
}

{
  assert(isPalindromeRocketName("Ada") === true, "Ada is a palindrome");
  assert(isPalindromeRocketName("Turing") === false, "Turing is not a palindrome");
  assert(
    isPalindromeRocketName("The Ada") === false,
    "The Ada is not a palindrome — never store the title",
  );
  assert(
    isPalindromeRocketName("K-127") === false,
    "K-127 is not a palindrome",
  );
  assert(
    isPalindromeRocketName("von Braun") === false,
    "von Braun is not a palindrome",
  );
}

{
  const names = pickAiNames(AI_PILOTS.length, 1);
  assert(
    names.every((n) => n === n.trim() && !/^the\s+/i.test(n)),
    "pickAiNames returns bare callsigns",
  );
  assert(names.includes("Ada"), "Ada stays in the roster pool");
}

{
  const human = createGame({
    playerCount: 2,
    humanSeat: true,
    humanName: "Ada",
    seed: 1,
  });
  const you = human.players[0];
  assert(you.agent === "human", "human seat is human");
  assert(you.name === "Ada", "typed Ada is stored bare");
  assert(you.canBidirectional === true, "human Ada still palindromes");
  assert(rocketTitle(you) === "Ada", "human Ada display stays Ada");
}

{
  let seated: ReturnType<typeof createGame> | null = null;
  for (let seed = 1; seed < 4000 && !seated; seed++) {
    const s = createGame({
      playerCount: 4,
      humanSeat: true,
      humanName: "Venture",
      seed,
    });
    if (s.players.some((p) => p.agent === "ai" && p.name === "Ada")) seated = s;
  }
  assert(seated !== null, "some seed seats AI Ada");
  const ada = seated!.players.find((p) => p.agent === "ai" && p.name === "Ada")!;
  assert(ada.name === "Ada", "AI Ada stored name is the bare callsign");
  assert(ada.canBidirectional === true, "AI Ada still unlocks bidirectional");
  assert(rocketTitle(ada) === "The Ada", "AI Ada displays as The Ada");
  const venture = seated!.players.find((p) => p.agent === "human")!;
  assert(venture.name === "Venture", "human Venture stored bare");
  assert(rocketTitle(venture) === "Venture", "human Venture displays as Venture");
}

{
  const topics = rivalPilotTopics();
  const ada = topics.find((t) => t.id === "pilot-ada");
  assert(ada?.title === "The Ada", "handbook Ada title is The Ada");
  assert(
    topics.every((t) => t.title.startsWith("The ")),
    "every rival topic title uses The + callsign",
  );
  assert(
    topics.every((t) => !/Rocket\s*:/.test(t.title)),
    "handbook titles never use Rocket colon",
  );
  assert(
    topics.every((t) => !t.html.includes("Rocket ·")),
    "handbook bodies drop Rocket · callsign footer",
  );
  const index = rivalPilotsIndexTopic();
  assert(index.html.includes("The Ada"), "rival-rockets index lists The Ada");
  assert(index.html.includes("The Turing"), "rival-rockets index lists The Turing");
  assert(index.html.includes("The K-127"), "rival-rockets index lists The K-127");
  assert(index.html.includes("The von Braun"), "rival-rockets index lists The von Braun");
  assert(
    !index.html.includes("<strong>Ada</strong>"),
    "index does not list bare Ada",
  );
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll pilot-name checks passed.");
