#!/usr/bin/env bash
# Build current tree and rsync dist/ to heliopoly.live immediately.
# Does not wait for Sunday cron. Sunday stage path:
#   ./scripts/stage-release-for-live.sh <version> <enabledAfter>
#
# Usage (from repo root or this script's dir):
#   ./scripts/deploy-live.sh
#   ./scripts/deploy-live.sh --dry-run
#   ./scripts/deploy-live.sh --force    # non-main branch or dirty tree
#
# Host/key: env, or gitignored scripts/deploy.env (see deploy.env.example).
# Do not LLM-invent SSH/python hotfixes — run this script.
set -euo pipefail

FORCE=0
DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,16p' "$0"
      exit 0
      ;;
    *)
      echo "unknown arg: $arg (try --force / --dry-run)" >&2
      exit 2
      ;;
  esac
done

# shellcheck disable=SC1091
source "$(cd "$(dirname "$0")" && pwd)/deploy-common.sh"
cd "$REPO_ROOT"

if [[ ! -f "$SSH_KEY" ]]; then
  echo "ERROR: deploy key missing: $SSH_KEY" >&2
  exit 1
fi

branch="$(git rev-parse --abbrev-ref HEAD)"
dirty="$(git status --porcelain)"
if [[ "$branch" != "main" || -n "$dirty" ]]; then
  echo "WARN: branch=${branch} dirty=$([[ -n $dirty ]] && echo yes || echo no)"
  if [[ "$FORCE" -ne 1 ]]; then
    echo "Refusing to ship a feature branch or dirty tree." >&2
    echo "Commit / checkout main, or pass --force if you really mean this tree." >&2
    exit 1
  fi
  echo "→ --force: deploying this tree anyway"
fi

echo "→ npm run build"
npm run build
if [[ ! -f dist/index.html ]]; then
  echo "ERROR: dist/index.html missing after build" >&2
  exit 1
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "→ dry-run rsync dist/ → ${HELIOPOLY_DEPLOY_HOST}:${LIVE_ROOT}/"
  rsync -avzn --delete -e "$RSYNC_RSH" \
    --exclude 'logs/' \
    --exclude '.promote-lock' \
    dist/ "${DEPLOY_TARGET}:${LIVE_ROOT}/"
  echo "OK dry-run (live unchanged)"
  exit 0
fi

echo "→ rsync dist/ → ${HELIOPOLY_DEPLOY_HOST}:${LIVE_ROOT}/"
rsync -avz --delete -e "$RSYNC_RSH" \
  --exclude 'logs/' \
  --exclude '.promote-lock' \
  dist/ "${DEPLOY_TARGET}:${LIVE_ROOT}/"

echo "→ verify ${LIVE_URL}"
html="$(curl -fsS -H 'Cache-Control: no-cache' "$LIVE_URL")"
if ! grep -q 'title-tagline' <<<"$html"; then
  echo "ERROR: live index missing title-tagline" >&2
  exit 1
fi
tagline="$(sed -n 's/.*title-tagline[^>]*> · \([^<]*\).*/\1/p' <<<"$html" | head -1)"
echo "OK live tagline: ${tagline:-unknown}"
echo "OK ${LIVE_URL}"
