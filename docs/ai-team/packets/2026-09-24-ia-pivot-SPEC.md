# Heliopoly IA pivot — Journey / Arcade / Lab

**Date:** 2026-09-24  
**Source:** Jacob product signal via Steve (ASC desk). Steve owns ASC only — **no App Store submit / pricing** from this work.  
**Status:** Requirements + GitHub issues only. Implementation tracks child tickets.

## Product signal

Players mostly like **egg-bot evolution** (Bot Evolution). **Fuel + sliders** are fun alone (treat as Arcade toys: Backup fuel pipes + Hull panel / any literal fun sliders). Other current Lab items and games are **nerdy and not fun as-is**.

## Target IA — three home doors

| Door | Role | Default weight |
| --- | --- | --- |
| **Arcade** | “On the rocket” — fun toys in ~1 minute | **Default / biggest first-tap** for new players |
| **Journey** | Game-journey / campaign (charter board game) | Second |
| **Lab** | Experiments / nerdy tools | Smaller, or unlock after **one Arcade session** |

Hard rule: **Do not stuff Arcade toys into Lab.** Lab ≠ play room.

## Copy hooks (draft — lock in UI ticket)

- **Arcade** — “On the rocket” / “Play for a minute”
- **Journey** — “Fly the charter” / “Full game”
- **Lab** — “Experiments” / “Nerdy tools” (not “more games”)

## Move list (from `src/lab/scenarios.ts` + Sim Lab)

### → Arcade (fun alone / ~1 min)

| Id / title | Notes |
| --- | --- |
| `egg-bot-evolution` / Bot Evolution | Primary fun signal |
| `backup-fuel-pipes` / Backup fuel | Fuel toy |
| `hull-panel` / Hull panel | Slider / slide-tile fun |

### → Journey (campaign / board)

| Surface | Notes |
| --- | --- |
| Main charter launch / mode select | Existing board game; home **Journey** door |
| Gravity Duel as in-charter event | Stays in Journey rules; Lab “Gravity Duel” scenario that **replaces the current game** is practice — see Lab demote |

### → Lab (experiments / demote or hide until fun alone)

| Id / title | Notes |
| --- | --- |
| Which-is-larger suite (Eastern Arabic, Chinese, Korean Sino, Hebrew, Binary) | Literacy drills — keep Lab |
| `deseret-match` / Deseret letters | Literacy — Lab |
| `urinal-rule-parking` / Urinal-rule Parking | Niche / nerdy — Lab or hide |
| End / economy practice scenarios (win/lose, going-under, remote sell, H₂ leak, parking/feral, hub ×4, stranded, resource strike) | Operator drills — Lab |
| `duel-you-challenger` / Gravity Duel (Lab scenario) | Practice that replaces charter — Lab, not Arcade |
| Sim Lab (`npm run sim-lab` / simulation host) | Balance / AI — stays Lab / ops, not home Arcade |

Placeholders (#252 Deseret board, #253 Which-is-larger board) stay Lab/design until fun alone.

## First-run default

1. New player lands on **home with three doors**.
2. **Arcade is visually primary** (largest / first focus) and is the **default first tap**.
3. Journey is clearly available but secondary.
4. Lab is **smaller** **or** locked until `arcadeSessionsCompleted >= 1` (local persistence; exact key in implement ticket).
5. After first Arcade session exits, Lab unlocks (if gated) without forcing a Lab visit.

## Demote path for non-fun Lab demos

For items classified Lab and “not fun as-is”:

1. **Hide from home Arcade** entirely.
2. Show under Lab as **Experiments** (secondary shelf), or behind “Show experiments”.
3. Optional: keep deep-link / Ops Manual entry for operators.
4. Do **not** move them into Arcade to “fill” the door.
5. Promotion to Arcade requires Jacob (or product) sign-off that the item is fun alone in ~1 minute.

## Out of scope (this pivot packet)

- App Store Connect / submit / pricing (Steve / Jacob HITL)
- Implementing UI (child Build tickets)
- Changing charter economy rules except as needed for Journey door wiring

## Acceptance for the pivot as a whole

- Home shows exactly three doors with the roles above.
- Cold install → Arcade is default/biggest.
- Bot Evolution + Backup fuel + Hull panel reachable from Arcade without opening Lab.
- Which-is-larger / Deseret / URP / end-economy drills are not Arcade primary.
- Lab is demoted or gated as specified.
- No ASC submit from implement work without Jacob.
