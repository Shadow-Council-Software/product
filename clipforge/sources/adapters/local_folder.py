from __future__ import annotations

import glob
from datetime import datetime
from pathlib import Path
from typing import Any

from clipforge.sources.base import SourceAdapter
from clipforge.sources.types import FetchResult, SourceRef

VIDEO_EXTS = {".mp4", ".mov", ".mkv", ".webm", ".m4v", ".avi"}


def _parse_after_date(value: str | None) -> datetime | None:
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%Y/%m/%d"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


class LocalFolderAdapter(SourceAdapter):
    type_id = "local_folder"

    def discover(self, config: dict[str, Any], context: dict[str, Any]) -> list[SourceRef]:
        base = Path(context.get("clipforge_root", "."))
        patterns = config.get("paths") or config.get("local_paths") or []
        after = _parse_after_date(config.get("after_date") or config.get("media_after"))
        refs: list[SourceRef] = []

        for pattern in patterns:
            p = Path(pattern)
            if not p.is_absolute():
                p = base / pattern
            for match in glob.glob(str(p), recursive=True):
                path = Path(match)
                if path.suffix.lower() not in VIDEO_EXTS:
                    continue
                if after and datetime.fromtimestamp(path.stat().st_mtime) < after:
                    continue
                refs.append(
                    SourceRef(
                        type=self.type_id,
                        uri=str(path.resolve()),
                        label=path.name,
                        metadata={"mtime": path.stat().st_mtime},
                    )
                )
        return refs

    def supports_fetch(self) -> bool:
        return True

    def fetch(
        self,
        ref: SourceRef,
        dest_dir: Path,
        context: dict[str, Any],
    ) -> FetchResult | None:
        import shutil

        src = Path(ref.uri)
        if not src.exists():
            return None
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / src.name
        if src.resolve() != dest.resolve():
            shutil.copy2(src, dest)
        else:
            dest = src
        return FetchResult(local_path=str(dest.resolve()), source_ref=ref, bytes_size=dest.stat().st_size)
