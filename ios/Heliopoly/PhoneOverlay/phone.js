/* HeliopolyPhone overlay (#150 rewrite).
   Setup: expedition card — Launch on the first screen, Pilot off.
   Play: board is the page. Bottom thumbs: Roll, cash, fuel, Book.
   No right-edge handle. Reuse existing nodes. No second HUD. */
(function () {
  if (window.__heliopolyPhoneProto) return;
  window.__heliopolyPhoneProto = true;

  var html = document.documentElement;
  html.classList.add("phone-proto", "touch-ui");
  html.classList.remove("native-shell");

  var MODAL_IDS = [
    "handbook-root",
    "dossier-root",
    "lab-root",
    "eac-root",
    "duel-root",
    "announce-root",
    "auction-root",
  ];

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

  var nodeHome = {
    roll: null,
    end: null,
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

  function labelBook(handbook, on) {
    if (!handbook) return;
    var label = handbook.querySelector("span");
    if (on) {
      if (label && nodeHome.handbookLabel == null) {
        nodeHome.handbookLabel = (label.textContent || "").trim();
      }
      if (!label) {
        label = document.createElement("span");
        handbook.appendChild(label);
      }
      label.textContent = "Book";
      handbook.setAttribute("aria-label", "Book");
      handbook.title = "Book";
      handbook.classList.add("phone-thumb-book");
    } else {
      if (label) label.textContent = nodeHome.handbookLabel || "Ops Manual";
      handbook.setAttribute("aria-label", "Open Helios Ops Manual");
      handbook.title = "Helios Ops Manual";
      handbook.classList.remove("phone-thumb-book");
    }
  }

  /**
   * Bottom thumb bar: Roll, cash, fuel, Book. Same nodes, no sidebar hunt.
   */
  function ensureThumbBar(on) {
    var pc = $("pilot-controls");
    var roll = $("btn-roll");
    var end = $("btn-end");
    var rankings = $("rankings");
    var handbook = $("btn-handbook-header");
    var bar = $("phone-thumb-bar");

    if (!on) {
      if (roll) restoreHome("roll", roll);
      if (end) restoreHome("end", end);
      if (rankings) restoreHome("rankings", rankings);
      if (handbook) {
        labelBook(handbook, false);
        restoreHome("handbook", handbook);
      }
      if (bar) bar.remove();
      return;
    }

    if (!pc) return;
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "phone-thumb-bar";
      pc.appendChild(bar);
    }
    if (roll) {
      rememberHome("roll", roll);
      bar.appendChild(roll);
    }
    if (end) {
      rememberHome("end", end);
      bar.appendChild(end);
    }
    if (rankings) {
      rememberHome("rankings", rankings);
      bar.appendChild(rankings);
      // Cash/fuel are vitals, not a door into On the ledger.
      if (!rankings.__phoneMute) {
        rankings.__phoneMute = true;
        rankings.addEventListener(
          "click",
          function (e) {
            e.stopPropagation();
            e.preventDefault();
          },
          true
        );
      }
    }
    if (handbook) {
      rememberHome("handbook", handbook);
      labelBook(handbook, true);
      bar.appendChild(handbook);
    }
  }

  var MU_BY_DIFF = { easy: 32, normal: 25, hard: 35, expert: 60 };
  var PROP_WORDS = { methane: "Methane", hydrogen: "Hydrogen" };
  var DIFF_WORDS = { easy: "Easy", normal: "Normal", hard: "Hard", expert: "Expert" };
  var setupObserved = false;

  function relabelChoices(selector, map) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      var input = nodes[i];
      var word = map[input.value];
      var label = input.closest ? input.closest("label") : input.parentNode;
      if (!word || !label) continue;
      var kid = label.firstChild;
      while (kid) {
        var next = kid.nextSibling;
        if (kid !== input && kid.className !== "phone-choice-label") {
          if (kid.nodeType === 3) kid.textContent = "";
          else if (kid.classList && !kid.classList.contains("phone-choice-label")) {
            kid.parentNode.removeChild(kid);
          }
        }
        kid = next;
      }
      var span = label.querySelector(".phone-choice-label");
      if (!span) {
        span = document.createElement("span");
        span.className = "phone-choice-label";
        label.appendChild(span);
      }
      span.textContent = word;
    }
  }

  function compactSetupCopy() {
    var fuelLegend = document.querySelector(
      "#setup-body > .propellant-field:not(.ai-difficulty-field) legend"
    );
    if (fuelLegend) fuelLegend.textContent = "Fuel";
    var tableLegend = document.querySelector(".ai-difficulty-field legend");
    if (tableLegend) tableLegend.textContent = "Table";
    relabelChoices('input[name="propellant"]', PROP_WORDS);
    relabelChoices('input[name="ai-difficulty"]', DIFF_WORDS);
    var h1 = document.querySelector("header.top h1");
    if (h1) {
      for (var n = h1.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3 && n.textContent.indexOf(">") >= 0) {
          n.textContent = n.textContent.replace(">", "");
        }
      }
    }
  }

  function compactDurationMeter() {
    var meter = $("duration-meter");
    if (!meter) return;
    var checked = document.querySelector('input[name="ai-difficulty"]:checked');
    var level = (checked && checked.value) || "normal";
    var mu = MU_BY_DIFF[level] || 25;
    meter.style.setProperty("width", "auto", "important");
    meter.style.setProperty("height", "auto", "important");
    meter.style.setProperty("min-height", "0", "important");
    var title = meter.querySelector(".duration-meter-title");
    if (title) title.textContent = "μ " + mu + " rounds";
    var body = meter.querySelector(".duration-meter-body");
    if (body) body.style.display = "none";
  }

  function observeSetupChrome() {
    if (setupObserved || !window.MutationObserver) return;
    setupObserved = true;
    var meter = $("duration-meter");
    if (meter) {
      new MutationObserver(function () {
        if (!isPlay()) compactDurationMeter();
      }).observe(meter, { childList: true, subtree: true });
    }
    var radios = document.querySelectorAll('input[name="ai-difficulty"]');
    for (var i = 0; i < radios.length; i++) {
      radios[i].addEventListener("change", compactDurationMeter);
    }
  }

  function clearModalInline() {
    for (var i = 0; i < MODAL_IDS.length; i++) {
      var el = $(MODAL_IDS[i]);
      if (!el) continue;
      el.style.display = "";
      el.style.pointerEvents = "";
    }
  }

  function disarmDeadLayers() {
    var welcome = $("welcome-card");
    if (welcome) welcome.style.pointerEvents = "none";
    if (!isPlay()) {
      var board = $("board");
      if (board) board.style.pointerEvents = "none";
      var panel = document.querySelector(".board-panel");
      if (panel) panel.style.pointerEvents = "none";
    }
  }

  function ensureChipHits() {
    var chips = document.querySelectorAll("#setup-body .check");
    for (var i = 0; i < chips.length; i++) {
      var label = chips[i];
      var input = label.querySelector("input");
      if (!input) continue;
      label.style.position = "relative";
      label.style.isolation = "isolate";
      input.style.pointerEvents = "auto";
      input.style.position = "absolute";
      input.style.left = "0";
      input.style.top = "0";
      input.style.right = "0";
      input.style.bottom = "0";
      input.style.width = "100%";
      input.style.height = "100%";
      input.style.maxWidth = "100%";
      input.style.maxHeight = "100%";
      input.style.margin = "0";
      input.style.opacity = "0.02";
      input.removeAttribute("disabled");
    }
  }

  function ensureSetupHitTargets() {
    var fleet = $("fleet-card");
    var setup = $("setup-body");
    if (fleet) {
      fleet.style.pointerEvents = "auto";
      fleet.removeAttribute("aria-hidden");
    }
    if (setup) {
      setup.style.pointerEvents = "auto";
      setup.style.position = "static";
      setup.hidden = false;
    }
    var standings = $("standings-panel");
    if (standings) standings.hidden = true;
    compactSetupCopy();
    compactDurationMeter();
    ensureChipHits();
    disarmDeadLayers();
    observeSetupChrome();
    var btn = $("btn-new");
    if (btn) {
      btn.style.pointerEvents = "auto";
      btn.style.position = "relative";
      btn.style.zIndex = "80";
      btn.disabled = false;
    }
  }

  function syncTurnChrome() {
    var roll = $("btn-roll");
    var rollLive = !!(roll && !roll.disabled);
    html.classList.toggle("phone-roll-ready", rollLive);
  }

  function observeTurnButtons() {
    if (!window.MutationObserver) return;
    var ids = [
      "btn-roll",
      "btn-buy",
      "btn-end",
      "btn-refuel",
      "btn-sell",
      "btn-station",
      "break-row",
    ];
    for (var i = 0; i < ids.length; i++) {
      var el = $(ids[i]);
      if (!el || el.__phoneTurnObs) continue;
      el.__phoneTurnObs = true;
      new MutationObserver(syncTurnChrome).observe(el, {
        attributes: true,
        attributeFilter: ["disabled", "class"],
      });
    }
  }

  function layout() {
    var play = isPlay();
    var modal = isModalOpen();
    html.classList.toggle("phone-play", play);
    html.classList.toggle("phone-setup", !play);
    html.classList.toggle("phone-modal-open", modal);
    html.classList.remove("phone-sheet-open");

    if (!play) {
      html.classList.remove("phone-roll-ready");
      ensureThumbBar(false);
      ensureSetupHitTargets();
      return;
    }

    clearModalInline();
    var board = $("board");
    if (board) board.style.pointerEvents = "auto";
    var panel = document.querySelector(".board-panel");
    if (panel) panel.style.pointerEvents = "auto";
    ensureThumbBar(true);
    observeTurnButtons();
    syncTurnChrome();
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
    html.classList.add("phone-proto", "touch-ui", "phone-setup");
    html.classList.remove("native-shell");
    ensureBadge();
    layout();
    observeModals();

    var fc = $("fleet-card");
    if (fc && window.MutationObserver) {
      new MutationObserver(layout).observe(fc, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

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
