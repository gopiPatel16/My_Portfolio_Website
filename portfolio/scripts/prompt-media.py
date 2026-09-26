"""
Turn the supplied prompt outputs into web deliverables.

The originals are full-resolution renders — 4K in one case, 128 MB in another.
They are the evidence, not the asset: the page autoplays these inline behind
text, so each one is capped in width, stripped of its audio track (the players
are muted anyway, and the track is pure weight), and given a WebP poster so the
card has something to show before the clip decodes.

    python scripts/prompt-media.py
"""

import subprocess
from pathlib import Path

import imageio_ffmpeg
from PIL import Image

FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "prompt output"
OUT = ROOT / "portfolio" / "public" / "prompts"

# source, published name, max width, the second to lift the poster from, extra ffmpeg args
CLIPS = [
    ("donut.mp4", "candy-factory", 1280, 2.0, []),
    ("icecream.mp4", "sundae-orbit", 1280, 2.0, []),
    ("smoothies.mp4", "smoothie-tray", 1280, 2.0, []),
    ("thickshake.mp4", "milkshake-orbit", 1280, 2.0, []),
    ("gow.mp4", "gow-axe", 1280, 1.5, []),
    # Portrait. Left at its native width — it is already under 1.1 MB, and
    # halving a 720-wide phone-shaped clip costs more than it saves.
    ("freya.mp4", "freya-portrait", 720, 1.2, []),
    ("hero.mp4", "warrior-blizzard", 1280, 1.0, []),
    ("boy.mp4", "archer-draw", 1280, 4.5, []),
    # A 32-second, 60 fps, 128 MB screen recording of mostly dark, slow-moving
    # page. Half the frame rate and a lighter quality target lose nothing visible
    # and keep it in line with the other clips.
    ("door.mp4", "vanwood-process", 1280, 14.0, ["-r", "30", "-crf", "30"]),
]

# source, published name, max width
STILLS = [
    ("background.jpeg", "vanwood-hero", 1600),
    ("kratos.png", "warrior-keyart", 1200),
    ("Atreus.png", "archer-keyart", 1200),
    ("freya.png", "sorceress-keyart", 1200),
    ("raiden.png", "thunder-poster", 800),
    ("reptile.png", "reptile-poster", 800),
]


def run(args: list[str]) -> None:
    p = subprocess.run(args, capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit(p.stderr[-2000:])


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    for name, stem, width, at, extra in CLIPS:
        src = SRC / name
        if not src.exists():
            print(f"  ! missing {src}")
            continue
        mp4 = OUT / f"{stem}.mp4"
        if mp4.exists() and (OUT / f"{stem}.webp").exists() and mp4.stat().st_mtime > src.stat().st_mtime:
            # Re-encoding the 4K and 128 MB sources costs minutes and yields the same bytes.
            print(f"  {stem}.mp4  up to date")
            continue
        run([
            FF, "-y", "-loglevel", "error", "-i", str(src),
            # -2 keeps the height even, which H.264 requires.
            "-vf", f"scale='min({width},iw)':-2",
            "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
            "-crf", "26", "-preset", "slow",
            *extra,
            "-an",
            # Puts the index at the head of the file so it can start playing
            # before the whole thing has arrived.
            "-movflags", "+faststart",
            str(mp4),
        ])

        frame = OUT / f"{stem}.png"
        run([FF, "-y", "-loglevel", "error", "-ss", str(at), "-i", str(src),
             "-frames:v", "1", "-vf", f"scale='min({width},iw)':-2", str(frame)])
        poster = OUT / f"{stem}.webp"
        Image.open(frame).convert("RGB").save(poster, "WEBP", quality=82, method=6)
        frame.unlink()

        print(f"  {stem}.mp4  {mp4.stat().st_size // 1024} kB"
              f"   poster {poster.stat().st_size // 1024} kB"
              f"   (from {src.stat().st_size / 1e6:.1f} MB)")

    for name, stem, width in STILLS:
        src = SRC / name
        if not src.exists():
            print(f"  ! missing {src}")
            continue
        if (OUT / f"{stem}.webp").exists() and (OUT / f"{stem}.webp").stat().st_mtime > src.stat().st_mtime:
            print(f"  {stem}.webp  up to date")
            continue
        im = Image.open(src).convert("RGB")
        if im.width > width:
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        dst = OUT / f"{stem}.webp"
        im.save(dst, "WEBP", quality=84, method=6)
        print(f"  {stem}.webp  {im.width}x{im.height}  {dst.stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()
