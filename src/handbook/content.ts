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
  <li><strong>Cyan disc</strong> — planet (Mercury, Venus, Mars, Earth)</li>
  <li><strong>Orange disc</strong> — Jupiter system moon</li>
  <li><strong>Yellow disc</strong> — Saturn system moon</li>
  <li><strong>Gold disc</strong> — orbital station deed (Elon, Holst, Daktulios) or beacon-style hub</li>
  <li><strong>Green Earth</strong> — home; not purchasable; cheapest / free refuel</li>
  <li><strong>Dim small disc / ·</strong> — blank transit or belt (Gravity Duel possible)</li>
  <li><strong>Colored ring</strong> around a body — that pilot’s claim (their ship color)</li>
  <li><strong>White square with bar</strong> on a body — <strong>fuel depot</strong> you built (not the big orbital station deed)</li>
  <li><strong>Triangle</strong> — ship (gold outline while hopping)</li>
  <li><strong>Dashed circles</strong> — orbital rings (distance from the Sun)</li>
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
    id: "feral",
    title: "Feral claims",
    html: `
<p>If you do not <strong>land on</strong> a claim for <strong>10 board rotations</strong> after purchase (or last visit / depot build), it is <strong>overdue</strong>.</p>
<p>When <strong>you</strong> roll movement dice, each overdue claim you own rolls a feral check:</p>
<ul>
  <li><strong>50%</strong> chance it goes <strong>feral</strong> (unowned again; depot destroyed)</li>
  <li><strong>15%</strong> if you hold the <strong>full system monopoly</strong> including that claim</li>
</ul>
<p>Checks run on <strong>your movement roll only</strong> (not every pilot’s roll), for <strong>all</strong> of your overdue properties.</p>
<p><strong>Resets the timer:</strong> landing on your claim, or placing a fuel depot.</p>
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
