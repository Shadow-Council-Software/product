from __future__ import annotations

from langgraph.graph import END, StateGraph

from clipforge.agents.analysis_agent import analysis_node
from clipforge.agents.discovery_agent import discovery_node
from clipforge.agents.download_agent import download_node
from clipforge.agents.ingest_agent import ingest_node
from clipforge.agents.resolve_agent import resolve_node
from clipforge.agents.sequencing_agent import sequencing_node
from clipforge.lib.state import ClipForgeState
from clipforge.triggers import TriggerMode


def _route_after_supervisor(state: ClipForgeState) -> str:
    mode = state.get("trigger_mode", TriggerMode.MANUAL_LOCAL.value)
    if mode in (TriggerMode.DISCOVERY.value, TriggerMode.MANUAL_URLS.value):
        return "discovery"
    if mode == TriggerMode.HYBRID.value:
        return "ingest"  # ingest first; discovery chained below
    return "ingest"


def _after_ingest_hybrid(state: ClipForgeState) -> str:
    if state.get("trigger_mode") == TriggerMode.HYBRID.value:
        return "discovery"
    return "analysis"


def _after_discovery(state: ClipForgeState) -> str:
    if not state.get("source_urls") and not state.get("dry_run"):
        if state.get("ingested_paths"):
            return "analysis"
        return "end"
    return "download"


def _need_more_segments(state: ClipForgeState) -> str:
    max_retries = state.get("_discovery_max_retries", 3)
    retries = int(state.get("discovery_retries") or 0)
    plan = state.get("timeline_plan") or []
    target = float(state.get("target_duration_minutes") or 30)
    needed = int((target * 60) / 5)
    discovery_on = (state.get("steering") or {}).get("discovery", {}).get("enabled", False)
    trigger = state.get("trigger_mode", "")
    can_retry = trigger in (
        TriggerMode.DISCOVERY.value,
        TriggerMode.HYBRID.value,
    ) and discovery_on

    if len(plan) >= needed or retries >= max_retries or not can_retry:
        return "resolve"
    return "discover_again"


def discover_again_node(state: ClipForgeState) -> ClipForgeState:
    retries = int(state.get("discovery_retries") or 0) + 1
    return {**state, "discovery_retries": retries}


def supervisor_node(state: ClipForgeState) -> ClipForgeState:
    """Load steering context and emit observability message."""
    msgs = list(state.get("messages") or [])
    wf = state.get("workflow_id", "unknown")
    trig = state.get("trigger_mode", "unknown")
    brief = (state.get("steering") or {}).get("directives", {}).get("natural_language", "")
    msgs.append(
        {
            "role": "system",
            "content": f"supervisor: workflow={wf} trigger={trig} brief={brief[:120]}...",
        }
    )
    return {**state, "messages": msgs}


def build_graph():
    graph = StateGraph(ClipForgeState)

    graph.add_node("supervisor", supervisor_node)
    graph.add_node("ingest", ingest_node)
    graph.add_node("discovery", discovery_node)
    graph.add_node("download", download_node)
    graph.add_node("analysis", analysis_node)
    graph.add_node("sequence", sequencing_node)
    graph.add_node("resolve", resolve_node)
    graph.add_node("discover_again", discover_again_node)

    graph.set_entry_point("supervisor")
    graph.add_conditional_edges(
        "supervisor",
        _route_after_supervisor,
        {"ingest": "ingest", "discovery": "discovery"},
    )
    graph.add_conditional_edges(
        "ingest",
        _after_ingest_hybrid,
        {"discovery": "discovery", "analysis": "analysis"},
    )
    graph.add_conditional_edges(
        "discovery",
        _after_discovery,
        {"download": "download", "analysis": "analysis", "end": END},
    )
    graph.add_edge("download", "analysis")
    graph.add_edge("analysis", "sequence")
    graph.add_conditional_edges(
        "sequence",
        _need_more_segments,
        {"discover_again": "discover_again", "resolve": "resolve"},
    )
    graph.add_edge("discover_again", "discovery")
    graph.add_edge("resolve", END)

    return graph.compile()


def run_pipeline(initial: ClipForgeState) -> ClipForgeState:
    return build_graph().invoke(initial)
