# Glossary

From the Ops Manual glossary and nearby topics (`src/handbook/content.ts`). Use these words the same way in issues and specs.

| Term | Meaning |
| --- | --- |
| **Turn** | One rocket’s seat: from becoming current through end turn (roll + move, or skip, or park). A skipped seat still counts as a turn for the seat clock. Log: “Turn N”. |
| **Round** | Everyone has had a seat turn — one pass of player order, including skips and parks. Ledger events fire on **round** boundaries. Log: “Round N”. |
| **Rotation** | One rocket completes a full Mainline circuit (leaves Earth and returns). Personal. Log: circuit-complete line. Resets the free-first-depot placement and grants **+3 depots** in hand. |
| **Park** | A seat turn with **no move**: camp, full break, failed leave, or a duel skip. Parks accumulate for the whole expedition and never reset. Parks 1–4: no feral check. Park 5: 50% per claim. Each later park closes half the gap toward 100% (`PARK_FERAL_THRESHOLD`, `parkFeralChance` in `rules.ts`). |
| **Feral** | Unpatched software. The ledger drops the deed back to the bank. Depot on it is destroyed. Other pilots may buy it again. |
| **Ledger** | Contract book and history book. Nothing on the board counts until the ledger says so. |
| **AIL** | Automated Interplanetary Asset Ledger. The book. |
| **Angzarr (⍼)** | Post-quantum money on the Mainline. Shown as ⍼ before the number. |
| **Ledger event** | Timed popup on a round boundary. Each type at most once per expedition. Standard cadence: wait 5 rounds, then 50% and half-gap on real misses. |
| **Warp** | Charge: click any beacon instead of rolling. No en-route stops, rent, or duels. Landing rules still apply. King’s Quest and Strong Bad Email each grant one. |
| **Mainline** | The only flight path. See [GAME.md](GAME.md). |
| **Claim / deed** | Purchasable planet, moon, or hub. Earth is never a deed. |
| **Mark** | What the bank pays on a dump: half the sticker. Depot scrapped. |
| **MSRP** | Bank sticker to claim an unowned body. Not the resale value of a deed you hold. |
| **Income** | Rent + fuel strikes while this rocket held the book. Earth land/pass cash is investor capital, not property income. |
| **Book** | Mark + income on the end-screen held-books table. |
| **Hub / station** | Elon, Holst, Daktulios. Not worlds. Own 2 → hub rent ×2. Own 3 → ×4. Stacks with a system monopoly. |
| **System monopoly** | Every deed in Mercury, Venus, Mars, Jupiter, or Saturn. Rent doubles on landings there. |
| **Depot** | Placed on an owned planet or moon (not a hub). Boosts rent and lets you refuel free there. Start with 3 in hand. |
| **Propellant** | Methane (CH₄) or hydrogen (H₂), chosen at Launch. |
| **Gravity Duel** | Secret Low/High plus 2d6 on a shared blank lane. Not realtime. |
| **Expedition** | Launch setting: Insight, Curiosity, Voyager, Opportunity. Sets ledger kindness and rival skill. Player-facing name replaced “AI difficulty.” |
| **Insight** | Shortest expedition. Minus events (Tesla, Karen, hot mic, Error 47) never hit the human. Rivals cannot steal the human’s deeds. |
| **Arcade** | The large home door. About a minute: Bot Evolution, Backup fuel, Hull panel. Does not move a charter rocket. Default first tap. |
| **Journey** | The charter. Full game. Name a rocket and Launch. Gravity Duel inside a flight stays here. |
| **Lab** | The small home door. Experiments, not more games. Locked until one Arcade toy is left (`heliopoly.arcadeSessionsCompleted` reaches 1). Literacy, Deseret, Urinal-rule Parking, and Gravity Duel practice live here. End and economy setups sit behind Show experiments. See [OPEN-DESIGN.md](OPEN-DESIGN.md). |
| **Charter** | The expedition / table session. Older copy said “charter alerts”; player-facing name is **ledger event**. |
| **Break** | Spend fuel to travel fewer spaces than the roll. −1 space = 0.5 fuel, −2 = 1 fuel, and so on. |
| **Seat** | One rocket at the table (human or AI), 2–6. |

## Clock (do not collapse these)

- **Turn** = one seat.
- **Round** = every living order slot has taken a turn.
- **Rotation** = one rocket’s lap of the board.

Ledger events, Kostka’s Earth-transit count, and park/feral do not share a clock. Kostka uses Earth land-or-pass counts (off the round pool). Feral uses park count. Ledger events use rounds.
