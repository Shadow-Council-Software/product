from __future__ import annotations

from typing import Any


def trim_segment_to_peak_window(
    seg: dict[str, Any],
    *,
    video_duration: float,
    pre_roll_max_sec: float = 2.0,
    post_roll_max_sec: float = 10.0,
    clip_min_sec: float = 2.0,
    clip_max_sec: float = 12.0,
) -> dict[str, Any]:
    """
    Center segment on peak_sec with max pre/post roll (operator tightening rules).
    """
    peak = float(seg.get("peak_sec", (seg["start_sec"] + seg["end_sec"]) / 2))
    start = max(0.0, peak - pre_roll_max_sec)
    end = min(video_duration, peak + post_roll_max_sec)
    duration = end - start

    if duration < clip_min_sec:
        pad = (clip_min_sec - duration) / 2
        start = max(0.0, start - pad)
        end = min(video_duration, end + pad)
        duration = end - start
    if duration > clip_max_sec:
        half = clip_max_sec / 2
        start = max(0.0, peak - half)
        end = min(video_duration, start + clip_max_sec)
        duration = end - start

    out = dict(seg)
    out["start_sec"] = start
    out["end_sec"] = end
    out["duration_sec"] = duration
    out["peak_sec"] = peak
    return out
