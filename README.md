# Heliopoly

**Free Enterprise In Space**

Local browser game: claim stations and moons, manage propellant, and don’t get stranded in a gravity well. Single human pilot plus AI (or full self-play). Not online multiplayer.

**Version:** 0.0.4 · private GitHub for now (public open source planned later)

## Play

```bash
npm install
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173/`). On an iPad, use the LAN network URL from the same Wi‑Fi.

| Command | What it does |
|---------|----------------|
| `npm run dev` | Browser UI + ship move animation |
| `npm run selfplay` | Headless AI-only games |
| `npm run build` | Static `dist/` |
| `npm run typecheck` | TypeScript check |

## What’s in 0.0.4

- **Ledger currency** displayed as `⍼150` (angzarr mark)
- **Leave burns** by gravity class × propellant; **landing is free**
- Propellant choice: **methane (CH₄)** vs **hydrogen (H₂)** (H₂ boil-off risk)
- **Ship hops** along the path when you roll (pause on each space)
- Helios **Ops Manual** in-app (Esc / ✕ / click outside)
- Heuristic AI + self-play harness

## Architecture

```
src/core/       Pure TypeScript engine (no DOM) — board, fuel, rules, agents
src/handbook/   In-game Ops Manual content + modal
src/main.ts     Browser shell (canvas + controls + animation)
src/selfplay.ts Headless balance runs
```

Core stays free of DOM so a future iPad shell (PWA / Capacitor) can reuse the same engine.

## Roadmap (short)

- Claim discovery waves (~12 → ~48)
- Solar weather events
- Infrastructure projects (comms, depots, …)
- Full modern map rewrite
- Public release (license + branding polish)

## License

MIT — see [LICENSE](./LICENSE).

## Provenance

Clean-room design inspired by the *space property / fuel management* board-game genre, not a port of any commercial title. Working fiction and systems are **Heliopoly**-original.
