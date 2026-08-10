"""Binding verification must be cryptographic: forged digests are rejected."""

from __future__ import annotations

import json

import pytest

from conftest import PRODUCT_ROOT, run_script

FIXTURES = PRODUCT_ROOT / "trace" / "fixtures"

VALID_PAIRS = [
    ("trace-calculator-v0.json", "certificate-calculator-v0.json"),
    ("trace-47-v0.json", "certificate-trace-47-v0.json"),
]

DIGEST_FIELDS = [
    "inputs_closure_digest",
    "span_carriers_digest",
    "replay_outputs_digest",
    "certificate_hash",
]


@pytest.mark.parametrize("trace_name,cert_name", VALID_PAIRS)
def test_checked_in_certificates_verify(trace_name, cert_name):
    p = run_script(
        "trace/scripts/verify_certificate_binding.py",
        str(FIXTURES / trace_name),
        str(FIXTURES / cert_name),
    )
    assert p.returncode == 0, p.stdout + p.stderr
    assert "CERT_BINDING_OK" in p.stdout


@pytest.mark.parametrize("field", DIGEST_FIELDS)
def test_tampered_digest_is_rejected(field, tmp_path):
    cert = json.loads((FIXTURES / "certificate-trace-47-v0.json").read_text())
    cert[field] = "sha256:" + "0" * 64
    forged = tmp_path / "forged.json"
    forged.write_text(json.dumps(cert))
    p = run_script(
        "trace/scripts/verify_certificate_binding.py",
        str(FIXTURES / "trace-47-v0.json"),
        str(forged),
    )
    assert p.returncode == 1, f"forged {field} was accepted"
    assert "CERT_MISMATCH" in p.stdout
    assert field in p.stdout


def test_swapped_certificate_is_rejected():
    p = run_script(
        "trace/scripts/verify_certificate_binding.py",
        str(FIXTURES / "trace-calculator-v0.json"),
        str(FIXTURES / "certificate-trace-47-v0.json"),
    )
    assert p.returncode == 1
    assert "CERT_MISMATCH" in p.stdout


def test_tampered_trace_outputs_rejected(tmp_path):
    trace = json.loads((FIXTURES / "trace-calculator-v0.json").read_text())
    for span in trace["spans"]:
        if span["span_id"] == "span-format":
            span["outputs_ref"]["inline"] = {"display": "$999.99 USD (tampered)"}
    tampered = tmp_path / "tampered-trace.json"
    tampered.write_text(json.dumps(trace))
    p = run_script(
        "trace/scripts/verify_certificate_binding.py",
        str(tampered),
        str(FIXTURES / "certificate-calculator-v0.json"),
    )
    assert p.returncode == 1
