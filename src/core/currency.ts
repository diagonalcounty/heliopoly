/** Charter ledger mark (angzarr) — Heliopoly display currency. */
export const CURRENCY_MARK = "⍼";

export function formatMoney(amount: number): string {
  return `${CURRENCY_MARK}${amount}`;
}
