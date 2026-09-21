# Brand fonts (DIN Round Pro)

The Aluzina manual sets everything in **DIN Round Pro** (Light / Regular / Medium / Bold / Black).
It is a licensed typeface, so the files are **not** in this repo. Until they are here the app
falls back to **Rubik** (Google Fonts, loaded in `apps/hub/index.html`), the closest free match.

To use the real face, drop the licensed web files into this folder with these exact names:

| Weight | File |
| --- | --- |
| 300 Light | `DINRoundPro-Light.woff2` |
| 400 Regular | `DINRoundPro-Regular.woff2` |
| 500 Medium | `DINRoundPro-Medium.woff2` |
| 700 Bold | `DINRoundPro-Bold.woff2` |
| 900 Black | `DINRoundPro-Black.woff2` |

`apps/hub/src/styles/fonts.css` already declares the `@font-face` rules pointing at `/fonts/<name>.woff2`
with `font-display: swap`; nothing else needs to change. Missing files simply 404 and the browser
uses Rubik.

**Never commit font files we do not hold a web (WOFF/@font-face) licence for.** A desktop licence is
not enough. If the files are licensed, add a note here with the licence holder and the licence id.
