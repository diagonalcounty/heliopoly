# Engine

Static TypeScript + Vite. **No game server.** Rules do not touch the DOM.

## Authoritative

| Layer | Path | Role |
| --- | --- | --- |
| Rules | `src/core/rules.ts` | Turns, rent, parks/feral, duels, ledger events, auctions, log. Pure functions over `GameState`. |
| Types | `src/core/types.ts` | Domain types. Comment: no DOM / Node UI. |
| Board | `src/core/board.ts`, `path.ts`, `systems.ts` | Topology, walk, system groups, hub rent multipliers |
| Economy helpers | `claimLedger.ts`, `currency.ts`, `isru.ts`, `turnClock.ts`, `goingUnder.ts` | Books, Angzarr format, gushers, Earth/Olbers/steal clocks, elimination flags |
| Fuel | `fuel.ts`, `propellant.ts` | Leave burn, CH₄ / H₂ |
| AI | `src/core/agents.ts` | Rival policy. Same engine as the human. |
| Mode catalog | `gameplayMode.ts` | V1 shipped (`1.4.0` string). V2–V4 locked, `shipped: false`. |
| Barrel | `src/core/index.ts` | Re-exports the modules above |
| Player copy | `src/handbook/content.ts` | Ops Manual HTML. Must match the running build. |
| Manual chrome | `src/handbook/handbook.ts`, `mdToHtml.ts`, `mdDocs.ts`, `pilots.ts`, `planetoids.ts` | TOC, markdown import of README/CHANGELOG, rival and body articles |

`rules.ts` constants worth knowing without opening the file:

- `PARK_FERAL_THRESHOLD = 5`, `PARK_FERAL_BASE_CHANCE = 0.5` (half-gap after that)
- RNG is an in-state mulberry32; each roll reseeds per active pilot (`seed.ts`). Debug crumb is `console.debug` only.
- `LOG_RETAIN_MAX = 5000`
- `netWorth` = cash + deed list prices + 500 per placed station + 500 per station in hand

## UI shell (not truth)

| Path | Role |
| --- | --- |
| `src/main.ts` | Canvas / play shell. README: “canvas shell.” |
| `src/style.css`, `index.html` | Layout, including phone reflow. Must not invent economy. |
| `public/handbook/` | PNG/SVG for the manual. Not rules. |
| `tools/board-previews/` | Static HTML sandboxes. Not served by Vite, iOS WebDist, or heliopoly.live. |
| Sim Lab | `npm run sim-lab` → `127.0.0.1:5174`. Same rules engine. Not deployed to heliopoly.live. CLI: `npm run sim`, `npm run selfplay`. |

iOS hosts load a built web bundle (WebDist / WKWebView). They are not a second ruleset. README: App Store and browser share the rules engine.

## What to edit

- A rule change belongs in `src/core/` **and** the matching Ops Manual topic in `content.ts`. Shipping one without the other drifts the book from the table.
- Lab minigames (Bot Evolution and the rest) are **not** charter rules. Bot Evolution notes say no `src/core` edits.
- `docs/ai-team/` is process for agents. It does not define play.
