from __future__ import annotations

import json
from pathlib import Path

from clipforge.cv.audio_analyzer import score_audio_segment
from clipforge.cv.throat_detector import analyze_video_segments
from clipforge.lib.config import load_settings
from clipforge.lib.state import ClipForgeState


def analysis_node(state: ClipForgeState) -> ClipForgeState:
    """Run CV + audio pipeline; write qualified clips + JSON sidecars."""
    settings = load_settings()
    pipeline = settings.get("pipeline", {})
    analysis = settings.get("analysis", {})
    clips_dir = Path(settings["paths"]["clips_qualified"])
    if not clips_dir.is_absolute():
        clips_dir = Path(__file__).resolve().parent.parent / clips_dir
    clips_dir.mkdir(parents=True, exist_ok=True)

    min_score = float(
        state.get("min_dramatic_score")
        or pipeline.get("min_dramatic_score", 0.85)
    )
    clip_min = int(pipeline.get("clip_duration_sec_min", 3))
    clip_max = int(pipeline.get("clip_duration_sec_max", 12))

    qualified: list[dict] = list(state.get("qualified_clips") or [])
    errors = list(state.get("errors") or [])

    if state.get("dry_run"):
        return {**state, "qualified_clips": qualified}

    for raw_path in state.get("downloaded_paths") or []:
        path = Path(raw_path)
        if not path.exists():
            errors.append(f"analysis_agent: missing file {raw_path}")
            continue
        try:
            segments = analyze_video_segments(
                path,
                min_score=min_score,
                clip_min_sec=clip_min,
                clip_max_sec=clip_max,
                bulge_threshold=float(analysis.get("bulge_delta_threshold", 0.15)),
                expression_threshold=float(
                    analysis.get("expression_score_threshold", 0.85)
                ),
                sample_fps=float(analysis.get("sample_fps", 2)),
            )
            for seg in segments:
                audio_score = score_audio_segment(
                    path,
                    seg["start_sec"],
                    seg["end_sec"],
                    peak_db_threshold=float(
                        analysis.get("audio_peak_db_threshold", -12)
                    ),
                )
                seg["audio_score"] = audio_score
                seg["dramatic_score"] = (
                    seg.get("dramatic_score", 0) * 0.7 + audio_score * 0.3
                )
                if seg["dramatic_score"] >= min_score:
                    sidecar = clips_dir / f"{path.stem}_{seg['start_sec']:.2f}.json"
                    sidecar.write_text(json.dumps(seg, indent=2), encoding="utf-8")
                    qualified.append(seg)
        except Exception as exc:  # noqa: BLE001 — POC: surface per-file failures
            errors.append(f"analysis_agent: {path.name}: {exc}")

    return {**state, "qualified_clips": qualified, "errors": errors}
