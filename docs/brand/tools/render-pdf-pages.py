#!/usr/bin/env python3
"""Render every page of a PDF to JPEG page images plus a contact sheet.

Built for the brand documents intake (prompt 0011, changelog 0013, model Opus 5);
reusable for any future source PDF that needs to enter the repo's *visual* memory.

    python3 docs/brand/tools/render-pdf-pages.py <source.pdf> <out-dir> [--label NAME]

Writes `<out-dir>/page-NN.jpg` (<= MAX_W px wide, JPEG q~80) and
`<out-dir>/contact-sheet.jpg` (grid of every page, <= SHEET_W px wide), then
prints a machine-readable summary (page count, sizes, dominant colours per page)
that `docs/brand/README.md` is written from.

Requires PyMuPDF and Pillow:  pip install pymupdf pillow
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import pymupdf
from PIL import Image

MAX_W = 1400  # page image width cap (px)
SHEET_W = 2000  # contact sheet width cap (px)
QUALITY = 80
SHEET_COLS = 4


def dominant_colours(img: Image.Image, n: int = 6) -> list[str]:
    """Rough palette sample: quantize the page and return the top hex values."""
    small = img.convert("RGB").resize((160, 160))
    quant = small.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    palette = quant.getpalette() or []
    counts = sorted(quant.getcolors() or [], key=lambda c: -c[0])
    out: list[str] = []
    for _count, idx in counts:
        r, g, b = palette[idx * 3 : idx * 3 + 3]
        hexv = f"#{r:02x}{g:02x}{b:02x}"
        if hexv not in out:
            out.append(hexv)
    return out


def render(pdf_path: Path, out_dir: Path, label: str) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(pdf_path)
    pages: list[dict] = []
    thumbs: list[Image.Image] = []

    for i, page in enumerate(doc, start=1):
        rect = page.rect
        zoom = min(MAX_W / rect.width, 4.0) if rect.width else 1.0
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        if img.width > MAX_W:
            img = img.resize((MAX_W, round(img.height * MAX_W / img.width)), Image.LANCZOS)

        name = f"page-{i:02d}.jpg"
        img.save(out_dir / name, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        thumbs.append(img)

        text = page.get_text().strip()
        pages.append(
            {
                "page": i,
                "image": name,
                "px": [img.width, img.height],
                "pt": [round(rect.width, 1), round(rect.height, 1)],
                "bytes": (out_dir / name).stat().st_size,
                "colours": dominant_colours(img),
                "text": text,
                "images_on_page": len(page.get_images(full=True)),
                "fonts": sorted({f[3] for f in page.get_fonts(full=True)}),
            }
        )

    # Contact sheet: SHEET_COLS wide, cells sized to the widest page aspect.
    cols = min(SHEET_COLS, max(1, len(thumbs)))
    cell_w = SHEET_W // cols
    cell_h = max(round(t.height * cell_w / t.width) for t in thumbs)
    rows = math.ceil(len(thumbs) / cols)
    sheet = Image.new("RGB", (cell_w * cols, cell_h * rows), "#ffffff")
    for idx, t in enumerate(thumbs):
        scaled = t.resize((cell_w, round(t.height * cell_w / t.width)), Image.LANCZOS)
        sheet.paste(scaled, ((idx % cols) * cell_w, (idx // cols) * cell_h))
    sheet.save(out_dir / "contact-sheet.jpg", "JPEG", quality=QUALITY, optimize=True)

    doc.close()
    return {
        "label": label,
        "source": str(pdf_path),
        "source_bytes": pdf_path.stat().st_size,
        "page_count": len(pages),
        "out_dir": str(out_dir),
        "contact_sheet_bytes": (out_dir / "contact-sheet.jpg").stat().st_size,
        "total_bytes": sum(p["bytes"] for p in pages)
        + (out_dir / "contact-sheet.jpg").stat().st_size,
        "pages": pages,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("pdf", type=Path)
    ap.add_argument("out", type=Path)
    ap.add_argument("--label", default="")
    ap.add_argument("--json", type=Path, help="also write the summary to this file")
    args = ap.parse_args()

    if not args.pdf.exists():
        print(f"render-pdf-pages: {args.pdf} not found", file=sys.stderr)
        return 1

    summary = render(args.pdf, args.out, args.label or args.pdf.stem)
    blob = json.dumps(summary, indent=1, ensure_ascii=False)
    if args.json:
        args.json.write_text(blob, encoding="utf-8")
    print(blob)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
