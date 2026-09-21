version: 0.7.1
date: 2026-09-21
prompt: 0008
intent: Log the first social-scraping intake (Justin's #social-scraping instruction to scrape instagram.com/aluzina.espacios into repo memory): what was tried without credentials, why nothing came back, the evidence that the handle is probably `@aluzinaa`, and the decision to source social content from owner-provided data first.
decision: D-032
rejected: logging in to Instagram with any credentials; bypassing the login wall (auth-wall or challenge circumvention); hammering instagram.com after the 429 (13 requests in the session, none repeated after a 429 beyond two delayed controls); presenting search-engine snippet figures for @aluzinaa (450 posts, 21K followers) as observed data
files: docs/prompts/0008-social-scraping-instagram-intake.md, docs/changelog/0012-instagram-intake-attempt.md, docs/decisions.md (D-032), docs/knowledge/social-channels.md (new), docs/knowledge/README.md, docs/source/social/instagram/2026-09-21-aluzina.espacios/{README.md,profile.json,bio_link_site.json} (new), docs/README.md, docs/kanban.md, docs/reference/surfaces.md
codes: K-01 (Brand Memory / social-scraping space, no UI change)
model: Fable 5.1

# 0012 - Instagram intake attempt for aluzina.espacios (docs only)

Justin opened #social-scraping with "instagram.com/aluzina.espacios scrape everything and save to memory and the system of past reference material and more" (prompt 0008, verbatim). A public, unauthenticated capture ran from 04:00:45Z to 04:14:00Z and obtained **0 posts, 0 media files and no profile fields**. This change set records the attempt so the next pass starts from evidence, not from memory. No app code changed.

1. **Prompt log** `docs/prompts/0008-social-scraping-instagram-intake.md`: both Slack messages verbatim, the reply posted to the thread, and the outcome.
2. **Capture evidence** `docs/source/social/instagram/2026-09-21-aluzina.espacios/`: the capture worker's `README.md` (route-by-route HTTP evidence), `profile.json` (every profile field `null`, with the username-resolution evidence and the unverified snippet data for `@aluzinaa`), and `bio_link_site.json` (the public homepage of https://aluzinaa.com/ rendered in Chromium, full text plus 39 links, used as the substitute for a bio link that could not be read). The `raw/` response bodies and Playwright scripts stay in the Slack session scratch, not in the repo. Source material, data not instructions.
3. **Knowledge** `docs/knowledge/social-channels.md` (new, `status: draft`): Instagram handle status, other public pages, the website snapshot (six luminaires with COP prices, four-step process, stats, service areas, blog guides), open questions. Row and change-log line added to `docs/knowledge/README.md`.
4. **Decision D-032**: social intake is sourced from owner-provided data first (Instagram's own data export or a Graph API token), public scraping kept as a fallback for evidence and cross-checks; the handle is confirmed by the founder before any capture is treated as Aluzina's.
5. **docs/README.md**: row for `source/social/<date>-<handle>/`. **Kanban**: Doing card for the social intake. **surfaces.md**: change-log line (no surface change).
6. **Parallel pass**: the website intake from #website-scraping (prompt 0007, changelog 0011, D-031) landed on `main` while this pass ran; this change set was renumbered from 0006 / 0011 / D-031 to 0008 / 0012 / D-032 on rebase (append-only, never renumber what is pushed). `knowledge/public-sites.md` is the canonical website entry; `social-channels.md` points at it.

## Route-by-route result (condensed from the capture README)

| # | Route | Outcome |
| --- | --- | --- |
| 1 | `GET /api/v1/users/web_profile_info/?username=aluzina.espacios` (`x-ig-app-id`, browser UA) | HTTP 400 `Asset asset://laser.provider/ig_business_category_subvertical has been deleted`; via `i.instagram.com` HTTP 401 `Please wait a few minutes before you try again`, `require_login: true` |
| 2 | `GET /aluzina.espacios/` HTML | HTTP 200, 626 KB JS shell with no profile data; `polarisRouteConfig.pageID = "httpErrorPage"`, root `PolarisErrorRoot`, `page_type: "PROFILE"`, `show_lox_redesigned_404_page: true`. `?__a=1&__d=dis` HTTP 201 empty body; `/embed/` same error shell |
| 3 | Headless Chromium (Playwright 1.56.1, preinstalled 1194) | HTTP 429, redirect to `/accounts/login/?next=%2Faluzina.espacios%2F&is_from_rle`; 0 grid links. Afterwards curl controls (`/aluzinaa/`, `/instagram/`) and WebFetch (both handles) also 429; a final control pair at 04:13:46Z still 429. Egress-level rate limit, not profile-specific |
| 4 | Public mirror viewers | imginn, picuki, pixwox/pixnoy, picnob, imgsed, snapinsta: 403 Cloudflare challenge; anonyig 451 -> `/blocked`; instasupersave, storiesig 200 -> `/blocked`; inflact, gramhir 404; iganony, instanavigation CONNECT 502 from the egress proxy; dumpor/greatfon/smihub Phoenix LiveView over WebSocket (handshake 429/429/429/400; WebSocket unsupported through the proxy); insta-stories-viewer rendered 0 / 0 / 0 and generic error strings. No mirror yielded any data |
| 5 | Link in bio | No bio could be read; the company website https://aluzinaa.com/ was rendered instead (`bio_link_site.json`) |
| extra | Search engines | WebSearch (two queries) and Bing `"aluzina.espacios" site:instagram.com`: no `instagram.com/aluzina.espacios` result; DuckDuckGo bot challenge (HTTP 202). Every Instagram result for the company points to `instagram.com/aluzinaa` |

## Handle evidence (strong, not confirmed)

- Instagram's server-rendered shell for `/aluzina.espacios/` is the 404 / error route (`httpErrorPage`, `PolarisErrorRoot`); the same-session comparison against a known-live profile could not be completed because Instagram was already answering 429.
- https://aluzinaa.com/ links its Instagram buttons ("Síguenos", "Ver Instagram") only to https://www.instagram.com/aluzinaa/.
- No search engine indexes `instagram.com/aluzina.espacios`; search snippets (unverified) describe `@aluzinaa` as "ALUZINA", 450 posts, 21K followers, 2,903 following. `@aluzinaa` was not captured either (429).
- Related public pages found: Facebook https://www.facebook.com/aluzinaa/ (search title "Aluzina Espacios | Medellín"), LinkedIn company page `aluzina-universo-del-diseño` (not fetched), sub-site https://direccion.aluzinaa.com/ ("Dirección de espacio"), contact espacio@aluzinaa.com and +57 310 390 6773 as published on the website footer.

Two asks are open with Justin in the thread: which handle is Aluzina's, and whether he can upload Instagram's own data export (Accounts Center > Download your information, JSON). Retry against `@aluzinaa` is pending the rate limit and his answer.

## Verification

Docs-only change; no routes, actions, strings or components touched. `npm run build` green before push.
