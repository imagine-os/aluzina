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

## Named in Aluzina's own marketing material (appended, not yet reconciled)

```
status: current
since: 2026-09-21
source: BROCHURE ALUZINA (1).pdf (brochure) p. 2 and ALUZINA.pdf (portfolio) pp. 4-28, shared by Justin Massion in Slack 2026-09-21 (prompt 0011)
```

These are **past clients and projects Aluzina publishes about itself**. They are appended here as
evidence; none of the rows above is changed, superseded or deleted by them, and none of these is
seeded as a `clients` row yet. Stable kebab-case slugs, page numbers and one-line summaries for
every entry are in [`../brand/brochure/index.json`](../brand/brochure/index.json) and
[`../brand/portfolio/index.json`](../brand/portfolio/index.json); the pictures are in
[`../brand/README.md`](../brand/README.md); the full reading is [`brand.md`](brand.md).

The brochure claims **8 years, more than 50 projects in Colombia and 4 international projects,
16.743 m²** (p. 2), so these 20 names are a selection, not the whole client list.

**Comercial** (brochure p. 2, in the printed order):

| # | Client as printed | Slug | Note |
| --- | --- | --- | --- |
| 1 | Hotel Mantyx | `hotel-mantyx` | Listed separately from "Mantyx" (#7): two engagements, or a duplicate. |
| 2 | Coassist | `coassist` | Insurance offices; **shown** in the portfolio, pp. 11-12. |
| 3 | Bebo | `bebo` | Sector `_unknown_`. |
| 4 | Sodime | `sodime` | Medical clinic; **shown** in the portfolio, pp. 8-9. |
| 5 | Área metropolitana de Medellín | `area-metropolitana-de-medellin` | Public sector, not a private client. |
| 6 | Semana de la juventud | `semana-de-la-juventud` | An event; most likely the Medellín city programme. |
| 7 | Mantyx | `mantyx` | See #1. |
| 8 | Alcaldía de Medellín | `alcaldia-de-medellin` | Public sector (Medellín city hall). |
| 9 | London City barber shop | `london-city-barber-shop` | Retail. |
| 10 | Brewhouse cervecería | `brewhouse-cerveceria` | Craft-beer bar; **shown** in the portfolio, pp. 4-5. |

**Residencial** (brochure p. 2, in the printed order): Apartamento Parma Noham Ebresum
(`apartamento-parma-noham-ebresum`) · Casa Nueva York Colin Kamesh Raja
(`casa-nueva-york-colin-kamesh-raja`) · Casa Miami Ovy on the drums
(`casa-miami-ovy-on-the-drums`) · Apartamento La Estrella Estela Clavel
(`apartamento-la-estrella-estela-clavel`) · Apartamento Poblado Rio Escondido
(`apartamento-poblado-rio-escondido`) · Apartamento Terrasino Cumbres
(`apartamento-terrasino-cumbres`) · Parta estudio loma de los parra
(`parta-estudio-loma-de-los-parra`, printed exactly so - reads as a typo for *Apartaestudio*) ·
Apartamento Seta (`apartamento-seta`) · Apartaestudio Asemssi (`apartaestudio-asemssi`) ·
Apartamento Cubik Envigado (`apartamento-cubik-envigado`).

Several residential names embed a place - Nueva York, Miami, La Estrella, Poblado, Envigado, Loma
de los Parra - but the brochure never states a city as a fact, so **city is `_unknown_` for every
row** and must not be inferred. Casa Nueva York and Casa Miami are the likely two of the four
international projects, unconfirmed.

**Shown in the portfolio but named nowhere else:** Club Unión (massage suite, pp. 6-7) and Terminal
Norte (food court, p. 10) are identifiable clients; the eight residential projects and the three
Art Events fit-outs on pp. 13-28 are published without a client name at all.

**Possible overlap with the rows above, unconfirmed:** "Apartamento Parma Noham Ebresum" may be the
seeded client `cl-noam` / Noam Residential (`prj-noam`). The names are suggestive and nothing more;
do not merge them without the founder.

Contact names and contact data remain `_unknown_` for every client here (D-015); the PDFs print
only Aluzina's own channels.

**Update 2026-09-21 (prompt 0013, model Fable 5.1)** - six of the clients the **portfolio** names are
now `clients` rows (`kind: past`, seeded from `docs/brand/portfolio/index.json` by
`apps/hub/src/data/seed/assets.ts`), each related `for-client` to its portfolio project: `cl-brewhouse`
Brew House (`prj-pf-brewhouse-bar-cerveza-artesanal`), `cl-club-union` Club Unión
(`prj-pf-club-union-sala-de-masajes`), `cl-sodime` Sodime (`prj-pf-sodime-consultorio-medico`),
`cl-terminal-norte` Terminal Norte (`prj-pf-terminal-norte-plazoleta-comida`), `cl-coassist` Coassist
(`prj-pf-coassist-aseguradora`), `cl-gahia` Gahia (`prj-pf-gahia-pop-up`; read as the pop-up's brand,
unconfirmed). City and contact stay `null`. The twenty **brochure** names are still not rows: they live in
the Spaces note `post-brochure-clients` and in the table above. Details in
[`brand.md#portfolio-projects-as-records`](brand.md#portfolio-projects-as-records).

## Change log

- 2026-09-21: created with Hoy and Sporti (Slack), four clients derived from projects; six rows seeded, `for-client` relations project -> client (prompt 0005, changelog 0009, D-029).
- 2026-09-21: appended "Named in Aluzina's own marketing material" - 20 clients from brochure p. 2 (10 comercial, 10 residencial) and the portfolio's Club Unión and Terminal Norte, each with a stable slug; Coassist, Sodime and Brewhouse cervecería flagged as appearing in both documents; possible `cl-noam` overlap flagged as unconfirmed. Nothing above changed or removed (prompt 0011, changelog 0013; model Opus 5).
- 2026-09-21: six portfolio clients seeded as `clients` rows (`cl-brewhouse`, `cl-club-union`, `cl-sodime`, `cl-terminal-norte`, `cl-coassist`, `cl-gahia`, all `past`) with `for-client` relations to the new `prj-pf-*` projects; the brochure's twenty names remain unseeded. Nothing above changed or removed (prompt 0013, changelog 0013; model Fable 5.1).
