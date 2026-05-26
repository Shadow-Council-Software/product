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


def test_job_report_written_under_data_jobs():
    state = build_initial_state(
        workflow_id="compilation_dense",
        dataset_ids=["inbox_local"],
        trigger="manual_local",
        dry_run=True,
    )
    path = write_job_report(state)
    assert jobs_root() in path.parents or path.parent.name == state["job_id"]
