#!/usr/bin/env python3
"""
Certificate-to-trace binding verification (AW-036 / Trace-47 Phase B).

Detects SWAP-CERT: valid certificate paired with wrong trace.
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

REASON_CERT_MISMATCH = "CERT_MISMATCH"
REASON_CERT_INCOMPLETE = "CERT_SPAN_COVERAGE_GAP"


@dataclass(frozen=True)
class CertificateBindingReport:
    reason_code: str
    message: str
    details: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return {
            "reason_code": self.reason_code,
            "message": self.message,
            "details": self.details,
        }


class CertificateBindingError(Exception):
    def __init__(self, report: CertificateBindingReport):
        self.report = report
        super().__init__(f"{report.reason_code}: {report.message}")


def _trace_span_ids(trace: dict[str, Any]) -> set[str]:
    return {s["span_id"] for s in trace.get("spans", []) if isinstance(s, dict)}


def verify_certificate_binding(
    trace: dict[str, Any],
    certificate: dict[str, Any],
    *,
    require_exact_span_coverage: bool = False,
) -> CertificateBindingReport:
    """
    Returns OK report if binding holds; raises CertificateBindingError otherwise.
    """
    mismatches: list[dict[str, str]] = []

    for field in ("trace_id", "replay_envelope_id", "policy_snapshot_id"):
        tv = trace.get(field)
        cv = certificate.get(field)
        if tv != cv:
            mismatches.append({"field": field, "expected": str(cv), "actual": str(tv)})

    trace_spans = _trace_span_ids(trace)
    cert_spans = set(certificate.get("span_ids") or [])
    missing = cert_spans - trace_spans
    if missing:
        mismatches.append(
            {
                "field": "span_ids",
                "expected": f"subset of {sorted(trace_spans)}",
                "actual": f"unknown span_ids {sorted(missing)}",
            }
        )

    if require_exact_span_coverage and cert_spans != trace_spans:
        raise CertificateBindingError(
            CertificateBindingReport(
                reason_code=REASON_CERT_INCOMPLETE,
                message="Certificate span set does not match trace span set",
                details={
                    "trace_span_ids": sorted(trace_spans),
                    "certificate_span_ids": sorted(cert_spans),
                },
            )
        )

    if mismatches:
        raise CertificateBindingError(
            CertificateBindingReport(
                reason_code=REASON_CERT_MISMATCH,
                message="Certificate not bound to trace (SWAP-CERT detected)",
                details={"mismatches": mismatches},
            )
        )

    return CertificateBindingReport(
        reason_code="CERT_BINDING_OK",
        message="Certificate bound to trace",
        details={
            "trace_id": trace.get("trace_id"),
            "certificate_hash": certificate.get("certificate_hash"),
            "span_ids": sorted(cert_spans),
        },
    )


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    if len(sys.argv) != 3:
        print(
            f"Usage: {sys.argv[0]} <trace.json> <certificate.json>",
            file=sys.stderr,
        )
        return 2

    trace = load_json(Path(sys.argv[1]))
    cert = load_json(Path(sys.argv[2]))
    try:
        report = verify_certificate_binding(trace, cert)
        print(json.dumps(report.to_dict(), indent=2))
        print("OK: certificate binding verified")
        return 0
    except CertificateBindingError as e:
        print(json.dumps(e.report.to_dict(), indent=2))
        print(f"BLOCKED: {e.report.reason_code}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
