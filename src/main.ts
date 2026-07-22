import { heuristicAI } from "./core/agents";
import { createV0Board, getNode, isPurchasable, nodeList } from "./core/board";
import { formatMoney } from "./core/currency";
import { gravityClassOf, leaveBurnCost } from "./core/fuel";
import { walkMovePath } from "./core/path";
import { PROPELLANTS } from "./core/propellant";
import {
  applyAction,
  getLegalActions,
  meanDiceTotal,
  netWorth,
  rankings,
  resignGame,
  resolveDuelAiFully,
} from "./core/rules";
import { createGame, currentPlayer } from "./core/state";
import type {
  DuelStance,
  GameState,
  PlayerAction,
  PropellantId,
} from "./core/types";
import { bodyRadius, drawBodyIcon, drawFuelDepotIcon } from "./bodyIcons";
import { inspectBody } from "./core/inspect";
import { FERAL_ROTATIONS } from "./core/rules";
import { mountHandbook } from "./handbook/handbook";
import type { Board } from "./core/types";

let state: GameState | null = null;
let visualNode: Record<string, string> = {};
let animating = false;
/** Snapshot of deltas after a pilot ends their turn. */
let lastTurnSummary: string[] = [];
/** Last board projector for hit-testing hover */
let lastProject:
  | null
  | {
      project: (x: number, y: number) => { x: number; y: number };
      board: Board;
    } = null;

const DWELL_STOP_MS = 420;
const DWELL_PASS_MS = 140;
const DWELL_AI_STOP_MS = 280;
const DWELL_AI_PASS_MS = 90;

const handbook = mountHandbook(
  document.getElementById("handbook-root") as HTMLElement,
);

const canvas = document.getElementById("board") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const logEl = document.getElementById("log")!;
const playersEl = document.getElementById("players")!;
const turnInfo = document.getElementById("turn-info")!;
const rankingsEl = document.getElementById("rankings")!;
const turnDeltasEl = document.getElementById("turn-deltas")!;
const setupCard = document.getElementById("setup-card")!;
const setupBody = document.getElementById("setup-body")!;
const setupToggle = document.getElementById("setup-toggle")!;
const btnQuit = document.getElementById("btn-quit")!;
const duelRoot = document.getElementById("duel-root")!;
const duelMatchup = document.getElementById("duel-matchup")!;
const duelStatus = document.getElementById("duel-status")!;
const duelDice = document.getElementById("duel-dice")!;
const duelRollBtn = document.getElementById("duel-roll") as HTMLButtonElement;
const dieC1 = document.getElementById("die-c1")!;
const dieC2 = document.getElementById("die-c2")!;
const dieD1 = document.getElementById("die-d1")!;
const dieD2 = document.getElementById("die-d2")!;
const diceLabelC = document.getElementById("dice-label-c")!;
const diceLabelD = document.getElementById("dice-label-d")!;
const duelResultEl = document.getElementById("duel-result")!;
const duelResultTitle = document.getElementById("duel-result-title")!;
const duelResultBody = document.getElementById("duel-result-body")!;
const duelResultDice = document.getElementById("duel-result-dice")!;
const bodyTooltip = document.getElementById("body-tooltip")!;
const endRoot = document.getElementById("end-root")!;
const endTitle = document.getElementById("end-title")!;
const endStory = document.getElementById("end-story")!;
const endRanks = document.getElementById("end-ranks")!;

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

function setSetupCollapsed(collapsed: boolean): void {
  setupCard.classList.toggle("collapsed", collapsed);
  setupToggle.classList.toggle("hidden", !collapsed);
  setupBody.classList.toggle("hidden", collapsed);
}

function setBusy(busy: boolean): void {
  animating = busy;
  if (!busy) renderSide();
}

function shipNodeId(playerId: string, logicalPos: string): string {
  return visualNode[playerId] ?? logicalPos;
}

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

function humanDuelNeedsInput(s: GameState): boolean {
  const d = s.pendingDuel;
  if (!d || s.phase !== "await_duel") return false;
  const c = s.players.find((p) => p.id === d.challengerId)!;
  const def = s.players.find((p) => p.id === d.defenderId)!;
  if (c.agent === "human") {
    if (d.challengerStance === null) return true;
    if (
      d.challengerStance &&
      d.defenderStance &&
      d.challengerRoll === null
    )
      return true;
  }
  if (def.agent === "human") {
    if (d.defenderStance === null) return true;
    if (
      d.challengerStance &&
      d.defenderStance &&
      d.defenderRoll === null
    )
      return true;
  }
  return false;
}

function setDie(el: HTMLElement, value: number | string, rolling = false): void {
  el.textContent = String(value);
  el.classList.toggle("rolling", rolling);
}

async function animateDicePair(
  d1El: HTMLElement,
  d2El: HTMLElement,
  final: { d1: number; d2: number },
): Promise<void> {
  const frames = 12;
  for (let i = 0; i < frames; i++) {
    setDie(d1El, 1 + Math.floor(Math.random() * 6), true);
    setDie(d2El, 1 + Math.floor(Math.random() * 6), true);
    await sleep(55);
  }
  setDie(d1El, final.d1, false);
  setDie(d2El, final.d2, false);
}

function showDuelResultSplash(s: GameState): void {
  const r = s.lastDuelResult;
  if (!r) return;
  duelResultEl.classList.remove("hidden");
  duelResultEl.classList.toggle("win", r.outcome === "win");
  duelResultEl.classList.toggle("tie", r.outcome === "tie");
  const card = duelResultEl.querySelector(".duel-result-card")!;
  card.classList.toggle("win", r.outcome === "win");
  card.classList.toggle("tie", r.outcome === "tie");
  duelResultTitle.textContent =
    r.outcome === "tie" ? "Draw — both hold the lane" : `${r.winnerName} wins!`;
  duelResultBody.textContent = [
    `${r.challengerName} [${r.challengerStance.toUpperCase()}] ${r.challengerRoll.d1}+${r.challengerRoll.d2}=${r.challengerRoll.total}`,
    `${r.defenderName} [${r.defenderStance.toUpperCase()}] ${r.defenderRoll.d1}+${r.defenderRoll.d2}=${r.defenderRoll.total}`,
    `Mean ${r.mean.toFixed(2)} · ${r.nodeName}`,
    r.summary,
  ].join("\n");
  duelResultDice.innerHTML = `
    <div class="dice-pair">
      <div class="die${r.winnerName === r.challengerName ? " winner-glow" : ""}">${r.challengerRoll.d1}</div>
      <div class="die${r.winnerName === r.challengerName ? " winner-glow" : ""}">${r.challengerRoll.d2}</div>
      <span class="dice-label">${r.challengerName}</span>
    </div>
    <div class="dice-vs">vs</div>
    <div class="dice-pair">
      <div class="die${r.winnerName === r.defenderName ? " winner-glow" : ""}">${r.defenderRoll.d1}</div>
      <div class="die${r.winnerName === r.defenderName ? " winner-glow" : ""}">${r.defenderRoll.d2}</div>
      <span class="dice-label">${r.defenderName}</span>
    </div>`;
}

function hideDuelResultSplash(): void {
  duelResultEl.classList.add("hidden");
  if (state?.lastDuelResult) {
    state = { ...state, lastDuelResult: null };
  }
}

function updateDuelModal(s: GameState | null): void {
  if (!s || s.phase !== "await_duel" || !s.pendingDuel) {
    duelRoot.classList.add("hidden");
    duelRoot.setAttribute("aria-hidden", "true");
    if (!s?.lastDuelResult) document.body.classList.remove("handbook-open");
    return;
  }
  const d = s.pendingDuel;
  const c = s.players.find((p) => p.id === d.challengerId)!;
  const def = s.players.find((p) => p.id === d.defenderId)!;
  duelRoot.classList.remove("hidden");
  duelRoot.setAttribute("aria-hidden", "false");
  document.body.classList.add("handbook-open");
  duelMatchup.textContent = `${c.name} vs ${def.name} · ${getNode(s.board, d.nodeId).name}`;
  diceLabelC.textContent = c.name;
  diceLabelD.textContent = def.name;
  const mean = meanDiceTotal(s);
  duelStatus.textContent = [
    `Mean of game 2d6 totals: ${mean.toFixed(2)}`,
    `Stances hidden until both have rolled`,
    d.challengerStance && d.defenderStance
      ? "Both stances locked — roll when ready"
      : "Choose LOW or HIGH",
  ].join("\n");

  const humanIsC = c.agent === "human";
  const humanIsD = def.agent === "human";
  const needStance =
    (humanIsC && d.challengerStance === null) ||
    (humanIsD && d.defenderStance === null);
  const needRoll =
    d.challengerStance !== null &&
    d.defenderStance !== null &&
    ((humanIsC && d.challengerRoll === null) ||
      (humanIsD && d.defenderRoll === null));

  for (const btn of duelRoot.querySelectorAll<HTMLButtonElement>(
    "[data-stance]",
  )) {
    btn.disabled = !needStance || animating;
  }
  duelRollBtn.disabled = !needRoll || animating;

  if (d.challengerRoll) {
    setDie(dieC1, d.challengerRoll.d1);
    setDie(dieC2, d.challengerRoll.d2);
  } else {
    setDie(dieC1, "?");
    setDie(dieC2, "?");
  }
  if (d.defenderRoll) {
    setDie(dieD1, d.defenderRoll.d1);
    setDie(dieD2, d.defenderRoll.d2);
  } else {
    setDie(dieD1, "?");
    setDie(dieD2, "?");
  }

  const parts: string[] = [];
  if (d.challengerRoll && d.defenderRoll && d.challengerStance && d.defenderStance) {
    parts.push(
      `Stances: ${c.name}=${d.challengerStance} · ${def.name}=${d.defenderStance}`,
    );
  }
  duelDice.textContent = parts.join("\n");
}

async function maybeShowDuelResult(s: GameState): Promise<void> {
  if (!s.lastDuelResult) return;
  // Ceremony: re-animate final dice then splash
  const r = s.lastDuelResult;
  duelRoot.classList.remove("hidden");
  setDie(dieC1, "?", true);
  setDie(dieC2, "?", true);
  setDie(dieD1, "?", true);
  setDie(dieD2, "?", true);
  await animateDicePair(dieC1, dieC2, r.challengerRoll);
  await animateDicePair(dieD1, dieD2, r.defenderRoll);
  showDuelResultSplash(s);
}

function showEndScreen(s: GameState): void {
  const winner = s.players.find((p) => p.id === s.winnerId);
  endTitle.textContent = winner
    ? `${winner.name} Prevails`
    : "The Charter Closes";
  endStory.textContent =
    s.endReason ??
    "Among the orbital lanes, one enterprise outlasted the rest.";
  const rows = [...s.players]
    .filter((p) => !p.eliminated || p.id === s.winnerId)
    .sort((a, b) => netWorth(s, b) - netWorth(s, a));
  endRanks.innerHTML = rows
    .map((p, i) => {
      const mark = p.id === s.winnerId ? " ★" : "";
      return `<div>${i + 1}. ${p.name}${mark} — ${formatMoney(netWorth(s, p))}${p.eliminated ? " (out)" : ""}</div>`;
    })
    .join("");
  // Include eliminated sorted by worth 0
  const outs = s.players.filter((p) => p.eliminated && p.id !== s.winnerId);
  if (outs.length) {
    endRanks.innerHTML +=
      `<div style="margin-top:8px;opacity:0.7">Fallen: ${outs.map((p) => p.name).join(", ")}</div>`;
  }
  endRoot.classList.remove("hidden");
  endRoot.setAttribute("aria-hidden", "false");
}

function hideEndScreen(): void {
  endRoot.classList.add("hidden");
  endRoot.setAttribute("aria-hidden", "true");
}

async function applyActionAnimated(
  before: GameState,
  action: PlayerAction,
): Promise<GameState> {
  const actor = currentPlayer(before);
  const from = actor.position;
  let after = applyAction(before, action);

  if (action.type === "roll") {
    const afterActor = after.players.find((p) => p.id === actor.id)!;
    const moved = afterActor.position !== from;
    const steps = after.lastRoll?.total ?? 0;
    if (moved && steps > 0) {
      const path = walkMovePath(before.board, from, steps);
      await animatePath(actor.id, path.frames, actor.agent === "ai");
    }
  }

  // Animate duel dice when human just rolled in a duel
  if (
    action.type === "duel_roll" &&
    after.pendingDuel?.challengerRoll &&
    before.pendingDuel &&
    !before.pendingDuel.challengerRoll
  ) {
    await animateDicePair(dieC1, dieC2, after.pendingDuel.challengerRoll);
  }
  if (
    action.type === "duel_roll" &&
    after.pendingDuel?.defenderRoll &&
    before.pendingDuel &&
    !before.pendingDuel.defenderRoll
  ) {
    await animateDicePair(dieD1, dieD2, after.pendingDuel.defenderRoll);
  }

  after = resolveDuelAiFully(after);
  if (after.lastDuelResult && !before.lastDuelResult) {
    await maybeShowDuelResult(after);
  }
  return after;
}

async function runAiUntilHumanOrEnd(s: GameState): Promise<GameState> {
  let cur = s;
  let guard = 0;
  while (guard++ < 600 && cur.phase !== "game_over") {
    cur = resolveDuelAiFully(cur);
    if (cur.phase === "game_over") break;
    if (humanDuelNeedsInput(cur)) break;

    const p = currentPlayer(cur);
    if (!p.eliminated && p.agent === "human" && cur.phase !== "await_duel") {
      break;
    }
    if (p.eliminated) {
      cur = applyAction(cur, { type: "end_turn" });
      state = cur;
      render();
      continue;
    }
    if (cur.phase === "await_duel") {
      // AI-only residual
      const action = heuristicAI(cur);
      cur = applyAction(cur, action);
      cur = resolveDuelAiFully(cur);
      state = cur;
      render();
      continue;
    }

    const beforeDeltas = cur.turnDeltas.length;
    const action = heuristicAI(cur);
    const beforePlayer = currentPlayer(cur).id;
    cur = await applyActionAnimated(cur, action);
    if (
      currentPlayer(cur).id !== beforePlayer ||
      action.type === "end_turn"
    ) {
      // turn advanced — keep summary from previous state's deltas if needed
      if (cur.turnDeltas.length) lastTurnSummary = [...cur.turnDeltas];
      else if (beforeDeltas) {
        /* keep */
      }
    }
    state = cur;
    render();
    if (action.type !== "roll") await sleep(160);
  }
  return cur;
}

async function commitState(next: GameState): Promise<void> {
  state = next;
  setSetupCollapsed(true);
  btnQuit.classList.remove("hidden");
  hideEndScreen();
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
  if (state.phase === "game_over") showEndScreen(state);
}

async function act(action: PlayerAction): Promise<void> {
  if (!state || state.phase === "game_over" || animating) return;

  // Duel actions allowed for human even if not "current" seat for defender
  if (action.type === "duel_stance" || action.type === "duel_roll") {
    setBusy(true);
    try {
      // Temporarily set current player to the human who must act
      let s = state;
      if (s.pendingDuel) {
        const d = s.pendingDuel;
        const c = s.players.find((p) => p.id === d.challengerId)!;
        const def = s.players.find((p) => p.id === d.defenderId)!;
        let actorId = s.players[s.currentPlayerIndex].id;
        if (action.type === "duel_stance") {
          if (c.agent === "human" && d.challengerStance === null)
            actorId = c.id;
          else if (def.agent === "human" && d.defenderStance === null)
            actorId = def.id;
        } else {
          if (
            c.agent === "human" &&
            d.challengerStance &&
            d.defenderStance &&
            d.challengerRoll === null
          )
            actorId = c.id;
          else if (
            def.agent === "human" &&
            d.challengerStance &&
            d.defenderStance &&
            d.defenderRoll === null
          )
            actorId = def.id;
        }
        const idx = s.players.findIndex((p) => p.id === actorId);
        if (idx >= 0) {
          s = { ...s, currentPlayerIndex: idx };
        }
      }
      let after = applyAction(s, action);
      after = resolveDuelAiFully(after);
      state = after;
      render();
      if (state.phase !== "game_over" && !humanDuelNeedsInput(state)) {
        state = await runAiUntilHumanOrEnd(state);
      }
    } finally {
      setBusy(false);
    }
    render();
    if (state?.phase === "game_over") showEndScreen(state);
    return;
  }

  const p = currentPlayer(state);
  if (p.agent !== "human") return;
  setBusy(true);
  try {
    const beforeId = p.id;
    const after = await applyActionAnimated(state, action);
    if (action.type === "end_turn" || currentPlayer(after).id !== beforeId) {
      lastTurnSummary = [...(state.turnDeltas.length ? state.turnDeltas : after.turnDeltas)];
    } else {
      lastTurnSummary = [...after.turnDeltas];
    }
    state = after;
    render();
    if (state.phase !== "game_over") {
      state = await runAiUntilHumanOrEnd(state);
    }
  } finally {
    setBusy(false);
  }
  render();
  if (state?.phase === "game_over") showEndScreen(state);
}

function startGame(human: boolean): void {
  if (animating) return;
  visualNode = {};
  lastTurnSummary = [];
  void commitState(
    createGame({
      playerCount: Number(playerCountInput.value) || 4,
      humanSeat: human,
      humanPropellant: selectedPropellant(),
      seed: Date.now() >>> 0,
    }),
  );
}

document.getElementById("btn-handbook")?.addEventListener("click", () => {
  handbook.open();
});
document
  .getElementById("btn-handbook-header")
  ?.addEventListener("click", () => handbook.open());

setupToggle.addEventListener("click", () => {
  const open = setupCard.classList.contains("collapsed");
  setSetupCollapsed(!open);
});

btnNew.addEventListener("click", () => startGame(includeHuman.checked));
btnSelf.addEventListener("click", () => {
  if (animating) return;
  includeHuman.checked = false;
  visualNode = {};
  lastTurnSummary = [];
  let s = createGame({
    playerCount: Number(playerCountInput.value) || 4,
    humanSeat: false,
    seed: Date.now() >>> 0,
  });
  for (let i = 0; i < 100 && s.phase !== "game_over"; i++) {
    s = resolveDuelAiFully(s);
    if (s.phase === "game_over") break;
    if (s.phase === "await_duel") {
      s = applyAction(s, heuristicAI(s));
      continue;
    }
    s = applyAction(s, heuristicAI(s));
  }
  state = s;
  setSetupCollapsed(true);
  btnQuit.classList.remove("hidden");
  render();
  if (s.phase === "game_over") showEndScreen(s);
});

btnQuit.addEventListener("click", () => {
  if (!state || animating) return;
  if (!confirm("Abandon the charter and quit this game?")) return;
  const human = state.players.find((p) => p.agent === "human");
  state = resignGame(state, human?.id ?? state.players[0].id);
  render();
  showEndScreen(state);
});

document.getElementById("end-again")?.addEventListener("click", () => {
  hideEndScreen();
  setSetupCollapsed(false);
  startGame(includeHuman.checked);
});
document.getElementById("end-close")?.addEventListener("click", () => {
  hideEndScreen();
  setSetupCollapsed(false);
  state = null;
  btnQuit.classList.add("hidden");
  render();
});

document.getElementById("duel-result-ok")?.addEventListener("click", () => {
  hideDuelResultSplash();
  render();
});

btnRefuel.addEventListener("click", () => {
  if (!state) return;
  const legal = getLegalActions(state);
  void act({ type: "refuel", amount: Math.min(legal.refuelMax, 10) });
});
btnRoll.addEventListener("click", () => void act({ type: "roll" }));
btnBuy.addEventListener("click", () => void act({ type: "buy" }));
btnStation.addEventListener("click", () => void act({ type: "place_station" }));
btnEnd.addEventListener("click", () => void act({ type: "end_turn" }));

for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-stance]")) {
  btn.addEventListener("click", () => {
    const stance = btn.dataset.stance as DuelStance;
    void act({ type: "duel_stance", stance });
  });
}
duelRollBtn.addEventListener("click", () => void act({ type: "duel_roll" }));

function render(): void {
  drawBoard();
  renderSide();
  updateDuelModal(state);
}

function renderSide(): void {
  if (!state) {
    turnInfo.textContent = "No game yet. Launch when ready.";
    logEl.textContent = "";
    playersEl.innerHTML = "";
    rankingsEl.textContent = "—";
    turnDeltasEl.textContent = "";
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

  // Rankings
  const ranks = rankings(state);
  rankingsEl.innerHTML = ranks
    .map((r) => {
      const lead = r.rank === 1 ? " lead" : "";
      return `<div class="rank-row${lead}"><span>#${r.rank} ${r.player.name}</span><span>${formatMoney(r.worth)}</span></div>`;
    })
    .join("");

  const deltas =
    state.turnDeltas.length > 0 ? state.turnDeltas : lastTurnSummary;
  turnDeltasEl.innerHTML = deltas.length
    ? deltas
        .map((line) => {
          const neg = /−|-|rent|stuck|OUT|skip|burn|fuel leave/i.test(line);
          return `<div class="${neg ? "neg" : ""}">${line}</div>`;
        })
        .join("")
    : `<div style="opacity:0.5">Turn deltas appear here</div>`;

  turnInfo.textContent = [
    animating
      ? "… ship moving …"
      : state.phase === "await_duel"
        ? "Gravity Duel in progress"
        : `Round ${state.round} · ${state.phase}`,
    `${p.name} @ ${node.name} (g${g})`,
    `${formatMoney(p.cash)} · fuel ${p.fuel} · ${prop.short} · NW ${formatMoney(netWorth(state, p))}`,
    leaveCost > 0
      ? `Leave @${previewSteps}: ${leaveCost} fuel`
      : `Leave: free`,
    state.lastRoll
      ? `Last roll: ${state.lastRoll.d1}+${state.lastRoll.d2}=${state.lastRoll.total}`
      : "Last roll: —",
    `Board rotations: ${state.boardRotations} (feral after ${FERAL_ROTATIONS}+ without visit)`,
    p.ephemerisBodyId
      ? `Ephemeris: ${getNode(state.board, p.ephemerisBodyId).name}`
      : "Ephemeris: Earth (until first claim)",
  ].join("\n");

  const can =
    !animating &&
    p.agent === "human" &&
    state.phase !== "game_over" &&
    state.phase !== "await_duel";
  btnRefuel.disabled = !can || !legal.refuel;
  btnRoll.disabled = !can || !legal.roll;
  btnBuy.disabled = !can || !legal.buy;
  btnStation.disabled = !can || !legal.placeStation;
  btnEnd.disabled = !can || !legal.endTurn;
  btnNew.disabled = animating;
  btnSelf.disabled = animating;

  if (legal.buy) btnBuy.textContent = `Buy (${formatMoney(legal.buyPrice)})`;
  else {
    const here = getNode(state.board, p.position);
    const ownerId = state.owners[here.id];
    if (ownerId && ownerId !== p.id) {
      const o = state.players.find((x) => x.id === ownerId);
      btnBuy.textContent = `Owned by ${o?.name ?? "?"}`;
    } else if (isPurchasable(here) && p.cash < (here.price ?? 0)) {
      btnBuy.textContent = `Need ${formatMoney(here.price ?? 0)}`;
    } else if (!isPurchasable(here)) btnBuy.textContent = "Not for sale";
    else btnBuy.textContent = "Buy";
  }

  if (legal.placeStation) {
    btnStation.textContent = `Fuel depot (${p.stationsInHand} left)`;
  } else {
    const here = getNode(state.board, p.position);
    if (state.owners[here.id] !== p.id) btnStation.textContent = "Depot (must own)";
    else if (state.stations[here.id]) btnStation.textContent = "Depot built";
    else if (p.stationsInHand <= 0) btnStation.textContent = "No depots left";
    else if (here.kind !== "planet" && here.kind !== "moon")
      btnStation.textContent = "Depot (moons/planets only)";
    else btnStation.textContent = "Place depot";
  }

  playersEl.innerHTML = state.players
    .map((pl) => {
      const active = pl.id === p.id && state!.phase !== "game_over";
      const plProp = PROPELLANTS[pl.propellant].short;
      const shown = shipNodeId(pl.id, pl.position);
      const at = getNode(state!.board, shown).name;
      const nw = formatMoney(netWorth(state!, pl));
      return `<div class="player-row${active ? " active" : ""}${pl.eliminated ? " out" : ""}">
        <div class="swatch" style="background:${pl.color}"></div>
        <div>
          <strong>${pl.name}</strong>${pl.eliminated ? " · OUT" : ""} · ${plProp}${pl.skipTurns ? " · skip" : ""}
          <div>${formatMoney(pl.cash)} · ${nw} NW · ${pl.fuel} fuel · ${pl.properties.length} claims</div>
          <div style="color:#9aa8c7">${at}</div>
        </div>
      </div>`;
    })
    .join("");

  logEl.textContent = "";
  for (const line of state.log.slice(-60)) {
    const div = document.createElement("div");
    if (/Winner|claims|collects|Heliopoly|wins Gravity/i.test(line))
      div.className = "ok";
    else if (
      /eliminated|bankruptcy|stranded|cannot leave|boil-off|forfeit|TIE/i.test(
        line,
      )
    )
      div.className = "bad";
    else if (/rolls|Round|burns|Duel|seed/i.test(line)) div.className = "warn";
    div.textContent = line;
    logEl.appendChild(div);
  }
  logEl.scrollTop = logEl.scrollHeight;
}

/** Map board unit coords → canvas pixels so every node + label fits. */
function boardProjector(board: ReturnType<typeof createV0Board>, w: number, h: number) {
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

function drawBoard(): void {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "#050814";
  ctx.fillRect(0, 0, w, h);

  // stars
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  for (let i = 0; i < 120; i++) {
    const x = ((i * 97) % w) + (i % 7);
    const y = ((i * 53) % h) + (i % 11);
    ctx.fillRect(x, y, i % 6 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1);
  }

  const board = state?.board ?? createV0Board();
  const { project, sun, scale } = boardProjector(board, w, h);
  lastProject = { project, board };
  const cx = sun.x;
  const cy = sun.y;

  // orbital rings (same projector as nodes)
  for (const rNorm of board.rings) {
    const r = rNorm * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(110, 180, 255, 0.22)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
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

  // path chords
  ctx.strokeStyle = "rgba(255, 200, 120, 0.28)";
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

  const highlight = new Set(Object.values(visualNode));

  for (const node of nodes) {
    const x = px(node);
    const y = py(node);
    const baseR = bodyRadius(node);

    if (highlight.has(node.id)) {
      ctx.beginPath();
      ctx.arc(x, y, baseR + 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,200,87,0.95)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    const ownerId = state?.owners[node.id];
    const owner = ownerId
      ? state?.players.find((p) => p.id === ownerId)
      : undefined;
    if (owner) {
      ctx.beginPath();
      ctx.arc(x, y, baseR + 6, 0, Math.PI * 2);
      ctx.strokeStyle = owner.color;
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }

    const r = drawBodyIcon(ctx, node, x, y);

    if (state?.stations[node.id]) {
      drawFuelDepotIcon(ctx, x + r * 0.55, y - r * 0.55);
    }

    ctx.font = "bold 11px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    let label = node.kind === "space" ? "" : node.name;
    if (label && owner) label = `${label} · ${owner.name}`;
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

// —— Hover inspect ——
canvas.addEventListener("mousemove", (ev) => {
  if (!lastProject || !state) {
    bodyTooltip.classList.add("hidden");
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const sx = (ev.clientX - rect.left) * (canvas.width / rect.width);
  const sy = (ev.clientY - rect.top) * (canvas.height / rect.height);
  const { project, board } = lastProject;
  let best: { id: string; d: number } | null = null;
  for (const node of nodeList(board)) {
    const p = project(node.x, node.y);
    const d = (p.x - sx) ** 2 + (p.y - sy) ** 2;
    const hitR = bodyRadius(node) + 14;
    if (d <= hitR * hitR && (!best || d < best.d)) best = { id: node.id, d };
  }
  if (!best) {
    bodyTooltip.classList.add("hidden");
    return;
  }
  const viewer =
    state.players.find((p) => p.agent === "human") ?? currentPlayer(state);
  const info = inspectBody(state, best.id, viewer);
  bodyTooltip.innerHTML = `<h4>${info.title}</h4>${info.lines
    .map((l) => {
      const hot =
        /Owner|MONOPOLY|BUY|FERAL|Leave fuel|Rent|depot/i.test(l);
      return `<div class="tip-line${hot ? " hot" : ""}">${l}</div>`;
    })
    .join("")}`;
  bodyTooltip.classList.remove("hidden");
  const pad = 12;
  let left = ev.clientX + 16;
  let top = ev.clientY + 16;
  const tw = 300;
  const th = 220;
  if (left + tw > window.innerWidth - pad) left = ev.clientX - tw - 8;
  if (top + th > window.innerHeight - pad) top = ev.clientY - th - 8;
  bodyTooltip.style.left = `${left}px`;
  bodyTooltip.style.top = `${top}px`;
});
canvas.addEventListener("mouseleave", () => {
  bodyTooltip.classList.add("hidden");
});

setSetupCollapsed(false);
drawBoard();
renderSide();
