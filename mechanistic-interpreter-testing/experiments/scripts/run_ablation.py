#!/usr/bin/env python3
"""
Trace-47 ablation runner (AW-032 + AW-033).

Produces CSV with outcome hashes and flip columns for NSHR gate (AW-035).
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

from trace47_outcome import baseline_outcome, outcome_hash, outcome_under_mask

ROOT = Path(__file__).resolve().parents[2]
TRACE_FIXTURE = ROOT / "trace" / "fixtures" / "trace-47-v0.json"
PREG_FIXTURE = ROOT / "experiments" / "fixtures" / "trace-47-prereg.example.json"
PERTURB_FIXTURE = ROOT / "experiments" / "fixtures" / "trace-47-perturbations-v0.json"
DEFAULT_CSV = ROOT / "experiments" / "fixtures" / "T47-ABLATION-sample.csv"


def run_ablation(
    trace: dict[str, Any],
    prereg: dict[str, Any],
    perturbations_doc: dict[str, Any],
) -> list[dict[str, str]]:
    certified = set(prereg["certified_span_ids"])
    random_span = perturbations_doc["random_control"]["control_span_id"]
    base = baseline_outcome(trace)
    o_full_hash = outcome_hash(base)
    rows: list[dict[str, str]] = []

    for p in perturbations_doc["perturbations"]:
        pid = p["perturbation_id"]
        o_ablate = outcome_under_mask(
            trace,
            ablate_span_ids=certified,
            perturbation_row=p,
            use_random_control=False,
        )
        o_rand = outcome_under_mask(
            trace,
            ablate_span_ids=set(),
            random_span_id=random_span,
            use_random_control=True,
            perturbation_row=p,
        )
        h_full = o_full_hash
        h_ablate = outcome_hash(o_ablate)
        h_rand = outcome_hash(o_rand)
        flip_ablate = str(h_full != h_ablate).lower()
        flip_rand = str(h_full != h_rand).lower()
        rows.append(
            {
                "perturbation_id": pid,
                "family_id": p["family_id"],
                "outcome_full_hash": h_full,
                "outcome_ablate_hash": h_ablate,
                "outcome_random_hash": h_rand,
                "flip_ablate": flip_ablate,
                "flip_rand": flip_rand,
                "masked_certified_span_ids": ",".join(sorted(certified)),
                "random_control_span_id": random_span,
            }
        )
    return rows


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    if not rows:
        raise ValueError("no rows")
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser(description="Trace-47 ablation runner")
    parser.add_argument("--trace", type=Path, default=TRACE_FIXTURE)
    parser.add_argument("--prereg", type=Path, default=PREG_FIXTURE)
    parser.add_argument("--perturbations", type=Path, default=PERTURB_FIXTURE)
    parser.add_argument("--out", type=Path, default=DEFAULT_CSV)
    parser.add_argument(
        "--scenario",
        choices=["sample", "pass"],
        default="sample",
        help="sample=NSHR 0.4 fail gate; pass=override perturbations for NSHR 0.8",
    )
    args = parser.parse_args()

    trace = json.loads(args.trace.read_text(encoding="utf-8"))
    prereg = json.loads(args.prereg.read_text(encoding="utf-8"))
    perturbations_doc = json.loads(args.perturbations.read_text(encoding="utf-8"))

    if args.scenario == "pass":
        for p in perturbations_doc["perturbations"]:
            p["ablate_flips_outcome"] = p["perturbation_id"] in {
                "P1-01",
                "P1-02",
                "P1-03",
                "P1-04",
                "P1-05",
                "P1-06",
                "P1-07",
                "P1-08",
            }
            p["random_flips_outcome"] = False

    rows = run_ablation(trace, prereg, perturbations_doc)
    write_csv(args.out, rows)

    nshr = sum(1 for r in rows if r["flip_ablate"] == "true") / len(rows)
    rand_rate = sum(1 for r in rows if r["flip_rand"] == "true") / len(rows)
    print(f"Wrote {args.out} ({len(rows)} rows)")
    print(f"NSHR (ablation flip rate): {nshr:.2f}")
    print(f"RANDOM-SPAN flip rate: {rand_rate:.2f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
