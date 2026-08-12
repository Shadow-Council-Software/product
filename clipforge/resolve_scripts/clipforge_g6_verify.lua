-- ClipForge G6 verification script (CF-FR-46 handoff -> real Resolve render).
--
-- Runs INSIDE DaVinci Resolve, so it works on the FREE edition (internal
-- scripting is not edition-gated; only external connections require Studio).
-- Lua is used deliberately: it is built into Resolve and needs no Python.
--
-- Install: copy into the user scripts folder, then click
--   Workspace -> Scripts -> clipforge_g6_verify   (restart Resolve if absent)
--   macOS:  ~/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Scripts/Utility/
--   Windows: %APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\
--            (%APPDATA% already expands to ...\AppData\Roaming)
--   Linux:  ~/.local/share/DaVinciResolve/Fusion/Scripts/Utility/
--
-- ADJUST the three paths below to your machine before running.
-- On Windows also change LOG_PATH (no /tmp there), e.g. to %TEMP%.
-- Evidence from the 2026-08-12 run is recorded in docs/POC_EXIT.md.

local LOG_PATH = "/tmp/clipforge_g6_verify.log"
local OTIO_PATH = "/ABSOLUTE/PATH/TO/clipforge/data/output/{job_id}_timeline.otio"
local OUT_DIR = "/ABSOLUTE/PATH/TO/clipforge/data/output"

local log = io.open(LOG_PATH, "w")
if not log then
    print("clipforge_g6: FATAL: cannot open log file " .. LOG_PATH
        .. " for writing — adjust LOG_PATH at the top of this script")
    return
end
local function say(msg)
    log:write(msg .. "\n")
    log:flush()
    print(msg)
end

say("clipforge_g6: start " .. os.date("!%Y-%m-%dT%H:%M:%SZ"))

local ok, err = pcall(function()
    resolve = resolve or Resolve()
    say("clipforge_g6: product=" .. tostring(resolve:GetProductName())
        .. " version=" .. tostring(resolve:GetVersionString()))

    local pm = resolve:GetProjectManager()
    if not pm then error("GetProjectManager returned nil") end
    local project = pm:CreateProject("ClipForge_G6_" .. os.time())
        or pm:GetCurrentProject()
    if not project then error("no project available") end

    local mp = project:GetMediaPool()
    local timeline = mp:ImportTimelineFromFile(OTIO_PATH)
    if not timeline then
        error("ImportTimelineFromFile returned nil for " .. OTIO_PATH)
    end
    say("clipforge_g6: OTIO IMPORT OK name=" .. tostring(timeline:GetName()))
    say("clipforge_g6: fps=" .. tostring(timeline:GetSetting("timelineFrameRate"))
        .. " start=" .. tostring(timeline:GetStartFrame())
        .. " end=" .. tostring(timeline:GetEndFrame()))

    -- NOTE: iterate with ipairs, not pairs — Resolve API lists carry a
    -- non-numeric __flags key that inflates pairs() counts.
    local items = timeline:GetItemListInTrack("video", 1)
    if items then
        for i, item in ipairs(items) do
            say(string.format(
                "clipforge_g6: item[%d] name=%s start=%s end=%s duration=%s",
                i, tostring(item:GetName()), tostring(item:GetStart()),
                tostring(item:GetEnd()), tostring(item:GetDuration())
            ))
        end
    end

    if not project:SetCurrentRenderFormatAndCodec("mp4", "H264") then
        error("SetCurrentRenderFormatAndCodec(mp4,H264) failed")
    end
    if not project:SetRenderSettings({
        SelectAllFrames = true,
        TargetDir = OUT_DIR,
        CustomName = "g6_verify_render",
    }) then
        error("SetRenderSettings failed")
    end
    local jid = project:AddRenderJob()
    if not jid then error("AddRenderJob returned nil") end
    say("clipforge_g6: render job=" .. tostring(jid))
    project:StartRendering(jid)
    say("clipforge_g6: RENDER STARTED")
end)

if not ok then
    say("clipforge_g6: FAILED: " .. tostring(err))
end
say("clipforge_g6: done")
log:close()
