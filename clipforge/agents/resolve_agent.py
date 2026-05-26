from __future__ import annotations

import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from clipforge.lib.config import load_settings
from clipforge.lib.state import ClipForgeState


def resolve_node(state: ClipForgeState) -> ClipForgeState:
    """Hand timeline_plan to DaVinci Resolve for professional render."""
    settings = load_settings()
    resolve_cfg = settings.get("resolve", {})
    out_dir = Path(settings["paths"]["output"])
    if not out_dir.is_absolute():
        out_dir = Path(__file__).resolve().parent.parent / out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    if state.get("dry_run"):
        ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        job = (state.get("job_id") or "job").replace("/", "_")
        fake = out_dir / f"{job}_dry_run_{ts}.mp4"
        return {
            **state,
            "output_path": str(fake),
            "report": "dry_run: skipped Resolve render",
        }

    plan = state.get("timeline_plan") or []
    clip_paths = [c.get("clip_path") for c in plan if c.get("clip_path")]
    if not clip_paths:
        errors = list(state.get("errors") or [])
        errors.append(
            "resolve_agent: timeline_plan has no clip_path entries. "
            "Install moviepy<2 or ffmpeg for extraction."
        )
        return {**state, "errors": errors}

    editor = Path(__file__).resolve().parent.parent / "resolve_scripts" / "resolve_editor.py"
    project_name = f"{resolve_cfg.get('project_name_prefix', 'ClipForge')}_{state.get('job_id', 'job')}"
    cmd = [
        sys.executable,
        str(editor),
        "--clips",
        *clip_paths,
        "--output-dir",
        str(out_dir),
        "--project-name",
        project_name,
        "--timeline-name",
        resolve_cfg.get("timeline_name", "ClipForge_Timeline"),
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as exc:
        err_text = (exc.stderr or str(exc)).strip()
        if "DaVinciResolveScript not found" in err_text or "Resolve" in err_text:
            job = (state.get("job_id") or "job").replace("/", "_")
            fallback = out_dir / f"{job}_clips_ready.mp4"
            if len(clip_paths) == 1:
                import shutil

                shutil.copy2(clip_paths[0], fallback)
                return {
                    **state,
                    "output_path": str(fallback),
                    "report": (
                        f"Resolve unavailable; staged single clip at {fallback} "
                        "(install Resolve + PYTHONPATH for G6 render)"
                    ),
                    "errors": list(state.get("errors") or []),
                }
        errors = list(state.get("errors") or [])
        errors.append(f"resolve_agent: {err_text}")
        return {**state, "errors": errors}

    outputs = sorted(out_dir.glob("*.mp4"), key=lambda p: p.stat().st_mtime)
    output_path = str(outputs[-1]) if outputs else ""
    return {
        **state,
        "output_path": output_path,
        "report": f"Rendered {len(clip_paths)} clips → {output_path}",
    }
