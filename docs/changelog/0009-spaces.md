version: 0.7.0
date: 2026-09-21
prompt: 0005
intent: Replace the Slack sidebar as Aluzina's organizing mechanism with the Hub's own Spaces: a tree without depth limit, posts filed in many spaces at once, typed relations between any entities, a graph, the catalogs behind it (deliverables, clients, tools, roles) and the place where a Slack export will land; plus the knowledge and roadmap that turn Justin's "own the whole operations platform" into phases.
decision: D-026, D-027, D-028, D-029, D-030
rejected: a CMS or wiki dependency (own small Markdown renderer instead, React elements only); a graph library (own deterministic force layout, ~10 kB, no wheel-only zoom); a separate marketing portal now (the new `marketing` role lands on Spaces inside the brand surface until an M-xx portal exists); re-seeding or writing from K-06 (read-only mapping and contract until an export exists); inventing Sporti's facts or deliverable durations as truth (unknowns stay null / `_unknown_`, durations are marked as estimates)
files: apps/hub/src/data/schema/{spaces,index}.ts, apps/hub/src/data/seed/{spaces,index,types}.ts, apps/hub/src/auth/{roles,permissions,demoUsers}.ts, apps/hub/src/specs/PageSpec.ts (K codes), apps/hub/src/app/navGroups.ts (spaces group), apps/hub/src/i18n/core.ts, apps/hub/src/components/atom/{Markdown,StatusPill}/*, apps/hub/src/components/molecule/PostCard/*, apps/hub/src/components/organism/{SpaceTree,RelationGraph}/*, apps/hub/src/modules/spaces/{index,specs,strings,model,entities}.ts + {SpacesPage,PostPage,GraphPage,CatalogPage,ImportPage}.tsx + spaces.css, apps/hub/src/modules/hub/{HubPage.tsx,specs.ts,strings.ts}, apps/hub/src/modules/README.md, scripts/thumbnails.mjs (K-01), package.json + apps/hub/package.json (0.7.0), docs/prompts/0005-spaces-relational-organizer.md, docs/changelog/0009-spaces.md, docs/decisions.md (D-026..D-030), docs/pages/K-01..K-06.md, docs/knowledge/{taxonomy,deliverables,clients}.md (new), docs/knowledge/{tools-in-use,roles-and-portals,README}.md, docs/build-plan.md (step 12, roadmap R1..R10), docs/kanban.md, docs/reference/surfaces.md, docs/README.md, docs/screenshots/K-01..K-06/
codes: K-01, K-02, K-03, K-04, K-05, K-06, HUB-01
model: Fable 5.1

# 0009 - Spaces: the Hub as the relational organizer (build plan step 12)

Justin organised Slack into sections and channels for Aluzina and hit its two limits: one level of nesting and no relations, so anything that applies to several roles has to be pasted into each channel. He asked to treat that structure as insight into what the Hub needs and to **switch from Slack to the Hub as the organizing mechanism** (prompt 0005, verbatim). This pass ships **Spaces** (K-01..K-06) on every portal and on dev, seeds his sidebar as the first tree (D-027), maps his role channels to roles with one new role (D-028), turns deliverables / clients / tools into data with change-tracked knowledge docs (D-029) and writes the "own the whole platform" roadmap (D-030). 75 routes and 680 declared action entries are now in the manifest (45 / 400 before).

## A. Data (`feat(data)`, D-026, D-029)

- New entities: `spaces` (name, slug, parentId for unlimited nesting, kind `area | topic | role | client | deliverable | tool | project | archive`, description, glyph, order, visibility, archived, `aboutType / aboutId`), `posts` (title, Markdown body, kind `note | link | file | decision | procedure | brief | announcement`, authorId, url, pinned, status `draft | published | archived`, tags[]), `filings` (postId, spaceId: many-to-many), `relations` (fromType, fromId, toType, toId, kind x 9, note; any-to-any), `tags` (name, tone), `clients`, `deliverables` (types), `tools`.
- Seeds (`SEED_VERSION` 4): 42 spaces (Justin's 7 sections and 25 channels incl. the three intake channels added at 03:24 UTC, plus `voice-and-tone` / `visual-identity` at depth 3, a Projects area with 6 project spaces, an Archive), 30 posts filed 80 times (e.g. "Brand voice rules" in 4 spaces, "We organize in the Hub now" in all 6 role spaces + operations-manual, "Proposal template v3" `produced-by` -> deliverable Proposal), 53 relations, 12 tags, 6 clients, 25 deliverable types, 9 tools, 3 comments on posts.
- Roles: `marketing` added (seven roles), demo user `u-valentina` (invented), permissions `marketing.plan / content / channels`, `spaces.read` (all roles), `spaces.write` (founder, ops, brand, marketing, dev), `spaces.admin` (founder, dev). `ROLE_META.marketing` lands on `/brand/spaces`.
- `PageSpec` accepts `K-xx`; nav group `spaces` after `projects`; `StatusPill` tones for the new statuses; core strings for roles, nav, statuses and the Spaces components.

## B. Components (`feat(components)`) with metas and live examples at `/#/dev/components`

| Component | Tier | What it does |
| --- | --- | --- |
| `Markdown` | atom | safe renderer: headings (demoted under the page h1), lists, task items, quotes, fenced code, pipe tables, bold / italic / code, http(s) / mailto links only; React elements, never HTML |
| `PostCard` | molecule | one post in a list: kind pill, draft / archived pill, "also in N spaces", title, excerpt, author, date, tags; one 44 px button |
| `SpaceTree` | organism | WAI-ARIA tree with roving tabindex (arrows, Home / End, Enter / Space, letter jump, `*`), kind-toned glyphs, counts, controlled expansion |
| `RelationGraph` | organism | SVG graph with own deterministic force layout (radial start by hop distance, 300 iterations); nodes are focusable buttons (Enter opens, Space centres, arrows walk neighbours, Home returns); button zoom; scrolls inside its container |

## C. Module `spaces` (`feat(spaces)`) on founder, ops, studio, brand, dev

| Code | Path | What is real |
| --- | --- | --- |
| K-01 | `/<surface>/spaces` | tree + search + show archived (Drawer under 1024 px), role banner and role-space preselection, description edit, child spaces grid, filters (kind, tag, author), sort, pinned first, New space / New post modals, archive (admin) |
| K-02 | `/<surface>/spaces/:spaceId` | same page deep-linked with ancestor breadcrumb |
| K-03 | `/<surface>/spaces/post/:postId` | Markdown body, inline edit (title, body, tags), pin, status, filed-in chips + "File in…" drawer (add / remove without duplicating; last filing protected), relations add / remove with a target search across 13 entity types, backlinks, comments (Work `comments` entity), activity trail |
| K-04 | `/<surface>/spaces/graph` | focus + depth 1 / 2 / 3 / all (`?focus=&depth=`), kind toggles, zoom − / + / fit, legend, open on click / Enter |
| K-05 | `/<surface>/spaces/catalog` | Deliverables (template links to the producing hub page, else Placeholder "Open template"), Clients (unknowns marked), Tools (dependency map tiles, "replaced by" links to routes), Roles |
| K-06 | `/<surface>/spaces/import` | Slack sidebar -> spaces mapping (live from the seed) and the import checklist; **Placeholder**: the upload button |

37 distinct `spaces.*` actions declared (56 entries per surface, 280 in total). Hub: a Spaces card (K-01) that opens the current role's surface; `scripts/thumbnails.mjs` captures K-01.

## D. Docs and knowledge (`docs(spaces)`)

`knowledge/taxonomy.md` (sidebar transcribed, mapping, the rule), `knowledge/deliverables.md`, `knowledge/clients.md`, `knowledge/tools-in-use.md` (8 tools with replaced-by), `knowledge/roles-and-portals.md` (marketing, Slack channel map), `build-plan.md` (step 12 + roadmap R1 Comms .. R10 Archive intake with build vs integrate), D-026..D-030, pages K-01..K-06, surfaces, kanban, README, prompt 0005.

## E. Verification

- `npm run build` green (tsc strict); Playwright smoke over `npm run preview` as ops and founder: K-01..K-06 at 390 / 1280 / 1920, light and dark: no console errors, `scrollWidth === clientWidth` on every page (the graph scrolls inside `.rgraph`), no missing string keys; keyboard: tree Home / ArrowRight / ArrowDown / Enter changes the selection and the URL, Enter on a PostCard opens K-03; two tabs: filing a post in tab A (ops) appears in tab B (founder) in 8 ms.
- Working captures: session scratchpad `shots/spaces/{home-1280,post-1280,graph-1280,catalog-1280,home-390,graph-390}.jpg`; live captures in `docs/screenshots/K-0N/` after deploy.

## Real vs placeholder

Real: every read and write on K-01..K-05 through the DataProvider (mock, localStorage, cross-tab). Placeholder: K-06 upload; K-05 "Open template" for deliverables without a producing page. Not built: Slack import script, space move / reorder UI, visibility enforcement beyond the data field, file storage, marketing portal.
