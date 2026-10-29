"""Serve the built invitation for a temporary public share link.

Serves ``dist/`` and nothing else. The project root holds the git repository, the
design notes and the QA captures, none of which belong on a public URL, so the
share always points at the build rather than at the working tree.

Run ``python share.py`` and then point a Cloudflare quick tunnel at the port:

    cloudflared tunnel --url http://127.0.0.1:4321

The link lives only as long as both processes do.
"""

from __future__ import annotations

import argparse
import http.server
import mimetypes
import shutil
from functools import partial
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent / 'dist'


def refresh_public_copy() -> None:
    """Refresh public files from the current invitation before sharing."""
    source = ROOT.parent
    public_files = {'index.html'}

    class References(HTMLParser):
        def handle_starttag(self, tag, attrs):
            for key, value in attrs:
                if key not in {'src', 'href'} or not value:
                    continue
                url = urlsplit(value)
                if url.scheme or url.netloc or not url.path:
                    continue
                relative = Path(url.path)
                if relative.is_absolute() or '..' in relative.parts:
                    raise ValueError(f'Invalid public file reference: {value}')
                public_files.add(relative.as_posix())

    References().feed((source / 'index.html').read_text(encoding='utf-8'))
    public_files.update(path.name for path in source.glob('*.ics'))
    ROOT.mkdir(exist_ok=True)
    for name in sorted(public_files):
        target = ROOT / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source / name, target)
    # CSS and language scripts also reference artwork and fonts dynamically.
    shutil.copytree(source / 'assets', ROOT / 'assets', dirs_exist_ok=True)

# Python's table misses these on a stock Windows install, and a wrong type means
# the browser refuses the font or will not stream the audio.
for suffix, kind in {
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.woff': 'font/woff',
    '.ics': 'text/calendar',
}.items():
    mimetypes.add_type(kind, suffix)


class ShareHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # The invitation carries real names and a date. A share link is for the people
        # it was sent to, not for search engines.
        self.send_header('X-Robots-Tag', 'noindex, nofollow')
        # The markup and the code are still being changed while the link is live, so they
        # must never be held in a viewer's browser - someone asked to look again should
        # see the current version, not the one they happened to load first. The assets are
        # the opposite case: they are large, they rarely change, and re-fetching ten
        # megabytes on every visit is what would actually make the link feel slow.
        path = self.path.split('?')[0]
        if path.startswith('/assets/'):
            self.send_header('Cache-Control', 'public, max-age=86400')
        else:
            self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def log_message(self, fmt, *args):  # quieter than the default one-line-per-asset
        if args and isinstance(args[0], str) and args[0].startswith('GET /'):
            path = args[0].split(' ')[1]
            if path.startswith('/assets/'):
                return
        super().log_message(fmt, *args)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4321)
    options = parser.parse_args()

    refresh_public_copy()

    handler = partial(ShareHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', options.port), handler)
    print(f'Serving {ROOT} on http://127.0.0.1:{options.port}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
