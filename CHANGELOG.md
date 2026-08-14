# Changelog

## [1.0.0] — 2026-08-16

**First public 1.x** — App Store paperwork / TestFlight prep + weekly **https://heliopoly.live/** promote at **Sunday 00:01 UTC** (`2026-08-16T00:01:00.000Z`). Human QA passed on local + iPad.

iOS **MARKETING_VERSION** / web badge / package all **1.0.0** (build number `CURRENT_PROJECT_VERSION` = 1).

### Play / UX
- **Duration meter polish (#94):** title **(µ)** only; type slightly smaller than AI difficulty legend; bars hard-clipped so they never cover tick labels (grid columns + opaque tick lane)
- **Board map batch (on `main`, live with this promote):** curved Mainline lanes (#99), system ring bands + Rings slider (#101), polar remesh / Belt 1–6 / Homeward (#102)

### Lab
- Eastern Arabic + multi-script **Which is larger?** packs (#81 / #76)

### iPad / tablet
- Viewport zoom lock (#95); iPad mini layout polish (#96)
- Native shell WebDist + marketing version aligned for App Store listing prep (#66)

### Tooling / ops
- Board-previews design tools (#103)
- Droplet **Mode B** stage + Sunday 00:01 UTC promote (#98)

### Cleanup
- Dead code removal (#27)

### Meta
- Version **1.0.0** (package, badge, Ops Manual welcome, README, Xcode `MARKETING_VERSION`)
- **Live window:** Sunday **00:01 UTC** — staged as `heliopoly-releases/1.0.0` on the droplet

## [0.0.25] — 2026-08-14

### Play / UX
- **AI pack duration meter (#94):** New game setup — estimated charter rounds vs Expert pilot for selected AI pack (density bars; Easy short → Expert ~µ60). Polish: title shortened to **Est. rounds (µ)**, matches AI-difficulty legend type and fieldset height, meter bars kept clear of tick labels
- **Travel lane color (#99):** Mainline lanes locked to cool cyan with thickness at **45% of prior** (0.9px, `LANE_STROKE_WIDTH`) so the cyan `#6ec8ff` roll/path highlight stays primary

### Cleanup
- **Remove dead code (#27):** unused PRNG file `rng.ts` (`createRng` / `roll2d6` — duplicate of rules engine PRNG), unused `canAffordLeave` export in `fuel.ts`, `void isPurchasable` stub in `main.ts`, unused `name` param in `drawStation`

### Meta
- Version **0.0.25** (badge, package, Ops Manual welcome, README)

## [0.0.24] — 2026-08-14

### Play / UX
- **Curved Mainline lanes (#99):** polar alternate out/in (0.08 / 0.09); path preview follows curves
- **Travel lane color:** cyan Mainline at **45% prior thickness** (0.9px) so roll path highlight stays primary
- **System ring bands (#101):** Saturn→Mercury tinted dashes + radial falloff; Pilot Controls **Rings** slider (default 50%, modest max); thin-rail dual-triangle chrome
- **Board polar layout (#102):** mapper-driven geometry — Homeward on Saturn @57°, Belt **1–6** names, Earth cluster + `j_b4` retune

### Tooling
- **Board previews (#103):** `tools/board-previews/` — elliptical lanes, ring colors, interactive **board-mapper** (export / agent JSON)

### Lab (on main; ship with live deploy)
- Accordion Lab; multi-script Which is larger? packs (#76 / #81)

### Meta
- Version **0.0.24** (badge, package, Ops Manual welcome, README)

## [0.0.23] — 2026-08-13

### Play / UX
- **Travel lane color:** cool cyan `rgb(110,200,255)` so Mainline stays distinct from warm system-ring dashes
- **System ring bands (#101):** stylized Saturn→Mercury dashed tints + radial falloff bands (outer α 0.17 → inner α 0.02); legacy blue underlay α 0.29; travel lanes α 0.74
- **Rings slider:** Pilot Controls title row — retro range control; default **50%** (preferred look); peak (100%) brighter than old full lock; persists; default mid (50%); peak alphas raised so mid is brighter than old full lock

### Meta
- Version **0.0.23**

## [0.0.22] — 2026-08-13

### Play / UX
- **Curved travel lanes (#99):** Mainline edges draw as polar mid-span arcs (outward **0.08** / inward **0.09**, alternating) so the path—especially home to Earth—reads as orbital trajectories, not straight chords; roll path preview follows the same curves
- **Belt spacing (#99):** `t_mb` + early belt nodes pulled toward Deimos so the curved Earth-return arc does not overlap belt pips

### Lab / docs (carried from unreleased)
- **Lab menu (#76 structure):** accordion categories; **Which is larger?** packs (Eastern Arabic, Chinese, Korean, Hebrew, Binary); single Gravity Duel; Ops Manual **The Lab**
- **Multi-script compare (#76 / #81):** shared ladder + binary bit-strings

### iPad / tablet (carried from unreleased)
- **Viewport zoom lock (#95)** and **iPad mini layout (#96)**

### Meta
- Version **0.0.22**

## [0.0.21] — 2026-08-13

### Play
- **Feral park curve (#92):** half-gap asymptotic after park 5 (50% → 75% → 87.5% …) instead of double-to-100% at park 6; Ops Manual + startup log copy match

### Tooling
- **Sim Lab polish:** elimination density chart (round axis), seat curves in board rocket colors, max games to 1e6, launch-order win chances, human-vs-pack outcome summary, stale-server detection, win-rate share-of-finished fixes

### Meta
- Version **0.0.21** (badge, package, Ops Manual welcome, README)

## [0.0.20] — 2026-08-11

### Play
- **Remove legacy neglect / care stamps (#54):** feral is parking-only; dropped `neglectClock`, `claimCareRotations`, `touchClaim`, skipper neglect logs, and unused `FERAL_*` constants

### UX
- **Animation speed (#10):** Slow / Normal / Fast / Instant in the header; persists in localStorage; scales ship hops, dice rolls, and AI pacing
- **Path preview click-to-land (#15):** after roll, rocket-color range line on the board; click/tap a stop to set break and move; break fuel on path-segment hover (planetoid inspect unchanged); line ~¾ prior thickness after playtest
- **Buy before leave (#88):** claim unowned deed underfoot in `await_action` as well as post-land (rent income can fund a later buy)

### Tooling
- **Batch sim harness (#89):** `npm run sim` drives live TS core; writes `sim-results/<run>/{config,games.ndjson,summary}.json`; experiments (prograde/retrograde/choice/mixed); `python3 scripts/sim_report.py`; docs `scripts/README-sim.md`
- **Sim HTML report (#90):** `python3 scripts/sim_html_report.py` → self-contained `report.html` for latest (or chosen) run
- **Sim Lab (#91):** `npm run sim-lab` → local web UI (http://127.0.0.1:5174) to run batch scenarios and view results
- **Sim human vs pack skill:** seat 0 `humanDifficulty` vs other seats `packDifficulty`; Lab shows human win % + plain-language outcome summary; README notes even equal-skill AI tables

### Lab
- **Eastern Arabic compare drill (#81):** Lab literacy minigame (hint, reset, 12-try cap, win recap)

### UX
- **iPad / tablet layout:** smaller map in portrait so Pilot Controls stay on-screen; landscape side-by-side fit; safe-area padding; sticky controls

### iOS (#66 Phase A+)
- Xcode project hygiene: App icons, display name, iPhone+iPad, iOS 17+, shared scheme, PrivacyInfo stub
- Offline **WebDist** game via WKWebView; `npm run ios:sync` packages Vite build
- Vite `base: './'` for portable assets (web + file bundle)
- **Offline WebDist load:** WKWebView serves the game over `heliopoly://` (custom scheme) so ES modules run; `ios:sync` still strips Vite `crossorigin` for file:// fallback. Fixes empty board + dead buttons (JS never executed under `file://`)

### Meta
- Version **0.0.20**

## [0.0.19] — 2026-08-04

### Play
- **Fuel strike attribution (#17):** AI strikes use third-person titles and body (`Name's depot…`); never “You've / Your” for non-human seats

### Meta
- Version **0.0.19**

## [0.0.18] — 2026-08-04

### UX
- **Log fills sidebar:** height from bottom of Pilot Controls to bottom of board (pilot stays auto-height so controls don’t clip)

### Meta
- Version **0.0.18**

## [0.0.17] — 2026-08-04

### UX
- **Log panel / pilot layout:** pilot controls auto-height so Course + Break + actions fit

### Meta
- Version **0.0.17**

## [0.0.16] — 2026-08-04

### Play
- **Palindrome course (#47):** palindrome rocket names (e.g. Ada) unlock prograde/retrograde Mainline travel. Facing permanent after first Move; confirm on retrograde; AI can choose. Hidden (no handbook). Earth + gravity wells work both ways.

### Meta
- Version **0.0.16**

## [0.0.15] — 2026-08-04

### Play
- **Fuel depot cash (#45 Option C):** first depot per circuit free; additional planetoid depots cost **10%** of claim price. Hubs never get depots. Cost on button + inspect; free slot resets on Earth circuit complete.

### Meta
- Version **0.0.15**

## [0.0.14] — 2026-08-04

### UX
- **Gravity Duel → Ops Manual (#21):** Rules button (ops icon) on the duel panel opens Gameplay → Gravity Duel without dismissing the duel

### Meta
- Version **0.0.14**

## [0.0.13] — 2026-08-04

### Play
- **Gravity Duel knockback (#48):** loser is shoved **one space back** on the Mainline (plus skip turn + rent waiver). Light landing at new node; no second duel; cannot knock past Earth while already on Earth.

### Ops Manual
- Duel stakes updated for knockback

### Meta
- Version **0.0.13**

## [0.0.12] — 2026-08-04

### UX
- **Gravity Duel dice:** classic pip faces (1–6) instead of plain numbers

### Meta
- Version **0.0.12**

## [0.0.11] — 2026-08-04

### Play
- **King's Quest warp (#39):** timed charter event grants each rocket one warp charge
  - Click any board node (cyan rings) to teleport — no en-route stops/rent/duels
  - Landing effects still apply; AI uses charges when destinations score well
  - Added to once-per-charter event pool (with Monolith + M&Ms)

### Ops Manual
- **Gravity Duel (#67):** full human-friendly rules page — when it fires, Low/High/mixed resolution, stakes, ties, panel tips
- Charter alerts + warp noted in Glossary / turn flow; welcome version badge

### Meta
- Version **0.0.11**

## [0.0.10] — 2026-08-04

### Play
- **Timed charter events (#4):** real pool replaces GitHub teaser
  - **Monolith on Earth's Moon** — each active rocket: one-time **⍼300** on next Earth land or pass
  - **Blue & brown M&Ms** — each active rocket: one free brake (≥1 space) on next seat turn; unused expires end of that turn
  - Cadence unchanged (5 rounds → 50% → midpoint toward 100%)
  - **Each pool event fires at most once per charter** (no re-announce loops)

### Meta
- Version **0.0.10**

## [0.0.9] — 2026-07-29

### UX (locked)
- **Charter standings density (#64):** rocket name links no longer inherit global `button { min-height: 44px }`, so name + fuel/claims lines sit tight; **CH₄ / H₂** subscripts restored
- **Layout refinements (#63):** header / pilot controls / log for touch; standings remain dense
- **Favicon** + apple-touch-icon from Ops Manual art
- Default rocket name **Venture** (migrate stored “Captain”)

### Meta
- Version **0.0.9**

## [0.0.8] — 2026-07-29

### Play & economy
- **Earth pay:** land **⍼400** / pass **⍼200**, both **+⍼10** per completed rotation; **+1000** decade bonus at rotation 10/20/30…
- **Resource strikes:** headline copy reads as a win (no “breached”); short player-facing explanation
- **H₂ leak:** only on planet/moon landings; pending leak defers on transit/stations
- Strike headlines conjugate for AI vs human seats

### UX
- **Charter standings** absorbs Rockets list (single roster); New game shares the same sidebar slot
- Top bar: Lab · Ops Manual · **New game** · Quit
- Cleaner **game log** (no engine seed crumbs / AI meta); **Copy** log button
- End screen: eliminated pilots sorted by round then turn
- Tap rocket name → Rival rockets handbook entry

### Gravity Duel
- Result splash on **every** duel (fixed skipped ceremony after first)
- Mirrored UI: opponent left, human right; per-side **High / Low / Roll** with selection highlight

### Ops Manual & lore
- AIL / Angzarr (⍼), Mainline, hub-station lore, feral as software bitrot
- Planetoid civilopedia pages (discovery history / solar energy) (#60)
- Parking/feral docs match live parking model

### Ops & infra
- **Telemetry (#61):** completed games POST log + meta to droplet; HMAC `player_id` (no raw IPs); flat files under `/var/www/heliopoly/logs/`
- Genesis injection log line for Heliopolis callsign seed funding

### Meta
- Default rocket name **Venture**; version **0.0.8**
- Ops Manual **Project** section: live README + CHANGELOG from repo Markdown

## [0.0.7] — 2026-07-26

### Public release prep

- Repo public: [github.com/diagonalcounty/heliopoly](https://github.com/diagonalcounty/heliopoly)
- Live site messaging + contribute links; duel punchy placeholder invites GitHub suggestions
- Charter alerts: **round**-based cadence (5-round gap, 50% then midpoint toward 100%)
- Lunar range **daily table** for alert RNG seed (third letter × range cm)
- H₂ leaks on **landing** only; leak also **skips next turn** for repair
- Parking feral: cumulative no-move parks; 50% at 5, doubles after
- Station hub rent (railroad-style ×1/×2/×4)
- Rocket names (not pilot names); Rival rockets handbook + icons
- AI difficulty: normal / difficult break behavior
- Gravity Duel result as **in-panel footer** (names stay visible)
- Turn clock (`gameTurn`), end-screen exit turns, Lab scenarios
- Ops Manual sections (Lore / Gameplay / Rival rockets) + pixel icons
- Heliopolis callsign cheat: 4× starting cash

## [0.0.6] — 2026-07-21

### Notes

- Board path v0.0.6 systems; feral/depots; play until elimination

## [0.0.5] — 2026-07-21

### Added

- Orbital rings + bodies on ring layout
- Rankings (net worth ⍼) and end-of-turn deltas
- Quit + King’s Quest–inspired end screen
- Setup collapses in-game
- Gravity Duel (dice mini-game on transit)
- Per-roll ephemeris seed

## [0.0.4] — 2026-07-21

### Added

- Ship movement animation
- Shared `walkMovePath` for rules + UI

## [0.0.2] — 2026-07-21

### Added

- Currency display `⍼N`
- Gravity leave-burns; land free / leave costs fuel
- Propellant CH₄ / H₂
- Heliopoly branding + Helios Ops Manual

## [0.0.1] — 2026-07-21

### Added

- Initial POC: pure TS core, canvas UI, AI, self-play, handbook shell
