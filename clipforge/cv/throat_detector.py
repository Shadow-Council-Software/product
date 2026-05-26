from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np


@dataclass
class FrameScores:
    bulge_delta: float
    expression_score: float


def _expression_proxy(face_roi: np.ndarray) -> float:
    """Placeholder until fine-tuned ResNet/VGG emotion head is wired."""
    import cv2

    if face_roi.size == 0:
        return 0.0
    gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
    contrast = float(gray.std()) / 128.0
    return float(np.clip(contrast, 0, 1))


def _bulge_proxy(prev_throat: float | None, throat_width: float) -> float:
    if prev_throat is None or prev_throat <= 0:
        return 0.0
    return float(np.clip((throat_width - prev_throat) / prev_throat, 0, 1))


def analyze_video_segments(
    video_path: Path,
    *,
    min_score: float = 0.85,
    clip_min_sec: int = 3,
    clip_max_sec: int = 12,
    bulge_threshold: float = 0.15,
    expression_threshold: float = 0.85,
    sample_fps: float = 2.0,
) -> list[dict[str, Any]]:
    """
    Sample video frames, score throat-region motion + expression proxies.

    MediaPipe Face Mesh integration point: replace Haar face box + throat
    width heuristic with landmark-based bulge_delta when models are ready.
    """
    import cv2

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"cannot open video: {video_path}")

    native_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    step = max(int(native_fps / sample_fps), 1)
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    frame_idx = 0
    prev_throat: float | None = None
    window: list[FrameScores] = []
    segments: list[dict[str, Any]] = []
    window_start_frame = 0

    def flush_window(end_frame: int) -> None:
        nonlocal window, window_start_frame, segments
        if not window:
            return
        bulge = max(s.bulge_delta for s in window)
        expr = max(s.expression_score for s in window)
        dramatic = 0.55 * bulge + 0.45 * expr
        start_sec = window_start_frame / native_fps
        end_sec = end_frame / native_fps
        duration = end_sec - start_sec
        if duration < clip_min_sec or duration > clip_max_sec:
            window = []
            return
        if bulge >= bulge_threshold and expr >= expression_threshold and dramatic >= min_score:
            segments.append(
                {
                    "source": str(video_path),
                    "start_sec": start_sec,
                    "end_sec": end_sec,
                    "duration_sec": duration,
                    "bulge_delta": bulge,
                    "expression_score": expr,
                    "dramatic_score": dramatic,
                    "clip_path": None,  # filled by extraction step (MoviePy) in Phase 2
                }
            )
        window = []

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if frame_idx % step != 0:
            frame_idx += 1
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4, minSize=(80, 80))
        if len(faces) == 0:
            if window:
                flush_window(frame_idx)
            frame_idx += 1
            continue

        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        throat_y = y + int(h * 0.65)
        throat_h = max(int(h * 0.35), 1)
        throat_roi = gray[throat_y : throat_y + throat_h, x : x + w]
        throat_width = float(throat_roi.shape[1]) if throat_roi.size else 0.0
        face_roi = frame[y : y + h, x : x + w]

        scores = FrameScores(
            bulge_delta=_bulge_proxy(prev_throat, throat_width),
            expression_score=_expression_proxy(face_roi),
        )
        prev_throat = throat_width

        if not window:
            window_start_frame = frame_idx
        window.append(scores)

        if (frame_idx - window_start_frame) / native_fps >= clip_max_sec:
            flush_window(frame_idx)
            window_start_frame = frame_idx

        frame_idx += 1

    if window:
        flush_window(frame_idx)
    cap.release()
    return segments
