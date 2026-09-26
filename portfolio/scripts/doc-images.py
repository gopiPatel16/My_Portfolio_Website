"""
Renders the documents the site shows as pictures: a small sheet for the button
and a full-size page for the reader it opens.

Run it again whenever one of these PDFs is rebuilt:

    python scripts/doc-images.py
"""
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PDFS = [
    ROOT / "public" / "credentials" / "uws-internship-offer-letter.pdf",
]

# 200 DPI keeps 10pt body text readable when the reader shows the page at its
# natural width; the thumbnail only has to read as "a sheet of paper".
FULL_DPI = 200
THUMB_W = 460

for pdf in PDFS:
    doc = pymupdf.open(pdf)
    if doc.page_count != 1:
        raise SystemExit(f"{pdf.name}: expected one page, got {doc.page_count}")

    pix = doc[0].get_pixmap(dpi=FULL_DPI, alpha=False)
    page = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    full = pdf.with_suffix(".webp")
    page.save(full, "WEBP", quality=90, method=6)

    thumb_path = pdf.with_name(f"{pdf.stem}-thumb.webp")
    thumb = page.resize((THUMB_W, round(THUMB_W * page.height / page.width)), Image.LANCZOS)
    thumb.save(thumb_path, "WEBP", quality=86, method=6)

    for f in (full, thumb_path):
        im = Image.open(f)
        print(f"{f.name}: {im.width}x{im.height}, {f.stat().st_size:,} bytes")
