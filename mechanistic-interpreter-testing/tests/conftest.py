"""Shared helpers for the AOIS v0 test suite (subprocess-based, stdlib + pytest)."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pytest

PRODUCT_ROOT = Path(__file__).resolve().parents[1]

# Make the script directories importable for unit-level tests.
sys.path.insert(0, str(PRODUCT_ROOT / "trace" / "scripts"))
sys.path.insert(0, str(PRODUCT_ROOT / "experiments" / "scripts"))


def run_script(relative_script: str, *args: str) -> subprocess.CompletedProcess[str]:
    """Run a product script from the product root and capture output."""
    return subprocess.run(
        [sys.executable, str(PRODUCT_ROOT / relative_script), *args],
        capture_output=True,
        text=True,
        cwd=PRODUCT_ROOT,
    )


@pytest.fixture
def product_root() -> Path:
    return PRODUCT_ROOT
