version: 0.23.1 (from 0.23.0: the lens switch on W-05 and page D-16 on 1 route, 3 new declared ids (1 new distinct: `clienthub.openLens`); no entity, seed or `SEED_VERSION` change)
date: 2026-09-29
prompt: 0030
intent: Let each host's point of view see into the HOY hub its own way: switch W-05 between ALUZINA, Between Gigs and HOY on its own, and show the three side by side.
decision: D-113 (the three lenses side by side on a dev page, each its own small desk with its desk actions off); applies D-111
rejected: three separate pages, one per host (the difference is the point: side by side makes it visible); one desk with three mat groups (the lenses are different models, not different mats of one model); registering the three small desks' `desk.*` actions (they would shadow each other; the page's own `clienthub.*` actions drive it).
files: apps/hub/src/modules/clienthub/{ClientHubPage.tsx (Tabs wired, `clienthub.setLens` live),LensesPage.tsx (new),specs.ts (`lensesSpec`),index.ts,strings.ts,clienthub.css}, apps/hub/src/tenant/hubCards.data.ts (TOOL_SURFACES D-16), apps/hub/src/modules/hub/{specs.ts,strings.ts}, tenant.json, package.json, apps/hub/package.json, docs/pages/{D-16.md (new),W-05.md}, docs/design/client-hub-desk.md (three-lens table), docs/reference/surfaces.md, docs/decisions.md, docs/kanban.md, docs/plan/plan.json, docs/build-plan.md, docs/README.md, docs/prompts/0030-hoy-hub-on-the-desk.md (Response), apps/hub/src/modules/README.md, docs/screenshots/{W-05,D-16}/*
codes: W-05, D-16, HUB-01
model: Opus 5.5 (build), Fable 5.1 (architecture and plan)

# 0040 - Three points of view on the HOY hub: the lens switch and D-16 hub lenses

## W-05: the lens switch

The header strip's `Tabs` (ALUZINA / Between Gigs / On its own) set `?lens=` in the hash query; `clienthub.setLens` is live (it answered "not wired yet" in 0039). Each lens is `buildLens(map, lens, ctx)` over the same map and engine (D-111):

- **ALUZINA** (default): one mat per HOY role with its figure, experiences as sub-mats, every page (0039).
- **Between Gigs**: HOY as one gig. Mats Website, Apps, Back office, Build, Tools; each seats the role that owns most of it (public, customer, admin, super admin, super admin); sub-mats by experience, condensed at 12 per sub-mat (+N stacks list the rest); the gig `Card` (HoyOS, v0.11.0, the tagline, 13 experiences · 87 pages · 9 tools, Open HoyOS ↗) beside the framing "One gig with its surfaces and tools."
- **On its own**: HOY's testing hub. One mat: the hub itself first ("start here"), one screen per experience (its entry page) by band (Outside, The team, Build), then the 9 testing tools; the builder seated.

Changing the lens closes the drawer and flies home once; the Tools switch resets to the lens hint's default.

## D-16 Hub lenses

`/#/dev/clients/hoy/lenses` (Developer > Hub lenses; HUB-01 builder tools card). Three cards side by side from 1280 px (stacked below): each lens's name and reading, the map's framing sentence for that host, object and mat counts (88 / 8, 67 / 5, 23 / 1), a small fitted desk (size S, height stored per lens) and Open this view. Any object opens W-05 in that lens with the object's drawer open (`?lens=&faces=&open=`). ES / EN screens and Reload map as on W-05. Actions `clienthub.openLens`, `clienthub.setFacesLang`, `clienthub.reloadMap`; the small desks run with `actions: false`.

## Checks

`npm run build` green (tsc strict, Vite, `tenant:validate` 474 / 443 actions, 91 codes; `desk:check` 8 models x 7 widths, no overlaps). Screenshots: W-05 at 390 / 768 / 1280 / 1920 / 3840 EN + ES, 1280 dark, Between Gigs EN / ES 1280, On its own 1280 / 3840; D-16 at 390 / 768 / 1280 / 1920 / 3840 EN + ES; looked at 390 and 3840 (W-05 at 3840: 188 %, every visible object >= 200 px tall, captions readable; D-16 at 1920: toolbars wrap inside the cards, no horizontal page scroll). D-16's small desks are fitted overviews: their objects are under 44 px at the fit by design; each card's Open this view and the desks' toolbars are the 44 px targets.
