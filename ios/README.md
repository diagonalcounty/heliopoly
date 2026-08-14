# Heliopoly iOS (iPad / iPhone)

SwiftUI shell + **offline** packaged web build (`WebDist/`). Product direction: GitHub **#66**.

This is **not** a remote wrapper of heliopoly.live — the game loads from the app bundle.

## Requirements

- **Xcode 16+** (this tree was last built with Xcode 27 beta tools on macOS 27)
- Node 20+ (to refresh the web bundle)
- Apple ID in Xcode for device runs (Simulator needs no paid account)

## Open & run

```bash
# From monorepo root — rebuild web and copy into the Xcode target
npm run ios:sync

# Then open the project
open ios/Heliopoly/Heliopoly.xcodeproj
```

In Xcode:

1. Select the **Heliopoly** scheme (shared).
2. Pick an **iPad** simulator (or iPhone).
3. Set your **Team** under Signing & Capabilities if needed (empty `DEVELOPMENT_TEAM` in project until you pick one).
4. **Run** (⌘R).

## Layout

```text
ios/Heliopoly/
  Heliopoly.xcodeproj/     # project + shared scheme
  WebDist/                 # Vite production build (npm run ios:sync)
  Heliopoly/
    HeliopolyApp.swift     # @main
    ContentView.swift      # root shell / error UI
    GameWebView.swift      # WKWebView → bundled WebDist/
    PrivacyInfo.xcprivacy  # privacy nutrition stub (no tracking)
    Assets.xcassets/       # AppIcon + AccentColor
```

`WebDist/` lives **next to** the `.xcodeproj` (not inside the synced Swift sources). Xcode’s “Copy WebDist” Run Script phase packs it into the `.app` **with folder structure** so `./assets/` and `./handbook/` paths work.

### Offline load path (important)

The shell loads the game at **`heliopoly://game/index.html`** via a custom `WKURLSchemeHandler` that serves `WebDist/` from the app bundle. Plain **`file://` breaks ES modules** (`type="module"` always uses CORS; local files send no CORS headers) — symptoms: empty board, buttons that press but do nothing.

`npm run ios:sync` still **strips Vite’s `crossorigin`** from `WebDist/index.html` (helps styles if anything falls back to file). Do not hand-copy `dist/` into `WebDist/` without re-running sync. Production deploy of `dist/` is unchanged.

## Refresh the game after web changes

```bash
npm run ios:sync
```

Then in Xcode: **Product → Clean Build Folder**, then **Run** (⌘R). Commit `WebDist/` when you want a clone-and-run snapshot; always re-sync before TestFlight.

## Project settings (Phase A)

| Setting | Value |
|--------|--------|
| Display name | Heliopoly |
| Bundle ID | `heliopoly.live.Heliopoly` |
| Devices | iPhone + iPad (`TARGETED_DEVICE_FAMILY` 1,2) |
| Min iOS | 17.0 |
| Category | Games |
| Platforms | iphoneos / iphonesimulator only (no Mac/visionOS in this target) |

## Viewport / zoom (#95)

| Knob | Value |
|------|--------|
| HTML viewport meta | `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no` |
| `WKWebView.scrollView` | `minimumZoomScale = maximumZoomScale = 1`, pinch disabled, `bouncesZoom = false`, page bounces off |
| CSS | `touch-action: manipulation`; `html.native-shell` fills `100dvh` (class injected on load) |

After load, the shell re-asserts scale 1 and rewrites the viewport meta if a stale WebDist is bundled.

**Fit definition:** fullscreen portrait + landscape show playable Pilot Controls without pinch-zoom. Page-level pan of the whole game is discouraged; log/modals may scroll internally.

## Device matrix (fullscreen CSS points) — #95 / #96

| Device | Portrait (W×H pt) | Landscape | Notes |
|--------|-------------------|-----------|--------|
| **iPad mini 5** | **768 × 1024** | 1024 × 768 | 7.9″, 3:4 — target mini 5+ only |
| **iPad mini 6 / 7** | **744 × 1133** | 1133 × 744 | 8.3″, ~2:3 |
| iPad Air 11″ (M2/M3) | 820 × 1180 | 1180 × 820 | Zoom-lock QA |
| iPad Pro 11″ (M1–M2) | 834 × 1194 | 1194 × 834 | Zoom-lock QA |
| iPad Pro 11″ (M4) | 834 × 1210 | 1210 × 834 | Zoom-lock QA |

Mini layout CSS: portrait `max-width: 780px`; landscape mini height band `max-height: 800px` + width 1000–1200. Windowed Split View / Stage Manager is **#97** (not this shell doc).

**Simulators to run after `npm run ios:sync`:** iPad mini (6th gen), iPad Air 11-inch, iPad Pro 11-inch.

## App Store (later)

Paid Apple Developer Program, icons already 1024, privacy labels when telemetry ships on native, review notes: full offline game package — not a website browser. See issue **#66**.

## Web PRD

https://heliopoly.live/ remains the free browser product.
