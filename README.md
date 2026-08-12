# Heliopoly

**Free Enterprise In Space**

A browser game of solar-system property, propellant, and rival rockets. Launch a ship, buy claims from Mercury to the Saturn moons, and stay solvent long enough to be the **last rocket flying**.

**[Play on heliopoly.live](https://heliopoly.live/)** · [Source](https://github.com/diagonalcounty/heliopoly) · MIT · v0.0.9

---

## The pitch

The solar system is open for enterprise. You name a **rocket**, pick **methane or hydrogen**, and compete against AI-flown ships for deeds, depots, and cash on the **AIL (Automated Interplanetary Asset Ledger)**, settled in **Angzarr** (**⍼**).

There is **no turn limit**. You win by eliminating every other rocket — bankruptcy, stranding, or abandonment — not by hitting a round cap.

## How an expedition feels

- **Path** — One circuit: Earth → Venus → Mercury → Mars system → belt → Jupiter → Saturn → home to Earth  
- **Claims** — Buy planets and moons; own a full system and **rent doubles**  
- **Stations** — Elon, Holst, and Daktulios work as major trade hubs and tollbooths: more hubs you own, higher hub rent  
- **Fuel** — Landing is free; **leaving** a gravity well costs propellant. Break spaces off a roll to land short (costs fuel too)  
- **Propellant** — CH₄ is stable. H₂ leaves cheaper but can **leak on landing** (half tanks + a turn to repair). Strike rich ice or methane seas with a fuel depot for a one-time cash windfall  
- **Parking** — Sit still too often and unpatched software causes claims to go **feral** (returning to the bank)  
- **Gravity Duel** — Meet another rocket on a blank lane: secret Low/High, 2d6, winner takes the edge  

In-game **Helios Ops Manual** (top right) has the full rules, glossary (turn / round / rotation), and rival-rocket civilopedia.

## Play

| | |
|--|--|
| **Live** | https://heliopoly.live/ |
| **Local** | `npm install && npm run dev` → http://localhost:5173/ |

Name your rocket, choose propellant and AI difficulty, **Launch**.

## Screenshots / vibe

Pixel Ops Manual art, orbital board, dice duels, Oregon Trail–style ledger alerts. Built for desktop and LAN iPad play (same Vite dev server).

## Stack (brief)

TypeScript + Vite. Pure rules engine in `src/core/` (no DOM); canvas shell in `src/main.ts`. Static deploy only — no game server.

```bash
npm run typecheck
npm run build      # → dist/
npm run selfplay -- 10 4          # quick win counts to stdout
npm run sim -- --games 100        # batch JSON sim (balance / AI / direction)
```

### Terminal batch sim (balance / AI)

Headless multi-game runs that write JSON under `sim-results/` (live TypeScript core — not a second rules engine):

```bash
npm run sim -- --help
npm run sim -- --games 1000 --experiment retrograde
python3 scripts/sim_report.py sim-results/<run-folder>

# Browser UI (local only) — form → run → results
npm run sim-lab
# → http://127.0.0.1:5174/
```

Full guide: **[scripts/README-sim.md](scripts/README-sim.md)** · issues [#89](https://github.com/diagonalcounty/heliopoly/issues/89) · [#91](https://github.com/diagonalcounty/heliopoly/issues/91).
