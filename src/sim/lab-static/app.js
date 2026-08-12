/** Sim Lab client (#91) — talks to local lab-server only. */

const form = document.getElementById("run-form");
const btnRun = document.getElementById("btn-run");
const btnStop = document.getElementById("btn-stop");
const statusEl = document.getElementById("status");
const progressWrap = document.getElementById("progress-wrap");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");
const results = document.getElementById("results");

function setStatus(kind, text) {
  statusEl.className = `status ${kind}`;
  statusEl.textContent = text;
}

function pct(x) {
  return `${(100 * x).toFixed(1)}%`;
}

function fmtInt(n) {
  return Number(n).toLocaleString("en-US");
}

/**
 * One block per key: label, bar, then "W wins · n finished · rate"
 * (avoids skinny columns overlapping at 20k+ games).
 */
function barTable(rows, labelKey = "key") {
  if (!rows.length) return "<p class='hint'>No data</p>";
  const max = Math.max(...rows.map((r) => r.wins), 1);
  const body = rows
    .map((r) => {
      const w = (r.wins / max) * 100;
      const rate = r.n ? r.wins / r.n : r.share ?? 0;
      const label = escapeHtml(r[labelKey] ?? r.key);
      const n = r.n ?? "—";
      const nTxt = typeof n === "number" ? fmtInt(n) : n;
      return `<div class="stat-row">
        <div class="label">${label}</div>
        <div class="bar-track" aria-hidden="true">
          <div class="bar" style="width:${w.toFixed(1)}%"></div>
        </div>
        <div class="stat-line mono">${fmtInt(r.wins)} wins · n=${nTxt} · ${pct(rate)}</div>
      </div>`;
    })
    .join("");
  return `<div class="stat-list">${body}</div>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rateRows(map) {
  return Object.entries(map || {})
    .map(([key, v]) => ({
      key,
      wins: v.wins || 0,
      n: v.n || 0,
    }))
    .sort((a, b) => b.wins - a.wins);
}

const ORDINAL = ["1st", "2nd", "3rd", "4th", "5th", "6th"];

/** Fallback if server omits color — same order as `src/core/state.ts` COLORS. */
const BOARD_PLAYER_COLORS = [
  "#6ec8ff",
  "#ffc857",
  "#5ddea0",
  "#ff6b7a",
  "#c792ea",
  "#ff9f43",
];

function curveColor(c) {
  if (c.color) return c.color;
  if (c.seat != null) {
    return BOARD_PLAYER_COLORS[c.seat % BOARD_PLAYER_COLORS.length];
  }
  if (c.id === "gameEnd") return "rgba(232,238,252,0.85)";
  return "#6ec8ff";
}

/**
 * Horizontal density chart: x = game round, y = density (KDE from server).
 * Seat curves use board rocket colors.
 */
function renderDensityChart(placeCurves, humanLoss) {
  const panel = document.getElementById("loss-timing");
  const chart = document.getElementById("loss-timing-chart");
  const legend = document.getElementById("elim-legend");
  const note = document.getElementById("human-loss-note");

  if (!placeCurves || !placeCurves.curves?.length) {
    if (humanLoss?.games) {
      panel.hidden = false;
      document.getElementById("loss-timing-caption").textContent =
        humanLoss.caption || "";
      const h = humanLoss.humanElimRound;
      const g = humanLoss.gameLengthRounds;
      document.getElementById("loss-timing-stats").innerHTML = `
        <div class="loss-stat"><div class="ls-v">${fmtInt(humanLoss.games)}</div><div class="ls-l">Human losses</div></div>
        <div class="loss-stat"><div class="ls-v">R${h.p50.toFixed(0)}</div><div class="ls-l">Human out (median)</div></div>
        <div class="loss-stat"><div class="ls-v">R${g.p50.toFixed(0)}</div><div class="ls-l">Game ends (median)</div></div>
      `;
      chart.innerHTML = "";
      legend.innerHTML = "";
      note.hidden = true;
    } else {
      panel.hidden = true;
    }
    return;
  }

  panel.hidden = false;
  document.getElementById("loss-timing-caption").textContent =
    placeCurves.caption ||
    `Per-seat exit densities (board colors) over ${placeCurves.games} finished games.`;

  const curves = placeCurves.curves;
  const xMax = placeCurves.xMax || 100;
  const seatCurves = curves.filter((c) => c.seat != null);
  const gameCurve = curves.find((c) => c.id === "gameEnd");

  document.getElementById("loss-timing-stats").innerHTML = `
    <div class="loss-stat">
      <div class="ls-v">${fmtInt(placeCurves.games)}</div>
      <div class="ls-l">Finished games</div>
    </div>
    ${seatCurves
      .map(
        (c) => `
    <div class="loss-stat" style="border-color:${curveColor(c)}55">
      <div class="ls-v" style="color:${curveColor(c)}">R${c.mean.toFixed(0)}</div>
      <div class="ls-l">Seat ${c.seat}${c.seat === 0 ? " human" : ""} mean exit</div>
    </div>`,
      )
      .join("")}
    ${
      gameCurve
        ? `<div class="loss-stat">
      <div class="ls-v">R${gameCurve.mean.toFixed(0)}</div>
      <div class="ls-l">Mean game end</div>
    </div>`
        : ""
    }
  `;

  legend.innerHTML = curves
    .map((c) => {
      const col = curveColor(c);
      return `<span class="leg"><span class="swatch" style="background:${col}"></span>${escapeHtml(c.label)} · μ R${c.mean.toFixed(0)}</span>`;
    })
    .join("");

  if (humanLoss?.games && humanLoss.caption) {
    note.hidden = false;
    note.textContent = humanLoss.caption;
  } else {
    note.hidden = true;
  }

  const W = 720;
  const H = 320;
  const pad = { l: 48, r: 16, t: 16, b: 40 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  let yMax = 0;
  for (const c of curves) {
    for (const y of c.ys || []) yMax = Math.max(yMax, y);
  }
  yMax = yMax * 1.08 || 1;

  const xScale = (x) => pad.l + (x / xMax) * plotW;
  const yScale = (y) => pad.t + plotH - (y / yMax) * plotH;

  const areaPath = (c) => {
    const xs = c.xs || [];
    const ys = c.ys || [];
    if (!xs.length) return "";
    let d = `M ${xScale(xs[0])} ${yScale(0)}`;
    for (let i = 0; i < xs.length; i++) {
      d += ` L ${xScale(xs[i])} ${yScale(ys[i] || 0)}`;
    }
    d += ` L ${xScale(xs[xs.length - 1])} ${yScale(0)} Z`;
    return d;
  };

  const linePath = (c) => {
    const xs = c.xs || [];
    const ys = c.ys || [];
    if (!xs.length) return "";
    let d = `M ${xScale(xs[0])} ${yScale(ys[0] || 0)}`;
    for (let i = 1; i < xs.length; i++) {
      d += ` L ${xScale(xs[i])} ${yScale(ys[i] || 0)}`;
    }
    return d;
  };

  const xTicks = [];
  const step = xMax <= 60 ? 10 : xMax <= 100 ? 10 : 20;
  for (let t = 0; t <= xMax; t += step) xTicks.push(t);

  let grid = "";
  for (const t of xTicks) {
    const x = xScale(t);
    grid += `<line class="grid-line" x1="${x}" y1="${pad.t}" x2="${x}" y2="${pad.t + plotH}"/>`;
    grid += `<text class="tick" x="${x}" y="${H - 12}" text-anchor="middle">${t}</text>`;
  }
  grid += `<text class="axis-label" x="${pad.l + plotW / 2}" y="${H - 2}" text-anchor="middle">Game round →</text>`;
  grid += `<text class="axis-label" x="14" y="${pad.t + plotH / 2}" text-anchor="middle" transform="rotate(-90 14 ${pad.t + plotH / 2})">Density</text>`;

  let series = "";
  for (const c of curves) {
    const col = curveColor(c);
    const isGameEnd = c.id === "gameEnd";
    const isHuman = c.seat === 0;
    series += `<path d="${areaPath(c)}" fill="${col}" fill-opacity="${isGameEnd ? 0.08 : 0.22}" stroke="none"/>`;
    series += `<path d="${linePath(c)}" fill="none" stroke="${col}" stroke-width="${isHuman ? 2.75 : isGameEnd ? 1.75 : 2}" stroke-dasharray="${isGameEnd ? "5 4" : "none"}"/>`;
    const mx = xScale(Math.min(xMax, Math.max(0, c.mean)));
    series += `<line class="mean-line" x1="${mx}" y1="${pad.t}" x2="${mx}" y2="${pad.t + plotH}" stroke="${col}"/>`;
  }

  chart.innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="${pad.l}" y="${pad.t}" width="${plotW}" height="${plotH}" fill="rgba(5,8,20,0.35)" rx="6"/>
    ${grid}
    ${series}
  </svg>`;
}

function renderHumanLossTiming(timing, placeCurves) {
  renderDensityChart(placeCurves, timing);
}

function renderLaunchOrder(summary, finished, players) {
  const fair = players > 0 ? 1 / players : 0.25;
  const seats = rateRows(summary.winRateBySeat).sort(
    (a, b) => Number(a.key) - Number(b.key),
  );
  // Ensure all seats 0..players-1 appear even if 0 wins
  const bySeat = new Map(seats.map((s) => [Number(s.key), s]));
  const cards = [];
  for (let i = 0; i < players; i++) {
    const row = bySeat.get(i) || { key: String(i), wins: 0, n: finished };
    const rate = finished ? row.wins / finished : 0;
    const delta = rate - fair;
    const deltaTxt =
      Math.abs(delta) < 0.005
        ? "≈ fair share"
        : `${delta > 0 ? "+" : ""}${(100 * delta).toFixed(1)} pp vs fair`;
    const hot = rate >= fair + 0.05 ? " hot" : rate <= fair - 0.05 ? " cold" : "";
    cards.push(`
      <div class="launch-card${hot}">
        <div class="launch-ord">${ORDINAL[i] || `Seat ${i}`} to launch</div>
        <div class="launch-pct">${pct(rate)}</div>
        <div class="launch-sub">seat ${i} · ${fmtInt(row.wins)} / ${fmtInt(finished)} finished</div>
        <div class="launch-delta">${deltaTxt}</div>
        <div class="bar-track launch-bar" aria-hidden="true">
          <div class="bar" style="width:${Math.min(100, 100 * rate / Math.max(fair * 2, 0.01)).toFixed(1)}%"></div>
        </div>
      </div>`);
  }
  document.getElementById("launch-cards").innerHTML = cards.join("");

  const callout = document.getElementById("launch-callout");
  const first = bySeat.get(0);
  const firstRate = first && finished ? first.wins / finished : 0;
  if (firstRate >= 0.4) {
    callout.hidden = false;
    callout.className = "launch-callout warn";
    callout.textContent = `First launcher wins ${pct(firstRate)} of finished games — strong seat-0 bias (fair is ${pct(fair)}).`;
  } else if (Math.abs(firstRate - fair) < 0.03) {
    callout.hidden = false;
    callout.className = "launch-callout ok";
    callout.textContent = `First launcher is near fair share (~${pct(fair)}). Going first is not a large advantage in this run.`;
  } else {
    callout.hidden = false;
    callout.className = "launch-callout";
    callout.textContent = `Fair share with ${players} players = ${pct(fair)} each. Compare cards above.`;
  }
}

function renderResults(payload) {
  const { summary, sampleGames, outDir } = payload;
  const games = summary.games || 1;
  results.hidden = false;

  document.getElementById("kpis").innerHTML = `
    <div class="kpi"><div class="kpi-v">${summary.meanRounds.toFixed(1)}</div><div class="kpi-l">Mean rounds</div></div>
    <div class="kpi"><div class="kpi-v">${summary.meanTurns.toFixed(0)}</div><div class="kpi-l">Mean turns</div></div>
    <div class="kpi"><div class="kpi-v">${pct(summary.unfinishedRate)}</div><div class="kpi-l">Unfinished (${summary.unfinished})</div></div>
    <div class="kpi"><div class="kpi-v">${(summary.wallMs / 1000).toFixed(2)}s</div><div class="kpi-l">${summary.gamesPerSec.toFixed(1)} games/s</div></div>
  `;

  const cfg = summary.config || {};
  const players = cfg.players || 4;
  const humanDiff = cfg.humanDifficulty || cfg.aiDifficulty || "normal";
  const packDiff = cfg.packDifficulty || cfg.aiDifficulty || "normal";
  document.getElementById("meta").textContent = [
    `run ${summary.runId}`,
    `experiment=${cfg.experiment}`,
    `human@${humanDiff}`,
    `pack@${packDiff}`,
    `git=${cfg.gitCommit}`,
    `seed ${cfg.baseSeed}+i×${cfg.seedStride}`,
    outDir ? `saved ${outDir}` : "not saved to disk",
  ].join(" · ");

  const finished =
    summary.finishedGames ?? Math.max(0, games - (summary.unfinished || 0));

  // Prefer explicit humanWins; fall back to seat-0 wins if server is stale/partial
  const seat0Wins =
    (summary.winsBySeat && summary.winsBySeat["0"]) ||
    (summary.winRateBySeat && summary.winRateBySeat["0"]?.wins) ||
    0;
  const humanWins =
    summary.humanWins != null ? summary.humanWins : seat0Wins;
  const humanRate =
    summary.humanWinRate != null
      ? summary.humanWinRate
      : finished
        ? humanWins / finished
        : 0;
  const fair = summary.fairShare ?? 1 / players;
  const lift =
    summary.humanLiftVsFair != null
      ? summary.humanLiftVsFair
      : humanRate - fair;
  document.getElementById("human-pct").textContent = pct(humanRate);
  document.getElementById("human-sub").textContent =
    `${fmtInt(humanWins)} / ${fmtInt(finished)} finished · seat 0`;
  document.getElementById("human-delta").textContent =
    Math.abs(lift) < 0.005
      ? `≈ fair share (${pct(fair)})`
      : `${lift > 0 ? "+" : ""}${(100 * lift).toFixed(1)} pp vs fair ${pct(fair)}`;
  document.getElementById("fair-pct").textContent = pct(fair);
  document.getElementById("skill-line").textContent =
    `Human ${humanDiff} vs pack ${packDiff}`;

  let narrative = summary.outcomeSummary || "";
  if (!narrative) {
    narrative =
      "Missing outcome summary — the Sim Lab server is likely outdated. " +
      "Stop it (Ctrl+C in the terminal running npm run sim-lab), run npm run sim-lab again, hard-refresh this page, then re-run the batch.";
  }
  document.getElementById("outcome-summary").textContent = narrative;

  renderHumanLossTiming(
    summary.humanLossTiming || null,
    summary.eliminationPlaceCurves || null,
  );

  renderLaunchOrder(summary, finished, players);

  // Share of finished games (rates sum ≈ 100% across keys)
  const nameRows = Object.entries(summary.winsByName || {})
    .map(([key, wins]) => ({
      key,
      wins,
      n: finished,
      share: finished ? wins / finished : 0,
    }))
    .sort((a, b) => b.wins - a.wins);
  document.getElementById("tbl-names").innerHTML = barTable(nameRows);

  document.getElementById("tbl-dir").innerHTML = barTable(
    rateRows(summary.winRateByDirection),
  );
  document.getElementById("tbl-prop").innerHTML = barTable(
    rateRows(summary.winRateByPropellant),
  );
  const seats = rateRows(summary.winRateBySeat).sort(
    (a, b) => Number(a.key) - Number(b.key),
  );
  document.getElementById("tbl-seat").innerHTML = barTable(
    seats.map((s) => ({
      ...s,
      key: `${ORDINAL[Number(s.key)] || `seat ${s.key}`} (seat ${s.key})`,
    })),
  );

  const sample = (sampleGames || [])
    .map((g) => {
      const w = g.unfinished ? "∅" : g.winnerName || "—";
      const dirs = (g.seats || []).map((s) => (s.moveDirection || "?")[0]).join("");
      return `<tr>
        <td class="num">${g.gameIndex}</td>
        <td class="num mono">${g.seed}</td>
        <td>${escapeHtml(w)}</td>
        <td class="num">${g.rounds}</td>
        <td class="num">${g.turns}</td>
        <td class="mono">${escapeHtml(dirs)}</td>
      </tr>`;
    })
    .join("");
  document.getElementById("tbl-sample").innerHTML = `
    <table>
      <thead><tr><th>#</th><th>Seed</th><th>Winner</th><th>Rounds</th><th>Turns</th><th>Dirs</th></tr></thead>
      <tbody>${sample}</tbody>
    </table>`;
}

function formPayload() {
  const fd = new FormData(form);
  return {
    games: Number(fd.get("games")),
    players: Number(fd.get("players")),
    experiment: String(fd.get("experiment")),
    humanDifficulty: String(fd.get("humanDifficulty")),
    packDifficulty: String(fd.get("packDifficulty")),
    seed: Number(fd.get("seed")),
    seedStride: Number(fd.get("seedStride")),
    maxTurns: Number(fd.get("maxTurns")),
    save: fd.get("save") === "on",
  };
}

/** Parse SSE from fetch body (POST). */
async function readSse(response, handlers) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const chunk = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      let event = "message";
      let data = "";
      for (const line of chunk.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (data) {
        try {
          handlers[event]?.(JSON.parse(data));
        } catch {
          /* ignore partial */
        }
      }
    }
  }
}

/** Show when the Node process booted (stale servers lack new features). */
async function pingHealth() {
  const el = document.getElementById("server-boot");
  if (!el) return;
  try {
    const r = await fetch("/api/health");
    const h = await r.json();
    const feats = (h.features || []).join(", ");
    el.textContent = h.startedAt
      ? ` · server since ${h.startedAt.slice(11, 19)} UTC` +
        (feats ? ` · ${feats}` : "")
      : "";
    if (!h.features?.includes("human-loss-timing")) {
      el.textContent +=
        " · ⚠ restart npm run sim-lab for dropout chart + human metrics";
      el.classList.add("warn");
    }
  } catch {
    el.textContent = " · server unreachable";
    el.classList.add("warn");
  }
}
pingHealth();

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const payload = formPayload();
  btnRun.disabled = true;
  btnStop.disabled = false;
  progressWrap.classList.remove("hidden");
  progressFill.style.width = "0%";
  progressText.textContent = "Starting…";
  setStatus("run", "Running…");

  try {
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || res.statusText);
    }

    await readSse(res, {
      start: (d) => {
        progressText.textContent = `0 / ${d.games} · ${d.experiment} · human ${d.humanDifficulty ?? "?"} vs pack ${d.packDifficulty ?? d.difficulty ?? "?"}`;
      },
      progress: (p) => {
        const pctDone = (p.done / p.total) * 100;
        progressFill.style.width = `${pctDone}%`;
        progressText.textContent = `${p.done} / ${p.total} · ${p.rate.toFixed(1)} g/s · ETA ${p.etaSec.toFixed(0)}s`;
        setStatus("run", `${p.done}/${p.total}`);
      },
      done: (d) => {
        progressFill.style.width = "100%";
        progressText.textContent = `Done · ${(d.summary.wallMs / 1000).toFixed(2)}s · ${d.summary.gamesPerSec.toFixed(1)} g/s`;
        setStatus("ok", "Complete");
        renderResults(d);
      },
      error: (e) => {
        throw new Error(e.message || "run failed");
      },
    });
  } catch (e) {
    setStatus("err", "Error");
    progressText.textContent = e instanceof Error ? e.message : String(e);
    alert(progressText.textContent);
  } finally {
    btnRun.disabled = false;
    btnStop.disabled = true;
  }
});
