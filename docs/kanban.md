# Kanban

One card per line. Steps refer to `build-plan.md`. Model per card in parentheses.

## Backlog

- D-020 data layer (rest): entities `clients`, annotations (P-08, can reuse `comments`), `partnerships`, `products`, `goals`, `followUps`, `comparisonGroups`, `scheduleItems`, `measurements`, `images` + file storage; fields `payments.supplierId`, `materials.imageUrl`, `references.imageUrl`, `revisions.imageUrl`, `brandAssets.thumbnailUrl` (`comments`, `tasks.own.write` done in 0008) (Fable 5.1)
- Step 11 Work follow-ups: pointer drag to move board cards and shift timeline bars (bonus over the select / drawer paths), section create / rename / reorder UI, `views` table replacing `aluzina.views.<userId>` (D-025), 1920 / 2560 / 3840 and dark captures of W-01 / W-02, an "Open in Work" link from A-07 / S-01 / G-01 task cards (Opus 5)
- Step 11 realtime: Supabase Realtime + Presence adapters behind `subscribe` / `usePresence()` (D-023), `version` column + merge UI replacing last-write-wins (D-024), conflict log rows for D-04 (Fable 5.1)
- D-020 alert generation: one rule raising / resolving `alerts` from payments, quotes, deliveries and competition deadlines (`leadDays` before `dueDate`), surfaced per role (Fable 5.1)
- D-020 seeds: two or three more `plan` / `spec` documents across Casa Laureles, Noam, Café Provenza; competition rows when the 2027 list arrives (Sonnet 5)
- D-020 product: shared "request" flow (presentations, revisions, image sets) from the studio / ops / founder portals into the brand queue; report templates for O-10; code-split the bundle per module (590 kB chunk warning) (Opus 5)
- Portal polish pass: 1920 / 2560 / 3840 captures of every portal page, dark-theme pass, `checkedAt` to the full matrix (Sonnet 5)
- Step 3: module split, PageSpecs, component metas, page docs, screenshots per width; `qa:responsive` + strings-coverage check (Opus 5, Sonnet 5)
- Media budget: convert `apps/business-os/assets/world/*.png` (93 MB) to webp / downscale once the audit says which are kept (Sonnet 5)
- Step 4: hub tools still open: spec inspector (tables, rules, components), demo simulator, canvas, plan viewer (kanban / list / timeline with dependencies; `Timeline` and `Kanban` components exist), `/#/dev/actions`, `/#/dev/tokens` (Fable 5.1, Opus 5)
- Step 5: surfaces: customer app C-xx, staff / admin A-xx, in-app docs D-06/D-07, ops manual M-xx, client proposal view (Opus 5)
- Step 6: Spanish fill pass over every strings table (Sonnet 5)
- Step 7 (rest): `feedback` table + FeedbackButton, actions bus + WebMCP generation from the manifest (Fable 5.1)
- Step 8 (rest): realtime plan doc `docs/reference/realtime-plan.md`, offline queue (presence and the realtime seam landed in 0008) (Fable 5.1, Opus 5)
- Step 9c: Client portal C-xx on PhoneShell (own projects, proposals to approve, messages, payments read) (Opus 5)
- Step 9c: alert pattern across portals (Miguel's "before urgent" + Angelica's deadlines from `alerts`, lead-time rule, surfaced per role) (Fable 5.1)
- Dev tools next: `/#/dev/tokens` (D-01), `/#/dev/actions` (D-20), actions bus `run(id, params)`, `viewAs` control in the user menu for founder / dev, plan viewer, canvas, demo simulator (Opus 5)
- Data: `version` column + conflict UI, `CompanyOsProvider` stub (reference only), Supabase adapter behind `DataProvider` (Fable 5.1)
- Component library follow-ups: dark-theme pass over every example, `FeedbackButton` (P-08) (Sonnet 5)
- Knowledge: fill `docs/knowledge/competitions.md` (the 20 competitions and submission dates) and surnames / languages in `team.md` when the founder shares them; confirm "Hoy" = HOY Wellness Center (Fable 5.1)
- Hub thumbnails: dark-theme variant (`thumbs/<code>-dark.jpg`) and 2x tiles for 4K once the card grid is checked at 2560 / 3840 on the live site (Sonnet 5)
- Awaiting Justin: default language en vs es for the hub and the OS (D-004)
- Awaiting Justin: does the public site join the OS as a P-xx module, or stay Lovable-hosted (linked)?

## Doing

- Live screenshots of the 33 portal pages at 390 / 1280 EN (+ 1280 ES per dashboard) after the 0007 deploy (Fable 5.1) — in progress
- Step 2: audit the export against P-01..P-15: en/es toggle, responsive matrix, inputs, placeholders, actions registry; write `docs/reference/business-os-audit.md` (Fable 5.1, Sonnet 5) — next

## Done

- QA fixes (changelog 0010): five 44px-target / 16px-font defects from the Work views QA matrix (docs/qa/0001) — view-tab and timeline-bar min-heights, row-select checkbox hit label made explicit, shell role badge font at 1920, W-02 breadcrumb "Work" link min-width; re-verified at 390/1280/1920, build green (Sonnet 5)
- Step 10: Asana-style Work views (changelog 0008, D-021..D-025): `sections` / `comments` / `activity`, six organisms + `PresenceBar` with metas and examples, MockProvider BroadcastChannel realtime with rows in the message, `basedOn` conflicts + toast, `PresenceProvider` + shell bar, Work module W-01 / W-02 on four portals with role defaults, D-04 multiuser page, O-02 / O-03 "Open in Work", `tasks.own.write`, smoke green at 360-2560 for all four views, keyboard-only drawer run, two-tab update in 15-20 ms (Fable 5.1)
- Step 9c: integration (changelog 0007, D-018..D-020): Placeholder wrapper mode + tooltip clamp, StatTile numbers, Timeline bar targets, router future flags, `suppliers.read`, `tasks.startDate`, thumbnails image-wait bound; tsc + build green; smoke over 36 routes at 390 / 1280 clean; `_pending` drafts merged (Fable 5.1)
- Step 9b: Founder portal A-01..A-07 (approvals, pipeline, quotes and proposals, products and partnerships, clients, team) (Opus 5)
- Step 9b: Operations portal O-01..O-10 (schedule, tasks, suppliers, quotes and comparisons, deliveries, payments, documents, alerts, reports) (Opus 5)
- Step 9b: Studio portal S-01..S-09 (projects and proposals, references, palettes, plans, schedules, packs, consistency check, measurements) (Opus 5)
- Step 9b: Brand portal G-01..G-07 (competitions 2027, presentations, identity and assets, images, revisions, asset library) (Opus 5)
- Step 9a: portal foundation (changelog 0006, D-014..D-017): `src/auth/` (roles, permissions, demo users, SessionProvider, RequireRole, useCan, `?as=` contract), registry + manifest with shell / permission / nav, DesktopShell + PhoneShell, DataProvider + MockProvider + 18 seeded entities + `useTable / useRow / useData`, 24 new components with metas and live examples, `PageSpec` extensions + `specCompleteness`, D-02 `/#/dev/components`, D-03 `/#/dev/specs`, hub Portals section + RoleSwitcher + `hub.enterAs` / `hub.switchRole`, portal stubs A-01 / O-01 / S-01 / G-01, thumbnails for the new codes, `src/modules/README.md` (Fable 5.1)
- Hub thumbnails generated at deploy time (D-011): `scripts/thumbnails.mjs` + `npm run thumbs` in the Pages workflow, `SurfaceCard` image slot with bilingual fallback tile, `thumbs/manifest.json`; 9 thumbs in 30 s locally (Fable 5.1)
- Knowledge base `docs/knowledge/` with change tracking (D-012): README convention, `team.md` (Alejandra Guerra, Miguel, Sarai, Angelica), `competitions.md`, `roles-and-portals.md` (D-013); prompt 0002, changelog 0005 (Fable 5.1)
- Step 0: monorepo layout (`apps/hub`, `apps/business-os` README, `docs/`, root workspaces) (Fable 5.1)
- Step 0: HUB-01 hub: EN/ES toggle, light/dark, dev mode, SpecChip + actions panel (Ctrl+.), Placeholder atom, tokens -> tokens.css with `--scale` bands, `window.__aluzina` manifest (Fable 5.1)
- Step 0: Pages workflow (`.github/workflows/pages.yml`), build green locally (Fable 5.1)
- Step 0: docs tree: README, principles, brief, build plan, decisions D-001..D-006, kanban, prompt 0001, changelog 0001, page template + HUB-01, surfaces (Fable 5.1)
- Step 0: first Pages deploy green (run 35542778592), live at https://imagine-os.github.io/aluzina/ (HTTP 200); live screenshots 390 / 1280 / 3840 EN + 390 ES in `docs/screenshots/HUB-01/` (Fable 5.1)
- Step 1: prototype verified live at https://imagine-os.github.io/aluzina/business-os/ (run 35543723076; zero external requests; EN/ES toggle works); screenshots BOS-01 (390 / 1280 / 3840 EN, 1280 ES) and BOS-02 (1280) in `docs/screenshots/` (Fable 5.1)
- Step 1: Claude Design export ingested at `apps/business-os/` (uploads dropped, D-009), runtime + fonts vendored (D-008), URL-safe entry points (D-010), copied into `dist/business-os/` by the root build, hub card BOS-01 live + Prototype pages BOS-02..06 (Fable 5.1)
- Justin's second Drive link delivered the correct 288 MB zip (D-006 resolved)
