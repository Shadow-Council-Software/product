from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from clipforge.agents.orchestrator import run_pipeline
from clipforge.agents.supervisor import build_initial_state
from clipforge.lib.instructions import parse_operator_instructions
from clipforge.lib.job_report import write_job_report
from clipforge.lib.steering import merge_steering
from clipforge.lib.validate import validate_job_definition


@dataclass
class JobRequest:
    instructions: str = ""
    workflow_id: str = "compilation_dense"
    dataset_ids: list[str] = field(default_factory=lambda: ["inbox_local"])
    trigger: str = "manual_local"
    source_urls: list[str] = field(default_factory=list)
    target_minutes: float | None = None
    min_segment_score: float | None = None
    pre_roll_max_sec: float | None = None
    post_roll_max_sec: float | None = None
    dry_run: bool = False
    discovery_enabled: bool = False
    discovery_queries: list[str] = field(default_factory=list)


@dataclass
class JobResult:
    success: bool
    job_id: str
    report_path: str
    output_path: str | None
    message: str
    log: str
    errors: list[str]


def run_job(request: JobRequest) -> JobResult:
    """Execute full pipeline from UI or API request."""
    log_lines: list[str] = []

    def log(msg: str) -> None:
        log_lines.append(msg)

    errors = validate_job_definition(request.workflow_id, request.dataset_ids)
    if errors:
        return JobResult(
            success=False,
            job_id="",
            report_path="",
            output_path=None,
            message="Validation failed",
            log="\n".join(errors),
            errors=errors,
        )

    parsed = parse_operator_instructions(request.instructions)
    steering_overlay: dict[str, Any] = {
        "directives": parsed.get("directives", {}),
        "discovery": parsed.get("discovery", {}),
        "sources": {"urls": list(request.source_urls)},
    }
    if request.discovery_enabled:
        steering_overlay["discovery"]["enabled"] = True
        steering_overlay["discovery"]["queries"] = list(request.discovery_queries)
    if request.source_urls:
        steering_overlay["sources"]["urls"] = list(request.source_urls)

    dirs = steering_overlay["directives"]
    if request.target_minutes is not None:
        dirs["target_minutes"] = request.target_minutes
    if request.min_segment_score is not None:
        dirs["min_segment_score"] = request.min_segment_score
    if request.pre_roll_max_sec is not None:
        dirs["pre_roll_max_sec"] = request.pre_roll_max_sec
    if request.post_roll_max_sec is not None:
        dirs["post_roll_max_sec"] = request.post_roll_max_sec

    steering = merge_steering(
        workflow_id=request.workflow_id,
        steering=steering_overlay,
    )

    initial = build_initial_state(
        workflow_id=request.workflow_id,
        dataset_ids=request.dataset_ids,
        trigger=request.trigger,
        source_urls=request.source_urls,
        dry_run=request.dry_run,
    )
    initial["steering"] = steering
    initial["min_segment_score"] = float(
        dirs.get("min_segment_score", initial.get("min_segment_score", 0.75))
    )
    initial["target_duration_minutes"] = float(
        dirs.get("target_minutes", initial.get("target_duration_minutes", 30))
    )

    log(f"Job {initial['job_id']}: workflow={request.workflow_id} trigger={request.trigger}")
    log(f"Instructions: {request.instructions[:200]}...")

    result = run_pipeline(initial)
    report_path = write_job_report(result)
    log(f"Report: {report_path}")
    log(result.get("report") or "Pipeline finished.")

    out_errors = list(result.get("errors") or [])
    for e in out_errors:
        log(f"ERROR: {e}")

    output_path = result.get("output_path")
    success = bool(output_path) and not out_errors
    if output_path and Path(output_path).exists():
        success = True
    elif result.get("report") and not out_errors:
        success = True

    return JobResult(
        success=success,
        job_id=initial["job_id"],
        report_path=str(report_path),
        output_path=output_path,
        message=result.get("report") or ("Completed with errors" if out_errors else "Completed"),
        log="\n".join(log_lines),
        errors=out_errors,
    )
