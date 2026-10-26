import { createV0Board, nodeList } from "./core/board";
import {
  LANE_STROKE_WIDTH,
  laneStrokeStyle,
  sampleLaneCurve,
  sampleLanePolyline,
} from "./core/laneCurve";
import {
  RING_BAND_INNER_ALPHA,
  RING_BAND_OUTER_ALPHA,
  RING_DASH_ALPHA,
  RING_LEGACY_BLUE_ALPHA,
  SYSTEM_RING_STYLES,
  fillRingBand,
  ringPaintAlpha,
  strokeDashedRing,
} from "./core/ringBands";
import { walkMovePath } from "./core/path";
import { rocketTitle } from "./core/pilotNames";
import {
  effectiveBreakFuelCost,
  effectiveMoveDirection,
  getLegalActions,
} from "./core/rules";
import { currentPlayer } from "./core/state";
import type { Board, GameState } from "./core/types";
import {
  bodyRadius,
  drawBodyIcon,
  drawClaimHalo,
  drawFuelDepotIcon,
  drawRocketToken,
} from "./bodyIcons";

/** Travel path preview after roll (#15) — hit targets for click-to-land. */
export type RouteStopHit = {
  stopIndex: number;
  nodeId: string;
  moveSteps: number;
  breakSpaces: number;
  breakFuel: number;
  affordable: boolean;
  x: number;
  y: number;
};
export type RouteSegHit = {
  stopIndex: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
export type RoutePreview = {
  color: string;
  selectedBreak: number;
  total: number;
  stops: RouteStopHit[];
  segs: RouteSegHit[];
  poly: { x: number; y: number }[];
};

/** Everything `renderBoard` reads from main.ts module state. */
export type BoardView = {
  state: GameState | null;
  animating: boolean;
  ringOpacityScale: number;
  routeHoverStop: number | null;
  routePreviewReady: boolean;
  shipNodeId: (playerId: string, logicalPos: string) => string;
  visualNode: Record<string, string>;
};

/** Map board unit coords → canvas pixels so every node + label fits. */
export function boardProjector(board: ReturnType<typeof createV0Board>, w: number, h: number) {
  const nodes = nodeList(board);
  let minX = 0.5;
  let minY = 0.5;
  let maxX = 0.5;
  let maxY = 0.5;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x);
    maxY = Math.max(maxY, n.y);
  }
  // Include full outer ring around sun (0.5, 0.5)
  for (const r of board.rings) {
    minX = Math.min(minX, 0.5 - r);
    minY = Math.min(minY, 0.5 - r);
    maxX = Math.max(maxX, 0.5 + r);
    maxY = Math.max(maxY, 0.5 + r);
  }
  const bw = Math.max(0.01, maxX - minX);
  const bh = Math.max(0.01, maxY - minY);
  // Padding for labels / ships (pixels)
  const margin = 48;
  const scale = Math.min((w - 2 * margin) / bw, (h - 2 * margin) / bh);
  const ox = (w - scale * bw) / 2 - scale * minX;
  const oy = (h - scale * bh) / 2 - scale * minY;
  const project = (x: number, y: number) => ({
    x: ox + scale * x,
    y: oy + scale * y,
  });
  const sun = project(0.5, 0.5);
  return { project, sun, scale };
}

/** Static star field + void (regenerated only when canvas size changes). */
let starFieldCache: { w: number; h: number; canvas: HTMLCanvasElement } | null =
  null;

function getStarField(w: number, h: number): HTMLCanvasElement {
  if (starFieldCache && starFieldCache.w === w && starFieldCache.h === h) {
    return starFieldCache.canvas;
  }
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const sctx = c.getContext("2d")!;
  sctx.fillStyle = "#050814";
  sctx.fillRect(0, 0, w, h);
  sctx.fillStyle = "rgba(255,255,255,0.4)";
  for (let i = 0; i < 120; i++) {
    const x = ((i * 97) % w) + (i % 7);
    const y = ((i * 53) % h) + (i % 11);
    sctx.fillRect(x, y, i % 6 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1);
  }
  starFieldCache = { w, h, canvas: c };
  return c;
}

export function renderBoard(
  ctx: CanvasRenderingContext2D,
  view: BoardView,
): {
  project: {
    project: (x: number, y: number) => { x: number; y: number };
    board: Board;
  };
  routePreview: RoutePreview | null;
} {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(getStarField(w, h), 0, 0);

  const board = view.state?.board ?? createV0Board();
  const { project, sun, scale } = boardProjector(board, w, h);
  const lastProject = { project, board };
  let lastRoutePreview: RoutePreview | null = null;
  const cx = sun.x;
  const cy = sun.y;

  // Orbital rings (#101): legacy blue underlay + system bands + tinted dashes
  // Player can dim via Pilot Controls “Rings” slider (ringOpacityScale ≤ 1).
  const ringPx = board.rings.map((rNorm) => rNorm * scale);
  const ringMul = view.ringOpacityScale;
  const legacyA = ringPaintAlpha(RING_LEGACY_BLUE_ALPHA, ringMul);
  if (legacyA > 0) {
    for (const r of ringPx) {
      strokeDashedRing(ctx, cx, cy, r, [110, 180, 255], legacyA, 1.5);
    }
  }
  // Bands outer→inner (Saturn…Mercury) so falloff meets next inner ring
  for (let i = board.rings.length - 1; i >= 0; i--) {
    const style = SYSTEM_RING_STYLES.find((s) => s.ringIndex === i);
    if (!style) continue;
    const rOuter = ringPx[i] ?? 0;
    const rInner =
      i === 0 ? (ringPx[0] ?? 0) * 0.35 : (ringPx[i - 1] ?? 0);
    fillRingBand(
      ctx,
      cx,
      cy,
      rOuter,
      rInner,
      style.rgb,
      ringPaintAlpha(RING_BAND_OUTER_ALPHA, ringMul),
      ringPaintAlpha(RING_BAND_INNER_ALPHA, ringMul),
    );
  }
  for (const style of SYSTEM_RING_STYLES) {
    const r = ringPx[style.ringIndex];
    if (r == null) continue;
    strokeDashedRing(
      ctx,
      cx,
      cy,
      r,
      style.rgb,
      ringPaintAlpha(RING_DASH_ALPHA, ringMul),
      1.75,
    );
  }

  // sun
  const sunR = Math.max(18, 28 * (scale / 900));
  const grd = ctx.createRadialGradient(cx, cy, 3, cx, cy, sunR * 1.6);
  grd.addColorStop(0, "#fff8d0");
  grd.addColorStop(0.35, "#ffc857");
  grd.addColorStop(1, "rgba(255,140,40,0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, sunR * 1.6, 0, Math.PI * 2);
  ctx.fill();

  const nodes = nodeList(board);
  const px = (n: { x: number; y: number }) => project(n.x, n.y).x;
  const py = (n: { x: number; y: number }) => project(n.x, n.y).y;

  // Path edges — curved lanes (#99); thin cyan so roll highlight stays primary
  ctx.strokeStyle = laneStrokeStyle();
  ctx.lineWidth = LANE_STROKE_WIDTH;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  let laneEdgeIndex = 0;
  const edgeIndexByKey = new Map<string, number>();
  for (const node of nodes) {
    for (const nextId of node.next) {
      const to = board.nodes[nextId];
      if (!to) continue;
      const key = `${node.id}->${nextId}`;
      edgeIndexByKey.set(key, laneEdgeIndex);
      const pts = sampleLaneCurve(
        { x: px(node), y: py(node) },
        { x: px(to), y: py(to) },
        sun,
        laneEdgeIndex,
      );
      laneEdgeIndex += 1;
      ctx.beginPath();
      ctx.moveTo(pts[0]!.x, pts[0]!.y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i]!.x, pts[i]!.y);
      }
      ctx.stroke();
    }
  }

  // Travel range preview (#15) — rocket-color curved lane + clickable landings
  if (view.state && view.routePreviewReady) {
    const p = currentPlayer(view.state);
    const total = view.state.lastRoll!.total;
    const path = walkMovePath(
      view.state.board,
      p.position,
      total,
      effectiveMoveDirection(view.state, p),
    );
    const startNode = board.nodes[p.position];
    const nodePoly: { x: number; y: number }[] = [];
    if (startNode) nodePoly.push({ x: px(startNode), y: py(startNode) });
    for (const fr of path.frames) {
      const n = board.nodes[fr.nodeId];
      if (n) nodePoly.push({ x: px(n), y: py(n) });
    }
    // Match board lane curvature; start edge index from first hop if known
    let startEdge = 0;
    if (startNode && path.frames[0]) {
      const k = `${startNode.id}->${path.frames[0].nodeId}`;
      startEdge = edgeIndexByKey.get(k) ?? 0;
    }
    const poly = sampleLanePolyline(nodePoly, sun, startEdge);
    const stops: RouteStopHit[] = [];
    for (let i = 0; i < path.stops.length; i++) {
      const nodeId = path.stops[i]!;
      const n = board.nodes[nodeId];
      if (!n) continue;
      const moveSteps = i + 1;
      const breakSpaces = total - moveSteps;
      const breakFuel = effectiveBreakFuelCost(p.freeBreakPending, breakSpaces);
      stops.push({
        stopIndex: i,
        nodeId,
        moveSteps,
        breakSpaces,
        breakFuel,
        affordable: p.fuel + 1e-9 >= breakFuel,
        x: px(n),
        y: py(n),
      });
    }
    const segs: RouteSegHit[] = [];
    let prevX = startNode ? px(startNode) : 0;
    let prevY = startNode ? py(startNode) : 0;
    for (const stop of stops) {
      segs.push({
        stopIndex: stop.stopIndex,
        x1: prevX,
        y1: prevY,
        x2: stop.x,
        y2: stop.y,
      });
      prevX = stop.x;
      prevY = stop.y;
    }
    lastRoutePreview = {
      color: p.color,
      selectedBreak: view.state.breakSpaces,
      total,
      stops,
      segs,
      poly,
    };

    if (poly.length >= 2) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = 0.28;
      // ~¾ of original thickness (was 7 / 2.25) — playtest #15
      ctx.lineWidth = 5.25;
      ctx.beginPath();
      ctx.moveTo(poly[0]!.x, poly[0]!.y);
      for (let i = 1; i < poly.length; i++) {
        ctx.lineTo(poly[i]!.x, poly[i]!.y);
      }
      ctx.stroke();
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(poly[0]!.x, poly[0]!.y);
      for (let i = 1; i < poly.length; i++) {
        ctx.lineTo(poly[i]!.x, poly[i]!.y);
      }
      ctx.stroke();
      ctx.restore();
    }

    const selBreak = view.state.breakSpaces;
    for (const stop of stops) {
      const isSel = stop.breakSpaces === selBreak;
      const isHover = view.routeHoverStop === stop.stopIndex;
      const rr = isHover || isSel ? 7 : 4.5;
      ctx.beginPath();
      ctx.arc(stop.x, stop.y, rr, 0, Math.PI * 2);
      if (!stop.affordable) {
        ctx.fillStyle = "rgba(80,80,90,0.55)";
        ctx.strokeStyle = "rgba(140,140,150,0.7)";
      } else {
        ctx.fillStyle = isSel || isHover ? p.color : "rgba(10,14,28,0.85)";
        ctx.strokeStyle = p.color;
      }
      ctx.lineWidth = isSel ? 2.5 : 1.5;
      ctx.fill();
      ctx.stroke();
    }

    if (view.routeHoverStop !== null) {
      const hs = stops.find((s) => s.stopIndex === view.routeHoverStop);
      const seg = hs ? segs[hs.stopIndex] : undefined;
      if (hs && seg) {
        const costTxt = !hs.affordable
          ? `Break −${hs.breakSpaces} · need ${hs.breakFuel} fuel`
          : hs.breakSpaces === 0
            ? `Full roll · ${hs.moveSteps} spaces · 0 fuel`
            : hs.breakFuel === 0 && p.freeBreakPending
              ? `Break −${hs.breakSpaces} · FREE (M&Ms)`
              : `Break −${hs.breakSpaces} · ${hs.breakFuel} fuel`;
        const mx = (seg.x1 + hs.x) / 2;
        const my = (seg.y1 + hs.y) / 2 - 14;
        ctx.save();
        ctx.font = "bold 11px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const tw = ctx.measureText(costTxt).width + 14;
        const th = 18;
        const bx = Math.max(tw / 2 + 4, Math.min(w - tw / 2 - 4, mx));
        const by = Math.max(th / 2 + 4, Math.min(h - th / 2 - 4, my));
        ctx.fillStyle = "rgba(8,12,24,0.92)";
        ctx.strokeStyle = hs.affordable ? p.color : "rgba(255,107,122,0.85)";
        ctx.lineWidth = 1.5;
        const rx = tw / 2;
        const ry = th / 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(bx - rx, by - ry, tw, th, 6);
        } else {
          ctx.rect(bx - rx, by - ry, tw, th);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = hs.affordable ? "#e8eefc" : "#ff9aa5";
        ctx.fillText(costTxt, bx, by);
        ctx.restore();
      }
    }
  }

  const highlight = new Set(Object.values(view.visualNode));
  const warpMode =
    !!view.state &&
    view.state.phase === "await_action" &&
    !view.animating &&
    currentPlayer(view.state).agent === "human" &&
    currentPlayer(view.state).warpCharges > 0 &&
    getLegalActions(view.state).warp;

  for (const node of nodes) {
    const x = px(node);
    const y = py(node);
    const baseR = bodyRadius(node);

    if (warpMode && node.id !== currentPlayer(view.state!).position) {
      ctx.beginPath();
      ctx.arc(x, y, baseR + 12, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(120, 220, 255, 0.85)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (highlight.has(node.id)) {
      ctx.beginPath();
      ctx.arc(x, y, baseR + 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,200,87,0.95)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    const ownerId = view.state?.owners[node.id];
    const owner = ownerId
      ? view.state?.players.find((p) => p.id === ownerId)
      : undefined;
    if (owner) {
      drawClaimHalo(ctx, x, y, baseR, owner.color);
    }

    const r = drawBodyIcon(ctx, node, x, y);

    if (view.state?.stations[node.id]) {
      drawFuelDepotIcon(ctx, x + r * 0.55, y - r * 0.55);
    }

    ctx.font = "bold 11px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    let label = node.kind === "space" ? "" : node.name;
    if (label && owner) label = `${label} · ${rocketTitle(owner)}`;
    const ly = Math.min(h - 4, y + r + 6);
    const lx = Math.max(4, Math.min(w - 4, x));
    if (label) {
      ctx.strokeStyle = "rgba(5,8,20,0.9)";
      ctx.lineWidth = 3;
      ctx.strokeText(label, lx, ly);
      ctx.fillStyle = owner ? owner.color : "rgba(232,238,252,0.96)";
      ctx.fillText(label, lx, ly);
    }
  }

  if (view.state) {
    const groups = new Map<string, typeof view.state.players>();
    for (const pl of view.state.players) {
      if (pl.eliminated) continue;
      const pos = view.shipNodeId(pl.id, pl.position);
      const list = groups.get(pos) ?? [];
      list.push(pl);
      groups.set(pos, list);
    }
    for (const [pos, ships] of groups) {
      const node = board.nodes[pos];
      if (!node) continue;
      ships.forEach((pl, i) => {
        const ang = (i / Math.max(ships.length, 1)) * Math.PI * 2;
        const x = px(node) + Math.cos(ang) * 18;
        const y = py(node) + Math.sin(ang) * 18;
        const moving = view.visualNode[pl.id] !== undefined;
        drawRocketToken(ctx, x, y, pl.color, moving);
      });
    }
  }
  return { project: lastProject, routePreview: lastRoutePreview };
}
