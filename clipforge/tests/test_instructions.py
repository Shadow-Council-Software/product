from clipforge.lib.instructions import parse_operator_instructions


def test_parse_pre_post_roll():
    text = "Max 2 sec before peak and 10 seconds after. Dramatic reactions only."
    p = parse_operator_instructions(text)
    assert p["directives"]["pre_roll_max_sec"] == 2.0
    assert p["directives"]["post_roll_max_sec"] == 10.0
    assert p["directives"]["min_segment_score"] >= 0.8
