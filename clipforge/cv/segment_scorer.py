from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np


@dataclass
class FrameScores:
    motion_delta: float
    visual_intensity: float


def _visual_intensity_proxy(roi: np.ndarray) -> float:
    """Placeholder until profile-specific models (emotion, action, scene) are plugged in."""
    import cv2

    if roi.size == 0:
        return 0.0
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    return float(np.clip(gray.std() / 128.0, 0, 1))


def _motion_delta(prev_metric: float | None, metric: float) -> float:
    if prev_metric is None or prev_metric <= 0:
        return 0.0
    return float(np.clip(abs(metric - prev_metric) / prev_metric, 0, 1))


def score_segments(
    video_path: Path,
    *,
    profile: str = "intensity_peaks",
    min_score: float = 0.75,
    clip_min_sec: int = 3,
    clip_max_sec: int = 15,
    motion_threshold: float = 0.12,
    visual_threshold: float = 0.7,
    sample_fps: float = 2.0,
    ranking_weights: dict[str, float] | None = None,
) -> list[dict[str, Any]]:
    """
    Content-agnostic segment detection: sample frames, score motion + visual intensity.

    Profiles (intensity_peaks, scene_change) swap heuristics or models in Phase 2.
    """
    import cv2

    weights = ranking_weights or {
        "visual_weight": 0.5,
        "audio_weight": 0.3,
        "metadata_weight": 0.2,
    }
    vw = float(weights.get("visual_weight", 0.5))
    # Audio merged in analysis_agent; visual+motion computed here

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"cannot open video: {video_path}")

    native_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    step = max(int(native_fps / sample_fps), 1)
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    frame_idx = 0
    prev_metric: float | None = None
    window: list[FrameScores] = []
    window_frame_indices: list[int] = []
    segments: list[dict[str, Any]] = []
    window_start_frame = 0

    def flush_window(end_frame: int) -> None:
        nonlocal window, window_start_frame, window_frame_indices, segments
        if not window:
            return
        motion = max(s.motion_delta for s in window)
        visual = max(s.visual_intensity for s in window)
        peak_idx = max(
            range(len(window)),
            key=lambda i: window[i].visual_intensity + window[i].motion_delta,
        )
        peak_frame = window_frame_indices[peak_idx]
        peak_sec = peak_frame / native_fps
        segment_score = vw * visual + (1 - vw) * motion
        start_sec = window_start_frame / native_fps
        end_sec = end_frame / native_fps
        duration = end_sec - start_sec
        if duration < clip_min_sec or duration > clip_max_sec:
            window = []
            return
        if (
            motion >= motion_threshold
            and visual >= visual_threshold
            and segment_score >= min_score
        ):
            segments.append(
                {
                    "source": str(video_path),
                    "profile": profile,
                    "start_sec": start_sec,
                    "end_sec": end_sec,
                    "duration_sec": duration,
                    "peak_sec": peak_sec,
                    "motion_score": motion,
                    "visual_score": visual,
                    "segment_score": segment_score,
                    "clip_path": None,
                }
            )
        window = []
        window_frame_indices = []

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if frame_idx % step != 0:
            frame_idx += 1
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        metric = float(gray.std())
        if profile == "scene_change":
            # Coarse scene-change proxy: large frame-to-frame difference
            metric = float(cv2.absdiff(gray, cv2.GaussianBlur(gray, (5, 5), 0)).mean())

        faces = face_cascade.detectMultiScale(gray, 1.1, 4, minSize=(60, 60))
        if len(faces):
            x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
            roi = frame[y : y + h, x : x + w]
            visual = _visual_intensity_proxy(roi)
        else:
            visual = _visual_intensity_proxy(frame)

        scores = FrameScores(
            motion_delta=_motion_delta(prev_metric, metric),
            visual_intensity=visual,
        )
        prev_metric = metric

        if not window:
            window_start_frame = frame_idx
        window.append(scores)
        window_frame_indices.append(frame_idx)

        if (frame_idx - window_start_frame) / native_fps >= clip_max_sec:
            flush_window(frame_idx)
            window_start_frame = frame_idx
            window_frame_indices = []

        frame_idx += 1

    if window:
        flush_window(frame_idx)
    cap.release()

    if not segments:
        cap = cv2.VideoCapture(str(video_path))
        total_frames = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        cap.release()
        duration = total_frames / fps if fps else 0
        if duration >= clip_min_sec:
            span = min(float(clip_max_sec), duration)
            start = max(0.0, (duration - span) / 2)
            segments.append(
                {
                    "source": str(video_path),
                    "profile": profile,
                    "start_sec": start,
                    "end_sec": start + span,
                    "duration_sec": span,
                    "motion_score": motion_threshold,
                    "visual_score": visual_threshold,
                    "segment_score": min_score,
                    "peak_sec": start + span / 2,
                    "clip_path": None,
                    "bootstrap": True,
                }
            )

    return segments
