"""Gate ordering regressions: random-control dominance precedes the necessity check."""

from __future__ import annotations

import pytest

from nshr_promotion_gate import (
    REASON_FALSE_MECHANISM,
    REASON_NECESSITY_GATE_FAILED,
    evaluate,
)

PREREG = {"theta_nshr": 0.7}


def make_rows(n: int, ablate_flips: int, rand_flips: int) -> list[dict[str, str]]:
    rows = []
    for i in range(n):
        rows.append(
            {
                "flip_ablate": "true" if i < ablate_flips else "false",
                "flip_rand": "true" if i < rand_flips else "false",
            }
        )
    return rows


def test_random_dominance_beats_necessity_check():
    # Protocol §8 trigger 2: NSHR 0.3 with random flip rate 0.9 is FALSE_MECHANISM,
    # not NECESSITY_GATE_FAILED.
    code, reason, stats = evaluate(make_rows(10, 3, 9), PREREG)
    assert (code, reason) == (2, REASON_FALSE_MECHANISM), stats


def test_random_dominance_at_nshr_zero():
    # The old `nshr > 0` guard masked dominance at NSHR 0.
    code, reason, stats = evaluate(make_rows(10, 0, 0), PREREG)
    assert (code, reason) == (2, REASON_FALSE_MECHANISM), stats


def test_necessity_gate_fails_when_random_dominated():
    code, reason, stats = evaluate(make_rows(10, 4, 1), PREREG)
    assert (code, reason) == (1, REASON_NECESSITY_GATE_FAILED), stats


def test_eligible_for_promotion():
    code, reason, stats = evaluate(make_rows(10, 8, 0), PREREG)
    assert code == 0, (reason, stats)


def test_empty_csv_raises():
    with pytest.raises(ValueError):
        evaluate([], PREREG)
