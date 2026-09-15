/**
 * Urinal-rule Parking campaign / scenario shelf (#251).
 * Wraps urpGrader pools with named scenarios, linear unlock, then open shelf.
 * Product title stays human; kebab id stays for Lab wiring.
 */
import {
  hasLegalPad,
  startUrpFromPool,
  type UrpScreen,
  type UrpState,
} from "./urpGrader";

export const URP_PRODUCT_TITLE = "Urinal-rule Parking";
export const URP_PRODUCT_BLURB =
  "Orbit the apron. Leave a buffer. Land rude and the fine sticks.";

export const URP_PROGRESS_KEY = "heliopoly.lab.urp.campaign.v1";

export type UrpScenarioId =
  | "quiet-apron"
  | "rush-hour"
  | "both-sides-bad"
  | "dead-orbit"
  | "final-approach";

export interface UrpScenarioDef {
  id: UrpScenarioId;
  /** 1-based campaign order. */
  order: number;
  title: string;
  /** Clerk/ATC deadpan brief on the shelf card. */
  blurb: string;
}

/** Linear shelf order (Enforcement Lottery cut — personality folded into Rush Hour / Final copy). */
export const URP_SCENARIOS: readonly UrpScenarioDef[] = [
  {
    id: "quiet-apron",
    order: 1,
    title: "Quiet Apron",
    blurb: "Sparse pads. Leave a buffer. Furthest empty that isn’t rude.",
  },
  {
    id: "rush-hour",
    order: 2,
    title: "Rush Hour",
    blurb:
      "Seven pads. Crowded. ATC skips the legal pad sometimes — the fine still sticks.",
  },
  {
    id: "both-sides-bad",
    order: 3,
    title: "Both Sides Bad",
    blurb: "One area is worse. Pick before you land.",
  },
  {
    id: "dead-orbit",
    order: 4,
    title: "Dead Orbit",
    blurb: "Jam. No legal pad on this pass. Orbit is the move.",
  },
  {
    id: "final-approach",
    order: 5,
    title: "Final Approach",
    blurb: "Everything you’ve seen. Clear it.",
  },
] as const;

export function getUrpScenario(id: UrpScenarioId): UrpScenarioDef {
  const sc = URP_SCENARIOS.find((s) => s.id === id);
  if (!sc) throw new Error(`unknown urp scenario ${id}`);
  return sc;
}

export interface UrpRunTotals {
  clear: number;
  fine: number;
  orbit: number;
}

export interface UrpProgress {
  /** Scenarios cleared at least once with a good (no-fine) landing. */
  cleared: UrpScenarioId[];
  /** True after first Final Approach clear — entire shelf stays open. */
  shelfOpen: boolean;
  totals: UrpRunTotals;
}

export function emptyUrpProgress(): UrpProgress {
  return {
    cleared: [],
    shelfOpen: false,
    totals: { clear: 0, fine: 0, orbit: 0 },
  };
}

function isScenarioId(raw: unknown): raw is UrpScenarioId {
  return (
    raw === "quiet-apron" ||
    raw === "rush-hour" ||
    raw === "both-sides-bad" ||
    raw === "dead-orbit" ||
    raw === "final-approach"
  );
}

export function loadUrpProgress(
  storage: Pick<Storage, "getItem"> | null = typeof localStorage !== "undefined"
    ? localStorage
    : null,
): UrpProgress {
  const empty = emptyUrpProgress();
  if (!storage) return empty;
  try {
    const raw = storage.getItem(URP_PROGRESS_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<UrpProgress>;
    const cleared = Array.isArray(parsed.cleared)
      ? parsed.cleared.filter(isScenarioId)
      : [];
    const totals = parsed.totals ?? empty.totals;
    return {
      cleared,
      shelfOpen: Boolean(parsed.shelfOpen) || cleared.includes("final-approach"),
      totals: {
        clear: Number(totals.clear) || 0,
        fine: Number(totals.fine) || 0,
        orbit: Number(totals.orbit) || 0,
      },
    };
  } catch {
    return empty;
  }
}

export function saveUrpProgress(
  progress: UrpProgress,
  storage: Pick<Storage, "setItem"> | null = typeof localStorage !== "undefined"
    ? localStorage
    : null,
): void {
  if (!storage) return;
  try {
    storage.setItem(URP_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    /* quota / private mode — Lab progress is best-effort */
  }
}

/** Linear unlock 1→5; after Final Approach clear, all stay open. */
export function isUrpScenarioUnlocked(
  id: UrpScenarioId,
  progress: UrpProgress,
): boolean {
  if (progress.shelfOpen) return true;
  const sc = getUrpScenario(id);
  if (sc.order === 1) return true;
  const prev = URP_SCENARIOS.find((s) => s.order === sc.order - 1);
  return prev ? progress.cleared.includes(prev.id) : false;
}

export function nextUrpScenario(id: UrpScenarioId): UrpScenarioId | null {
  const sc = getUrpScenario(id);
  const nxt = URP_SCENARIOS.find((s) => s.order === sc.order + 1);
  return nxt?.id ?? null;
}

export interface UrpRunRecord {
  scenarioId: UrpScenarioId;
  outcome: "good" | "fine";
  orbitsUsed: number;
}

/** Apply a finished run: totals + clear unlock / open shelf. */
export function recordUrpRun(
  progress: UrpProgress,
  run: UrpRunRecord,
): UrpProgress {
  const totals: UrpRunTotals = {
    clear: progress.totals.clear + (run.outcome === "good" ? 1 : 0),
    fine: progress.totals.fine + (run.outcome === "fine" ? 1 : 0),
    orbit: progress.totals.orbit + Math.max(0, run.orbitsUsed),
  };
  const cleared = [...progress.cleared];
  let shelfOpen = progress.shelfOpen;
  if (run.outcome === "good" && !cleared.includes(run.scenarioId)) {
    cleared.push(run.scenarioId);
  }
  if (run.outcome === "good" && run.scenarioId === "final-approach") {
    shelfOpen = true;
  }
  return { cleared, shelfOpen, totals };
}

export function pairFullyJammed(pair: readonly [UrpScreen, UrpScreen]): boolean {
  return !hasLegalPad(pair[0]) && !hasLegalPad(pair[1]);
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: readonly T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)]!;
}

function maybeSwap(pair: [UrpScreen, UrpScreen], rnd: () => number): [UrpScreen, UrpScreen] {
  return rnd() < 0.5 ? [pair[1], pair[0]] : pair;
}

function packPairs(looks: Array<[UrpScreen, UrpScreen]>): UrpScreen[] {
  if (looks.length !== 3) throw new Error("urp scenario needs 3 looks");
  return [
    looks[0]![0],
    looks[0]![1],
    looks[1]![0],
    looks[1]![1],
    looks[2]![0],
    looks[2]![1],
  ];
}

/** Verified fixtures — do not invent occupancy without gradePads check. */
export const URP_JAM7: UrpScreen = { padCount: 7, occupied: [1, 3, 5] };
export const URP_JAM7_ALT: UrpScreen = { padCount: 7, occupied: [0, 2, 4, 6] };
export const URP_JAM5: UrpScreen = { padCount: 5, occupied: [1, 3] };

const LEGAL7_SPARSE: readonly UrpScreen[] = [
  { padCount: 7, occupied: [0] },
  { padCount: 7, occupied: [6] },
  { padCount: 7, occupied: [0, 6] },
  { padCount: 7, occupied: [2, 5] },
];

const LEGAL7_DENSE: readonly UrpScreen[] = [
  { padCount: 7, occupied: [0, 2, 4] },
  { padCount: 7, occupied: [0, 1, 4] },
  { padCount: 7, occupied: [0, 2, 6] },
  { padCount: 7, occupied: [2, 4, 6] },
  { padCount: 7, occupied: [0, 1, 2] },
  { padCount: 7, occupied: [4, 5, 6] },
  { padCount: 7, occupied: [0, 1, 5] },
  { padCount: 7, occupied: [1, 2, 4] },
];

const JAM7_POOL: readonly UrpScreen[] = [
  URP_JAM7,
  URP_JAM7_ALT,
  { padCount: 7, occupied: [1, 2, 4, 5] },
  { padCount: 7, occupied: [0, 2, 3, 5] },
  { padCount: 7, occupied: [0, 1, 3, 5] },
  { padCount: 7, occupied: [0, 2, 4, 5] },
  { padCount: 7, occupied: [1, 3, 4, 6] },
];

const LEGAL5: readonly UrpScreen[] = [
  { padCount: 5, occupied: [] },
  { padCount: 5, occupied: [0] },
  { padCount: 5, occupied: [4] },
  { padCount: 5, occupied: [2] },
  { padCount: 5, occupied: [1] },
  { padCount: 5, occupied: [0, 4] },
];

function assertPoolContract(pool: UrpScreen[], opts: { jamLook1?: boolean }): void {
  if (pool.length !== 6) throw new Error("urp pool must be 6 screens");
  if (!pool.some(hasLegalPad)) throw new Error("urp pool needs ≥1 legal screen");
  if (!(hasLegalPad(pool[4]!) || hasLegalPad(pool[5]!))) {
    throw new Error("urp look 3 must offer a clear path");
  }
  if (opts.jamLook1 && (hasLegalPad(pool[0]!) || hasLegalPad(pool[1]!))) {
    throw new Error("dead orbit look 1 must be fully jammed");
  }
}

/** Quiet Apron — sparse 5-pads; teach buffer / furthest empty. */
export function buildQuietApronPool(seed: number): UrpScreen[] {
  const rnd = mulberry32(seed);
  const pool = packPairs([
    maybeSwap([pick(LEGAL5, rnd), pick(LEGAL5, rnd)], rnd),
    maybeSwap([pick(LEGAL5, rnd), pick(LEGAL5, rnd)], rnd),
    maybeSwap([pick(LEGAL5, rnd), pick(LEGAL5, rnd)], rnd),
  ]);
  assertPoolContract(pool, {});
  return pool;
}

/** Rush Hour — dense 7-pads; crowded but a legal pad exists each look. */
export function buildRushHourPool(seed: number): UrpScreen[] {
  const rnd = mulberry32(seed);
  const pool = packPairs([
    maybeSwap([pick(LEGAL7_DENSE, rnd), pick(LEGAL7_DENSE, rnd)], rnd),
    maybeSwap([pick(LEGAL7_DENSE, rnd), pick(LEGAL7_SPARSE, rnd)], rnd),
    maybeSwap([pick(LEGAL7_DENSE, rnd), pick(LEGAL7_DENSE, rnd)], rnd),
  ]);
  assertPoolContract(pool, {});
  return pool;
}

/** Both Sides Bad — each look: one legal area, one jam; picker skill. */
export function buildBothSidesBadPool(seed: number): UrpScreen[] {
  const rnd = mulberry32(seed);
  const pool = packPairs([
    maybeSwap([pick(LEGAL7_DENSE, rnd), pick(JAM7_POOL, rnd)], rnd),
    maybeSwap([pick(LEGAL5, rnd), URP_JAM5], rnd),
    maybeSwap([pick(LEGAL7_DENSE, rnd), pick(JAM7_POOL, rnd)], rnd),
  ]);
  assertPoolContract(pool, {});
  return pool;
}

/**
 * Dead Orbit — jam early; orbit is the skill.
 * Look 1 fully jammed; look 2 usually jammed; look 3 always has a legal pad.
 */
export function buildDeadOrbitPool(seed: number): UrpScreen[] {
  const rnd = mulberry32(seed);
  const look1: [UrpScreen, UrpScreen] = [URP_JAM7, URP_JAM7_ALT];
  const look2: [UrpScreen, UrpScreen] =
    rnd() < 0.7
      ? [pick(JAM7_POOL, rnd), URP_JAM5]
      : maybeSwap([pick(JAM7_POOL, rnd), pick(LEGAL7_DENSE, rnd)], rnd);
  const look3 = maybeSwap([pick(LEGAL7_DENSE, rnd), pick(JAM7_POOL, rnd)], rnd);
  const pool = packPairs([look1, look2, look3]);
  assertPoolContract(pool, { jamLook1: true });
  return pool;
}

/** Final Approach — mix of sparse / dense-picker / jam-then-clear. */
export function buildFinalApproachPool(seed: number): UrpScreen[] {
  const rnd = mulberry32(seed);
  const pool = packPairs([
    maybeSwap([pick(LEGAL5, rnd), pick(LEGAL5, rnd)], rnd),
    maybeSwap([pick(LEGAL7_DENSE, rnd), pick(JAM7_POOL, rnd)], rnd),
    maybeSwap([URP_JAM7, pick(LEGAL7_DENSE, rnd)], rnd),
  ]);
  assertPoolContract(pool, {});
  return pool;
}

export function buildScenarioPool(id: UrpScenarioId, seed: number): UrpScreen[] {
  switch (id) {
    case "quiet-apron":
      return buildQuietApronPool(seed);
    case "rush-hour":
      return buildRushHourPool(seed);
    case "both-sides-bad":
      return buildBothSidesBadPool(seed);
    case "dead-orbit":
      return buildDeadOrbitPool(seed);
    case "final-approach":
      return buildFinalApproachPool(seed);
  }
}

export function startUrpScenario(
  id: UrpScenarioId,
  seed: number = Date.now() >>> 0,
): UrpState {
  return startUrpFromPool(buildScenarioPool(id, seed));
}

/** Per-run score line for the result strip. */
export function formatUrpRunScore(outcome: "good" | "fine", orbitsUsed: number): string {
  const clear = outcome === "good" ? 1 : 0;
  const fine = outcome === "fine" ? 1 : 0;
  return `Clear ${clear} · Fine ${fine} · Orbit ${orbitsUsed}`;
}
