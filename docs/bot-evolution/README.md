# Bot Evolution — inspiration pack (2026-08-29)

Working title. Not RoboSockets. Lab-only matching / falling-block drill inspired by *RoboSockets: Link Me Up* mechanics, Heliopoly chrome, and an Egg-Socket card comp.

**Do not treat any mockup as locked UI.** The session did not converge on chrome. These files and notes are inspiration only.

## Locked rules (Connect-N — #240 HITL 2026-09-10 / engine #241)

Fixed 5×8 / connect-5 is **retired**. Progressive Connect-N:

- Stages **N ∈ {3,4,5,6}**. Lab starts at **Connect 3**. No Connect 2 / 7+.
- Grid **N × 8**. Gravity down. No rising floor. Width equals the connections required.
- Morph when a connected orthogonal socket group is **≥ N**. Morph → box / evolve into the top bar — **not** explode.
- Fill the save bar **twice** at current N, then **rebuild empty** at N+1. After Connect 6, stay **6×8** until top-out.
- Bar length starts at **N**. Each completed bar is **+20% of that stage’s base N**: `N + round(0.2×N) × barsCompletedThisStage`. Stage change **resets** the bar to the new N.
  - Connect 3: 3 then 4 → rebuild 4×8
  - Connect 4: 4 then 5 → rebuild 5×8
  - Connect 5: 5 then 6 → rebuild 6×8
  - Connect 6: 6, 7, 8, 9… until lose
- Career morphs to first reach Connect 6: **3+4 + 4+5 + 5+6 = 27** boxes.
- **Speed:** Connect 3–5 stay at baseline drop (700 ms). Gravity ×1.10 starts on **Connect 6**, counting bars completed at 6×8 (first Connect 6 bar is still baseline). Floor 80 ms. No countdown timer / time-up fail in Lab v1.
- Recycle the bottom row on a bar that **does not** widen. **Skip recycle** on the bar that rebuilds.
- Next-piece preview: shipped **queue of 6** with SVG mosaic on slots 4/5/6 (#230). Must work at every width.
- Pieces: cream egg-bots. Face mark is a wiring diagram of live sockets.
- Grammar: start from a centered plus; **erase unused arms**. Connectors exist only on live sides.
  - `+` — N/E/S/W
  - `I` — N/S only (vertical bar)
  - `—` — E/W only (horizontal bar)
  - `L` — two adjacent arms (example locked in conversation: **up + right**)
  - `T` — three arms (one plus-arm erased)
- No duds, no bomb, no drill, no battery-extraction lore.
- Push is **parked** — not in v1 chrome. If revived: shove sideways; off-board recycles into the queue.
- Open-source Tetris / match / pipe engines are fair to borrow for the grid; art and rules are ours.
- Lab-only. No `src/core`. Do not name RoboSockets in UI.

## Art direction (hybrid, not final)

- Palette: Heliopoly navy / cream / gold / cyan.
- Eggs: family shells (cream plus / cyan straight / apricot corner / mint tee). **Connectors are pistons** on live sides only; dead sides are smooth shell — no bumpers, no wall-plates, no extra hug-arms.
- Gold glow on a live chain (Egg-Socket card comp).
- Mascot: raccoon clerk (Kostka-dog card energy, suit, not oil-paint realism).
- Playfield: simple N×8 cell grid (starts 3×8). Slot-table wells were too thick — connectors must meet through column gaps.
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

## Implementation

Lab standalone: `src/lab/botEvolution.ts` (engine + erased-plus grammar). Overlay `#botevo-root`. Tests: `npx tsx src/lab/botEvolution.test.ts`. Chrome is readable, not pixel-locked.

## Related issues

Design lock: [#240](https://github.com/diagonalcounty/heliopoly/issues/240). Engine: [#241](https://github.com/diagonalcounty/heliopoly/issues/241) (retargets [#204](https://github.com/diagonalcounty/heliopoly/issues/204)). Parent Lab seed: [#203](https://github.com/diagonalcounty/heliopoly/issues/203). Queue mosaic: [#230](https://github.com/diagonalcounty/heliopoly/issues/230). Lab shelf: [#153](https://github.com/diagonalcounty/heliopoly/issues/153). Grammar / UI: [#205](https://github.com/diagonalcounty/heliopoly/issues/205), [#206](https://github.com/diagonalcounty/heliopoly/issues/206).
