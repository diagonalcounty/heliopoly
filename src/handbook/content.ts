/** Player-facing Helios Ops Manual. Matches running build — not the long design spec. */

export interface HandbookTopic {
  id: string;
  title: string;
  /** Safe HTML (static content only). */
  html: string;
}

export const HANDBOOK_TOPICS: HandbookTopic[] = [
  {
    id: "welcome",
    title: "Welcome, Captain",
    html: `
<p><strong>Heliopoly</strong> — <em>Free Enterprise In Space</em>.</p>
<p>This is the <strong>Helios Ops Manual</strong> (Flight Handbook) for build <strong>v0.0.4</strong>.</p>
<p>When you roll, your ship <strong>hops along the path</strong> — one pause per space — so you can follow the move.</p>
<p>Close anytime with <kbd>Esc</kbd>, <strong>✕</strong>, or the dimmed area outside this panel.</p>
<ul>
  <li>Start a game from the right-hand panel.</li>
  <li>Choose your <strong>propellant</strong> (CH₄ or H₂) before launch.</li>
  <li>Seat 1 can be human; other seats are AI — or full self-play.</li>
</ul>
<p>Currency uses the charter ledger mark <strong>⍼</strong> before amounts (example: ⍼150).</p>
`,
  },
  {
    id: "how-to-win",
    title: "How to win",
    html: `
<p><strong>Last pilot flying wins</strong> if others bankrupt or strand.</p>
<p>At the <strong>round limit</strong> (default 40), highest net worth among survivors wins:</p>
<ul>
  <li>Cash (ledger <strong>⍼</strong>)</li>
  <li>+ claim prices you own</li>
  <li>+ ⍼500 per fuel station (placed or in hand)</li>
</ul>
`,
  },
  {
    id: "your-turn",
    title: "Your turn",
    html: `
<ol>
  <li><strong>Refuel</strong> (optional) if this body allows it.</li>
  <li><strong>Roll</strong> 2d6 and move that many steps.</li>
  <li>After landing: <strong>Buy</strong> claim, <strong>Place station</strong>, then <strong>End turn</strong>.</li>
</ol>
<p><strong>Landing is free.</strong> Leaving a gravity well is what costs fuel — check the leave-burn preview on your turn panel.</p>
`,
  },
  {
    id: "leave-burn",
    title: "Leave burns & gravity",
    html: `
<p>You may always <strong>land</strong> (insertion free). You may not always <strong>leave</strong>.</p>
<p>Leave cost ≈ <code>ceil(roll × gravity × propellant)</code>:</p>
<ul>
  <li><strong>g0</strong> — transit / dock / beacon: free leave</li>
  <li><strong>g1</strong> — low well (×0.75)</li>
  <li><strong>g2</strong> — typical moon / Mercury / Mars (×1.0)</li>
  <li><strong>g3</strong> — Earth / Venus (×1.4)</li>
  <li><strong>g4</strong> — reserved for extreme wells (×1.85)</li>
</ul>
<p>If you cannot pay the leave burn, you <strong>stay put</strong> (and may pay rent again).</p>
`,
  },
  {
    id: "propellant",
    title: "Propellant (CH₄ / H₂)",
    html: `
<p>At game start each pilot commits to a stack:</p>
<ul>
  <li><strong>Methane (CH₄)</strong> — baseline leave cost (×1.0). Very low glitch risk.</li>
  <li><strong>Hydrogen (H₂)</strong> — efficient exits (×0.85) but <strong>boil-off risk</strong> when leaving a well (extra fuel loss event).</li>
</ul>
<p>Nuclear, sails, etc. are future options — not in this build.</p>
`,
  },
  {
    id: "movement",
    title: "Movement & the board",
    html: `
<p>Directed flight path (not free placement). Dark nodes are pass-through gravity, not rest stops (brief flash during animation).</p>
<p><strong>Animation:</strong> a roll of 3 stops the ship on each of the next three resting spaces in order.</p>
<p>Simplified charter map for now: Earth → Mercury → Venus → Charter Beacon I → Mars → dock → Jupiter moons → Beacon II → home → Earth.</p>
<p>Gas giants are not landable surfaces in design intent; this build uses moons + beacons in the jovian loop.</p>
`,
  },
  {
    id: "fuel",
    title: "Fuel tank",
    html: `
<p>Tank <strong>0–25</strong>, start with <strong>20</strong>.</p>
<p>Spend fuel only to <strong>leave</strong> gravity bodies (see Leave burns). Transit legs do not burn.</p>
<p>Stranding: on a planet/moon with almost no fuel and no refuel option, you can be eliminated.</p>
`,
  },
  {
    id: "refuel",
    title: "Where to refuel",
    html: `
<ul>
  <li><strong>Earth</strong> — free top-up.</li>
  <li><strong>Your claim + fuel station</strong> — free.</li>
  <li><strong>Opponent station</strong> — pay them per unit.</li>
  <li><strong>Space Dock</strong> — free if you own it; else bank/owner rate.</li>
  <li><strong>Charter Beacons</strong> — cash bonus, no fuel.</li>
</ul>
`,
  },
  {
    id: "property",
    title: "Claims & stations",
    html: `
<p>Land on unowned planet, moon, or dock → <strong>Buy</strong> (claim) if you can afford it.</p>
<p>Opponent claims charge <strong>rent</strong> (scales with group ownership and stations).</p>
<p>Place up to your hand of <strong>fuel stations</strong> on planets/moons you own.</p>
`,
  },
  {
    id: "currency",
    title: "Currency (⍼)",
    html: `
<p>Amounts display as <strong>⍼N</strong> (angzarr ledger mark before the number).</p>
<p>In fiction this is charter <strong>Crypto</strong> / ledger money — not a real-world wallet.</p>
`,
  },
  {
    id: "legend",
    title: "Board legend",
    html: `
<ul>
  <li>Cyan — planet · Purple — moon · Gold — Charter Beacon · Green dock · Earth green</li>
  <li>Dark small — pass-through gravity</li>
  <li>Owner color ring · white square = fuel station · triangle = ship</li>
</ul>
`,
  },
  {
    id: "not-in-build",
    title: "Not in this build yet",
    html: `
<ul>
  <li>Claim discovery 12→48</li>
  <li>Solar weather / flare deck</li>
  <li>Projects (comms, telescope)</li>
  <li>Resource hauling logistics</li>
  <li>Full modern map rewrite</li>
</ul>
<p>Those are on the Heliopoly roadmap; this manual only covers buttons you can press today.</p>
`,
  },
];

export function getTopic(id: string): HandbookTopic | undefined {
  return HANDBOOK_TOPICS.find((t) => t.id === id);
}

export const DEFAULT_TOPIC_ID = "welcome";
