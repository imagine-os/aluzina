# docs/knowledge/ - domain knowledge base

What we know about Aluzina as a business: who works there and what each person owns, programmes (competitions), rules, vocabulary, clients, suppliers, anything an agent or developer needs to build the right thing. This folder is the **canonical memory** for domain facts (P-11). Claude's channel memory and any chat summary hold **pointers** into this folder, never the facts themselves; when they disagree, the repo wins.

Engineering knowledge lives elsewhere: decisions in `../decisions.md`, plan in `../build-plan.md`, principles in `../platform-principles.md`, machine surfaces in `../reference/surfaces.md`.

## Entry convention (explicit change tracking)

Every entry, whether a whole file or a `##` section, carries a header block:

```
status: current | superseded | draft
since: YYYY-MM-DD
source: <Slack thread / date / requester, or document name>
supersedes: <file#section or entry id>   (only when it replaces an older entry)
```

- `current` is the rule in force. `draft` is captured but not yet confirmed by the owner or Justin. `superseded` is history.
- `reference` (D-087, `market/`) is third-party material kept for market intelligence and validation: it never becomes `current` because it states no Aluzina rule; a newer capture of the same source supersedes it in the usual way.
- **Superseded entries are never deleted.** They get `status: superseded`, a `superseded-by:` pointer to the entry that replaced them, and stay in place so an outdated rule is never mistaken for a current one and the history stays readable.
- Every file ends with a `## Change log` section: one dated line per change (`- YYYY-MM-DD: what changed (source)`), append-only.
- Facts are written the way the source stated them; when we paraphrase, the source is still named. Names stay as given by the founder (first names for the team, full name for the founder).
- Things we do not know yet are written as `_unknown_` placeholders, not guessed.

## Files

| File | What it holds |
| --- | --- |
| `team.md` | The Aluzina team: roles and responsibilities as written by the founder. |
| `competitions.md` | The 2027 competitions programme (20 entries, three projects). |
| `roles-and-portals.md` | Map from each role to its portal, path, page-code prefix, demo user and permission strings (mirrors `apps/hub/src/auth/`). |
| `tools-in-use.md` | The tools the team runs on today (Asana, Slack, ChatGPT, Lovart, Magnific, Lovable, Claude Design; Supabase / Stripe planned) and what replaces each. |
| `taxonomy.md` | Justin's Slack sidebar transcribed, its mapping to Spaces, and the rule that the Hub is the organizing mechanism (Slack stays for chat). |
| `deliverables.md` | Catalog of deliverable types per phase with owner and template status (data on K-05). |
| `clients.md` | Past clients from Slack (Hoy, Sporti) and current / prospect clients derived from projects; unknowns explicit. |
| `public-sites.md` | The two public websites (aluzinaa.com: Lovable React SPA, 18 pages; direccion.aluzinaa.com: one static page on Vercel), their pages, CTAs, contact data, fonts and palette, where the source lives, and how Lovable's GitHub sync works. Evidence in `../source/aluzinaa-archive/`. |
| `social-channels.md` | Aluzina's public social presence (Instagram handle unresolved: `aluzina.espacios` vs `@aluzinaa`), other public pages, the 2026-09-21 homepage snapshot (luminaires, process, stats); `draft` until the founder confirms. |
| `service-playbook.md` | Full transcription of the founder's Service Delivery Playbook v1.0: five services with every phase / stage and item, client journey, lead intake and qualification, service ladder, governance rules, roles, operational assets, the 15-status pipeline and the KPI layer (mirrored as data in `apps/hub/src/domain/playbook.ts`, D-033). |
| `brand.md` | Two parts. **A** (brand manual, prompts 0010 / 0014, changelogs 0014 / 0015): identity, logo / monogram, color, gradients, typography, graphic elements, metal finish and dark mode, silver edition (2026-09-21) with the gold edition kept as superseded entries, the manual's export defects, plus the gaps the manual does not define. **B** (marketing material, prompts 0011 / 0013, changelog 0013): brand voice and taglines, credentials (8 years, 50+ projects, 16.743 m²), services as marketed, the 13 projects the portfolio shows and the 20 the brochure names (stable slugs, now `projects` / `assets` rows), visual identity as printed, contact channels, the six mismatches against `service-playbook.md`, and the unknowns. Source PDFs in `../source/brand-kit/` and `../source/brand/`; page-by-page **visual memory** in `../brand/README.md`. |

| `asana-conventions.md` | How the founder runs projects in Asana today (six exports 2026-09-21): sections, hand-numbered task trees, the notes-as-database habit, the standard workflow phase by phase in Spanish and English, PROYECTO HOY vs both templates, the vendor-job form on the portfolio board, where Dropbox / Drive / Excel / Canva / WhatsApp sit, and the OS data-model and document-generation implications. De-identified CSVs in `../source/asana/2026-09-21/`. |
| `market/minntoring-webinar-2025.md` | **Market reference** (status `reference`, D-087, changelog 0024): the 54-slide Minntoring sales-webinar deck Aleja Guerra received for a ~USD 10k mentoring programme (June 2025), summarised with its "3 pillars" quoted in Spanish; a bullet-by-bullet validation checklist against `service-playbook.md` (14 answered, 11 partial, 6 gap); the three gaps (niche / value offer, client acquisition beyond word of mouth, automation) as backlog candidates; the pressure tactics not to copy. PDF not committed (third-party, D-068); original in the Slack thread. |
| `archive.md` | The Dropbox project archive (four share links, prompt 0017, changelog 0019): 187 project folders per year folder with inferred type / status, files and subfolders, naming conventions per year, duplicates across years, empty and container folders, the featured project JOE GALLINA INTERIOR's redacted folder tree and delivery order, known vs inferred. Machine twin: `../archive/index.json`. |

Planned: `suppliers.md`, `vocabulary.md` (EN / ES terms used in the studio). Open in `brand.md`: which brand era is current (portfolio *Universo de Diseño* vs brochure *Interiorismo · Iluminación*) is the founder's call.

## How this gets used

- Agents read this folder before building any role-specific surface and cite the entry (`knowledge/team.md#miguel`) in specs and page docs.
- The in-app docs viewer (`/#/docs`, build plan step 5) renders these files; until then GitHub is the reader.
- New information from Slack lands here **in the same turn** it arrives (prompt logged verbatim in `../prompts/`, entry added or superseded here, change log line appended).

## Change log

- 2026-09-20: folder created with the entry convention, `team.md`, `competitions.md`, `roles-and-portals.md` (Slack #aluzina thread 2026-09-20, Justin Massion; prompt 0002, D-012).
- 2026-09-21: `roles-and-portals.md` aligned with the shipped role model (changelog 0006).
- 2026-09-21: `taxonomy.md`, `deliverables.md`, `clients.md` added; `tools-in-use.md` and `roles-and-portals.md` extended (Slack sidebar, prompt 0005, changelog 0009, D-027..D-029).
- 2026-09-21: `tools-in-use.md` added (Asana: List, Timeline, Board; prompt 0004, changelog 0008); `roles-and-portals.md` gains `tasks.own.write` for studio and brand and the Work pages W-01 / W-02 on every portal.
- 2026-09-21: `public-sites.md` added (aluzinaa.com, direccion.aluzinaa.com, Lovable GitHub sync; Slack #website-scraping, prompt 0007, changelog 0011, D-031).
- 2026-09-21: `social-channels.md` added as `draft` after the first #social-scraping intake (Slack #social-scraping 2026-09-21, Justin Massion; prompt 0008, changelog 0012, D-032).
- 2026-09-21: `service-playbook.md` added from the PDF Justin shared (ALUZINA Operating System – Service Delivery Playbook v1.0, Alejandra Guerra; prompt 0009, changelog 0013, D-033); `roles-and-portals.md` gains the pass 0013 permissions; `deliverables.md` points at the playbook's status architecture.
- 2026-09-21: `brand.md` part A added from the ALUZINA brand manual (Slack #aluzina-brand-kit, Justin Massion; prompt 0010, changelog 0014).
- 2026-09-21: `brand.md` part B added from the two marketing PDFs Justin shared (portfolio `ALUZINA.pdf` 37 pp., brochure `BROCHURE ALUZINA (1).pdf` 19 pp.; prompt 0011, changelog 0013; model Opus 5), with the page-by-page visual memory in `../brand/`; `clients.md` gains the 20 clients named on brochure p. 2 and the 13 projects the portfolio shows, appended as a new sourced section (nothing deleted or superseded). Two entries are put in question but **not** changed: `public-sites.md` (the portfolio prints `aluzina.co`, not `aluzinaa.com`) and `social-channels.md` (both PDFs print Instagram `@aluzinaa`, and `@aluzinaaespacio` is Facebook) - recorded in `brand.md#contact-channels` for the founder to settle.
- 2026-09-21: `brand.md` gains "Portfolio projects as records" and `clients.md` an update in its marketing section (prompt 0013, changelog 0013; model Fable 5.1): the portfolio and brochure PDFs, their pages, the 13 portfolio projects and six clients are Hub rows (`assets`, `projects`, `clients`, `spaces`, `posts`, `relations`) seeded from `docs/brand/<doc>/index.json`; the placeholders for unknown dates, cities, clients and budgets are named there so nobody reads them as facts.
- 2026-09-21: `brand.md` moved to the silver edition of the manual: gold entries superseded in place, silver entries and an export-defects section added (Slack #aluzina-brand-kit, Justin Massion; prompt 0014, changelog 0015, D-050..D-052).
- 2026-09-21: `asana-conventions.md` added from six Asana CSV exports (Slack #import-asana, Justin Massion; prompt 0015, changelog 0017, D-054); `tools-in-use.md` Asana entry extended, `clients.md` gains the Sep-Dec 2026 active-jobs note, `deliverables.md` gains a pointer.
- 2026-09-21: `archive.md` added from the Dropbox project-archive crawls (Slack #past-projects, Justin Massion; prompt 0017, changelog 0019, D-055..D-061); `clients.md` gains the archive-match row.
- 2026-09-22: `market/` folder created with `minntoring-webinar-2025.md` as the first `reference` entry (Slack #all-aluzina, Justin Massion forwarding Aleja Guerra's deck; prompt 0022, changelog 0024, D-087; model Fable 5.1); the `reference` status added to the entry convention.
