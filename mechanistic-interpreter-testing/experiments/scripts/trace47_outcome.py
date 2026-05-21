"""Governed outcome evaluation stub for Trace-47 synthetic fixture (AW-032)."""

from __future__ import annotations

import hashlib
import json
from copy import deepcopy
from typing import Any


def _canonical(obj: Any) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":")).encode("utf-8")


def outcome_hash(outcome: dict[str, Any]) -> str:
    return "sha256:" + hashlib.sha256(_canonical(outcome)).hexdigest()


def baseline_outcome(trace: dict[str, Any]) -> dict[str, Any]:
    for span in reversed(trace["spans"]):
        if span.get("kind") == "TRANSFORM":
            inline = span.get("outputs_ref", {}).get("inline") or {}
            if "reason_code" in inline:
                return {"reason_code": inline["reason_code"], "message": inline.get("message")}
    raise ValueError("no governed outcome in trace")


def outcome_under_mask(
    trace: dict[str, Any],
    *,
    ablate_span_ids: set[str],
    random_span_id: str | None = None,
    use_random_control: bool = False,
    perturbation_row: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Stub counterfactual model:
    - Full trace with certified spans present -> REFUSAL_ISSUED
    - Certified spans ablated -> may flip per perturbation manifest
    - Random-span control -> independent flip per manifest
    """
    base = baseline_outcome(trace)

    if perturbation_row is not None:
        if use_random_control:
            if perturbation_row.get("random_flips_outcome"):
                return {"reason_code": "ALLOWED", "message": "Random-span control flipped outcome"}
            return base
        if ablate_span_ids and perturbation_row.get("ablate_flips_outcome"):
            return {"reason_code": "ALLOWED", "message": "Certified-span ablation flipped outcome"}
        return base

    if ablate_span_ids:
        return {"reason_code": "ALLOWED", "message": "Certified-span ablation flipped outcome"}
    return base


def mask_certified_spans(trace: dict[str, Any], certified_ids: list[str]) -> set[str]:
    return set(certified_ids)
