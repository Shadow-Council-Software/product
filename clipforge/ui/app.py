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
from clipforge.lib.runner import JobRequest, run_job
from clipforge.triggers import TriggerMode

INBOX = ROOT / "data" / "raw" / "inbox"


def _workflow_choices() -> list[str]:
    return [w["id"] for w in load_workflows().get("workflows", [])]


def _dataset_choices() -> list[str]:
    return [d["id"] for d in load_datasets().get("datasets", [])]


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
    with gr.Blocks(title="ClipForge Operator") as demo:
        gr.Markdown(
            """
# ClipForge Operator Console
Describe your edit in **Instructions**. Drop source videos in **Upload**, or paste **URLs**.
Peak-based cuts use **Pre-roll** / **Post-roll** seconds around the detected moment.
            """
        )
        with gr.Row():
            with gr.Column(scale=2):
                instructions = gr.Textbox(
                    label="Instructions (creative brief)",
                    lines=6,
                    placeholder=(
                        "Example: Tight compilation. Max 2 seconds before each peak moment, "
                        "max 10 seconds after. Keep only the most dramatic reactions. "
                        "Target 5 minutes. Use footage from 2025 onward."
                    ),
                )
                with gr.Row():
                    workflow = gr.Dropdown(_workflow_choices(), value="compilation_dense", label="Workflow")
                    dataset = gr.Dropdown(_dataset_choices(), value="inbox_local", label="Dataset")
                    trigger = gr.Dropdown(
                        [t.value for t in TriggerMode],
                        value=TriggerMode.MANUAL_LOCAL.value,
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

            with gr.Column(scale=1):
                target_minutes = gr.Slider(1, 60, value=5, step=0.5, label="Target length (minutes)")
                min_score = gr.Slider(0.0, 1.0, value=0.75, step=0.05, label="Min segment score")
                pre_roll = gr.Slider(0, 10, value=2, step=0.5, label="Max pre-roll (sec before peak)")
                post_roll = gr.Slider(1, 30, value=10, step=0.5, label="Max post-roll (sec after peak)")
                discovery_enabled = gr.Checkbox(label="Enable discovery / search", value=False)
                discovery_provider = gr.Dropdown(
                    [
                        "auto",
                        "ytsearch",
                        "duckduckgo",
                        "duckduckgo_videos",
                        "permissive",
                    ],
                    value="auto",
                    label="Search provider",
                    info="auto = YouTube (yt-dlp) + web video search. permissive = broader URLs for yt-dlp.",
                )
                discovery_query = gr.Textbox(
                    label="Discovery queries (one per line)",
                    lines=3,
                    placeholder="your search terms OR site:youtube.com topic OR direct https://...",
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
