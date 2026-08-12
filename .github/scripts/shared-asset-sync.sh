#!/usr/bin/env bash
# Shared-asset sync — merges main into every branch registered in
# .github/product-branches.txt via sync/main-into-<slug> PRs.
#
# Behavior per registered branch:
#   - branch missing on origin  -> warning, skipped (registry may lead reality)
#   - already contains main     -> skipped
#   - merge applies cleanly     -> sync branch force-pushed, PR opened
#                                  (or existing open PR's branch updated)
#   - merge conflicts           -> merge aborted, issue opened asking for a
#                                  manual sync (deduped by title)
#
# Known limitation: PRs created with the default GITHUB_TOKEN do not trigger
# other workflows (GitHub policy). Product-branch CI runs when the sync PR
# merges, or if a maintainer pushes anything to the sync branch.
set -euo pipefail

REGISTRY=".github/product-branches.txt"

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git fetch --quiet origin

main_sha=$(git rev-parse origin/main)
failures=0

while IFS= read -r branch; do
  case "$branch" in ''|\#*) continue ;; esac

  if ! git rev-parse -q --verify "origin/$branch" >/dev/null; then
    echo "::warning::registered branch '$branch' not found on origin; skipping"
    continue
  fi

  if git merge-base --is-ancestor "$main_sha" "origin/$branch"; then
    echo "$branch: already contains main; skipping"
    continue
  fi

  slug=$(printf '%s' "$branch" | tr '/' '-')
  sync_branch="sync/main-into-$slug"

  git checkout -q -B "$sync_branch" "origin/$branch"
  if git merge --no-edit -m "chore(sync): merge main shared assets into $branch" "$main_sha"; then
    git push -f origin "$sync_branch"
    open_prs=$(gh pr list --head "$sync_branch" --base "$branch" --state open --json number --jq length)
    if [ "$open_prs" = "0" ]; then
      gh pr create --base "$branch" --head "$sync_branch" \
        --title "Sync shared assets from main into $branch" \
        --body "Automated shared-asset sync (\`.github/workflows/shared-asset-sync.yml\`): merges main (\`$(git rev-parse --short "$main_sha")\`) into \`$branch\` so shared CI, skills, method, and governance files stay current. Diff should contain only main-side content; review and merge."
    else
      echo "$branch: open sync PR already exists; branch updated in place"
    fi
  else
    git merge --abort || true
    echo "::error::merge of main into $branch has conflicts; manual sync required"
    failures=$((failures + 1))
    title="Manual shared-asset sync needed: main -> $branch"
    open_issues=$(gh issue list --state open --search "in:title \"$title\"" --json number --jq length)
    if [ "$open_issues" = "0" ]; then
      gh issue create --title "$title" \
        --body "Automated sync could not merge main into \`$branch\` (conflicts). Resolve manually: \`git checkout -b $sync_branch origin/$branch && git merge origin/main\`, fix conflicts (main is canonical for shared files), then open a PR to \`$branch\`."
    fi
  fi
  git checkout -q --detach "$main_sha"
done < "$REGISTRY"

exit "$([ "$failures" -eq 0 ] && echo 0 || echo 1)"
