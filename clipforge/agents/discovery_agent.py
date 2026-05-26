from __future__ import annotations

from clipforge.lib.config import datasets_by_ids, load_settings
from clipforge.lib.state import ClipForgeState


def discovery_node(state: ClipForgeState) -> ClipForgeState:
    """
    Collect candidate source URLs for downstream download.

    Phase 1: seed_urls + discovery_queries from datasets + steering.sources.urls.
    Phase 2: LangChain tools for web/search feeds; continuous mode via `clipforge watch`.
    """
    settings = load_settings()
    steering = state.get("steering") or {}
    discovery_cfg = steering.get("discovery", {})

    urls: list[str] = list(state.get("source_urls") or [])
    urls.extend(steering.get("sources", {}).get("urls") or [])

    for ds in datasets_by_ids(state.get("dataset_ids") or []):
        urls.extend(ds.get("seed_urls") or [])
        # discovery_queries are search strings — resolved by future search tools
        for query in ds.get("discovery_queries") or []:
            if query.startswith("http"):
                urls.append(query)

    if discovery_cfg.get("enabled"):
        for query in discovery_cfg.get("queries") or []:
            if query.startswith("http"):
                urls.append(query)

    errors = list(state.get("errors") or [])
    trigger = state.get("trigger_mode", "")
    needs_urls = trigger in ("discovery", "hybrid", "manual_urls")
    if needs_urls and not urls and not state.get("dry_run"):
        errors.append(
            "discovery_agent: no URLs. Set steering.sources.urls, dataset seed_urls, "
            "or enable discovery with resolvable queries (Phase 2)."
        )

    retries = int(state.get("discovery_retries") or 0)
    max_retries = int(
        discovery_cfg.get("max_retries")
        or settings.get("pipeline", {}).get("max_discovery_retries", 3)
    )

    return {
        **state,
        "source_urls": list(dict.fromkeys(urls)),
        "discovery_retries": retries,
        "errors": errors,
        "_discovery_max_retries": max_retries,
    }
