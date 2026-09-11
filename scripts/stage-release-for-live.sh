#!/usr/bin/env bash
# Build current tree and stage dist/ on the .live droplet for Sunday promote.
# Does NOT write into /var/www/heliopoly (live). Only heliopoly-releases/.
#
# Usage (from a machine with deploy key):
#   ./scripts/stage-release-for-live.sh 1.3.0
#   ./scripts/stage-release-for-live.sh 1.3.0 2026-09-13T00:01:00.000Z
# Omit the ISO to compute the next Sunday 00:01 UTC (#231). A non-Sunday
# timestamp is rejected unless HELIOPOLY_UNLOCK_FORCE=1.
set -euo pipefail

VERSION="${1:?version e.g. 1.3.0}"
ENABLED_AFTER="${2:-}"
# shellcheck disable=SC1091
source "$(cd "$(dirname "$0")" && pwd)/deploy-common.sh"
UNLOCK_PY="$REPO_ROOT/scripts/sunday-unlock.py"
if [[ -z "$ENABLED_AFTER" ]]; then
  ENABLED_AFTER="$(python3 "$UNLOCK_PY" next)"
  echo "→ unlock (next Sunday 00:01 UTC): ${ENABLED_AFTER}"
elif python3 "$UNLOCK_PY" validate "$ENABLED_AFTER"; then
  :
elif [[ "${HELIOPOLY_UNLOCK_FORCE:-}" == "1" ]]; then
  echo "WARN: ${ENABLED_AFTER} is not Sunday 00:01 UTC; staging anyway (HELIOPOLY_UNLOCK_FORCE=1)" >&2
else
  echo "ERROR: enabledAfter must be Sunday 00:01 UTC (got ${ENABLED_AFTER})." >&2
  echo "Omit the ISO to auto-compute, or set HELIOPOLY_UNLOCK_FORCE=1." >&2
  exit 1
fi
REMOTE_RELEASES=/var/www/heliopoly-releases
REMOTE_VER="${REMOTE_RELEASES}/${VERSION}"

cd "$REPO_ROOT"
npm run build

echo "→ stage dist/ → ${HELIOPOLY_DEPLOY_HOST}:${REMOTE_VER}/"
"${SSH[@]}" "$DEPLOY_TARGET" "mkdir -p '${REMOTE_VER}' '${REMOTE_RELEASES}'"
rsync -avz --delete -e "$RSYNC_RSH" dist/ "${DEPLOY_TARGET}:${REMOTE_VER}/"

PENDING_JSON=$(cat <<EOF
{
  "version": "${VERSION}",
  "enabledAfter": "${ENABLED_AFTER}",
  "comment": "Weekly promote to heliopoly.live (UTC)",
  "stagedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "gitDescribe": "$(git describe --tags --always 2>/dev/null || echo unknown)"
}
EOF
)

echo "→ write pending.json (unlock ${ENABLED_AFTER})"
echo "$PENDING_JSON" | "${SSH[@]}" "$DEPLOY_TARGET" "cat > '${REMOTE_RELEASES}/pending.json'"

echo "→ staged ${VERSION} for Sunday live only (beta.heliopoly.live is GitHub main, not this snapshot)"
heliopoly_install_promote_cron

echo "→ verify stage (live web root unchanged)"
"${SSH[@]}" "$DEPLOY_TARGET" "python3 - <<'PY'
import json
p=json.load(open('/var/www/heliopoly-releases/pending.json'))
print('pending', p)
import os
print('staged index', os.path.exists(f\"/var/www/heliopoly-releases/{p['version']}/index.html\"))
print('cron', open('/etc/cron.d/heliopoly-promote').read())
PY
grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+' /var/www/heliopoly/index.html | head -1
"

echo "OK: ${VERSION} staged; live promotes at ${ENABLED_AFTER} via droplet daily 00:01 UTC cron (enabledAfter is the gate)."
