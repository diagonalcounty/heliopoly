# Game (player rules)

Voice of the shipped **Helios Ops Manual** (`src/handbook/content.ts`). Numbers below are from that manual or `src/core` constants. V1 only. V2–V4 are named and locked, not playable (`gameplayMode.ts`).

## Win

**Last rocket flying.** Others go bankrupt, get stranded, or quit. No round cap and no “enough money.” The ledger writes the survivor as one of the **greatest of all kind**.

When a rocket leaves, its deeds return to the **bank**. Fuel depots on those deeds are destroyed.

There is no fixed cash or fuel number that eliminates a rocket. `goingUnder.ts` is a display-only risk flag. Elimination is in `rules.ts`:

- **Bankrupt** when rent is due (landing, failed leave, or knockback) and cash is less than that rent. The creditor receives whatever cash remains; deeds return to the bank.
- **Stranded** on a planet or moon when fuel is 1 or less and `canRefuelAtAll` is false (no free refuel, not Earth, not a paid pad, and not a hub that has a station).

## Path (the Mainline)

One circuit. No shortcuts.

Earth → Venus → Mercury → **Mars system** (Elon → Mars → Phobos → Deimos) → **asteroid belt** (blank lanes) → **Jupiter** (Holst + Io, Europa, Ganymede, Callisto + blanks) → **Saturn** (Daktulios + Titan, Enceladus, Iapetus, Mimas, Rhea, Dione, Tethys + blanks) → homeward → Earth.

One full loop home is a **rotation** (personal to that rocket). See [GLOSSARY.md](GLOSSARY.md).

Travel facing can be **forward or backward** (palindrome / prograde–retrograde). Blank lanes cost no leave fuel.

## Money

Currency is **Angzarr** (displayed as ⍼ before the amount). It is the post-quantum cash of the Mainline. The book is the **AIL** (Automated Interplanetary Asset Ledger): contracts (who owns what, who is owed rent, who paid for fuel) and history.

Starting cash is a funded launch, not a glitch. `DEFAULT_CONFIG.startingCash` in `state.ts` is **1500** Angzarr (starting fuel **20**). The same bank line is given to every seat. Callsign `Heliopolis` is a playtest cheat: the human seat gets 4× that cash.

Earth pay (manual): **⍼400** when you land on Earth, **⍼200** when you pass Earth. That cash is investor capital, not property income.

## Claims

Buy planets and moons. **Earth is never a deed.**

Own every deed in a system and **rent doubles** on landings there:

- Mercury, Venus — one planet each
- Mars — Elon + Mars + Phobos + Deimos
- Jupiter — Holst + four moons
- Saturn — Daktulios + seven moons

**Mark** is half the sticker (bank dump; depot scrapped). **MSRP** is the sticker for an unowned body. **Income** is rent plus fuel strikes while you held the book. End screen: Claim / Mark / Income / Book (mark + income). ROI% is not the end-screen story (changelog #138).

Buy window: claim an unowned deed when you land, or later while you are still on it.

Remote sell and auction live on the dossier, not as a one-click dump on the pilot column. You do not have to stand on the claim. Reserve defaults to the mark; you may raise it up to the deed price. One auction listing per claim per turn. If nobody meets the reserve, the listing is withdrawn.

## Stations

**Elon** (Mars), **Holst** (Jupiter), and **Daktulios** (Saturn) are hubs, not worlds. They are trade hubs and tollbooths.

- Own **2** hubs → hub rent **×2**
- Own **all 3** → hub rent **×4**

That multiplier stacks with a system monopoly (Elon can take both). Stations can move, so a rogue Tesla does not hit them. A fuel pod on a moon cannot dodge.

## Fuel and propellant

**Landing is free. Leaving a gravity well costs propellant.**

Leave burn (`fuel.ts`): `ceil(steps × gravityMult × propellantMult)`, minimum 1 when the well is real. Gravity multipliers: class 0 = 0 (free), 1 = 0.75, 2 = 1.0, 3 = 1.4, 4 = 1.85.

Break spaces off a roll to land short. Manual: −1 space = 0.5 fuel, −2 = 1 fuel, and so on. Failed leave on an enemy claim charges rent again.

| Propellant | Leave | Risk | Strike (needs claim + depot) |
| --- | --- | --- | --- |
| Methane CH₄ | ×1.0 | No leak | Titan or Enceladus. Manual: one-time strike of ½ starting cash. |
| Hydrogen H₂ | ×0.85 | 10% on **landing** (`leaveRisk`): half tanks and lose a turn to repair | Ice on Enceladus, Mars, Europa, Ganymede |

The strike pays `floor(startingCash / 2)`. With the default bank that is **750**. `GUSHER_BONUS` in `isru.ts` is that same 750, used only when `startingCash` is 0. The manual states the strike as ½ starting cash and does not print 750.

## Depots

Start with **3** in hand. Place on planets or moons you own, not on hubs. A depot boosts rent and lets **you** refuel free on that body.

First depot after game start, or after you finish a rotation, is **free**. Each further depot that circuit costs **10%** of that body’s purchase price. A full circuit home grants **+3** depots in hand. Placed depots stay until feral or elimination, then they are destroyed.

## Parking and feral

Sit still and unpatched software rots the claim. A non-move seat turn is a **park** (camp, full break, failed leave, duel skip). The count never resets.

- Parks 1–4: no check
- Park 5: each of your claims rolls **50%** to return to the bank
- Each later park closes half the remaining gap (75%, 87.5%, …) and never forces 100% on the next park

## Gravity Duel

Only on a **blank** lane (not a planet, moon, hub, or Earth) when another living rocket is there, or the lane remembers a defender.

Both pick secret **Low** or **High**, then both roll **2d6**.

- Both Low → lower total wins
- Both High → higher total wins
- Mixed → total closer to the running mean of all 2d6 this game wins (default mean **7** if no history)
- Equal totals or equal distance → **tie**

Stakes: loser skips their next full seat turn (that skip is also a park) and is knocked back one space. Winner gets a one-time rent waiver against that pilot. Tie: both hold the lane. Knockback does not start a second duel. A loser already on Earth is not shoved further back.

Realtime animated duels are **not** in this build.

## Expedition feel

Chosen at New game, locked at Launch. Sets how kind the ledger is and how sharp the rivals are. Header **Speed** is animation only.

| Expedition | Ledger | Rivals |
| --- | --- | --- |
| 1 Insight | Minus events never hit the human (Tesla, Karen, hot mic, Error 47). Rivals cannot steal your deeds. | Soft. They land where the dice put them. |
| 2 Curiosity (default) | Full pool. Prize cards go to one random living rocket that round. | Default table. |
| 3 Voyager | Full pool. | Sharper — deeds, hubs, Earth. |
| 4 Opportunity | Full pool. | Hunts monopolies and Earth landings. |

There is no turn limit. The feel is a solvent rocket on a long circuit: claims, tolls, propellant leaks, and the occasional ledger card (Monolith, warp, dividend, rogue Tesla, and the rest — full table is the **Ledger events** topic in the manual). Easy/Insight shielding is the short session. Opportunity is the long one.

Seat order is shuffled at Launch so the human is not always first (changelog, #16).

## Not in this build

Purchasable ring-transfer nodes, player trading, a fuel price matrix, realtime duels, named transit lanes. V2–V4 gameplay modes are listed and locked.