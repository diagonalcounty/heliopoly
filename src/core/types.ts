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

/** AI seat skill — set at New game. */
export type AiDifficulty = "normal" | "difficult";

/** Oregon Trail–style mid-game interrupt (leak, gusher, later disasters). */
export interface GameAnnouncement {
  kind: "gusher" | "leak" | "info" | "out";
  /** Deadpan headline, e.g. "OUT!" */
  title: string;
  /** One or two stark lines of body text. */
  body: string;
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
  /**
   * Legacy circuit neglect (still incremented on Earth loops / skippers).
   * Does **not** drive feral — parking `parkCount` does. Kept for logs/compat.
   */
  neglectClock: number;
  /** True if this pilot ended their last turn without rolling. */
  skippedRoll: boolean;
  /** True if they rolled on the current turn. */
  rolledThisTurn: boolean;
  /** True if they advanced along the path this turn. */
  movedThisTurn: boolean;
  /**
   * Cumulative parks (no-move seat turns, including duel skips).
   * At 5+: each claim may go feral; chance doubles each park after.
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
  /** Heuristic AI aggression (break for advantage on difficult). */
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
  /**
   * Per claim: owner.neglectClock at last visit / purchase / depot.
   * Legacy care stamp — not used by parking feral checks.
   */
  claimCareRotations: Record<string, number>;
  winnerId: string | null;
  /** How the game ended, for end screen. */
  endReason: string | null;
  /**
   * Bodies that already paid a gusher bonus (one strike per claim node).
   */
  gusherPaid: Record<string, boolean>;
  /** Pending Oregon Trail–style popup; UI shows then clears. */
  pendingAnnouncement: GameAnnouncement | null;
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
  | { type: "place_station" }
  | { type: "end_turn" }
  | { type: "duel_stance"; stance: DuelStance }
  | { type: "duel_roll" };

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
  placeStation: boolean;
  endTurn: boolean;
  leaveBurnPreview: number;
  duelStance: boolean;
  duelRoll: boolean;
}
