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
    schoolHook: "A Khmer stele (a carved stone at Sambor) — an early dated zero in a place-value system (the place of a digit matters: ones, tens, hundreds), 683 CE.",
  },
  {
    id: "turing",
    callsign: "Turing",
    schoolHook: "Helped invent computer science (the study of what computers can do). Broke codes in World War II.",
  },
  {
    id: "ada",
    callsign: "Ada",
    schoolHook: "Ada Lovelace — often called the first computer programmer (a person who writes what a computer should do).",
  },
  {
    id: "sagan",
    callsign: "Sagan",
    schoolHook: "An astronomer (a person who studies space) who brought Cosmos (the TV series) to millions of living rooms.",
  },
  {
    id: "asimov",
    callsign: "Asimov",
    schoolHook: "A giant of science fiction (made-up stories about science). Robots, Foundation (a book series), and laws of robotics (rules for robots).",
  },
  {
    id: "clarke",
    callsign: "Clarke",
    schoolHook: "2001: A Space Odyssey (a space story). Also predicted geostationary satellites (a satellite that stays over one spot on Earth).",
  },
  {
    id: "goddard",
    callsign: "Goddard",
    schoolHook: "An early leader of liquid-fuel rockets (rockets that burn liquid fuel). These are ideas, not a flight crew.",
  },
  {
    id: "von-braun",
    callsign: "von Braun",
    schoolHook: "Heavy-lift rocketry (rockets big enough to lift a lot) that made crewed flight to the Moon possible. The history is not simple.",
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
 * Player-facing ship title. AI seats get the definite article; humans keep
 * the typed callsign. Does not rewrite stored `Player.name`.
 */
export function rocketTitle(p: { name: string; agent: "human" | "ai" }): string {
  if (p.agent !== "ai") return p.name;
  return titledCallsign(p.name);
}

/** Definite-article form for an AI roster callsign (`Ada` → `The Ada`). */
export function titledCallsign(callsign: string): string {
  const t = callsign.trim();
  if (/^the\s+/i.test(t)) return t;
  return `The ${t}`;
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
