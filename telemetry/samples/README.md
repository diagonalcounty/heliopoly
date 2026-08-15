# Telemetry sample data

Raw, unmodified records from the Heliopoly telemetry pipeline
(`telemetry/server.py`, deployed at `/opt/heliopoly-telemetry`). Each JSON file
is one completed game as collected at the server.

These are the first games recorded since telemetry went live (9–14 Aug 2026).
They are **sample data** — the actual corpus is small and mostly the
developer's own testing, so treat no gameplay conclusions as meaningful.

## What a record contains

| Field | Meaning |
|---|---|
| `v` | Payload version |
| `received_at` | UTC timestamp the server wrote the record |
| `player_id` | HMAC-SHA256 hash of the client IP (first 32 hex chars) — pseudonymous, not identity |
| `meta.playerCount` | Seats at game start |
| `meta.aiDifficulty` | AI skill level (`easy` / `normal` / `hard` / `expert`) |
| `meta.propellants` | Rocket names and propellant types |
| `meta.humanPropellant` | Human pilot's propellant |
| `meta.seed` | RNG seed |
| `meta.round` / `meta.gameTurn` | Game length in rounds and turns |
| `meta.winnerId` / `meta.winnerName` | Winning seat and rocket |
| `meta.endReason` | How the charter ended |
| `meta.boardRotations` | Full laps completed |
| `meta.humanSeat` | Whether seat 1 was a human |
| `meta.client` | `heliopoly-web` or `heliopoly-ios` |
| `log` | The game log text (turn-by-turn events) |

## Privacy

No raw IP addresses, user agents, cookies, or identity are ever stored. The
client sends no identity (`src/telemetry.ts`); the server hashes the IP and
drops the original (`telemetry/server.py`). Game logs contain only in-game
events (dice, moves, claims) and rocket names the player chose.
