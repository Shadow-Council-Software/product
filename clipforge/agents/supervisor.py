from __future__ import annotations

import uuid
from pathlib import Path
from typing import Any

from clipforge.lib.config import load_steering_file
from clipforge.lib.steering import merge_steering
from clipforge.lib.state import ClipForgeState
from clipforge.triggers import TriggerMode, parse_trigger


def build_initial_state(
    *,
    workflow_id: str,
    dataset_ids: list[str],
    trigger: str,
    steering_path: str | None = None,
    steering_overrides: dict[str, Any] | None = None,
    source_urls: list[str] | None = None,
    dry_run: bool = False,
) -> ClipForgeState:
    """Construct job state from workflow + steering file + CLI."""
    file_steering: dict[str, Any] = {}
    if steering_path:
        raw = load_steering_file(Path(steering_path))
        file_steering = {
            "directives": raw.get("directives", {}),
            "discovery": raw.get("discovery", {}),
            "sources": raw.get("sources", {}),
        }
        workflow_id = raw.get("job", {}).get("workflow_id", workflow_id)
        dataset_ids = raw.get("job", {}).get("dataset_ids", dataset_ids)
        trigger = raw.get("job", {}).get("trigger", trigger)

    steering = merge_steering(
        workflow_id=workflow_id,
        steering=file_steering,
        cli_overrides=steering_overrides,
    )
    mode = parse_trigger(trigger)
    directives = steering.get("directives", {})

    return {
        "job_id": str(uuid.uuid4())[:8],
        "workflow_id": workflow_id,
        "dataset_ids": dataset_ids,
        "steering": steering,
        "trigger_mode": mode.value,
        "source_urls": list(source_urls or steering.get("sources", {}).get("urls") or []),
        "min_segment_score": float(directives.get("min_segment_score", 0.75)),
        "target_duration_minutes": float(directives.get("target_minutes", 30)),
        "discovery_retries": 0,
        "source_refs": [],
        "segment_candidates": [],
        "timeline_plan": [],
        "ingested_paths": [],
        "dry_run": dry_run,
        "errors": [],
    }
