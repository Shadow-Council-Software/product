from clipforge.sources.adapters.ftp import FtpAdapter
from clipforge.sources.adapters.http_download import HttpDownloadAdapter
from clipforge.sources.adapters.local_folder import LocalFolderAdapter
from clipforge.sources.adapters.manifest import ManifestAdapter
from clipforge.sources.adapters.search import SearchAdapter
from clipforge.sources.adapters.url_list import UrlListAdapter

ADAPTERS = [
    LocalFolderAdapter(),
    UrlListAdapter(),
    HttpDownloadAdapter(),
    SearchAdapter(),
    FtpAdapter(),
    ManifestAdapter(),
]
