/** Pure domain types — no DOM / Node UI. */

export type NodeKind =
  | "space"
  | "planet"
  | "moon"
  | "federation"
  | "dock"
  | "gravity";

/** 0 = no leave burn; 1 low … 4 extreme well. */
export type GravityClass = 0 | 1 | 2 | 3 | 4;

export type PropellantId = "methane" | "hydrogen";

export type DuelStance = "low" | "high";

export type EphemerisStat = "nearest" | "furthest" | "average";

export interface BoardNode {
  id: string;
  name: string;
  kind: NodeKind;
  next: string[];
  x: number;
  y: number;
  /** Orbital ring index for drawing (0 = innermost). */
  ring?: number;
  price?: number;
  rent?: number;
  group?: string;
  landingBonus?: number;
  fuelToLeave?: boolean;
  gravityClass?: GravityClass;
  refuel?: "free" | "paid" | "station" | "none";
  /** Visual tag for moon colors etc. */
  paint?: "jupiter-moon" | "saturn-moon";
}

export interface Board {
  nodes: Record<string, BoardNode>;
  startId: string;
  /** Distinct ring radii used for orbital drawing (normalized). */
  rings: number[];
}

export type AgentKind = "human" | "ai";

/**
 * Table setting at Launch (#87 / #135). Player-facing name is Game difficulty.
 * Sets expedition length, ledger kindness, and rival skill.
 * Legacy "difficult" maps to hard.
 */
export type AiDifficulty = "easy" | "normal" | "hard" | "expert";

/** Normalize config / UI values (legacy "difficult" → hard). */
export function normalizeAiDifficulty(
  raw: string | undefined | null,
): AiDifficulty {
  if (raw === "easy" || raw === "normal" || raw === "hard" || raw === "expert") {
    return raw;
  }
  if (raw === "difficult") return "hard";
  return "normal";
}

/** Mainline travel facing (#47 palindrome unlock). */
export type MoveDirection = "forward" | "backward";

/** Oregon Trail–style mid-game interrupt (leak, gusher, later disasters). */
export interface GameAnnouncement {
  kind: "gusher" | "leak" | "info" | "out";
  /** Deadpan headline, e.g. "OUT!" */
  title: string;
  /** One or two stark lines of body text. */
  body: string;
}

/** Human/AI must pick a target after some charter alerts (#107). */
export type CharterChoiceKind =
  | "vibe_kick"
  | "olbers_station"
  | "blockchain_steal";

export interface PendingCharterChoice {
  kind: CharterChoiceKind;
  /** Pilot who chooses. */
  chooserId: string;
}

/** Running books for one claim while the current owner holds it. */
export interface ClaimBook {
  /** Deed list price when acquired. */
  listPrice: number;
  /** Cash paid for the deed (0 if gifted/stolen) plus later depot cash. */
  cashInvested: number;
  rentCollected: number;
  gusherCollected: number;
  acquiredOnTurn: number;
}

/**
 * Sim-only running totals per claimable node (#127 / #142).
 * Survives ownership transfers so batch books are property-centric.
 */
export interface PropertyLedgerRow {
  nodeId: string;
  invested: number;
  rentCollected: number;
  /** Fuel-strike cash on this body; omitted on older ledgers. */
  strikesCollected?: number;
  landings: number;
  claims: number;
}

export type PropertyLedger = Record<string, PropertyLedgerRow>;

/** Seller-started table auction; reserve is the seller's ask, ≥ bank half-price. */
export interface PendingAuction {
  sellerId: string;
  nodeId: string;
  /** Seller-chosen ask (clamped to [mark, deed]); bids must be >= this. */
  reserve: number;
  /** playerId → bid; 0 = pass. Missing = not yet bid. */
  bids: Record<string, number>;
  /** Next living rival who must bid (not the seller). */
  awaitingBidderId: string | null;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  agent: AgentKind;
  cash: number;
  fuel: number;
  position: string;
  propellant: PropellantId;
  properties: string[];
  /**
   * Per-claim books for the current ownership period (ROI on the dossier).
   * Closed when the claim leaves this rocket (sell, auction, feral, steal, out).
   */
  claimBooks: Record<string, ClaimBook>;
  /**
   * Remaining free landings on a body after selling it at auction
   * (property-specific; survives later owners).
   */
  landingRights: Record<string, number>;
  /**
   * Claim ids listed at auction this seat (sold or withdrawn).
   * Each body may be auctioned at most once per turn; other claims may still list.
   */
  auctionedThisTurn: string[];
  stationsInHand: number;
  eliminated: boolean;
  /** Shared `gameTurn` when eliminated (log); null if still flying. */
  eliminatedOnTurn: number | null;
  /** `round` when eliminated (end screen / player-facing). */
  eliminatedOnRound: number | null;
  /** Short cause for postmortem (rent, strand, …). */
  eliminatedReason: string | null;
  /** Skip this many full turns. */
  skipTurns: number;
  /** One-shot rent waivers vs owner player ids. */
  rentWaiversAgainst: string[];
  /** First purchasable claim id — ephemeris body for seeding. */
  ephemerisBodyId: string | null;
  /** True after leaving Earth until next full circuit completes. */
  circuitActive: boolean;
  /**
   * Full board rotations this pilot has finished (Earth return after leave).
   * Scales Earth land/pass pay (+10 each) and decade bonuses at 10, 20, 30…
   */
  circuitsCompleted: number;
  /** True if they rolled on the current turn. */
  rolledThisTurn: boolean;
  /** True if they advanced along the path this turn. */
  movedThisTurn: boolean;
  /**
   * Cumulative parks (no-move seat turns, including duel skips).
   * At 5+: each claim may go feral; chance closes half the gap to 100% each park after (#92).
   */
  parkCount: number;
  /**
   * H₂ (or leave-risk) tank stress rolled true on a non-body landing
   * (transit / station). Fires on the next planet/moon insertion.
   */
  pendingLeak: boolean;
  /**
   * Timed charter: Monolith — next Earth land or pass pays +300 once, then clears.
   */
  monolithEarthPending: boolean;
  /**
   * Timed charter: free brake token — next break (≥1 space) costs 0 fuel.
   * Expires unused at end of this rocket's seat turn.
   */
  freeBreakPending: boolean;
  /**
   * Timed charter: King's Quest warp charges (click any board node instead of roll).
   * Each charge is one teleport; unused charges persist until used.
   */
  warpCharges: number;
  /**
   * Timed charter: free leave burn once (e.g. comet dust / undock hail).
   * Next departure from a gravity well costs 0 fuel, then clears.
   */
  freeLeavePending: boolean;
  /**
   * Timed charter: next rent due is waived once (any owner), then clears.
   * Checked before Gravity Duel free-pass list.
   */
  nextRentWaived: boolean;
  /**
   * Fuel depots placed since last Earth circuit complete (or game start).
   * First depot this circuit is free; further ones cost cash (#45 Option C).
   */
  depotsPlacedThisCircuit: number;
  /**
   * Hidden #47: true if rocket name is a palindrome → may set moveDirection.
   */
  canBidirectional: boolean;
  /** Mainline facing; permanent after first move when bidirectional. */
  moveDirection: MoveDirection;
  /** After first Move action, direction cannot change (whole charter). */
  directionLocked: boolean;
}

export type TurnPhase =
  | "await_action"
  | "await_move" // rolled; choose break then move
  | "await_post_land"
  | "await_duel"
  | "game_over";

export interface GameConfig {
  playerCount: number;
  humanSeat: boolean;
  /** Display name for the human seat (ignored if humanSeat is false). */
  humanName: string;
  humanPropellant: PropellantId;
  /** Heuristic AI skill: easy | normal | hard | expert (#87). */
  aiDifficulty: AiDifficulty;
  startingCash: number;
  startingFuel: number;
  stationsEach: number;
  maxFuel: number;
  maxRounds: number;
  seed?: number;
}

export interface LastRoll {
  d1: number;
  d2: number;
  total: number;
  doubles: boolean;
}

/** Pending Gravity Duel (dice) on a transit node. */
export interface PendingDuel {
  nodeId: string;
  /** Arriving pilot (challenger). */
  challengerId: string;
  /** Defender (occupant / last roller / champion). */
  defenderId: string;
  challengerStance: DuelStance | null;
  defenderStance: DuelStance | null;
  challengerRoll: LastRoll | null;
  defenderRoll: LastRoll | null;
}

/** Per-transit-node memory after duels. */
export interface NodeEncounterMem {
  /** Last pilot who rolled in a duel here (tie → used as next defender). */
  lastRollerId: string | null;
  /** Last decisive winner, if any. */
  championId: string | null;
}

/** Snapshot for duel result UI (cleared after display). */
export interface DuelResult {
  nodeName: string;
  challengerName: string;
  defenderName: string;
  challengerStance: DuelStance;
  defenderStance: DuelStance;
  challengerRoll: LastRoll;
  defenderRoll: LastRoll;
  mean: number;
  outcome: "win" | "tie";
  winnerName: string | null;
  loserName: string | null;
  summary: string;
}

export interface GameState {
  board: Board;
  players: Player[];
  owners: Record<string, string>;
  stations: Record<string, boolean>;
  currentPlayerIndex: number;
  phase: TurnPhase;
  round: number;
  /**
   * Shared charter clock: increments once per pilot seat turn
   * (skipped seats still tick). See turnClock.ts / decision log.
   */
  gameTurn: number;
  lastRoll: LastRoll | null;
  /** Spaces of break (slowdown) after roll, before move. */
  breakSpaces: number;
  log: string[];
  /** Structured +/- lines for the pilot whose turn just ended / is active. */
  turnDeltas: string[];
  /** History of 2d6 totals this game (movement + duels). */
  diceTotals: number[];
  pendingDuel: PendingDuel | null;
  /** Last resolved duel for UI ceremony */
  lastDuelResult: DuelResult | null;
  /** nodeId → encounter memory */
  encounterMem: Record<string, NodeEncounterMem>;
  /** Total circuits completed by anyone (display / stats). */
  boardRotations: number;
  winnerId: string | null;
  /** How the game ended, for end screen. */
  endReason: string | null;
  /**
   * Bodies that already paid a gusher bonus (one strike per claim node).
   */
  gusherPaid: Record<string, boolean>;
  /**
   * Per-node cash ledger for Sim Lab ROI (#127).
   * Allocated by the batch harness; omitted in live play.
   */
  propertyLedger?: PropertyLedger;
  /** Pending Oregon Trail–style popup; UI shows then clears. */
  pendingAnnouncement: GameAnnouncement | null;
  /**
   * After some alerts, chooser must pick a target (standings / board).
   * Blocks normal actions until resolved (#107).
   */
  pendingCharterChoice: PendingCharterChoice | null;
  /** Seller-started claim auction (blocks other seat actions until resolved). */
  pendingAuction: PendingAuction | null;
  /**
   * Timed charter-alert cadence (**rounds**, not seat turns).
   * After 5 rounds: 50%; each miss splits the difference toward 100%;
   * on fire, wait 5 rounds again.
   */
  timedEvent: {
    /** Completed rounds since last fire (or game start). */
    roundsSinceLast: number;
    /** Last `state.round` we already processed (avoid multi-fire per round). */
    lastProcessedRound: number;
    /** Current roll chance once in the active window (0 during gap). */
    rollChance: number;
    /** Last fired pool event id (legacy / UI). */
    lastEventId: string | null;
    /** Event ids already announced this charter — each pool event at most once. */
    firedIds: string[];
    /**
     * One-shot rare check for vibe-code kick at round ≥60 (#107).
     * True once the 50% roll has been attempted (hit or miss).
     */
    vibeKickChecked: boolean;
    /**
     * Earth land + pass count this charter (Kostka clock, not the round pool).
     * After 5 transits, later **landings** roll 30% then +10% per miss.
     */
    earthTransits: number;
    /** Kostka landing chance once the transit gap has passed; 0 = not armed. */
    kostkaChance: number;
  };
  config: GameConfig;
  rngState: number;
}

export type PlayerAction =
  | { type: "refuel"; amount: number }
  | { type: "roll" }
  | { type: "set_break"; spaces: number }
  | { type: "move" }
  | { type: "buy" }
  | { type: "sell"; nodeId: string }
  /**
   * Put a claim up to the table. Optional reserve is the seller's ask;
   * the engine clamps it to [bank half-price mark, deed list price].
   */
  | { type: "auction_start"; nodeId: string; reserve?: number }
  /** Bid on pendingAuction (0 = pass). Bidder is awaitingBidderId, not necessarily the seat. */
  | { type: "auction_bid"; amount: number }
  | { type: "place_station" }
  | { type: "end_turn" }
  | { type: "duel_stance"; stance: DuelStance }
  | { type: "duel_roll" }
  /** One-time charter warp: teleport to destination node (no en-route). */
  | { type: "warp"; destination: string }
  /** Palindrome #47: set Mainline facing before first move. */
  | { type: "set_direction"; direction: MoveDirection }
  /** Charter alert picks (#107). */
  | { type: "charter_kick"; targetPlayerId: string }
  | { type: "charter_olbers"; stationId: string }
  | { type: "charter_steal"; nodeId: string };

export interface LegalActions {
  refuel: boolean;
  refuelMax: number;
  refuelCostPer: number;
  roll: boolean;
  move: boolean;
  /** Spaces to shave off the roll (0 … lastRoll.total). */
  maxBreak: number;
  breakSpaces: number;
  /** Fuel cost for current break (0.5 per space). */
  breakFuelCost: number;
  buy: boolean;
  buyPrice: number;
  sell: boolean;
  sellNodeId: string | null;
  sellValue: number;
  /** Bank-dump / auction candidates this seat (empty if already sold this turn). */
  sellClaims: { nodeId: string; value: number }[];
  /** May start a table auction (await_action / await_post_land, rivals exist). */
  canAuction: boolean;
  placeStation: boolean;
  /** Cash to place a depot now (0 if first this circuit). */
  placeStationCost: number;
  endTurn: boolean;
  leaveBurnPreview: number;
  duelStance: boolean;
  duelRoll: boolean;
  /**
   * King's Quest warp: human clicks a board node; AI picks a destination.
   * Only in await_action with warpCharges > 0.
   */
  warp: boolean;
  /** May change moveDirection (palindrome, not locked yet). */
  setDirection: boolean;
  moveDirection: MoveDirection;
  directionLocked: boolean;
  canBidirectional: boolean;
}
