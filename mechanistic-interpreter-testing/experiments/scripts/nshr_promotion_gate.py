#!/usr/bin/env python3
"""
Mock promotion gate from ablation CSV + prereg (AW-035).

Exit codes:
  0 — eligible for promotion (NSHR >= theta, random < ablate)
  1 — NECESSITY_GATE_FAILED (FR18 / FR54 direction)
  2 — FALSE_MECHANISM (random control dominates)
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CSV = ROOT / "experiments" / "fixtures" / "T47-ABLATION-sample.csv"
DEFAULT_PREREG = ROOT / "experiments" / "fixtures" / "trace-47-prereg.example.json"

REASON_NECESSITY_GATE_FAILED = "NECESSITY_GATE_FAILED"
REASON_FALSE_MECHANISM = "FALSE_MECHANISM"


def load_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def compute_rates(rows: list[dict[str, str]]) -> tuple[float, float]:
    n = len(rows)
    if n == 0:
        raise ValueError("empty ablation CSV")
    ablate = sum(1 for r in rows if r.get("flip_ablate", "").lower() == "true") / n
    rand = sum(1 for r in rows if r.get("flip_rand", "").lower() == "true") / n
    return ablate, rand


def evaluate(
    rows: list[dict[str, str]],
    prereg: dict[str, Any],
) -> tuple[int, str, dict[str, float]]:
    theta = float(prereg["theta_nshr"])
    nshr, rand_rate = compute_rates(rows)

    stats = {"nshr": nshr, "random_flip_rate": rand_rate, "theta_nshr": theta}

    if nshr < theta:
        return 1, REASON_NECESSITY_GATE_FAILED, stats
    if rand_rate >= nshr and nshr > 0:
        return 2, REASON_FALSE_MECHANISM, stats
    return 0, "ELIGIBLE_FOR_PROMOTION", stats


def main() -> int:
    parser = argparse.ArgumentParser(description="NSHR promotion gate (mock)")
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV)
    parser.add_argument("--prereg", type=Path, default=DEFAULT_PREREG)
    args = parser.parse_args()

    prereg = json.loads(args.prereg.read_text(encoding="utf-8"))
    rows = load_csv(args.csv)
    code, reason, stats = evaluate(rows, prereg)

    print(json.dumps({"reason_code": reason, **stats}, indent=2))
    if code == 0:
        print("OK: promotion gate passed (mock)")
    else:
        print(f"BLOCKED: {reason}", file=sys.stderr)
    return code


if __name__ == "__main__":
    sys.exit(main())
