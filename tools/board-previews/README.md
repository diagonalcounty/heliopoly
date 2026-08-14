# Board preview tools (static HTML)

Self-contained UI sandboxes for tweaking **map look** without running the full game.
Open either file in a browser (double-click or `open path.html`).

| File | Purpose | Ship issues |
|------|---------|-------------|
| [elliptical-lanes.html](./elliptical-lanes.html) | Curved Mainline lanes: outward/inward strength, alternate, lane opacity | #99 |
| [ring-colors.html](./ring-colors.html) | System ring bands, dashed tints, legacy blue, lane opacity | #101 |

Defaults in the sliders match **production constants** in:

- `src/core/laneCurve.ts` — `LANE_CURVE_OUTWARD`, `LANE_CURVE_INWARD`, `LANE_STROKE_ALPHA`, `LANE_STROKE_RGB` (cool cyan)
- `src/core/ringBands.ts` — band/dash/legacy alphas + `SYSTEM_RING_STYLES`

## Regenerate after board geometry changes

Embedded node/edge JSON is a snapshot of `createV0Board()`. After moving belt angles or rings:

```bash
cd ~/code/heliopoly
node --import tsx tools/board-previews/generate.ts
```

That rewrites both HTML files from live `src/core/**` constants + board data.

## Not production

These pages are **design tools** only. They are not served by Vite, iOS WebDist, or heliopoly.live.
