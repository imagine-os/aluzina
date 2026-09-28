# Design, Production & Installation Flow (ALUZINA, 2026-09-28)

```
status: current
since: 2026-09-28
source: "ALUZINA Design, Production & Installation Flow" (EN), 6-page PDF shared by Justin Massion in Slack #merge-repos 2026-09-28 (prompt 0024); file `../source/process/ALUZINA_Design_Production_Installation_Flow_EN.pdf`, renders `../brand/process-flow/`
supersedes: none
filed: 2026-09-28 (changelog 0031, D-099..D-102); model Fable 5.1
```

The studio's own operational chain, written to be automated: "Transform ALUZINA's real working process into a clear, measurable and automatable digital workflow, without replacing the studio's creative judgment." Tagline on the cover: "SPACE + LIGHT + EXPERIENCE". Subtitle: "Base system for automating interior spaces, furniture and lighting projects."

It complements the **Service Delivery Playbook v1.0** (`service-playbook.md`, D-033), which stays the canonical *service model* (five services, the 15-status pipeline, governance G-01..G-14). This document adds the *operational chain* per stage (input, owner, deliverable, status, approval), what the website should automate at each stage, three project lines and four approval rules. Where the two documents name the same thing differently, section 8 records the mapping, and the app keeps the playbook's 15 internal statuses with the flow's 11 statuses as a **derived client-facing view** (D-099). Wording below is the document's; ids are the product's.

Typed in the product: `apps/hub/src/tenant/domain/playbook.ts` (`CLIENT_STATUSES`, `CLIENT_FLOW_STEPS`, `CLIENT_STATUS_BY_PIPELINE`, `clientStatus()`, `PROJECT_LINES`, `projectLine()`, governance `G-15..G-17` with `source: 'process-flow'`).

## 1. Overview (p. 2)

"The client experience should remain simple; ALUZINA's internal operating system should be detailed."

**Client-facing flow** (8 steps): 01 Tell us what you want to create; 02 Let us get to know your space; 03 Receive the proposal; 04 Approve your design; 05 We design and develop; 06 We bring it to life; 07 We install; 08 We deliver. (`CLIENT_FLOW_STEPS`.)

**ALUZINA internal flow** (11 stages): Contact -> Requirement -> Site Visit & Survey -> Quotation -> On-site Validation -> Approval -> Drawings & 3D -> Production -> Installation -> Final Details -> Closeout & Payment.

**System principle.** "Each stage has an input, an owner, a deliverable, a status and an approval. When a required condition is met, the system automatically activates the next stage."

## 2. Internal flow, stage by stage (pp. 3-4)

The document states each stage's purpose and an "Automation:" line. Input / owner / deliverable / status / approval are the principle's five slots, filled here from the document's own text where it names them and marked _inferred_ where the product has to choose (to be confirmed by the founder, same rule as `service-playbook.md`'s role map).

| # | Stage | What happens (document wording) | Input | Owner | Deliverable | Status it sets (flow) | Approval | Automation (document wording) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | Client contact / meeting | "The project begins through a meeting, chat, phone call or website form. Client information, project type and general need are identified." | meeting / chat / call / website form | _inferred_ founder or marketing (lead owner, G-01) | client + project record with project code | New | none | "Create the client and project record, assign a project code, register the incoming channel and notify the team." |
| 02 | Understanding the requirement | "Define what the client needs, what they want to transform, where the element will be located, functional needs, aesthetics, approximate budget and timing." | the contact record | _inferred_ founder / lead designer | dynamic brief per project type | Brief | none | "Generate a dynamic brief according to project type and flag missing information." |
| 03 | Site visit + survey | "Take photographs and measurements, and review existing conditions, access, utilities and site restrictions." | the brief | _inferred_ studio (designer on the visit) | survey: photos, measurements, technical conditions on the project record | Site Visit | none | "Site-visit checklist, photo upload, measurements and technical conditions saved to the project record." |
| 04 | Quotation | "Using the initial information, define the value of the service or element and the contracted scope." | brief + survey | _inferred_ founder | quotation (versioned) | Quotation | client accepts (sent / pending / accepted) | "Generate the quotation, send it, and track version and status: sent / pending / accepted." |
| 05 | On-site validation | "Show the client the real scale and dimensions of the element or intervention within the space using tape, layout markings or physical references. Validate size, location, proportion and functionality." | accepted quotation | _inferred_ studio + client on site | validation version: observations, photos, requested changes | (within Approved) | client validates | "Record observations, photographs and requested changes; create a validation version." |
| 06 | Approval | "The client approves dimensions, location, scope, value and initial concept. This approval unlocks the development phase." | validation version | client | approval stamp (date / user / version) on a locked version | Approved | **APPROVE PROJECT** | "APPROVE PROJECT button, date/user/version stamp, and lock the approved version." |
| 07 | Drawings + 3D model | "Design development: drawings, dimensions, materials, details, 3D model, and visualizations or renders when required." | approved version | studio | drawings, 3D model, renders (versioned) | Design | **APPROVE DESIGN FOR PRODUCTION** (second approval) | "Version control and a second approval: APPROVE DESIGN FOR PRODUCTION." |
| 08 | Production / construction | "Generate the production or execution order with suppliers, materials, quantities, dates, costs and tracking." | approved design | _inferred_ operations | production / execution order | Production, with sub-statuses To Start -> In Production -> Quality Control -> Completed | none (gate G-17 before it) | "Automatic statuses: To Start -> In Production -> Quality Control -> Completed." |
| 09 | Installation | "Schedule the date, team, transportation, tools, site conditions, electrical installation when applicable, and assembly." | completed production | _inferred_ operations | installation checklist, calendar, responsible parties, before / after photo record | Installation | none | "Installation checklist, calendar, responsible parties and before/after photo record." |
| 10 | Final details & review | "Complete adjustments, touch-ups, leveling, cleaning, hardware review, finishes, lighting and functional testing." | installed work | _inferred_ studio + operations | ALUZINA delivery checklist + punch list with owner and closeout date | Final Details | none | "ALUZINA delivery checklist and punch list with owner and closeout date." |
| 11 | Closeout + payment | "Record the outstanding balance, issue invoice or payment request, close the project, archive final photographs and request a testimonial." | closed punch list | _inferred_ founder / administration | invoice or payment request, final photographs, testimonial, case study / portfolio entry | Closeout -> Completed | none | "Balance reminder, administrative closeout and automatic creation of a case study/portfolio entry." |

The production sub-statuses (To Start -> In Production -> Quality Control -> Completed) are a new vocabulary: the product's `purchases.status` (`PURCHASE_STATUSES`: quoted -> installed) tracks a purchase, not the production order; a production-order entity is a step 16 question (wa-02).

## 3. Application by project line (p. 5)

"The same core structure adapts to ALUZINA's three areas of creation." (`PROJECT_LINES`, D-101.)

| Line (`ProjectLineId`) | Chain (document wording) |
| --- | --- |
| Interior spaces (`interior-spaces`) | Client -> requirement -> site visit -> survey -> quotation -> concept -> validation -> approval -> drawings/3D -> construction -> installation -> final details -> payment. |
| Furniture (`furniture`) | Client -> requirement -> measurements -> quotation -> scale validation -> approval -> drawings/3D -> fabrication -> installation -> final details -> payment. |
| Lighting fixtures (`lighting-fixtures`) | Client -> requirement -> lighting conditions and measurements -> quotation -> scale test -> approval -> technical design/3D -> prototype/production -> installation -> calibration -> payment. |

Project line is a **third axis**, distinct from the playbook's `ServiceCode` (depth of service: 01 / 02 / 03 / E / 04, routed by `routeService()`) and from `Project.type` (sector: residential / commercial / hospitality / wellness / lighting-product). Today `Project.type` `lighting-product` implies `lighting-fixtures` and the other four imply `interior-spaces`; `furniture` has no type and no template yet (wa-08).

## 4. Approval rules (p. 5)

| # | Rule (document wording) | In the product |
| --- | --- | --- |
| 1 | "Before production, every proposal must have a client-approved version." | **G-15** (gate, new): extends G-06 / G-12 with versioning; `projects.approval` `client-approved` on a locked version (wa-01). |
| 2 | "Every change after approval creates a new version and may generate additional cost or lead time." | **G-14** already (change orders with cost and time); the "new version" half is the versioned approval of wa-01. No new rule. |
| 3 | "Approval must store date, responsible person, version and supporting evidence." | **G-16** (mandatory, new): makes G-03 ("all client approvals are documented") explicit; the APPROVE PROJECT / APPROVE DESIGN FOR PRODUCTION stamps (wa-01). |
| 4 | "Production cannot begin if measurements, drawings, materials or final approval are missing." | **G-17** (gate, new): makes G-06 explicit as a four-item readiness check before `procurement` / `in-construction` (wa-03). |

## 5. Website automation (p. 6)

"The website works as the client portal and as the trigger for ALUZINA's internal operating system." The ten rows are the planned automation vocabulary; the mapping onto existing action ids and entities is in `../reference/surfaces.md` section 2.6 and the build tasks are step 16 (`wa-03..wa-05`).

| When this happens | The system does this |
| --- | --- |
| Form received | Create client + project + brief + folder + project code. |
| Quotation accepted | Request deposit and activate survey/design phase. |
| Payment confirmed | Unlock the next phase and notify the responsible person. |
| Site visit completed | Request upload of photos, measurements and technical checklist. |
| Validation completed | Send summary to the client and request approval. |
| Design approved | Generate the production package and lock the approved version. |
| Production started | Activate supplier, date and cost tracking. |
| Production completed | Schedule installation. |
| Installation completed | Activate final-details and closeout checklist. |
| Project closed | Request final balance, review, photographs and case study. |

## 6. Project statuses (p. 6)

New -> Brief -> Site Visit -> Quotation -> Approved -> Design -> Production -> Installation -> Final Details -> Closeout -> Completed (11). In the product: `CLIENT_STATUSES` (`ClientStatusId`: `new`, `brief`, `site-visit`, `quotation`, `approved`, `design`, `production`, `installation`, `final-details`, `closeout`, `completed`), each tied to one of the eight client-facing steps.

## 7. Automation goal (p. 6)

"Eliminate repetitive tasks, centralize information and make the status of every project visible. Creative judgment, composition, experience, materiality and lighting remain under ALUZINA's direction."

## 8. Reconciliation with the app's domain model (D-099..D-101)

### 8.1 Flow status -> internal pipeline status

The playbook's 15 statuses (`PIPELINE_STATUSES`, `leads.status` for 1-4, `projects.pipelineStatus` from `contracted`) stay the stored value; the flow's 11 are derived by `CLIENT_STATUS_BY_PIPELINE` / `clientStatus()`. The map is **not 1:1**, which is why replacing the 15 was rejected (D-099):

| Flow status | Internal `pipelineStatus` that yields it | Note |
| --- | --- | --- |
| New | `lead-new` | |
| Brief | `lead-qualified` | the qualification questions are the requirement |
| Site Visit | **none today** | the visit happens inside `lead-qualified` (service 02 / 03 diagnosis) or `briefing`; not derivable from `pipelineStatus` alone. Candidates: derive from a `siteReports` / survey deliverable, or split a status (wa-02) |
| Quotation | `proposal-sent` | |
| Approved | `contracted` | the client accepted scope, value and initial concept (stage 06 APPROVE PROJECT) |
| Design | `briefing`, `concept`, `design-development`, `client-review` | |
| Production | `approved`, `procurement`, `in-construction` | the playbook's `approved` is APPROVE DESIGN FOR PRODUCTION, the entry to step 06 "We bring it to life" |
| Installation | **none today** | `in-construction` covers production and installation; same candidates as Site Visit (wa-02) |
| Final Details | `punch-list` | |
| Closeout | `delivered` | delivered, balance and closeout pending |
| Completed | `closed`, `follow-up` | |

### 8.2 Flow stage -> playbook

| Flow stage | Playbook counterpart |
| --- | --- |
| 01 Contact | Lead entry (00 general commercial process), `LEAD_CHANNELS`, `LEAD_RECORD_FIELDS` |
| 02 Requirement | Qualification (`QUALIFICATION_QUESTIONS`), brief (service phase 1 of 01 / 02 / 03) |
| 03 Site visit + survey | Service 02 / 03 on-site diagnosis and survey; `siteReports`, `del-site-survey` |
| 04 Quotation | Proposal (`proposal-sent`), `quotes`, `del-budget-quote-comparison` |
| 05 On-site validation | Not in the playbook as a stage; nearest is service 03 stage 10 validation (`revisionItems`) but at 1:1 scale on site, before development |
| 06 Approval | `contracted` + the approval form (`projects.approval`) |
| 07 Drawings + 3D | Service 03 concept -> development -> client review -> `approved` (G-12 gate) |
| 08 Production | Service E procurement / construction (`purchases`, `PURCHASE_STATUSES`) |
| 09 Installation | Service E construction and installation (`in-construction`) |
| 10 Final details | `punch-list`, `del-punch-list`, service E stage 10 handover checklist |
| 11 Closeout + payment | `delivered` / `closed` / `follow-up`, `payments`, `del-handover-package`, case study (`deliverables` case study kind) |

### 8.3 Decisions

- **D-099** the 15 internal statuses stay; the 11 flow statuses are a derived client-facing view (`CLIENT_STATUS_BY_PIPELINE`), with the two gaps (Site Visit, Installation) recorded instead of papered over; no seed change.
- **D-100** three of the four approval rules become governance rules `G-15..G-17` with `source: 'process-flow'`; rule 2 is G-14.
- **D-101** project line is a new typed dimension (`PROJECT_LINES`), not `ServiceCode` and not `Project.type`; no project field yet (wa-08).
- **D-102** the ten automations are planned as step 16 tasks and documented in `surfaces.md` 2.6; they are not declared in any `specs.ts` until a page registers them.

## Not yet known

- Who owns each stage (the document names none; the "Owner" column above is inferred, as in `service-playbook.md`).
- Whether Site Visit and Installation become internal statuses or stay derived (wa-02, founder + Fable 5.1).
- The production order as an entity and its four sub-statuses vs `purchases` (wa-02).
- The Spanish wording of the flow (the PDF is the EN edition): the `es` texts in `playbook.ts` for `CLIENT_STATUSES`, `CLIENT_FLOW_STEPS`, `PROJECT_LINES` and `G-15..G-17` are the integrator's translations, to be reviewed by the founder (D-004, wa-07).
- Whether "project code" (stage 01) is the existing `prj-` id scheme or a client-visible code.

## Change log

- 2026-09-28: created from the PDF Justin shared in #merge-repos (prompt 0024, changelog 0031, D-099..D-102); typed data added to `apps/hub/src/tenant/domain/playbook.ts`; step 16 "Workflow automation" (wa-00..wa-08) added to the plan. Fable 5.1.
