#!/usr/bin/env bash
# Rsync TypeScript sim-lab to the droplet and restart systemd.
# Binds 127.0.0.1:5174; nginx on simulation.heliopoly.live proxies to it.
# Does NOT write /var/www/heliopoly (#98).
#
# Usage: ./scripts/deploy-simulation.sh
set -euo pipefail
# shellcheck disable=SC1091
source "$(cd "$(dirname "$0")" && pwd)/deploy-common.sh"
cd "$REPO_ROOT"

REMOTE_APP=/opt/heliopoly-sim

echo "→ rsync sim sources → ${HELIOPOLY_DEPLOY_HOST}:${REMOTE_APP}/"
"${SSH[@]}" "$DEPLOY_TARGET" "mkdir -p '${REMOTE_APP}'"
rsync -avz --delete -e "$RSYNC_RSH" \
  --exclude node_modules \
  --exclude dist \
  --exclude .git \
  --exclude ios \
  --exclude telemetry \
  --exclude sim-results \
  package.json package-lock.json tsconfig.json src \
  "${DEPLOY_TARGET}:${REMOTE_APP}/"

echo "→ npm ci on droplet"
"${SSH[@]}" "$DEPLOY_TARGET" "cd '${REMOTE_APP}' && npm ci"

echo "→ install systemd unit"
rsync -vz --no-owner --no-group --no-perms -e "$RSYNC_RSH" \
  scripts/heliopoly-sim-lab.service \
  "${DEPLOY_TARGET}:/etc/systemd/system/heliopoly-sim-lab.service"
"${SSH[@]}" "$DEPLOY_TARGET" "chown root:root /etc/systemd/system/heliopoly-sim-lab.service && systemctl daemon-reload && systemctl enable --now heliopoly-sim-lab && systemctl restart heliopoly-sim-lab"

echo "→ health"
"${SSH[@]}" "$DEPLOY_TARGET" "sleep 1; curl -fsS http://127.0.0.1:5174/api/health"
echo
echo "OK simulation.heliopoly.live (live web root unchanged)"
