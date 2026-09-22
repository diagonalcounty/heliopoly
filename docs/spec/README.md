# Heliopoly spec pack

Compressed notes so a later human or agent can continue without re-reading the whole repo. Written **2026-09-22** on a token-conservation pass. Prefer the sources below when this pack and the code disagree. The code and the in-game Ops Manual win.

## Files

| Doc | What it is |
| --- | --- |
| [GAME.md](GAME.md) | Player-facing rules as shipped in the Ops Manual + rules engine |
| [ENGINE.md](ENGINE.md) | Where truth lives in code vs UI shell |
| [PRODUCT-SURFACE.md](PRODUCT-SURFACE.md) | Hosts, App Store vs web, phone-layout snapshot, HITL |
| [OPEN-DESIGN.md](OPEN-DESIGN.md) | Open design seeds (issue numbers, not full issue text) |
| [GLOSSARY.md](GLOSSARY.md) | Turn / round / rotation and nearby jargon |

## How this was derived

Read, not invented:

- `README.md` — pitch, hosts, stack
- `src/core/rules.ts` and nearby modules (`fuel.ts`, `propellant.ts`, `gameplayMode.ts`, `types.ts`, `goingUnder.ts`, `index.ts`)
- `src/handbook/content.ts` — Helios Ops Manual (authoritative player copy)
- `src/handbook/mdDocs.ts` — README / CHANGELOG / privacy folded into the manual
- `public/handbook/` — art assets only (not rules text)
- `CHANGELOG.md` — through **1.4.0** (2026-09-11) plus the Unreleased urinal-rule Parking note
- `docs/bot-evolution/README.md` — Lab Connect-N lock (not charter rules)
- `docs/ai-team/08-Grok-Build-Execution-Guidelines.md` — process only (one issue per chat, comment after a push). Not game rules.
- GitHub `diagonalcounty/heliopoly` issues labeled `design`, sampled 2026-09-22, plus phone tickets around epic #155

## Honesty

Lines marked **UNKNOWN / NEEDS JACOB** were not in those sources. Do not fill them from memory of a chat.

This pack does not replace the Ops Manual. The manual is what players read. This pack is the map for the next session.
