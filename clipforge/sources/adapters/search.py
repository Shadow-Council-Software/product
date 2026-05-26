from __future__ import annotations

import json
import subprocess
from datetime import datetime
from typing import Any

from clipforge.sources.base import SourceAdapter
from clipforge.sources.types import SourceRef
from clipforge.sources.video_url import is_probably_video_url


def _parse_after_date(value: str | None) -> datetime | None:
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%Y"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


class SearchAdapter(SourceAdapter):
    """
    Resolve search queries to candidate video URLs (content-agnostic).

    Providers:
      - static: pass through direct http(s) links only
      - ytsearch: YouTube search via yt-dlp (`ytsearchN:query`) — any public YT result
      - duckduckgo: web search; filters to likely video URLs
      - duckduckgo_videos: DuckDuckGo video vertical (requires duckduckgo-search)
      - permissive: duckduckgo but accept broader URLs for yt-dlp to try
      - auto: ytsearch when query has no `site:`; else duckduckgo_videos then duckduckgo
    """

    type_id = "search"

    def discover(self, config: dict[str, Any], context: dict[str, Any]) -> list[SourceRef]:
        provider = (config.get("provider") or "static").lower()
        queries = list(config.get("queries") or config.get("discovery_queries") or [])
        if config.get("query"):
            queries.append(config["query"])
        after = _parse_after_date(config.get("after_date") or config.get("media_after"))
        max_results = int(config.get("max_results", 10))
        permissive = bool(config.get("permissive", provider == "permissive"))
        dateafter = None
        if after:
            dateafter = after.strftime("%Y%m%d")

        refs: list[SourceRef] = []

        for q in queries:
            q = q.strip()
            if not q:
                continue
            if q.startswith("http"):
                if is_probably_video_url(q, permissive=True):
                    refs.append(
                        SourceRef(
                            type="http_download",
                            uri=q,
                            label=q[:80],
                            metadata={"query": q, "provider": "direct"},
                        )
                    )
                continue

            if provider == "auto":
                refs.extend(self._search_auto(q, max_results, dateafter, permissive))
            elif provider == "ytsearch":
                refs.extend(self._search_ytsearch(q, max_results, dateafter))
            elif provider == "duckduckgo_videos":
                refs.extend(self._search_duckduckgo_videos(q, max_results))
            elif provider in ("duckduckgo", "permissive"):
                refs.extend(
                    self._search_duckduckgo(q, max_results, permissive=True)
                )
            elif provider == "static":
                context.setdefault("search_warnings", []).append(
                    f"search: set provider to ytsearch, duckduckgo, or auto for query '{q[:50]}'"
                )
            else:
                context.setdefault("search_warnings", []).append(
                    f"search: unknown provider '{provider}'"
                )

        return refs

    def _search_auto(
        self, query: str, max_results: int, dateafter: str | None, permissive: bool
    ) -> list[SourceRef]:
        if "site:" in query.lower():
            return self._search_duckduckgo(query, max_results, permissive=permissive)
        refs = self._search_ytsearch(query, max_results, dateafter)
        if len(refs) < max_results:
            refs.extend(self._search_duckduckgo_videos(query, max_results - len(refs)))
        return refs[:max_results]

    def _search_ytsearch(
        self, query: str, max_results: int, dateafter: str | None
    ) -> list[SourceRef]:
        """YouTube search through yt-dlp (works for any query yt-dlp accepts)."""
        refs: list[SourceRef] = []
        target = f"ytsearch{max_results}:{query}"
        cmd = ["yt-dlp", "--flat-playlist", "--print", "%(url)s"]
        if dateafter:
            cmd.extend(["--dateafter", dateafter])
        cmd.append(target)
        try:
            proc = subprocess.run(cmd, check=True, capture_output=True, text=True)
            for line in proc.stdout.splitlines():
                url = line.strip()
                if url.startswith("http"):
                    refs.append(
                        SourceRef(
                            type="http_download",
                            uri=url,
                            label=url[:80],
                            metadata={"query": query, "provider": "ytsearch"},
                        )
                    )
        except (subprocess.CalledProcessError, FileNotFoundError):
            pass
        return refs

    def _search_duckduckgo_videos(self, query: str, max_results: int) -> list[SourceRef]:
        try:
            from duckduckgo_search import DDGS
        except ImportError:
            return []

        refs: list[SourceRef] = []
        with DDGS() as ddgs:
            try:
                iterator = ddgs.videos(query, max_results=max_results)
            except Exception:
                return refs
            for item in iterator:
                url = item.get("content") or item.get("embed_url") or item.get("url") or ""
                if not url.startswith("http"):
                    continue
                refs.append(
                    SourceRef(
                        type="http_download",
                        uri=url,
                        label=(item.get("title") or url)[:80],
                        metadata={"query": query, "provider": "duckduckgo_videos"},
                    )
                )
        return refs

    def _search_duckduckgo(
        self, query: str, max_results: int, *, permissive: bool = False
    ) -> list[SourceRef]:
        try:
            from duckduckgo_search import DDGS
        except ImportError:
            return []

        refs: list[SourceRef] = []
        with DDGS() as ddgs:
            for item in ddgs.text(query, max_results=max_results * 3):
                url = item.get("href") or item.get("url") or ""
                if not is_probably_video_url(url, permissive=permissive):
                    continue
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
