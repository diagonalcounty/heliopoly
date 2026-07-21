import { heuristicAI } from "./core/agents";
import { createV0Board, getNode, isPurchasable, nodeList } from "./core/board";
import { formatMoney } from "./core/currency";
import { gravityClassOf, leaveBurnCost } from "./core/fuel";
import { walkMovePath } from "./core/path";
import { PROPELLANTS } from "./core/propellant";
import { applyAction, getLegalActions } from "./core/rules";
import { createGame, currentPlayer } from "./core/state";
import type { GameState, PlayerAction, PropellantId } from "./core/types";
import { mountHandbook } from "./handbook/handbook";

let state: GameState | null = null;
/** While animating, ship drawn at this node instead of logical state. */
let visualNode: Record<string, string> = {};
let animating = false;

/** Dwell on each resting space (ms). Pass-through gravity is shorter. */
const DWELL_STOP_MS = 420;
const DWELL_PASS_MS = 140;
const DWELL_AI_STOP_MS = 280;
const DWELL_AI_PASS_MS = 90;

const handbook = mountHandbook(
  document.getElementById("handbook-root") as HTMLElement,
);

document.getElementById("btn-handbook")?.addEventListener("click", () => {
  handbook.open();
});
document.getElementById("btn-handbook-header")?.addEventListener("click", () => {
  handbook.open();
});

const canvas = document.getElementById("board") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const logEl = document.getElementById("log")!;
const playersEl = document.getElementById("players")!;
const turnInfo = document.getElementById("turn-info")!;

const btnNew = document.getElementById("btn-new") as HTMLButtonElement;
const btnSelf = document.getElementById("btn-selfplay") as HTMLButtonElement;
const btnRefuel = document.getElementById("btn-refuel") as HTMLButtonElement;
const btnRoll = document.getElementById("btn-roll") as HTMLButtonElement;
const btnBuy = document.getElementById("btn-buy") as HTMLButtonElement;
const btnStation = document.getElementById("btn-station") as HTMLButtonElement;
const btnEnd = document.getElementById("btn-end") as HTMLButtonElement;
const playerCountInput = document.getElementById(
  "player-count",
) as HTMLInputElement;
const includeHuman = document.getElementById(
  "include-human",
) as HTMLInputElement;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function selectedPropellant(): PropellantId {
  const el = document.querySelector(
    'input[name="propellant"]:checked',
  ) as HTMLInputElement | null;
  return el?.value === "hydrogen" ? "hydrogen" : "methane";
}

function setBusy(busy: boolean): void {
  animating = busy;
  for (const b of [btnRefuel, btnRoll, btnBuy, btnStation, btnEnd, btnNew, btnSelf]) {
    if (busy) b.disabled = true;
  }
  if (!busy) renderSide();
}

function shipNodeId(playerId: string, logicalPos: string): string {
  return visualNode[playerId] ?? logicalPos;
}

/**
 * Show ship hop along path frames (each die stop, plus brief gravity flashes).
 */
async function animatePath(
  playerId: string,
  frames: { nodeId: string; passThrough: boolean }[],
  ai: boolean,
): Promise<void> {
  if (frames.length === 0) return;
  const stopMs = ai ? DWELL_AI_STOP_MS : DWELL_STOP_MS;
  const passMs = ai ? DWELL_AI_PASS_MS : DWELL_PASS_MS;
  for (const frame of frames) {
    visualNode[playerId] = frame.nodeId;
    drawBoard();
    await sleep(frame.passThrough ? passMs : stopMs);
  }
  delete visualNode[playerId];
}

async function applyActionAnimated(
  before: GameState,
  action: PlayerAction,
): Promise<GameState> {
  const actor = currentPlayer(before);
  const from = actor.position;
  const after = applyAction(before, action);

  if (action.type === "roll") {
    const afterActor = after.players.find((p) => p.id === actor.id)!;
    const moved = afterActor.position !== from;
    const steps = after.lastRoll?.total ?? 0;
    if (moved && steps > 0) {
      const path = walkMovePath(before.board, from, steps);
      // Safety: path end should match rules
      if (path.endId !== afterActor.position) {
        console.warn("path/rules mismatch", path.endId, afterActor.position);
      }
      await animatePath(actor.id, path.frames, actor.agent === "ai");
    }
  }

  return after;
}

async function runAiUntilHumanOrEnd(s: GameState): Promise<GameState> {
  let cur = s;
  let guard = 0;
  while (guard++ < 500 && cur.phase !== "game_over") {
    const p = currentPlayer(cur);
    if (!p.eliminated && p.agent === "human") break;
    if (p.eliminated) {
      cur = applyAction(cur, { type: "end_turn" });
      state = cur;
      render();
      continue;
    }
    const action = heuristicAI(cur);
    cur = await applyActionAnimated(cur, action);
    state = cur;
    render();
    // Brief pause between AI turns so the log is readable
    if (action.type !== "roll") await sleep(180);
  }
  return cur;
}

async function commitState(next: GameState): Promise<void> {
  state = next;
  render();
  if (state.phase !== "game_over") {
    setBusy(true);
    try {
      state = await runAiUntilHumanOrEnd(state);
    } finally {
      setBusy(false);
    }
  }
  render();
}

async function act(action: PlayerAction): Promise<void> {
  if (!state || state.phase === "game_over" || animating) return;
  const p = currentPlayer(state);
  if (p.agent !== "human") return;
  setBusy(true);
  try {
    const after = await applyActionAnimated(state, action);
    state = after;
    render();
    if (state.phase !== "game_over") {
      state = await runAiUntilHumanOrEnd(state);
    }
  } finally {
    setBusy(false);
  }
  render();
}

function startGame(human: boolean): void {
  if (animating) return;
  const count = Number(playerCountInput.value) || 4;
  visualNode = {};
  void commitState(
    createGame({
      playerCount: count,
      humanSeat: human,
      humanPropellant: selectedPropellant(),
      seed: Date.now() >>> 0,
    }),
  );
}

btnNew.addEventListener("click", () => startGame(includeHuman.checked));
btnSelf.addEventListener("click", () => {
  if (animating) return;
  includeHuman.checked = false;
  visualNode = {};
  // Instant burst for balance smoke — no animation
  let s = createGame({
    playerCount: Number(playerCountInput.value) || 4,
    humanSeat: false,
    seed: Date.now() >>> 0,
  });
  for (let i = 0; i < 80 && s.phase !== "game_over"; i++) {
    s = applyAction(s, heuristicAI(s));
  }
  state = s;
  render();
});

btnRefuel.addEventListener("click", () => {
  if (!state) return;
  const legal = getLegalActions(state);
  void act({ type: "refuel", amount: Math.min(legal.refuelMax, 10) });
});
btnRoll.addEventListener("click", () => {
  void act({ type: "roll" });
});
btnBuy.addEventListener("click", () => void act({ type: "buy" }));
btnStation.addEventListener("click", () => void act({ type: "place_station" }));
btnEnd.addEventListener("click", () => void act({ type: "end_turn" }));

function render(): void {
  drawBoard();
  renderSide();
}

function renderSide(): void {
  if (!state) {
    turnInfo.textContent = "No game yet. Choose propellant and Launch.";
    logEl.textContent = "";
    playersEl.innerHTML = "";
    for (const b of [btnRefuel, btnRoll, btnBuy, btnStation, btnEnd]) {
      b.disabled = true;
    }
    return;
  }

  const p = currentPlayer(state);
  const legal = getLegalActions(state);
  const node = getNode(state.board, p.position);
  const g = gravityClassOf(node);
  const previewSteps = state.lastRoll?.total ?? 7;
  const leaveCost = leaveBurnCost(node, previewSteps, p.propellant);
  const prop = PROPELLANTS[p.propellant];

  turnInfo.textContent = [
    animating ? "… ship moving …" : `Round ${state.round} · ${state.phase}`,
    `${p.name} @ ${node.name} (g${g})`,
    `${formatMoney(p.cash)} · fuel ${p.fuel}/${state.config.maxFuel} · ${prop.short}`,
    leaveCost > 0
      ? `Leave burn @ roll ${previewSteps}: ${leaveCost} fuel (have ${p.fuel})`
      : `Leave burn: free (no gravity well)`,
    state.lastRoll
      ? `Last roll: ${state.lastRoll.d1}+${state.lastRoll.d2}=${state.lastRoll.total}`
      : "Last roll: —",
    state.winnerId
      ? `WINNER: ${state.players.find((x) => x.id === state!.winnerId)?.name}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const can = !animating && p.agent === "human" && state.phase !== "game_over";
  btnRefuel.disabled = !can || !legal.refuel;
  btnRoll.disabled = !can || !legal.roll;
  btnBuy.disabled = !can || !legal.buy;
  btnStation.disabled = !can || !legal.placeStation;
  btnEnd.disabled = !can || !legal.endTurn;
  btnNew.disabled = animating;
  btnSelf.disabled = animating;

  if (legal.buy) btnBuy.textContent = `Buy (${formatMoney(legal.buyPrice)})`;
  else btnBuy.textContent = "Buy";

  playersEl.innerHTML = state.players
    .map((pl) => {
      const active = pl.id === p.id && state!.phase !== "game_over";
      const props = pl.properties.length;
      const plProp = PROPELLANTS[pl.propellant].short;
      const shown = shipNodeId(pl.id, pl.position);
      const at = getNode(state!.board, shown).name;
      return `<div class="player-row${active ? " active" : ""}${pl.eliminated ? " out" : ""}">
        <div class="swatch" style="background:${pl.color}"></div>
        <div>
          <strong>${pl.name}</strong>${pl.eliminated ? " · OUT" : ""} · ${plProp}
          <div>${formatMoney(pl.cash)} · ${pl.fuel} fuel · ${props} claims · sta ${pl.stationsInHand}</div>
          <div style="color:#9aa8c7">${at}${shown !== pl.position ? " …" : ""}</div>
        </div>
      </div>`;
    })
    .join("");

  logEl.textContent = "";
  for (const line of state.log.slice(-50)) {
    const div = document.createElement("div");
    if (/Winner|claims|collects|Heliopoly/.test(line)) div.className = "ok";
    else if (
      /eliminated|bankruptcy|stranded|cannot leave|boil-off|glitch/.test(line)
    )
      div.className = "bad";
    else if (/rolls|Round|burns|pulled through/.test(line)) div.className = "warn";
    div.textContent = line;
    logEl.appendChild(div);
  }
  logEl.scrollTop = logEl.scrollHeight;
}

function drawBoard(): void {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "#070b16";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 80; i++) {
    const x = ((i * 97) % w) + (i % 7);
    const y = ((i * 53) % h) + (i % 11);
    ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
  }

  const sunX = w * 0.48;
  const sunY = h * 0.48;
  const grd = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 48);
  grd.addColorStop(0, "#fff3c4");
  grd.addColorStop(0.4, "#ffc857");
  grd.addColorStop(1, "rgba(255,160,40,0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 48, 0, Math.PI * 2);
  ctx.fill();

  const board = state?.board ?? createV0Board();
  const nodes = nodeList(board);

  const px = (n: { x: number; y: number }) => n.x * w;
  const py = (n: { x: number; y: number }) => n.y * h;

  ctx.strokeStyle = "rgba(110,200,255,0.35)";
  ctx.lineWidth = 2;
  for (const node of nodes) {
    for (const nextId of node.next) {
      const to = board.nodes[nextId];
      if (!to) continue;
      ctx.beginPath();
      ctx.moveTo(px(node), py(node));
      ctx.lineTo(px(to), py(to));
      ctx.stroke();
    }
  }

  // Highlight nodes currently occupied by a moving ship
  const highlight = new Set(Object.values(visualNode));

  for (const node of nodes) {
    const x = px(node);
    const y = py(node);
    let r = 10;
    let fill = "#3a4a6e";
    if (node.kind === "planet") {
      r = 16;
      fill = "#6ec8ff";
    }
    if (node.kind === "moon") {
      r = 12;
      fill = "#c792ea";
    }
    if (node.kind === "federation") {
      r = 14;
      fill = "#ffc857";
    }
    if (node.kind === "dock") {
      r = 12;
      fill = "#5ddea0";
    }
    if (node.kind === "gravity") {
      r = 8;
      fill = "#1a1a28";
    }
    if (node.id === "earth") fill = "#5ddea0";

    if (highlight.has(node.id)) {
      ctx.beginPath();
      ctx.arc(x, y, r + 8, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,200,87,0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const ownerId = state?.owners[node.id];
    if (ownerId && state) {
      const owner = state.players.find((p) => p.id === ownerId);
      if (owner) {
        ctx.beginPath();
        ctx.arc(x, y, r + 5, 0, Math.PI * 2);
        ctx.strokeStyle = owner.color;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    if (state?.stations[node.id]) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 4, y - 4, 8, 8);
    }

    ctx.fillStyle = "rgba(232,238,252,0.9)";
    ctx.font = "11px system-ui";
    ctx.textAlign = "center";
    const gv = gravityClassOf(node);
    const label = gv > 0 ? `${node.name} g${gv}` : node.name;
    ctx.fillText(label, x, y + r + 14);
  }

  if (state) {
    const groups = new Map<string, typeof state.players>();
    for (const pl of state.players) {
      if (pl.eliminated) continue;
      const pos = shipNodeId(pl.id, pl.position);
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
        const moving = visualNode[pl.id] !== undefined;
        ctx.beginPath();
        ctx.moveTo(x, y - 9);
        ctx.lineTo(x + 7, y + 7);
        ctx.lineTo(x - 7, y + 7);
        ctx.closePath();
        ctx.fillStyle = pl.color;
        ctx.fill();
        ctx.strokeStyle = moving ? "#ffc857" : "#fff";
        ctx.lineWidth = moving ? 2 : 1;
        ctx.stroke();
      });
    }
  }

  void isPurchasable;
}

drawBoard();
renderSide();
