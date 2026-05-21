#!/usr/bin/env python3
"""AW-036 evidence: SWAP-CERT detector blocks wrong trace/certificate pairs."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "trace" / "scripts"))

from verify_certificate_binding import (  # noqa: E402
    CertificateBindingError,
    verify_certificate_binding,
)

FIXTURES = ROOT / "trace" / "fixtures"
LOG_OUT = FIXTURES / "swap-cert-test-log.jsonl"

SCENARIOS = [
    {
        "scenario": "bound_trace47",
        "trace": FIXTURES / "trace-47-v0.json",
        "cert": FIXTURES / "certificate-trace-47-v0.json",
        "expect_ok": True,
    },
    {
        "scenario": "bound_calculator",
        "trace": FIXTURES / "trace-calculator-v0.json",
        "cert": FIXTURES / "certificate-calculator-v0.json",
        "expect_ok": True,
    },
    {
        "scenario": "swap_cert_trace47_cert_on_calculator",
        "trace": FIXTURES / "trace-calculator-v0.json",
        "cert": FIXTURES / "certificate-trace-47-v0.json",
        "expect_ok": False,
        "expect_reason": "CERT_MISMATCH",
    },
    {
        "scenario": "swap_cert_calculator_cert_on_trace47",
        "trace": FIXTURES / "trace-47-v0.json",
        "cert": FIXTURES / "certificate-calculator-v0.json",
        "expect_ok": False,
        "expect_reason": "CERT_MISMATCH",
    },
]


def run_scenario(spec: dict) -> dict:
    trace = json.loads(spec["trace"].read_text(encoding="utf-8"))
    cert = json.loads(spec["cert"].read_text(encoding="utf-8"))
    try:
        report = verify_certificate_binding(trace, cert)
        ok = True
        payload = {"scenario": spec["scenario"], **report.to_dict()}
    except CertificateBindingError as e:
        ok = False
        payload = {"scenario": spec["scenario"], **e.report.to_dict()}
    payload["expect_ok"] = spec["expect_ok"]
    payload["passed"] = ok == spec["expect_ok"]
    if not spec["expect_ok"]:
        payload["expect_reason"] = spec.get("expect_reason", "CERT_MISMATCH")
    return payload


def main() -> int:
    results = [run_scenario(s) for s in SCENARIOS]
    lines = [json.dumps(r, sort_keys=True) for r in results]
    LOG_OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")

    for line in lines:
        print(line)

    if not all(r["passed"] for r in results):
        print("FAIL: one or more scenarios did not meet expectation", file=sys.stderr)
        return 1

    swap_failures = [r for r in results if r.get("reason_code") == "CERT_MISMATCH"]
    if len(swap_failures) < 2:
        print("FAIL: expected at least two CERT_MISMATCH cases", file=sys.stderr)
        return 1

    print(f"OK: wrote {LOG_OUT} — SWAP-CERT blocked, valid bindings accepted")
    return 0


if __name__ == "__main__":
    sys.exit(main())
