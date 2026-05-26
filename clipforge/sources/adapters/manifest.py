from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from clipforge.sources.base import SourceAdapter
from clipforge.sources.types import SourceRef


class ManifestAdapter(SourceAdapter):
    """JSONL manifest: one object per line with path or url + optional after_date filter."""

    type_id = "manifest"

    def discover(self, config: dict[str, Any], context: dict[str, Any]) -> list[SourceRef]:
        base = Path(context.get("clipforge_root", "."))
        manifest_path = config.get("manifest") or config.get("path")
        if not manifest_path:
            return []
        path = Path(manifest_path)
        if not path.is_absolute():
            path = base / path
        if not path.exists():
            return []

        after_str = config.get("after_date") or config.get("media_after")
        after = None
        if after_str:
            try:
                after = datetime.strptime(after_str, "%Y-%m-%d")
            except ValueError:
                pass

        refs: list[SourceRef] = []
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            if after and row.get("date"):
                try:
                    if datetime.strptime(row["date"], "%Y-%m-%d") < after:
                        continue
                except ValueError:
                    pass
            if row.get("url"):
                refs.append(
                    SourceRef(
                        type="http_download",
                        uri=row["url"],
                        label=row.get("title", row["url"])[:80],
                        metadata=row,
                    )
                )
            elif row.get("path"):
                p = Path(row["path"])
                if not p.is_absolute():
                    p = base / p
                refs.append(
                    SourceRef(
                        type="local_folder",
                        uri=str(p.resolve()),
                        label=row.get("title", p.name),
                        metadata=row,
                    )
                )
        return refs
