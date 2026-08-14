/**
 * Regenerate board preview HTML from live createV0Board + paint constants.
 * Usage (repo root): node --import tsx tools/board-previews/generate.ts
 */
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createV0Board } from "../../src/core/board.ts";
import {
  LANE_CURVE_INWARD,
  LANE_CURVE_OUTWARD,
  LANE_STROKE_ALPHA,
} from "../../src/core/laneCurve.ts";
import {
  RING_BAND_INNER_ALPHA,
  RING_BAND_OUTER_ALPHA,
  RING_DASH_ALPHA,
  RING_LEGACY_BLUE_ALPHA,
  SYSTEM_RING_STYLES,
} from "../../src/core/ringBands.ts";

const dir = dirname(fileURLToPath(import.meta.url));

const board = createV0Board();
const nodes = Object.values(board.nodes);
const payload = {
  rings: board.rings,
  ringNames: ["Mercury", "Venus", "Earth", "Mars", "Belt", "Jupiter", "Saturn"],
  nodes: Object.fromEntries(
    Object.entries(board.nodes).map(([id, n]) => [
      id,
      {
        id,
        name: n.name,
        kind: n.kind,
        x: n.x,
        y: n.y,
        ring: n.ring,
        next: [...n.next],
      },
    ]),
  ),
  edges: nodes.flatMap((n) => n.next.map((t) => [n.id, t] as [string, string])),
};

const meta = {
  generatedFrom: "createV0Board()",
  generatedAt: new Date().toISOString(),
  lane: {
    outward: LANE_CURVE_OUTWARD,
    inward: LANE_CURVE_INWARD,
    strokeAlpha: LANE_STROKE_ALPHA,
  },
  rings: {
    bandOuter: RING_BAND_OUTER_ALPHA,
    bandInner: RING_BAND_INNER_ALPHA,
    dash: RING_DASH_ALPHA,
    legacyBlue: RING_LEGACY_BLUE_ALPHA,
    styles: SYSTEM_RING_STYLES,
  },
};

function patchFile(name: string): void {
  const path = join(dir, name);
  let html = readFileSync(path, "utf8");
  html = html.replace(
    /const DATA = \{[\s\S]*?\n\};\n/,
    `const DATA = ${JSON.stringify(payload)};\n`,
  );
  html = html.replace(
    /const META = \{[\s\S]*?\n\};\n/,
    `const META = ${JSON.stringify(meta)};\n`,
  );
  // Refresh default slider values to ship constants where present
  const pairs: [RegExp, string][] = [
    [/id="outCurve"[^>]*value="[0-9.]+"/, `id="outCurve" min="0" max="1" step="0.01" value="${LANE_CURVE_OUTWARD}"`],
    [/id="inCurve"[^>]*value="[0-9.]+"/, `id="inCurve" min="0" max="1" step="0.01" value="${LANE_CURVE_INWARD}"`],
    [/id="laneA"[^>]*value="[0-9.]+"/g, `id="laneA" min="0" max="1" step="0.01" value="${LANE_STROKE_ALPHA}"`],
    [/id="outerA"[^>]*value="[0-9.]+"/, `id="outerA" min="0" max="1" step="0.01" value="${RING_BAND_OUTER_ALPHA}"`],
    [/id="innerA"[^>]*value="[0-9.]+"/, `id="innerA" min="0" max="1" step="0.01" value="${RING_BAND_INNER_ALPHA}"`],
    [/id="dashA"[^>]*value="[0-9.]+"/, `id="dashA" min="0" max="1" step="0.01" value="${RING_DASH_ALPHA}"`],
    [/id="legacyA"[^>]*value="[0-9.]+"/, `id="legacyA" min="0" max="1" step="0.01" value="${RING_LEGACY_BLUE_ALPHA}"`],
  ];
  for (const [re, rep] of pairs) {
    html = html.replace(re, rep);
  }
  // displayed default labels next to sliders (first match spans)
  html = html.replace(/id="outV">[0-9.]+/, `id="outV">${LANE_CURVE_OUTWARD.toFixed(2)}`);
  html = html.replace(/id="inV">[0-9.]+/, `id="inV">${LANE_CURVE_INWARD.toFixed(2)}`);
  html = html.replace(/id="laneAV">[0-9.]+/g, `id="laneAV">${LANE_STROKE_ALPHA.toFixed(2)}`);
  html = html.replace(/id="outerAV">[0-9.]+/, `id="outerAV">${RING_BAND_OUTER_ALPHA.toFixed(2)}`);
  html = html.replace(/id="innerAV">[0-9.]+/, `id="innerAV">${RING_BAND_INNER_ALPHA.toFixed(2)}`);
  html = html.replace(/id="dashAV">[0-9.]+/, `id="dashAV">${RING_DASH_ALPHA.toFixed(2)}`);
  html = html.replace(/id="legacyAV">[0-9.]+/, `id="legacyAV">${RING_LEGACY_BLUE_ALPHA.toFixed(2)}`);
  writeFileSync(path, html);
  console.log("patched", name);
}

patchFile("elliptical-lanes.html");
patchFile("ring-colors.html");
console.log("Board snapshot nodes:", Object.keys(payload.nodes).length, "edges:", payload.edges.length);
console.log("Ship constants:", meta.lane, {
  bandOuter: meta.rings.bandOuter,
  bandInner: meta.rings.bandInner,
  dash: meta.rings.dash,
  legacy: meta.rings.legacyBlue,
});
