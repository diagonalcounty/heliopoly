/**
 * New game: estimated charter duration by AI pack difficulty (#94).
 * Visual lock: tools/board-previews/difficulty-duration-export.json
 * Framing: human pilot ≈ hard/expert; radios = AI pack skill.
 * Stronger pack → longer games (sim-results Aug 2026 choice runs).
 */
import type { AiDifficulty } from "../core/types";

export interface DurationDistro {
  mu: number;
  sigma: number;
  skew: number;
  iqr: number;
  barCount: number;
}

/** Peak-style distros for density bars (human hard|expert framing). */
export const DURATION_BY_DIFFICULTY: Record<AiDifficulty, DurationDistro> = {
  easy: { mu: 32, sigma: 10, skew: 0.4, iqr: 10, barCount: 12 },
  normal: { mu: 25, sigma: 8, skew: 0.35, iqr: 7, barCount: 11 },
  hard: { mu: 35, sigma: 14, skew: 0.7, iqr: 14, barCount: 18 },
  expert: { mu: 60, sigma: 14, skew: 0.65, iqr: 12, barCount: 24 },
};

/** Visual constants from playtest export (difficulty-duration-export.json). */
export const DURATION_METER_VIS = {
  panelW: 72,
  panelH: 225,
  pad: 6,
  radius: 10,
  borderGlow: 0.12,
  titleSize: 9,
  titleA: 0.95,
  scaleMin: 15,
  scaleMax: 60,
  tickFont: 10,
  tickColW: 30,
  tickMark: 6,
  showPlus: true,
  railColW: 18,
  railW: 2,
  railGlow: 6,
  showMarker: false,
  barH: 2.5,
  barMaxW: 36,
  barMinW: 2,
  barGlow: 4,
  barGlowA: 0.55,
  barA: 0.85,
  widthPow: 1.1,
  barRound: true,
} as const;

function densityAt(round: number, d: DurationDistro): number {
  const x = (round - d.mu) / Math.max(1, d.sigma);
  const skewShift = d.skew * (x > 0 ? x * x * 0.15 : 0);
  const z = x - skewShift;
  return Math.exp(-0.5 * z * z);
}

function yForRound(
  round: number,
  scaleMin: number,
  scaleMax: number,
  h: number,
  padTop: number,
  padBot: number,
): number {
  const usable = h - padTop - padBot;
  const t = (round - scaleMin) / Math.max(1, scaleMax - scaleMin);
  return padTop + t * usable;
}

export function renderDurationMeter(
  root: HTMLElement,
  difficulty: AiDifficulty,
): void {
  const v = DURATION_METER_VIS;
  const dist = DURATION_BY_DIFFICULTY[difficulty] ?? DURATION_BY_DIFFICULTY.normal;
  const padTop = v.pad + 4;
  const padBot = v.pad + 4;

  root.innerHTML = "";
  root.className = "duration-meter";
  root.style.width = `${v.panelW}px`;
  root.style.height = `${v.panelH}px`;
  root.style.borderRadius = `${v.radius}px`;
  root.style.setProperty("--dm-border-glow", String(v.borderGlow));
  root.setAttribute("role", "img");
  root.setAttribute(
    "aria-label",
    `Estimated rounds (median µ): about ${dist.mu} for ${difficulty} AI pack versus a strong pilot`,
  );

  const title = document.createElement("div");
  title.className = "duration-meter-title";
  title.style.opacity = String(v.titleA);
  // Title weight/size from CSS — match AI difficulty legend (not bold HUD caps)
  title.textContent = "Est. rounds (µ)";
  root.appendChild(title);

  const body = document.createElement("div");
  body.className = "duration-meter-body";
  root.appendChild(body);

  // Force layout for height
  const titleH = title.offsetHeight || 28;
  const bodyH = Math.max(40, v.panelH - titleH);
  body.style.height = `${bodyH}px`;

  const railCol = document.createElement("div");
  railCol.className = "duration-meter-rail-col";
  railCol.style.width = `${v.railColW}px`;
  const rail = document.createElement("div");
  rail.className = "duration-meter-rail";
  rail.style.width = `${v.railW}px`;
  rail.style.top = `${padTop}px`;
  rail.style.bottom = `${padBot}px`;
  rail.style.boxShadow = `0 0 ${v.railGlow}px rgba(125,211,252,0.55)`;
  railCol.appendChild(rail);
  body.appendChild(railCol);

  const bars = document.createElement("div");
  bars.className = "duration-meter-bars";
  body.appendChild(bars);

  const ticks = document.createElement("div");
  ticks.className = "duration-meter-ticks";
  ticks.style.width = `${v.tickColW}px`;
  ticks.style.fontSize = `${v.tickFont}px`;
  body.appendChild(ticks);

  const scaleMin = v.scaleMin;
  const scaleMax = v.scaleMax;
  const step = scaleMax <= 80 ? 10 : 20;
  for (let r = scaleMin; r < scaleMax; r += step) {
    appendTick(ticks, r, scaleMin, scaleMax, bodyH, padTop, padBot, v, false);
  }
  appendTick(ticks, scaleMax, scaleMin, scaleMax, bodyH, padTop, padBot, v, true);

  const nBars = dist.barCount;
  let peak = 0;
  const dens: { round: number; d: number }[] = [];
  for (let i = 0; i < nBars; i++) {
    const t = nBars === 1 ? 0.5 : i / (nBars - 1);
    const round = scaleMin + t * (scaleMax - scaleMin);
    const d = densityAt(round, dist);
    dens.push({ round, d });
    peak = Math.max(peak, d);
  }
  for (const { round, d } of dens) {
    const rel = peak > 0 ? d / peak : 0;
    const w =
      v.barMinW + (v.barMaxW - v.barMinW) * Math.pow(rel, v.widthPow);
    if (w < 0.5) continue;
    const el = document.createElement("div");
    el.className = "duration-meter-bar";
    el.style.top = `${yForRound(round, scaleMin, scaleMax, bodyH, padTop, padBot)}px`;
    el.style.height = `${v.barH}px`;
    el.style.width = `${w}px`;
    el.style.borderRadius = v.barRound ? "2px" : "0";
    el.style.background = `rgba(125, 211, 252, ${v.barA * (0.35 + 0.65 * rel)})`;
    el.style.boxShadow =
      v.barGlow > 0
        ? `0 0 ${v.barGlow}px rgba(125, 211, 252, ${v.barGlowA * rel})`
        : "none";
    bars.appendChild(el);
  }
}

function appendTick(
  ticks: HTMLElement,
  r: number,
  scaleMin: number,
  scaleMax: number,
  bodyH: number,
  padTop: number,
  padBot: number,
  v: typeof DURATION_METER_VIS,
  isMax: boolean,
): void {
  const div = document.createElement("div");
  div.className = "duration-meter-tick";
  div.style.top = `${yForRound(r, scaleMin, scaleMax, bodyH, padTop, padBot)}px`;
  const label = isMax && v.showPlus ? `${r}+` : String(r);
  div.innerHTML = `<span class="duration-meter-tick-line" style="width:${v.tickMark}px"></span>${label}`;
  ticks.appendChild(div);
}
