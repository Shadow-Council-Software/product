#!/usr/bin/env python3
"""ClipForge POC — LangGraph entry point."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT.parent))

from clipforge.agents.orchestrator import run_pipeline
from clipforge.lib.config import load_settings


def cmd_run(args: argparse.Namespace) -> int:
    settings = load_settings()
    initial = {
        "performer_ids": args.performers,
        "target_minutes": args.target_minutes,
        "min_dramatic_score": args.min_dramatic_score,
        "dry_run": args.dry_run,
        "search_urls": args.url or [],
        "search_retries": 0,
        "errors": [],
    }
    if args.url:
        initial["search_urls"] = list(args.url)

    result = run_pipeline(initial)
    print(result.get("report") or "Pipeline finished.")
    if result.get("output_path"):
        print(f"Output: {result['output_path']}")
    if result.get("errors"):
        print("Errors:", file=sys.stderr)
        for err in result["errors"]:
            print(f"  - {err}", file=sys.stderr)
        return 1
    return 0


def cmd_test_resolve(_: argparse.Namespace) -> int:
    script = ROOT / "resolve_scripts" / "resolve_editor.py"
    import subprocess

    r = subprocess.run([sys.executable, str(script), "--dry-run"], check=False)
    return r.returncode


def cmd_analyze(args: argparse.Namespace) -> int:
    from clipforge.cv.throat_detector import analyze_video_segments

    segments = analyze_video_segments(
        Path(args.input),
        min_score=args.min_score,
    )
    print(f"Found {len(segments)} candidate segments")
    for seg in segments[:10]:
        print(seg)
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="clipforge", description="ClipForge throatpie POC")
    sub = p.add_subparsers(dest="command", required=True)

    run = sub.add_parser("run", help="Execute full LangGraph pipeline")
    run.add_argument("--performers", nargs="+", default=["morgpie"])
    run.add_argument("--target-minutes", type=float, default=None)
    run.add_argument("--min-dramatic-score", type=float, default=None)
    run.add_argument("--url", action="append", default=[])
    run.add_argument("--dry-run", action="store_true")
    run.set_defaults(func=cmd_run)

    tr = sub.add_parser("test-resolve", help="Verify Resolve script wiring")
    tr.set_defaults(func=cmd_test_resolve)

    an = sub.add_parser("analyze", help="Run CV analysis on a single file")
    an.add_argument("--input", required=True)
    an.add_argument("--min-score", type=float, default=0.85)
    an.set_defaults(func=cmd_analyze)

    return p


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    if args.command == "run" and args.target_minutes is None:
        args.target_minutes = float(load_settings().get("pipeline", {}).get("target_minutes", 30))
    if args.command == "run" and args.min_dramatic_score is None:
        args.min_dramatic_score = float(
            load_settings().get("pipeline", {}).get("min_dramatic_score", 0.85)
        )
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
