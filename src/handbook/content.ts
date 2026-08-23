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
 * Placement:
 * - **Lore** — the ledger, the Mainline, the stations (not button-by-button rules)
 * - **Gameplay** — how to play, win, economy, combat, UI symbols
 * Voice: #112 / #114 — smart 10–12 year old, pre-1997 game-manual shape.
 */

const LORE_TOPICS: HandbookTopic[] = [
  {
    id: "welcome",
    title: "Read this first",
    html: `
<p><strong>Heliopoly</strong> — <em>Orbital Economics</em> (1.1.0).</p>
<p>You fly a rocket. You buy claims. You try not to go broke.</p>
<p>Every buy, every rent, every duel is written to the <strong>ledger</strong>. The ledger is the official book of the Mainline. It is a contract book. It is also a history book.</p>
<p>When you are the last rocket flying, the ledger writes your name as one of the <strong>greatest of all kind</strong>.</p>
<p>There is no timer. Last rocket flying wins.</p>
<p>Source: <a href="https://github.com/diagonalcounty/heliopoly" target="_blank" rel="noopener">github.com/diagonalcounty/heliopoly</a>.</p>
<p>Close this manual with <kbd>Esc</kbd>, <strong>✕</strong>, or the dim backdrop.</p>
`,
  },
  {
    id: "ledger",
    title: "The ledger & Angzarr (⍼)",
    html: `
<p>On old Earth, people kept public <strong>ledgers</strong> — books of who paid whom. <strong>Ethereum</strong> was one of those books. It stored transactions.</p>
<p>Then quantum computers learned to break those books.</p>
<p>Money on the Mainline is <strong>Angzarr</strong>. You see it as <strong>⍼</strong> in front of the number (like ⍼150). Angzarr is <em>post-quantum</em> crypto: new math those machines cannot crack. It still keeps a <strong>ledger</strong>.</p>
<p>The book itself is the <strong>AIL</strong> — Automated Interplanetary Asset Ledger. The AIL writes down two kinds of truth:</p>
<ol>
  <li><strong>Contracts</strong> — who owns which world, who is owed rent, who paid for fuel.</li>
  <li><strong>History</strong> — every expedition, every crash, every name that lasted.</li>
</ol>
<p>Nothing on the board counts until the ledger says so. If the ledger drops your deed, the claim goes back to the bank.</p>
<p>Start cash is not a glitch. It is your first line in the book — a funded launch.</p>
`,
  },
  {
    id: "path",
    title: "The Mainline",
    html: `
<p>Rockets fly one path. That path is the <strong>Mainline</strong>. You do not pick a shortcut.</p>
<p>The circuit:</p>
<ol>
  <li><strong>Earth</strong> → Venus → Mercury</li>
  <li><strong>Mars system</strong> — Elon → Mars → Phobos → Deimos</li>
  <li><strong>Asteroid belt</strong> — blank transit lanes (Gravity Duel country)</li>
  <li><strong>Jupiter</strong> — Holst Space Station + Io, Europa, Ganymede, Callisto + blanks</li>
  <li><strong>Saturn</strong> — Daktulios + Titan, Enceladus, Iapetus, Mimas, Rhea, Dione, Tethys + blanks</li>
  <li>Homeward → <strong>Earth</strong></li>
</ol>
<p>One full loop home is a <strong>rotation</strong>.</p>
<p>Blank lanes cost no leave fuel. They are not safe. Another rocket already there means a <strong>Gravity Duel</strong>.</p>
`,
  },
  {
    id: "stations-lore",
    title: "Hub stations",
    html: `
<p><strong>Elon</strong>, <strong>Holst</strong>, and <strong>Daktulios</strong> are stations, not worlds. They sit off the heavy wells. Ice and ore go through them. Own the hubs and you own the tollbooths.</p>
<p>Stations can move. That is why a rogue Tesla never hits them. A fuel pod on a moon cannot move.</p>
<ul>
  <li><strong>Elon (Mars)</strong> — named for the era that crashed per-kilogram launch cost and made commercial solar access imaginable.</li>
  <li><strong>Holst (Jupiter)</strong> — after Gustav Holst; <em>The Planets</em> gave Jupiter a cultural boom long before a station hung in its sky.</li>
  <li><strong>Daktulios (Saturn)</strong> — from the Greek for “ring”: the ring-station transit hub anchored in Saturn’s system.</li>
</ul>
<p>Own <strong>2</strong> hubs → hub rent <strong>×2</strong>. Own all <strong>3</strong> → hub rent <strong>×4</strong>. That stacks with a system monopoly.</p>
`,
  },
];

const GAMEPLAY_TOPICS: HandbookTopic[] = [
  {
    id: "how-to-win",
    title: "How to win",
    html: `
<p><strong>Last rocket flying wins.</strong> The others go bankrupt, get stranded, or quit.</p>
<p>The ledger then writes your name into its history as one of the <strong>greatest of all kind</strong>.</p>
<p>There is no round limit. There is no “enough money.” Last one standing is the record.</p>
<p>When a rocket leaves, its deeds go back to the <strong>bank</strong>. Fuel depots on those deeds are gone.</p>
<p>See <strong>Glossary</strong> for <em>turn</em>, <em>round</em>, and <em>rotation</em>. Ledger events use <strong>rounds</strong>. Full list: <strong>Ledger events</strong>.</p>
`,
  },
  {
    id: "glossary",
    title: "Glossary",
    html: `
<p>Words we use the same way every time:</p>
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
    <tr>
      <td><strong>Ledger event</strong></td>
      <td>A timed popup that the ledger writes mid-game. Fires on <em>round</em> boundaries. See <strong>Ledger events</strong>.</td>
      <td>Ledger event card · log lines</td>
    </tr>
    <tr>
      <td><strong>Warp</strong></td>
      <td>Board-wide teleport charge: instead of rolling, click any beacon. No en-route stops, rent, or duels; landing rules still apply at the destination.</td>
      <td>Warp charges · King’s Quest / Strong Bad Email alerts</td>
    </tr>
  </tbody>
</table>
`,
  },
  {
    id: "ledger-alerts",
    title: "Ledger events",
    html: `
<p>The ledger sometimes writes a surprise. These are <strong>ledger events</strong> — popups that break up the grind. They fire on <strong>round</strong> boundaries, not every seat turn. Each type fires <strong>at most once</strong> per expedition.</p>

<h3>Cadence (standard pool)</h3>
<ol>
  <li>Wait <strong>5 rounds</strong> after game start or after the last alert fires.</li>
  <li>Then each round rolls <strong>50%</strong> to fire; each <em>real</em> miss moves the chance halfway toward 100% (50% → 75% → 87.5% …).</li>
  <li>On fire, wait 5 rounds again. Open popups do not burn midpoints without a roll.</li>
</ol>
<p><strong>Who</strong> is not always the whole table. The table below is the live rule. <strong>Easy</strong> game difficulty never lets a − event hit the human seat (Tesla and Karen only land on AI).</p>

<h3>Standard pool</h3>
<table class="glossary">
  <thead><tr><th>Alert</th><th>Tone</th><th>Trigger</th><th>Who</th><th>Effect</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Monolith on Earth’s Moon</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td>One-time <strong>⍼300</strong> on that rocket’s <em>next</em> Earth land or pass.</td>
    </tr>
    <tr>
      <td><strong>Blue and brown M&amp;Ms are back</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td>One <strong>free brake</strong> on that rocket’s next seat turn (unused token expires end of the turn).</td>
    </tr>
    <tr>
      <td><strong>King’s Quest speed-run record</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td><strong>+1 warp charge</strong> (click any beacon instead of rolling). Landing rules still apply where they arrive.</td>
    </tr>
    <tr>
      <td><strong>Strong Bad answers your email</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td>Same warp as King’s Quest (separate card — both can fire in one expedition).</td>
    </tr>
    <tr>
      <td><strong>Arcadia on the Mainline</strong> (Captain Harlock)</td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td><strong>+4 fuel</strong> (capped at tank max).</td>
    </tr>
    <tr>
      <td><strong>Belt ice survey</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td><strong>+1 fuel depot</strong> in hand.</td>
    </tr>
    <tr>
      <td><strong>Quantum ledger dividend</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td><strong>+⍼250</strong> cash now.</td>
    </tr>
    <tr>
      <td><strong>Comet dust trail</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td>Next <strong>leave burn</strong> from a gravity well costs <strong>0 fuel</strong> once.</td>
    </tr>
    <tr>
      <td><strong>Port authority holiday</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td>Next <strong>rent that rocket would pay</strong> is waived once.</td>
    </tr>
    <tr>
      <td><strong>Rogue Tesla Roadster</strong></td>
      <td>−</td>
      <td>Pool, only if a Jupiter or Saturn planetoid is owned (not hubs, not Mars, not inner system). Easy: only AI-owned planetoids count.</td>
      <td>One random matching owner</td>
      <td>That deed is gone, and any fuel depot on it.</td>
    </tr>
    <tr>
      <td><strong>Olbers’ paradox, Netflix optional</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round (chooser)</td>
      <td>Chooser warps to a station hub (Elon · Holst · Daktulios — not Earth) and collects <strong>⍼350</strong>. Human clicks the hub; AI auto-picks.</td>
    </tr>
    <tr>
      <td><strong>Karen in the comments</strong></td>
      <td>−</td>
      <td>Pool from <strong>round 30</strong>. Easy: only if an AI is still flying.</td>
      <td>One random active rocket (Easy: AI only)</td>
      <td>That rocket <strong>loses one full seat turn</strong>.</td>
    </tr>
    <tr>
      <td><strong>Invalid claim on the ledger</strong></td>
      <td>+ / −</td>
      <td>Pool, only if an opponent still holds a deed</td>
      <td>One random rocket this round (chooser). Victim is the previous owner. Easy: cannot steal from the human.</td>
      <td>Chooser takes one opponent claim. Planet/moon: free fuel depot. Hubs: deed only — no depot (hubs cannot host pods).</td>
    </tr>
    <tr>
      <td><strong>Hot microphone</strong></td>
      <td>−</td>
      <td>Pool. Easy: only if an AI is still flying.</td>
      <td>One rocket (Easy: AI only)</td>
      <td>Sings a Disney song into a live mic. Pay <strong>50</strong> and <strong>miss the next seat turn</strong>.</td>
    </tr>
    <tr>
      <td><strong>The Tuesday boy paradox</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td>They prove it is <strong>13/27</strong>. Park count −1 (feral is one park further away).</td>
    </tr>
    <tr>
      <td><strong>Error 47: not an object</strong></td>
      <td>−</td>
      <td>Pool. Easy: only if an AI is still flying.</td>
      <td>One rocket (Easy: AI only)</td>
      <td>The terminal dumps <strong>2 fuel</strong>.</td>
    </tr>
  </tbody>
</table>

<h3>Rare (outside the normal pool)</h3>
<table class="glossary">
  <thead><tr><th>Alert</th><th>Tone</th><th>Trigger</th><th>Who</th><th>Effect</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Kostka</strong></td>
      <td>+</td>
      <td>Own clock. After <strong>5 Earth transits</strong> this charter (any rocket, land or pass), the <strong>next Earth landing</strong> rolls <strong>30%</strong>. Each later Earth landing +<strong>10%</strong> (30 → 40 → 50 …). Not in the round pool. Fires at most once.</td>
      <td>The rocket that just landed on Earth</td>
      <td>They adopt a dog named Kostka. <strong>+200</strong>.</td>
    </tr>
    <tr>
      <td><strong>You vibe-coded the rules</strong></td>
      <td>+ / −</td>
      <td>First time the expedition reaches <strong>round 60</strong>, one <strong>50%</strong> roll (hit or miss — never retries). Not in the standard pool.</td>
      <td>Living human, else the lead AI (chooser). Victim is an AI rival.</td>
      <td>Chooser <strong>kicks one AI rocket</strong> off the ledger. Human: click that rocket in standings.</td>
    </tr>
  </tbody>
</table>

<h3>Picks &amp; UI</h3>
<ul>
  <li>When an alert needs a choice (Olbers, blockchain, vibe-kick), a hint appears under standings. Normal Roll / Move buttons stay locked until you finish the pick.</li>
  <li><strong>Warp charges</strong> (King’s Quest or Strong Bad) stack; each charge is one teleport. Telemetry shows remaining warps when you have them.</li>
  <li>Resource strikes (gusher), H₂ leaks, and Gravity Duel are <em>not</em> ledger events — different systems.</li>
</ul>
`,
  },
  {
    id: "turn-flow",
    title: "Roll, break, move & sell",
    html: `
<ol>
  <li><strong>Roll</strong> — 2d6 is your <em>maximum</em> travel (no move yet).</li>
  <li><strong>Break</strong> — optional: shave spaces (−1 space = 0.5 fuel, −2 = 1 fuel, …). Stepper still works as fallback.</li>
  <li><strong>Path preview</strong> — after you roll, a <em>thin line in your rocket color</em> shows full range. <strong>Click or tap a stop</strong> on that line to land there (sets break + moves). Hover a <em>path segment</em> for break fuel cost — planetoid hover inspect is separate.</li>
  <li><strong>Move</strong> — travel (dice − break). Button switches from Roll → Move (or path click lands immediately).</li>
  <li>After landing: <strong>Buy</strong> / <strong>Sell claim</strong> (½ price, depot scrapped) / Depot / End turn.</li>
</ol>
  <p><strong>Remote sell:</strong> you do not have to be on the claim. Click a rocket on <strong>On the ledger</strong> (any of that seat’s text) to open its dossier. On <em>your</em> turn you can <strong>sell</strong> any of your claims or <strong>auction</strong> it to the table at a reserve of your choosing. Each claim may be auctioned <strong>once per turn</strong>; you may list different claims in the same turn. If nobody meets your reserve, the auction is withdrawn — you may then sell that claim or keep it, but you cannot list it again this turn.</p>
<p><strong>Buy window:</strong> you may claim an <em>unowned</em> deed underfoot when you land <em>or</em> later while you are still on it (before you leave) — e.g. after rent income on a following turn makes the price affordable.</p>
<p>Landing is free. Leaving a gravity well costs fuel. Failed leave on an enemy claim charges rent again.</p>
<p><strong>Earth pay</strong> is written to the ledger: <strong>⍼400</strong> when you <em>land</em> on Earth, <strong>⍼200</strong> when you <em>pass</em> Earth on a multi-space move (intermediate stop). Each completed board <strong>rotation</strong> adds <strong>⍼10</strong> to both amounts thereafter. Completing rotation <strong>10, 20, 30…</strong> also pays a one-time <strong>⍼1000</strong> decade bonus. Full circuit still resupplies fuel depots (+3 in hand).</p>
<p><strong>Warp</strong> (from <strong>Ledger events</strong> — King’s Quest or Strong Bad Email): when you have a warp charge, <strong>click any board node</strong> instead of rolling. You teleport. No stops on the way. Landing rules still apply where you arrive.</p>
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
  <div class="legend-item"><img src="/handbook/legend-ship.svg" alt="" width="48" height="48"/><div><strong>Rocket</strong><br/>Your ship (gold outline while hopping)</div></div>
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
    id: "claims-ledger",
    title: "Dossier, ROI & selling",
    html: `
<p>Click a rocket on <strong>On the ledger</strong> — name, cash, fuel, claims, anywhere on that seat’s row — to open its <strong>dossier</strong>. You get cash, fuel, claims grouped by system, current rent, and how much each claim has earned this owner (rent + fuel strikes vs cash you put in).</p>
<p>Rival dossiers are public. The board already shows who owns what; the dossier is the books.</p>
<p>When the ledger closes, the winning story names up to three held claims by <strong>mark + income</strong> (bank half plus rent and strikes this owner). Sold or lost books drop off. Gifts and steals still count — they have a mark even with no cash in.</p>
<h3>Sell</h3>
<p>Sell for <strong>half the deed price</strong>. The claim goes unowned. Any <strong>depot is scrapped</strong>. Use this when you would rather the body sit empty than go to a rival.</p>
<h3>Auction</h3>
<p>Put a claim up to the table and <strong>set your own reserve</strong>. Three prices matter:</p>
<ul>
  <li><strong>Deed price (MSRP)</strong> — the board list price of the claim.</li>
  <li><strong>Mark</strong> — half the deed. What the bank pays on a dump; the guaranteed floor.</li>
  <li><strong>Reserve</strong> — your ask. Defaults to the mark; raise it up to the deed price when the table is flush (hub, monopoly piece, a depot that survives auction). The bank still pays only the mark if you later dump.</li>
</ul>
<p>Highest bid at or above your reserve wins. Ties go to the next seat after the seller.</p>
<ul>
  <li>You get the cash.</li>
  <li>The buyer takes the claim. A <strong>depot stays</strong> with it.</li>
  <li>You keep <strong>docking rights</strong>: the next time you <em>land</em> on that body, rent is free (failed leave still charges).</li>
</ul>
<p>If nobody meets the reserve, the auction is <strong>withdrawn</strong> — the claim stays yours, and you may still dump it for the mark. Dumping is a separate choice.</p>
<p>Each claim may be auctioned <strong>once per turn</strong>; other claims can still list. After a withdrawn auction you may sell that claim or keep it. Sales are only before you roll or after you have landed (not while a path is in the air).</p>
`,
  },
  {
    id: "depots",
    title: "Fuel depots",
    html: `
<p>You start with <strong>3 fuel depots</strong> in hand. Place them on <strong>planets or moons you own</strong> (planetoids only — <strong>not</strong> hub space stations like Holst / Elon / Daktulios).</p>
<p>Depots boost rent and enable free refuel on that body (for you).</p>
<p><strong>Cash cost (per circuit):</strong> your <strong>first</strong> depot after game start or after finishing a board rotation is <strong>free</strong>. Each additional depot that circuit costs <strong>10%</strong> of that body’s purchase price (e.g. a ⍼200 claim → ⍼20 to place the 2nd+ depot). Completing a circuit resets the free first placement.</p>
<p><strong>Earth resupply:</strong> each full board circuit home grants <strong>+3 depots</strong> in hand again. Placed depots stay until feral/elimination.</p>
<p>If a claim goes feral or you are eliminated, depots on those claims are <strong>destroyed</strong>.</p>
`,
  },
  {
    id: "propellant",
    title: "Propellant",
    html: `
<p><strong>Methane (CH₄)</strong> — stable tanks, no leaks: the conservative operator’s choice. Claim + fuel depot on <strong>Titan</strong> or <strong>Enceladus</strong> can fire a one-time <strong>resource strike</strong> (½ starting cash) — e.g. “You've struck liquid methane!”</p>
<p><strong>Hydrogen (H₂)</strong> — cheaper leave burns, higher risk. <strong>Landing</strong> on a real body can rupture tanks: <strong>half your fuel</strong> and <strong>lose next turn</strong> to repair. Balanced by ice-strike potential on <strong>Enceladus, Mars, Europa, Ganymede</strong> (claim + depot).</p>
<p>Strike pop-ups are sudden and short. The ledger records the strike the same as a deed.</p>
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
    id: "ai-difficulty",
    title: "Game difficulty",
    html: `
<p>This is the <strong>table</strong> setting, chosen at <strong>New game</strong> and locked for the expedition. It sets how long the game tends to run, how kind the ledger is, and how hard rivals play.</p>
<table class="glossary">
  <thead>
    <tr>
      <th>Level</th>
      <th>Expedition</th>
      <th>Ledger</th>
      <th>Rivals</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Easy</strong></td>
      <td>Shorter</td>
      <td>− events never hit you (Tesla, Karen, hot mic, Error 47). Rivals cannot steal your deeds.</td>
      <td>Soft. They land where the dice put them.</td>
    </tr>
    <tr>
      <td><strong>Normal</strong></td>
      <td>Standard</td>
      <td>Full pool. Prize cards go to one random rocket each fire.</td>
      <td>Default table.</td>
    </tr>
    <tr>
      <td><strong>Hard</strong></td>
      <td>Longer</td>
      <td>Full pool.</td>
      <td>Sharper — they play for deeds, hubs, and Earth.</td>
    </tr>
    <tr>
      <td><strong>Expert</strong></td>
      <td>Long</td>
      <td>Full pool.</td>
      <td>The table hunts monopolies and Earth landings.</td>
    </tr>
  </tbody>
</table>
<p>Prize cards — King’s Quest, M&amp;Ms, Strong Bad, Belt ice, Tuesday boy, Olbers, steal — go to <strong>one random rocket that round</strong>, not the lead seat. See <strong>Ledger events</strong> for Who / Effect.</p>
<p>The meter on New game is estimated length, not a timer. Header <strong>Speed</strong> is animation only.</p>
`,
  },
  {
    id: "feral",
    title: "Parking & feral claims",
    html: `
<p>Claims go <strong>feral</strong> because the software rots. The pods throw errors. If you sit still, nobody pushes a patch. The <strong>ledger</strong> then drops the deed and marks the hardware junk.</p>
<p>If your rocket <strong>does not move</strong> on a seat turn — camp, full break, failed leave, or duel skip — that is a <strong>park</strong>. Parks add up for the whole expedition. Moving later does <em>not</em> clear the count.</p>
<ul>
  <li>Parks <strong>1–4</strong> — no feral check yet.</li>
  <li>Park <strong>5</strong> — <strong>each</strong> of your claims rolls: <strong>50%</strong> chance to go <strong>feral</strong>.</li>
  <li>Each park after that closes <strong>half the remaining gap</strong> to 100% (75% → 87.5% → 93.75% …). Risk asymptotes toward certainty without a hard 100% cliff on park 6.</li>
</ul>
<p><strong>Feral outcome:</strong> claim returns to the bank (unowned). Any fuel depot on it is <strong>destroyed</strong>. Other pilots may buy it again.</p>
<p>Moving on a turn avoids adding a park <em>that turn</em>. Park count never resets. Check your park count on the turn panel.</p>
`,
  },
  {
    id: "lab",
    title: "The Lab",
    html: `
<p><strong>The Lab</strong> (header button) is a playground on every build, including the live site. Use it to try drills and canned setups without flying a full expedition.</p>
<ul>
  <li>Tap a <strong>category</strong> (Which is larger?, Minigames, End screens, Economy) to expand it; tap again to collapse.</li>
  <li><strong>Which is larger?</strong> — one line per numbering system (Western, Eastern Arabic, Chinese, Korean, Hebrew, binary…). Only shipped packs run; others show <em>Soon</em>. Closing a drill returns you to the Lab. Your expedition is untouched.</li>
  <li><strong>Minigames</strong> — e.g. a single <strong>Gravity Duel</strong> practice setup.</li>
  <li><strong>End screens / economy</strong> — canned board states for UI and balance checks.</li>
</ul>
<p>Game scenarios that replace the board (duel, end screens, economy) swap out the current expedition. Pure drills (Which is larger?) do not.</p>
<p>We keep Lab visible on <strong>heliopoly.live</strong> on purpose — it is part of the product, not a dev-only cheat panel.</p>
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
