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
<p><strong>Heliopoly</strong> — <em>Orbital Economics</em> (rockets and buying worlds in space) (1.5.0).</p>
<p>You fly a rocket. You buy claims (you own a world). You try not to go broke.</p>
<p>Every buy, every rent, and every duel (a lane fight) is written in the <strong>ledger</strong> (the book that records it). The ledger is the official book of the Mainline (the path the rockets fly). It is a contract book (the deals) and a history book (what happened).</p>
<p>When you are the last rocket still flying, the ledger (the book) writes your name as one of the greatest.</p>
<p>There is no timer. Last rocket flying wins.</p>
<p>Close this with the Esc key, the <strong>✕</strong>, or a tap on the dark space around it.</p>
`,
  },
  {
    id: "ledger",
    title: "The ledger & Angzarr (⍼)",
    html: `
<p>Money on the Mainline (the path the rockets fly) is <strong>Angzarr</strong>. You see it as <strong>⍼</strong> in front of the number (like ⍼150). Angzarr is the money. The ledger (the book) still records every pay and own.</p>
<p>The book itself is the <strong>AIL</strong> — Automated Interplanetary Asset Ledger (the space book of who owns what). The AIL writes down two kinds of truth:</p>
<ol>
  <li><strong>Contracts (deals)</strong> — who owns which world, who is owed rent, who paid for fuel.</li>
  <li><strong>History</strong> — every expedition (long trip), every crash, every name that lasted.</li>
</ol>
<p>Nothing on the board counts until the ledger (the book) says so. If the ledger drops your deed (your proof you own it), the claim (the world you own) goes back to the bank.</p>
<p>Start cash is not a mistake. It is your first line in the book — money for your first launch.</p>
`,
  },
  {
    id: "path",
    title: "The Mainline",
    html: `
<p>Rockets fly one path, the <strong>Mainline</strong> (the only path). You do not pick a shortcut.</p>
<p>The circuit (the whole loop):</p>
<ol>
  <li><strong>Earth</strong> → Venus → Mercury</li>
  <li><strong>Mars system</strong> — Elon → Mars → Phobos → Deimos</li>
  <li><strong>Asteroid belt</strong> — blank lanes (empty stops, no world to buy), where a Gravity Duel (a lane fight) can happen.</li>
  <li><strong>Jupiter</strong> — Holst Space Station + Io, Europa, Ganymede, Callisto + blank lanes (empty stops)</li>
  <li><strong>Saturn</strong> — Daktulios + Titan, Enceladus, Iapetus, Mimas, Rhea, Dione, Tethys + blank lanes (empty stops)</li>
  <li>Homeward → <strong>Earth</strong></li>
</ol>
<p>One full loop back to Earth is a <strong>rotation</strong> (one time around).</p>
<p>Blank lanes (empty stops, no world to buy) cost no fuel to leave. They are not safe. Another rocket already there means a Gravity Duel (a lane fight).</p>
`,
  },
  {
    id: "stations-lore",
    title: "Hub stations",
    html: `
<p><strong>Elon</strong>, <strong>Holst</strong>, and <strong>Daktulios</strong> are stations, not worlds. They sit off the heavy wells (away from each planet's strong pull). Ice and ore (rock from mines) go through them. Own the hubs (these stations) and you own the tollbooths (you get paid when others pass).</p>
<p>Stations can move. That is why a rogue Tesla (it flies wild) never hits them. A fuel pod (a fuel tank) on a moon cannot move.</p>
<ul>
  <li><strong>Elon (Mars)</strong> — named for the time that made each bit of a launch much cheaper, so sun power for sale seemed possible.</li>
  <li><strong>Holst (Jupiter)</strong> — named for Gustav Holst. His music, <em>The Planets</em>, made people care about Jupiter long before a station hung in its sky.</li>
  <li><strong>Daktulios (Saturn)</strong> — from the Greek for "ring": the ring station, a hub (things pass through it) set in Saturn's group.</li>
</ul>
<p>Own <strong>2</strong> hubs (these stations) and hub rent (what others pay you) is <strong>×2</strong>. Own all <strong>3</strong> and hub rent is <strong>×4</strong>. That adds on to a system monopoly (you own every world in that planet's group).</p>
`,
  },
];

const GAMEPLAY_TOPICS: HandbookTopic[] = [
  {
    id: "how-to-win",
    title: "How to win",
    html: `
<p><strong>Last rocket flying wins.</strong> The others go bankrupt (run out of money), get stranded (stuck with no way to fly), or quit.</p>
<p>The ledger (the book) then writes your name into its history as one of the greatest.</p>
<p>There is no round limit (the game does not stop on a count). No amount of money wins. The last rocket still flying is what counts.</p>
<p>When a rocket leaves, its deeds (proof it owned those worlds) go back to the <strong>bank</strong>. Fuel depots (fuel stops it built) on those deeds are gone.</p>
<p>See <strong>Glossary</strong> (the word list) for turn, round, and rotation. The ledger (the book) counts in rounds. Full list: <strong>Ledger events</strong>.</p>
`,
  },
  {
    id: "glossary",
    title: "Glossary",
    html: `
<p>Words the game uses the same way every time:</p>
<table class="glossary">
  <thead><tr><th>Term</th><th>Meaning</th><th>Where you see it</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Turn</strong></td>
      <td>Your rocket's chance to act, from when it is your go until you end the turn. You roll and move, skip, or park (stay put). A skip still counts as a turn on the seat clock (the count for that rocket).</td>
      <td>Turn N in the log (the written record).</td>
    </tr>
    <tr>
      <td><strong>Round</strong></td>
      <td>Every rocket has had one turn, including skips and parks (staying put). One full pass through the order.</td>
      <td>Round N in the log.</td>
    </tr>
    <tr>
      <td><strong>Rotation</strong></td>
      <td>One rocket leaves Earth and comes all the way back. One full loop of the Mainline (the only path), for that rocket only.</td>
      <td>In the log when that loop is done.</td>
    </tr>
    <tr>
      <td><strong>Park</strong></td>
      <td>A turn where that rocket stays put: a camp (a stay), a full break (a full stop), a failed leave (it could not leave), or a duel skip (no move after a lane fight). Parks add up, and the total raises feral risk (the risk of something going wild).</td>
      <td>The park count on the turn panel.</td>
    </tr>
    <tr>
      <td><strong>Ledger event</strong></td>
      <td>A card the ledger (the book) shows during the game, at the line between rounds (one round ends, the next starts). See <strong>Ledger events</strong>.</td>
      <td>On the ledger event card and in the log.</td>
    </tr>
    <tr>
      <td><strong>Warp</strong></td>
      <td>A warp charge (a saved jump). Instead of rolling, tap any beacon (a marked stop). You do not stop on the way, so no rent (pay to the owner) and no lane fight on the way. The rules for landing still apply where you come down.</td>
      <td>Warp charges, and on the King's Quest and Strong Bad Email cards.</td>
    </tr>
  </tbody>
</table>
`,
  },
  {
    id: "ledger-alerts",
    title: "Ledger events",
    html: `
<p>The ledger (the book) sometimes writes a surprise. These are <strong>ledger events</strong>, cards that break up the ordinary play. They show between rounds (a round is every rocket having one turn), not on every single turn. Each kind happens at most once per expedition (this game).</p>

<h3>Timing (the usual set)</h3>
<ol>
  <li>Wait <strong>5 rounds</strong> (5 times that every rocket has had a turn) after the game starts, or after the last alert (a surprise card) shows.</li>
  <li>Then each new round rolls a <strong>50%</strong> chance to show one. Each real miss (a roll that did not show a card) moves the chance halfway toward certain (50% → 75% → 87.5% …).</li>
  <li>When one shows, wait 5 rounds again. A card that is still open does not move the chance up unless the game actually rolled.</li>
</ol>
<p>A surprise does not always hit everyone. The card list below is the rule that counts. <strong>Insight</strong> (the shortest game) never lets a minus event (a bad card) hit the human seat (you). Tesla and Karen land only on the computer's rockets.</p>

<h3>Standard pool</h3>
<table class="glossary">
  <thead><tr><th>Alert</th><th>Tone</th><th>Trigger</th><th>Who</th><th>Effect</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Monolith on Earth’s Moon</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td>Once, that rocket gets <strong>⍼300</strong> the next time it lands on Earth or passes Earth.</td>
    </tr>
    <tr>
      <td><strong>Blue and brown M&amp;Ms are back</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td>One <strong>free brake</strong> (a free stop-short) on that rocket’s next turn. If unused, it goes away at the end of that turn.</td>
    </tr>
    <tr>
      <td><strong>King’s Quest speed-run record</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td><strong>+1 warp charge</strong> (a saved jump: tap any beacon instead of rolling). Landing rules still apply where they arrive.</td>
    </tr>
    <tr>
      <td><strong>Strong Bad answers your email</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td>Same warp charge (a saved jump) as King’s Quest. This is a separate card — both can show in one expedition (this game).</td>
    </tr>
    <tr>
      <td><strong>Arcadia on the Mainline</strong> (Captain Harlock)</td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td><strong>+4 fuel</strong>, but not past a full tank.</td>
    </tr>
    <tr>
      <td><strong>Belt ice survey</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td><strong>+1 fuel depot</strong> (a fuel stop) in hand.</td>
    </tr>
    <tr>
      <td><strong>Quantum ledger dividend</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td><strong>+⍼250</strong> cash (money) now.</td>
    </tr>
    <tr>
      <td><strong>Comet dust trail</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td>Once, the next leave burn (fuel to leave) from a gravity well (a strong pull, like a planet or moon) costs <strong>0 fuel</strong>.</td>
    </tr>
    <tr>
      <td><strong>Port authority holiday</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td>Once, the next rent (pay to the owner) that rocket would pay is skipped.</td>
    </tr>
    <tr>
      <td><strong>Rogue Tesla Roadster</strong></td>
      <td>−</td>
      <td>Pool, only if someone owns a Jupiter or Saturn planetoid (a world there — not hubs, not Mars, not the inner system). Insight (the shortest game): only computer-owned worlds count.</td>
      <td>One random matching owner</td>
      <td>That deed (proof of ownership) is gone, and any fuel depot (fuel stop built there) on it.</td>
    </tr>
    <tr>
      <td><strong>Olbers’ paradox, Netflix optional</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round (chooser)</td>
      <td>The chooser warps (jumps) to a station hub (Elon · Holst · Daktulios — not Earth) and gets <strong>⍼350</strong>. You tap the hub; the computer picks for its rockets.</td>
    </tr>
    <tr>
      <td><strong>Karen in the comments</strong></td>
      <td>−</td>
      <td>Pool from <strong>round 30</strong> on (a round is every rocket having one turn). Insight (the shortest game): only if a computer rocket is still flying.</td>
      <td>One random active rocket (Insight: computer only)</td>
      <td>That rocket loses one full turn.</td>
    </tr>
    <tr>
      <td><strong>Invalid claim on the ledger</strong></td>
      <td>+ / −</td>
      <td>Pool, only if an opponent still holds a deed (proof they own a world)</td>
      <td>One random rocket this round (the chooser). The victim is the previous owner. Insight (the shortest game): cannot take from you.</td>
      <td>The chooser takes one opponent claim (a world they own). Planet or moon: free fuel depot (a fuel stop). Hubs: deed only — no depot (hubs cannot hold fuel pods).</td>
    </tr>
    <tr>
      <td><strong>Hot microphone</strong></td>
      <td>−</td>
      <td>Pool. Insight: only if an AI is still flying.</td>
      <td>One rocket (Insight: AI only)</td>
      <td>That rocket sings a Disney song into a live mic. Pay <strong>50</strong> and miss the next turn.</td>
    </tr>
    <tr>
      <td><strong>The Tuesday boy paradox</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td>They prove it is <strong>13/27</strong>. Park count −1 (one less stay-put on the count), so feral risk (going wild) is one park further away.</td>
    </tr>
    <tr>
      <td><strong>Error 47: not an object</strong></td>
      <td>−</td>
      <td>Pool. Insight: only if an AI is still flying.</td>
      <td>One rocket (Insight: AI only)</td>
      <td>That rocket loses <strong>2 fuel</strong>.</td>
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
      <td>This card keeps its own count. After <strong>5 Earth transits</strong> (passes by Earth; a landing counts too) in this game, by any rocket, the next Earth landing rolls a <strong>30%</strong> chance. Each later Earth landing adds <strong>10%</strong> (30 → 40 → 50 …). Not in the round pool (the usual set). Happens at most once.</td>
      <td>The rocket that just landed on Earth</td>
      <td>They adopt a dog named Kostka. <strong>+200</strong> (money).</td>
    </tr>
    <tr>
      <td><strong>Adalynn, Ainsley, Avery and Alanna</strong></td>
      <td>+</td>
      <td>Earth landing only, after the same <strong>5 Earth transits</strong> (passes by Earth; a landing counts too). This card has its own roll, not Kostka’s roll and not the round pool (the usual set). The first landing that counts is <strong>30%</strong>, then +<strong>10%</strong> each time the roll misses. Each of these happens once.</td>
      <td>The rocket that just landed on Earth</td>
      <td>Attend Adalynn's graduation. Take Ainsley to get her driver's license. Go to a swim meet for Avery and Alanna. Each pays <strong>+200</strong> (money).</td>
    </tr>
    <tr>
      <td><strong>You vibe-coded the rules</strong></td>
      <td>+ / −</td>
      <td>The first time the expedition (this game) reaches <strong>round 60</strong> (a round is every rocket having one turn), one <strong>50%</strong> roll. Hit or miss — it never tries again. Not in the standard pool (the usual set).</td>
      <td>You, if you are still flying. If not, the lead computer rocket is the chooser. The one who loses is a computer rival.</td>
      <td>The chooser kicks one computer rocket off the ledger (out of the book). You tap that rocket in the standings (who is ahead).</td>
    </tr>
  </tbody>
</table>

<h3>Choices on the screen</h3>
<ul>
  <li>When an alert needs a choice (Olbers, blockchain, or vibe-kick), a hint shows under the standings (who is ahead). Roll and Move stay locked until you finish the choice.</li>
  <li><strong>Warp charges</strong> (a saved jump) from King's Quest or Strong Bad stack (they add up). Each charge is one jump. The readout shows how many jumps you have left, when you have any.</li>
  <li>A resource strike (a gusher, a supply burst), a hydrogen leak (H₂), and a Gravity Duel (a lane fight) are not ledger events (not these book surprises). They come from other parts of the game.</li>
</ul>
`,
  },
  {
    id: "turn-flow",
    title: "Roll, break, move & sell",
    html: `
<ol>
  <li><strong>Roll</strong> — two dice (2d6) set how far you can go. You have not moved yet.</li>
  <li><strong>Stop short</strong> — optional: cut spaces (−1 space costs 0.5 fuel, −2 costs 1 fuel, and so on). The + and − next to Stop short still work if you need them.</li>
  <li><strong>Path preview</strong> — after you roll, a thin line in your rocket color shows how far you can go. Tap a stop on that line to land there (that sets Stop short and moves you). Hover a path piece to see the Stop short fuel cost. Hovering a world to inspect it is separate.</li>
  <li><strong>Move</strong> — you travel (dice minus Stop short). The Roll button becomes your move, or a path tap lands you right away.</li>
  <li>After landing: <strong>Buy</strong>, open that world's page (<strong>Books</strong>), <strong>Add fuel stop</strong>, or <strong>End turn</strong>. Selling at half price (any fuel stop on it is scrapped) and auctions live on that world's page — not as one tap from the side panel.</li>
</ol>
<p><strong>Sell from far away:</strong> you do not have to be on the claim (the world you own). Tap a rocket on <strong>On the ledger</strong> (any of that seat's text) to open its page. On your turn you can <strong>Sell</strong> a world you own, or auction it to the table at a reserve (the lowest price you will take) you set. Each claim may be auctioned once per turn; you may list different claims in the same turn. If nobody meets your reserve, the auction is pulled back — you may then sell that claim or keep it, but you cannot list it again this turn.</p>
<p><strong>Buy window:</strong> you may claim an unowned deed (proof you buy that world) underfoot when you land, or later while you are still on it (before you leave) — for example after rent (pay from others) on a later turn makes the price affordable.</p>
<p>Landing is free. Leaving a gravity well (a strong pull, like a planet or moon) costs fuel. A failed leave on an enemy claim charges rent (pay to the owner) again.</p>
<p><strong>Earth pay</strong> is written to the ledger (the book): <strong>⍼400</strong> when you land on Earth, <strong>⍼200</strong> when you pass Earth on a multi-space move (a stop on the way). Each completed rotation (one full loop home) adds <strong>⍼10</strong> to both amounts after that. Completing rotation 10, 20, 30… also pays a one-time <strong>⍼1000</strong> decade bonus (a big bonus each ten loops). A full loop still resupplies fuel depots (+3 fuel stops in hand).</p>
<p><strong>Warp</strong> (from <strong>Ledger events</strong> — King’s Quest or Strong Bad Email): when you have a warp charge (a saved jump), tap any board stop instead of rolling. You jump there. No stops on the way. Landing rules still apply where you arrive.</p>
`,
  },
  {
    id: "legend",
    title: "Board legend",
    html: `
<p>Every picture below is the same paint the board uses, not a second set of pictures. When you buy a world, the picture itself changes.</p>

<h4>Bodies</h4>
<div class="legend-grid">
  <div class="legend-item">
    <div class="legend-icons">
      <canvas data-legend="body" data-node="earth" data-w="48" data-h="48" aria-hidden="true"></canvas>
      <canvas data-legend="body" data-node="mars" data-w="48" data-h="48" aria-hidden="true"></canvas>
      <canvas data-legend="body" data-node="venus" data-w="48" data-h="48" aria-hidden="true"></canvas>
      <canvas data-legend="body" data-node="mercury" data-w="48" data-h="48" aria-hidden="true"></canvas>
    </div>
    <div><strong>Painted planets</strong><br/>Earth, Mars, Venus, Mercury — each has its own ground.</div>
  </div>
  <div class="legend-item">
    <div class="legend-icons">
      <canvas data-legend="body" data-node="io" data-w="48" data-h="48" aria-hidden="true"></canvas>
      <canvas data-legend="body" data-node="titan" data-w="48" data-h="48" aria-hidden="true"></canvas>
      <canvas data-legend="body" data-node="phobos" data-w="48" data-h="48" aria-hidden="true"></canvas>
    </div>
    <div><strong>Moons by group</strong><br/>Orange = Jupiter (Io, Europa, Ganymede, Callisto). Yellow = Saturn (Titan, Enceladus, and the rest). Grey = Mars (Phobos, Deimos).</div>
  </div>
  <div class="legend-item">
    <div class="legend-icons">
      <canvas data-legend="body" data-node="elon" data-w="48" data-h="48" aria-hidden="true"></canvas>
      <canvas data-legend="body" data-node="holst" data-w="48" data-h="48" aria-hidden="true"></canvas>
      <canvas data-legend="body" data-node="daktulios" data-w="48" data-h="48" aria-hidden="true"></canvas>
    </div>
    <div><strong>Ring stations</strong><br/>Elon (Mars, rust), Holst (Jupiter, amber — a warm orange), Daktulios (Saturn, gold). Hubs (stations, not worlds).</div>
  </div>
  <div class="legend-item">
    <div class="legend-icons">
      <canvas data-legend="body" data-node="t_ev" data-w="48" data-h="48" aria-hidden="true"></canvas>
      <canvas data-legend="body" data-node="belt1" data-w="48" data-h="48" aria-hidden="true"></canvas>
    </div>
    <div><strong>Diamond marks</strong><br/>Cool blue = a quiet pass. Red tint = Gravity Duel (a lane fight) country: the belt, or an empty lane.</div>
  </div>
</div>

<h4>Unowned vs claimed</h4>
<p>The world picture stays the same. The frame and the name tell you who holds the deed (proof they own it).</p>
<div class="legend-grid">
  <div class="legend-item">
    <canvas class="legend-scene" data-legend="scene" data-node="mars" data-w="140" data-h="88" aria-hidden="true"></canvas>
    <div><strong>Unowned</strong><br/>Pale name, no halo (no colored glow). Anybody may buy it.</div>
  </div>
  <div class="legend-item">
    <canvas class="legend-scene" data-legend="scene" data-node="mars" data-owner="1" data-w="140" data-h="88" aria-hidden="true"></canvas>
    <div><strong>Your claim</strong> (a world you own).<br/>Halo (a glow) in your rocket color. The label becomes "Mars · Venture".</div>
  </div>
  <div class="legend-item">
    <canvas class="legend-scene" data-legend="scene" data-node="mars" data-owner="1" data-depot="1" data-w="140" data-h="88" aria-hidden="true"></canvas>
    <div><strong>A claim plus a fuel depot</strong> (a fuel stop).<br/>The same tank badge sits on the world. Hubs (stations) cannot hold a fuel pod (a fuel tank).</div>
  </div>
  <div class="legend-item">
    <canvas data-legend="depot" data-w="48" data-h="48" aria-hidden="true"></canvas>
    <div><strong>Fuel depot</strong> (a fuel stop).<br/>A cyan (bright blue-green) tank with a gold band — the same badge the board paints on the world.</div>
  </div>
</div>

<h4>Rockets &amp; rings</h4>
<div class="legend-grid">
  <div class="legend-item">
    <div class="legend-icons">
      <canvas data-legend="rocket" data-w="48" data-h="48" aria-hidden="true"></canvas>
      <canvas data-legend="rocket" data-moving="1" data-w="48" data-h="48" aria-hidden="true"></canvas>
    </div>
    <div><strong>Rocket</strong><br/>Your seat color. White outline when parked (staying put); gold outline while hopping (moving).</div>
  </div>
  <div class="legend-item">
    <canvas data-legend="rings" data-w="48" data-h="48" aria-hidden="true"></canvas>
    <div><strong>Dashed circles</strong><br/>Rings around the Sun, tinted by group. Dim them with the Rings slider.</div>
  </div>
</div>
`,
  },
  {
    id: "monopoly",
    title: "Systems & monopoly",
    html: `
<p>Own every deed (proof you own each one) in a system (a group) and rent (what others pay you) doubles on any landing there.</p>
<ul>
  <li><strong>Mercury / Venus</strong> — each group is that one planet.</li>
  <li><strong>Mars</strong> — Elon (the station) + Mars + Phobos + Deimos</li>
  <li><strong>Jupiter</strong> — Holst (the station) + four moons</li>
  <li><strong>Saturn</strong> — Daktulios (the station) + seven moons</li>
</ul>
<p>The space stations (Elon · Holst Space Station · Daktulios) are also their own set:</p>
<ul>
  <li>Own <strong>2</strong> hubs (stations) and rent (what others pay you) on those hubs is <strong>×2</strong>.</li>
  <li>Own all <strong>3</strong> hubs and rent on those hubs is <strong>×4</strong>.</li>
</ul>
<p>A system monopoly (you own every world in that group) and the station set both count. For example, all of Mars plus all three stations multiplies Elon's rent by both.</p>
<p>Earth is never a deed (it is never for sale).</p>
`,
  },
  {
    id: "claims-ledger",
    title: "Dossier, mark & income",
    html: `
<p>Tap a rocket on <strong>On the ledger</strong> — name, cash, fuel, claims, anywhere on that seat's row — to open its <strong>dossier</strong> (its page of books). Each claim you hold is a thing you own. <strong>Mark</strong> is what the bank pays if you sell it for half (any fuel depot, a fuel stop, is scrapped). <strong>MSRP</strong> (the bank's list price) is what it costs to claim an unowned world, not what your Venus is worth now. <strong>Income</strong> is rent you collected, plus fuel strikes (money tied to fuel), while this rocket held the book. Cash from landing on or passing Earth is backer money, not rent from a world.</p>
<p>Landing on your own claim and tapping <strong>Books</strong> in the pilot column (the side controls) opens the same dossier (page of books) on that world. From far away it is unchanged: the ledger row opens the dossier.</p>
<p>Other rockets' pages are public (anyone can open them). The board already shows who owns what. The dossier (the page) is the books.</p>
<p>When the ledger (the book) closes, the winning card shows a short table of worlds you still hold: Claim · Mark (half-price bank pay) · Income (rent you collected) · Book (mark + income). Sold or lost worlds drop off. Gifts and steals still count — they have a mark even if no cash came in.</p>
<h3>Sell</h3>
<p>Sell a world: sell for half the deed price. The claim goes unowned. Any fuel depot (fuel stop) is scrapped (thrown away). Use this when you would rather the world sit empty than go to a rival.</p>
<h3>Auction</h3>
<p>Put a claim up for the table and set your own reserve (the lowest price you will take). Three prices matter:</p>
<ul>
  <li><strong>Deed price (MSRP, the bank's list price)</strong> — the board's listed price of the claim.</li>
  <li><strong>Mark</strong> — half the deed price. What the bank pays when you Sell a world. It is the lowest you are sure to get.</li>
  <li><strong>Reserve</strong> (the lowest you will take) — your ask. It starts at the mark. Raise it up to the deed price when the table is flush (has money to spend): a hub (a station), a monopoly piece (a world in a full group), or a fuel depot (a fuel stop) that stays through the auction. The bank still pays only the mark if you later sell for half.</li>
</ul>
<p>Clearance (the winning bid) can sit above the mark. Rivals bid from the floor (the lowest bid) and pay extra for a finished set, for hubs (stations), and for a fuel depot (a fuel stop) that stays with the claim. Earth cash is only money you can spend — it does not raise what a world is worth. On Normal and harder, one above the mark is not a sure cheap win.</p>
<p>The highest bid at or above your reserve (the lowest you will take) wins. A tie goes to the next seat after the seller.</p>
<ul>
  <li>You get the cash.</li>
  <li>The buyer takes the claim. A fuel depot (a fuel stop) stays with it.</li>
  <li>You keep docking rights (you may land there). The next time you land on that world, rent is free. A failed leave (you could not leave) still charges rent.</li>
</ul>
<p>If nobody meets the reserve (the lowest you will take), the auction is pulled back. The claim stays yours, and you may still Sell a world for the mark. Selling for half is a separate choice.</p>
<p>Each claim may be auctioned once per turn. Other claims can still be listed. After a pulled-back auction you may sell that claim or keep it. Sales happen only before you roll, or after you have landed — not while a path is in the air (you have not landed yet).</p>
`,
  },
  {
    id: "depots",
    title: "Fuel depots",
    html: `
<p>You start with <strong>3 fuel depots</strong> (fuel stops) in hand. <strong>Add fuel stop</strong> places one on a planet or moon you own. Worlds only — not a hub (a station) like Holst, Elon, or Daktulios.</p>
<p>A fuel stop raises rent (what others pay you) and lets you Refuel there for free. Other rockets do not get that free refuel.</p>
<p><strong>Cost each circuit</strong> (one full loop home): your first fuel stop after the game starts, or after you finish a loop, is free. Each extra fuel stop that loop costs 10% of that world's price (a world that costs 200 costs 20 for the 2nd stop and each one after). Finishing a loop makes the next first placement free again.</p>
<p><strong>Earth resupply:</strong> each full loop home gives you +3 fuel stops in hand again. Stops you already placed stay until the world goes feral (goes wild), or you are out.</p>
<p>If a claim goes feral (the world goes wild) or you are eliminated (you are out), fuel stops on those claims are destroyed.</p>
`,
  },
  {
    id: "propellant",
    title: "Propellant",
    html: `
<p><strong>Methane (CH₄, safer fuel)</strong> — tanks stay stable and do not leak. This is the careful choice. Refuel at the moons Titan and Enceladus. If you own Titan or Enceladus and have a fuel depot (a fuel stop) there, you can get a one-time resource strike (a one-time pay of half the money you started with). The popup says "You've struck liquid methane!"</p>
<p><strong>Hydrogen (H₂, can leak)</strong> — cheaper to take off, and riskier. Landing on a real world (a planet or moon) can burst the tanks: you lose half your fuel and your next turn, to repair. You can also get an ice strike on Enceladus, Mars, Europa, or Ganymede if you own that world and have a fuel stop there. More icy places to refuel.</p>
<p>A strike popup is sudden and short. The ledger (the book) writes the strike down the same way it writes a deed (proof you own a world).</p>
`,
  },
  {
    id: "duel",
    title: "Gravity Duel",
    html: `
<p>On the blank lanes (empty stops) — the diamond marks on the belt and other empty stops — the polite rules from Earth do not apply. When two rockets try to share the same slingshot (the same empty stop), they fight a <strong>Gravity Duel</strong> (a lane fight) for the lane.</p>

<h4>When does a duel start?</h4>
<ul>
  <li>You land on a blank lane (an empty stop), not a planet, moon, or hub (a station).</li>
  <li>Another rocket that is still flying is already there, or the lane remembers a defender from an earlier fight.</li>
  <li>You are the <strong>challenger</strong> (you just arrived). The other pilot is the <strong>defender</strong> (they were already there).</li>
</ul>
<p>No lane fight on planets, moons, hubs (stations), or Earth — only those empty-stop marks.</p>

<h4>How to play (human steps)</h4>
<ol>
  <li>Pick a secret stance (High or Low). The other rocket does the same. Neither of you sees the other's pick yet.</li>
  <li>Tap <strong>Roll dice</strong> when asked. Both sides roll two dice.</li>
  <li>Then the picks and the totals show together. The game picks a winner, or a tie, from the rules below.</li>
  <li>Read the result on the same fight panel. Names and dice stay visible. Then continue.</li>
</ol>

<h4>How the winner is decided</h4>
<p>Both pilots always roll two dice. What counts as better depends on the High and Low pair:</p>
<table class="glossary">
  <thead><tr><th>Your stances</th><th>Who wins</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Both Low</strong></td>
      <td>The lower dice total wins (a gentler burn, a smaller push).</td>
    </tr>
    <tr>
      <td><strong>Both High</strong></td>
      <td>The higher dice total wins (a harder burn, a bigger push).</td>
    </tr>
    <tr>
      <td><strong>One Low and one High</strong></td>
      <td>The total closer to the running mean (the average of every two-dice roll so far this game) wins. If there is no history yet, that average starts at <strong>7</strong>.</td>
    </tr>
  </tbody>
</table>
<p>If the totals match, or both are the same distance from the average, it is a tie. See the stakes (what you win or lose) below.</p>
<p><strong>Tip:</strong> Low is a bet on rolling small. High is a bet on rolling large. One of each turns the fight into who is nearer the average, so a middle roll can beat a very high or very low one.</p>

<h4>Stakes</h4>
<ul>
  <li>The loser misses their next full turn. That skip also counts as a park (a stay-put) for feral risk (the chance of going wild). They move back one stop on the Mainline (the only path), toward the previous beacon (the stop behind them). That new stop can still charge rent, Earth pay, or a leak. It does not start a second lane fight.</li>
  <li>The winner skips rent once against that loser. The next time the winner would pay rent on that pilot's claims, it is free. Then the skip is used up.</li>
  <li><strong>Tie.</strong> You both keep the lane. Nobody misses a turn, nobody moves back, and nobody skips rent. The next rocket to arrive may face the last roller as the defender.</li>
  <li>If the loser is already on Earth, they cannot be shoved further back.</li>
</ul>

<h4>What the panel is showing you</h4>
<p>Your rocket is usually on the right when you are the human player. The rival is on the left. Pick Low or High, then tap <strong>Roll dice</strong>. Computer rockets lock in and roll on their own. The result keeps the names. It does not throw you onto a blank screen with no names.</p>

<p class="handbook-note">A moving, live-action duel is not in the game yet (see <strong>Not yet</strong>). The rules above are the dice fight you play now.</p>
`,
  },
  {
    id: "ai-difficulty",
    title: "Expedition",
    html: `
<p>This is the <strong>expedition</strong> setting, chosen at <strong>New game</strong> and locked at Launch. It sets how involved the table is, how kind the ledger is, and how hard rivals play.</p>
<table class="glossary">
  <thead>
    <tr>
      <th>Expedition</th>
      <th>Session</th>
      <th>Ledger</th>
      <th>Rivals</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Insight</strong></td>
      <td>A look</td>
      <td>− events never hit you (Tesla, Karen, hot mic, Error 47). Rivals cannot steal your deeds.</td>
      <td>Soft. They land where the dice put them.</td>
    </tr>
    <tr>
      <td><strong>2. Curiosity</strong></td>
      <td>Stay and poke (default)</td>
      <td>Full pool. Prize cards go to one random rocket each fire.</td>
      <td>Default table.</td>
    </tr>
    <tr>
      <td><strong>3. Voyager</strong></td>
      <td>The long haul</td>
      <td>Full pool.</td>
      <td>Sharper — they play for deeds, hubs, and Earth.</td>
    </tr>
    <tr>
      <td><strong>4. Opportunity</strong></td>
      <td>The long game</td>
      <td>Full pool.</td>
      <td>The table hunts monopolies and Earth landings.</td>
    </tr>
  </tbody>
</table>
<p>Prize cards — King’s Quest, M&amp;Ms, Strong Bad, Belt ice, Tuesday boy, Olbers, steal — go to <strong>one random rocket that round</strong>, not the lead seat. See <strong>Ledger events</strong> for Who / Effect.</p>
<p>Header <strong>Speed</strong> is animation only. Fun toys live on <strong>Arcade</strong>. The charter is <strong>Journey</strong>. Drills stay in the <strong>Lab</strong>.</p>
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
    title: "Home doors",
    html: `
<p>The first screen is three doors. Arcade is a short play, on the rocket. Journey is the full game, where you fly the ship. Lab is more tools, not another toy.</p>
<ul>
  <li>Arcade shows "On the rocket" and "A short play." The toys are Make a bigger bot, Backup fuel, and Slide puzzle. They leave the big game as you left it. Arcade is the large door and the first tap.</li>
  <li>Journey shows "Fly the ship" and "Full game." Name your rocket and launch. Gravity Duel (a lane fight) can still happen during a flight, on an empty lane.</li>
  <li>Lab shows "Try things" and "More tools." The drills are Which is larger?, Deseret letters (an old alphabet), Urinal-rule Parking (leave a gap), and Gravity Duel practice. More sit behind "Show more tools." The sheet says "This is not another toy."</li>
</ul>
<p>Lab stays locked until you play one Arcade toy. The door says "Play one toy first." The Home button brings the three doors back. It does not end a flight that is already going.</p>
<p>Gravity Duel practice throws the big game away and starts a new one. The other drills do not. The Arcade toys leave the big game as you left it.</p>
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
