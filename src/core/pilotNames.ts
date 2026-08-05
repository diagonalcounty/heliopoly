/**
 * AI *rocket* callsigns — short Civ-style roster (ships, not people at the stick).
 * Prefer foundations of number, notation, and computation (and a few visionaries)
 * over astronaut flight-crew names. Each callsign has an Ops Manual page.
 *
 * Human rocket name comes from setup (`GameConfig.humanName` — “Name your rocket”).
 */

export interface AiPilotDef {
  /** Stable id for handbook topic: `pilot-${id}` */
  id: string;
  /** Display name on the board / standings */
  callsign: string;
  /** One-line “why you might know them” */
  schoolHook: string;
}

/**
 * Charter roster: math / computing enablers + SF-science visionaries.
 * No modern astronauts (would read as “history class,” not rivals).
 */
export const AI_PILOTS: readonly AiPilotDef[] = [
  {
    id: "recorde",
    callsign: "Recorde",
    schoolHook: "Robert Recorde — invented the equals sign (=) in 1557.",
  },
  {
    id: "k127",
    callsign: "K-127",
    schoolHook:
      "Khmer stele (Sambor) — early dated zero in a decimal place-value system (683 CE).",
  },
  {
    id: "turing",
    callsign: "Turing",
    schoolHook: "Helped invent computer science; broke codes in World War II.",
  },
  {
    id: "ada",
    callsign: "Ada",
    schoolHook: "Ada Lovelace — often called the first computer programmer.",
  },
  {
    id: "sagan",
    callsign: "Sagan",
    schoolHook: "Astronomer who brought Cosmos to millions of living rooms.",
  },
  {
    id: "asimov",
    callsign: "Asimov",
    schoolHook: "Science-fiction giant — robots, Foundation, and laws of robotics.",
  },
  {
    id: "clarke",
    callsign: "Clarke",
    schoolHook: "2001: A Space Odyssey; also predicted geostationary satellites.",
  },
  {
    id: "goddard",
    callsign: "Goddard",
    schoolHook: "American pioneer of liquid-fuel rockets (ideas, not a flight crew).",
  },
  {
    id: "von-braun",
    callsign: "von Braun",
    schoolHook: "Heavy-lift rocketry that made crewed lunar flight possible (complex legacy).",
  },
] as const;

/** Callsigns only (for seating / shuffle). */
export const AI_PILOT_NAMES: readonly string[] = AI_PILOTS.map((p) => p.callsign);

export function pilotByCallsign(callsign: string): AiPilotDef | undefined {
  return AI_PILOTS.find((p) => p.callsign === callsign);
}

export function pilotById(id: string): AiPilotDef | undefined {
  return AI_PILOTS.find((p) => p.id === id);
}

/** Mulberry-ish shuffle from seed; returns `count` unique callsigns. */
export function pickAiNames(count: number, seed: number): string[] {
  const n = Math.max(0, Math.min(count, AI_PILOT_NAMES.length));
  const pool = [...AI_PILOT_NAMES];
  let s = seed >>> 0 || 1;
  for (let i = pool.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

/** Sanitize player-typed name for UI / logs. */
export function sanitizePilotName(raw: string, fallback = "Venture"): string {
  const t = raw.replace(/\s+/g, " ").trim().slice(0, 24);
  if (!t) return fallback;
  if (!/[\p{L}\p{N}]/u.test(t)) return fallback;
  return t;
}

/**
 * Hidden #47: palindrome callsign (letters/digits only, case-insensitive)
 * unlocks bidirectional Mainline travel. Length ≥ 2 after stripping.
 * e.g. Ada, Anna, Bob, Kayak.
 */
export function isPalindromeRocketName(name: string): boolean {
  const s = name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
  if (s.length < 2) return false;
  for (let i = 0, j = s.length - 1; i < j; i++, j--) {
    if (s[i] !== s[j]) return false;
  }
  return true;
}
