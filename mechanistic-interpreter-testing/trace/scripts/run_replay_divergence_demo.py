#!/usr/bin/env python3
"""
AW-022 evidence generator: three injected replay failures with classified reason codes.

Writes trace/fixtures/replay-divergence-test-log.jsonl
"""

from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from classify_replay_divergence import (
    ReplayDivergenceError,
    assert_env_match,
    format_report_line,
)
from freeze_certificate import freeze_certificate
from validate_trace import collect_validation_errors

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"
CALCULATOR = FIXTURES / "trace-calculator-v0.json"
LOG_OUT = FIXTURES / "replay-divergence-test-log.jsonl"


def scenario_schema_drift() -> dict:
    bad = {"schema_version": "trace-v99", "trace_id": "x", "spans": []}
    errors = collect_validation_errors(bad)
    from classify_replay_divergence import classify_validation_failure

    report = classify_validation_failure(errors or ["empty spans"])
    return json.loads(format_report_line(report, "injected_schema_drift"))


def scenario_env_drift(trace: dict) -> dict:
    try:
        assert_env_match(
            trace,
            replay_envelope_id="envelope-WRONG",
            policy_snapshot_id=trace["policy_snapshot_id"],
        )
        raise AssertionError("expected ENV_DRIFT")
    except ReplayDivergenceError as e:
        return json.loads(format_report_line(e.report, "injected_env_drift"))


def scenario_output_drift(trace: dict) -> dict:
    tampered = copy.deepcopy(trace)
    for span in tampered["spans"]:
        if span["span_id"] == "span-format":
            span["outputs_ref"]["inline"] = {"display": "$999.99 USD (tampered)"}
    try:
        freeze_certificate(tampered)
        raise AssertionError("expected OUTPUT_DRIFT")
    except ReplayDivergenceError as e:
        return json.loads(format_report_line(e.report, "injected_output_drift"))


def main() -> int:
    trace = json.loads(CALCULATOR.read_text(encoding="utf-8"))
    entries = [
        scenario_schema_drift(),
        scenario_env_drift(trace),
        scenario_output_drift(trace),
    ]
    codes = {e["code"] for e in entries}
    expected = {"SCHEMA_DRIFT", "ENV_DRIFT", "OUTPUT_DRIFT"}
    if codes != expected:
        print(f"FAIL: expected codes {expected}, got {codes}", file=sys.stderr)
        return 1

    lines = [json.dumps(e, sort_keys=True) for e in entries]
    LOG_OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    for line in lines:
        print(line)
    print(f"OK: wrote {LOG_OUT} with 3 classified divergence scenarios")
    return 0


if __name__ == "__main__":
    sys.exit(main())
