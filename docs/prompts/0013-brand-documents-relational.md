# 0013 - Brand documents saved by project and relational in the database

- source: Slack #all-aluzina (C0C2Y9Y8PEH), ts 1789967118.190729
- date: 2026-09-21 05:05:18 UTC
- requester: Justin Massion
- context: follow-up, in the same minute, to prompt 0011 (the portfolio `ALUZINA.pdf`, 37 pages, and the brochure `BROCHURE ALUZINA (1).pdf`, 19 pages). Prompt 0011 put the PDFs where the site serves them (`apps/hub/public/brand/aluzina-portfolio.pdf`, `aluzina-brochure.pdf`) and rendered every page into `docs/brand/<doc>/page-NN.jpg` with a machine-readable `index.json` per document. This prompt is read as **scope for the data model**: the Hub must hold the two documents, their pages and the projects they show as first-class rows, related to `projects`, `clients` and the playbook services, not as static files only. Model: Fable 5.1 (shared code: schema, seeds, entity registry).

## Prompt (verbatim)

Make sure that it's properly saved by project and relational in the proper way in the database

## Response

Reply pending; see changelog 0013.
