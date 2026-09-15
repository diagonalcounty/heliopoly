/**
 * Sim Lab property books: mark + income, not ROI% (#142).
 * Run: npx tsx src/sim/batch.test.ts
 */
import { bankSellValue } from "../core/claimLedger";
import {
  aggregatePropertyRoi,
  bestBankExitCallout,
  bankExitNet,
  propertyCashMark,
} from "./propertyBooks";
import type { PropertyRoiRow, SimPropertyCash } from "./types";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

function cash(partial: {
  nodeId: string;
  name: string;
  group?: string | null;
  kind?: string;
  invested: number;
  rentCollected: number;
  strikesCollected?: number;
  listPrice: number;
  landings?: number;
  claims?: number;
}): SimPropertyCash {
  return {
    nodeId: partial.nodeId,
    name: partial.name,
    group: partial.group ?? null,
    kind: partial.kind ?? "planet",
    invested: partial.invested,
    rentCollected: partial.rentCollected,
    strikesCollected: partial.strikesCollected,
    listPrice: partial.listPrice,
    mark: bankSellValue(partial.listPrice),
    landings: partial.landings ?? 1,
    claims: partial.claims ?? 1,
  };
}

{
  const mark = propertyCashMark({ listPrice: 401 });
  assert(mark === 200, "meanMark / bank floor is floor(list/2); 401 → 200");
  assert(bankSellValue(400) === 200, "even list 400 → mark 200");
  assert(bankSellValue(550) === 275, "Elon list 550 → mark 275");
}

{
  // Full MSRP 400 + depot 40 in invested; mark is still half list.
  const games: SimPropertyCash[][] = [
    [
      cash({
        nodeId: "europa",
        name: "Europa",
        group: "jupiter",
        kind: "moon",
        invested: 440,
        rentCollected: 50,
        listPrice: 400,
      }),
    ],
  ];
  const rows = aggregatePropertyRoi(games);
  const europa = rows[0]!;
  assert(europa.meanMark === 200, "depot cash is in invested, not mark");
  assert(europa.meanInvested === 440, "claim + depot stay in meanInvested");
  assert(europa.meanIncome === 50, "meanIncome is rent when strikes are absent");
  assert(
    europa.meanBankExitNet === bankExitNet(50, 200, 440),
    "meanBankExitNet = income + mark - invested",
  );
  assert(europa.meanBankExitNet === -190, "50 + 200 - 440 = -190");
  assert(
    europa.meanNet === europa.meanBankExitNet,
    "deprecated meanNet aliases bank-exit net (not rent - invested)",
  );
  const oldHaircut = 50 - 440;
  assert(
    europa.meanBankExitNet !== oldHaircut,
    "full-MSRP buy with little rent is not a total loss once mark is counted",
  );
  assert(europa.roiCash === 50 / 440, "roiCash is demoted income/invested");
  assert(europa.roi === europa.roiCash, "deprecated roi aliases roiCash");
}

{
  // High cash-yield moon vs better bank-exit planet.
  const moon = cash({
    nodeId: "mimas",
    name: "Mimas",
    group: "saturn",
    kind: "moon",
    invested: 100,
    rentCollected: 80,
    listPrice: 100,
  });
  const planet = cash({
    nodeId: "mars",
    name: "Mars",
    group: "mars",
    kind: "planet",
    invested: 400,
    rentCollected: 250,
    listPrice: 400,
  });
  // moon: roiCash 0.80, bank-exit 80+50-100 = 30
  // planet: roiCash 0.625, bank-exit 250+200-400 = 50
  const rows = aggregatePropertyRoi([[moon], [planet]]);
  assert(rows[0]!.nodeId === "mars", "sort is bank-exit net, not roiCash");
  assert(rows[1]!.nodeId === "mimas", "higher roiCash moon ranks second");
  assert(
    (rows[0]!.roiCash ?? 1) < (rows[1]!.roiCash ?? 0),
    "winner has lower cash yield than the runner-up",
  );
  assert(rows[0]!.meanBankExitNet === 50, "Mars bank-exit net 50");
  assert(rows[1]!.meanBankExitNet === 30, "Mimas bank-exit net 30");
}

{
  const games: SimPropertyCash[][] = Array.from({ length: 3 }, () => [
    cash({
      nodeId: "europa",
      name: "Europa",
      group: "jupiter",
      kind: "moon",
      invested: 400,
      rentCollected: 120,
      listPrice: 400,
    }),
  ]);
  const propertyRoi = aggregatePropertyRoi(games);
  const line = bestBankExitCallout(propertyRoi);
  assert(line != null && /best bank-exit book/.test(line), "callout uses bank-exit book");
  assert(line != null && !/Highest property ROI/.test(line), "callout does not say highest ROI");
  assert(line != null && /Europa/.test(line), "callout names the top body");
  assert(
    line != null && /mark /.test(line) && /income /.test(line) && /bank-exit net /.test(line),
    "outcome/callout leads with mark + income + net",
  );
  assert(
    line != null && !/returned \d+% of claim/.test(line) && !/% ROI/.test(line),
    "outcome/callout does not lead with ROI%",
  );
  assert(
    bestBankExitCallout(aggregatePropertyRoi(games.slice(0, 2))) == null,
    "callout requires n>=3 finished games",
  );
}

{
  const withStrikes = cash({
    nodeId: "io",
    name: "Io",
    kind: "moon",
    invested: 350,
    rentCollected: 40,
    strikesCollected: 200,
    listPrice: 350,
  });
  const row: PropertyRoiRow = aggregatePropertyRoi([[withStrikes]])[0]!;
  assert(row.meanIncome === 240, "meanIncome includes strikes when the ledger tracks them");
  assert(row.meanRentCollected === 40, "meanRentCollected stays rent-only when split");
  assert(row.meanMark === 175, "Io mark is floor(350/2)");
  assert(row.meanBankExitNet === 240 + 175 - 350, "strikes flow into bank-exit net");
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll sim-batch checks passed.");
