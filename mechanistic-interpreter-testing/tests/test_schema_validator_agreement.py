"""Keep the hand-rolled validator and the shipped JSON Schemas in agreement.

If the `jsonschema` library is installed, every trace fixture is validated
against the schema and the verdict must match validate_trace.py. Otherwise a
focused drift test exercises the constraints that had previously drifted
(run_envelope additionalProperties, attachment media_type).
"""

from __future__ import annotations

import copy
import json

import pytest

from conftest import PRODUCT_ROOT
from validate_trace import collect_validation_errors

FIXTURES = PRODUCT_ROOT / "trace" / "fixtures"
TRACE_SCHEMA = json.loads((PRODUCT_ROOT / "trace" / "schema" / "trace-v0.schema.json").read_text())
CERT_SCHEMA = json.loads(
    (PRODUCT_ROOT / "trace" / "schema" / "certificate-v0.schema.json").read_text()
)

try:
    import jsonschema  # type: ignore

    HAVE_JSONSCHEMA = True
except ImportError:
    HAVE_JSONSCHEMA = False

TRACE_FIXTURES = ["trace-calculator-v0.json", "trace-47-v0.json"]
CERT_FIXTURES = ["certificate-calculator-v0.json", "certificate-trace-47-v0.json"]


def valid_per_validator(trace) -> bool:
    return not collect_validation_errors(trace)


def valid_per_schema(trace) -> bool:
    try:
        jsonschema.validate(trace, TRACE_SCHEMA)
        return True
    except jsonschema.ValidationError:
        return False


def drift_cases():
    """Documents that used to be judged differently by schema vs validator."""
    base = json.loads((FIXTURES / "trace-calculator-v0.json").read_text())

    junk_envelope = copy.deepcopy(base)
    junk_envelope["run_envelope"]["junk_key"] = "boo"

    non_string_envelope = copy.deepcopy(base)
    non_string_envelope["run_envelope"]["seed"] = 42

    no_media_type = copy.deepcopy(base)
    del no_media_type["spans"][0]["attachments"][0]["media_type"]

    junk_attachment = copy.deepcopy(base)
    junk_attachment["spans"][0]["attachments"][0]["surprise"] = "x"

    return {
        "valid_fixture": (base, True),
        "junk_run_envelope_key": (junk_envelope, False),
        "non_string_run_envelope_value": (non_string_envelope, False),
        "attachment_missing_media_type": (no_media_type, False),
        "attachment_junk_key": (junk_attachment, False),
    }


@pytest.mark.parametrize("name", list(drift_cases()))
def test_validator_matches_schema_verdict(name):
    trace, expected_valid = drift_cases()[name]
    assert valid_per_validator(trace) == expected_valid
    if HAVE_JSONSCHEMA:
        assert valid_per_schema(trace) == expected_valid


@pytest.mark.parametrize("fixture", TRACE_FIXTURES)
def test_trace_fixtures_valid_both_ways(fixture):
    trace = json.loads((FIXTURES / fixture).read_text())
    assert valid_per_validator(trace)
    if HAVE_JSONSCHEMA:
        assert valid_per_schema(trace)


@pytest.mark.parametrize("fixture", CERT_FIXTURES)
def test_certificate_fixtures_match_schema_shape(fixture):
    cert = json.loads((FIXTURES / fixture).read_text())
    if HAVE_JSONSCHEMA:
        jsonschema.validate(cert, CERT_SCHEMA)
        return
    # Focused fallback: required keys, no extras, digest shapes.
    required = set(CERT_SCHEMA["required"])
    assert required <= set(cert)
    assert set(cert) <= set(CERT_SCHEMA["properties"])
    for field in (
        "inputs_closure_digest",
        "span_carriers_digest",
        "replay_outputs_digest",
        "certificate_hash",
    ):
        value = cert[field]
        assert value.startswith("sha256:") and len(value) == 71
