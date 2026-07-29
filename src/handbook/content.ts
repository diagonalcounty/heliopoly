/** Player-facing Helios Ops Manual. Matches running build. */

import { rivalPilotsIndexTopic, rivalPilotTopics } from "./pilots";

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
    title: "Welcome, Captain",
    html: `
<p><strong>Heliopoly</strong> — <em>Free Enterprise In Space</em> (v0.0.7).</p>
<p>Open source: <a href="https://github.com/diagonalcounty/heliopoly" target="_blank" rel="noopener">github.com/diagonalcounty/heliopoly</a> — issues and PRs welcome.</p>
<p>The solar system is open for charter. Buy claims, hold systems, keep propellant, and outlast every other pilot. There is <strong>no round clock</strong> — last pilot flying wins.</p>
<p>Currency on the charter ledger is <strong>Crypto</strong> (quantum-era settlement). Amounts display with <strong>⍼</strong> before the figure (e.g. ⍼150).</p>
<p>Close this manual with <kbd>Esc</kbd>, <strong>✕</strong>, or the dimmed backdrop.</p>
`,
  },
  {
    id: "path",
    title: "The charter route",
    html: `
<p>Traffic follows one fixed circuit (one direction):</p>
<ol>
  <li><strong>Earth</strong> → Venus → Mercury</li>
  <li><strong>Mars system</strong> — Elon → Mars → Phobos → Deimos</li>
  <li><strong>Asteroid belt</strong> — blank transit lanes (Gravity Duel country)</li>
  <li><strong>Jupiter</strong> — Holst Space Station + Io, Europa, Ganymede, Callisto + blanks</li>
  <li><strong>Saturn</strong> — Daktulios + Titan, Enceladus, Iapetus, Mimas, Rhea, Dione, Tethys + blanks</li>
  <li>Homeward → <strong>Earth</strong></li>
</ol>
<p>Completing this full loop is <strong>one board rotation</strong> (neglect / feral clocks use it). Blank lanes cost <em>no leave fuel</em> but are not free of conflict if another ship is already there.</p>
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
<p><strong>Charter alerts</strong> (timed popups): after <strong>5 rounds</strong> since the last alert (or start), <strong>50%</strong> chance once per round; each miss, chance moves halfway toward 100% (50% → 75% → 87.5% …) until it fires; then wait 5 rounds again.</p>
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
<p>Earth landing grants <strong>⍼400</strong> and circuit resupply; use break to land short of a full roll when you need home.</p>
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
<p><strong>Methane (CH₄)</strong> — stable tanks (no leaks). Claim + fuel depot on <strong>Titan</strong> or <strong>Enceladus</strong> can fire a one-time <strong>resource strike</strong> (½ starting cash) with headlines like “You've struck liquid methane!”</p>
<p><strong>Hydrogen (H₂)</strong> — cheaper leave burns, but <strong>landing</strong> can cause a <strong>LEAK</strong>: <strong>half your fuel</strong> and <strong>lose next turn</strong> to repair. Ice strikes on <strong>Enceladus, Mars, Europa, Ganymede</strong> (claim + depot) — e.g. “You've struck pure ice!”</p>
<p>Strike pop-ups are sudden and terse on purpose — good fortune in a hard charter.</p>
`,
  },
  {
    id: "duel",
    title: "Gravity Duel",
    html: `
<p>On blank/transit spaces with another ship: secret Low/High, then 2d6. Stances reveal after both roll.</p>
<p>Loser skips a turn; winner gets one rent waiver on the loser’s claims. Tie: both stay; next arrival faces last roller.</p>
`,
  },
  {
    id: "feral",
    title: "Parking & feral claims",
    html: `
<p><strong>Live rule:</strong> claims go feral from <strong>parking</strong> (no-move seat turns), not from an “owner neglect” circuit timer.</p>
<p>If your rocket <strong>does not move</strong> on a seat turn — camp, full break, failed leave, or duel skip — that is a <strong>park</strong>. Parks are <strong>cumulative</strong> for the whole charter (moving later does <em>not</em> clear the count).</p>
<ul>
  <li>Parks <strong>1–4</strong> — no feral check yet.</li>
  <li>Park <strong>5</strong> — <strong>each</strong> of your claims rolls: <strong>50%</strong> chance to go <strong>feral</strong>.</li>
  <li>Each park after that <strong>doubles</strong> the chance (100% from park <strong>6</strong> onward).</li>
</ul>
<p><strong>Feral outcome:</strong> claim returns to the bank (unowned). Any fuel depot on it is <strong>destroyed</strong>. Other pilots may buy it again.</p>
<p>Moving on a turn avoids adding a park <em>that turn</em>. Park count never resets. Check your park count on the turn panel.</p>
<h4>What “owner neglect” is not</h4>
<p>Older design notes described a per-pilot <strong>neglect clock</strong> (ticks on board circuits / camping while others loop), <strong>care stamps</strong> on purchase/visit/depot, an overdue window (~10 ticks), and feral rolls on the owner’s movement dice (50%, or 15% with full system monopoly).</p>
<p>That model is <strong>not</strong> what sends claims feral in this build. The engine may still keep a neglect clock for logs/legacy, but <strong>feral risk is parking-only</strong>. Visiting your claim or placing a depot is still good play for rent and network — it is not a “reset the feral timer” button under parking rules.</p>
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
