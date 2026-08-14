#!/usr/bin/env bash
# Promote a staged static release to heliopoly.live (PRD web root).
#
# Architecture (Mode B — promote-on-Sunday, see issue #98):
#   Stage:   /var/www/heliopoly-releases/<version>/   full Vite dist/
#   Pointer: /var/www/heliopoly-releases/pending.json
#   Live:    /var/www/heliopoly/
#
# pending.json example:
#   {
#     "version": "0.0.26",
#     "enabledAfter": "2026-08-16T00:01:00.000Z",
#     "comment": "Weekly promote"
#   }
#
# Install on droplet (UTC):
#   install -m 755 scripts/heliopoly-promote-next.sh /usr/local/bin/heliopoly-promote-next
#   # /etc/cron.d/heliopoly-promote  (see scripts/heliopoly-promote.cron)
#
# Cron runs at Sunday 00:01 UTC. Script no-ops if pending is missing, already
# promoted, or now < enabledAfter (safety if cron fires early).
set -euo pipefail

RELEASES_ROOT="${HELIOPOLY_RELEASES_ROOT:-/var/www/heliopoly-releases}"
LIVE_ROOT="${HELIOPOLY_LIVE_ROOT:-/var/www/heliopoly}"
PENDING="${RELEASES_ROOT}/pending.json"
LOG="${HELIOPOLY_PROMOTE_LOG:-/var/log/heliopoly-promote.log}"
STAMP_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

log() { echo "[$STAMP_UTC] $*" | tee -a "$LOG" >&2; }

if [[ ! -f "$PENDING" ]]; then
  log "no pending.json — nothing to promote"
  exit 0
fi

if ! command -v python3 >/dev/null 2>&1; then
  log "ERROR: python3 required to parse pending.json"
  exit 1
fi

read -r VERSION ENABLED_AFTER < <(python3 -c '
import json, sys
p = json.load(open(sys.argv[1]))
print(p["version"], p.get("enabledAfter", "1970-01-01T00:00:00.000Z"))
' "$PENDING")

SRC="${RELEASES_ROOT}/${VERSION}"
if [[ ! -d "$SRC" ]] || [[ ! -f "$SRC/index.html" ]]; then
  log "ERROR: staged release missing or incomplete: $SRC"
  exit 1
fi

# Gate on absolute UTC unlock (ISO-8601 …Z)
NOW_EPOCH="$(date -u +%s)"
UNLOCK_EPOCH="$(python3 - <<PY
from datetime import datetime, timezone
s = "${ENABLED_AFTER}".replace("Z", "+00:00")
print(int(datetime.fromisoformat(s).timestamp()))
PY
)"

if (( NOW_EPOCH < UNLOCK_EPOCH )); then
  log "pending v${VERSION} not yet unlocked (enabledAfter=${ENABLED_AFTER}, now=${STAMP_UTC}) — skip"
  exit 0
fi

log "promoting v${VERSION} → ${LIVE_ROOT} (enabledAfter=${ENABLED_AFTER})"

# Preserve telemetry logs dir if present under live root
rsync -a --delete \
  --exclude 'logs/' \
  --exclude '.promote-lock' \
  "${SRC}/" "${LIVE_ROOT}/"

# Atomic-ish bookkeeping
python3 - <<PY
import json, os
from datetime import datetime, timezone
pending_path = "${PENDING}"
releases = "${RELEASES_ROOT}"
version = "${VERSION}"
with open(pending_path) as f:
    meta = json.load(f)
meta["promotedAt"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
meta["liveRoot"] = "${LIVE_ROOT}"
last = os.path.join(releases, "last-promoted.json")
with open(last, "w") as f:
    json.dump(meta, f, indent=2)
    f.write("\n")
os.remove(pending_path)
PY

log "OK promoted v${VERSION}; pending.json cleared → last-promoted.json"
exit 0
