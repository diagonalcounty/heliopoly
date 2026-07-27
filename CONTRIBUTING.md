# Contributing to Heliopoly

Thanks for helping shape **Free Enterprise In Space**.

**Repo:** https://github.com/diagonalcounty/heliopoly  
**Play:** https://heliopoly.live/

## How to contribute

1. **Fork** the repo (or use a branch if you have write access).
2. Create a focused branch (`fix/…`, `feat/…`).
3. Open a **Pull Request** against `main`.
4. Keep the description short: what changed and how to test.

`main` is protected: force-pushes are blocked; PRs are the normal path. Maintainers may still ship hotfixes.

## Maintainer backlog order

Priority is the **GitHub Project board order** (not issue number). Agents run:

```bash
./scripts/backlog.sh
```

Requires `gh auth refresh -h github.com -s read:project,project` and `scripts/backlog.env` (see `backlog.env.example`).

## Ideas we especially want

- Punchy **Gravity Duel** result lines (replace “punchy message here”)
- Balance reports (fuel, rent, parking/feral, AI)
- Handbook / lore clarity
- Bugs with steps to reproduce

Open an [issue](https://github.com/diagonalcounty/heliopoly/issues) if you’re unsure before coding.

## Local check

```bash
npm install
npm run typecheck
npm run build
```

Optional: `npm run selfplay -- 5 4`

## Code notes

- Game rules live in `src/core/**` (no DOM).
- Browser shell: `src/main.ts`, handbook under `src/handbook/`.
- Prefer small PRs over large rewrites.
