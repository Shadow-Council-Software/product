"""Contract tests for resolve_editor.py against a mock DaVinciResolveScript.

Stories 5-1 / 5-2: no DaVinci Resolve Studio install is available, so these
tests verify ClipForge's side of the scripting contract — the call sequence
and argument shapes documented in Blackmagic's scripting README (v20.3
reference; the supported floor is Studio 19.1+, and every API used here is
stable across that range). They do NOT verify Resolve's runtime behavior
(that is gate G6).
"""
from __future__ import annotations

import importlib.util
import sys
import types
from pathlib import Path

import pytest

EDITOR_PATH = (
    Path(__file__).resolve().parent.parent / "resolve_scripts" / "resolve_editor.py"
)

# Valid SetRenderSettings keys per the official scripting README. Format and
# codec are deliberately absent: they must go via SetCurrentRenderFormatAndCodec.
DOCUMENTED_RENDER_SETTINGS_KEYS = {
    "SelectAllFrames", "MarkIn", "MarkOut", "TargetDir", "CustomName",
    "UniqueFilenameStyle", "ExportVideo", "ExportAudio", "FormatWidth",
    "FormatHeight", "FrameRate", "PixelAspectRatio", "VideoQuality",
    "AudioCodec", "AudioBitDepth", "AudioSampleRate", "ColorSpaceTag",
    "GammaTag", "ExportAlpha", "NetworkOptimization",
}


def _load_editor():
    spec = importlib.util.spec_from_file_location("resolve_editor", EDITOR_PATH)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class FakeMediaPool:
    def __init__(self, calls: list, import_result=None):
        self.calls = calls
        self._import_result = import_result

    def ImportMedia(self, paths):
        self.calls.append(("ImportMedia", list(paths)))
        if self._import_result is not None:
            return self._import_result
        return [f"item:{p}" for p in paths]

    def CreateEmptyTimeline(self, name):
        self.calls.append(("CreateEmptyTimeline", name))
        return f"timeline:{name}"

    def AppendToTimeline(self, payload):
        self.calls.append(("AppendToTimeline", payload))
        return True


class FakeProject:
    def __init__(
        self, calls: list, media_pool, format_codec_ok=True, start_ok=True
    ):
        self.calls = calls
        self._media_pool = media_pool
        self._format_codec_ok = format_codec_ok
        self._start_ok = start_ok

    def GetMediaPool(self):
        return self._media_pool

    def SetCurrentRenderFormatAndCodec(self, fmt, codec):
        self.calls.append(("SetCurrentRenderFormatAndCodec", fmt, codec))
        return self._format_codec_ok

    def SetRenderSettings(self, settings):
        self.calls.append(("SetRenderSettings", dict(settings)))
        return True

    def AddRenderJob(self):
        self.calls.append(("AddRenderJob",))
        return "job-1"

    def StartRendering(self):
        self.calls.append(("StartRendering",))
        return self._start_ok

    def IsRenderingInProgress(self):
        self.calls.append(("IsRenderingInProgress",))
        return False  # render finished immediately


class FakeProjectManager:
    def __init__(self, project):
        self._project = project

    def CreateProject(self, name):
        self._project.calls.append(("CreateProject", name))
        return self._project

    def GetCurrentProject(self):
        return self._project


def _install_fake_dvr(monkeypatch, project):
    fake = types.ModuleType("DaVinciResolveScript")

    class FakeResolve:
        def GetProjectManager(self):
            return FakeProjectManager(project)

    fake.scriptapp = lambda name: FakeResolve()
    monkeypatch.setitem(sys.modules, "DaVinciResolveScript", fake)


def test_build_timeline_call_sequence_and_shapes(tmp_path, monkeypatch):
    calls: list = []
    project = FakeProject(calls, FakeMediaPool(calls))
    _install_fake_dvr(monkeypatch, project)

    editor = _load_editor()
    clips = [str(tmp_path / "a.mp4"), str(tmp_path / "b.mp4")]
    out_dir = tmp_path / "out"
    editor.build_timeline(
        clips,
        project_name="ClipForge_test",
        timeline_name="TL_test",
        output_dir=out_dir,
    )

    names = [c[0] for c in calls]
    assert names == [
        "CreateProject",
        "ImportMedia",
        "CreateEmptyTimeline",
        "AppendToTimeline",
        "AppendToTimeline",
        "SetCurrentRenderFormatAndCodec",
        "SetRenderSettings",
        "AddRenderJob",
        "StartRendering",
        "IsRenderingInProgress",
    ]

    assert calls[0] == ("CreateProject", "ClipForge_test")
    assert calls[1] == ("ImportMedia", clips)
    assert calls[2] == ("CreateEmptyTimeline", "TL_test")

    # AppendToTimeline payload shape: [{"mediaPoolItem": item, "trackIndex": 1}]
    for _, payload in calls[3:5]:
        assert isinstance(payload, list) and len(payload) == 1
        entry = payload[0]
        assert entry["trackIndex"] == 1
        assert entry["mediaPoolItem"].startswith("item:")

    # Format/codec via the dedicated call, with documented identifiers.
    assert calls[5] == ("SetCurrentRenderFormatAndCodec", "mp4", "H264")

    settings = calls[6][1]
    assert set(settings) <= DOCUMENTED_RENDER_SETTINGS_KEYS, (
        f"undocumented SetRenderSettings keys: "
        f"{set(settings) - DOCUMENTED_RENDER_SETTINGS_KEYS}"
    )
    assert "Format" not in settings and "Codec" not in settings
    assert settings["TargetDir"] == str(out_dir)
    assert settings["SelectAllFrames"] is True
    assert settings["CustomName"] == "ClipForge_test_compilation"

    assert out_dir.is_dir(), "output dir must exist before the render is queued"


def test_render_format_codec_flow_from_arguments(tmp_path, monkeypatch):
    """Story 5-2: configured format/codec must reach the dedicated API call."""
    calls: list = []
    project = FakeProject(calls, FakeMediaPool(calls))
    _install_fake_dvr(monkeypatch, project)

    editor = _load_editor()
    editor.build_timeline(
        [str(tmp_path / "a.mp4")],
        output_dir=tmp_path / "out",
        render_format="mov",
        render_codec="ProRes422HQ",
    )
    assert ("SetCurrentRenderFormatAndCodec", "mov", "ProRes422HQ") in calls


def test_format_codec_rejection_fails_loudly(tmp_path, monkeypatch):
    calls: list = []
    project = FakeProject(calls, FakeMediaPool(calls), format_codec_ok=False)
    _install_fake_dvr(monkeypatch, project)

    editor = _load_editor()
    with pytest.raises(RuntimeError, match="SetCurrentRenderFormatAndCodec"):
        editor.build_timeline(
            [str(tmp_path / "a.mp4")],
            output_dir=tmp_path / "out",
        )
    assert ("AddRenderJob",) not in calls, "must not queue a render after failure"


def test_empty_import_fails_loudly(tmp_path, monkeypatch):
    calls: list = []
    project = FakeProject(calls, FakeMediaPool(calls, import_result=[]))
    _install_fake_dvr(monkeypatch, project)

    editor = _load_editor()
    with pytest.raises(RuntimeError, match="ImportMedia"):
        editor.build_timeline(
            [str(tmp_path / "missing.mp4")],
            output_dir=tmp_path / "out",
        )


def test_start_rendering_failure_fails_loudly(tmp_path, monkeypatch):
    """A False return from StartRendering must not be reported as success."""
    calls: list = []
    project = FakeProject(calls, FakeMediaPool(calls), start_ok=False)
    _install_fake_dvr(monkeypatch, project)

    editor = _load_editor()
    with pytest.raises(RuntimeError, match="StartRendering"):
        editor.build_timeline(
            [str(tmp_path / "a.mp4")],
            output_dir=tmp_path / "out",
        )


def test_main_argparse_wiring_reaches_api(tmp_path, monkeypatch):
    """Story 5-2, CLI link: --render-format/--render-codec must survive the
    argparse -> build_timeline handoff, not just direct kwargs."""
    calls: list = []
    project = FakeProject(calls, FakeMediaPool(calls))
    _install_fake_dvr(monkeypatch, project)

    editor = _load_editor()
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "resolve_editor.py",
            "--clips",
            str(tmp_path / "a.mp4"),
            "--output-dir",
            str(tmp_path / "out"),
            "--project-name",
            "ClipForge_cli",
            "--render-format",
            "mov",
            "--render-codec",
            "ProRes422HQ",
        ],
    )
    editor.main()
    assert ("SetCurrentRenderFormatAndCodec", "mov", "ProRes422HQ") in calls
    assert ("CreateProject", "ClipForge_cli") in calls
