# Heliopoly batch sim (terminal)

Local **headless** gameplay simulation for balance / AI / direction experiments ([#89](https://github.com/diagonalcounty/heliopoly/issues/89)).

This is a **terminal tool**, not the browser game. It drives the live **TypeScript rules engine** (`src/core/**`) — the same logic as `npm run selfplay` and production — and writes **JSON** you (or an AI) can review later.

**Not** a substitute for [heliopoly.live](https://heliopoly.live/).  
**Not** the optional Python rules port (`scripts/heliopoly_retrograde_sim.py`) — prefer this harness so results cannot drift from core.

---

## Requirements

| Tool | Why |
|------|-----|
| **Node.js 20+** | Run the sim via `tsx` |
| **npm** | Install deps (`tsx` is already a devDependency) |
| **Python 3** (optional) | Pretty tables from `summary.json` — stdlib only |

```bash
cd /path/to/heliopoly   # repo root
npm install             # once
```

---

## Quick start

```bash
# 100 AI games, default direction rules (palindrome #47 unlock as in live)
npm run sim -- --games 100

# All rockets forced retrograde — classic balance question
npm run sim -- --games 1000 --experiment retrograde

# All prograde (control arm)
npm run sim -- --games 1000 --experiment prograde --out sim-results/prograde-1k

# Hard AI, 4 seats
npm run sim -- --games 500 --difficulty hard --players 4

# Help
npm run sim -- --help
```

Equivalent without the npm script:

```bash
npx tsx src/sim/run.ts --games 100 --experiment choice
```

### Print a report

```bash
python3 scripts/sim_report.py sim-results/<run-folder>
# sample committed in-repo:
python3 scripts/sim_report.py sim-results/sample
```

---

## What gets written

Default output directory:

```text
sim-results/run-<UTC>-<experiment>/
  config.json      # run metadata, seeds, git sha, CLI args
  games.ndjson     # one JSON object per game (append-friendly)
  summary.json     # aggregates: win rates, means, unfinished %
```

| File | Use |
|------|-----|
| `config.json` | Reproduce the run (`baseSeed`, `seedStride`, experiment, difficulty) |
| `games.ndjson` | Per-game detail (seats, directions, cash/NW, counters) |
| `summary.json` | Fast AI / human overview |

Large dumps under `sim-results/` are **gitignored** except `sim-results/sample/` (tiny committed example of the schema).

---

## Experiments (`--experiment`)

| Mode | Meaning |
|------|---------|
| `default` | Live rules: palindrome rocket names may set direction; others prograde |
| `prograde` | Every seat **locked prograde** (forward) |
| `retrograde` | Every seat **locked retrograde** (backward) |
| `choice` | Every seat may choose direction once (AI heuristic) |
| `mixed` | First half of seats prograde-locked, second half retrograde-locked |

Example A/B for “does retrograde help?”:

```bash
npm run sim -- --games 2000 --experiment prograde --seed 1000 --out sim-results/ab-pro
npm run sim -- --games 2000 --experiment retrograde --seed 1000 --out sim-results/ab-retro
python3 scripts/sim_report.py sim-results/ab-pro
python3 scripts/sim_report.py sim-results/ab-retro
```

Same `--seed` + `--seed-stride` + game count → comparable seed streams.

### Seed formula

```text
seed_i = (baseSeed + i * seedStride)  mod 2^32
```

Defaults: `baseSeed=1000`, `seedStride=997`.

---

## CLI reference

```text
--games, -n N          Number of games (default 100)
--players, -p N        AI seats 2–6 (default 4)
--seed N               Base seed (default 1000)
--seed-stride N        Stride between game seeds (default 997)
--experiment, -e MODE  default | prograde | retrograde | choice | mixed
--difficulty, -d LVL   easy | normal | hard | expert (default normal)
--max-turns N          Cap per game (default 3000)
--out, -o DIR          Output directory
--quiet, -q            Less progress spam
--help, -h
```

**Wall time (ballpark on a modern Mac):** ~40–60 games/s → **10 000 games ≈ 3–4 minutes** single-threaded.

---

## Relationship to other tools

| Command / file | Role |
|----------------|------|
| `npm run sim` | **This harness** — JSON batch + experiments |
| `npm run selfplay -- N P` | Quick win counts to **stdout** only (legacy convenience) |
| `scripts/heliopoly_retrograde_sim.py` | Older pure-Python port — can **drift** from TS; not preferred |
| Browser / iOS / heliopoly.live | Human play; not batch balance |

After changing `src/core/agents.ts` or rules, re-run two sims (before/after commit) and compare `summary.json`.

---

## Asking an AI about a run

1. Point the model at `sim-results/<run>/summary.json` (and optionally `config.json`).
2. Example questions:
   - Is win rate higher for `backward` than `forward` under this experiment?
   - Seat-order bias?
   - CH₄ vs H₂ win rates?
   - Unfinished rate healthy?

Schema version is `1` (`schemaVersion` field). Prefer stable field names when extending.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `tsx: not found` | `npm install` at repo root |
| Slow first run | Cold `tsx` compile — subsequent runs are faster |
| Out of disk | NDJSON for 10k games is modest; delete old `sim-results/run-*` folders |
| Want only stdout wins | Use `npm run selfplay -- 50 4` |

---

## Develop / extend

- Runner: `src/sim/run.ts`
- One game: `src/sim/play.ts` (uses `heuristicAI` + `applyAction`)
- Types / schema: `src/sim/types.ts`
- Report: `scripts/sim_report.py`

Keep the engine in **TypeScript core**. Add counters in the game result object rather than forking rules into Python.
