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

- Edit the iPhone shell **in the workspace Xcode has open**. Confirm with `git branch --show-current` and `grep HELIOPOLY PHONE ios/Heliopoly/PhonePrototype/ContentView.swift`.
- iPhone scheme: **HeliopolyPhone**. iPad scheme: **Heliopoly**.
- Phone host: `ios/Heliopoly/PhonePrototype/` — loopback `http://127.0.0.1`, no overlay boot. Layout lives in `src/` (lane A), not PhoneOverlay.
- Isolation: do not change iPad `ios/Heliopoly/Heliopoly/GameWebView.swift`, `src/**`, or `index.html` unless the ticket says so.
- After Swift changes: device already deleted or **Product → Clean Build Folder**, then **⌘R**. Gold bar must match `ContentView.swift` (currently `HELIOPOLY PHONE · WEB`). If the bar does not match, Xcode did not build this tree.

## Do not

- Do not `git worktree add` or otherwise put iOS phone work in a second folder. That is how HITL tested stock WebDist while the agent edited a ghost checkout.
- Do not assume `~/code/heliopoly-phone-150` (or any extra worktree) is what Xcode builds.
- Do not inject PhoneOverlay (`phone.css` / `phone.js`) as layout. Copy PhoneOverlay may still run unused.

## Paths

| Piece | Path |
| --- | --- |
| Xcode project | `ios/Heliopoly/Heliopoly.xcodeproj` |
| iPhone @main | `ios/Heliopoly/PhonePrototype/` |
| Overlay CSS/JS | `ios/Heliopoly/PhoneOverlay/` (unused for layout) |
| iPad shell | `ios/Heliopoly/Heliopoly/` |
| Packaged web | `ios/Heliopoly/WebDist/` (`npm run ios:sync`) |
