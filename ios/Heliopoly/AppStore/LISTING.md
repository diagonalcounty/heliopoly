# Heliopoly — App Store Connect listing copy

Paste these fields into **App Store Connect → Heliopoly → App Information / Version**.  
Version aligned with Xcode: **1.5.0** (build **9**). iPhone and iPad.

---

## App Information

| Field | Value |
|--------|--------|
| **Name** | Heliopoly |
| **Subtitle** (30 chars max) | Orbital Economics |
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

## Version 1.5.0 — What’s New

```
Heliopoly 1.5.0

• The first screen is three doors: Arcade, Journey, and Lab
• Arcade is the big door: Bot Evolution, Backup fuel, and Hull panel
• Journey is the full charter
• Lab is experiments, and it unlocks after you finish one Arcade toy
• Home brings you back to the doors without quitting a flight
```

---

## Description (4000 chars max)

```
Heliopoly is orbital economics on the Mainline of our solar system (Helios): buy claims, burn propellant, duel rivals, and try not to go broke.

Currency is Angzarr (⍼). Every buy, rent, and duel hits the Automated Interplanetary Asset Ledger. Last rocket flying wins — no timer, no “enough Angzarr.”

THREE DOORS
The first screen is three doors:
• Arcade — the big door. One-minute play: Bot Evolution, Backup Fuel, and Hull Panel. Arcade never moves a charter you already started.
• Journey — the full charter. Name a rocket, pick methane or hydrogen, and Launch against AI pilots from Mercury to the Saturn moons.
• Lab — experiments. Gravity Duel practice, Deseret Letters, Urinal-rule Parking, and more. Lab unlocks after you finish one Arcade toy.
Home brings you back to the doors without quitting a flight.

In Journey, own systems, plant fuel depots, and stay solvent long enough for the ledger to write your name.

ONLY ON THE MAINLINE
• As of 2026, the only space game where a rogue Tesla can trash your fuel pods
• Trade in Angzarr (⍼) — the ledger remembers every bad decision
• Bring enough propellant, or become a very expensive monument
• The only space game where “feral” doesn’t just apply to cats
• Blank lane? Gravity Duel. Smile for the 2d6.
• Last rocket flying. No timer. The cosmos does not care about your schedule.

Got ideas? Contribute on GitHub: https://github.com/diagonalcounty/heliopoly — issues welcome, MIT, same engine as heliopoly.live.

HOW AN EXPEDITION FEELS
• Path — One circuit: Earth → Venus → Mercury → Mars → belt → Jupiter → Saturn → home
• Claims — Buy planets and moons; own a full system and rent doubles
• Stations — Trade hubs that get meaner as you collect more of them
• Fuel — Landing is free; leaving a gravity well costs propellant
• Parking — Sit still too often and claims can go feral back to the bank
• Gravity Duel — Meet another rocket on a blank lane: secret Low/High, 2d6

PLAY YOUR WAY
• 2–6 pilots (you plus AI, or full self-play)
• Easy through Expert AI packs
• Full Helios Ops Manual in-app: rules, glossary, rival-rocket civilopedia
• iPhone and iPad

NO WI‑FI NEEDED
Heliopoly ships the complete game in the app package. Open the app and play — no account, no network required.

Also free in the browser at heliopoly.live — same rules engine, open source (MIT).

Not affiliated with Solarquest or any commercial board game.
```

---

## Promotional Text (170 chars max)

```
Three doors on the first screen. Arcade for a minute, Journey for the full charter. No Wi-Fi needed.
```

---

## Keywords (100 chars max, comma-separated, no spaces after commas preferred)

```
space,strategy,board game,solar system,turn based,dice,fuel,rocket,ai,offline,claims,economy,iphone
```

(100 characters max total; no spaces after commas.)

---

## Review Notes (for App Review)

Paste **[`review_information/notes.txt`](review_information/notes.txt)** into **App Review Information → Notes** on every submission. That file answers Apple’s seven Guideline 2.1 “Information Needed” items for new apps.

Recording shot list and Resolution Center steps: **[`review_information/RECORDING.md`](review_information/RECORDING.md)**.

Do **not** mention internal packaging (`WebDist`, `npm run ios:sync`) in review notes — that invited a completeness / empty-board reading.

---

## App Privacy (App Store Connect labels)

Matches `PrivacyInfo.xcprivacy` for this native shell (no tracking domains; no declared collected types).

| Question | Answer |
|----------|--------|
| Do you or your third-party partners collect data? | **No** (for this 1.5.0 offline build) |
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
| Price | **$3.99** (paid, no IAP). Do not change without Jacob. |
| Availability | All territories you are cleared for |
| Pre-order | Optional |

---

## Screenshots (1.5.0 native Simulator captures)

Targeted devices: **iPhone and iPad** (`TARGETED_DEVICE_FAMILY = 1,2`).

Captured with `xcrun simctl io <udid> screenshot` (native pixels, no device frame, 9:41 status bar). Saved in [`screenshots/1.5.0/`](screenshots/1.5.0/):

| Slot | Simulator | Pixels |
|------|-----------|--------|
| iPhone 6.9" (`APP_IPHONE_67`) | iPhone 17 Pro Max | 1320 × 2868 portrait |
| iPad 13" (`APP_IPAD_PRO_3GEN_129`) | iPad Pro 13-inch (M5) | 2064 × 2752 portrait |

Order:

1. **Three doors** — Arcade largest; Lab locked with “Play one Arcade toy” on a fresh install (accurate, not hidden)
2. **Arcade** — Bot Evolution, Backup fuel, Hull panel
3. **Journey** — name your rocket, fuel, Launch
4. **Board in play**
5. **Ops Manual** — Gravity Duel topic

Do not reuse `screenshots/2752x2064/` (old ledger-card set) or the 402×874 marketing captures.

---

## App icon

| Slot | File in repo |
|------|----------------|
| App Store 1024×1024 | `AppStore/AppIcon-1024.png` |
| Xcode asset | `Heliopoly/Assets.xcassets/AppIcon.appiconset/` (any / dark / tinted) |
| Web favicon / apple-touch / icon-192 | `public/` (and `WebDist/`) — **same art**, resized from AppIcon |

Requirements: 1024×1024, PNG, **no alpha**, no rounded corners baked in.

Web tab icons and the iOS app icon are the same rocket-and-sun. The Ops Manual book (`public/ops-manual-icon.png`) is only the in-game handbook button.

### Install / refresh icons from design masters

New rocket-and-sun art was generated for App Store (any / dark / tinted). Convert and install:

```bash
python3 ios/Heliopoly/scripts/install_app_icons.py
```

(Run from monorepo root or any cwd — paths in the script are absolute.)  
This writes 1024×1024 RGB PNGs into the asset catalog and `AppStore/AppIcon-1024.png`, caches masters under `AppStore/sources/`, and derives `public/` favicons (`favicon.ico` / `.png` / `-16` / `-32`, `apple-touch-icon.png`, `icon-192.png`) plus copies into `WebDist/`.

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