#!/usr/bin/env python3
"""Build a self-contained HTML report for a Heliopoly sim run (#90).

Usage:
  python3 scripts/sim_html_report.py              # latest under sim-results/
  python3 scripts/sim_html_report.py sim-results/<run>
  python3 scripts/sim_html_report.py --out /tmp/heliopoly-sim.html
  open sim-results/<run>/report.html              # macOS

stdlib only — no pip deps. Opens well offline.
"""

from __future__ import annotations

import argparse
import html
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def find_latest_run(sim_root: Path) -> Path | None:
    best: Path | None = None
    best_mtime = -1.0
    if not sim_root.is_dir():
        return None
    for child in sim_root.iterdir():
        if not child.is_dir():
            continue
        summary = child / "summary.json"
        if not summary.is_file():
            continue
        m = summary.stat().st_mtime
        if m > best_mtime:
            best_mtime = m
            best = child
    return best


def load_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def pct(x: float) -> str:
    return f"{100.0 * x:.1f}%"


def esc(s: Any) -> str:
    return html.escape(str(s), quote=True)


def bar_row(label: str, wins: int, n: int, max_wins: int) -> str:
    rate = wins / n if n else 0.0
    width = (wins / max_wins * 100.0) if max_wins else 0.0
    return f"""
    <tr>
      <td class="label">{esc(label)}</td>
      <td class="num">{wins}</td>
      <td class="num">{n}</td>
      <td class="num">{pct(rate)}</td>
      <td class="bar-cell"><div class="bar" style="width:{width:.1f}%"></div></td>
    </tr>"""


def table_win_rate(
    title: str,
    rows: dict[str, Any],
    key_sort: Any = None,
) -> str:
    if not rows:
        return f"<section><h2>{esc(title)}</h2><p class='muted'>No data.</p></section>"
    items = list(rows.items())
    if key_sort:
        items.sort(key=key_sort)
    else:
        items.sort(key=lambda kv: (-(kv[1].get("wins") or 0), str(kv[0])))
    max_wins = max((int(v.get("wins") or 0) for _, v in items), default=1) or 1
    body = "".join(
        bar_row(
            str(k),
            int(v.get("wins") or 0),
            int(v.get("n") or 0),
            max_wins,
        )
        for k, v in items
    )
    return f"""
    <section>
      <h2>{esc(title)}</h2>
      <table>
        <thead>
          <tr><th>Key</th><th>Wins</th><th>n</th><th>Rate</th><th></th></tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </section>"""


def table_wins_by_name(wins: dict[str, int], games: int) -> str:
    if not wins:
        return "<section><h2>Wins by rocket</h2><p class='muted'>No finished winners.</p></section>"
    items = sorted(wins.items(), key=lambda x: -x[1])
    max_w = max(n for _, n in items) or 1
    body = "".join(
        bar_row(name, n, games, max_w) for name, n in items
    )
    return f"""
    <section>
      <h2>Wins by rocket name</h2>
      <table>
        <thead>
          <tr><th>Rocket</th><th>Wins</th><th>Games</th><th>Share</th><th></th></tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </section>"""


def sample_games_html(ndjson_path: Path, limit: int = 25) -> str:
    if not ndjson_path.is_file():
        return "<section><h2>Sample games</h2><p class='muted'>No games.ndjson</p></section>"
    rows: list[str] = []
    count = 0
    with ndjson_path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                g = json.loads(line)
            except json.JSONDecodeError:
                continue
            count += 1
            if len(rows) >= limit:
                continue
            unfinished = g.get("unfinished")
            winner = g.get("winnerName") or "—"
            if unfinished:
                winner = "∅ unfinished"
            dirs = ",".join(
                s.get("moveDirection", "?")[0] for s in (g.get("seats") or [])
            )
            rows.append(
                f"<tr>"
                f"<td class='num'>{esc(g.get('gameIndex'))}</td>"
                f"<td class='num mono'>{esc(g.get('seed'))}</td>"
                f"<td>{esc(winner)}</td>"
                f"<td class='num'>{esc(g.get('rounds'))}</td>"
                f"<td class='num'>{esc(g.get('turns'))}</td>"
                f"<td class='mono muted'>{esc(dirs)}</td>"
                f"</tr>"
            )
    more = ""
    if count > limit:
        more = f"<p class='muted'>Showing first {limit} of {count} games (see games.ndjson for full dump).</p>"
    return f"""
    <section>
      <h2>Sample games</h2>
      {more}
      <table>
        <thead>
          <tr><th>#</th><th>Seed</th><th>Winner</th><th>Rounds</th><th>Turns</th><th>Dirs</th></tr>
        </thead>
        <tbody>{''.join(rows)}</tbody>
      </table>
    </section>"""


def build_html(
    run_dir: Path,
    summary: dict[str, Any],
    config: dict[str, Any],
) -> str:
    games = int(summary.get("games") or 0)
    unfinished = int(summary.get("unfinished") or 0)
    mean_r = float(summary.get("meanRounds") or 0)
    mean_t = float(summary.get("meanTurns") or 0)
    wall_s = float(summary.get("wallMs") or 0) / 1000.0
    gps = float(summary.get("gamesPerSec") or 0)
    gen = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    meta = f"""
    <dl class="meta">
      <div><dt>Run id</dt><dd class="mono">{esc(summary.get('runId') or config.get('runId'))}</dd></div>
      <div><dt>Experiment</dt><dd><span class="pill">{esc(config.get('experiment'))}</span></dd></div>
      <div><dt>AI difficulty</dt><dd>{esc(config.get('aiDifficulty'))}</dd></div>
      <div><dt>Players</dt><dd>{esc(config.get('players'))}</dd></div>
      <div><dt>Games</dt><dd>{games}</dd></div>
      <div><dt>Git</dt><dd class="mono">{esc(config.get('gitCommit'))}</dd></div>
      <div><dt>Base seed</dt><dd class="mono">{esc(config.get('baseSeed'))} + i×{esc(config.get('seedStride'))}</dd></div>
      <div><dt>Created</dt><dd class="mono">{esc(config.get('createdAt'))}</dd></div>
      <div><dt>Engine</dt><dd>{esc(config.get('engine'))}</dd></div>
      <div><dt>Run folder</dt><dd class="mono">{esc(run_dir.name)}</dd></div>
    </dl>
    """

    kpi = f"""
    <div class="kpis">
      <div class="kpi"><div class="kpi-v">{mean_r:.1f}</div><div class="kpi-l">Mean rounds</div></div>
      <div class="kpi"><div class="kpi-v">{mean_t:.0f}</div><div class="kpi-l">Mean turns</div></div>
      <div class="kpi"><div class="kpi-v">{pct(float(summary.get('unfinishedRate') or 0))}</div><div class="kpi-l">Unfinished ({unfinished})</div></div>
      <div class="kpi"><div class="kpi-v">{wall_s:.2f}s</div><div class="kpi-l">{gps:.1f} games/s</div></div>
    </div>
    """

    seats = table_win_rate(
        "Win rate by seat",
        summary.get("winRateBySeat") or {},
        key_sort=lambda kv: int(kv[0]) if str(kv[0]).isdigit() else 0,
    )
    dirs = table_win_rate(
        "Win rate by travel direction",
        summary.get("winRateByDirection") or {},
    )
    props = table_win_rate(
        "Win rate by propellant",
        summary.get("winRateByPropellant") or {},
    )
    names = table_wins_by_name(summary.get("winsByName") or {}, games)
    sample = sample_games_html(run_dir / "games.ndjson")

    css = """
:root {
  color-scheme: dark;
  --bg: #0b1020;
  --panel: #141b2f;
  --border: #2a3555;
  --text: #e8eefc;
  --muted: #9aa8c7;
  --accent: #6ec8ff;
  --accent-2: #ffc857;
  --ok: #5ddea0;
  --bar: linear-gradient(90deg, #3a7bd5, #6ec8ff);
  font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: radial-gradient(ellipse at top, #152044 0%, var(--bg) 55%);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.45;
}
header {
  padding: 28px 24px 8px;
  max-width: 1100px;
  margin: 0 auto;
}
header h1 {
  margin: 0 0 6px;
  font-size: 1.55rem;
  letter-spacing: -0.02em;
}
header .sub { color: var(--muted); font-size: 0.92rem; }
main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 8px 24px 48px;
  display: grid;
  gap: 18px;
}
section {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px 18px 18px;
}
h2 {
  margin: 0 0 12px;
  font-size: 1.05rem;
  color: var(--accent);
}
.meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px 16px;
  margin: 0;
}
.meta dt {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  margin: 0 0 2px;
}
.meta dd { margin: 0; font-size: 0.95rem; }
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}
.kpi {
  background: rgba(0,0,0,0.22);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
}
.kpi-v { font-size: 1.45rem; font-weight: 700; color: var(--accent-2); }
.kpi-l { font-size: 0.78rem; color: var(--muted); margin-top: 2px; }
.pill {
  display: inline-block;
  background: rgba(110,200,255,0.15);
  border: 1px solid rgba(110,200,255,0.35);
  color: var(--accent);
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
th, td {
  text-align: left;
  padding: 7px 8px;
  border-bottom: 1px solid rgba(42,53,85,0.85);
}
th { color: var(--muted); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.03em; }
.num { text-align: right; font-variant-numeric: tabular-nums; }
.label { font-weight: 600; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.86em; }
.muted { color: var(--muted); }
.bar-cell { width: 40%; min-width: 100px; }
.bar {
  height: 10px;
  border-radius: 6px;
  background: var(--bar);
  min-width: 2px;
}
footer {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px 40px;
  color: var(--muted);
  font-size: 0.8rem;
}
@media print {
  body { background: #fff; color: #111; }
  section { break-inside: avoid; border-color: #ccc; background: #fff; }
  .bar { background: #336; }
}
"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Heliopoly sim · {esc(config.get('experiment'))} · {esc(summary.get('runId'))}</title>
  <style>{css}</style>
</head>
<body>
  <header>
    <h1>Heliopoly sim report</h1>
    <p class="sub">Batch balance / AI review · generated {esc(gen)} · schema v{esc(summary.get('schemaVersion', 1))}</p>
  </header>
  <main>
    <section>
      <h2>Run metadata</h2>
      {meta}
      {kpi}
    </section>
    {names}
    {dirs}
    {props}
    {seats}
    {sample}
  </main>
  <footer>
    Source: <span class="mono">{esc(run_dir)}</span><br/>
    Re-run: <span class="mono">python3 scripts/sim_html_report.py {esc(run_dir)}</span><br/>
    Terminal tables: <span class="mono">python3 scripts/sim_report.py …</span> · harness #89 · HTML report #90
  </footer>
</body>
</html>
"""


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Heliopoly sim → self-contained HTML report (#90)",
    )
    parser.add_argument(
        "run_dir",
        nargs="?",
        default=None,
        help="Run folder with summary.json (default: latest under sim-results/)",
    )
    parser.add_argument(
        "--out",
        "-o",
        default=None,
        help="Output HTML path (default: <run>/report.html)",
    )
    parser.add_argument(
        "--sim-root",
        default=None,
        help="Root to search for latest run (default: <repo>/sim-results)",
    )
    parser.add_argument(
        "--open",
        action="store_true",
        help="Print a macOS `open` hint (does not launch by default)",
    )
    args = parser.parse_args(argv)

    root = repo_root()
    sim_root = Path(args.sim_root) if args.sim_root else root / "sim-results"

    if args.run_dir:
        run_dir = Path(args.run_dir).expanduser().resolve()
    else:
        found = find_latest_run(sim_root)
        if not found:
            print(
                f"error: no runs with summary.json under {sim_root}",
                file=sys.stderr,
            )
            print(
                "hint: npm run sim -- --games 100   then re-run this script",
                file=sys.stderr,
            )
            return 1
        run_dir = found.resolve()

    summary_path = run_dir / "summary.json"
    if not summary_path.is_file():
        print(f"error: missing {summary_path}", file=sys.stderr)
        return 1

    summary = load_json(summary_path)
    config_path = run_dir / "config.json"
    config = load_json(config_path) if config_path.is_file() else summary.get("config") or {}

    out_path = (
        Path(args.out).expanduser().resolve()
        if args.out
        else (run_dir / "report.html")
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    html_doc = build_html(run_dir, summary, config)
    out_path.write_text(html_doc, encoding="utf-8")

    print(f"Wrote {out_path}")
    print(f"  run: {run_dir.name} · experiment={config.get('experiment')} · games={summary.get('games')}")
    print(f"  open: open {out_path}")
    if args.open:
        print(f"  (launch) open '{out_path}'")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
