"""The invitation's own files, served from SITE_DIR.

Only what the page uses is public: index.html, every file it links to, the calendar files and the
assets folder (the stylesheets and scripts also reach into assets/ by themselves). SITE_DIR is the
project folder on the laptop, which also holds the git repository and the design notes, so anything
outside that list is refused. share.py draws the same line for the quick tunnel.
"""
import mimetypes
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import urlsplit

from django.conf import settings
from django.utils.html import json_script

# Python's table misses these on a stock Windows install, and a wrong type means the browser
# refuses the font or will not play the score.
for suffix, kind in {'.webp': 'image/webp', '.mp3': 'audio/mpeg', '.ttf': 'font/ttf', '.otf': 'font/otf',
                     '.woff': 'font/woff', '.woff2': 'font/woff2', '.ics': 'text/calendar'}.items():
    mimetypes.add_type(kind, suffix)

_cache = {}


def _index():
    """index.html and the files it links to, read again whenever the file changes."""
    path = Path(settings.SITE_DIR) / 'index.html'
    stamp = path.stat().st_mtime_ns
    if _cache.get('stamp') != stamp:
        text = path.read_text(encoding='utf-8')
        linked = {'index.html'}

        class References(HTMLParser):
            def handle_starttag(self, tag, attrs):
                for key, value in attrs:
                    if key in {'src', 'href'} and value:
                        url = urlsplit(value)
                        if not url.scheme and not url.netloc and url.path:
                            linked.add(url.path.removeprefix('./'))

        References().feed(text)
        _cache.update(stamp=stamp, text=text, linked=linked)
    return _cache['text'], _cache['linked']


def public_file(name):
    """The file at this address if it is one the invitation uses, otherwise None."""
    parts = PurePosixPath(name).parts
    if not parts or name.startswith('/') or '\\' in name or any(part in {'..', '.'} or part.startswith('.') for part in parts):
        return None
    _, linked = _index()
    if not (name in linked or (len(parts) == 1 and name.endswith('.ics')) or parts[0] == 'assets'):
        return None
    root = Path(settings.SITE_DIR).resolve()
    path = (root / name).resolve()
    if not path.is_file() or not path.is_relative_to(root):
        return None
    return path


def content_type(path):
    return mimetypes.guess_type(path.name)[0] or 'application/octet-stream'


def page(data):
    """index.html with what the page needs to know about this visit, as JSON for invitation.js."""
    text, _ = _index()
    if '</head>' not in text:
        raise ValueError('index.html has no </head> to put the guest details before.')
    return text.replace('</head>', f'  {json_script(data, "invite-data")}\n</head>', 1)
