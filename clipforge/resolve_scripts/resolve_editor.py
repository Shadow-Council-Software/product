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
from pathlib import Path


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
    project_name: str = "Throatpie_POC_Auto",
    timeline_name: str = "Throatpie_Compilation",
    output_dir: Path,
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
    render_settings = {
        "SelectAllFrames": True,
        "TargetDir": str(output_dir),
        "CustomName": "throatpie_compilation",
        "Format": "mp4",
        "Codec": "H.264",
    }
    project.SetRenderSettings(render_settings)
    project.AddRenderJob()
    project.StartRendering()
    print(f"Render queued → {output_dir}", file=sys.stderr)


def main() -> None:
    parser = argparse.ArgumentParser(description="ClipForge Resolve editor")
    parser.add_argument("--clips", nargs="*", default=[])
    parser.add_argument("--output-dir", type=Path, default=Path("data/output"))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.dry_run:
        print("resolve_editor: dry-run OK (Resolve module not required)")
        return

    if not args.clips:
        raise SystemExit("--clips required unless --dry-run")

    build_timeline(args.clips, output_dir=args.output_dir.resolve())


if __name__ == "__main__":
    main()
