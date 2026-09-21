# Asana conventions: how the founder runs projects and tasks

```
status: current (structure and conventions); draft where marked (HOY identity, Dropbox tree)
since: 2026-09-21
source: six Asana CSV exports shared by Justin Massion in Slack #import-asana, 2026-09-21 (prompt 0015, two messages 17:05 and 17:07 UTC); de-identified copies in `../source/asana/2026-09-21/`
```

Why this file exists: the Work views (W-01 / W-02) must match or beat Asana for the team (`tools-in-use.md`), the importer behind K-06 has to read these exports, and Justin's stated goal is to generate the project documents in or through Aluzina OS. This is what the exports show about how the founder (Alejandra Guerra, "Aleja Guerra lotero" in Asana) actually works. Task names are kept in her wording and language; Spanish is the default, English leaks in.

Row counts below are logical CSV data rows (one per unique 16-digit `Task ID`), verified with Python's `csv` module against each source file; a raw line count overstates every one of these totals because several `Notes` cells hold multi-paragraph text with embedded line breaks.

## The six exports at a glance

| Project | Created | Tasks | Sections | Role |
| --- | --- | --- | --- | --- |
| ALUZINA WORKFLOW FOR EVERY PROJECT | 2023-07-19 .. 2023-11-05, still edited (13. COCINA modified 2026-07-28) | 349 | Untitled section, INFORMACION DE CLIENTE, INTRODUCCION, PAGOS DE CLIENTES, DISEÑO, PLANEACION, COTIZACION, PRODUCCION, COMPRAS DE MATERIAL DE OBRA, PISOS | The standard workflow, in Spanish. It is a real 2023 residential project (client note "JOE AND CHUCHO"; vendors Alejandro, Fredy, Federico, Semco, Orion, Rocsana in task names) that became the template by being duplicated. |
| WORK CHRONOGRAM ALUZINA ENGLISH | 2023-07-18 .. 2023-07-19, edited to 2026-05-17 | 168 | DESIGN, QUOTATION, PRODUCTION | The English twin of the standard workflow: older (one day earlier), shorter, and the source of HOY's English-language pieces. |
| PROYECTO HOY | all 212 tasks created 2026-05-29; one edit 2026-09-21 | 212 | Cierre de cliente Primer pago de diseño, DISEÑO, COTIZACION, PRODUCTION | A current client project: the Spanish workflow's DISEÑO / COTIZACION / PRODUCCION trees plus pieces of the English chronogram, merged and lightly adapted (see below). |
| PROYECTOS ALUZINA SEPTIEMBRE-DICIEMBRE 2026 | 2026-09-07 | 18 | SPORTI, BOSQUES DE LA CONCHA, SODIME, REDES SOCIALES, CONCURSOS, ACTIVACION DE PRESENCIA EN MUNDO DEL DISEÑO | Portfolio board for the quarter: sections are clients or initiatives, each task is one vendor job with a fixed form in its notes. |
| PRODUCCION FOTOGRAFICA DE PRODUCTOS | 2025-01-09 | 10 | Untitled section | Flat checklist for a product photo shoot; three contract tasks completed the same day. |
| LUMINARIAS ALUZINA 2026 | 2026-02-23 | 12 | CLIENTES OBJETIVOS, VISORES, LUMINARIAS | Product-line work: suppliers ECO LUZ (NDA, production feedback, unit pricing at 1 / 20 / 60 units) and DECOILUMINAR (production for "18 ALMAS RETIRO"), viewers (CAJA with ADHESIVOS, LIBRO), one named target client. |

## Structural conventions seen in every project

1. **Sections mean whatever the project needs.** Phases in a client project (DISEÑO → COTIZACION → PRODUCCION), clients in the portfolio board, workstreams in the product-line project, nothing at all in the checklist ("Untitled section"). In the Spanish workflow, "Untitled section" is also the dumping ground for about 55 dated one-off tasks from 2023 (`Botanic arrival`, `KITCHEN ARRIVAL`, `pago de chapa negra`, and `RECTA FINAL :` whose note is a 62-item punch list pasted as text).
2. **Hierarchy is deep and hand-numbered.** Subtasks nest up to five levels: DISEÑO → `6. PRIMERA REUNION DE DISEÑO CON EL CLIENTE` → `9. Buscar los referentes ...` → `ZONE  5: Cocina` → `MODUL 1.  ISLAN`. Numbering lives in the task name (`1.`, `13. 2`, `A.`, `a.`, `ZONE 1 :`, `MODUL 1.`) and drifts: the second client meeting is `7.` in the workflow and `12.` in the English chronogram, `16.` is used for both `Accesorios de bano` and `Tecnologia`, `19.` twice, `13.` twice at different depths. The number is an ordering hint, not an identifier.
3. **Native fields are barely used.** Assignee: the founder on roughly one task in fifteen (14 of 212 in HOY), Saray (`team.md` spells her Sarai) on one (`3. 2D Acad Model`, the only HOY edit since creation, 2026-09-21). Due dates: on most top-level tasks of the 2023 projects, none in HOY or the portfolio. Start date, tags, `Blocked By` / `Blocking`: never. Completed: rarely; progress is tracked in meetings and WhatsApp, not by ticking Asana.
4. **Custom fields exist but hold almost nothing.** HOY carries `DELVERY DATE`, `OBSERVATONS`, `COMENTARIOS`, `octobre` and eleven `SEMANA 1..5` columns (three month-blocks of weeks: a hand-made timeline grid). The only values in the whole export are `octobre = "M, T, W"` on `5. Experiencia de Usuario en cada espacio`, `OBSERVATONS` / `COMENTARIOS` on `2. Compra de canilla ...` ("La cotización sería el pantallazo de Mercado Libre", "Para comprar sería directamente por Mercado Libre") and `REUNION SEMANAL lunes` → "Listo lunes a las 9 am". The English chronogram carries a `Status` field used exactly once (`Complete` on `1. Investigations`).
5. **The Notes field is the real database.** Five uses: (a) the brief or rationale, e.g. the definition of the first client meeting under `6. PRIMERA REUNION DE DISEÑO CON EL CLIENTE` ("... para alinearnos con sus espectativas y el con las nuestras ..."); (b) supplier specification, e.g. `AREA SOCIAL EN CASETONES` (variable-white vs 2.500 K LED tape, black `Perfil led duo angulo`, `perfil led elegance` IP67 in the planters); (c) a structured form, one per vendor job in the portfolio board (below); (d) attachments as `get_asset` links; (e) whole lists pasted as text (`RECTA FINAL`, the 12-space botany list under `7. Botanica`, `LISTA ESPACIOS`).
6. **Templates by duplication — one per language.** There are two template projects, both from July 2023: WORK CHRONOGRAM ALUZINA ENGLISH (2023-07-18, 168 tasks, DESIGN / QUOTATION / PRODUCTION) and ALUZINA WORKFLOW FOR EVERY PROJECT (2023-07-19, 349 tasks, Spanish, DISEÑO / COTIZACION / PRODUCCION). Both were edited on 2026-05-17, twelve days before HOY was created from them. Every HOY task carries `Created At 2026-05-29`: both templates were duplicated and merged into it whole, then trimmed. Asana's template feature is not used; the templates are living projects still being edited.
7. **People outside the team are text, not users.** Vendors and contractors appear as `ENCARGADO:` in notes or inside task names (`Terraza federico`, `Apartment , semco`, `Fredi bano principal`, `Instalación Federico Piso terraza`). Only the founder and Saray have Asana accounts in these exports.
8. **Language drifts, and now we know why.** Spanish by default; English leaks in whole blocks (section `PRODUCTION` in HOY, the 16-trade `PROVEETORS` / `PROVEDORES` list `1. Demolition .. 16. Metalmecanic`, `23. Final details`, `25. Client deliver`, `1. beds`, `2. night table`, `MODUL 5. LOUNDRY`) because a second, English-language template exists and HOY draws on both (see below). Spellings vary (`Canchados` = regatas / chasing, `Movencion`, `basiado`, `DELVERY`, `OBSERVATONS`, `Alsado`, `fabrir`). Trailing spaces in most names. An importer must match fuzzily and never key on names.
9. **Money is COP with dot thousands** (`VALOR:15.000.000`, `PROFIT ALUZINA:500.000`); one USD line (`520 Dolares- 1.820.000`). Dates in notes are `dd/mm/yyyy`.
10. **Attachments and comments are outside the export.** Asset links point at Asana storage; the founder also sends references over WhatsApp ("Sorry te lo envie por whats app pero olvide ponerlo aca").

## The standard workflow, phase by phase (ALUZINA WORKFLOW FOR EVERY PROJECT)

Wording is hers; numbers as in the export.

- **INTRODUCCION**: `Instalarse en el sistema`, `Establecer fechas importantes`, `Establecer documento compartidos con clientes` → `Carpeta en dropbox con actualizacion de imagenes y planos`, `CONTROL FINANCIERO GOOGLE DRIVE`, `ASANA flujo de trabajo`.
- **INFORMACION DE CLIENTE**: `Detalles importantes del cliente`, one task per client ("Please upload a picture of you and chucho").
- **PAGOS DE CLIENTES**: design fee in three payments (`Primer pago de diseño de interiores junio 6.333.000`, `segundo pago julio`, `Tercer y último ... 6.333.000`) plus `Administración de pagos primeros 5 días del mes 8.000.000` (monthly execution administration, "for only one month more").
- **DISEÑO** (11 top-level tasks): `1. Investigacion`, `2. Conceptualizacion`, `3. 2D Acad Model`, `4. Definir zonas y areas` (ZONAS / AREAS), `5. Experiencia de Usuario en cada espacio`, `6. PRIMERA REUNION DE DISEÑO CON EL CLIENTE` with `7. Ubicar el punto del proceso en el que vamos en la presentacion con cliente`, `8. MOOD BOARD` (`A. COLORES`, `B. MATERIALES`, `C. IMAGEN RELEVANTE`, `D. TEXTURAS`), `9. Buscar los referentes ... sketch` per zone (`ZONE 1 : Entrada` .. `ZONA 11 : Terraza`, kitchen split into `MODUL 1..5`, bedrooms into ROOM / BATH ROOM / STUDI / FITTING ROOM), `10. Esquema de referencia de la intencion de Iluminacion`, `11. Alsado tridimencional del espacio interior para tener el contenedor`; `7./12. SEGUNDA REUNION DE DISENO CON EL CLIENTE` with `12. Ubicar el punto del proceso ...`, `13. Modelado tridimencional del diseno` (`13. 1 MODELADO DE CADA ESPACIO`, `13. 2 2D planos del espacio con todo especificado`, `13. 3 Diseño de mobiliario que se va a fabricar modelo 3d para aprobacion` a..h, `13. 4 Especificacion de mobiliario y detalles que se van a comprar`), `13. DISENO A PROFUNDIDAD DE CADA ESPACIO` with nine lenses applied to every room (`1. Atmosfera`, `2. Circulacion`, `3. Ventilacion natural y artificial`, `4. Iluminacion natural y artificial`, `5. Cerramientos`, `6. Color`, `7. Acabados`, `8. Mobiliario`, `9. Detalles`), `14. MIGRAR las imagenes 3d ... a la presentacion, remplazando los referentes por las creaciones del estudio`, `15. DISENO LUMINICO` (`Diseno luminico en cuanto a requerimientos y sensaciones`, `Plano electrico`, `Luminarias en cada espacio descrita`, `Plano luminico entero`); `8. ENVIO DE PRESENTACION` → `Entrega de modelo 3D`; `9. DISEÑO LUMINICO` (Plano Electrico); `10. DISENOS REQUERIDOS PARA SEMCO` (shop drawings for a fabricator: planter, bed, bathroom door and vanity).
- **PLANEACION**: `Estructuracion de asana de produccion`, `Cronograma de trabajo` → `ASANA COMPARTIDO CON CLIENTE`, `EXCEL CON REPORTE GENERAL`; `REUNION SEMANAL lunes` (9 am).
- **COTIZACION**: `1. Todos los elementos de diseno migrados a EXCEL a la cotizacion formal`, `2. Contactar los proveedores de cada elemento de obra con las especificaciones de diseno para que hagan sus cotizaciones` → the 16 trades `1. Demolition, 2. Plumber, 3. Electrician, 4. Ceiling, 5. Floor, 6. Builder cement/drywall, 7. Plating, 8. Dry wall, 9. Instalation of elements, 10. Windows and doors, 11. Closing of everything, 12. wallpaper and painting, 13. Online buying, 14. Lighting installation, 15. Wood and furniture, 16. Metalmecanic`.
- **PRODUCCION** (per trade, numbered 0..23): `0. Mantenimiento de techo`, `1. Demolicion`, `2. Canchados` (electricidad, plomeria, ventilacion, domotica), `3. Tirado de tuberias de ventilacion, de plomeria, y gas`, `4. Mamposteria`, `5. Contratacion de proveedores de metalmecanica y Carpinteria`, `6. Puertas vidrieras y tragaluces`, `7. Botanica` (12 spaces), `8. Plomeria`, `9. jacuzzi`, `10. Techos`, `11. ELECTRICIDAD` (0..11), `12. PISOS y CAMA EN CONCRETO`, `13. COCINA`, `14. INSTALACION Y APLICACION ACABADOS`, `15. CERRAMIENTOS`, `16. Accesorios de bano`, `16. Tecnologia`, `17. Iluminacion` (perfiles led por espacio, switches domoticos y dimmer, `6. Iluminacion decorativa ALUZINA` = the studio's own luminaires), `18. Aviso luminoso en neon en lavanderia`, `19. Mobiliario` (Metalmecanica, Carpinteria, Comprados de almacenes, Sofa), `20. Elementos comprados por internet`, `21. Arte`, `22. Detalles de casa`, `23. ROCSANA BOTÁNICA`; plus `MOVENCION DE TODOS LOS ELEMENTOS EN CASA` at the start.
- **COMPRAS DE MATERIAL DE OBRA**: `14. ACABADOS` again, as purchases (`1. Baldosa balcon alfa` .. `11. LADRILLO NEGRO ...`), and a bathroom purchase task. The same eleven finishes appear under PRODUCCION with an `Instalacion` prefix: one spec item, two states (bought, installed). This is the playbook's purchase ladder QUOTED → INSTALLED expressed as two sections.
- **PISOS**: one task per calendar day (`secado piso` 2023-09-07 .. 2023-09-24, `mover concreto con pluma`, `cubrimiento con plastico y carton`): daily tasks used as a Gantt bar for curing time.

Two axes cut across the phases: **zones** (ZONE 1..11 with their modules) and **trades** (the 16-item list). Both recur in DISEÑO, COTIZACION and PRODUCCION. Compared with the playbook (`service-playbook.md`), the DISEÑO phase maps onto 03 stages 05-17 and PRODUCCION onto E stage 6, but the Asana tree is organised by trade while the playbook's execution sequence is by order of work.

### The English chronogram (WORK CHRONOGRAM ALUZINA ENGLISH)

The same workflow, one day older and in English: **DESIGN** 1-5 (`Investigations`, `Conceptualization`, `2D Acad Model`, `Define Areas and Zonifications`, `User experience in each space`), `First Design Meeting with the Client` → `7. DESIGN EACH SPACE WITH ITS REQUIRMNTS` (ZONE 1 ENTRANCE .. ZONE 10 CINEMA, kitchen `MODUL 1-5`, GUEST ROOM 1-3, MASTER BED ROOM 1-2), `8. LIGHTING DESIGN`, `9. DESIGN OF FURNITURE THAT WE ARE NOT GOING TO SPECIFY OR BUY`, `10. 3D MODELING`, `11. MERGE INFROMATION OF DESIGN IN THE PRESENTATION ...`; `Second Meeting with the Client` → `12. Design correction in the 3d model ...` (1-3), `13. LAST PRESENTATION TO DELIVERE` with `EACH SPACE MUST DESCRIBE:` the same nine lenses as the Spanish version (Atmosphere, Circulation, Ventilation, Lighting, Closures, Color, Finished, Furniture, Detail); `Delivere of Presentation` → `LAST PAYMENT OF THE DESIGN` → `Entrega de modelo 3D`. **QUOTATION**: `1.ALL THE DESIGN ELEMENTS MIGRATE IN THE FORMAT OF QUOTATION TO EXCEL`, `2. CONTACT PROVEEDORS ...` → `PROVEETORS` 1-16. **PRODUCTION** 1-24: Demolition, court (= canchados: electric, "lumbert", ventilation, domotic), mamposteria, Contact providors of Metalmecanic and furniture, Botanic, Plumber, `WATHER FALL`, Cellings, ELECTRICITY (1-10), FLOOR, ENCLOSURE, kitchen, finishes, `14. Bathroom accessories` (lavatory, wasbasin, dispenser soap, dispenser fragance, hands dryer), `15. Adhesivos y avisos` (aviso luminoso BROOKLIN en exterior, intervension grafica en fachada, señalizacion interna), Technology (incl. `pantalla con animacion y logo`), Lighting, Furniture (Metalmecanic: librari, Cinema; Wood made: beds, night table, Cinema, Studio, Bar; Buying from store), Internet buyings, Art, `21. Final details`, `22. Final arrengment`, `23. Client deliver`, `24. Client correction in space`.

Due dates only on DESIGN 1-5 and the two meetings (July 2023); assignee the founder on the DESIGN top level only; no dependencies, no tags. A `Status` custom field exists only in this project (`Complete` once, on `1. Investigations`). `15. Adhesivos y avisos` (the BROOKLIN sign, facade graphics, internal signage) and `pantalla con animacion y logo` are commercial-project items absent from the Spanish version — this template was clearly built for a different (non-residential) job than the Spanish one, even though both were duplicated into the same client project (HOY).

## PROYECTO HOY against the templates

- **Copied from the Spanish workflow**: the whole DISEÑO, COTIZACION and PRODUCCION trees, including the ZONE 1..11 list, the furniture a..h, the luminaire list, the LED note, `2. Terraza federico` and `1. Apartment , semco`.
- **Taken from the English chronogram** (not HOY-specific): section name `PRODUCTION`, `LAST PAYMENT OF THE DESIGN` → `Entrega de modelo 3D`, `PROVEETORS`, `16. Accesorios de bano` (a Spanish rendering of the English `14. Bathroom accessories`: lavatory, washbasin, soap dispenser, fragrance dispenser, hand dryer), the closing steps `23. Final details`, `24. Final arrengment`, `25. Client deliver`, `26. Client correction in space`.
- **Found in neither template**: the first section `Cierre de cliente Primer pago de diseño` (`CONTRATO`, `FACTURACION`, `SUBIR FOTOGRAFIAS DE ESPACIO Y REFERENCIA A DROPBOX`); `9. Muro lloron y jacuzzi` merges the English `7. WATHER FALL` with the Spanish `9. jacuzzi`; Saray's assignment on `3. 2D Acad Model`.
- **Dropped**: INTRODUCCION, INFORMACION DE CLIENTE, PAGOS DE CLIENTES, PLANEACION, COMPRAS DE MATERIAL DE OBRA, PISOS, the `15. DISENO LUMINICO` subtree, `9. DISEÑO LUMINICO`, `10. DISENOS REQUERIDOS PARA SEMCO`, `MOVENCION ...`, the botany space list, all dated one-offs, all due dates.
- **Renamed**: PRODUCCION → PRODUCTION; `12. PISOS y CAMA EN CONCRETO` → `12. PISO`; `14. INSTALACION Y APLICACION ACABADOS` → `14. ACABADOS`.

```
status: draft
since: 2026-09-21
source: inference from the three exports; to confirm with the founder
```

Either HOY has not been adapted yet (the 2023 vendor names `federico` and `semco` and the 2023 LED note survive verbatim, which points this way) and every other difference traces to the English template, which points this way, or these zones really are HOY's. `clients.md` records HOY as **HOY Wellness Center, past client**; Justin calls HOY "a current project/client" and the Asana tree is shaped like a residence with a cinema, bar and guest room. Not reconciled here; both facts kept, question filed in `kanban.md`.

## The portfolio board (PROYECTOS ALUZINA SEPTIEMBRE-DICIEMBRE 2026)

Sections are clients (SPORTI, BOSQUES DE LA CONCHA, SODIME) or initiatives (REDES SOCIALES, CONCURSOS, ACTIVACION DE PRESENCIA EN MUNDO DEL DISEÑO). Each client task is a **vendor job** whose note is a fixed form:

```
ENCARGADO: <person or company doing the work>   (EMPRESA: <company> when the person is an engineer of one)
VALOR: <COP>                                    (or VALOR CINTA LED CON ENVIO, or "Aun no hay valor")
PROFIT ALUZINA: <COP or 0>
PRIMER PAGO: <date and amount> / SEGUNDO PAGO: Contra entrega   (or UNICO PAGO, PAGO REALIZADO)
FECHA DE COMIENZO: <date or text>
FECHA DE ENTREGA: <date or "No aplica">
DESCRIPCION: <scope>                            (sometimes)
RESPONSABILIDAD DE ALUZINA: <role>
```

`RESPONSABILIDAD DE ALUZINA` vocabulary: `Comunicacion fluida entre encargado y cliente`, `Alineación con los otros proveedores`, `Supervision`, `Compra`, `Ejecución de página web`, `Contratación y entrega`, `Acompañamiento de proveedor`, `styling una vez lleguen las cosas`. Payment pattern: a first payment (about half, e.g. 1.300.000 on 2.600.000) and the rest `Contra entrega`. `PROFIT ALUZINA` is 0 on most jobs (pass-through coordination) and explicit on two (500.000 on 15.000.000; 1.300.000 on 11.000.000). One subtask (`COMPRA DE ILUMINACION` under `INSTALACION DE ILUMINACION`) shows a purchase nested under an installation job. `LINKS PROYECTOS` holds two Dropbox folders; `PLAN DE ACCION` a selav.io link; `PROCESO DE PAGINA WEB` a Lovable project (token redacted). Twelve `ENCARGADO` entries appear across the 18 tasks (Stiven Peña, Lucho, Silvana y Saray, Jorge Escobar, Ingeniera Paula Andrea Palacio of Parasoles Tropicales, Stiven, Miguel, Alejandra Guerra x2, PPBINGENIERIA, Alejandro Contratista, Laura Lezcano); four of the 18 tasks (`REDES SOCIALES ALUZINA`, `LINKS PROYECTOS`, `ILUMINACION`, `ESPACIOS`, `FERIAS DE DISEÑO DEL MUNDO`) carry no ENCARGADO form at all — they are section-level links or empty placeholders under CONCURSOS / ACTIVACION.

Consequence: Sporti, Sodime and Bosques de la Concha have **active jobs in Sep-Dec 2026**, whereas `clients.md` lists Sporti and Sodime as past. Bosques de la Concha does not appear in `clients.md` at all. Noted there, not changed.

## Where Dropbox, Drive, Excel, Canva and WhatsApp sit in the same flow

```
status: current for what the exports say; draft for the folder tree
since: 2026-09-21
source: workflow INTRODUCCION / PLANEACION / COTIZACION tasks, HOY kickoff section, portfolio LINKS PROYECTOS; Justin's note on Canva (prompt 0015)
```

- At kickoff the founder creates a **Dropbox folder** (`Carpeta en dropbox con actualizacion de imagenes y planos`; HOY: `SUBIR FOTOGRAFIAS DE ESPACIO Y REFERENCIA A DROPBOX`), a **Google Drive** sheet (`CONTROL FINANCIERO GOOGLE DRIVE`) and shares the **Asana** project with the client (`ASANA COMPARTIDO CON CLIENTE`).
- PLANEACION adds an **Excel** general report (`EXCEL CON REPORTE GENERAL`) and the weekly Monday meeting; COTIZACION step 1 is the **Excel** formal quote (`Todos los elementos de diseno migrados a EXCEL a la cotizacion formal`).
- The client presentation (mood board, references per zone, then the studio's 3D replacing the references, and the recurring `Ubicar el punto del proceso` slide) is built outside Asana; Justin: **Canva** is where many documents are made.
- References and photos travel over **WhatsApp**; Asana notes hold what got copied back.
- Expected per-project Dropbox contents, from the tasks that produce files: fotos de espacio y referencia, planos 2D (AutoCAD), modelo 3D, mood board, presentación, planos eléctrico y lumínico, planos de mobiliario a fabricar, cotización Excel, control financiero, reporte general. The actual standardized Dropbox tree is `_unknown_` until the drive-scraping intake lands.

## What this implies for Aluzina OS

**Data model** (extends D-020 / D-033 entities):

- Project → Phase (= Asana section) → task tree of arbitrary depth with an explicit `order` per sibling; the hand numbering becomes a rendered sort key, never part of the title.
- A per-project **Zone** entity (ZONE 1..11 with modules) and the **trade** list as a registry, both usable as task facets; the same task can be seen by phase, by zone or by trade.
- A **spec item** (finish, luminaire, piece of furniture) that moves QUOTED → APPROVED → PAID → ORDERED → RECEIVED → INSTALLED (playbook E-5); `14. ACABADOS` in two sections is this ladder done by hand.
- A **vendor job** record with the portfolio form as columns: `encargado` (supplier or contact), `empresa`, `valor`, `profitAluzina`, `payments[]` (amount, due, paid), `startDate`, `deliveryDate`, `description`, `aluzinaResponsibility` (enum from the vocabulary above). Maps onto `purchases` + `suppliers` + `payments`; the margin field is new.
- **Payment schedule** rows for the design fee (thirds in 2023; first and last payment in HOY) and monthly administration fees.
- A **project template** entity with "create project from template" that copies the tree and asks which zones and phases apply, so 2023 residue cannot leak into a 2026 project — one template with `en` / `es` labels per task, not two projects to keep in sync.
- External people as `suppliers` / contacts, never users; notes as rich text with attachments (Asana asset links need re-upload).
- The `SEMANA` grid is a timeline; W-01's timeline replaces it.

**Importer (K-06)**: read the standard Asana CSV; resolve `Parent task` by name within the same project and creation order (names repeat: `ROCSANA BOTÁNICA` x4, `Entrega de modelo 3D` x2, a blank-named parent ` `); trim names; keep `Task ID` as `externalId`; map `Section/Column` to phase; ignore empty custom fields; convert `octobre = "M, T, W"` to weekdays; treat `Notes` forms (`KEY: value` lines) as candidate structured fields.

**Documents the data says the OS can generate**

| Moment in the workflow | Document today | OS page today | Status |
| --- | --- | --- | --- |
| `CONTRATO`, `FACTURACION` (Cierre de cliente) | contract, invoice | O-08 documents, A-04 proposals | template-ready |
| Kickoff | Dropbox folder, Drive control financiero, shared Asana | none (playbook G-02 folder tree `_unknown_`) | defined |
| `6.` / `12.` reuniones con el cliente | Canva presentation: `Ubicar el punto del proceso`, `MOOD BOARD` A-D, referentes por zona, 3D | G-03 presentations; C-01 journey for the process slide | defined; process slide is an automation candidate |
| `15. DISENO LUMINICO` | plano eléctrico, plano lumínico, luminarias por espacio | none (lighting plan `defined` in `deliverables.md`) | defined |
| COTIZACION 1 | Excel cotización formal from `13. 4`, `14. ACABADOS`, `17. Iluminacion` | O-05 budget and quote comparison | template-ready, no generator |
| COTIZACION 2 | RFQ packet per trade (16) with the design specs | O-04 quotes | defined |
| PLANEACION | cronograma (SEMANA grid), Excel reporte general | W-01 timeline, O-10 reports | template-ready |
| Portfolio board | vendor job sheet, payment schedule, margin report | O-12 purchasing, C-05 payments | fields missing (`profitAluzina`, `aluzinaResponsibility`) |
| `RECTA FINAL`, `26. Client correction in space` | punch list, acta de entrega y correcciones | O-13 site reports; punch list `defined` | defined |
| Photo shoot | contratos con modelos, fotógrafo, empresa; permiso de locación | O-08 documents | defined |
| Luminarias | NDA proveedor, pricing sheet 1 / 20 / 60 | none | defined |

## Not yet known

- Whether PROYECTO HOY is HOY Wellness Center and whether the ZONE list is HOY's or 2023 residue.
- Which Asana plan the studio is on and whether comments and attachments can be exported.
- The standardized per-project Dropbox tree (Justin: it exists) and the Canva document types.
- Sarai / Saray: the Asana account spells it Saray; `team.md` keeps the founder's Sarai until she confirms.

## Change log

- 2026-09-21: created from six Asana exports (Slack #import-asana, Justin Massion; prompt 0015, changelog 0017, D-054; analysis Fable 5.1, files Sonnet 5).
- 2026-09-21: **this file is now implemented, not only recorded** (prompt 0017, changelog 0020, D-062 / D-063; design Fable 5.1, code Opus 5). The two template projects are merged into one bilingual template, `apps/hub/src/domain/templates/aluzina-workflow.ts`, whose header lists exactly what of the 2023 residue is left behind; W-03 (`/<founder|ops>/work/new`) creates a project from it, generating the zone-scoped subtrees once per chosen zone. The importer this file specified is `scripts/import-asana.mjs` (`npm run import:asana`): it resolves `Parent task` by trimmed name in file order (a contiguous run of children belongs to one candidate), keeps each `Task ID` as `tasks.externalId`, maps `Section/Column` to `sections`, and writes `apps/hub/src/data/seed/asana/hoy.ts` (PROYECTO HOY: 212 tasks, 4 sections, 170 nested, 19 linked to a deliverable) and `portfolio.ts` (18 vendor jobs from the note form). Two things this file called for are still open: the vendor-job fields on `purchases` (O-12) and the founder's answers on HOY's identity and zones, which the project summary keeps visible (D-063).
