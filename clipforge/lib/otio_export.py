"""Export a ClipForge timeline_plan as an OpenTimelineIO (.otio) file.

CF-FR-46: the .otio artifact is the NLE-agnostic handoff boundary. It references
the ORIGINAL source media with per-segment in/out ranges (the true edit), not
the extracted clip files. Any OTIO-aware editor can consume it — including the
free edition of DaVinci Resolve via File > Import Timeline, which does not use
the Studio-gated scripting bridge.

Scope kept to OTIO's reliably-interchanged subset: one video track, cuts,
clip timing, and metadata. Transition intents other than "cut" are preserved in
clip metadata (clipforge.transition) but are NOT materialized as OTIO
transition objects, because NLE import support for those is inconsistent.

Caveats:
- Relative ``source`` paths are resolved against the process CWD; the pipeline
  always supplies absolute paths.
- If the source media cannot be probed (missing file, unreadable container),
  export proceeds with ``default_fps`` and a warning on stderr; the resulting
  ``file://`` URI may not relink in the NLE.
- ``start_sec`` and ``duration_sec`` are each rounded to the nearest frame
  independently, so a clip's implied end frame can differ from
  ``round(end_sec * fps)`` by one frame.
"""
from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

_DEFAULT_FPS = 30.0


def _probe_video(path: Path) -> tuple[float, float] | None:
    """Return (fps, duration_sec) via OpenCV, or None if unreadable."""
    try:
        import cv2
    except ImportError:
        return None
    cap = cv2.VideoCapture(str(path))
    try:
        if not cap.isOpened():
            return None
        fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
        frames = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0.0
        # Some streams/containers report 0 or -1 frames; treat as probe failure
        # rather than writing a degenerate available_range.
        if fps <= 0 or frames <= 0:
            return None
        return float(fps), float(frames / fps)
    finally:
        cap.release()


def export_timeline_plan(
    plan: list[dict[str, Any]],
    out_path: Path,
    *,
    timeline_name: str = "ClipForge_Timeline",
    job_id: str | None = None,
    default_fps: float = _DEFAULT_FPS,
) -> Path:
    """Write plan as .otio. Fails loudly on an empty or malformed plan."""
    import opentimelineio as otio

    if not plan:
        raise ValueError("timeline_plan is empty; nothing to export")

    timeline = otio.schema.Timeline(name=timeline_name)
    timeline.metadata["clipforge"] = {
        "job_id": job_id or "",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "spec": "CF-FR-46",
    }
    track = otio.schema.Track(name="V1", kind=otio.schema.TrackKind.Video)
    timeline.tracks.append(track)

    probe_cache: dict[str, tuple[float, float] | None] = {}

    for idx, seg in enumerate(plan):
        source = seg.get("source")
        if not source:
            raise ValueError(f"timeline_plan[{idx}] has no 'source'")
        raw_start = seg.get("start_sec")
        start_sec = float(raw_start) if raw_start is not None else 0.0
        if start_sec < 0:
            raise ValueError(
                f"timeline_plan[{idx}] ({source}): negative start_sec "
                f"{start_sec}"
            )
        # Explicit `is None` check: a present-but-zero duration_sec is
        # malformed data and must fail, not silently fall back to end-start.
        raw_duration = seg.get("duration_sec")
        if raw_duration is None:
            raw_end = seg.get("end_sec")
            end_sec = float(raw_end) if raw_end is not None else 0.0
            duration_sec = end_sec - start_sec
        else:
            duration_sec = float(raw_duration)
        if duration_sec <= 0:
            raise ValueError(
                f"timeline_plan[{idx}] ({source}): non-positive duration "
                f"{duration_sec}"
            )

        src_path = Path(source).resolve()
        if str(src_path) not in probe_cache:
            probe_cache[str(src_path)] = _probe_video(src_path)
            if probe_cache[str(src_path)] is None:
                print(
                    f"otio_export: warning: could not probe {src_path}; "
                    f"using default_fps={default_fps} and no available_range "
                    f"(URI may not relink)",
                    file=sys.stderr,
                )
        probed = probe_cache[str(src_path)]
        fps = probed[0] if probed else default_fps

        available_range = None
        if probed:
            available_range = otio.opentime.TimeRange(
                start_time=otio.opentime.RationalTime(0, fps),
                duration=otio.opentime.RationalTime(
                    round(probed[1] * fps), fps
                ),
            )

        duration_frames = round(duration_sec * fps)
        if duration_frames < 1:
            raise ValueError(
                f"timeline_plan[{idx}] ({source}): duration {duration_sec}s "
                f"rounds to zero frames at {fps} fps"
            )

        clip = otio.schema.Clip(
            name=f"{src_path.stem}_{start_sec:.2f}",
            media_reference=otio.schema.ExternalReference(
                target_url=src_path.as_uri(),
                available_range=available_range,
            ),
            source_range=otio.opentime.TimeRange(
                start_time=otio.opentime.RationalTime(round(start_sec * fps), fps),
                duration=otio.opentime.RationalTime(duration_frames, fps),
            ),
        )
        clip.metadata["clipforge"] = {
            "source_path": str(src_path),
            "segment_score": seg.get("segment_score"),
            "transition": seg.get("transition", "cut"),
            "clip_path": seg.get("clip_path"),
            "fps_probed": probed is not None,
        }
        track.append(clip)

    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    otio.adapters.write_to_file(timeline, str(out_path))
    return out_path
