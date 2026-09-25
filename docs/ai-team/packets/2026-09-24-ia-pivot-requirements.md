# Heliopoly IA pivot — requirements + GitHub issues (Grok Build)

**Date:** 2026-09-24  
**Asked by:** Jacob via Steve (ASC desk). Steve owns ASC only — **no App Store submit / pricing** from this work.  
**Repo:** `diagonalcounty/heliopoly` on Olelo at `~/code/heliopoly`  
**Host:** Olelo Grok Build  
**HITL:** no App Store / pricing without Jacob. Filing tickets + writing requirements = Done for this session. Do **not** implement UI in this run.

## Product signal (Jacob)

Players mostly like **egg-bot evolution**. **Fuel + sliders** are fun alone. Other current lab items/games are nerdy and **not fun as-is**.

## Target IA — three home doors

1. **Journey** — game-journey / campaign (the core board expedition)
2. **Arcade** — "on the rocket"; fun toys: egg bot, fuel, sliders, anything fun in ~1 minute
3. **Lab** — keep for experiments / nerdy tools; demote or hide until fun alone

## UX prefs (Jacob + Steve aligned)

- **Arcade = default / biggest first-tap** for new players
- Journey second; Lab smaller or unlock after one Arcade session
- Do **not** stuff Arcade toys into Lab; Lab ≠ play room

## Your job (this session only)

1. Skim current surface: `docs/spec/PRODUCT-SURFACE.md`, `docs/spec/GAME.md`, Lab shelf / home entry in `src/` (Lab button, Bot Evolution #203/#204, fuel/sliders, placeholders #252/#253, shelf #153).
2. Write a short requirements note at:
   `docs/ai-team/packets/2026-09-24-ia-pivot-SPEC.md`
   covering: home three doors + copy hooks; move list Arcade vs Lab vs Journey; first-run default; demote path for non-fun lab demos.
3. File GitHub issues on `diagonalcounty/heliopoly` with **testable acceptance criteria**. Prefer a small epic + child tickets (or a numbered set) so each is Build-sized later. Labels: `enhancement`, `ux`, `design`, `lane:web` as fits. Add issues to user project #2 (Heliopoly board) in **Backlog** if Projects API works; otherwise comment the project link.
4. Leave a comment on each new issue pointing at the SPEC file path.
5. Write `docs/ai-team/packets/2026-09-24-ia-pivot-STATUS.md` with: issue numbers + titles, any blockers, Done when checklist.
6. Stop. Do not implement. Do not touch ASC / App Store Connect. Do not change pricing.

## Suggested ticket split (adjust if repo evidence says otherwise)

- Epic: Home IA — Journey / Arcade / Lab three doors
- Home screen: three doors + copy hooks (Arcade biggest / default)
- First-run default → Arcade; Lab unlock after one Arcade session (or smaller Lab chrome)
- Move list: classify existing Lab shelf items into Arcade vs Lab vs Journey (egg-bot + fuel/sliders → Arcade; nerdy drills → Lab demote/hide)
- Demote path for non-fun Lab demos (hide / "experiments" shelf / unlock gate)
- Update PRODUCT-SURFACE / GAME docs when IA lands (can be a follow-up ticket, not this session's implement)

## Done when

- SPEC.md exists with the four coverage areas above
- Issues filed with testable AC
- STATUS.md lists issue URLs/numbers
- No code UI changes required for this session; docs packet only is OK

## Out of scope

- ASC metadata, App Store submit, pricing
- Implementing the home redesign
- Stuffing Arcade toys into Lab
