#!/usr/bin/env python3
"""
ClipForge Operator UI — submit instructions, sources, and run the editor pipeline.

Launch: python -m clipforge.ui.app
        python clipforge/main.py ui
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parent
if str(REPO) not in sys.path:
    sys.path.insert(0, str(REPO))

import gradio as gr

from clipforge.lib.config import load_datasets, load_workflows
from clipforge.lib.presets import PRESETS, preset_by_id, preset_choices
from clipforge.lib.runner import JobRequest, run_job
from clipforge.triggers import TriggerMode

INBOX = ROOT / "data" / "raw" / "inbox"


def _workflow_choices() -> list[str]:
    return [w["id"] for w in load_workflows().get("workflows", [])]


def _dataset_choices() -> list[str]:
    return [d["id"] for d in load_datasets().get("datasets", [])]


def apply_preset(preset_id: str):
    p = preset_by_id(preset_id)
    if not p:
        return (
            gr.update(),
            gr.update(),
            gr.update(),
            gr.update(),
            gr.update(),
            gr.update(),
            gr.update(),
            gr.update(),
            gr.update(),
            gr.update(),
            gr.update(),
            gr.update(),
        )
    return (
        p.instructions,
        p.workflow,
        gr.update(value="inbox_local"),
        p.trigger,
        gr.update(value=""),
        p.target_minutes,
        p.min_score,
        p.pre_roll,
        p.post_roll,
        p.discovery_enabled,
        p.discovery_provider,
        p.discovery_query,
        gr.update(value=False),
    )


def save_uploads(files) -> str:
    if not files:
        return "No files uploaded."
    INBOX.mkdir(parents=True, exist_ok=True)
    saved = []
    for f in files:
        src = Path(f)
        dest = INBOX / src.name
        shutil.copy2(src, dest)
        saved.append(dest.name)
    return f"Saved to inbox: {', '.join(saved)}"


def run_compilation(
    instructions: str,
    workflow: str,
    dataset: str,
    trigger: str,
    urls_text: str,
    target_minutes: float,
    min_score: float,
    pre_roll: float,
    post_roll: float,
    discovery_enabled: bool,
    discovery_provider: str,
    discovery_query: str,
    dry_run: bool,
):
    urls = [u.strip() for u in (urls_text or "").splitlines() if u.strip().startswith("http")]
    queries = [q.strip() for q in (discovery_query or "").splitlines() if q.strip()]

    req = JobRequest(
        instructions=instructions or "Tight compilation of dramatic peak moments.",
        workflow_id=workflow,
        dataset_ids=[dataset],
        trigger=trigger,
        source_urls=urls,
        target_minutes=target_minutes,
        min_segment_score=min_score,
        pre_roll_max_sec=pre_roll,
        post_roll_max_sec=post_roll,
        dry_run=dry_run,
        discovery_enabled=discovery_enabled,
        discovery_provider=discovery_provider,
        discovery_queries=queries,
    )
    result = run_job(req)

    video_out = None
    if result.output_path and Path(result.output_path).exists() and not dry_run:
        video_out = result.output_path

    status = (
        f"**Job ID:** `{result.job_id}`\n\n"
        f"**Status:** {'OK' if result.success else 'Completed with issues'}\n\n"
        f"**Message:** {result.message}\n\n"
        f"**Report:** `{result.report_path}`\n\n"
        f"**Output:** `{result.output_path or 'none'}`"
    )
    if result.errors:
        status += "\n\n**Errors:**\n" + "\n".join(f"- {e}" for e in result.errors)

    return status, result.log, video_out


def build_ui() -> gr.Blocks:
    default_preset = preset_by_id("dramatic_reaction_tight") or PRESETS[0]
    with gr.Blocks(title="ClipForge Operator") as demo:
        gr.Markdown(
            """
# ClipForge Operator Console
Describe your edit in **Instructions**. Drop source videos in **Upload**, or paste **URLs**.
Peak-based cuts use **Pre-roll** / **Post-roll** seconds around the detected moment.

**Search:** you provide queries and URLs. ClipForge uses yt-dlp + generic reaction scoring — no built-in niche or performer lists.
            """
        )
        with gr.Row():
            with gr.Column(scale=2):
                preset = gr.Dropdown(
                    preset_choices(),
                    value="dramatic_reaction_tight",
                    label="Edit preset",
                    info="Loads timing/scoring defaults; add your own discovery queries below.",
                )
                instructions = gr.Textbox(
                    label="Instructions (creative brief)",
                    lines=6,
                    value=default_preset.instructions,
                    placeholder="Describe peak moments, timing, and reaction intensity in your own words.",
                )
                with gr.Row():
                    workflow = gr.Dropdown(
                        _workflow_choices(), value=default_preset.workflow, label="Workflow"
                    )
                    dataset = gr.Dropdown(_dataset_choices(), value="inbox_local", label="Dataset")
                    trigger = gr.Dropdown(
                        [t.value for t in TriggerMode],
                        value=default_preset.trigger,
                        label="Trigger",
                    )
                urls = gr.Textbox(
                    label="Source URLs (one per line)",
                    lines=4,
                    placeholder="https://example.com/video.mp4",
                )
                uploads = gr.File(label="Upload source videos → inbox", file_count="multiple", type="filepath")
                upload_btn = gr.Button("Save uploads to inbox")
                upload_status = gr.Textbox(label="Upload status", interactive=False)
                upload_btn.click(save_uploads, inputs=uploads, outputs=upload_status)
                preset.change(
                    apply_preset,
                    inputs=preset,
                    outputs=[
                        instructions,
                        workflow,
                        dataset,
                        trigger,
                        urls,
                        target_minutes,
                        min_score,
                        pre_roll,
                        post_roll,
                        discovery_enabled,
                        discovery_provider,
                        discovery_query,
                        dry_run,
                    ],
                )

            with gr.Column(scale=1):
                target_minutes = gr.Slider(
                    1, 60, value=default_preset.target_minutes, step=0.5, label="Target length (minutes)"
                )
                min_score = gr.Slider(
                    0.0, 1.0, value=default_preset.min_score, step=0.05, label="Min segment score"
                )
                pre_roll = gr.Slider(
                    0, 10, value=default_preset.pre_roll, step=0.5, label="Max pre-roll (sec before peak)"
                )
                post_roll = gr.Slider(
                    1, 30, value=default_preset.post_roll, step=0.5, label="Max post-roll (sec after peak)"
                )
                discovery_enabled = gr.Checkbox(
                    label="Enable discovery / search", value=default_preset.discovery_enabled
                )
                discovery_provider = gr.Dropdown(
                    [
                        "auto",
                        "ytsearch",
                        "duckduckgo",
                        "duckduckgo_videos",
                        "permissive",
                    ],
                    value=default_preset.discovery_provider,
                    label="Search provider",
                    info="auto = YouTube (yt-dlp) + web video search. permissive = broader URLs for yt-dlp.",
                )
                discovery_query = gr.Textbox(
                    label="Discovery queries (one per line — you provide)",
                    lines=3,
                    value=default_preset.discovery_query,
                    placeholder="Enter your own search terms or site:... URLs. Not pre-filled by ClipForge.",
                )
                dry_run = gr.Checkbox(label="Dry run (no extract/render)", value=False)
                run_btn = gr.Button("Run compilation", variant="primary", size="lg")

        with gr.Row():
            status = gr.Markdown(label="Status")
        log = gr.Textbox(label="Pipeline log", lines=12)
        video = gr.Video(label="Output compilation")

        run_btn.click(
            run_compilation,
            inputs=[
                instructions,
                workflow,
                dataset,
                trigger,
                urls,
                target_minutes,
                min_score,
                pre_roll,
                post_roll,
                discovery_enabled,
                discovery_provider,
                discovery_query,
                dry_run,
            ],
            outputs=[status, log, video],
        )

    return demo


def main() -> None:
    demo = build_ui()
    demo.queue()
    demo.launch(
        server_name="127.0.0.1",
        server_port=7860,
        show_error=True,
        theme=gr.themes.Soft(),
    )


if __name__ == "__main__":
    main()
