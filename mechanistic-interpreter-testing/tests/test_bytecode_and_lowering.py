"""Lowering must fail loudly on unmapped spans; lower_and_run must fail clearly."""

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
