"""Story-level coverage for previously implemented-unverified stories.

Each test cites the sprint-status story it verifies:
  1-4  job_id + supervisor observability
  2-2  dataset path expansion (glob / after_date)
  3-1  local ingest trigger
  3-3  discovery retry routing
  4-2  audio/visual scoring filter (weight merge + min_score)
  4-4  timeline sequencing (dedupe, narrative order, target cap)
"""
from __future__ import annotations

import json
from pathlib import Path

from clipforge.agents.orchestrator import (
    _need_more_segments,
    discover_again_node,
    supervisor_node,
)
from clipforge.agents.sequencing_agent import sequencing_node
from clipforge.agents.supervisor import build_initial_state
from clipforge.sources.adapters.local_folder import LocalFolderAdapter


# --- Story 1-4: job_id and supervisor observability -------------------------

def test_job_ids_are_unique_per_job():
    a = build_initial_state(
        workflow_id="compilation_dense",
        dataset_ids=["inbox_local"],
        trigger="manual_local",
    )
    b = build_initial_state(
        workflow_id="compilation_dense",
        dataset_ids=["inbox_local"],
        trigger="manual_local",
    )
    assert a["job_id"] and b["job_id"]
    assert a["job_id"] != b["job_id"]
    assert len(a["job_id"]) == 8


def test_supervisor_emits_observability_message():
    state = build_initial_state(
        workflow_id="compilation_dense",
        dataset_ids=["inbox_local"],
        trigger="manual_local",
    )
    out = supervisor_node(state)
    msgs = out.get("messages") or []
    assert msgs, "supervisor must append an observability message"
    content = msgs[-1]["content"]
    assert "workflow=compilation_dense" in content
    assert "trigger=manual_local" in content


# --- Story 2-2: dataset path expansion ---------------------------------------

def _touch_video(path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(b"\x00\x00\x00\x18ftypmp42")
    return path


def test_recursive_glob_expands_nested_dirs_and_skips_non_video(tmp_path):
    _touch_video(tmp_path / "a.mp4")
    _touch_video(tmp_path / "nested" / "deeper" / "b.mov")
    (tmp_path / "notes.txt").write_text("not media")

    adapter = LocalFolderAdapter()
    refs = adapter.discover(
        {"paths": [str(tmp_path / "**")]},
        {"clipforge_root": str(tmp_path)},
    )
    names = sorted(Path(r.uri).name for r in refs)
    assert names == ["a.mp4", "b.mov"]


def test_after_date_filters_old_media(tmp_path):
    import os

    old = _touch_video(tmp_path / "old.mp4")
    new = _touch_video(tmp_path / "new.mp4")
    # 2020-01-01 mtime for the old file; leave the new one at "now".
    os.utime(old, (1577836800, 1577836800))

    adapter = LocalFolderAdapter()
    refs = adapter.discover(
        {"paths": [str(tmp_path / "*")], "after_date": "2025-01-01"},
        {"clipforge_root": str(tmp_path)},
    )
    assert [Path(r.uri).name for r in refs] == [new.name]


# --- Story 3-1: local ingest trigger -----------------------------------------

def _ingest_state(**extra):
    state = build_initial_state(
        workflow_id="compilation_dense",
        dataset_ids=["inbox_local"],
        trigger="manual_local",
    )
    state.update(extra)
    return state


def test_ingest_node_populates_paths_from_dataset(tmp_path, monkeypatch):
    import clipforge.agents.ingest_agent as ingest_mod

    _touch_video(tmp_path / "inbox" / "clip.mp4")
    monkeypatch.setattr(
        ingest_mod,
        "datasets_by_ids",
        lambda ids: [
            {
                "id": "inbox_local",
                "sources": [
                    {"type": "local_folder", "paths": [str(tmp_path / "inbox" / "**")]}
                ],
            }
        ],
    )

    out = ingest_mod.ingest_node(_ingest_state())
    assert out["ingested_paths"], f"errors={out.get('errors')}"
    assert out["ingested_paths"][0].endswith("clip.mp4")
    assert any(r["type"] == "local_folder" for r in out["source_refs"])
    assert not out["errors"]


def test_ingest_node_reports_error_when_inbox_empty(tmp_path, monkeypatch):
    import clipforge.agents.ingest_agent as ingest_mod

    (tmp_path / "empty").mkdir()
    monkeypatch.setattr(
        ingest_mod,
        "datasets_by_ids",
        lambda ids: [
            {
                "id": "inbox_local",
                "sources": [
                    {"type": "local_folder", "paths": [str(tmp_path / "empty" / "**")]}
                ],
            }
        ],
    )

    out = ingest_mod.ingest_node(_ingest_state(dry_run=False))
    assert out["ingested_paths"] == []
    assert any("no local media" in e for e in out["errors"])


# --- Story 3-3: discovery retry routing --------------------------------------

def _routing_state(**overrides):
    state = {
        "trigger_mode": "hybrid",
        "steering": {"discovery": {"enabled": True}},
        "timeline_plan": [],
        "target_duration_minutes": 1.0,
        "discovery_retries": 0,
        "_discovery_max_retries": 3,
    }
    state.update(overrides)
    return state


def test_short_plan_with_discovery_enabled_retries():
    assert _need_more_segments(_routing_state()) == "discover_again"


def test_retry_budget_exhausted_routes_to_resolve():
    assert _need_more_segments(_routing_state(discovery_retries=3)) == "resolve"


def test_manual_local_trigger_never_retries():
    assert _need_more_segments(_routing_state(trigger_mode="manual_local")) == "resolve"


def test_plan_meeting_target_routes_to_resolve():
    plan = [{"duration_sec": 60.0}]
    assert _need_more_segments(_routing_state(timeline_plan=plan)) == "resolve"


def test_discover_again_increments_retry_counter():
    out = discover_again_node(_routing_state(discovery_retries=1))
    assert out["discovery_retries"] == 2


# --- Story 4-2: audio/visual weight merge + min_score filter -----------------

def test_analysis_merges_audio_visual_weights_and_filters(tmp_path, monkeypatch):
    import copy

    import clipforge.agents.analysis_agent as mod
    from clipforge.lib.config import load_settings

    settings = copy.deepcopy(load_settings())
    clips_dir = tmp_path / "qualified"
    settings["paths"]["clips_qualified"] = str(clips_dir)
    settings["analysis"]["bootstrap_segment_if_empty"] = False
    monkeypatch.setattr(mod, "load_settings", lambda: settings)

    media = tmp_path / "fake.mp4"
    media.write_bytes(b"\x00")

    def fake_score_segments(path, **kwargs):
        return [
            {"source": str(path), "start_sec": 0.0, "end_sec": 5.0,
             "duration_sec": 5.0, "segment_score": 0.9},
            {"source": str(path), "start_sec": 10.0, "end_sec": 15.0,
             "duration_sec": 5.0, "segment_score": 0.1},
        ]

    monkeypatch.setattr(mod, "score_segments", fake_score_segments)
    monkeypatch.setattr(mod, "score_audio_segment", lambda *a, **k: 0.5)
    monkeypatch.setattr(mod, "trim_segment_to_peak_window", lambda seg, **k: seg)
    monkeypatch.setattr(mod, "extract_segment_clip", lambda *a, **k: None)
    monkeypatch.setattr(mod, "_video_duration", lambda p: 20.0)

    state = _ingest_state(
        ingested_paths=[str(media)],
        min_segment_score=0.5,
    )
    # Pin the weights explicitly so the expected value is a fixed constant —
    # reading them back from the same config the code uses would make this
    # assertion true by construction regardless of the actual weighting.
    state["steering"]["directives"]["ranking"] = {
        "visual_weight": 0.6,
        "audio_weight": 0.4,
    }

    out = mod.analysis_node(state)
    kept = out["segment_candidates"]

    # Only the high-visual segment survives min_score=0.5 after the merge.
    assert len(kept) == 1
    # (0.6 * 0.9 + 0.4 * 0.5) / (0.6 + 0.4)
    assert abs(kept[0]["segment_score"] - 0.74) < 1e-9
    assert kept[0]["audio_score"] == 0.5

    # Exactly one sidecar: the rejected segment writes none.
    sidecars = list(clips_dir.glob("*.json"))
    assert len(sidecars) == 1
    data = json.loads(sidecars[0].read_text())
    assert data["start_sec"] == 0.0


# --- Story 4-4: timeline sequencing ------------------------------------------

def _seq_state(segments, *, edit_style="compilation", target_minutes=30):
    return {
        "steering": {
            "edit_style": edit_style,
            "directives": {"target_minutes": target_minutes, "transitions": "cut"},
        },
        "target_duration_minutes": target_minutes,
        "segment_candidates": segments,
    }


def test_sequencing_dedupes_same_source_window_keeping_best():
    segments = [
        {"source": "a.mp4", "start_sec": 1.0, "duration_sec": 4.0, "segment_score": 0.6},
        {"source": "a.mp4", "start_sec": 2.0, "duration_sec": 4.0, "segment_score": 0.9},
        {"source": "b.mp4", "start_sec": 1.0, "duration_sec": 4.0, "segment_score": 0.5},
    ]
    plan = sequencing_node(_seq_state(segments))["timeline_plan"]
    a_entries = [p for p in plan if p["source"] == "a.mp4"]
    assert len(a_entries) == 1, "same-source segments in one 5s window must dedupe"
    assert a_entries[0]["segment_score"] == 0.9
    assert len(plan) == 2


def test_sequencing_narrative_preserves_source_order():
    segments = [
        {"source": "b.mp4", "start_sec": 5.0, "duration_sec": 3.0, "segment_score": 0.99},
        {"source": "a.mp4", "start_sec": 9.0, "duration_sec": 3.0, "segment_score": 0.10},
        {"source": "a.mp4", "start_sec": 1.0, "duration_sec": 3.0, "segment_score": 0.50},
    ]
    plan = sequencing_node(_seq_state(segments, edit_style="narrative"))["timeline_plan"]
    order = [(p["source"], p["start_sec"]) for p in plan]
    assert order == [("a.mp4", 1.0), ("a.mp4", 9.0), ("b.mp4", 5.0)]


def test_sequencing_stops_at_target_duration():
    # Three 30s segments in distinct windows; 1-minute target fits only two.
    segments = [
        {"source": f"s{i}.mp4", "start_sec": 0.0, "duration_sec": 30.0,
         "segment_score": 1.0 - i * 0.1}
        for i in range(3)
    ]
    plan = sequencing_node(_seq_state(segments, target_minutes=1))["timeline_plan"]
    assert len(plan) == 2
    assert sum(p["duration_sec"] for p in plan) <= 60.0
    assert all(p["transition"] == "cut" for p in plan)
