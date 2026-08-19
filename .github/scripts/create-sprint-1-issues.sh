#!/usr/bin/env bash
# Creates Sprint 1 task issues (1.2–6.2). Epic #1 and task 1.1 #2 may already exist.
set -euo pipefail
REPO="Shadow-Council-Software/product"
EPIC=1
MILESTONE="Sprint 1 — Runtime Foundation"

issue_body() {
  local task_id="$1"
  local acceptance="$2"
  local files="$3"
  local wct="${4:-none}"
  local gate="${5:-none}"
  local component="$6"
  cat <<EOF
## OpenSpec task ID
\`${task_id}\`

## Parent epic
Part of #${EPIC}

## OpenSpec reference
\`enterprise/openspec/changes/sprint-1-runtime-foundation/tasks.md\` — section ${task_id}

## Acceptance criteria
${acceptance}

## Files expected
${files}

## Contracts
- W-CT: \`${wct}\`
- Gate: \`${gate}\`
- Component: \`${component}\`

## Token audit
\`\`\`json
{
  "agent_sessions": [],
  "estimated_tokens": null,
  "actual_tokens": null,
  "completed_at": null,
  "story_points": 1
}
\`\`\`
EOF
}

create_issue() {
  local title="$1"
  shift
  local labels="$1"
  shift
  local body="$1"
  gh issue create --repo "$REPO" --title "$title" --label "$labels" --milestone "$MILESTONE" --assignee "@me" --body "$body"
}

# Update epic and 1.1 titles
gh issue edit "$EPIC" --repo "$REPO" --title "[S1] Epic: Sprint 1 — ENTERPRISE runtime foundation" --milestone "$MILESTONE" --add-label "component-openspec"
gh issue edit 2 --repo "$REPO" --title "[S1][1.1] Monorepo workspaces package.json" --milestone "$MILESTONE" --add-label "component-monorepo,story-points"

declare -a CREATED=()

mapfile -t lines <<'TASKS'
1.2|[S1][1.2] Scaffold lcars-web Vite React TS|enterprise,sprint-1,openspec,token-audit,component-lcars,story-points|component-lcars|none|none|lcars-web via npm create vite; workspace entry in root package.json|enterprise/runtime/lcars-web/, enterprise/runtime/package.json
1.3|[S1][1.3] packages/matter-port MatterAdapterPort types|enterprise,sprint-1,openspec,token-audit,component-packages,story-points|component-packages|none|none|Export MatterAdapterPort from architecture.md|enterprise/runtime/packages/matter-port/
1.4|[S1][1.4] event-envelope and tng-outcomes type guards|enterprise,sprint-1,openspec,token-audit,component-packages,story-points|component-packages|none|none|Event envelope v1 + OutcomePayload guards|enterprise/runtime/packages/event-envelope/, packages/tng-outcomes/
1.5|[S1][1.5] Root docker-compose.yml stub|enterprise,sprint-1,openspec,token-audit,component-infra,story-points|component-infra|none|none|engine + lcars-web services; optional sidecar profile|enterprise/runtime/docker-compose.yml
2.1|[S1][2.1] MockMatterAdapter synthetic env.nest.primary|enterprise,sprint-1,openspec,token-audit,component-engine,story-points|component-engine|none|none|Mock adapter with NEST_PRIMARY_STATION_ID|enterprise/runtime/engine/src/adapters/mock-matter-adapter.ts
2.2|[S1][2.2] Mock adapter freshness timer attribute_updated|enterprise,sprint-1,openspec,token-audit,component-engine,gate-G3,story-points|component-engine|none|G3|Emit attribute_updated on interval for freshness demos|enterprise/runtime/engine/src/adapters/mock-matter-adapter.ts
2.3|[S1][2.3] OhfSidecarAdapter stub MATTER_ADAPTER=ohf|enterprise,sprint-1,openspec,token-audit,component-engine,story-points|component-engine|none|none|Stub throws on connect until W0 live|enterprise/runtime/engine/src/adapters/ohf-sidecar-adapter.ts
3.1|[S1][3.1] Fastify boot with health route|enterprise,sprint-1,openspec,token-audit,component-engine,story-points|component-engine|none|none|GET /health returns ok|enterprise/runtime/engine/src/index.ts
3.2|[S1][3.2] GET /api/v1/stations adapter read model|enterprise,sprint-1,openspec,token-audit,component-engine,gate-G3,story-points|component-engine|none|G3|Station snapshots with freshnessTs|enterprise/runtime/engine/src/api/routes.ts
3.3|[S1][3.3] WS /api/v1/events/stream envelope v1|enterprise,sprint-1,openspec,token-audit,component-engine,story-points|component-engine|none|none|WebSocket emits schemaVersion 1 events|enterprise/runtime/engine/src/index.ts
3.4|[S1][3.4] Clearance middleware Captain Crew Guest|enterprise,sprint-1,openspec,token-audit,component-engine,story-points|component-engine|none|none|x-clearance header parsing + requireClearance|enterprise/runtime/engine/src/middleware/clearance.ts
3.5|[S1][3.5] Alert FSM and GET /api/v1/alerts|enterprise,sprint-1,openspec,token-audit,component-engine,W-CT-03,story-points|component-engine|W-CT-03|none|XState FSM engine-owned; battle-stations endpoint|enterprise/runtime/engine/src/domain/alert-fsm.ts, api/routes.ts
3.6|[S1][3.6] SQLite registry and audit migrations|enterprise,sprint-1,openspec,token-audit,component-engine,story-points|component-engine|none|none|alert_state, audit_log, station_registry|enterprise/runtime/engine/src/persistence/db.ts
4.1|[S1][4.1] Okuda token CSS variables|enterprise,sprint-1,openspec,token-audit,component-lcars,W-CT-02,story-points|component-lcars|W-CT-02|none|CSS vars from visual foundation certificate|enterprise/runtime/lcars-web/src/tokens/okuda.css
4.2|[S1][4.2] ClearanceOverlay component W-CT-01|enterprise,sprint-1,openspec,token-audit,component-lcars,W-CT-01,story-points|component-lcars|W-CT-01|none|Guest actuation denial overlay|enterprise/runtime/lcars-web/src/components/ClearanceOverlay.tsx
4.3|[S1][4.3] BattleStationsConfirm gate UI W-CT-03|enterprise,sprint-1,openspec,token-audit,component-lcars,W-CT-03,story-points|component-lcars|W-CT-03|none|Non-skippable confirm gate|enterprise/runtime/lcars-web/src/components/BattleStationsConfirm.tsx
4.4|[S1][4.4] chrome.session clearance label W-CT-02|enterprise,sprint-1,openspec,token-audit,component-lcars,W-CT-02,story-points|component-lcars|W-CT-02|none|Session clearance tier in chrome|enterprise/runtime/lcars-web/src/components/ChromeSessionLabel.tsx
4.5|[S1][4.5] TanStack Query and event stream hook|enterprise,sprint-1,openspec,token-audit,component-lcars,story-points|component-lcars|none|none|useStations + useEventStream wired in App|enterprise/runtime/lcars-web/src/hooks/
5.1|[S1][5.1] Contract test W-CT-03 Battle Stations gate|enterprise,sprint-1,openspec,token-audit,component-engine,W-CT-03,story-points|component-engine|W-CT-03|none|Actuation without confirm fails; bypass env ignored|enterprise/runtime/engine/test/w-ct-03.test.ts
5.2|[S1][5.2] Contract test W-CT-01 Guest denial path|enterprise,sprint-1,openspec,token-audit,component-engine,W-CT-01,story-points|component-engine|W-CT-01|none|Guest clearance returns Denied on protected routes|enterprise/runtime/engine/test/w-ct-01.test.ts
5.3|[S1][5.3] Contract test W-CT-02 contrast token floor|enterprise,sprint-1,openspec,token-audit,component-engine,W-CT-02,story-points|component-engine|W-CT-02|none|Okuda tokens meet WCAG floor|enterprise/runtime/engine/test/w-ct-02.test.ts
5.4|[S1][5.4] openspec validate --all --strict passes|enterprise,sprint-1,openspec,token-audit,component-openspec,story-points|component-openspec|none|none|Strict validation green from enterprise/|enterprise/openspec/
5.5|[S1][5.5] Document dev startup in runtime README|enterprise,sprint-1,openspec,token-audit,component-infra,story-points|component-infra|none|none|npm install, dev:engine, dev:lcars documented|enterprise/runtime/README.md
6.1|[S1][6.1] Review spec deltas match implementation|enterprise,sprint-1,openspec,token-audit,component-openspec,story-points|component-openspec|none|none|Delta specs align with runtime code|enterprise/openspec/changes/sprint-1-runtime-foundation/specs/
6.2|[S1][6.2] Archive OpenSpec change after PR merge|enterprise,sprint-1,openspec,token-audit,component-openspec,story-points|component-openspec|none|none|Run /opsx:archive sprint-1-runtime-foundation post-merge|enterprise/openspec/changes/
TASKS

for line in "${lines[@]}"; do
  IFS='|' read -r tid title labels component wct gate acceptance files <<< "$line"
  body="$(issue_body "$tid" "$acceptance" "$files" "$wct" "$gate" "$component")"
  url=$(create_issue "$title" "$labels" "$body")
  num="${url##*/}"
  CREATED+=("$num")
  echo "Created #$num — $tid"
done

echo "CHILD_ISSUES=${CREATED[*]}"
