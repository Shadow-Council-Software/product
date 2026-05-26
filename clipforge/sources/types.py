from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class SourceRef:
    """A discoverable or fetchable media source reference."""

    type: str
    uri: str
    label: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "type": self.type,
            "uri": self.uri,
            "label": self.label,
            "metadata": self.metadata,
        }


@dataclass
class FetchResult:
    local_path: str
    source_ref: SourceRef
    bytes_size: int = 0
