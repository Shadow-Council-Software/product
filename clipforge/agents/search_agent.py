from __future__ import annotations

from clipforge.lib.config import load_performers, load_settings
from clipforge.lib.state import ClipForgeState


def search_node(state: ClipForgeState) -> ClipForgeState:
    """
    Collect candidate video URLs for configured performers.

    Phase 1: uses seed_urls from performers.yaml. LLM/web search integration
    is a Phase 2 hook — wire LangChain tools here when ready.
    """
    settings = load_settings()
    performers_cfg = load_performers()
    performer_ids = state.get("performer_ids") or [
        p["id"] for p in performers_cfg.get("performers", [])
    ]

    urls: list[str] = list(state.get("search_urls") or [])
    for pid in performer_ids:
        for p in performers_cfg.get("performers", []):
            if p.get("id") != pid:
                continue
            urls.extend(p.get("seed_urls") or [])

    errors = list(state.get("errors") or [])
    if not urls and not state.get("dry_run"):
        errors.append(
            "search_agent: no URLs found. Add seed_urls in config/performers.yaml "
            "or pass URLs via CLI (--url)."
        )

    retries = int(state.get("search_retries") or 0)
    max_retries = int(settings.get("pipeline", {}).get("max_search_retries", 3))

    return {
        **state,
        "search_urls": list(dict.fromkeys(urls)),
        "search_retries": retries,
        "errors": errors,
        "_search_max_retries": max_retries,
    }
