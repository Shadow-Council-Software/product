#!/usr/bin/env python3
"""
Replay divergence classifier stub (AW-022).

Reason codes (FR13 direction):
  SCHEMA_DRIFT  — structure, validation, version mismatch
  ENV_DRIFT     — replay envelope / policy / model identity mismatch
  OUTPUT_DRIFT  — semantic replay output differs from expected
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from enum import Enum
from typing import Any


class DivergenceCode(str, Enum):
    SCHEMA_DRIFT = "SCHEMA_DRIFT"
    ENV_DRIFT = "ENV_DRIFT"
    OUTPUT_DRIFT = "OUTPUT_DRIFT"


@dataclass(frozen=True)
class DivergenceReport:
    code: DivergenceCode
    message: str
    details: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return {
            "code": self.code.value,
            "message": self.message,
            "details": self.details,
        }


class ReplayDivergenceError(Exception):
    """Raised when replay fails with a classified reason code."""

    def __init__(self, report: DivergenceReport):
        self.report = report
        super().__init__(f"{report.code.value}: {report.message}")


def classify_validation_failure(errors: list[str]) -> DivergenceReport:
    return DivergenceReport(
        code=DivergenceCode.SCHEMA_DRIFT,
        message="Trace or certificate failed structural validation",
        details={"validation_errors": errors},
    )


def classify_env_mismatch(
    field: str,
    expected: str,
    actual: str,
) -> DivergenceReport:
    return DivergenceReport(
        code=DivergenceCode.ENV_DRIFT,
        message=f"Replay envelope mismatch on {field}",
        details={"field": field, "expected": expected, "actual": actual},
    )


def classify_output_mismatch(
    span_id: str,
    expected_digest: str | None,
    actual_digest: str | None,
    detail: str | None = None,
) -> DivergenceReport:
    return DivergenceReport(
        code=DivergenceCode.OUTPUT_DRIFT,
        message=f"Replay output mismatch on span {span_id}",
        details={
            "span_id": span_id,
            "expected_digest": expected_digest,
            "actual_digest": actual_digest,
            "detail": detail,
        },
    )


def assert_env_match(
    trace: dict[str, Any],
    *,
    replay_envelope_id: str | None = None,
    policy_snapshot_id: str | None = None,
) -> None:
    if replay_envelope_id and trace.get("replay_envelope_id") != replay_envelope_id:
        raise ReplayDivergenceError(
            classify_env_mismatch(
                "replay_envelope_id",
                replay_envelope_id,
                str(trace.get("replay_envelope_id")),
            )
        )
    if policy_snapshot_id and trace.get("policy_snapshot_id") != policy_snapshot_id:
        raise ReplayDivergenceError(
            classify_env_mismatch(
                "policy_snapshot_id",
                policy_snapshot_id,
                str(trace.get("policy_snapshot_id")),
            )
        )


def check_certificate_env(
    trace: dict[str, Any],
    cert: dict[str, Any],
) -> None:
    for field in ("replay_envelope_id", "policy_snapshot_id", "trace_id"):
        tv, cv = trace.get(field), cert.get(field)
        if tv != cv:
            raise ReplayDivergenceError(
                classify_env_mismatch(
                    field,
                    str(cv),
                    str(tv),
                )
            )


def format_report_line(report: DivergenceReport, scenario: str) -> str:
    return json.dumps({"scenario": scenario, **report.to_dict()}, sort_keys=True)
