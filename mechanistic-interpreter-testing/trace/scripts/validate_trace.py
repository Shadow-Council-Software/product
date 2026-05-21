#!/usr/bin/env python3
"""Validate AOIS trace v0 fixtures (AW-011). Stdlib only."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

SCHEMA_VERSION = "trace-v0"
DIGEST_RE = re.compile(r"^sha256:[a-f0-9]{64}$")
SPAN_KINDS = frozenset({"OBSERVE", "TRANSFORM", "COMMIT", "CHOOSE", "DELEGATE"})
LIFECYCLE = frozenset({"CAPTURED", "CANDIDATE", "FROZEN", "PROMOTED"})
EFFECT = frozenset({"pure", "read", "write", "external"})
CHOOSE_SOURCE = frozenset({"policy", "tool", "model", "env"})
DURABILITY = frozenset({"ephemeral", "audit", "external"})


def err(msg: str, errors: list[str] | None = None) -> None:
    if errors is not None:
        errors.append(msg)
    else:
        print(f"ERROR: {msg}", file=sys.stderr)


def check_digest(value: Any, path: str) -> bool:
    if not isinstance(value, str) or not DIGEST_RE.match(value):
        err(f"{path}: invalid digest (expected sha256:<64 hex>)")
        return False
    return True


def collect_validation_errors(data: Any) -> list[str]:
    """Return validation messages without printing (for AW-022 classifier)."""
    import contextlib
    import io

    buf = io.StringIO()
    with contextlib.redirect_stderr(buf):
        ok = validate_trace_root(data)
    if ok:
        return []
    return [line.replace("ERROR: ", "") for line in buf.getvalue().splitlines() if line.strip()]


def check_content_ref(obj: Any, path: str, required: bool = True) -> bool:
    if obj is None:
        if required:
            err(f"{path}: missing content_ref")
            return False
        return True
    if not isinstance(obj, dict):
        err(f"{path}: content_ref must be object")
        return False
    ok = True
    for key in ("ref_type", "digest"):
        if key not in obj:
            err(f"{path}: missing {key}")
            ok = False
    if "ref_type" in obj and obj["ref_type"] not in ("inline", "blob"):
        err(f"{path}: ref_type must be inline or blob")
        ok = False
    if "digest" in obj:
        ok = check_digest(obj["digest"], f"{path}.digest") and ok
    extra = set(obj) - {"ref_type", "digest", "inline"}
    if extra:
        err(f"{path}: unexpected keys {sorted(extra)}")
        ok = False
    return ok


def validate_span(span: Any, index: int, span_ids: set[str]) -> bool:
    path = f"spans[{index}]"
    if not isinstance(span, dict):
        err(f"{path}: must be object")
        return False
    ok = True
    required = (
        "span_id",
        "parent_span_id",
        "kind",
        "inputs_ref",
        "outputs_ref",
        "lifecycle_state",
    )
    for key in required:
        if key not in span:
            err(f"{path}: missing {key}")
            ok = False

    sid = span.get("span_id")
    if isinstance(sid, str):
        if sid in span_ids:
            err(f"{path}: duplicate span_id {sid}")
            ok = False
        span_ids.add(sid)

    kind = span.get("kind")
    if kind not in SPAN_KINDS:
        err(f"{path}: invalid kind {kind!r}")
        ok = False

    if span.get("lifecycle_state") not in LIFECYCLE:
        err(f"{path}: invalid lifecycle_state")
        ok = False

    ok = check_content_ref(span.get("inputs_ref"), f"{path}.inputs_ref") and ok
    ok = check_content_ref(span.get("outputs_ref"), f"{path}.outputs_ref") and ok

    if kind == "CHOOSE":
        cl = span.get("choose_ledger")
        if not isinstance(cl, dict):
            err(f"{path}: CHOOSE requires choose_ledger")
            ok = False
        else:
            if cl.get("choose_source") not in CHOOSE_SOURCE:
                err(f"{path}: invalid choose_source")
                ok = False
            for f in ("branch_inputs_digest", "outcome_digest"):
                if f in cl:
                    ok = check_digest(cl[f], f"{path}.choose_ledger.{f}") and ok

    if kind == "COMMIT":
        cs = span.get("commit_seal")
        if not isinstance(cs, dict) or cs.get("durability_class") not in DURABILITY:
            err(f"{path}: COMMIT requires commit_seal.durability_class")
            ok = False
        if span.get("effect_class") not in EFFECT:
            err(f"{path}: COMMIT requires effect_class")
            ok = False

    if kind == "DELEGATE":
        for f in ("delegate_target_hash", "capability_bound_hash"):
            if f not in span:
                err(f"{path}: DELEGATE requires {f}")
                ok = False

    if kind == "TRANSFORM":
        if span.get("effect_class") != "pure":
            err(f"{path}: TRANSFORM must have effect_class pure in v0")
            ok = False

    attachments = span.get("attachments", [])
    if attachments:
        if not isinstance(attachments, list):
            err(f"{path}: attachments must be array")
            ok = False
        for j, att in enumerate(attachments):
            if not isinstance(att, dict) or "attachment_id" not in att:
                err(f"{path}.attachments[{j}]: invalid attachment")
                ok = False

    allowed = {
        "span_id",
        "parent_span_id",
        "kind",
        "lifecycle_state",
        "inputs_ref",
        "outputs_ref",
        "effect_class",
        "choose_ledger",
        "commit_seal",
        "delegate_target_hash",
        "capability_bound_hash",
        "attachments",
    }
    extra = set(span) - allowed
    if extra:
        err(f"{path}: unexpected keys {sorted(extra)}")
        ok = False
    return ok


def validate_trace_root(data: Any) -> bool:
    if not isinstance(data, dict):
        err("root must be object")
        return False
    ok = True
    for key in (
        "schema_version",
        "trace_id",
        "replay_envelope_id",
        "policy_snapshot_id",
        "spans",
    ):
        if key not in data:
            err(f"root: missing {key}")
            ok = False

    if data.get("schema_version") != SCHEMA_VERSION:
        err("root: schema_version must be trace-v0")
        ok = False

    spans = data.get("spans")
    if not isinstance(spans, list) or len(spans) < 1:
        err("root: spans must be non-empty array")
        return False

    span_ids: set[str] = set()
    for i, span in enumerate(spans):
        ok = validate_span(span, i, span_ids) and ok

    # Tree: one root (parent_span_id null), parents exist
    roots = [s for s in spans if isinstance(s, dict) and s.get("parent_span_id") is None]
    if len(roots) != 1:
        err(f"root: expected exactly one root span, found {len(roots)}")
        ok = False
    for span in spans:
        if not isinstance(span, dict):
            continue
        pid = span.get("parent_span_id")
        if pid is not None and pid not in span_ids:
            err(f"root: unknown parent_span_id {pid!r}")
            ok = False

    allowed_root = {
        "schema_version",
        "trace_id",
        "replay_envelope_id",
        "policy_snapshot_id",
        "run_envelope",
        "trace_completeness_score",
        "spans",
    }
    tcs = data.get("trace_completeness_score")
    if tcs is not None and (
        not isinstance(tcs, (int, float)) or not (0 <= float(tcs) <= 1)
    ):
        err("root: trace_completeness_score must be in [0, 1]")
        ok = False
    extra = set(data) - allowed_root
    if extra:
        err(f"root: unexpected keys {sorted(extra)}")
        ok = False
    return ok


def main() -> int:
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <trace.json>", file=sys.stderr)
        return 2
    path = Path(sys.argv[1])
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        err(str(e))
        return 1
    if validate_trace_root(data):
        print(f"OK: {path} validates against AOIS trace v0 rules")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
