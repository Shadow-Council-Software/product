from __future__ import annotations

from pathlib import Path
from typing import Any

from clipforge.sources.adapters import ADAPTERS
from clipforge.sources.base import SourceAdapter
from clipforge.sources.types import FetchResult, SourceRef

_REGISTRY: dict[str, SourceAdapter] = {a.type_id: a for a in ADAPTERS}
# http_download only fetches; discovery types map here
_FETCH_TYPES = {"http_download", "ftp", "local_folder"}


def get_adapter(type_id: str) -> SourceAdapter | None:
    return _REGISTRY.get(type_id)


def register_adapter(adapter: SourceAdapter) -> None:
    _REGISTRY[adapter.type_id] = adapter


def discover_media(
    source_configs: list[dict[str, Any]],
    context: dict[str, Any],
) -> tuple[list[SourceRef], list[str]]:
    """
    Run discover() on each source config block.

    Returns (refs, warnings).
    """
    refs: list[SourceRef] = []
    warnings: list[str] = list(context.get("search_warnings") or [])

    for cfg in source_configs:
        type_id = cfg.get("type") or cfg.get("adapter")
        if not type_id:
            warnings.append("sources: config missing 'type'")
            continue
        adapter = get_adapter(type_id)
        if not adapter:
            warnings.append(f"sources: unknown adapter type '{type_id}'")
            continue
        found = adapter.discover(cfg, context)
        refs.extend(found)

    # Dedupe by uri
    seen: set[str] = set()
    unique: list[SourceRef] = []
    for r in refs:
        if r.uri in seen:
            continue
        seen.add(r.uri)
        unique.append(r)
    return unique, warnings


def fetch_media(
    refs: list[SourceRef],
    dest_dir: Path,
    context: dict[str, Any],
) -> tuple[list[str], list[str]]:
    """
    Fetch each ref that has a fetching adapter. Local paths may copy or pass-through.

    Returns (local_paths, errors).
    """
    paths: list[str] = []
    errors: list[str] = []

    for ref in refs:
        adapter = get_adapter(ref.type)
        if not adapter or not adapter.supports_fetch():
            if ref.type == "local_folder":
                paths.append(ref.uri)
            continue
        try:
            result = adapter.fetch(ref, dest_dir, context)
            if result:
                paths.append(result.local_path)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"fetch[{ref.type}]: {ref.uri[:80]}: {exc}")

    return sorted(set(paths)), errors


def collect_source_configs(
    datasets: list[dict[str, Any]],
    steering: dict[str, Any],
    settings_sources: list[dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    """Merge dataset sources[], steering.sources, and legacy fields."""
    configs: list[dict[str, Any]] = []
    configs.extend(settings_sources or [])

    for ds in datasets:
        if ds.get("sources"):
            configs.extend(ds["sources"])
        else:
            # Legacy dataset shape
            if ds.get("local_paths"):
                configs.append(
                    {
                        "type": "local_folder",
                        "paths": ds["local_paths"],
                        "after_date": ds.get("after_date"),
                    }
                )
            if ds.get("seed_urls"):
                configs.append({"type": "url_list", "urls": ds["seed_urls"]})
            if ds.get("discovery_queries"):
                configs.append(
                    {
                        "type": "search",
                        "provider": ds.get("search_provider", "static"),
                        "queries": ds["discovery_queries"],
                        "after_date": ds.get("after_date"),
                        "max_results": ds.get("max_results", 10),
                    }
                )
            if ds.get("manifest"):
                configs.append(
                    {
                        "type": "manifest",
                        "manifest": ds["manifest"],
                        "after_date": ds.get("after_date"),
                    }
                )
            if ds.get("ftp"):
                ftp = ds["ftp"]
                if isinstance(ftp, dict):
                    configs.append({"type": "ftp", **ftp})

    src = steering.get("sources") or {}
    if src.get("items"):
        configs.extend(src["items"])
    if src.get("urls"):
        configs.append({"type": "url_list", "urls": src["urls"]})
    if src.get("search"):
        s = src["search"]
        configs.append(
            {
                "type": "search",
                "provider": s.get("provider", "static"),
                "queries": s.get("queries", []),
                "after_date": s.get("after_date"),
                "max_results": s.get("max_results", 10),
            }
        )

    return configs
