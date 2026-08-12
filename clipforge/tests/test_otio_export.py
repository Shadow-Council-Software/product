"""CF-FR-46: OTIO handoff artifact tests.

Adversarial by design: every assertion round-trips through the REAL
opentimelineio library (no mocks), fps/duration come from a REAL video file
probed by OpenCV, and the integration test drives the actual resolve_node.

What these tests deliberately do NOT claim: that DaVinci Resolve imports the
file correctly. That requires a Resolve install and stays a manual step in
docs/POC_EXIT.md.
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

# Deliberately NOT importorskip: opentimelineio is a pinned core dependency
# (requirements.txt). A missing install must fail the suite, not skip all
# CF-FR-46 coverage silently.
import opentimelineio as otio

from clipforge.lib.otio_export import export_timeline_plan

FPS = 10.0
FRAMES = 50  # 5.0 seconds


@pytest.fixture
def real_video(tmp_path) -> Path:
    import cv2
    import numpy as np

    out = tmp_path / "source_a.mp4"
    writer = cv2.VideoWriter(
        str(out), cv2.VideoWriter_fourcc(*"mp4v"), FPS, (160, 120)
    )
    for i in range(FRAMES):
        writer.write(np.full((120, 160, 3), (i * 5) % 255, dtype=np.uint8))
    writer.release()
    return out


def _plan_entry(video: Path, start: float, end: float, **extra) -> dict:
    return {
        "source": str(video),
        "start_sec": start,
        "end_sec": end,
        "duration_sec": end - start,
        "segment_score": 0.8,
        "transition": "cut",
        **extra,
    }


def test_round_trip_preserves_order_timing_and_references(tmp_path, real_video):
    plan = [
        _plan_entry(real_video, 1.0, 3.0),
        _plan_entry(real_video, 3.5, 5.0),
    ]
    out = export_timeline_plan(
        plan, tmp_path / "job.otio", timeline_name="TL_G6", job_id="jobx"
    )
    assert out.exists()

    tl = otio.adapters.read_from_file(str(out))
    assert tl.name == "TL_G6"
    assert tl.metadata["clipforge"]["job_id"] == "jobx"
    assert len(tl.tracks) == 1
    assert tl.tracks[0].kind == otio.schema.TrackKind.Video

    clips = list(tl.tracks[0])
    assert len(clips) == 2

    # Timing survives the frame-rounding round trip at the REAL probed fps.
    assert clips[0].source_range.start_time.to_seconds() == pytest.approx(1.0)
    assert clips[0].source_range.duration.to_seconds() == pytest.approx(2.0)
    assert clips[1].source_range.start_time.to_seconds() == pytest.approx(3.5)
    assert clips[0].source_range.start_time.rate == pytest.approx(FPS)

    # Media reference: original source as file URI, real available_range.
    for clip in clips:
        ref = clip.media_reference
        assert ref.target_url == real_video.resolve().as_uri()
        assert ref.available_range.duration.to_seconds() == pytest.approx(
            FRAMES / FPS
        )
        assert clip.metadata["clipforge"]["fps_probed"] is True
        assert clip.metadata["clipforge"]["source_path"] == str(
            real_video.resolve()
        )

    # File is genuinely OTIO JSON, not merely parseable by the library.
    raw = json.loads(out.read_text())
    assert raw["OTIO_SCHEMA"].startswith("Timeline")


def test_duration_falls_back_to_end_minus_start(tmp_path, real_video):
    entry = _plan_entry(real_video, 2.0, 4.0)
    del entry["duration_sec"]
    out = export_timeline_plan([entry], tmp_path / "fallback.otio")
    clip = otio.adapters.read_from_file(str(out)).tracks[0][0]
    assert clip.source_range.duration.to_seconds() == pytest.approx(2.0)


def test_non_cut_transition_preserved_in_metadata_not_invented(
    tmp_path, real_video
):
    plan = [_plan_entry(real_video, 0.0, 2.0, transition="crossfade")]
    out = export_timeline_plan(plan, tmp_path / "t.otio")
    track = otio.adapters.read_from_file(str(out)).tracks[0]
    # No fabricated OTIO Transition objects (import support is inconsistent) —
    # intent is carried honestly in metadata instead (CF-FR-33).
    assert all(isinstance(item, otio.schema.Clip) for item in track)
    assert track[0].metadata["clipforge"]["transition"] == "crossfade"


def test_empty_plan_fails_loudly(tmp_path):
    with pytest.raises(ValueError, match="empty"):
        export_timeline_plan([], tmp_path / "never.otio")
    assert not (tmp_path / "never.otio").exists()


def test_missing_source_fails_loudly(tmp_path):
    with pytest.raises(ValueError, match="source"):
        export_timeline_plan(
            [{"start_sec": 0.0, "end_sec": 2.0}], tmp_path / "never.otio"
        )


def test_nonpositive_duration_fails_loudly(tmp_path, real_video):
    with pytest.raises(ValueError, match="duration"):
        export_timeline_plan(
            [_plan_entry(real_video, 3.0, 3.0)], tmp_path / "never.otio"
        )


def test_explicit_zero_duration_fails_even_with_valid_end(tmp_path, real_video):
    """A present-but-zero duration_sec is malformed data; it must NOT silently
    fall back to end_sec - start_sec."""
    entry = _plan_entry(real_video, 1.0, 3.0)
    entry["duration_sec"] = 0.0
    with pytest.raises(ValueError, match="non-positive duration"):
        export_timeline_plan([entry], tmp_path / "never.otio")


def test_negative_start_fails_loudly(tmp_path, real_video):
    entry = _plan_entry(real_video, 1.0, 3.0)
    entry["start_sec"] = -1.0
    with pytest.raises(ValueError, match="negative start_sec"):
        export_timeline_plan([entry], tmp_path / "never.otio")


def test_sub_frame_duration_fails_instead_of_zero_length_clip(
    tmp_path, real_video
):
    """A duration below half a frame would round to a 0-frame clip that NLEs
    drop or reject; the export must refuse to write it."""
    entry = _plan_entry(real_video, 1.0, 1.01)
    entry["duration_sec"] = 0.01  # 0.1 frames at FPS=10
    with pytest.raises(ValueError, match="zero frames"):
        export_timeline_plan([entry], tmp_path / "never.otio")


def test_non_frame_aligned_times_round_to_nearest_frame(tmp_path, real_video):
    """Unlike the round-trip test (frame-exact inputs), this exercises actual
    rounding: 1.234s at 10 fps is 12.34 frames -> 12 frames -> 1.2s."""
    entry = _plan_entry(real_video, 1.234, 2.984)
    entry["duration_sec"] = 1.75  # 17.5 frames -> banker's rounding -> 18
    out = export_timeline_plan([entry], tmp_path / "rounding.otio")
    clip = otio.adapters.read_from_file(str(out)).tracks[0][0]
    assert clip.source_range.start_time.value == 12
    assert clip.source_range.start_time.to_seconds() == pytest.approx(1.2)
    assert clip.source_range.duration.value == 18


def test_unprobeable_source_falls_back_to_default_fps(tmp_path):
    ghost = tmp_path / "moved_elsewhere.mp4"  # deliberately never created
    out = export_timeline_plan(
        [
            {
                "source": str(ghost),
                "start_sec": 1.0,
                "end_sec": 2.0,
                "duration_sec": 1.0,
            }
        ],
        tmp_path / "ghost.otio",
        default_fps=24.0,
    )
    clip = otio.adapters.read_from_file(str(out)).tracks[0][0]
    assert clip.source_range.start_time.rate == pytest.approx(24.0)
    assert clip.metadata["clipforge"]["fps_probed"] is False
    assert clip.media_reference.available_range is None


def test_resolve_node_writes_otio_even_when_render_fails(
    tmp_path, real_video, monkeypatch
):
    """Integration: the artifact must survive a D-04 Resolve failure.

    subprocess.run is stubbed to fail deterministically: on a machine with
    Resolve Studio installed the real subprocess would otherwise actually
    create a project and start a render (and this test would then fail).
    """
    import copy
    import subprocess as sp

    import clipforge.agents.resolve_agent as mod
    from clipforge.lib.config import load_settings

    settings = copy.deepcopy(load_settings())
    settings["paths"]["output"] = str(tmp_path / "out")
    settings["resolve"]["allow_non_resolve_fallback"] = False
    monkeypatch.setattr(mod, "load_settings", lambda: settings)

    captured_cmds: list[list[str]] = []

    def fake_run(cmd, **kwargs):
        captured_cmds.append(cmd)
        raise sp.CalledProcessError(1, cmd, stderr="DaVinciResolveScript not found")

    monkeypatch.setattr(mod.subprocess, "run", fake_run)

    state = {
        "job_id": "itest",
        "dry_run": False,
        "timeline_plan": [
            _plan_entry(real_video, 0.0, 2.0, clip_path=str(real_video)),
        ],
        "errors": [],
    }
    out_state = mod.resolve_node(state)

    # Render fails — loudly, per D-04.
    assert any("DaVinci Resolve render failed" in e for e in out_state["errors"])
    assert not out_state.get("output_path")

    # The agent -> editor CLI link: configured render settings must reach the
    # command line (the settings.yaml defaults).
    (cmd,) = captured_cmds
    assert "--render-format" in cmd
    assert cmd[cmd.index("--render-format") + 1] == "mp4"
    assert "--render-codec" in cmd
    assert cmd[cmd.index("--render-codec") + 1] == "H264"

    # But the handoff artifact exists and is valid OTIO.
    otio_path = out_state.get("otio_path")
    assert otio_path and Path(otio_path).exists()
    assert Path(otio_path).name == "itest_timeline.otio"
    tl = otio.adapters.read_from_file(otio_path)
    assert len(tl.tracks[0]) == 1


def test_resolve_node_writes_otio_when_no_clips_extracted(
    tmp_path, real_video, monkeypatch
):
    """clip_path: None (extraction failed) must not block the OTIO handoff —
    the artifact references original sources, not extracted clips."""
    import copy

    import clipforge.agents.resolve_agent as mod
    from clipforge.lib.config import load_settings

    settings = copy.deepcopy(load_settings())
    settings["paths"]["output"] = str(tmp_path / "out")
    monkeypatch.setattr(mod, "load_settings", lambda: settings)

    state = {
        "job_id": "noclips",
        "dry_run": False,
        "timeline_plan": [_plan_entry(real_video, 0.0, 2.0, clip_path=None)],
        "errors": [],
    }
    out_state = mod.resolve_node(state)

    assert any("no clip_path entries" in e for e in out_state["errors"])
    assert out_state.get("otio_path")
    assert Path(out_state["otio_path"]).exists()


def test_resolve_node_empty_plan_reports_otio_skip_loudly(tmp_path, monkeypatch):
    """An empty plan never reaches the exporter (guarded), so the agent itself
    must say the artifact was not written — no silent otio_path: None."""
    import copy

    import clipforge.agents.resolve_agent as mod
    from clipforge.lib.config import load_settings

    settings = copy.deepcopy(load_settings())
    settings["paths"]["output"] = str(tmp_path / "out")
    monkeypatch.setattr(mod, "load_settings", lambda: settings)

    out_state = mod.resolve_node(
        {"job_id": "emptyplan", "dry_run": False, "timeline_plan": [], "errors": []}
    )
    assert out_state.get("otio_path") is None
    assert any("OTIO artifact not written" in e for e in out_state["errors"])
