# Minntoring sales webinar (June 2025) - market reference

```
status: reference (third-party material; not an Aluzina rule, never `current`)
since: 2026-09-22
source: "Cómo transformar tu estudio de arquitectura en una empresa escalable y rentable", 54-slide Google Slides export (PDF, 5.5 MB), Minntoring, June 2025; presenters Ignacio Otero (co-founder of Altyva, COVA, Aptuno and Minntoring) and Manuela de Matos (co-founder of Minn and Minntoring)
received: 2026-09-21 22:52 UTC, Slack #all-aluzina thread ts 1790031156.008359, Justin Massion forwarding what Aleja Guerra (founder) received as the opening material of a roughly USD 10k mentoring programme; she took the strategy call and did not enrol (prompt 0022)
filed: 2026-09-22 (changelog 0024, D-087); model Fable 5.1
original: the PDF stays in the Slack thread (file "Minntoring DSL - Exclusive content only for premium studios (1).pdf"); it is not committed to the repo and never served by the hub (D-068, D-087)
```

Third-party copyrighted material read as **market intelligence**: how architecture and interior-design studios like Aluzina are sold to, and which of their problems a coaching company thinks are worth USD 10k to solve. Nothing in this file is an Aluzina decision; the rules in force are in `../service-playbook.md`. Spanish is quoted where the wording itself is the evidence; everything else is summarised in English.

## 1. What it is

A sales-webinar funnel, not a method. Fifty-four slides, several of them repeated verbatim as builds. **No pricing, no process detail, nothing proprietary**: the "3 pillars" are named and each gets one problem slide and one solution slide of bullets, and the programme is described in three words. Structure, in slide order:

| Slides | Section | Content |
| --- | --- | --- |
| 1-5 | Welcome and hook | Title; "¿Por qué hay estudios que crecen fácilmente y otros que no?"; the promise of a studio "que no dependa de ti y que funcione como una máquina"; "para los que se queden hasta el final les tenemos una sorpresa!!". |
| 3 | Common problems | Five bullets: "Falta de tiempo", "Desorden en la gestión", "No saben cómo delegar", "Ingresos inestables", "Dependen del voz a voz (boca a boca)". |
| 6-18 | Founders' story | Who they are; "combinamos los dos mundos: Arquitectura Tradicional / Emprendimiento tecnológico"; "Nosotros nos negamos a pensar que los arquitectos sean los más cascados, es decir los que menos ganan y los que más trabajan"; from designing 19 spaces in 2018 to nearly 200 in 2023 "gracias a que todos los procesos están definidos y estandarizados"; the team collapsed at more than 8 simultaneous projects and now runs 30 "funcionando como un equipo de nado sincronizado"; founders 100% remote, 60% of their time freed for "labores que realmente tengan impacto". |
| 19-24 | Testimonials (3) and reach | RIUX (Dominican Republic): overwhelmed, no control of the agenda; solution time management and limits. H Arquitectura (Paraguay): could not delegate or grow; solution define roles and hire key people. Metier Studio (Argentina): "Vivían apagando incendios"; solution "Estandarizar absolutamente cada proceso, implementar Pipefy y operar un equipo de líderes". Then "más de 500 arquitectos de 19 países" and the disclaimer that results "siempre va a depender de ti". |
| 25-40 | The 3 pillars | "Los 3 Pilares del método Minntoring": **1 Claridad y Enfoque**, **2 Arquitectura de Procesos**, **3 Escalabilidad y crecimiento**. Each has a tagline, a "Problema:" slide and a "Solución:" slide (every bullet is mapped in section 3 below). |
| 41-43 | Myths | "Muchos arquitectos piensan que...": "Trabajar más horas es la solución", "Los clientes llegan solos con el boca a boca", "Solo yo puedo hacer el trabajo bien", "La arquitectura no se puede escalar", "La arquitectura no se puede estandarizar ni automatizar"; then "¿Cuál de estos errores has cometido?". |
| 44-47 | Programme format | "¿Cómo funciona el nuevo método Minntoring?": 1 "Contenido práctico y aplicable", 2 "Comunidad exclusiva de empresarios", 3 "Acompañamiento personalizado". That is the whole description of the product. |
| 48-51 | The close | "Si sigues haciendo lo mismo, obtendrás los mismos resultados."; "Luego del método Minntoring obtendrás" (results slide, text not in the export); "Hay dos opciones: 1. Tomas acción ahora, y en el peor de los casos aprendes una nueva opción y regresas al punto en el que estás. 2. O no tomas ningún tipo de acción y simplemente cruzas tus dedos esperando que las cosas cambien haciendo más de lo mismo." |
| 52-54 | Call to action | "Si estás listo para asumir full responsabilidad sobre tu estudio y todo lo que estuvimos hablando resonó contigo, tienes el botón para agendar una llamada estrategia con nosotros. Agenda Directa"; a closing quote about regret. |

What the deck does **not** contain: any price, any contract term, the content of the programme, the templates or tools beyond the one mention of Pipefy, any figure that can be checked. The "19 spaces to nearly 200" and "500+ architects from 19 countries" claims are the presenters' own and are recorded here as claims.

## 2. Why it matters to Aluzina

- **Competitive and market intelligence.** This is what a studio like Aluzina is pitched when it looks for help growing: a diagnosis of founder-dependence and disorder, a promise of standardisation, and a high-ticket coaching programme. Aluzina already owns the artefact the programme sells (its Service Delivery Playbook v1.0, `../service-playbook.md`, D-033) and is building the system that runs it (the Hub). The deck confirms the market values exactly that.
- **A free validation checklist.** The problems it names are, almost bullet for bullet, what the Aluzina Operating System is built to solve. Section 3 maps every bullet to where the playbook and the product already answer it, and section 4 names the three places where they are thin. Nothing in the deck contradicts the playbook.
- **A reminder of the register to avoid.** The funnel's pressure mechanics are the opposite of the playbook's business logic (section 5).

## 3. Validation checklist: the three pillars against the playbook

Every problem and solution bullet from the deck's six problem / solution slides, in the deck's order and wording. "Answered" means the playbook has a rule, stage or asset for it and the product implements it; "partial" means the playbook names it but leaves the detail to the "next build" (`../service-playbook.md#06-next-layer-internal-sop-by-role`, "Not yet known"); "gap" means neither the playbook nor the product addresses it. References are to `docs/knowledge/` files and to the typed mirror `apps/hub/src/domain/playbook.ts`; page codes are the hub's (`../../README.md`).

### Pillar 1 - "Claridad y Enfoque"

Tagline: "Cambia la forma en que ves tu negocio, organiza tus prioridades y enfócate en lo que importa. Avanza estratégicamente y recupera el control."

| # | Minntoring bullet (verbatim) | Where Aluzina answers it | Status |
| --- | --- | --- | --- |
| P1 | Problema: "Operar en modo supervivencia, apagando incendios todo el tiempo." | Every project sits on one of the 15 pipeline statuses (`../service-playbook.md#suggested-status-architecture-15`, `PIPELINE_STATUSES`, page A-03), so the state of the studio is visible instead of felt. Alert generation from payments, quotes, deliveries and deadlines is still a backlog card (`../../kanban.md`, "D-020 alert generation"). | partial |
| P2 | Problema: "Actuar de manera reactiva y desorganizada." | "One studio. One method. Different depths of service." and the 10-step client journey LEAD -> FOLLOW-UP (`../service-playbook.md#00-operating-logic`); every service has its stage list with items (sections 01, 02, 03, E, 04). | answered |
| P3 | Problema: "Incumplimiento de tiempos y operar contra reloj." | 03 stage 01 Onboarding issues the master schedule; KPIs `designCycleDays` and `scheduleVariance` (`../service-playbook.md#recommended-kpi-layer-10`). Durations per stage and per service are `_unknown_` ("Not yet known"); the Asana templates carry the founder's real sequence but no durations (`../asana-conventions.md`, D-062). | partial |
| P4 | Problema: "Hablarle a todo el mundo y pensar que el nicho es 'Vivienda' u 'Oficinas'." | The qualification asks the typology (residential, commercial, hospitality, wellness or other) to route the service (`../service-playbook.md#00-general-commercial-process`), and `../brand.md` records how the studio markets itself, but no document defines Aluzina's niche or who it does not serve. See section 4 (a). | gap |
| P5 | Problema: "Competir por precio y no por valor único." | The service promise of 03 ("We do not simply give ideas. We define the experience, space, light, materiality and visual language before the project is built.") and the ladder words CLARITY / DIRECTION / DEFINITION / MATERIALIZATION / SOUL (`#05-the-aluzina-service-ladder`) are a value position; prices, payment terms and a stated value offer are `_unknown_`. See section 4 (a). | partial |
| S1 | Solución: "Cambia tu Mindset para que cambie tu empresa." | Coaching, not a system concern. The playbook's own stance is its final principle: "The operating system exists so ALUZINA can grow without losing its creative intelligence." | n/a |
| S2 | Solución: "Gestiona tu tiempo y prioridades de manera efectiva." | One owner per project (G-01), roles and portals (`../roles-and-portals.md`), the Work module W-01 / W-02 with the founder's Asana structure imported (changelog 0020). Who does each stage is the "next build". | partial |
| S3 | Solución: "Deja de enfocarte en robatiempos y crea sistemas." | The Operating System itself and its 11 operational assets (`../service-playbook.md#operational-assets-11`: folder tree, naming convention, message templates, brief forms, checklists, revision matrix, approval forms, trackers, site report, handover checklist), each mapped to a product entity. | answered |
| S4 | Solución: "Crea hábitos de empresa y dale valor a tu tiempo." | The internal SOP by role ("who does it, which template, where stored, how named, how long, approval criterion, trigger") is named by the playbook as the recommended next build (`#06-next-layer-internal-sop-by-role`). | partial |
| S5 | Solución: "Define un nicho y una oferta de valor único." | Not defined anywhere in `docs/knowledge/`. See section 4 (a). | gap |
| S6 | Solución: "Obsesionate por generar valor y enfócate en la transformación que generas." | The commercial rule ("place the client in the right process", G-10) and the business logic of the ladder ("Each step must generate enough clarity to justify the next") are the value-first version of this. | answered |

### Pillar 2 - "Arquitectura de Procesos"

Tagline: "Diseña una estructura sólida para estandarizar y escalar tu operación."

| # | Minntoring bullet (verbatim) | Where Aluzina answers it | Status |
| --- | --- | --- | --- |
| P1 | Problema: "Cada persona del equipo hace las cosas a su manera." | "One studio. One method."; per-phase checklists (`engagements.checks`, page S-10); one bilingual project template `tpl-aluzina-workflow` from the founder's two Asana templates (W-03, D-062, `../asana-conventions.md`). | answered |
| P2 | Problema: "El equipo es dependiente del founder." | G-01 "Every project has one owner inside ALUZINA."; six playbook roles mapped onto the team (`#role-responsibilities-6-and-the-map-onto-teammd`, `../team.md`). The Project Manager role is `_unknown_` and stage-to-role assignment is the next build. | partial |
| P3 | Problema: "Más manos = Más incendios." | Roles with explicit permission strings per portal (`../roles-and-portals.md`, `apps/hub/src/auth/`), G-01, and governance gates enforced in the write path (A-03 refuses IN CONSTRUCTION without an approved package, G-06 / G-12). | answered |
| P4 | Problema: "Cada cliente es un universo completamente diferente." | "Every inquiry must enter a single traceable pipeline"; the 10 qualification questions and the routing onto five fixed services with fixed stages (`#00-general-commercial-process`; `routeService()` in `domain/playbook.ts` as a suggestion, the founder decides). | answered |
| P5 | Problema: "Ajustes y reprocesos fuera de control." | G-04 "Scope changes are documented before work continues.", G-05 "Design revisions are consolidated into a single revision matrix.", the E stage 8 change-control rule "Any request after approval becomes a CHANGE ORDER ... Do not execute unapproved changes." (G-14); pages S-11 revision matrix, O-11 change orders, C-03 client approvals; KPI `revisionRounds`. | answered |
| P6 | Problema: "Cuellos de botella que frenan el crecimiento." | Status groups lead / sale / design / build / close make the queue per stage visible (A-03); KPIs `daysLeadToContract`, `designCycleDays`. No alerting or capacity view yet (see Pillar 1 P1). | partial |
| S1 | Solución: "Pasa tus procesos de la mente al papel y crea la receta estándar de todos tus macroprocesos." | Done by the founder: the Service Delivery Playbook v1.0 (`../service-playbook.md`, `../../source/playbook/`), rendered as the operations manual M-01..M-08 and typed in `domain/playbook.ts`. | answered |
| S2 | Solución: "Define roles y crea una estructura de equipo que no sea dependiente de ti." | Roles (6) and portals exist; owner role per stage is the product's guess, marked as such in `../deliverables.md`, to be confirmed by the founder. | partial |
| S3 | Solución: "Estandariza tu servicio, tiempos y entregables." | Services standardised as stages 01 / 02 / 03 / E / 04 with items per stage and a "Final design delivery" list (`#03-comprehensive-interior-design` stage 19); deliverable types catalogued in `../deliverables.md` (K-05). **Times** are the missing third: no durations anywhere. | partial |
| S4 | Solución: "Define un paso a paso que incluya las normas de juego de tu servicio." | The 10-step client journey plus the nine mandatory governance rules G-01..G-09 (`#mandatory-governance-rules-9`) and the five rule-like principles G-10..G-14. | answered |
| S5 | Solución: "'Educa' a tu cliente y deja de decirle sí a todo." | 03 stage 10 "Collect all comments in one revision matrix; Avoid scattered design changes through WhatsApp"; the approval gate "Construction may begin only after the client approves the final design for execution"; change orders with cost, time and client approval; the commercial rule against overselling. | answered |
| S6 | Solución: "Capacita a tu equipo para que haga las cosas mejor que tu." | The operations manual (M-01..M-08) is the reference text; there is no onboarding or training path per role. | partial |

### Pillar 3 - "Escalabilidad y crecimiento"

Tagline: "Estructura tu negocio para transformar tu empresa en un sistema que crece y funciona sin depender de tu tiempo."

| # | Minntoring bullet (verbatim) | Where Aluzina answers it | Status |
| --- | --- | --- | --- |
| P1 | Problema: "Tener que estar encima de todo el equipo para que las cosas salgan bien." | G-03 "All client approvals are documented.", G-08 "Every site visit produces a written and photographic record." (O-13), G-07 purchases tracked from quotation to installation (O-12); the founder's approvals queue A-01 and pipeline A-03 replace supervision by presence. | answered |
| P2 | Problema: "Cómo founders tenemos tiempo finito y eso limita el crecimiento." | Same answer as Pillar 2 P2 / S2: ownership and roles exist, delegation per stage is the next build. | partial |
| P3 | Problema: "Falta de trazabilidad del estado de cada proyecto." | The 15-status architecture (`#suggested-status-architecture-15`: `leads.status` 1-4, `projects.pipelineStatus` 4-15), G-02 "Every project has one official folder and one source of truth.", validation statuses APPROVED / APPROVED WITH ADJUSTMENTS / REVISION on the single revision matrix. | answered |
| P4 | Problema: "Labores repetitivas que generan poco valor." | Partly what the Hub is (templates W-03, seeded catalogues, the Asana import); document generators (cotización, RFQ packet, progress slide, acta de entrega) are a backlog card. Nothing in the playbook. See section 4 (c). | gap |
| P5 | Problema: "Dependencia del voz a voz." | The playbook lists seven lead channels (Instagram, WhatsApp, Website, Referral, Email, Networking, Commercial partnership) and asks "How they found ALUZINA" on every lead, so dependence is measurable (A-08), but nothing says how leads are generated. See section 4 (b). | gap |
| S1 | Solución: "Sistematiza tus procesos para que hagan parte de tu día a día y del de tu equipo." | The Hub: the playbook as data driving checklists, gates, statuses and the manual, in the tool the team works in. | answered |
| S2 | Solución: "Delega con tranquilidad, cada persona sigue un paso a paso y existe trazabilidad de todo." | Stage checklists per engagement (S-10), the Work views with activity log (W-01 / W-02), statuses and documented approvals. | answered |
| S3 | Solución: "Automatiza labores repetitivas y usa la tecnología a tu favor." | See Pillar 3 P4 and section 4 (c). | gap |
| S4 | Solución: "Crear una estrategia de adquisición de clientes." | See Pillar 3 P5 and section 4 (b). | gap |

Tally: 32 bullets; 14 answered, 11 partial, 6 gap (three distinct gaps, each named twice by the deck: niche / value offer, client acquisition, automation), 1 n/a. The "partial" rows share one root: the playbook's own "next layer" (who does each stage, how long it takes, templates and triggers) is not written yet, which the founder already knows.

The Metier Studio testimonial ("Estandarizar absolutamente cada proceso, implementar Pipefy y operar un equipo de líderes") is the same thesis as the Aluzina OS: a standardised process running in a workflow tool. Aluzina's equivalent of Pipefy is the Hub itself, replacing the Asana + Slack + Drive + Excel + Canva + WhatsApp set recorded in `../tools-in-use.md` and `../asana-conventions.md`.

## 4. Gaps the deck names that the playbook is thin on (candidate backlog items, not decisions)

- **(a) Niche and unique value offer; compete on value, not price.** The playbook routes by typology and states a service promise, but no document says which clients Aluzina is for, which it declines, what its differentiator is in the market's words, or how it prices against it. `../brand.md` records two brand eras with different positioning (*Universo de Diseño* vs *Interiorismo · Iluminación*), which is itself the open question. Candidate: a founder session producing `knowledge/positioning.md` (niche, value offer, non-clients, pricing stance) and its reflection in the public site P-01 / P-02 copy. Kanban card added (changelog 0024).
- **(b) Client-acquisition strategy beyond word of mouth.** The commercial process starts at "Lead entry" and is complete from there (pipeline, lead record, qualification, routing, A-08, P-03 intake). Nothing covers how leads are generated: content, Instagram (`../social-channels.md` is still `draft`), partnerships, referral programme, the website's role. Candidate: an acquisition plan owned by the `marketing` role, with the "How they found ALUZINA" field and `leadToContractRate` as its measurement. Kanban card added (changelog 0024).
- **(c) Automation of repetitive tasks.** Partly what the Hub is; the concrete items are already in the backlog (document generators from the Asana workflow; alert generation; the Dropbox and Supabase connectors). No new card: the existing cards cover it, and this note is cited from them when they are picked up.

## 5. What Aluzina should not copy

The deck's persuasion mechanics conflict with the playbook and are recorded so nobody imports them into the public site, the intake or client messages:

- The **"two options" close** (act now or "cruzas tus dedos esperando que las cosas cambien haciendo más de lo mismo"), the **retention hook** ("para los que se queden hasta el final les tenemos una sorpresa"), and the **fatalist line** ("Si sigues haciendo lo mismo, obtendrás los mismos resultados") are pressure tactics.
- The playbook's business logic is explicit: "Each step must generate enough clarity to justify the next - **never pressure**." (`../service-playbook.md#05-the-aluzina-service-ladder`), and its commercial rule: "Never sell a small service when the diagnosis clearly shows that the client needs a deeper scope. The goal is not to oversell - it is to place the client in the right process." (`#00-general-commercial-process`, G-10).
- The unverifiable social proof (growth figures, "500+ architects") is the opposite of the studio's own credentials rule of stating checkable facts (8 years, 50+ projects, 16.743 m², `../brand.md`).

## 6. Handling

- Third-party copyrighted material. The **PDF is not committed** and is never placed under `apps/hub/public/`; the original lives in the Slack thread named in the header. This follows D-068 (third-party documents are indexed, never served) extended by D-087 to `docs/knowledge/market/`: the repo keeps the summary and short quotations needed to reason about the market, not the work itself.
- No personal contact details appear in the deck and none are recorded here. Presenters are named as they name themselves on slide 7; testimonial studios are named, the individuals are not.
- This file's status is `reference`: it can be superseded by a newer capture of the same source but never becomes `current`, because it states no Aluzina rule.

## Change log

- 2026-09-22: created from the Minntoring webinar deck Aleja Guerra received and Justin forwarded in #all-aluzina (prompt 0022, changelog 0024, D-087); model Fable 5.1.
