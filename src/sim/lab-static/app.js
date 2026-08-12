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
  document.getElementById("meta").textContent = [
    `run ${summary.runId}`,
    `experiment=${cfg.experiment}`,
    `AI=${cfg.aiDifficulty}`,
    `git=${cfg.gitCommit}`,
    `seed ${cfg.baseSeed}+i×${cfg.seedStride}`,
    outDir ? `saved ${outDir}` : "not saved to disk",
  ].join(" · ");

  const finished =
    summary.finishedGames ?? Math.max(0, games - (summary.unfinished || 0));

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
    difficulty: String(fd.get("difficulty")),
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
        progressText.textContent = `0 / ${d.games} · ${d.experiment} · ${d.difficulty}`;
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
