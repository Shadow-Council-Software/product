from __future__ import annotations

import subprocess
from pathlib import Path

from clipforge.lib.config import load_settings
from clipforge.lib.state import ClipForgeState


def _performer_raw_dir(raw_root: Path, performer_id: str) -> Path:
    d = raw_root / performer_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def download_node(state: ClipForgeState) -> ClipForgeState:
    """Download raw media with yt-dlp into data/raw/[performer]/."""
    if state.get("dry_run"):
        return {**state, "downloaded_paths": state.get("downloaded_paths") or []}

    settings = load_settings()
    raw_root = Path(settings["paths"]["raw"]).resolve()
    if not raw_root.is_absolute():
        raw_root = Path(__file__).resolve().parent.parent / raw_root

    min_height = int(settings.get("pipeline", {}).get("download_min_height", 1080))
    performer_ids = state.get("performer_ids") or ["unknown"]
    primary_performer = performer_ids[0]
    out_dir = _performer_raw_dir(raw_root, primary_performer)

    downloaded: list[str] = list(state.get("downloaded_paths") or [])
    errors = list(state.get("errors") or [])

    for url in state.get("search_urls") or []:
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
            # yt-dlp may use varying extensions; glob newest file as heuristic
            candidates = sorted(out_dir.glob("*"), key=lambda p: p.stat().st_mtime)
            if candidates:
                downloaded.append(str(candidates[-1]))
        except (subprocess.CalledProcessError, FileNotFoundError) as exc:
            errors.append(f"download_agent: failed for {url}: {exc}")

    return {**state, "downloaded_paths": downloaded, "errors": errors}
