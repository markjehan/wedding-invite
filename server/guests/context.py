"""What every page of the couple's admin and the sign-in pages needs to know."""
import os
from pathlib import Path

STATIC = Path(__file__).resolve().parent / 'static' / 'guests'


def asset_version(request):
    """A stamp for the admin's stylesheets and script, added to their addresses.

    A phone that kept last week's stylesheet would draw this week's pages with it, half styled.
    A new stamp is a new address, so each update is fetched fresh. On Vercel it is the commit
    being served. Anywhere else it is when the files last changed.
    """
    commit = os.environ.get('VERCEL_GIT_COMMIT_SHA', '')[:12]
    if commit:
        return {'asset_version': commit}
    stamp = max((path.stat().st_mtime_ns for path in STATIC.iterdir() if path.is_file()), default=0)
    return {'asset_version': str(stamp // 1_000_000 or 1)}
