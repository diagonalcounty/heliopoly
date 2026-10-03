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

assertMatch(
  handbook,
  /Heliopoly[\s\S]*Orbital Economics[\s\S]*rockets and buying worlds in space/,
  "Read this first names the game",
);
assertMatch(handbook, /You buy claims \(you own a world\)/, "Read this first explains claims");
assertMatch(handbook, /duel \(a lane fight\)/, "Read this first explains a duel");
assertMatch(handbook, /There is no timer\. Last rocket flying wins\./, "Read this first keeps the timer line");
assertMatch(handbook, /Close this with the Esc key/, "Read this first close line");
assertNo(handbook, /github\.com\/diagonalcounty\/heliopoly/, "Read this first drops the source link");
assertNo(handbook, /dim backdrop/, "Read this first drops the dim backdrop");
assertNo(handbook, /Ethereum/, "ledger drops Ethereum");
assertNo(handbook, /quantum/, "ledger drops quantum computers");
assertMatch(handbook, /Angzarr is the money/, "ledger money line");
assertMatch(handbook, /space book of who owns what/, "ledger AIL line");
assertMatch(handbook, /Contracts \(deals\)/, "ledger contracts");
assertMatch(handbook, /every expedition \(long trip\)/, "ledger history");
assertMatch(handbook, /money for your first launch/, "ledger start cash");
assertMatch(handbook, /The circuit \(the whole loop\)/, "Mainline circuit");
assertMatch(handbook, /Earth<\/strong> → Venus → Mercury/, "Mainline keeps Earth to Mercury");
assertMatch(handbook, /Elon → Mars → Phobos → Deimos/, "Mainline keeps the Mars system");
assertMatch(handbook, /Homeward → <strong>Earth<\/strong>/, "Mainline keeps Homeward");
assertMatch(handbook, /blank lanes \(empty stops, no world to buy\)/, "Mainline blank lanes");
assertMatch(handbook, /one time around/, "Mainline rotation");
assertNo(handbook, /blank transit lanes \(Gravity Duel country\)/, "Mainline drops Gravity Duel country lanes");
assertMatch(handbook, /away from each planet's strong pull/, "hub stations wells");
assertMatch(handbook, /rogue Tesla \(it flies wild\)/, "hub stations Tesla");
assertMatch(handbook, /sun power for sale seemed possible/, "hub stations Elon");
assertMatch(handbook, /His music, <em>The Planets<\/em>/, "hub stations Holst");
assertMatch(handbook, /from the Greek for "ring"/, "hub stations Daktulios");
assertMatch(handbook, /you own every world in that planet's group/, "hub stations monopoly");
assertNo(handbook, /per-kilogram/, "hub stations drops per-kilogram");
assertNo(handbook, /funded launch/, "ledger drops funded launch");
assertMatch(handbook, /go bankrupt \(run out of money\)/, "How to win explains bankrupt");
assertMatch(handbook, /one of the greatest/, "How to win drops greatest of all kind");
assertNo(handbook, /greatest of all kind/, "How to win drops greatest of all kind phrase");
assertMatch(handbook, /no round limit \(the game does not stop on a count\)/, "How to win round limit");
assertMatch(handbook, /Fuel depots \(fuel stops it built\)/, "How to win depots");
assertMatch(handbook, /Glossary<\/strong> \(the word list\)/, "How to win glossary pointer");
assertMatch(handbook, /Words the game uses the same way every time/, "Glossary intro");
assertMatch(handbook, /seat clock \(the count for that rocket\)/, "Glossary turn");
assertMatch(handbook, /including skips and parks \(staying put\)/, "Glossary round");
assertMatch(handbook, /One full loop of the Mainline \(the only path\)/, "Glossary rotation");
assertMatch(handbook, /duel skip \(no move after a lane fight\)/, "Glossary park");
assertMatch(handbook, /at the line between rounds/, "Glossary ledger event");
assertMatch(handbook, /tap any beacon \(a marked stop\)/, "Glossary warp");
assertNo(handbook, /Skipped seats still count/, "Glossary drops the old turn line");
assertMatch(handbook, /cards that break up the ordinary play/, "Ledger events intro");
assertMatch(handbook, /Timing \(the usual set\)/, "Ledger events timing heading");
assertMatch(handbook, /halfway toward certain/, "Ledger events miss chance");
assertMatch(handbook, /Tesla and Karen land only on the computer's rockets/, "Ledger events who");
assertMatch(handbook, /Choices on the screen/, "Ledger events choices heading");
assertMatch(handbook, /not these book surprises/, "Ledger events not-events line");
assertNo(handbook, /Cadence \(standard pool\)/, "Ledger events drops Cadence heading");
assertNo(handbook, /Picks &amp; UI/, "Ledger events drops Picks heading");
assertNo(handbook, /break up the grind/, "Ledger events drops grind");
assertMatch(handbook, /Once, that rocket gets <strong>⍼300<\/strong>/, "Standard pool Monolith");
assertMatch(handbook, /free brake<\/strong> \(a free stop-short\)/, "Standard pool M&Ms");
assertMatch(handbook, /a saved jump: tap any beacon/, "Standard pool King's Quest");
assertMatch(handbook, /both can show in one expedition \(this game\)/, "Standard pool Strong Bad");
assertMatch(handbook, /not past a full tank/, "Standard pool Arcadia");
assertMatch(handbook, /fuel depot<\/strong> \(a fuel stop\) in hand/, "Standard pool Belt ice");
assertMatch(handbook, /cash \(money\) now/, "Standard pool dividend");
assertMatch(handbook, /gravity well \(a strong pull, like a planet or moon\)/, "Standard pool comet");
assertMatch(handbook, /next rent \(pay to the owner\)/, "Standard pool holiday");
assertMatch(handbook, /only computer-owned worlds count/, "Standard pool Tesla");
assertMatch(handbook, /You tap the hub; the computer picks/, "Standard pool Olbers");
assertMatch(handbook, /Insight: computer only/, "Standard pool Karen");
assertMatch(handbook, /hubs cannot hold fuel pods/, "Standard pool invalid claim");
assertMatch(handbook, /Pay <strong>50<\/strong> and miss the next turn/, "Standard pool Hot microphone");
assertMatch(handbook, /one less stay-put on the count/, "Standard pool Tuesday boy");
assertMatch(handbook, /That rocket loses <strong>2 fuel<\/strong>/, "Standard pool Error 47");
assertNo(handbook, /The terminal dumps/, "Standard pool drops terminal dump");
assertNo(handbook, /capped at tank max/, "Standard pool drops tank max");
assertMatch(handbook, /This card keeps its own count/, "Rare Kostka trigger");
assertMatch(handbook, /passes by Earth; a landing counts too/, "Rare Earth transits");
assertMatch(handbook, /They adopt a dog named Kostka\. <strong>\+200<\/strong> \(money\)/, "Rare Kostka effect");
assertMatch(handbook, /Attend Adalynn's graduation\. Take Ainsley to get her driver's license\. Go to a swim meet for Avery and Alanna\./, "Rare family sentences");
assertMatch(handbook, /Each pays <strong>\+200<\/strong> \(money\)/, "Rare family pay");
assertMatch(handbook, /not Kostka.s roll and not the round pool \(the usual set\)/, "Rare own roll");
assertMatch(handbook, /the lead computer rocket is the chooser/, "Rare vibe who");
assertMatch(handbook, /off the ledger \(out of the book\)/, "Rare vibe effect");
assertNo(handbook, /Living human, else the lead AI/, "Rare drops old vibe who");
assertNo(handbook, /this charter/, "Rare drops charter");
assertMatch(handbook, /two dice \(2d6\) set how far you can go/, "Turn flow Roll");
assertMatch(handbook, /Stop short<\/strong> — optional/, "Turn flow Stop short");
assertMatch(handbook, /Sell from far away/, "Turn flow remote sell");
assertMatch(handbook, /unowned deed \(proof you buy that world\)/, "Turn flow buy window");
assertMatch(handbook, /gravity well \(a strong pull, like a planet or moon\)/, "Turn flow gravity well");
assertMatch(handbook, /decade bonus \(a big bonus each ten loops\)/, "Turn flow decade bonus");
assertMatch(handbook, /warp charge \(a saved jump\)/, "Turn flow warp");
assertNo(handbook, /shave spaces/, "Turn flow drops Break shave");
assertNo(handbook, /one-click dump/, "Turn flow drops one-click dump");
assertMatch(handbook, /not a second set of pictures/, "Legend same paint");
assertMatch(handbook, /each has its own ground/, "Legend planets");
assertMatch(handbook, /Moons by group/, "Legend moons");
assertMatch(handbook, /amber — a warm orange/, "Legend stations");
assertMatch(handbook, /Diamond marks/, "Legend diamonds");
assertMatch(handbook, /no halo \(no colored glow\)/, "Legend unowned");
assertMatch(handbook, /The label becomes "Mars · Venture"/, "Legend your claim");
assertMatch(handbook, /cannot hold a fuel pod \(a fuel tank\)/, "Legend depot on world");
assertMatch(handbook, /cyan \(bright blue-green\)/, "Legend tank");
assertMatch(handbook, /parked \(staying put\)/, "Legend rocket");
assertMatch(handbook, /Rings around the Sun, tinted by group/, "Legend rings");
assertNo(handbook, /separate clip-art set/, "Legend drops clip-art");
assertNo(handbook, /Diamond pips/, "Legend drops pips");
assertMatch(handbook, /Own every deed \(proof you own each one\)/, "Monopoly intro");
assertMatch(handbook, /each group is that one planet/, "Monopoly inner planets");
assertMatch(handbook, /Elon \(the station\) \+ Mars \+ Phobos \+ Deimos/, "Monopoly Mars");
assertMatch(handbook, /Holst \(the station\) \+ four moons/, "Monopoly Jupiter");
assertMatch(handbook, /Daktulios \(the station\) \+ seven moons/, "Monopoly Saturn");
assertMatch(handbook, /Own <strong>2<\/strong> hubs \(stations\)/, "Monopoly two hubs");
assertMatch(handbook, /multiplies Elon's rent by both/, "Monopoly stack");
assertMatch(handbook, /Earth is never a deed \(it is never for sale\)/, "Monopoly Earth");
assertNo(handbook, /railroad-style/, "Monopoly drops railroad");
assertMatch(handbook, /its page of books/, "Dossier intro");
assertMatch(handbook, /You get the cash\./, "Dossier keeps cash line");
assertMatch(handbook, /not a sure cheap win/, "Dossier clearance");
assertMatch(handbook, /not while a path is in the air/, "Dossier sale timing");
assertNo(handbook, /Sim Lab/, "Dossier drops Sim Lab");
assertMatch(handbook, /Add fuel stop<\/strong> places one/, "Fuel depots place");
assertMatch(handbook, /not a hub \(a station\) like Holst, Elon, or Daktulios/, "Fuel depots hubs");
assertMatch(handbook, /Cost each circuit<\/strong> \(one full loop home\)/, "Fuel depots circuit");
assertMatch(handbook, /goes feral \(goes wild\), or you are out/, "Fuel depots resupply");
assertMatch(handbook, /eliminated \(you are out\)/, "Fuel depots eliminated");
assertNo(handbook, /planetoids only/, "Fuel depots drops planetoids only");
assertMatch(handbook, /Methane \(CH₄, safer fuel\)/, "Propellant methane");
assertMatch(handbook, /You've struck liquid methane!/, "Propellant exact methane line");
assertMatch(handbook, /Hydrogen \(H₂, can leak\)/, "Propellant hydrogen");
assertMatch(handbook, /writes a deed \(proof you own a world\)/, "Propellant ledger");
assertNo(handbook, /conservative operator/, "Propellant drops operator");
assertMatch(handbook, /they fight a <strong>Gravity Duel<\/strong> \(a lane fight\)/, "Gravity Duel intro");
assertMatch(handbook, /empty-stop marks/, "Gravity Duel start");
assertMatch(handbook, /Tap <strong>Roll dice<\/strong> when asked/, "Gravity Duel roll");
assertMatch(handbook, /a gentler burn, a smaller push/, "Gravity Duel both low");
assertMatch(handbook, /that average starts at <strong>7<\/strong>/, "Gravity Duel mean");
assertMatch(handbook, /If the loser is already on Earth, they cannot be shoved further back\./, "Gravity Duel Earth line");
assertMatch(handbook, /dice fight you play now/, "Gravity Duel note");
assertNo(handbook, /empty transit pips/, "Gravity Duel drops pips");
assertNo(handbook, /Realtime \/ animated duels/, "Gravity Duel drops realtime note");
assertMatch(handbook, /how long the game is/, "Expedition intro");
assertMatch(handbook, /Insight<\/strong> \(shortest\)/, "Expedition Insight");
assertMatch(handbook, /Curiosity<\/strong> \(stay and look\)/, "Expedition Curiosity");
assertMatch(handbook, /Voyager<\/strong> \(long game\)/, "Expedition Voyager");
assertMatch(handbook, /Opportunity<\/strong> \(longest, hardest\)/, "Expedition Opportunity");
assertMatch(handbook, /not the rocket in the lead/, "Expedition prize cards");
assertMatch(handbook, /This length is for <strong>Journey<\/strong>/, "Expedition speed");
assertNo(handbook, /Stay and poke/, "Expedition drops poke");
assertMatch(handbook, /because you sat still/, "Feral intro");
assertMatch(handbook, /duel skip \(no move after a lane fight\)/, "Feral park");
assertMatch(handbook, /does not become a sure thing on the next park/, "Feral later parks");
assertMatch(handbook, /Any fuel depot \(fuel stop\) on it is destroyed/, "Feral depot");
assertNo(handbook, /software rots/, "Feral drops software rots");
assertNo(handbook, /hardware junk/, "Feral drops hardware junk");
assertMatch(handbook, /one ring of worlds \(one loop of worlds\)/, "Not yet hop");
assertMatch(handbook, /by selling or swapping/, "Not yet trading");
assertMatch(handbook, /not a price list you can use yet/, "Not yet fuel prices");
assertMatch(handbook, /lane fight that plays out as it happens/, "Not yet live duel");
assertMatch(handbook, /Those names are not other rockets/, "Not yet named lanes");
assertNo(handbook, /Purchasable transfer nodes/, "Not yet drops transfer nodes");
assertNo(handbook, /full matrix later/, "Not yet drops matrix");
const pilots = readFileSync(new URL("pilots.ts", import.meta.url), "utf8");
const names = readFileSync(new URL("../core/pilotNames.ts", import.meta.url), "utf8");
assertMatch(pilots, /Each rival flies a named rocket, not a named pilot/, "Overview ships");
assertMatch(pilots, /during the expedition \(this game\)/, "Overview list reason");
assertMatch(pilots, /Those lanes are not in the game yet, and those names are not other rockets/, "Overview lanes");
assertMatch(pilots, /Open a rocket page below in this section/, "Overview closer");
assertMatch(pilots, /See the Overview page under Rival rockets\./, "Overview footer");
assertMatch(names, /A Khmer stele \(a carved stone at Sambor\)/, "Overview K-127 hook");
assertMatch(names, /Helped invent computer science \(the study of what computers can do\)/, "Overview Turing hook");
assertMatch(names, /a person who writes what a computer should do/, "Overview Ada hook");
assertMatch(names, /An astronomer \(a person who studies space\)/, "Overview Sagan hook");
assertMatch(names, /made-up stories about science/, "Overview Asimov hook");
assertMatch(names, /a satellite that stays over one spot on Earth/, "Overview Clarke hook");
assertMatch(names, /These are ideas, not a flight crew/, "Overview Goddard hook");
assertMatch(names, /The history is not simple/, "Overview von Braun hook");
assertMatch(names, /Robert Recorde — invented the equals sign \(=\) in 1557\./, "Overview Recorde hook");
assertMatch(pilots, /money and fuel in this game\) keeps score/, "The Recorde page");


console.log("playerManual: in-app README and CHANGELOG stay player-facing");
