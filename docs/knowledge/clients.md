# Clients

```
status: current (past clients from Slack; current / prospect derived from the seeded projects)
since: 2026-09-21
source: Slack #aluzina 2026-09-21 02:51 UTC, Justin Massion ("Past Clients": hoy, sporti; "list of clients ... will need to be filled in further"); projects seed (prompt 0003) for the rest (prompt 0005, D-029)
```

The catalog is **data**: `clients` rows in `apps/hub/src/data/seed/spaces.ts`, rendered on K-05 (Spaces > Catalog > Clients), each past client also has a `client` space under Past Clients. Unknown facts are `null` in data and `_unknown_` here; nothing is guessed.

## Past clients (Slack "Past Clients")

| Client | Sector | City | Project | Notes |
| --- | --- | --- | --- | --- |
| HOY Wellness Center (`cl-hoy`) | wellness | Medellín | HOY Wellness Center (`prj-hoy`), related `for-client` | Slack channel `hoy`. The HOY operations system (imagine-os/hoy) is a separate imagine-os project; kanban card "confirm Hoy = HOY Wellness Center" stays open for the founder. |
| Sporti (`cl-sporti`) | `_unknown_` | `_unknown_` | `_unknown_` | Slack channel `sporti`. Contact `_unknown_`. The seeded post "Sporti: what we know" is a draft listing the gaps. |

## Current and prospective (derived from projects; confirm with the founder)

| Client | Kind | Sector | City | Project |
| --- | --- | --- | --- | --- |
| Familia Restrepo (`cl-familia-restrepo`) | current | residential | Medellín | Casa Laureles (`prj-laureles`); demo client user `u-client` |
| Noam (`cl-noam`) | current | residential | `_unknown_` | Noam Residential (`prj-noam`) |
| Grupo Provenza (`cl-grupo-provenza`) | prospect | hospitality | Medellín | Café Provenza (`prj-cafe-provenza`, lead) |
| Ruta N (`cl-ruta-n`) | current | commercial | Medellín | Oficinas Ruta N piso 4 (`prj-oficinas-ruta-n`) |

Honey Valley Lighting is Aluzina's own collection, not a client.

Contact names are `_unknown_` for every client (no real contact data in the repo, D-015).

## Change log

- 2026-09-21: created with Hoy and Sporti (Slack), four clients derived from projects; six rows seeded, `for-client` relations project -> client (prompt 0005, changelog 0009, D-029).
