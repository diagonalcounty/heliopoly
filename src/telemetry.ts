/**
 * Client-side game telemetry (#61).
 * POSTs completed-game log + meta to same-origin /api/game-log.
 * No cookies; server hashes IP — client never sends identity.
 */
import type { GameState } from "./core/types";
import { PROPELLANTS } from "./core/propellant";

const ENDPOINT = "/api/game-log";

/** Avoid double-submit for the same end screen. */
let lastSubmittedKey: string | null = null;

export function buildTelemetryPayload(s: GameState): {
  v: number;
  log: string[];
  meta: Record<string, unknown>;
} {
  const winner = s.players.find((p) => p.id === s.winnerId);
  return {
    v: 1,
    log: s.log.slice(-4000),
    meta: {
      playerCount: s.players.length,
      aiDifficulty: s.config.aiDifficulty,
      humanSeat: s.config.humanSeat,
      humanPropellant: s.config.humanPropellant,
      propellants: s.players.map(
        (p) => `${p.name}:${PROPELLANTS[p.propellant].short}`,
      ),
      seed: s.config.seed ?? null,
      round: s.round,
      gameTurn: s.gameTurn,
      winnerId: s.winnerId,
      winnerName: winner?.name ?? null,
      endReason: s.endReason,
      boardRotations: s.boardRotations,
      client:
        typeof location !== "undefined" && location.protocol === "file:"
          ? "heliopoly-ios"
          : "heliopoly-web",
    },
  };
}

/**
 * Fire-and-forget at game end. Failures are silent (balance analysis, not UX).
 */
export function submitGameTelemetry(s: GameState): void {
  if (s.phase !== "game_over") return;
  const key = `${s.config.seed ?? "?"}-${s.gameTurn}-${s.winnerId ?? "none"}-${s.round}`;
  if (lastSubmittedKey === key) return;
  lastSubmittedKey = key;

  const body = JSON.stringify(buildTelemetryPayload(s));
  try {
    // Prefer keepalive for page transitions; fall back to fetch
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon(ENDPOINT, blob);
      if (ok) return;
    }
  } catch {
    /* continue to fetch */
  }

  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
    credentials: "omit",
  }).catch(() => {
    /* ignore network errors */
  });
}
