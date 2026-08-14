#!/usr/bin/env bash
# Build current tree and stage dist/ on the .live droplet for Sunday promote.
# Does NOT write into /var/www/heliopoly (live). Only heliopoly-releases/.
#
# Usage (from Mac with deploy key):
#   ./scripts/stage-release-for-live.sh 0.0.26 2026-08-16T00:01:00.000Z
set -euo pipefail

VERSION="${1:?version e.g. 0.0.26}"
ENABLED_AFTER="${2:?ISO unlock e.g. 2026-08-16T00:01:00.000Z}"
HOST="${HELIOPOLY_DEPLOY_HOST:-167.99.222.7}"
SSH_KEY="${HELIOPOLY_DEPLOY_KEY:-$HOME/.ssh/id_ed25519}"
SSH=(ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
RSYNC_RSH="ssh -i $SSH_KEY -o BatchMode=yes -o StrictHostKeyChecking=accept-new"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_RELEASES=/var/www/heliopoly-releases
REMOTE_VER="${REMOTE_RELEASES}/${VERSION}"

cd "$REPO_ROOT"
npm run build

echo "→ stage dist/ → ${HOST}:${REMOTE_VER}/"
"${SSH[@]}" "$HOST" "mkdir -p '${REMOTE_VER}' '${REMOTE_RELEASES}'"
rsync -avz --delete -e "$RSYNC_RSH" dist/ "${HOST}:${REMOTE_VER}/"

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
echo "$PENDING_JSON" | "${SSH[@]}" "$HOST" "cat > '${REMOTE_RELEASES}/pending.json'"

echo "→ install promote script + weekly cron (idempotent)"
rsync -avz -e "$RSYNC_RSH" \
  scripts/heliopoly-promote-next.sh \
  "${HOST}:/usr/local/bin/heliopoly-promote-next"
"${SSH[@]}" "$HOST" "chmod 755 /usr/local/bin/heliopoly-promote-next"
rsync -avz -e "$RSYNC_RSH" \
  scripts/heliopoly-promote.cron \
  "${HOST}:/etc/cron.d/heliopoly-promote"
"${SSH[@]}" "$HOST" "chmod 644 /etc/cron.d/heliopoly-promote"

echo "→ verify stage (live root unchanged)"
"${SSH[@]}" "$HOST" "python3 - <<'PY'
import json
p=json.load(open('/var/www/heliopoly-releases/pending.json'))
print('pending', p)
import os
print('staged index', os.path.exists(f\"/var/www/heliopoly-releases/{p['version']}/index.html\"))
print('cron', open('/etc/cron.d/heliopoly-promote').read())
PY
grep -o 'v0\\.[0-9.]*' /var/www/heliopoly/index.html | head -1
"

echo "OK: v${VERSION} staged; live promotes at ${ENABLED_AFTER} via droplet cron (Sunday 00:01 UTC)."
