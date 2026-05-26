from __future__ import annotations

from clipforge.lib.acquisition import build_acquisition_context
from clipforge.lib.config import datasets_by_ids
from clipforge.lib.state import ClipForgeState
from clipforge.sources.registry import collect_source_configs, discover_media
from clipforge.sources.types import SourceRef


def ingest_node(state: ClipForgeState) -> ClipForgeState:
    """Ingest local-folder and manifest path entries (no network fetch)."""
    steering = state.get("steering") or {}
    datasets = datasets_by_ids(state.get("dataset_ids") or [])
    configs = collect_source_configs(datasets, steering)
    local_configs = [
        c
        for c in configs
        if c.get("type") in ("local_folder", "manifest")
    ]

    context = build_acquisition_context(state)
    refs, warnings = discover_media(local_configs, context)

    paths: list[str] = []
    source_refs: list[dict] = list(state.get("source_refs") or [])
    for r in refs:
        if r.type == "local_folder":
            paths.append(r.uri)
        source_refs.append(r.to_dict())

    errors = list(state.get("errors") or [])
    for w in warnings:
        errors.append(f"ingest_agent: {w}")
    if not paths and not state.get("dry_run") and local_configs:
        errors.append(
            "ingest_agent: no local media. Check dataset paths or after_date filter."
        )

    return {
        **state,
        "ingested_paths": sorted(set(paths)),
        "local_media_paths": paths,
        "source_refs": source_refs,
        "errors": errors,
    }
