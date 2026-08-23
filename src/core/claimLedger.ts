/**
 * Claim books, bank dump value, dossier view, and auction bid heuristic.
 * Ownership transfers still live in rules.ts; this module is the ledger math.
 */
import { getNode, isPurchasable } from "./board";
import { formatMoney } from "./currency";
import {
  hasSystemMonopoly,
  isStationHub,
  stationHubsOwned,
  stationNetworkRentMult,
  systemOfGroup,
  SYSTEMS,
  STATION_HUB_IDS,
  type SystemId,
} from "./systems";
import type {
  ClaimBook,
  GameState,
  Player,
  PendingAuction,
  PropertyLedgerRow,
} from "./types";

function currentRent(state: GameState, nodeId: string, ownerId: string): number {
  const node = getNode(state.board, nodeId);
  const base = node.rent ?? 0;
  const sys = systemOfGroup(node.group);
  const monopoly =
    !!sys && hasSystemMonopoly(state.owners, ownerId, sys.id as SystemId);
  const mult = monopoly ? 2 : 1;
  const hubMult = stationNetworkRentMult(state.owners, ownerId, nodeId);
  const depotBonus = state.stations[nodeId] ? 1.5 : 1;
  return Math.floor(base * mult * hubMult * depotBonus);
}

/** Bank dump / auction reserve: half the deed, matching today's Sell claim. */
export function bankSellValue(listPrice: number | undefined | null): number {
  return Math.floor((listPrice ?? 0) / 2);
}

export function emptyClaimBook(
  listPrice: number,
  cashInvested: number,
  acquiredOnTurn: number,
): ClaimBook {
  return {
    listPrice,
    cashInvested,
    rentCollected: 0,
    gusherCollected: 0,
    acquiredOnTurn,
  };
}

export function openClaimBook(
  player: Player,
  nodeId: string,
  init: {
    listPrice: number;
    cashInvested?: number;
    rentCollected?: number;
    gusherCollected?: number;
    acquiredOnTurn?: number;
  },
): ClaimBook {
  const book = emptyClaimBook(
    init.listPrice,
    init.cashInvested ?? init.listPrice,
    init.acquiredOnTurn ?? 0,
  );
  if (init.rentCollected != null) book.rentCollected = init.rentCollected;
  if (init.gusherCollected != null) book.gusherCollected = init.gusherCollected;
  player.claimBooks[nodeId] = book;
  return book;
}

export function closeClaimBook(player: Player, nodeId: string): void {
  delete player.claimBooks[nodeId];
}

export function ensureClaimBook(
  player: Player,
  nodeId: string,
  listPrice: number,
): ClaimBook {
  const existing = player.claimBooks[nodeId];
  if (existing) return existing;
  return openClaimBook(player, nodeId, { listPrice });
}

function ledgerRow(
  state: GameState,
  nodeId: string,
): PropertyLedgerRow | null {
  const led = state.propertyLedger;
  if (!led) return null;
  let row = led[nodeId];
  if (!row) {
    row = { nodeId, invested: 0, rentCollected: 0, landings: 0, claims: 0 };
    led[nodeId] = row;
  }
  return row;
}

/** Claim cash (list price paid). No-op when the sim ledger is not attached. */
export function recordPropertyClaim(
  state: GameState,
  nodeId: string,
  cashPaid: number,
): void {
  const row = ledgerRow(state, nodeId);
  if (!row) return;
  row.invested += Math.max(0, cashPaid);
  row.claims += 1;
}

export function recordPropertyDepot(
  state: GameState,
  nodeId: string,
  cashPaid: number,
): void {
  const row = ledgerRow(state, nodeId);
  if (!row) return;
  row.invested += Math.max(0, cashPaid);
}

export function recordPropertyRent(
  state: GameState,
  nodeId: string,
  cashPaid: number,
): void {
  const row = ledgerRow(state, nodeId);
  if (!row) return;
  row.rentCollected += Math.max(0, cashPaid);
  row.landings += 1;
}

export function creditRentCollected(
  owner: Player,
  nodeId: string,
  amount: number,
  listPrice: number,
  state?: GameState,
): void {
  if (amount > 0) {
    ensureClaimBook(owner, nodeId, listPrice).rentCollected += amount;
  }
  if (state) recordPropertyRent(state, nodeId, Math.max(0, amount));
}

export function creditGusherCollected(
  owner: Player,
  nodeId: string,
  amount: number,
  listPrice: number,
): void {
  if (amount <= 0) return;
  ensureClaimBook(owner, nodeId, listPrice).gusherCollected += amount;
}

export function creditDepotSpend(
  owner: Player,
  nodeId: string,
  amount: number,
  listPrice: number,
  state?: GameState,
): void {
  if (amount > 0) {
    ensureClaimBook(owner, nodeId, listPrice).cashInvested += amount;
  }
  if (state) recordPropertyDepot(state, nodeId, Math.max(0, amount));
}

export function claimEarnings(book: ClaimBook): number {
  return book.rentCollected + book.gusherCollected;
}

/** earnings / invested; null when nothing was paid (gift / steal). */
export function claimRoi(book: ClaimBook): number | null {
  if (book.cashInvested <= 0) return null;
  return claimEarnings(book) / book.cashInvested;
}

export function claimMark(book: ClaimBook): number {
  return bankSellValue(book.listPrice);
}

/** Mark (bank half) + income (rent + strikes) — player-facing book value. */
export function claimBookValue(book: ClaimBook): number {
  return claimMark(book) + claimEarnings(book);
}

/**
 * End-screen profitability (#138): mark + income, not ROI%.
 * Held deeds only (closed books are gone). Gifts/steals still rank.
 */
export function assetSheetLine(
  state: GameState,
  playerId: string,
  max = 3,
): string {
  const p = state.players.find((x) => x.id === playerId);
  if (!p) return "";
  const ranked: { name: string; mark: number; income: number; total: number }[] =
    [];
  for (const [nodeId, book] of Object.entries(p.claimBooks)) {
    const mark = claimMark(book);
    const income = claimEarnings(book);
    ranked.push({
      name: getNode(state.board, nodeId).name,
      mark,
      income,
      total: mark + income,
    });
  }
  if (ranked.length === 0) return "";
  ranked.sort((a, b) => b.total - a.total);
  return `Books: ${ranked
    .slice(0, max)
    .map(
      (r) =>
        `${r.name} ${formatMoney(r.total)} (mark ${formatMoney(r.mark)} + income ${formatMoney(r.income)})`,
    )
    .join(" · ")}.`;
}

/** @deprecated ROI% line — kept so old call sites compile until swapped. */
export function bestBooksLine(
  state: GameState,
  playerId: string,
  max = 3,
): string {
  return assetSheetLine(state, playerId, max);
}

export function grantClaim(
  state: GameState,
  playerId: string,
  nodeId: string,
  opts?: {
    cashInvested?: number;
    rentCollected?: number;
    gusherCollected?: number;
    depot?: boolean;
  },
): void {
  const node = getNode(state.board, nodeId);
  if (!isPurchasable(node)) return;
  const next = state.players.find((p) => p.id === playerId);
  if (!next || next.eliminated) return;
  const prevId = state.owners[nodeId];
  if (prevId && prevId !== playerId) {
    const prev = state.players.find((p) => p.id === prevId);
    if (prev) {
      prev.properties = prev.properties.filter((id) => id !== nodeId);
      closeClaimBook(prev, nodeId);
      if (prev.ephemerisBodyId === nodeId) {
        prev.ephemerisBodyId = prev.properties[0] ?? null;
      }
    }
  }
  state.owners[nodeId] = playerId;
  if (!next.properties.includes(nodeId)) next.properties.push(nodeId);
  if (!next.ephemerisBodyId) next.ephemerisBodyId = nodeId;
  if (opts?.depot) state.stations[nodeId] = true;
  openClaimBook(next, nodeId, {
    listPrice: node.price ?? 0,
    cashInvested: opts?.cashInvested ?? node.price ?? 0,
    rentCollected: opts?.rentCollected ?? 0,
    gusherCollected: opts?.gusherCollected ?? 0,
    acquiredOnTurn: state.gameTurn,
  });
}

export function addLandingRight(player: Player, nodeId: string): void {
  player.landingRights[nodeId] = (player.landingRights[nodeId] ?? 0) + 1;
}

/**
 * Consume one docking-rights landing on this body.
 * @returns true if rent should be skipped.
 */
export function tryConsumeLandingRight(
  player: Player,
  nodeId: string,
): boolean {
  const n = player.landingRights[nodeId] ?? 0;
  if (n <= 0) return false;
  if (n <= 1) delete player.landingRights[nodeId];
  else player.landingRights[nodeId] = n - 1;
  return true;
}

export function livingRivals(state: GameState, sellerId: string): Player[] {
  return state.players.filter((p) => !p.eliminated && p.id !== sellerId);
}

export function nextAuctionBidder(
  state: GameState,
  auction: PendingAuction,
  afterId: string,
): string | null {
  const n = state.players.length;
  const start = state.players.findIndex((p) => p.id === afterId);
  if (start < 0) return null;
  for (let i = 1; i <= n; i++) {
    const p = state.players[(start + i) % n];
    if (!p || p.eliminated || p.id === auction.sellerId) continue;
    if (auction.bids[p.id] === undefined) return p.id;
  }
  return null;
}

/** Bid roll-call for the auction result card (seat order after the seller). */
export function formatAuctionBidSheet(
  state: GameState,
  auction: PendingAuction,
  winnerId: string | null,
): string {
  const start = state.players.findIndex((p) => p.id === auction.sellerId);
  const n = state.players.length;
  const lines: string[] = [];
  if (start < 0) return "";
  for (let i = 1; i <= n; i++) {
    const p = state.players[(start + i) % n];
    if (!p || p.id === auction.sellerId) continue;
    const bid = auction.bids[p.id];
    if (bid === undefined) continue;
    if (bid <= 0) lines.push(`${p.name}  passed`);
    else if (p.id === winnerId) lines.push(`${p.name}  ${formatMoney(bid)}  won`);
    else lines.push(`${p.name}  ${formatMoney(bid)}`);
  }
  return lines.join("\n");
}

export function formatAuctionResult(
  state: GameState,
  auction: PendingAuction,
  opts: {
    winnerId: string | null;
    price: number;
    tied: boolean;
  },
): { title: string; body: string } {
  const node = getNode(state.board, auction.nodeId);
  const seller = state.players.find((p) => p.id === auction.sellerId);
  const winner = opts.winnerId
    ? state.players.find((p) => p.id === opts.winnerId)
    : undefined;
  const human = state.players.find((p) => p.agent === "human" && !p.eliminated);
  const sheet = formatAuctionBidSheet(state, auction, opts.winnerId);
  const sheetBlock = sheet
    ? `\n\nBids (reserve ${formatMoney(auction.reserve)})\n${sheet}`
    : `\n\nReserve ${formatMoney(auction.reserve)}.`;
  const tieNote = opts.tied
    ? `\nTie at ${formatMoney(opts.price)} — next seat after the seller takes it.`
    : "";

  if (!opts.winnerId || !winner || !seller) {
    return {
      title: "Auction withdrawn",
      body: `No bid met the reserve (${formatMoney(auction.reserve)}) for ${node.name}.${sheetBlock}`,
    };
  }

  const humanBid = human ? (auction.bids[human.id] ?? 0) : 0;
  const humanWon = !!human && human.id === winner.id;
  const humanOutbid = !!human && human.id !== seller.id && humanBid > 0 && !humanWon;
  const title = humanWon ? "Won" : humanOutbid ? "Outbid" : "Claim sold";
  const lead = `${winner.name} takes ${node.name} for ${formatMoney(opts.price)}.`;
  const rights = `${seller.name} keeps docking rights for one landing.`;
  return {
    title,
    body: `${lead}\n${rights}${sheetBlock}${tieNote}`,
  };
}

/**
 * How much an AI seat bids (0 = pass). Reserve is the floor.
 * Completing a system or hub set bids up; easy seats often pass.
 */
export function chooseAuctionBid(
  state: GameState,
  bidder: Player,
  auction: PendingAuction,
): number {
  const reserve = auction.reserve;
  if (bidder.cash < reserve) return 0;
  const node = getNode(state.board, auction.nodeId);
  const difficulty = state.config.aiDifficulty;
  const keep = difficulty === "easy" ? 400 : difficulty === "expert" ? 80 : 150;
  const maxBid = bidder.cash - keep;
  if (maxBid < reserve) return 0;

  const sys = systemOfGroup(node.group);
  let completesSet = false;
  if (sys) {
    completesSet = sys.deedIds.every(
      (id) => id === auction.nodeId || state.owners[id] === bidder.id,
    );
  }
  const hubsNow = stationHubsOwned(state.owners, bidder.id);
  const bidderWouldGainHub =
    isStationHub(auction.nodeId) && state.owners[auction.nodeId] !== bidder.id;
  const completesHubs = bidderWouldGainHub && hubsNow >= 1;

  const price = node.price ?? reserve * 2;
  let want = 0;
  if (completesSet) {
    const mult = difficulty === "expert" ? 1.25 : difficulty === "hard" ? 1.1 : 0.95;
    want = Math.max(reserve, Math.floor(price * mult));
  } else if (completesHubs) {
    want = Math.max(reserve, Math.floor(price * (difficulty === "easy" ? 0.6 : 0.85)));
  } else if (difficulty === "easy") {
    const noise = unitNoise(state.rngState, bidder.id + auction.nodeId);
    want = noise > 0.72 ? reserve : 0;
  } else if (bidder.cash >= reserve + keep + 200) {
    const rent = node.rent ?? 0;
    if (isStationHub(auction.nodeId) || rent >= 50) want = reserve;
  }

  if (want <= 0) return 0;
  return Math.min(maxBid, Math.max(reserve, want));
}

function unitNoise(rngState: number, extra: string): number {
  let h = rngState | 0;
  for (let i = 0; i < extra.length; i++) {
    h = Math.imul(h ^ extra.charCodeAt(i), 0x9e3779b9);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export interface DossierClaimRow {
  nodeId: string;
  name: string;
  systemName: string;
  listPrice: number;
  cashInvested: number;
  rentCollected: number;
  gusherCollected: number;
  earnings: number;
  roi: number | null;
  rentNow: number;
  hasDepot: boolean;
  monopoly: boolean;
  hubMult: number;
  bankValue: number;
  isHub: boolean;
}

export interface DossierGroup {
  title: string;
  monopoly: boolean;
  owned: number;
  total: number;
  rows: DossierClaimRow[];
}

export interface DossierView {
  playerId: string;
  name: string;
  color: string;
  agent: Player["agent"];
  cash: number;
  fuel: number;
  maxFuel: number;
  netWorth: number;
  deedValue: number;
  depotValue: number;
  circuits: number;
  parkCount: number;
  propellant: Player["propellant"];
  positionName: string;
  eliminated: boolean;
  landingRights: { nodeId: string; name: string; remaining: number }[];
  hubCount: number;
  groups: DossierGroup[];
  canSell: boolean;
  auctionedThisTurn: string[];
}

export function buildDossierView(
  state: GameState,
  playerId: string,
  netWorthFn: (state: GameState, p: Player) => number,
): DossierView | null {
  const p = state.players.find((x) => x.id === playerId);
  if (!p) return null;
  const pos = getNode(state.board, p.position);
  let deedValue = 0;
  const rowsBySys = new Map<string, DossierClaimRow[]>();
  const ungrouped: DossierClaimRow[] = [];

  for (const nodeId of p.properties) {
    const node = getNode(state.board, nodeId);
    if (!isPurchasable(node)) continue;
    deedValue += node.price ?? 0;
    const book =
      p.claimBooks[nodeId] ??
      emptyClaimBook(node.price ?? 0, node.price ?? 0, 0);
    const sys = systemOfGroup(node.group);
    const monopoly =
      !!sys && hasSystemMonopoly(state.owners, p.id, sys.id as SystemId);
    const row: DossierClaimRow = {
      nodeId,
      name: node.name,
      systemName: sys?.name ?? "Other",
      listPrice: book.listPrice,
      cashInvested: book.cashInvested,
      rentCollected: book.rentCollected,
      gusherCollected: book.gusherCollected,
      earnings: claimEarnings(book),
      roi: claimRoi(book),
      rentNow: currentRent(state, nodeId, p.id),
      hasDepot: !!state.stations[nodeId],
      monopoly,
      hubMult: stationNetworkRentMult(state.owners, p.id, nodeId),
      bankValue: bankSellValue(node.price),
      isHub: isStationHub(nodeId),
    };
    if (sys) {
      const list = rowsBySys.get(sys.id) ?? [];
      list.push(row);
      rowsBySys.set(sys.id, list);
    } else {
      ungrouped.push(row);
    }
  }

  const groups: DossierGroup[] = [];
  for (const sys of Object.values(SYSTEMS)) {
    const rows = rowsBySys.get(sys.id);
    if (!rows?.length) continue;
    groups.push({
      title: sys.name,
      monopoly: hasSystemMonopoly(state.owners, p.id, sys.id),
      owned: rows.length,
      total: sys.deedIds.length,
      rows,
    });
  }
  if (ungrouped.length) {
    groups.push({
      title: "Other",
      monopoly: false,
      owned: ungrouped.length,
      total: ungrouped.length,
      rows: ungrouped,
    });
  }

  const stationsPlaced = p.properties.filter((id) => state.stations[id]).length;
  const landingRights = Object.entries(p.landingRights)
    .filter(([, n]) => n > 0)
    .map(([nodeId, remaining]) => ({
      nodeId,
      name: getNode(state.board, nodeId).name,
      remaining,
    }));

  const current = state.players[state.currentPlayerIndex];
  const sellPhase =
    state.phase === "await_action" || state.phase === "await_post_land";
  const canSell =
    !p.eliminated &&
    p.agent === "human" &&
    current?.id === p.id &&
    sellPhase &&
    !state.pendingAuction &&
    !state.pendingCharterChoice &&
    p.properties.length > 0;

  return {
    playerId: p.id,
    name: p.name,
    color: p.color,
    agent: p.agent,
    cash: p.cash,
    fuel: p.fuel,
    maxFuel: state.config.maxFuel,
    netWorth: netWorthFn(state, p),
    deedValue,
    depotValue: stationsPlaced * 500 + p.stationsInHand * 500,
    circuits: p.circuitsCompleted,
    parkCount: p.parkCount,
    propellant: p.propellant,
    positionName: pos.name,
    eliminated: p.eliminated,
    landingRights,
    hubCount: stationHubsOwned(state.owners, p.id),
    groups,
    canSell,
    auctionedThisTurn: [...(p.auctionedThisTurn ?? [])],
  };
}

export function formatRoiLine(row: DossierClaimRow): string {
  if (row.cashInvested <= 0) {
    return row.earnings > 0
      ? `no cash in · ${formatMoney(row.earnings)} earned`
      : "no cash in";
  }
  const pct = Math.round((row.earnings / row.cashInvested) * 100);
  return `${pct}% recovered (${formatMoney(row.earnings)} / ${formatMoney(row.cashInvested)})`;
}

export function hubNetworkLabel(hubCount: number): string {
  if (hubCount <= 0) return "no hubs";
  if (hubCount === 1) return `hubs 1/${STATION_HUB_IDS.length}`;
  if (hubCount === 2) return `hubs 2/${STATION_HUB_IDS.length} · hub rent ×2`;
  return `hubs 3/${STATION_HUB_IDS.length} · hub rent ×4`;
}
