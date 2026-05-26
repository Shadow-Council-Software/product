from __future__ import annotations

from typing import Annotated, TypedDict

from langgraph.graph.message import add_messages


class ClipForgeState(TypedDict, total=False):
    """LangGraph state for the throatpie compilation POC."""

    messages: Annotated[list, add_messages]
    performer_ids: list[str]
    target_minutes: float
    min_dramatic_score: float
    search_urls: list[str]
    downloaded_paths: list[str]
    qualified_clips: list[dict]
    master_sequence: list[dict]
    output_path: str
    search_retries: int
    report: str
    dry_run: bool
    errors: list[str]
