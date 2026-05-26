from __future__ import annotations

from enum import StrEnum


class TriggerMode(StrEnum):
    """How a job acquires source media before analysis."""

    MANUAL_LOCAL = "manual_local"  # dataset local paths only
    MANUAL_URLS = "manual_urls"  # explicit URLs (CLI or steering)
    DISCOVERY = "discovery"  # automated search / feed polling
    HYBRID = "hybrid"  # local dataset + discovery
    SCHEDULED = "scheduled"  # cron-like; wraps other modes


def parse_trigger(value: str) -> TriggerMode:
    try:
        return TriggerMode(value)
    except ValueError as exc:
        valid = ", ".join(m.value for m in TriggerMode)
        raise ValueError(f"Unknown trigger '{value}'. Expected one of: {valid}") from exc
