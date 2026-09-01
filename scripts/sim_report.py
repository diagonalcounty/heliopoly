#!/usr/bin/env python3
"""Print tables from a Heliopoly sim run directory (#89).

Usage:
  python3 scripts/sim_report.py sim-results/<run_id>
  python3 scripts/sim_report.py sim-results/sample
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def pct(n: float) -> str:
    return f"{100.0 * n:.1f}%"


def main() -> int:
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print(__doc__.strip())
        return 0 if len(sys.argv) > 1 else 2

    run_dir = Path(sys.argv[1])
    summary_path = run_dir / "summary.json"
    config_path = run_dir / "config.json"
    if not summary_path.is_file():
        print(f"error: missing {summary_path}", file=sys.stderr)
        return 1

    summary = load_json(summary_path)
    config = load_json(config_path) if config_path.is_file() else summary.get("config", {})

    print("Heliopoly sim report")
    print("=" * 60)
    print(f"run_id:       {summary.get('runId', config.get('runId', '?'))}")
    print(f"git:          {config.get('gitCommit', '?')}")
    print(f"experiment:   {config.get('experiment', '?')}")
    print(f"human skill:  {config.get('humanDifficulty', config.get('aiDifficulty', '?'))}")
    print(f"pack skill:   {config.get('packDifficulty', config.get('aiDifficulty', '?'))}")
    print(f"games:        {summary.get('games')}")
    print(f"players:      {config.get('players')}")
    print(f"mean rounds:  {summary.get('meanRounds', 0):.2f}")
    print(f"mean turns:   {summary.get('meanTurns', 0):.1f}")
    print(
        f"unfinished:   {summary.get('unfinished')} "
        f"({pct(summary.get('unfinishedRate', 0))})"
    )
    print(f"wall:         {summary.get('wallMs', 0) / 1000:.2f}s "
          f"({summary.get('gamesPerSec', 0):.1f} g/s)")
    print()

    games = max(1, int(summary.get("games") or 1))
    finished = int(
        summary.get("finishedGames")
        if summary.get("finishedGames") is not None
        else games - int(summary.get("unfinished") or 0)
    )
    finished = max(1, finished)

    print("Share of finished games (winner’s attribute; rates sum ≈ 100%)")
    print(f"finished games n={finished}  (unfinished={summary.get('unfinished', 0)})")
    if summary.get("humanWinRate") is not None:
        print(
            f"HUMAN PROXY: {summary.get('humanWins', 0)}/{finished} = "
            f"{pct(summary.get('humanWinRate', 0))}  "
            f"(fair {pct(summary.get('fairShare', 0.25))})"
        )
    if summary.get("outcomeSummary"):
        print()
        print("OUTCOME SUMMARY")
        print("-" * 40)
        print(summary["outcomeSummary"])
    hlt = summary.get("humanLossTiming")
    if hlt and hlt.get("games"):
        print()
        print("WHEN HUMAN LOSES — dropout timing")
        print("-" * 40)
        print(hlt.get("caption", ""))
        he = hlt.get("humanElimRound") or {}
        pe = hlt.get("packElimRound") or {}
        ge = hlt.get("gameLengthRounds") or {}
        print(
            f"  human out:  n={he.get('n', 0)}  median R{he.get('p50', 0):.0f}  "
            f"IQR {he.get('p25', 0):.0f}–{he.get('p75', 0):.0f}"
        )
        print(
            f"  pack out:   n={pe.get('n', 0)}  median R{pe.get('p50', 0):.0f}"
        )
        print(
            f"  game ends:  n={ge.get('n', 0)}  median R{ge.get('p50', 0):.0f}"
        )
        print(
            f"  median rounds after human out: {hlt.get('medianRoundsAfterHumanOut', 0):.0f}"
        )
    print()

    print("Wins by rocket name")
    print("-" * 40)
    wins = summary.get("winsByName") or {}
    for name, n in sorted(wins.items(), key=lambda x: -x[1]):
        print(f"  {name:16} {n:5}  {pct(n / finished)}")
    print()

    print("By travel direction (winner)")
    print("-" * 40)
    for key, row in sorted((summary.get("winRateByDirection") or {}).items()):
        print(
            f"  {key:12} wins={row.get('wins', 0):5}  "
            f"n={row.get('n', finished):5}  rate={pct(row.get('rate', 0))}"
        )
    print()

    print("By propellant (winner)")
    print("-" * 40)
    for key, row in sorted((summary.get("winRateByPropellant") or {}).items()):
        print(
            f"  {key:12} wins={row.get('wins', 0):5}  "
            f"n={row.get('n', finished):5}  rate={pct(row.get('rate', 0))}"
        )
    print()

    print("By seat index (winner)")
    print("-" * 40)
    for key, row in sorted(
        (summary.get("winRateBySeat") or {}).items(),
        key=lambda x: int(x[0]) if str(x[0]).isdigit() else 0,
    ):
        print(
            f"  seat {key:4} wins={row.get('wins', 0):5}  "
            f"n={row.get('n', finished):5}  rate={pct(row.get('rate', 0))}"
        )
    print()
    print("Properties by bank-exit book (finished games; mark + income − invested)")
    print("-" * 40)
    roi_rows = summary.get("propertyRoi") or []
    if not roi_rows:
        print("  (no property books in this run — re-run with a current sim)")
    else:
        print(
            f"  {'property':16} {'sys':10} {'n':>5}  "
            f"{'mark':>8} {'income':>8} {'invest':>8} {'bk-exit':>8}  "
            f"{'land':>4}  {'yield':>7}"
        )
        for row in roi_rows:
            yield_v = row.get("roiCash")
            if yield_v is None:
                yield_v = row.get("roi")
            yield_s = "   n/a" if yield_v is None else f"{100.0 * float(yield_v):6.0f}%"
            grp = (row.get("group") or "—")[:10]
            income = row.get("meanIncome")
            if income is None:
                income = row.get("meanRentCollected") or 0
            mark = row.get("meanMark") or 0
            net = row.get("meanBankExitNet")
            if net is None:
                net = row.get("meanNet")
            if net is None:
                net = float(income) + float(mark) - float(row.get("meanInvested") or 0)
            print(
                f"  {str(row.get('name', '?'))[:16]:16} {grp:10} "
                f"{int(row.get('n') or 0):5}  "
                f"{float(mark):8.0f} "
                f"{float(income):8.0f} "
                f"{float(row.get('meanInvested') or 0):8.0f} "
                f"{float(net):8.0f}  "
                f"{float(row.get('meanLandings') or 0):4.1f}  "
                f"{yield_s}"
            )
    print()
    print("Tip: all-retro → backward ≈ 100%. Mixed → forward+backward ≈ 100%.")
    print("Ask an AI: point at summary.json + your question.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
