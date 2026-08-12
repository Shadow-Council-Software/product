"""POC acceptance gates G1–G5 from prd.md."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest

from clipforge.agents.orchestrator import run_pipeline
from clipforge.agents.supervisor import build_initial_state
from clipforge.lib.job_report import jobs_root, write_job_report
from clipforge.lib.steering import merge_steering

REPO = Path(__file__).resolve().parent.parent.parent
CLIPFORGE = REPO / "clipforge"
MAIN = CLIPFORGE / "main.py"


def _run_cli(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(MAIN), *args],
        cwd=str(REPO),
        capture_output=True,
        text=True,
    )


def test_g1_dry_run_completes_with_report(tmp_path, monkeypatch):
    """G1: dry-run completes; report + state emitted."""
    monkeypatch.chdir(REPO)
    result = run_pipeline(
        build_initial_state(
            workflow_id="compilation_dense",
            dataset_ids=["inbox_local"],
            trigger="manual_local",
            dry_run=True,
        )
    )
    report_path = write_job_report(result)
    assert report_path.exists()
    data = json.loads(report_path.read_text())
    assert data["dry_run"] is True
    assert "job_id" in data


def test_g4_steering_overrides_workflow_defaults():
    """G4: steering changes merged config vs workflow alone."""
    base = merge_steering(workflow_id="compilation_dense")
    steered = merge_steering(
        workflow_id="compilation_dense",
        steering={"directives": {"min_segment_score": 0.99, "target_minutes": 5}},
    )
    assert steered["directives"]["min_segment_score"] == 0.99
    assert base["directives"]["min_segment_score"] != 0.99


def test_g5_watch_three_cycles_dry_run():
    """G5: watch --dry-run --max-cycles 3 exits without crash."""
    proc = _run_cli(
        "watch",
        "--dry-run",
        "--max-cycles",
        "3",
        "--interval-minutes",
        "1",
        "--workflow",
        "compilation_dense",
        "--dataset",
        "inbox_local",
        "--trigger",
        "manual_local",
    )
    assert proc.returncode == 0, proc.stderr
    assert "completed 3 cycle" in proc.stdout


def test_cli_invalid_workflow_rejected():
    proc = _run_cli(
        "run",
        "--dry-run",
        "--workflow",
        "nonexistent_workflow",
        "--dataset",
        "inbox_local",
    )
    assert proc.returncode != 0
    assert "Unknown workflow" in proc.stderr


@pytest.fixture
def sample_video(tmp_path) -> Path | None:
    """Minimal MP4 for G2/G3 when OpenCV available."""
    try:
        import cv2
        import numpy as np
    except ImportError:
        return None

    out = tmp_path / "sample.mp4"
    writer = cv2.VideoWriter(
        str(out),
        cv2.VideoWriter_fourcc(*"mp4v"),
        10.0,
        (160, 120),
    )
    for i in range(30):
        frame = np.full((120, 160, 3), (i * 8) % 255, dtype=np.uint8)
        writer.write(frame)
    writer.release()
    return out


def test_g2_analyze_returns_segments(sample_video):
    """G2: analyze CLI returns scored segments."""
    if sample_video is None:
        pytest.skip("opencv not installed")
    proc = _run_cli("analyze", "--input", str(sample_video), "--min-score", "0.0")
    assert proc.returncode == 0, proc.stderr
    assert "candidate segments" in proc.stdout.lower() or "Found" in proc.stdout


@pytest.fixture
def motion_video(tmp_path) -> Path | None:
    """Synthetic clip with real motion/contrast so analysis finds organic segments."""
    try:
        import cv2
        import numpy as np
    except ImportError:
        return None

    out = tmp_path / "motion_sample.mp4"
    writer = cv2.VideoWriter(
        str(out),
        cv2.VideoWriter_fourcc(*"mp4v"),
        10.0,
        (160, 120),
    )
    # Alternate high-contrast patterns every 5 frames (one per sampled frame at
    # sample_fps=2) so both visual intensity and motion delta clear thresholds.
    for i in range(50):
        frame = np.zeros((120, 160, 3), dtype=np.uint8)
        if (i // 5) % 2 == 0:
            frame[:, 80:] = 255  # half white: high std
        else:
            frame[:30, :] = 255  # quarter white: different std → motion delta
        writer.write(frame)
    writer.release()
    return out


def test_g3_local_media_produces_plan_and_sidecars(tmp_path, motion_video, monkeypatch):
    """G3: local job media → non-bootstrap segments, per-segment sidecars
    (clips_qualified/{stem}_{start:.2f}.json), and a non-empty timeline_plan."""
    if motion_video is None:
        pytest.skip("opencv not installed")

    import copy

    import clipforge.agents.analysis_agent as analysis_agent_mod
    from clipforge.agents.sequencing_agent import sequencing_node
    from clipforge.lib.config import load_settings

    settings = copy.deepcopy(load_settings())
    clips_dir = tmp_path / "clips" / "qualified"
    settings["paths"]["clips_qualified"] = str(clips_dir)
    # Bootstrap segments are excluded from gate evidence by contract.
    settings["analysis"]["bootstrap_segment_if_empty"] = False
    monkeypatch.setattr(analysis_agent_mod, "load_settings", lambda: settings)

    state = build_initial_state(
        workflow_id="compilation_dense",
        dataset_ids=["inbox_local"],
        trigger="manual_local",
        dry_run=False,
    )
    state["ingested_paths"] = [str(motion_video)]
    state["min_segment_score"] = 0.2

    analyzed = analysis_agent_mod.analysis_node(state)
    organic = [
        s for s in (analyzed.get("segment_candidates") or []) if not s.get("bootstrap")
    ]
    assert organic, f"expected organic segments; errors={analyzed.get('errors')}"

    sidecars = sorted(clips_dir.glob(f"{motion_video.stem}_*.json"))
    assert sidecars, "sidecar contract: clips_qualified/{stem}_{start:.2f}.json"
    sidecar = json.loads(sidecars[0].read_text())
    for key in ("source", "start_sec", "end_sec", "segment_score"):
        assert key in sidecar
    assert not sidecar.get("bootstrap"), "bootstrap segments are not gate evidence"

    sequenced = sequencing_node(analyzed)
    assert sequenced.get("timeline_plan"), "G3 requires a non-empty timeline_plan"


def test_job_report_written_under_data_jobs():
    state = build_initial_state(
        workflow_id="compilation_dense",
        dataset_ids=["inbox_local"],
        trigger="manual_local",
        dry_run=True,
    )
    path = write_job_report(state)
    assert jobs_root() in path.parents or path.parent.name == state["job_id"]
