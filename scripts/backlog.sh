#!/usr/bin/env bash
# List Heliopoly backlog in GitHub Project board order (POSITION).
#
# One-time auth (interactive):
#   gh auth refresh -h github.com -s read:project,project
#
# Config: env vars or scripts/backlog.env (see backlog.env.example)
#   HELIOPOLY_PROJECT_OWNER   (user or org login that owns the Project)
#   HELIOPOLY_PROJECT_NUMBER  (from project URL …/projects/N)
#   HELIOPOLY_BACKLOG_STATUS  (optional exact Status column name, e.g. Todo)

set -euo pipefail

REPO="${HELIOPOLY_REPO:-diagonalcounty/heliopoly}"
OWNER="${HELIOPOLY_PROJECT_OWNER:-diagonalcounty}"
STATUS_FILTER="${HELIOPOLY_BACKLOG_STATUS:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
[[ -f "$SCRIPT_DIR/backlog.env" ]] && source "$SCRIPT_DIR/backlog.env"
OWNER="${HELIOPOLY_PROJECT_OWNER:-$OWNER}"
STATUS_FILTER="${HELIOPOLY_BACKLOG_STATUS:-$STATUS_FILTER}"

die() { echo "$*" >&2; exit 1; }

need_scope() {
  cat >&2 <<'EOF'
GitHub CLI token is missing Projects scope.

Run once (interactive terminal):
  gh auth refresh -h github.com -s read:project,project

Then re-run:  ./scripts/backlog.sh
EOF
  exit 1
}

check_scope() {
  local err
  err="$(gh project list --owner "$OWNER" 2>&1)" || true
  if echo "$err" | grep -qi 'read:project\|missing required scopes'; then
    need_scope
  fi
}

resolve_project_number() {
  if [[ -n "${HELIOPOLY_PROJECT_NUMBER:-}" ]]; then
    PROJECT_NUMBER="$HELIOPOLY_PROJECT_NUMBER"
    return
  fi

  local json
  json="$(gh project list --owner "$OWNER" --format json 2>/dev/null || echo "[]")"
  if [[ "$json" == "[]" || -z "$json" ]]; then
    # Try authenticated user
    local me
    me="$(gh api user -q .login 2>/dev/null || true)"
    if [[ -n "$me" && "$me" != "$OWNER" ]]; then
      OWNER="$me"
      json="$(gh project list --owner "$OWNER" --format json 2>/dev/null || echo "[]")"
    fi
  fi

  if [[ "$json" == "[]" || -z "$json" ]]; then
    die "No Projects found for owner=$OWNER.
Set HELIOPOLY_PROJECT_NUMBER (and HELIOPOLY_PROJECT_OWNER) in scripts/backlog.env
See scripts/backlog.env.example — number is in the Project URL: …/projects/N"
  fi

  PROJECT_NUMBER="$(echo "$json" | jq -r '
    (map(select(.title | test("heliopoly"; "i"))) | first | .number)
    // (.[0].number)
  ')"
  [[ -n "$PROJECT_NUMBER" && "$PROJECT_NUMBER" != "null" ]] \
    || die "Could not parse project number from: $json"
}

fetch_items_json() {
  local project_id="$1"
  local query cursor resp page has cursor_out
  query='
  query($id: ID!, $cursor: String) {
    node(id: $id) {
      ... on ProjectV2 {
        title
        number
        items(first: 50, after: $cursor, orderBy: { field: POSITION, direction: ASC }) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            fieldValues(first: 30) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field { ... on ProjectV2SingleSelectField { name } }
                }
              }
            }
            content {
              ... on Issue {
                number
                title
                state
                url
                labels(first: 12) { nodes { name } }
              }
              ... on PullRequest {
                number
                title
                state
                url
              }
            }
          }
        }
      }
    }
  }'

  local all='[]'
  cursor=""
  local title=""
  while true; do
    if [[ -z "$cursor" ]]; then
      resp="$(gh api graphql -f query="$query" -f id="$project_id" 2>&1)" || true
    else
      resp="$(gh api graphql -f query="$query" -f id="$project_id" -f cursor="$cursor" 2>&1)" || true
    fi
    if echo "$resp" | grep -qi 'INSUFFICIENT_SCOPES\|read:project'; then
      need_scope
    fi
    if ! echo "$resp" | jq -e '.data.node.items' >/dev/null 2>&1; then
      die "GraphQL failed: $resp"
    fi
    title="$(echo "$resp" | jq -r '.data.node.title')"
    page="$(echo "$resp" | jq '.data.node.items')"
    all="$(echo "$all" | jq --argjson p "$page" '. + $p.nodes')"
    has="$(echo "$page" | jq -r .pageInfo.hasNextPage)"
    cursor="$(echo "$page" | jq -r .pageInfo.endCursor)"
    [[ "$has" == "true" ]] || break
  done
  echo "$all" | jq --arg t "$title" --argjson n "$PROJECT_NUMBER" \
    '{ title: $t, number: $n, nodes: . }'
}

main() {
  check_scope
  resolve_project_number

  local view_json project_id
  view_json="$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json 2>&1)" || true
  if echo "$view_json" | grep -qi 'read:project\|scope'; then
    need_scope
  fi
  project_id="$(echo "$view_json" | jq -r .id 2>/dev/null || true)"
  [[ -n "$project_id" && "$project_id" != "null" ]] \
    || die "Cannot load project #$PROJECT_NUMBER owner=$OWNER: $view_json"

  local bundle
  bundle="$(fetch_items_json "$project_id")"

  echo "# Backlog order (Project POSITION ascending)"
  echo "# $(echo "$bundle" | jq -r '"\(.title) · project #\(.number) · owner='"$OWNER"')"
  echo "# Status filter: ${STATUS_FILTER:-all open issues on board}"
  echo "#"

  echo "$bundle" | jq -r --arg sf "$STATUS_FILTER" '
    def status:
      ([.fieldValues.nodes[]?
        | select(.field.name == "Status")
        | .name] | first) // "";
    [ .nodes[]
      | select(.content.number != null)
      | select((.content.state | ascii_upcase) == "OPEN")
      | select(($sf == "") or (status == $sf))
      | {
          number: .content.number,
          title: .content.title,
          url: .content.url,
          status: status,
          labels: ([.content.labels.nodes[]?.name] // []) | join(", ")
        }
    ]
    | if length == 0 then
        "# (no open issues matched — check Status filter or that issues are on the project)"
      else
        to_entries[] |
        "\(.key + 1).\t#\(.value.number)\t[\(.value.status)]\t\(.value.title)"
      end
  '

  local next
  next="$(echo "$bundle" | jq -r --arg sf "$STATUS_FILTER" '
    def status:
      ([.fieldValues.nodes[]?
        | select(.field.name == "Status")
        | .name] | first) // "";
    [ .nodes[]
      | select(.content.number != null)
      | select((.content.state | ascii_upcase) == "OPEN")
      | select(($sf == "") or (status == $sf))
      | .content.number
    ] | first // empty
  ')"

  if [[ -n "$next" ]]; then
    echo "#"
    echo "NEXT_ISSUE=$next"
    echo "NEXT_URL=https://github.com/${REPO}/issues/${next}"
  fi
}

main "$@"
