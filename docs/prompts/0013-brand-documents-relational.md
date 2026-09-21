# 0013 - Brand documents saved by project and relational in the database

- source: Slack #all-aluzina (C0C2Y9Y8PEH), ts 1789967118.190729
- date: 2026-09-21 05:05:18 UTC
- requester: Justin Massion
- context: follow-up, in the same minute, to prompt 0011 (the portfolio `ALUZINA.pdf`, 37 pages, and the brochure `BROCHURE ALUZINA (1).pdf`, 19 pages). Prompt 0011 put the PDFs where the site serves them (`apps/hub/public/brand/aluzina-portfolio.pdf`, `aluzina-brochure.pdf`) and rendered every page into `docs/brand/<doc>/page-NN.jpg` with a machine-readable `index.json` per document. This prompt is read as **scope for the data model**: the Hub must hold the two documents, their pages and the projects they show as first-class rows, related to `projects`, `clients` and the playbook services, not as static files only. Model: Fable 5.1 (shared code: schema, seeds, entity registry).

## Prompt (verbatim)

Make sure that it's properly saved by project and relational in the proper way in the database

## Response

Reply posted to the Slack thread (verbatim):

> The whole Hub bundle is live at https://imagine-os.github.io/aluzina/ (changelog 0013, version 0.10.0). Worth opening first: the PM viewer with the plan as Kanban, list and dependency swimlane at https://imagine-os.github.io/aluzina/?as=dev#/dev/plan; the graph in 3D and the four gallery views at https://imagine-os.github.io/aluzina/?as=founder#/founder/spaces/graph; the public site with the services ladder and the intake flow at #/services and #/start (it writes a real lead); the client app at ?as=client#/client; the operations manual rendered from the playbook at ?as=ops#/manual; the CRM at ?as=founder#/founder/leads with the pipeline on the fifteen playbook statuses; and the portfolio and brochure at #/portfolio and ?as=brand#/brand/documents, viewable and downloadable, every page saved as a record related to its projects, clients and services. 113 routes, 875 declared actions, all on the actions bus. Fable 5.1 did the architecture, foundation, relational data and integration; Opus 5 built the modules; Sonnet 5 does the screenshots and the Spanish pass next. Two questions: the portfolio (Universo de Diseño) and the brochure (Interiorismo · Iluminación) are two brand eras and neither matches the playbook's services, so which is current, and is the product line Honey Valley? And should the public site join the OS at #/services, or stay on Lovable? Numbering: this pass is changelog 0013, prompts 0011 to 0013, decisions D-044 to D-049 and D-053, next to the brand-kit session's 0014 and 0015.

See changelog 0013.
