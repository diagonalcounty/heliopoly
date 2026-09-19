# Agent instructions — Heliopoly

Public game repo: https://github.com/diagonalcounty/heliopoly  
Local clone: `~/code/heliopoly`

## GitHub

Keep active `gh` as **`diagonalcounty`**. Always use `gh` for GitHub URLs. SHP repos are out of scope.

## Commit attribution (always)

On **every agent commit**, add trailers after a blank line:

```
Agent: <botly|build|chiefly|human|unknown>
Pool: <bot|build|none>
Host: <mini|olelo|other>
```

- Host values are **lowercase** only (`olelo`, not `Olelo`).
- Recommended author: Build → `Grok Build <build@diagonalcounty.bot>`; Botly → `Botly <botly@diagonalcounty.bot>`.
- Full schema + proven SHAs: [toolbox `docs/commit-attribution.md`](https://github.com/diagonalcounty/toolbox/blob/main/docs/commit-attribution.md)

## Before editing

`git pull --ff-only` on the branch you will push. Prefer small PRs; see `CONTRIBUTING.md`.
