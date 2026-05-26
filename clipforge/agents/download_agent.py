from __future__ import annotations

from clipforge.lib.acquisition import fetch_for_job
from clipforge.lib.state import ClipForgeState


def download_node(state: ClipForgeState) -> ClipForgeState:
    """Fetch remote refs (http_download, ftp) via source adapters."""
    return fetch_for_job(state)
