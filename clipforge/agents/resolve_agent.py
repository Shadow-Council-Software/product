from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

from clipforge.cv.compile_output import concatenate_clips
from clipforge.lib.config import load_settings
from clipforge.lib.state import ClipForgeState


def resolve_node(state: ClipForgeState) -> ClipForgeState:
    """Render timeline via DaVinci Resolve (sole NLE backend per architecture D-04).

    A non-Resolve fallback (local concat / file copy) exists but is disabled
    unless settings resolve.allow_non_resolve_fallback is true.
    """
    settings = load_settings()
    resolve_cfg = settings.get("resolve", {})
    out_dir = Path(settings["paths"]["output"])
    if not out_dir.is_absolute():
        out_dir = Path(__file__).resolve().parent.parent / out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    if state.get("dry_run"):
        # No output is produced in dry-run; report carries the dry_run marker.
        return {
            **state,
            "output_path": None,
            "otio_path": None,
            "report": "dry_run: skipped Resolve render (no output produced)",
        }

    plan = state.get("timeline_plan") or []
    job = (state.get("job_id") or "job").replace("/", "_")

    # CF-FR-46: write the NLE-agnostic OTIO handoff artifact BEFORE attempting
    # any render, so it exists even when Resolve is unavailable. The free
    # Resolve edition can consume it via File > Import Timeline (no scripting).
    # An export failure is appended to errors and therefore fails the job
    # (exit 1) even if a render succeeds afterwards — deliberate fail-loud.
    otio_path: str | None = None
    otio_errors: list[str] = []
    if plan:
        try:
            from clipforge.lib.otio_export import export_timeline_plan

            otio_path = str(
                export_timeline_plan(
                    plan,
                    out_dir / f"{job}_timeline.otio",
                    timeline_name=str(
                        resolve_cfg.get("timeline_name") or "ClipForge_Timeline"
                    ),
                    job_id=job,
                )
            )
        except Exception as exc:  # noqa: BLE001
            otio_errors.append(f"resolve_agent: OTIO export failed: {exc}")
    else:
        otio_errors.append(
            "resolve_agent: timeline_plan is empty; OTIO artifact not written "
            "(CF-FR-46)."
        )
    state = {
        **state,
        "otio_path": otio_path,
        "errors": list(state.get("errors") or []) + otio_errors,
    }

    clip_paths = [c.get("clip_path") for c in plan if c.get("clip_path")]
    if not clip_paths:
        errors = list(state.get("errors") or [])
        errors.append(
            "resolve_agent: timeline_plan has no clip_path entries. "
            "Add media to inbox or install moviepy<2 / ffmpeg."
        )
        return {**state, "errors": errors}

    compilation_out = out_dir / f"{job}_compilation.mp4"

    editor = Path(__file__).resolve().parent.parent / "resolve_scripts" / "resolve_editor.py"
    project_name = f"{resolve_cfg.get('project_name_prefix') or 'ClipForge'}_{job}"
    # str() coercion: a null/numeric YAML value would otherwise raise an
    # uncaught TypeError inside subprocess.run (only CalledProcessError is
    # handled below).
    render_format = str(resolve_cfg.get("render_format") or "mp4")
    render_codec = str(resolve_cfg.get("render_codec") or "H264")
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
        str(resolve_cfg.get("timeline_name") or "ClipForge_Timeline"),
        "--render-format",
        render_format,
        "--render-codec",
        render_codec,
    ]
    err_text = ""
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        # Match the configured container, not a hardcoded .mp4, so a mov/mxf
        # render is discovered instead of a stale or missing .mp4.
        outputs = sorted(
            out_dir.glob(f"*.{render_format}"), key=lambda p: p.stat().st_mtime
        )
        output_path = str(outputs[-1]) if outputs else ""
        return {
            **state,
            "output_path": output_path,
            "report": f"Resolve rendered {len(clip_paths)} clips → {output_path}",
        }
    except subprocess.CalledProcessError as exc:
        err_text = (exc.stderr or str(exc)).strip()

    if not resolve_cfg.get("allow_non_resolve_fallback", False):
        errors = list(state.get("errors") or [])
        errors.append(
            "resolve_agent: DaVinci Resolve render failed and non-Resolve fallback "
            "is disabled (architecture D-04: Resolve is the sole NLE backend). "
            f"Resolve error: {err_text or 'unknown'}. "
            "See resolve_scripts/README.md for setup, or set "
            "resolve.allow_non_resolve_fallback: true in config/settings.yaml "
            "to allow a non-professional local concat fallback."
        )
        return {**state, "errors": errors}

    print(
        "WARNING resolve_agent: Resolve unavailable — using non-Resolve fallback "
        "(resolve.allow_non_resolve_fallback is enabled). Output is NOT rendered "
        "by the professional NLE path (D-04).",
        file=sys.stderr,
    )

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
