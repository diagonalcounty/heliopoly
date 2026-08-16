/**
 * Civ-style civilopedia entries for every body on the Mainline.
 * Tone: school-level clarity (Civ I–IV peak), short enough to read mid-game.
 *
 * Each entry includes discovery history and solar insolation data.
 * Keep in sync with board.ts node ids and ephemeris.ts distance table.
 */
import type { HandbookTopic } from "./content";

/** Body classification for the hook line. */
type BodyKind = "planet" | "moon" | "station";

interface BodyDef {
  id: string;
  name: string;
  kind: BodyKind;
  /** System/group label for the footer. */
  system: string;
}

/** Ordered by position on the Mainline (board order). */
const BODIES: BodyDef[] = [
  { id: "earth",     name: "Earth",     kind: "planet",   system: "Terran" },
  { id: "venus",     name: "Venus",     kind: "planet",   system: "Venus" },
  { id: "mercury",   name: "Mercury",   kind: "planet",   system: "Mercury" },
  { id: "elon",      name: "Elon",      kind: "station",  system: "Mars" },
  { id: "mars",      name: "Mars",      kind: "planet",   system: "Mars" },
  { id: "phobos",    name: "Phobos",    kind: "moon",     system: "Mars" },
  { id: "deimos",    name: "Deimos",    kind: "moon",     system: "Mars" },
  { id: "holst",     name: "Holst Space Station", kind: "station", system: "Jupiter" },
  { id: "io",        name: "Io",        kind: "moon",     system: "Jupiter" },
  { id: "europa",    name: "Europa",    kind: "moon",     system: "Jupiter" },
  { id: "ganymede",  name: "Ganymede",  kind: "moon",     system: "Jupiter" },
  { id: "callisto",  name: "Callisto",  kind: "moon",     system: "Jupiter" },
  { id: "daktulios", name: "Daktulios", kind: "station",  system: "Saturn" },
  { id: "titan",     name: "Titan",     kind: "moon",     system: "Saturn" },
  { id: "enceladus", name: "Enceladus", kind: "moon",     system: "Saturn" },
  { id: "iapetus",   name: "Iapetus",   kind: "moon",     system: "Saturn" },
  { id: "mimas",     name: "Mimas",     kind: "moon",     system: "Saturn" },
  { id: "rhea",      name: "Rhea",      kind: "moon",     system: "Saturn" },
  { id: "dione",     name: "Dione",     kind: "moon",     system: "Saturn" },
  { id: "tethys",    name: "Tethys",    kind: "moon",     system: "Saturn" },
];

type SolarStr = string; // display string like "~2 600 W/m²"
type AuStr = string;    // display string like "0.723 AU"

interface BodyData {
  /** Hook — one-liner classification. */
  hook: string;
  /** Discovery year or range. */
  discovered: string;
  /** Discoverer name(s) or "Prehistoric / Ancient". */
  discoverer: string;
  /** Mean distance from the Sun. */
  distanceAu: AuStr;
  /** Solar insolation at this body (W/m²). */
  insolation: SolarStr;
  /** Earth-relative insolation factor. */
  insolationEarth: string;
  /** 1–2 paragraph article body. */
  body: string;
}

const BODY_DATA: Record<string, BodyData> = {
  earth: {
    hook: "Homeworld — third rock from the Sun.",
    discovered: "Always known",
    discoverer: "—",
    distanceAu: "1.000",
    insolation: "~1 361",
    insolationEarth: "1.00×",
    body: `
<p>Earth is the ledger's home dock. No deed changes hands here — the homeworld is the starting gate and the only resupply point for every rocket on the Mainline. Its gravity well (class 3) demands expensive leave burns, but every full circuit home pays ledger cash and fresh depots.</p>
<p>The <strong>solar constant</strong> at Earth's orbit defines the unit: ~1 361 W/m² at 1 AU. All other insolation figures on this page are ratios against this baseline. Earth's atmosphere and magnetic field make it the most habitable body in the system — which is why expeditions start here and never buy the planet.</p>`,
  },
  venus: {
    hook: "Twin of Earth — identical size, lethal atmosphere.",
    discovered: "Prehistoric (ancient observed as Morning/Evening Star)",
    discoverer: "Known to Sumerians ~3000 BCE; first probe: Mariner 2 (1962)",
    distanceAu: "0.723",
    insolation: "~2 605",
    insolationEarth: "1.91×",
    body: `
<p><strong>Venus</strong> is the hottest planet in the system despite being farther from the Sun than Mercury. A runaway greenhouse atmosphere of CO₂ at 92 bar surface pressure cooks the surface to 462 °C. Venus is valuable real estate for <strong>orbital refineries</strong> — close to the Sun, short transit time to Earth, and enough solar flux to power industrial batch processing.</p>
<p><strong>Insolation:</strong> ~2 605 W/m² (1.91× Earth). Solar panels here produce almost twice the power per square meter as Earth orbit, making Venus stations attractive for energy-intensive propellant cracking.</p>`,
  },
  mercury: {
    hook: "Innermost planet — a scorched, airless rock.",
    discovered: "Prehistoric (ancient observed as morning/evening object)",
    discoverer: "Known to Sumerians ~3000 BCE; first probe: Mariner 10 (1974)",
    distanceAu: "0.387",
    insolation: "~9 086",
    insolationEarth: "6.67×",
    body: `
<p><strong>Mercury</strong> orbits the Sun every 88 days at 0.387 AU — the innermost deed on the board. Without atmosphere, its surface swings from −180 °C at night to 430 °C in daytime. The <strong>Caloris Basin</strong>, a 1 550 km impact crater, marks the hottest longitude.</p>
<p><strong>Insolation:</strong> ~9 086 W/m² (6.67× Earth). Any pilot who lands here bathes in nearly seven times Earth's sunlight. The solar flux makes Mercury an ideal location for <strong>power-beaming</strong> and orbital smelters, but the gravity well (class 2) and extreme thermal cycling mean only well-funded operations survive.</p>`,
  },
  elon: {
    hook: "Mars-orbit hub — gateway to the outer system.",
    discovered: "Built 2038–2041 (first commercial orbital habitat at Mars)",
    discoverer: "Multiple private consortiums led by Heliopolis Ventures",
    distanceAu: "1.524",
    insolation: "~586",
    insolationEarth: "0.43×",
    body: `
<p><strong>Elon</strong> is not a natural body but a <strong>station hub</strong> in Mars orbit, named for the era that crashed per-kilogram launch cost and made commercial solar access imaginable. It serves as the first deep-space refueling and trade stop after the inner planets — a refining choke point where ice from Mars's moons is processed into propellant.</p>
<p><strong>Insolation:</strong> ~586 W/m² (0.43× Earth). Solar arrays at Mars orbit capture less than half the light available near Earth. Station operations rely on a mix of local solar and regular fuel-ship deliveries from the inner system.</p>`,
  },
  mars: {
    hook: "The Red Planet — the first major colony frontier.",
    discovered: "Prehistoric (ancient observed as wandering star)",
    discoverer: "Known to Egyptians ~2000 BCE; first probe: Mariner 4 (1965)",
    distanceAu: "1.524",
    insolation: "~586",
    insolationEarth: "0.43×",
    body: `
<p><strong>Mars</strong> is the largest solid body beyond Earth and the centerpiece of the Mars system monopoly (Elon + Mars + Phobos + Deimos). Its thin CO₂ atmosphere (0.6% of Earth's pressure), rusted regolith, and extinct volcano <strong>Olympus Mons</strong> (21.9 km — nearly three Everests) make it the most studied planet after Earth.</p>
<p><strong>Insolation:</strong> ~586 W/m² (0.43× Earth). Mars receives less than half the solar energy of Earth. Combined with its moderate gravity well (class 2), it demands careful leave-burn planning — but its ice and potential hydrogen strikes make it a lucrative deed.</p>`,
  },
  phobos: {
    hook: "Mars's inner moon — a captured asteroid.",
    discovered: "1877",
    discoverer: "Asaph Hall (US Naval Observatory)",
    distanceAu: "1.524",
    insolation: "~586",
    insolationEarth: "0.43×",
    body: `
<p><strong>Phobos</strong> is the larger of Mars's two moons (27 × 22 × 18 km), an irregular lump that orbits just 6 000 km above the Martian surface — the closest moon to its planet in the system. It completes an orbit in 7.7 hours, rising and setting twice per Martian day. Its low gravity (class 1) makes it an easy departure point.</p>
<p><strong>Insolation:</strong> ~586 W/m² (0.43× Earth — same as Mars). Phobos shares Mars's distance from the Sun. Its value to a pilot is low purchase price and minimal leave fuel, not solar harvest.</p>`,
  },
  deimos: {
    hook: "Mars's outer moon — a quieter, more distant rock.",
    discovered: "1877",
    discoverer: "Asaph Hall (US Naval Observatory)",
    distanceAu: "1.524",
    insolation: "~586",
    insolationEarth: "0.43×",
    body: `
<p><strong>Deimos</strong> (15 × 12 × 11 km) orbits Mars at 23 500 km, about four times farther out than Phobos. Both moons were likely <strong>captured D-type asteroids</strong> from the outer belt. Deimos has a smoother surface than Phobos because its more distant orbit collects less impact ejecta from Mars.</p>
<p><strong>Insolation:</strong> ~586 W/m² (0.43× Earth). Like Phobos, its solar flux matches Mars orbit. The twin moons form the cheapest deeds in the Mars system, useful for blocking opponents from monopoly.</p>`,
  },
  holst: {
    hook: "Jupiter-orbit station — the chemical refinery of the system.",
    discovered: "Built 2044–2049 (international consortium)",
    discoverer: "Jupiter Operations Group (ESA, CNSA, Heliopolis)",
    distanceAu: "5.200",
    insolation: "~50",
    insolationEarth: "0.037×",
    body: `
<p><strong>Holst Space Station</strong> hangs in Jupiter orbit, named for Gustav Holst (1874–1934), whose orchestral suite <em>The Planets</em> gave Jupiter a cultural presence long before industry arrived. The station is the outer system's primary <strong>chemical refinery</strong> — ice from Callisto and Ganymede is processed here into hydrogen and oxygen for the long haul to Saturn and back.</p>
<p><strong>Insolation:</strong> ~50 W/m² (0.037× Earth). At 5.2 AU, sunlight is a dim glow. Holst relies on <strong>nuclear reactors</strong> and periodic fuel-ship deliveries rather than solar panels for its industrial power.</p>`,
  },
  io: {
    hook: "The most volcanically active body in the system.",
    discovered: "1610",
    discoverer: "Galileo Galilei",
    distanceAu: "5.200",
    insolation: "~50",
    insolationEarth: "0.037×",
    body: `
<p><strong>Io</strong> is the innermost of Jupiter's four Galilean moons, slightly larger than Earth's Moon. Tidal flexing from Jupiter's immense gravity keeps its interior molten — over <strong>400 active volcanoes</strong> constantly resurface the moon with sulfur and silicate lava. The surface is colored in patchwork yellows, reds, and greens from allotropes of sulfur.</p>
<p><strong>Insolation:</strong> ~50 W/m² (0.037× Earth). The same dim light as all Jupiter bodies. But Io's volcanic heat makes it geologically rich — <strong>hydrogen strikes</strong> are possible here.</p>`,
  },
  europa: {
    hook: "Ice moon with a subsurface ocean — the best hope for life.",
    discovered: "1610",
    discoverer: "Galileo Galilei",
    distanceAu: "5.200",
    insolation: "~50",
    insolationEarth: "0.037×",
    body: `
<p><strong>Europa</strong> is the smoothest solid body in the system — a global crust of water ice crisscrossed by dark fractures, hiding a <strong>liquid saltwater ocean</strong> 60–150 km deep under 15–25 km of ice. Tidal heating keeps the ocean liquid. Europa is a target for both astrobiology and <strong>ice mining</strong> — water is propellant mass waiting to be processed.</p>
<p><strong>Insolation:</strong> ~50 W/m² (0.037× Earth). Its surface temperature never rises above −160 °C. Despite the cold, <strong>hydrogen strikes</strong> are possible here — the ice ocean is a resource asset.</p>`,
  },
  ganymede: {
    hook: "The largest moon in the system — bigger than Mercury.",
    discovered: "1610",
    discoverer: "Galileo Galilei",
    distanceAu: "5.200",
    insolation: "~50",
    insolationEarth: "0.037×",
    body: `
<p><strong>Ganymede</strong> (5 268 km diameter) is the ninth-largest object in the system — larger than Pluto and Mercury. It is the only moon known to generate its own <strong>magnetic field</strong>, likely from a liquid iron core. A fractured ice crust covers a subsurface ocean, layered between two or more ice phases.</p>
<p><strong>Insolation:</strong> ~50 W/m² (0.037× Earth). Ganymede is useful as a high-rent deed (⍼90) in the Jupiter system monopoly. Its size and magnetic field make it a candidate for permanent research habitats.</p>`,
  },
  callisto: {
    hook: "The outermost Galilean moon — a cratered relic.",
    discovered: "1610",
    discoverer: "Galileo Galilei",
    distanceAu: "5.200",
    insolation: "~50",
    insolationEarth: "0.037×",
    body: `
<p><strong>Callisto</strong> is the most distant of Jupiter's large moons (1.9 million km from Jupiter's center). Its surface is the oldest in the system — <strong>ancient cratered ice</strong> with no signs of volcanic or tectonic resurfacing. The <strong>Valhalla</strong> multi-ring basin (4 000 km across) dominates the trailing hemisphere.</p>
<p><strong>Insolation:</strong> ~50 W/m² (0.037× Earth). Callisto's low rent (⍼75) makes it an affordable entry point into the Jupiter system. Its stable, radiation-quiet orbit is attractive for long-term infrastructure.</p>`,
  },
  daktulios: {
    hook: "Saturn-orbit hub — the ring-station transit port.",
    discovered: "Built 2051–2056 (Heliopolis-led consortium)",
    discoverer: "Saturn Operations Group (Heliopolis, JAXA, Roscosmos)",
    distanceAu: "9.500",
    insolation: "~15",
    insolationEarth: "0.011×",
    body: `
<p><strong>Daktulios</strong> (from the Greek <em>daktylios</em> — “ring”) is the outermost station hub, anchored in Saturn's system. Where Holst refines ice from Jupiter's moons, Daktulios warehouses and transships volatiles from Saturn's rich moon system — especially Titan's methane seas and Enceladus's cryovolcanic plumes.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). At 9.5 AU, sunlight is barely brighter than a full moon on Earth. All station power comes from <strong>nuclear fission</strong> and orbital fuel deliveries. The station's remote location makes it the most expensive deed on the board (⍼800).</p>`,
  },
  titan: {
    hook: "Saturn's largest moon — a world with weather and seas.",
    discovered: "1655",
    discoverer: "Christiaan Huygens",
    distanceAu: "9.500",
    insolation: "~15",
    insolationEarth: "0.011×",
    body: `
<p><strong>Titan</strong> (5 150 km diameter) is the second-largest moon in the system after Ganymede. It is the only moon with a <strong>thick atmosphere</strong> (1.5 bar, mostly N₂ with methane clouds) and stable surface liquids — methane and ethane rivers, lakes, and seas in the polar regions. The Huygens probe landed there in 2005, revealing a cold world with drainage channels and rounded ice pebbles.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). Titan's thick haze blocks most of the already-dim sunlight. But its <strong>methane seas</strong> make it a premier resource strike location — claim + depot here can trigger a methane gusher worth ⍼2 500.</p>`,
  },
  enceladus: {
    hook: "Ice moon with cryovolcanic plumes — water from the deep.",
    discovered: "1789",
    discoverer: "William Herschel",
    distanceAu: "9.500",
    insolation: "~15",
    insolationEarth: "0.011×",
    body: `
<p><strong>Enceladus</strong> (504 km diameter) is one of the brightest objects in the system — its fresh ice surface reflects nearly 100% of incoming sunlight. The Cassini probe discovered <strong>cryovolcanic plumes</strong> erupting from the south polar region, fed by a subsurface liquid water ocean under 30–40 km of ice.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). Despite its tiny size and remoteness, Enceladus is one of the most valuable resource nodes on the board: it qualifies for <strong>both methane and hydrogen strikes</strong>, the only body on the board with dual gusher eligibility.</p>`,
  },
  iapetus: {
    hook: "Saturn's two-toned moon — a walnut in the sky.",
    discovered: "1671",
    discoverer: "Giovanni Domenico Cassini",
    distanceAu: "9.500",
    insolation: "~15",
    insolationEarth: "0.011×",
    body: `
<p><strong>Iapetus</strong> (1 469 km diameter) is famous for its dramatic <strong>two-tone coloration</strong>: the leading hemisphere is dark as asphalt (albedo 0.03–0.05) while the trailing hemisphere is bright ice (albedo ~0.6). Cassini himself observed that he could only see Iapetus on one side of Saturn. The dark material is likely lag deposit from sublimating ice, coated with organic tholins.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). Iapetus orbits at 3.5 million km from Saturn — the most distant large moon in the system. Its moderate rent (⍼50) makes it a mid-tier Saturn deed.</p>`,
  },
  mimas: {
    hook: "The Death Star moon — a 139 km impact scar.",
    discovered: "1789",
    discoverer: "William Herschel",
    distanceAu: "9.500",
    insolation: "~15",
    insolationEarth: "0.011×",
    body: `
<p><strong>Mimas</strong> (396 km diameter) is the smallest round moon in the system. Its distinguishing feature is the <strong>Herschel Crater</strong> (139 km wide — nearly a third of the moon's diameter), giving it a striking resemblance to a certain fictional space station. The impact that formed it nearly shattered Mimas; fracture lines (chasms) run across the opposite hemisphere.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). Mimas is the cheapest deed in the Saturn system (⍼280). Its low gravity (class 1) makes leave burns trivial — useful as a budget claim.</p>`,
  },
  rhea: {
    hook: "Saturn's second-largest moon — a dirty snowball.",
    discovered: "1672",
    discoverer: "Giovanni Domenico Cassini",
    distanceAu: "9.500",
    insolation: "~15",
    insolationEarth: "0.011×",
    body: `
<p><strong>Rhea</strong> (1 527 km diameter) is Saturn's second-largest moon after Titan. It is mostly water ice with a small rocky core. In 2010, the Cassini mission found evidence of a <strong>tenuous oxygen–carbon dioxide atmosphere</strong> — the first detection of an O₂ atmosphere on an icy moon. Rhea may also have a faint ring system of its own, the only moon known to do so.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). Rhea carries the highest rent (⍼60) among Saturn's non-Titan moons, reflecting its size and resource potential.</p>`,
  },
  dione: {
    hook: "Saturn's fourth-largest moon — tectonics and traces.",
    discovered: "1684",
    discoverer: "Giovanni Domenico Cassini",
    distanceAu: "9.500",
    insolation: "~15",
    insolationEarth: "0.011×",
    body: `
<p><strong>Dione</strong> (1 123 km diameter) orbits at 377 000 km from Saturn, with a density suggesting roughly equal parts water ice and rock. Its surface includes both heavily cratered terrain and bright ice cliffs (wispy terrains), indicating past tectonic activity. Cassini flybys detected a <strong>tenuous exosphere</strong> of molecular oxygen, likely from radiation splitting surface ice.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). At ⍼55 rent, Dione is a solid mid-tier Saturn deed.</p>`,
  },
  tethys: {
    hook: "Saturn's icy moon with a giant canyon.",
    discovered: "1684",
    discoverer: "Giovanni Domenico Cassini",
    distanceAu: "9.500",
    insolation: "~15",
    insolationEarth: "0.011×",
    body: `
<p><strong>Tethys</strong> (1 062 km diameter) is dominated by two immense features: the <strong>Odysseus Crater</strong> (445 km — so large the impact's central peak is gone because the crust relaxed) and <strong>Ithaca Chasma</strong>, a 2 000 km-long canyon running nearly three-quarters of the moon's circumference. Both features suggest Tethys was once warmer and more geologically active.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). Tethys closes the Saturn system at ⍼48 rent — the last purchasable body before the Homeward lane returns pilots to Earth.</p>`,
  },
};

function articleHtml(b: BodyDef, d: BodyData): string {
  return `
<p class="pilot-hook"><em>${d.hook}</em></p>
<table class="body-data">
  <tr><th>Discovery</th><td>${d.discovered}${d.discoverer !== "—" ? ` · ${d.discoverer}` : ""}</td></tr>
  <tr><th>System</th><td>${b.system}</td></tr>
  <tr><th>Distance from Sun</th><td>${d.distanceAu} AU</td></tr>
  <tr><th>Solar insolation</th><td>${d.insolation} W/m² (${d.insolationEarth} Earth)</td></tr>
</table>
${d.body}
<p class="pilot-foot mono">${b.kind.charAt(0).toUpperCase() + b.kind.slice(1)} · ${b.system} system · see also The Mainline</p>
`;
}

/** Index page — all bodies in board order. */
export function planetoidsIndexTopic(): HandbookTopic {
  const items = BODIES.map(
    (b) => {
      const kindLabel = b.kind.charAt(0).toUpperCase() + b.kind.slice(1);
      const d = BODY_DATA[b.id];
      return `<li><strong>${b.name}</strong> — ${kindLabel} · ${b.system} system · ${d?.insolation ?? "—"}</li>`;
    },
  ).join("");
  return {
    id: "planetoids-overview",
    title: "Overview",
    html: `
<p>Every <strong>body on the Mainline</strong> has a page. First, why you care. Then, if you want it, the numbers (distance, sunlight).</p>
<p>Bodies are listed in <strong>board order</strong>. Each entry notes:</p>
<ul>
  <li>Discovery date and discoverer</li>
  <li>Distance from the Sun (AU)</li>
  <li>Sunlight (W/m² and × Earth)</li>
  <li>Why it matters on the ledger</li>
</ul>
<p class="hint">Open a body entry below to read its full article.</p>
<ul class="pilot-index">${items}</ul>
`,
  };
}

/** One handbook topic per body on the Mainline. */
export function planetoidTopics(): HandbookTopic[] {
  return BODIES.map((b) => {
    const d = BODY_DATA[b.id];
    return {
      id: `body-${b.id}`,
      title: b.name,
      html: articleHtml(b, d),
    };
  });
}
