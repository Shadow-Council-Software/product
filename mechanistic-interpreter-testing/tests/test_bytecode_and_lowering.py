"""Lowering must fail loudly on unmapped TRANSFORM ops; lower_and_run must fail clearly.

Scope note: only TRANSFORM ops fail loudly. Non-TRANSFORM span kinds
(CHOOSE/COMMIT/DELEGATE) are intentionally not lowered in v0 and are dropped
by design — see the opcode table's reserved section.
"""

from __future__ import annotations

import json

import pytest

from bytecode_vm import BytecodeVM, lower_calculator_trace, lower_trace47_trace
from conftest import PRODUCT_ROOT, run_script

FIXTURES = PRODUCT_ROOT / "trace" / "fixtures"


def _transform_span(op: str, sid: str = "span-x") -> dict:
    return {
        "span_id": sid,
        "parent_span_id": None,
        "kind": "TRANSFORM",
        "lifecycle_state": "CANDIDATE",
        "inputs_ref": {"ref_type": "inline", "digest": "sha256:" + "0" * 64, "inline": {"op": op}},
        "outputs_ref": {"ref_type": "inline", "digest": "sha256:" + "0" * 64, "inline": {}},
    }


def test_trace47_lowering_raises_on_unmapped_transform():
    trace = {"trace_id": "trace-47-bogus", "spans": [_transform_span("mystery_op")]}
    with pytest.raises(ValueError, match="unsupported transform"):
        lower_trace47_trace(trace)


def test_calculator_lowering_raises_on_unmapped_transform():
    trace = {"trace_id": "trace-calculator-bogus", "spans": [_transform_span("mystery_op")]}
    with pytest.raises(ValueError, match="unsupported transform"):
        lower_calculator_trace(trace)


def test_vm_raises_on_unknown_op():
    with pytest.raises(ValueError, match="unknown op"):
        BytecodeVM().execute({"instructions": [{"op": "LOAD_CONST"}]})


def test_lower_and_run_rejects_malformed_input(tmp_path):
    bad = tmp_path / "not-a-trace.json"
    bad.write_text(json.dumps({"foo": "bar"}))
    p = run_script("trace/scripts/lower_and_run.py", str(bad))
    assert p.returncode == 2
    assert "not a trace-v0 document" in p.stderr


def test_lower_and_run_requires_matching_certificate(tmp_path):
    trace = json.loads((FIXTURES / "trace-calculator-v0.json").read_text())
    trace["trace_id"] = "trace-without-certificate"
    orphan = tmp_path / "orphan-trace.json"
    orphan.write_text(json.dumps(trace))
    p = run_script("trace/scripts/lower_and_run.py", str(orphan))
    assert p.returncode == 2
    assert "certificate resolution failed" in p.stderr


def test_lower_and_run_rejects_non_object_certificate(tmp_path):
    bad_cert = tmp_path / "cert-array.json"
    bad_cert.write_text(json.dumps(["not", "a", "certificate"]))
    p = run_script(
        "trace/scripts/lower_and_run.py",
        str(FIXTURES / "trace-calculator-v0.json"),
        "--cert",
        str(bad_cert),
    )
    assert p.returncode == 2
    assert "not a JSON object" in p.stderr
    assert "Traceback" not in p.stderr


def test_lower_and_run_reports_missing_flag_value():
    p = run_script(
        "trace/scripts/lower_and_run.py",
        str(FIXTURES / "trace-calculator-v0.json"),
        "--cert",
    )
    assert p.returncode == 2
    assert "missing value for --cert" in p.stderr


def test_vm_failure_on_verified_certificate_exits_cleanly(tmp_path):
    """A trace can pass freeze/verify yet crash the stub VM (compute_tax with
    no prior parse_json). That must surface as a clean error, not a traceback."""
    from freeze_certificate import freeze_certificate

    trace = {
        "schema_version": "trace-v0",
        "trace_id": "trace-calc-taxfirst",
        "replay_envelope_id": "env-1",
        "policy_snapshot_id": "pol-1",
        "spans": [
            {
                "span_id": "span-tax",
                "parent_span_id": None,
                "kind": "TRANSFORM",
                "effect_class": "pure",
                "lifecycle_state": "CANDIDATE",
                "inputs_ref": {
                    "ref_type": "inline",
                    "digest": "sha256:" + "0" * 64,
                    "inline": {"op": "compute_tax", "rate": "0.08"},
                },
                "outputs_ref": {
                    "ref_type": "inline",
                    "digest": "sha256:" + "0" * 64,
                    # Matches the replay stub's hardcoded expectation so
                    # freeze/verify passes; the VM still lacks amount_cents.
                    "inline": {"tax_cents": 1000, "total_cents": 13500},
                },
            }
        ],
    }
    cert = freeze_certificate(trace).to_dict()
    trace_path = tmp_path / "taxfirst-trace.json"
    cert_path = tmp_path / "taxfirst-cert.json"
    trace_path.write_text(json.dumps(trace))
    cert_path.write_text(json.dumps(cert))
    p = run_script(
        "trace/scripts/lower_and_run.py", str(trace_path), "--cert", str(cert_path)
    )
    assert p.returncode == 2, p.stdout + p.stderr
    assert "cannot lower or execute" in p.stderr
    assert "Traceback" not in p.stderr


def test_lower_and_run_rejects_unbound_certificate():
    p = run_script(
        "trace/scripts/lower_and_run.py",
        str(FIXTURES / "trace-calculator-v0.json"),
        "--cert",
        str(FIXTURES / "certificate-trace-47-v0.json"),
    )
    assert p.returncode == 1
    assert "refusing to embed" in p.stderr


def test_strict_digests_flag(tmp_path):
    # Fixtures ship placeholder digests: strict mode must fail on them...
    p = run_script(
        "trace/scripts/validate_trace.py",
        str(FIXTURES / "trace-calculator-v0.json"),
        "--strict-digests",
    )
    assert p.returncode == 1
    assert "inline content digest mismatch" in p.stderr

    # ...and pass once inline digests are real.
    import hashlib

    trace = json.loads((FIXTURES / "trace-calculator-v0.json").read_text())
    for span in trace["spans"]:
        for key in ("inputs_ref", "outputs_ref"):
            payload = json.dumps(
                span[key]["inline"], sort_keys=True, separators=(",", ":"), ensure_ascii=False
            ).encode("utf-8")
            span[key]["digest"] = "sha256:" + hashlib.sha256(payload).hexdigest()
    fixed = tmp_path / "real-digests.json"
    fixed.write_text(json.dumps(trace))
    p = run_script("trace/scripts/validate_trace.py", str(fixed), "--strict-digests")
    assert p.returncode == 0, p.stderr


def test_strict_digests_flag_trace47():
    # trace-47 placeholders must also fail strict mode (coverage was
    # previously calculator-only).
    p = run_script(
        "trace/scripts/validate_trace.py",
        str(FIXTURES / "trace-47-v0.json"),
        "--strict-digests",
    )
    assert p.returncode == 1
    assert "digest" in p.stderr


def test_strict_digests_rejects_inline_ref_without_payload(tmp_path):
    # An inline ref carrying only ref_type+digest must not silently pass
    # strict mode — there is nothing to verify the digest against.
    trace = json.loads((FIXTURES / "trace-calculator-v0.json").read_text())
    del trace["spans"][0]["inputs_ref"]["inline"]
    stripped = tmp_path / "no-payload.json"
    stripped.write_text(json.dumps(trace))
    p = run_script("trace/scripts/validate_trace.py", str(stripped), "--strict-digests")
    assert p.returncode == 1
    assert "no inline payload" in p.stderr
