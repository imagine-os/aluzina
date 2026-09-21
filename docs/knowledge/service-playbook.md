# Service delivery playbook (ALUZINA Operating System v1.0)

```
status: current
since: 2026-09-21
source: ALUZINA Operating System – Service Delivery Playbook v1.0 (Alejandra Guerra), shared by Justin Massion in Slack 2026-09-21 (prompt 0009)
```

The founder's own operating framework: "a repeatable operating framework that defines how ALUZINA receives, diagnoses, designs, executes and closes every client experience - while protecting creative quality, scope and profitability." This file is the complete structured transcription of the PDF (`../source/playbook/ALUZINA_Operating_System_Services_EN.pdf`, 18 pages; page 6 is blank). It is the **canonical service model** of the product (D-033): the typed data in `apps/hub/src/domain/playbook.ts` mirrors it item by item, and the pipeline statuses below are the `projects.pipelineStatus` / `leads.status` vocabulary. Wording is the founder's; headings keep her numbering (00, 01, 02, 03, E, 04, 05, 06).

Tagline (cover and back page): "ALUZINA - Interior Design & Emotional Lighting"; "Spaces + Light + Experiences that transform".

## 00 Operating logic

```
status: current
since: 2026-09-21
source: playbook p. 2
```

"One studio. One method. Different depths of service."

**Core client journey** (10 steps): LEAD -> DIAGNOSIS -> BRIEF -> ANALYSIS -> CONCEPT -> DEVELOPMENT -> VALIDATION -> DELIVERY -> CLOSURE -> FOLLOW-UP.

| Code | Service | Primary outcome |
| --- | --- | --- |
| 01 | Creative Digital Consultation | Conceptual clarity and professional direction. |
| 02 | In-Person Consultation | Immersive on-site diagnosis and a deeper creative route. |
| 03 | Comprehensive Interior Design | Full design definition before construction. |
| E | Execution / Construction | Materialization of an approved design. |
| 04 | Interior Styling | Final visual composition, atmosphere and presence. |

## 00 General commercial process

```
status: current
since: 2026-09-21
source: playbook p. 3
```

"Everything starts before design begins."

1. **Lead entry.** "Every inquiry must enter a single traceable pipeline." Channels (7): Instagram, WhatsApp, Website, Referral, Email, Networking, Commercial partnership.
2. **Immediate registration.**
   - Lead record: Client name, Phone, Email, City, Project type, Approximate area, Current project status.
   - Commercial data: Requested service, Estimated intervention budget, Desired start date, How they found ALUZINA, Assigned ALUZINA owner, Lead status.
   - Pipeline status: NEW LEAD.
3. **Initial qualification** (10 questions): What does the client want to transform? / Why do they want to do it now? / Is it residential, commercial, hospitality, wellness or another typology? / How many square meters are involved? / Does a current floor plan exist? / Is the project built, under construction or still conceptual? / Does the client need ideas only or full design development? / Do they want ALUZINA to execute the project? / What is the expected investment range? / When do they want to start?
4. **Service routing**: 01 Creative Digital Consultation, 02 In-Person Consultation, 03 Comprehensive Interior Design, E Execution / Construction, 04 Interior Styling.

**Commercial rule.** "Never sell a small service when the diagnosis clearly shows that the client needs a deeper scope. The goal is not to oversell - it is to place the client in the right process."

In the product: `leads` rows (schema `services.ts`), the public intake flow (P-xx) and the CRM pipeline; `routeService()` in `domain/playbook.ts` is a heuristic over the qualification answers that suggests a service, never a decision (the founder routes).

## 01 Creative Digital Consultation

```
status: current
since: 2026-09-21
source: playbook pp. 4-5
```

Ideal for "clients seeking conceptual clarity and professional direction before intervening in a space." Ladder word: **Clarity**. Central question: "What should I do with this space, and in what creative direction should I take it?"

| Phase | Items |
| --- | --- |
| 1 Activation ("Once payment is confirmed, administration activates the project.") | Create the client folder; Create the project record; Send the strategic brief form; Send the photo / video upload instructions; Schedule the virtual session; Set status: CONSULTATION / STARTED. |
| 2 Strategic brief | **User**: Who uses the space; Number of people; Ages when relevant; Daily routines; Pain points; Habits and way of living. **Space**: Area and heights; Windows and orientation; Access points; Existing furniture; Current lighting; Existing materials. **Aesthetic direction**: References they like; References they dislike; Preferred colors; Preferred materials; Desired feelings; Hotels / homes / spaces they admire. **Expectation**: What should change?; What should the space make them feel?; What would success look like?; Non-negotiables; Investment mindset. |
| 3 Digital survey | General photographs; One clear photograph of each wall; 360-degree or continuous video; Basic measurements; Existing floor plan, if available; Ceiling height; Door and window locations; Relevant electrical points; Furniture that must remain. |
| 4 ALUZINA diagnosis | **Space**: Layout; Scale; Proportion; Circulation; Voids; Spatial hierarchy. **Person**: Routines; Needs; Behaviors; Desires; Functional conflicts; Emotional expectations. **Atmosphere**: Natural light; Artificial light; Color; Materiality; Visual temperature; Sensory tone. **Potential**: What can the space become?; What should disappear?; What deserves emphasis?; Where can one move beyond decoration? |
| 5 Concept | Create one clear concept sentence; Define keywords; Define the intended feeling; Set the aesthetic language; Define preliminary materiality; Define color direction; Define lighting intention; Define furniture direction. Example: "A quiet Mediterranean refuge shaped by warm light." |
| 6 Creative direction | Moodboard; Visual references; Preliminary palette; Suggested materials; Layout ideas; Lighting treatment; Hero elements; Elements to remove; Elements worth keeping. |
| 7 Consultation session (60 to 90 minutes) | 10 min Listen and reconnect with the brief; 15 min Present the diagnosis; 20 min Present the concept and creative direction; 20 min Explain recommendations; 15 min Questions, priorities and next steps. |
| 8 Delivery | Brief summary; Diagnosis; Concept; Moodboard; Visual references; Initial palette; Spatial direction; Lighting direction; Priority recommendations; Potential image / concept visual when applicable. |

**Scope protection - not included**: Technical drawings; Complete 3D modeling; Final photorealistic renders; Custom furniture design; Construction budget; Supplier quotation management; Site supervision; Purchasing; Construction.

## 02 In-Person Consultation

```
status: current
since: 2026-09-21
source: playbook pp. 7-8
```

"An immersive on-site experience that converts direct observation into a clear creative route." Ladder word: **Direction**. Central question: "What does this space truly need, and what is the right path to transform it?"

| Phase | Items |
| --- | --- |
| 1 Pre-brief | Client form; Current photographs; Exact project location; Existing floor plan if available; Main problem to solve; Who uses the space; Desired outcome. |
| 2 Preparation before the visit | Review all submitted information; Prepare the visit checklist; Review available drawings; Prepare diagnostic questions; Bring measurement tools and documentation equipment. |
| 3 On-site observation | **Architecture**: Heights; Geometry; Circulation; Access; Views; Interior / exterior relationship. **Light**: Solar entry; Orientation; Shadows; Artificial lighting; Color temperature; Electrical points. **Materiality**: Floors; Walls; Ceilings; Joinery; Textures; Existing finishes. **User behavior**: Movement; Habits; Comfort / discomfort; What works; What fails; What is missing. |
| 4 Documentation | Photograph every wall; Record floors and ceilings; Capture relevant details and visible installations; Document existing furniture and views; Identify elements to preserve; Identify problem areas; Record critical dimensions. |
| 5 Conversation inside the space | What do you want?; What do you strongly dislike?; What must stay?; What would you transform first?; How do you imagine living, working or receiving people here? |
| 6 Internal diagnosis | Primary problem; Secondary problems; Opportunities; Restrictions; Priority interventions. |
| 7 Concept development | Mother idea; Creative concept; Moodboard; Conceptual palette; Visual references; Initial aesthetic guidelines; Lighting logic. |
| 8 Premium delivery | 01 Current condition; 02 Diagnosis; 03 Mother idea; 04 Creative concept; 05 Moodboard; 06 References; 07 Spatial guidelines; 08 Initial materiality; 09 Initial lighting direction; 10 Recommended next steps. |

**Method principle.** "ALUZINA does not design impulsively during the visit. First we observe. Then we process. Then we design."

**Natural next step.** "The consultation should clearly indicate whether the project should move into Comprehensive Interior Design."

## 03 Comprehensive Interior Design

```
status: current
since: 2026-09-21
source: playbook pp. 9-11
```

"The core ALUZINA service: complete spatial definition before construction." Ladder word: **Definition**. Service promise: "We do not simply give ideas. We define the experience, space, light, materiality and visual language before the project is built."

| Stage | Items |
| --- | --- |
| 01 Onboarding | Contract signed; Initial payment received; Master schedule issued; Project folder created; Official communication channel defined; Internal and client-side responsibilities assigned; Review meetings scheduled. |
| 02 Deep brief | Client goals; User profile; Brand context when applicable; Routines and operational needs; Desired experience; Budget framework; Maintenance expectations; Durability requirements; Operational constraints. |
| 03 Survey and base information | Accurate dimensions; Heights; Doors and windows; Columns and structural constraints; Electrical points; Plumbing and networks; Ventilation; Equipment; Special site conditions. |
| 04 Diagnosis | Spatial problems; Opportunities; Circulation conflicts; Lighting issues; Experience gaps; Hierarchy; Relationship between spaces. |
| 05 Architectural program | Define every function the project requires; Confirm quantity, capacity and relationship of each area; Distinguish public, private, operational and service zones when applicable. |
| 06 Zoning | Define what happens; Define where it happens; Define how areas relate to one another. |
| 07 Circulation and flow | User journey; Staff flow; Service flow; Supplier / logistics flow; Operational movement; Egress considerations when applicable. |
| 08 ALUZINA concept | Concept name; Core sentence; Story / narrative; Keywords; Moodboard; Atmosphere; Materiality; Color; Lighting intention; Sensory direction. |
| 09 Schematic design | Initial spatial layout; Furniture placement; Volumes; Circulation; Hero elements; Functional relationships. |
| 10 Client validation | Present the scheme; Collect all comments in one revision matrix; Avoid scattered design changes through WhatsApp; Assign approval status: APPROVED / APPROVED WITH ADJUSTMENTS / REVISION. |
| 11 3D development | Model the approved space; Develop materiality; Develop furniture; Develop lighting; Add decoration, vegetation and equipment as applicable. |
| 12 Emotional lighting | General light; Functional light; Ambient light; Accent light; Decorative light; Color temperature; Direction; Hierarchy; Lighting scenes; RGB / RGBW where appropriate. |
| 13 Materiality (per material) | Material name; Location; Finish; Color; Format / size; Supplier; Reference; Approved alternative. |
| 14 Enclosures | Doors; Windows; Partitions; Screens; Panels; Curtains; Dividers. |
| 15 Furniture | Existing furniture; New commercial furniture; Custom-designed furniture; Items to fabricate; For each piece: dimensions, material, color, reference and supplier. |
| 16 Visualization | Create renders / visualizations to verify scale, color, material, light and composition - not only to make the project look beautiful. |
| 17 Drawing package | General plan; Demolition plan when needed; Construction plan; Furniture plan; Flooring plan; Ceiling plan; Lighting plan; Electrical coordination; Details; Joinery / millwork; Enclosures - depending on contracted scope. |
| 18 Budget framework | Convert the approved design into work packages: construction, joinery, lighting, furniture, glazing, textiles, decoration, vegetation, technology and other required disciplines. |
| 19 Final design delivery | Approved plans; Design documentation; Renders; Material schedule; Furniture schedule; Lighting information; Specifications and all deliverables included in the contracted scope. |

**Approval gate.** "Construction may begin only after the client approves the final design for execution. This gate protects quality, schedule, scope and cost."

Validation statuses (stage 10): **APPROVED**, **APPROVED WITH ADJUSTMENTS**, **REVISION**. In the product: `revisionItems` (the single revision matrix per project) with `status` from `VALIDATION_STATUSES`.

## E Execution / Construction

```
status: current
since: 2026-09-21
source: playbook pp. 12-13
```

"The materialization of an approved ALUZINA design." Ladder word: **Materialization**. Operating principle: "Design and construction are separate stages. Final execution pricing must be based on an approved design, not assumptions."

| Stage | Items |
| --- | --- |
| 1 Project breakdown | Civil works; Joinery; Lighting; Painting; Glazing; Furniture; Textiles; Decoration; Technology; Landscaping and any specialist package. |
| 2 Quotations | Request the required supplier options; Compare price, quality, lead time, warranty and experience; Normalize scope so quotations are comparable. |
| 3 General budget | Projected cost; Contingency; Professional fees; Purchases; Logistics; Transportation; Installation. |
| 4 Construction schedule | Supplier start date; Activity; Dependencies; Expected completion date; Critical milestones. |
| 5 Purchasing control (per purchase) | Supplier; Reference; Quantity; Price; Date; Responsible person; Status: QUOTED / APPROVED / PAID / ORDERED / RECEIVED / INSTALLED. |
| 6 Execution sequence | Protection; Demolition; Rough construction; MEP / installations; Ceilings; Floors; Wall finishes; Joinery; Lighting; Painting; Furniture; Textiles; Decoration; Final styling. |
| 7 ALUZINA site control (per visit) | Date; Progress; Photographic record; Decisions; Problems; Responsible person; Resolution due date. |
| 8 Change control | Any request after approval becomes a CHANGE ORDER; Record description, reason, additional cost, additional time and client approval; Do not execute unapproved changes. |
| 9 Punch list | Paint; Joinery; Lighting; Finishes; Furniture; Cleaning; Functionality; Final details. |
| 10 Handover | Final photographs; Handover record; Inventory when applicable; Warranties; Operating / care information; Financial closure. |

Purchase statuses (stage 5): **QUOTED, APPROVED, PAID, ORDERED, RECEIVED, INSTALLED** -> `purchases.status`. Site control (stage 7) -> `siteReports`. Change control (stage 8) -> `changeOrders` (`requested / approved / rejected / executed`).

## 04 Interior Styling

```
status: current
since: 2026-09-21
source: playbook pp. 14-15
```

"A focused service that transforms the visual experience of an existing space without redesigning its architecture." Ladder word: **Soul + Final Composition**. Central question: "How can the space feel intentional, coherent and complete using composition, objects, furniture, light and atmosphere?"

| Phase | Items |
| --- | --- |
| 1 Pre-session record | Current photographs; Continuous video; Basic dimensions; Existing furniture; Existing decorative objects. |
| 2 Diagnosis | What is excessive; What is missing; What is poorly positioned; What deserves emphasis; What should disappear from the visual field. |
| 3 Curation | Objects; Art; Books; Textiles; Vegetation; Decorative lighting; Accessories. |
| 4 Composition | Scale; Heights; Layers; Color; Texture; Negative space; Grouping; Rhythm. |
| 5 Reorganization | Reposition furniture; Test new visual axes; Create stronger focal points; Improve balance and flow. |
| 6 Lighting adjustment | Color temperature; Direction; Intensity; Decorative lamps; Lighting layers. |
| 7 Final styling | Objects; Cushions; Art; Books; Plants; Textiles; Sculptural pieces; Personal objects. |
| 8 Documentation | Final photographs; Immediate recommendations; Suggested future purchases. |

## 05 The ALUZINA service ladder

```
status: current
since: 2026-09-21
source: playbook p. 16
```

"The services must work as one ecosystem, not as isolated products."

| Service | Ladder word |
| --- | --- |
| Creative Digital Consultation | CLARITY |
| In-Person Consultation | DIRECTION |
| Comprehensive Interior Design | DEFINITION |
| Execution / Construction | MATERIALIZATION |
| Interior Styling | SOUL + FINAL COMPOSITION |

**Business logic.** "A client can enter ALUZINA through a focused service and, when appropriate, evolve into a complete design and execution relationship. Each step must generate enough clarity to justify the next - never pressure."

### Mandatory governance rules (9)

| Id (product) | Rule |
| --- | --- |
| G-01 | Every project has one owner inside ALUZINA. |
| G-02 | Every project has one official folder and one source of truth. |
| G-03 | All client approvals are documented. |
| G-04 | Scope changes are documented before work continues. |
| G-05 | Design revisions are consolidated into a single revision matrix. |
| G-06 | No construction begins without an approved design package. |
| G-07 | Purchases are tracked from quotation to installation. |
| G-08 | Every site visit produces a written and photographic record. |
| G-09 | Every service ends with a formal delivery and closure step. |

The product also carries as rules (`GOVERNANCE_RULES`, ids continue): G-10 the commercial rule (p. 3), G-11 the method principle (p. 8), G-12 the approval gate (p. 11), G-13 the execution operating principle (p. 12), G-14 the change-control rule (p. 13). Ids are ours, for referencing from specs and page docs; the playbook numbers none of them.

## 06 Next layer: internal SOP by role

```
status: current
since: 2026-09-21
source: playbook p. 17
```

"This is what converts a methodology into a scalable studio operating system." Recommended next build: "For every stage above, define who does it, which template is used, where the file is stored, how it is named, how long the task should take, what the approval criterion is and what triggers the next stage."

### Role responsibilities (6) and the map onto `team.md`

| Playbook role | Portal role (`roles-and-portals.md`) | Person (`team.md`) |
| --- | --- | --- |
| Creative Director | `founder` | Alejandra Guerra |
| Interior Designer / Junior | `studio` | Sarai |
| Administrative Assistant | `ops` | Miguel |
| Graphic / Brand Designer | `brand` | Angélica |
| Project Manager (when applicable) | _unknown_ (planned; no portal role today; `ops` holds execution permissions meanwhile) | _unknown_ |
| External suppliers and specialists | _unknown_ (planned supplier portal; today `suppliers` rows, no login) | catalogued in `suppliers` |

The playbook does not assign stages to roles ("who does it" is the recommended next build); the product's guesses (owner role per phase) are marked as such in `deliverables.md` and in the engagement checklists, to be confirmed by the founder.

### Operational assets (11)

Folder tree; File naming convention; Client message templates; Brief forms; Visit checklists; Revision matrix; Approval forms; Budget tracker; Procurement tracker; Site report; Handover checklist. Product mapping: brief forms -> `engagements.brief`; visit checklists -> phase checklists (`engagements.checks`); revision matrix -> `revisionItems`; approval forms -> `projects.approval` + A-02; budget tracker -> `quotes` / `payments`; procurement tracker -> `purchases`; site report -> `siteReports`; handover checklist -> service E stage 10 checklist; folder tree, naming convention and message templates -> `_unknown_` (Spaces posts once the founder shares them).

### Suggested status architecture (15)

| # | Playbook status | Product id (`PIPELINE_STATUSES`) | Group |
| --- | --- | --- | --- |
| 1 | LEAD - NEW | `lead-new` | lead |
| 2 | LEAD - QUALIFIED | `lead-qualified` | lead |
| 3 | PROPOSAL SENT | `proposal-sent` | sale |
| 4 | CONTRACTED | `contracted` | sale |
| 5 | BRIEFING | `briefing` | design |
| 6 | CONCEPT | `concept` | design |
| 7 | DESIGN DEVELOPMENT | `design-development` | design |
| 8 | CLIENT REVIEW | `client-review` | design |
| 9 | APPROVED | `approved` | design |
| 10 | PROCUREMENT | `procurement` | build |
| 11 | IN CONSTRUCTION | `in-construction` | build |
| 12 | PUNCH LIST | `punch-list` | build |
| 13 | DELIVERED | `delivered` | close |
| 14 | CLOSED | `closed` | close |
| 15 | FOLLOW-UP | `follow-up` | close |

`leads.status` uses 1-4 (a lead becomes a project at CONTRACTED); `projects.pipelineStatus` uses 4-15. The older `projects.phase` (`lead … delivered`) stays for the Work views until they migrate (D-033).

### Recommended KPI layer (10)

| Key (product) | KPI | Unit |
| --- | --- | --- |
| `leadToContractRate` | Lead-to-contract conversion rate | % |
| `daysLeadToContract` | Average days from lead to contract | days |
| `designCycleDays` | Average design cycle time | days |
| `revisionRounds` | Number of revision rounds | count |
| `grossMarginByService` | Gross margin by service | % |
| `supplierVariance` | Supplier variance vs approved budget | % |
| `scheduleVariance` | Schedule variance | days |
| `clientSatisfaction` | Client satisfaction after delivery | score |
| `consultationToDesignRate` | Percentage of consultation clients converted to design | % |
| `designToExecutionRate` | Percentage of design clients converted to execution | % |

**Final principle.** "The operating system exists so ALUZINA can grow without losing its creative intelligence. The method should protect the studio's point of view while making delivery clear, measurable and repeatable."

## Not yet known

- Prices and durations per service, payment terms, contract templates: _unknown_ (the playbook has none).
- Which role does each stage, templates, storage paths, naming convention, approval criteria, stage triggers: _unknown_ (named by the playbook as the next build).
- Spanish wording of the playbook (the PDF is the EN edition): the `es` texts in `domain/playbook.ts` are the integrator's translations, to be reviewed by the founder (D-004).

## Change log

- 2026-09-21: created as the full transcription of the Service Delivery Playbook v1.0 (prompt 0009, changelog 0013, D-033); status ids, governance ids and KPI keys assigned for the product; role map onto `team.md` with PM and suppliers as `_unknown_`.
