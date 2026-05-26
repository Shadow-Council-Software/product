from __future__ import annotations

import json
from pathlib import Path

from clipforge.cv.audio_analyzer import score_audio_segment
from clipforge.cv.clip_extractor import extract_segment_clip
from clipforge.cv.segment_scorer import score_segments
from clipforge.lib.config import load_settings, workflow_by_id
from clipforge.lib.state import ClipForgeState


def analysis_node(state: ClipForgeState) -> ClipForgeState:
    """Score segments using workflow profile + steering ranking weights."""
    settings = load_settings()
    steering = state.get("steering") or {}
    directives = steering.get("directives", {})
    analysis_cfg = settings.get("analysis", {})

    workflow = workflow_by_id(state.get("workflow_id", "")) or {}
    profile = workflow.get("analysis_profile", "intensity_peaks")

    clips_dir = Path(settings["paths"]["clips_qualified"])
    if not clips_dir.is_absolute():
        clips_dir = Path(__file__).resolve().parent.parent / clips_dir
    clips_dir.mkdir(parents=True, exist_ok=True)

    min_score = float(
        state.get("min_segment_score")
        or directives.get("min_segment_score", 0.75)
    )
    dur = directives.get("segment_duration_sec", [3, 15])
    clip_min, clip_max = int(dur[0]), int(dur[1])
    ranking = directives.get("ranking", {})
    aw = float(ranking.get("audio_weight", 0.3))
    vw = float(ranking.get("visual_weight", 0.5))

    candidates: list[dict] = list(state.get("segment_candidates") or [])
    errors = list(state.get("errors") or [])

    if state.get("dry_run"):
        return {**state, "segment_candidates": candidates}

    media_paths = state.get("ingested_paths") or []
    for raw_path in media_paths:
        path = Path(raw_path)
        if not path.exists():
            errors.append(f"analysis_agent: missing file {raw_path}")
            continue
        try:
            segments = score_segments(
                path,
                profile=profile,
                min_score=min_score,
                clip_min_sec=clip_min,
                clip_max_sec=clip_max,
                motion_threshold=float(analysis_cfg.get("motion_threshold", 0.12)),
                visual_threshold=float(analysis_cfg.get("visual_threshold", 0.7)),
                sample_fps=float(analysis_cfg.get("sample_fps", 2)),
                ranking_weights=ranking,
            )
            for seg in segments:
                audio_score = score_audio_segment(
                    path,
                    seg["start_sec"],
                    seg["end_sec"],
                    peak_db_threshold=float(analysis_cfg.get("audio_peak_db_threshold", -12)),
                )
                seg["audio_score"] = audio_score
                seg["segment_score"] = (
                    vw * seg.get("segment_score", 0) + aw * audio_score
                ) / max(vw + aw, 0.01)
                if seg["segment_score"] >= min_score:
                    job_id = state.get("job_id") or "job"
                    clip_name = f"{job_id}_{path.stem}_{seg['start_sec']:.2f}.mp4"
                    clip_out = clips_dir / clip_name
                    try:
                        seg["clip_path"] = extract_segment_clip(
                            path,
                            float(seg["start_sec"]),
                            float(seg["end_sec"]),
                            clip_out,
                        )
                    except ImportError:
                        seg["clip_path"] = None
                    except Exception as exc:  # noqa: BLE001
                        errors.append(f"analysis_agent: extract {clip_name}: {exc}")
                        seg["clip_path"] = None
                    sidecar = clips_dir / f"{path.stem}_{seg['start_sec']:.2f}.json"
                    sidecar.write_text(json.dumps(seg, indent=2), encoding="utf-8")
                    candidates.append(seg)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"analysis_agent: {path.name}: {exc}")

    return {**state, "segment_candidates": candidates, "errors": errors}
