import { heuristicAI } from "./core/agents";
import { createV0Board, getNode, isPurchasable, nodeList } from "./core/board";
import { formatMoney } from "./core/currency";
import { walkMovePath } from "./core/path";
import { PROPELLANTS } from "./core/propellant";
import { prevailsHeadline, winsHeadline } from "./core/pilotCopy";
import { pilotByCallsign, sanitizePilotName } from "./core/pilotNames";
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
  AiDifficulty,
  DuelStance,
  GameState,
  Player,
  PlayerAction,
  PropellantId,
} from "./core/types";
import { bodyRadius, drawBodyIcon, drawFuelDepotIcon } from "./bodyIcons";
import { inspectBody } from "./core/inspect";
import { suggestCopyViaGithub } from "./core/links";
import { mountHandbook } from "./handbook/handbook";
import { LAB_SCENARIOS } from "./lab/scenarios";
import type { Board } from "./core/types";
import { submitGameTelemetry } from "./telemetry";

let state: GameState | null = null;
let visualNode: Record<string, string> = {};
let animating = false;
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

/** Escape player-typed names before injecting into rankings HTML. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Ops Manual topic for a rocket display name.
 * Roster callsigns → `pilot-*`; custom human names → Rival rockets overview.
 */
function handbookTopicForRocketName(name: string): string {
  const pilot = pilotByCallsign(name);
  return pilot ? `pilot-${pilot.id}` : "rival-pilots-overview";
}

function rocketNameButton(name: string): string {
  const topic = handbookTopicForRocketName(name);
  const label = escapeHtml(name);
  const title =
    topic === "rival-pilots-overview"
      ? "Open Rival rockets overview"
      : `Open Ops Manual: ${label}`;
  return `<button type="button" class="rocket-name-link" data-rocket-handbook="${topic}" title="${title}">${label}</button>`;
}

const handbook = mountHandbook(
  document.getElementById("handbook-root") as HTMLElement,
);

const canvas = document.getElementById("board") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const logEl = document.getElementById("log")!;
const btnCopyLog = document.getElementById("btn-copy-log") as HTMLButtonElement;
const rankingsEl = document.getElementById("rankings")!;
const fleetCard = document.getElementById("fleet-card")!;
const standingsPanel = document.getElementById("standings-panel")!;
const setupBody = document.getElementById("setup-body")!;
const setupToggle = document.getElementById("setup-toggle")!;
const btnQuit = document.getElementById("btn-quit")!;
const duelRoot = document.getElementById("duel-root")!;
const duelMatchup = document.getElementById("duel-matchup")!;
const duelStatus = document.getElementById("duel-status")!;
const duelDice = document.getElementById("duel-dice")!;
const dieL1 = document.getElementById("die-l1")!;
const dieL2 = document.getElementById("die-l2")!;
const dieR1 = document.getElementById("die-r1")!;
const dieR2 = document.getElementById("die-r2")!;
const diceLabelL = document.getElementById("dice-label-l")!;
const diceLabelR = document.getElementById("dice-label-r")!;
const duelActionsLeft = document.getElementById("duel-actions-left")!;
const duelActionsRight = document.getElementById("duel-actions-right")!;
const duelResultEl = document.getElementById("duel-result")!;
const duelResultFooter = document.getElementById("duel-result-footer")!;
const duelResultHeadline = document.getElementById("duel-result-headline")!;
const duelResultPunchy = document.getElementById("duel-result-punchy")!;
const duelResultSummary = document.getElementById("duel-result-summary")!;

function setDuelSideActionsVisible(visible: boolean): void {
  duelActionsLeft.classList.toggle("hidden", !visible);
  duelActionsRight.classList.toggle("hidden", !visible);
}
const bodyTooltip = document.getElementById("body-tooltip")!;
const endRoot = document.getElementById("end-root")!;
const endTitle = document.getElementById("end-title")!;
const endStory = document.getElementById("end-story")!;
const endRanks = document.getElementById("end-ranks")!;
const labRoot = document.getElementById("lab-root")!;
const labScenariosEl = document.getElementById("lab-scenarios")!;

const btnNew = document.getElementById("btn-new") as HTMLButtonElement;
const btnSelf = document.getElementById("btn-selfplay") as HTMLButtonElement;
const btnRefuel = document.getElementById("btn-refuel") as HTMLButtonElement;
const btnRoll = document.getElementById("btn-roll") as HTMLButtonElement;
const btnBuy = document.getElementById("btn-buy") as HTMLButtonElement;
const btnSell = document.getElementById("btn-sell") as HTMLButtonElement;
const btnStation = document.getElementById("btn-station") as HTMLButtonElement;
const btnEnd = document.getElementById("btn-end") as HTMLButtonElement;
const telemetryEl = document.getElementById("telemetry")!;
const breakRow = document.getElementById("break-row")!;
const breakCountEl = document.getElementById("break-count")!;
const breakCostEl = document.getElementById("break-cost")!;
const btnBreakMinus = document.getElementById(
  "btn-break-minus",
) as HTMLButtonElement;
const btnBreakPlus = document.getElementById(
  "btn-break-plus",
) as HTMLButtonElement;
const playerCountInput = document.getElementById(
  "player-count",
) as HTMLInputElement;
const includeHuman = document.getElementById(
  "include-human",
) as HTMLInputElement;
const pilotNameInput = document.getElementById(
  "pilot-name",
) as HTMLInputElement;
const pilotNameLabel = document.getElementById("pilot-name-label");

const PILOT_NAME_KEY = "heliopoly.pilotName";

function loadStoredPilotName(): void {
  try {
    const saved = localStorage.getItem(PILOT_NAME_KEY);
    // Pre-0.0.8 default was "Captain" — migrate empty default to Venture
    if (saved && /^captain$/i.test(saved.trim())) {
      localStorage.removeItem(PILOT_NAME_KEY);
      pilotNameInput.value = "";
      pilotNameInput.placeholder = "Venture";
      return;
    }
    if (saved) pilotNameInput.value = saved;
  } catch {
    /* private mode */
  }
}

function selectedHumanName(): string {
  const name = sanitizePilotName(pilotNameInput.value, "Venture");
  try {
    localStorage.setItem(PILOT_NAME_KEY, name);
  } catch {
    /* ignore */
  }
  return name;
}

function syncPilotNameField(): void {
  const on = includeHuman.checked;
  if (pilotNameLabel) pilotNameLabel.classList.toggle("hidden", !on);
  pilotNameInput.disabled = !on;
}

loadStoredPilotName();
syncPilotNameField();
includeHuman.addEventListener("change", () => syncPilotNameField());

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function selectedPropellant(): PropellantId {
  const el = document.querySelector(
    'input[name="propellant"]:checked',
  ) as HTMLInputElement | null;
  return el?.value === "hydrogen" ? "hydrogen" : "methane";
}

function selectedAiDifficulty(): AiDifficulty {
  const el = document.querySelector(
    'input[name="ai-difficulty"]:checked',
  ) as HTMLInputElement | null;
  return el?.value === "difficult" ? "difficult" : "normal";
}

const announceRoot = document.getElementById("announce-root")!;
const announceCard = document.getElementById("announce-card")!;
const announceKicker = document.getElementById("announce-kicker")!;
const announceTitle = document.getElementById("announce-title")!;
const announceBody = document.getElementById("announce-body")!;
let announceWaiters: Array<() => void> = [];

function showAnnouncement(s: GameState): boolean {
  const a = s.pendingAnnouncement;
  if (!a) return false;
  announceRoot.classList.remove("hidden");
  announceCard.classList.remove(
    "kind-gusher",
    "kind-leak",
    "kind-info",
    "kind-out",
  );
  announceCard.classList.add(`kind-${a.kind}`);
  announceKicker.textContent =
    a.kind === "gusher"
      ? "Resource strike"
      : a.kind === "leak"
        ? "Propellant failure"
        : a.kind === "out"
          ? "Elimination"
          : "Charter alert";
  announceTitle.textContent = a.title;
  announceBody.textContent = a.body;
  return true;
}

function hideAnnouncement(): void {
  announceRoot.classList.add("hidden");
  if (state?.pendingAnnouncement) {
    state = { ...state, pendingAnnouncement: null };
  }
  const w = announceWaiters;
  announceWaiters = [];
  for (const fn of w) fn();
}

function waitForAnnouncementDismiss(): Promise<void> {
  if (announceRoot.classList.contains("hidden")) return Promise.resolve();
  return new Promise((resolve) => {
    announceWaiters.push(resolve);
  });
}

async function presentAnnouncementIfAny(s: GameState): Promise<GameState> {
  if (!s.pendingAnnouncement) return s;
  state = s;
  render();
  if (showAnnouncement(s)) {
    await waitForAnnouncementDismiss();
  }
  return state ?? s;
}

/**
 * Shared fleet card: standings XOR new-game setup (same sidebar slot).
 * @param showStandings true = charter standings; false = new game form
 */
function setSetupCollapsed(showStandings: boolean): void {
  fleetCard.classList.toggle("mode-standings", showStandings);
  fleetCard.classList.toggle("mode-setup", !showStandings);
  standingsPanel.hidden = !showStandings;
  setupBody.hidden = showStandings;

  const inGame = !!state;
  if (showStandings) {
    setupToggle.classList.remove("hidden");
    setupToggle.textContent = "New game";
    setupToggle.title = "New game setup";
    setupToggle.setAttribute("aria-label", "Open new game setup");
    setupToggle.setAttribute("aria-expanded", "false");
  } else if (inGame) {
    // Mid-game setup: allow return to standings without launching
    setupToggle.classList.remove("hidden");
    setupToggle.textContent = "Standings";
    setupToggle.title = "Back to charter standings";
    setupToggle.setAttribute("aria-label", "Back to charter standings");
    setupToggle.setAttribute("aria-expanded", "true");
  } else {
    // Pre-launch: setup is the only content; hide header control
    setupToggle.classList.add("hidden");
    setupToggle.setAttribute("aria-expanded", "true");
  }
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

type DuelSeat = "challenger" | "defender";
type VisualSide = "left" | "right";

/** Left = non-human when human is in the duel; right = human (#57). */
function duelVisualMap(
  s: GameState,
  challengerId: string,
  defenderId: string,
): { left: DuelSeat; right: DuelSeat } {
  const c = s.players.find((p) => p.id === challengerId);
  const d = s.players.find((p) => p.id === defenderId);
  if (c?.agent === "human") return { left: "defender", right: "challenger" };
  if (d?.agent === "human") return { left: "challenger", right: "defender" };
  return { left: "challenger", right: "defender" };
}

function duelVisualMapByNames(
  s: GameState,
  challengerName: string,
  defenderName: string,
): { left: DuelSeat; right: DuelSeat } {
  const c = s.players.find((p) => p.name === challengerName);
  const d = s.players.find((p) => p.name === defenderName);
  return duelVisualMap(
    s,
    c?.id ?? "",
    d?.id ?? "",
  );
}

function diceElsForSeat(
  map: { left: DuelSeat; right: DuelSeat },
  seat: DuelSeat,
): [HTMLElement, HTMLElement] {
  const side: VisualSide = map.left === seat ? "left" : "right";
  return side === "left" ? [dieL1, dieL2] : [dieR1, dieR2];
}

function applyDuelShipNames(
  s: GameState,
  challengerName: string,
  defenderName: string,
  nodeName: string,
  challengerId?: string,
  defenderId?: string,
): void {
  duelMatchup.textContent = `${challengerName} vs ${defenderName} · ${nodeName}`;
  const map =
    challengerId && defenderId
      ? duelVisualMap(s, challengerId, defenderId)
      : duelVisualMapByNames(s, challengerName, defenderName);
  const nameFor = (seat: DuelSeat) =>
    seat === "challenger" ? challengerName : defenderName;
  diceLabelL.textContent = nameFor(map.left);
  diceLabelR.textContent = nameFor(map.right);
}

function showDuelResultFooter(s: GameState): void {
  const r = s.lastDuelResult;
  if (!r) return;
  duelRoot.classList.remove("hidden");
  duelRoot.setAttribute("aria-hidden", "false");
  document.body.classList.add("handbook-open");
  setDuelSideActionsVisible(false);
  duelResultFooter.classList.remove("hidden");
  duelResultFooter.classList.toggle("is-tie", r.outcome === "tie");
  applyDuelShipNames(s, r.challengerName, r.defenderName, r.nodeName);
  duelResultHeadline.textContent =
    r.outcome === "tie"
      ? "Draw — both hold the lane"
      : winsHeadline(r.winnerName ?? "Winner");
  duelResultPunchy.textContent = [
    "punchy message here",
    suggestCopyViaGithub("a punchy Gravity Duel line"),
  ].join("\n");
  duelResultSummary.textContent = [
    `${r.challengerName} [${r.challengerStance.toUpperCase()}] ${r.challengerRoll.total} · ${r.defenderName} [${r.defenderStance.toUpperCase()}] ${r.defenderRoll.total}`,
    r.summary,
  ].join("\n");
  // Host flag for waitForDuelResultDismiss
  duelResultEl.classList.remove("hidden");
}

function hideDuelResultSplash(): void {
  duelResultFooter.classList.add("hidden");
  setDuelSideActionsVisible(true);
  duelResultEl.classList.add("hidden");
  duelRoot.classList.add("hidden");
  duelRoot.setAttribute("aria-hidden", "true");
  document.body.classList.remove("handbook-open");
  if (state?.lastDuelResult) {
    state = { ...state, lastDuelResult: null };
  }
  const waiters = duelResultWaiters;
  duelResultWaiters = [];
  for (const w of waiters) w();
}

/** True while result footer is up (phase may already be await_post_land). */
function duelCeremonyOpen(): boolean {
  return (
    !!state?.lastDuelResult && !duelResultEl.classList.contains("hidden")
  );
}

function syncDuelSideControls(
  s: GameState,
  d: NonNullable<GameState["pendingDuel"]>,
  map: { left: DuelSeat; right: DuelSeat },
): void {
  const c = s.players.find((p) => p.id === d.challengerId)!;
  const def = s.players.find((p) => p.id === d.defenderId)!;
  const bothRolled = !!(d.challengerRoll && d.defenderRoll);

  for (const visual of ["left", "right"] as VisualSide[]) {
    const seat = visual === "left" ? map.left : map.right;
    const pilot = seat === "challenger" ? c : def;
    const stance =
      seat === "challenger" ? d.challengerStance : d.defenderStance;
    const roll =
      seat === "challenger" ? d.challengerRoll : d.defenderRoll;
    const isHuman = pilot.agent === "human";
    const needStance = isHuman && stance === null && !animating;
    const needRoll =
      isHuman &&
      !animating &&
      d.challengerStance !== null &&
      d.defenderStance !== null &&
      roll === null;

    for (const btn of duelRoot.querySelectorAll<HTMLButtonElement>(
      `button[data-visual="${visual}"][data-stance]`,
    )) {
      const btnStance = btn.dataset.stance as "low" | "high";
      // Only the human side may pick; AI side stays disabled
      btn.disabled = !needStance;
      const showPick =
        (isHuman && stance === btnStance) ||
        (bothRolled && stance === btnStance);
      btn.classList.toggle("selected", !!showPick);
    }

    const rollBtn = duelRoot.querySelector<HTMLButtonElement>(
      `button[data-visual="${visual}"][data-roll]`,
    );
    if (rollBtn) rollBtn.disabled = !needRoll;
  }
}

/** Dice DOM pair for a seat given current visual map (or name-based for results). */
function seatDice(
  s: GameState,
  challengerId: string,
  defenderId: string,
  seat: DuelSeat,
): [HTMLElement, HTMLElement] {
  return diceElsForSeat(duelVisualMap(s, challengerId, defenderId), seat);
}

function seatDiceFromResult(
  s: GameState,
  r: NonNullable<GameState["lastDuelResult"]>,
  seat: DuelSeat,
): [HTMLElement, HTMLElement] {
  const c = s.players.find((p) => p.name === r.challengerName);
  const d = s.players.find((p) => p.name === r.defenderName);
  if (c && d) return diceElsForSeat(duelVisualMap(s, c.id, d.id), seat);
  return diceElsForSeat(
    { left: "challenger", right: "defender" },
    seat,
  );
}

function paintDuelDice(
  map: { left: DuelSeat; right: DuelSeat },
  d: {
    challengerRoll: { d1: number; d2: number } | null;
    defenderRoll: { d1: number; d2: number } | null;
  },
): void {
  for (const seat of ["challenger", "defender"] as DuelSeat[]) {
    const [a, b] = diceElsForSeat(map, seat);
    const roll =
      seat === "challenger" ? d.challengerRoll : d.defenderRoll;
    if (roll) {
      setDie(a, roll.d1);
      setDie(b, roll.d2);
    } else {
      setDie(a, "?");
      setDie(b, "?");
    }
  }
}

function updateDuelModal(s: GameState | null): void {
  // Lab / AI resolve leaves await_duel before ceremony — keep panel + names visible
  if (s?.lastDuelResult && duelCeremonyOpen()) {
    const r = s.lastDuelResult;
    duelRoot.classList.remove("hidden");
    duelRoot.setAttribute("aria-hidden", "false");
    document.body.classList.add("handbook-open");
    applyDuelShipNames(s, r.challengerName, r.defenderName, r.nodeName);
    return;
  }

  if (!s || s.phase !== "await_duel" || !s.pendingDuel) {
    if (!duelCeremonyOpen()) {
      duelRoot.classList.add("hidden");
      duelRoot.setAttribute("aria-hidden", "true");
      if (!s?.lastDuelResult) document.body.classList.remove("handbook-open");
    }
    return;
  }
  const d = s.pendingDuel;
  const c = s.players.find((p) => p.id === d.challengerId)!;
  const def = s.players.find((p) => p.id === d.defenderId)!;
  const map = duelVisualMap(s, c.id, def.id);
  duelRoot.classList.remove("hidden");
  duelRoot.setAttribute("aria-hidden", "false");
  document.body.classList.add("handbook-open");
  setDuelSideActionsVisible(true);
  applyDuelShipNames(
    s,
    c.name,
    def.name,
    getNode(s.board, d.nodeId).name,
    c.id,
    def.id,
  );
  const mean = meanDiceTotal(s);
  duelStatus.textContent = [
    `Mean of game 2d6 totals: ${mean.toFixed(2)}`,
    `Stances hidden until both have rolled`,
    d.challengerStance && d.defenderStance
      ? "Both stances locked — roll when ready"
      : "Choose High or Low on your side",
  ].join("\n");

  syncDuelSideControls(s, d, map);
  paintDuelDice(map, d);

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
  // Ceremony on the same panel — dice stay visible; footer shows winner
  duelRoot.classList.remove("hidden");
  duelRoot.setAttribute("aria-hidden", "false");
  document.body.classList.add("handbook-open");
  duelResultFooter.classList.add("hidden");
  const r = s.lastDuelResult;
  applyDuelShipNames(s, r.challengerName, r.defenderName, r.nodeName);
  const cPl = s.players.find((p) => p.name === r.challengerName);
  const dPl = s.players.find((p) => p.name === r.defenderName);
  const map =
    cPl && dPl
      ? duelVisualMap(s, cPl.id, dPl.id)
      : { left: "challenger" as DuelSeat, right: "defender" as DuelSeat };
  // Mark ceremony open so render() does not hide the panel mid-anim
  duelResultEl.classList.remove("hidden");
  const [c1, c2] = diceElsForSeat(map, "challenger");
  const [d1, d2] = diceElsForSeat(map, "defender");
  setDie(c1, "?", true);
  setDie(c2, "?", true);
  setDie(d1, "?", true);
  setDie(d2, "?", true);
  await animateDicePair(c1, c2, r.challengerRoll);
  await animateDicePair(d1, d2, r.defenderRoll);
  showDuelResultFooter(s);
}

/** True when `after` carries a duel result that `before` did not (or a different one). */
function isFreshDuelResult(before: GameState, after: GameState): boolean {
  const a = after.lastDuelResult;
  if (!a) return false;
  const b = before.lastDuelResult;
  if (!b) return true;
  return (
    a.summary !== b.summary ||
    a.winnerName !== b.winnerName ||
    a.loserName !== b.loserName ||
    a.challengerRoll.total !== b.challengerRoll.total ||
    a.defenderRoll.total !== b.defenderRoll.total ||
    a.challengerName !== b.challengerName ||
    a.defenderName !== b.defenderName ||
    after.gameTurn !== before.gameTurn
  );
}

/**
 * If a duel just resolved between two states, run the win/lose ceremony.
 * Always returns a state with `lastDuelResult` cleared after dismiss so the
 * next duel is not skipped when callers assign `state = after` (#52).
 */
async function presentNewDuelResult(
  before: GameState,
  after: GameState,
): Promise<GameState> {
  if (!isFreshDuelResult(before, after) || !after.lastDuelResult) {
    return after;
  }
  state = after;
  render();
  await maybeShowDuelResult(after);
  await waitForDuelResultDismiss();
  // hideDuelResultSplash nulls state.lastDuelResult; never re-hand callers a stale result
  const cleared: GameState = {
    ...(state ?? after),
    lastDuelResult: null,
  };
  state = cleared;
  return cleared;
}

let duelResultWaiters: Array<() => void> = [];

function waitForDuelResultDismiss(): Promise<void> {
  if (duelResultEl.classList.contains("hidden")) return Promise.resolve();
  return new Promise((resolve) => {
    duelResultWaiters.push(resolve);
  });
}

function endScreenStory(s: GameState, winner: Player | undefined): string {
  const reason =
    s.endReason ??
    "Among the orbital lanes, one enterprise outlasted the rest.";
  const lengthBit = ` Charter lasted ${s.round} round${s.round === 1 ? "" : "s"}.`;
  if (!winner) return reason + lengthBit;
  const nw = formatMoney(netWorth(s, winner));
  const deeds = winner.properties.length;
  const depots = winner.properties.filter((id) => s.stations[id]).length;
  const empire =
    deeds > 0 || depots > 0
      ? ` Closing books: ${nw} net worth · ${deeds} claim${deeds === 1 ? "" : "s"} · ${depots} depot${depots === 1 ? "" : "s"}.`
      : ` Closing books: ${nw} net worth.`;
  return reason + lengthBit + empire;
}

function showEndScreen(s: GameState): void {
  submitGameTelemetry(s);
  const winner = s.players.find((p) => p.id === s.winnerId);
  const kicker = document.querySelector(".end-kicker") as HTMLElement | null;
  if (kicker) {
    kicker.textContent = winner
      ? "Free enterprise decides"
      : "The charter is sealed";
  }
  endTitle.textContent = winner ? prevailsHeadline(winner) : "The Charter Closes";
  endStory.textContent = endScreenStory(s, winner);
  // Full field: flying first (by NW), then eliminated by exit round (earliest first)
  const flying = s.players
    .filter((p) => !p.eliminated)
    .sort((a, b) => netWorth(s, b) - netWorth(s, a));
  const fallen = s.players
    .filter((p) => p.eliminated)
    .sort((a, b) => {
      const ra = a.eliminatedOnRound ?? s.round;
      const rb = b.eliminatedOnRound ?? s.round;
      if (ra !== rb) return ra - rb;
      // Same round: chronological by shared gameTurn, then name
      const ta = a.eliminatedOnTurn ?? Number.MAX_SAFE_INTEGER;
      const tb = b.eliminatedOnTurn ?? Number.MAX_SAFE_INTEGER;
      if (ta !== tb) return ta - tb;
      return a.name.localeCompare(b.name);
    });
  const ordered = [...flying, ...fallen];
  endRanks.innerHTML = ordered
    .map((p, i) => {
      const mark = p.id === s.winnerId ? " ★" : "";
      if (p.eliminated) {
        const r =
          p.eliminatedOnRound != null
            ? `round ${p.eliminatedOnRound}`
            : p.eliminatedOnTurn != null
              ? `round ? (turn ${p.eliminatedOnTurn})`
              : "round ?";
        const why = p.eliminatedReason ? ` · ${p.eliminatedReason}` : "";
        return `<div>${i + 1}. ${p.name}${mark} — out ${r}${why}</div>`;
      }
      return `<div>${i + 1}. ${p.name}${mark} — ${formatMoney(netWorth(s, p))} · flying</div>`;
    })
    .join("");
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

  if (action.type === "move") {
    const afterActor = after.players.find((p) => p.id === actor.id)!;
    const moved = afterActor.position !== from;
    const br = before.breakSpaces;
    const total = before.lastRoll?.total ?? 0;
    const steps = Math.max(0, total - br);
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
    const d = after.pendingDuel;
    const [a, b] = seatDice(after, d.challengerId, d.defenderId, "challenger");
    await animateDicePair(a, b, after.pendingDuel.challengerRoll);
  }
  if (
    action.type === "duel_roll" &&
    after.pendingDuel?.defenderRoll &&
    before.pendingDuel &&
    !before.pendingDuel.defenderRoll
  ) {
    const d = after.pendingDuel;
    const [a, b] = seatDice(after, d.challengerId, d.defenderId, "defender");
    await animateDicePair(a, b, after.pendingDuel.defenderRoll);
  }

  after = resolveDuelAiFully(after);
  after = await presentNewDuelResult(before, after);
  after = await presentAnnouncementIfAny(after);
  return after;
}

async function runAiUntilHumanOrEnd(s: GameState): Promise<GameState> {
  let cur = s;
  let guard = 0;
  while (guard++ < 600 && cur.phase !== "game_over") {
    const preResolve = cur;
    cur = resolveDuelAiFully(cur);
    cur = await presentNewDuelResult(preResolve, cur);
    cur = await presentAnnouncementIfAny(cur);
    if (cur.phase === "game_over") break;
    if (humanDuelNeedsInput(cur)) break;
    // Pause AI until player closes duel result splash
    if (!duelResultEl.classList.contains("hidden")) break;
    if (!announceRoot.classList.contains("hidden")) break;

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
      const pre = cur;
      const action = heuristicAI(cur);
      cur = applyAction(cur, action);
      cur = resolveDuelAiFully(cur);
      cur = await presentNewDuelResult(pre, cur);
      cur = await presentAnnouncementIfAny(cur);
      state = cur;
      render();
      if (!duelResultEl.classList.contains("hidden")) break;
      continue;
    }

    const action = heuristicAI(cur);
    cur = await applyActionAnimated(cur, action);
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
  if (state.phase === "game_over") {
    state = await presentAnnouncementIfAny(state);
    showEndScreen(state);
  }
}

async function act(action: PlayerAction): Promise<void> {
  if (!state || state.phase === "game_over" || animating) return;

  // Duel actions allowed for human even if not "current" seat for defender
  if (action.type === "duel_stance" || action.type === "duel_roll") {
    setBusy(true);
    try {
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
      const before = s;
      let after = applyAction(s, action);

      // Animate this pilot's dice if they just rolled
      if (action.type === "duel_roll" && before.pendingDuel && after.pendingDuel) {
        const bd = before.pendingDuel;
        const ad = after.pendingDuel;
        if (!bd.challengerRoll && ad.challengerRoll) {
          const [a, b] = seatDice(after, ad.challengerId, ad.defenderId, "challenger");
          await animateDicePair(a, b, ad.challengerRoll);
        }
        if (!bd.defenderRoll && ad.defenderRoll) {
          const [a, b] = seatDice(after, ad.challengerId, ad.defenderId, "defender");
          await animateDicePair(a, b, ad.defenderRoll);
        }
      } else if (
        action.type === "duel_roll" &&
        before.pendingDuel &&
        after.lastDuelResult
      ) {
        const r = after.lastDuelResult;
        const [c1, c2] = seatDiceFromResult(after, r, "challenger");
        const [d1, d2] = seatDiceFromResult(after, r, "defender");
        await animateDicePair(c1, c2, r.challengerRoll);
        await animateDicePair(d1, d2, r.defenderRoll);
      }

      after = resolveDuelAiFully(after);
      if (
        after.lastDuelResult &&
        before.pendingDuel &&
        !before.lastDuelResult
      ) {
        const r = after.lastDuelResult;
        const [c1, c2] = seatDiceFromResult(after, r, "challenger");
        const [d1, d2] = seatDiceFromResult(after, r, "defender");
        setDie(c1, r.challengerRoll.d1);
        setDie(c2, r.challengerRoll.d2);
        setDie(d1, r.defenderRoll.d1);
        setDie(d2, r.defenderRoll.d2);
      }

      after = await presentNewDuelResult(before, after);
      state = after;
      render();
      if (
        state.phase !== "game_over" &&
        !humanDuelNeedsInput(state) &&
        duelResultEl.classList.contains("hidden")
      ) {
        state = await runAiUntilHumanOrEnd(state);
      }
    } finally {
      setBusy(false);
    }
    render();
    if (state?.phase === "game_over") {
      state = await presentAnnouncementIfAny(state);
      showEndScreen(state);
    }
    return;
  }

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
  if (state?.phase === "game_over") {
    state = await presentAnnouncementIfAny(state);
    showEndScreen(state);
  }
}

function startGame(human: boolean): void {
  if (animating) return;
  visualNode = {};
  void commitState(
    createGame({
      playerCount: Number(playerCountInput.value) || 4,
      humanSeat: human,
      humanName: human ? selectedHumanName() : "Venture",
      humanPropellant: selectedPropellant(),
      aiDifficulty: selectedAiDifficulty(),
      seed: Date.now() >>> 0,
    }),
  );
}

document
  .getElementById("btn-handbook-header")
  ?.addEventListener("click", () => handbook.open());

/** Full player-facing log (same stream as the Log panel, not UI-truncated to last 60). */
function gameLogText(): string {
  if (!state?.log.length) return "";
  return state.log
    .filter((line) => !/↺|^\s*seed\[/i.test(line))
    .join("\n");
}

async function copyGameLog(): Promise<void> {
  const text = gameLogText();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    btnCopyLog.classList.add("copied");
    const prev = btnCopyLog.textContent;
    btnCopyLog.textContent = "Copied";
    window.setTimeout(() => {
      btnCopyLog.classList.remove("copied");
      btnCopyLog.textContent = prev || "Copy";
    }, 1600);
  } catch {
    // Fallback for non-secure contexts
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      btnCopyLog.textContent = "Copied";
      window.setTimeout(() => {
        btnCopyLog.textContent = "Copy";
      }, 1600);
    } finally {
      document.body.removeChild(ta);
    }
  }
}

btnCopyLog.addEventListener("click", () => {
  void copyGameLog();
});

/** Charter standings: rocket name → Rival rockets / pilot page. */
function onRocketNameClick(e: Event): void {
  const el = (e.target as HTMLElement | null)?.closest?.(
    "[data-rocket-handbook]",
  ) as HTMLElement | null;
  if (!el) return;
  e.preventDefault();
  const topic = el.getAttribute("data-rocket-handbook");
  if (topic) handbook.open(topic);
}
rankingsEl.addEventListener("click", onRocketNameClick);

function openLab(): void {
  labRoot.classList.remove("hidden");
  labRoot.setAttribute("aria-hidden", "false");
  document.body.classList.add("handbook-open");
}

function closeLab(): void {
  labRoot.classList.add("hidden");
  labRoot.setAttribute("aria-hidden", "true");
  if (
    duelRoot.classList.contains("hidden") &&
    document.getElementById("handbook-root")?.classList.contains("hidden")
  ) {
    document.body.classList.remove("handbook-open");
  }
}

function mountLabScenarios(): void {
  const groups: Record<string, typeof LAB_SCENARIOS> = {};
  for (const sc of LAB_SCENARIOS) {
    (groups[sc.group] ??= []).push(sc);
  }
  const labels: Record<string, string> = {
    minigame: "Minigames",
    end: "End screens",
    economy: "Economy",
  };
  labScenariosEl.innerHTML = "";
  for (const [group, list] of Object.entries(groups)) {
    const wrap = document.createElement("div");
    wrap.className = "lab-group";
    const h = document.createElement("p");
    h.className = "lab-group-title";
    h.textContent = labels[group] ?? group;
    wrap.appendChild(h);
    for (const sc of list) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lab-scenario";
      btn.dataset.scenario = sc.id;
      btn.innerHTML = `<span class="lab-scenario-title">${sc.title}</span><span class="lab-scenario-blurb">${sc.blurb}</span>`;
      btn.addEventListener("click", () => {
        void runLabScenario(sc.id);
      });
      wrap.appendChild(btn);
    }
    labScenariosEl.appendChild(wrap);
  }
}

async function runLabScenario(id: string): Promise<void> {
  if (animating) return;
  const sc = LAB_SCENARIOS.find((x) => x.id === id);
  if (!sc) return;
  closeLab();
  hideEndScreen();
  hideDuelResultSplash();
  duelRoot.classList.add("hidden");
  visualNode = {};
  const next = sc.build();
  await commitState(next);
}

document.getElementById("btn-lab")?.addEventListener("click", () => openLab());
document.getElementById("lab-close")?.addEventListener("click", () => closeLab());
document.getElementById("lab-backdrop")?.addEventListener("click", () => closeLab());
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !labRoot.classList.contains("hidden")) closeLab();
});
mountLabScenarios();

setupToggle.addEventListener("click", () => {
  const showingStandings = fleetCard.classList.contains("mode-standings");
  setSetupCollapsed(!showingStandings);
});

btnNew.addEventListener("click", () => startGame(includeHuman.checked));
btnSelf.addEventListener("click", () => {
  if (animating) return;
  includeHuman.checked = false;
  visualNode = {};
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
  state = null;
  btnQuit.classList.add("hidden");
  setSetupCollapsed(false);
  render();
});

document.getElementById("duel-result-ok")?.addEventListener("click", () => {
  hideDuelResultSplash();
  render();
});

document.getElementById("announce-ok")?.addEventListener("click", () => {
  hideAnnouncement();
  render();
});

btnRefuel.addEventListener("click", () => {
  if (!state) return;
  const legal = getLegalActions(state);
  void act({ type: "refuel", amount: Math.min(legal.refuelMax, 10) });
});
btnRoll.addEventListener("click", () => {
  if (!state) return;
  if (state.phase === "await_move") void act({ type: "move" });
  else void act({ type: "roll" });
});
btnBuy.addEventListener("click", () => void act({ type: "buy" }));
btnSell.addEventListener("click", () => {
  if (!state) return;
  const legal = getLegalActions(state);
  if (legal.sell && legal.sellNodeId) {
    void act({ type: "sell", nodeId: legal.sellNodeId });
  }
});
btnStation.addEventListener("click", () => void act({ type: "place_station" }));
btnEnd.addEventListener("click", () => void act({ type: "end_turn" }));
btnBreakMinus.addEventListener("click", () => {
  if (!state || state.phase !== "await_move") return;
  void act({ type: "set_break", spaces: Math.max(0, state.breakSpaces - 1) });
});
btnBreakPlus.addEventListener("click", () => {
  if (!state || state.phase !== "await_move" || !state.lastRoll) return;
  void act({
    type: "set_break",
    spaces: Math.min(state.lastRoll.total, state.breakSpaces + 1),
  });
});

for (const btn of document.querySelectorAll<HTMLButtonElement>(
  "#duel-root button[data-stance]",
)) {
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    const stance = btn.dataset.stance as DuelStance;
    void act({ type: "duel_stance", stance });
  });
}
for (const btn of document.querySelectorAll<HTMLButtonElement>(
  "#duel-root button[data-roll]",
)) {
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    void act({ type: "duel_roll" });
  });
}

function resizeLog(): void {
  const board = document.querySelector(".board-panel") as HTMLElement;
  const pilotControls = document.getElementById("pilot-controls") as HTMLElement;
  const logCard = document.querySelector(".log-card") as HTMLElement;
  if (!board || !pilotControls || !logCard) return;
  const gap = 12;
  const desired = board.getBoundingClientRect().bottom - pilotControls.getBoundingClientRect().bottom - gap;
  logCard.style.height = `${Math.max(80, desired)}px`;
}

function render(): void {
  drawBoard();
  renderSide();
  resizeLog();
  updateDuelModal(state);
}

function renderSide(): void {
  if (!state) {
    logEl.textContent = "";
    rankingsEl.textContent = "—";
    btnCopyLog.disabled = true;
    for (const b of [btnRefuel, btnRoll, btnBuy, btnStation, btnEnd]) {
      b.disabled = true;
    }
    return;
  }

  btnCopyLog.disabled = state.log.length === 0;

  const p = currentPlayer(state);
  const legal = getLegalActions(state);

  // Charter standings = scoreboard + full seat status (Rockets panel merged in)
  const ranks = rankings(state);
  const fallen = state.players
    .filter((pl) => pl.eliminated)
    .sort((a, b) => {
      const ra = a.eliminatedOnRound ?? state!.round;
      const rb = b.eliminatedOnRound ?? state!.round;
      if (ra !== rb) return ra - rb;
      const ta = a.eliminatedOnTurn ?? 0;
      const tb = b.eliminatedOnTurn ?? 0;
      return ta - tb;
    });
  const standingRows: { pl: Player; worth: number; rankLabel: string }[] = [
    ...ranks.map((r) => ({
      pl: r.player,
      worth: r.worth,
      rankLabel: `#${r.rank}`,
    })),
    ...fallen.map((pl) => ({
      pl,
      worth: netWorth(state!, pl),
      rankLabel: "OUT",
    })),
  ];
  rankingsEl.innerHTML = standingRows
    .map(({ pl, worth, rankLabel }) => {
      const active = pl.id === p.id && state!.phase !== "game_over";
      const lead = rankLabel === "#1" ? " lead" : "";
      // Subscripts OK here — standings row height was min-height on name button (#64), not glyphs
      const plProp = PROPELLANTS[pl.propellant].short;
      const shown = shipNodeId(pl.id, pl.position);
      const at = getNode(state!.board, shown).name;
      const skip = !pl.eliminated && pl.skipTurns ? " · skip" : "";
      // Single-line markup: avoids anonymous whitespace grid items if pre-wrap sneaks back
      return `<div class="rank-row${lead}${active ? " active" : ""}${pl.eliminated ? " out" : ""}"><div class="swatch" style="background:${pl.color}" aria-hidden="true"></div><div class="rank-body"><div class="rank-top"><span class="rank-id">${rankLabel} ${rocketNameButton(pl.name)}${skip} · <span class="rank-prop">${plProp}</span></span><span class="rank-money"><span class="cash">${formatMoney(pl.cash)} cash</span> · NW ${formatMoney(worth)}</span></div><div class="rank-detail">${pl.fuel} fuel · ${pl.properties.length} claims · ${at}</div></div></div>`;
    })
    .join("");

  const can =
    !animating &&
    p.agent === "human" &&
    state.phase !== "game_over" &&
    state.phase !== "await_duel";
  btnRefuel.disabled = !can || !legal.refuel;
  const rollOrMove =
    state.phase === "await_move" ? legal.move : legal.roll;
  btnRoll.disabled = !can || !rollOrMove;
  btnRoll.textContent =
    state.phase === "await_move"
      ? `Move (${(state.lastRoll?.total ?? 0) - legal.breakSpaces})`
      : "Roll";
  btnBuy.disabled = !can || !legal.buy;
  btnSell.disabled = !can || !legal.sell;
  btnStation.disabled = !can || !legal.placeStation;
  btnEnd.disabled = !can || !legal.endTurn;
  btnNew.disabled = animating;
  btnSelf.disabled = animating;

  // Telemetry screen
  const node = getNode(state.board, p.position);
  const teleLines: string[] = [];
  if (state.phase === "game_over") {
    teleLines.push("STATUS: GAME OVER");
    teleLines.push("");
  } else if (p.eliminated) {
    teleLines.push("STATUS: ELIMINATED");
    teleLines.push("");
  } else if (animating) {
    teleLines.push("STATUS: MOVING");
    teleLines.push("");
  } else if (state.phase === "await_duel") {
    teleLines.push("STATUS: DUEL");
    teleLines.push("");
  } else if (state.phase === "await_move" && state.lastRoll) {
    const roll = state.lastRoll;
    const m = roll.total - legal.breakSpaces;
    teleLines.push(
      `DICE ${roll.d1}+${roll.d2}=${roll.total} · break ${legal.breakSpaces} · move ${m}`,
    );
    teleLines.push(`leave burn ~${legal.leaveBurnPreview}`);
  } else if (state.phase === "await_post_land") {
    const ctx = isPurchasable(node) && !state.owners[node.id]
      ? `claim available ${formatMoney(node.price ?? 0)}`
      : state.owners[node.id] === p.id
        ? "you own this body"
        : state.owners[node.id]
          ? `owned by ${state!.players.find(x => x.id === state!.owners[node.id])?.name ?? "?"}`
          : "insertion free";
    teleLines.push(`LANDED: ${node.name}`);
    teleLines.push(ctx);
  } else if (state.phase === "await_action") {
    if (!p.rolledThisTurn && p.parkCount > 0) {
      teleLines.push(`STATUS: PARKED`);
      teleLines.push(`park count ${p.parkCount}`);
    } else {
      teleLines.push(`STATUS: READY`);
      teleLines.push(`FUEL ${p.fuel}/${state!.config.maxFuel} · CLAIMS ${p.properties.length}`);
    }
  } else {
    teleLines.push(`STATUS: ${state.phase}`);
    teleLines.push(`FUEL ${p.fuel}/${state!.config.maxFuel}`);
  }
  telemetryEl.className = `telemetry${
    p.fuel <= 1 ? " fuel-red" : p.fuel <= 3 ? " fuel-amber" : ""
  }`;
  telemetryEl.innerHTML = teleLines
    .map((t, i) => `<div${i === 1 ? ' class="line2"' : ""}>${t}</div>`)
    .join("");

  // Break row — fixed 36px, visibility toggled
  if (state.phase === "await_move" && state.lastRoll) {
    breakRow.classList.remove("hidden-vis");
    breakCountEl.textContent = String(legal.breakSpaces);
    breakCostEl.textContent =
      legal.breakSpaces > 0
        ? `−${legal.breakFuelCost} fuel`
        : "0 fuel";
    btnBreakMinus.disabled = !can || legal.breakSpaces <= 0;
    btnBreakPlus.disabled =
      !can || legal.breakSpaces >= legal.maxBreak;
  } else {
    breakRow.classList.add("hidden-vis");
  }

  if (legal.sell) {
    btnSell.textContent = `Sell (${formatMoney(legal.sellValue)})`;
  } else {
    btnSell.textContent = "Sell claim";
  }

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

  logEl.textContent = "";
  const maxLog = 60;
  const start = Math.max(0, state.log.length - maxLog);
  for (let i = state.log.length - 1; i >= start; i--) {
    const line = state.log[i];
    // Belt-and-suspenders: never show engine reseed crumbs in the UI (#56)
    if (/↺|^\s*seed\[/i.test(line)) continue;
    const div = document.createElement("div");
    if (/Winner|claims|collects|Heliopoly|wins Gravity/i.test(line))
      div.className = "ok";
    else if (
      /eliminated|bankruptcy|stranded|cannot leave|boil-off|forfeit|TIE/i.test(
        line,
      )
    )
      div.className = "bad";
    else if (/rolls|Round|burns|Duel/i.test(line)) div.className = "warn";
    const hex = i.toString(16).padStart(2, "0").toUpperCase();
    div.textContent = `${hex}:${line}`;
    logEl.appendChild(div);
  }
  logEl.scrollTop = 0;
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

window.addEventListener("resize", resizeLog);
setSetupCollapsed(false);
drawBoard();
renderSide();
resizeLog();
