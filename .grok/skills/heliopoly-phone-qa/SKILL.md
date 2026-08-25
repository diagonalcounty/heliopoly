---
name: heliopoly-phone-qa
description: >
  Run cheap Heliopoly phone-layout QA (390×844 geometry, elementFromPoint,
  Book/thumbs/Launch, WebKit/Chromium). Use when testing phone CSS, HITL,
  HeliopolyPhone, PR 164-class sheets, thumbs, Launch viewport, z-index,
  tap stealing, or when the user says test phone, playwright, or /phone-qa.
---

# Heliopoly phone QA

Repo: `~/code/heliopoly`. Geometry probes, not an LLM driving the browser.

## Default (do this)

```bash
cd ~/code/heliopoly
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
npm run test:phone
```

`test:phone` is Chromium 390×844, line reporter, no traces. **If it exits 0, stop.** Do not open HTML reports, traces, or MCP.

On failure: read the last `Error:` lines only. If a PNG is under `test-results/`, `read_file` that screenshot. Then fix CSS and re-run `npm run test:phone`.

## Other commands

| Command | When |
|---|---|
| `npm run test:phone` | Default. Phone Chromium. |
| `npm run test:phone:webkit` | Safari-ish. After Chromium is green, or WKWebView suspicion. |
| `npm run test:phone:wide` | 1200×800 framed Ops Manual. |
| `npm run test:phone:all` | All three projects. |
| `./scripts/ios-phone-build.sh` | Compile **HeliopolyPhone** (iPhone 17 sim). Not a tap test. |

`npm test` is still ledger/clock unit tests. Do not replace it.

## What these tests assert

Hit-testing and boxes, matching issue verify recipes:

- Launch in the first 390×844 viewport; `elementFromPoint` is `#btn-new`
- After Launch: `#btn-roll`, `#btn-handbook-header`, `#btn-end` on screen; `#telemetry` `display:none`
- Book open: `#handbook-root` ~390×844, z-index ≥2000, close ≥44px, `elementFromPoint` close is `.handbook-close`, Roll is **not** the top hit
- Book close: Roll is top hit again
- Hidden sheets: `pointer-events:none` or `display:none`
- Wide: handbook panel ≤880px wide (framed)

## Token rules

- Do not add Playwright MCP, Puppeteer, or screenshot-click loops.
- Do not `npx playwright show-report` or `trace`.
- Do not dump accessibility trees or `page.content()`.
- Do not `brew install playwright-mcp`.
- Do not play a full game to reach duel/auction; those sheets are not in the default probe.
- Device HITL (gold **HELIOPOLY PHONE · WEB**, notch, `100dvh`) stays human. Simulator build is the agent ceiling unless asked.

## iOS CLI

`xcode-select` may still point at Command Line Tools. Always prefix:

```bash
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
```

Then `./scripts/ios-phone-build.sh`. Gold bar is a human check after ⌘R.
