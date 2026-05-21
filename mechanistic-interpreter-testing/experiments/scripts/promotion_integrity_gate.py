#!/usr/bin/env python3
"""
Combined promotion integrity check: certificate binding (AW-036) then NSHR (AW-035).
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "trace" / "scripts"))

from verify_certificate_binding import CertificateBindingError, verify_certificate_binding  # noqa: E402

REASON_CERT_MISMATCH = "CERT_MISMATCH"


def main() -> int:
    parser = argparse.ArgumentParser(description="Promotion integrity gate")
    parser.add_argument("--trace", type=Path, required=True)
    parser.add_argument("--cert", type=Path, required=True)
    parser.add_argument("--ablation-csv", type=Path)
    parser.add_argument("--prereg", type=Path)
    args = parser.parse_args()

    trace = json.loads(args.trace.read_text(encoding="utf-8"))
    cert = json.loads(args.cert.read_text(encoding="utf-8"))

    try:
        verify_certificate_binding(trace, cert)
    except CertificateBindingError as e:
        print(json.dumps(e.report.to_dict(), indent=2))
        print(f"BLOCKED: {REASON_CERT_MISMATCH}", file=sys.stderr)
        return 10

    if args.ablation_csv and args.prereg:
        script = ROOT / "experiments" / "scripts" / "nshr_promotion_gate.py"
        proc = subprocess.run(
            [sys.executable, str(script), "--csv", str(args.ablation_csv), "--prereg", str(args.prereg)],
            capture_output=False,
        )
        return proc.returncode

    print(json.dumps({"reason_code": "CERT_BINDING_OK"}, indent=2))
    print("OK: certificate binding only (no NSHR CSV supplied)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
