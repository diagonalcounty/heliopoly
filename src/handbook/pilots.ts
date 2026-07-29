/**
 * Civ-style civilopedia entries for AI callsigns.
 * Tone: school-level clarity (Civ I–IV peak), short enough to read mid-game.
 * Keep in sync with AI_PILOTS in core/pilotNames.ts.
 */
import { AI_PILOTS, type AiPilotDef } from "../core/pilotNames";
import type { HandbookTopic } from "./content";

/** Full article body per pilot id (no outer h3 — handbook wraps title). */
const PILOT_ARTICLES: Record<string, string> = {
  recorde: `
<p class="pilot-hook"><em>Robert Recorde — invented the equals sign (=) in 1557.</em></p>
<p><strong>Robert Recorde</strong> was a Welsh physician and mathematician. In <em>The Whetstone of Witte</em> he introduced the twin parallel lines of the <strong>equals sign</strong>, writing that no two things can be more equal.</p>
<p>Every rent line, fuel equation, and charter balance sheet still runs on his glyph. If Recorde is flying against you, remember: the ledger is older than the rocket — and more succinct math is how free enterprise keeps score.</p>
`,
  k127: `
<p class="pilot-hook"><em>Khmer stele (Sambor) — early dated zero in a decimal place-value system (683&nbsp;CE).</em></p>
<p><strong>K-127</strong> is a 7th-century <strong>Khmer stone stele</strong> from Cambodia, often cited as one of the oldest <em>firmly dated</em> uses of the <strong>zero symbol</strong> in a decimal place-value system. It is not a Mesopotamian clay tablet; the designation is an epigraphic catalogue number.</p>
<p>French official Adhémar Leclère found it in 1891 near a temple at Sambor (Sambaur) on the Mekong in Kratié province. Scholar George Cœdès catalogued and translated it in 1931 as <strong>K-127</strong>. Written in Old Khmer, it records a date of Śaka 605 (about <strong>683&nbsp;CE</strong>) and uses a small <strong>dot for zero</strong> in the number. The text is administrative — slaves, oxen, rice — the ordinary ledger work of a state.</p>
<p>The stele vanished during the Khmer Rouge period, was later rediscovered, and is now in the <strong>National Museum of Cambodia</strong> in Phnom Penh. Historians of mathematics treat it as important Southeast Asian evidence for the zero numeral.</p>
<p>In Heliopoly the callsign is deliberate: zero is not “nothing,” it is structure. Without place-value, you cannot keep price, propellant, or a charter. The blank still counts.</p>
`,
  turing: `
<p class="pilot-hook"><em>Helped invent computer science; broke codes in World War II.</em></p>
<p><strong>Alan Turing</strong> formalized what a computer can be (the Turing machine) and led work that cracked enemy codes at Bletchley Park. Textbooks place him at the root of both algorithms and modern computing ethics.</p>
<p>A Turing rival is pure logic under pressure: when fuel and rent are tight, the better model of the board wins. Crypto, AI seats, and the whole orbital ledger sit downstream of his idea of computation.</p>
`,
  ada: `
<p class="pilot-hook"><em>Ada Lovelace — often called the first computer programmer.</em></p>
<p><strong>Ada Lovelace</strong> (Ada King, Countess of Lovelace) worked with Charles Babbage’s Analytical Engine designs in the 1840s. Her notes include what many historians treat as the first published algorithm intended for a machine.</p>
<p>She saw that engines might manipulate symbols, not only numbers — art, music, and general thought. Charter software and the quantum-era ledger all sit in that lineage.</p>
`,
  sagan: `
<p class="pilot-hook"><em>Astronomer who brought Cosmos to millions of living rooms.</em></p>
<p><strong>Carl Sagan</strong> made planetary science famous. Through the TV series <em>Cosmos</em>, books, and public talks, he argued that ordinary people could understand stars, evolution, and the fragile Earth.</p>
<p>He is here as a <em>visionary</em>, not a flight-crew callsign: the culture that funded the next launch. Wonder is not soft; it is how free enterprise sells the sky.</p>
`,
  asimov: `
<p class="pilot-hook"><em>Science-fiction giant — robots, Foundation, and laws of robotics.</em></p>
<p><strong>Isaac Asimov</strong> wrote hundreds of books. Students meet him through robot stories and the <em>Foundation</em> series: big futures, clear rules, and the idea that ideas themselves can shape empires.</p>
<p>His Three Laws of Robotics are classroom shorthand for “design your tools before they design you.” In free enterprise among the planets, contracts and claims play a similar role.</p>
`,
  clarke: `
<p class="pilot-hook"><em>2001: A Space Odyssey; also predicted geostationary satellites.</em></p>
<p><strong>Arthur C. Clarke</strong> co-created <em>2001</em> and wrote hard science fiction that treated space as engineering, not magic. Years before Sputnik, he described satellites parked in geostationary orbit — the same altitude that now carries much of Earth’s TV and weather data.</p>
<p>Clarke’s lesson for charter play: the useful idea often arrives decades before the infrastructure.</p>
`,
  goddard: `
<p class="pilot-hook"><em>American pioneer of liquid-fuel rockets (ideas, not a flight crew).</em></p>
<p><strong>Robert Goddard</strong> launched the first liquid-fueled rocket in 1926. Newspapers mocked the idea of spaceflight; he kept filing patents and test-firing in New Mexico anyway.</p>
<p>He is on the roster for the <em>physics of leave-burn</em>, not as a “famous astronaut.” Prove the burn, then scale it — that is still the charter’s problem.</p>
`,
  "von-braun": `
<p class="pilot-hook"><em>Heavy-lift rocketry that made crewed lunar flight possible.</em></p>
<p><strong>Wernher von Braun</strong> led design work on the Saturn V class of heavy-lift rockets. He also worked on the German V-2 in World War II — history classes rightly treat his career as both engineering triumph and moral hazard.</p>
<p>Kept as an <em>infrastructure</em> callsign (how you get mass off Earth), not a flight-crew hero. Technology that opens the system can begin as a weapon. Free enterprise still has a past.</p>
`,
};

function articleFor(p: AiPilotDef): string {
  const body =
    PILOT_ARTICLES[p.id] ??
    `<p class="pilot-hook"><em>${p.schoolHook}</em></p><p>Entry pending.</p>`;
  return `
${body}
<p class="pilot-foot mono">Rocket · ${p.callsign} · see also Rival rockets index</p>
`;
}

/** Index page — Civ civilopedia category list. */
export function rivalPilotsIndexTopic(): HandbookTopic {
  const items = AI_PILOTS.map(
    (p) =>
      `<li><strong>${p.callsign}</strong> — ${p.schoolHook}</li>`,
  ).join("");
  return {
    id: "rival-pilots-overview",
    title: "Overview",
    html: `
<p>Each AI seat flies a <strong>named rocket</strong> — not a named pilot. Callsigns honor people and ideas behind <strong>number, notation, computation</strong>, and the culture of spaceflight (Civ-style civilopedia).</p>
<p>You name <strong>your</strong> rocket at launch. Rivals draw from this short roster so every opponent has a page you can look up mid-charter.</p>
<p><strong>No modern astronaut flight crews</strong> as ship names — foundations of the ledger age better. Unused names may still label <strong>transit lanes</strong> later.</p>
<ul class="pilot-index">${items}</ul>
<p class="hint">Open a rocket entry below in this section.</p>
`,
  };
}

/** One handbook topic per AI rocket callsign. */
export function rivalPilotTopics(): HandbookTopic[] {
  return AI_PILOTS.map((p) => ({
    id: `pilot-${p.id}`,
    title: `Rocket: ${p.callsign}`,
    html: articleFor(p),
  }));
}
