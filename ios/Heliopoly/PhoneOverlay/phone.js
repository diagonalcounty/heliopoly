/* HeliopolyPhone overlay (#148 / #133). Injected only by the phone target.
   Setup: Pilot off — welcome / fleet / Launch stay tappable.
   Play: board is the page; ~10% right handle; swipe opens Pilot 70–90%.
   Modals (Ops Manual / Lab): never steal topic / button taps. */
(function () {
  if (window.__heliopolyPhoneProto) return;
  window.__heliopolyPhoneProto = true;

  var SHEET_CLOSED = 0.1; // 10% grab strip
  var SHEET_OPEN = 0.8; // 80% within 70–90%
  var EDGE_PX = 28;

  var html = document.documentElement;
  html.classList.add("phone-proto", "touch-ui");
  html.classList.remove("native-shell");

  var MODAL_IDS = [
    "handbook-root",
    "dossier-root",
    "lab-root",
    "eac-root",
    "duel-root",
  ];

  var touch = {
    tracking: false,
    startX: 0,
    startY: 0,
    fromEdge: false,
    fromSheet: false,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function isPlay() {
    var fc = $("fleet-card");
    if (!fc) return false;
    if (fc.classList.contains("mode-setup")) return false;
    return fc.classList.contains("mode-standings");
  }

  function isModalOpen() {
    for (var i = 0; i < MODAL_IDS.length; i++) {
      var el = $(MODAL_IDS[i]);
      if (el && !el.classList.contains("hidden")) return true;
    }
    return false;
  }

  function sheetOpen() {
    return html.classList.contains("phone-sheet-open");
  }

  function setSheetWidth(fraction) {
    var pct = Math.round(fraction * 1000) / 10 + "%";
    html.style.setProperty("--phone-sheet-w", pct);
    var app = $("app");
    if (app) app.style.setProperty("--phone-sheet-w", pct);
  }

  function setHeaderHeight() {
    var top = document.querySelector("header.top");
    var h = 48;
    if (top) {
      var rect = top.getBoundingClientRect();
      if (rect.height > 0) h = Math.ceil(rect.height);
    }
    var px = h + "px";
    html.style.setProperty("--phone-header-h", px);
    var app = $("app");
    if (app) app.style.setProperty("--phone-header-h", px);
  }

  function openSheet() {
    if (isModalOpen()) return;
    html.classList.add("phone-sheet-open");
    setSheetWidth(SHEET_OPEN);
    layout();
  }

  function closeSheet() {
    html.classList.remove("phone-sheet-open");
    setSheetWidth(SHEET_CLOSED);
    layout();
  }

  function toggleSheet() {
    if (sheetOpen()) closeSheet();
    else openSheet();
  }

  function ensureGrab() {
    var pc = $("pilot-controls");
    if (!pc) return;
    var grab = $("phone-grab");
    if (!grab) {
      grab = document.createElement("button");
      grab.type = "button";
      grab.id = "phone-grab";
      grab.setAttribute("aria-label", "Pilot Controls");
      grab.innerHTML =
        '<span class="phone-grab-pill" aria-hidden="true"></span>' +
        '<span class="phone-grab-chevron" aria-hidden="true">‹</span>';
      pc.insertBefore(grab, pc.firstChild);
      grab.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (isModalOpen()) return;
        toggleSheet();
      });
    }
  }

  function ensurePrimaryRow() {
    var pc = $("pilot-controls");
    if (!pc) return;
    var roll = $("btn-roll");
    var end = $("btn-end");
    var brk = $("break-row");
    if (!roll || !end || !brk) return;

    var row = $("phone-primary-row");
    if (!row) {
      row = document.createElement("div");
      row.id = "phone-primary-row";
      pc.insertBefore(row, pc.querySelector(".actions") || null);
    }
    if (roll.parentElement !== row) row.appendChild(roll);
    if (brk.parentElement !== row) row.appendChild(brk);
    if (end.parentElement !== row) row.appendChild(end);
  }

  function restorePrimaryRowToStock() {
    var pc = $("pilot-controls");
    var row = $("phone-primary-row");
    if (!pc || !row) return;
    var actions = pc.querySelector(".actions");
    var roll = $("btn-roll");
    var end = $("btn-end");
    var brk = $("break-row");
    if (brk) pc.insertBefore(brk, actions || null);
    if (actions) {
      if (roll) actions.insertBefore(roll, actions.firstChild);
      if (end) actions.appendChild(end);
    }
    row.remove();
  }

  /** Remember where reused nodes live so we can put them back. */
  var nodeHome = {
    telemetry: null,
    rankings: null,
    handbook: null,
    handbookLabel: null,
  };

  function rememberHome(key, el) {
    if (!el || nodeHome[key]) return;
    nodeHome[key] = {
      parent: el.parentNode,
      next: el.nextSibling,
    };
  }

  function restoreHome(key, el) {
    var home = nodeHome[key];
    if (!el || !home || !home.parent) return;
    if (home.next && home.next.parentNode === home.parent) {
      home.parent.insertBefore(el, home.next);
    } else {
      home.parent.appendChild(el);
    }
  }

  /**
   * Open sheet: reuse #telemetry (fuel/status), #rankings (cash+fuel), and
   * #btn-handbook-header as Book. No second HUD, no ROI% (#150).
   */
  function ensureSheetMeta(open) {
    var pc = $("pilot-controls");
    if (!pc) return;

    var meta = $("phone-sheet-meta");
    if (!meta) {
      meta = document.createElement("div");
      meta.id = "phone-sheet-meta";
      var primary = $("phone-primary-row");
      if (primary && primary.parentNode === pc) {
        pc.insertBefore(meta, primary.nextSibling);
      } else {
        var actions = pc.querySelector(".actions");
        pc.insertBefore(meta, actions || null);
      }
    }

    var tele = $("telemetry");
    var rankings = $("rankings");
    var handbook = $("btn-handbook-header");
    var label = handbook && handbook.querySelector("span");

    if (open) {
      if (tele) {
        rememberHome("telemetry", tele);
        meta.appendChild(tele);
      }
      if (rankings) {
        rememberHome("rankings", rankings);
        meta.appendChild(rankings);
      }
      if (handbook) {
        rememberHome("handbook", handbook);
        if (label && nodeHome.handbookLabel == null) {
          nodeHome.handbookLabel = label.textContent;
        }
        if (label) label.textContent = "Book";
        handbook.setAttribute("aria-label", "Book");
        handbook.title = "Book";
        meta.appendChild(handbook);
      }
      meta.hidden = false;
    } else {
      if (tele) restoreHome("telemetry", tele);
      if (rankings) restoreHome("rankings", rankings);
      if (handbook) {
        restoreHome("handbook", handbook);
        if (label) {
          label.textContent = nodeHome.handbookLabel || "Ops Manual";
        }
        handbook.setAttribute("aria-label", "Open Helios Ops Manual");
        handbook.title = "Helios Ops Manual";
      }
      meta.hidden = true;
    }
  }

  function ensureSetupHitTargets() {
    var fleet = $("fleet-card");
    var setup = $("setup-body");
    var btn = $("btn-new");
    if (fleet) {
      fleet.style.pointerEvents = "auto";
      fleet.removeAttribute("aria-hidden");
    }
    if (setup) {
      setup.style.pointerEvents = "auto";
      // Setup mode must show the New Game form (stock uses [hidden] toggle).
      setup.hidden = false;
    }
    var standings = $("standings-panel");
    if (standings) standings.hidden = true;
    if (btn) {
      btn.style.pointerEvents = "auto";
      btn.disabled = false;
    }
  }

  function layout() {
    var play = isPlay();
    var modal = isModalOpen();
    html.classList.toggle("phone-play", play);
    html.classList.toggle("phone-setup", !play);
    html.classList.toggle("phone-modal-open", modal);

    setHeaderHeight();

    if (!play) {
      html.classList.remove("phone-sheet-open");
      setSheetWidth(SHEET_CLOSED);
      ensureSheetMeta(false);
      restorePrimaryRowToStock();
      ensureSetupHitTargets();
      return;
    }

    if (modal) {
      // Keep sheet closed under Ops Manual / Lab so topics stay tappable.
      html.classList.remove("phone-sheet-open");
      setSheetWidth(SHEET_CLOSED);
    }

    ensureGrab();
    ensurePrimaryRow();
    var open = sheetOpen();
    setSheetWidth(open ? SHEET_OPEN : SHEET_CLOSED);
    ensureSheetMeta(open);
  }

  function onBoardTap(e) {
    if (!isPlay() || !sheetOpen() || isModalOpen()) return;
    closeSheet();
  }

  function bindBoardClose() {
    var panel = document.querySelector(".board-panel");
    if (!panel || panel.__phoneBoardBound) return;
    panel.__phoneBoardBound = true;
    panel.addEventListener("click", onBoardTap);
  }

  function onTouchStart(e) {
    if (!isPlay() || isModalOpen() || !e.touches || !e.touches.length) {
      touch.tracking = false;
      return;
    }
    var t = e.touches[0];
    var w = window.innerWidth;
    var headerH = 48;
    var top = document.querySelector("header.top");
    if (top) {
      var rh = top.getBoundingClientRect().height;
      if (rh > 0) headerH = rh;
    }
    // Ignore gestures that start in the header (New game / Lab / Ops).
    if (t.clientY <= headerH) {
      touch.tracking = false;
      return;
    }
    touch.tracking = true;
    touch.startX = t.clientX;
    touch.startY = t.clientY;
    touch.fromEdge = t.clientX >= w - Math.max(EDGE_PX, w * SHEET_CLOSED);
    touch.fromSheet = sheetOpen() && t.clientX >= w * (1 - SHEET_OPEN);
  }

  function onTouchMove(e) {
    if (!touch.tracking || isModalOpen() || !e.touches || !e.touches.length) return;
    var t = e.touches[0];
    var dx = t.clientX - touch.startX;
    var dy = t.clientY - touch.startY;
    if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy)) return;
    if (touch.fromEdge || touch.fromSheet) {
      e.preventDefault();
    }
  }

  function onTouchEnd(e) {
    if (!touch.tracking) return;
    touch.tracking = false;
    if (!isPlay() || isModalOpen()) return;
    var t = e.changedTouches && e.changedTouches[0];
    if (!t) return;
    var dx = t.clientX - touch.startX;
    var dy = t.clientY - touch.startY;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.1) return;

    if (dx < 0 && touch.fromEdge && !sheetOpen()) {
      openSheet();
      return;
    }
    if (dx > 0 && touch.fromSheet && sheetOpen()) {
      closeSheet();
    }
  }

  function ensureBadge() {
    if ($("phone-proto-badge")) return;
    var b = document.createElement("div");
    b.id = "phone-proto-badge";
    b.textContent = "phone proto";
    document.body.appendChild(b);
  }

  function observeModals() {
    if (!window.MutationObserver) return;
    MODAL_IDS.forEach(function (id) {
      var el = $(id);
      if (!el) return;
      new MutationObserver(layout).observe(el, {
        attributes: true,
        attributeFilter: ["class"],
      });
    });
  }

  function boot() {
    html.classList.add("phone-proto", "touch-ui");
    html.classList.remove("native-shell");
    ensureBadge();
    layout();
    bindBoardClose();
    observeModals();

    var fc = $("fleet-card");
    if (fc && window.MutationObserver) {
      new MutationObserver(layout).observe(fc, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    // Capture=false so handbook/lab handlers run normally; we only preventDefault
    // on edge sheet pans when no modal is open.
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("resize", layout);
    window.addEventListener("orientationchange", layout);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", layout);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
