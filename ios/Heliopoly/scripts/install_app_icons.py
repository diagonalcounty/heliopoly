#!/usr/bin/env python3
"""Install App Store icons and derive web favicons from AppIcon.png.

App icon (rocket-and-sun) is the source of truth. Web favicons / apple-touch /
icon-192 are resized copies of that same art — not the Ops Manual book.
"""
from __future__ import annotations

import os
import shutil
import struct
import subprocess
import sys

# Prefer durable sources under AppStore/sources; fall back to session Imagine output.
REPO_IOS = "/Users/jacobroecker/code/heliopoly/ios/Heliopoly"
REPO_ROOT = os.path.abspath(os.path.join(REPO_IOS, "..", ".."))
SOURCES = os.path.join(REPO_IOS, "AppStore", "sources")
SESSION_SRC = (
    "/Users/jacobroecker/.grok/sessions/"
    "%2FUsers%2Fjacobroecker%2Fcode%2Fheliopoly%2Fios%2FHeliopoly/"
    "01a001e2-d078-7ff3-901a-ff3ebeaf9d7a/images"
)
DEST_DIR = os.path.join(
    REPO_IOS, "Heliopoly", "Assets.xcassets", "AppIcon.appiconset"
)
MARKETING = os.path.join(REPO_IOS, "AppStore", "AppIcon-1024.png")
LOG_PATH = os.path.join(REPO_IOS, "AppStore", "icon-install-log.txt")
PUBLIC_DIR = os.path.join(REPO_ROOT, "public")
WEBDIST_DIR = os.path.join(REPO_IOS, "WebDist")

# Web outputs derived from the default (any) AppIcon. Ops Manual book art stays
# on ops-manual-icon.png only.
WEB_PNGS = [
    ("favicon-16.png", 16),
    ("favicon-32.png", 32),
    ("favicon.png", 32),
    ("apple-touch-icon.png", 180),
    ("icon-192.png", 192),
]

# (source basename, destination AppIcon name)
MAPPING = [
    ("any.jpg", "AppIcon.png"),
    ("dark.jpg", "AppIcon-dark.png"),
    ("tinted.jpg", "AppIcon-tinted.png"),
]
SESSION_MAP = {
    "any.jpg": "1.jpg",
    "dark.jpg": "3.jpg",
    "tinted.jpg": "2.jpg",
}


def png_ihdr(path: str) -> tuple[int, int, int, int]:
    with open(path, "rb") as f:
        sig = f.read(8)
        if sig != b"\x89PNG\r\n\x1a\n":
            raise ValueError(f"not a PNG: {path}")
        length = struct.unpack(">I", f.read(4))[0]
        ctype = f.read(4)
        if ctype != b"IHDR" or length != 13:
            raise ValueError(f"bad IHDR: {path}")
        data = f.read(13)
        w, h, bit_depth, color_type = struct.unpack(">IIBB", data[:10])
        return w, h, bit_depth, color_type


def has_alpha_from_color_type(color_type: int) -> bool:
    # 0 gray, 2 RGB, 3 palette, 4 gray+alpha, 6 RGBA
    return color_type in (4, 6)


def convert_with_pil(src: str, dst: str) -> None:
    from PIL import Image

    im = Image.open(src)
    im = im.convert("RGB")
    if im.size != (1024, 1024):
        im = im.resize((1024, 1024), Image.Resampling.LANCZOS)
    im.save(dst, format="PNG", optimize=True)


def convert_with_sips(src: str, dst: str) -> None:
    import subprocess
    import tempfile

    with tempfile.TemporaryDirectory() as td:
        mid = os.path.join(td, "mid.png")
        subprocess.check_call(
            ["sips", "-z", "1024", "1024", src, "--out", mid],
            stdout=subprocess.DEVNULL,
        )
        jpg = os.path.join(td, "flat.jpg")
        subprocess.check_call(
            ["sips", "-s", "format", "jpeg", mid, "--out", jpg],
            stdout=subprocess.DEVNULL,
        )
        subprocess.check_call(
            ["sips", "-s", "format", "png", "-z", "1024", "1024", jpg, "--out", dst],
            stdout=subprocess.DEVNULL,
        )


def convert(src: str, dst: str) -> None:
    try:
        convert_with_pil(src, dst)
    except Exception:
        convert_with_sips(src, dst)


def resize_png(src: str, dst: str, size: int) -> None:
    """Resize an already-flat RGB PNG with sips. No Homebrew / Pillow required."""
    os.makedirs(os.path.dirname(dst) or ".", exist_ok=True)
    subprocess.check_call(
        ["sips", "-z", str(size), str(size), src, "--out", dst],
        stdout=subprocess.DEVNULL,
    )


def write_ico(png_paths: list[str], dst: str) -> None:
    """Pack PNG payloads into a .ico (same layout as the previous favicon.ico)."""
    blobs: list[tuple[int, int, bytes]] = []
    for path in png_paths:
        w, h, _bit, _ct = png_ihdr(path)
        with open(path, "rb") as f:
            blobs.append((w, h, f.read()))
    count = len(blobs)
    offset = 6 + 16 * count
    out = bytearray()
    out += struct.pack("<HHH", 0, 1, count)
    payload = bytearray()
    for w, h, data in blobs:
        out += struct.pack(
            "<BBBBHHII",
            w if w < 256 else 0,
            h if h < 256 else 0,
            0,
            0,
            1,
            32,
            len(data),
            offset,
        )
        payload += data
        offset += len(data)
    out += payload
    os.makedirs(os.path.dirname(dst) or ".", exist_ok=True)
    with open(dst, "wb") as f:
        f.write(out)


def install_web_icons(src_1024: str, lines: list[str]) -> bool:
    """Derive public/ (+ WebDist/) favicons from the App Store 1024 master."""
    ok_all = True
    written: list[str] = []
    for name, size in WEB_PNGS:
        dst = os.path.join(PUBLIC_DIR, name)
        resize_png(src_1024, dst, size)
        w, h, _bit, color_type = png_ihdr(dst)
        ok = w == size and h == size
        ok_all = ok_all and ok
        line = (
            f"{'OK' if ok else 'BAD'} public/{name}: "
            f"size={os.path.getsize(dst)} dim={w}x{h} colorType={color_type}"
        )
        print(line)
        lines.append(line)
        written.append(dst)

    ico = os.path.join(PUBLIC_DIR, "favicon.ico")
    write_ico(
        [
            os.path.join(PUBLIC_DIR, "favicon-16.png"),
            os.path.join(PUBLIC_DIR, "favicon-32.png"),
        ],
        ico,
    )
    line = f"OK public/favicon.ico: size={os.path.getsize(ico)}"
    print(line)
    lines.append(line)
    written.append(ico)

    if os.path.isdir(WEBDIST_DIR):
        for src in written:
            dest = os.path.join(WEBDIST_DIR, os.path.basename(src))
            shutil.copy2(src, dest)
        lines.append(f"copied {len(written)} web icons → WebDist/")
        print(f"copied {len(written)} web icons → WebDist/")
    return ok_all


def resolve_source(name: str) -> str | None:
    durable = os.path.join(SOURCES, name)
    if os.path.isfile(durable):
        return durable
    session_name = SESSION_MAP.get(name, name)
    session_path = os.path.join(SESSION_SRC, session_name)
    if os.path.isfile(session_path):
        os.makedirs(SOURCES, exist_ok=True)
        shutil.copy2(session_path, durable)
        return durable
    return None


def main() -> int:
    os.makedirs(DEST_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(MARKETING), exist_ok=True)
    os.makedirs(SOURCES, exist_ok=True)

    lines: list[str] = []
    results = []
    for src_name, dest_name in MAPPING:
        src = resolve_source(src_name)
        if not src:
            msg = (
                f"FAIL missing source for {src_name} "
                f"(looked in {SOURCES} and session images)"
            )
            print(msg, file=sys.stderr)
            lines.append(msg)
            with open(LOG_PATH, "w", encoding="utf-8") as lf:
                lf.write("\n".join(lines) + "\n")
            return 1
        dst = os.path.join(DEST_DIR, dest_name)
        convert(src, dst)
        w, h, bit_depth, color_type = png_ihdr(dst)
        alpha = has_alpha_from_color_type(color_type)
        size = os.path.getsize(dst)
        ok = w == 1024 and h == 1024 and not alpha
        results.append((dst, size, w, h, alpha, ok, color_type))
        line = (
            f"{'OK' if ok else 'BAD'} {dest_name}: "
            f"size={size} dim={w}x{h} hasAlpha={alpha} colorType={color_type}"
        )
        print(line)
        lines.append(line)
        src_size = os.path.getsize(src)
        lines.append(f"  source {os.path.basename(src)}: size={src_size}")

    default_icon = os.path.join(DEST_DIR, "AppIcon.png")
    shutil.copy2(default_icon, MARKETING)
    w, h, bit_depth, color_type = png_ihdr(MARKETING)
    alpha = has_alpha_from_color_type(color_type)
    size = os.path.getsize(MARKETING)
    ok = w == 1024 and h == 1024 and not alpha
    results.append((MARKETING, size, w, h, alpha, ok, color_type))
    line = (
        f"{'OK' if ok else 'BAD'} AppIcon-1024.png: "
        f"size={size} dim={w}x{h} hasAlpha={alpha} colorType={color_type}"
    )
    print(line)
    lines.append(line)

    web_ok = install_web_icons(default_icon, lines)

    if not all(r[5] for r in results) or not web_ok:
        lines.append("RESULT: FAIL")
        with open(LOG_PATH, "w", encoding="utf-8") as lf:
            lf.write("\n".join(lines) + "\n")
        return 2
    print("SUCCESS")
    lines.append("RESULT: SUCCESS")
    with open(LOG_PATH, "w", encoding="utf-8") as lf:
        lf.write("\n".join(lines) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
