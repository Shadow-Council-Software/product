from clipforge.agents.orchestrator import build_graph, run_pipeline
from clipforge.agents.supervisor import build_initial_state


def test_graph_compiles():
    assert build_graph() is not None


def test_dry_run_local_pipeline():
    initial = build_initial_state(
        workflow_id="compilation_dense",
        dataset_ids=["inbox_local"],
        trigger="manual_local",
        dry_run=True,
    )
    result = run_pipeline(initial)
    assert result.get("trigger_mode") == "manual_local"
    assert "report" in result or result.get("dry_run") is not False


def test_build_initial_state_from_steering_example():
    from pathlib import Path

    path = Path(__file__).resolve().parent.parent / "config" / "steering.example.yaml"
    state = build_initial_state(
        workflow_id="compilation_dense",
        dataset_ids=["inbox_local"],
        trigger="manual_local",
        steering_path=str(path),
    )
    assert state["workflow_id"] == "highlight_reel"
    assert "directives" in state["steering"]
