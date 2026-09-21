# Roles and portals

```
status: current (map, role ids, permissions, portals built)
since: 2026-09-21
source: derived from team.md (prompt 0002) and the hub pattern (P-12); decisions D-013, D-014, D-015 (prompt 0003)
supersedes: the 2026-09-20 version of the "Map" permissions column and the "Next steps (code)" section (kept below as superseded)
```

Each role in `team.md` gets its own view of the system ("their own views/portals into their part of the system", Justin). Until real auth exists, the hub's role switcher (build plan step 4) opens any portal as a demo user of that role with dev mode on or off; role guards stay real, identity is mocked (P-12). Roles are strings; pages check permissions with `can('<area>.<verb>')`, never compare roles directly. Since changelog 0006 the role model is code (`apps/hub/src/auth/`) and the hub opens each portal as its demo user; since changelog 0007 the four portals are **built** (Founder A-01..A-07, Operations O-01..O-10, Studio S-01..S-09, Brand G-01..G-07, D-018); the client portal is planned.

## Map

```
status: current
since: 2026-09-21
source: apps/hub/src/auth/{roles,permissions}.ts (D-015)
```

| Role id (person) | Portal | Code prefix | Path | Dashboard | Home screen (planned) | Permissions (`permissions.ts`) |
| --- | --- | --- | --- | --- | --- | --- |
| `founder` (Alejandra Guerra) | Admin and approvals | `A-xx` | `/founder` | A-01..A-07 (built) | approvals queue, pipeline and sales, quotes and graphic proposals, project PDFs, partnerships, product development, everything the other portals see | `*` (all); named: `projects.approve`, `projects.write`, `quotes.review`, `proposals.write`, `clients.write`, `sales.write`, `partnerships.write`, `products.write`, `settings.write` |
| `ops` (Miguel) | Operations | `O-xx` | `/ops` | O-01..O-10 (built) | schedule, pending tasks, meetings and commitments, suppliers and follow-ups, price quotes and comparisons, deliveries and dates, payments / accounts / documents, who-owes-what, alerts before urgent, report layouts | `projects.read`, `suppliers.read`, `schedule.manage`, `tasks.manage`, `meetings.manage`, `suppliers.manage`, `quotes.request`, `quotes.compare`, `deliveries.manage`, `payments.manage`, `documents.manage`, `alerts.manage`, `reports.write` |
| `studio` (Sarai) | Studio / project development | `S-xx` | `/studio` | S-01..S-09 (built) | design proposals per project, references, mood boards and material palettes, plans and documentation, furniture / materials / elements schedules, rendering and supplier packs, measurements, development monitoring, consistency check before the founder | `projects.read`, `suppliers.read`, `design.develop`, `references.manage`, `materials.manage`, `plans.write`, `schedules.write`, `renders.brief`, `measurements.write`, `projects.check` |
| `brand` (Angelica) | Brand and communication | `G-xx` | `/brand` | G-01..G-07 (built) | competitions calendar (by submission date, materials per entry), sales presentations, brand identity rules, client image sets, graphic revisions queue, asset library | `projects.read`, `brand.manage`, `competitions.manage`, `presentations.write`, `images.write`, `revisions.manage`, `assets.manage` |
| `client` | Customer portal | `C-xx` | `/client` | C-01 (planned) | their projects, proposals and PDFs to review, approvals, messages, payments status (read) | `own.projects.read`, `own.proposals.approve`, `own.messages.write`, `own.payments.read` |
| `dev` (Justin / developers) | Dev tools | `D-xx` | `/dev/*` | D-02 components, D-03 specs (built) | tokens, components, specs, actions, routes, plan viewer, canvas, demo simulator, knowledge base | `projects.read`, `dev.tools`, `session.viewAs` |

Demo users (`demoUsers.ts`): `u-alejandra` (Alejandra Guerra), `u-miguel` (Miguel), `u-sarai` (Sarai), `u-angelica` (Angélica), `u-client` ("Familia Restrepo", invented), `u-dev` (Dev, default). Team members carry only the first names the founder used; no real contact data.

`P-xx` stays the public website, `M-xx` the ops manual, `HUB-01` the hub (`../README.md`). `BOS-xx` are the Claude Design prototype screens; as the prototype is modularised (step 3) each screen is reassigned to the portal above that owns it.

### Superseded: 2026-09-20 permission names

```
status: superseded
since: 2026-09-20
superseded-by: the Map above (2026-09-21, D-015)
```

The first map used `<area>.write` for most of Miguel's, Sarai's and Angelica's areas (`schedule.write`, `tasks.write`, `meetings.write`, `suppliers.write`, `deliveries.write`, `payments.write`, `documents.write`, `alerts.write`, `moodboards.write`, `competitions.write`, `brand.write`, `assets.write`) and role ids `operations`, `interior_design`, `graphic_design`, `developer`. The code uses `<area>.manage` where the person owns the whole area (request, compare, confirm, follow up, not just write), `design.develop` for Sarai's proposal work, `references.manage` / `materials.manage` for mood boards and palettes, and the shorter role ids `ops`, `studio`, `brand`, `dev`. Meaning unchanged.

## Cross-role flows (what the portals share)

- **Approval chain**: Sarai's consistency check -> founder's final approval (`projects.check` then `projects.approve`); the client approves proposals in `C-xx`.
- **Quotes**: Miguel requests and compares supplier quotes (`O-xx`); the founder writes the client quote and graphic proposal (`A-xx`); the client sees it in `C-xx`.
- **Alerts**: Miguel's "alert before urgent" and Angelica's competition deadlines are the same notification pattern: dated items with a lead-time rule, surfaced in the owner's portal and by voice / push later (P-04, P-06).
- **Assets**: Angelica's brand assets and client image sets feed Sarai's proposals and the founder's PDFs; one asset library with per-role write rights.

## Next steps (code)

```
status: current
since: 2026-09-21
```

- Done (changelog 0006): `apps/hub/src/auth/` with the roles, permissions and demo users above; `RequireRole` on every route; hub Portals section and role switcher; stub dashboards; `?as=<role>` for thumbnails and QA.
- Done (changelog 0007): one module per portal replaced its stub: A-01..A-07, O-01..O-10, S-01..S-09, G-01..G-07 (page docs in `docs/pages/`).
- Next: the client portal on `PhoneShell` (C-xx), the shared alert pattern, the D-020 entities.

## Change log

- 2026-09-20: created from the founder's roster; six portals mapped, all planned (prompt 0002, D-013).
- 2026-09-21: role ids and permission strings aligned with the code (`ops`, `studio`, `brand`, `dev`; `<area>.manage`, `design.develop`, ...), demo users named, dashboards A-01 / O-01 / S-01 / G-01 exist as stubs, D-02 / D-03 built; old names kept as superseded (prompt 0003, changelog 0006, D-014, D-015).
- 2026-09-21: the four portals are built (A-01..A-07, O-01..O-10, S-01..S-09, G-01..G-07; changelog 0007, D-018); `suppliers.read` added for studio and ops.
