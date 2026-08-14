"""Binding verification must be cryptographic: forged digests are rejected,
and a certificate must cover the exact span set of its trace — a
self-consistent certificate over a chosen subset of spans is a forgery."""

from __future__ import annotations

import json

import pytest

from conftest import PRODUCT_ROOT, run_script
from freeze_certificate import freeze_certificate
from verify_certificate_binding import (
    REASON_CERT_INCOMPLETE,
    REASON_CERT_RECOMPUTE_FAILED,
    CertificateBindingError,
    verify_certificate_binding,
)

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


def test_tampered_certificate_version_is_rejected(tmp_path):
    cert = json.loads((FIXTURES / "certificate-trace-47-v0.json").read_text())
    cert["certificate_version"] = "certificate-v99"
    forged = tmp_path / "forged-version.json"
    forged.write_text(json.dumps(cert))
    p = run_script(
        "trace/scripts/verify_certificate_binding.py",
        str(FIXTURES / "trace-47-v0.json"),
        str(forged),
    )
    assert p.returncode == 1, "tampered certificate_version was accepted"
    assert "CERT_MISMATCH" in p.stdout
    assert "certificate_version" in p.stdout


def test_partial_span_coverage_certificate_is_rejected():
    # Self-consistent certificate over a subset of spans: digests recompute
    # cleanly for the subset, so only coverage enforcement can catch it.
    trace = json.loads((FIXTURES / "trace-47-v0.json").read_text())
    first_span = trace["spans"][0]["span_id"]
    partial = freeze_certificate(trace, [first_span]).to_dict()
    with pytest.raises(CertificateBindingError) as exc_info:
        verify_certificate_binding(trace, partial)
    assert exc_info.value.report.reason_code == REASON_CERT_INCOMPLETE


def test_empty_span_coverage_certificate_is_rejected():
    trace = json.loads((FIXTURES / "trace-47-v0.json").read_text())
    empty = freeze_certificate(trace, []).to_dict()
    with pytest.raises(CertificateBindingError) as exc_info:
        verify_certificate_binding(trace, empty)
    assert exc_info.value.report.reason_code == REASON_CERT_INCOMPLETE


def test_duplicate_span_ids_certificate_is_rejected():
    trace = json.loads((FIXTURES / "trace-47-v0.json").read_text())
    all_ids = [s["span_id"] for s in trace["spans"]]
    duplicated = freeze_certificate(trace, all_ids + [all_ids[0]]).to_dict()
    with pytest.raises(CertificateBindingError) as exc_info:
        verify_certificate_binding(trace, duplicated)
    assert exc_info.value.report.reason_code == REASON_CERT_INCOMPLETE


def test_recompute_failure_is_not_reported_as_forgery():
    # A trace the verifier cannot process is a recompute failure, not
    # evidence of forgery: the reason code must distinguish the two.
    trace = json.loads((FIXTURES / "trace-47-v0.json").read_text())
    cert = json.loads((FIXTURES / "certificate-trace-47-v0.json").read_text())
    broken = json.loads(json.dumps(trace))
    del broken["spans"][0]["outputs_ref"]  # invalid trace: recompute cannot run
    with pytest.raises(CertificateBindingError) as exc_info:
        verify_certificate_binding(broken, cert)
    assert exc_info.value.report.reason_code == REASON_CERT_RECOMPUTE_FAILED


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
