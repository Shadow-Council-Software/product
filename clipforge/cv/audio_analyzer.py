from __future__ import annotations

from pathlib import Path

import numpy as np


def score_audio_segment(
    video_path: Path,
    start_sec: float,
    end_sec: float,
    *,
    peak_db_threshold: float = -12.0,
) -> float:
    """
    Score gagging/swallow audio peaks in [start_sec, end_sec].

    Uses librosa when available; falls back to 0.5 neutral score for POC bootstrap.
    """
    try:
        import librosa
    except ImportError:
        return 0.5

    try:
        y, sr = librosa.load(
            str(video_path),
            offset=start_sec,
            duration=max(end_sec - start_sec, 0.1),
            sr=None,
            mono=True,
        )
        if y.size == 0:
            return 0.0
        rms = librosa.feature.rms(y=y)[0]
        peak_db = float(librosa.amplitude_to_db(np.max(rms), ref=1.0))
        # Map threshold-relative peak into 0..1
        score = (peak_db - peak_db_threshold) / 20.0
        return float(np.clip(score, 0.0, 1.0))
    except Exception:
        return 0.5
