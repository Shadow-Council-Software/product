from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parent.parent
CONFIG_DIR = ROOT / "config"


def load_yaml(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def load_settings() -> dict[str, Any]:
    return load_yaml(CONFIG_DIR / "settings.yaml")


def load_performers() -> dict[str, Any]:
    return load_yaml(CONFIG_DIR / "performers.yaml")


def performer_by_id(performer_id: str) -> dict[str, Any] | None:
    for p in load_performers().get("performers", []):
        if p.get("id") == performer_id:
            return p
    return None
