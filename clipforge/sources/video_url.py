from __future__ import annotations

import re
from urllib.parse import urlparse

# Known video platforms — used for ranking, not blocking (content-agnostic).
KNOWN_VIDEO_HOSTS = (
    "youtube.com",
    "youtu.be",
    "vimeo.com",
    "dailymotion.com",
    "twitch.tv",
    "archive.org",
    "rumble.com",
    "bilibili.com",
    "facebook.com",
    "fb.watch",
    "reddit.com",
    "streamable.com",
    "tiktok.com",
    "twitter.com",
    "x.com",
)

# Path patterns common on embed/watch pages across hosts.
WATCH_PATH_RE = re.compile(
    r"/(watch|video|embed|v|clip|play|view|shorts|reel)s?(/|$)",
    re.I,
)

DIRECT_MEDIA_RE = re.compile(r"\.(mp4|webm|mkv|mov|m4v|avi)(\?|$)", re.I)


def is_probably_video_url(url: str, *, permissive: bool = False) -> bool:
    """
    Heuristic: is this URL likely fetchable as video (typically via yt-dlp)?

    permissive=True accepts most https URLs and defers to yt-dlp at download time.
    """
    if not url.startswith(("http://", "https://")):
        return False
    parsed = urlparse(url)
    host = (parsed.netloc or "").lower()
    if not host:
        return False
    if DIRECT_MEDIA_RE.search(parsed.path or "") or DIRECT_MEDIA_RE.search(url):
        return True
    if any(h in host for h in KNOWN_VIDEO_HOSTS):
        return True
    if WATCH_PATH_RE.search(parsed.path or ""):
        return True
    if permissive:
        # Skip obvious non-media pages
        skip_ext = (".pdf", ".jpg", ".png", ".html", ".php", ".doc")
        path = (parsed.path or "").lower()
        if path.endswith(skip_ext) and "video" not in path:
            return False
        return True
    return False
