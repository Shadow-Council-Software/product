from __future__ import annotations

import ftplib
from datetime import datetime
from pathlib import Path
from typing import Any

from clipforge.sources.base import SourceAdapter
from clipforge.sources.types import FetchResult, SourceRef

VIDEO_EXTS = {".mp4", ".mov", ".mkv", ".webm", ".m4v", ".avi"}


def _parse_after_date(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        return None


class FtpAdapter(SourceAdapter):
    """
    List and fetch video files from FTP/FTPS.

    Config:
      host, port (21), user, password (or env FTP_PASSWORD),
      remote_path (/), after_date, passive (true)
    """

    type_id = "ftp"

    def discover(self, config: dict[str, Any], context: dict[str, Any]) -> list[SourceRef]:
        host = config.get("host")
        if not host:
            return []
        remote_path = config.get("remote_path", "/")
        after = _parse_after_date(config.get("after_date") or config.get("media_after"))
        refs: list[SourceRef] = []

        ftp = self._connect(config, context)
        try:
            ftp.cwd(remote_path)
            for name, facts in self._nlst_facts(ftp):
                if Path(name).suffix.lower() not in VIDEO_EXTS:
                    continue
                mtime = datetime.utcfromtimestamp(self._mtime_from_facts(facts))
                if after and mtime < after:
                    continue
                uri = f"ftp://{host}{remote_path.rstrip('/')}/{name}"
                meta = {**config, "filename": name, "mtime": mtime.isoformat()}
                refs.append(
                    SourceRef(
                        type=self.type_id,
                        uri=uri,
                        label=name,
                        metadata=meta,
                    )
                )
        finally:
            try:
                ftp.quit()
            except Exception:
                pass
        return refs

    def supports_fetch(self) -> bool:
        return True

    def fetch(
        self,
        ref: SourceRef,
        dest_dir: Path,
        context: dict[str, Any],
    ) -> FetchResult | None:
        import os

        meta = ref.metadata
        host = meta.get("host")
        filename = meta.get("filename") or Path(ref.uri).name
        remote_path = meta.get("remote_path", "/")
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / filename

        ftp_cfg = {
            "host": host,
            "port": meta.get("port", 21),
            "user": meta.get("user"),
            "password": meta.get("password"),
            "passive": meta.get("passive", True),
        }
        ftp = self._connect(ftp_cfg, context)
        try:
            ftp.cwd(remote_path)
            with dest.open("wb") as f:
                ftp.retrbinary(f"RETR {filename}", f.write)
        finally:
            try:
                ftp.quit()
            except Exception:
                pass

        return FetchResult(
            local_path=str(dest.resolve()),
            source_ref=ref,
            bytes_size=dest.stat().st_size,
        )

    def _connect(self, config: dict[str, Any], context: dict[str, Any]):
        import os

        host = config["host"]
        port = int(config.get("port", 21))
        user = config.get("user") or os.environ.get("FTP_USER", "anonymous")
        password = config.get("password") or os.environ.get("FTP_PASSWORD", "")
        ftp = ftplib.FTP()
        ftp.connect(host, port, timeout=int(config.get("timeout", 60)))
        ftp.login(user, password)
        if config.get("passive", True):
            ftp.set_pasv(True)
        return ftp

    def _nlst_facts(self, ftp: ftplib.FTP):
        try:
            for name, facts in ftp.mlsd():
                if facts.get("type") == "file":
                    yield name, facts
        except ftplib.error_perm:
            for name in ftp.nlst():
                if name in (".", ".."):
                    continue
                yield name, None

    def _mtime_from_facts(self, facts) -> float:
        if facts and len(facts) > 2 and "modify" in str(facts):
            return datetime.now().timestamp()
        return datetime.now().timestamp()
