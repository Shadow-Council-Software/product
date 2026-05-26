from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

from clipforge.sources.types import FetchResult, SourceRef


class SourceAdapter(ABC):
    """Discover and optionally fetch media for one source type."""

    type_id: str = ""

    @abstractmethod
    def discover(self, config: dict[str, Any], context: dict[str, Any]) -> list[SourceRef]:
        """Return references to media (URLs, paths, remote keys)."""

    def fetch(
        self,
        ref: SourceRef,
        dest_dir: Path,
        context: dict[str, Any],
    ) -> FetchResult | None:
        """Download or copy ref into dest_dir. Return None if not applicable."""
        return None

    def supports_fetch(self) -> bool:
        return False
