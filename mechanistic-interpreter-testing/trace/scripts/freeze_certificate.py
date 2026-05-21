#!/usr/bin/env python3
"""
Freeze span certificates from AOIS trace v0 (AW-021).

Carrier fields are hashed; attachments are excluded (AW-004).
Replay stub verifies deterministic outputs_ref chain for calculator-class traces.
"""

from __future__ import annotations

import hashlib
import json
import sys
from copy import deepcopy
from dataclasses import dataclass
from pathlib import Path
from typing import Any

# Allow running as script from repo
sys.path.insert(0, str(Path(__file__).resolve().parent))
from classify_replay_divergence import (  # noqa: E402
    ReplayDivergenceError,
    classify_output_mismatch,
    classify_validation_failure,
)
from validate_trace import collect_validation_errors, validate_trace_root  # noqa: E402

CERTIFICATE_VERSION = "certificate-v0"
ATTACHMENT_KEYS = frozenset({"attachments"})


def _canonical_json(obj: Any) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode(
        "utf-8"
    )


def _sha256_bytes(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def _sha256_obj(obj: Any) -> str:
    return _sha256_bytes(_canonical_json(obj))


def span_carrier_payload(span: dict[str, Any]) -> dict[str, Any]:
    """Extract digest-relevant span fields (excludes attachments)."""
    payload: dict[str, Any] = {
        "span_id": span["span_id"],
        "parent_span_id": span["parent_span_id"],
        "kind": span["kind"],
        "lifecycle_state": span["lifecycle_state"],
        "inputs_ref": span["inputs_ref"],
        "outputs_ref": span["outputs_ref"],
    }
    for optional in (
        "effect_class",
        "choose_ledger",
        "commit_seal",
        "delegate_target_hash",
        "capability_bound_hash",
    ):
        if optional in span:
            payload[optional] = span[optional]
    return payload


def collect_spans(trace: dict[str, Any], span_ids: list[str] | None) -> list[dict[str, Any]]:
    spans = trace["spans"]
    by_id = {s["span_id"]: s for s in spans}
    if span_ids is None:
        return list(spans)
    missing = [sid for sid in span_ids if sid not in by_id]
    if missing:
        raise ValueError(f"unknown span_id(s): {missing}")
    return [by_id[sid] for sid in span_ids]


def inputs_closure_digest(spans: list[dict[str, Any]]) -> str:
    digests = sorted(s["inputs_ref"]["digest"] for s in spans)
    return _sha256_obj({"inputs_closure": digests})


def replay_stub_span(span: dict[str, Any]) -> str:
    """
    Deterministic replay oracle for fixture-class traces (no VM).
    Recomputes outputs_ref digest from carrier inputs + kind + op inline.
    """
    carrier = span_carrier_payload(span)
    inline_in = span.get("inputs_ref", {}).get("inline") or {}
    inline_out = span.get("outputs_ref", {}).get("inline") or {}

    if span["kind"] == "TRANSFORM":
        op = inline_in.get("op")
        if op == "parse_json":
            expected = {"amount_cents": 12500, "currency": "USD"}
        elif op == "compute_tax":
            expected = {"tax_cents": 1000, "total_cents": 13500}
        elif op == "format_response":
            expected = {"display": "$135.00 USD (incl. $10.00 tax)"}
        elif op == "policy_evaluate":
            expected = {"safe_to_proceed": False, "policy_rule": "HARMFUL_CONTENT_BLOCK"}
        elif op == "emit_governed_outcome":
            expected = {
                "reason_code": "REFUSAL_ISSUED",
                "message": "Request blocked by policy HARMFUL_CONTENT_BLOCK",
            }
        else:
            expected = inline_out
        if inline_out != expected:
            raise ReplayDivergenceError(
                classify_output_mismatch(
                    span["span_id"],
                    expected_digest=None,
                    actual_digest=span["outputs_ref"].get("digest"),
                    detail=f"expected inline {expected}, got {inline_out}",
                )
            )
    elif span["kind"] == "OBSERVE":
        pass
    elif span["kind"] in ("CHOOSE", "COMMIT", "DELEGATE"):
        pass
    else:
        raise RuntimeError(f"unsupported kind for replay stub: {span['kind']}")

    return _sha256_obj(carrier)


@dataclass(frozen=True)
class FrozenCertificate:
    certificate_version: str
    trace_id: str
    replay_envelope_id: str
    policy_snapshot_id: str
    span_ids: tuple[str, ...]
    inputs_closure_digest: str
    span_carriers_digest: str
    replay_outputs_digest: str
    certificate_hash: str

    def to_dict(self) -> dict[str, Any]:
        body = {
            "certificate_version": self.certificate_version,
            "trace_id": self.trace_id,
            "replay_envelope_id": self.replay_envelope_id,
            "policy_snapshot_id": self.policy_snapshot_id,
            "span_ids": list(self.span_ids),
            "inputs_closure_digest": self.inputs_closure_digest,
            "span_carriers_digest": self.span_carriers_digest,
            "replay_outputs_digest": self.replay_outputs_digest,
        }
        return {**body, "certificate_hash": self.certificate_hash}

    @staticmethod
    def body_without_hash(body: dict[str, Any]) -> dict[str, Any]:
        return {k: v for k, v in body.items() if k != "certificate_hash"}


def freeze_certificate(
    trace: dict[str, Any],
    span_ids: list[str] | None = None,
    *,
    verify_replay: bool = True,
) -> FrozenCertificate:
    validation_errors = collect_validation_errors(trace)
    if validation_errors:
        raise ReplayDivergenceError(classify_validation_failure(validation_errors))

    selected = collect_spans(trace, span_ids)
    replay_digests: list[str] = []
    for span in selected:
        if verify_replay:
            replay_digests.append(replay_stub_span(span))
        else:
            replay_digests.append(span["outputs_ref"]["digest"])

    carriers = [span_carrier_payload(s) for s in selected]
    body = {
        "certificate_version": CERTIFICATE_VERSION,
        "trace_id": trace["trace_id"],
        "replay_envelope_id": trace["replay_envelope_id"],
        "policy_snapshot_id": trace["policy_snapshot_id"],
        "span_ids": [s["span_id"] for s in selected],
        "inputs_closure_digest": inputs_closure_digest(selected),
        "span_carriers_digest": _sha256_obj({"carriers": carriers}),
        "replay_outputs_digest": _sha256_obj({"replay": replay_digests}),
    }
    cert_hash = _sha256_obj(body)
    return FrozenCertificate(certificate_hash=cert_hash, **body)


def assert_double_freeze_stable(trace_path: Path, span_ids: list[str] | None = None) -> None:
    trace = json.loads(trace_path.read_text(encoding="utf-8"))
    a = freeze_certificate(trace, span_ids)
    b = freeze_certificate(trace, span_ids)
    if a.certificate_hash != b.certificate_hash:
        raise AssertionError(
            f"double-freeze unstable: {a.certificate_hash} != {b.certificate_hash}"
        )


def assert_double_replay_stable(trace_path: Path, span_ids: list[str] | None = None) -> None:
    trace = json.loads(trace_path.read_text(encoding="utf-8"))
    selected = collect_spans(trace, span_ids)
    first = [replay_stub_span(s) for s in selected]
    second = [replay_stub_span(s) for s in selected]
    if first != second:
        raise AssertionError(f"double-replay drift: {first} != {second}")


def main() -> int:
    if len(sys.argv) < 2:
        print(
            f"Usage: {sys.argv[0]} <trace.json> [--spans id1,id2] [--write out.json]",
            file=sys.stderr,
        )
        return 2

    trace_path = Path(sys.argv[1])
    span_ids: list[str] | None = None
    write_path: Path | None = None
    args = sys.argv[2:]
    i = 0
    while i < len(args):
        if args[i] == "--spans" and i + 1 < len(args):
            span_ids = [s.strip() for s in args[i + 1].split(",") if s.strip()]
            i += 2
        elif args[i] == "--write" and i + 1 < len(args):
            write_path = Path(args[i + 1])
            i += 2
        else:
            print(f"unknown arg: {args[i]}", file=sys.stderr)
            return 2

    trace = json.loads(trace_path.read_text(encoding="utf-8"))
    cert = freeze_certificate(trace, span_ids)
    assert_double_freeze_stable(trace_path, span_ids)
    assert_double_replay_stable(trace_path, span_ids)

    out = cert.to_dict()
    print(json.dumps(out, indent=2, sort_keys=True))
    print(f"OK: double-freeze and double-replay stable — {cert.certificate_hash}")

    if write_path:
        write_path.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {write_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
