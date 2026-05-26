from __future__ import annotations

from pathlib import Path


def extract_segment_clip(
    source: Path,
    start_sec: float,
    end_sec: float,
    output_path: Path,
) -> str:
    """
    Extract [start_sec, end_sec] to output_path. Returns path string.

    Uses MoviePy when installed; raises ImportError with install hint otherwise.
    """
    try:
        from moviepy.editor import VideoFileClip
    except ImportError as exc:
        raise ImportError(
            "moviepy required for clip extraction: pip install moviepy"
        ) from exc

    output_path.parent.mkdir(parents=True, exist_ok=True)
    duration = max(end_sec - start_sec, 0.1)
    with VideoFileClip(str(source)) as video:
        sub = video.subclip(start_sec, start_sec + duration)
        sub.write_videofile(
            str(output_path),
            codec="libx264",
            audio_codec="aac",
            logger=None,
            verbose=False,
        )
    return str(output_path.resolve())
