# Open design (digest)

Sampled open issues labeled `design` on 2026-09-22. Many carry `do-not-build`. That means **do not implement from this page.** Status is the issue’s, not a promise the seed is still wanted.

Shipped behavior that still has an open design issue is called out. Close or rewrite those issues only when Jacob says so.

## Lab minigames (practice, not the charter)

Ops Manual Lab list: Bot Evolution, Gravity Duel, Deseret letters, Backup fuel, Hull panel, Urinal-rule Parking. Lab does not change the rocket on the board, except Gravity Duel / End / Economy shelves which replace the current board game.

| Issue | Seed | Note |
| --- | --- | --- |
| #203 | Bot Evolution egg-socket matching | Design seed. Engine work continued in #204–#206, #230, #240, #241, #247, #249. Locked Connect-N (start Connect 3, grid N×8, morph to a box, two bars then N+1, stay 6×8) is written in `docs/bot-evolution/README.md`. Lab-only. No `src/core`. |
| #204 #205 #206 | 5×8 engine, tile grammar, art | #204 title still says 5×8; the README says fixed 5×8 is retired. Trust the README + changelog over the old title. |
| #194 | Minigames **inside the charter** by expedition length | `do-not-build`. Manual: “Minigames in the charter come later; practice them in the Lab.” |
| #79 | Deseret alphabet matching | Design seed. Changelog 1.3.0: Lab Deseret is 2-choice. |
| #252 | Deseret letters — define the gameboard | `do-not-build`. Jacob defines the board. |
| #253 | Which is larger? — define the gameboard | `do-not-build`. Sibling of #104 (same leading digit is a difficulty lever). |
| #78 | Sliding-tile / 15-puzzle hull panel | Design seed. Hull panel is already a Lab name. |
| #174 | Zoombinis catalog | Inspiration reference, not a feature. |
| #153 | Lab shelf under the Lab button | Practice only. Shelf exists in the manual; issue may be stale. **UNKNOWN / NEEDS JACOB** what is still missing. |
| #82 | Mini-bot surveys (Lemmings on fuel bodies) | `do-not-build`. |

Unreleased changelog: Urinal-rule Parking campaign shelf (#251) — Quiet Apron → Rush Hour → Both Sides Bad → Dead Orbit → Final Approach. That is Lab content, not a new charter rule.

## Charter / economy seeds still open

| Issue | Seed | Note |
| --- | --- | --- |
| #75 | Turtle win: camp on Earth with no assets | Known last-alive meta. `do-not-build` on the issue. |
| #49 | Longer games without tedium | Open design. |
| #42 | Reasons to stay in a system | Open. `do-not-build`. |
| #43 | Doubles should do something | Open. Engine already records doubles on the roll. Effect beyond that: **UNKNOWN / NEEDS JACOB** (do not invent one). |
| #38 | Buy undeveloped claims from other owners | Open. `do-not-build`. |
| #40 #41 | Trivia half-price claims; new dice type | `do-not-build`. |
| #44 | Free depot on first station visit | Open design. |
| #46 | Remote sell | **Changelog 1.1.0 says this shipped** (dossier, half deed, one sale per turn — manual now says one auction listing per claim per turn). Issue may still be open. Reconcile before building again. |
| #140 | Seller sets auction reserve (≥ bank half) | Manual already describes reserve defaulting to the mark, cap at deed price. Treat as likely shipped; confirm on the issue before coding. |
| #154 | Rent dispute resolved by a software patch (Eastern Arabic) | `do-not-build`. |
| #98 | Weekly unlock window | Largely the live Sunday 00:01 UTC promote. Issue may still be open for leftovers. |

## Versions that are not V1

`gameplayMode.ts` lists and locks:

- **V2** Orbital economics — investment and light terraforming
- **V3** Settlement — colonization
- **V4** Governance — laws as code

No issue in this sample specifies their rules. **UNKNOWN / NEEDS JACOB.**

## Explicitly not in the build

Ops Manual topic `not-in-build`:

- Purchasable transfer nodes between rings
- Player trading
- Fuel prices by location (direction only: Earth cheapest)
- Realtime Gravity Duel (dice duel is live)
- Named transit lanes

## Phone / native vision (design, not this pack’s build)

#100 native-feeling phone app, #149 same-game lock, #151 snake columns vs orbit (`do-not-build`), #184 iPhone inside the shipping App Store scheme (`do-not-build`). Layout status is in [PRODUCT-SURFACE.md](PRODUCT-SURFACE.md). #108 Homebrew cask is “not now.”
