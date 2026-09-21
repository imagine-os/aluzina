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

Planned: `suppliers.md`, `vocabulary.md` (EN / ES terms used in the studio), `brand.md` (identity rules once Angelica's assets are shared).

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
