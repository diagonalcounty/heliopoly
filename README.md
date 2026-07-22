# Solarquest app

**Version:** 0.0.1  
**Parent project:** vault `35 Software/Solarquest/`  
**Release notes:** `../docs/RELEASE-v0.0.1.md`  
**Changelog:** `../CHANGELOG.md`

Browser-first TypeScript implementation: pure game core + UI shell + Flight Handbook.

## Commands

```bash
npm install
npm run dev        # http://localhost:5173/
npm run selfplay   # headless AI games
npm run build
npm run typecheck
```

## Layout

| Path | Role |
|------|------|
| `src/core/` | Rules engine (no DOM) |
| `src/handbook/` | In-game handbook content + modal |
| `src/main.ts` | Browser shell |
| `src/selfplay.ts` | CLI self-play |

This directory is intended to become a standalone git repository later.

**Publishing intent:** eventually **public** open source. Not yet — stay local or **private** on GitHub until the owner runs the pre-public checklist (license, branding, secrets, clean history). A private repo can be switched to public when ready.
