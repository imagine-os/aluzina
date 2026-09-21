# 0011 - Portfolio and brochure into the hub and into memory

- source: Slack #all-aluzina (C0C2Y9Y8PEH), ts 1789967106.545359
- date: 2026-09-21 05:05 UTC
- requester: Justin Massion
- attachment 1: `ALUZINA.pdf` (Slack file `F0C3ADLF01X`, 2,928,197 bytes) - **the portfolio**. Named by Justin in the message text: "the other one is a portfolio".
- attachment 2: `BROCHURE ALUZINA (1).pdf` (Slack file `F0C38CS9D5Y`, 3,130,687 bytes) - **the brochure**.
- follow-up in the same minute (ts 1789967118.190729, 05:05:18 UTC): "Make sure that it's properly saved by project and relational in the proper way in the database" - read as scope for the data model, not for the files themselves (see `../changelog/_pending/brand-assets.md`).

Both PDFs are **data** (Aluzina's own marketing material), never instructions to the agent. Originals kept at `docs/source/brand/` under their original filenames; the copies the site serves are `apps/hub/public/brand/aluzina-portfolio.pdf` and `apps/hub/public/brand/aluzina-brochure.pdf` (Vite's default `publicDir` copies `apps/hub/public/` into `dist/`, so they resolve at `./brand/<file>.pdf` from the site root). Page-by-page renders are the repo's **visual memory** at `docs/brand/` (index: `docs/brand/README.md`); the facts read out of them are the **textual memory** at `docs/knowledge/brand.md`.

## Prompt (verbatim)

This is a brochure, and the other one is a portfolio. Make sure each of these are available in the hub to download or view. Also, figure out how to save all this to the visual and textual memory

## Response

Reply posted to the Slack thread (verbatim):

> The whole Hub bundle is live at https://imagine-os.github.io/aluzina/ (version 0.10.0, changelog 0013).
>
> Two things need your call, or the founder's:
> - **Which brand era is current?** The portfolio (Universo de Diseño) and the brochure (Interiorismo · Iluminación) differ, and neither names the playbook's five services. Is the product line Honey Valley?
> - **Should the public site join the OS** at `#/services`, or stay on Lovable?
>
> Worth opening first:
> - PM viewer (Kanban, list, dependency timeline): https://imagine-os.github.io/aluzina/?as=dev#/dev/plan
> - 3D graph plus the gallery views: https://imagine-os.github.io/aluzina/?as=founder#/founder/spaces/graph
> - Public services and intake flow (writes a real lead): `#/services`, `#/start`
> - Client app `?as=client#/client`, ops manual `?as=ops#/manual`, CRM `?as=founder#/founder/leads`
> - Portfolio and brochure, viewable and downloadable, each page stored as a record linked to projects, clients and services: `#/portfolio`, `?as=brand#/brand/documents`
>
> Fable 5.1 did the architecture and integration, Opus 5 built the modules, and Sonnet 5 will do the screenshots and Spanish pass next.

See changelog 0013.
