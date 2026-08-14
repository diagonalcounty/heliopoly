/**
 * Stylized “celestial illustration” icons for the board.
 * Soft anime / poster look: gradients, rims, simple surface marks — not photoreal NASA.
 */
import type { BoardNode } from "./core/types";

export function bodyRadius(node: BoardNode): number {
  if (node.kind === "planet") {
    if (node.id === "earth") return 18;
    if (node.id === "mars") return 16;
    if (node.id === "venus") return 16;
    if (node.id === "mercury") return 13;
    return 15;
  }
  if (node.kind === "moon") return 12;
  if (node.kind === "federation") return 16;
  if (node.kind === "dock") return 13;
  if (node.kind === "gravity") return 9;
  return 8; // blank / transit
}

function disc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  c0: string,
  c1: string,
  c2?: string,
): void {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, c0);
  g.addColorStop(0.55, c1);
  g.addColorStop(1, c2 ?? c1);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  // soft rim
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // shadow crescent
  ctx.beginPath();
  ctx.arc(x + r * 0.15, y + r * 0.1, r * 0.92, -0.4, Math.PI * 0.9);
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function atmosphere(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
): void {
  const g = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 1.45);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.65, "rgba(0,0,0,0)");
  g.addColorStop(1, color);
  ctx.beginPath();
  ctx.arc(x, y, r * 1.45, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
}

/** Stylized orbital station: ring + core + solar panels (not a plain circle). */
function drawStation(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  accent: string,
): void {
  // soft glow
  const glow = ctx.createRadialGradient(x, y, 2, x, y, r * 1.8);
  glow.addColorStop(0, "rgba(180,220,255,0.35)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // outer habitat ring
  ctx.beginPath();
  ctx.arc(x, y, r * 0.95, 0, Math.PI * 2);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // spokes
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + 0.2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 0.25, y + Math.sin(a) * r * 0.25);
    ctx.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9);
    ctx.strokeStyle = "rgba(200,220,255,0.55)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // core
  disc(ctx, x, y, r * 0.32, "#ffffff", accent, "#2a3a55");

  // solar panels (left / right)
  const panelW = r * 0.55;
  const panelH = r * 0.28;
  ctx.fillStyle = "rgba(80,140,220,0.85)";
  ctx.strokeStyle = "rgba(200,230,255,0.8)";
  ctx.lineWidth = 1;
  // left
  ctx.fillRect(x - r * 1.35, y - panelH / 2, panelW, panelH);
  ctx.strokeRect(x - r * 1.35, y - panelH / 2, panelW, panelH);
  // right
  ctx.fillRect(x + r * 0.8, y - panelH / 2, panelW, panelH);
  ctx.strokeRect(x + r * 0.8, y - panelH / 2, panelW, panelH);
  // panel lines
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  for (let i = 1; i < 3; i++) {
    const lx = x - r * 1.35 + (panelW * i) / 3;
    const rx = x + r * 0.8 + (panelW * i) / 3;
    ctx.beginPath();
    ctx.moveTo(lx, y - panelH / 2);
    ctx.lineTo(lx, y + panelH / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx, y - panelH / 2);
    ctx.lineTo(rx, y + panelH / 2);
    ctx.stroke();
  }

  // tiny docking lights
  ctx.fillStyle = "#7dffa0";
  ctx.beginPath();
  ctx.arc(x, y - r * 0.95, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff8a8a";
  ctx.beginPath();
  ctx.arc(x, y + r * 0.95, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawEarth(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  atmosphere(ctx, x, y, r, "rgba(100,180,255,0.35)");
  disc(ctx, x, y, r, "#b8e0ff", "#3d8fd4", "#1a4a7a");
  // continents (stylized blobs)
  ctx.fillStyle = "rgba(90,170,90,0.75)";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.2, y - r * 0.1, r * 0.35, r * 0.45, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.25, y + r * 0.2, r * 0.28, r * 0.22, 0.5, 0, Math.PI * 2);
  ctx.fill();
  // cloud streaks
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y + r * 0.15);
  ctx.quadraticCurveTo(x, y + r * 0.05, x + r * 0.55, y + r * 0.2);
  ctx.stroke();
}

function drawMars(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  atmosphere(ctx, x, y, r, "rgba(255,120,80,0.2)");
  disc(ctx, x, y, r, "#ffb088", "#c45c3a", "#6b2a18");
  ctx.fillStyle = "rgba(90,40,30,0.35)";
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.15, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.2, y + r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  // ice cap
  ctx.fillStyle = "rgba(240,248,255,0.85)";
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.65, r * 0.35, r * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawVenus(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  atmosphere(ctx, x, y, r, "rgba(255,220,120,0.3)");
  disc(ctx, x, y, r, "#fff2c8", "#e8c878", "#b8893a");
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(x - r * 0.7, y + i * r * 0.25);
    ctx.quadraticCurveTo(x, y + i * r * 0.15 - r * 0.05, x + r * 0.7, y + i * r * 0.28);
    ctx.stroke();
  }
}

function drawMercury(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  disc(ctx, x, y, r, "#e8e4dc", "#9a958c", "#4a4844");
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  for (const [dx, dy, cr] of [
    [-0.3, -0.2, 0.18],
    [0.25, 0.15, 0.14],
    [0.1, -0.35, 0.1],
    [-0.15, 0.3, 0.12],
  ] as const) {
    ctx.beginPath();
    ctx.arc(x + r * dx, y + r * dy, r * cr, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMoon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  palette: "jupiter" | "saturn" | "mars" | "neutral",
): void {
  if (palette === "jupiter") {
    disc(ctx, x, y, r, "#ffd4a0", "#ff9f43", "#c45f12");
  } else if (palette === "saturn") {
    disc(ctx, x, y, r, "#fff9d6", "#f6e58d", "#c4a84a");
  } else if (palette === "mars") {
    disc(ctx, x, y, r, "#ddd5d0", "#8a8078", "#3d3835");
  } else {
    disc(ctx, x, y, r, "#f0eef5", "#b0a8c0", "#5a5468");
  }
  // craters
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.15, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.2, y + r * 0.2, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function drawBlankTransit(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  combatLane: boolean,
): void {
  // small diamond / beacon rather than a blob
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  const s = r * 0.9;
  const g = ctx.createLinearGradient(-s, -s, s, s);
  if (combatLane) {
    g.addColorStop(0, "rgba(255,120,100,0.5)");
    g.addColorStop(1, "rgba(80,40,60,0.8)");
  } else {
    g.addColorStop(0, "rgba(140,170,220,0.45)");
    g.addColorStop(1, "rgba(40,50,80,0.75)");
  }
  ctx.fillStyle = g;
  ctx.fillRect(-s / 2, -s / 2, s, s);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(-s / 2, -s / 2, s, s);
  ctx.restore();
  ctx.fillStyle = combatLane ? "rgba(255,180,160,0.9)" : "rgba(200,220,255,0.7)";
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw a board body icon. Returns the visual radius used (for rings/labels).
 */
export function drawBodyIcon(
  ctx: CanvasRenderingContext2D,
  node: BoardNode,
  x: number,
  y: number,
): number {
  const r = bodyRadius(node);

  if (node.kind === "space") {
    const combat =
      node.id.startsWith("belt") ||
      node.id.startsWith("j_b") ||
      node.id.startsWith("s_b") ||
      node.name.includes("Transit") ||
      node.name === "Belt" ||
      node.name === "Homeward";
    drawBlankTransit(ctx, x, y, r, combat);
    return r;
  }

  if (node.kind === "federation" || node.id === "elon" || node.id === "holst" || node.id === "daktulios") {
    let accent = "#c9e4ff";
    if (node.id === "elon") accent = "#ff8c5a";
    if (node.id === "holst") accent = "#ffb347";
    if (node.id === "daktulios") accent = "#ffe566";
    drawStation(ctx, x, y, r, accent);
    return r * 1.15;
  }

  if (node.id === "earth") {
    drawEarth(ctx, x, y, r);
    return r;
  }
  if (node.id === "mars") {
    drawMars(ctx, x, y, r);
    return r;
  }
  if (node.id === "venus") {
    drawVenus(ctx, x, y, r);
    return r;
  }
  if (node.id === "mercury") {
    drawMercury(ctx, x, y, r);
    return r;
  }

  if (node.kind === "moon") {
    if (node.paint === "jupiter-moon") drawMoon(ctx, x, y, r, "jupiter");
    else if (node.paint === "saturn-moon") drawMoon(ctx, x, y, r, "saturn");
    else if (node.group === "mars") drawMoon(ctx, x, y, r, "mars");
    else drawMoon(ctx, x, y, r, "neutral");
    return r;
  }

  if (node.kind === "gravity") {
    disc(ctx, x, y, r, "#4a4060", "#1a1528", "#0a0810");
    return r;
  }

  disc(ctx, x, y, r, "#a0c4ff", "#4a6fa5", "#1e3048");
  return r;
}

export function drawFuelDepotIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  // small fuel-tank badge (reads as equipment, not another planet)
  ctx.fillStyle = "rgba(15,22,40,0.9)";
  ctx.fillRect(x - 8, y - 9, 16, 18);
  const g = ctx.createLinearGradient(x - 6, y - 7, x + 6, y + 7);
  g.addColorStop(0, "#f0f8ff");
  g.addColorStop(0.45, "#7ec8ff");
  g.addColorStop(1, "#2a6098");
  ctx.fillStyle = g;
  ctx.fillRect(x - 6, y - 7, 12, 14);
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 1.25;
  ctx.strokeRect(x - 6, y - 7, 12, 14);
  ctx.fillStyle = "#ffc857";
  ctx.fillRect(x - 4, y - 1, 8, 4);
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.strokeRect(x - 4, y - 1, 8, 4);
}
