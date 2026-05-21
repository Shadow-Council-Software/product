#!/usr/bin/env python3
"""Lower trace to bytecode v0 and execute stub VM (AW-041)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from bytecode_vm import BytecodeVM, lower_trace, outcome_digest  # noqa: E402


def final_span_outcome(trace: dict[str, Any]) -> dict[str, Any]:
    for span in reversed(trace["spans"]):
        if span.get("kind") == "TRANSFORM":
            inline = span.get("outputs_ref", {}).get("inline") or {}
            if inline:
                return inline
    raise ValueError("no final outcome")


def main() -> int:
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <trace.json> [--write bytecode.json]", file=sys.stderr)
        return 2

    trace_path = Path(sys.argv[1])
    write_path: Path | None = None
    args = sys.argv[2:]
    if len(args) == 2 and args[0] == "--write":
        write_path = Path(args[1])

    trace = json.loads(trace_path.read_text(encoding="utf-8"))
    cert_hash = None
    cert_guess = trace_path.parent / f"certificate-{trace['trace_id']}.json"
    if not cert_guess.exists():
        cert_guess = trace_path.parent / "certificate-calculator-v0.json"
    if cert_guess.exists():
        cert_hash = json.loads(cert_guess.read_text()).get("certificate_hash")

    program = lower_trace(trace, cert_hash)
    outcome = BytecodeVM().execute(program)
    expected = final_span_outcome(trace)
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
