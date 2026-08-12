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

function barTable(rows, labelKey = "key") {
  if (!rows.length) return "<p class='hint'>No data</p>";
  const max = Math.max(...rows.map((r) => r.wins), 1);
  const body = rows
    .map((r) => {
      const w = (r.wins / max) * 100;
      const rate = r.n ? r.wins / r.n : r.share ?? 0;
      return `<tr>
        <td>${escapeHtml(r[labelKey] ?? r.key)}</td>
        <td class="num">${r.wins}</td>
        <td class="num">${r.n ?? "—"}</td>
        <td class="num">${pct(rate)}</td>
        <td class="bar-cell"><div class="bar" style="width:${w.toFixed(1)}%"></div></td>
      </tr>`;
    })
    .join("");
  return `<table>
    <thead><tr><th>Key</th><th>Wins</th><th>n</th><th>Rate</th><th></th></tr></thead>
    <tbody>${body}</tbody>
  </table>`;
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
  document.getElementById("meta").textContent = [
    `run ${summary.runId}`,
    `experiment=${cfg.experiment}`,
    `AI=${cfg.aiDifficulty}`,
    `git=${cfg.gitCommit}`,
    `seed ${cfg.baseSeed}+i×${cfg.seedStride}`,
    outDir ? `saved ${outDir}` : "not saved to disk",
  ].join(" · ");

  const nameRows = Object.entries(summary.winsByName || {})
    .map(([key, wins]) => ({ key, wins, n: games, share: wins / games }))
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
  document.getElementById("tbl-seat").innerHTML = barTable(seats);

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
