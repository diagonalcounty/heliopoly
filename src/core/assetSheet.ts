/**
 * Winner end-story asset sheet: held claims as mark + income, not ROI%.
 * Gifts and steals (zero cash in) still appear. Closed books are gone.
 */
import { getNode } from "./board";
import {
  bankSellValue,
  claimEarnings,
  formatMarkIncomeLine,
  type DossierClaimRow,
} from "./claimLedger";
import type { GameState } from "./types";

function markIncomeFigures(mark: number, income: number): string {
  return formatMarkIncomeLine({
    bankValue: mark,
    earnings: income,
  } as DossierClaimRow);
}

/**
 * Short end-card clause naming the seat's top held claims by mark + income.
 * Empty string for an unknown seat or a seat with no held books.
 */
export function winnerAssetSheetLine(
  state: GameState,
  playerId: string,
  max = 3,
): string {
  const p = state.players.find((x) => x.id === playerId);
  if (!p) return "";

  const ranked: { name: string; mark: number; income: number }[] = [];
  for (const [nodeId, book] of Object.entries(p.claimBooks)) {
    const mark = bankSellValue(book.listPrice);
    const income = claimEarnings(book);
    ranked.push({
      name: getNode(state.board, nodeId).name,
      mark,
      income,
    });
  }
  if (ranked.length === 0) return "";

  ranked.sort((a, b) => {
    const scoreA = a.mark + a.income;
    const scoreB = b.mark + b.income;
    if (scoreB !== scoreA) return scoreB - scoreA;
    if (b.mark !== a.mark) return b.mark - a.mark;
    return a.name.localeCompare(b.name);
  });

  const parts = ranked
    .slice(0, max)
    .map((row) => `${row.name} ${markIncomeFigures(row.mark, row.income)}`);
  return `Assets: ${parts.join(" · ")}.`;
}
