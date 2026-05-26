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


def load_workflows() -> dict[str, Any]:
    return load_yaml(CONFIG_DIR / "workflows.yaml")


def load_datasets() -> dict[str, Any]:
    return load_yaml(CONFIG_DIR / "datasets.yaml")


def load_steering_file(path: Path) -> dict[str, Any]:
    return load_yaml(path)


def workflow_by_id(workflow_id: str) -> dict[str, Any] | None:
    for w in load_workflows().get("workflows", []):
        if w.get("id") == workflow_id:
            return w
    return None


def datasets_by_ids(dataset_ids: list[str]) -> list[dict[str, Any]]:
    by_id = {d["id"]: d for d in load_datasets().get("datasets", [])}
    return [by_id[did] for did in dataset_ids if did in by_id]
