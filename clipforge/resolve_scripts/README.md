# DaVinci Resolve scripts

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

- https://gist.github.com/X-Raym/2f2bf453fc481b9cca624d7ca0e19de8
- https://deric.github.io/DaVinciResolve-API-Docs/
- https://extremraym.com/cloud/resolve-scripting-doc/
