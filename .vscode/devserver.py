#!/usr/bin/env python3
"""Static dev server for the DJ website.

Same as `python3 -m http.server`, except every response is sent with
no-store. Python's plain server sends only Last-Modified, which lets
Chrome apply heuristic caching and quietly reuse a stale CSS/JS file
after you've edited it — the page then runs new JS against old CSS.
"""
import sys
from http.server import SimpleHTTPRequestHandler, test
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # repo root, one level above .vscode/


class NoCacheHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8081
    test(HandlerClass=NoCacheHandler, port=port, bind="127.0.0.1")
