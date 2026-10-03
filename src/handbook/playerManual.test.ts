/**
 * In-app Ops Manual must not render build tooling (#285).
 * Run: npx tsx src/handbook/playerManual.test.ts
 */
// Runs under tsx. The app tsconfig has no Node types.
// @ts-expect-error node:fs is available when this file is executed
import { readFileSync } from "node:fs";
import { mdToHtml } from "./mdToHtml";
import { playerChangelogMarkdown, playerReadmeMarkdown } from "./playerManual";

function assertMatch(text: string, pattern: RegExp, msg: string): void {
  if (!pattern.test(text)) throw new Error(msg);
}

function assertNo(text: string, pattern: RegExp, msg: string): void {
  if (pattern.test(text)) throw new Error(msg);
}

const root = new URL("../..", import.meta.url);
const readme = readFileSync(new URL("README.md", root), "utf8");
const changelog = readFileSync(new URL("CHANGELOG.md", root), "utf8");

const BANNED = /\b(npm|WebDist|wrapper)\b/;

assertMatch(readme, /npm run dev/, "GitHub README keeps npm");
assertMatch(readme, /WebDist/, "GitHub README keeps WebDist");
assertMatch(changelog, /WebDist/, "GitHub CHANGELOG keeps WebDist");

const readmeHtml = mdToHtml(playerReadmeMarkdown(readme));
const changelogHtml = mdToHtml(playerChangelogMarkdown(changelog));

assertNo(readmeHtml, BANNED, "in-app README still has build words");
assertNo(changelogHtml, BANNED, "in-app CHANGELOG still has build words");
assertMatch(readmeHtml, /three doors/, "in-app README keeps the doors");
assertMatch(readmeHtml, /Arcade/, "in-app README names Arcade");
assertMatch(changelogHtml, /Home doors/, "in-app CHANGELOG keeps 1.5.0 doors");
assertMatch(changelogHtml, /1\.5\.0/, "in-app CHANGELOG keeps 1.5.0");
assertNo(changelogHtml, /MARKETING_VERSION/, "in-app CHANGELOG keeps a build version");
assertNo(changelogHtml, /ios:sync/, "in-app CHANGELOG keeps a sync command");

const handbook = readFileSync(new URL("content.ts", import.meta.url), "utf8");
assertNo(handbook, BANNED, "handbook content.ts still mentions build tooling");

assertMatch(handbook, /The first screen is three doors/, "Home doors intro");
assertMatch(
  handbook,
  /Arcade shows "On the rocket" and "A short play\."/,
  "Home doors Arcade",
);
assertMatch(handbook, /Make a bigger bot, Backup fuel, and Slide puzzle/, "Home doors toys");
assertMatch(handbook, /Journey shows "Fly the ship" and "Full game\."/, "Home doors Journey");
assertMatch(handbook, /Deseret letters \(an old alphabet\)/, "Home doors Lab drills");
assertMatch(handbook, /Show more tools/, "Home doors more tools");
assertMatch(handbook, /Play one toy first/, "Home doors lock");
assertMatch(
  handbook,
  /Gravity Duel practice throws the big game away and starts a new one/,
  "Home doors last paragraph",
);
assertNo(handbook, /arcadeSessionsCompleted/, "Home doors drops the storage key");
assertNo(handbook, /\?lab=/, "Home doors drops query strings");
assertNo(handbook, /Show experiments/, "Home doors drops Show experiments");
assertNo(handbook, /balance host/, "Home doors drops the host name");
assertNo(handbook, /product sign-off/, "Home doors drops the operators paragraph");


console.log("playerManual: in-app README and CHANGELOG stay player-facing");
