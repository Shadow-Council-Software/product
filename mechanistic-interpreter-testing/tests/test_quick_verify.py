"""Wraps the V0-RELEASE.md quick-verify commands so `pytest` gates the release."""

from __future__ import annotations

from conftest import run_script


def test_validate_calculator_trace():
    p = run_script("trace/scripts/validate_trace.py", "trace/fixtures/trace-calculator-v0.json")
    assert p.returncode == 0, p.stderr


def test_validate_trace47():
    p = run_script("trace/scripts/validate_trace.py", "trace/fixtures/trace-47-v0.json")
    assert p.returncode == 0, p.stderr


def test_invalid_parent_fixture_rejected():
    p = run_script(
        "trace/scripts/validate_trace.py", "trace/fixtures/trace-calculator-invalid-parent.json"
    )
    assert p.returncode == 1


def test_freeze_certificate_double_stable():
    p = run_script("trace/scripts/freeze_certificate.py", "trace/fixtures/trace-calculator-v0.json")
    assert p.returncode == 0, p.stderr
    assert "double-freeze and double-replay stable" in p.stdout


def test_replay_divergence_demo():
    p = run_script("trace/scripts/run_replay_divergence_demo.py")
    assert p.returncode == 0, p.stderr


def test_swap_cert_demo():
    p = run_script("experiments/scripts/run_swap_cert_demo.py")
    assert p.returncode == 0, p.stderr


def test_validate_prereg_example():
    p = run_script(
        "experiments/scripts/validate_prereg.py",
        "experiments/fixtures/trace-47-prereg.example.json",
    )
    assert p.returncode == 0, p.stderr


def test_lower_and_run_calculator():
    p = run_script("trace/scripts/lower_and_run.py", "trace/fixtures/trace-calculator-v0.json")
    assert p.returncode == 0, p.stderr
    assert "OK: bytecode VM matches trace terminal outcome" in p.stdout


def test_lower_and_run_trace47_outcome_digest_match():
    p = run_script("trace/scripts/lower_and_run.py", "trace/fixtures/trace-47-v0.json")
    assert p.returncode == 0, p.stderr
    assert "OK: bytecode VM matches trace terminal outcome" in p.stdout


def test_ablation_then_nshr_gate_blocks_sample(tmp_path):
    out = tmp_path / "t47.csv"
    p = run_script("experiments/scripts/run_ablation.py", "--out", str(out))
    assert p.returncode == 0, p.stderr
    # v0 manifest is P1-only vs prereg P1/P2/P3 minimums: warns, does not block.
    assert "PREREG_NONCONFORMANT" in p.stderr
    p = run_script("experiments/scripts/nshr_promotion_gate.py", "--csv", str(out))
    assert p.returncode == 1
    assert "NECESSITY_GATE_FAILED" in p.stdout


def test_run_ablation_strict_prereg_blocks(tmp_path):
    out = tmp_path / "t47.csv"
    p = run_script("experiments/scripts/run_ablation.py", "--out", str(out), "--strict-prereg")
    assert p.returncode == 3
    assert "PREREG_NONCONFORMANT" in p.stderr


def test_promotion_integrity_gate_passes_on_pass_csv():
    p = run_script(
        "experiments/scripts/promotion_integrity_gate.py",
        "--trace", "trace/fixtures/trace-47-v0.json",
        "--cert", "trace/fixtures/certificate-trace-47-v0.json",
        "--ablation-csv", "experiments/fixtures/T47-ABLATION-pass.csv",
        "--prereg", "experiments/fixtures/trace-47-prereg.example.json",
    )
    assert p.returncode == 0, p.stdout + p.stderr
