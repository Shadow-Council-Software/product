"""Keep the hand-rolled validator and the shipped JSON Schemas in agreement.

Validator-side assertions always run (stdlib only). Schema-side assertions
require the `jsonschema` library and are explicitly SKIPPED when it is not
installed, so a degraded run is visible in the pytest summary instead of
silently passing. CI installs jsonschema, so both sides are always checked
there.
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

needs_jsonschema = pytest.mark.skipif(
    not HAVE_JSONSCHEMA, reason="jsonschema not installed — schema side not checked"
)

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

    null_envelope = copy.deepcopy(base)
    null_envelope["run_envelope"] = None

    no_media_type = copy.deepcopy(base)
    del no_media_type["spans"][0]["attachments"][0]["media_type"]

    junk_attachment = copy.deepcopy(base)
    junk_attachment["spans"][0]["attachments"][0]["surprise"] = "x"

    return {
        "valid_fixture": (base, True),
        "junk_run_envelope_key": (junk_envelope, False),
        "non_string_run_envelope_value": (non_string_envelope, False),
        "null_run_envelope": (null_envelope, False),
        "attachment_missing_media_type": (no_media_type, False),
        "attachment_junk_key": (junk_attachment, False),
    }


@pytest.mark.parametrize("name", list(drift_cases()))
def test_validator_matches_expected_verdict(name):
    trace, expected_valid = drift_cases()[name]
    assert valid_per_validator(trace) == expected_valid


@needs_jsonschema
@pytest.mark.parametrize("name", list(drift_cases()))
def test_schema_matches_expected_verdict(name):
    trace, expected_valid = drift_cases()[name]
    assert valid_per_schema(trace) == expected_valid


@pytest.mark.parametrize("fixture", TRACE_FIXTURES)
def test_trace_fixtures_valid_per_validator(fixture):
    trace = json.loads((FIXTURES / fixture).read_text())
    assert valid_per_validator(trace)


@needs_jsonschema
@pytest.mark.parametrize("fixture", TRACE_FIXTURES)
def test_trace_fixtures_valid_per_schema(fixture):
    trace = json.loads((FIXTURES / fixture).read_text())
    assert valid_per_schema(trace)


@pytest.mark.parametrize("fixture", CERT_FIXTURES)
def test_certificate_fixtures_match_schema_shape(fixture):
    """Stdlib shape check: required keys, no extras, digest shapes."""
    cert = json.loads((FIXTURES / fixture).read_text())
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


@needs_jsonschema
@pytest.mark.parametrize("fixture", CERT_FIXTURES)
def test_certificate_fixtures_validate_against_schema(fixture):
    cert = json.loads((FIXTURES / fixture).read_text())
    jsonschema.validate(cert, CERT_SCHEMA)
