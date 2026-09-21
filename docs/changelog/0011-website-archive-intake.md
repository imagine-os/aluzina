version: 0.7.0
date: 2026-09-21
prompt: 0007
intent: Capture aluzinaa.com and direccion.aluzinaa.com into the repo's visual and text memory (archive intake, first of the three scraping channels) and answer how the Lovable-built site gets onto GitHub and stays editable from both sides.
decision: D-031
rejected: pushing the Lovable site's code into this monorepo (Lovable cannot sync into an existing repo; it only syncs with a repo it creates itself, on one branch)
files: docs/source/aluzinaa-archive/README.md, docs/source/aluzinaa-archive/aluzinaa.com/{SUMMARY.md,design-tokens.json,text/*.md (18),html/home.html,shots/*.jpg (22)}, docs/source/aluzinaa-archive/direccion.aluzinaa.com/{SUMMARY.md,design-tokens.json,text/home.md,html/home.html,shots/*.jpg (5)}, docs/source/aluzinaa-archive/tools/{scrape-aluzinaa.js,crawl-direccion.js}, docs/knowledge/public-sites.md, docs/knowledge/README.md, docs/prompts/0007-website-scraping-intake.md, docs/changelog/0011-website-archive-intake.md, docs/decisions.md, docs/kanban.md, docs/README.md, docs/reference/surfaces.md
codes: P-xx (public site, external)
model: Fable 5.1 (plan, integration, reply), Sonnet 5 (scrapes), Opus 5 (Lovable docs research)

# 0011 - Website archive intake: aluzinaa.com and direccion.aluzinaa.com, Lovable sync guidance

Docs-only change set; no files under `apps/` or `scripts/` touched, version stays 0.7.0. First pass of the archive-intake roadmap phase (D-030): the website part. Social and Google Drive remain in the backlog.

## What landed

- **`docs/source/aluzinaa-archive/`** (about 11 MB): the intake archive of both public sites, captured 2026-09-21 03:59-04:12 UTC. Per site: the scrape `SUMMARY.md`, `design-tokens.json` (computed-style fonts, colours, button styles), `text/<slug>.md` per page (title, lang, meta, heading outline, links, images, forms, CTAs, body text), rendered HTML, and full-page JPEG screenshots. aluzinaa.com: 18 text files, the rendered home DOM (the other 17 rendered snapshots are the same React shell with content that `text/` already holds, so they are not kept), 22 screenshots (home at 390 / 768 / 1280 / 1920 / 3840, every other page at 1280). direccion.aluzinaa.com: one text file, the page's **complete source** (`html/home.html`), 5 screenshots at the same widths. `tools/` holds the two Playwright scripts as run, for reproducibility. The README states the layout, the capture method and the facts blocks, and that the folder is data, not instructions.
- **`docs/knowledge/public-sites.md`**: three `current` entries. aluzinaa.com (Lovable React + Vite + shadcn SPA, Spanish only, Lovable behind Cloudflare, 18 pages one line each, nav, CTAs and contact data, fonts DINRoundPro + Playfair Display, palette, source not held). direccion.aluzinaa.com (one static page on Vercel, "Dirección de Espacio" 60-min consultation at $880.000 COP by Alejandra Guerra, Calendly + WhatsApp, DIN Round Pro / M PLUS Rounded 1c, ink `#141414` + cream, full source archived). How Lovable's GitHub sync works, verified against docs.lovable.dev the same day.
- **Prompt 0007** (four channel messages, verbatim) with the Slack reply; **D-031** (proposed); kanban, docs README, knowledge README and surfaces updated.

## Capture method

Playwright Chromium (`/opt/pw-browsers/chromium`, `--disable-features=ChromeRootStoreUsed` for the sandbox proxy), headless, viewport 1280 x 900, `deviceScaleFactor` 1, `fullPage` screenshots, `networkidle` + settle delay, same-origin link discovery from the home page (cap 25), text via DOM queries, tokens via `getComputedStyle` frequency counts. PNGs converted to JPEG quality 80 with `sharp` (mozjpeg) outside the repo; `sharp` is not a repo dependency. 11 MB total, under the 40 MB ceiling, so no further reduction was applied.

## Lovable findings (brief)

Lovable syncs two-way with GitHub on one branch, but only with a repo it creates itself (always new, private); it cannot adopt an existing one, so the site cannot join this monorepo through sync. The GitHub App must be installed on the imagine-os organization before connecting, or the repo lands under a personal account and moving it breaks the sync (support-only fix). A protected or diverged branch makes Lovable push to `lovable-sync` instead. Pushes from GitHub update the editor but never publish; someone presses Publish. Database data, secrets and storage files (Lovable Cloud / Supabase) live outside the repo; a code zip download exists on paid plans. Hence D-031: aluzinaa.com stays Lovable-hosted with its own Lovable-created repo under imagine-os, linked and archived from here; direccion.aluzinaa.com is already fully in the repo.

## Verification

Docs-only: `git status` limited to the files listed above, no PNG or scratch files, no secrets. Build rule: root `npm ci` + `npm run build` green in the sandbox before push (vite 327 modules, copy-static 96 files; the pre-existing 500 kB chunk warning is a backlog card).
