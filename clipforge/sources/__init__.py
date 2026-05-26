"""Pluggable media source adapters for ClipForge acquisition."""

from clipforge.sources.registry import discover_media, fetch_media, get_adapter
from clipforge.sources.types import SourceRef

__all__ = ["SourceRef", "discover_media", "fetch_media", "get_adapter"]
