#!/usr/bin/env python3
"""
Heliopoly game telemetry (#61).
POST /game-log  JSON body from the browser at game end.
Stores flat files under LOG_ROOT/YYYY-MM/game-{ts}-{id}.json
Never stores raw client IP — only HMAC-SHA256(secret, ip).
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

HOST = os.environ.get("HELIOPOLY_TELEMETRY_HOST", "127.0.0.1")
PORT = int(os.environ.get("HELIOPOLY_TELEMETRY_PORT", "3847"))
LOG_ROOT = Path(os.environ.get("HELIOPOLY_TELEMETRY_LOG_ROOT", "/var/www/heliopoly/logs"))
SECRET_PATH = Path(
    os.environ.get(
        "HELIOPOLY_TELEMETRY_SECRET_FILE",
        "/etc/heliopoly/telemetry_secret",
    )
)
MAX_BODY = 512 * 1024  # 512 KiB
MAX_FILES = 1000
MAX_BYTES = 50 * 1024 * 1024  # 50 MiB
ALLOWED_ORIGINS = {
    "https://heliopoly.live",
    "https://www.heliopoly.live",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
}


def load_secret() -> bytes:
    if SECRET_PATH.is_file():
        return SECRET_PATH.read_bytes().strip()
    # Dev fallback — never use in production without a real secret file
    env = os.environ.get("HELIOPOLY_TELEMETRY_SECRET", "").encode()
    if env:
        return env
    print("WARN: no telemetry secret; using ephemeral random (ids not stable)", file=sys.stderr)
    return os.urandom(32)


SECRET = load_secret()


def player_id_for_ip(ip: str) -> str:
    # Normalize IPv4-mapped IPv6
    if ip.startswith("::ffff:"):
        ip = ip[7:]
    digest = hmac.new(SECRET, ip.encode("utf-8"), hashlib.sha256).hexdigest()
    return digest[:32]


def client_ip(handler: BaseHTTPRequestHandler) -> str:
    xff = handler.headers.get("X-Forwarded-For", "")
    if xff:
        return xff.split(",")[0].strip()
    xri = handler.headers.get("X-Real-IP", "")
    if xri:
        return xri.strip()
    return handler.client_address[0]


def all_game_files() -> list[Path]:
    if not LOG_ROOT.is_dir():
        return []
    return sorted(LOG_ROOT.rglob("game-*.json"), key=lambda p: p.stat().st_mtime)


def enforce_caps() -> None:
    files = all_game_files()
    total = sum(f.stat().st_size for f in files if f.is_file())
    # Drop oldest until under both caps
    while files and (len(files) > MAX_FILES or total > MAX_BYTES):
        oldest = files.pop(0)
        try:
            size = oldest.stat().st_size
            oldest.unlink(missing_ok=True)
            total -= size
        except OSError:
            break


def write_game(record: dict) -> Path:
    now = time.time()
    ts = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime(now))
    month = time.strftime("%Y-%m", time.gmtime(now))
    short = record.get("player_id", "anon")[:8]
    dest_dir = LOG_ROOT / month
    dest_dir.mkdir(parents=True, exist_ok=True)
    path = dest_dir / f"game-{ts}-{short}.json"
    # Avoid clobber
    n = 0
    while path.exists():
        n += 1
        path = dest_dir / f"game-{ts}-{short}-{n}.json"
    path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    enforce_caps()
    return path


class Handler(BaseHTTPRequestHandler):
    server_version = "HeliopolyTelemetry/1.0"

    def log_message(self, fmt: str, *args) -> None:
        # No raw IPs in access log
        sys.stderr.write("%s - %s\n" % (self.log_date_time_string(), fmt % args))

    def _cors(self) -> None:
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self) -> None:
        if urlparse(self.path).path in ("/health", "/"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"ok":true,"service":"heliopoly-telemetry"}\n')
            return
        self.send_error(404)

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path not in ("/game-log", "/api/game-log"):
            self.send_error(404)
            return
        origin = self.headers.get("Origin", "")
        # Same-origin browser posts include Origin; allow missing for local curl tests
        if origin and origin not in ALLOWED_ORIGINS:
            self.send_error(403, "origin not allowed")
            return
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length <= 0 or length > MAX_BODY:
            self.send_error(413, "body too large or empty")
            return
        raw = self.rfile.read(length)
        try:
            body = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_error(400, "invalid json")
            return
        if not isinstance(body, dict):
            self.send_error(400, "expected object")
            return
        log = body.get("log")
        meta = body.get("meta")
        if not isinstance(log, list) or not isinstance(meta, dict):
            self.send_error(400, "need log[] and meta{}")
            return
        # Cap log lines / sizes
        if len(log) > 5000:
            log = log[-5000:]
        log = [str(x)[:2000] for x in log]

        ip = client_ip(self)
        pid = player_id_for_ip(ip)
        record = {
            "v": 1,
            "received_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "player_id": pid,
            "meta": {
                k: meta[k]
                for k in (
                    "playerCount",
                    "aiDifficulty",
                    "propellants",
                    "humanPropellant",
                    "seed",
                    "round",
                    "gameTurn",
                    "winnerId",
                    "winnerName",
                    "endReason",
                    "boardRotations",
                    "humanSeat",
                    "client",
                )
                if k in meta
            },
            "log": log,
        }
        try:
            out = write_game(record)
        except OSError as e:
            self.send_error(500, f"write failed: {e}")
            return
        self.send_response(201)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        # Do not echo player_id path details beyond ok
        self.wfile.write(
            json.dumps({"ok": True, "file": out.name}).encode("utf-8") + b"\n"
        )


def main() -> None:
    LOG_ROOT.mkdir(parents=True, exist_ok=True)
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"heliopoly telemetry on {HOST}:{PORT} log_root={LOG_ROOT}", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
