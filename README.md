# Heliopoly

**Free Enterprise In Space** · v0.0.7

Browser game: claim planets and moons, manage propellant, win as the last rocket flying.

| | |
|--|--|
| **Play** | [heliopoly.live](https://heliopoly.live/) |
| **Source** | [github.com/diagonalcounty/heliopoly](https://github.com/diagonalcounty/heliopoly) |
| **License** | MIT |

## Contribute

- **Issues** — bugs, balance, punchy Gravity Duel lines, feature ideas  
- **PRs** — welcome; `main` is protected (reviews preferred)  
- Fork → branch → PR into `main`

Please keep PRs focused. Game design locks live in discussion/issues when ambiguous.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173/
npm run typecheck
npm run build      # static dist/
npm run selfplay -- 10 4
```

## Layout

| Path | Role |
|------|------|
| `src/core/` | Rules engine (no DOM) |
| `src/handbook/` | Helios Ops Manual |
| `src/lab/` | Dev scenarios |
| `src/main.ts` | Browser shell |
| `public/` | Static icons / assets |

## Deploy

Production is static files only (nginx). Build + rsync to the droplet web root — no `vite dev` in production.

## Time vocabulary

- **Turn** — one rocket’s seat at the table  
- **Round** — full pass through all seats  
- **Rotation** — one full board circuit for a rocket  

See in-game Ops Manual → Gameplay → Glossary.
