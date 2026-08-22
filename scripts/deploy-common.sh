# shellcheck shell=bash
# Shared by deploy-live.sh and stage-release-for-live.sh.
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
