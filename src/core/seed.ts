import { distanceAu, pickStat } from "./ephemeris";
import type { GameState, Player } from "./types";

function nearestPrime(n: number): number {
  const x = Math.max(2, Math.floor(Math.abs(n)));
  const isPrime = (k: number) => {
    if (k < 2) return false;
    if (k % 2 === 0) return k === 2;
    for (let d = 3; d * d <= k; d += 2) if (k % d === 0) return false;
    return true;
  };
  if (isPrime(x)) return x;
  let lo = x - 1;
  let hi = x + 1;
  while (lo >= 2 || hi < x + 10000) {
    if (lo >= 2 && isPrime(lo)) return lo;
    if (isPrime(hi)) return hi;
    lo--;
    hi++;
  }
  return 2;
}

function hash32(...parts: number[]): number {
  let h = 0x811c9dc5;
  for (const p of parts) {
    h ^= p >>> 0;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function floatBits(f: number): number {
  // Map AU float into uint32-ish crumbs
  const x = Math.floor(Math.abs(f) * 1e9) >>> 0;
  return x;
}

/**
 * Reseed PRNG for the active pilot's next dice roll.
 * Mixes: time, nearest prime to pilot fuel, ephemeris AU (N/F/Avg of first claim body).
 */
export function reseedForActivePilot(state: GameState, pilot: Player): string {
  const t = Date.now() >>> 0;
  const prime = nearestPrime(pilot.fuel);
  // Use a throwaway LCG step from current state for stat pick so we don't need crypto in core
  const statPick = ((state.rngState * 1664525 + 1013904223) >>> 0) / 4294967296;
  const stat = pickStat(statPick);
  const au = distanceAu(pilot.ephemerisBodyId, stat);
  const bodyKey = pilot.ephemerisBodyId ?? "earth";

  let cryptoBits = 0;
  try {
    const c = globalThis.crypto as Crypto | undefined;
    if (c?.getRandomValues) {
      const buf = new Uint32Array(1);
      c.getRandomValues(buf);
      cryptoBits = buf[0]!;
    }
  } catch {
    /* ignore */
  }

  state.rngState = hash32(
    t,
    prime,
    floatBits(au),
    bodyKey.split("").reduce((a, c) => a + c.charCodeAt(0), 0),
    pilot.fuel,
    state.diceTotals.length,
    cryptoBits || (t ^ prime),
  );
  if (state.rngState === 0) state.rngState = 1;

  return `seed[${pilot.name} fuel′=${prime} ${bodyKey}:${stat}=${au.toFixed(6)}AU t=${t}]`;
}
