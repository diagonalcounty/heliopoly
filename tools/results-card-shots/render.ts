/**
 * Static render of the shared results card (#296) for UX review.
 * No dev server: inlines src/style.css + resultsCardMarkup into a page.
 * Run: npx tsx tools/results-card-shots/render.ts <outDir>
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { buildResultsCard, resultsCardMarkup } from "../../src/lab/resultsCard";

const out = resolve(process.argv[2] ?? "results-card-shots");
mkdirSync(out, { recursive: true });
const root = resolve(import.meta.dirname, "../..");
const css = readFileSync(join(root, "src/style.css"), "utf8");
const clerk = `file://${join(root, "public/handbook/cards/clerk-canonical.jpg")}`;

const cases = [
  { name: "bot-evolution", game: "Make a bigger bot", level: "7.2", stats: "38 joins" },
  { name: "urp-tower", game: "Control tower", level: "2.0", stats: "400 points · 4 parked clean" },
  { name: "no-stats", game: "Any future game", level: "1.0", stats: "" },
];
const views = [
  { name: "phone", width: 390, height: 600 },
  { name: "wide", width: 900, height: 420 },
];

const browser = await chromium.launch();
for (const c of cases) {
  const card = buildResultsCard({ gameName: c.game, level: c.level, stats: c.stats });
  const body = resultsCardMarkup(card).replace("/handbook/cards/clerk-canonical.jpg", clerk);
  const html = `<!doctype html><meta name="viewport" content="width=device-width"><style>${css}</style>
<body style="padding:16px"><div class="eac-win">${body}</div>`;
  for (const v of views) {
    const page = await browser.newPage({ viewport: { width: v.width, height: v.height } });
    const file = join(out, `${c.name}.html`);
    writeFileSync(file, html);
    await page.goto(`file://${file}`);
    await page.evaluate(() => {
      const row = document.querySelector(".results-card-actions")!;
      row.innerHTML =
        '<button class="eac-primary">Play again</button><button class="eac-secondary">Back to Arcade</button>';
    });
    await page.screenshot({ path: join(out, `${c.name}-${v.name}.png`), fullPage: true });
    await page.close();
  }
}
await browser.close();
writeFileSync(join(out, "README.txt"), "Rendered by tools/results-card-shots/render.ts\n");
