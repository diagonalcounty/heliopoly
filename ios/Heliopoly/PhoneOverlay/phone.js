/* HeliopolyPhone overlay (#148 / #133). Injected only by the phone target.
   Setup: Pilot off — welcome / fleet / Launch stay tappable.
   Play: board is the page; ~10% right handle; swipe opens Pilot 70–90%. */
(function () {
  if (window.__heliopolyPhoneProto) return;
  window.__heliopolyPhoneProto = true;

  var SHEET_CLOSED = 0.1; // 10% grab strip
  var SHEET_OPEN = 0.8; // 80% within 70–90%
  var EDGE_PX = 28; // swipe starts near right edge / handle

  var html = document.documentElement;
  html.classList.add("phone-proto", "touch-ui");
  html.classList.remove("native-shell");

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

  function sheetOpen() {
    return html.classList.contains("phone-sheet-open");
  }

  function setSheetWidth(fraction) {
    var pct = Math.round(fraction * 1000) / 10 + "%";
    html.style.setProperty("--phone-sheet-w", pct);
    var app = $("app");
    if (app) app.style.setProperty("--phone-sheet-w", pct);
  }

  function openSheet() {
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
      // First sheet row: Roll | Break | End (#148).
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
    // Put Break back above actions; Roll/End back into actions.
    if (brk) pc.insertBefore(brk, actions || null);
    if (actions) {
      if (roll) actions.insertBefore(roll, actions.firstChild);
      if (end) actions.appendChild(end);
    }
    row.remove();
  }

  function layout() {
    var play = isPlay();
    html.classList.toggle("phone-play", play);
    html.classList.toggle("phone-setup", !play);

    if (!play) {
      html.classList.remove("phone-sheet-open");
      setSheetWidth(SHEET_CLOSED);
      restorePrimaryRowToStock();
      return;
    }

    ensureGrab();
    ensurePrimaryRow();
    setSheetWidth(sheetOpen() ? SHEET_OPEN : SHEET_CLOSED);
  }

  function onBoardTap(e) {
    if (!isPlay() || !sheetOpen()) return;
    // Leftover map strip closes the sheet (#133).
    var panel = e.currentTarget;
    var sheetW = window.innerWidth * SHEET_OPEN;
    var x = e.clientX != null ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
    if (typeof x === "number" && x < window.innerWidth - sheetW) {
      closeSheet();
    } else if (panel) {
      // Any tap on the visible board strip while open → close.
      closeSheet();
    }
  }

  function bindBoardClose() {
    var panel = document.querySelector(".board-panel");
    if (!panel || panel.__phoneBoardBound) return;
    panel.__phoneBoardBound = true;
    panel.addEventListener("click", onBoardTap);
  }

  function onTouchStart(e) {
    if (!isPlay() || !e.touches || !e.touches.length) return;
    var t = e.touches[0];
    var w = window.innerWidth;
    touch.tracking = true;
    touch.startX = t.clientX;
    touch.startY = t.clientY;
    touch.fromEdge = t.clientX >= w - Math.max(EDGE_PX, w * SHEET_CLOSED);
    touch.fromSheet = sheetOpen() && t.clientX >= w * (1 - SHEET_OPEN);
  }

  function onTouchMove(e) {
    if (!touch.tracking || !e.touches || !e.touches.length) return;
    var t = e.touches[0];
    var dx = t.clientX - touch.startX;
    var dy = t.clientY - touch.startY;
    if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy)) return;
    // Horizontal sheet gesture — keep the board from scrolling away.
    if (touch.fromEdge || touch.fromSheet) {
      e.preventDefault();
    }
  }

  function onTouchEnd(e) {
    if (!touch.tracking) return;
    touch.tracking = false;
    if (!isPlay()) return;
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

  function boot() {
    html.classList.add("phone-proto", "touch-ui");
    html.classList.remove("native-shell");
    ensureBadge();
    layout();
    bindBoardClose();

    var fc = $("fleet-card");
    if (fc && window.MutationObserver) {
      new MutationObserver(layout).observe(fc, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

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
