# Bot Evolution — inspiration pack (2026-08-29)

Working title. Not RoboSockets. Lab-only matching / falling-block drill inspired by *RoboSockets: Link Me Up* mechanics, Heliopoly chrome, and an Egg-Socket card comp.

**Do not treat any mockup as locked UI.** The session did not converge on chrome. These files and notes are inspiration only.

## Locked-enough rules (design, not build-complete)

- Grid: **5 wide × 8 tall**. Gravity down. No rising floor.
- Pieces: cream egg-bots. Face mark is a wiring diagram of live sockets.
- Grammar: start from a centered plus; **erase unused arms**. Connectors exist only on live sides.
  - `+` — N/E/S/W
  - `I` — N/S only (vertical bar)
  - `—` — E/W only (horizontal bar)
  - `L` — two adjacent arms (example locked in conversation: **up + right**)
  - `T` — three arms (one plus-arm erased)
- No duds, no bomb, no drill, no battery-extraction lore.
- Chain of **5** linked eggs morphs into a box that fills the **top horizontal level bar** (save / evolve, not explode).
- Level bar height is fixed. L1 = 5 segments. Next level adds 20% of the base 5 (6, then 7…).
- **Speed:** each level promotion multiplies drop/gravity speed by **1.10** (10% faster than the previous level). Compounding. No countdown timer / time-up fail in Lab v1.
- Next-piece preview required (queue of 3 preferred).
- Push is **parked** — not in v1 chrome. If revived: shove sideways; off-board recycles into the queue.
- Open-source Tetris / match / pipe engines are fair to borrow for the grid; art and rules are ours.

## Art direction (hybrid, not final)

- Palette: Heliopoly navy / cream / gold / cyan.
- Eggs: circuit-trace faces + gold glow on a live chain (Egg-Socket card comp).
- Mascot: raccoon clerk (Kostka-dog card energy, suit, not oil-paint realism).
- Playfield: simple 5×8 cell grid. Slot-table wells were too thick — connectors must meet through column gaps.
- UI chrome: vintage card frame is attractive but **not locked**. Do not block build on pixel-perfect HUD.

## Session artifacts (local / chat — commit binaries in a follow-up if needed)

| File / beat | What it was for |
|-------------|-----------------|
| Clerk card `public/handbook/cards/clerk-canonical.jpg` | Board-game illustration language |
| Kostka dog card | Face-style reference before raccoon |
| Oil raccoon portraits | Rejected — too painted |
| 8-bit egg + raccoon mask | Early tile; mask later dropped from basic unit |
| Egg + large gold plus + inner contrast plus + 4 pin connectors | Basic 4-way unit |
| Piece-family sheets | Grammar tests; many sheets still drew letter-L instead of erased-plus |
| Slot-table mockups | Rejected thick wells |
| 5×8 hairline grid | Closer playfield |
| Gemini *Egg-Socket Connections* card | Chrome + circuit-egg + glow reference |
| Hybrid *Bot Evolution* card mockup | Latest UI mashup — still not locked |

## Related issues

See GitHub issues opened 2026-08-29 under Lab shelf [#153](https://github.com/diagonalcounty/heliopoly/issues/153).
