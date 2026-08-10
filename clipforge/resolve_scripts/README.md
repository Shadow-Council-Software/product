# DaVinci Resolve scripts

**Required version: DaVinci Resolve 19 or later** (scripting API per CF-NFR-I1).

Run these **inside Resolve’s scripting environment** or via Resolve’s bundled Python with `DaVinciResolveScript` on `PYTHONPATH`.

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
