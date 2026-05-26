from __future__ import annotations

from clipforge.lib.config import load_datasets, load_workflows, workflow_by_id


def validate_job_definition(workflow_id: str, dataset_ids: list[str]) -> list[str]:
    """Return list of validation errors (empty if valid)."""
    errors: list[str] = []
    if not workflow_by_id(workflow_id):
        known = [w["id"] for w in load_workflows().get("workflows", [])]
        errors.append(f"Unknown workflow '{workflow_id}'. Known: {', '.join(known)}")
    by_id = {d["id"]: d for d in load_datasets().get("datasets", [])}
    for did in dataset_ids:
        if did not in by_id:
            known = list(by_id.keys())
            errors.append(f"Unknown dataset '{did}'. Known: {', '.join(known)}")
    return errors
