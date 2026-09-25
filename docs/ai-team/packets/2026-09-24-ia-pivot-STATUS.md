# IA pivot STATUS — 2026-09-24

- SPEC: `docs/ai-team/packets/2026-09-24-ia-pivot-SPEC.md`
- Requirements ask: `docs/ai-team/packets/2026-09-24-ia-pivot-requirements.md`
- On `main`: merge `e4ce6a7` (pull request #282). Docs pull request #281 is the same packet and was not merged on its own.
- HITL: no App Store submit, no pricing, no App Store Connect edits.

## What shipped

Cold load is three doors. Arcade is the large default (Bot Evolution, Backup fuel, Hull panel). Journey is the charter. Lab is smaller and locked until `localStorage` `heliopoly.arcadeSessionsCompleted` is at least 1. Header Home returns to the doors. Deep links `?lab=` and `?arcade=` still work and do not write the unlock key.

| Gap found against the SPEC | Where it went |
| --- | --- |
| SPEC packet still said requirements-only | Folded into the SPEC on `b207b5f` |
| Glossary and README still described Launch-first play | `b207b5f` (#284) |
| Arcade sheets still said Lab | `9b80812` (#284) |
| No TestFlight draft | `docs/testflight/2026-09-24-what-to-test.md` (not submitted) |
| Resource-strike card could cover Roll | `73ad1a4` (#283) |
| WebDist snapshot was `334c7b0` | `12c1b33` |

## Issues

| # | Title | State |
| --- | --- | --- |
| 275 | Epic: Home IA — Journey / Arcade / Lab three doors | closed with the merge |
| 276 | Home screen three doors + copy hooks | closed |
| 277 | First-run default → Arcade; Lab gate | closed |
| 278 | Move list Arcade vs Lab vs Journey | closed |
| 279 | Demote path for non-fun Lab demos | closed |
| 280 | Docs PRODUCT-SURFACE / GAME / handbook | closed |
| 283 | Phone geometry: resource-strike card covers Roll | closed |
| 284 | Docs: glossary, README, and SPEC packet still describe the pre-door home | closed |

## URLs

- https://github.com/diagonalcounty/heliopoly/issues/275
- https://github.com/diagonalcounty/heliopoly/pull/282
