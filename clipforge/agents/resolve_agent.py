from __future__ import annotations

import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from clipforge.lib.config import load_settings
from clipforge.lib.state import ClipForgeState


def resolve_node(state: ClipForgeState) -> ClipForgeState:
    """
    Delegate timeline build + render to resolve_scripts/resolve_editor.py.

    Requires DaVinci Resolve running with scripting enabled.
    """
    settings = load_settings()
    out_dir = Path(settings["paths"]["output"])
    if not out_dir.is_absolute():
        out_dir = Path(__file__).resolve().parent.parent / out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    if state.get("dry_run"):
        ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        fake = out_dir / f"dry_run_throatpie_compilation_{ts}.mp4"
        return {
            **state,
            "output_path": str(fake),
            "report": "dry_run: skipped Resolve render",
        }

    sequence = state.get("master_sequence") or []
    clip_paths = [c.get("clip_path") for c in sequence if c.get("clip_path")]
    if not clip_paths:
        errors = list(state.get("errors") or [])
        errors.append("resolve_agent: no clip_path entries in master_sequence")
        return {**state, "errors": errors}

    editor = Path(__file__).resolve().parent.parent / "resolve_scripts" / "resolve_editor.py"
    cmd = [sys.executable, str(editor), "--clips", *clip_paths, "--output-dir", str(out_dir)]
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as exc:
        errors = list(state.get("errors") or [])
        errors.append(f"resolve_agent: {exc.stderr or exc}")
        return {**state, "errors": errors}

    outputs = sorted(out_dir.glob("*.mp4"), key=lambda p: p.stat().st_mtime)
    output_path = str(outputs[-1]) if outputs else ""
    report = f"Rendered {len(clip_paths)} clips → {output_path}"

    return {**state, "output_path": output_path, "report": report}
