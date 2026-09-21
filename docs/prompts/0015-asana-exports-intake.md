# 0015 - Asana exports: how the founder manages projects and tasks

- source: Slack #import-asana, thread root by Justin Massion
- date: 2026-09-21 17:05 UTC, second message 17:07 UTC
- requester: Justin Massion
- attachments: six Asana CSV exports, stored de-identified under `docs/source/asana/2026-09-21/` (`PROYECTO_HOY.csv`, `PROYECTOS_ALUZINA_SEPTIEMBRE-DICIEMBRE_2026.csv`, `ALUZINA_WORKFLOW_FOR_EVERY_PROJECT.csv`, `PRODUCCION_FOTOGRAFICA_DE_PRODUCTOS.csv`, `LUMINARIAS_ALUZINA_2026.csv`, `WORK_CHRONOGRAM_ALUZINA_ENGLISH.csv`)
- context: follows prompt 0004 (Asana-style Work views) and `knowledge/tools-in-use.md`; first real Asana data in the repo

## Prompt (verbatim)

```
we exported some projects from asana so you can get a feel for how she manages projects and tasks and such. You can use this as sample tasks for real projects and such. Hoy is a current project/client

 ASANA INTERIOR DESIGN OF PROJECT HOY

ORGANIUZATION OF PROJECTS THAT WE HAVE ON SEPTEMBER

ALUZINA WORKSFLO for every project

INFORMATION FOR A PRODUCT PICTURE PRODUCTION

This should give you examples and variety of projects and how they manage stuff.  This also gives you an idea that there are standardized workflows that often get adjusted on a per project basis.

IMPORTANT ACTIVITIES TO DO WITH LIGHTING IN 2026


Consider how this relates to the types of standardized files you find in dropbox on a per project basis.

Over time the goal is to automate the process of creating documents or at least make it possible to build the doucments in or through our Aluzina OS Sytstem.

Of note for later. Canva is a place she makes alot of documents also
```

Second message, 2026-09-21 17:07 UTC, with the sixth attachment:

```
WORK FLOW IN ENGLISH.

Here's one more file from asana export she just sent me to add
```

## Response

Reply posted to the Slack thread (verbatim):

> Read all six (the English chronogram included). Short version: she keeps two template projects, one per language, both from July 2023 (WORK CHRONOGRAM ALUZINA ENGLISH, 168 tasks, and ALUZINA WORKFLOW FOR EVERY PROJECT, 349 tasks, built on a real residence and still edited in 2026), and builds a client project by duplicating and merging them. PROYECTO HOY is that merge: all 212 tasks were created the same day (2026-05-29), the Spanish DISEÑO / COTIZACION / PRODUCCION trees plus the English pieces (PRODUCTION, LAST PAYMENT OF THE DESIGN, Bathroom accessories, Final details through Client correction in space). The only thing in HOY that comes from neither template is the kickoff section (CONTRATO, FACTURACION, SUBIR FOTOGRAFIAS DE ESPACIO Y REFERENCIA A DROPBOX). Everything else is still 2023 content (the ZONE 1–11 list, furniture a–h, "Terraza federico", "Apartment, semco"), so HOY almost certainly hasn't been adapted to the client yet. Worth asking her, along with whether this HOY is the HOY Wellness Center we have on file as a past client.
>
> How she structures things: sections are phases (DISEÑO → COTIZACION → PRODUCCION), tasks are hand-numbered in the name and nest up to five deep (6. PRIMERA REUNION → 9. Referentes → ZONE 5: Cocina → MODUL 1. ISLAN). Native fields barely get used: she's the assignee on about one task in fifteen, Saray on one, due dates only in the 2023 projects, dependencies and tags never. The Notes field is the real database: briefs, LED specs, attachment links, and on the Sep–Dec 2026 board a fixed form per vendor job (ENCARGADO, VALOR, PROFIT ALUZINA, PRIMER/SEGUNDO PAGO, FECHAS, RESPONSABILIDAD DE ALUZINA). Custom fields exist (SEMANA 1–5 as a hand-made timeline, OBSERVATONS, COMENTARIOS) but are almost empty. Spanish with English leaking in (PRODUCTION, the 16-trade PROVEEDORES list, "Client deliver") and spelling that drifts, so an importer has to match fuzzy, not by name.
>
> Dropbox and the rest sit inside the same flow: at kickoff she creates the Dropbox folder (imágenes y planos), a Google Drive control financiero and shares the Asana; later come an Excel cotización formal and an Excel reporte general; presentations are Canva; references travel over WhatsApp ("te lo envié por WhatsApp pero olvidé ponerlo acá"). The per-project Dropbox tree itself I still need to see.
>
> Documents the data says we can generate, roughly by payoff: the vendor job sheet and payment schedule from that note form; the cotización Excel from the spec tree (13.4, 14. ACABADOS, 17. Iluminación); RFQ packets per trade; the "punto del proceso" slide of the client presentation from task state; the cronograma from the SEMANA grid; contract and invoice at kickoff; punch list and acta de entrega from the RECTA FINAL pattern. The full write-up with the OS data-model implications is in the repo: docs/knowledge/asana-conventions.md, the six CSV copies under docs/source/asana/2026-09-21/ (assignee emails blanked, one Lovable magic link redacted), prompt 0015, changelog 0017, D-054. One more thing the board shows: Sporti, Sodime and Bosques de la Concha have active jobs this quarter, while our clients file had Sporti and Sodime as past. Fable 5.1 did the analysis; Sonnet 5 wrote the files and pushed.

See changelog 0017 (D-054).
