from __future__ import annotations

import re
from datetime import datetime
from typing import Any
from urllib.parse import urlparse

from clipforge.sources.base import SourceAdapter
from clipforge.sources.types import SourceRef

# Video-like URL heuristics (content-agnostic)
VIDEO_HOST_HINTS = (
    "youtube.com",
    "youtu.be",
    "vimeo.com",
    "archive.org",
    "dailymotion.com",
)


def _parse_after_date(value: str | None) -> datetime | None:
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%Y"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


def _looks_like_media_url(url: str) -> bool:
    if not url.startswith(("http://", "https://")):
        return False
    host = urlparse(url).netloc.lower()
    if any(h in host for h in VIDEO_HOST_HINTS):
        return True
    if re.search(r"\.(mp4|webm|mkv|mov)(\?|$)", url, re.I):
        return True
    return False


class SearchAdapter(SourceAdapter):
    """
    Resolve search queries to candidate URLs.

    Providers:
      - static: query strings that are already URLs pass through
      - duckduckgo: requires `pip install duckduckgo-search` (optional)
    """

    type_id = "search"

    def discover(self, config: dict[str, Any], context: dict[str, Any]) -> list[SourceRef]:
        provider = (config.get("provider") or "static").lower()
        queries = list(config.get("queries") or config.get("discovery_queries") or [])
        queries.extend(config.get("query") and [config["query"]] or [])
        after = _parse_after_date(config.get("after_date") or config.get("media_after"))
        max_results = int(config.get("max_results", 10))
        refs: list[SourceRef] = []

        for q in queries:
            q = q.strip()
            if not q:
                continue
            if q.startswith("http"):
                if _looks_like_media_url(q):
                    refs.append(
                        SourceRef(
                            type="http_download",
                            uri=q,
                            label=q[:80],
                            metadata={"query": q, "provider": "direct"},
                        )
                    )
                continue

            if provider == "duckduckgo":
                refs.extend(self._search_duckduckgo(q, max_results, after))
            else:
                # static: no network; operator must use URLs in query or switch provider
                context.setdefault("search_warnings", []).append(
                    f"search: query '{q[:60]}' needs provider duckduckgo or a direct URL"
                )

        return refs

    def _search_duckduckgo(
        self, query: str, max_results: int, after: datetime | None
    ) -> list[SourceRef]:
        try:
            from duckduckgo_search import DDGS
        except ImportError:
            return []

        refs: list[SourceRef] = []
        with DDGS() as ddgs:
            for item in ddgs.text(query, max_results=max_results * 2):
                url = item.get("href") or item.get("url") or ""
                if not _looks_like_media_url(url):
                    continue
                if after:
                    # DDGS text results lack reliable dates; optional filter via metadata
                    pass
                refs.append(
                    SourceRef(
                        type="http_download",
                        uri=url,
                        label=(item.get("title") or url)[:80],
                        metadata={"query": query, "provider": "duckduckgo"},
                    )
                )
                if len(refs) >= max_results:
                    break
        return refs
