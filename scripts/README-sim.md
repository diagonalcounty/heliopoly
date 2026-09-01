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
| **Python 3** (optional) | Terminal tables + **HTML report** from `summary.json` — stdlib only |

```bash
cd /path/to/heliopoly   # repo root
npm install             # once
```

---

## Sim Lab (browser UI) — #91

Local web app: pick scenario → run live core → see charts in the page.

```bash
npm run sim-lab
# open http://127.0.0.1:5174/
```

- Form: games, players, experiment, **Human level** (seat 0), **AI pack level** (other seats), seed, optional **Save** to `sim-results/`
- Results: **human win %** vs fair share, plain-language outcome summary (no LLM), **when-human-loses dropout chart** (human out / pack out / game end by round), launch-order cards, **properties by bank-exit book** (mark + income vs claim+depot spend), direction/propellant/rocket tables
- Progress stream while running
- Local: `npm run sim-lab` → http://127.0.0.1:5174/
- Public: https://simulation.heliopoly.live/ (#134) — one batch at a time, capped games, nothing saved to disk. **Not** heliopoly.live (Sunday unlock #98).
- Stop with Ctrl+C in the terminal

Env overrides: `HELIOPOLY_SIM_LAB_HOST` (default `127.0.0.1`), `HELIOPOLY_SIM_LAB_PORT` (default `5174`).

### Human level vs AI pack

Both use the same difficulty scale as the live game (`easy` / `normal` / `hard` / `expert`) — break depth and travel scoring differ by level.

| Goal | Settings |
|------|----------|
| Even table (baseline) | Human = pack = same level |
| “Novice vs experts” | Human **easy**, pack **expert** |
| “Expert human vs soft pack” | Human **expert**, pack **easy** |

Seat 0 is the **human proxy** (first to launch). Pack seats use `heuristicAI` at pack difficulty.

When all skills match, seat win rates near **1/N** is a **healthy** signal: the AI pack doesn’t create a huge first-player crown; variance is mostly dice/landings.

---

## Quick start (CLI)

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

### Print a report (terminal)

```bash
python3 scripts/sim_report.py sim-results/<run-folder>
# sample committed in-repo:
python3 scripts/sim_report.py sim-results/sample
```

### HTML report (browser) — #90

Self-contained dark-theme page (inline CSS, no network). Defaults to the **latest** run under `sim-results/` (by `summary.json` mtime).

```bash
# After any sim:
python3 scripts/sim_html_report.py
open sim-results/<latest>/report.html          # macOS

# Explicit run:
python3 scripts/sim_html_report.py sim-results/sample
open sim-results/sample/report.html

# Custom output path:
python3 scripts/sim_html_report.py sim-results/sample --out /tmp/heliopoly-sim.html
```

Shows experiment metadata, KPIs (mean rounds/turns, unfinished), win bars by rocket / direction / propellant / seat, and a sample of games from `games.ndjson`.

**Rates** = share of **finished games** by the **winner’s** attribute (not seat-observations). All-retrograde → `backward` ≈ **100%**. Mixed → forward + backward ≈ **100%**.

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
| `report.html` | Optional browser view (`sim_html_report.py`) |

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
   - Which bodies have the best **bank-exit book** (`propertyRoi` in `summary.json`: mark + income − invested)?

Property rows use the same Ops Manual words as the live dossier (handbook topic **Dossier, ROI & selling** / `claims-ledger`):

| Word | Meaning |
|------|---------|
| **Deed price (MSRP)** | Board list price of the claim |
| **Mark** | Half the deed (`bankSellValue`); what the bank pays on a dump; guaranteed floor. Depot cash is **not** in the mark |
| **Income** | Rent collected, plus fuel strikes when the sim ledger tracks them |

`meanBankExitNet` = income + mark − invested. `roiCash` is the old rent/invested ratio, demoted. Earth-pass / investor cash stays out of `propertyRoi`.

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
- Terminal report: `scripts/sim_report.py`
- HTML report: `scripts/sim_html_report.py` (#90)

Keep the engine in **TypeScript core**. Add counters in the game result object rather than forking rules into Python.
