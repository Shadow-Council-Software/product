# ClipForge source adapters

Content-agnostic pluggable acquisition. **Download** uses [yt-dlp](https://github.com/yt-dlp/yt-dlp), which supports thousands of sites (YouTube, Vimeo, and many others). ClipForge does not hardcode a content niche — operators configure queries and URLs.

## Adapter types

| Type | Discover | Fetch | Use case |
|------|----------|-------|----------|
| `local_folder` | Glob paths | Copy (optional) | Inbox, NAS mount, folders |
| `url_list` | URLs from config | via `http_download` | Curated links |
| `search` | Queries → URLs | via `http_download` | See providers below |
| `http_download` | — | yt-dlp | Any URL yt-dlp supports |
| `ftp` | List remote dir | FTP RETR | Shared rushes server |
| `manifest` | JSONL rows | path or URL | Curated catalogs |

## Search providers (`type: search`)

| Provider | Behavior |
|----------|----------|
| **auto** (default) | `ytsearch` for general queries; `site:` queries use DuckDuckGo web |
| **ytsearch** | YouTube search via `yt-dlp ytsearchN:query` + optional `--dateafter` |
| **duckduckgo_videos** | DuckDuckGo video results (`pip install duckduckgo-search`) |
| **duckduckgo** | Web search, video-like URLs only |
| **permissive** | Web search, broader URLs — yt-dlp succeeds or fails per site |
| **static** | No search; only direct `http(s)` lines in queries |

### Examples

**YouTube search (2025+):**

```yaml
sources:
  - type: search
    provider: ytsearch
    queries: ["documentary b-roll city"]
    after_date: "2025-01-01"
    max_results: 15
```

**Specific site via web search:**

```yaml
sources:
  - type: search
    provider: permissive
    queries: ["site:example-video-host.com your keywords"]
    max_results: 10
```

**Direct URLs (any yt-dlp-supported host):**

```yaml
sources:
  - type: url_list
    urls:
      - "https://www.youtube.com/watch?v=..."
      - "https://vimeo.com/..."
```

## Date filter

`after_date: "2025-01-01"` on search (yt-dlp `--dateafter`), local folders (mtime), FTP, and manifests.

## UI

Enable **discovery**, pick **Search provider**, enter queries, use trigger `discovery` or `hybrid`.

## Legal

Operator must have rights to use discovered media and comply with each platform's Terms of Service. yt-dlp may require cookies for some sites (`config/sources.yaml` → `yt_dlp_cookies`).

## Extending

Subclass `SourceAdapter`, register in `sources/adapters/__init__.py`.
