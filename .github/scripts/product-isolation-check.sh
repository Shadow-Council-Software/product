#!/usr/bin/env bash
# Product isolation guard — enforces the PRODUCTS.md one-product-per-branch rule.
#
# Usage: product-isolation-check.sh <base-ref> [head-ref]
#
# Fails when the diff base..head touches more than one registered product
# folder, or introduces an unregistered product-like top-level folder
# (a directory containing index.md). Shared folders are always allowed.
#
# Rationale: commit d4fdfb8 (May 2026) mixed enterprise/ work into the
# clipforge product branch; the Matterport ingest pipeline was stranded there
# for months and had to be recovered by archaeology (PR #57). This guard makes
# that class of mistake fail fast in CI.
set -euo pipefail

REGISTRY=".github/product-dirs.txt"
# Top-level folders shared across all branches (never product-specific).
# _bmad-output is branch-scoped BMad tracking, legitimately edited alongside
# the branch's own product folder.
SHARED_DIRS=".agents .github _bmad _bmad-output docs"

BASE_REF="${1:?usage: product-isolation-check.sh <base-ref> [head-ref]}"
HEAD_REF="${2:-HEAD}"

MERGE_BASE=$(git merge-base "$BASE_REF" "$HEAD_REF")
CHANGED=$(git diff --name-only "$MERGE_BASE" "$HEAD_REF")

if [ -z "$CHANGED" ]; then
  echo "No changes to check."
  exit 0
fi

# shellcheck disable=SC2207
PRODUCTS=($(grep -vE '^[[:space:]]*(#|$)' "$REGISTRY"))

touched=()
for p in "${PRODUCTS[@]}"; do
  if printf '%s\n' "$CHANGED" | grep -q "^${p}/"; then
    touched+=("$p")
  fi
done

status=0
if [ "${#touched[@]}" -gt 1 ]; then
  echo "::error::This PR touches multiple product folders: ${touched[*]}"
  echo "PRODUCTS.md rule: one product per branch/PR. Split the changes into"
  echo "one PR per product, each targeting that product's branch."
  status=1
fi

# Future-proofing: a new top-level directory that looks like a product
# (contains index.md) must be registered before it can merge; anything else
# unrecognized gets a warning so shared tooling additions are not blocked.
top_dirs=$(printf '%s\n' "$CHANGED" | awk -F/ 'NF>1{print $1}' | sort -u)
for d in $top_dirs; do
  case " $SHARED_DIRS " in *" $d "*) continue ;; esac
  registered=0
  for p in "${PRODUCTS[@]}"; do
    [ "$d" = "$p" ] && registered=1 && break
  done
  [ "$registered" -eq 1 ] && continue
  if git cat-file -e "$HEAD_REF:$d/index.md" 2>/dev/null; then
    echo "::error::'$d/' looks like a product folder (contains index.md) but is not registered in $REGISTRY"
    echo "Register it: add '$d' to $REGISTRY (see PRODUCTS.md, 'Adding a new product')."
    status=1
  else
    echo "::warning::top-level folder '$d/' is neither shared nor a registered product; review its placement."
  fi
done

if [ "$status" -eq 0 ]; then
  echo "Product isolation OK (product folders touched: ${touched[*]:-none})."
fi
exit "$status"
