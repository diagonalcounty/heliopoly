/**
 * Civ-style civilopedia entries for AI callsigns.
 * Tone: school-level clarity (Civ I–IV peak), short enough to read mid-game.
 * Keep in sync with AI_PILOTS in core/pilotNames.ts.
 */
import { AI_PILOTS, titledCallsign, type AiPilotDef } from "../core/pilotNames";
import type { HandbookTopic } from "./content";

/** Full article body per pilot id (no outer h3 — handbook wraps title). */
const PILOT_ARTICLES: Record<string, string> = {
  recorde: `
<p class="pilot-hook"><em>Robert Recorde — invented the equals sign (=) in 1557.</em></p>
<p>Robert Recorde was a Welsh (from Wales) physician (a doctor) and mathematician (a person who works with math). In his book <em>The Whetstone of Witte</em> he introduced the twin parallel lines (two matching lines) of the equals sign, writing that no two things can be more equal.</p>
<p>Every rent line, every fuel equation (a fuel sum), and every ledger balance sheet (the book's page of what you have) still runs on his glyph (the = mark). If The Recorde is flying against you, remember: the ledger (the book) is older than the rocket, and succinct math (short and exact) is how orbital economics (money and fuel in this game) keeps score.</p>
`,
  k127: `
<p class="pilot-hook"><em>A Khmer stele (a carved stone at Sambor) — an early dated zero in a place-value system (the place of a digit matters: ones, tens, hundreds), 683 CE.</em></p>
<p>K-127 is a 7th-century (the 600s) Khmer stone stele (a carved stone) from Cambodia. It is often named as one of the oldest firmly dated uses of the zero symbol in a decimal place-value system (the place of a digit matters). It is not a Mesopotamian (from ancient Mesopotamia) clay tablet. The name K-127 is a catalog number for the stone, not a person's name.</p>
<p>French official Adhémar Leclère found it in 1891 near a temple at Sambor (Sambaur) on the Mekong (a river) in Kratié province. Scholar George Cœdès catalogued it (listed it) and translated it in 1931 as K-127. Written in Old Khmer (the old language of that place), it records a date of Śaka 605 (a calendar count, about 683 CE) and uses a small dot for zero in the number. The text is a count of people, oxen, and rice — the ordinary ledger (the book) work of a state.</p>
<p>The stele (the carved stone) vanished during the Khmer Rouge period (a time when many records in Cambodia were lost), was later found again, and is now in the National Museum of Cambodia in Phnom Penh. Historians of mathematics (people who study the history of math) treat it as important Southeast Asian evidence for the zero numeral (the mark for zero).</p>
<p>In Heliopoly the callsign (the name on the rocket) is on purpose: zero is not "nothing." It is structure (it holds a place). Without place-value (the place of a digit), you cannot keep a price, propellant (fuel), or a ledger (the book). The blank still counts.</p>
`,
  turing: `
<p class="pilot-hook"><em>Helped invent computer science (the study of what computers can do). Broke codes in World War II.</em></p>
<p>Alan Turing formalized what a computer can be (the Turing machine, his model of what a computer can do) and led the work that cracked (broke) enemy codes at Bletchley Park (the place where that code work happened). Textbooks place him at the root (the start) of both algorithms (a set of steps) and modern computing ethics (what people should do with computers).</p>
<p>A Turing rival is pure logic under pressure (clear steps when the game is tight). When fuel and rent are tight, the better model of the board wins. The orbital ledger (the book in this space game) comes from his idea of computation (how computers work).</p>
`,
  ada: `
<p class="pilot-hook"><em>Ada Lovelace — often called the first computer programmer.</em></p>
<p><strong>Ada Lovelace</strong> (Ada King, Countess of Lovelace) worked with Charles Babbage’s Analytical Engine designs in the 1840s. Her notes include what many historians treat as the first published algorithm intended for a machine.</p>
<p>She saw that engines might manipulate symbols, not only numbers — art, music, and general thought. Mainline software and the quantum-era ledger all sit in that lineage.</p>
`,
  sagan: `
<p class="pilot-hook"><em>Astronomer who brought Cosmos to millions of living rooms.</em></p>
<p><strong>Carl Sagan</strong> made planetary science famous. Through the TV series <em>Cosmos</em>, books, and public talks, he argued that ordinary people could understand stars, evolution, and the fragile Earth.</p>
<p>He is here as a <em>visionary</em>, not a flight-crew callsign: the culture that funded the next launch. Wonder is not soft; it is how orbital economics sells the sky.</p>
`,
  asimov: `
<p class="pilot-hook"><em>Science-fiction giant — robots, Foundation, and laws of robotics.</em></p>
<p><strong>Isaac Asimov</strong> wrote hundreds of books. Students meet him through robot stories and the <em>Foundation</em> series: big futures, clear rules, and the idea that ideas themselves can shape empires.</p>
<p>His Three Laws of Robotics are classroom shorthand for “design your tools before they design you.” In orbital economics among the planets, contracts and claims play a similar role.</p>
`,
  clarke: `
<p class="pilot-hook"><em>2001: A Space Odyssey; also predicted geostationary satellites.</em></p>
<p><strong>Arthur C. Clarke</strong> co-created <em>2001</em> and wrote hard science fiction that treated space as engineering, not magic. Years before Sputnik, he described satellites parked in geostationary orbit — the same altitude that now carries much of Earth’s TV and weather data.</p>
<p>Clarke’s lesson for the Mainline: the useful idea often arrives decades before the infrastructure.</p>
`,
  goddard: `
<p class="pilot-hook"><em>American pioneer of liquid-fuel rockets (ideas, not a flight crew).</em></p>
<p><strong>Robert Goddard</strong> launched the first liquid-fueled rocket in 1926. Newspapers mocked the idea of spaceflight; he kept filing patents and test-firing in New Mexico anyway.</p>
<p>He is on the roster for the <em>physics of leave-burn</em>, not as a “famous astronaut.” Prove the burn, then scale it — that is still the ledger’s problem.</p>
`,
  "von-braun": `
<p class="pilot-hook"><em>Heavy-lift rocketry that made crewed lunar flight possible.</em></p>
<p><strong>Wernher von Braun</strong> led design work on the Saturn V class of heavy-lift rockets. He also worked on the German V-2 in World War II — history classes rightly treat his career as both engineering triumph and moral hazard.</p>
<p>Kept as an <em>infrastructure</em> callsign (how you get mass off Earth), not a flight-crew hero. Technology that opens the system can begin as a weapon. Orbital economics still has a past.</p>
`,
};

function articleFor(p: AiPilotDef): string {
  const body =
    PILOT_ARTICLES[p.id] ??
    `<p class="pilot-hook"><em>${p.schoolHook}</em></p><p>Entry pending.</p>`;
  return `
${body}
<p class="pilot-foot mono">See the Overview page under Rival rockets.</p>
`;
}

/** Index page — Civ civilopedia category list. */
export function rivalPilotsIndexTopic(): HandbookTopic {
  const items = AI_PILOTS.map(
    (p) =>
      `<li><strong>${titledCallsign(p.callsign)}</strong> — ${p.schoolHook}</li>`,
  ).join("");
  return {
    id: "rival-pilots-overview",
    title: "Overview",
    html: `
<p>Each rival flies a named rocket, not a named pilot. The callsign (the name painted on the rocket) honors people and ideas behind numbers, notation (how we write math), computation (how computers work), and the culture of spaceflight.</p>
<p>You name your rocket at launch. Rivals come from this short list, so every opponent has a page you can look up during the expedition (this game).</p>
<p>These are not modern astronaut crews used as ship names. The names come from the start of the ledger age (the age of the book). Unused names may still name lanes later. Those lanes are not in the game yet, and those names are not other rockets.</p>
<ul class="pilot-index">${items}</ul>
<p>Open a rocket page below in this section.</p>
`,
  };
}

/** One handbook topic per AI rocket callsign. */
export function rivalPilotTopics(): HandbookTopic[] {
  return AI_PILOTS.map((p) => ({
    id: `pilot-${p.id}`,
    title: titledCallsign(p.callsign),
    html: articleFor(p),
  }));
}
