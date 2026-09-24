/**
 * Home doors — Journey / Arcade / Lab (#275–#279).
 *
 * Arcade membership is an allowlist. A new Lab scenario stays in Lab until
 * Jacob signs off that it is fun alone in about a minute (#279).
 * Do not infer the door from the old accordion group.
 *
 * Lab unlock persistence (#277): localStorage key
 * `heliopoly.arcadeSessionsCompleted` (integer). Lab unlocks at >= 1.
 * The count increases when an Arcade toy closes, not when the Arcade door opens.
 */
import type { LabScenario, LabScenarioGroup } from "./scenarios";

export const ARCADE_SESSIONS_KEY = "heliopoly.arcadeSessionsCompleted";

export const HOME_DOOR_COPY = {
  arcade: {
    title: "Arcade",
    hook: "On the rocket",
    kicker: "Play for a minute",
  },
  journey: {
    title: "Journey",
    hook: "Fly the charter",
    kicker: "Full game",
  },
  lab: {
    title: "Lab",
    hook: "Experiments",
    kicker: "Nerdy tools",
  },
} as const;

export type HomeDoorId = keyof typeof HOME_DOOR_COPY;

/** Visual and focus order. Arcade is the default first tap. */
export const HOME_DOOR_ORDER: readonly HomeDoorId[] = [
  "arcade",
  "journey",
  "lab",
] as const;

/**
 * Fun alone / ~1 minute. Journey is the charter launch, not a scenario id.
 * Gravity Duel practice (`duel-you-challenger`) stays Lab.
 */
export const ARCADE_SCENARIO_IDS = [
  "egg-bot-evolution",
  "backup-fuel-pipes",
  "hull-panel",
] as const;

export type ArcadeScenarioId = (typeof ARCADE_SCENARIO_IDS)[number];

export type ScenarioShelf = "arcade" | "lab";

/** Operator canned boards. Shown behind “Show experiments”, not on Arcade. */
export const LAB_OPERATOR_GROUPS: readonly LabScenarioGroup[] = [
  "end",
  "economy",
] as const;

const ARCADE_ID_SET: ReadonlySet<string> = new Set(ARCADE_SCENARIO_IDS);

export function scenarioShelf(id: string): ScenarioShelf {
  return ARCADE_ID_SET.has(id) ? "arcade" : "lab";
}

export function isOperatorExperimentGroup(group: LabScenarioGroup): boolean {
  return (LAB_OPERATOR_GROUPS as readonly string[]).includes(group);
}

export function scenariosForShelf<T extends { id: string }>(
  scenarios: readonly T[],
  shelf: ScenarioShelf,
): T[] {
  if (shelf === "arcade") {
    const byId = new Map(scenarios.map((sc) => [sc.id, sc]));
    const out: T[] = [];
    for (const id of ARCADE_SCENARIO_IDS) {
      const sc = byId.get(id);
      if (sc) out.push(sc);
    }
    return out;
  }
  return scenarios.filter((sc) => scenarioShelf(sc.id) === "lab");
}

export function readArcadeSessionsCompleted(
  storage: Pick<Storage, "getItem"> | null,
): number {
  if (!storage) return 0;
  let raw: string | null;
  try {
    raw = storage.getItem(ARCADE_SESSIONS_KEY);
  } catch {
    return 0;
  }
  if (raw == null || raw.trim() === "") return 0;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

export function writeArcadeSessionsCompleted(
  storage: Pick<Storage, "setItem"> | null,
  count: number,
): void {
  if (!storage) return;
  const n = Math.max(0, Math.floor(count));
  try {
    storage.setItem(ARCADE_SESSIONS_KEY, String(n));
  } catch {
    /* private mode */
  }
}

/** One exited Arcade toy visit. Does not open Lab. */
export function recordArcadeSessionExit(
  storage: Pick<Storage, "getItem" | "setItem"> | null,
): number {
  const next = readArcadeSessionsCompleted(storage) + 1;
  writeArcadeSessionsCompleted(storage, next);
  return next;
}

export function isLabUnlocked(sessionsCompleted: number): boolean {
  return sessionsCompleted >= 1;
}

/** Every current shelf id, for the move-list test. */
export function classifyScenarios(
  scenarios: readonly LabScenario[],
): { arcade: string[]; lab: string[] } {
  const arcade = scenariosForShelf(scenarios, "arcade").map((sc) => sc.id);
  const lab = scenariosForShelf(scenarios, "lab").map((sc) => sc.id);
  return { arcade, lab };
}
