/**
 * Curved Mainline travel lanes (#99).
 *
 * Straight chords made the path feel like a wireframe polygon; the long
 * homeward hop to Earth did not read as a casual orbital return. We draw
 * polar mid-span bulges that alternate slightly outward / inward so the
 * circuit feels like trajectories, not ruler lines.
 *
 * Playtest lock (2026-08): outward 0.08, inward 0.09, alternate on.
 */

/** Mid-span radial bulge away from the sun (even edges when alternating). */
export const LANE_CURVE_OUTWARD = 0.08;
/** Mid-span radial bulge toward the sun (odd edges when alternating). */
export const LANE_CURVE_INWARD = 0.09;
/** Gold travel-lane stroke alpha (playtest #101 with ring bands). */
export const LANE_STROKE_ALPHA = 0.74;

export interface LanePoint {
  x: number;
  y: number;
}

/**
 * Sample points along one path edge A→B in **canvas** (or any linear) space.
 * `sun` is the projected sun origin; points are already projected.
 *
 * @param edgeIndex stable index in draw order (even → out, odd → in)
 */
export function sampleLaneCurve(
  from: LanePoint,
  to: LanePoint,
  sun: LanePoint,
  edgeIndex: number,
  outward: number = LANE_CURVE_OUTWARD,
  inward: number = LANE_CURVE_INWARD,
): LanePoint[] {
  const dir = edgeIndex % 2 === 0 ? 1 : -1;
  const curve = dir > 0 ? outward : inward;

  if (curve <= 1e-6) {
    return [from, to];
  }

  const angA = Math.atan2(from.y - sun.y, from.x - sun.x);
  const angB = Math.atan2(to.y - sun.y, to.x - sun.x);
  let dAng = angB - angA;
  while (dAng > Math.PI) dAng -= Math.PI * 2;
  while (dAng < -Math.PI) dAng += Math.PI * 2;

  const ra = Math.hypot(from.x - sun.x, from.y - sun.y);
  const rb = Math.hypot(to.x - sun.x, to.y - sun.y);
  const rBase = (ra + rb) / 2 || 1;
  const chord = Math.hypot(to.x - from.x, to.y - from.y);
  const maxDev = curve * Math.min(rBase * 0.55, chord * 0.85 + rBase * 0.12);

  const steps = Math.max(
    12,
    Math.ceil(Math.abs(dAng) * 28) + Math.ceil(chord / 16),
  );
  const pts: LanePoint[] = [from];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const ang = angA + dAng * t;
    let r = ra + (rb - ra) * t;
    const mid = Math.sin(t * Math.PI);
    r += dir * maxDev * mid;
    r = Math.max(r, rBase * 0.08);
    pts.push({
      x: sun.x + Math.cos(ang) * r,
      y: sun.y + Math.sin(ang) * r,
    });
  }
  // Ensure exact endpoint (float drift)
  pts[pts.length - 1] = to;
  return pts;
}

/** Concatenate curves along a polyline of node positions (for route preview). */
export function sampleLanePolyline(
  nodes: LanePoint[],
  sun: LanePoint,
  startEdgeIndex: number,
  outward: number = LANE_CURVE_OUTWARD,
  inward: number = LANE_CURVE_INWARD,
): LanePoint[] {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) return [nodes[0]!];
  const out: LanePoint[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const seg = sampleLaneCurve(
      nodes[i]!,
      nodes[i + 1]!,
      sun,
      startEdgeIndex + i,
      outward,
      inward,
    );
    if (i === 0) out.push(...seg);
    else out.push(...seg.slice(1));
  }
  return out;
}
