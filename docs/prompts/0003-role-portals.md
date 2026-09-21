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

Result reply pending; see changelog 0007.
