from __future__ import annotations

import subprocess
from pathlib import Path

from clipforge.lib.config import load_settings
from clipforge.lib.state import ClipForgeState


def download_node(state: ClipForgeState) -> ClipForgeState:
    """Fetch remote media via yt-dlp into data/raw/[job_id|dataset]/."""
    if state.get("dry_run"):
        return {**state, "ingested_paths": state.get("ingested_paths") or []}

    settings = load_settings()
    raw_root = Path(settings["paths"]["raw"]).resolve()
    if not raw_root.is_absolute():
        raw_root = Path(__file__).resolve().parent.parent / raw_root

    job_slug = (state.get("job_id") or "job").replace("/", "_")
    out_dir = raw_root / "downloads" / job_slug
    out_dir.mkdir(parents=True, exist_ok=True)

    min_height = int(settings.get("pipeline", {}).get("download_min_height", 720))
    ingested: list[str] = list(state.get("ingested_paths") or [])
    errors = list(state.get("errors") or [])

    for url in state.get("source_urls") or []:
        cmd = [
            "yt-dlp",
            "-f",
            f"bestvideo[height>={min_height}]+bestaudio/best[height>={min_height}]/best",
            "--merge-output-format",
            "mp4",
            "-o",
            str(out_dir / "%(id)s.%(ext)s"),
            url,
        ]
        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            candidates = sorted(out_dir.glob("*"), key=lambda p: p.stat().st_mtime)
            if candidates:
                ingested.append(str(candidates[-1]))
        except (subprocess.CalledProcessError, FileNotFoundError) as exc:
            errors.append(f"download_agent: failed for {url}: {exc}")

    return {**state, "ingested_paths": ingested, "errors": errors}
