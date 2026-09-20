# ALUZINA Business OS — Plan Document Set

This plan is a bound set of seven documents. On approval, each becomes a separate file in the app's Documentation module (seeded, versioned, changelogged) and a copy is exported to your documents folder. Doc 1 is the original Phase 1 plan; Docs 2–7 expand it to cover every output the SELAV diagnostic demands and the ongoing system that keeps the strategy running.

```text
Doc 1  Phase 1 Foundation (original plan)
Doc 2  Deliverable Map — PDF finding → deliverable → station → routine
Doc 3  Stations & Procedures — inputs, steps, outputs, AI assists, QC
Doc 4  Build Stages 0–9 — what ships when, tracked in the in-app Kanban
Doc 5  Architecture & Data — platform, tables, AI, agent surface
Doc 6  Input Gathering & Brand Memory — how the system asks, remembers, generates
Doc 7  Documentation, Changelog & Operations Manual — the rules of the system
```

---

## Doc 1 — Phase 1 Foundation (original plan)

Goal: the foundation you chose — workspace shell + navigation, project management with multiple views, docs / changelog / design system — seeded with the ALUZINA diagnostic and with this build roadmap as the first project. Bilingual ES/EN. Public marketing home at `/`.

Deliverables:
1. Public marketing home using the 3 Seedance loops and 3 transition videos (Social Media → Portfolio → Content Production → Email Campaign) as scroll/click transitions; marble-and-brass visual language from your artwork.
2. Auth (email + Google), Slack-style workspace rail, brand tree (brand → sub-brand → sub-sub-brand, unlimited depth). Sample workspace "ALUZINA" pre-seeded; blank workspaces creatable.
3. Navigation: icon rail + nested collapsible sidebar + top mega menu + Cmd+K palette that searches everything by tag.
4. Universal tagging: one tag system shared by tasks, docs, media, components, procedures; hierarchical tags; filter/sort/group anywhere.
5. Project Management: Projects → Goals → Objectives → Tasks/Subtasks, Procedures, Routines. Views: Kanban, Table (sort/filter/group/hide/saved views), Calendar, Timeline, Graph. Realtime presence and updates; comments; activity log.
6. Docs, Changelog, Glossary, Walkthrough registry, Design System catalog (atomic → molecule → organism, live examples, props, usage tags). Automatic changelog: Done tasks and build steps write entries with screenshots.
7. Brand Intake wizard (identity, voice, territories, audiences, channels, funnel) with provided / missing / generate states; PDF data pre-fills ALUZINA.
8. Media library (DAM v1): upload, tag, filter, grid/table, usage tracking.
9. Agent surface v1: public JSON API with API keys + OpenAPI; MCP and voice designed for, built later.

Seeded ALUZINA content (from the PDF): brand profile and socials; voice (tone, lexicon, openers, closers, fillers); 4 territories; thesis, guiding concept "El espacio programa", value proposition, Schwartz level 2; funnel checklist with bad/warn/na; 3 strategic paths → goals, 9 actions → objectives; 5 essential adjustments → tasks; friction map; series "El error que abrió el camino"; formats; function coverage; piece backlog; scores and punto de quiebre. Plus project "Build ALUZINA Business OS" containing this plan.

Build order: Cloud + schema + seed + tokens + i18n → auth/nav/tags → PM views + realtime → Docs/Changelog/Design System → Intake + Media → Home + API → QA and screenshots into the roadmap.

---

## Doc 2 — Deliverable Map

Every PDF finding becomes a deliverable, a procedure that produces it, and a routine that keeps it alive. Function codes: E educar, D demostrar, I inspirar, C conectar, P provocar, T entretener.

| # | PDF finding | Deliverable | Station | Routine |
|---|---|---|---|---|
| D01 | Brand model "híbrida apalancada"; person vs studio undefined | Signature Rule doc per channel; handle/banner alignment tasks (YouTube @aleja_guerra vs ALUZINA banner; LinkedIn services vs #OpenToWork) | Brand Identity | Quarterly surface audit |
| D02 | Observed voice | Voice Bible + machine-readable voice profile; brand dictionary for spell-check; banned/greeting patterns | Voice & Language | Learns from each approved piece |
| D03 | Territories, concept, thesis, value prop | Positioning Kit (one-pager PDF, territory cards, messaging house) | Strategy | Quarterly review |
| D04 | Specialty invisible | Specialty Declaration applied to bios, banners, site hero, pinned posts, email signature | Surfaces | Monthly audit |
| D05 | Bio link → 2021 video | Link-in-bio page built in-app with single CTA + WhatsApp; bio copy | Surfaces / Technical | Weekly link check |
| D06 | Three CTA labels | One CTA name + promise, applied everywhere; CTA registry | Surfaces | On every new piece (QC) |
| D07 | No booking tool | Booking setup (calendar link) + WhatsApp entry; consultation intake form | Technical Hub | Weekly health check |
| D08 | No GA4/GTM/Pixel; no attribution | Measurement install guide, UTM scheme, verification evidence, lead-source logging | Technical Hub | Weekly health check |
| D09 | Canonical domain mismatch | Domain decision, redirect map, search-console checklist | Technical Hub | Monthly |
| D10 | Form asks Spanish phone format | Form fix task with verification | Technical Hub | One-off |
| D11 | Portfolio without case files | Case File generator and public case pages (type, ask, decisions, change, CTA) | Proof & Cases | One per delivered project |
| D12 | Unpublished consultorios testimonial | Proof Library with permission workflow; testimonial → pieces | Proof & Cases | Ask after every handover |
| D13 | Path "Obra por dentro" (recommended) | Goal with 3 objectives (consultorios case, one light decision, error series) | Project Mgmt | Weekly review |
| D14 | Path "Postura de oficio" | Goal with 3 objectives (diseñar vs decorar, el espacio programa, decisión → negocio) | Project Mgmt | Weekly review |
| D15 | Path "Audiencias aliadas" | Goal with 3 objectives (lives, taller/oficios, operator interview) | Project Mgmt + Allies | Weekly review |
| D16 | Series "El error que abrió el camino" | Series template: fixed name, cover plate, spoken opener, open-loop closer, CTA; episode backlog | Content Production | Weekly episode |
| D17 | 5 suggested formats | Format templates (talking-head hook, before/after case, headline-first carousel, behind-the-scenes, live conversation) | Content Production | — |
| D18 | Piece backlog by function/priority | Briefs pre-created with function, territory, format, hook, priority | Content Production | Weekly batch |
| D19 | Hooks live on TikTok/LinkedIn, not Instagram | Hook Library with channel-transfer tasks | Content Production | — |
| D20 | Carousels open with client logo; captions carry the argument | Carousel rule: slide 1 = headline; QC check | Editorial QC | Every piece |
| D21 | Greetings, decorative audio, self-closing pieces, spelling | 5-stage QC gate: hook, structure, decision/why, audio mix, spell-check | Editorial QC | Every piece |
| D22 | Function coverage gaps (C, T absent; D partial) | Coverage dashboard; calendar balancing rule | Calendar & Measurement | Weekly |
| D23 | Live sessions and operator interviews | Allies CRM: accounts, outreach sequences, live runbook, guest pipeline | Allies | 2 outreaches/week |
| D24 | Not-to-do list (titles, client material) | Compliance rules enforced in QC and asset consent | Editorial QC | Every piece |
| D25 | Dimension scores; punto de quiebre "recorrido"; bottleneck visibility | Living Scorecard, monthly re-score, "what worked" digest | Measurement | Monthly |
| D26 | YouTube mixes three lines | Channel architecture decision doc + playlist/branding tasks | Brand Identity | One-off |

---

## Doc 3 — Stations & Procedures

Common skeleton for every station: Readiness panel (inputs: provided / missing / generate) → guided steps with AI assist → outputs saved as tagged records/assets → approval → routine. Outputs from earlier stations are auto-injected as context into later ones.

1. Brand Setup — Inputs: name, tree position, logo, fonts, colors, channels, team, language. Steps: create node, inherit or override tokens, connect channels. Outputs: Brand Card, token set. AI: provisional logo/palette/font suggestion. QC: contrast and completeness.
2. Diagnostic Import — Inputs: SELAV PDF/JSON or questionnaire. Steps: parse, map to records, human confirm. Outputs: strategy, voice, funnel, backlog, scorecard. AI: extraction and mapping. Routine: re-import and diff.
3. Strategy — Inputs: diagnostic. Steps: confirm territories, concept, thesis, value prop; convert paths to goals. Outputs: Positioning Kit (D03), goals (D13–D15). Routine: quarterly.
4. Voice & Language — Inputs: transcripts, captions, diagnostic voice section. Steps: build Voice Bible, lexicon, banned list, dictionary; calibrate voice-match scorer with samples. Outputs: D02. AI: style extraction, scoring. Routine: learn from approvals.
5. Brand Design System — Inputs: logo, fonts, colors. Steps: brand book, cover plates, carousel/thumbnail/lower-third templates. Outputs: template library. AI: template drafts. Routine: version bumps propagate to sub-brands.
6. Surfaces — Inputs: specialty, CTA, voice, templates. Steps: write bios/banners/pinned posts, publish link-in-bio page, apply Signature Rule. Outputs: D01, D04, D05, D06, D26. AI: copy in voice. Routine: monthly audit.
7. Technical Hub — Inputs: domain, site access, analytics accounts, booking tool. Steps per item (D07–D10): how-to, do, verify (URL checks where possible), attach evidence. Outputs: funnel checklist green. Routine: weekly health check.
8. Proof & Cases — Inputs: project photos, client interview answers, consent. Steps: consent request → interview form → AI case draft → before/after selection → case page → social variants. Outputs: D11, D12. Routine: one per delivered project.
9. Content Production — Inputs: briefs, voice, templates, hooks, shot lists. Steps: brief → script/carousel/caption → assets → QC → schedule. Series manager with episode numbering, opener/closer enforcement. Outputs: D16–D19. AI: scripts, carousels, captions, shot lists, transcription of raw footage into candidate hooks. Routine: weekly batch.
10. Editorial QC — Stages: (1) hook: no greeting, conflict+stakes+promise; (2) structure: slide-1 headline, length; (3) decision/why: what/why/outcome present; (4) audio: voice primary, music support; (5) spelling/dictionary. Automated checks + reviewer. Blocks scheduling. Outputs: D20, D21, D24.
11. Calendar & Distribution — Inputs: approved pieces, channel settings. Steps: place by function/territory balance, publish checklist, export or native publish. Outputs: D22. Routine: weekly plan.
12. Allies & CRM — Inputs: niche accounts list, outreach templates. Steps: research → sequence → live runbook → guest interview → follow-up; inbound leads from CTA/WhatsApp/forms with source. Outputs: D23. Routine: 2 outreaches/week.
13. Measurement & Scorecard — Inputs: metrics (manual/CSV first, APIs later), lead sources. Steps: coverage, funnel status, re-score 6 dimensions, digest. Outputs: D25. Routine: monthly report.
14. Operations Manual & Docs — every procedure above is a living doc; see Doc 7.

---

## Doc 4 — Build Stages

Each stage is a project in the in-app Kanban ("Build ALUZINA Business OS"); each step is a task that I move, screenshot, test, and changelog as I build.

- Stage 0 Foundation — everything in Doc 1. Exit: ALUZINA workspace fully seeded; roadmap visible in Kanban; docs and changelog live; API v1 documented.
- Stage 1 Strategy → Surfaces — Stations 3, 4, 6; Positioning Kit export; link-in-bio page; Signature Rule; Specialty Declaration. Exit: D01–D06, D26 produced for ALUZINA.
- Stage 2 Technical Hub — Station 7 with verifiers, UTM builder, evidence capture, weekly routine. Exit: D07–D10 tracked with evidence.
- Stage 3 Proof & Cases — Station 8; consent workflow; case pages; social variants. Exit: consultorios case published (D11, D12).
- Stage 4 Content Engine + QC — Stations 5, 9, 10; generators, series manager, hook/closer libraries, shot lists, 5-stage QC. Exit: first 4 episodes of the series through QC (D16–D21, D24).
- Stage 5 Calendar & Distribution — Station 11; balancing rules; publish checklists; connectors where available. Exit: 4-week calendar live (D22).
- Stage 6 Allies CRM + Inbound — Station 12; sequences; live runbook; lead capture with source. Exit: 10 niche accounts in pipeline (D23).
- Stage 7 Measurement & Scorecard — Station 13; imports; coverage; monthly re-score; digest feeding Voice and Content. Exit: first monthly scorecard (D25).
- Stage 8 Agents & Voice — MCP server, CLI, webhooks, voice command layer, unattended routines (weekly draft batch, health checks, reports).
- Stage 9 Canvas & Scale — Miro/Figma-style canvas linking all objects, cross-brand graph, inheritance UI, "new brand from playbook" templates.

---

## Doc 5 — Architecture & Data

- Stack: TanStack Start + React 19 + Tailwind v4; Lovable Cloud (Postgres, auth, storage, realtime); Lovable AI for text, image analysis, transcription, image generation; shadcn with a registered component catalog.
- Tables (all with GRANTs + RLS scoped to workspace membership; roles in a separate table with security-definer check): workspaces, workspace_members, user_roles, brands (parent_id), brand_profiles, brand_tokens, tags, taggables, projects, goals, objectives, tasks, procedures, procedure_steps, routines, routine_runs, run_evidence, views, comments, activity_log, changelog_entries, docs, doc_revisions, glossary_terms, walkthroughs, components_catalog, media_assets, media_usages, consents, cases, testimonials, series, briefs, content_pieces, piece_versions, hooks, qc_reviews, qc_checks, channels, calendar_slots, accounts, contacts, sequences, sequence_steps, leads, metrics, scorecards, ai_generations, api_keys, webhooks, relations.
- Views: TanStack Table; dnd-kit Kanban; custom calendar; React Flow for graph and canvas.
- Realtime: Postgres changes + presence channels; optimistic updates via TanStack Query.
- AI layer: server-only calls with brand memory injected; every generation logged (inputs, model, output link, cost); QC checks as structured outputs; error states surfaced.
- Media: Lovable Assets CDN for videos/artwork; storage buckets for user uploads; consent status on assets.
- Agent surface: `/api/public/v1/*` with API keys, OpenAPI JSON, webhooks; MCP server reusing the same handlers; CLI wrapper; voice layer maps intents to the same actions.
- i18n: ES/EN dictionaries; seeded content bilingual where authored, Spanish where quoted.
- Design tokens (oklch in `src/styles.css`): warm marble neutrals, brass accent, pastel module colors matching your artwork (cyan Admin, lime PM, pink Language, mint Design, lilac Architecture, gold Marketing).

---

## Doc 6 — Input Gathering & Brand Memory

- Readiness panels list required inputs per station with three actions for anything missing: Upload, Answer questions, Generate provisional (flagged).
- Provisional items appear in a Replace-me list; replacing one re-runs dependents (new logo → cover plates; new CTA → surfaces and QC rule).
- Brand memory: facts, decisions, approved outputs stored as structured records and injected into every AI call for that brand; nothing is asked twice; sub-brands inherit and can override.
- Ask order for a new brand: identity → channels → diagnostic → voice → assets → surfaces → technical → proof → content.
- For ALUZINA right after approval: logo, fonts, colors, then site/analytics access details when Stage 2 starts, then project photos and client contacts for Stage 3.

---

## Doc 7 — Documentation, Changelog & Operations Manual

- Three audiences (Users, Company developers, External developers) with separate navigation and shared glossary.
- Rules: every Done task writes a changelog entry; every release bumps a version with grouped entries; every new component is registered in the catalog; every procedure has a walkthrough page; every AI-generated deliverable links its generation record.
- Operations Manual = the 14 stations as procedures with steps, roles, cadence, and evidence requirements; it is the same data the routines engine runs.
- Build logging: each implementation step ends with a changelog entry, a Playwright screenshot attached to the roadmap task, and recorded tests.
- Export: docs exportable as Markdown/PDF; this plan set is the first seven docs.

---

Stage 0 starts on approval; first request to you will be the ALUZINA logo, fonts, and colors.
