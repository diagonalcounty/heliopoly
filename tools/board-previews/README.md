# Board preview tools (static HTML)

Self-contained UI sandboxes for tweaking **map / setup look** without shipping to heliopoly.live.
Open any file in a browser (double-click or `open path.html`). Each page has a **top nav** to the others.

| File | Purpose | Ship issues |
|------|---------|-------------|
| [difficulty-duration.html](./difficulty-duration.html) | **AI difficulty duration meter** — panel size, bars, glow, µ, export | #94 |
| [elliptical-lanes.html](./elliptical-lanes.html) | Curved Mainline lanes: outward/inward strength, alternate, lane opacity | #99 |
| [ring-colors.html](./ring-colors.html) | System ring bands, dashed tints, legacy blue, lane opacity | #101 |
| [board-mapper.html](./board-mapper.html) | **Drag nodes**, tune curves, copy `onRing` export for board.ts | #102 |
| [ledger-cards.html](./ledger-cards.html) | **Ledger event cards** + **Welcome on board** (`#welcome`) — pin/width/art crop against a New game screenshot | #113 #118 |
| [botevo-face-review.html](./botevo-face-review.html) | **Egg face review** — pupil X/Y/scale glue, blink/look, export offsets JSON (Faces v1; Mosaic/Timing stubs) | #218 |

Production constants (lanes / rings) live in:

- `src/core/laneCurve.ts` — `LANE_CURVE_OUTWARD`, `LANE_CURVE_INWARD`, `LANE_STROKE_ALPHA`, `LANE_STROKE_RGB`, `LANE_STROKE_WIDTH`
- `src/core/ringBands.ts` — band/dash/legacy alphas + `SYSTEM_RING_STYLES`

## Regenerate after board geometry changes

Embedded node/edge JSON on map tools is a snapshot of `createV0Board()`. After moving belt angles or rings:

```bash
cd ~/code/heliopoly
node --import tsx tools/board-previews/generate.ts
```

That rewrites lane/ring HTML snapshots from live `src/core/**` (not the duration meter).

## Export / agent

Most pages: **Copy export** or **Download JSON**. For layout, prefer  
`last-mapper-export.json` under this folder. Duration meter: `difficulty-duration-export.json`.

## Future (not built yet)

Shared hub shell (`index.html` + `preview-shell.css`) — see GitHub issue for board-previews index.

## Not production

These pages are **design tools** only. They are not served by Vite, iOS WebDist, or heliopoly.live.
