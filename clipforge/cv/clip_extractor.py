from __future__ import annotations

import subprocess
from pathlib import Path


def extract_segment_clip(
    source: Path,
    start_sec: float,
    end_sec: float,
    output_path: Path,
) -> str:
    """
    Extract [start_sec, end_sec] to output_path.

    Prefers ffmpeg (fast stream copy); falls back to MoviePy 1.x API if available.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    duration = max(end_sec - start_sec, 0.1)

    if _ffmpeg_extract(source, start_sec, duration, output_path):
        return str(output_path.resolve())

    try:
        from moviepy.editor import VideoFileClip
    except ImportError as exc:
        raise ImportError(
            "Clip extraction requires ffmpeg on PATH or moviepy<2: "
            "brew install ffmpeg / pip install 'moviepy<2'"
        ) from exc

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


def _ffmpeg_extract(source: Path, start_sec: float, duration: float, output_path: Path) -> bool:
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-ss",
                f"{start_sec:.3f}",
                "-i",
                str(source),
                "-t",
                f"{duration:.3f}",
                "-c:v",
                "libx264",
                "-c:a",
                "aac",
                str(output_path),
            ],
            check=True,
            capture_output=True,
        )
        return output_path.exists() and output_path.stat().st_size > 0
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False
