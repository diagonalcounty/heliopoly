/** Player-facing Helios Ops Manual. Matches running build. */

import { rivalPilotsIndexTopic, rivalPilotTopics } from "./pilots";
import { projectDocsSection } from "./mdDocs";
import { planetoidsIndexTopic, planetoidTopics } from "./planetoids";

export interface HandbookTopic {
  id: string;
  title: string;
  html: string;
}

/** Top-level TOC sections (Civ civilopedia categories). */
export interface HandbookSection {
  id: string;
  title: string;
  topics: HandbookTopic[];
}

/**
 * Placement rules for this draft:
 * - **Lore** — setting, charter fiction, map as world (not button-by-button rules)
 * - **Gameplay** — how to play, win, economy, combat, UI symbols
 * - **Rival pilots** — callsign civilopedia
 * Topics only land in a section if they clearly fit; leftover = Gameplay “Reference”
 * only when still player-facing rules.
 */

const LORE_TOPICS: HandbookTopic[] = [
  {
    id: "welcome",
    title: "Welcome, Venture",
    html: `
<p><strong>Heliopoly</strong> — <em>Free Enterprise In Space</em> (v0.0.14).</p>
<p>Open source: <a href="https://github.com/diagonalcounty/heliopoly" target="_blank" rel="noopener">github.com/diagonalcounty/heliopoly</a> — issues and PRs welcome.</p>
<p>This is a <strong>preparatory simulator</strong> for near-future space enterprise: close-quarters economics like chess or Monopoly, abstracting fuel, orbits, and frontier capitalism so you can practice the mental model before the real Mainline opens.</p>
<p>Earth’s old regulations stop at the edge of the system. Independent operators fly a rigid one-way orbital circuit — <strong>the Mainline</strong> — to build fortunes while propellant, claims, and the ledger stay honest.</p>
<p>There is <strong>no round clock</strong> — last rocket flying wins.</p>
<p>Close this manual with <kbd>Esc</kbd>, <strong>✕</strong>, or the dimmed backdrop.</p>
`,
  },
  {
    id: "ledger",
    title: "AIL & the Angzarr (⍼)",
    html: `
<p>Legacy public ledgers (Bitcoin, Ethereum, and their kin) did not survive the leap to practical quantum attack. Settlement now runs on a quantum-resilient decentralized database: the <strong>AIL</strong> — <em>Automated Interplanetary Asset Ledger</em>.</p>
<p>Deeds, rent, fuel transfers, and strikes settle in <strong>Angzarr</strong>, written <strong>⍼</strong> before the amount (e.g. ⍼150). The glyph is the UI face of the ledger; the value is AIL state.</p>
<p><strong>Genesis injection:</strong> a huge smart-contract payout or venture seed at launch (e.g. the Heliopolis callsign) is not a glitch — it is a funded charter dropped onto the Mainline.</p>
`,
  },
  {
    id: "path",
    title: "The Mainline",
    html: `
<p>Traffic follows one fixed circuit (one direction) — the <strong>Mainline</strong>:</p>
<ol>
  <li><strong>Earth</strong> → Venus → Mercury</li>
  <li><strong>Mars system</strong> — Elon → Mars → Phobos → Deimos</li>
  <li><strong>Asteroid belt</strong> — blank transit lanes (Gravity Duel country)</li>
  <li><strong>Jupiter</strong> — Holst Space Station + Io, Europa, Ganymede, Callisto + blanks</li>
  <li><strong>Saturn</strong> — Daktulios + Titan, Enceladus, Iapetus, Mimas, Rhea, Dione, Tethys + blanks</li>
  <li>Homeward → <strong>Earth</strong></li>
</ol>
<p>Completing this full loop is <strong>one board rotation</strong>. Blank lanes cost <em>no leave fuel</em> but are not free of conflict if another ship is already there.</p>
`,
  },
  {
    id: "stations-lore",
    title: "Hub stations",
    html: `
<p><strong>Elon</strong>, <strong>Holst</strong>, and <strong>Daktulios</strong> are not ordinary deeds. Free of planetary wells and heavy red tape, they are refining choke points and trade ports — ice and mass from the outer system process here. Own the hubs and you own tollbooths on the pipeline.</p>
<ul>
  <li><strong>Elon (Mars)</strong> — named for the era that crashed per-kilogram launch cost and made commercial solar access imaginable.</li>
  <li><strong>Holst (Jupiter)</strong> — after Gustav Holst; <em>The Planets</em> gave Jupiter a cultural boom long before a station hung in its sky.</li>
  <li><strong>Daktulios (Saturn)</strong> — from the Greek for “ring”: the ring-station transit hub anchored in Saturn’s system.</li>
</ul>
<p>Gameplay: own <strong>2</strong> hubs → rent <strong>×2</strong> on hubs; own <strong>3</strong> → rent <strong>×4</strong>. Station network stacks with system monopoly.</p>
`,
  },
];

const GAMEPLAY_TOPICS: HandbookTopic[] = [
  {
    id: "how-to-win",
    title: "How to win",
    html: `
<p><strong>Last rocket flying wins</strong> (others bankrupt or strand). There is <strong>no round limit</strong>.</p>
<p>Eliminated rockets’ deeds return to the <strong>bank</strong> (available again); depots are lost.</p>
<p>See <strong>Glossary</strong> for <em>turn</em>, <em>round</em>, and <em>rotation</em>. Charter alerts use <strong>rounds</strong>, not turns.</p>
`,
  },
  {
    id: "glossary",
    title: "Glossary",
    html: `
<p>Locked vocabulary so design talk stays consistent:</p>
<table class="glossary">
  <thead><tr><th>Term</th><th>Meaning</th><th>In code / UI</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Turn</strong></td>
      <td>One rocket’s seat at the table: from becoming current through end turn (roll + move, or skip, or park). Skipped seats still count as a turn for the seat clock.</td>
      <td><code>gameTurn</code> · “Turn N” in the log</td>
    </tr>
    <tr>
      <td><strong>Round</strong></td>
      <td>Everyone has had a seat turn — a full pass through the player order (including skips / parks).</td>
      <td><code>round</code> · “Round N” in the log</td>
    </tr>
    <tr>
      <td><strong>Rotation</strong></td>
      <td>One rocket completes a full circuit of the board path (leaves Earth and returns). Personal to that rocket.</td>
      <td>Circuit complete log · <code>boardRotations</code> (global count of circuits finished)</td>
    </tr>
    <tr>
      <td><strong>Park</strong></td>
      <td>A seat turn where that rocket does <em>not</em> move (camp, full break, failed leave, duel skip). Cumulative park count drives feral risk.</td>
      <td><code>parkCount</code></td>
    </tr>
  </tbody>
</table>
<p><strong>Charter alerts</strong> (timed popups): after <strong>5 rounds</strong> since the last alert (or start), <strong>50%</strong> chance once per round; each miss, chance moves halfway toward 100% (50% → 75% → 87.5% …) until it fires; then wait 5 rounds again. Each alert type fires <strong>at most once</strong> per charter (Monolith stipend, free brake M&amp;Ms, King’s Quest warp, …).</p>
`,
  },
  {
    id: "turn-flow",
    title: "Roll, break, move & sell",
    html: `
<ol>
  <li><strong>Roll</strong> — 2d6 is your <em>maximum</em> travel (no move yet).</li>
  <li><strong>Break</strong> — optional: shave spaces (−1 space = 0.5 fuel, −2 = 1 fuel, …).</li>
  <li><strong>Move</strong> — travel (dice − break). Button switches from Roll → Move.</li>
  <li>After landing: <strong>Buy</strong> / <strong>Sell claim</strong> (½ price, depot scrapped) / Depot / End turn.</li>
</ol>
<p>Landing is free. Leaving a gravity well costs fuel. Failed leave on an enemy claim charges rent again.</p>
<p><strong>Earth charter pay:</strong> <strong>⍼400</strong> when you <em>land</em> on Earth, <strong>⍼200</strong> when you <em>pass</em> Earth on a multi-space move (intermediate stop). Each completed board <strong>rotation</strong> adds <strong>⍼10</strong> to both amounts thereafter. Completing rotation <strong>10, 20, 30…</strong> also pays a one-time <strong>⍼1000</strong> decade bonus. Full circuit still resupplies fuel depots (+3 in hand).</p>
<p><strong>King’s Quest warp</strong> (charter alert): when you have a warp charge, you may <strong>click any board node</strong> instead of rolling — teleport there (no en-route stops). Landing rules still apply at the destination.</p>
`,
  },
  {
    id: "legend",
    title: "Board legend",
    html: `
<div class="legend-grid">
  <div class="legend-item"><img src="/handbook/legend-planet.svg" alt="" width="48" height="48"/><div><strong>Painted planets</strong><br/>Earth, Mars, Venus, Mercury (distinct surface art)</div></div>
  <div class="legend-item"><img src="/handbook/legend-moon-orange.svg" alt="" width="48" height="48"/><div><strong>Orange moons</strong><br/>Jupiter system (Io, Europa, Ganymede, Callisto)</div></div>
  <div class="legend-item"><img src="/handbook/legend-moon-yellow.svg" alt="" width="48" height="48"/><div><strong>Yellow moons</strong><br/>Saturn system (Titan, Enceladus, …)</div></div>
  <div class="legend-item"><img src="/handbook/legend-station.svg" alt="" width="48" height="48"/><div><strong>Ring stations</strong><br/>Elon, Holst, Daktulios — hub habitats, not plain circles</div></div>
  <div class="legend-item"><img src="/handbook/legend-blank.svg" alt="" width="48" height="48"/><div><strong>Diamond pips</strong><br/>Blank belt/transit (red-tint = Gravity Duel lanes)</div></div>
  <div class="legend-item"><img src="/handbook/legend-claim.svg" alt="" width="48" height="48"/><div><strong>Colored halo</strong><br/>Your claim (rocket color)</div></div>
  <div class="legend-item"><img src="/handbook/fuel-depot.png" alt="" width="48" height="48"/><div><strong>Fuel depot</strong><br/>Player-built tank badge on a body you own</div></div>
  <div class="legend-item"><img src="/handbook/legend-ship.svg" alt="" width="48" height="48"/><div><strong>Triangle ship</strong><br/>Rocket marker (gold outline while hopping)</div></div>
  <div class="legend-item"><img src="/handbook/legend-rings.svg" alt="" width="48" height="48"/><div><strong>Dashed circles</strong><br/>Orbital rings from the Sun</div></div>
</div>
`,
  },
  {
    id: "monopoly",
    title: "Systems & monopoly",
    html: `
<p>Own <strong>every deed in a system</strong> → <strong>rent doubles</strong> on any landing there.</p>
<ul>
  <li><strong>Mercury / Venus</strong> — single planet each</li>
  <li><strong>Mars</strong> — Elon + Mars + Phobos + Deimos</li>
  <li><strong>Jupiter</strong> — Holst + four moons</li>
  <li><strong>Saturn</strong> — Daktulios + seven moons</li>
</ul>
<p><strong>Space stations</strong> (Elon · Holst Space Station · Daktulios) also form a railroad-style set of their own:</p>
<ul>
  <li>Own <strong>2</strong> hubs → rent <strong>×2</strong> on those hubs</li>
  <li>Own <strong>all 3</strong> → rent <strong>×4</strong> on those hubs</li>
</ul>
<p>System monopoly and the station network <em>stack</em> (e.g. full Mars + all hubs multiplies Elon by both).</p>
<p>Earth is never a deed.</p>
`,
  },
  {
    id: "depots",
    title: "Fuel depots",
    html: `
<p>You start with <strong>3 fuel depots</strong> in hand. Place them on <strong>planets or moons you own</strong> (not on hub stations like Holst/Elon/Daktulios).</p>
<p>Depots boost rent and enable free refuel on that body (for you).</p>
<p><strong>Earth resupply:</strong> each time you complete a full board circuit and return to Earth, you receive <strong>+3 depots</strong> in hand again (so you can expand the network each loop). Placed depots stay on the map until feral/elimination.</p>
<p>If a claim goes feral or you are eliminated, depots on those claims are <strong>destroyed</strong>.</p>
`,
  },
  {
    id: "propellant",
    title: "Propellant",
    html: `
<p><strong>Methane (CH₄)</strong> — stable tanks, no leaks: the conservative operator’s choice. Claim + fuel depot on <strong>Titan</strong> or <strong>Enceladus</strong> can fire a one-time <strong>resource strike</strong> (½ starting cash) — e.g. “You've struck liquid methane!”</p>
<p><strong>Hydrogen (H₂)</strong> — cheaper leave burns, higher risk. <strong>Landing</strong> on a real body can rupture tanks: <strong>half your fuel</strong> and <strong>lose next turn</strong> to repair. Balanced by ice-strike potential on <strong>Enceladus, Mars, Europa, Ganymede</strong> (claim + depot).</p>
<p>Strike pop-ups are sudden and terse — good fortune on a hard charter.</p>
`,
  },
  {
    id: "duel",
    title: "Gravity Duel",
    html: `
<p>In the blank transit lanes — diamonds on the belt and other empty path nodes — Earth’s polite traffic rules do not apply. When two rockets try to share the same slingshot, they fight a <strong>Gravity Duel</strong> for the lane.</p>

<h4>When does a duel start?</h4>
<ul>
  <li>You <strong>land</strong> on a <strong>blank / space</strong> node (not a planet, moon, or hub station).</li>
  <li>Another living rocket is already there, or the lane has a remembered defender from a prior fight.</li>
  <li>You are the <strong>challenger</strong> (arriver). The other pilot is the <strong>defender</strong>.</li>
</ul>
<p>No duel on planets, moons, hubs, or Earth — only those empty transit pips.</p>

<h4>How to play (human steps)</h4>
<ol>
  <li><strong>Pick a secret stance</strong> — <strong>Low</strong> or <strong>High</strong>. The opponent does the same. Neither of you sees the other’s choice yet.</li>
  <li><strong>Roll 2d6</strong> when prompted (both sides roll).</li>
  <li><strong>Reveal</strong> — stances and totals show together. The game picks a winner (or a tie) from the rules below.</li>
  <li>Read the result on the same duel panel (names and dice stay visible), then continue.</li>
</ol>

<h4>How the winner is decided</h4>
<p>Both pilots always roll <strong>2d6</strong>. What “good” means depends on the stance pair:</p>
<table class="glossary">
  <thead><tr><th>Your stances</th><th>Who wins</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Both Low</strong></td>
      <td>The <strong>lower</strong> dice total wins (gentler burn / tighter slot).</td>
    </tr>
    <tr>
      <td><strong>Both High</strong></td>
      <td>The <strong>higher</strong> dice total wins (harder burn / bigger swing).</td>
    </tr>
    <tr>
      <td><strong>Mixed</strong> (one Low, one High)</td>
      <td>Whichever total is <strong>closer to the running mean</strong> of all 2d6 rolls so far this game wins. (If no history yet, the mean defaults to <strong>7</strong>.)</td>
    </tr>
  </tbody>
</table>
<p>If totals (or distances to the mean) are equal → <strong>tie</strong> (see stakes).</p>
<p><strong>Tip:</strong> Low is a bet on rolling small; High on rolling large. Mixed turns the fight into “who is nearer average,” so a mid roll can beat a dramatic high or low.</p>

<h4>Stakes</h4>
<ul>
  <li><strong>Loser</strong> — skips their <strong>next full seat turn</strong> (that skip also counts as a <strong>park</strong> for feral risk) <strong>and</strong> is <strong>knocked back one space</strong> on the Mainline (toward the previous beacon). Knockback can charge rent / Earth pay / leak at the new node; it does not start a second duel.</li>
  <li><strong>Winner</strong> — gains a one-time <strong>rent waiver</strong> against the loser: the next time the winner would pay rent to that pilot’s claims, the fee is free (waiver consumed).</li>
  <li><strong>Tie</strong> — both hold the lane; nobody skips, no knockback, no waiver. The next arrival may face the last roller as defender.</li>
  <li>If the loser is already on <strong>Earth</strong>, they cannot be shoved further back.</li>
</ul>

<h4>What the panel is showing you</h4>
<p>Your rocket is usually on the right when you are human; the rival on the left. Use <strong>Low</strong> / <strong>High</strong>, then <strong>Roll</strong>. AI seats lock and roll automatically. The result splash keeps the matchup context — it does not throw you into a blank full-screen with no names.</p>

<p class="handbook-note">Realtime / animated duels are not in this build yet (see “Not yet”). The rules above are the live dice duel.</p>
`,
  },
  {
    id: "feral",
    title: "Parking & feral claims",
    html: `
<p><strong>Why claims go feral:</strong> not political betrayal or human “neglect,” but <strong>software bitrot</strong>. AI-managed extraction units, rigs, and pods throw unhandled exceptions. Without a pilot looping the Mainline to push maintenance patches, local automation degrades beyond salvage. The <strong>AIL</strong> scrubs the asset, marks the hardware derelict, and drops the deed back onto the open network.</p>
<p><strong>Live mechanic (parking):</strong> if your rocket <strong>does not move</strong> on a seat turn — camp, full break, failed leave, or duel skip — that is a <strong>park</strong>. Parks are <strong>cumulative</strong> for the whole charter (moving later does <em>not</em> clear the count).</p>
<ul>
  <li>Parks <strong>1–4</strong> — no feral check yet.</li>
  <li>Park <strong>5</strong> — <strong>each</strong> of your claims rolls: <strong>50%</strong> chance to go <strong>feral</strong>.</li>
  <li>Each park after that <strong>doubles</strong> the chance (100% from park <strong>6</strong> onward).</li>
</ul>
<p><strong>Feral outcome:</strong> claim returns to the bank (unowned). Any fuel depot on it is <strong>destroyed</strong>. Other pilots may buy it again.</p>
<p>Moving on a turn avoids adding a park <em>that turn</em>. Park count never resets. Check your park count on the turn panel.</p>
`,
  },
  {
    id: "not-in-build",
    title: "Not yet",
    html: `
<ul>
  <li>Purchasable transfer nodes between rings</li>
  <li>Player trading</li>
  <li>Fuel prices by location (Earth cheapest is direction only; full matrix later)</li>
  <li>Realtime Gravity Duel</li>
  <li>Named transit lanes (figures not used as rival rockets — see design notes)</li>
</ul>
`,
  },
];

const rivalIndex = rivalPilotsIndexTopic();
/** Section already says Rival pilots — shorten index title. */
const rivalIndexTopic: HandbookTopic = {
  ...rivalIndex,
  title: "Overview",
};

export const HANDBOOK_SECTIONS: HandbookSection[] = [
  {
    id: "lore",
    title: "Lore",
    topics: LORE_TOPICS,
  },
  {
    id: "gameplay",
    title: "Gameplay",
    topics: GAMEPLAY_TOPICS,
  },
  {
    id: "rival-pilots",
    title: "Rival rockets",
    topics: [rivalIndexTopic, ...rivalPilotTopics()],
  },
  {
    id: "bodies",
    title: "Bodies",
    topics: [planetoidsIndexTopic(), ...planetoidTopics()],
  },
  projectDocsSection(),
];

/** Flat list for lookup / open(topicId). */
export const HANDBOOK_TOPICS: HandbookTopic[] = HANDBOOK_SECTIONS.flatMap(
  (s) => s.topics,
);

export function getTopic(id: string): HandbookTopic | undefined {
  return HANDBOOK_TOPICS.find((t) => t.id === id);
}

export function sectionForTopic(topicId: string): HandbookSection | undefined {
  return HANDBOOK_SECTIONS.find((s) => s.topics.some((t) => t.id === topicId));
}

export const DEFAULT_TOPIC_ID = "welcome";
