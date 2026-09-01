import { heuristicAI } from "./core/agents";
import { createV0Board, getNode, isPurchasable, nodeList } from "./core/board";
import { formatMoney } from "./core/currency";
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
  RING_OPACITY_DEFAULT,
  SYSTEM_RING_STYLES,
  fillRingBand,
  ringPaintAlpha,
  strokeDashedRing,
} from "./core/ringBands";
import { walkMovePath } from "./core/path";
import { PROPELLANTS } from "./core/propellant";
import {
  duelPunchLine,
  prevailsHeadline,
  winsHeadline,
} from "./core/pilotCopy";
import { sanitizePilotName } from "./core/pilotNames";
import { goingUnderFlags } from "./core/goingUnder";
import { bestBooksLine } from "./core/claimLedger";
import {
  applyAction,
  resolveCharterChoiceIfAi,
  depotPlaceCashCost,
  effectiveBreakFuelCost,
  getLegalActions,
  humanAuctionNeedsInput,
  meanDiceTotal,
  netWorth,
  rankings,
  resignGame,
  resolveDuelAiFully,
} from "./core/rules";
import {
  isOlbersStation,
  stealableClaims,
} from "./core/turnClock";
import {
  GAMEPLAY_MODE_KEY,
  GAMEPLAY_MODES,
  modeDef,
  modeSelectLabel,
  parseStoredMode,
  type GameplayModeId,
} from "./core/gameplayMode";
import { createGame, currentPlayer } from "./core/state";
import {
  normalizeAiDifficulty,
  type AiDifficulty,
  type DuelStance,
  type GameState,
  type Player,
  type PlayerAction,
  type PropellantId,
} from "./core/types";
import { bodyRadius, drawBodyIcon, drawFuelDepotIcon } from "./bodyIcons";
import { inspectBody } from "./core/inspect";
import { mountHandbook } from "./handbook/handbook";
import { mountDossier } from "./dossier";
import {
  LAB_GROUP_BLURBS,
  LAB_GROUP_LABELS,
  LAB_GROUP_ORDER,
  LAB_SCENARIOS,
  labScenarioAvailable,
  type LabScenarioGroup,
} from "./lab/scenarios";
import {
  applyCompareChoice,
  MAX_COMPARE_ROUNDS,
  playAgainCompareDrill,
  resetCompareDrill,
  startCompareDrill,
  useCompareHint,
  type CompareDrillState,
  type CompareSide,
} from "./lab/easternArabicCompare";
import {
  formatNumberScript,
  NUMBER_SCRIPT_PACKS,
  STANDALONE_TO_SCRIPT,
  type NumberScriptId,
} from "./lab/numberScripts";
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

/** Travel path preview after roll (#15) — hit targets for click-to-land. */
type RouteStopHit = {
  stopIndex: number;
  nodeId: string;
  moveSteps: number;
  breakSpaces: number;
  breakFuel: number;
  affordable: boolean;
  x: number;
  y: number;
};
type RouteSegHit = {
  stopIndex: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
let lastRoutePreview: {
  color: string;
  selectedBreak: number;
  total: number;
  stops: RouteStopHit[];
  segs: RouteSegHit[];
  poly: { x: number; y: number }[];
} | null = null;
/** Hovered stop along path (not body inspect). */
let routeHoverStop: number | null = null;

const DWELL_STOP_MS = 420;
const DWELL_PASS_MS = 140;
const DWELL_AI_STOP_MS = 280;
const DWELL_AI_PASS_MS = 90;
const AI_ACTION_PAUSE_MS = 160;
const DICE_FRAME_MS = 55;
const DICE_FRAMES = 12;

/** Player preference: hop / dice / AI pacing (#10). */
const ANIM_SPEED_KEY = "heliopoly-anim-speed";
type AnimSpeedId = "slow" | "normal" | "fast" | "instant";
const ANIM_SPEED_MULT: Record<AnimSpeedId, number> = {
  slow: 1.65,
  normal: 1,
  fast: 0.42,
  instant: 0,
};

function isAnimSpeedId(v: string | null): v is AnimSpeedId {
  return v === "slow" || v === "normal" || v === "fast" || v === "instant";
}

function loadAnimSpeed(): AnimSpeedId {
  try {
    const raw = localStorage.getItem(ANIM_SPEED_KEY);
    if (isAnimSpeedId(raw)) return raw;
  } catch {
    /* private mode */
  }
  return "normal";
}

let animSpeed: AnimSpeedId = loadAnimSpeed();

function saveAnimSpeed(id: AnimSpeedId): void {
  animSpeed = id;
  try {
    localStorage.setItem(ANIM_SPEED_KEY, id);
  } catch {
    /* ignore */
  }
}

/** Player preference: which ruleset to load (#132). Unshipped ids fall back to V1. */
function loadGameplayMode(): GameplayModeId {
  try {
    const raw = localStorage.getItem(GAMEPLAY_MODE_KEY);
    const id = parseStoredMode(raw);
    if (modeDef(id).shipped) {
      if (raw !== id) {
        localStorage.setItem(GAMEPLAY_MODE_KEY, id);
      }
      return id;
    }
    localStorage.setItem(GAMEPLAY_MODE_KEY, "v1");
    return "v1";
  } catch {
    /* private mode */
  }
  return "v1";
}

let gameplayMode: GameplayModeId = loadGameplayMode();

function saveGameplayMode(id: GameplayModeId): void {
  gameplayMode = id;
  try {
    localStorage.setItem(GAMEPLAY_MODE_KEY, id);
  } catch {
    /* ignore */
  }
}

function paintGameplayModeSelect(sel: HTMLSelectElement): void {
  sel.replaceChildren();
  for (const def of GAMEPLAY_MODES) {
    const opt = document.createElement("option");
    opt.value = def.id;
    opt.textContent = modeSelectLabel(def.id);
    opt.disabled = !def.shipped;
    sel.appendChild(opt);
  }
  sel.value = gameplayMode;
}

/**
 * Player preference: scale system ring band + dashed opacity (#101).
 * Peak constants = true max (slider 100%). Default slider = 50% = preferred look.
 * 0 = hidden; 100% ≈ 2× preferred (not the old over-bright peak).
 */
const RING_OPACITY_KEY = "heliopoly-ring-opacity-v3";

function loadRingOpacityScale(): number {
  try {
    const raw = localStorage.getItem(RING_OPACITY_KEY);
    if (raw == null) return RING_OPACITY_DEFAULT;
    const n = Number(raw);
    if (Number.isFinite(n)) return Math.min(1, Math.max(0, n));
  } catch {
    /* private mode */
  }
  return RING_OPACITY_DEFAULT;
}

let ringOpacityScale = loadRingOpacityScale();

function saveRingOpacityScale(scale: number): void {
  ringOpacityScale = Math.min(1, Math.max(0, scale));
  try {
    localStorage.setItem(RING_OPACITY_KEY, String(ringOpacityScale));
  } catch {
    /* ignore */
  }
}

function syncRingOpacityUi(): void {
  const el = document.getElementById("ring-opacity") as HTMLInputElement | null;
  if (el) el.value = String(Math.round(ringOpacityScale * 100));
}

/** Scale a base duration by the current speed preference. */
function animMs(baseMs: number): number {
  const m = ANIM_SPEED_MULT[animSpeed];
  if (m <= 0 || baseMs <= 0) return 0;
  return Math.max(0, Math.round(baseMs * m));
}

/** Escape player-typed names before injecting into rankings HTML. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const handbook = mountHandbook(
  document.getElementById("handbook-root") as HTMLElement,
);

const dossier = mountDossier(
  document.getElementById("dossier-root") as HTMLElement,
  {
    getState: () => state,
    onSell: (nodeId) => {
      if (!state) return;
      const node = getNode(state.board, nodeId);
      const legal = getLegalActions(state);
      const row = legal.sellClaims.find((c) => c.nodeId === nodeId);
      if (!row) return;
      if (
        !confirm(
          `Sell ${node.name} for ${formatMoney(row.value)}? Any depot on it is scrapped.`,
        )
      ) {
        return;
      }
      void act({ type: "sell", nodeId });
    },
    onAuction: (nodeId, reserve) => {
      if (!state) return;
      const legal = getLegalActions(state);
      const row = legal.sellClaims.find((c) => c.nodeId === nodeId);
      if (!row || !legal.canAuction) return;
      const ask = Number.isFinite(reserve) ? Math.max(row.value, Math.floor(reserve)) : row.value;
      void act({ type: "auction_start", nodeId, reserve: ask });
    },
    onOpenHandbook: (topicId) => handbook.open(topicId),
  },
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
const animSpeedSelect = document.getElementById(
  "anim-speed",
) as HTMLSelectElement | null;
if (animSpeedSelect) {
  animSpeedSelect.value = animSpeed;
  animSpeedSelect.addEventListener("change", () => {
    const v = animSpeedSelect.value;
    if (isAnimSpeedId(v)) saveAnimSpeed(v);
  });
}

const gameplayModeSelect = document.getElementById(
  "gameplay-mode",
) as HTMLSelectElement | null;
if (gameplayModeSelect) {
  paintGameplayModeSelect(gameplayModeSelect);
  gameplayModeSelect.addEventListener("change", () => {
    const next = parseStoredMode(gameplayModeSelect.value);
    if (!modeDef(next).shipped) {
      gameplayModeSelect.value = gameplayMode;
      return;
    }
    if (next === gameplayMode) return;
    const live = !!state && state.phase !== "game_over";
    if (live) {
      const ok = window.confirm(
        "Switch gameplay version? This ends the current match.",
      );
      if (!ok) {
        gameplayModeSelect.value = gameplayMode;
        return;
      }
    }
    saveGameplayMode(next);
    state = null;
    visualNode = {};
    setBusy(false);
    hideEndScreen();
    btnQuit.classList.add("hidden");
    setSetupCollapsed(false);
    render();
  });
}

// System ring opacity (Pilot Controls “Rings” slider) — scales #101 band/dash paint
syncRingOpacityUi();
const ringOpacityInput = document.getElementById(
  "ring-opacity",
) as HTMLInputElement | null;
ringOpacityInput?.addEventListener("input", () => {
  const pct = Number(ringOpacityInput.value);
  saveRingOpacityScale(
    Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) / 100 : 1,
  );
  drawBoard();
});

// Expedition length: setup only (locked once a game starts — #87 / #195)
(() => {
  const stored = loadStoredAiDifficulty();
  syncAiDifficultyUi(stored);
  document.querySelectorAll('input[name="ai-difficulty"]').forEach((el) => {
    el.addEventListener("change", () => {
      // Only apply mid-setup; ignore if a charter is already running
      if (state && state.phase !== "game_over") return;
      const v = (el as HTMLInputElement).value;
      const level = normalizeAiDifficulty(v);
      syncAiDifficultyUi(level);
      try {
        localStorage.setItem(AI_DIFF_KEY, level);
      } catch {
        /* ignore */
      }
    });
  });
})();
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
const eacRoot = document.getElementById("eac-root")!;
const eacRoundEl = document.getElementById("eac-round")!;
const eacAttemptsEl = document.getElementById("eac-attempts")!;
const eacPlayEl = document.getElementById("eac-play")!;
const eacEndEl = document.getElementById("eac-end")!;
const eacEndTitle = document.getElementById("eac-end-title")!;
const eacEndBlurb = document.getElementById("eac-end-blurb")!;
const eacLeftBtn = document.getElementById("eac-left") as HTMLButtonElement;
const eacRightBtn = document.getElementById("eac-right") as HTMLButtonElement;
const eacLeftGlyph = document.getElementById("eac-left-glyph")!;
const eacRightGlyph = document.getElementById("eac-right-glyph")!;
const eacLeftWest = document.getElementById("eac-left-west")!;
const eacRightWest = document.getElementById("eac-right-west")!;
const eacHintBtn = document.getElementById("eac-hint") as HTMLButtonElement;
const eacResetBtn = document.getElementById("eac-reset") as HTMLButtonElement;
const eacRecapEl = document.getElementById("eac-recap")!;

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
const dirRow = document.getElementById("dir-row")!;
const dirHint = document.getElementById("dir-hint")!;
const btnDirFwd = document.getElementById("btn-dir-fwd") as HTMLButtonElement;
const btnDirBack = document.getElementById("btn-dir-back") as HTMLButtonElement;
const playerCountInput = document.getElementById(
  "player-count",
) as HTMLInputElement;
const pilotCountChips = document.getElementById("pilot-count-chips");

function syncPilotCountChips(): void {
  const n = String(
    Math.min(6, Math.max(2, Number(playerCountInput.value) || 4)),
  );
  if (playerCountInput.value !== n) playerCountInput.value = n;
  pilotCountChips?.querySelectorAll("[data-players]").forEach((el) => {
    const on = el.getAttribute("data-players") === n;
    el.classList.toggle("selected", on);
    el.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

pilotCountChips?.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest("[data-players]");
  if (!(btn instanceof HTMLElement)) return;
  playerCountInput.value = btn.getAttribute("data-players") ?? "4";
  syncPilotCountChips();
});
playerCountInput.addEventListener("change", syncPilotCountChips);
syncPilotCountChips();
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
  const t = animMs(ms);
  if (t <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, t));
}

function selectedPropellant(): PropellantId {
  const el = document.querySelector(
    'input[name="propellant"]:checked',
  ) as HTMLInputElement | null;
  return el?.value === "hydrogen" ? "hydrogen" : "methane";
}

const AI_DIFF_KEY = "heliopoly-ai-difficulty";

function selectedAiDifficulty(): AiDifficulty {
  const el = document.querySelector(
    'input[name="ai-difficulty"]:checked',
  ) as HTMLInputElement | null;
  return normalizeAiDifficulty(el?.value);
}

/** Sync setup radios only — difficulty is fixed for the duration of a charter (#87). */
function syncAiDifficultyUi(level: AiDifficulty): void {
  const radio = document.querySelector(
    `input[name="ai-difficulty"][value="${level}"]`,
  ) as HTMLInputElement | null;
  if (radio) radio.checked = true;
  try {
    localStorage.setItem(AI_DIFF_KEY, level);
  } catch {
    /* ignore */
  }
}

function loadStoredAiDifficulty(): AiDifficulty {
  try {
    return normalizeAiDifficulty(localStorage.getItem(AI_DIFF_KEY));
  } catch {
    return "normal";
  }
}

/** Disable setup AI radios while a game is in progress. */
function setAiDifficultyLocked(locked: boolean): void {
  document.querySelectorAll('input[name="ai-difficulty"]').forEach((el) => {
    (el as HTMLInputElement).disabled = locked;
  });
}

const announceRoot = document.getElementById("announce-root")!;
const announceCard = document.getElementById("announce-card")!;
const announceKicker = document.getElementById("announce-kicker")!;
const announceTitle = document.getElementById("announce-title")!;
const announceBody = document.getElementById("announce-body")!;
let announceWaiters: Array<() => void> = [];

/** Chance-card clerk pose (#113). 2:1 banners — heads and props in frame. */
function announceArtFor(a: { kind: string; title: string }): string {
  const t = a.title.toLowerCase();
  if (a.kind === "gusher" || t.includes("struck") || t.includes("ice"))
    return "/handbook/cards/banners/clerk-gusher.jpg";
  if (a.kind === "leak" || t.includes("leak"))
    return "/handbook/cards/banners/clerk-leak.jpg";
  if (a.kind === "out") return "/handbook/cards/banners/clerk-out.jpg";
  if (t.includes("tesla") || t.includes("roadster"))
    return "/handbook/cards/banners/clerk-tesla.jpg";
  if (t.includes("monolith")) return "/handbook/cards/banners/clerk-monolith.jpg";
  if (t.includes("dividend")) return "/handbook/cards/banners/clerk-dividend.jpg";
  if (t.includes("kostka")) return "/handbook/cards/banners/clerk-kostka.jpg";
  if (t.includes("microphone") || t.includes("disney"))
    return "/handbook/cards/banners/clerk-hotmic.jpg";
  if (t.includes("tuesday")) return "/handbook/cards/banners/clerk-tuesday.jpg";
  if (t.includes("error 47") || t.includes("not an object"))
    return "/handbook/cards/banners/clerk-error47.jpg";
  return "/handbook/cards/banners/clerk-canonical.jpg";
}

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
          : a.title === "Won" ||
              a.title === "Outbid" ||
              a.title === "Claim sold" ||
              a.title === "Auction withdrawn"
            ? "Claim auction"
            : "Ledger event";
  announceTitle.textContent = a.title;
  announceBody.textContent = a.body;
  const art = document.getElementById("announce-art");
  if (art) {
    art.hidden = false;
    art.style.backgroundImage = `url("${announceArtFor(a)}")`;
  }
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

const auctionRoot = document.getElementById("auction-root")!;
const auctionTitle = document.getElementById("auction-title")!;
const auctionBody = document.getElementById("auction-body")!;
const auctionAmount = document.getElementById(
  "auction-amount",
) as HTMLInputElement;
const auctionBidBtn = document.getElementById("auction-bid") as HTMLButtonElement;
const auctionPassBtn = document.getElementById(
  "auction-pass",
) as HTMLButtonElement;

function paintAuctionPrompt(): void {
  if (!state || !humanAuctionNeedsInput(state) || !state.pendingAuction) {
    auctionRoot.classList.add("hidden");
    return;
  }
  const a = state.pendingAuction;
  const node = getNode(state.board, a.nodeId);
  const seller = state.players.find((p) => p.id === a.sellerId);
  const human = state.players.find((p) => p.agent === "human" && !p.eliminated);
  auctionTitle.textContent = node.name;
  auctionBody.textContent = `${seller?.name ?? "A rival"} is auctioning ${node.name}. Reserve ${formatMoney(a.reserve)}. You have ${formatMoney(human?.cash ?? 0)}.`;
  auctionAmount.min = String(a.reserve);
  auctionAmount.max = String(human?.cash ?? 0);
  if (!auctionAmount.value) auctionAmount.value = String(a.reserve);
  const cash = human?.cash ?? 0;
  const cur = Number(auctionAmount.value);
  if (!auctionAmount.value || Number.isNaN(cur) || cur < a.reserve) {
    auctionAmount.value = String(a.reserve);
  }
  const v = Number(auctionAmount.value);
  auctionBidBtn.disabled = cash < a.reserve || v < a.reserve || v > cash;
  auctionRoot.classList.remove("hidden");
}

auctionPassBtn?.addEventListener("click", () => {
  void act({ type: "auction_bid", amount: 0 });
});
auctionBidBtn?.addEventListener("click", () => {
  void act({ type: "auction_bid", amount: Number(auctionAmount.value) || 0 });
});
auctionAmount?.addEventListener("input", () => paintAuctionPrompt());

/**
 * Shared fleet card: standings XOR new-game setup (same sidebar slot).
 * @param showStandings true = charter standings; false = new game form
 */
function setSetupCollapsed(showStandings: boolean): void {
  fleetCard.classList.toggle("mode-standings", showStandings);
  fleetCard.classList.toggle("mode-setup", !showStandings);
  standingsPanel.hidden = !showStandings;
  setupBody.hidden = showStandings;

  // Difficulty locked once a charter exists (even mid New game UI) until Return/end
  setAiDifficultyLocked(!!state && state.phase !== "game_over");
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
    setupToggle.title = "Back to the ledger";
    setupToggle.setAttribute("aria-label", "Back to the ledger");
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

/** Classic die face: which of 9 grid cells (0–8, row-major) get a pip. */
const DIE_PIP_CELLS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function setDie(el: HTMLElement, value: number | string, rolling = false): void {
  el.classList.toggle("rolling", rolling);
  const n =
    typeof value === "number"
      ? value
      : value === "?" || value === ""
        ? 0
        : Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n < 1 || n > 6) {
    el.dataset.face = "";
    el.setAttribute("aria-label", "Die face unknown");
    el.innerHTML = `<span class="die-unknown" aria-hidden="true">?</span>`;
    return;
  }
  el.dataset.face = String(n);
  el.setAttribute("aria-label", `Die showing ${n}`);
  const on = new Set(DIE_PIP_CELLS[n] ?? []);
  el.innerHTML = Array.from({ length: 9 }, (_, i) =>
    `<span class="pip${on.has(i) ? " on" : ""}" aria-hidden="true"></span>`,
  ).join("");
}

async function animateDicePair(
  d1El: HTMLElement,
  d2El: HTMLElement,
  final: { d1: number; d2: number },
): Promise<void> {
  if (animSpeed === "instant") {
    setDie(d1El, final.d1, false);
    setDie(d2El, final.d2, false);
    return;
  }
  const frames = animSpeed === "fast" ? 6 : DICE_FRAMES;
  for (let i = 0; i < frames; i++) {
    setDie(d1El, 1 + Math.floor(Math.random() * 6), true);
    setDie(d2El, 1 + Math.floor(Math.random() * 6), true);
    await sleep(DICE_FRAME_MS);
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
  const humanName = s.players.find((p) => p.agent === "human")?.name ?? null;
  const humanInDuel =
    humanName !== null &&
    (humanName === r.challengerName || humanName === r.defenderName);
  const humanWon = humanName !== null && humanName === r.winnerName;
  duelResultPunchy.textContent = duelPunchLine(
    r.outcome,
    humanWon,
    humanInDuel,
  );
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
  const lengthBit = ` The ledger ran ${s.round} round${s.round === 1 ? "" : "s"}.`;
  if (!winner) return reason + lengthBit;
  const nw = formatMoney(netWorth(s, winner));
  const deeds = winner.properties.length;
  const depots = winner.properties.filter((id) => s.stations[id]).length;
  const history = ` The ledger writes ${winner.name} as one of the greatest of all kind.`;
  const empire =
    deeds > 0 || depots > 0
      ? ` Closing books: ${nw} net worth · ${deeds} claim${deeds === 1 ? "" : "s"} · ${depots} depot${depots === 1 ? "" : "s"}.`
      : ` Closing books: ${nw} net worth.`;
  const best = bestBooksLine(s, winner.id);
  return reason + history + lengthBit + empire + (best ? ` ${best}` : "");
}

function showEndScreen(s: GameState): void {
  submitGameTelemetry(s);
  const winner = s.players.find((p) => p.id === s.winnerId);
  const kicker = document.querySelector(".end-kicker") as HTMLElement | null;
  if (kicker) {
    kicker.textContent = winner
      ? "Greatest of all kind"
      : "The ledger records";
  }
  endTitle.textContent = winner ? prevailsHeadline(winner) : "The ledger closes";
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
      const path = walkMovePath(
        before.board,
        from,
        steps,
        actor.moveDirection,
      );
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

    if (humanAuctionNeedsInput(cur)) break;

    // Charter alert pick (#107): human must act; AI auto-resolves
    if (cur.pendingCharterChoice) {
      const chooser = cur.players.find(
        (x) => x.id === cur.pendingCharterChoice!.chooserId,
      );
      if (chooser?.agent === "human") break;
      cur = resolveCharterChoiceIfAi(cur);
      state = cur;
      render();
      continue;
    }

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
    if (action.type !== "roll") await sleep(AI_ACTION_PAUSE_MS);
  }
  return cur;
}

async function commitState(next: GameState): Promise<void> {
  hideWelcomeCard();
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

  if (action.type === "auction_bid") {
    if (!humanAuctionNeedsInput(state)) return;
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
    return;
  }

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

function hideWelcomeCard(): void {
  document.getElementById("welcome-card")?.classList.add("hidden");
}

function startGame(human: boolean): void {
  if (animating) return;
  hideWelcomeCard();
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

/** Gravity Duel panel → Ops Manual Gravity Duel topic (#21). */
document.getElementById("btn-duel-handbook")?.addEventListener("click", (ev) => {
  ev.stopPropagation();
  handbook.open("duel");
});

/**
 * Full player-facing log retained in state (see LOG_RETAIN_MAX in rules).
 * Log panel UI still shows only a recent window for performance.
 */
function gameLogText(): string {
  if (!state?.log.length) return "";
  return state.log
    .filter((line) => !/↺|^\s*seed\[/i.test(line))
    .join("\n");
}

function flashCopyButton(btn: HTMLButtonElement, idleLabel: string): void {
  btn.classList.add("copied");
  const prev = btn.textContent;
  btn.textContent = "Copied";
  window.setTimeout(() => {
    btn.classList.remove("copied");
    btn.textContent = prev || idleLabel;
  }, 1600);
}

async function copyGameLog(feedbackBtn?: HTMLButtonElement): Promise<void> {
  const text = gameLogText();
  if (!text) return;
  const btn = feedbackBtn ?? btnCopyLog;
  try {
    await navigator.clipboard.writeText(text);
    flashCopyButton(btn, btn === btnCopyLog ? "Copy" : "Copy log");
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
      flashCopyButton(btn, btn === btnCopyLog ? "Copy" : "Copy log");
    } finally {
      document.body.removeChild(ta);
    }
  }
}

btnCopyLog.addEventListener("click", () => {
  void copyGameLog(btnCopyLog);
});

const btnEndCopyLog = document.getElementById(
  "end-copy-log",
) as HTMLButtonElement | null;
btnEndCopyLog?.addEventListener("click", () => {
  void copyGameLog(btnEndCopyLog);
});

/** Charter standings: any text on a rocket's row → that seat's dossier. */
function standingsRowFromEvent(e: Event): HTMLElement | null {
  return (
    ((e.target as HTMLElement | null)?.closest?.(".rank-row") as HTMLElement | null) ??
    null
  );
}

function onStandingsActivate(row: HTMLElement): void {
  if (!state || animating) return;
  const pc = state.pendingCharterChoice;
  const kickId = row.getAttribute("data-kick-id");
  if (pc?.kind === "vibe_kick" && kickId) {
    const chooser = state.players.find((x) => x.id === pc.chooserId);
    if (chooser?.agent === "human") {
      void act({ type: "charter_kick", targetPlayerId: kickId });
      return;
    }
  }
  const id = row.getAttribute("data-dossier-id");
  if (id) dossier.open(id);
}

rankingsEl.addEventListener("click", (e) => {
  const row = standingsRowFromEvent(e);
  if (!row) return;
  e.preventDefault();
  onStandingsActivate(row);
});
rankingsEl.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const row = standingsRowFromEvent(e);
  if (!row) return;
  e.preventDefault();
  onStandingsActivate(row);
});

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
    eacRoot.classList.contains("hidden") &&
    document.getElementById("handbook-root")?.classList.contains("hidden")
  ) {
    document.body.classList.remove("handbook-open");
  }
}

/** —— Which is larger? multi-script compare drill (#81 / #76) —— */
let eacState: CompareDrillState | null = null;
let eacScript: NumberScriptId = "eastern-arabic";

const eacHintEl = document.querySelector(".eac-hint") as HTMLElement | null;
const eacTitleEl = document.getElementById("eac-title");
const eacKickerEl = document.querySelector("#eac-root .handbook-kicker");

function isEacOpen(): boolean {
  return !eacRoot.classList.contains("hidden");
}

function eacFormat(n: number): string {
  return formatNumberScript(eacScript, n);
}

function eacSetWestern(el: HTMLElement, value: number | null): void {
  if (value === null) {
    el.textContent = "";
    el.classList.add("hidden");
    return;
  }
  el.textContent = String(value);
  el.classList.remove("hidden");
}

function eacSyncChrome(): void {
  const pack = NUMBER_SCRIPT_PACKS[eacScript];
  if (eacTitleEl) eacTitleEl.textContent = `Which is larger? · ${pack.shortName}`;
  if (eacKickerEl) eacKickerEl.textContent = `Lab · ${pack.shortName}`;
  if (eacHintEl) {
    eacHintEl.innerHTML = `${pack.hintLead}
      You win by finishing three levels in a row without help on those steps.
      Need a hand? <strong>Hint</strong> reveals one number in familiar
      Western digits, but that try won’t advance you; you’ll need to clear
      the level again without a hint.
      You have up to ${MAX_COMPARE_ROUNDS} tries. <strong>Reset</strong> starts over anytime.`;
  }
  // Binary / CJK / Hebrew may need slightly different glyph rendering
  eacRoot.dataset.script = eacScript;
  eacLeftGlyph.classList.toggle("eac-glyph-binary", eacScript === "binary");
  eacRightGlyph.classList.toggle("eac-glyph-binary", eacScript === "binary");
  eacLeftGlyph.classList.toggle("eac-glyph-cjk", eacScript === "chinese" || eacScript === "korean");
  eacRightGlyph.classList.toggle("eac-glyph-cjk", eacScript === "chinese" || eacScript === "korean");
  eacLeftGlyph.classList.toggle("eac-glyph-hebrew", eacScript === "hebrew");
  eacRightGlyph.classList.toggle("eac-glyph-hebrew", eacScript === "hebrew");
}

function renderEacRecap(): void {
  if (!eacState || eacState.phase !== "won" || eacState.cleanClears.length === 0) {
    eacRecapEl.innerHTML = "";
    eacRecapEl.classList.add("hidden");
    return;
  }
  eacRecapEl.classList.remove("hidden");
  const pack = NUMBER_SCRIPT_PACKS[eacScript];
  eacRecapEl.innerHTML = eacState.cleanClears
    .map((c) => {
      const leftG = eacFormat(c.left);
      const rightG = eacFormat(c.right);
      const leftLarger = c.larger === "left" ? " is-larger" : "";
      const rightLarger = c.larger === "right" ? " is-larger" : "";
      return `<div class="eac-recap-row">
        <p class="eac-recap-label">${pack.levelLabel(c.round)}</p>
        <div class="eac-recap-pair">
          <span class="eac-recap-side${leftLarger}">
            <span class="eac-recap-east">${leftG}</span>
            <span class="eac-recap-west">${c.left}</span>
          </span>
          <span class="eac-recap-vs">vs</span>
          <span class="eac-recap-side${rightLarger}">
            <span class="eac-recap-east">${rightG}</span>
            <span class="eac-recap-west">${c.right}</span>
          </span>
        </div>
      </div>`;
    })
    .join("");
}

function renderEac(): void {
  if (!eacState) return;
  const pack = NUMBER_SCRIPT_PACKS[eacScript];
  const ended = eacState.phase === "won" || eacState.phase === "lost";
  eacPlayEl.classList.toggle("hidden", ended);
  eacEndEl.classList.toggle("hidden", !ended);
  eacAttemptsEl.textContent = `${eacState.attempts} / ${MAX_COMPARE_ROUNDS}`;

  if (eacState.phase === "won") {
    eacRoundEl.textContent = "Complete";
    eacEndTitle.textContent = "Nice work";
    eacEndBlurb.textContent =
      "You finished all three levels without using a hint on those steps. Here’s what you saw, with Western numbers alongside:";
    renderEacRecap();
    return;
  }
  if (eacState.phase === "lost") {
    eacRoundEl.textContent = "Out of tries";
    eacEndTitle.textContent = "That’s all for this run";
    eacEndBlurb.textContent = `You used all ${MAX_COMPARE_ROUNDS} tries before finishing the three levels. Play again when you’re ready.`;
    eacRecapEl.innerHTML = "";
    eacRecapEl.classList.add("hidden");
    return;
  }

  eacRecapEl.innerHTML = "";
  eacRecapEl.classList.add("hidden");
  eacRoundEl.textContent = pack.levelLabel(eacState.round);
  const leftGlyph = eacFormat(eacState.left);
  const rightGlyph = eacFormat(eacState.right);
  eacLeftGlyph.textContent = leftGlyph;
  eacRightGlyph.textContent = rightGlyph;
  const showLeftWest = eacState.hintSide === "left";
  const showRightWest = eacState.hintSide === "right";
  eacSetWestern(eacLeftWest, showLeftWest ? eacState.left : null);
  eacSetWestern(eacRightWest, showRightWest ? eacState.right : null);
  eacLeftBtn.setAttribute(
    "aria-label",
    showLeftWest ? `Left number ${leftGlyph} (${eacState.left})` : `Left number ${leftGlyph}`,
  );
  eacRightBtn.setAttribute(
    "aria-label",
    showRightWest
      ? `Right number ${rightGlyph} (${eacState.right})`
      : `Right number ${rightGlyph}`,
  );
  eacHintBtn.disabled = eacState.hintUsed;
}

function openNumberCompare(script: NumberScriptId): void {
  eacScript = script;
  eacState = startCompareDrill();
  eacSyncChrome();
  renderEac();
  // #193 — keep Lab under the drill so ✕ returns to the list, not the board.
  eacRoot.classList.remove("hidden");
  eacRoot.setAttribute("aria-hidden", "false");
  document.body.classList.add("handbook-open");
  eacLeftBtn.focus();
}

function closeEasternArabicCompare(): void {
  eacRoot.classList.add("hidden");
  eacRoot.setAttribute("aria-hidden", "true");
  eacState = null;
  if (
    duelRoot.classList.contains("hidden") &&
    labRoot.classList.contains("hidden") &&
    document.getElementById("handbook-root")?.classList.contains("hidden")
  ) {
    document.body.classList.remove("handbook-open");
  }
}

function eacChoose(side: CompareSide): void {
  if (!eacState || eacState.phase !== "playing") return;
  eacState = applyCompareChoice(eacState, side);
  // Drop sticky focus highlight so the next round doesn't look pre-selected (#85)
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  renderEac();
}

function eacHint(): void {
  if (!eacState || eacState.phase !== "playing") return;
  eacState = useCompareHint(eacState);
  renderEac();
}

function eacReset(): void {
  eacState = resetCompareDrill();
  renderEac();
  eacLeftBtn.focus();
}

function eacPlayAgain(): void {
  eacState = playAgainCompareDrill();
  renderEac();
  eacLeftBtn.focus();
}

/** Which Lab accordion category is open (null = all collapsed). */
let labOpenGroup: LabScenarioGroup | null = null;

function mountLabScenarios(): void {
  const groups = new Map<LabScenarioGroup, typeof LAB_SCENARIOS>();
  for (const sc of LAB_SCENARIOS) {
    const list = groups.get(sc.group) ?? [];
    list.push(sc);
    groups.set(sc.group, list);
  }
  labScenariosEl.innerHTML = "";
  for (const group of LAB_GROUP_ORDER) {
    const list = groups.get(group);
    if (!list?.length) continue;
    const expanded = labOpenGroup === group;
    const wrap = document.createElement("div");
    wrap.className = "lab-group" + (expanded ? " is-open" : "");
    wrap.dataset.group = group;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "lab-group-toggle";
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    toggle.setAttribute("aria-controls", `lab-group-items-${group}`);
    const readyCount = list.filter((s) => labScenarioAvailable(s)).length;
    const countLabel =
      readyCount === list.length
        ? `${list.length}`
        : `${readyCount}/${list.length} ready`;
    toggle.innerHTML = `
      <span class="lab-group-toggle-main">
        <span class="lab-group-toggle-title">${LAB_GROUP_LABELS[group]}</span>
        <span class="lab-group-toggle-blurb">${LAB_GROUP_BLURBS[group]}</span>
      </span>
      <span class="lab-group-toggle-meta">
        <span class="lab-group-count">${countLabel}</span>
        <span class="lab-group-chevron" aria-hidden="true">${expanded ? "▾" : "▸"}</span>
      </span>`;
    toggle.addEventListener("click", () => {
      labOpenGroup = labOpenGroup === group ? null : group;
      mountLabScenarios();
    });
    wrap.appendChild(toggle);

    const items = document.createElement("div");
    items.id = `lab-group-items-${group}`;
    items.className = "lab-group-items";
    items.hidden = !expanded;
    if (expanded) {
      for (const sc of list) {
        const ready = labScenarioAvailable(sc);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lab-scenario" + (ready ? "" : " is-coming-soon");
        btn.dataset.scenario = sc.id;
        btn.disabled = !ready;
        btn.innerHTML = `
          <span class="lab-scenario-title-row">
            <span class="lab-scenario-title">${sc.title}</span>
            ${ready ? "" : '<span class="lab-scenario-badge">Soon</span>'}
          </span>
          <span class="lab-scenario-blurb">${sc.blurb}</span>`;
        if (ready) {
          btn.addEventListener("click", () => {
            void runLabScenario(sc.id);
          });
        }
        items.appendChild(btn);
      }
    }
    wrap.appendChild(items);
    labScenariosEl.appendChild(wrap);
  }
}

async function runLabScenario(id: string): Promise<void> {
  if (animating) return;
  const sc = LAB_SCENARIOS.find((x) => x.id === id);
  if (!sc || !labScenarioAvailable(sc)) return;
  if (sc.kind === "standalone") {
    const script = STANDALONE_TO_SCRIPT[sc.standaloneId];
    if (script) openNumberCompare(script);
    return;
  }
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
document.getElementById("eac-close")?.addEventListener("click", () => closeEasternArabicCompare());
document.getElementById("eac-backdrop")?.addEventListener("click", () => closeEasternArabicCompare());
document.getElementById("eac-again")?.addEventListener("click", () => eacPlayAgain());
document.getElementById("eac-done")?.addEventListener("click", () => {
  closeEasternArabicCompare();
  openLab();
});
eacHintBtn.addEventListener("click", () => eacHint());
eacResetBtn.addEventListener("click", () => eacReset());
eacLeftBtn.addEventListener("click", () => eacChoose("left"));
eacRightBtn.addEventListener("click", () => eacChoose("right"));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (isEacOpen()) {
      e.preventDefault();
      closeEasternArabicCompare();
      return;
    }
    if (!labRoot.classList.contains("hidden")) closeLab();
    return;
  }
  if (!isEacOpen() || !eacState || eacState.phase !== "playing") return;
  // Point-at-winner: < / ← = left larger; > / → = right larger
  if (e.key === "ArrowLeft" || e.key === "<" || e.key === ",") {
    e.preventDefault();
    eacChoose("left");
  } else if (e.key === "ArrowRight" || e.key === ">" || e.key === ".") {
    e.preventDefault();
    eacChoose("right");
  } else if (e.key === "h" || e.key === "H") {
    e.preventDefault();
    eacHint();
  } else if (e.key === "r" || e.key === "R") {
    // Avoid stealing browser refresh chord when meta/ctrl held
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    eacReset();
  }
});
mountLabScenarios();

setupToggle.addEventListener("click", () => {
  const showingStandings = fleetCard.classList.contains("mode-standings");
  setSetupCollapsed(!showingStandings);
});

btnNew.addEventListener("click", () => startGame(includeHuman.checked));
btnSelf.addEventListener("click", () => {
  if (animating) return;
  hideWelcomeCard();
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
  if (!confirm("Quit this expedition? The ledger will not write a winner.")) return;
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

function requestCourse(
  direction: "forward" | "backward",
): void {
  if (!state) return;
  const p = currentPlayer(state);
  const legal = getLegalActions(state);
  if (!legal.setDirection || !p.canBidirectional || p.directionLocked) return;
  if (p.moveDirection === direction) return;
  void act({ type: "set_direction", direction });
}

btnDirFwd.addEventListener("click", () => requestCourse("forward"));
btnDirBack.addEventListener("click", () => requestCourse("backward"));

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

/**
 * Fuel tank as unit dots (language A): ● full · ◐ half · ○ empty.
 * 10 segments scaled to maxFuel, quantized to half-segments.
 * Reserve block bars (▓░) for non-fuel meters elsewhere.
 */
function fuelTankBar(fuel: number, maxFuel: number, segments = 10): string {
  const max = Math.max(1, maxFuel);
  // Nearest half-segment (0, 0.5, 1, … segments)
  const halfSteps = Math.round(
    Math.min(1, Math.max(0, fuel / max)) * segments * 2,
  );
  let full = Math.floor(halfSteps / 2);
  let half = halfSteps % 2;
  if (full >= segments) {
    full = segments;
    half = 0;
  }
  const empty = Math.max(0, segments - full - half);
  return `${"●".repeat(full)}${half ? "◐" : ""}${"○".repeat(empty)}`;
}

/** True when board + sidebar stack (portrait tablet / phone). */
function isStackedShell(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return (
    window.matchMedia("(max-width: 900px)").matches ||
    window.matchMedia("(max-width: 1180px) and (orientation: portrait)").matches
  );
}

/**
 * Squish the square map into the play area *below* the top menu (#83).
 *
 * iPad Pro 11" landscape (~1194×834 CSS px) is roughly 16:10 overall; after the
 * title + Speed/Lab/Ops/New game/Quit row the remaining play strip is shorter.
 * A width-driven square board (side ≈ column width) is taller than that strip
 * and clips Titan/Enceladus/Holst at the bottom.
 *
 * Fix: available height = visual viewport bottom − header bottom − buffer
 * (measured, not guessed). side = min(column width, that height).
 */
function fitBoardToViewport(): void {
  const canvas = document.getElementById("board") as HTMLCanvasElement | null;
  const top = document.querySelector(".top") as HTMLElement | null;
  const layout = document.querySelector(".layout") as HTMLElement | null;
  const boardPanel = document.querySelector(".board-panel") as HTMLElement | null;
  const boardStage = document.querySelector(".board-stage") as HTMLElement | null;
  if (!canvas || !top) return;

  const vv = window.visualViewport;
  const vh = vv?.height ?? window.innerHeight;
  const vw = vv?.width ?? window.innerWidth;
  const vOffset = vv?.offsetTop ?? 0;
  const viewBottom = vOffset + vh;

  const topRect = top.getBoundingClientRect();
  // Buffer under the menu row (padding around Lab/Ops buttons)
  const buffer = 16;
  const availH = Math.floor(viewBottom - topRect.bottom - buffer);

  const landscape = vw > vh;
  const shortWide = landscape && vh <= 1100;
  const overflowing =
    canvas.getBoundingClientRect().bottom > viewBottom - 2;

  if ((!shortWide && !overflowing) || availH < 120) {
    canvas.style.removeProperty("width");
    canvas.style.removeProperty("height");
    canvas.style.removeProperty("max-width");
    canvas.style.removeProperty("max-height");
    boardStage?.style.removeProperty("width");
    boardStage?.style.removeProperty("height");
    boardPanel?.style.removeProperty("max-height");
    boardPanel?.style.removeProperty("height");
    layout?.style.removeProperty("height");
    layout?.style.removeProperty("max-height");
    document.documentElement.style.removeProperty("--board-fit");
    document.documentElement.style.removeProperty("--header-bottom");
    return;
  }

  document.documentElement.style.setProperty(
    "--header-bottom",
    `${Math.ceil(topRect.bottom)}px`,
  );

  // 1) Lock the game grid to the strip under the menu (height only)
  const layoutH = Math.max(160, availH);
  if (layout) {
    layout.style.height = `${layoutH}px`;
    layout.style.maxHeight = `${layoutH}px`;
    layout.style.minHeight = "0";
    layout.style.overflow = "hidden";
  }
  if (boardPanel) {
    boardPanel.style.height = "100%";
    boardPanel.style.maxHeight = "100%";
    boardPanel.style.minHeight = "0";
    boardPanel.style.overflow = "hidden";
  }

  // 2) Column width from panel (or estimate); height from locked strip
  let availW = Math.floor(vw * 0.65);
  if (boardPanel) {
    const r = boardPanel.getBoundingClientRect();
    if (r.width > 48) availW = Math.floor(r.width);
  }
  const panelH =
    boardPanel && boardPanel.clientHeight > 40
      ? boardPanel.clientHeight
      : layoutH;

  // Square must fit BOTH axes of the play strip (this is the squish)
  const side = Math.max(140, Math.min(availW, panelH, layoutH));

  if (boardStage) {
    boardStage.style.width = `${side}px`;
    boardStage.style.height = `${side}px`;
  }
  canvas.style.setProperty("width", "100%", "important");
  canvas.style.setProperty("height", "100%", "important");
  canvas.style.setProperty("max-width", "100%", "important");
  canvas.style.setProperty("max-height", "100%", "important");
  document.documentElement.style.setProperty("--board-fit", `${side}px`);
}

/** Size log from bottom of Pilot Controls to bottom of the board panel. */
function resizeLog(): void {
  fitBoardToViewport();

  const board = document.querySelector(".board-panel") as HTMLElement;
  const pilotControls = document.getElementById(
    "pilot-controls",
  ) as HTMLElement;
  const logCard = document.querySelector(".log-card") as HTMLElement;
  if (!board || !pilotControls || !logCard) return;

  // Stacked iPad/phone: fixed compact log (CSS also caps). Don't stretch to map.
  if (isStackedShell()) {
    logCard.style.height = "120px";
    logCard.style.maxHeight = "120px";
    logCard.style.flex = "0 0 auto";
    return;
  }

  const gap = 10;
  const boardBottom = board.getBoundingClientRect().bottom;
  const pilotBottom = pilotControls.getBoundingClientRect().bottom;
  const remaining = boardBottom - pilotBottom - gap;
  const h = Math.max(80, remaining);
  logCard.style.height = `${h}px`;
  logCard.style.maxHeight = `${h}px`;
  logCard.style.flex = "0 0 auto";
}

function render(): void {
  drawBoard();
  renderSide();
  resizeLog();
  updateDuelModal(state);
  setAiDifficultyLocked(!!state && state.phase !== "game_over");
  dossier.refresh();
  paintAuctionPrompt();
}

function renderSide(): void {
  if (!state) {
    logEl.textContent = "";
    rankingsEl.textContent = "—";
    btnCopyLog.disabled = true;
    for (const b of [btnRefuel, btnRoll, btnBuy, btnSell, btnStation, btnEnd]) {
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
  const maxFuel = state.config.maxFuel;
  const vibePick =
    !!state.pendingCharterChoice &&
    state.pendingCharterChoice.kind === "vibe_kick" &&
    state.players.find((x) => x.id === state!.pendingCharterChoice!.chooserId)
      ?.agent === "human";
  rankingsEl.innerHTML = standingRows
    .map(({ pl, worth, rankLabel }) => {
      const active = pl.id === p.id && state!.phase !== "game_over";
      const lead = rankLabel === "#1" ? " lead" : "";
      // Subscripts OK here — standings row height was min-height on name button (#64), not glyphs
      const plProp = PROPELLANTS[pl.propellant].short;
      const shown = shipNodeId(pl.id, pl.position);
      const at = getNode(state!.board, shown).name;
      const skip = !pl.eliminated && pl.skipTurns ? " · skip" : "";
      // Soft death-risk signal (#3) — display only, never a rules change
      const atRisk = goingUnderFlags(state!, pl);
      const riskBadge = atRisk.atRisk
        ? `<span class="at-risk-badge" title="Going under: ${atRisk.reasons.join(" · ")}" role="img" aria-label="Going under">⚠</span>`
        : "";
      const bar = fuelTankBar(pl.fuel, maxFuel);
      const barTone =
        pl.eliminated || pl.fuel <= 1
          ? " fuel-bar-red"
          : pl.fuel <= 3
            ? " fuel-bar-amber"
            : "";
      const kickable =
        vibePick && !pl.eliminated && pl.agent === "ai"
          ? " vibe-kickable"
          : "";
      const name = escapeHtml(pl.name);
      const rowTitle =
        kickable !== ""
          ? `Kick ${name} off the ledger`
          : `Open ${name}'s ledger`;
      const kickAttr =
        kickable !== "" ? ` data-kick-id="${pl.id}"` : "";
      // Single-line markup: avoids anonymous whitespace grid items if pre-wrap sneaks back
      return `<div class="rank-row rank-open${lead}${active ? " active" : ""}${pl.eliminated ? " out" : ""}${atRisk.atRisk ? " at-risk" : ""}${kickable}" data-dossier-id="${pl.id}"${kickAttr} role="button" tabindex="0" title="${rowTitle}" aria-label="${rowTitle}"><div class="swatch" style="background:${pl.color}" aria-hidden="true"></div><div class="rank-body"><div class="rank-top"><span class="rank-id">${rankLabel} ${name}${skip} · <span class="rank-prop">${plProp}</span>${riskBadge}</span><span class="rank-money"><span class="cash">${formatMoney(pl.cash)} cash</span> · NW ${formatMoney(worth)}</span></div><div class="rank-detail"><span class="fuel-bar${barTone}" title="Fuel ${pl.fuel} / ${maxFuel}" aria-label="Fuel ${pl.fuel} of ${maxFuel}">${bar}</span> <span class="fuel-n">${pl.fuel}</span> fuel · ${pl.properties.length} claims · ${at}</div></div></div>`;
    })
    .join("");

  // Charter pick banner
  const choiceHint = document.getElementById("charter-choice-hint");
  if (choiceHint) {
    const pc = state.pendingCharterChoice;
    const humanChooser =
      pc &&
      state.players.find((x) => x.id === pc.chooserId)?.agent === "human";
    if (pc && humanChooser) {
      choiceHint.classList.remove("hidden");
      choiceHint.textContent =
        pc.kind === "vibe_kick"
          ? "Vibe-code authority: click an AI rocket in standings to remove them."
          : pc.kind === "olbers_station"
            ? "Olbers award: click a station hub (Elon · Holst · Daktulios) on the board."
            : "Blockchain reassignment: click an opponent claim on the board.";
    } else {
      choiceHint.classList.add("hidden");
      choiceHint.textContent = "";
    }
  }

  const humanPickPending =
    !!state.pendingCharterChoice &&
    state.players.find((x) => x.id === state!.pendingCharterChoice!.chooserId)
      ?.agent === "human";
  const can =
    !animating &&
    !humanPickPending &&
    !humanAuctionNeedsInput(state) &&
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
    teleLines.push(
      p.freeLeavePending && legal.leaveBurnPreview === 0
        ? "leave burn FREE (comet dust)"
        : `leave burn ~${legal.leaveBurnPreview}`,
    );
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
    if (legal.warp && p.warpCharges > 0 && p.agent === "human") {
      teleLines.push(`WARP ×${p.warpCharges} — click a board node`);
      teleLines.push(`or Roll for normal transit`);
    } else if (p.warpCharges > 0) {
      teleLines.push(`STATUS: READY · WARP ×${p.warpCharges}`);
      teleLines.push(`FUEL ${p.fuel}/${state!.config.maxFuel} · CLAIMS ${p.properties.length}`);
    } else if (!p.rolledThisTurn && p.parkCount > 0) {
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

  // Course (palindrome #47) — only while facing can still change
  if (
    can &&
    p.canBidirectional &&
    !p.directionLocked &&
    (state.phase === "await_move" || state.phase === "await_action")
  ) {
    dirRow.classList.remove("hidden-vis");
    btnDirFwd.disabled = false;
    btnDirBack.disabled = false;
    btnDirFwd.classList.toggle("selected", p.moveDirection === "forward");
    btnDirBack.classList.toggle("selected", p.moveDirection === "backward");
    dirHint.textContent =
      p.moveDirection === "backward" ? "retrograde" : "prograde";
  } else if (p.canBidirectional && p.directionLocked && can) {
    dirRow.classList.remove("hidden-vis");
    btnDirFwd.disabled = true;
    btnDirBack.disabled = true;
    btnDirFwd.classList.toggle("selected", p.moveDirection === "forward");
    btnDirBack.classList.toggle("selected", p.moveDirection === "backward");
    dirHint.textContent =
      p.moveDirection === "backward" ? "locked ◀" : "locked ▶";
  } else {
    dirRow.classList.add("hidden-vis");
    btnDirFwd.disabled = true;
    btnDirBack.disabled = true;
  }

  // Break row — fixed 36px, visibility toggled
  if (state.phase === "await_move" && state.lastRoll) {
    breakRow.classList.remove("hidden-vis");
    breakCountEl.textContent = String(legal.breakSpaces);
    if (legal.breakSpaces > 0 && p.freeBreakPending) {
      breakCostEl.textContent = "FREE (M&Ms)";
    } else if (legal.breakSpaces > 0) {
      breakCostEl.textContent = `−${legal.breakFuelCost} fuel`;
    } else if (p.freeBreakPending) {
      breakCostEl.textContent = "free brake ready";
    } else {
      breakCostEl.textContent = "0 fuel";
    }
    // Path preview sticky hint (esp. tablet — no hover)
    if (can && p.agent === "human") {
      breakCostEl.title =
        "Click/tap a stop on your rocket-color path to land there";
      if (legal.breakSpaces === 0 && !p.freeBreakPending) {
        breakCostEl.textContent = "0 fuel · path click to land";
      }
    } else {
      breakCostEl.title = "";
    }
    btnBreakMinus.disabled = !can || legal.breakSpaces <= 0;
    btnBreakPlus.disabled =
      !can || legal.breakSpaces >= legal.maxBreak;
  } else {
    breakRow.classList.add("hidden-vis");
    if (routeHoverStop !== null) routeHoverStop = null;
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
    const cost = legal.placeStationCost;
    btnStation.textContent =
      cost > 0
        ? `Fuel depot ${formatMoney(cost)} (${p.stationsInHand} left)`
        : `Fuel depot free (${p.stationsInHand} left)`;
  } else {
    const here = getNode(state.board, p.position);
    if (state.owners[here.id] !== p.id) btnStation.textContent = "Depot (must own)";
    else if (state.stations[here.id]) btnStation.textContent = "Depot built";
    else if (p.stationsInHand <= 0) btnStation.textContent = "No depots left";
    else if (here.kind !== "planet" && here.kind !== "moon")
      btnStation.textContent = "Depot (moons/planets only)";
    else if (
      p.depotsPlacedThisCircuit > 0 &&
      p.cash < depotPlaceCashCost(p.depotsPlacedThisCircuit, here.price)
    ) {
      btnStation.textContent = `Need ${formatMoney(depotPlaceCashCost(p.depotsPlacedThisCircuit, here.price))} for depot`;
    } else btnStation.textContent = "Place depot";
  }

  logEl.textContent = "";
  const maxLog = 60;
  const start = Math.max(0, state.log.length - maxLog);
  for (let i = state.log.length - 1; i >= start; i--) {
    const line = state.log[i];
    // Belt-and-suspenders: never show engine reseed crumbs in the UI (#56)
    if (/↺|^\s*seed\[/i.test(line)) continue;
    const div = document.createElement("div");
    if (/Winner|claims|collects|Heliopoly|wins Gravity|auctions |bids |docking rights|sells /i.test(line))
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

/** Human can click path to set break / land (#15). */
function humanRoutePreviewReady(): boolean {
  if (!state || animating) return false;
  const p = currentPlayer(state);
  return (
    p.agent === "human" &&
    state.phase === "await_move" &&
    !!state.lastRoll &&
    state.lastRoll.total > 0
  );
}

function distPointToSeg(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-9) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function hitRouteStopAt(sx: number, sy: number): RouteStopHit | null {
  if (!lastRoutePreview) return null;
  const hitR = 16;
  let best: RouteStopHit | null = null;
  let bestD = hitR * hitR;
  for (const stop of lastRoutePreview.stops) {
    const d = (stop.x - sx) ** 2 + (stop.y - sy) ** 2;
    if (d <= bestD) {
      bestD = d;
      best = stop;
    }
  }
  if (best) return best;
  let bestSeg: RouteStopHit | null = null;
  let bestSegD = 12;
  for (const seg of lastRoutePreview.segs) {
    const d = distPointToSeg(sx, sy, seg.x1, seg.y1, seg.x2, seg.y2);
    if (d <= bestSegD) {
      bestSegD = d;
      bestSeg = lastRoutePreview.stops[seg.stopIndex] ?? null;
    }
  }
  return bestSeg;
}

/** Board token (#110): classic teardrop hull + three swept fins. */
function drawRocketToken(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  moving: boolean,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.bezierCurveTo(2.8, -11, 4.2, -6, 4.0, 1.2);
  ctx.bezierCurveTo(5.8, 2.4, 7.4, 5.0, 7.4, 8.0);
  ctx.bezierCurveTo(5.6, 6.8, 4.0, 6.0, 2.6, 5.6);
  ctx.bezierCurveTo(2.4, 7.2, 1.4, 8.8, 0, 9.6);
  ctx.bezierCurveTo(-1.4, 8.8, -2.4, 7.2, -2.6, 5.6);
  ctx.bezierCurveTo(-4.0, 6.0, -5.6, 6.8, -7.4, 8.0);
  ctx.bezierCurveTo(-7.4, 5.0, -5.8, 2.4, -4.0, 1.2);
  ctx.bezierCurveTo(-4.2, -6, -2.8, -11, 0, -11);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = moving ? "#ffc857" : "#fff";
  ctx.lineWidth = moving ? 2 : 1.15;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();
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
  lastRoutePreview = null;
  const cx = sun.x;
  const cy = sun.y;

  // Orbital rings (#101): legacy blue underlay + system bands + tinted dashes
  // Player can dim via Pilot Controls “Rings” slider (ringOpacityScale ≤ 1).
  const ringPx = board.rings.map((rNorm) => rNorm * scale);
  const ringMul = ringOpacityScale;
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
  if (state && humanRoutePreviewReady()) {
    const p = currentPlayer(state);
    const total = state.lastRoll!.total;
    const path = walkMovePath(state.board, p.position, total, p.moveDirection);
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
      selectedBreak: state.breakSpaces,
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

    const selBreak = state.breakSpaces;
    for (const stop of stops) {
      const isSel = stop.breakSpaces === selBreak;
      const isHover = routeHoverStop === stop.stopIndex;
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

    if (routeHoverStop !== null) {
      const hs = stops.find((s) => s.stopIndex === routeHoverStop);
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

  const highlight = new Set(Object.values(visualNode));
  const warpMode =
    !!state &&
    state.phase === "await_action" &&
    !animating &&
    currentPlayer(state).agent === "human" &&
    currentPlayer(state).warpCharges > 0 &&
    getLegalActions(state).warp;

  for (const node of nodes) {
    const x = px(node);
    const y = py(node);
    const baseR = bodyRadius(node);

    if (warpMode && node.id !== currentPlayer(state!).position) {
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
        drawRocketToken(ctx, x, y, pl.color, moving);
      });
    }
  }
}

// —— Board pick (hover inspect + path land #15 + King's Quest warp) ——
function canvasBoardCoords(
  clientX: number,
  clientY: number,
): { sx: number; sy: number } | null {
  if (!lastProject) return null;
  const rect = canvas.getBoundingClientRect();
  return {
    sx: (clientX - rect.left) * (canvas.width / rect.width),
    sy: (clientY - rect.top) * (canvas.height / rect.height),
  };
}

function hitNodeAt(sx: number, sy: number): string | null {
  if (!lastProject) return null;
  const { project, board } = lastProject;
  let best: { id: string; d: number } | null = null;
  for (const node of nodeList(board)) {
    const p = project(node.x, node.y);
    const d = (p.x - sx) ** 2 + (p.y - sy) ** 2;
    const hitR = bodyRadius(node) + 14;
    if (d <= hitR * hitR && (!best || d < best.d)) best = { id: node.id, d };
  }
  return best?.id ?? null;
}

function humanWarpReady(): boolean {
  if (!state || animating) return false;
  const p = currentPlayer(state);
  if (p.agent !== "human" || state.phase !== "await_action") return false;
  return p.warpCharges > 0 && getLegalActions(state).warp;
}

/** Click/tap a path stop: set break and move (land). */
async function landOnRouteStop(stop: RouteStopHit): Promise<void> {
  if (!state || !humanRoutePreviewReady()) return;
  if (!stop.affordable) {
    pushUiFlash(
      `Need ${stop.breakFuel} fuel to break −${stop.breakSpaces} spaces`,
    );
    return;
  }
  routeHoverStop = null;
  await act({ type: "set_break", spaces: stop.breakSpaces });
  if (!state || state.phase !== "await_move") return;
  await act({ type: "move" });
}

/** Brief feedback when path land is blocked (no log spam). */
function pushUiFlash(msg: string): void {
  const el = document.getElementById("path-flash");
  if (el) {
    el.textContent = msg;
    el.classList.remove("hidden");
    window.setTimeout(() => el.classList.add("hidden"), 2200);
    return;
  }
  // Fallback: break-cost line
  breakCostEl.textContent = msg;
  breakCostEl.classList.add("break-cost-warn");
  window.setTimeout(() => breakCostEl.classList.remove("break-cost-warn"), 2200);
}

canvas.addEventListener("mousemove", (ev) => {
  if (!lastProject || !state) {
    bodyTooltip.classList.add("hidden");
    canvas.style.cursor = "default";
    if (routeHoverStop !== null) {
      routeHoverStop = null;
      drawBoard();
    }
    return;
  }
  const coords = canvasBoardCoords(ev.clientX, ev.clientY);
  if (!coords) {
    bodyTooltip.classList.add("hidden");
    return;
  }
  const { sx, sy } = coords;

  // Path segment hover first — break cost on line, not body tooltip (#15)
  const routeHit = humanRoutePreviewReady() ? hitRouteStopAt(sx, sy) : null;
  const nextHover = routeHit?.stopIndex ?? null;
  if (nextHover !== routeHoverStop) {
    routeHoverStop = nextHover;
    drawBoard();
  }
  if (routeHit) {
    bodyTooltip.classList.add("hidden");
    canvas.style.cursor = routeHit.affordable ? "pointer" : "not-allowed";
    return;
  }

  const bestId = hitNodeAt(sx, sy);
  const warpOn = humanWarpReady();
  canvas.style.cursor =
    warpOn && bestId && bestId !== currentPlayer(state).position
      ? "pointer"
      : warpOn
        ? "crosshair"
        : "default";
  if (!bestId) {
    bodyTooltip.classList.add("hidden");
    return;
  }
  const viewer =
    state.players.find((p) => p.agent === "human") ?? currentPlayer(state);
  const info = inspectBody(state, bestId, viewer);
  const warpHint =
    warpOn && bestId !== currentPlayer(state).position
      ? `<div class="tip-line hot">Click to WARP here</div>`
      : "";
  bodyTooltip.innerHTML = `<h4>${info.title}</h4>${warpHint}${info.lines
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
  canvas.style.cursor = "default";
  if (routeHoverStop !== null) {
    routeHoverStop = null;
    drawBoard();
  }
});

canvas.addEventListener("click", (ev) => {
  if (!state || animating) return;
  const coords = canvasBoardCoords(ev.clientX, ev.clientY);
  if (!coords) return;

  // Charter alert board picks (#107)
  const pc = state.pendingCharterChoice;
  if (pc) {
    const chooser = state.players.find((x) => x.id === pc.chooserId);
    if (chooser?.agent === "human") {
      const id = hitNodeAt(coords.sx, coords.sy);
      if (!id) return;
      if (pc.kind === "olbers_station" && isOlbersStation(id)) {
        void act({ type: "charter_olbers", stationId: id });
        return;
      }
      if (
        pc.kind === "blockchain_steal" &&
        stealableClaims(state, chooser.id).includes(id)
      ) {
        void act({ type: "charter_steal", nodeId: id });
        return;
      }
      return;
    }
  }

  if (humanRoutePreviewReady()) {
    const stop = hitRouteStopAt(coords.sx, coords.sy);
    if (stop) {
      void landOnRouteStop(stop);
      return;
    }
  }

  if (!humanWarpReady()) return;
  const id = hitNodeAt(coords.sx, coords.sy);
  if (!id) return;
  if (id === currentPlayer(state).position) return;
  void act({ type: "warp", destination: id });
});



function onShellResize(): void {
  resizeLog();
  drawBoard();
}

window.addEventListener("resize", onShellResize);
window.addEventListener("orientationchange", () => {
  window.setTimeout(onShellResize, 200);
});
window.visualViewport?.addEventListener("resize", onShellResize);

/** iPad WKWebView / home-screen: shell classes for layout. */
(function markNativeShell(): void {
  try {
    const proto =
      typeof location !== "undefined" ? location.protocol : "";
    // file:// (legacy) or heliopoly:// (iOS custom scheme — ES modules work there)
    const native =
      proto === "file:" ||
      proto === "heliopoly:" ||
      (typeof navigator !== "undefined" &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const coarse =
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(pointer: coarse)").matches;
    if (native) {
      document.documentElement.classList.add("native-shell");
    }
    if (coarse) document.documentElement.classList.add("touch-ui");
  } catch {
    /* ignore */
  }
})();

setSetupCollapsed(false);
drawBoard();
renderSide();
// Second pass: header is laid out, then squish board under Lab/Ops chrome (#83)
requestAnimationFrame(() => {
  onShellResize();
  requestAnimationFrame(onShellResize);
});
