from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class UiPreset:
    id: str
    label: str
    instructions: str
    workflow: str = "compilation_dense"
    trigger: str = "manual_local"
    target_minutes: float = 5.0
    min_score: float = 0.8
    pre_roll: float = 2.0
    post_roll: float = 10.0
    discovery_enabled: bool = False
    discovery_provider: str = "auto"
    discovery_query: str = ""


# Content-agnostic edit presets — operators supply their own search queries.
PRESETS: list[UiPreset] = [
    UiPreset(
        id="dramatic_reaction_tight",
        label="Dramatic reaction (tight peaks)",
        instructions=(
            "Tight compilation focused on the most dramatic facial and audio reactions. "
            "Maximum 2 seconds before each peak moment, maximum 10 seconds after. "
            "No dead air; highest intensity segments only. Prefer visible face in frame."
        ),
        min_score=0.82,
        pre_roll=2.0,
        post_roll=10.0,
        target_minutes=5.0,
    ),
    UiPreset(
        id="highlight_reel",
        label="Highlight reel (relaxed)",
        instructions="Highlight reel of strong moments with brief breathing room between clips.",
        workflow="highlight_reel",
        min_score=0.7,
        pre_roll=3.0,
        post_roll=15.0,
        target_minutes=10.0,
    ),
    UiPreset(
        id="local_inbox_only",
        label="Local inbox only (no search)",
        instructions="Compile from uploaded inbox footage only.",
        discovery_enabled=False,
    ),
]


def preset_by_id(preset_id: str) -> UiPreset | None:
    for p in PRESETS:
        if p.id == preset_id:
            return p
    return None


def preset_choices() -> list[tuple[str, str]]:
    return [(p.label, p.id) for p in PRESETS]
