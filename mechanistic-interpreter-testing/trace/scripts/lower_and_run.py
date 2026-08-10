#!/usr/bin/env python3
"""Lower trace to bytecode v0 and execute stub VM (AW-041).

The certificate matching the trace is required: it is resolved from
certificate-*.json files next to the trace (by trace_id), verified for
binding (including digest recomputation), and its hash embedded in the
lowered program. Use --cert to point at a certificate explicitly.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

from bytecode_vm import BytecodeVM, lower_trace, outcome_digest  # noqa: E402
from verify_certificate_binding import (  # noqa: E402
    CertificateBindingError,
    verify_certificate_binding,
)


def final_span_outcome(trace: dict[str, Any]) -> dict[str, Any]:
    for span in reversed(trace["spans"]):
        if span.get("kind") == "TRANSFORM":
            inline = span.get("outputs_ref", {}).get("inline") or {}
            if inline:
                return inline
    raise ValueError("no final TRANSFORM outcome in trace")


def resolve_certificate(trace: dict[str, Any], trace_path: Path) -> tuple[Path, dict[str, Any]]:
    """Find the certificate bound to this trace among certificate-*.json siblings."""
    trace_id = trace["trace_id"]
    candidates = sorted(trace_path.parent.glob("certificate-*.json"))
    for cand in candidates:
        try:
            cert = json.loads(cand.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if isinstance(cert, dict) and cert.get("trace_id") == trace_id:
            return cand, cert
    raise FileNotFoundError(
        f"no certificate with trace_id {trace_id!r} found among "
        f"{[c.name for c in candidates]} in {trace_path.parent} "
        "(freeze one with freeze_certificate.py --write, or pass --cert)"
    )


def main() -> int:
    if len(sys.argv) < 2:
        print(
            f"Usage: {sys.argv[0]} <trace.json> [--cert certificate.json] [--write bytecode.json]",
            file=sys.stderr,
        )
        return 2

    trace_path = Path(sys.argv[1])
    write_path: Path | None = None
    cert_path: Path | None = None
    args = sys.argv[2:]
    i = 0
    while i < len(args):
        if args[i] == "--write" and i + 1 < len(args):
            write_path = Path(args[i + 1])
            i += 2
        elif args[i] == "--cert" and i + 1 < len(args):
            cert_path = Path(args[i + 1])
            i += 2
        else:
            print(f"unknown arg: {args[i]}", file=sys.stderr)
            return 2

    try:
        trace = json.loads(trace_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        print(f"ERROR: cannot read trace {trace_path}: {e}", file=sys.stderr)
        return 2

    if not isinstance(trace, dict) or "trace_id" not in trace or "spans" not in trace:
        print(
            f"ERROR: {trace_path} is not a trace-v0 document (missing trace_id/spans)",
            file=sys.stderr,
        )
        return 2

    try:
        if cert_path is not None:
            cert = json.loads(cert_path.read_text(encoding="utf-8"))
        else:
            cert_path, cert = resolve_certificate(trace, trace_path)
    except (OSError, json.JSONDecodeError, FileNotFoundError) as e:
        print(f"ERROR: certificate resolution failed: {e}", file=sys.stderr)
        return 2

    try:
        verify_certificate_binding(trace, cert)
    except CertificateBindingError as e:
        print(json.dumps(e.report.to_dict(), indent=2))
        print(
            f"ERROR: certificate {cert_path} is not bound to trace {trace_path} "
            f"({e.report.reason_code}); refusing to embed its hash",
            file=sys.stderr,
        )
        return 1

    cert_hash = cert.get("certificate_hash")

    try:
        program = lower_trace(trace, cert_hash)
        expected = final_span_outcome(trace)
    except (KeyError, ValueError) as e:
        print(f"ERROR: cannot lower {trace_path}: {e}", file=sys.stderr)
        return 2

    outcome = BytecodeVM().execute(program)
    expected_digest = outcome_digest(expected)
    actual_digest = outcome_digest(outcome)

    print(json.dumps(program, indent=2))
    print(json.dumps({"vm_outcome": outcome, "expected": expected}, indent=2))
    print(f"expected_digest: {expected_digest}")
    print(f"actual_digest:   {actual_digest}")

    if outcome != expected:
        print("FAIL: VM outcome mismatch", file=sys.stderr)
        return 1

    if write_path:
        write_path.write_text(json.dumps(program, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {write_path}")

    print("OK: bytecode VM matches trace terminal outcome")
    return 0


if __name__ == "__main__":
    sys.exit(main())
