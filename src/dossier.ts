/**
 * Live rocket dossier — standings name click.
 * Read-only for rivals; bank dump / auction on your seat.
 */
import {
  buildDossierView,
  formatMarkIncomeLine,
  hubNetworkLabel,
  type DossierView,
} from "./core/claimLedger";
import { formatMoney } from "./core/currency";
import { netWorth } from "./core/rules";
import { PROPELLANTS } from "./core/propellant";
import { pilotByCallsign } from "./core/pilotNames";
import { STATION_HUB_IDS } from "./core/systems";
import type { GameState } from "./core/types";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface DossierController {
  open: (playerId: string, focusNodeId?: string) => void;
  close: () => void;
  isOpen: () => boolean;
  refresh: () => void;
  openedPlayerId: () => string | null;
}

export function mountDossier(
  root: HTMLElement,
  opts: {
    getState: () => GameState | null;
    onSell: (nodeId: string) => void;
    onAuction: (nodeId: string, reserve: number) => void;
    onOpenHandbook: (topicId: string) => void;
  },
): DossierController {
  let open = false;
  let playerId: string | null = null;
  /** Claim with the inline reserve form expanded (#140). */
  let askNodeId: string | null = null;
  /** Claim to highlight after open (underfoot Books); not an auto-sell. */
  let focusNodeId: string | null = null;

  root.classList.add("handbook", "dossier");
  root.innerHTML = `
    <div class="handbook-backdrop" data-dossier-close tabindex="-1"></div>
    <div
      class="handbook-panel dossier-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-title"
    >
      <header class="handbook-header">
        <div class="handbook-header-brand">
          <span class="dossier-swatch" id="dossier-swatch" aria-hidden="true"></span>
          <div>
            <p class="handbook-kicker">On the ledger</p>
            <h2 id="dossier-title">Rocket</h2>
          </div>
        </div>
        <button type="button" class="handbook-close" data-dossier-close aria-label="Close dossier">✕</button>
      </header>
      <div id="dossier-body" class="dossier-body"></div>
    </div>
  `;

  const titleEl = root.querySelector("#dossier-title") as HTMLElement;
  const swatchEl = root.querySelector("#dossier-swatch") as HTMLElement;
  const bodyEl = root.querySelector("#dossier-body") as HTMLElement;

  function hide(): void {
    open = false;
    askNodeId = null;
    focusNodeId = null;
    root.classList.add("hidden");
    root.setAttribute("aria-hidden", "true");
    if (
      document.getElementById("handbook-root")?.classList.contains("hidden") &&
      document.getElementById("lab-root")?.classList.contains("hidden")
    ) {
      document.body.classList.remove("handbook-open");
    }
  }

  function show(): void {
    open = true;
    root.classList.remove("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("handbook-open");
    paint();
    requestAnimationFrame(scrollFocusIntoView);
  }

  function scrollFocusIntoView(): void {
    if (!focusNodeId) return;
    const row = bodyEl.querySelector(".dossier-row-focus");
    if (row instanceof HTMLElement) {
      row.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  function paint(): void {
    const state = opts.getState();
    if (!state || !playerId) {
      bodyEl.innerHTML = `<p class="hint">No expedition on the board.</p>`;
      return;
    }
    const view = buildDossierView(state, playerId, netWorth);
    if (!view) {
      bodyEl.innerHTML = `<p class="hint">That rocket is not on this charter.</p>`;
      return;
    }
    titleEl.textContent = view.name;
    swatchEl.style.background = view.color;
    bodyEl.innerHTML = renderDossier(view, askNodeId, focusNodeId);
    const form = bodyEl.querySelector("[data-auction-form]");
    if (form) {
      const input = form.querySelector(
        "[data-dossier-reserve-input]",
      ) as HTMLInputElement | null;
      const go = form.querySelector(
        "[data-dossier-auction-go]",
      ) as HTMLButtonElement | null;
      input?.addEventListener("input", () => {
        if (!input || !go) return;
        const min = Number(input.min);
        const max = Number(input.max);
        let v = Math.floor(Number(input.value));
        if (!Number.isFinite(v) || v < min) v = min;
        if (Number.isFinite(max) && v > max) v = max;
        go.textContent = `Ask ${formatMoney(v)}`;
      });
    }
  }

  root.addEventListener("click", (ev) => {
    const t = ev.target as HTMLElement | null;
    if (!t) return;
    if (t.closest("[data-dossier-close]")) {
      hide();
      return;
    }
    const bio = t.closest("[data-dossier-handbook]") as HTMLElement | null;
    if (bio) {
      const topic = bio.getAttribute("data-dossier-handbook");
      if (topic) opts.onOpenHandbook(topic);
      return;
    }
    const sell = t.closest("[data-dossier-sell]") as HTMLElement | null;
    if (sell) {
      const id = sell.getAttribute("data-dossier-sell");
      if (id) opts.onSell(id);
      return;
    }
    const auction = t.closest("[data-dossier-auction]") as HTMLElement | null;
    if (auction) {
      const id = auction.getAttribute("data-dossier-auction");
      if (id) {
        askNodeId = id;
        paint();
      }
      return;
    }
    const cancelAsk = t.closest("[data-dossier-auction-cancel]");
    if (cancelAsk) {
      askNodeId = null;
      paint();
      return;
    }
    const go = t.closest("[data-dossier-auction-go]") as HTMLElement | null;
    if (go) {
      const id = go.getAttribute("data-dossier-auction-go");
      const input = go
        .closest("[data-auction-form]")
        ?.querySelector("[data-dossier-reserve-input]") as HTMLInputElement | null;
      const raw = Math.floor(Number(input?.value));
      if (id && Number.isFinite(raw)) {
        askNodeId = null;
        opts.onAuction(id, raw);
      }
    }
  });

  document.addEventListener("keydown", (ev) => {
    if (!open) return;
    if (ev.key === "Escape") {
      const handbookOpen = !document
        .getElementById("handbook-root")
        ?.classList.contains("hidden");
      if (handbookOpen) return;
      hide();
    }
  });

  return {
    open: (id: string, nodeId?: string) => {
      playerId = id;
      focusNodeId = nodeId ?? null;
      show();
    },
    close: hide,
    isOpen: () => open,
    refresh: () => {
      if (open) paint();
    },
    openedPlayerId: () => (open ? playerId : null),
  };
}

function handbookTopicForName(name: string): string {
  const pilot = pilotByCallsign(name);
  return pilot ? `pilot-${pilot.id}` : "rival-pilots-overview";
}

function renderDossier(
  view: DossierView,
  askNodeId: string | null,
  focusNodeId: string | null,
): string {
  const prop = PROPELLANTS[view.propellant].short;
  const topic = handbookTopicForName(view.name);
  const bioLabel =
    topic === "rival-pilots-overview" ? "Rival rockets" : "Ops Manual";
  const rights = view.landingRights.length
    ? `<p class="dossier-rights">Docking rights: ${view.landingRights
        .map(
          (r) =>
            `${escapeHtml(r.name)}${r.remaining > 1 ? ` ×${r.remaining}` : ""}`,
        )
        .join(" · ")}</p>`
    : "";
  const sellHint = view.canSell
    ? `<p class="hint">Sell pays the Mark (half the bank sticker) and scraps the depot. Auction reserve defaults to the Mark; you may raise it up to MSRP. A winning bid keeps the depot and grants you one free landing. Each claim may be auctioned once per turn.</p>`
    : "";

  const groups = view.groups.length
    ? view.groups.map((g) => renderGroup(g, view, askNodeId, focusNodeId)).join("")
    : `<p class="hint">No claims on the ledger.</p>`;

  return `
    <div class="dossier-vitals">
      <p class="dossier-meta">
        <span class="cash">${formatMoney(view.cash)} cash</span>
        · NW ${formatMoney(view.netWorth)}
        · ${prop}
        · ${view.fuel}/${view.maxFuel} fuel
        · at ${escapeHtml(view.positionName)}
        ${view.eliminated ? " · OUT" : ""}
      </p>
      <p class="dossier-meta">
        Deeds ${formatMoney(view.deedValue)}
        · depots ${formatMoney(view.depotValue)}
        · ${view.circuits} rotation${view.circuits === 1 ? "" : "s"}
        · park ${view.parkCount}
        · ${hubNetworkLabel(view.hubCount)} (${STATION_HUB_IDS.length} hubs)
      </p>
      <p class="dossier-tools">
        <button type="button" class="dossier-bio" data-dossier-handbook="${topic}">${bioLabel}</button>
      </p>
      ${rights}
      ${sellHint}
    </div>
    <div class="dossier-claims">${groups}</div>
  `;
}

function renderGroup(
  g: DossierView["groups"][number],
  view: DossierView,
  askNodeId: string | null,
  focusNodeId: string | null,
): string {
  const flag = g.monopoly ? ` · MONOPOLY rent ×2` : "";
  const rows = g.rows.map((row) => {
    const depot = row.hasDepot ? " · depot" : "";
    const hub = row.isHub
      ? row.hubMult > 1
        ? ` · hub ×${row.hubMult}`
        : " · hub"
      : "";
    const listed = view.auctionedThisTurn.includes(row.nodeId);
    let actions = "";
    if (view.canSell) {
      actions =
        askNodeId === row.nodeId
          ? `<div class="dossier-row-actions dossier-auction-form" data-auction-form="${row.nodeId}">
              <label class="auction-bid-field">Reserve
                <input
                  type="number"
                  inputmode="numeric"
                  min="${row.bankValue}"
                  max="${row.listPrice}"
                  step="25"
                  value="${row.bankValue}"
                  data-dossier-reserve-input
                />
              </label>
              <span class="dossier-row-sub">Mark ${formatMoney(row.bankValue)} · MSRP ${formatMoney(row.listPrice)}</span>
              <button type="button" class="primary" data-dossier-auction-go="${row.nodeId}">Ask ${formatMoney(row.bankValue)}</button>
              <button type="button" data-dossier-auction-cancel>Cancel</button>
            </div>`
          : `<div class="dossier-row-actions">
              <button type="button" data-dossier-sell="${row.nodeId}">Sell ${formatMoney(row.bankValue)}</button>
              <button type="button" class="primary" data-dossier-auction="${row.nodeId}" ${listed ? "disabled" : ""}>${listed ? "Listed this turn" : "Auction"}</button>
            </div>`;
    }
    const focused = focusNodeId === row.nodeId ? " dossier-row-focus" : "";
    return `<li class="dossier-row${focused}" data-node-id="${escapeHtml(row.nodeId)}">
      <div class="dossier-row-main">
        <strong>${escapeHtml(row.name)}</strong>
        <span class="dossier-row-sub"><span class="dossier-row-mark">Mark ${formatMoney(row.bankValue)}</span> · <span class="dossier-row-msrp">MSRP ${formatMoney(row.listPrice)}</span> · rent now ${formatMoney(row.rentNow)}${depot}${hub}</span>
        <span class="dossier-row-book">${escapeHtml(formatMarkIncomeLine(row))}</span>
      </div>
      ${actions}
    </li>`;
  });
  return `<section class="dossier-group">
    <h3>${escapeHtml(g.title)} <span class="dossier-count">${g.owned}/${g.total}${flag}</span></h3>
    <ul>${rows.join("")}</ul>
  </section>`;
}
