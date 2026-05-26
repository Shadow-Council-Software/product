from __future__ import annotations

import re
from typing import Any


def parse_operator_instructions(text: str) -> dict[str, Any]:
    """
    Map natural-language operator brief into steering directive overrides.

    Content-agnostic keyword heuristics — not genre-specific.
    """
    t = (text or "").lower()
    directives: dict[str, Any] = {"natural_language": text.strip()}

    # Duration targets
    m = re.search(r"(\d+(?:\.\d+)?)\s*(?:min|minute)", t)
    if m:
        directives["target_minutes"] = float(m.group(1))

    # Pre/post roll around peak moment
    pre = re.search(r"(\d+(?:\.\d+)?)\s*s(?:ec(?:ond)?s?)?\s*(?:lead|before|pre)", t)
    post = re.search(r"(\d+(?:\.\d+)?)\s*s(?:ec(?:ond)?s?)?\s*(?:after|post|tail)", t)
    if pre:
        directives["pre_roll_max_sec"] = float(pre.group(1))
    if post:
        directives["post_roll_max_sec"] = float(post.group(1))
    if "tight" in t or "no dead air" in t or "back-to-back" in t:
        directives["pacing"] = "tight"
        directives.setdefault("segment_duration_sec", [2, 12])
    if "dramatic" in t or "reaction" in t or "peak" in t or "intense" in t:
        directives["min_segment_score"] = 0.8
        directives["ranking"] = {
            "visual_weight": 0.55,
            "audio_weight": 0.35,
            "metadata_weight": 0.1,
        }

    discovery: dict[str, Any] = {}
    if "search" in t or "discover" in t or "internet" in t or "online" in t:
        discovery["enabled"] = True
    year = re.search(r"\b(20\d{2})\b", text or "")
    if year:
        discovery["after_date"] = f"{year.group(1)}-01-01"
        directives["media_after"] = f"{year.group(1)}-01-01"

    return {"directives": directives, "discovery": discovery}
