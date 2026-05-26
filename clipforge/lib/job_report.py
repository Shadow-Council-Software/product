from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from clipforge.lib.config import load_settings


def jobs_root() -> Path:
    settings = load_settings()
    base = Path(__file__).resolve().parent.parent
    jobs = Path(settings.get("paths", {}).get("jobs", "data/jobs"))
    if not jobs.is_absolute():
        jobs = base / jobs
    return jobs


def write_job_report(state: dict[str, Any]) -> Path:
    """Persist job report JSON for operator audit (CF-FR-03)."""
    job_id = state.get("job_id") or "unknown"
    out_dir = jobs_root() / job_id
    out_dir.mkdir(parents=True, exist_ok=True)

    report = {
        "job_id": job_id,
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "workflow_id": state.get("workflow_id"),
        "dataset_ids": state.get("dataset_ids"),
        "trigger_mode": state.get("trigger_mode"),
        "dry_run": state.get("dry_run"),
        "segment_count": len(state.get("segment_candidates") or []),
        "timeline_count": len(state.get("timeline_plan") or []),
        "ingested_paths": state.get("ingested_paths") or [],
        "source_urls": state.get("source_urls") or [],
        "output_path": state.get("output_path"),
        "report": state.get("report"),
        "errors": state.get("errors") or [],
        "discovery_retries": state.get("discovery_retries"),
    }

    path = out_dir / "report.json"
    path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    return path
