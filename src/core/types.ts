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

export interface BoardNode {
  id: string;
  name: string;
  kind: NodeKind;
  /** Next node ids along the directed flight path. Usually length 1. */
  next: string[];
  /** Normalized board coords for rendering (0–1). */
  x: number;
  y: number;
  /** Deed price if purchasable. */
  price?: number;
  /** Base rent if purchasable. */
  rent?: number;
  /** Property group for monopoly multipliers. */
  group?: string;
  /** Cash paid by bank on landing (station / Earth bonus). */
  landingBonus?: number;
  /**
   * If true, leaving this node costs fuel (insertion is always free).
   * Prefer setting via gravityClass > 0.
   */
  fuelToLeave?: boolean;
  /** Gravity of the body for leave-burn calc. */
  gravityClass?: GravityClass;
  /** Fuel available for free/paid refuel on this node type (handled in rules). */
  refuel?: "free" | "paid" | "station" | "none";
}

export interface Board {
  nodes: Record<string, BoardNode>;
  startId: string;
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
  /** Property node ids owned. */
  properties: string[];
  /** Fuel stations still in hand (not yet placed). */
  stationsInHand: number;
  eliminated: boolean;
}

export type TurnPhase =
  | "await_action" // refuel / roll
  | "await_post_land" // buy / station / end
  | "game_over";

export interface GameConfig {
  playerCount: number;
  /** If true, player 0 is human; rest AI. If false, all AI. */
  humanSeat: boolean;
  /** Propellant for human seat (ignored if no human). */
  humanPropellant: PropellantId;
  startingCash: number;
  startingFuel: number;
  stationsEach: number;
  maxFuel: number;
  /** Max full rounds before richest living player wins (0 = no limit). */
  maxRounds: number;
  seed?: number;
}

export interface LastRoll {
  d1: number;
  d2: number;
  total: number;
  doubles: boolean;
}

export interface GameState {
  board: Board;
  players: Player[];
  /** Node id → owner player id */
  owners: Record<string, string>;
  /** Node id → has fuel station */
  stations: Record<string, boolean>;
  currentPlayerIndex: number;
  phase: TurnPhase;
  round: number;
  lastRoll: LastRoll | null;
  log: string[];
  winnerId: string | null;
  config: GameConfig;
  /** RNG state for reproducibility */
  rngState: number;
}

export type PlayerAction =
  | { type: "refuel"; amount: number }
  | { type: "roll" }
  | { type: "buy" }
  | { type: "place_station" }
  | { type: "end_turn" };

export interface LegalActions {
  refuel: boolean;
  refuelMax: number;
  refuelCostPer: number;
  roll: boolean;
  buy: boolean;
  buyPrice: number;
  placeStation: boolean;
  endTurn: boolean;
  /** Preview leave burn if rolling `forSteps` (default last roll or typical 7). */
  leaveBurnPreview: number;
}
