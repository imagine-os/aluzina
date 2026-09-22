# Project archive (Dropbox)

status: current
since: 2026-09-21
source: Dropbox shared folders from Justin Massion, Slack #past-projects 2026-09-21 16:35 UTC (prompt 0017); crawled read-only with `scripts/archive/crawl-dropbox.mjs`, indexed and redacted with `scripts/archive/build-index.mjs` (D-058, D-059); machine-readable twin: `docs/archive/index.json` and `docs/archive/projects/<slug>/index.json` (19 deep indexes: JOE GALLINA INTERIOR and the 18 folders of PROYECTOS 2026, ar-06)

What Aluzina's Dropbox holds as far as the four share links show it: 187 project-level folders in 8 groups, 1444 files and 245 subfolders at the first level inside them, about 21.4 GB of listed sizes (Dropbox display values, so approximate; the inventory is one level deep, the 19 deep indexes go to every file). **Everything in the "inferred type" and "status" columns is inferred** from the folder name and the year folder (D-060); the founder has not confirmed any of it. Names are the studio's folder names verbatim; file names that identify a personal or financial document are replaced by their type (D-059).

## How the archive is organised (observations)

- **One folder per year, one folder per project.** Link C is named "PROYECTOS ALUZINA 2019 2023" but holds the year folders 2020, 2021, 2022, 2024 and 2025 next to the 2019-2023 projects; link B is 2026 on its own. Two project folders sit at the root of link C next to the year folders (LIFE VIOLETA VILLA with eight subfolders, SANTIAGO AGUIRRE ILUMINACION).
- **Numbering conventions change by year.** 2020-2021 use a running counter with a `0_` prefix (`0_69` .. `0_112`, continuing across years); 2022 and 2024 have no numbers; 2025 restarts at `01` .. `038`; 2026 restarts at `01_` .. `019_` (with `010_`, `011_` and a typo-style `1O` in older folders). The number is the order the studio opened the project in, and `domain/archive.ts` (`folderNumber`, `compareFolderPaths`) keeps that order in the product.
- **Inside a project the 2026 folders follow a template** (all 18 are deep-indexed since ar-06: 754 files across the 19 deep indexes; the template folders `04_COTIZACION DEL ESPACIO`, `06 CONTRATOS`, `08 DOCUMENTACION IMPORTANTE`, `09 CONSIGNACIONES`, `PAGOS` and `COTIZACIONES DE PROVEEDORES` are private (R2) and were never downloaded; site photos named `WhatsApp Image …` stay unpreviewed under R1): `00_PRIMERA PROPUESTA`, `01 FOTOGRAFIA Y VIDEO DEL ESPACIO`, `02 PRESENTACION DE DISEÑO DEL ESPACIO`, `03 PLANOS DEL ESPACIO`, `04_COTIZACION DEL ESPACIO`, `05 CRONOGRAMA DE OBRA`, `06 CONTRATOS`, `07_ FOTOGRAFIAS DE OBRA Y AVANCE`, `08 DOCUMENTACION IMPORTANTE` … (CARTAGENA COPETRAN, HOY: 13 subfolders each). The featured 2023 project uses `DISEÑO/00_FENG SHUI` .. `011_MODELOS` plus `ADMINISTRATIVO Y FINANCIERO`, `suppliers and financial status` and `CIERRE DE PROYECTO`. Older folders (2020-2022) mostly hold loose files at the top level (quotations, plans, renders, spreadsheets).
- **Quotation-only folders** (`COTIZACION HELADERIA` 2022, `011 COTIZACION LUMINARIA CORAZON` 2025) are the studio's record of a prospect: seeded as `proposal-sent` projects on the Prospects shelf (D-060). One **admin folder** (`FACTURAS DE VENTA Y CUENTAS DE COBRO 2022`) is not a project: its files are posts in the Spaces area "Administrativo".
- **Container folders** that are not projects: `PROYECTOS ALUZINA 2020 GRAFICOS`, `PROYECTOS 2021 SEGUNDO SEMESTRE` (noted in the data; confirm).
- **Empty folders** (3 after the ar-16 re-check of 2026-09-21: `01 DISENO GRAFICO  SER INTERIOR` (2025), `08 DISENO INTERIOR juan` (2025), `0_72 LONDON CITY BARBER SHOP` (2020)). The other 12 folders the first pass had listed as empty were not: the Dropbox viewer had shown them before their grid loaded. Re-listed with their files: 06_YOLIMA CLIENTA 5, 08_HONEY VALLEY LUMINARIA 83, 09_LINA TABARES 7, 017_HUG 12 (2026, now deep-indexed); 07 IMAGENES EL SILENCIO DE LOS PAJAROS 2, 016 APARTAMENTO VALENTIN RAMOZ 8 + 1 folder (2025); ACABADOS Y FORMAS 1, ESPACIO COLIN MEDELLIN 11 (2024); 0_93 FINCA ANTIOQUIA ILUMINACION 16 (2021); 0_83 REVERDESER 5 (2020); FABI SOPETRAN 1, NEW YORK HOUSE 70 + 1 folder (2019-2023). Either the three remaining folders were created ahead of the work or it lives elsewhere; confirm with the founder.
- **Duplicates / continuations across years** (noted in the data, confirm with the founder): 05_SODIME (2026); 08_HONEY VALLEY LUMINARIA (2026); 18_ALMA PRANA 2026 (2026); 019_ SIMON CALERA (2026); 05 SANTIAGO AGUIRRE ILUMINACION (2025); 07 IMAGENES EL SILENCIO DE LOS PAJAROS (2025); 014 EL ENCANTO (2025); 028 NATALIE KENEDY OFFICE AND TERRACE (2025); 034 ALMA PRANA (2025); 037 PARQUE BONNY NORIEGA (2025); CALERA EL SILENCIO DE LOS PAJAROS (2024); CASA JORGE Y LIGIA (2024); DESARROLLO DE ILUMINACION (2024); EL ENCANTO (2024); LIGIA Y JORGE (2024); PORTAL DEL VALLE NATHALY KENEDY (2024); SEGUNDO PROCESO DE VILLA VERDE (2024); SIMON CALERA (2024); UPPERTRIP (2024); UPPERTRIP TUBO 2024 (2024); 0_ APARTAMEMTO PAOLA JIMENA (2022); SHABELA FOTOS (2022); SHAVELA (2022); 0_95 APTO PAOLA (2021); 0_103 COASSIST 2021 (2021); 0_107 PROYECTOS BONNY (2021); 0_108 PUNTO COMERCIAL UPPER TRIP (2021); 0_112 VILLA VERDE (2021); SHABELA CHARCUTERÍA NECOCLI 2021 (2021); 0_73 COASSIST TERMIAL DE EL SUR 2020 (2020); 0_79 SODIME producciom (2020); BONNY JUEGO NUBE (2019-2023); SANTIAGO AGUIRRE ILUMINACION (root).
- **WhatsApp images and quotations dominate the small folders**; plans (dwg / pdf), renders (jpg / png), Illustrator sources (ai) and spreadsheets (xlsx) are the studio's working formats. File types at the first level: jpg 446, pdf 416, ai 100, xlsx 93, png 69, jpeg 65, jfif 29, mp4 28, docx 23, mov 21, psd 20, heic 17.

## Inventory per year folder

Columns: project folder (verbatim) | year | inferred type | inferred status | files | subfolders | main types (first level) | latest modified | note. Kind other than "proyecto" is shown in the note.

### PROYECTOS 2026 (link B) — 18 folders

| Project folder | Year | Inferred type | Inferred status | Files | Subfolders | Main types | Latest modified | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01_ CARTAGENA COPETRAN | 2026 | comercial | en curso (contratado) | 37 | 11 | pdf 28, jpg 3, jpeg 3, xlsx 2 | 14 days ago | Proyecto destacado con índice completo: 37 archivos en 14 carpetas (11 de primer nivel), rastreado 2026-09-21; archivos fechados hasta 14 days ago. |
| 02_LINA ZAPATA | 2026 | comercial | en curso (contratado) | 26 | 0 | jpg 22, png 4 | — | Proyecto destacado con índice completo: 26 archivos en 0 carpetas (0 de primer nivel), rastreado 2026-09-21; archivos fechados hasta —. |
| 03_ANDRES Y ANDREA | 2026 | comercial | en curso (contratado) | 28 | 5 | jpeg 24, pdf 3, zip 1 | 9 days ago | Proyecto destacado con índice completo: 28 archivos en 5 carpetas (5 de primer nivel), rastreado 2026-09-21; archivos fechados hasta 9 days ago. |
| 04_DECERO | 2026 | comercial | en curso (contratado) | 5 | 2 | pdf 4, ai 1 | 2 months ago | Proyecto destacado con índice completo: 5 archivos en 3 carpetas (2 de primer nivel), rastreado 2026-09-21; archivos fechados hasta 2 months ago. |
| 05_SODIME | 2026 | comercial | en curso (contratado) | 76 | 3 | png 32, heic 23, mov 8, pdf 6 | 27 minutes ago | Proyecto destacado con índice completo: 76 archivos en 7 carpetas (3 de primer nivel), rastreado 2026-09-21; archivos fechados hasta 27 minutes ago. También aparece como 0_79 SODIME producciom (2020); posible duplicado o continuación, confirmar con la fundadora. |
| 06_YOLIMA CLIENTA | 2026 | comercial | en curso (contratado) | 5 | 0 | pdf 2, jpeg 2, png 1 | — | Proyecto destacado con índice completo: 5 archivos en 0 carpetas (0 de primer nivel), rastreado 2026-09-21; archivos fechados hasta —. |
| 07_PLAY SET | 2026 | comercial | en curso (contratado) | 46 | 3 | png 30, jpg 5, otf 2, ttf 2 | 4 months ago | Proyecto destacado con índice completo: 46 archivos en 10 carpetas (3 de primer nivel), rastreado 2026-09-21; archivos fechados hasta 4 months ago. |
| 08_HONEY VALLEY LUMINARIA | 2026 | iluminación | en curso (contratado) | 83 | 1 | jpg 60, png 18, pdf 4, webp 1 | 4 months ago | Proyecto destacado con índice completo: 83 archivos en 1 carpetas (1 de primer nivel), rastreado 2026-09-21; archivos fechados hasta 4 months ago. También aparece como DESARROLLO DE ILUMINACION (2024); posible duplicado o continuación, confirmar con la fundadora. |
| 09_LINA TABARES | 2026 | hospitalidad | en curso (contratado) | 7 | 0 | jpg 4, png 2, jpeg 1 | — | Proyecto destacado con índice completo: 7 archivos en 0 carpetas (0 de primer nivel), rastreado 2026-09-21; archivos fechados hasta —. |
| 010_HOY | 2026 | bienestar | en curso (contratado) | 206 | 13 | png 98, jpeg 41, jpg 30, pdf 24 | 19 days ago | Proyecto destacado con índice completo: 206 archivos en 19 carpetas (13 de primer nivel), rastreado 2026-09-21; archivos fechados hasta 19 days ago. |
| 011_SPORTI | 2026 | comercial | en curso (contratado) | 14 | 6 | pdf 9, png 1, jpeg 1, html 1 | 11 days ago | Proyecto destacado con índice completo: 14 archivos en 6 carpetas (6 de primer nivel), rastreado 2026-09-21; archivos fechados hasta 11 days ago. |
| 013_CASA DHARMA SAN PEDRO DE LOS MILAGROS | 2026 | residencial | en curso (contratado) | 5 | 2 | jpeg 4, pdf 1 | Last month | Proyecto destacado con índice completo: 5 archivos en 2 carpetas (2 de primer nivel), rastreado 2026-09-21; archivos fechados hasta Last month. |
| 014_ROBLE COLONIAL GUATAPE | 2026 | comercial | en curso (contratado) | 1 | 0 | pdf 1 | 11 days ago | Proyecto destacado con índice completo: 1 archivos en 0 carpetas (0 de primer nivel), rastreado 2026-09-21; archivos fechados hasta 11 days ago. |
| 015_POZO AZUL | 2026 | comercial | en curso (contratado) | 1 | 0 | pdf 1 | Last month | Proyecto destacado con índice completo: 1 archivos en 0 carpetas (0 de primer nivel), rastreado 2026-09-21; archivos fechados hasta Last month. |
| 016_Ecoluz, ILUMINACION | 2026 | iluminación | en curso (contratado) | 3 | 0 | pdf 3 | 2 months ago | Proyecto destacado con índice completo: 3 archivos en 0 carpetas (0 de primer nivel), rastreado 2026-09-21; archivos fechados hasta 2 months ago. |
| 017_HUG | 2026 | comercial | en curso (contratado) | 12 | 0 | png 10, pdf 1, skp 1 | — | Proyecto destacado con índice completo: 12 archivos en 0 carpetas (0 de primer nivel), rastreado 2026-09-21; archivos fechados hasta —. |
| 18_ALMA PRANA 2026 | 2026 | comercial | en curso (contratado) | 3 | 0 | pdf 3 | 11 days ago | Proyecto destacado con índice completo: 3 archivos en 0 carpetas (0 de primer nivel), rastreado 2026-09-21; archivos fechados hasta 11 days ago. También aparece como 034 ALMA PRANA (2025); posible duplicado o continuación, confirmar con la fundadora. |
| 019_ SIMON CALERA | 2026 | comercial | en curso (contratado) | 17 | 0 | jpg 17 | — | Proyecto destacado con índice completo: 17 archivos en 0 carpetas (0 de primer nivel), rastreado 2026-09-21; archivos fechados hasta —. También aparece como SIMON CALERA (2024); posible duplicado o continuación, confirmar con la fundadora. |

### PROYECTOS ALUZINA 2025 (inside link C) — 37 folders

| Project folder | Year | Inferred type | Inferred status | Files | Subfolders | Main types | Latest modified | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 DISENO GRAFICO  SER INTERIOR | 2025 | residencial | pasado (cerrado) | 0 | 0 | — | — | Carpeta vacía en el rastreo. |
| 02 ESPACIO LENCERIA | 2025 | bienestar | pasado (cerrado) | 3 | 0 | ai 1, pdf 1, jpg 1 | Feb 11, 2025 |  |
| 03 ILUMINACION MELISA LAVERDE | 2025 | iluminación | pasado (cerrado) | 4 | 0 | jpeg 2, ai 1, pdf 1 | Jan 30, 2025 |  |
| 04 MATRIMONIO SOFIA DURAN | 2025 | bienestar | pasado (cerrado) | 1 | 1 | pdf 1 | May 10, 2024 |  |
| 05 SANTIAGO AGUIRRE ILUMINACION | 2025 | iluminación | pasado (cerrado) | 8 | 0 | pdf 4, ai 3, xlsx 1 | Feb 1, 2025 | También aparece como SANTIAGO AGUIRRE ILUMINACION (root); posible duplicado o continuación, confirmar con la fundadora. |
| 06 PABLO ARANGO | 2025 | comercial | pasado (cerrado) | 1 | 0 | xlsx 1 | Jan 29, 2025 |  |
| 07 IMAGENES EL SILENCIO DE LOS PAJAROS | 2025 | comercial | pasado (cerrado) | 2 | 0 | png 2 | — | También aparece como CALERA EL SILENCIO DE LOS PAJAROS (2024); posible duplicado o continuación, confirmar con la fundadora. |
| 08 DISENO INTERIOR juan | 2025 | residencial | pasado (cerrado) | 0 | 0 | — | — | Carpeta vacía en el rastreo. |
| 09 TORRES CLARAS | 2025 | comercial | pasado (cerrado) | 8 | 0 | pdf 7, xlsx 1 | Feb 19, 2025 |  |
| 010 DENTALI | 2025 | bienestar | pasado (cerrado) | 3 | 3 | pdf 2, ai 1 | Feb 11, 2025 |  |
| 011 COTIZACION LUMINARIA CORAZON | 2025 | iluminación | prospecto (propuesta enviada) | 2 | 0 | pdf 1, xlsx 1 | Feb 19, 2025 | carpeta cotización |
| 012 CASA CATALINA AGUIRRE | 2025 | residencial | pasado (cerrado) | 6 | 0 | pdf 5, ai 1 | Feb 11, 2025 |  |
| 013 HANS WAGNER | 2025 | comercial | pasado (cerrado) | 2 | 0 | ai 1, pdf 1 | Feb 18, 2025 |  |
| 014 EL ENCANTO | 2025 | comercial | pasado (cerrado) | 0 | 3 | — | — | También aparece como EL ENCANTO (2024); posible duplicado o continuación, confirmar con la fundadora. |
| 015 APARTAMENTO MANUEL DE LIMA | 2025 | residencial | pasado (cerrado) | 2 | 0 | ai 1, pdf 1 | Feb 19, 2025 |  |
| 016 APARTAMENTO VALENTIN RAMOZ | 2025 | residencial | pasado (cerrado) | 8 | 1 | jpg 8 | — |  |
| 017 CASA GERMAN OYUELA | 2025 | residencial | pasado (cerrado) | 0 | 1 | — | — |  |
| 019 CASA HERMOSA ILUMINACION PRECIOSA | 2025 | iluminación | pasado (cerrado) | 26 | 0 | jpg 18, txt 5, mov 2, pdf 1 | — |  |
| 020 casa rustica iluminacio. | 2025 | iluminación | pasado (cerrado) | 8 | 0 | pdf 3, jpg 3, png 2 | — |  |
| 021 JAKE BIOFILIA Y LUZ | 2025 | iluminación | pasado (cerrado) | 10 | 0 | jpg 10 | — |  |
| 022 KIKE APARTAMENTO RETIRO | 2025 | residencial | pasado (cerrado) | 13 | 0 | jpg 11, url 1, mp4 1 | — |  |
| 023 SUTEX | 2025 | comercial | pasado (cerrado) | 14 | 0 | jpg 13, txt 1 | — |  |
| 024 EL CORTIJO CLIENTE IVAN | 2025 | comercial | pasado (cerrado) | 0 | 2 | — | — |  |
| 025 CRIKET | 2025 | comercial | pasado (cerrado) | 18 | 0 | jpg 17, pdf 1 | — |  |
| 026 CURSOS DE INTELIGENCIA ARTIFICIAL | 2025 | comercial | pasado (cerrado) | 1 | 0 | pdf 1 | Aug 20, 2025 |  |
| 027 MARCA LIZZ | 2025 | comercial | pasado (cerrado) | 23 | 0 | png 9, pdf 8, jpg 5, ai 1 | — |  |
| 028 NATALIE KENEDY OFFICE AND TERRACE | 2025 | comercial | pasado (cerrado) | 0 | 3 | — | — | También aparece como PORTAL DEL VALLE NATHALY KENEDY (2024); posible duplicado o continuación, confirmar con la fundadora. |
| 029 OSMAN NAVIDAD | 2025 | comercial | pasado (cerrado) | 5 | 0 | jpeg 5 | — |  |
| 030 LA BABY | 2025 | comercial | pasado (cerrado) | 3 | 0 | pdf 2, xlsx 1 | Aug 23, 2025 |  |
| 031 STUART APTO | 2025 | residencial | pasado (cerrado) | 14 | 0 | jpg 12, png 1, url 1 | — |  |
| 032 STIVEN PROPIEDAD 305 | 2025 | residencial | pasado (cerrado) | 83 | 0 | jpg 81, pdf 1, xlsx 1 | — |  |
| 033 URGENT CARE | 2025 | bienestar | pasado (cerrado) | 6 | 5 | pdf 6 | 11 months ago |  |
| 034 ALMA PRANA | 2025 | comercial | pasado (cerrado) | 1 | 1 | pdf 1 | 4 months ago | También aparece como 18_ALMA PRANA 2026 (2026); posible duplicado o continuación, confirmar con la fundadora. |
| 035 PROYECTO TALITA | 2025 | comercial | pasado (cerrado) | 0 | 1 | — | — |  |
| 036 APARTAMENTO CARTAGENA | 2025 | residencial | pasado (cerrado) | 0 | 1 | — | — |  |
| 037 PARQUE BONNY NORIEGA | 2025 | comercial | pasado (cerrado) | 2 | 0 | ai 1, pdf 1 | 9 months ago | También aparece como BONNY JUEGO NUBE (2019-2023) y 0_107 PROYECTOS BONNY (2021); posible duplicado o continuación, confirmar con la fundadora. |
| 038 ERIK | 2025 | comercial | pasado (cerrado) | 1 | 0 | pdf 1 | 9 months ago |  |

### PROYECTOS ALUZINA 2024 (inside link C) — 43 folders

| Project folder | Year | Inferred type | Inferred status | Files | Subfolders | Main types | Latest modified | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ACABADOS Y FORMAS | 2024 | comercial | pasado (cerrado) | 1 | 0 | png 1 | — |  |
| AGARTHA FEST | 2024 | comercial | pasado (cerrado) | 5 | 0 | xlsx 3, pdf 2 | Jun 8, 2024 |  |
| AIRBNB TANGUERO | 2024 | hospitalidad | pasado (cerrado) | 2 | 2 | pdf 2 | Jun 20, 2024 |  |
| CALERA EL SILENCIO DE LOS PAJAROS | 2024 | comercial | pasado (cerrado) | 4 | 2 | jpg 2, psd 1, txt 1 | Sep 15, 2024 | También aparece como 07 IMAGENES EL SILENCIO DE LOS PAJAROS (2025); posible duplicado o continuación, confirmar con la fundadora. |
| CAMARAS HIPERBARICAS | 2024 | hospitalidad | pasado (cerrado) | 8 | 0 | pdf 5, xlsx 2, docx 1 | May 19, 2025 |  |
| CAMILO ECHEVERY INTERIORISMO | 2024 | residencial | pasado (cerrado) | 3 | 0 | pdf 2, ai 1 | Jan 26, 2024 |  |
| CASA JORGE Y LIGIA | 2024 | residencial | pasado (cerrado) | 7 | 9 | jpg 4, pdf 2, xlsx 1 | Oct 11, 2024 | También aparece como LIGIA Y JORGE (2024); posible duplicado o continuación, confirmar con la fundadora. |
| CASA VITALL | 2024 | residencial | pasado (cerrado) | 4 | 8 | pdf 2, skp 1, mp4 1 | Nov 26, 2024 |  |
| CLAUD LABS | 2024 | comercial | pasado (cerrado) | 15 | 1 | pdf 9, xlsx 3, dwg 1, dwl 1 | May 14, 2024 |  |
| CURVE ID INSTAGRAM | 2024 | comercial | pasado (cerrado) | 2 | 0 | ai 1, pdf 1 | Jul 22, 2024 |  |
| DECOILUMINAR | 2024 | comercial | pasado (cerrado) | 6 | 2 | docx 2, mov 2, png 1, pdf 1 | Aug 12, 2024 |  |
| DESARROLLO DE ILUMINACION | 2024 | iluminación | pasado (cerrado) | 1 | 0 | ai 1 | Jun 24, 2024 | También aparece como 08_HONEY VALLEY LUMINARIA (2026); posible duplicado o continuación, confirmar con la fundadora. |
| EL ENCANTO | 2024 | comercial | pasado (cerrado) | 1 | 0 | pdf 1 | Dec 26, 2024 | También aparece como 014 EL ENCANTO (2025); posible duplicado o continuación, confirmar con la fundadora. |
| ESPACIO COLIN MEDELLIN | 2024 | bienestar | pasado (cerrado) | 11 | 0 | jpg 3, psd 3, pdf 2, png 2 | — |  |
| ESTELA PARMA | 2024 | comercial | pasado (cerrado) | 1 | 0 | pdf 1 | Jul 30, 2024 |  |
| FELIPE ZAPATA CONSULTORIO | 2024 | bienestar | pasado (cerrado) | 1 | 0 | pdf 1 | Jan 25, 2024 |  |
| GLORIA MOLINA | 2024 | comercial | pasado (cerrado) | 7 | 0 | pdf 5, xlsx 2 | Jan 16, 2024 |  |
| JUAN PABLO PROPUESTA DE ILUMINACION | 2024 | iluminación | pasado (cerrado) | 2 | 0 | ai 1, pdf 1 | Mar 12, 2024 |  |
| KARLA BARCELONA | 2024 | hospitalidad | pasado (cerrado) | 2 | 0 | pdf 1, ai 1 | Nov 8, 2023 |  |
| LIGHT ALCHEMY | 2024 | iluminación | pasado (cerrado) | 12 | 4 | jpg 8, docx 2, ai 2 | — |  |
| LIGIA Y JORGE | 2024 | comercial | pasado (cerrado) | 1 | 0 | pdf 1 | Aug 27, 2024 | También aparece como CASA JORGE Y LIGIA (2024); posible duplicado o continuación, confirmar con la fundadora. |
| MARCELA MEJIA | 2024 | comercial | pasado (cerrado) | 1 | 0 | pdf 1 | Jan 30, 2024 |  |
| MARIO ROJO APARTAMENTO YOLOMBO | 2024 | residencial | pasado (cerrado) | 2 | 1 | ai 1, pdf 1 | Oct 26, 2024 |  |
| MARTA OVIEDO BAÑO SOCIAL | 2024 | comercial | pasado (cerrado) | 23 | 0 | jpeg 19, mp4 4 | — |  |
| MEDELLIN , MAGIA , NATURALEZA Y RAIZ | 2024 | comercial | pasado (cerrado) | 3 | 5 | pdf 1, mp4 1, png 1 | Sep 3, 2024 |  |
| OLGA PUERTA | 2024 | comercial | pasado (cerrado) | 2 | 0 | pdf 1, xlsx 1 | Feb 15, 2024 |  |
| PORTAL DEL VALLE NATHALY KENEDY | 2024 | comercial | pasado (cerrado) | 2 | 1 | jpg 1, psd 1 | — | También aparece como 028 NATALIE KENEDY OFFICE AND TERRACE (2025); posible duplicado o continuación, confirmar con la fundadora. |
| PRATEEB NEW YORK | 2024 | comercial | pasado (cerrado) | 3 | 0 | mp4 2, jpeg 1 | — |  |
| PROCESO CRISTIAN ZAPATA | 2024 | comercial | pasado (cerrado) | 2 | 1 | xlsx 1, pdf 1 | Oct 30, 2023 |  |
| PROCESO ID LOGIN | 2024 | comercial | pasado (cerrado) | 13 | 0 | png 12, pdf 1 | — |  |
| PROPIEDAD ROSITA Y JUAN | 2024 | residencial | pasado (cerrado) | 2 | 0 | ai 1, pdf 1 | Aug 5, 2024 |  |
| PROPUESTA DE CHARLAS ALSADA | 2024 | comercial | pasado (cerrado) | 1 | 0 | pdf 1 | Jul 15, 2024 |  |
| PROYECTO CAMBULO RIONEGRO | 2024 | comercial | pasado (cerrado) | 8 | 0 | pdf 5, jpeg 2, jpg 1 | Oct 3, 2024 |  |
| ROMEO Y JULIETA CAFE NY | 2024 | hospitalidad | pasado (cerrado) | 5 | 0 | ai 2, pdf 2, xlsx 1 | Apr 30, 2024 |  |
| SARA ALZATE BAR MANILA | 2024 | hospitalidad | pasado (cerrado) | 2 | 0 | ai 1, pdf 1 | Nov 20, 2024 |  |
| SEGUNDO PROCESO DE VILLA VERDE | 2024 | residencial | pasado (cerrado) | 1 | 0 | pdf 1 | Aug 12, 2024 | También aparece como 0_112 VILLA VERDE (2021); posible duplicado o continuación, confirmar con la fundadora. |
| SIMON CALERA | 2024 | comercial | pasado (cerrado) | 4 | 1 | pdf 2, ai 1, xlsx 1 | Nov 19, 2024 | También aparece como 019_ SIMON CALERA (2026); posible duplicado o continuación, confirmar con la fundadora. |
| SOFIA HIGUITA MURIEL LOGO | 2024 | comercial | pasado (cerrado) | 6 | 0 | webp 4, jpg 2 | — |  |
| UPPERTRIP | 2024 | comercial | pasado (cerrado) | 1 | 0 | pdf 1 | Aug 11, 2024 | También aparece como 0_108 PUNTO COMERCIAL UPPER TRIP (2021) y UPPERTRIP TUBO 2024 (2024); posible duplicado o continuación, confirmar con la fundadora. |
| UPPERTRIP TUBO 2024 | 2024 | comercial | pasado (cerrado) | 9 | 0 | pdf 6, xlsx 1, 3dm 1, dwg 1 | Dec 3, 2024 | También aparece como 0_108 PUNTO COMERCIAL UPPER TRIP (2021) y UPPERTRIP (2024); posible duplicado o continuación, confirmar con la fundadora. |
| VERSATIL COMIDA | 2024 | comercial | pasado (cerrado) | 22 | 1 | pdf 6, ai 5, jpg 4, jpeg 4 | Apr 21, 2024 |  |
| VIZARI | 2024 | comercial | pasado (cerrado) | 2 | 1 | pdf 1, xlsx 1 | Nov 29, 2024 |  |
| YURA Y NESTOR | 2024 | comercial | pasado (cerrado) | 2 | 0 | pdf 2 | Jan 29, 2024 |  |

### PROYECTOS ALUZINA 2022 (inside link C) — 25 folders

| Project folder | Year | Inferred type | Inferred status | Files | Subfolders | Main types | Latest modified | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0_ APARTAMEMTO PAOLA JIMENA | 2022 | comercial | pasado (cerrado) | 4 | 2 | ai 2, xlsx 1, pdf 1 | Jan 22, 2021 | También aparece como 0_95 APTO PAOLA (2021); posible duplicado o continuación, confirmar con la fundadora. |
| 0_102 CABAÑA AMAGA | 2022 | comercial | pasado (cerrado) | 3 | 7 | pdf 2, webp 1 | Apr 21, 2022 |  |
| ALAMEDA , LUMINARIAS DE ALUZINA 2022 | 2022 | iluminación | pasado (cerrado) | 2 | 0 | pdf 1, xlsx 1 | Apr 19, 2022 |  |
| armoniko interior | 2022 | residencial | pasado (cerrado) | 3 | 0 | pdf 2, ai 1 | Feb 4, 2022 |  |
| ASPRO | 2022 | comercial | pasado (cerrado) | 5 | 2 | pdf 2, ai 2, dwg 1 | Apr 29, 2022 |  |
| BROOKLING PIZZA | 2022 | hospitalidad | pasado (cerrado) | 9 | 7 | jpg 5, pdf 2, docx 1, ai 1 | Aug 26, 2025 |  |
| CASA MARYURI | 2022 | residencial | pasado (cerrado) | 2 | 0 | pdf 1, psd 1 | Nov 4, 2021 |  |
| CASA MIAMI OVY | 2022 | residencial | pasado (cerrado) | 4 | 12 | pdf 2, jpg 1, jfif 1 | Mar 24, 2022 |  |
| COTIZACION HELADERIA | 2022 | hospitalidad | prospecto (propuesta enviada) | 1 | 0 | pdf 1 | May 18, 2022 | carpeta cotización |
| DOTA HOGAR | 2022 | comercial | pasado (cerrado) | 13 | 3 | jpg 8, pdf 3, xlsx 1, ai 1 | Jun 6, 2023 |  |
| ENTRE CIELOS | 2022 | comercial | pasado (cerrado) | 3 | 0 | png 1, ai 1, pdf 1 | Jun 11, 2022 |  |
| ESPACIO LILO CAKES | 2022 | bienestar | pasado (cerrado) | 3 | 0 | ai 2, pdf 1 | Feb 5, 2022 |  |
| FACTURAS DE VENTA Y CUENTAS DE COBRO 2022 | 2022 | comercial | pasado (cerrado) | 6 | 0 | pdf 4, xlsx 2 | Apr 28, 2022 | carpeta administrativo |
| INVERSO | 2022 | comercial | pasado (cerrado) | 2 | 0 | ai 1, pdf 1 | Jul 22, 2022 |  |
| LUMINARIAS PARA PURO CUERO | 2022 | iluminación | pasado (cerrado) | 7 | 2 | pdf 3, dwl 1, dwl2 1, docx 1 | May 26, 2022 |  |
| NATASHA CAPILAR | 2022 | comercial | pasado (cerrado) | 4 | 0 | pdf 3, xlsx 1 | Apr 16, 2022 |  |
| NOAM HOUSE | 2022 | residencial | pasado (cerrado) | 77 | 3 | jpg 33, jpeg 17, mp4 15, png 5 | — |  |
| PROPUESTA DOMOS LOTE DANIELA Y ALEJANDRO | 2022 | residencial | pasado (cerrado) | 1 | 0 | pdf 1 | Sep 8, 2024 |  |
| RL EXOTICS MIAMI | 2022 | comercial | pasado (cerrado) | 2 | 2 | jpg 1, ai 1 | Sep 19, 2022 |  |
| RORI INTERIOR PH | 2022 | residencial | pasado (cerrado) | 3 | 0 | ai 1, pdf 1, jpeg 1 | Oct 4, 2022 |  |
| SABORES A EL FUEGO | 2022 | comercial | pasado (cerrado) | 2 | 0 | ai 1, pdf 1 | Dec 16, 2021 |  |
| SHABELA FOTOS | 2022 | comercial | pasado (cerrado) | 111 | 1 | jpg 81, mov 10, heic 8, png 7 | — | También aparece como SHABELA CHARCUTERÍA NECOCLI 2021 (2021) y SHAVELA (2022); posible duplicado o continuación, confirmar con la fundadora. |
| SHAVELA | 2022 | comercial | pasado (cerrado) | 24 | 0 | jpg 5, ai 5, pdf 5, psd 4 | Dec 10, 2021 | También aparece como SHABELA CHARCUTERÍA NECOCLI 2021 (2021) y SHABELA FOTOS (2022); posible duplicado o continuación, confirmar con la fundadora. |
| TG NOVIAS | 2022 | comercial | pasado (cerrado) | 2 | 0 | pdf 2 | Feb 11, 2022 |  |
| TRIPLAB ART SHOW | 2022 | comercial | pasado (cerrado) | 3 | 0 | pdf 2, docx 1 | Oct 12, 2022 |  |

### PROYECTOS ALUZINA 2021 (inside link C) — 23 folders

| Project folder | Year | Inferred type | Inferred status | Files | Subfolders | Main types | Latest modified | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0_93 FINCA ANTIOQUIA ILUMINACION | 2021 | iluminación | pasado (cerrado) | 16 | 0 | jpg 6, ai 4, pdf 4, xlsx 2 | — |  |
| 0_94 MODULOS BIOTECTURA PARA INTERIORISMO | 2021 | residencial | pasado (cerrado) | 11 | 3 | pdf 5, dwg 3, docx 1, dwl 1 | Jun 5, 2021 |  |
| 0_95 APTO PAOLA | 2021 | residencial | pasado (cerrado) | 0 | 3 | — | — | También aparece como 0_ APARTAMEMTO PAOLA JIMENA (2022); posible duplicado o continuación, confirmar con la fundadora. |
| 0_96 HOTEL PORTAL CENTRAL | 2021 | hospitalidad | pasado (cerrado) | 1 | 1 | pdf 1 | Mar 4, 2021 |  |
| 0_97 PROPUESTA NIDO | 2021 | comercial | pasado (cerrado) | 2 | 0 | ai 1, pdf 1 | Mar 4, 2021 |  |
| 0_98 4 SUITES | 2021 | hospitalidad | pasado (cerrado) | 5 | 0 | ai 2, pdf 2, xlsx 1 | Aug 19, 2021 |  |
| 0_99PROPUESTA PROGRESSIVE ART | 2021 | comercial | pasado (cerrado) | 3 | 2 | ai 2, pdf 1 | Mar 10, 2021 |  |
| 0_100 APARTAMENTO EN CALI 38M2 | 2021 | residencial | pasado (cerrado) | 1 | 0 | pdf 1 | Oct 1, 2021 |  |
| 0_101 BALCONES ALHAMBRA | 2021 | comercial | pasado (cerrado) | 12 | 4 | psd 6, jpg 3, xlsx 1, ai 1 | Jul 13, 2021 |  |
| 0_103 COASSIST 2021 | 2021 | comercial | pasado (cerrado) | 3 | 1 | ai 2, xlsx 1 | Dec 1, 2021 | También aparece como 0_73 COASSIST TERMIAL DE EL SUR 2020 (2020); posible duplicado o continuación, confirmar con la fundadora. |
| 0_104 DANS BAR | 2021 | hospitalidad | pasado (cerrado) | 6 | 6 | pdf 4, ai 2 | Jul 14, 2021 |  |
| 0_105 HABITACULOS PARA RENTA | 2021 | residencial | pasado (cerrado) | 2 | 0 | ai 1, pdf 1 | Oct 1, 2021 |  |
| 0_106 PAR BI (PARQUEADERO) | 2021 | comercial | pasado (cerrado) | 4 | 0 | ai 2, pdf 2 | Jun 1, 2021 |  |
| 0_107 PROYECTOS BONNY | 2021 | comercial | pasado (cerrado) | 4 | 0 | ai 1, pdf 1, jpg 1, psd 1 | Jun 7, 2023 | También aparece como BONNY JUEGO NUBE (2019-2023) y 037 PARQUE BONNY NORIEGA (2025); posible duplicado o continuación, confirmar con la fundadora. |
| 0_108 PUNTO COMERCIAL UPPER TRIP | 2021 | comercial | pasado (cerrado) | 10 | 1 | pdf 3, ai 3, xlsx 1, docx 1 | Jan 29, 2024 | También aparece como UPPERTRIP (2024) y UPPERTRIP TUBO 2024 (2024); posible duplicado o continuación, confirmar con la fundadora. |
| 0_109 REALITY COLOMBIA | 2021 | comercial | pasado (cerrado) | 1 | 0 | docx 1 | Sep 14, 2021 |  |
| 0_110 SANTIAGO TEJADA APARTAMENTO | 2021 | residencial | pasado (cerrado) | 12 | 7 | pdf 4, xlsx 3, dwg 1, dwl 1 | Dec 3, 2021 |  |
| 0_111 VEINTI CUATRO SIETE | 2021 | comercial | pasado (cerrado) | 25 | 1 | pdf 11, jpg 4, psd 3, xlsx 2 | Oct 6, 2021 |  |
| 0_112 VILLA VERDE | 2021 | residencial | pasado (cerrado) | 17 | 2 | jpg 7, pdf 3, psd 3, ai 2 | Feb 13, 2023 | También aparece como SEGUNDO PROCESO DE VILLA VERDE (2024); posible duplicado o continuación, confirmar con la fundadora. |
| 080 BEBO HELADERIA | 2021 | hospitalidad | pasado (cerrado) | 11 | 1 | jpg 11 | — |  |
| APARTAMENTO TATUADOR | 2021 | residencial | pasado (cerrado) | 7 | 1 | dwl 2, dwl2 2, 3dm 2, dwg 1 | Aug 5, 2021 |  |
| PROYECTOS 2021 SEGUNDO SEMESTRE | 2021 | comercial | pasado (cerrado) | 0 | 8 | — | — | Carpeta contenedora (agrupa proyectos), probablemente no es un proyecto; confirmar. |
| SHABELA CHARCUTERÍA NECOCLI 2021 | 2021 | hospitalidad | pasado (cerrado) | 58 | 0 | jpg 35, heic 8, png 7, mov 6 | — | También aparece como SHABELA FOTOS (2022) y SHAVELA (2022); posible duplicado o continuación, confirmar con la fundadora. |

### PROYECTOS ALUZINA 2020 (inside link C) — 25 folders

| Project folder | Year | Inferred type | Inferred status | Files | Subfolders | Main types | Latest modified | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0_ 86HOTEL LLERAS MARIA DE LOS ANGELES | 2020 | hospitalidad | pasado (cerrado) | 4 | 1 | png 2, pdf 1, xlsx 1 | Oct 19, 2020 |  |
| 0_69 UNIVERCIDAD DE ANTIOQUIA | 2020 | comercial | pasado (cerrado) | 14 | 1 | pdf 5, ai 3, xlsx 2, jpg 2 | Nov 20, 2020 |  |
| 0_71 KATS | 2020 | comercial | pasado (cerrado) | 4 | 0 | pdf 2, xlsx 1, png 1 | Feb 20, 2020 |  |
| 0_72 LONDON CITY BARBER SHOP | 2020 | hospitalidad | pasado (cerrado) | 0 | 0 | — | — | Carpeta vacía en el rastreo. |
| 0_73 COASSIST TERMIAL DE EL SUR 2020 | 2020 | comercial | pasado (cerrado) | 6 | 2 | xlsx 2, icloud 1, pdf 1, dwg 1 | Jan 9, 2022 | También aparece como 0_103 COASSIST 2021 (2021); posible duplicado o continuación, confirmar con la fundadora. |
| 0_74 JUSTIN | 2020 | comercial | pasado (cerrado) | 7 | 1 | png 4, icloud 3 | Feb 11, 2020 |  |
| 0_75 LAS 3B | 2020 | comercial | pasado (cerrado) | 15 | 1 | jpg 4, png 4, xlsx 2, dwg 2 | Mar 16, 2020 |  |
| 0_76 OFICINA ALUZINA | 2020 | comercial | pasado (cerrado) | 2 | 0 | ai 1, xlsx 1 | Mar 6, 2020 |  |
| 0_77 VEGA | 2020 | comercial | pasado (cerrado) | 15 | 1 | pdf 5, xlsx 4, png 2, ai 1 | Sep 15, 2020 |  |
| 0_78 APTO MARIA CAROLINA | 2020 | residencial | pasado (cerrado) | 8 | 0 | xlsx 4, pdf 2, (none) 1, ai 1 | Sep 15, 2020 |  |
| 0_79 SODIME producciom | 2020 | comercial | pasado (cerrado) | 6 | 0 | icloud 2, pdf 2, xlsx 1, ai 1 | Jun 16, 2020 | También aparece como 05_SODIME (2026); posible duplicado o continuación, confirmar con la fundadora. |
| 0_80 OZAOZ  jinetes del horizonte | 2020 | comercial | pasado (cerrado) | 13 | 1 | pdf 7, xlsx 3, ai 2, docx 1 | Jun 13, 2022 |  |
| 0_82 VENTA LUMINARIA | 2020 | iluminación | pasado (cerrado) | 5 | 0 | pdf 3, xlsx 1, ai 1 | Aug 6, 2020 |  |
| 0_83 REVERDESER | 2020 | comercial | pasado (cerrado) | 5 | 0 | jpg 2, psd 2, jpeg 1 | — |  |
| 0_84 INNOVAR | 2020 | comercial | pasado (cerrado) | 4 | 0 | pdf 2, ai 1, xlsx 1 | Sep 29, 2020 |  |
| 0_85 INTERGASTRO | 2020 | comercial | pasado (cerrado) | 8 | 1 | pdf 5, xlsx 3 | Jan 12, 2021 |  |
| 0_86 EDIFICIO AMAGA | 2020 | comercial | pasado (cerrado) | 2 | 0 | ai 1, pdf 1 | Oct 21, 2020 |  |
| 0_87 LUMINARIAS 2021 VENTAS | 2020 | iluminación | pasado (cerrado) | 2 | 0 | ai 2 | Oct 29, 2020 |  |
| 0_88 CINEMA | 2020 | comercial | pasado (cerrado) | 1 | 0 | xlsx 1 | Oct 27, 2020 |  |
| 0_91 MARYURI | 2020 | comercial | pasado (cerrado) | 1 | 0 | xlsx 1 | Nov 11, 2020 |  |
| 0_92 AYAMONTE | 2020 | comercial | pasado (cerrado) | 3 | 0 | xlsx 1, png 1, pdf 1 | Dec 19, 2020 |  |
| 0_92 DOS SANTOS | 2020 | comercial | pasado (cerrado) | 2 | 0 | xlsx 1, pdf 1 | Nov 17, 2020 |  |
| Proteccion Anticontagio  ALUZINA | 2020 | comercial | pasado (cerrado) | 0 | 5 | — | — |  |
| PROYECTO DE ILUMINACIO ESPACIO PUBLICO | 2020 | iluminación | pasado (cerrado) | 1 | 0 | zip 1 | Aug 12, 2019 |  |
| PROYECTOS ALUZINA 2020 GRAFICOS | 2020 | comercial | pasado (cerrado) | 0 | 7 | — | — | Carpeta contenedora (agrupa proyectos), probablemente no es un proyecto; confirmar. |

### PROYECTOS ALUZINA 2019 2023 (link C, the folder itself) — 14 folders

| Project folder | Year | Inferred type | Inferred status | Files | Subfolders | Main types | Latest modified | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AARON | — | comercial | pasado (cerrado) | 5 | 1 | pdf 4, xlsx 1 | Aug 22, 2023 |  |
| BONNY JUEGO NUBE | — | comercial | pasado (cerrado) | 1 | 0 | pdf 1 | Jun 8, 2023 | También aparece como 0_107 PROYECTOS BONNY (2021) y 037 PARQUE BONNY NORIEGA (2025); posible duplicado o continuación, confirmar con la fundadora. |
| FABI SOPETRAN | — | comercial | pasado (cerrado) | 1 | 0 | jpeg 1 | — |  |
| GREGORY APARTMENT | — | residencial | pasado (cerrado) | 12 | 1 | pdf 7, docx 2, ai 1, xlsx 1 | Feb 25, 2023 |  |
| HOTEL SPA MEDELLIN | — | hospitalidad | pasado (cerrado) | 8 | 1 | pdf 5, jpg 2, indd 1 | Aug 11, 2023 |  |
| JOE GALLINA INTERIOR | — | residencial | pasado (cerrado) | 179 | 4 | pdf 116, jfif 25, xlsx 10, docx 7 | Sep 19, 2024 | proyecto destacado, índice completo; Proyecto destacado con índice completo: 179 archivos en 58 carpetas (4 de primer nivel), rastreado 2026-09-21; archivos fechados hasta Sep 19, 2024. |
| JOSH INTERIOR DESIGN | — | residencial | pasado (cerrado) | 2 | 0 | ai 1, pdf 1 | Jul 11, 2023 |  |
| NATUZZI & ALUZINA | — | comercial | pasado (cerrado) | 3 | 0 | pdf 2, jpg 1 | Jun 2, 2023 |  |
| NEW YORK HOUSE | — | residencial | pasado (cerrado) | 70 | 1 | jpg 61, ai 4, heic 2, psd 1 | — |  |
| PAMPAS ROOM STARTER | — | comercial | pasado (cerrado) | 13 | 2 | pdf 5, ai 3, xlsx 2, jpg 2 | May 27, 2024 |  |
| PETER INTERIOR PH | — | residencial | pasado (cerrado) | 9 | 7 | pdf 4, jpg 2, docx 1, xlsx 1 | Mar 14, 2023 |  |
| THANAL | — | comercial | pasado (cerrado) | 6 | 10 | ai 2, pdf 1, docx 1, png 1 | Jun 4, 2023 |  |
| YAKHOL | — | comercial | pasado (cerrado) | 4 | 0 | pdf 2, pptm 1, ai 1 | Mar 14, 2023 |  |
| ZIENTTE | — | comercial | pasado (cerrado) | 1 | 0 | pdf 1 | May 29, 2023 |  |

### Root of link C (folders next to the year folders) — 2 folders

| Project folder | Year | Inferred type | Inferred status | Files | Subfolders | Main types | Latest modified | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LIFE VIOLETA VILLA | 2019 (inferido) | residencial | pasado (cerrado) | 8 | 8 | pdf 3, xlsx 3, png 2 | May 28, 2020 | Carpeta de nivel raíz con 8 subcarpetas (CONTABLES, ESTRUCTURA CIRCULAR, Exploracion, LIFE VIOLETA, PRIMER AVANCE DISEÑO, referentes  ESCENOGRAFIA, REFERENTES DE CONTRUCCION ESTRUCTURA, set) leídas como un solo proyecto; año 2019 inferido (inferred) del archivo más antiguo (Nov 19, 2019); archivos hasta May 28, 2020. |
| SANTIAGO AGUIRRE ILUMINACION | — | iluminación | pasado (cerrado) | 10 | 0 | pdf 6, ai 3, xlsx 1 | Feb 7, 2025 | También aparece como 05 SANTIAGO AGUIRRE ILUMINACION (2025); posible duplicado o continuación, confirmar con la fundadora. |

## Featured project: JOE GALLINA INTERIOR (2019-2023 folder, files dated Jun 2023 - Sep 2024)

status: current · source: deep crawl of `PROYECTOS ALUZINA 2019 2023/JOE GALLINA INTERIOR` (link A asks for a sign-in; the same folder is public inside link C), 2026-09-21; `docs/archive/projects/joe-gallina-interior/index.json`

179 files in 104 folders, 4.3 GB listed (four presentation PDFs and two Illustrator sources of 0.3-1 GB each make up most of it). 147 files are redacted (contracts, invoices, cuentas de cobro, RUTs, social-security receipts, payment proofs, quotations, WhatsApp images, the feng shui report and property analysis with the owner's birth data, the delivery form and two contractor-dispute letters), 25 design deliverables have a served thumbnail and 15 have page renders (86 pages, <= 8 each). Folder segments that were person names read as roles (EQUIPO, CONTRATISTA, ARTISTA, ELECTRICISTA, DOMOTICA).

What the folder tells about the studio's delivery order (inferred from numbering and modified dates; Dropbox shows modified dates only): design contract Jun 20 2023 -> first plan Jun 28 -> feng shui report Jul 11 -> lighting details Jul 15 - Aug 18 -> 3D model Jul 26 -> luminaire fabrication drawings Aug 5 -> main presentations (layout, interior, lighting, 3D) Oct 5-23 2023 -> furniture and cinema lighting Sep-Oct 2023 -> administration contract Oct 24 -> delivery form Dec 24 2023 -> carpentry dispute letters Mar 2024. `DISEÑO` is numbered 00 Feng Shui -> 01 photos -> 02 references -> 03 plans -> 04 presentation -> 05 3D obra -> 06 interior images -> 07 furniture -> 08 lighting -> 09 botany -> 1O art -> 010 domotics -> 011 models; the supplier folders (01-17) are alphabetical. Two of the main presentations share size and first pages (INTERIOR DESIGN PRESENTATION ALTOS DE LA TOJA / INTERIOR DESIGN PROJECT ALEJAGUERRA: a re-export), the August "Presentación luminarias" looks like an earlier version of the October LIGHTING DESIGN, and `PRESENTACION TRONCAL (1).pptx` (Sep 2024, a university course presentation) does not seem to belong to the project. Branding on the deliverables: "UNIVERSE DESIGN" / Universo de Diseño (the portfolio era, see `brand.md`).

### Folder tree (redacted names)

```
ADMINISTRATIVO Y FINANCIERO/   [15 files]
  CONTABILIDAD PROYECTO JOE/   [2 files]
    PAGOS EGRESO AGOSTO/   [1 files]
      MOSAGRES/   [1 files]
        Factura (redactado).pdf   (117 KB, Oct 24, 2023, redactado)
    PAGOS EGRESOS SEPTIEMBRE/   [1 files]
      MOSAGRES/   [1 files]
        Factura (redactado).pdf   (117 KB, Oct 24, 2023, redactado)
  CONTRATOS/   [2 files]
    Contrato (redactado).docx   (290 KB, Oct 24, 2023, redactado)
    Contrato (redactado).docx   (319 KB, Jun 20, 2023, redactado)
  CONTROL FINANCIERO/   [1 files]
    Documento financiero (redactado).pdf   (220 KB, Jul 7, 2023, redactado)
  CUENTAS DE COBRO/   [1 files]
    Documento financiero (redactado).pdf   (477 KB, Jun 30, 2023, redactado)
  DOCUMENTOS DE ALUZINA/   [8 files]
    Cuenta de cobro (redactado).xlsx   (58 KB, Sep 25, 2021, redactado)
    Documento financiero (redactado).doc   (80 KB, May 16, 2022, redactado)
    Documento financiero (redactado).xlsx   (121 KB, Nov 7, 2019, redactado)
    Documento financiero (redactado).xlsx   (67 KB, Apr 20, 2023, redactado)
    Documento financiero (redactado).xlsx   (83 KB, Oct 19, 2017, redactado)
    Documento financiero (redactado).xlsx   (283 KB, Jul 31, 2023, redactado)
    Factura (redactado).xlsx   (58 KB, Oct 27, 2023, redactado)
    LOGO.jpg   (379 KB, Jul 6, 2023)
  Documento financiero (redactado).xlsx   (114 KB, Jun 30, 2023, redactado)
CIERRE DE PROYECTO JOE GALLINA/   [2 files]
  Documento de cierre (redactado).docx   (432 KB, Dec 23, 2023, redactado)
  Documento de cierre (redactado).pdf   (301 KB, Dec 23, 2023, redactado)
DISEÑO/   [32 files]
  00_FENG SHUI/   [1 files]
    JOSEPH MATEW GALLINA FENG SHUI.pdf   (605 KB, Jul 11, 2023, redactado)
  03_PLANOS/   [8 files]
    00 PLANOS ALTOS DE LA TOJA.pdf   (3.1 MB, Aug 1, 2023, vista previa)
    00_1 PLANOS ALTOS DE LA TOJA.dwg   (565 KB, Jul 31, 2023)
    01 PLANTA GENERAL SIN COTAS.pdf   (178 KB, Jun 28, 2023, vista previa)
    02 RETICULA DE TECHO PRIMERA PLANTA.jpg   (188 KB, Jul 14, 2023, vista previa)
    03 LAYOUT.pdf   (322 KB, Oct 5, 2023, vista previa)
    03_1 LAYOUT.dwg   (4.8 MB, Oct 5, 2023)
    03_2 LAY OUT SIN COTAS.pdf   (297 KB, Oct 5, 2023, vista previa)
    Apto poblado.bak   (565 KB, Jul 31, 2023)
  04_PRESENTATION/   [8 files]
    3D MODEL PRESENTATION ALTOS DE LA TOJA.pdf   (296.6 MB, Oct 20, 2023, vista previa)
    interior design aluzina developer small.pdf   (1.6 MB, May 1, 2024, vista previa)
    INTERIOR DESIGN PRESENTATION ALTOS DE LA TOJA.pdf   (942.1 MB, Oct 5, 2023, vista previa)
    INTERIOR DESIGN PROJECT ALEJAGUERRA.pdf   (942.1 MB, Oct 23, 2023, vista previa)
    LIGHTING DESIGN ALTOS DE LA TOJA.pdf   (290.6 MB, Oct 5, 2023, vista previa)
    Presentacion Altos de la toja - avance 3 FONDO BLANCO (1).ai   (942.1 MB, Oct 5, 2023)
    Presentación luminarias version blanco.ai   (291.1 MB, Oct 5, 2023)
    PRESENTACION TRONCAL (1).pptx   (43.9 MB, Sep 3, 2024, vista previa)
  07_MOBILIARIO/   [5 files]
    CAMA DE CONCRETO/   [5 files]
      2 OPTION BED.jfif   (112 KB, Sep 23, 2023, vista previa)
      CM MESURES.jfif   (163 KB, Sep 23, 2023, vista previa)
      MEASURE ADJUSTMENTS CONCRETE.jfif   (91 KB, Sep 23, 2023, vista previa)
      MEASURE ADJUSTMENTS ESTRUCTURE.jfif   (107 KB, Sep 23, 2023, vista previa)
      MEASURE ADJUSTMENTS.jfif   (103 KB, Sep 23, 2023, vista previa)
  08_ILUMINACION/   [9 files]
    FICHAS TECNICAS DE LUMINARIAS/   [1 files]
      Planos luminarias #1.ai   (12.5 MB, Aug 5, 2023, vista previa)
    ILUMINACION CINE/   [4 files]
      iluminacion cine corte.jfif   (73 KB, Oct 11, 2023, vista previa)
      iluminacion cine planta.jfif   (100 KB, Oct 11, 2023, vista previa)
      iluminacion cine.jfif   (88 KB, Oct 11, 2023, vista previa)
      mymoons_system.pdf   (454 KB, Aug 1, 2023, vista previa)
    ILUMINACION AREA SOCIAL.pdf   (1.2 MB, Jul 31, 2023, vista previa)
    Iluminacion en habiatacion de bar.jpg   (114 KB, Jun 19, 2023, vista previa)
    ILUMINACION TECHO AREA SOCIAL.pdf   (714 KB, Jul 15, 2023, vista previa)
    Presentación luminarias (Unicode Encoding Conflict).pdf   (283.9 MB, Aug 18, 2023, vista previa)
  011_MODELOS/   [1 files]
    MODELO 3D.skp   (40.0 MB, Jul 26, 2023)
suppliers and financial status/   [124 files]
  02_ELECTRICISTA/   [13 files]
    Contrato (redactado).pdf   (554 KB, Nov 21, 2023, redactado)
    Contrato (redactado).pdf   (115 KB, Nov 3, 2023, redactado)
    Contrato (redactado).pdf   (110 KB, Nov 2, 2023, redactado)
    Documento financiero (redactado).pdf   (1.0 MB, Nov 29, 2023, redactado)
    Documento financiero (redactado).pdf   (19 KB, Dec 27, 2023, redactado)
    Documento financiero (redactado).pdf   (20 KB, Oct 24, 2023, redactado)
    Documento financiero (redactado).xlsx   (52 KB, Nov 28, 2023, redactado)
    Documento financiero (redactado).xlsx   (10 KB, Dec 27, 2023, redactado)
    Imagen de WhatsApp (redactado).jpeg   (108 KB, Oct 24, 2023, redactado)
    Imagen de WhatsApp (redactado).jpeg   (103 KB, Oct 24, 2023, redactado)
    Imagen de WhatsApp (redactado).jpeg   (76 KB, Dec 27, 2023, redactado)
    Imagen de WhatsApp (redactado).jpeg   (71 KB, Dec 27, 2023, redactado)
    RUT (redactado).pdf   (192 KB, Oct 24, 2023, redactado)
  03_ALFA/   [20 files]
    Invoices/   [11 files]
      Documento financiero (redactado).pdf   (109 KB, Oct 27, 2023, redactado)
      Documento financiero (redactado).pdf   (109 KB, Oct 27, 2023, redactado)
      Documento financiero (redactado).pdf   (109 KB, Oct 27, 2023, redactado)
      Documento financiero (redactado).pdf   (110 KB, Oct 27, 2023, redactado)
      Documento financiero (redactado).pdf   (109 KB, Oct 27, 2023, redactado)
      Documento financiero (redactado).pdf   (110 KB, Oct 27, 2023, redactado)
      Documento financiero (redactado).pdf   (109 KB, Oct 27, 2023, redactado)
      Documento financiero (redactado).pdf   (483 KB, Oct 27, 2023, redactado)
      Documento financiero (redactado).pdf   (484 KB, Oct 27, 2023, redactado)
      Documento financiero (redactado).pdf   (484 KB, Oct 27, 2023, redactado)
      Documento financiero (redactado).pdf   (484 KB, Oct 27, 2023, redactado)
    quote and payments/   [8 files]
      Cotización (redactado).pdf   (24 KB, Oct 24, 2023, redactado)
      Cotización (redactado).pdf   (23 KB, Oct 25, 2023, redactado)
      Documento financiero (redactado).jfif   (54 KB, Oct 25, 2023, redactado)
      Documento financiero (redactado).jfif   (104 KB, Oct 25, 2023, redactado)
      Documento financiero (redactado).jfif   (79 KB, Oct 25, 2023, redactado)
      Documento financiero (redactado).jfif   (99 KB, Oct 25, 2023, redactado)
      Pedido (redactado).pdf   (29 KB, Oct 25, 2023, redactado)
      Pedido (redactado).pdf   (27 KB, Oct 25, 2023, redactado)
    RUT (redactado).pdf   (171 KB, Oct 25, 2023, redactado)
  04_ALUZINA/   [18 files]
    01 EQUIPO/   [2 files]
      RUT (redactado).pdf   (171 KB, Oct 24, 2023, redactado)
      Seguridad social (redactado).pdf   (21 KB, Oct 26, 2023, redactado)
    02 EQUIPO ENCARGADA OBRA/   [2 files]
      Contrato (redactado).pdf   (150 KB, Dec 28, 2023, redactado)
      RUT (redactado).pdf   (173 KB, Dec 28, 2023, redactado)
    03 EQUIPO DISEÑADORA JUNIOR/   [3 files]
      Comprobante de pago (redactado).pdf   (843 KB, Oct 26, 2023, redactado)
      Comprobante de pago (redactado).pdf   (843 KB, Oct 26, 2023, redactado)
      Contrato (redactado).pdf   (411 KB, Oct 24, 2023, redactado)
    04 EQUIPO trabajos varios/   [1 files]
      Documento financiero (redactado).xlsx   (11 KB, Dec 28, 2023, redactado)
    05 EQUIPO CONTABILIDAD Y COMPRAS/   [4 files]
      Contrato (redactado).pdf   (23 KB, Nov 2, 2023, redactado)
      Seguridad social (redactado).pdf   (21 KB, Oct 26, 2023, redactado)
      Seguridad social (redactado).pdf   (21 KB, Oct 26, 2023, redactado)
      Seguridad social (redactado).pdf   (21 KB, Oct 26, 2023, redactado)
    06 EQUIPO CONTADORA/   [1 files]
      Documento personal (redactado).pdf   (341 KB, Oct 26, 2023, redactado)
    08 EQUIPO plantilla de excel/   [2 files]
      Cuenta de cobro (redactado).pdf   (111 KB, Dec 28, 2023, redactado)
      RUT (redactado).pdf   (138 KB, Dec 28, 2023, redactado)
    Contrato (redactado).docx   (290 KB, Oct 24, 2023, redactado)
    Contrato (redactado).pdf   (215 KB, Oct 24, 2023, redactado)
    Contrato (redactado).pdf   (105.3 MB, Jun 29, 2023, redactado)
  05_DECORCERAMICA/   [4 files]
    Documento financiero (redactado).pdf   (2.3 MB, Oct 24, 2023, redactado)
    Documento financiero (redactado).pdf   (1.5 MB, Oct 24, 2023, redactado)
    Factura (redactado).pdf   (150 KB, Oct 25, 2023, redactado)
    RUT (redactado).pdf   (2.6 MB, Oct 25, 2023, redactado)
  06_DOMOTICA/   [2 files]
    Documento financiero (redactado).pdf   (232 KB, Oct 31, 2023, redactado)
    RUT (redactado).pdf   (174 KB, Oct 26, 2023, redactado)
  07_INDURAL/   [2 files]
    Documento financiero (redactado).pdf   (48 KB, Oct 24, 2023, redactado)
    Documento financiero (redactado).pdf   (49 KB, Oct 24, 2023, redactado)
  08_J.F.S.R INGENIEROS CONSTRUCTORES/   [7 files]
    Contrato (redactado).jpeg   (177 KB, Oct 24, 2023, redactado)
    Contrato (redactado).pdf   (33 KB, Oct 24, 2023, redactado)
    Cotización (redactado).pdf   (693 KB, Nov 3, 2023, redactado)
    Cuenta de cobro (redactado).pdf   (171 KB, Oct 24, 2023, redactado)
    Cuenta de cobro (redactado).pdf   (171 KB, Oct 24, 2023, redactado)
    Cuenta de cobro (redactado).pdf   (172 KB, Oct 24, 2023, redactado)
    Documento financiero (redactado).pdf   (192 KB, Oct 27, 2023, redactado)
  10_MERY & SONS/   [22 files]
    01 CONTRATISTA/   [8 files]
      Comprobante de pago (redactado).pdf   (732 KB, Nov 2, 2023, redactado)
      Contrato (redactado).pdf   (156 KB, Oct 27, 2023, redactado)
      Contrato (redactado).pdf   (139 KB, Oct 27, 2023, redactado)
      Contrato (redactado).pdf   (190 KB, Oct 27, 2023, redactado)
      Documento financiero (redactado).docx   (440 KB, Nov 7, 2023, redactado)
      Documento financiero (redactado).pdf   (70 KB, Nov 7, 2023, redactado)
      Documento financiero (redactado).pdf   (49 KB, Oct 29, 2023, redactado)
      Documento financiero (redactado).pdf   (49 KB, Oct 29, 2023, redactado)
    02 DEPOSITO FUTURO/   [1 files]
      Documento financiero (redactado).jfif   (51 KB, Oct 25, 2023, redactado)
    03 DEPOSITO PLAYA BLANCA/   [7 files]
      Documento financiero (redactado).jfif   (50 KB, Oct 25, 2023, redactado)
      Documento financiero (redactado).jfif   (50 KB, Oct 25, 2023, redactado)
      Documento financiero (redactado).jfif   (50 KB, Oct 25, 2023, redactado)
      Documento financiero (redactado).jfif   (50 KB, Oct 25, 2023, redactado)
      Documento financiero (redactado).jfif   (50 KB, Oct 25, 2023, redactado)
      Documento financiero (redactado).jfif   (50 KB, Oct 25, 2023, redactado)
      Documento financiero (redactado).jfif   (50 KB, Oct 25, 2023, redactado)
    04 MOTO PARA ESCOMBROS/   [3 files]
      Documento financiero (redactado).jfif   (50 KB, Oct 25, 2023, redactado)
      Documento financiero (redactado).jfif   (50 KB, Oct 25, 2023, redactado)
      Documento financiero (redactado).jfif   (50 KB, Oct 25, 2023, redactado)
    05 CONTRATISTA/   [1 files]
      Documento financiero (redactado).pdf   (112 KB, Nov 2, 2023, redactado)
    06 CONTRATISTA/   [2 files]
      Contrato (redactado).pdf   (2.2 MB, Oct 27, 2023, redactado)
      Contrato (redactado).pdf   (2.3 MB, Oct 27, 2023, redactado)
  11_MOSAGRES ACABADOS/   [2 files]
    Factura (redactado).pdf   (117 KB, Oct 24, 2023, redactado)
    Factura (redactado).pdf   (117 KB, Oct 24, 2023, redactado)
  12_NEBULA/   [3 files]
    nebulosa/   [2 files]
      Documento financiero (redactado).pdf   (86 KB, Dec 28, 2023, redactado)
      Factura (redactado).xml   (41 KB, Dec 28, 2023, redactado)
    Documento financiero (redactado).pdf   (12.2 MB, Nov 3, 2023, redactado)
  13_PISENDE/   [1 files]
    Documento financiero (redactado).pdf   (43 KB, Oct 24, 2023, redactado)
  14_LIGHTING PROVIDORS/   [10 files]
    01 AMAZON/   [2 files]
      Pedido (redactado).pdf   (132 KB, Oct 25, 2023, redactado)
      Pedido (redactado).pdf   (111 KB, Oct 25, 2023, redactado)
    03 ILUMINACION ANTIOQUIA/   [1 files]
      Documento financiero (redactado).jfif   (110 KB, Oct 24, 2023, redactado)
    04 LED LIGHT/   [1 files]
      Documento financiero (redactado).pdf   (316 KB, Oct 24, 2023, redactado)
    06 PERFIL LED ILUMINACION/   [6 files]
      Documento financiero (redactado).jfif   (79 KB, Oct 25, 2023, redactado)
      Documento financiero (redactado).pdf   (374 KB, Nov 3, 2023, redactado)
      Documento financiero (redactado).pdf   (316 KB, Oct 27, 2023, redactado)
      Factura (redactado).pdf   (316 KB, Dec 27, 2023, redactado)
      Imagen de WhatsApp (redactado).jpeg   (241 KB, Dec 27, 2023, redactado)
      RUT (redactado).pdf   (541 KB, Oct 27, 2023, redactado)
  15_SEMCO/   [3 files]
    Contrato (redactado).pdf   (114 KB, Oct 24, 2023, redactado)
    Documento financiero (redactado).pdf   (688 KB, Nov 2, 2023, redactado)
    Documento financiero (redactado).pdf   (517 KB, Oct 24, 2023, redactado)
  16_TECHOS Y ESTRUCTURAS HERREÑO/   [11 files]
    Cuenta de cobro (redactado).pdf   (153 KB, Oct 24, 2023, redactado)
    Documento financiero (redactado).pdf   (551 KB, Oct 24, 2023, redactado)
    Documento financiero (redactado).pdf   (468 KB, Oct 24, 2023, redactado)
    Documento financiero (redactado).pdf   (411 KB, Oct 24, 2023, redactado)
    Documento financiero (redactado).pdf   (424 KB, Oct 24, 2023, redactado)
    Documento financiero (redactado).pdf   (549 KB, Oct 24, 2023, redactado)
    Documento financiero (redactado).pdf   (866 KB, Oct 24, 2023, redactado)
    Documento financiero (redactado).pdf   (862 KB, Oct 24, 2023, redactado)
    RUT (redactado).pdf   (137 KB, Oct 24, 2023, redactado)
    Seguridad social (redactado).pdf   (30 KB, Oct 24, 2023, redactado)
    Seguridad social (redactado).pdf   (21 KB, Oct 24, 2023, redactado)
  17_TECNICOCINA/   [6 files]
    MATERIALS CLARIFICATIONS/   [4 files]
      Documento financiero (redactado).pdf   (136 KB, Nov 2, 2023, redactado)
      Documento financiero (redactado).pdf   (43 KB, Nov 2, 2023, redactado)
      Documento financiero (redactado).pdf   (60 KB, Nov 2, 2023, redactado)
      Documento financiero (redactado).pdf   (113 KB, Nov 2, 2023, redactado)
    Cotización (redactado).pdf   (56 KB, Oct 27, 2023, redactado)
    Seguridad social (redactado).pdf   (131 KB, Oct 27, 2023, redactado)
ANALISIS PROPIEDAD  JOSEPH MATEW GALLINA I.docx   (52 KB, Jul 11, 2023, redactado)
Contrato (redactado).zip   (104.8 MB, Oct 20, 2023, redactado)
Cotización (redactado).xls   (119 KB, Sep 19, 2024, redactado)
Design and Construction Project Delivery JOE MATHEW GALLINA.docx   (1.9 MB, Dec 24, 2023, redactado)
INFORME GENERAL NEBULOSA ,ALTOS DE LA TOJA,CARPINTERIA.pdf   (1.6 MB, Mar 13, 2024, redactado)
Subject CARPENTRY.pdf   (1.5 MB, Mar 13, 2024, redactado)
```

## Deep indexes and served previews per year (ar-06, ar-07)

status: current · since: 2026-09-21 (changelog 0021 for 2026, 0022 for 2019-2025 and root) · source: `docs/archive/projects/<slug>/index.json`, `apps/hub/public/archive/<slug>/`

| year folder | folders | files indexed | deep | with served renders | thumbs | pages | served MB | covers | redacted files |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2026 | 18 | 575 | 18 | 18 | 408 | 150 | 23.52 | 17 | 105 |
| 2025 | 37 | 624 | 35 | 35 | 381 | 71 | 11.81 | 25 | 55 |
| 2024 | 43 | 573 | 43 | 43 | 190 | 125 | 11.76 | 29 | 170 |
| 2022 | 25 | 862 | 24 | 24 | 391 | 39 | 11.64 | 17 | 180 |
| 2021 | 23 | 646 | 23 | 23 | 159 | 143 | 11.61 | 17 | 268 |
| 2020 | 25 | 1045 | 24 | 24 | 167 | 93 | 10.58 | 14 | 117 |
| 2019-2023 | 14 | 788 | 14 | 14 | 71 | 122 | 10.64 | 12 | 207 |
| root | 2 | 178 | 2 | 2 | 10 | 7 | 0.50 | 2 | 5 |
| **total** | **187** | **5291** | **183** | **183** | **1777** | **750** | **92.06** | **133** | **1107** |

The three folders without a deep index are the three empty ones (LONDON CITY BARBER SHOP 2020, one 2022 and one 2025 folder with no files); they keep a `depth: 1` chunk with no files. Deep-indexed in 0019: JOE GALLINA INTERIOR; in 0021: the 18 of 2026; in 0022 (ar-07): the other 164.

Since ar-19 (D-071) every non-admin folder has a chunk under `docs/archive/projects/<slug>/index.json`: the deep index when the folder was crawled to full depth, else the folder's direct child files at `depth: 1`. The app loads a chunk when S-13 (or P-06) opens that project; nothing about a file is seeded, and only a file a person tags, moves or picks as cover becomes a stored row. Render budgets: ~12 MB of served renders per year folder, 4-6 pages per file, thumbs <= 640 px, pages <= 1200 px (D-069 for 2026; D-082 for the older years).

## Delivery stage from the folder path (ar-22)

status: current · since: 2026-09-21 (changelog 0022) · source: `apps/hub/src/domain/archive.ts` (`STAGE_PHRASES`, `stageFor`)

The stage of an archived file is computed at load time from its folder path and name; the first matching phrase wins, so the order of the list is the rule. The 2026 folder template (read from HOY, CARTAGENA COPETRAN, SODIME) maps as follows:

| phrase(s) | stage | folder it comes from |
| --- | --- | --- |
| `planos del espacio`, `detalles tecnicos`, `artes de corte` | technical | `03 PLANOS DEL ESPACIO`, HOY `DETALLES TECNICOS DE ILUMINACION`, HONEY VALLEY `ARTES DE CORTE` |
| `fotografia y video del espacio`, `fotos y videos del espacio`, `videos del espacio`, `fotos de las salas` | survey | template `01`, HOY, SPORTI |
| `primera propuesta`, `presentacion de diseno del espacio`, `propuestas` | concept | template `00` and `02` |
| `cotizacion del espacio` | quotation | template `04` |
| `cronograma de obra`, `fotografias de obra y avance` | execution | template `05` and `07` |
| `documentacion importante`, `consignaciones`, `pagos`, `facturas`, `informes` | admin | template `08` and `09`, HOY, CARTAGENA + SPORTI |
| `certificados y garantias`, `garantias`, `certificados` | delivery | CARTAGENA |
| `manual de marca`, `informacion diseno interior`, `artes` | design-development | HOY's brand book, SODIME `ARTES RIONEGRO` |
| `imagenes`, `imagen`, `videos`, `ecosistema virtual` | marketing (last in the list) | HOY `IMAGENES HOY`, SODIME `IMAGENES DE SODIME` |

Effect: HOY 180 of 206 files in "other" -> 0; the three template projects together 200 -> 1; every deep index 1475 -> 1183 in "other". **Open (inferred, D-060)**: `IMAGENES HOY` (105 camera-dated photos) is filed as *marketing* because HOY keeps a separate survey folder; if they are the final-photo record of the finished space the stage is *delivery* — the founder decides (changelog 0022 H).

## Known vs inferred

| Fact | Status | Source |
| --- | --- | --- |
| Folder names, counts, sizes, dates, share links | known (as listed by Dropbox on 2026-09-21) | crawl |
| Which folders are projects vs quotations vs admin | inferred from the folder name (`kind`) | build-index rule |
| Project type (residencial / comercial / hospitalidad / bienestar / iluminación) | inferred from words in the folder name | `projectTypeFromName` |
| Status (2026 = en curso, cotización = prospecto, else pasado) | inferred from the year folder | seed rule, D-060 |
| Client | known only for SODIME, COASSIST, HOY, SPORTI (existing client rows); everyone else `unknown` | seed rule |
| Year | the year folder; null for the 2019-2023 range; LIFE VIOLETA VILLA 2019 from its oldest file | build-index |
| Duplicates / continuations across years | inferred from names, listed above | DUPLICATE_GROUPS table |
| Delivery stage of each file | inferred from folder / file keywords (`stageFor`); files at a project's top level without a folder mostly land in "Other" | domain rule, D-057 |
| Link D (00 INFORMACION RELEVANTE ALUZINA 2023) | listed (12 files: price lists, catalogues, brochures, presentations), not yet seeded | ar-15 |

## How the founder confirms the inferred facts (A-09)

Everything marked "inferred" in the table above is corrected in the product, on **A-09 Archive review**
(`/#/founder/archive-review`, founder portal, permission `projects.write`), never in a chat thread:

- One row per archived project (the `projects` rows tagged `archive`). Type, status, client and year are
  inline editors; the intake note (the duplicate / quotation / year sentences the crawler wrote into the
  summary) is shown read only next to them, with the Dropbox folder link.
- **Confirm** adds the tag `confirmado` and removes the sentence
  `Tipo y estado inferidos de la carpeta; confirmar con la fundadora.` from the project summary, keeping
  the folder line and the notes. The row then reads as fact; "pending only" (the default filter) hides it.
  There is no new column: a confirmed row is a tagged row (changelog draft `archive-review.md`).
- **Mark as duplicate of…** tags the row `duplicado`, appends `Duplicado de <name> (<id>).` to its summary
  and records a `replaces` relation from the project that is kept to the duplicate, so nothing is deleted
  while the grouping is still being decided.
- A missing client is created from its row (name, kind, sector), which writes a `clients` row, the
  project's client name and a `for-client` relation.
- The eleven questions of changelog 0019 section H are listed on the page in English and Spanish, each
  with a button that filters the table to the rows it is about (question 3 -> status `proposal-sent`,
  question 6 -> the projects with no year, and so on). They live in the page, not in the changelog file,
  because the list shrinks as she answers.

Until a row is confirmed, treat its type, status, client and year as inferred, whatever this file's
inventory tables say.

## Collections (non-project folders)

```
status: current
since: 2026-09-21
source: prompt 0021 (Aleja Guerra via Justin Massion, Slack #all-aluzina), changelog 0023, D-083..D-086; docs/archive/collections/README.md
```

A **collection** is a shared Dropbox folder that is not a project folder: the studio's own campaign and asset material. Two so far, shared on 2026-09-21: `campaign-2021` ("digital campain aluzina 2021", 179 files) and `studio-assets` ("services , lighting , presentatios , projects , icones ,", 1,517 files). Unlike the project archive above, a collection is downloaded as a zip and indexed by `scripts/archive/index-collection.py` (`npm run archive:collection`), is **not seeded file by file** (D-083, the collection twin of D-071: the hub loads `docs/archive/collections/<slug>/index.json` lazily; the seed keeps one `assets` row per set from `sets.json` plus `depicts` relations to the archived projects a set shows), and is browsed on the brand portal at G-09 `/#/brand/collections`, not on S-12 / S-13. The D-059 rules apply with three extensions (D-084: folder-level redacted rows for wholly private folders, template folders indexed by name but never rendered, priced content internal) and a served budget per pass (D-086: 25 MiB combined, 24.68 MiB this pass). Everything about the two folders — rules, the per-set table, what is inferred, the brand-era evidence and the open questions — is `docs/archive/collections/README.md`; the brand facts are in `brand.md` ("Campaign 2021 and studio assets").

## Change log

- 2026-09-21 (prompt 0021, changelog 0023, Fable 5.1): "Collections (non-project folders)" added for the two Dropbox folders Aleja shared (campaign 2021, studio assets), indexed at `docs/archive/collections/<slug>/` by `index-collection.py` (D-083..D-086), shown on G-09.
- 2026-09-21 (step 14 pass 3, changelog 0022, Fable 5.1 integration): ar-07 deep indexes + served previews for the 2019-2025 and root folders (164 folders deep-indexed with previews in ar-07 (2025 35, 2024 43, 2022 24, 2021 23, 2020 24, 2019-2023 13, root 2): 5 291 files in 186 lazy chunks, 1 777 thumbnails and 750 page renders served, 92.1 MB in total (62.4 MB new), R7 passed over every chunk and served file name); ar-19 the files leave the seed for lazy chunks (D-071); ar-22 stage phrases of the 2026 folder template (section above); JOE GALLINA INTERIOR gets `year` 2023 inferred from its file dates (170 of 179), marked `yearInferred`; A-09 is the place the founder answers the open questions (ar-08).
- 2026-09-21 (ar-06 / ar-16, Fable 5.1): deep index + served previews for the 18 folders of PROYECTOS 2026 (575 files, 413 thumbnails, 196 page renders rendered; 23.5 MB served); the 15 "empty" folders re-listed: 12 hold files, 3 stay empty; R2 extended to contratos / cotizaci* / documentación importante / consignaciones / pagos / proveedores, R3 to quotation content, one explicit client-name rename (changelog pending `archive-ar06`).
- 2026-09-21: created from the pass-0019 crawls (inventory of 187 folders incl. the 74 the first, paginated listing had missed; deep index of JOE GALLINA INTERIOR), redaction D-059, decisions D-055..D-061 (prompt 0017, changelog 0019).
- 2026-09-21 (ar-23, Opus 5): A-09 Archive review added — the inferred type, status, client, year and duplicate flags are now confirmed or corrected in the product (tag `confirmado` + the summary sentence removed; duplicates as a `replaces` relation); section "How the founder confirms the inferred facts (A-09)" above (changelog pending `archive-review`).
