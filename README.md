# Heliopoly

**Free Enterprise In Space**

Local browser game: claim stations and moons, manage propellant, duel on transit lanes, and don’t get stranded. Single human pilot plus AI (or full self-play).

**Version:** 0.0.5 · private GitHub (public planned later)

## Play

```bash
npm install
npm run dev
```

| Command | What it does |
|---------|----------------|
| `npm run dev` | Browser UI |
| `npm run selfplay` | Headless AI games |
| `npm run build` | Static `dist/` |
| `npm run typecheck` | TypeScript check |

## What’s in 0.0.5

- **Orbital ring** board layout (solar-system look)
- **Charter standings** with live net worth (`⍼`) + turn +/- deltas
- Collapsed **New game** after launch; **Quit** + King’s Quest–inspired **end screen**
- **Gravity Duel** (dice): secret Low/High, then 2d6; transit only; skip turn + rent waiver; ties share the lane
- **Per-roll seed** from active pilot fuel (nearest prime), first-claim ephemeris body (N/F/Avg table), time
- Leave burns, CH₄/H₂, ship hop animation, Helios Ops Manual

## Architecture

```
src/core/       Pure TS engine (no DOM)
src/handbook/   Ops Manual
src/main.ts     Shell + animation + modals
src/selfplay.ts Headless runs
```

## License

MIT — see [LICENSE](./LICENSE).
