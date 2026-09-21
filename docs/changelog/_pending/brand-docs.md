# Pending changelog - brand documents (G-08, P-05, hub card) - pass 0013

```
model: Opus 5 (page build, strings, docs)
modules: brand, public, hub
codes: G-08 (new), P-05 (new), G-01 + HUB-01 (touched)
```

- prompt: Justin Massion, Slack #all-aluzina 2026-09-21 05:05 UTC - "This is a brochure, and the other one is a portfolio. Make sure each of these are available in the hub to download or view."
- pairs with `docs/changelog/_pending/brand-assets.md` (the worker that saved the PDFs and rendered the page images). Both workers agreed on the served paths **before** building; nothing in this draft renames them.

## What landed

The two studio documents are now reachable from three places, with a real viewer and a real download in each:

1. **G-08 Brand documents** `/#/brand/documents` (brand portal, nav group `documents`, order 70, `permission: 'brand.manage'`) - view, download, open in a new tab, copy a shareable link, and a `Placeholder` for replacing a file.
2. **P-05 Portfolio and brochure** `/#/portfolio` (public surface, `bare` shell, no permission, nav order 15, label "Portfolio") - the visitor-facing version: intro, two cards, the same viewer, and a link back to aluzinaa.com.
3. **Hub card `G-08` "Portfolio & brochure"** in *Product surfaces* - route-derived status like every other card; because `/brand/documents` is guarded, the card switches to the brand demo user first when the current role lacks `brand.manage`.
4. **G-01 brand dashboard** gained a small "Client documents" row (Portfolio / Brochure, View + Download) and a "Brand documents" section card.

Both PDFs are the static assets the other worker committed: `apps/hub/public/brand/aluzina-portfolio.pdf` (37 pages, 2,928,197 B) and `aluzina-brochure.pdf` (19 pages, 3,130,687 B), served at `./brand/aluzina-portfolio.pdf` and `./brand/aluzina-brochure.pdf` (Vite `base: './'`, so the sub-path on Pages is safe).

## Files

| File | New / changed | What |
| --- | --- | --- |
| `apps/hub/src/modules/brand/DocumentsPage.tsx` | new | G-08. `DocFrame` (object -> iframe -> text fallback), the two cards, the `Tabs` viewer, share-to-clipboard, the storage note. |
| `apps/hub/src/modules/brand/documents.ts` | new | The document list (`href`, `downloadName`, `pages`, `bytes`), `isBrandDocId`, `brandDoc`, `absoluteUrl`, `copyText`, `triggerDownload`, `formatMb`. |
| `apps/hub/src/modules/brand/specs.ts` | changed | `documentsSpec` (G-08) added; `homeSpec` gained the documents layout lines and the `brand.viewDocument` / `brand.downloadDocument` actions. |
| `apps/hub/src/modules/brand/index.ts` | changed | `/brand/documents` route, `status: 'built'`, nav `brand.nav.documents` order 70. |
| `apps/hub/src/modules/brand/strings.ts` | changed | ~30 `brand.documents.*` keys + `brand.nav.documents` + `brand.home.documents*`, EN + ES. |
| `apps/hub/src/modules/brand/BrandHome.tsx` | changed | "Client documents" card, the `documents` section card, registers `brand.viewDocument` / `brand.downloadDocument`. |
| `apps/hub/src/modules/brand/brand.css` | changed | `.brand-doc__*` (frame, object, fallback, meta, note, anchor) - tokens only. |
| `apps/hub/src/modules/public/PortfolioPage.tsx` | new | P-05. |
| `apps/hub/src/modules/public/documents.ts` | new | The same list for the public surface (`PUBLIC_DOCUMENTS`, `publicDoc`, `absoluteDocUrl`, `triggerDocDownload`, `formatMb`). |
| `apps/hub/src/modules/public/specs.ts` | changed | `portfolioSpec` (P-05) + the `DOC_ENUM` vocabulary. |
| `apps/hub/src/modules/public/index.ts` | changed | `/portfolio` route, nav order 15. |
| `apps/hub/src/modules/public/strings.ts` | changed | `public.portfolio.*` + `public.nav.portfolio`, EN + ES. |
| `apps/hub/src/modules/public/public.css` | changed | `.pub-doc__*`. |
| `apps/hub/src/modules/hub/HubPage.tsx` | changed | `brand-docs` surface entry (code `G-08`, `enterAs: 'brand'`, new `enterUnless: 'brand.manage'`); `resolve()` only switches the session when the current role lacks the permission. |
| `apps/hub/src/modules/hub/specs.ts` | changed | `SURFACE_IDS` gained `brand-docs` (so `hub.openSurface`'s enum grows with it); one layout and one logic line. |
| `apps/hub/src/modules/hub/strings.ts` | changed | `hub.cards.brandDocs.title` / `.desc`, EN + ES. |
| `docs/pages/G-08.md`, `docs/pages/P-05.md` | new | Page docs from the template. |
| `docs/pages/HUB-01.md` | changed | One Layout line (3a) for the new card. |

Typecheck clean (`npx tsc --noEmit` in `apps/hub`). `npm run build` was not run in this worker (parallel-pass rule); nothing here touches shared code, so the integrator's build is the green gate.

## Real vs Placeholder (P-09)

**Real**: both PDFs; the in-page viewer on G-08 and P-05; download (`<a download>`, saves as `Aluzina-Portfolio.pdf` / `Aluzina-Brochure.pdf`); open in a new tab; the shareable `?doc=` link; the clipboard copy with its toast (and its honest fallback when `navigator.clipboard` is missing); the hub card and its role switch; the G-01 row.

**Placeholder**: **Replace document** on G-08 only - the hub has no file storage, so a new version is a commit today. Declared as `brand.replaceDocument` and deliberately not registered on the bus (verified: the other four G-08 actions are live, this one is not).

## Verified (Playwright, Chromium, dev server)

- 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840 on both pages: **no horizontal overflow at any width**; the viewer grows 409 px -> 1836 px tall across that range.
- **No interactive target under 44 px** on either page (measured in the DOM, not eyeballed).
- `window.__aluzina.actions.run('brand.viewDocument', { doc: 'brochure' })` -> `{ ok: true, result: 'brochure' }`: tab switched, URL became `?doc=brochure`, focus landed on the viewer container.
- Hub card `[data-surface="brand-docs"]` renders `status=live` and activating it lands on `#/brand/documents` as the brand demo user.
- Spanish verified at 1280 on both pages (`aluzina.lang = es`): every string translated, sizes render as `2,8 MB` / `3,0 MB` through `toLocaleString(lang)`.

## Requests for the integrator / other workers

1. **`DocumentViewer` organism** for the component library (the same request `brand-assets.md` makes; this pass is the second caller). It should wrap the `<object>` -> `<iframe>` -> text ladder, take `{ href, downloadName, title, pages, bytes }`, own the download affordance and the page-image fallback (`docs/brand/<doc>/page-NN.jpg` would have to move under `public/` to be servable), keep 44 px targets and stay legible at 10 feet. Two pages now hand-roll the same 20 lines; that is the signal.
2. **`Button` `download` support**: add `download?: string` (and pass it on the `href` branch) to `src/components/atom/Button/Button.tsx`. Until then both pages render an `<a className="btn btn--secondary btn--md" download>`, which is library styling but not the library component (P-07 gap, deliberate and commented in the source).
3. **Shared `copyText` helper**: `src/modules/qa/copy.ts` already exists; this pass duplicated it in `brand/documents.ts` because a module must not import another module. Promote it to `src/design/` or `src/i18n/`-level shared code and have qa, brand and anyone else use it.
4. **Thumbnails**: add `G-08` and `P-05` to the deploy-time thumbnail pass (`scripts/thumbnails.mjs`, D-011) - `#/brand/documents` captured with `?as=brand`, `#/portfolio` with no role. The hub card for G-08 shows the bilingual tile until that lands.
5. **Screenshots**: repo set `docs/screenshots/G-08/{en-390,en-1280,es-1280}.jpg` and `docs/screenshots/P-05/{en-390,en-1280,es-1280}.jpg` still to be captured against `npm run preview`.
6. **`docs/reference/surfaces.md`** rows (this worker must not edit it):
   - `G-08` | `/#/brand/documents` | brand | `brand.manage` | actions `brand.viewDocument`, `brand.downloadDocument`, `brand.openDocumentTab`, `brand.shareDocumentLink`, `brand.replaceDocument` (Placeholder) | deep link `?doc=portfolio|brochure`.
   - `P-05` | `/#/portfolio` | public | none | actions `public.viewDocument`, `public.downloadDocument`, `public.openDocumentTab` | deep link `?doc=portfolio|brochure`.
   - Static assets served by the app: `./brand/aluzina-portfolio.pdf`, `./brand/aluzina-brochure.pdf`.
7. **`docs/kanban.md`** line: `Done - G-08 brand documents + P-05 public portfolio/brochure page + hub card (pass 0013, Opus 5): both PDFs viewable and downloadable from the brand portal, the public site and the hub; replace-document waits on file storage.`
8. **Next free page codes** after this pass: brand `G-09`, public `P-06`.

## Decisions proposed

- **D-0xx - Documents are served assets until file storage exists.** A client-facing document (portfolio, brochure) ships in `apps/hub/public/brand/` and is listed in code with its page count and byte size; replacing one is a commit that edits the file and those two numbers together. No entity, no upload, no drift between "the file" and "what the page says about the file". Revisit when file storage lands: the document then becomes a row (versioned, with `updated_at`) and the page reads size and page count from it.
- **D-0xx - A guarded hub card switches roles instead of refusing.** A card in *Product surfaces* whose route needs a permission (`G-08`) declares `enterUnless`: with the permission it is a plain link, without it the card switches to that surface's demo user first. The hub is a demo surface; landing a visitor on a permission wall teaches them nothing.
- **D-0xx - An embedded document always degrades to a sentence.** Every embedded file renders `<object>` -> `<iframe>` -> plain text with a download link. A missing file, a browser without a PDF plugin and a blocked plugin all end at the same readable fallback, never a blank rectangle. (This is what the `DocumentViewer` organism should encode.)
