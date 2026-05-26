from __future__ import annotations

from typing import Any

from clipforge.sources.base import SourceAdapter
from clipforge.sources.types import SourceRef


class UrlListAdapter(SourceAdapter):
    """Explicit HTTP(S) URLs from config or steering."""

    type_id = "url_list"

    def discover(self, config: dict[str, Any], context: dict[str, Any]) -> list[SourceRef]:
        urls = list(config.get("urls") or [])
        urls.extend(context.get("steering_urls") or [])
        return [
            SourceRef(type="http_download", uri=u.strip(), label=u[:80])
            for u in urls
            if u.strip().startswith(("http://", "https://"))
        ]
