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
  /** Skip this many full turns. */
  skipTurns: number;
  /** One-shot rent waivers vs owner player ids. */
  rentWaiversAgainst: string[];
  /** First purchasable claim id — ephemeris body for seeding. */
  ephemerisBodyId: string | null;
  /** True after leaving Earth until next full circuit completes. */
  circuitActive: boolean;
  /**
   * Neglect clock for feral (in “rotations”).
   * +1 when this pilot completes a full board circuit.
   * +1 per opponent circuit while this pilot is camping on Earth.
   */
  neglectClock: number;
}

export type TurnPhase =
  | "await_action"
  | "await_post_land"
  | "await_duel"
  | "game_over";

export interface GameConfig {
  playerCount: number;
  humanSeat: boolean;
  humanPropellant: PropellantId;
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
  lastRoll: LastRoll | null;
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
   * Overdue when owner.neglectClock - care >= FERAL_ROTATIONS.
   */
  claimCareRotations: Record<string, number>;
  winnerId: string | null;
  /** How the game ended, for end screen. */
  endReason: string | null;
  config: GameConfig;
  rngState: number;
}

export type PlayerAction =
  | { type: "refuel"; amount: number }
  | { type: "roll" }
  | { type: "buy" }
  | { type: "place_station" }
  | { type: "end_turn" }
  | { type: "duel_stance"; stance: DuelStance }
  | { type: "duel_roll" };

export interface LegalActions {
  refuel: boolean;
  refuelMax: number;
  refuelCostPer: number;
  roll: boolean;
  buy: boolean;
  buyPrice: number;
  placeStation: boolean;
  endTurn: boolean;
  leaveBurnPreview: number;
  duelStance: boolean;
  duelRoll: boolean;
}
