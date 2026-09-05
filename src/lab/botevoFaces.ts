/**
 * Bot Evolution idle faces (#218).
 * SVG glasses face from face-review; exclusive playfield director.
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
  shadeHex,
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
  blinkMs: 310,
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

/** Locked face bake-in — exact values Jacob locked in face-review. */
export const LOCKED_FACE = {
  eyeSeparation: 34,
  eyeSize: 14,
  pupilSize: 5.5,
  lookOffsetX: 0.25,
  lookOffsetY: 0,
  strokeWeight: 3,
  glassesRim: 2.25,
  blinkDuration: 310,
  lidTravel: 1,
  mouthScale: 0.9,
  faceY: 1.5,
  lookStep: 6,
} as const;

export type FaceLookName = "n" | "e" | "s" | "w" | "c";
export type FaceMouthName = "smile" | "hope" | "neutral";

export interface BotFacePaint {
  look: FaceLookName;
  mouth: FaceMouthName;
  blink: boolean;
}

let faceSvgSeq = 0;

function faceLookDelta(look: FaceLookName): { x: number; y: number } {
  const s = LOCKED_FACE.lookStep;
  if (look === "w") return { x: -s, y: 0 };
  if (look === "e") return { x: s, y: 0 };
  if (look === "n") return { x: 0, y: -s };
  if (look === "s") return { x: 0, y: s };
  return { x: 0, y: 0 };
}

function mouthPathSvg(mouth: FaceMouthName, scale: number, stroke: number): string {
  const s = scale;
  if (mouth === "neutral") {
    const w = 10 * s;
    return (
      `<rect class="botevo-mouth" x="${50 - w / 2}" y="${72 - 1.1 * s}" width="${w}" height="${2.2 * s}" rx="${1.1 * s}" fill="var(--botevo-ink, #1a1410)"/>`
    );
  }
  if (mouth === "hope") {
    const r = 7.5 * s;
    return (
      `<circle class="botevo-mouth" cx="50" cy="${70 + 1 * s}" r="${r}" fill="rgba(30,20,15,0.22)" stroke="var(--botevo-ink, #1a1410)" stroke-width="${stroke}" stroke-linecap="round"/>`
    );
  }
  const half = 14 * s;
  const dip = 10 * s;
  return (
    `<path class="botevo-mouth" d="M${50 - half} 70 Q50 ${70 + dip} ${50 + half} 70" fill="rgba(30,20,15,0.12)" stroke="var(--botevo-ink, #1a1410)" stroke-width="${stroke}" stroke-linecap="round"/>`
  );
}

/**
 * Glasses face matching face-review faceSVG (unique gradient ids per instance).
 */
export function botFaceSvg(
  fillHex: string,
  paint: BotFacePaint,
  uid: string,
): string {
  faceSvgSeq += 1;
  const face = LOCKED_FACE;
  const sep = face.eyeSeparation;
  const cxL = 50 - sep / 2;
  const cxR = 50 + sep / 2;
  const cy = 46;
  const er = face.eyeSize;
  const pr = face.pupilSize;
  const rim = face.glassesRim;
  const stroke = face.strokeWeight;
  const ld = faceLookDelta(paint.look);
  const px = ld.x + face.lookOffsetX;
  const py = ld.y + face.lookOffsetY;
  const maxOff = Math.max(0, er - pr - rim * 0.4);
  const clampOff = (v: number) => Math.max(-maxOff, Math.min(maxOff, v));
  const plx = cxL + clampOff(px);
  const ply = cy + clampOff(py);
  const prx = cxR + clampOff(px);
  const pry = cy + clampOff(py);
  const bridgeW = Math.max(2, sep - er * 2 - 1);
  const bridgeX = 50 - bridgeW / 2;
  const bridgeH = Math.max(2.5, rim * 1.6);

  const wellId = `eyeWell-${uid}-${faceSvgSeq}`;
  const lidId = `lid-${uid}-${faceSvgSeq}`;
  const lidHi = shadeHex(fillHex, 22);
  const lidLo = shadeHex(fillHex, -30);
  const ink = "var(--botevo-ink, #1a1410)";

  let lids = "";
  if (paint.blink) {
    const cover = er * 2 * face.lidTravel;
    const lidY = cy - er;
    lids =
      `<rect class="botevo-lid" x="${cxL - er}" y="${lidY}" width="${er * 2}" height="${cover}" rx="${er}" fill="url(#${lidId})" opacity="0.97"/>` +
      `<rect class="botevo-lid" x="${cxR - er}" y="${lidY}" width="${er * 2}" height="${cover}" rx="${er}" fill="url(#${lidId})" opacity="0.97"/>` +
      `<path d="M${cxL - er * 0.85} ${cy - er * 0.15} Q${cxL} ${cy - er * 0.45} ${cxL + er * 0.85} ${cy - er * 0.15}" fill="none" stroke="${ink}" stroke-width="${stroke * 0.85}" stroke-linecap="round"/>` +
      `<path d="M${cxR - er * 0.85} ${cy - er * 0.15} Q${cxR} ${cy - er * 0.45} ${cxR + er * 0.85} ${cy - er * 0.15}" fill="none" stroke="${ink}" stroke-width="${stroke * 0.85}" stroke-linecap="round"/>`;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true" overflow="visible">` +
    `<defs>` +
    `<radialGradient id="${wellId}" cx="38%" cy="32%" r="70%">` +
    `<stop offset="0%" stop-color="#d8ecf8"/>` +
    `<stop offset="55%" stop-color="#9bb8c8"/>` +
    `<stop offset="100%" stop-color="#6a8aa0"/>` +
    `</radialGradient>` +
    `<linearGradient id="${lidId}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0%" stop-color="${lidHi}"/>` +
    `<stop offset="100%" stop-color="${lidLo}"/>` +
    `</linearGradient>` +
    `</defs>` +
    `<ellipse class="botevo-eye left" cx="${cxL}" cy="${cy}" rx="${er}" ry="${er}" fill="url(#${wellId})" stroke="${ink}" stroke-width="${rim}"/>` +
    `<ellipse class="botevo-eye right" cx="${cxR}" cy="${cy}" rx="${er}" ry="${er}" fill="url(#${wellId})" stroke="${ink}" stroke-width="${rim}"/>` +
    `<rect x="${bridgeX}" y="${cy - bridgeH / 2}" width="${bridgeW}" height="${bridgeH}" rx="${bridgeH / 2}" fill="${ink}"/>` +
    `<circle class="botevo-pupil" cx="${plx}" cy="${ply}" r="${pr}" fill="${ink}"/>` +
    `<circle class="botevo-pupil" cx="${prx}" cy="${pry}" r="${pr}" fill="${ink}"/>` +
    `<circle cx="${plx - pr * 0.28}" cy="${ply - pr * 0.28}" r="${pr * 0.28}" fill="rgba(255,255,255,0.55)"/>` +
    `<circle cx="${prx - pr * 0.28}" cy="${pry - pr * 0.28}" r="${pr * 0.28}" fill="rgba(255,255,255,0.55)"/>` +
    lids +
    mouthPathSvg(paint.mouth, face.mouthScale, stroke) +
    `</svg>`
  );
}

const REST_FACE: BotFacePaint = { look: "c", mouth: "smile", blink: false };

/** Paint / re-paint the SVG face layer (blink / look / mouth). */
export function paintBotFace(face: HTMLElement, paint: BotFacePaint = REST_FACE): void {
  const piece = (face.dataset.piece || "plus") as PieceId;
  const fill =
    face.dataset.shellFill || SHELL_FILL[connectorKind(piece)];
  const uid = face.dataset.faceUid || piece;
  face.style.setProperty("--botevo-face-y", `${LOCKED_FACE.faceY}%`);
  face.innerHTML = botFaceSvg(fill, paint, uid);
}

/**
 * Append SVG glasses face overlay matching face-review faceSVG.
 * Lids / pupils / mouth are painted into the SVG by the face director.
 */
export function appendBotFace(wrap: HTMLElement, piece: PieceId): HTMLElement {
  const face = document.createElement("span");
  face.className = "botevo-face";
  face.dataset.piece = piece;
  face.dataset.shellFill = SHELL_FILL[connectorKind(piece)];
  faceSvgSeq += 1;
  face.dataset.faceUid = `${piece}-${faceSvgSeq}`;
  face.setAttribute("aria-hidden", "true");
  paintBotFace(face, REST_FACE);
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
    paintBotFace(face, REST_FACE);
  }

  private clearAllExpressions(): void {
    for (const h of this.hosts.values()) this.clearExprClasses(h.face);
  }

  private applyExpr(expr: ActiveExpr): void {
    const host = this.hosts.get(expr.key);
    if (!host) return;
    host.face.classList.remove(
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
    host.face.style.removeProperty("--botevo-blink-ms");
    host.face.style.removeProperty("--botevo-look-ms");
    host.face.style.removeProperty("--botevo-excite-ms");
    host.face.style.removeProperty("animation-delay");

    const elapsed = Math.max(0, this.drillMs - expr.startedAt);
    const delay = `-${elapsed}ms`;
    if (expr.channel === "queue") {
      paintBotFace(host.face, { look: "c", mouth: "smile", blink: false });
      host.face.classList.add("is-excite");
      host.face.style.setProperty(
        "--botevo-excite-ms",
        `${this.tune.queueExciteMs}ms`,
      );
      host.face.style.animationDelay = delay;
      return;
    }
    if (expr.beat === "blink") {
      paintBotFace(host.face, { look: "c", mouth: "smile", blink: true });
      host.face.classList.add("is-blink");
      host.face.style.setProperty("--botevo-blink-ms", `${this.tune.blinkMs}ms`);
      return;
    }
    if (expr.look) {
      const mouth: FaceMouthName =
        expr.look.mouth === "smile" ? "smile" : "hope";
      paintBotFace(host.face, {
        look: expr.look.name,
        mouth,
        blink: false,
      });
      host.face.classList.add("is-look", `is-look-${expr.look.name}`);
      host.face.classList.add(mouth === "smile" ? "is-smile" : "is-hope");
      host.face.style.setProperty("--botevo-look-ms", `${this.tune.lookMs}ms`);
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
