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
    print(f"difficulty:   {config.get('aiDifficulty', '?')}")
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

    print("Wins by rocket name")
    print("-" * 40)
    wins = summary.get("winsByName") or {}
    games = max(1, int(summary.get("games") or 1))
    for name, n in sorted(wins.items(), key=lambda x: -x[1]):
        print(f"  {name:16} {n:5}  {pct(n / games)}")
    print()

    print("Win rate by travel direction (finished games, seat observations)")
    print("-" * 40)
    for key, row in sorted((summary.get("winRateByDirection") or {}).items()):
        print(
            f"  {key:12} n={row.get('n', 0):5}  wins={row.get('wins', 0):5}  "
            f"rate={pct(row.get('rate', 0))}"
        )
    print()

    print("Win rate by propellant")
    print("-" * 40)
    for key, row in sorted((summary.get("winRateByPropellant") or {}).items()):
        print(
            f"  {key:12} n={row.get('n', 0):5}  wins={row.get('wins', 0):5}  "
            f"rate={pct(row.get('rate', 0))}"
        )
    print()

    print("Win rate by seat index")
    print("-" * 40)
    for key, row in sorted(
        (summary.get("winRateBySeat") or {}).items(),
        key=lambda x: int(x[0]) if str(x[0]).isdigit() else 0,
    ):
        print(
            f"  seat {key:4} n={row.get('n', 0):5}  wins={row.get('wins', 0):5}  "
            f"rate={pct(row.get('rate', 0))}"
        )
    print()
    print("Tip: compare two runs (prograde vs retrograde) for direction EV.")
    print("Ask an AI: point at summary.json + your question.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
