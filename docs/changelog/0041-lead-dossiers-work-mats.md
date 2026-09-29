version: 0.24.0 (from 0.23.1: lead dossier fields in the schema, `SEED_VERSION` 14, a new object kind `profile`, dossiers and work mats on the page desks that show leads, 10 new actions, 6 new icons)
date: 2026-09-29
prompt: 0031
intent: Leads get a photo and, when there is a company, a logo; each lead is a stack of cards (contact, company, one per social profile, qualification, commercial, notes and messages) that stacks, fans out, sorts and flips; separate work mats where a person arranges leads and cards, apart from the process stacks where the leads sit by status.
decision: D-114 (a fanned dossier lies on its own overlay plane above the desk and stays inside its mat, instead of pushing neighbours aside; work mats hold references to live rows, stored per person and page, never copies in the entities)
rejected: fetching or embedding the real social profiles (privacy of real people in a demo, the artifact / Pages network policy, third-party scripts in the hub); storing card positions in the `leads` rows (layout is a person's arrangement, not lead data, and would conflict between people); drag as the only way to arrange (keyboard, Move to… and actions do everything drag does); a fan that reflows the neighbouring objects (every open dossier would move the process stacks under the person's hand); real photos or stock portraits (generated SVG art only, labelled mock)
files: apps/hub/src/data/schema/services.ts (Lead `portraitUrl`, `logoUrl`, `company`, `socials`), apps/hub/src/tenant/seed/leads/art.ts (new: generated portraits and logos), apps/hub/src/tenant/seed/{services.ts,index.ts}, apps/hub/src/components/atom/Icon/{Icon.tsx,Icon.meta.ts}, apps/hub/src/desk/dossier.tsx (new), apps/hub/src/desk/leadDesk.tsx (new), apps/hub/src/desk/workmats.ts (new), apps/hub/src/desk/{types.ts,layout.ts,checkModels.ts,DeskObject.tsx,DeskStage.tsx,PageDesk.tsx,useDesk.ts,actions.ts,entities.ts,strings.ts,abilityLabels.ts,depth.ts,desk.css}, apps/hub/src/modules/desk/{DeskPage.tsx,deskFlow.ts,specs.ts}, apps/hub/src/modules/README.md, docs/pages/{A-08.md,W-04.md}, docs/design/{desk-system.md,icons.md}, docs/reference/surfaces.md, docs/decisions.md (D-114), docs/kanban.md, docs/plan/plan.json, docs/build-plan.md, docs/README.md, docs/prompts/0031 (numbering note appended), docs/screenshots/A-08/*, docs/screenshots/W-04/*, tenant.json, package.json + apps/hub/package.json
codes: A-08 and A-03 (page desks with `leads`: dossiers, work mats, the 10 actions), W-04 (lead light tile portrait, Send to work mat), every page desk (the `profile` kind, the drag gesture in `useDesk`)
model: Opus 5.5 (build, measurements, docs), Fable 5.1 (brief)

# 0041 - Lead dossiers: portraits, logos, stacks that fan, sort and flip; work mats

Numbering: the brief named this changelog 0038 / D-108 / prompt 0030; the parallel hoy-hub pass took prompt 0030, changelogs 0037, 0039, 0040 and D-108..D-113 while this ran, and the render pass of the same prompt took 0038 / D-107. So this is changelog 0041, D-114, prompt 0031, version 0.24.0 (rebased on `cf83a08`).

## Schema and seed

- `Lead` gains `portraitUrl?`, `logoUrl?`, `company?` and `socials?: {network, handle, url?}[]` (network: instagram, linkedin, facebook, tiktok, website, whatsapp). All optional; `notes` stays a required string (the brief allowed it optional, nothing needed that).
- `SEED_VERSION` 13 -> 14 (stored demo data re-seeds once). The 8 mock leads each get a generated portrait (SVG data URI from a hash of the id: face shape, hair, skin and outfit from brand token mixes, no real person), 5 of 8 get a company and a generated logo (monogram and mark in the brand palette): Café San Joaquín, Clínica Sonrisa Sana SAS, Hotel Boutique Guatapé, Contadores Asociados SAS, Grupo Provenza. 2 to 4 social profiles each with fictional `.demo` handles; website links go to `https://example.com/leads/...`.
- Placeholder rule: generated art is mock and says so (the social card reads "Mock profile"); a real lead with no photo shows its initials.

## Lead profile card (kind `profile`)

2 x 1 squares, face 118 x 54 at font 5: photo, logo (when present), name, company or city, status pill, budget, a row of network icons (6 new `Icon` names, 84 in all). W-04's lead light tile shows the portrait too.

## Dossier: stack, fan, sort, flip

- Cards: Contact (Copy on phone / email), Company, one per social profile, Qualification (the 10 answers), Commercial, Notes and messages. 148 x 204 world px, text 7.2 px.
- Stack: over the lead card at scale 0.42, 1.6 px offsets, the top card last in DOM order and highest in Z.
- Fan: an arc of radius 900 world px, the step chosen so the whole fan fits the mat's width (at most 8° a card); the focused card rises 30 px and comes to the front. The fan lies on the dossier overlay plane (`DEPTH.fan` = 28, above every object and station top at 22; each open dossier 2 px higher, each card 0.2 px), so it never interpenetrates a body or a neighbouring dossier and never clips.
- Sort: kind, date, network. Flip: social cards turn over (preserve-3d on flippable cards only); the front is the mock profile (handle, mock counts, Visit: a real link when the mock profile has a url, else a disabled button with its reason), the back the lead's notes with Turn back. `desk.fanOut` fits the mat and the fan together (new `fitBox` in `useDesk`), so the bar and the raised card are never cut by the stage. Enter on a focused social card flips it.
- 360 ms transform transitions; none under reduced motion.

## Work mats

- Free mats after the process mats (`DeskMatDef.free`, 9 x 4 squares, rows grow): "Work mat 1" by default; Add, Rename, Remove from the work-mat toolbar and the actions.
- They hold references (`lead:<id>`, `card:<lead>:<card>`) drawn from the live row, so a lead's status pill on a work mat follows the process stack; the process card stays on its status sub-mat.
- Arrange: drag with mouse, finger or pen (6 / 10 px threshold, snaps to squares, a taken square or a drop outside goes back with a toast); arrow keys on a focused object; Move to…; `desk.moveOnWorkMat`.
- Persistence: `storageKey('desk.workmats.<code>')` = `{[userId]: {mats, entries}}`, per person and page, in the browser (like the desk size and wheel setting); mats and entries are stamped `updated_at` on save (multiplayer-ready). W-04 writes the same key for A-08 (Send to work mat on a lead light tile).

## Actions (10, registered by the page desks with `leads`, the route's guard)

`desk.fanOut`, `desk.stackUp`, `desk.sortStack`, `desk.flipCard`, `desk.addWorkMat`, `desk.renameWorkMat`, `desk.removeWorkMat`, `desk.sendToWorkMat` (also on W-04), `desk.moveOnWorkMat`, `desk.removeFromWorkMat`. Declared 474 -> 485 (distinct 443 -> 453). All ten run through `window.__aluzina.actions.run`; EN / ES labels in `desk.ability.*`.

## Checks

- Build green: strict `tsc`, `tenant:validate`, `desk:check` (a synthetic work mat with conflicting squares resolves to free ones).
- 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840, EN light and ES dark, A-08 with two fanned dossiers and a work mat, and W-04: no horizontal scroll, every control inside the frame and >= 44 px, no page errors; DPR 1 and 2. The overflow / contain audit inside the 3D context stays at 0 on W-04, A-08, O-12, K-04, S-01, K-01.
- Frame times (headless Chromium, software compositor, 1280 x 900, median of 6 runs, p50 / p95 ms): K-04 zoom 16.7 / 33.4, pan 16.7 / 16.8, drag 16.7 / 33.3; W-04 (following) 16.7 / 50, 16.7 / 16.8, 16.7 / 33.3 (unchanged from 0038 within noise). A-08 at the Leads mat's fit (135 %) with three dossiers fanned: zoom 16.7 / 66.7, pan 16.7 / 16.8, drag 33.3 / 50.1; the same view with the dossier layer hidden: 16.7 / 33.4, 16.7 / 16.8, 33.4 / 50.1. The fans cost nothing on pan and drag; the zoom p95 is the one-frame re-raster of the card text at commit (the price of crisp text), and the drag cost at 135 % is raster of newly revealed tiles in the software compositor, with or without dossiers.

## Placeholders

None. Visit is a real link or a disabled button that says why.
