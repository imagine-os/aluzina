# 0003 - Portals from the hub for each worker's point of view

- source: Slack #aluzina thread (same thread as prompts 0001 and 0002)
- date: 2026-09-20 23:55 UTC (18:55 local)
- requester: Justin Massion
- context: follows the founder's roster (prompt 0002, `docs/knowledge/team.md`) and the role -> portal map (D-013).

## Prompt (verbatim)

```
Create the portals from the hub for each of the workers poitn of views for the interior design & lighting and experience design business
```

## Response

Reply (result) — see changelog 0006 for the full change set.

The portals now exist as the foundation for the four role modules (build plan 9a, model: Fable 5.1). The hub gained a **Portals** section: Founder (Alejandra Guerra, A-01), Administration and Operations (Miguel, O-01), Interior Design (Sarai, S-01), Graphic Design and Communication (Angélica, G-01), plus a planned Client portal; each card enters the portal as that person's demo user, and a "Viewing as" switcher in the header changes the role in place. Every portal renders inside one shell (sidebar per role, role badge, EN/ES, light/dark, dev mode, back to hub, user menu) and every route is guarded by permission: identity is mocked, guards are real (D-014, D-015). Underneath: a mock data layer with 18 entities seeded for a Medellín interior design and lighting studio (projects, tasks, suppliers, quotes with comparison groups, deliveries, payments and who owes what, references, palettes, schedules, render packs, consistency checks, the 20 competition slots for 2027, presentations, brand assets, revisions, alerts; D-016), a 31-component library with live examples at `/#/dev/components` (D-017) and a page-spec viewer at `/#/dev/specs`. The four dashboards are stubs (every section marked "not wired yet") so the four modules can now be built in parallel without touching shared files (`apps/hub/src/modules/README.md`).

Live: https://imagine-os.github.io/aluzina/ (deploy run 35548185005, thumbnails for all six new pages generated). Next: build plan 9b, one worker per portal (Opus 5), then integration and the client portal (9c).

Reply (result) posted to the thread, verbatim:

> The four portals are live from the hub at https://imagine-os.github.io/aluzina/. Pick a card to enter as that person, or jump straight in: Founder (Alejandra) ?as=founder#/founder; Administration and Operations (Miguel) ?as=ops#/ops; Interior Design (Sarai) ?as=studio#/studio; Graphic Design and Communication (Angélica) ?as=brand#/brand. Each portal has a dashboard plus one page per responsibility from the roster: 7 pages for Alejandra, 10 for Miguel, 9 for Sarai and 7 for Angélica. Everything runs on realistic mock data for the studio, and the writes are real within the browser. Anything not wired yet says so when you click it. EN/ES toggle is on every page, and 33 pages passed checks from phone to 1920 in light and dark. Underneath sits the foundation the next portals build on: roles and permissions, a role switcher, a 31-component library (?as=dev#/dev/components), and a spec page listing every route and its 148 declared actions. Two things to decide: the hub currently opens as the developer view rather than as Alejandra, and the operations portal has 10 pages instead of 9 because reports needed a home. Opus 5 built the four portals; Fable 5.1 did the foundation and integration.

See changelog 0007.
