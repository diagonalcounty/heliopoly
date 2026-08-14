/**
 * Stylized system ring bands (#101).
 *
 * Each orbital ring gets a tinted dashed stroke plus a radial band that
 * falls off toward the next *inner* ring. Colors are stylized planet
 * hues for dark-UI harmony, not scientific albedos.
 *
 * Playtest lock (2026-08 preview):
 *   band outer α 0.17 · band inner α 0.02 · dashed α 0.90 · legacy blue α 0.29
 *   all seven rings on (Saturn…Mercury)
 */

/** Opacity of the band fill at the system’s dashed (outer) ring. */
export const RING_BAND_OUTER_ALPHA = 0.17;
/** Opacity of the band fill where it meets the next inner ring. */
export const RING_BAND_INNER_ALPHA = 0.02;
/** Opacity of the colored dashed ring stroke. */
export const RING_DASH_ALPHA = 0.9;
/** Underlay of the old cool-blue dashed rings. */
export const RING_LEGACY_BLUE_ALPHA = 0.29;

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
  if (rOuter <= rInner + 0.5 || aOuter <= 0 && aInner <= 0) return;
  const g = ctx.createRadialGradient(cx, cy, Math.max(0, rInner), cx, cy, rOuter);
  g.addColorStop(0, rgba(rgb, aInner));
  g.addColorStop(1, rgba(rgb, aOuter));
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
  if (alpha <= 0 || r <= 0) return;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(rgb, alpha);
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([4, 8]);
  ctx.stroke();
  ctx.setLineDash([]);
}
