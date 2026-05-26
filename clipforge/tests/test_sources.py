from clipforge.lib.config import load_datasets
from clipforge.sources.registry import collect_source_configs, discover_media
from clipforge.sources.adapters.local_folder import LocalFolderAdapter


def test_collect_source_configs_legacy_and_sources_block():
    datasets = load_datasets()["datasets"]
    inbox = next(d for d in datasets if d["id"] == "inbox_local")
    assert inbox.get("sources")
    configs = collect_source_configs([inbox], {})
    types = {c["type"] for c in configs}
    assert "local_folder" in types


def test_local_folder_discovers_inbox_gitkeep_skipped(tmp_path):
    adapter = LocalFolderAdapter()
    video = tmp_path / "clip.mp4"
    video.write_bytes(b"\x00\x00\x00\x18ftypmp42")
    refs = adapter.discover(
        {"paths": [str(tmp_path / "*")]},
        {"clipforge_root": str(tmp_path)},
    )
    assert len(refs) == 1
    assert refs[0].uri.endswith("clip.mp4")


def test_search_static_url_passthrough():
    refs, _ = discover_media(
        [{"type": "search", "provider": "static", "queries": ["https://archive.org/details/test"]}],
        {"clipforge_root": "."},
    )
    assert any(r.type == "http_download" for r in refs)


def test_url_list_adapter():
    refs, _ = discover_media(
        [{"type": "url_list", "urls": ["https://example.com/a.mp4"]}],
        {"clipforge_root": "."},
    )
    assert len(refs) == 1
    assert refs[0].type == "http_download"
