# TestFlight — What to Test (draft)

**Do not upload this to App Store Connect from the agent session.** Jacob pastes it when he wants a build.

Build: home doors (Journey / Arcade / Lab), epic #275. Same rules as 1.4.0. No price change.

## What to test

1. Cold launch (delete the app first, or a fresh install). You should see three doors, not the rocket form.
2. **Arcade** is the big door. It opens Bot Evolution, Backup fuel, and Hull panel. Those toys do not move a charter you already started.
3. **Journey** opens the charter. Name a rocket and Launch. The header **Home** button brings the three doors back and does not quit the flight.
4. **Lab** is the small door. On a fresh install it says “Play one Arcade toy” and does not open. Leave one Arcade toy (close it). Home again. Lab should unlock, and it should not open by itself.
5. Lab is experiments: Which is larger?, Deseret letters, Urinal-rule Parking, Gravity Duel practice. End screens and economy setups are behind **Show experiments**.
6. On iPhone, the doors sit below the status bar / Dynamic Island and above the home indicator.

## Not in this pass

- App Store listing text, screenshots, or price
- Charter economy changes
