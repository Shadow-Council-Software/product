from __future__ import annotations

import subprocess
from pathlib import Path


def concatenate_clips(clip_paths: list[str], output_path: Path) -> str:
    """Build one MP4 from ordered clips (ffmpeg concat or MoviePy)."""
    paths = [Path(p) for p in clip_paths if p and Path(p).exists()]
    if not paths:
        raise ValueError("no valid clip paths to concatenate")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if len(paths) == 1:
        import shutil

        shutil.copy2(paths[0], output_path)
        return str(output_path.resolve())

    if _ffmpeg_concat(paths, output_path):
        return str(output_path.resolve())

    return _moviepy_concat(paths, output_path)


def _ffmpeg_concat(paths: list[Path], output_path: Path) -> bool:
    list_file = output_path.parent / "concat_list.txt"
    lines = [f"file '{p.resolve()}'" for p in paths]
    list_file.write_text("\n".join(lines) + "\n", encoding="utf-8")
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(list_file),
                "-c",
                "copy",
                str(output_path),
            ],
            check=True,
            capture_output=True,
        )
        return output_path.exists() and output_path.stat().st_size > 0
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def _moviepy_concat(paths: list[Path], output_path: Path) -> str:
    from moviepy.editor import VideoFileClip, concatenate_videoclips

    clips = [VideoFileClip(str(p)) for p in paths]
    try:
        final = concatenate_videoclips(clips, method="compose")
        final.write_videofile(
            str(output_path),
            codec="libx264",
            audio_codec="aac",
            logger=None,
            verbose=False,
        )
    finally:
        for c in clips:
            c.close()
    return str(output_path.resolve())
