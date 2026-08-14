/**
 * Stylized system ring bands (#101).
 *
 * Each orbital ring gets a tinted dashed stroke plus a radial band that
 * falls off toward the next *inner* ring. Colors are stylized planet
 * hues for dark-UI harmony, not scientific albedos.
 *
 * Alphas below are **slider = 100%** (peak). The Pilot Controls “Rings”
 * control defaults to **50%**, so effective paint is half of these.
 * Peak is raised so mid-slider is brighter than the old full lock
 * (outer 0.17 / inner 0.02 / dash 0.9 / legacy 0.29), which was too dim.
 *
 * At default 50%: outer ~0.28 · inner ~0.05 · dash ~0.90 · legacy ~0.35
 * (dash/legacy use min(1, scale × peak) when drawing).
 */

/** Opacity of the band fill at the system’s dashed (outer) ring (slider 100%). */
export const RING_BAND_OUTER_ALPHA = 0.55;
/** Opacity of the band fill where it meets the next inner ring (slider 100%). */
export const RING_BAND_INNER_ALPHA = 0.1;
/** Opacity of the colored dashed ring stroke (slider 100%; often clamps to 1). */
export const RING_DASH_ALPHA = 1.8;
/** Underlay of the old cool-blue dashed rings (slider 100%). */
export const RING_LEGACY_BLUE_ALPHA = 0.7;

/** Default Pilot Controls Rings slider (0–1). Mid = preferred board look. */
export const RING_OPACITY_DEFAULT = 0.5;

export type Rgb = readonly [number, number, number];

/** board.rings index 0…6 outward: Mercury → Saturn */
export interface SystemRingStyle {
  /** Index into `board.rings` */
  ringIndex: number;
  name: string;
  rgb: Rgb;
}

/**
 * Outermost first for paint order documentation; draw loop may reverse.
 * Indices match `createV0Board` ringRadii.
 */
export const SYSTEM_RING_STYLES: readonly SystemRingStyle[] = [
  { ringIndex: 6, name: "Saturn", rgb: [212, 185, 95] },
  { ringIndex: 5, name: "Jupiter", rgb: [210, 140, 75] },
  { ringIndex: 4, name: "Belt", rgb: [150, 115, 75] },
  { ringIndex: 3, name: "Mars", rgb: [190, 95, 75] },
  { ringIndex: 2, name: "Earth", rgb: [90, 145, 175] },
  { ringIndex: 1, name: "Venus", rgb: [175, 150, 100] },
  { ringIndex: 0, name: "Mercury", rgb: [140, 140, 145] },
] as const;

export function rgba(rgb: Rgb, a: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
}

/**
 * Fill the annulus between outer and inner ring radii (canvas pixels)
 * with a radial gradient (stronger at outer edge).
 */
/** Clamp paint alpha after slider multiply (strokes/fills above 1 are useless). */
export function ringPaintAlpha(peak: number, scale: number): number {
  return Math.min(1, Math.max(0, peak * scale));
}

export function fillRingBand(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  rgb: Rgb,
  aOuter: number = RING_BAND_OUTER_ALPHA,
  aInner: number = RING_BAND_INNER_ALPHA,
): void {
  const ao = Math.min(1, Math.max(0, aOuter));
  const ai = Math.min(1, Math.max(0, aInner));
  if (rOuter <= rInner + 0.5 || (ao <= 0 && ai <= 0)) return;
  const g = ctx.createRadialGradient(cx, cy, Math.max(0, rInner), cx, cy, rOuter);
  g.addColorStop(0, rgba(rgb, ai));
  g.addColorStop(1, rgba(rgb, ao));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
  ctx.arc(cx, cy, Math.max(0, rInner), 0, Math.PI * 2, true);
  ctx.fill("evenodd");
}

export function strokeDashedRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rgb: Rgb,
  alpha: number,
  lineWidth = 1.75,
): void {
  const a = Math.min(1, Math.max(0, alpha));
  if (a <= 0 || r <= 0) return;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(rgb, a);
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([4, 8]);
  ctx.stroke();
  ctx.setLineDash([]);
}
