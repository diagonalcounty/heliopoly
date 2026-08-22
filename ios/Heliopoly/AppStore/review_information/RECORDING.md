# App Review screen recording (Guideline 2.1)

Apple requires a **physical device** recording on the **latest public iPadOS**, starting at **app launch**, showing the typical flow.

Do **not** record the Simulator. Do **not** start mid-game.

## Before you hit record

1. Update the review iPad to the latest **public** iPadOS (Settings → General → Software Update).
2. Install the **same binary** that is on the rejected version (TestFlight or the App Store Connect build).
3. Force-quit Heliopoly so the recording starts from a cold launch.
4. Landscape, brightness up, Do Not Disturb on, no notification banners.
5. Optional: enable Airplane Mode after the app is installed — play is offline. Leave Wi‑Fi on if you prefer; it is not required.

Write the exact line from **Settings → General → About** into `notes.txt` item 2 before you send the reply:

```
iPad Air 11-inch (M4), iPadOS <version>
```

## How to record on iPad

Settings → Control Center → add **Screen Recording** if needed.

1. Open Control Center → tap Screen Recording (3-second countdown).
2. Immediately tap the **Heliopoly** Home Screen icon so the first frame is launch.
3. Follow the shot list. Speak nothing; the video is silent-capable.
4. Stop from Control Center or the red status pill.
5. Photos → trim if the start includes Control Center; the first gameplay frame must be the app launching.

Aim for **2–4 minutes**. Attach the `.mp4` in the **Resolution Center reply** (Notes cannot hold video).

## Shot list (do this in order)

| # | What to show | How |
|---|--------------|-----|
| 1 | Launch | Cold-start the app. Wait until New game + board are visible. |
| 2 | Setup | Total pilots **3**. Seat 1 is human **on**. Rocket name `Review`. Propellant **Methane**. AI **Easy**. |
| 3 | Launch expedition | Tap **Launch**. Charter standings appear; Pilot Controls enable. |
| 4 | Roll / move | Tap **Roll**. If Break is offered, tap **+** once then proceed so they see the control. Watch the ship move. |
| 5 | Claim | If Buy is enabled, tap **Buy**. If not, **End turn**, let one AI play, then Roll again until you can buy or clearly show “not for sale.” |
| 6 | End turn | Tap **End turn**. Let an AI seat take a visible action. |
| 7 | Ops Manual | Tap **Ops Manual**. Scroll a page of rules. Dismiss / close back to the board. |
| 8 | Still playing | One more Roll so they see the game continues after the manual. Stop. |

Skip Lab, Self-play burst, Quit, and selling claims. Do not need a Gravity Duel (nice if it happens; do not stall for one). Do not need to finish a full game.

## What the recording must prove

- The app launches to a **playable** game (not a splash, login wall, or empty web view).
- Core loop works: setup → launch → roll → move → (buy) → end turn.
- Rules are in-app (Ops Manual).
- There is **no** account, IAP, permission prompt, or web-browser chrome.

## After the take

1. Watch the clip once. If launch is missing or the board is blank, retake — do not send it.
2. Reply in App Store Connect Resolution Center with the text in `notes.txt` and **attach the video**.
3. Paste the same `notes.txt` into **App Review Information → Notes**.
4. Resubmit the **same** binary unless Apple asks for a new build. No code change is required for this rejection.
