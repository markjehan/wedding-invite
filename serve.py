"""Local preview server for the Naveen & Dulanjani invitation.

Run ``python serve.py`` for this computer only, or add ``--lan`` to preview on
phones connected to the same Wi-Fi network.  The invitation is intentionally a
static front end; a database/API is only needed when the demo RSVP is connected
to a real destination.
"""

from __future__ import annotations

import argparse
import functools
import http.server
import socket
from pathlib import Path


ROOT = Path(__file__).resolve().parent


class PreviewHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def local_ip() -> str:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as connection:
            connection.connect(("8.8.8.8", 80))
            return connection.getsockname()[0]
    except OSError:
        return socket.gethostbyname(socket.gethostname())


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the wedding invitation locally.")
    parser.add_argument("--port", type=int, default=4173)
    parser.add_argument("--lan", action="store_true", help="Allow phones on the same Wi-Fi to connect.")
    options = parser.parse_args()

    host = "0.0.0.0" if options.lan else "127.0.0.1"
    handler = functools.partial(PreviewHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer((host, options.port), handler)

    print(f"Laptop: http://127.0.0.1:{options.port}/")
    if options.lan:
        print(f"Same-Wi-Fi phone: http://{local_ip()}:{options.port}/")
    print("Press Ctrl+C to stop.")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
