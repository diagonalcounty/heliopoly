/**
 * Urinal-rule Parking — Tower mode with escalating stages (#292).
 *
 * Five stages that progressively introduce wider buffer gaps, ship
 * departures, and a timer. The player fills bars to promote through
 * stages; 2 bars per stage advance to the next. Clearances (lives)
 * start at 3, cap at 5, and restore 1 on promotion.
 *
 * The grading rule: among vacant pads with no occupied neighbor within
 * `gap` distance, pick the one farthest from the nearest occupied pad.
 * Ties go to the lowest index (hatch-nearest). When every vacant pad
 * touches an occupied pad, the lowest vacant index is the answer and
 * the park is "tight" (no penalty, just harder).
 *
 * All stages are 1D.
 */

export const URP_TOWER_TITLE = "U.R.P.";
export const URP_TOWER_BLURB =
  "Park rockets on the apron. Leave a gap between them. The gap gets wider and rockets start departing. How far can you get?";

// ── Constants ────────────────────────────────────────────────────────

export const URP_BARS_TO_PROMOTE = 2;
export const URP_MAX_CLEARANCES = 5;
export const URP_START_CLEARANCES = 3;
export const URP_BASE_TIMER = 15000;
export const URP_ROUNDS_PER_SIZE = 3;
export const URP_STAGE_COUNT = 5;

// ── Stage config ─────────────────────────────────────────────────────

export interface UrpStageConfig {
  /** 1-based stage id. */
  id: number;
  name: string;
  /** Required empty pads between any two ships. */
  gap: number;
  /** Departure frequency: 0 = none; N = every N correct parks. */
  dep: number;
  timed: boolean;
  /** Minimum pad count at this stage. */
  mn: number;
  /** Maximum pad count at this stage. */
  mx: number;
  /** Base bar quota (grows with barsCompleted). */
  bb: number;
}

export const URP_STAGES: readonly UrpStageConfig[] = [
  { id: 1, name: "Gap One",       gap: 1, dep: 0, timed: false, mn: 4,  mx: 8,  bb: 3 },
  { id: 2, name: "Double Buffer", gap: 2, dep: 0, timed: false, mn: 5,  mx: 9,  bb: 4 },
  { id: 3, name: "Departures",    gap: 2, dep: 3, timed: false, mn: 6,  mx: 10, bb: 4 },
  { id: 4, name: "Triple Buffer", gap: 3, dep: 2, timed: true,  mn: 7,  mx: 10, bb: 5 },
  { id: 5, name: "Full Pressure", gap: 3, dep: 1, timed: true,  mn: 8,  mx: 12, bb: 5 },
] as const;

// ── Types ────────────────────────────────────────────────────────────

export type UrpTowerPhase = "playing" | "promoting" | "over";
export type UrpTowerNote =
  | "ask"
  | "taken"
  | "parked"
  | "wrong"
  | "timeout"
  | "over"
  | "next"
  | "bar"
  | "promote";
export type UrpTowerSfx = "ok" | "bad" | "bar" | "promote" | "over" | "dep" | null;

export interface UrpTowerState {
  seed: number;
  stageIndex: number;
  screen: number;
  padCount: number;
  occupied: readonly number[];
  /** Pads the player parked this screen (for departure candidate filtering). */
  playerParked: readonly number[];
  /** How many ships this screen asks for. */
  asks: number;
  /** How many ships already parked this screen. */
  step: number;
  depCounter: number;
  clearances: number;
  score: number;
  /** Total parks across the whole run. */
  parks: number;
  stageParks: number;
  barFill: number;
  /** Bars completed within the current stage (resets on promotion). */
  barsCompleted: number;
  phase: UrpTowerPhase;
  sizeIndex: number;
  round: number;
  timerMs: number;
  isFirstScreen: boolean;
  note: UrpTowerNote;
  lastParked: number | null;
  lastPoints: number;
  tightPark: boolean;
  /** The correct pad index, set on wrong answer for the UI to highlight. */
  correctIndex: number | null;
  /** A pad that should depart before the next player action. */
  pendingDeparture: number | null;
}

export interface UrpAssignResult {
  state: UrpTowerState;
  accepted: boolean;
  sfx: UrpTowerSfx;
}

// ── PRNG ─────────────────────────────────────────────────────────────

export function stepUrpRng(rng: number): { value: number; rng: number } {
  let a = rng >>> 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, rng: a >>> 0 };
}

function mkRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mixSeed(seed: number, screen: number): number {
  const mixed = (seed ^ Math.imul(screen, 0x9e3779b1)) >>> 0;
  return mixed === 0 ? 1 : mixed;
}

// ── Grading ──────────────────────────────────────────────────────────

function minDist(index: number, occupied: readonly number[]): number {
  if (occupied.length === 0) return Number.POSITIVE_INFINITY;
  let min = Number.POSITIVE_INFINITY;
  for (const o of occupied) {
    const d = Math.abs(o - index);
    if (d < min) min = d;
  }
  return min;
}

function hasNeighborWithinGap(
  index: number,
  occupied: ReadonlySet<number>,
  gap: number,
): boolean {
  for (const o of occupied) {
    if (Math.abs(index - o) <= gap) return true;
  }
  return false;
}

/**
 * Correct vacant pad for the tower grading rule, or null when full.
 *
 * @param gap — required empty distance between any two ships (stage-dependent)
 */
export function gradeTower(
  padCount: number,
  occupied: readonly number[],
  gap: number = 1,
): { index: number; tight: boolean } | null {
  const occSet = new Set(occupied.filter((i) => i >= 0 && i < padCount));
  const vacant: number[] = [];
  for (let i = 0; i < padCount; i++) {
    if (!occSet.has(i)) vacant.push(i);
  }
  if (vacant.length === 0) return null;

  const buffered = vacant.filter((i) => !hasNeighborWithinGap(i, occSet, gap));
  const pool = buffered.length > 0 ? buffered : vacant;
  const tight = buffered.length === 0 && occSet.size > 0;

  let best = pool[0]!;
  let bestDist = minDist(best, occupied);
  for (let k = 1; k < pool.length; k++) {
    const i = pool[k]!;
    const d = minDist(i, occupied);
    if (d > bestDist || (d === bestDist && i < best)) {
      best = i;
      bestDist = d;
    }
  }
  return { index: best, tight };
}

// ── Helpers ──────────────────────────────────────────────────────────

export function stageConfig(state: UrpTowerState): UrpStageConfig {
  return URP_STAGES[state.stageIndex]!;
}

export function barQuota(stage: UrpStageConfig, barsCompleted: number): number {
  return stage.bb + barsCompleted;
}

export function pointsForStage(stageIndex: number): number {
  return (stageIndex + 1) * 100;
}

// ── Screen generation ────────────────────────────────────────────────

interface ScreenLayout {
  padCount: number;
  occupied: readonly number[];
  asks: number;
}

export function firstScreenFor(stageIndex: number): ScreenLayout {
  switch (stageIndex) {
    case 0: return { padCount: 4, occupied: [0], asks: 1 };
    case 1: return { padCount: 6, occupied: [0], asks: 1 };
    case 2: return { padCount: 7, occupied: [0, 6], asks: 1 };
    case 3: return { padCount: 8, occupied: [0], asks: 1 };
    case 4: return { padCount: 9, occupied: [0, 8], asks: 1 };
    default: return { padCount: 4, occupied: [0], asks: 1 };
  }
}

export function generateScreen(
  seed: number,
  screen: number,
  stage: UrpStageConfig,
  sizeIndex: number,
  round: number,
): ScreenLayout {
  const rnd = mkRng(mixSeed(seed, screen));
  const padCount = Math.min(stage.mx, stage.mn + sizeIndex);
  const asks = Math.min(round, Math.max(1, padCount - 3));
  const maxOcc = Math.max(1, padCount - asks - 1);
  const minOcc = Math.max(1, Math.floor(padCount * 0.2));
  const occN = minOcc + Math.floor(rnd() * Math.max(1, maxOcc - minOcc + 1));

  const idx = Array.from({ length: padCount }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j]!, idx[i]!];
  }
  const occupied = idx.slice(0, occN).sort((a, b) => a - b);

  const g = gradeTower(padCount, occupied, stage.gap);
  if (!g) {
    occupied.shift();
  }

  return { padCount, occupied, asks };
}

// ── State construction ───────────────────────────────────────────────

function screenState(
  base: Omit<UrpTowerState, "padCount" | "occupied" | "playerParked" | "asks" | "step" | "depCounter" | "pendingDeparture">,
  layout: ScreenLayout,
): UrpTowerState {
  return {
    ...base,
    padCount: layout.padCount,
    occupied: layout.occupied,
    playerParked: [],
    asks: layout.asks,
    step: 0,
    depCounter: 0,
    pendingDeparture: null,
  };
}

export function startUrpTower(seed: number = (Date.now() ^ 0xa1b2) >>> 0): UrpTowerState {
  const layout = firstScreenFor(0);
  return screenState(
    {
      seed: seed >>> 0,
      stageIndex: 0,
      screen: 1,
      clearances: URP_START_CLEARANCES,
      score: 0,
      parks: 0,
      stageParks: 0,
      barFill: 0,
      barsCompleted: 0,
      phase: "playing",
      sizeIndex: 0,
      round: 1,
      timerMs: URP_BASE_TIMER,
      isFirstScreen: true,
      note: "ask",
      lastParked: null,
      lastPoints: 0,
      tightPark: false,
      correctIndex: null,
    },
    layout,
  );
}

// ── Actions ──────────────────────────────────────────────────────────

function pickDepartureCandidate(
  occupied: readonly number[],
  playerParked: readonly number[],
  seed: number,
  screen: number,
  step: number,
): number | null {
  const ppSet = new Set(playerParked);
  const candidates = occupied.filter((i) => !ppSet.has(i));
  const pool = candidates.length > 0 ? candidates : [...occupied];
  if (pool.length <= 1) return null;
  const rnd = mkRng(mixSeed(seed, screen * 1000 + step));
  return pool[Math.floor(rnd() * pool.length)]!;
}

export function assignUrpTower(state: UrpTowerState, index: number): UrpAssignResult {
  if (state.phase !== "playing") return { state, accepted: false, sfx: null };

  if (index < 0 || index >= state.padCount || state.occupied.includes(index)) {
    return {
      state: { ...state, note: "taken", correctIndex: null },
      accepted: false,
      sfx: null,
    };
  }

  const stage = stageConfig(state);
  const grade = gradeTower(state.padCount, state.occupied, stage.gap);
  if (!grade) return { state, accepted: false, sfx: null };

  if (grade.index !== index) {
    const clearances = state.clearances - 1;
    return {
      state: {
        ...state,
        clearances,
        phase: clearances <= 0 ? "over" : "playing",
        note: clearances <= 0 ? "over" : "wrong",
        lastParked: null,
        lastPoints: 0,
        tightPark: false,
        correctIndex: grade.index,
      },
      accepted: true,
      sfx: clearances <= 0 ? "over" : "bad",
    };
  }

  // Correct park
  const pts = pointsForStage(state.stageIndex);
  const occupied = [...state.occupied, index].sort((a, b) => a - b);
  const playerParked = [...state.playerParked, index];
  const step = state.step + 1;
  const parks = state.parks + 1;
  const stageParks = state.stageParks + 1;
  const score = state.score + pts;
  let barFill = state.barFill + 1;
  let barsCompleted = state.barsCompleted;
  const quota = barQuota(stage, barsCompleted);
  let barDone = false;
  if (barFill >= quota) {
    barFill -= quota;
    barsCompleted++;
    barDone = true;
  }

  const shouldPromote =
    barDone &&
    state.stageIndex < URP_STAGE_COUNT - 1 &&
    barsCompleted >= URP_BARS_TO_PROMOTE;

  if (shouldPromote) {
    return {
      state: {
        ...state,
        occupied,
        playerParked,
        step,
        score,
        parks,
        stageParks,
        barFill,
        barsCompleted,
        phase: "promoting",
        note: "promote",
        lastParked: index,
        lastPoints: pts,
        tightPark: grade.tight,
        correctIndex: null,
        pendingDeparture: null,
      },
      accepted: true,
      sfx: "promote",
    };
  }

  // Check for departure
  let pendingDeparture: number | null = null;
  let depCounter = state.depCounter;
  if (stage.dep > 0) {
    depCounter++;
    if (depCounter >= stage.dep && occupied.length > 1) {
      depCounter = 0;
      pendingDeparture = pickDepartureCandidate(
        occupied,
        playerParked,
        state.seed,
        state.screen,
        step,
      );
    }
  }

  // Screen done?
  const screenDone = step >= state.asks && pendingDeparture === null;

  if (screenDone) {
    const nextScreen = state.screen + 1;
    let nextRound = state.round + 1;
    let nextSizeIndex = state.sizeIndex;
    if (nextRound > URP_ROUNDS_PER_SIZE) {
      nextRound = 1;
      nextSizeIndex++;
    }
    const nextLayout = generateScreen(
      state.seed,
      nextScreen,
      stage,
      nextSizeIndex,
      nextRound,
    );

    return {
      state: screenState(
        {
          ...state,
          screen: nextScreen,
          score,
          parks,
          stageParks,
          barFill,
          barsCompleted,
          sizeIndex: nextSizeIndex,
          round: nextRound,
          isFirstScreen: false,
          note: "next",
          lastParked: index,
          lastPoints: pts,
          tightPark: grade.tight,
          correctIndex: null,
        },
        nextLayout,
      ),
      accepted: true,
      sfx: barDone ? "bar" : "ok",
    };
  }

  return {
    state: {
      ...state,
      occupied,
      playerParked,
      step,
      score,
      parks,
      stageParks,
      barFill,
      barsCompleted,
      depCounter,
      note: barDone ? "bar" : "parked",
      lastParked: index,
      lastPoints: pts,
      tightPark: grade.tight,
      correctIndex: null,
      pendingDeparture,
    },
    accepted: true,
    sfx: barDone ? "bar" : "ok",
  };
}

/** Remove the departing ship from the board. Call after departure animation. */
export function acknowledgeDeparture(state: UrpTowerState): UrpTowerState {
  if (state.pendingDeparture === null) return state;
  const dep = state.pendingDeparture;
  const occupied = state.occupied.filter((i) => i !== dep);
  const playerParked = state.playerParked.filter((i) => i !== dep);

  // If screen is now done after departure, advance
  if (state.step >= state.asks) {
    const stage = stageConfig(state);
    const nextScreen = state.screen + 1;
    let nextRound = state.round + 1;
    let nextSizeIndex = state.sizeIndex;
    if (nextRound > URP_ROUNDS_PER_SIZE) {
      nextRound = 1;
      nextSizeIndex++;
    }
    const nextLayout = generateScreen(
      state.seed,
      nextScreen,
      stage,
      nextSizeIndex,
      nextRound,
    );

    return screenState(
      {
        ...state,
        screen: nextScreen,
        sizeIndex: nextSizeIndex,
        round: nextRound,
        isFirstScreen: false,
        note: "next",
        correctIndex: null,
      },
      nextLayout,
    );
  }

  return {
    ...state,
    occupied,
    playerParked,
    pendingDeparture: null,
    note: "ask",
  };
}

/** Transition from "promoting" to the next stage. Call after promotion overlay. */
export function acknowledgePromotion(state: UrpTowerState): UrpTowerState {
  if (state.phase !== "promoting") return state;
  const nextStageIndex = state.stageIndex + 1;
  const layout = firstScreenFor(nextStageIndex);
  return screenState(
    {
      ...state,
      stageIndex: nextStageIndex,
      screen: 1,
      clearances: Math.min(URP_MAX_CLEARANCES, state.clearances + 1),
      barsCompleted: 0,
      barFill: 0,
      stageParks: 0,
      sizeIndex: 0,
      round: 1,
      timerMs: URP_BASE_TIMER,
      isFirstScreen: true,
      phase: "playing",
      note: "ask",
      lastParked: null,
      lastPoints: 0,
      tightPark: false,
      correctIndex: null,
      score: state.score,
      parks: state.parks,
      seed: state.seed,
    },
    layout,
  );
}

/** Timer expired. Costs 1 clearance. */
export function handleTimeout(state: UrpTowerState): UrpTowerState {
  if (state.phase !== "playing") return state;
  const clearances = state.clearances - 1;
  return {
    ...state,
    clearances,
    phase: clearances <= 0 ? "over" : "playing",
    note: clearances <= 0 ? "over" : "timeout",
    lastParked: null,
    lastPoints: 0,
    tightPark: false,
    correctIndex: null,
  };
}

// ── Format functions ─────────────────────────────────────────────────

const RULE_TEXT: Record<number, string> = {
  1: "Leave 1 empty",
  2: "Leave 2 empty",
  3: "Leave 3 empty",
};

export function urpRuleText(gap: number): string {
  return RULE_TEXT[gap] ?? `Leave ${gap} empty`;
}

export function urpStageHint(stageIndex: number): string {
  switch (stageIndex) {
    case 0: return "Leave a gap between rockets";
    case 1: return "Now leave two empty pads";
    case 2: return "Rockets depart between your parks";
    case 3: return "Leave three empty pads. Clock is ticking.";
    case 4: return "Three-pad buffer. Departures every park.";
    default: return "";
  }
}

export function formatUrpTowerMeter(state: UrpTowerState): string {
  const stage = stageConfig(state);
  return `Stage ${state.stageIndex + 1}: ${stage.name} · ${state.score} pts`;
}

export function formatUrpTowerStatus(state: UrpTowerState): string {
  const stage = stageConfig(state);
  switch (state.note) {
    case "taken": return "That pad is taken.";
    case "ask": return "Where does this rocket park?";
    case "wrong": {
      let msg = "Too close.";
      if (state.isFirstScreen) {
        if (stage.gap === 2) msg = "Too close — leave two empty.";
        else if (stage.gap === 3) msg = "Too close — leave three empty.";
      }
      return `${msg} −1 clearance`;
    }
    case "timeout": return "Time’s up! −1 clearance";
    case "over": return "No clearances left.";
    case "next": return "Next row.";
    case "bar": return state.tightPark
      ? `No gap open. Parked. +${state.lastPoints}`
      : `Parked. +${state.lastPoints}`;
    case "promote": return `Stage ${state.stageIndex + 2} unlocked!`;
    case "parked": return state.tightPark
      ? `No gap open. Parked. +${state.lastPoints}`
      : `Parked. +${state.lastPoints}`;
    default: return "";
  }
}

export function urpTowerLevelLabel(state: UrpTowerState): string {
  return String(state.stageIndex + 1);
}

export function urpTowerStatsLine(state: UrpTowerState): string {
  const stage = stageConfig(state);
  return `${state.score} points \xb7 ${state.parks} parked \xb7 Stage ${state.stageIndex + 1}: ${stage.name}`;
}
