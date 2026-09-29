# The client hub desk

How ALUZINA lays a client's whole hub on the desk (W-05, prompt 0030, D-108..D-112). First client: HOY (a wellness studio, project `prj-hoy`), whose OS publishes its hub map at https://imagine-os.github.io/hoy/hub-map.json.

## The contract

The client publishes one machine-readable **hub map** (schema `hoy.hub-map/1`, types verbatim in `apps/hub/src/modules/clienthub/hubMap.types.ts`): the product (name, tagline, version, `baseUrl`, hub route, brand), the **roles** (label, description, band, home, device, demo user, figure look, two desk props), the **experiences** (the hub's cards: owning role, device, entry route, page codes, captures), every **page** (code, route, name, purpose, roles, experience, device, status, declared actions, captures), the **tools**, an **embed pattern** (`{baseUrl}#{route}?as={role}&lang={lang}&theme={theme}&dev=0&live=0`) and one **lens hint** per host (title, framing, group-by, show tools, entry). ALUZINA never reads the client's code or repo: only this file and the captures it points at. How any host consumes it: `docs/tenant/hub-map-consumer.md`.

## Where it lives in ALUZINA

- Module `apps/hub/src/modules/clienthub/`: `hubMap.types.ts` (contract), `hubMap.load.ts` (`useHubMap(clientId)`), `registry.ts` (`CLIENT_HUBS`: `hoy` -> project `prj-hoy`, client `cl-hoy`, map URL, bundled snapshot), `lenses.ts` (`buildLens(map, lens, ctx)`), `ClientHubPage.tsx` (W-05), `hoy.hub-map.snapshot.json` (the bundled copy; one file, swapped whole).
- Routes `/<founder|ops|studio|brand|dev>/clients/hoy/hub`, W-04's guards, nav group Projects right after the Method desk (glyph ▣), a HUB-01 product card ("Clients · HOY hub desk", opens as the founder when needed). The page is its own desk (`desk: { 'W-05': { self: true } }`).
- It is a client of the studio, so it fits the studio's way: the project link (`prj-hoy` in Work), ALUZINA's felt, figures, materials and language toggle, and the lens framing "a studio deliverable".

## Three points of view (lenses)

Same map, same engine, a different model builder and framing (D-111); switch on W-05 (`?lens=`, `Tabs` in the header strip) or see all three side by side on D-16.

| Lens | Host | groupBy hint | Mats | Figures | Sub-mats | Objects | Tools | Framing (from the map) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `aluzina` | ALUZINA (the studio that built it) | role | one per client role, outside-in (8 for HOY) | the mat's role | the role's experiences, split by the map's page groups when an experience has several (`page.group`, since HOY 0.11.1; member app Book / Pay / Account / Sign in, admin Admin / Content / Tables); pages without a group fall back to the local split | every page as its device (87 + the site stack) | off (Tools switch) | "A studio deliverable: one mat per client role, with that role's screens laid on it." |
| `between-gigs` | Between Gigs (Justin's company OS, HOY as one gig) | experience | Website, Apps, Back office, Build, Tools | the role owning most pages on the mat | the experiences | pages as devices, condensed at 12 per sub-mat (+N stacks) | on | "One gig with its surfaces and tools." + the tagline under it and a compact gig strip beside it (name, Gig · version · counts, Open; changelog 0042) |
| `standalone` | HOY on its own (its testing hub) | surface | one: the hub | the builder (super admin) | the hub, Outside, The team, Build, Testing tools | the hub itself first (a screen), one object per experience as its device (the member and teacher apps as phones, the website as a fanned stack of its tall pages with the full-length capture, the manual and docs as documents, desktops as screens), the 9 tools | on | "hoy's own testing hub: every surface by band and every tool, as at /#/." |

## Header, subtitle and wording (changelog 0042)

- The page subtitle follows the lens: ALUZINA "87 pages on 8 mats, each client role seated at its mat"; Between Gigs "87 pages on 5 mats, one gig with its surfaces and tools"; On its own "87 pages on one mat, as HOY's own hub". Mats are pluralised in both languages ("one mat" / "un tapete"; the mat counts "1 screen" / "1 pantalla").
- Lens titles and framing come from the map's `lenses` hints, with the host's own wording merged per language from `registry.ts` `lensCopy` (ALUZINA's house style: the studio's name in capitals, "tapete" for mat, natural Spanish: "hoy en el estudio ALUZINA", "hoy como gig", "El hub de pruebas de hoy"). Only the strings given replace the map's; the rest stays the client's. HOY's own role labels are never overridden.
- A narrow header strip (a container query, 36rem: phones and 768 beside the sidebar) keeps the wordmark, the version and "Project prj-hoy" on one line, Reload map as a named 44 px icon button, and the three lens tabs on one row; below 768 the gig strip's Open is a named icon and the tagline is dropped, so the desk starts inside the first screen at 390 x 844 on the ALUZINA and standalone lenses.
- The desk toolbar is the shared `DeskStage` one: one row at 1280 in EN and ES since changelog 0043 (Tilt, Reset, Legend, S / M / L and Settings fold into More when the row is short; they needed 975 px EN / 1 173 px ES in the 960 px column, now 637 / 747 px), fully inline from 1920, stacked on phones.

## The ALUZINA lens: one mat per client role

| Mat (EN / ES) | Role (look, demo) | Sub-mats (experiences) | Objects |
| --- | --- | --- | --- |
| 01 Customer / Cliente | customer (ponytail, tee; Juliana) | Customer app · Book, · Pay, · Account, · Sign in (the map's groups) | 37 phones |
| 02 Web · Public / Web · Público | public (curly, hoodie) | Website | 1 fanned stack of the whole site + 10 tall pages |
| 03 Teacher / Profesora | teacher (bun, tee, mala; Andrés) | Teacher app | 1 phone |
| 04 Front desk / Recepción | front_desk (curly, shirt, badge; Camilo) | Front desk, Inbox, Point of sale | 5 screens |
| 05 Coordinator / Coordinación | coordinator (long, cardigan, badge; Valentina) | CRM | 2 screens |
| 06 Finance / Finanzas | finance (short, blazer, tie; Laura) | Finance | 4 screens |
| 07 Admin / Administración | admin (long, shirt, necklace; Mateo) | Admin dashboard · Admin, · Content, · Tables (the map's groups), Operations manual | 17 screens + 2 documents |
| 08 Super admin / Dirección técnica | super_admin (crop, hoodie; Sofía) | Docs, Kanban & knowledgebase, Dev tools (+ Tools when shown) | 1 document + 8 screens (+ 9 tool screens) |

Maintenance owns no experience today and gets no mat (it appears as soon as the map gives it one). Mats keep the outside-in order of the map (who practises, who visits, who teaches, the team, who builds).

## Device per page

| Map device | Desk kind | Footprint | Face |
| --- | --- | --- | --- |
| `phone` (390 x 844) | phone | 1 x 2 | thumb `<lang>-phone[-dark]`, else full `<lang>-390`, else the desktop thumb |
| `tablet` (768 x 1024) | tablet | 2 x 2 | as phone |
| `desktop` (1280 x 800) | screen on a stand | 3 x 2 | thumb `<lang>-desktop[-dark]`, else full `<lang>-1280` (D-05 / D-06 have no thumbs), else the phone thumb |
| `page` (390 wide, full length) | tall page | 1 x 3 | full `<lang>-390-full` from the top, else `<lang>-390`, else a thumb |
| `sheet` (document) | document | 1 x 1 | the desktop thumb |
| the whole website | fanned pages | 2 x 3 | the home page's full-length capture; badge = page count |

The faces' language is its own switch (ES / EN), the theme follows the app. Featured entry pages carry an "entry / entrada" pill, stubs a "stub / esbozo" pill.

## Caps

ALUZINA lens: 16 objects per sub-mat and 48 per mat, so every one of the 87 pages is on the desk; an experience with several page groups gets one sub-mat per group (the map's `order`), a group or an ungrouped experience over 16 pages is split into balanced halves. Past a cap the rest become one `stack` whose drawer lists them (each a button). The face budget (200) makes objects plain past it (no image requested). `npm run desk:check` lays every lens out at seven widths in every build.

## Camera

Default size L; home zoom: phones at least 44 px wide (0.8) and on large screens 120 px x the UI scale tall (1920: 105 %, 2560: 141 %, 3840: 188 %), the desk's top-left corner at the stage's top-left; Fit and `desk.fit` show everything. Every object, mat label, sub-mat label and station is a native button with an aria-label.

## Open live: which route (consumer rule)

Open live, "Open in hoy ↗" and the `clienthub.openLive` / `clienthub.openInClient` actions embed a page at **`page.sampleRoute ?? page.route`** (changelog 0043, HOY 0.11.2): a template route with a `:id` segment (`/app/class/:id`) is not a screen, so HOY publishes a concrete sample next to it (`/app/class/sample`, `/app/booking/sample`, `/site/classes/hot-yoga`; nine pages in 0.11.2). The drawer's Route line keeps the template route (what the page is). Experiences, tools and the hub open at their own `route`.

## Offline and freshness

The snapshot renders first; the live map replaces it when it arrives (default HTTP cache, 10 minutes in memory, stale-while-revalidate). If the live map fails the pill says "Bundled snapshot · date" and the framing line says why; faces whose captures cannot load fall back to the drawn device with code and title.
