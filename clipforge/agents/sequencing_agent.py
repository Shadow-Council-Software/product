from __future__ import annotations

from clipforge.lib.state import ClipForgeState


def _dedupe_segments(segments: list[dict], window_sec: float = 5.0) -> list[dict]:
    seen: list[tuple[str, float]] = []
    out: list[dict] = []
    for s in sorted(segments, key=lambda x: x.get("segment_score", 0), reverse=True):
        key = (s.get("source", ""), round(float(s.get("start_sec", 0)) / window_sec))
        if key in seen:
            continue
        seen.append(key)
        out.append(s)
    return out


def sequencing_node(state: ClipForgeState) -> ClipForgeState:
    """
    Build timeline_plan — simulates editor assembly order.

    narrative_arc workflow preserves source order when segment_order is set (Phase 2).
    """
    steering = state.get("steering") or {}
    directives = steering.get("directives", {})
    edit_style = steering.get("edit_style", "compilation")
    target_minutes = float(
        state.get("target_duration_minutes")
        or directives.get("target_minutes", 30)
    )
    dur = directives.get("segment_duration_sec", [3, 15])
    clip_max = int(dur[1])

    segments = list(state.get("segment_candidates") or [])
    if edit_style == "narrative":
        ordered = sorted(segments, key=lambda s: (s.get("source", ""), s.get("start_sec", 0)))
    else:
        ordered = _dedupe_segments(segments)

    plan: list[dict] = []
    total_sec = 0.0
    target_sec = target_minutes * 60

    for seg in ordered:
        duration = float(seg.get("duration_sec") or clip_max)
        if total_sec + duration > target_sec:
            break
        plan.append({**seg, "transition": directives.get("transitions", "cut")})
        total_sec += duration

    return {**state, "timeline_plan": plan}
