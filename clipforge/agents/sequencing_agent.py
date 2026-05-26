from __future__ import annotations

from clipforge.lib.config import load_settings
from clipforge.lib.state import ClipForgeState


def _dedupe_by_window(clips: list[dict], window_sec: float = 5.0) -> list[dict]:
    seen: list[tuple[str, float]] = []
    out: list[dict] = []
    for c in sorted(clips, key=lambda x: x.get("dramatic_score", 0), reverse=True):
        key = (c.get("source", ""), round(float(c.get("start_sec", 0)) / window_sec))
        if key in seen:
            continue
        seen.append(key)
        out.append(c)
    return out


def sequencing_node(state: ClipForgeState) -> ClipForgeState:
    """Sort by dramatic intensity, dedupe, build non-stop master sequence."""
    settings = load_settings()
    pipeline = settings.get("pipeline", {})
    target_minutes = float(state.get("target_minutes") or pipeline.get("target_minutes", 30))
    clip_max = int(pipeline.get("clip_duration_sec_max", 12))

    clips = _dedupe_by_window(list(state.get("qualified_clips") or []))
    sequence: list[dict] = []
    total_sec = 0.0
    target_sec = target_minutes * 60

    for clip in clips:
        duration = float(clip.get("duration_sec") or clip_max)
        if total_sec + duration > target_sec:
            break
        sequence.append(clip)
        total_sec += duration

    return {**state, "master_sequence": sequence}
