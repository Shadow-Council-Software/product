#!/usr/bin/env python3
"""Validate Trace-47 preregistration documents (AW-030). Stdlib only."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

PREREG_VERSION = "trace-47-prereg-v0"
PROTOCOL_ID = "trace-47-catastrophe-protocol"
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
METRIC_IDS = frozenset(
    {"REFUSAL_LOGIT_DIRECTION", "REASON_CODE_REFUSAL_ISSUED", "COMPARATOR_VERDICT_FR16"}
)
FAMILY_IDS = frozenset({"P1", "P2", "P3", "P4"})
CONTROL_IDS = frozenset({"RANDOM-SPAN", "SWAP-CERT", "SHAM-ABLATION"})
REQUIRED_FAMILIES = frozenset({"P1", "P2", "P3"})


def err(msg: str) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)


def validate_prereg(data: Any) -> bool:
    if not isinstance(data, dict):
        err("root must be object")
        return False
    ok = True
    required = [
        "prereg_version",
        "protocol_id",
        "registered_at",
        "trace_fixture_id",
        "certificate_fixture_id",
        "outcome_metric",
        "theta_nshr",
        "alpha",
        "perturbation_families",
        "controls",
        "demotion_triggers",
    ]
    for key in required:
        if key not in data:
            err(f"root: missing {key}")
            ok = False

    if data.get("prereg_version") != PREREG_VERSION:
        err("prereg_version must be trace-47-prereg-v0")
        ok = False
    if data.get("protocol_id") != PROTOCOL_ID:
        err("protocol_id must be trace-47-catastrophe-protocol")
        ok = False

    reg = data.get("registered_at")
    if not isinstance(reg, str) or not DATE_RE.match(reg):
        err("registered_at must be YYYY-MM-DD")
        ok = False

    theta = data.get("theta_nshr")
    if not isinstance(theta, (int, float)) or not (0.5 <= float(theta) <= 1.0):
        err("theta_nshr must be in [0.5, 1.0]")
        ok = False

    alpha = data.get("alpha")
    if not isinstance(alpha, (int, float)) or not (0 < float(alpha) <= 0.2):
        err("alpha must be in (0, 0.2]")
        ok = False

    om = data.get("outcome_metric")
    if not isinstance(om, dict):
        err("outcome_metric must be object")
        ok = False
    else:
        if om.get("metric_id") not in METRIC_IDS:
            err("outcome_metric.metric_id invalid")
            ok = False
        for f in ("description", "flip_definition"):
            if not isinstance(om.get(f), str) or len(om[f]) < 10:
                err(f"outcome_metric.{f} too short")
                ok = False

    families = data.get("perturbation_families")
    seen_families: set[str] = set()
    if not isinstance(families, list) or len(families) < 3:
        err("perturbation_families must have >= 3 entries")
        ok = False
    else:
        for i, fam in enumerate(families):
            if not isinstance(fam, dict):
                err(f"perturbation_families[{i}] must be object")
                ok = False
                continue
            fid = fam.get("family_id")
            if fid not in FAMILY_IDS:
                err(f"perturbation_families[{i}]: invalid family_id")
                ok = False
            elif isinstance(fid, str):
                seen_families.add(fid)
            if not isinstance(fam.get("min_variants"), int) or fam["min_variants"] < 1:
                err(f"perturbation_families[{i}]: min_variants >= 1 required")
                ok = False
    if not REQUIRED_FAMILIES.issubset(seen_families):
        err(f"perturbation_families must include P1, P2, P3; got {seen_families}")
        ok = False

    controls = data.get("controls")
    seen_controls: set[str] = set()
    if not isinstance(controls, list) or len(controls) < 2:
        err("controls must have >= 2 entries")
        ok = False
    else:
        for i, ctl in enumerate(controls):
            if not isinstance(ctl, dict):
                err(f"controls[{i}] must be object")
                ok = False
                continue
            cid = ctl.get("control_id")
            if cid not in CONTROL_IDS:
                err(f"controls[{i}]: invalid control_id")
                ok = False
            elif isinstance(cid, str):
                seen_controls.add(cid)
    if "RANDOM-SPAN" not in seen_controls or "SWAP-CERT" not in seen_controls:
        err("controls must include RANDOM-SPAN and SWAP-CERT")
        ok = False

    triggers = data.get("demotion_triggers")
    if not isinstance(triggers, list) or len(triggers) < 3:
        err("demotion_triggers must have >= 3 entries")
        ok = False

    allowed = set(required) | {"protocol_semver", "registered_by", "replay_envelope_id", "certified_span_ids", "notes"}
    extra = set(data) - allowed
    if extra:
        err(f"unexpected root keys: {sorted(extra)}")
        ok = False
    return ok


def main() -> int:
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <prereg.json>", file=sys.stderr)
        return 2
    path = Path(sys.argv[1])
    data = json.loads(path.read_text(encoding="utf-8"))
    if validate_prereg(data):
        print(f"OK: {path} validates as Trace-47 prereg v0")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
