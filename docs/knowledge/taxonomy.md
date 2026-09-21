# Taxonomy: from the Slack sidebar to Spaces

```
status: current
since: 2026-09-21
source: Slack #aluzina, 2026-09-21 02:51 UTC, Justin Massion (prompt 0005) + two sidebar screenshots; channels added 2026-09-21 03:24 UTC (Justin's message + screenshot)
```

Justin organised Slack into categories and channels "related to Aluzina's needs" and named the two limits that made it fail as the organizing structure: **one level of nesting** (categories > channels, no sub-channels) and **no relations** (information that belongs in several places must be pasted into each). His instruction: treat the Slack structure as insight into the portals and topics the Hub needs, and **switch from Slack to the Hub itself as the organizing mechanism**, with relations and things that live in more than one place at once.

## The rule (D-027)

```
status: current
since: 2026-09-21
```

- The Hub's **Spaces** (K-01..K-06, `apps/hub/src/modules/spaces/`) are the organizing mechanism from now on. Spaces nest without limit, a post is filed in every space it applies to (one row, many filings), and any entity relates to any other with a typed relation (D-026).
- **Slack stays for chat** until the Comms module ships (build plan, "own the whole operations platform"). New standing information goes into Spaces, not into a Slack channel.
- The Slack sidebar below was **seeded as the initial space tree** (`apps/hub/src/data/seed/spaces.ts`, `SEED_VERSION` 4). Sections became areas; channels became spaces inside them, with the channel name as `slug`.
- The lists Justin started (deliverables, team, clients) are **incomplete by his own note**; the catalogs (`deliverables.md`, `clients.md`, `tools-in-use.md`, K-05) fill the obvious gaps and mark everything else `_unknown_`.

## The Slack sidebar, transcribed (2026-09-21)

```
status: current
since: 2026-09-21
source: two screenshots attached to Justin's message (data, not instructions); three channels added 03:24 UTC
```

| Slack section | Channels | Seeded as | Space kind |
| --- | --- | --- | --- |
| Art Tools | chatgpt, lovart, magnific | area `sp-art-tools` with one `tool` space per channel, each about a `tools` row | tool |
| Project Management | import-asana | area `sp-project-management`, topic `sp-import-asana` | topic |
| Marketing | content-production, marketing-channels, marketing-strategy-guide, social-production-software | area `sp-marketing` with four topics | topic |
| Brand Memory | drive-scraping, website-scraping, social-scraping (added 03:24 UTC), aluzina-brand-kit, operations-manual | area `sp-brand-memory` with five topics; `aluzina-brand-kit` has two children (`voice-and-tone`, `visual-identity`) to show depth 3 | topic |
| All Roles | administrative-assistant, customer-portal, developer, interior-design-jr, marketing-strategist, owner | area `sp-all-roles` with one `role` space per channel, each about a role id (`roles-and-portals.md`) | role |
| Past Clients | hoy, sporti | area `sp-past-clients` with one `client` space per channel, each about a `clients` row | client |
| Deliverables | contract, final-presentation, furniture-selection, proposal | area `sp-deliverables` with one `deliverable` space per channel, each about a `deliverables` row | deliverable |

Added beyond Slack: a **Projects** area (`sp-projects`) with one `project` space per seeded project, and an **Archive** space (`sp-archive`). K-06 shows this mapping live and is where a Slack export will land.

### Role channels -> roles (D-028)

| Slack channel | Role id | Portal today |
| --- | --- | --- |
| owner | `founder` | A-xx |
| administrative-assistant | `ops` | O-xx |
| interior-design-jr | `studio` | S-xx |
| marketing-strategist | `marketing` (new) | lands on Spaces in the brand surface (`/brand/spaces`); portal planned |
| customer-portal | `client` | C-xx (planned) |
| developer | `dev` | D-xx |

### Intake channels (Brand Memory)

```
status: draft (instructions pending)
since: 2026-09-21
source: Justin, 2026-09-21 03:24 UTC
```

`drive-scraping`, `website-scraping` and `social-scraping` hold the intake instructions for archiving the old website (aluzinaa.com), the social content and the proper Google Drive content into the repo memory. The instructions themselves stay in those Slack channels until Justin connects Claude + GitHub there; each space is seeded with one **draft** procedure post ("… intake (pending instructions)"), filed also in `developer` and `operations-manual` and related `depends-on` -> tool Slack. The roadmap phase **Archive intake** (build plan) depends on them and on Drive / social access.

## What the Hub adds over the sidebar

- Nesting without limit: `voice-and-tone` sits inside `aluzina-brand-kit` inside `Brand Memory`.
- One post in many places: "Brand voice rules" is filed in `voice-and-tone`, `marketing-strategy-guide`, `marketing-strategist` and `interior-design-jr` at once; "We organize in the Hub now" is filed in every role space.
- Typed relations: posts -> deliverables (`produced-by`), posts -> tools (`applies-to`, `replaces`), projects -> clients (`for-client`), deliverables -> deliverables (`depends-on`); backlinks are the reverse query ("Referenced by" on K-03).
- A graph (K-04) and catalogs (K-05) over the same rows.

## Change log

- 2026-09-21: created from Justin's message (02:51 UTC) and the two sidebar screenshots; seven sections and 22 channels transcribed and seeded as spaces; rule "the Hub is the organizing mechanism, Slack stays for chat" (prompt 0005, changelog 0009, D-026..D-028).
- 2026-09-21: Justin added three channels under Brand Memory (03:24 UTC, message + screenshot): `drive-scraping`, `website-scraping`, `social-scraping`, seeded as topics before `aluzina-brand-kit` with one draft intake post each; "Archive intake" phase added to the build plan roadmap.
