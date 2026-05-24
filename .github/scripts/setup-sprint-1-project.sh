#!/usr/bin/env bash
# Run AFTER: gh auth refresh -s project,read:project
# Creates GitHub Project v2, custom fields, views, and links all Sprint 1 issues.
set -euo pipefail
OWNER="Shadow-Council-Software"
REPO="product"
PROJECT_TITLE="ENTERPRISE Sprint 1 — Runtime Foundation"

echo "Creating project..."
PROJECT_JSON=$(gh project create --owner "$OWNER" --title "$PROJECT_TITLE" --format json)
PROJECT_NUM=$(echo "$PROJECT_JSON" | jq -r '.number')
PROJECT_ID=$(echo "$PROJECT_JSON" | jq -r '.id')
echo "Project #$PROJECT_NUM (id=$PROJECT_ID)"

link_project() {
  gh project link "$PROJECT_NUM" --owner "$OWNER" --repo "$OWNER/$REPO"
}

field_text() {
  gh project field-create "$PROJECT_NUM" --owner "$OWNER" --name "$1" --data-type TEXT --format json
}

field_number() {
  gh project field-create "$PROJECT_NUM" --owner "$OWNER" --name "$1" --data-type NUMBER --format json
}

field_single_select() {
  local name="$1"
  shift
  gh project field-create "$PROJECT_NUM" --owner "$OWNER" --name "$name" --data-type "SINGLE_SELECT" --single-select-options "$*" --format json
}

link_project || true

field_text "OpenSpec Task ID" >/dev/null
field_single_select "W-CT Contract" "none" "W-CT-01" "W-CT-02" "W-CT-03" >/dev/null
field_single_select "Gate" "none" "G1" "G2" "G3" "G4" "G5" >/dev/null
field_single_select "Token Audit Unit" "no" "yes" >/dev/null
field_number "Estimated Tokens" >/dev/null
field_number "Actual Tokens" >/dev/null
field_text "Agent Sessions" >/dev/null
field_single_select "Status" "Todo" "In Progress" "Done" "Blocked" >/dev/null
field_number "Story Points" >/dev/null
field_single_select "Component" "monorepo" "engine" "lcars-web" "packages" "openspec" "infra" >/dev/null

echo "Adding sprint-1 issues to project..."
gh issue list --repo "$OWNER/$REPO" --label sprint-1 --limit 100 --json number,title | jq -r '.[].number' | while read -r num; do
  gh project item-add "$PROJECT_NUM" --owner "$OWNER" --url "https://github.com/$OWNER/$REPO/issues/$num"
  echo "  Added #$num"
done

echo "Done. Open: gh project view $PROJECT_NUM --owner $OWNER --web"
echo "Configure board + table views in GitHub UI:"
echo "  - Sprint board: group by Status"
echo "  - Token audit: filter label:sprint-1 label:token-audit"
echo "  - Contracts: filter label:W-CT-01 OR W-CT-02 OR W-CT-03"
