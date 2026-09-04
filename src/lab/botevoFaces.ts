/**
 * Bot Evolution idle faces (#218).
 * Overlay eyes + mouth on existing PNGs; exclusive playfield director.
 */
import {
  BOT_COLS,
  BOT_ROWS,
  DIR_E,
  DIR_N,
  DIR_S,
  DIR_W,
  PIECE_SOCKETS,
  SHELL_FILL,
  connectorKind,
  type PieceId,
} from "./botEvolution";

export type LookKind = "live" | "blank";
export type MouthKind = "smile" | "hope";
export type FaceBeat = "blink" | "look";

export interface LookVec {
  dir: number;
  name: "n" | "e" | "s" | "w";
  dx: number;
  dy: number;
  mouth: MouthKind;
}

export interface BotevoFaceTune {
  minGapMs: number;
  maxGapMs: number;
  /** Occasional longer quiet (probability 0–1). */
  longQuietChance: number;
  longQuietMinMs: number;
  longQuietMaxMs: number;
  blinkMs: number;
  lookMs: number;
  /** 0–1 share of playfield beats that are blinks (rest are looks). */
  blinkWeight: number;
  /** Relative weight for falling bot vs landed (lower = rarer). */
  fallingWeight: number;
  queueExcitementRate: number;
  queueExciteMs: number;
  exclusivePlayfield: boolean;
}

export const BOTEVO_FACE_DEFAULTS: BotevoFaceTune = {
  minGapMs: 2500,
  maxGapMs: 5500,
  longQuietChance: 0.12,
  longQuietMinMs: 7000,
  longQuietMaxMs: 9500,
  blinkMs: 150,
  lookMs: 550,
  blinkWeight: 0.65,
  fallingWeight: 0.32,
  queueExcitementRate: 0.22,
  queueExciteMs: 280,
  exclusivePlayfield: true,
};

const DIR_META: Record<
  number,
  { name: "n" | "e" | "s" | "w"; dx: number; dy: number }
> = {
  [DIR_N]: { name: "n", dx: 0, dy: -1 },
  [DIR_E]: { name: "e", dx: 1, dy: 0 },
  [DIR_S]: { name: "s", dx: 0, dy: 1 },
  [DIR_W]: { name: "w", dx: -1, dy: 0 },
};

const CARDINALS = [DIR_N, DIR_E, DIR_S, DIR_W] as const;

/** Socket dirs that are live pistons on this piece. */
export function liveDirs(piece: PieceId): number[] {
  const mask = PIECE_SOCKETS[piece];
  return CARDINALS.filter((d) => (mask & d) !== 0);
}

/** Cardinal sides with no piston on this piece. */
export function blankDirs(piece: PieceId): number[] {
  const mask = PIECE_SOCKETS[piece];
  return CARDINALS.filter((d) => (mask & d) === 0);
}

/**
 * Pick a look vector from PIECE_SOCKETS.
 * live → smile toward a piston; blank → hopeful toward an empty side.
 * Returns null when that kind has no valid side (e.g. plus has no blank).
 */
export function pickLookDir(
  piece: PieceId,
  kind: LookKind,
  rng: () => number = Math.random,
): LookVec | null {
  const dirs = kind === "live" ? liveDirs(piece) : blankDirs(piece);
  if (!dirs.length) return null;
  const dir = dirs[Math.floor(rng() * dirs.length) % dirs.length]!;
  const meta = DIR_META[dir]!;
  return {
    dir,
    name: meta.name,
    dx: meta.dx,
    dy: meta.dy,
    mouth: kind === "live" ? "smile" : "hope",
  };
}

/** Which look kinds are valid for this piece. */
export function availableLookKinds(piece: PieceId): LookKind[] {
  const out: LookKind[] = [];
  if (liveDirs(piece).length) out.push("live");
  if (blankDirs(piece).length) out.push("blank");
  return out;
}

export type FaceHostKind = "landed" | "falling" | "queue";

export interface FaceHost {
  key: string;
  piece: PieceId;
  kind: FaceHostKind;
  /** Grid row for landed/falling; -1 for queue. */
  row: number;
  /** Grid col or queue slot index. */
  col: number;
  face: HTMLElement;
  /** True while cell is morphing — never start a new idle. */
  morphing: boolean;
}

export interface FaceDirectorOptions {
  getPaused: () => boolean;
  getActive: () => boolean;
  tune?: Partial<BotevoFaceTune>;
}

interface ActiveExpr {
  key: string;
  beat: FaceBeat;
  look?: LookVec;
  startedAt: number;
  endsAt: number;
  channel: "playfield" | "queue";
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function lerpRandom(lo: number, hi: number, rng: () => number): number {
  return lo + (hi - lo) * rng();
}

/** Append eyes+mouth overlay covering the baked PNG face. */
export function appendBotFace(wrap: HTMLElement, piece: PieceId): HTMLElement {
  const face = document.createElement("span");
  face.className = "botevo-face";
  face.dataset.piece = piece;
  face.setAttribute("aria-hidden", "true");

  const plate = document.createElement("span");
  plate.className = "botevo-face-plate";
  plate.style.background = SHELL_FILL[connectorKind(piece)];
  face.appendChild(plate);

  for (const side of ["left", "right"] as const) {
    const eye = document.createElement("span");
    eye.className = `botevo-eye ${side}`;
    const glass = document.createElement("span");
    glass.className = "botevo-glass";
    const lid = document.createElement("span");
    lid.className = "botevo-lid";
    const pupil = document.createElement("span");
    pupil.className = "botevo-pupil";
    eye.appendChild(glass);
    eye.appendChild(pupil);
    eye.appendChild(lid);
    face.appendChild(eye);
  }

  const mouth = document.createElement("span");
  mouth.className = "botevo-mouth";
  face.appendChild(mouth);

  wrap.appendChild(face);
  return face;
}

/**
 * Exclusive playfield idle director + independent mild queue excitement.
 * Advances on a drill clock that Pause freezes (not wall-clock alone).
 */
export class BotEvoFaceDirector {
  tune: BotevoFaceTune;
  private hosts = new Map<string, FaceHost>();
  private lastActed = new Map<string, number>();
  private playfieldActives: ActiveExpr[] = [];
  private queueActive: ActiveExpr | null = null;
  private nextPlayfieldAt = 0;
  private nextQueueAt = 0;
  private drillMs = 0;
  private lastWall = 0;
  private raf = 0;
  private readonly getPaused: () => boolean;
  private readonly getActive: () => boolean;
  private rng: () => number;

  constructor(opts: FaceDirectorOptions, rng: () => number = Math.random) {
    this.tune = { ...BOTEVO_FACE_DEFAULTS, ...opts.tune };
    this.getPaused = opts.getPaused;
    this.getActive = opts.getActive;
    this.rng = rng;
  }

  setTune(partial: Partial<BotevoFaceTune>): void {
    this.tune = { ...this.tune, ...partial };
  }

  exportTuneJson(): string {
    return JSON.stringify(this.tune, null, 2);
  }

  start(): void {
    if (this.raf) return;
    this.lastWall = performance.now();
    this.drillMs = 0;
    this.playfieldActives = [];
    this.queueActive = null;
    this.nextPlayfieldAt = lerpRandom(
      this.tune.minGapMs * 0.4,
      this.tune.minGapMs,
      this.rng,
    );
    this.nextQueueAt = lerpRandom(1800, 3600, this.rng);
    this.lastActed.clear();
    const loop = (wall: number) => {
      this.raf = requestAnimationFrame(loop);
      const dt = wall - this.lastWall;
      this.lastWall = wall;
      if (!this.getActive()) return;
      if (!this.getPaused()) this.drillMs += dt;
      this.tick();
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    this.clearAllExpressions();
    this.hosts.clear();
    this.playfieldActives = [];
    this.queueActive = null;
  }

  /** Replace the set of face hosts after each chrome paint. */
  syncHosts(hosts: FaceHost[]): void {
    this.hosts.clear();
    for (const h of hosts) this.hosts.set(h.key, h);
    this.reapplyActive();
  }

  private clearExprClasses(face: HTMLElement): void {
    face.classList.remove(
      "is-blink",
      "is-look",
      "is-smile",
      "is-hope",
      "is-excite",
      "is-look-n",
      "is-look-e",
      "is-look-s",
      "is-look-w",
    );
    face.style.removeProperty("--botevo-blink-ms");
    face.style.removeProperty("--botevo-look-ms");
    face.style.removeProperty("--botevo-excite-ms");
    face.style.removeProperty("animation-delay");
    for (const el of face.querySelectorAll<HTMLElement>(
      ".botevo-lid, .botevo-pupil, .botevo-mouth, .botevo-eye",
    )) {
      el.style.removeProperty("animation-delay");
    }
  }

  private clearAllExpressions(): void {
    for (const h of this.hosts.values()) this.clearExprClasses(h.face);
  }

  private applyExpr(expr: ActiveExpr): void {
    const host = this.hosts.get(expr.key);
    if (!host) return;
    this.clearExprClasses(host.face);
    const elapsed = Math.max(0, this.drillMs - expr.startedAt);
    const delay = `-${elapsed}ms`;
    if (expr.channel === "queue") {
      host.face.classList.add("is-excite");
      host.face.style.setProperty(
        "--botevo-excite-ms",
        `${this.tune.queueExciteMs}ms`,
      );
      host.face.style.animationDelay = delay;
      return;
    }
    if (expr.beat === "blink") {
      host.face.classList.add("is-blink");
      host.face.style.setProperty("--botevo-blink-ms", `${this.tune.blinkMs}ms`);
      for (const lid of host.face.querySelectorAll<HTMLElement>(".botevo-lid")) {
        lid.style.animationDelay = delay;
      }
      return;
    }
    if (expr.look) {
      host.face.classList.add("is-look", `is-look-${expr.look.name}`);
      host.face.classList.add(
        expr.look.mouth === "smile" ? "is-smile" : "is-hope",
      );
      host.face.style.setProperty("--botevo-look-ms", `${this.tune.lookMs}ms`);
      for (const el of host.face.querySelectorAll<HTMLElement>(
        ".botevo-pupil, .botevo-mouth",
      )) {
        el.style.animationDelay = delay;
      }
    }
  }

  private reapplyActive(): void {
    this.playfieldActives = this.playfieldActives.filter((expr) => {
      if (!this.hosts.has(expr.key)) {
        this.lastActed.set(expr.key, this.drillMs);
        return false;
      }
      this.applyExpr(expr);
      return true;
    });
    if (this.queueActive) {
      if (!this.hosts.has(this.queueActive.key)) {
        this.queueActive = null;
      } else {
        this.applyExpr(this.queueActive);
      }
    }
  }

  private releaseExpr(expr: ActiveExpr): void {
    const host = this.hosts.get(expr.key);
    if (host) this.clearExprClasses(host.face);
    this.lastActed.set(expr.key, this.drillMs);
  }

  private rollGap(): number {
    if (this.rng() < this.tune.longQuietChance) {
      return lerpRandom(
        this.tune.longQuietMinMs,
        this.tune.longQuietMaxMs,
        this.rng,
      );
    }
    return lerpRandom(this.tune.minGapMs, this.tune.maxGapMs, this.rng);
  }

  private tick(): void {
    const paused = this.getPaused();
    document
      .getElementById("botevo-root")
      ?.classList.toggle("is-face-paused", paused);

    const before = this.playfieldActives.length;
    this.playfieldActives = this.playfieldActives.filter((expr) => {
      if (this.drillMs < expr.endsAt) return true;
      this.releaseExpr(expr);
      return false;
    });
    if (before > 0 && this.playfieldActives.length === 0) {
      this.nextPlayfieldAt = this.drillMs + this.rollGap();
    }

    if (this.queueActive && this.drillMs >= this.queueActive.endsAt) {
      this.releaseExpr(this.queueActive);
      this.queueActive = null;
      this.nextQueueAt = this.drillMs + this.rollQueueGap();
    }

    if (paused || !this.getActive()) return;

    const canStart =
      this.drillMs >= this.nextPlayfieldAt &&
      (!this.tune.exclusivePlayfield || this.playfieldActives.length === 0);
    if (canStart) this.tryStartPlayfield();

    if (!this.queueActive && this.drillMs >= this.nextQueueAt) {
      this.tryStartQueue();
    }
  }

  private rollQueueGap(): number {
    const base = clamp(
      1000 / Math.max(0.05, this.tune.queueExcitementRate),
      2500,
      9000,
    );
    return lerpRandom(base * 0.75, base * 1.35, this.rng);
  }

  private tryStartPlayfield(): void {
    const busy = new Set(this.playfieldActives.map((e) => e.key));
    const candidates = [...this.hosts.values()].filter(
      (h) =>
        (h.kind === "landed" || h.kind === "falling") &&
        !h.morphing &&
        !busy.has(h.key) &&
        h.face.isConnected,
    );
    if (!candidates.length) {
      this.nextPlayfieldAt = this.drillMs + 400;
      return;
    }

    const scored = candidates.map((h) => {
      const cool = this.drillMs - (this.lastActed.get(h.key) ?? -1e9);
      const cooldownBoost = clamp(cool / 8000, 0, 1.5);
      const centerR = (BOT_ROWS - 1) / 2;
      const centerC = (BOT_COLS - 1) / 2;
      const dist =
        h.kind === "falling"
          ? Math.abs(h.col - centerC) * 0.4
          : Math.hypot(h.row - centerR, h.col - centerC);
      const centerBoost = clamp(1.2 - dist / 4, 0.35, 1.2);
      const kindW = h.kind === "falling" ? this.tune.fallingWeight : 1;
      const jitter = 0.85 + this.rng() * 0.3;
      return { h, score: cooldownBoost * centerBoost * kindW * jitter };
    });
    scored.sort((a, b) => b.score - a.score);
    const pick = scored[0]!.h;

    const wantLook = this.rng() >= this.tune.blinkWeight;
    let look: LookVec | undefined;
    let beat: FaceBeat = "blink";
    let duration = this.tune.blinkMs;

    if (wantLook) {
      const kinds = availableLookKinds(pick.piece);
      if (kinds.length) {
        const kind =
          kinds[Math.floor(this.rng() * kinds.length) % kinds.length]!;
        look = pickLookDir(pick.piece, kind, this.rng) ?? undefined;
        if (look) {
          beat = "look";
          duration = clamp(this.tune.lookMs, 400, 700);
        }
      }
    }

    const expr: ActiveExpr = {
      key: pick.key,
      beat,
      look,
      startedAt: this.drillMs,
      endsAt: this.drillMs + duration,
      channel: "playfield",
    };
    this.playfieldActives.push(expr);
    this.applyExpr(expr);
    if (!this.tune.exclusivePlayfield) {
      this.nextPlayfieldAt =
        this.drillMs +
        lerpRandom(this.tune.minGapMs * 0.45, this.tune.minGapMs, this.rng);
    }
  }

  private tryStartQueue(): void {
    const slots = [...this.hosts.values()].filter(
      (h) => h.kind === "queue" && h.face.isConnected,
    );
    if (!slots.length) {
      this.nextQueueAt = this.drillMs + 1200;
      return;
    }
    const weights = slots.map((h) => (h.col === 0 ? 1.55 : 1));
    const total = weights.reduce((a, b) => a + b, 0);
    let r = this.rng() * total;
    let pick = slots[0]!;
    for (let i = 0; i < slots.length; i++) {
      r -= weights[i]!;
      if (r <= 0) {
        pick = slots[i]!;
        break;
      }
    }
    const ms = this.tune.queueExciteMs;
    this.queueActive = {
      key: pick.key,
      beat: "blink",
      startedAt: this.drillMs,
      endsAt: this.drillMs + ms,
      channel: "queue",
    };
    this.applyExpr(this.queueActive);
  }
}
