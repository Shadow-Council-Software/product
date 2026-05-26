from __future__ import annotations

from clipforge.lib.acquisition import build_acquisition_context
from clipforge.lib.config import datasets_by_ids, load_settings
from clipforge.lib.state import ClipForgeState
from clipforge.sources.registry import collect_source_configs, discover_media


def discovery_node(state: ClipForgeState) -> ClipForgeState:
    """
    Discover remote and search-backed sources via pluggable adapters.

    See sources/registry.py and config/sources.yaml.
    """
    settings = load_settings()
    steering = state.get("steering") or {}
    discovery_cfg = steering.get("discovery", {})
    datasets = datasets_by_ids(state.get("dataset_ids") or [])

    configs = collect_source_configs(datasets, steering)
    remote_configs = [
        c
        for c in configs
        if c.get("type") in ("url_list", "search", "ftp")
        or (c.get("type") == "search" and discovery_cfg.get("enabled"))
    ]
    # Always include url_list and explicit search blocks from steering
    if discovery_cfg.get("enabled"):
        remote_configs.append(
            {
                "type": "search",
                "provider": discovery_cfg.get("provider", "auto"),
                "queries": discovery_cfg.get("queries", []),
                "after_date": discovery_cfg.get("after_date"),
                "max_results": discovery_cfg.get("max_results", 10),
                "permissive": discovery_cfg.get("permissive", True),
            }
        )

    context = build_acquisition_context(state)
    refs, warnings = discover_media(remote_configs, context)

    source_refs = list(state.get("source_refs") or [])
    seen = {r.get("uri") for r in source_refs if isinstance(r, dict)}
    for r in refs:
        d = r.to_dict()
        if d["uri"] not in seen:
            source_refs.append(d)
            seen.add(d["uri"])

    urls = list(state.get("source_urls") or [])
    for r in refs:
        if r.type == "http_download":
            urls.append(r.uri)

    errors = list(state.get("errors") or [])
    for w in warnings:
        errors.append(f"discovery_agent: {w}")

    trigger = state.get("trigger_mode", "")
    needs_urls = trigger in ("discovery", "hybrid", "manual_urls")
    if needs_urls and not urls and not state.get("dry_run"):
        errors.append(
            "discovery_agent: no URLs discovered. Configure sources.search, "
            "url_list, seed_urls, or install duckduckgo-search for provider duckduckgo."
        )

    retries = int(state.get("discovery_retries") or 0)
    max_retries = int(
        discovery_cfg.get("max_retries")
        or settings.get("pipeline", {}).get("max_discovery_retries", 3)
    )

    return {
        **state,
        "source_refs": source_refs,
        "source_urls": list(dict.fromkeys(urls)),
        "discovery_retries": retries,
        "errors": errors,
        "_discovery_max_retries": max_retries,
    }
