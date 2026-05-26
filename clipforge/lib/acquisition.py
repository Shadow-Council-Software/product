from __future__ import annotations

from pathlib import Path
from typing import Any

from clipforge.lib.config import datasets_by_ids, load_settings, load_yaml
from clipforge.sources.registry import collect_source_configs, discover_media, fetch_media

ROOT = Path(__file__).resolve().parent.parent
CONFIG_DIR = ROOT / "config"


def load_sources_defaults() -> list[dict[str, Any]]:
    path = CONFIG_DIR / "sources.yaml"
    if not path.exists():
        return []
    data = load_yaml(path)
    return list(data.get("defaults", []))


def build_acquisition_context(state: dict[str, Any]) -> dict[str, Any]:
    settings = load_settings()
    steering = state.get("steering") or {}
    pipeline = settings.get("pipeline", {})
    sources_cfg = settings.get("sources", {})

    return {
        "clipforge_root": str(ROOT),
        "job_id": state.get("job_id"),
        "dry_run": state.get("dry_run"),
        "download_min_height": pipeline.get("download_min_height", 720),
        "yt_dlp_cookies": sources_cfg.get("yt_dlp_cookies"),
        "steering_urls": (steering.get("sources") or {}).get("urls") or [],
        "ftp_user": sources_cfg.get("ftp_user"),
        "ftp_password": sources_cfg.get("ftp_password"),
        "ftp_passive": sources_cfg.get("ftp_passive", True),
    }


def discover_for_job(state: dict[str, Any]) -> dict[str, Any]:
    steering = state.get("steering") or {}
    datasets = datasets_by_ids(state.get("dataset_ids") or [])
    configs = collect_source_configs(
        datasets, steering, load_sources_defaults()
    )
    context = build_acquisition_context(state)
    refs, warnings = discover_media(configs, context)

    http_urls = [r.uri for r in refs if r.type == "http_download"]
    local_refs = [r for r in refs if r.type == "local_folder"]

    errors = list(state.get("errors") or [])
    for w in warnings:
        errors.append(f"discovery: {w}")

    return {
        **state,
        "source_refs": [r.to_dict() for r in refs],
        "source_urls": list(dict.fromkeys((state.get("source_urls") or []) + http_urls)),
        "local_media_paths": [r.uri for r in local_refs],
        "errors": errors,
    }


def fetch_for_job(state: dict[str, Any]) -> dict[str, Any]:
    if state.get("dry_run"):
        return state

    settings = load_settings()
    raw_root = Path(settings["paths"]["raw"])
    if not raw_root.is_absolute():
        raw_root = ROOT / raw_root
    job_slug = (state.get("job_id") or "job").replace("/", "_")
    dest_dir = raw_root / "downloads" / job_slug

    from clipforge.sources.types import SourceRef

    refs: list[SourceRef] = []
    for r in state.get("source_refs") or []:
        refs.append(
            SourceRef(
                type=r["type"],
                uri=r["uri"],
                label=r.get("label", ""),
                metadata=r.get("metadata") or {},
            )
        )
    # Rebuild refs from source_urls if only URLs present (legacy)
    existing_uris = {r.uri for r in refs}
    for url in state.get("source_urls") or []:
        if url not in existing_uris:
            refs.append(SourceRef(type="http_download", uri=url, label=url[:80]))

    context = build_acquisition_context(state)
    paths, errors = fetch_media(refs, dest_dir, context)

    # Include already-local paths from ingest
    ingested = list(state.get("ingested_paths") or [])
    ingested.extend(paths)
    all_errors = list(state.get("errors") or []) + errors

    return {**state, "ingested_paths": sorted(set(ingested)), "errors": all_errors}
