from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Any

from clipforge.sources.base import SourceAdapter
from clipforge.sources.types import FetchResult, SourceRef


class HttpDownloadAdapter(SourceAdapter):
    """Fetch remote video via yt-dlp (YouTube, Vimeo, and 1000+ other hosts — site-agnostic)."""

    type_id = "http_download"

    def discover(self, config: dict[str, Any], context: dict[str, Any]) -> list[SourceRef]:
        return []

    def supports_fetch(self) -> bool:
        return True

    def fetch(
        self,
        ref: SourceRef,
        dest_dir: Path,
        context: dict[str, Any],
    ) -> FetchResult | None:
        min_height = int(context.get("download_min_height", 720))
        dest_dir.mkdir(parents=True, exist_ok=True)
        out_template = str(dest_dir / "%(id)s.%(ext)s")
        cmd = [
            "yt-dlp",
            "-f",
            f"bestvideo[height>={min_height}]+bestaudio/best[height>={min_height}]/best",
            "--merge-output-format",
            "mp4",
            "--no-overwrites",
            "-o",
            out_template,
            ref.uri,
        ]
        cookies = context.get("yt_dlp_cookies")
        if cookies:
            cmd[1:1] = ["--cookies", str(cookies)]

        subprocess.run(cmd, check=True, capture_output=True, text=True)
        candidates = sorted(dest_dir.glob("*"), key=lambda p: p.stat().st_mtime)
        if not candidates:
            return None
        dest = candidates[-1]
        return FetchResult(
            local_path=str(dest.resolve()),
            source_ref=ref,
            bytes_size=dest.stat().st_size,
        )
