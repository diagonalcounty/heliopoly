/** Player-facing Helios Ops Manual. Matches running build. */

export interface HandbookTopic {
  id: string;
  title: string;
  html: string;
}

export const HANDBOOK_TOPICS: HandbookTopic[] = [
  {
    id: "welcome",
    title: "Welcome, Captain",
    html: `
<p><strong>Heliopoly</strong> — <em>Free Enterprise In Space</em> (v0.0.6).</p>
<p>Close with <kbd>Esc</kbd>, <strong>✕</strong>, or the dimmed backdrop.</p>
<p>Currency: <strong>⍼</strong> before amounts (e.g. ⍼150).</p>
`,
  },
  {
    id: "legend",
    title: "Board legend (symbols)",
    html: `
<ul>
  <li><strong>Painted planets</strong> — Earth (oceans/clouds), Mars (red + ice cap), Venus (cream clouds), Mercury (grey craters)</li>
  <li><strong>Orange moons</strong> — Jupiter system (Io, Europa, Ganymede, Callisto)</li>
  <li><strong>Yellow moons</strong> — Saturn system (Titan, Enceladus, …)</li>
  <li><strong>Ring stations</strong> — habitat ring + solar panels (Elon, Holst Space Station, Daktulios) — not plain circles</li>
  <li><strong>Diamond pips</strong> — blank belt/transit (red-tint = combat lanes)</li>
  <li><strong>Colored halo</strong> around a body — your claim (pilot color)</li>
  <li><strong>Blue fuel-tank badge</strong> on a corner of a body — player-built <strong>fuel depot</strong></li>
  <li><strong>Triangle</strong> — ship (gold outline while hopping)</li>
  <li><strong>Dashed circles</strong> — orbital rings from the Sun</li>
</ul>
`,
  },
  {
    id: "path",
    title: "Flight path",
    html: `
<p>Fixed circuit (one direction):</p>
<ol>
  <li><strong>Earth</strong> → Venus → Mercury</li>
  <li><strong>Mars system</strong> — Elon → Mars → Phobos → Deimos</li>
  <li><strong>Asteroid belt</strong> — blank spaces (combat)</li>
  <li><strong>Jupiter</strong> — Holst Space Station + Io, Europa, Ganymede, Callisto + blanks</li>
  <li><strong>Saturn</strong> — Daktulios + Titan, Enceladus, Iapetus, Mimas, Rhea, Dione, Tethys + blanks</li>
  <li>Homeward → <strong>Earth</strong></li>
</ol>
<p>Completing this full loop counts as <strong>one board rotation</strong> (used for feral timers).</p>
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
    id: "feral",
    title: "Feral claims",
    html: `
<p>Each pilot has a <strong>neglect clock</strong> in “rotations” (full loops of the board path).</p>
<ul>
  <li><strong>While you are out flying:</strong> only <em>your</em> completed circuits advance your neglect clock.</li>
  <li><strong>While you sit on Earth:</strong> you do <em>not</em> advance your own clock by camping — instead <strong>each opponent circuit</strong> adds +1 to your neglect clock.</li>
</ul>
<p>If you do not <strong>land on</strong> a claim for <strong>10 neglect rotations</strong> after purchase (or last visit / depot build), it is <strong>overdue</strong>.</p>
<p>When <strong>you</strong> roll movement dice, each overdue claim checks feral:</p>
<ul>
  <li><strong>50%</strong> → feral (unowned; depot destroyed)</li>
  <li><strong>15%</strong> if you hold that system’s full monopoly</li>
</ul>
<p><strong>Resets care:</strong> land on your claim, or place a fuel depot.</p>
`,
  },
  {
    id: "how-to-win",
    title: "How to win",
    html: `
<p><strong>Last pilot flying</strong> if others bankrupt or strand.</p>
<p>At the <strong>round limit</strong>, highest net worth among survivors (cash + deeds + depots).</p>
<p>Eliminated pilots’ deeds return to the <strong>bank</strong> (available again); depots are lost.</p>
`,
  },
  {
    id: "leave-burn",
    title: "Leave burns & rent",
    html: `
<p>Landing is free. Leaving a gravity well costs fuel.</p>
<p>If you cannot leave an <strong>opponent’s</strong> claim, you stay and <strong>pay rent again</strong> (by design).</p>
`,
  },
  {
    id: "propellant",
    title: "Propellant",
    html: `
<p><strong>CH₄</strong> — stable. <strong>H₂</strong> — cheaper leave burns, boil-off risk.</p>
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
    id: "not-in-build",
    title: "Not yet",
    html: `
<ul>
  <li>Purchasable transfer nodes between rings</li>
  <li>Player trading</li>
  <li>Fuel prices by location (Earth cheapest is direction only; full matrix later)</li>
  <li>Realtime Gravity Duel</li>
</ul>
`,
  },
];

export function getTopic(id: string): HandbookTopic | undefined {
  return HANDBOOK_TOPICS.find((t) => t.id === id);
}

export const DEFAULT_TOPIC_ID = "welcome";
