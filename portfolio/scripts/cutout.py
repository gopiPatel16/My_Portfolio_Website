"""
Cut the studio-white background off the portrait and write the hero cut-out.

The photograph is a clean seamless-white headshot, which means the compositing
equation is actually known: every pixel is `I = a*F + (1 - a)*W` for a white W.
So rather than thresholding to a hard silhouette — which is what leaves hair
looking like it was cut out with scissors — we:

  1. flood-fill the near-white background inwards from the frame edge, which
     gives a definite-background region without eating the white shirt (the
     shirt never touches an edge; the black suit does),
  2. keep a hard alpha only well inside that silhouette, and solve a soft alpha
     across a narrow band at the boundary from the known white background, so
     individual strands of hair keep their partial coverage, and
  3. un-premultiply the result against white, which removes the pale fringe
     that otherwise haloes the subject against a dark page.

    python scripts/cutout.py
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "my photo.jpg"
OUT = ROOT / "portfolio" / "public" / "img"

# Background is a seamless ~254 white; anything this bright and this neutral,
# reachable from the frame edge, is the backdrop.
NEAR_WHITE = 220
NEUTRAL = 16
# Representative luminance of what borders the background — hair and suit are
# both very dark, so one value serves for the whole outline. This is the F in
# the compositing equation, so it sets where the solved alpha reaches 1.
EDGE_FG_LUMA = 45.0
BAND = 3  # how far outside the silhouette the soft matte is allowed to reach
# How far inside the silhouette alpha is *forced* opaque. It has to clear the
# whole transition, and on this portrait the hair edge is soft-lit: luminance
# ramps from backdrop to hair over roughly fifteen pixels. Force opacity
# anywhere inside that ramp and the half-mixed pixels there become a solid
# pale line — the halo. Everything shallower than this is solved, not assumed,
# which is safe because the entire outline is dark hair and dark suit.
DEEP = 20


def main() -> None:
    rgb = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32)
    h, w, _ = rgb.shape
    lo = rgb.min(axis=2)
    hi = rgb.max(axis=2)
    luma = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)

    # --- 1. definite background -------------------------------------------
    whiteish = (lo >= NEAR_WHITE) & ((hi - lo) <= NEUTRAL)
    # Eight-connected. Flyaway strands sever a four-connected backdrop into
    # islands, and an island that no longer touches the frame stops counting as
    # background — which is how a pocket of pure backdrop ends up baked in
    # opaque beside the hair.
    labels, _ = ndimage.label(whiteish, structure=np.ones((3, 3)))
    # Seed from three edges only. The subject runs off the bottom of the frame,
    # and the white shirt reaches it — seeding there floods the shirt and
    # punches the placket straight out of the silhouette.
    edge = np.concatenate([labels[0], labels[:, 0], labels[:, -1]])
    touching = sorted(set(np.unique(edge)) - {0})
    bg = np.isin(labels, touching) if touching else np.zeros_like(whiteish)

    fg = ~bg
    # Specular highlights on hair can read as "white" and punch holes; anything
    # the flood fill could not reach from outside belongs to the subject.
    fg = ndimage.binary_fill_holes(fg)
    fg = ndimage.binary_opening(fg, np.ones((3, 3)))
    fg = ndimage.binary_fill_holes(fg)

    # Keep only the largest blob — stray dust on the backdrop is not the subject.
    lab, k = ndimage.label(fg)
    if k > 1:
        sizes = ndimage.sum(fg, lab, range(1, k + 1))
        fg = lab == (int(np.argmax(sizes)) + 1)

    # --- 2. soft alpha across the boundary --------------------------------
    core = ndimage.binary_erosion(fg, np.ones((3, 3)), iterations=DEEP)
    outer = ndimage.binary_dilation(fg, np.ones((3, 3)), iterations=BAND)
    soft = np.clip((255.0 - luma) / (255.0 - EDGE_FG_LUMA), 0.0, 1.0)

    alpha = np.where(core, 1.0, np.where(outer, soft, 0.0)).astype(np.float32)
    # A half-pixel blur takes the staircase off the diagonal edges without
    # softening the strands the band just recovered.
    alpha = ndimage.gaussian_filter(alpha, 0.5)
    alpha[core] = 1.0
    alpha[~outer] = 0.0

    # --- 3. un-premultiply against the white backdrop ----------------------
    a = np.clip(alpha, 0.0, 1.0)[..., None]
    floor = 0.12
    fgcol = np.clip((rgb - (1.0 - a) * 255.0) / np.maximum(a, floor), 0.0, 255.0)
    # Below that floor the colour estimate is pure noise; the pixel contributes
    # almost nothing anyway, so keep the observed value.
    fgcol = np.where(a >= floor, fgcol, rgb)

    # --- 4. crop to what is actually opaque --------------------------------
    ys, xs = np.nonzero(alpha > 0.03)
    x0, y0 = max(int(xs.min()) - 2, 0), max(int(ys.min()) - 2, 0)
    x1, y1 = min(int(xs.max()) + 3, w), min(int(ys.max()) + 3, h)
    fgcol = fgcol[y0:y1, x0:x1]
    a = a[y0:y1, x0:x1]
    ch, cw = a.shape[:2]
    print(f"source {w}x{h} -> crop {cw}x{ch}  coverage {alpha.mean():.3f}")

    OUT.mkdir(parents=True, exist_ok=True)
    for width, name in ((1200, "gopi-cutout.webp"), (700, "gopi-cutout-sm.webp")):
        height = round(ch * width / cw)
        # Resample premultiplied. Scaling colour and alpha independently lets
        # the near-white backdrop still sitting in the transparent pixels bleed
        # back over the hair, which is exactly the bright rim we just removed.
        scaled = _resize_premultiplied(fgcol, a, width, height)
        scaled.save(OUT / name, "WEBP", quality=92, method=6, exact=True)
        print(f"  {name}  {width}x{height}  {(OUT / name).stat().st_size // 1024} kB")


def _resize_premultiplied(fgcol: np.ndarray, a: np.ndarray, width: int, height: int) -> Image.Image:
    pm = Image.fromarray((fgcol * a).round().clip(0, 255).astype(np.uint8), "RGB")
    am = Image.fromarray((a[..., 0] * 255.0).round().clip(0, 255).astype(np.uint8), "L")
    pm = np.asarray(pm.resize((width, height), Image.LANCZOS)).astype(np.float32)
    am = np.asarray(am.resize((width, height), Image.LANCZOS)).astype(np.float32) / 255.0
    col = np.clip(pm / np.maximum(am, 1e-3)[..., None], 0.0, 255.0)
    out = np.dstack([col, am * 255.0]).round().astype(np.uint8)
    return Image.fromarray(out, "RGBA")


if __name__ == "__main__":
    main()
