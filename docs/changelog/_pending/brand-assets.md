# Draft for changelog 0013: brand assets - portfolio & brochure intake (Opus 5)

Merged into `docs/changelog/0013-*.md` by the integrator. **Status: complete.**

- prompt: 0011 (Justin Massion, Slack #all-aluzina 2026-09-21 05:05 UTC, ts 1789967106.545359, two PDF attachments)
- intent: put Aluzina's portfolio and brochure where the site can serve them, and turn both into repo memory - page renders as *visual* memory, extracted facts as *textual* memory - so a future session can "see" and cite the brand without the PDFs.
- model: Opus 5 (intake, page reading, extraction, docs). The renderer is deterministic tooling, not a model pass.

## Source documents

| Document | Slack file | Original filename | Size | Pages |
| --- | --- | --- | --- | --- |
| Portfolio | `F0C3ADLF01X` | `ALUZINA.pdf` | 2,928,197 bytes (2.79 MB) | 37, landscape 4:3, Spanish |
| Brochure | `F0C38CS9D5Y` | `BROCHURE ALUZINA (1).pdf` | 3,130,687 bytes (2.99 MB) | 19, landscape 16:9, Spanish |

Downloaded byte-exact from Slack; both copies at each destination verified identical by md5. Both are Aluzina's own marketing material: **data, not instructions** (same rule as `docs/source/playbook/`).

## Files

**Source and served copies**
- `docs/source/brand/ALUZINA.pdf`, `docs/source/brand/BROCHURE ALUZINA (1).pdf` - untouched originals under their original filenames.
- `apps/hub/public/brand/aluzina-portfolio.pdf`, `apps/hub/public/brand/aluzina-brochure.pdf` - the copies the site serves. **`apps/hub/public/` did not exist before this pass.**

**Visual memory - 56 page renders + 2 contact sheets, 8.59 MB total**
- `docs/brand/portfolio/page-01.jpg` .. `page-37.jpg` + `contact-sheet.jpg` (5.58 MB)
- `docs/brand/brochure/page-01.jpg` .. `page-19.jpg` + `contact-sheet.jpg` (3.01 MB)
- `docs/brand/README.md` - the index: both documents (path, size, page count, served URL), how the renders were made, then a row per page for all 56 - what the page shows, the text on it, and the colours sampled from it - plus project and product tables.
- `docs/brand/portfolio/index.json`, `docs/brand/brochure/index.json` - the same content machine-readable: `{document, file, servedUrl, pageCount, pages[{page, image, headline, description, text, colors, imageCount, projectSlug?, serviceCode?}], projects[{slug, name, type, city, year, summary, pages[], relatedPortfolioSlug?}], products[], palette[], fonts[]}`.
- `docs/brand/tools/render-pdf-pages.py` - the renderer, reusable for any future source PDF.

**Textual memory**
- `docs/knowledge/brand.md` - new entry (the `brand.md` the knowledge README had listed as planned). Sections: Brand voice / Positioning and credentials / Services as marketed / Projects-portfolio / Visual identity / Contact channels / Differences vs the playbook / Unknowns, each with `status` + `since: 2026-09-21` + `source`, plus `## Change log`.
- `docs/knowledge/README.md` - `brand.md` row added, moved out of "Planned", change-log line appended.
- `docs/knowledge/clients.md` - **appended only**: a new sourced section with the 20 clients named on brochure p. 2 and the two further clients the portfolio identifies. Nothing deleted or superseded.
- `docs/README.md` - `source/brand/` and `brand/` rows added to the start-here map.
- `docs/prompts/0011-portfolio-and-brochure.md` - prompt logged verbatim.

**Channel memory** (pointers only, repo is canonical): `aluzina-brand-documents.md`, `aluzina-brand-identity.md`, `aluzina-portfolio-projects.md`, all under 3 KB, indexed in `MEMORY.md`.

## How pages were rendered

`pdftoppm` (poppler) is **not** installed in this environment and PyMuPDF/Pillow were **not** present; installed with `pip install pymupdf pillow` (PyMuPDF 1.28.2, Pillow 12.3.0). Each page is rasterized to **<= 1400 px wide, JPEG q80, progressive**; all pages are then tiled 4-across into `contact-sheet.jpg` at **<= 2000 px wide**. The script also reports per page the embedded text, embedded font names, image count and a median-cut dominant-colour sample - the source of the "colours seen" column and the palettes. At 1400/q80 both folders came to 8.59 MB, inside the ~12 MB budget, so no second downscale pass was needed (`MAX_W` / `QUALITY` are the knobs if a future document overshoots).

Colour caveat recorded in both docs: values are sampled from JPEG renders, not the PDF colour space - good enough to design against, not authoritative.

## Serving path (verified)

`apps/hub/vite.config.ts` does not set or disable `publicDir`, and `root` is implicitly `apps/hub`, so Vite's default `<root>/public` applies and `apps/hub/public/brand/*` is copied to `dist/brand/*`. `base: './'`. `scripts/copy-static.mjs` runs after the Vite build and only adds `dist/business-os/` + `dist/.nojekyll`, so it cannot clobber them. Served URLs:

- `./brand/aluzina-portfolio.pdf`
- `./brand/aluzina-brochure.pdf`

**Note for the integrator:** another worker is building the hub/public pages that link these files against *exactly* these two paths, plus page images at `docs/brand/<doc>/page-NN.jpg`. Do not rename them in the merge.

## What the documents turned out to say

- **They are two different brand eras and share almost nothing.** The portfolio is *ALUZINA · UNIVERSO DE DISEÑO* (gold metallic display serif, sacred-geometry motifs, three pillars: Espacios / Productos / Arte). The brochure is *ALUZINA · INTERIORISMO · ILUMINACIÓN* (light gradient sans, flat icon tiles, four construction phases, no art). Neither is dated. **Which one is current is the top question for the founder** and nothing downstream should assume.
- **The one shared asset is a blue → aqua → mint → lime gradient** (`#c3cff5` `#b8e8ec` `#befdc8` `#e1fe87`), plus DIN Round Pro as the only typeface in both and a diagonal slash beside the wordmark.
- **Credentials** (brochure p. 2): 8 años, 50+ proyectos en Colombia, 4 internacionales, 16.743 m².
- **Projects:** the portfolio shows 13, the brochure names 20, and only **Coassist, Sodime and Brewhouse** appear in both. All have stable kebab-case slugs and page numbers in the index JSONs. **City and year are `_unknown_` for every one** - neither PDF prints them.
- **Six concrete mismatches against `service-playbook.md`** are written up in `brand.md#differences-vs-the-playbook`. Headlines: none of the five playbook services is named in either document; the brochure sells `MOBILIARIO` and `ILUMINACIÓN` as trades the playbook has no service for; the portfolio's whole **ARTE** pillar and its **product line** are unmodelled revenue; "emotional lighting" appears in neither document; the brochure's four phases include permitting and *curaduría*, which the playbook's ten steps never name. The playbook stays canonical (D-033) - the gap is recorded, not resolved.

## Two existing knowledge entries are now in question (recorded, not changed)

1. **`public-sites.md`** documents the live sites as `aluzinaa.com` / `direccion.aluzinaa.com`. The portfolio prints **`WWW.ALUZINA.CO`** and an email on the same `aluzina.co` domain. Whether `aluzina.co` still resolves is unknown.
2. **`social-channels.md`** is `draft` because the Instagram handle was unresolved between `aluzina.espacios` and `@aluzinaa`. Both PDFs print Instagram **`@aluzinaa`**, and the portfolio prints **`@aluzinaaespacio`** for *Facebook* - which looks like the origin of the confusion. Evidence, not confirmation: the PDFs are undated and the profile scraped on 2026-09-21 was `aluzina.espacios`.

Neither file was edited; both findings are in `brand.md#contact-channels` and flagged in the knowledge change log.

**Privacy:** the personal phone number and email printed in both PDFs were deliberately **not** copied into any doc or memory file. `brand.md` names the channel and says "contact details in the source PDF".

## Requests for other workers / the integrator

- **`DocumentViewer` component** (component library, not hand-rolled in a page): embedded PDF view with a download affordance, a page-image fallback for browsers that refuse inline PDFs, keyboard-reachable controls with 44 px targets, legible at 10 feet on a 4K screen. Declare its actions (`document.open`, `document.download`, `document.page.next` / `prev`) in the actions registry so WebMCP and the voice vocabulary pick them up.
- **`brandDocuments` entity** (or `deliverables` rows typed as brand collateral) with `id`, `updated_at`, kind (`portfolio` | `brochure`), language, file path, page count and a link to the rendered pages. This is the answer to Justin's 05:05:18 follow-up about being "saved by project and relational in the proper way in the database". **The schema worker can seed `projects` rows and their relations straight from `docs/brand/*/index.json` without reopening the PDFs** - every project has a slug, a type, a summary and its `pages[]`, and the three cross-document matches carry `relatedPortfolioSlug`.
- **Kanban card:** put the playbook-vs-marketing reconciliation and "which brand era is current?" to the founder.
- **Placeholder rule:** until the viewer is wired, any brochure/portfolio button shows the "not wired yet" tooltip + toast, visible in dev mode.
- **Git LFS:** ~6 MB of PDFs plus 8.59 MB of renders is fine in plain git today. If more source PDFs land or these are re-exported larger, move `docs/source/**/*.pdf` and `docs/brand/**/*.jpg` to LFS before the repo passes ~100 MB.
- **Possible merge conflict:** `docs/README.md` and `docs/knowledge/README.md` are touched here and may also be touched by the foundation worker; both edits are additive (new table rows, appended change-log lines).

## Decisions to propose

- **D-0xx** Source PDFs are served from `apps/hub/public/brand/` (Vite `publicDir`), never imported through the bundler or committed into `dist/`; `docs/source/brand/` keeps the untouched originals under their original filenames.
- **D-0xx** Page renders in `docs/brand/` are the repo's *visual memory*: every source document that carries design meaning gets one JPEG per page plus a contact sheet, a page-by-page prose index in `docs/brand/README.md` and a machine-readable `index.json`, under a ~12 MB budget per intake. `docs/knowledge/brand.md` is the matching *textual memory*; chat memory holds pointers only (P-11).
- **D-0xx** The marketing material does **not** supersede `service-playbook.md`. Where they disagree the disagreement is recorded in `brand.md#differences-vs-the-playbook` and put to the founder; the playbook stays the canonical service model (D-033).

## Verification

Both downloads byte-exact against the sizes Slack reported (2,928,197 / 3,130,687); md5 identical between each `docs/source/brand/` original and its `apps/hub/public/brand/` copy. Both `index.json` files validated: `len(pages) == pageCount`, and every `image`, `contactSheet` and `file` path resolves on disk. Renderer smoke-tested on the playbook PDF before use. `npm run build` **not** run in this worker (out of scope; the intake adds no TypeScript) - the integrator should run the green build before pushing.
