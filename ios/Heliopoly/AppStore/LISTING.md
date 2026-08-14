# Heliopoly — App Store Connect listing copy

Paste these fields into **App Store Connect → Heliopoly → App Information / Version**.  
Version aligned with Xcode: **1.0.0** (build **1**).

---

## App Information

| Field | Value |
|--------|--------|
| **Name** | Heliopoly |
| **Subtitle** (30 chars max) | Free Enterprise In Space |
| **Bundle ID** | `heliopoly.live.Heliopoly` |
| **SKU** (your choice; unique) | `heliopoly-ios-1` |
| **Primary language** | English (U.S.) |
| **Primary category** | Games |
| **Secondary category** | Board · *or* Strategy |
| **Content rights** | Yes — you own / have rights to all art, code, and copy |
| **Age rating** | See questionnaire answers below (expect **9+** or **12+** depending on contest/competition answers) |

### Privacy Policy URL (required)

```
https://heliopoly.live/privacy.html
```

Deploy `public/privacy.html` from the monorepo to production before submit (see checklist).

### Support URL (required)

```
https://github.com/diagonalcounty/heliopoly/issues
```

Alternate support page (if you prefer a stable contact page):

```
https://heliopoly.live/
```

### Marketing URL (optional)

```
https://heliopoly.live/
```

### Copyright

```
© 2026 Diagonal County / Heliopoly contributors
```

Adjust legal entity name to match your Apple Developer account / DUNS if different.

---

## Version 1.0.0 — What’s New

```
First public release of Heliopoly on iPad.

• Full offline solar-system strategy game (no account, no online multiplayer)
• Name your rocket, choose methane or hydrogen, race AI rivals
• Claims, fuel depots, Gravity Duels, and charter alerts
• Built-in Helios Ops Manual
```

---

## Description (4000 chars max)

```
Heliopoly is free enterprise in space — a solar-system strategy game of claims, propellant, and rival rockets.

You name a rocket, pick methane or hydrogen fuel, and compete against AI pilots from Mercury to the Saturn moons. Buy deeds, plant fuel depots, manage cash on the Automated Interplanetary Asset Ledger, and stay solvent long enough to be the last rocket flying.

There is no round cap. You win by eliminating every other rocket — bankruptcy, stranding, or abandonment — not by racing a timer.

HOW AN EXPEDITION FEELS
• Path — One circuit: Earth → Venus → Mercury → Mars → belt → Jupiter → Saturn → home
• Claims — Buy planets and moons; own a full system and rent doubles
• Stations — Trade hubs that get meaner as you collect more of them
• Fuel — Landing is free; leaving a gravity well costs propellant. Break spaces off a roll to land short
• Propellant — CH₄ is stable. H₂ leaves cheaper but can leak on landing
• Parking — Sit still too often and claims can go feral back to the bank
• Gravity Duel — Meet another rocket on a blank lane: secret Low/High, 2d6, winner takes the edge

PLAY YOUR WAY
• 2–6 pilots (you plus AI, or full self-play)
• Easy through Expert AI packs
• Full Helios Ops Manual in-app: rules, glossary, rival-rocket civilopedia

OFFLINE ON IPAD
Heliopoly for iPad ships the complete game in the app package. It is not a thin wrapper around a website. Open the app and play without an account or network.

Also free in the browser at heliopoly.live — same rules engine, open source (MIT).

Not affiliated with Solarquest or any commercial board game.
```

---

## Promotional Text (170 chars max)

```
Solar-system strategy: buy claims, burn propellant, duel rivals. Offline on iPad — free enterprise in space.
```

---

## Keywords (100 chars max, comma-separated, no spaces after commas preferred)

```
space,strategy,board,solar,rocket,dice,offline,ipad,economy,sci-fi,orbit
```

(100 characters max total; no spaces after commas.)

---

## Review Notes (for App Review)

```
Heliopoly is a fully offline single-device game. The UI is a SwiftUI shell that loads a bundled HTML/JS game from the app package via a custom scheme (heliopoly://), not Safari and not a remote website.

No login, no IAP in this version, no ads, no tracking SDKs.

How to play a short review session:
1. Launch the app.
2. On New game: leave Seat 1 as human, name any rocket, pick Methane, AI difficulty Easy, 2–3 total pilots.
3. Tap Launch.
4. Use Pilot Controls: Roll → optional Break → Move. Buy claims when landed. End turn.
5. Open Helios Ops Manual (in-game) for full rules.

If the board appears empty, the WebDist bundle was not packaged — rebuild with the shared scheme after npm run ios:sync from the monorepo. Review builds should include WebDist inside the .app.

Demo account: none required.
```

---

## App Privacy (App Store Connect labels)

Matches `PrivacyInfo.xcprivacy` for this native shell (no tracking domains; no declared collected types).

| Question | Answer |
|----------|--------|
| Do you or your third-party partners collect data? | **No** (for this 1.0.0 offline build) |
| Tracking? | **No** |
| Privacy Nutrition Labels | None — “Data Not Collected” |

If you later enable optional game-end telemetry on native (web POSTs to heliopoly.live), update both `PrivacyInfo.xcprivacy` and App Store Connect before that build ships.

---

## Export compliance

| Question | Answer |
|----------|--------|
| Uses encryption? | Only standard HTTPS / OS crypto if any network call is added later |
| Exempt? | **Yes** — `ITSAppUsesNonExemptEncryption = NO` is set in the Xcode target |
| Upload answer | Select that the app only uses exempt / standard encryption |

---

## Age rating questionnaire (recommended answers)

Answer honestly in Connect; suggested for this game:

| Topic | Suggested |
|-------|-----------|
| Cartoon or fantasy violence | None / Infrequent |
| Realistic violence | None |
| Sexual content / nudity | None |
| Profanity | None / mild if any charter jokes |
| Horror / fear | None |
| Mature / suggestive themes | None |
| Alcohol / tobacco / drugs | None |
| Simulated gambling | **None** (strategy economy is not gambling) |
| Contests | Yes if you consider competitive AI play a “contest” — usually **No** for local AI |
| Unrestricted web access | **No** (shell blocks leaving the bundled game) |
| User-generated content | **No** |
| Gambling / loot boxes | **No** |

---

## Pricing & availability

| Field | Suggested |
|--------|-----------|
| Price | Free (matches web MIT product) **or** Paid if you prefer; no IAP required for 1.0 |
| Availability | All territories you are cleared for |
| Pre-order | Optional |

---

## Screenshots (you still need device captures)

App Store Connect requires screenshots **per device size** you support.

This target is currently **iPad only** (`TARGETED_DEVICE_FAMILY = 2`).

Minimum typical set for iPad:

| Slot | Size (pts → capture) | Notes |
|------|----------------------|--------|
| iPad Pro 12.9" (6th gen) | 2048 × 2732 portrait | Required if you list 12.9" |
| iPad Pro 11" / 13" | Follow Connect prompts | Use Simulator → File → Save Screen |

Suggested shot list (3–5 images):

1. **New game** setup (rocket name, propellant, AI difficulty)
2. **Board in play** with Pilot Controls visible
3. **Gravity Duel** or charter alert moment
4. **Ops Manual** open
5. **End standings** / sealed charter (optional)

Do **not** use marketing frames that violate Apple’s screenshot guidelines (misleading device chrome is OK only within rules; avoid fake UI).

---

## App icon

| Slot | File in repo |
|------|----------------|
| App Store 1024×1024 | `AppStore/AppIcon-1024.png` |
| Xcode asset | `Heliopoly/Assets.xcassets/AppIcon.appiconset/` (any / dark / tinted) |

Requirements: 1024×1024, PNG, **no alpha**, no rounded corners baked in.

### Install / refresh icons from design masters

New rocket-and-sun art was generated for App Store (any / dark / tinted). Convert and install:

```bash
python3 ios/Heliopoly/scripts/install_app_icons.py
```

(Run from monorepo root or any cwd — paths in the script are absolute.)  
This writes 1024×1024 RGB PNGs into the asset catalog and `AppStore/AppIcon-1024.png`, and caches masters under `AppStore/sources/`.

---

## Build / upload checklist

- [ ] Paid Apple Developer Program active; Team `3RNW8JKN4S` matches account
- [ ] `https://heliopoly.live/privacy.html` live
- [ ] `npm run ios:sync` then Archive Release in Xcode
- [ ] Validate App → Upload to App Store Connect
- [ ] Fill listing fields from this file
- [ ] Upload screenshots
- [ ] Export compliance: exempt encryption
- [ ] Privacy: Data Not Collected
- [ ] Submit for Review with notes above
```