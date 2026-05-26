from __future__ import annotations

import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from clipforge.cv.compile_output import concatenate_clips
from clipforge.lib.config import load_settings
from clipforge.lib.state import ClipForgeState


def resolve_node(state: ClipForgeState) -> ClipForgeState:
    """Render timeline: Resolve when available, else concatenate clips to one MP4."""
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
            "Add media to inbox or install moviepy<2 / ffmpeg."
        )
        return {**state, "errors": errors}

    job = (state.get("job_id") or "job").replace("/", "_")
    compilation_out = out_dir / f"{job}_compilation.mp4"

    editor = Path(__file__).resolve().parent.parent / "resolve_scripts" / "resolve_editor.py"
    project_name = f"{resolve_cfg.get('project_name_prefix', 'ClipForge')}_{job}"
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
    err_text = ""
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        outputs = sorted(out_dir.glob("*.mp4"), key=lambda p: p.stat().st_mtime)
        output_path = str(outputs[-1]) if outputs else ""
        return {
            **state,
            "output_path": output_path,
            "report": f"Resolve rendered {len(clip_paths)} clips → {output_path}",
        }
    except subprocess.CalledProcessError as exc:
        err_text = (exc.stderr or str(exc)).strip()

    # Fallback: local concatenation (full compilation MP4)
    try:
        final = concatenate_clips(clip_paths, compilation_out)
        return {
            **state,
            "output_path": final,
            "report": (
                f"Compiled {len(clip_paths)} clips → {final} "
                "(Resolve unavailable; used local concat)"
            ),
            "errors": list(state.get("errors") or []),
        }
    except Exception as concat_exc:  # noqa: BLE001
        errors = list(state.get("errors") or [])
        if len(clip_paths) == 1:
            fallback = out_dir / f"{job}_clip.mp4"
            shutil.copy2(clip_paths[0], fallback)
            return {
                **state,
                "output_path": str(fallback),
                "report": f"Single clip staged at {fallback}",
                "errors": errors,
            }
        errors.append(f"resolve_agent: {err_text if 'err_text' in dir() else concat_exc}")
        errors.append(f"resolve_agent: concat failed: {concat_exc}")
        return {**state, "errors": errors}
