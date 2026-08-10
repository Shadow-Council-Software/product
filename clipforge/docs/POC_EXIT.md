# ClipForge POC Exit Runbook — DRAFT

**Status: DRAFT (2026-08-10).** Required by story 5.3. This runbook records how
to execute gates G1–G6 and what evidence currently exists. It does NOT declare
P0 complete.

## Gate checklist

| Gate | Requirement | How to verify | Current evidence |
|------|-------------|---------------|------------------|
| G1 | `run --dry-run` completes; report + state emitted | `python clipforge/main.py run --dry-run` | Automated: `tests/test_poc_gates.py::test_g1_dry_run_completes_with_report` |
| G2 | `analyze` returns scored segments | `python clipforge/main.py analyze --input <sample.mp4>` | Automated: `test_g2_analyze_returns_segments` (synthetic clip) |
| G3 | Local job media → `timeline_plan` + segment sidecars | Drop MP4s in `data/raw/inbox/`, run `run --trigger manual_local`; check `data/clips/qualified/{stem}_{start}.json` sidecars | Automated (unit-level): `test_g3_local_media_produces_plan_and_sidecars`; full inbox job not yet exercised in CI |
| G4 | Steering overrides workflow defaults | Two runs, same dataset, different steering; plans differ | Automated (merge-level): `test_g4_steering_overrides_workflow_defaults` |
| G5 | `watch --dry-run` ≥3 cycles without crash | `python clipforge/main.py watch --dry-run --max-cycles 3` | Automated: `test_g5_watch_three_cycles_dry_run` |
| G6 | Growth: extracted clips → real Resolve MP4 | Requires DaVinci Resolve 19+ installed (see `resolve_scripts/README.md`); run a non-dry-run job | **Not verified.** Clip extraction is implemented (`cv/clip_extractor.py`); the Resolve render path has never been executed against a real Resolve install |

## Commands

```bash
# From repo root
pytest clipforge/tests -q                       # all automated gate evidence
python clipforge/main.py run --dry-run          # G1 manual
python clipforge/main.py watch --dry-run --max-cycles 3   # G5 manual
```

## Known limitations (honest)

- Dry-run skips analysis: it produces **no** segments, an **empty**
  `timeline_plan`, and **no** `output_path` (job report carries `dry_run: true`).
- `analysis.bootstrap_segment_if_empty` defaults to **false**; synthetic
  bootstrap segments (marked `bootstrap: true`) are never gate evidence.
- The non-Resolve render fallback is disabled by default
  (`resolve.allow_non_resolve_fallback`); Resolve failures fail loudly (D-04).
- G6 (real Resolve render) remains a documented path only — unverified.
- No SaaS, no web UI in POC scope (`clipforge ui` is experimental/unspecced).

## Exit declaration

P0 exit requires G1–G5 evidence above plus this documented G6 path. A completed
(non-draft) version of this runbook with a recorded command transcript is the
exit artifact.
