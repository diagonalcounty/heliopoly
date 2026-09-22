# Product surface

Snapshot **2026-09-22** from `README.md`, `CHANGELOG.md`, and `gh issue view/list` on `diagonalcounty/heliopoly`. Issue open/closed is GitHub’s state that day, not a local queue note.

## Hosts

| Name | URL | What it is |
| --- | --- | --- |
| Live | https://heliopoly.live/ | Sunday **00:01 UTC** unlock (#98 / #231). CHANGELOG: live stayed **1.3.0** after the 2026-09-06 break-glass; beta tracks **1.4.0** on `main`. Confirm the droplet before telling a player which number they have. |
| Beta | https://beta.heliopoly.live/ | GitHub `main`. Next live number. Not Sunday’s freeze. |
| Preview | https://preview.heliopoly.live/ | **301 → beta** (since 1.4.0 ops note). |
| Simulation | https://simulation.heliopoly.live/ | Sim Lab (#91 / #134). |
| Local | `npm install && npm run dev` → http://localhost:5173/ | Dev. |
| Sim Lab local | `npm run sim-lab` → http://127.0.0.1:5174/ | Balance / AI. Not the live site. |

Version string in the V1 catalog: **1.4.0** (`gameplayMode.ts`, package, Ops Manual welcome).

## App Store vs web

- Browser play is free: heliopoly.live.
- [App Store](https://apps.apple.com/us/app/heliopoly/id6801637953) is the paid support build ($3.99, iPhone & iPad, offline). Same rules engine.
- Add to Home Screen on the web is a separate closed ticket (**#181**): installs as Heliopoly. That is not the App Store binary.
- Shipping iOS scheme is the iPad/web host story. Dedicated phone-in-the-shipping-scheme is **parked #184** (`do-not-build`). Isolated iPhone prototype target is still **#120** (open).

## Phone layout (epic #155)

**Epic #155 is CLOSED** on GitHub: “phone layout is responsive web, not PhoneOverlay.” Decision in the epic: CSS in the web app; skinny window = iPhone WKWebView; do not revive overlay inject; do not edit iPad `GameWebView.swift` for this work; kid path is Launch → board is the page → Roll, cash, fuel, Book, End.

Child snapshot (open unless noted):

| Ticket | State 2026-09-22 | Intent |
| --- | --- | --- |
| #158 A1 setup / Launch in first viewport | CLOSED | |
| #160 A3 Book and sheets full-bleed | CLOSED | |
| #183 A9 Auction Bid/Pass on screen | CLOSED | |
| #181 Web Add to Home Screen | CLOSED | |
| #157 A2 play thumbs | OPEN | Board is the page; thumbs for Roll, cash, fuel, Book, End. `main` has `9b66fe3` (cash/fuel are vitals, not a ledger tap). The issue was still open when this pack was written. |
| #166 A4 | OPEN | Three real thumbs; cash/fuel readable; no fake status button |
| #168 A5 | OPEN | Roster in leftover navy; Break/course when legal |
| #170 A6 | OPEN | Pick 2–6 rockets in the first viewport |
| #172 A7 | OPEN | Refuel / fuel depot above the three thumbs |
| #179 A8 | OPEN | Gravity Duel controls on screen at 390×844 |
| #182 | OPEN | iPad landscape ½ Split View still Launch + Roll |
| #156 B1 host | OPEN | Loopback HTTP only; delete overlay boot |
| #180 B2 | OPEN | Drop gold prototype bar; web fills the iPhone |
| #159 C1 art | OPEN | Phone-scale kit. Design, not a build order by itself |
| #176 | OPEN | First load ~35s ship-blocker |
| #100 | OPEN | Native-feel vision (`do-not-build` on some siblings; this one is the design note) |
| #165 | OPEN | Split `src/style.css` after phone layout |

A local sprint note (`docs/ai-team/sprint-reports/2026-09-22-grok-priority-queue.md`) ordered #176 → #180 → #157 → #160… That file is a queue, not a completion log. GitHub wins if they disagree.

## HITL expectations

From epic #155: a kid on a device **and** a ~390×844 browser. Launch in the first viewport and tappable. Board visible. Roll / cash / fuel / Book / End on thumbs and tappable. Overlay screenshots do not count. Gold bar on device follows the host ticket.

Cheap geometry gate in this repo: `npm run test:phone` (Playwright project `phone-chromium`, line reporter). Also `test:phone:webkit`, `test:phone:wide`, `test:phone:all`. Device notch and `100dvh` timing stay human. **UNKNOWN / NEEDS JACOB** which of the still-open A4–A8 rows already pass that command on `main`.
