#!/usr/bin/env python3
"""ClipForge — editor-simulation pipeline (content- and style-agnostic)."""
from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT.parent) not in sys.path:
    sys.path.insert(0, str(ROOT.parent))

from clipforge.agents.orchestrator import run_pipeline
from clipforge.agents.supervisor import build_initial_state
from clipforge.cv.segment_scorer import score_segments
from clipforge.lib.job_report import write_job_report
from clipforge.lib.validate import validate_job_definition
from clipforge.triggers import TriggerMode


def cmd_run(args: argparse.Namespace) -> int:
    validation_errors = validate_job_definition(args.workflow, args.dataset)
    if validation_errors:
        for err in validation_errors:
            print(f"Error: {err}", file=sys.stderr)
        return 1

    initial = build_initial_state(
        workflow_id=args.workflow,
        dataset_ids=args.dataset,
        trigger=args.trigger,
        steering_path=args.steering,
        source_urls=getattr(args, "url", None) or [],
        dry_run=args.dry_run,
    )
    if getattr(args, "target_minutes", None) is not None:
        initial["target_duration_minutes"] = args.target_minutes
        initial["steering"]["directives"]["target_minutes"] = args.target_minutes
    if getattr(args, "min_score", None) is not None:
        initial["min_segment_score"] = args.min_score
        initial["steering"]["directives"]["min_segment_score"] = args.min_score

    result = run_pipeline(initial)
    report_path = write_job_report(result)
    print(result.get("report") or "Job finished.")
    print(f"Job report: {report_path}")
    if result.get("output_path"):
        print(f"Output: {result['output_path']}")
    if result.get("errors"):
        print("Errors:", file=sys.stderr)
        for err in result["errors"]:
            print(f"  - {err}", file=sys.stderr)
        return 1
    return 0


def cmd_watch(args: argparse.Namespace) -> int:
    """
    Continuous discovery trigger — polls steering.discovery.poll_interval_minutes.

    Runs the same pipeline on an interval (operator daemon / cron substitute).
    """
    max_cycles = getattr(args, "max_cycles", None)
    interval_sec = max(args.interval_minutes, 1) * 60
    if args.dry_run and interval_sec > 5:
        interval_sec = 0
    print(
        f"watch: interval={interval_sec}s max_cycles={max_cycles or '∞'} (Ctrl+C to stop)"
    )
    cycles = 0
    try:
        while True:
            rc = cmd_run(args)
            cycles += 1
            if rc != 0:
                print(f"watch: job exited {rc}", file=sys.stderr)
            if max_cycles and cycles >= max_cycles:
                print(f"watch: completed {cycles} cycle(s)")
                return 0
            if interval_sec > 0:
                time.sleep(interval_sec)
    except KeyboardInterrupt:
        print("watch: stopped")
    return 0


def cmd_test_resolve(_: argparse.Namespace) -> int:
    script = ROOT / "resolve_scripts" / "resolve_editor.py"
    import subprocess

    return subprocess.run(
        [sys.executable, str(script), "--dry-run"], check=False
    ).returncode


def cmd_analyze(args: argparse.Namespace) -> int:
    segments = score_segments(
        Path(args.input),
        profile=args.profile,
        min_score=args.min_score,
    )
    print(f"Found {len(segments)} candidate segments")
    for seg in segments[:10]:
        print(seg)
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="clipforge",
        description="Simulate a human video editor: datasets + steering + any trigger",
    )
    sub = p.add_subparsers(dest="command", required=True)

    run = sub.add_parser("run", help="Run one editor-simulation job")
    run.add_argument("--workflow", default="compilation_dense")
    run.add_argument("--dataset", nargs="+", default=["inbox_local"])
    run.add_argument(
        "--trigger",
        default=TriggerMode.MANUAL_LOCAL.value,
        choices=[m.value for m in TriggerMode],
    )
    run.add_argument("--steering", help="Path to steering YAML (see config/steering.example.yaml)")
    run.add_argument("--target-minutes", type=float, default=None)
    run.add_argument("--min-score", type=float, default=None)
    run.add_argument("--url", action="append", default=[])
    run.add_argument("--dry-run", action="store_true")
    run.set_defaults(func=cmd_run)

    watch = sub.add_parser("watch", help="Continuous discovery + pipeline loop")
    watch.add_argument("--interval-minutes", type=int, default=60)
    watch.add_argument("--workflow", default="compilation_dense")
    watch.add_argument("--dataset", nargs="+", default=["demo_stock"])
    watch.add_argument("--trigger", default=TriggerMode.DISCOVERY.value)
    watch.add_argument("--steering", default=str(ROOT / "config" / "steering.example.yaml"))
    watch.add_argument("--url", action="append", default=[])
    watch.add_argument("--dry-run", action="store_true")
    watch.add_argument(
        "--max-cycles",
        type=int,
        default=None,
        help="Stop after N cycles (used by tests and bounded daemons)",
    )
    watch.set_defaults(func=cmd_watch)

    tr = sub.add_parser("test-resolve", help="Verify Resolve script wiring")
    tr.set_defaults(func=cmd_test_resolve)

    an = sub.add_parser("analyze", help="Score segments on one file (no graph)")
    an.add_argument("--input", required=True)
    an.add_argument("--profile", default="intensity_peaks")
    an.add_argument("--min-score", type=float, default=0.75)
    an.set_defaults(func=cmd_analyze)

    return p


def main() -> int:
    args = build_parser().parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
