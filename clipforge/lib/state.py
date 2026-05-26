from __future__ import annotations

from typing import Annotated, Any, TypedDict

from langgraph.graph.message import add_messages


class ClipForgeState(TypedDict, total=False):
    """
    LangGraph state for editor-simulation jobs.

    Content domain and edit style are entirely config-driven (workflow + steering).
    """

    messages: Annotated[list, add_messages]
    job_id: str
    workflow_id: str
    dataset_ids: list[str]
    steering: dict[str, Any]
    trigger_mode: str  # manual_local | manual_urls | discovery | hybrid | scheduled

    # Acquisition
    source_urls: list[str]
    local_media_paths: list[str]
    ingested_paths: list[str]
    discovery_retries: int

    # Analysis + edit plan
    segment_candidates: list[dict]
    timeline_plan: list[dict]
    min_segment_score: float
    target_duration_minutes: float

    # Output
    output_path: str
    report: str
    dry_run: bool
    errors: list[str]

    # Internal routing hints (not persisted)
    _discovery_max_retries: int
