"""Build the current invitation as an offline, self-contained HTML file."""
from pathlib import Path
import base64
import mimetypes
import re

root = Path(__file__).resolve().parent
html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'invitation.css').read_text(encoding='utf-8')
js = (root / 'invitation.js').read_text(encoding='utf-8')
for script in ['avenra-strokes.js', 'venue-drawing.js']:
    content = (root / script).read_text(encoding='utf-8')
    html = html.replace(f'<script src="{script}" defer></script>', '<script>' + content + '</script>')
html = re.sub(r'<link rel="preload"[^>]+>', '', html)
html = html.replace('<link rel="stylesheet" href="invitation.css">', '<style>' + css + '</style>')
html = html.replace('<script src="invitation.js" defer></script>', '<script>' + js + '</script>')
paths = set(re.findall(r'assets/[\w./-]+\.(?:png|jpg|webp|ttf)', html))
for path in sorted(paths, key=len, reverse=True):
    mime = mimetypes.guess_type(path)[0] or 'application/octet-stream'
    value = base64.b64encode((root / path).read_bytes()).decode('ascii')
    html = html.replace(path, f'data:{mime};base64,{value}')
output = root / 'invitation-bundled.html'
output.write_text(html, encoding='utf-8')
print(f'Built {output.name}: {output.stat().st_size:,} bytes; {len(paths)} embedded assets')
