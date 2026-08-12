#!/usr/bin/env python3
"""
DaVinci Resolve timeline builder for ClipForge POC.

Usage:
  python resolve_editor.py --dry-run
  python resolve_editor.py --clips /path/a.mp4 /path/b.mp4 --output-dir ./data/output
"""
from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

# StartRendering is asynchronous; the caller (resolve_agent) globs for the
# output file immediately after this script exits, so we must block until the
# render actually finishes (or times out).
RENDER_TIMEOUT_SEC = 600
RENDER_POLL_SEC = 2


def get_resolve():
    try:
        import DaVinciResolveScript as dvr_script
    except ImportError:
        try:
            from python_get_resolve import GetResolve  # type: ignore

            return GetResolve()
        except ImportError as exc:
            raise SystemExit(
                "DaVinciResolveScript not found. Add Resolve's Scripting/Modules to PYTHONPATH."
            ) from exc
    return dvr_script.scriptapp("Resolve")


def build_timeline(
    clip_paths: list[str],
    *,
    project_name: str = "ClipForge",
    timeline_name: str = "ClipForge_Timeline",
    output_dir: Path,
    render_format: str = "mp4",
    render_codec: str = "H264",
) -> None:
    resolve = get_resolve()
    project_manager = resolve.GetProjectManager()
    project = project_manager.CreateProject(project_name)
    if not project:
        project = project_manager.GetCurrentProject()
    media_pool = project.GetMediaPool()

    imported = media_pool.ImportMedia(clip_paths)
    if not imported:
        raise RuntimeError("ImportMedia returned no items")

    timeline = media_pool.CreateEmptyTimeline(timeline_name)
    if not timeline:
        raise RuntimeError("CreateEmptyTimeline failed")

    for item in imported:
        media_pool.AppendToTimeline([{"mediaPoolItem": item, "trackIndex": 1}])

    output_dir.mkdir(parents=True, exist_ok=True)
    # Format/codec must be set via SetCurrentRenderFormatAndCodec; they are not
    # SetRenderSettings keys (passing them there is silently ignored and the
    # render falls back to the project default). Codec id is "H264", not "H.264".
    if not project.SetCurrentRenderFormatAndCodec(render_format, render_codec):
        raise RuntimeError(
            f"SetCurrentRenderFormatAndCodec({render_format}, {render_codec}) failed"
        )
    render_settings = {
        "SelectAllFrames": True,
        "TargetDir": str(output_dir),
        "CustomName": f"{project_name}_compilation",
    }
    if not project.SetRenderSettings(render_settings):
        raise RuntimeError(f"SetRenderSettings failed: {render_settings}")
    if not project.AddRenderJob():
        raise RuntimeError("AddRenderJob failed")
    if not project.StartRendering():
        raise RuntimeError("StartRendering failed")
    deadline = time.monotonic() + RENDER_TIMEOUT_SEC
    while project.IsRenderingInProgress():
        if time.monotonic() > deadline:
            raise RuntimeError(
                f"Render still in progress after {RENDER_TIMEOUT_SEC}s; giving up"
            )
        time.sleep(RENDER_POLL_SEC)
    print(f"Render complete → {output_dir}", file=sys.stderr)


def main() -> None:
    parser = argparse.ArgumentParser(description="ClipForge Resolve editor")
    parser.add_argument("--clips", nargs="*", default=[])
    parser.add_argument("--output-dir", type=Path, default=Path("data/output"))
    parser.add_argument("--project-name", default="ClipForge")
    parser.add_argument("--timeline-name", default="ClipForge_Timeline")
    parser.add_argument("--render-format", default="mp4")
    parser.add_argument("--render-codec", default="H264")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.dry_run:
        print("resolve_editor: dry-run OK (Resolve module not required)")
        return

    if not args.clips:
        raise SystemExit("--clips required unless --dry-run")

    build_timeline(
        args.clips,
        project_name=args.project_name,
        timeline_name=args.timeline_name,
        output_dir=args.output_dir.resolve(),
        render_format=args.render_format,
        render_codec=args.render_codec,
    )


if __name__ == "__main__":
    main()
