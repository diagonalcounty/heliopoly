# shellcheck shell=bash
# Shared by deploy-live.sh, deploy-beta.sh, and stage-release-for-live.sh.
# Source from those scripts only (not executed).
#
# The droplet IP may live in git. The SSH login name must not —
# set HELIOPOLY_DEPLOY_USER in gitignored scripts/deploy.env.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$REPO_ROOT/scripts/deploy.env" ]]; then
  # shellcheck disable=SC1091
  source "$REPO_ROOT/scripts/deploy.env"
fi

HELIOPOLY_DEPLOY_HOST="${HELIOPOLY_DEPLOY_HOST:-167.99.222.7}"
SSH_KEY="${HELIOPOLY_DEPLOY_KEY:-$HOME/.ssh/id_ed25519}"
LIVE_ROOT="${HELIOPOLY_LIVE_ROOT:-/var/www/heliopoly}"
LIVE_URL="${HELIOPOLY_LIVE_URL:-https://heliopoly.live/}"

if [[ "$HELIOPOLY_DEPLOY_HOST" == *@* ]]; then
  echo "ERROR: HELIOPOLY_DEPLOY_HOST must be a host/IP only (no user@). Set HELIOPOLY_DEPLOY_USER separately." >&2
  exit 1
fi
if [[ -z "${HELIOPOLY_DEPLOY_USER:-}" ]]; then
  echo "ERROR: set HELIOPOLY_DEPLOY_USER in scripts/deploy.env (SSH login is not stored in git)" >&2
  exit 1
fi
DEPLOY_TARGET="${HELIOPOLY_DEPLOY_USER}@${HELIOPOLY_DEPLOY_HOST}"

SSH=(ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
RSYNC_RSH="ssh -i $SSH_KEY -o BatchMode=yes -o StrictHostKeyChecking=accept-new"

# Idempotent droplet install. Do not rsync -a into /etc/cron.d — archive mode
# preserves a laptop uid and Debian cron then ignores the file (WRONG FILE OWNER).
heliopoly_install_promote_cron() {
  echo "→ install promote script + daily 00:01 UTC cron (idempotent)"
  rsync -vz --no-owner --no-group --no-perms -e "$RSYNC_RSH" \
    "$REPO_ROOT/scripts/heliopoly-promote-next.sh" \
    "${DEPLOY_TARGET}:/usr/local/bin/heliopoly-promote-next"
  "${SSH[@]}" "$DEPLOY_TARGET" "chown root:root /usr/local/bin/heliopoly-promote-next && chmod 755 /usr/local/bin/heliopoly-promote-next"
  rsync -vz --no-owner --no-group --no-perms -e "$RSYNC_RSH" \
    "$REPO_ROOT/scripts/heliopoly-promote.cron" \
    "${DEPLOY_TARGET}:/etc/cron.d/heliopoly-promote"
  "${SSH[@]}" "$DEPLOY_TARGET" "chown root:root /etc/cron.d/heliopoly-promote && chmod 644 /etc/cron.d/heliopoly-promote"
}

# Break-glass live ship must retire pending.json so a far-future unlock
# (e.g. 2026-12-31, #231) cannot overwrite this dist on a later cron fire.
heliopoly_retire_pending_after_live() {
  local version="$1"
  local comment="$2"
  "${SSH[@]}" "$DEPLOY_TARGET" \
    "HELIOPOLY_LIVE_VERSION=$(printf %q "$version") HELIOPOLY_LIVE_COMMENT=$(printf %q "$comment") python3 - <<'PY'
import json, os
from datetime import datetime, timezone
releases = '/var/www/heliopoly-releases'
pending_path = os.path.join(releases, 'pending.json')
last_path = os.path.join(releases, 'last-promoted.json')
meta = {}
if os.path.exists(pending_path):
    with open(pending_path) as f:
        meta = json.load(f)
meta['version'] = os.environ['HELIOPOLY_LIVE_VERSION']
meta['comment'] = os.environ['HELIOPOLY_LIVE_COMMENT']
meta['promotedAt'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
meta['liveRoot'] = '/var/www/heliopoly'
meta['retiredPending'] = True
with open(last_path, 'w') as f:
    json.dump(meta, f, indent=2)
    f.write('\n')
if os.path.exists(pending_path):
    os.remove(pending_path)
print('retired pending.json -> last-promoted.json', meta.get('version'))
PY"
}
