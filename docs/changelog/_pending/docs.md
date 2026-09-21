# Draft for changelog 0013: `docs` module — the in-app documentation viewer (Opus 5)

Merged into `docs/changelog/0013-*.md` by the integrator.

- prompt: 0009 (hub buildout); build plan step 5
- model: **Opus 5** (module build; foundation by Fable 5.1)
- codes: **D-06** Documentation (`/docs`, nav 0), **D-15** Document (`/docs/*`, no nav)
- surface: `docs` (new), shell `desktop`, permission `docs.read` (every role except the client), nav group `docs`

## Files

- `apps/hub/src/modules/docs/index.ts` — the two routes, one component.
- `apps/hub/src/modules/docs/specs.ts` — `docsSpec` (D-06), `documentSpec` (D-15).
- `apps/hub/src/modules/docs/strings.ts` — `docs.*`, EN + ES complete (folder descriptions, plan statuses).
- `apps/hub/src/modules/docs/files.ts` — the `@docs` glob, the path helpers, the tree builder, the relative-link resolver.
- `apps/hub/src/modules/docs/DocsPage.tsx`, `docs.css`.
- `docs/pages/D-06.md`, `docs/pages/D-15.md`.

## What is real

- **The repo's own files.** `import.meta.glob('@docs/**/*.md', { query: '?raw', import: 'default', eager: false })` through the `@docs` alias (D-037): 114 Markdown documents today, each its own lazy chunk, so opening the viewer does not download ~850 KB of Markdown. `docs/screenshots/` contributes nothing (images + a JSON manifest).
- **Tree** (`SpaceTree`, reused as-is with arbitrary nodes): root files in reading order (README, platform-principles, project-brief, build-plan, kanban, decisions), then `changelog/`, `prompts/`, `pages/`, `knowledge/`, `reference/`, `qa/`, `plan/`, `source/`, nested by path segment, folder counts included. The folders of the open document expand automatically. Under 1024 px the tree moves into a left `Drawer`.
- **Search** over paths and file names always, plus the full text of every document already loaded; **Load every document** fetches the rest for a real full-text search. The tree is rebuilt from the matches so results keep their folders.
- **Addressable documents**: `#/docs/<path>` is the state (D-15), so a decision or a page doc can be linked from a commit or another document; `/docs` opens `README.md`.
- **Relative links between documents are rewritten** to the viewer's own absolute URL before rendering (the `Markdown` atom only linkifies `http(s)` / `mailto`), and a delegated click handler keeps the navigation in-app — verified with the new `docs/pages/M-01.md`, whose links to `../knowledge/service-playbook.md` and `../decisions.md` open inside the Hub in the same tab. Links that leave `docs/` (the site paths inside `source/`) are left exactly as written.
- **`docs/plan/plan.json` renders as a sortable `DataTable`** (task, title, step, status pill, model, codes, dependencies) from the typed `src/plan` module, not as raw JSON.
- **Open on GitHub** on every document: `https://github.com/imagine-os/aluzina/blob/main/docs/<path>`.
- All four declared actions are registered while mounted: `docs.openDocument`, `docs.searchDocs`, `docs.openOnGithub`, `docs.collapseFolder`.

## Placeholders (P-09)

None: every control on the page works.

## Requests for shared code (integration pass)

1. **`core.portal.docs` belongs in `src/i18n/core.ts`.** The module defines it as a stop-gap. Value used: `{ en: 'Documentation', es: 'Documentación' }`.
2. **`Markdown`: heading ids + an optional `linkResolver`.** Heading ids would give documents a table of contents and `#/docs/<path>#heading` links. A `linkResolver(href) => string | null` prop would let the page hand the atom an in-app target directly, instead of rewriting the source text and intercepting clicks (which also forces `target="_blank"` onto links the handler then cancels).
3. **`Markdown`: front-matter and `~~~`/indented code** are not parsed; not needed by the repo's documents today, but worth knowing before someone writes one.
4. **`SpaceTree` naming.** It is already generic (`nodes`, `kind` is a free string) and was reused unchanged — consider renaming it `Tree` with `SpaceTree` as the Spaces-flavoured usage, or note in its meta that it is the app's one tree.
5. **A `docs:index` build step** (optional): a generated `docs/index.json` with path + title + first paragraph would let the viewer search titles and summaries without loading every chunk.

## Decisions proposed

- **D-0xx (the in-app docs read the repo, never a copy).** The viewer imports `docs/**/*.md` through `@docs`; no Markdown is duplicated into the app, so the docs in the product and the docs an agent reads are the same bytes (P-11).
- **D-0xx (every document has a URL).** `#/docs/<path>` (D-15) is a first-class address; commits, Slack messages and other pages link to it instead of to GitHub.

## Verified

- `npx tsc --noEmit` clean (no `npm run build`).
- Playwright (Chromium, `?as=founder`) at **360 / 390 / 768 / 1280 / 1920 / 2560 / 3840**, light and dark, EN and ES on `/docs`, `/docs/decisions.md`, `/docs/build-plan.md`, `/docs/kanban.md`, `/docs/pages/M-01.md` and `/docs/plan/plan.json`: no horizontal page overflow, no console errors. `spec.checkedAt` records all seven widths.
- Actions exercised through `window.__aluzina.actions.run`: `docs.openDocument` (`decisions.md` -> navigates and renders), `docs.searchDocs` (`playbook` -> 4 paths), `docs.openOnGithub`, `docs.collapseFolder`.
- Link rewriting: clicking a rewritten link stays in one tab and loads the target document.
- Search: `M-0` -> 9 documents, the tree shows them inside `pages/`.

## Known issues / not built

- No screenshots this pass (a preview build collides with the integrator's build). `docs/screenshots/D-06/`, `D-15/` queued.
- `docs/source/` (the website and social archives, 24 Markdown files, some long) is in the tree as the brief asked; it may deserve to be collapsed or hidden by default.
- No anchors inside a document and no per-document table of contents (needs the `Markdown` change above).
- No editing from the app; the docs are read-only here, as they should be until there is a real write path.
- Each document is its own chunk, so a production build emits ~114 small JS chunks. If that becomes noisy, the `docs:index` build step above (or `eager: true` for the small root files) is the fix.
