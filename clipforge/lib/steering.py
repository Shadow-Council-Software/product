from __future__ import annotations

from typing import Any

from clipforge.lib.config import load_settings, workflow_by_id


def merge_steering(
    *,
    workflow_id: str,
    steering: dict[str, Any] | None = None,
    cli_overrides: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Combine workflow defaults, job steering file, and CLI flags.

    Editor directives (natural language + structured knobs) live under steering['directives'].
    """
    workflow = workflow_by_id(workflow_id) or {}
    settings = load_settings()
    pipeline = settings.get("pipeline", {})
    wf_defaults = workflow.get("defaults", {})

    base: dict[str, Any] = {
        "workflow_id": workflow_id,
        "edit_style": workflow.get("edit_style", "compilation"),
        "analysis_profile": workflow.get("analysis_profile", "intensity_peaks"),
        "directives": {
            "natural_language": "",
            "target_minutes": pipeline.get("target_minutes", 30),
            "min_segment_score": pipeline.get("min_segment_score", 0.75),
            "segment_duration_sec": [
                pipeline.get("clip_duration_sec_min", 3),
                pipeline.get("clip_duration_sec_max", 15),
            ],
            "pacing": "tight",
            "transitions": wf_defaults.get("transitions", "cut"),
            "ranking": {
                "visual_weight": 0.5,
                "audio_weight": 0.3,
                "metadata_weight": 0.2,
            },
        },
        "discovery": {
            "enabled": False,
            "queries": [],
            "poll_interval_minutes": 60,
        },
    }

    if steering:
        _deep_merge(base, steering)
    if cli_overrides:
        _deep_merge(base, cli_overrides)

    # Workflow defaults under directives win only when not set by user
    for key, value in wf_defaults.items():
        base["directives"].setdefault(key, value)

    return base


def _deep_merge(dst: dict, src: dict) -> None:
    for key, value in src.items():
        if key in dst and isinstance(dst[key], dict) and isinstance(value, dict):
            _deep_merge(dst[key], value)
        else:
            dst[key] = value
