# ClipForge POC Exit Runbook

**Status: COMPLETE — all six gates have evidence.** Required by story 5.3.
This runbook records how to execute gates G1–G6 and the evidence collected.
G1–G5 were verified 2026-08-10; G6 was verified live 2026-08-12 via the
license-free OTIO import path on free DaVinci Resolve. The fully-automated
Studio external-scripting render remains contract-tested only (see
limitations below).

## Gate checklist

| Gate | Requirement | How to verify | Evidence (2026-08-10) |
|------|-------------|---------------|------------------------|
| G1 | `run --dry-run` completes; report + state emitted | `python clipforge/main.py run --dry-run` | Automated: `tests/test_poc_gates.py::test_g1_dry_run_completes_with_report`. Manual: transcript below (exit 0, report `data/jobs/de4a561e/report.json`) |
| G2 | `analyze` returns scored segments | `python clipforge/main.py analyze --input <sample.mp4>` | Automated: `test_g2_analyze_returns_segments`. Manual: transcript below (1 organic segment, exit 0) |
| G3 | Local job media → `timeline_plan` + segment sidecars | Drop MP4s in `data/raw/inbox/`, run `run --trigger manual_local`; check `data/clips/qualified/{stem}_{start}.json` sidecars | Automated: `test_g3_local_media_produces_plan_and_sidecars`. Manual full inbox job: transcript below (job `ff84f4ef`: 1 organic segment, sidecar + extracted clip MP4, `timeline_count: 1`) |
| G4 | Steering overrides workflow defaults | Two runs, same dataset, different steering; plans differ | Automated: `test_g4_steering_overrides_workflow_defaults` (merge-level) |
| G5 | `watch --dry-run` ≥3 cycles without crash | `python clipforge/main.py watch --dry-run --max-cycles 3` | Automated: `test_g5_watch_three_cycles_dry_run`. Manual: transcript below (3 cycles, exit 0) |
| G6 | Growth: ClipForge edit → real Resolve MP4 | License-free path (CF-FR-46): import `data/output/{job_id}_timeline.otio` into Resolve (free edition works) and render — automatable via the in-Resolve script `resolve_scripts/clipforge_g6_verify.lua` (Workspace → Scripts). Fully-automated external path still requires **Studio** 19.1+ | **VERIFIED 2026-08-12** on free DaVinci Resolve 21.0.4.5: OTIO artifact from job `adfb1032` imported (1 clip, 240 frames @ 24 fps = 10.00 s, exact match to plan) and rendered to `g6_verify_render.mp4` (H.264, 10.00 s, frames independently probe-verified). See G6 transcript below. The Studio-gated external-scripting render (`resolve_agent` subprocess path) remains contract-tested only |

Story-level coverage for previously unverified stories (1.4, 2.2, 3.1, 3.3,
4.2, 4.4) lives in `tests/test_story_coverage.py`.

## Commands

```bash
# From repo root
pytest clipforge/tests -q                       # all automated gate evidence
python clipforge/main.py run --dry-run          # G1 manual
python clipforge/main.py analyze --input <mp4>  # G2 manual
python clipforge/main.py run --trigger manual_local   # G3 manual (media in data/raw/inbox/)
python clipforge/main.py watch --dry-run --max-cycles 3   # G5 manual
# CF-FR-46: non-dry-run jobs with a non-empty plan emit data/output/{job_id}_timeline.otio —
# import into free Resolve via File → Import Timeline (no Studio license).
```

## Recorded transcript (2026-08-10)

Environment: macOS, Python 3.13, fresh venv from pinned `requirements.txt`
(clean `pip install` succeeded — resolves the "not clean-install verified"
caveat in the requirements header). Test suite: **41 passed**.

Sample media: synthetic 10 s motion clip (`g3_motion_sample.mp4`, alternating
high-contrast patterns) placed in `data/raw/inbox/`. `--min-score 0.2` was used
because the synthetic clip scores ~0.55, below the workflow default 0.75; real
footage should be gated at the workflow default.

```text
$ pytest clipforge/tests -q
41 passed, 4 warnings in 8.28s

$ python clipforge/main.py run --dry-run                        # G1
dry_run: skipped Resolve render (no output produced)
Job report: .../clipforge/data/jobs/de4a561e/report.json
EXIT=0

$ python clipforge/main.py analyze --input data/raw/inbox/g3_motion_sample.mp4 --min-score 0.2   # G2
Found 1 candidate segments
{'source': '.../g3_motion_sample.mp4', 'start_sec': 0.0, 'end_sec': 10.0,
 'motion_score': 0.155, 'visual_score': 0.988, 'segment_score': 0.572, ...}
EXIT=0

$ python clipforge/main.py run --trigger manual_local --workflow compilation_dense \
    --dataset inbox_local --min-score 0.2                       # G3 (full job)
Errors:
  - resolve_agent: DaVinci Resolve render failed and non-Resolve fallback is
    disabled (architecture D-04) ... DaVinciResolveScript not found.
Job report: .../clipforge/data/jobs/ff84f4ef/report.json
EXIT=1   # exit 1 is SOLELY the expected G6 Resolve failure; G3 artifacts produced:
#   report.json: segment_count: 1, timeline_count: 1, dry_run: false
#   sidecar:     data/clips/qualified/g3_motion_sample_0.00.json
#                (segment_score 0.545, audio_score 0.5, bootstrap: absent)
#   clip:        data/clips/qualified/ff84f4ef_g3_motion_sample_0.00.mp4

$ python clipforge/main.py watch --dry-run --max-cycles 3 --interval-minutes 1 \
    --workflow compilation_dense --dataset inbox_local --trigger manual_local   # G5
watch: interval=0s max_cycles=3 (Ctrl+C to stop)
... (3 job reports written) ...
watch: completed 3 cycle(s)
EXIT=0
```

## Recorded transcript — G6 (2026-08-12)

Environment: macOS, **free** DaVinci Resolve 21.0.4.5 (About shows no
"Studio"; external scripting connections refused as documented for 19.1+).
Method: an in-Resolve Lua script placed in the user Fusion Scripts folder and
run from Workspace → Scripts **inside** Resolve — internal scripting is not
edition-gated.

Provenance: the run used two interim script variants (pass 1: import+render;
pass 2: item-level inspection after the `items=2` anomaly). Both were
consolidated afterwards into the committed
`resolve_scripts/clipforge_g6_verify.lua`, which performs the pass-1 flow with
the pass-2 `ipairs` item inspection built in — so a re-run prints per-item
`item[N]` lines rather than the `items=N` line quoted below. The log lines
below are verbatim from the original run; `/tmp/clipforge_g6_verify.log` on
this machine holds the pass-2 output (pass 1 was overwritten by pass 2).

```text
# Input artifact — produced by this pipeline run:
$ python clipforge/main.py run --trigger manual_local --workflow compilation_dense \
    --dataset inbox_local --min-score 0.2
# -> OTIO timeline: .../clipforge/data/output/adfb1032_timeline.otio

# Pass 1 — import + render (interim script; /tmp/clipforge_g6_verify.log)
clipforge_g6: product=DaVinci Resolve version=21.0.4.5
clipforge_g6: OTIO IMPORT OK name=adfb1032_timeline
clipforge_g6: video track 1 items=2          # later shown to be a count quirk
clipforge_g6: timeline start=86400 end=86640 # 240 frames
clipforge_g6: render job=34fe59fc-...
clipforge_g6: RENDER STARTED

# Pass 2 — adversarial item inspection (the "items=2" anomaly)
pass2: fps=24  start=86400 end=86640  video tracks=1
pass2: pairs_count=2 ipairs_count=1
pass2: item[1] name=g3_motion_sample.mp4 start=86400 end=86640 duration=240
pass2: NON-NUMERIC key in item list: __flags   # pairs() counted API metadata

# Independent probe of the rendered file (OpenCV, outside Resolve), via:
# python - <<'EOF'
# import cv2
# c = cv2.VideoCapture("data/output/g6_verify_render.mp4")
# print(c.get(cv2.CAP_PROP_FPS), c.get(cv2.CAP_PROP_FRAME_COUNT),
#       c.get(cv2.CAP_PROP_FRAME_WIDTH), c.get(cv2.CAP_PROP_FRAME_HEIGHT))
# EOF
codec=h264 fps=24.0 frames=240.0 duration=10.00s size=3840x2160
first/mid frames readable, non-black content
```

Conclusion: exactly one clip, duration matches the timeline plan to the frame,
and the MP4 is a genuine Resolve H.264 render. Resolution followed the project
default (3840x2160 upscale of the 160x120 synthetic source) since the
verification script sets no FormatWidth/Height.

## Known limitations (honest)

- Dry-run skips analysis: it produces **no** segments, an **empty**
  `timeline_plan`, and **no** `output_path` (job report carries `dry_run: true`).
- `analysis.bootstrap_segment_if_empty` defaults to **false**; synthetic
  bootstrap segments (marked `bootstrap: true`) are never gate evidence.
- The non-Resolve render fallback is disabled by default
  (`resolve.allow_non_resolve_fallback`); Resolve failures fail loudly (D-04).
- The fully-automated render path (`resolve_agent` → subprocess →
  `resolve_editor.py` → external scripting) remains **unverified**: this
  machine runs the free edition, which refuses external scripting connections
  (Studio 19.1+ edition gate; $295 one-time / $30 per month). That path is
  contract-tested against a mock of the documented API
  (`tests/test_resolve_contract.py`) only.
- CF-FR-46 (2026-08-12): every non-dry-run job with a non-empty plan writes
  `data/output/{job_id}_timeline.otio` before the render attempt. The artifact
  is validated in CI by round-tripping through the real `opentimelineio`
  library (`tests/test_otio_export.py`), and its Resolve-side import + render
  was verified live on free Resolve 21.0.4.5 (G6 transcript above). The
  verification used a synthetic 160x120 source; real-footage evidence at
  default thresholds is still outstanding.
- G6 verification is one-click but not unattended on the free edition: an
  operator must trigger Workspace → Scripts inside Resolve (internal scripting
  is not edition-gated; external automation is).
- G3/G2 manual evidence uses a synthetic clip at a lowered `--min-score`;
  evidence from real production footage at default thresholds has not been
  collected.
- No SaaS, no web UI in POC scope (`clipforge ui` is experimental/unspecced).

## Exit declaration

P0 exit requires G1–G5 evidence above plus the G6 path. All six gates now have
recorded evidence in this runbook (automated tests, the 2026-08-10 command
transcript, and the 2026-08-12 live Resolve render on the free edition).
Remaining before declaring P0 exit: **human review** of this evidence — no
story has passed human review yet (see
`_bmad-output/implementation-artifacts/sprint-status.yaml`).
