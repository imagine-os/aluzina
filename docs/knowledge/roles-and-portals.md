# Roles and portals

```
status: current (map) / planned (every portal)
since: 2026-09-20
source: derived from team.md (prompt 0002) and the hub pattern (P-12); decision D-013
```

Each role in `team.md` gets its own view of the system ("their own views/portals into their part of the system", Justin). Until real auth exists, the hub's role switcher (build plan step 4) opens any portal as a demo user of that role with dev mode on or off; role guards stay real, identity is mocked (P-12). Roles are strings; pages check permissions with `can('<area>.<verb>')`, never compare roles directly. **Nothing below is built yet**; the codes reserve the page-code namespace.

## Map

| Role (person) | Portal | Code prefix | Home screen (planned) | Permissions implied |
| --- | --- | --- | --- | --- |
| Founder (Alejandra Guerra) | Admin and approvals | `A-xx` | approvals queue, pipeline and sales, quotes and graphic proposals, project PDFs, partnerships, product development, everything the other portals see | `*` (all), specifically `projects.approve`, `quotes.write`, `proposals.write`, `clients.write`, `sales.write`, `settings.write`, `dev.tools` (with Justin) |
| Administration and Operations (Miguel) | Operations | `O-xx` | schedule, pending tasks, meetings and commitments, suppliers and follow-ups, price quotes and comparisons, deliveries and dates, payments / accounts / documents, who-owes-what, alerts before urgent, report layouts | `schedule.write`, `tasks.write`, `meetings.write`, `suppliers.write`, `quotes.request`, `quotes.compare`, `deliveries.write`, `payments.write`, `documents.write`, `alerts.write`, `reports.write` |
| Interior Design (Sarai) | Studio / project development | `S-xx` | design proposals per project, references, mood boards and material palettes, plans and documentation, furniture / materials / elements schedules, rendering and supplier packs, measurements, development monitoring, consistency check before the founder | `projects.read`, `proposals.draft`, `references.write`, `moodboards.write`, `plans.write`, `schedules.write`, `renders.brief`, `measurements.write`, `projects.check` |
| Graphic Design and Communication (Angelica) | Brand and communication | `G-xx` | competitions calendar (by submission date, materials per entry), sales presentations, brand identity rules, client image sets, graphic revisions queue, asset library | `competitions.write`, `presentations.write`, `brand.write`, `images.write`, `revisions.write`, `assets.write` |
| Client | Customer portal | `C-xx` | their projects, proposals and PDFs to review, approvals, messages, payments status (read) | `own.projects.read`, `own.proposals.approve`, `own.messages.write`, `own.payments.read` |
| Justin / developers | Dev tools | `D-xx` | tokens, components, specs, actions, routes, plan viewer, canvas, demo simulator, knowledge base | `dev.tools` |

`P-xx` stays the public website, `M-xx` the ops manual, `HUB-01` the hub (`../README.md`). `BOS-xx` are the Claude Design prototype screens; as the prototype is modularised (step 3) each screen is reassigned to the portal above that owns it.

## Cross-role flows (what the portals share)

- **Approval chain**: Sarai's consistency check -> founder's final approval (`projects.check` then `projects.approve`); the client approves proposals in `C-xx`.
- **Quotes**: Miguel requests and compares supplier quotes (`O-xx`); the founder writes the client quote and graphic proposal (`A-xx`); the client sees it in `C-xx`.
- **Alerts**: Miguel's "alert before urgent" and Angelica's competition deadlines are the same notification pattern: dated items with a lead-time rule, surfaced in the owner's portal and by voice / push later (P-04, P-06).
- **Assets**: Angelica's brand assets and client image sets feed Sarai's proposals and the founder's PDFs; one asset library with per-role write rights.

## Next steps (code)

- `apps/hub/src/auth/roles.ts`: `founder`, `operations`, `interior_design`, `graphic_design`, `client`, `developer` (+ `public`) as role strings; `permissions.ts` with the strings above; `demoUsers.ts` with one fictional demo user per role (never the real team members' data). The hub has no auth folder today, so this is documented here rather than half-built.
- Hub role switcher (step 4) then opens each portal shell; portals are built in build plan step 9.

## Change log

- 2026-09-20: created from the founder's roster; six portals mapped, all planned (prompt 0002, D-013).
