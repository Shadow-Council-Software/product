from unittest.mock import patch

from clipforge.sources.adapters.search import SearchAdapter
from clipforge.sources.video_url import is_probably_video_url


def test_youtube_url_detected():
    assert is_probably_video_url("https://www.youtube.com/watch?v=abc123xyz12")


def test_permissive_accepts_unknown_host():
    assert is_probably_video_url("https://some-unknown-host.tv/watch/123", permissive=True)


def test_ytsearch_parses_ytdlp_output():
    adapter = SearchAdapter()
    stdout = "https://www.youtube.com/watch?v=aaaa\nhttps://www.youtube.com/watch?v=bbbb\n"
    with patch("subprocess.run") as mock_run:
        mock_run.return_value.stdout = stdout
        mock_run.return_value.returncode = 0
        refs = adapter._search_ytsearch("test query", 5, "20250101")
    assert len(refs) == 2
    assert all(r.type == "http_download" for r in refs)


def test_direct_http_in_search_discover():
    adapter = SearchAdapter()
    refs = adapter.discover(
        {"provider": "static", "queries": ["https://www.youtube.com/watch?v=abcdefghijk"]},
        {},
    )
    assert len(refs) == 1
