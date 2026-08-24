---
name: heliopoly-ios
description: >
  How to edit and ship the Heliopoly iPhone prototype (HeliopolyPhone) and
  iPad app without missing Xcode's checkout. Use when changing PhoneOverlay,
  PhonePrototype, GameWebView, WebDist, HeliopolyPhone, iOS HITL, or when
  the user says Clean Build, ⌘R, device test, or overlay.
---

# Heliopoly iOS (Xcode checkout)

Jacob's Xcode window opens **this clone**: `ios/Heliopoly/Heliopoly.xcodeproj` under the workspace root (`~/code/heliopoly` when that is the workspace). Edits that are not in **that** working tree are never on the phone.

## Do

- Edit overlay and iPhone shell **in the workspace Xcode has open**. Confirm with `git branch --show-current` and `grep HELIOPOLY PHONE ios/Heliopoly/PhonePrototype/ContentView.swift`.
- iPhone scheme: **HeliopolyPhone**. iPad scheme: **Heliopoly**.
- Overlay: `ios/Heliopoly/PhoneOverlay/` (`phone.css`, `phone.js`) plus `ios/Heliopoly/PhonePrototype/` (phone `GameWebView.swift`, `ContentView.swift`).
- Isolation: do not change iPad `ios/Heliopoly/Heliopoly/GameWebView.swift`, `src/**`, or `index.html` for overlay prototypes unless the ticket says so.
- After overlay/Swift changes: device already deleted or **Product → Clean Build Folder**, then **⌘R**. Gold bar must match `ContentView.swift` (currently `HELIOPOLY PHONE · THUMBS · 4`). If the bar does not match, Xcode did not build this tree.

## Do not

- Do not `git worktree add` or otherwise put iOS overlay work in a second folder. That is how HITL tested stock WebDist while the agent edited a ghost checkout.
- Do not assume `~/code/heliopoly-phone-150` (or any extra worktree) is what Xcode builds.

## Paths

| Piece | Path |
| --- | --- |
| Xcode project | `ios/Heliopoly/Heliopoly.xcodeproj` |
| iPhone @main | `ios/Heliopoly/PhonePrototype/` |
| Overlay CSS/JS | `ios/Heliopoly/PhoneOverlay/` |
| iPad shell | `ios/Heliopoly/Heliopoly/` |
| Packaged web | `ios/Heliopoly/WebDist/` (`npm run ios:sync`) |
