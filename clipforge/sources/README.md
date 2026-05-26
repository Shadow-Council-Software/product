# ClipForge source adapters

Content-agnostic pluggable acquisition. Configure in `config/datasets.yaml` under `sources:` or in steering under `sources:`.

## Adapter types

| Type | Discover | Fetch | Use case |
|------|----------|-------|----------|
| `local_folder` | Glob paths | Copy (optional) | Inbox, NAS mount, folders |
| `url_list` | URLs from config | via `http_download` | Curated links |
| `search` | Queries → URLs | via `http_download` | Web search (`duckduckgo` optional) |
| `http_download` | — | yt-dlp | Any URL yt-dlp supports |
| `ftp` | List remote dir | FTP RETR | Shared rushes server |
| `manifest` | JSONL rows | path or URL | Curated catalogs |

## Date filter

Set `after_date: "2025-01-01"` on any adapter to skip older files (mtime for local/FTP; manifest `date` field for JSONL).

## Examples

### Local folder (2025+)

```yaml
sources:
  - type: local_folder
    paths: [data/raw/inbox/**, /Volumes/NAS/rushes/**]
    after_date: "2025-01-01"
```

### Search (requires optional package)

```bash
pip install duckduckgo-search
```

```yaml
sources:
  - type: search
    provider: duckduckgo
    queries: ["your search terms here"]
    after_date: "2025"
    max_results: 10
```

### FTP

```yaml
sources:
  - type: ftp
    host: ftp.example.com
    user: operator
    remote_path: /incoming/video
    after_date: "2025-01-01"
```

Set password via env `FTP_PASSWORD` or `config/sources.yaml` (do not commit secrets).

### Manifest JSONL

`data/datasets/curated_manifest.jsonl`:

```json
{"title": "clip a", "path": "data/raw/inbox/a.mp4", "date": "2025-06-01"}
{"title": "clip b", "url": "https://example.com/b.mp4", "date": "2025-06-02"}
```

## Extending

1. Subclass `SourceAdapter` in `sources/adapters/my_source.py`
2. Register in `sources/adapters/__init__.py` `ADAPTERS` list
3. Document config keys in this README

## Legal

Operator is responsible for rights to all discovered/downloaded media and for complying with site Terms of Service.
