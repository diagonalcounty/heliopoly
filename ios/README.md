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

## Refresh the game after web changes

```bash
npm run ios:sync
```

Then rebuild in Xcode. Commit `WebDist/` when you want a clone-and-run snapshot; always re-sync before TestFlight.

## Project settings (Phase A)

| Setting | Value |
|--------|--------|
| Display name | Heliopoly |
| Bundle ID | `heliopoly.live.Heliopoly` |
| Devices | iPhone + iPad (`TARGETED_DEVICE_FAMILY` 1,2) |
| Min iOS | 17.0 |
| Category | Games |
| Platforms | iphoneos / iphonesimulator only (no Mac/visionOS in this target) |

## App Store (later)

Paid Apple Developer Program, icons already 1024, privacy labels when telemetry ships on native, review notes: full offline game package — not a website browser. See issue **#66**.

## Web PRD

https://heliopoly.live/ remains the free browser product.
