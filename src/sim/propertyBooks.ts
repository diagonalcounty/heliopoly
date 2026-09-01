/**
 * Claimable-body books for Sim Lab / batch (#142).
 * Mark is half list (bank floor); income is rent (+ strikes if tracked).
 * Pure — no Node I/O, so tests and the browser typecheck can import it.
 */
import { bankSellValue } from "../core/claimLedger";
import { CURRENCY_MARK } from "../core/currency";
import type { PropertyRoiRow, SimPropertyCash } from "./types";

/** Signed ledger cash for sim copy (matches lab UI rounding). */
export function simMoney(n: number): string {
  const r = Math.round(n);
  if (r < 0) return `−${CURRENCY_MARK}${Math.abs(r)}`;
  return `${CURRENCY_MARK}${r}`;
}

export function propertyCashIncome(
  row: Pick<SimPropertyCash, "rentCollected" | "strikesCollected">,
): number {
  return (row.rentCollected ?? 0) + (row.strikesCollected ?? 0);
}

export function propertyCashMark(
  row: Pick<SimPropertyCash, "mark" | "listPrice">,
): number {
  if (typeof row.mark === "number" && Number.isFinite(row.mark)) return row.mark;
  return bankSellValue(row.listPrice);
}

export function bankExitNet(
  income: number,
  mark: number,
  invested: number,
): number {
  return income + mark - invested;
}

function rowBankExitNet(row: PropertyRoiRow): number {
  if (
    typeof row.meanBankExitNet === "number" &&
    Number.isFinite(row.meanBankExitNet)
  ) {
    return row.meanBankExitNet;
  }
  const income = row.meanIncome ?? row.meanRentCollected ?? 0;
  const mark = row.meanMark ?? 0;
  return income + mark - (row.meanInvested ?? 0);
}

/** Plain-language callout: best bank-exit book, not highest ROI%. */
export function bestBankExitCallout(
  propertyRoi: PropertyRoiRow[] | undefined,
): string | null {
  const ranked = (propertyRoi ?? []).filter((r) => r.n >= 3);
  if (!ranked.length) return null;
  const top = ranked[0]!;
  const income = top.meanIncome ?? top.meanRentCollected;
  const mark = top.meanMark ?? 0;
  const net = rowBankExitNet(top);
  const second = ranked[1];
  let gapNote = "";
  if (second) {
    const sNet = rowBankExitNet(second);
    gapNote = ` Next is ${second.name} at bank-exit net ${simMoney(sNet)}.`;
  }
  return (
    `${top.name} is the best bank-exit book: mark ${simMoney(mark)} + income ${simMoney(income)} → bank-exit net ${simMoney(net)} (n=${top.n} finished games).${gapNote}`
  );
}

interface PropertyRoiAcc {
  nodeId: string;
  name: string;
  group: string | null;
  kind: string;
  n: number;
  totalInvested: number;
  totalRent: number;
  totalIncome: number;
  totalMark: number;
  totalLandings: number;
  totalBankExitNet: number;
  roiSum: number;
  roiN: number;
}

function absorbPropertyCash(
  acc: Map<string, PropertyRoiAcc>,
  rows: SimPropertyCash[],
): void {
  for (const row of rows) {
    const income = propertyCashIncome(row);
    if (row.claims === 0 && row.invested === 0 && income === 0) {
      continue;
    }
    const mark = propertyCashMark(row);
    let cur = acc.get(row.nodeId);
    if (!cur) {
      cur = {
        nodeId: row.nodeId,
        name: row.name,
        group: row.group,
        kind: row.kind,
        n: 0,
        totalInvested: 0,
        totalRent: 0,
        totalIncome: 0,
        totalMark: 0,
        totalLandings: 0,
        totalBankExitNet: 0,
        roiSum: 0,
        roiN: 0,
      };
      acc.set(row.nodeId, cur);
    }
    cur.n += 1;
    cur.totalInvested += row.invested;
    cur.totalRent += row.rentCollected;
    cur.totalIncome += income;
    cur.totalMark += mark;
    cur.totalLandings += row.landings;
    cur.totalBankExitNet += bankExitNet(income, mark, row.invested);
    if (row.invested > 0) {
      cur.roiSum += income / row.invested;
      cur.roiN += 1;
    }
  }
}

function finalizePropertyRoi(acc: Map<string, PropertyRoiAcc>): PropertyRoiRow[] {
  const rows: PropertyRoiRow[] = [];
  for (const cur of acc.values()) {
    const n = Math.max(1, cur.n);
    const meanInvested = cur.totalInvested / n;
    const meanIncome = cur.totalIncome / n;
    const meanMark = cur.totalMark / n;
    const meanBankExitNet = cur.totalBankExitNet / n;
    const roiCash =
      cur.totalInvested > 0 ? cur.totalIncome / cur.totalInvested : null;
    rows.push({
      nodeId: cur.nodeId,
      name: cur.name,
      group: cur.group,
      kind: cur.kind,
      n: cur.n,
      meanInvested,
      meanRentCollected: cur.totalRent / n,
      meanIncome,
      meanMark,
      meanLandings: cur.totalLandings / n,
      meanBankExitNet,
      roiCash,
      meanNet: meanBankExitNet,
      roi: roiCash,
      meanRoi: cur.roiN > 0 ? cur.roiSum / cur.roiN : null,
    });
  }
  rows.sort((a, b) => {
    const an = rowBankExitNet(a);
    const bn = rowBankExitNet(b);
    if (bn !== an) return bn - an;
    const ai = (a.meanIncome ?? 0) + (a.meanMark ?? 0);
    const bi = (b.meanIncome ?? 0) + (b.meanMark ?? 0);
    if (bi !== ai) return bi - ai;
    if (b.n !== a.n) return b.n - a.n;
    return a.name.localeCompare(b.name);
  });
  return rows;
}

/** Pure helper: aggregate per-game cash rows into ranked property books. */
export function aggregatePropertyRoi(
  games: SimPropertyCash[][],
): PropertyRoiRow[] {
  const acc = new Map<string, PropertyRoiAcc>();
  for (const rows of games) absorbPropertyCash(acc, rows);
  return finalizePropertyRoi(acc);
}
