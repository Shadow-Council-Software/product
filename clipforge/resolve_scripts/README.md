# DaVinci Resolve scripts

**Required edition: DaVinci Resolve Studio 19.1 or later** (scripting API per
CF-NFR-I1).

**Warning — the free edition does NOT work for this integration.** Since
Resolve 19.1 (November 2024), external scripting — connecting to Resolve from a
separate process, which is exactly how `resolve_agent.py` invokes
`resolve_editor.py` — is a Studio-only feature. The free edition refuses
external connections (deliberate edition gate, not a setup problem). The free
edition can only run scripts from its internal console / Workspace → Scripts
menu, which the ClipForge pipeline does not use. Studio is a one-time $295
license or $30/month via Blackmagic Cloud.

Resolve (Studio) must be **running** for a script to connect. For automation
without a display, launch it headless: `"/path/to/Resolve" -nogui` — the
scripting API keeps working.

## License-free alternative: OTIO import (works on the FREE edition)

Every non-dry-run job with a non-empty timeline plan also writes an
OpenTimelineIO handoff artifact
(`data/output/{job_id}_timeline.otio`, CF-FR-46) **before** attempting the
scripted render. OTIO import is a plain file dialog — it does not use the
scripting bridge, so it works on the free edition:

1. Open DaVinci Resolve (free or Studio), create/open a project.
2. **File → Import Timeline → Import AAF, EDL, XML, OTIO…** and select the
   `.otio` file.
3. Resolve reconstructs the edit (clip order and in/out points against the
   original source media) and relinks media; then render from the Deliver page.

The artifact is validated automatically (`tests/test_otio_export.py`), and the
Resolve-side import + render was **verified live on free DaVinci Resolve
21.0.4.5 (2026-08-12)** — see the G6 transcript in `docs/POC_EXIT.md`.

For a one-click semi-automated version, install `clipforge_g6_verify.lua`
(this folder) into Resolve's user Fusion Scripts folder and run it from
**Workspace → Scripts** inside Resolve. Internal scripting is not
edition-gated, so this works on the free edition; only external-process
scripting requires Studio.

## Setup

1. Open DaVinci Resolve → **Help → Documentation → Developer**.
2. Copy `DaVinciResolveScript.py` / module path into your venv or set:

   ```bash
   export RESOLVE_SCRIPT_API="/Library/Application Support/Blackmagic Design/DaVinci Resolve/Developer/Scripting"
   export PYTHONPATH="$RESOLVE_SCRIPT_API/Modules:$PYTHONPATH"
   ```

3. Enable external scripting in Resolve preferences.

## Test

```bash
python resolve_scripts/resolve_editor.py --dry-run
```

## API references

**Official documentation** (authoritative) — the `README.txt` shipped inside the
Resolve install. Open via **Help → Documentation → Developer**, or read directly:

- macOS: `/Library/Application Support/Blackmagic Design/DaVinci Resolve/Developer/Scripting/README.txt`
- Windows: `%PROGRAMDATA%\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting\README.txt`
- Linux: `/opt/resolve/Developer/Scripting/README.txt`

Unofficial mirrors (convenience only; may lag the shipped docs):

- https://gist.github.com/X-Raym/2f2bf453fc481b9cca624d7ca0e19de8
- https://deric.github.io/DaVinciResolve-API-Docs/
- https://extremraym.com/cloud/resolve-scripting-doc/
