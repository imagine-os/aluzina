# 0013 - Brand documents saved by project and relational in the database

- source: Slack #all-aluzina (C0C2Y9Y8PEH), ts 1789967118.190729
- date: 2026-09-21 05:05:18 UTC
- requester: Justin Massion
- context: follow-up, in the same minute, to prompt 0011 (the portfolio `ALUZINA.pdf`, 37 pages, and the brochure `BROCHURE ALUZINA (1).pdf`, 19 pages). Prompt 0011 put the PDFs where the site serves them (`apps/hub/public/brand/aluzina-portfolio.pdf`, `aluzina-brochure.pdf`) and rendered every page into `docs/brand/<doc>/page-NN.jpg` with a machine-readable `index.json` per document. This prompt is read as **scope for the data model**: the Hub must hold the two documents, their pages and the projects they show as first-class rows, related to `projects`, `clients` and the playbook services, not as static files only. Model: Fable 5.1 (shared code: schema, seeds, entity registry).

## Prompt (verbatim)

Make sure that it's properly saved by project and relational in the proper way in the database

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
