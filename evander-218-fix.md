# Evander #218 face fix — one pair of pupils, not two faces

**Branch:** `feat/botevo-faces-218` · **PR:** #221 · **Issue:** #218  
**Lock:** Jacob HITL — erase baked pupils (keep glasses/visor frames), animate one small pupil pair + mouth in those sockets; no thick second face.

## Fail

Thick CSS eye overlays (face-plate + white glass rings + pupils) sat on top of printed pupils/glasses → **two faces** visible.

## Art (`src/lab/botevo-art/*.png`)

Pillow edit on all **11** piece PNGs (256×256 RGBA):

1. **Pupils / eye interiors** — for each hand-tuned socket center, fill dark pupil pixels (and mid-dark iris / hot white sclera that fight animation) with nearby **lens cream** or **visor band** color sampled from the same socket. Soft falloff toward the rim.
2. **Frames kept** — glass rings (round-glasses pieces) and cyan/teal visor frames (`i`, `dash`) are outside the clear radius and left intact.
3. **Mouths softened** — dark baked smile strokes blended toward cheek/shell color so the animated smile/hope is the single clean mouth.

Notable results:

| Family | What cleared | What kept |
| --- | --- | --- |
| `dash`, `i` | Dark oval pupils in visor | Visor frame / band |
| `plus`, `t-*`, `l-*` | Interior pupil/dark fill in lenses | Round glass frames + cream sockets |

Backups from before the wipe live only in the local scratch dir (not committed).

## Overlay code

### `src/lab/botevoFaces.ts` — `appendBotFace`

- **Removed** `.botevo-face-plate` (shell-colored disc that covered the PNG face).
- **Removed** `.botevo-glass` (second pair of white rings).
- Overlay DOM is now: **pupil + lid** per eye, plus **mouth** only.

Director rules unchanged: exclusive one playfield expression; milder queue excitement; Pause freezes drill clock; no morph/recycle idle.

### `src/style.css`

- Face overlay **always** shows rest pupils in the cleared sockets (`opacity: 1`).
- Mouth **hidden at rest** (`opacity: 0`); visible on `is-look` / `is-excite`.
- Blink = lids only (no plate cover).
- Tuned box toward PNG sockets (~42%/58% x, ~42% y on the 256px art).
- Smaller pupils; no fake glass border/fill.

### `src/main.ts`

No logic change beyond existing `appendBotFace` hook in `appendBotSprite`.

## Kept (product locks)

- Exclusive one playfield expression
- Queue milder/shorter excitement
- Pause freeze (`is-face-paused` + drill clock)
- No morph / recycle idle starts
- No #219 pixelation work

## Risks / HITL watch

- Socket alignment may need a one-pixel nudge per family after Jacob watches 390×844.
- Visor pieces (`i`/`dash`) vs round-glasses share one overlay geometry — if pupils look off on one family, prefer a tiny CSS tweak over regenerating art.
- Rest pose now shows static pupils (empty sockets would look wrong after the PNG wipe).

## Verify

```bash
npm run typecheck
npm test
```

HITL: Lab → egg-bot-evolution, 20–30s play — one face per bot, blink/look/hope, Pause freeze, morph chain clean.
