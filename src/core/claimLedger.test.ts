/**
 * Claim books, remote bank dump, and table auction.
 * Run: npx tsx src/core/claimLedger.test.ts
 */
import { winnerAssetSheetLine } from "./assetSheet";
import {
  bankSellValue,
  bestBooksLine,
  buildDossierView,
  claimEarnings,
  claimRoi,
  formatAuctionResult,
  formatMarkIncomeLine,
  grantClaim,
  tryConsumeLandingRight,
} from "./claimLedger";
import { formatMoney } from "./currency";
import { applyAction, getLegalActions, netWorth } from "./rules";
import { createGame, currentPlayer } from "./state";
import { teslaTargetClaims } from "./turnClock";
import type { GameState } from "./types";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

function setupPortfolio(): GameState {
  const s = createGame({
    playerCount: 3,
    humanSeat: true,
    humanName: "Venture",
    seed: 42,
  });
  const you = s.players[0];
  const ai1 = s.players[1];
  you.position = "earth";
  you.cash = 80;
  grantClaim(s, you.id, "elon", { rentCollected: 400 });
  grantClaim(s, you.id, "venus", { rentCollected: 0 });
  grantClaim(s, ai1.id, "mars", { rentCollected: 90, depot: true });
  grantClaim(s, ai1.id, "phobos");
  grantClaim(s, ai1.id, "deimos");
  ai1.cash = 1200;
  s.players[2].cash = 400;
  s.phase = "await_action";
  return s;
}

const elonReserve = bankSellValue(550);
assert(elonReserve === 275, "Elon reserve is half of 550");

{
  const s = setupPortfolio();
  const you = s.players[0];
  const book = you.claimBooks.elon;
  assert(book && claimEarnings(book) === 400, "Elon book has 400 rent earned");
  assert(book && claimRoi(book) !== null && Math.abs(claimRoi(book)! - 400 / 550) < 1e-9, "Elon ROI is 400/550");
  const legal = getLegalActions(s);
  assert(
    legal.sellClaims.some((c) => c.nodeId === "elon" && c.value === 275),
    "Remote sell list includes Elon at bank half-price",
  );
  assert(legal.canAuction, "Can auction from Earth");
  assert(!legal.sell, "Underfoot Sell is off while on Earth");
  const view = buildDossierView(s, you.id, netWorth);
  assert(view && view.canSell, "Own dossier can sell on our turn");
  const venus = view?.groups.flatMap((g) => g.rows).find((r) => r.nodeId === "venus");
  assert(
    venus != null && venus.listPrice === 500 && venus.bankValue === 250,
    "Venus dossier row mark is half list (500 → 250)",
  );
  assert(
    venus != null &&
      formatMarkIncomeLine(venus) === `Mark ${formatMoney(250)} · income ${formatMoney(0)}`,
    `Venus book-so-far is mark + income (${venus ? formatMarkIncomeLine(venus) : "missing"})`,
  );
  const rival = buildDossierView(s, s.players[1].id, netWorth);
  assert(rival && !rival.canSell, "Rival dossier is read-only");
  assert(rival && rival.groups.some((g) => g.rows.some((r) => r.nodeId === "mars" && r.hasDepot)), "Rival Mars shows depot");
}

function sheetClaim(name: string, mark: number, income: number): string {
  return `${name} Mark ${formatMoney(mark)} · income ${formatMoney(income)}`;
}

{
  const s = setupPortfolio();
  const you = s.players[0];
  const elonBook = you.claimBooks.elon!;
  const venusBook = you.claimBooks.venus!;
  const elonMark = bankSellValue(elonBook.listPrice);
  const venusMark = bankSellValue(venusBook.listPrice);
  const elonIncome = claimEarnings(elonBook);
  const venusIncome = claimEarnings(venusBook);
  assert(elonMark === 275 && elonIncome === 400, "Elon list 550 mark 275 plus 400 income");
  assert(venusMark === 250 && venusIncome === 0, "Venus list 500 mark 250 plus 0 income");
  const line = winnerAssetSheetLine(s, you.id);
  const expected = `Assets: ${sheetClaim("Elon", elonMark, elonIncome)} · ${sheetClaim("Venus", venusMark, venusIncome)}.`;
  assert(line === expected, `Asset sheet ranks by mark + income (${line})`);
  assert(line === bestBooksLine(s, you.id), "bestBooksLine re-exports the asset sheet");
  grantClaim(s, you.id, "titan", { rentCollected: 6000 });
  grantClaim(s, you.id, "enceladus", { rentCollected: 32 });
  grantClaim(s, you.id, "ganymede", { rentCollected: 0 });
  const titanBook = you.claimBooks.titan!;
  const ganymedeBook = you.claimBooks.ganymede!;
  const titanMark = bankSellValue(titanBook.listPrice);
  const ganymedeMark = bankSellValue(ganymedeBook.listPrice);
  const capped = winnerAssetSheetLine(s, you.id);
  const expectedCap = `Assets: ${sheetClaim("Titan", titanMark, claimEarnings(titanBook))} · ${sheetClaim("Elon", elonMark, elonIncome)} · ${sheetClaim("Ganymede", ganymedeMark, claimEarnings(ganymedeBook))}.`;
  assert(
    capped === expectedCap,
    `Asset sheet caps at the top three by mark + income (${capped})`,
  );
  assert(!capped.includes("Enceladus"), "Enceladus mark+income is 4th and dropped");
}

{
  const s = setupPortfolio();
  const you = s.players[0];
  you.claimBooks.venus!.rentCollected = 25;
  grantClaim(s, you.id, "ganymede", { rentCollected: 0 });
  const tied = winnerAssetSheetLine(s, you.id);
  const elonBook = you.claimBooks.elon!;
  const venusBook = you.claimBooks.venus!;
  const ganymedeBook = you.claimBooks.ganymede!;
  const elonMark = bankSellValue(elonBook.listPrice);
  const venusMark = bankSellValue(venusBook.listPrice);
  const ganymedeMark = bankSellValue(ganymedeBook.listPrice);
  assert(
    bankSellValue(elonBook.listPrice) + claimEarnings(elonBook) >
      bankSellValue(ganymedeBook.listPrice) + claimEarnings(ganymedeBook),
    "Elon still leads on mark + income",
  );
  assert(
    venusMark + claimEarnings(venusBook) === ganymedeMark + claimEarnings(ganymedeBook),
    "Venus and Ganymede tie on mark + income",
  );
  const expectedTied = `Assets: ${sheetClaim("Elon", elonMark, claimEarnings(elonBook))} · ${sheetClaim("Ganymede", ganymedeMark, claimEarnings(ganymedeBook))} · ${sheetClaim("Venus", venusMark, claimEarnings(venusBook))}.`;
  assert(tied === expectedTied, `Tie-break prefers higher mark, then name (${tied})`);
}

{
  const s = setupPortfolio();
  assert(winnerAssetSheetLine(s, s.players[2].id) === "", "Empty portfolio has no asset-sheet clause");
  grantClaim(s, s.players[2].id, "titan", { cashInvested: 0, rentCollected: 900 });
  const giftBook = s.players[2].claimBooks.titan!;
  const giftMark = bankSellValue(giftBook.listPrice);
  const giftLine = winnerAssetSheetLine(s, s.players[2].id);
  const expectedGift = `Assets: ${sheetClaim("Titan", giftMark, claimEarnings(giftBook))}.`;
  assert(giftLine === expectedGift, `Zero-cash-in gift still shows mark + income (${giftLine})`);
  assert(!giftLine.includes("%") && !giftLine.includes("Infinity"), "Gift line is Angzarr, not a percent");
  assert(winnerAssetSheetLine(s, "nobody") === "", "Unknown seat gets no asset-sheet line");
}

{
  const s = setupPortfolio();
  const you = currentPlayer(s);
  const before = you.cash;
  const after = applyAction(s, { type: "sell", nodeId: "elon" });
  const p = after.players[0];
  assert(p.cash === before + 275, "Bank dump pays reserve");
  assert(!after.owners.elon, "Elon returns to the bank");
  assert(!p.properties.includes("elon"), "Elon leaves the portfolio");
  const legal = getLegalActions(after);
  assert(legal.sellClaims.some((c) => c.nodeId === "venus"), "Other claims remain dumpable");
  const again = applyAction(after, { type: "sell", nodeId: "venus" });
  assert(!again.players[0].properties.includes("venus"), "Second dump of a different claim is allowed");
}

{
  const s = setupPortfolio();
  grantClaim(s, s.players[0].id, "mars", { depot: true });
  s.stations.mars = true;
  const after = applyAction(s, { type: "sell", nodeId: "mars" });
  assert(!after.stations.mars, "Bank dump scraps the depot");
}

{
  const s = setupPortfolio();
  const after = applyAction(s, { type: "auction_start", nodeId: "elon" });
  assert(!after.pendingAuction, "All-AI bids resolve in the same action");
  const seller = after.players[0];
  const newOwnerId = after.owners.elon;
  assert(newOwnerId && newOwnerId !== seller.id, "Auction transferred Elon");
  const buyer = after.players.find((p) => p.id === newOwnerId)!;
  assert(seller.cash >= 80 + elonReserve, "Seller received at least reserve");
  assert(seller.landingRights.elon === 1, "Seller got one docking right");
  assert(buyer.claimBooks.elon && buyer.claimBooks.elon.cashInvested >= elonReserve, "Buyer book starts at bid");
  assert(seller.auctionedThisTurn.includes("elon"), "Elon is marked listed this turn");
  const soldCard = after.pendingAnnouncement;
  assert(soldCard && /Bids \(reserve/.test(soldCard.body), "Result card lists bids");
  assert(soldCard && /won/.test(soldCard.body), "Result card marks the winner");
}

{
  const s = setupPortfolio();
  s.stations.venus = true;
  s.players[1].cash = 2000;
  s.players[2].cash = 2000;
  const after = applyAction(s, { type: "auction_start", nodeId: "venus" });
  assert(after.owners.venus !== s.players[0].id, "Venus sold at auction");
  assert(!!after.stations.venus, "Auction transfers the depot with the claim");
}

{
  const s = setupPortfolio();
  s.players[1].cash = 10;
  s.players[2].cash = 10;
  const after = applyAction(s, { type: "auction_start", nodeId: "elon" });
  assert(after.owners.elon === s.players[0].id, "No bids → claim stays with seller");
  assert(after.players[0].auctionedThisTurn.includes("elon"), "Withdrawn listing still counts as this turn's auction of Elon");
  assert(!after.pendingAuction, "Auction cleared");
  const retry = applyAction(after, { type: "auction_start", nodeId: "elon" });
  assert(retry.owners.elon === s.players[0].id, "Cannot re-auction Elon the same turn");
  assert(retry.players[0].auctionedThisTurn.filter((id) => id === "elon").length === 1, "Elon listed once");
  const dumped = applyAction(after, { type: "sell", nodeId: "elon" });
  assert(!dumped.owners.elon, "After a pass, seller may dump Elon to the bank");
  const venusList = applyAction(after, { type: "auction_start", nodeId: "venus" });
  assert(venusList.players[0].auctionedThisTurn.includes("venus"), "A different claim may still be auctioned this turn");
  const card = after.pendingAnnouncement;
  assert(card?.title === "Auction withdrawn", "Withdrawn title");
  assert(!!card && /passed/.test(card.body), "Withdrawn card lists who passed");
}

{
  const mkPending = (reserve?: number) => {
    const s = setupPortfolio();
    s.players[1].agent = "human"; // park the auction on an un-bid human seat
    const after = applyAction(s, { type: "auction_start", nodeId: "elon", reserve });
    return after.pendingAuction;
  };
  assert(mkPending()?.reserve === elonReserve, "No reserve given → defaults to the mark");
  assert(mkPending(10)?.reserve === elonReserve, "Reserve below the mark clamps up to bank half");
  assert(mkPending(9999)?.reserve === 550, "Reserve above the deed clamps down to list price");
  assert(mkPending(400)?.reserve === 400, "Seller-chosen reserve between mark and deed is kept");

  const s = setupPortfolio();
  s.players[1].cash = 10;
  s.players[2].cash = 10;
  const out = applyAction(s, { type: "auction_start", nodeId: "elon", reserve: 450 });
  assert(out.owners.elon === s.players[0].id, "Raised reserve nobody meets → claim stays with seller");
  assert(
    /450/.test(out.pendingAnnouncement?.body ?? ""),
    "Withdrawn card shows the raised reserve",
  );
  assert(out.players[0].auctionedThisTurn.includes("elon"), "Raised-reserve withdrawal still burns the listing");
  const dump = applyAction(out, { type: "sell", nodeId: "elon" });
  assert(!dump.owners.elon, "After a raised-reserve pass, seller may still dump at the mark");
}

{
  const s = setupPortfolio();
  const card = formatAuctionResult(
    s,
    {
      sellerId: s.players[1].id,
      nodeId: "elon",
      reserve: 275,
      bids: { [s.players[0].id]: 275, [s.players[2].id]: 400 },
      awaitingBidderId: null,
    },
    { winnerId: s.players[2].id, price: 400, tied: false },
  );
  assert(card.title === "Outbid", "Human bidder sees Outbid when a rival paid more");
  assert(/won/.test(card.body) && /Venture/.test(card.body), "Outbid card shows your bid and the winner");
}

{
  const s = setupPortfolio();
  const you = s.players[0];
  you.landingRights.elon = 1;
  assert(tryConsumeLandingRight(you, "elon"), "Landing right consumes");
  assert(!you.landingRights.elon, "No rights left");
  assert(!tryConsumeLandingRight(you, "elon"), "Second consume fails");
}

{
  const s = setupPortfolio();
  s.phase = "await_move";
  s.lastRoll = { d1: 3, d2: 4, total: 7, doubles: false };
  const legal = getLegalActions(s);
  assert(
    !legal.sellClaims.some((c) => c.nodeId === "elon"),
    "After rolling, remote Elon is not dumpable",
  );
  assert(!legal.canAuction, "No auction after roll");
}

{
  const s = createGame({
    playerCount: 3,
    humanSeat: true,
    humanName: "Venture",
    seed: 7,
    aiDifficulty: "easy",
  });
  grantClaim(s, s.players[0].id, "io");
  grantClaim(s, s.players[1].id, "europa");
  const hits = teslaTargetClaims(s);
  assert(!hits.includes("io"), "Easy Tesla will not hit the human's Io");
  assert(hits.includes("europa"), "Easy Tesla can still hit an AI Europa");
}

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll claim-ledger checks passed.");
