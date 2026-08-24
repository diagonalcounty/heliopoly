/**
 * Paint Ops Manual Board Legend from the same canvas draw path as the board.
 * Static SVGs in /public/handbook/legend-*.svg are not the source of truth.
 */
import { createV0Board, getNode } from "../core/board";
import {
  RING_DASH_ALPHA,
  RING_LEGACY_BLUE_ALPHA,
  RING_OPACITY_DEFAULT,
  SYSTEM_RING_STYLES,
  ringPaintAlpha,
  strokeDashedRing,
} from "../core/ringBands";
import type { BoardNode } from "../core/types";
import {
  bodyRadius,
  drawBodyIcon,
  drawClaimHalo,
  drawFuelDepotIcon,
  drawRocketToken,
} from "../bodyIcons";

const STARFIELD = "#070b14";
const LABEL_UNOWNED = "rgba(232,238,252,0.96)";
/** Default human seat color / callsign (matches createGame COLORS[0]). */
const EXAMPLE_COLOR = "#6ec8ff";
const EXAMPLE_PILOT = "Venture";

function cssSize(canvas: HTMLCanvasElement): { w: number; h: number } {
  const w = Number(canvas.dataset.w ?? canvas.getAttribute("width") ?? 48);
  const h = Number(canvas.dataset.h ?? canvas.getAttribute("height") ?? 48);
  return { w: Number.isFinite(w) && w > 0 ? w : 48, h: Number.isFinite(h) && h > 0 ? h : 48 };
}

function prep(
  canvas: HTMLCanvasElement,
): { ctx: CanvasRenderingContext2D; w: number; h: number } | null {
  const { w, h } = cssSize(canvas);
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = STARFIELD;
  ctx.fillRect(0, 0, w, h);
  return { ctx, w, h };
}

function paintStars(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  for (let i = 0; i < 28; i++) {
    const x = ((i * 97) % w) + (i % 7);
    const y = ((i * 53) % h) + (i % 11);
    ctx.fillRect(x % w, y % h, i % 6 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1);
  }
}

function bodyHalfExtent(node: BoardNode): number {
  const r = bodyRadius(node);
  const station =
    node.kind === "federation" ||
    node.id === "elon" ||
    node.id === "holst" ||
    node.id === "daktulios";
  return station ? r * 2.05 : r * 1.55;
}

function paintBody(
  ctx: CanvasRenderingContext2D,
  node: BoardNode,
  w: number,
  h: number,
  opts: { ownerColor?: string; depot?: boolean } = {},
): void {
  paintStars(ctx, w, h);
  const r = bodyRadius(node);
  const need = Math.max(bodyHalfExtent(node), opts.ownerColor ? r + 8 : 0);
  const scale = Math.min(w, h) / (need * 2);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(scale, scale);
  if (opts.ownerColor) drawClaimHalo(ctx, 0, 0, r, opts.ownerColor);
  const used = drawBodyIcon(ctx, node, 0, 0);
  if (opts.depot) drawFuelDepotIcon(ctx, used * 0.55, -used * 0.55);
  ctx.restore();
}

function paintScene(
  ctx: CanvasRenderingContext2D,
  node: BoardNode,
  w: number,
  h: number,
  opts: { ownerName?: string; ownerColor?: string; depot?: boolean } = {},
): void {
  paintStars(ctx, w, h);
  const r = bodyRadius(node);
  const cx = w / 2;
  const cy = h * 0.42;
  if (opts.ownerColor) drawClaimHalo(ctx, cx, cy, r, opts.ownerColor);
  const used = drawBodyIcon(ctx, node, cx, cy);
  if (opts.depot) drawFuelDepotIcon(ctx, cx + used * 0.55, cy - used * 0.55);

  let label = node.kind === "space" ? "" : node.name;
  if (label && opts.ownerName) label = `${label} · ${opts.ownerName}`;
  if (!label) return;
  ctx.font = "bold 11px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const ly = Math.min(h - 14, cy + used + 6);
  ctx.strokeStyle = "rgba(5,8,20,0.9)";
  ctx.lineWidth = 3;
  ctx.strokeText(label, cx, ly);
  ctx.fillStyle = opts.ownerColor ? opts.ownerColor : LABEL_UNOWNED;
  ctx.fillText(label, cx, ly);
}

function paintRocket(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  moving: boolean,
): void {
  paintStars(ctx, w, h);
  drawRocketToken(ctx, w / 2, h / 2, EXAMPLE_COLOR, moving);
}

function paintRings(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  paintStars(ctx, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) * 0.42;
  const mul = RING_OPACITY_DEFAULT;
  strokeDashedRing(
    ctx,
    cx,
    cy,
    maxR,
    [110, 180, 255],
    ringPaintAlpha(RING_LEGACY_BLUE_ALPHA, mul),
    1.5,
  );
  const named = ["Saturn", "Jupiter", "Mars"] as const;
  const fracs = [1, 0.72, 0.48];
  named.forEach((name, i) => {
    const style = SYSTEM_RING_STYLES.find((s) => s.name === name);
    if (!style) return;
    strokeDashedRing(
      ctx,
      cx,
      cy,
      maxR * (fracs[i] ?? 1),
      style.rgb,
      ringPaintAlpha(RING_DASH_ALPHA, mul),
      1.5,
    );
  });
  const sunR = 5;
  const grd = ctx.createRadialGradient(cx, cy, 1, cx, cy, sunR * 1.6);
  grd.addColorStop(0, "#fff8d0");
  grd.addColorStop(0.35, "#ffc857");
  grd.addColorStop(1, "rgba(255,140,40,0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, sunR * 1.6, 0, Math.PI * 2);
  ctx.fill();
}

/** Fill every `canvas[data-legend]` under `root` (the handbook article). */
export function paintHandbookLegend(root: HTMLElement): void {
  const canvases = root.querySelectorAll<HTMLCanvasElement>("canvas[data-legend]");
  if (canvases.length === 0) return;
  const board = createV0Board();

  for (const canvas of canvases) {
    const kind = canvas.dataset.legend ?? "";
    const prepared = prep(canvas);
    if (!prepared) continue;
    const { ctx, w, h } = prepared;

    if (kind === "rocket") {
      paintRocket(ctx, w, h, canvas.dataset.moving === "1");
      continue;
    }
    if (kind === "rings") {
      paintRings(ctx, w, h);
      continue;
    }

    const nodeId = canvas.dataset.node;
    if (!nodeId) continue;
    let node: BoardNode;
    try {
      node = getNode(board, nodeId);
    } catch {
      continue;
    }
    const ownerColor =
      canvas.dataset.owner === "1" ? EXAMPLE_COLOR : undefined;
    const ownerName = ownerColor ? EXAMPLE_PILOT : undefined;
    const depot = canvas.dataset.depot === "1";

    if (kind === "scene") {
      paintScene(ctx, node, w, h, { ownerName, ownerColor, depot });
    } else {
      paintBody(ctx, node, w, h, { ownerColor, depot });
    }
  }
}
