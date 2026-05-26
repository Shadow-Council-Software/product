from __future__ import annotations

import glob
from pathlib import Path

from clipforge.lib.config import datasets_by_ids
from clipforge.lib.state import ClipForgeState


def _expand_paths(patterns: list[str], base: Path) -> list[str]:
    found: list[str] = []
    for pattern in patterns:
        p = Path(pattern)
        if not p.is_absolute():
            p = base / pattern
        found.extend(str(Path(x).resolve()) for x in glob.glob(str(p), recursive=True))
    return sorted(set(found))


def ingest_node(state: ClipForgeState) -> ClipForgeState:
    """Load media from dataset local_paths (human editor 'bin' ingestion)."""
    base = Path(__file__).resolve().parent.parent
    dataset_ids = state.get("dataset_ids") or []
    datasets = datasets_by_ids(dataset_ids)

    paths: list[str] = list(state.get("local_media_paths") or [])
    for ds in datasets:
        paths.extend(_expand_paths(ds.get("local_paths") or [], base))

    paths = sorted(set(paths))
    errors = list(state.get("errors") or [])
    if not paths and not state.get("dry_run"):
        errors.append(
            "ingest_agent: no local media. Add files under data/raw/inbox/ or "
            "configure dataset local_paths."
        )

    return {
        **state,
        "ingested_paths": paths,
        "local_media_paths": paths,
    }
