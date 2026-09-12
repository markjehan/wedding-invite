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
from functools import partial
from pathlib import Path

ROOT = Path(__file__).resolve().parent / 'dist'

# Python's table misses these on a stock Windows install, and a wrong type means
# the browser refuses the font or will not stream the audio.
for suffix, kind in {
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.ics': 'text/calendar',
}.items():
    mimetypes.add_type(kind, suffix)


class ShareHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # The invitation carries real names, a date and a venue. A share link is for
        # the people it was sent to, not for search engines.
        self.send_header('X-Robots-Tag', 'noindex, nofollow')
        self.send_header('Cache-Control', 'public, max-age=300')
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

    if not ROOT.is_dir():
        raise SystemExit("dist/ is missing - build it first, then run this again.")

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
