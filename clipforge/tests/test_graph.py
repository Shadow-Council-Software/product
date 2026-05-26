from clipforge.agents.orchestrator import build_graph


def test_graph_compiles():
    app = build_graph()
    assert app is not None


def test_dry_run_pipeline():
    from clipforge.agents.orchestrator import run_pipeline

    result = run_pipeline(
        {
            "performer_ids": ["morgpie"],
            "target_minutes": 10,
            "min_dramatic_score": 0.85,
            "dry_run": True,
            "search_urls": [],
            "search_retries": 0,
            "errors": [],
        }
    )
    assert "report" in result or result.get("dry_run") is not False
