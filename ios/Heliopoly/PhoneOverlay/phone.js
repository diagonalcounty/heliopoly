/* HeliopolyPhone overlay (#120 / #122). Injected only by the phone target. */
(function () {
  if (window.__heliopolyPhoneProto) return;
  window.__heliopolyPhoneProto = true;

  var html = document.documentElement;
  html.classList.add("phone-proto", "touch-ui");
  html.classList.remove("native-shell");

  function $(id) {
    return document.getElementById(id);
  }

  function isPlay() {
    var fc = $("fleet-card");
    return !!(fc && fc.classList.contains("mode-standings"));
  }

  function breakLive() {
    var row = $("break-row");
    if (!row) return false;
    if (row.classList.contains("hidden")) return false;
    var plus = $("btn-break-plus");
    var minus = $("btn-break-minus");
    return !!(plus && !plus.disabled) || !!(minus && !minus.disabled);
  }

  function pickPrimary() {
    var ids = ["btn-roll", "btn-buy", "btn-end"];
    var found = null;
    for (var i = 0; i < ids.length; i++) {
      var btn = $(ids[i]);
      if (!btn) continue;
      btn.classList.remove("phone-primary-slot");
      if (!found && !btn.disabled) found = btn;
    }
    if (!found) found = $("btn-roll") || $("btn-end");
    if (found) found.classList.add("phone-primary-slot");
    return found;
  }

  function setVar(name, value) {
    document.getElementById("app") &&
      document.getElementById("app").style.setProperty(name, value);
    html.style.setProperty(name, value);
  }

  function layout() {
    var vv = window.visualViewport;
    var vh = vv && vv.height ? vv.height : window.innerHeight;
    var top = vv && typeof vv.offsetTop === "number" ? vv.offsetTop : 0;
    setVar("--vv-height", vh + "px");
    setVar("--vv-top", top + "px");

    var play = isPlay();
    html.classList.toggle("phone-play", play);
    html.classList.toggle("phone-setup", !play);

    var statusH = 56;
    var insetTop = 0;
    var insetBot = 0;
    try {
      var probe = getComputedStyle(html);
      // env() is applied on #app padding in CSS; keep content bands here.
    } catch (e) {}

    var pilot = 56;
    var pc = $("pilot-controls");
    if (pc) {
      pc.classList.toggle("is-collapsed", play && !html.classList.contains("phone-sheet-open"));
      var awaitMove = play && breakLive();
      pc.classList.toggle("is-await-move", awaitMove);
      if (awaitMove && !html.classList.contains("phone-sheet-open")) pilot = 104;
    }

    setVar("--status-h", "calc(" + statusH + "px + env(safe-area-inset-top, 0px))");
    setVar("--pilot-h", "calc(" + pilot + "px + env(safe-area-inset-bottom, 0px))");

    var boardH = Math.max(180, vh - statusH - insetTop - pilot - insetBot - 8);
    setVar("--board-h", boardH + "px");

    pickPrimary();
    syncStatus();
  }

  function syncStatus() {
    var slot = $("phone-status-copy");
    if (!slot) return;
    var tel = $("telemetry");
    var text = "";
    if (tel) text = (tel.innerText || tel.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) {
      var ranks = $("rankings");
      if (ranks) text = (ranks.innerText || "").split("\n")[0] || "";
    }
    slot.textContent = text || "On the ledger";
  }

  function ensureChrome() {
    if (!$("phone-status-copy")) {
      var topRow = document.querySelector(".top-row");
      if (topRow) {
        var copy = document.createElement("div");
        copy.id = "phone-status-copy";
        var h1 = topRow.querySelector("h1");
        if (h1 && h1.nextSibling) topRow.insertBefore(copy, h1.nextSibling);
        else topRow.appendChild(copy);
      }
    }

    if (!$("phone-menu")) {
      var actions = document.querySelector(".top-actions");
      if (actions) {
        var menu = document.createElement("button");
        menu.type = "button";
        menu.id = "phone-menu";
        menu.setAttribute("aria-label", "Menu");
        menu.textContent = "☰";
        actions.insertBefore(menu, actions.firstChild);
        menu.addEventListener("click", toggleMenuSheet);
      }
    }

    if (!$("phone-expand")) {
      var actionsRow = document.querySelector("#pilot-controls .actions");
      if (actionsRow) {
        var exp = document.createElement("button");
        exp.type = "button";
        exp.id = "phone-expand";
        exp.setAttribute("aria-label", "More controls");
        exp.textContent = "▴";
        actionsRow.appendChild(exp);
        exp.addEventListener("click", togglePilotSheet);
      }
    }

    if (!$("phone-sheet-backdrop")) {
      var bd = document.createElement("div");
      bd.id = "phone-sheet-backdrop";
      document.body.appendChild(bd);
      bd.addEventListener("click", closeSheets);
    }
  }

  function togglePilotSheet() {
    html.classList.toggle("phone-sheet-open");
    layout();
  }

  function toggleMenuSheet() {
    var fleet = $("fleet-card");
    var log = document.querySelector(".log-card");
    var open = fleet && fleet.classList.contains("is-open");
    closeSheets();
    if (!open && fleet) {
      fleet.classList.add("is-open");
      if (log) log.classList.add("is-open");
      html.classList.add("phone-sheet-open");
    }
    layout();
  }

  function closeSheets() {
    html.classList.remove("phone-sheet-open");
    var fleet = $("fleet-card");
    var log = document.querySelector(".log-card");
    if (fleet) fleet.classList.remove("is-open");
    if (log) log.classList.remove("is-open");
    layout();
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
    ensureChrome();
    layout();

    var fc = $("fleet-card");
    if (fc && window.MutationObserver) {
      new MutationObserver(layout).observe(fc, { attributes: true, attributeFilter: ["class"] });
    }
    var tel = $("telemetry");
    if (tel && window.MutationObserver) {
      new MutationObserver(syncStatus).observe(tel, { childList: true, subtree: true, characterData: true });
    }
    ["btn-roll", "btn-buy", "btn-end", "btn-break-plus", "btn-break-minus"].forEach(function (id) {
      var el = $(id);
      if (!el || !window.MutationObserver) return;
      new MutationObserver(layout).observe(el, { attributes: true, attributeFilter: ["disabled", "class"] });
    });

    window.addEventListener("resize", layout);
    window.addEventListener("orientationchange", layout);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", layout);
      window.visualViewport.addEventListener("scroll", layout);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
