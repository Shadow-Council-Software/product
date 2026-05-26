from clipforge.lib.config import (
    datasets_by_ids,
    load_datasets,
    load_settings,
    load_workflows,
    workflow_by_id,
)
from clipforge.lib.steering import merge_steering
from clipforge.triggers import TriggerMode, parse_trigger


def test_settings_loads():
    settings = load_settings()
    assert "paths" in settings
    assert settings["resolve"]["project_name_prefix"] == "ClipForge"


def test_workflows_loads():
    data = load_workflows()
    ids = [w["id"] for w in data["workflows"]]
    assert "compilation_dense" in ids
    assert "narrative_arc" in ids


def test_datasets_loads():
    data = load_datasets()
    ids = [d["id"] for d in data["datasets"]]
    assert "inbox_local" in ids


def test_workflow_by_id():
    w = workflow_by_id("highlight_reel")
    assert w is not None
    assert w["edit_style"] == "highlights"


def test_datasets_by_ids():
    ds = datasets_by_ids(["inbox_local"])
    assert len(ds) == 1


def test_merge_steering_inherits_workflow_defaults():
    s = merge_steering(workflow_id="compilation_dense")
    assert s["edit_style"] == "compilation"
    assert s["directives"]["pacing"] == "tight"


def test_parse_trigger():
    assert parse_trigger("manual_local") == TriggerMode.MANUAL_LOCAL
