from clipforge.lib.config import load_performers, load_settings, performer_by_id


def test_settings_loads():
    settings = load_settings()
    assert "paths" in settings
    assert settings["paths"]["raw"] == "data/raw"


def test_performers_loads():
    data = load_performers()
    ids = [p["id"] for p in data["performers"]]
    assert "morgpie" in ids
    assert "sweetyfox" in ids


def test_performer_by_id():
    p = performer_by_id("yuiwoo")
    assert p is not None
    assert p["display_name"] == "Yuiwoo"
