#!/usr/bin/env bash
# Fail when the packaged WebDist was synced from a commit other than HEAD.
# Called by npm run ios:sync (after it stamps), npm run ios:phone-build,
# and the Xcode "Copy WebDist" run script phase.
# Intentional older bundle: HELIOPOLY_ALLOW_STALE_WEBDIST=1
set -euo pipefail

# Xcode run-script phases have a minimal PATH. Apple git and Homebrew both live outside it.
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${PATH:-}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$ROOT/ios/Heliopoly/WebDist/.heliopoly-web-sync"

fail() {
  echo "error: WebDist is not synced to HEAD." >&2
  echo "  $1" >&2
  echo "  From the repo root run: npm run ios:sync" >&2
  echo "  To build this older bundle on purpose: HELIOPOLY_ALLOW_STALE_WEBDIST=1" >&2
  if [[ "${HELIOPOLY_ALLOW_STALE_WEBDIST:-}" == "1" ]]; then
    echo "warning: HELIOPOLY_ALLOW_STALE_WEBDIST=1 — continuing with this WebDist." >&2
    exit 0
  fi
  exit 1
}

if [[ ! -f "$STAMP" ]]; then
  fail "missing stamp $STAMP"
fi

# awk (not grep|head): a closed pipe plus pipefail would abort before fail().
stamped="$(awk -F= '/^git=/ { print $2; exit }' "$STAMP" | tr -d '[:space:]')"
if [[ -z "$stamped" || "$stamped" == "unknown" ]]; then
  fail "stamp has no git SHA ($STAMP)"
fi

if ! command -v git >/dev/null 2>&1 || ! git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  fail "cannot read git HEAD to compare with stamped git=$stamped"
fi

head_full="$(git -C "$ROOT" rev-parse HEAD)"
if ! stamped_full="$(git -C "$ROOT" rev-parse --verify "${stamped}^{commit}" 2>/dev/null)"; then
  fail "stamped git=$stamped does not resolve (HEAD is $head_full)"
fi

if [[ "$stamped_full" != "$head_full" ]]; then
  fail "stamped git=$stamped ($stamped_full) != HEAD $head_full"
fi

echo "→ WebDist stamp matches HEAD ($head_full)"
