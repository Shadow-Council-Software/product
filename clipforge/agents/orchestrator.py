from __future__ import annotations

from langgraph.graph import END, StateGraph

from clipforge.agents.analysis_agent import analysis_node
from clipforge.agents.download_agent import download_node
from clipforge.agents.resolve_agent import resolve_node
from clipforge.agents.search_agent import search_node
from clipforge.agents.sequencing_agent import sequencing_node
from clipforge.lib.state import ClipForgeState


def _need_more_clips(state: ClipForgeState) -> str:
    settings_retries = state.get("_search_max_retries", 3)
    retries = int(state.get("search_retries") or 0)
    sequence = state.get("master_sequence") or []
    target_minutes = float(state.get("target_minutes") or 30)
    # Rough density: ~4s average per clip
    needed = int((target_minutes * 60) / 4)
    if len(sequence) >= needed or retries >= settings_retries:
        return "resolve"
    return "search_again"


def _after_search(state: ClipForgeState) -> str:
    if not state.get("search_urls") and not state.get("dry_run"):
        return "end"
    return "download"


def search_again_node(state: ClipForgeState) -> ClipForgeState:
    retries = int(state.get("search_retries") or 0) + 1
    return {**state, "search_retries": retries}


def supervisor_node(state: ClipForgeState) -> ClipForgeState:
    """Supervisor hook — append status message for observability."""
    msgs = list(state.get("messages") or [])
    msgs.append({"role": "system", "content": "supervisor: pipeline tick"})
    return {**state, "messages": msgs}


def build_graph():
    graph = StateGraph(ClipForgeState)

    graph.add_node("supervisor", supervisor_node)
    graph.add_node("search", search_node)
    graph.add_node("download", download_node)
    graph.add_node("analysis", analysis_node)
    graph.add_node("sequence", sequencing_node)
    graph.add_node("resolve", resolve_node)
    graph.add_node("search_again", search_again_node)

    graph.set_entry_point("supervisor")
    graph.add_edge("supervisor", "search")
    graph.add_conditional_edges("search", _after_search, {"download": "download", "end": END})
    graph.add_edge("download", "analysis")
    graph.add_edge("analysis", "sequence")
    graph.add_conditional_edges(
        "sequence",
        _need_more_clips,
        {"search_again": "search_again", "resolve": "resolve"},
    )
    graph.add_edge("search_again", "search")
    graph.add_edge("resolve", END)

    return graph.compile()


def run_pipeline(initial: ClipForgeState) -> ClipForgeState:
    app = build_graph()
    return app.invoke(initial)
