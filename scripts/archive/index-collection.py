#!/usr/bin/env python3
"""Index a Dropbox folder that was downloaded as a local tree (a *collection*, not a project folder), classify every file,
render the public ones and serve the renders into the hub. Intake step for the two folders Aleja Guerra shared in
Slack #all-aluzina on 2026-09-21 ("digital campain aluzina 2021" and "services, lighting, presentatios, projects, icones").
Python 3, PyMuPDF, Pillow, pillow-heif (optional, HEIC), ffmpeg (optional, video poster frames), soffice (optional, pptx).

Usage
  python3 scripts/archive/index-collection.py --src <dir> --slug campaign-2021|studio-assets [--repo <repo root>]
         [--title ...] [--title-es ...] [--caption ...] [--source-url ...] [--shared-by ...] [--shared-at ...]
         [--rules <slug>] [--dry-run] [--force]
  The rules table (RULES) is keyed by slug; --rules picks another slug's table for a re-download. Idempotent: renders
  that already exist and match the plan are kept, renders the plan no longer references are pruned, the JSON is
  rewritten. --dry-run classifies, plans and prints the tables without touching the served folder or the JSON.

Output (shape: `apps/hub/src/domain/collections.ts`, keys exactly as there)
  docs/archive/collections/<slug>/index.json   canonical index: collection header, totals, sets[], files[]  (memory)
  docs/archive/collections/<slug>/sets.json    the same minus files[] (seed input, `seed/collections.ts`)
  apps/hub/public/archive/<slug>/thumbs/*.jpg|png   512 px long edge, JPEG q72 (PNG with alpha only for icon sets)
  apps/hub/public/archive/<slug>/pages/*.jpg        1200 px wide, q72, <= 6 pages per document (<= 3 for .ai > 100 MB)
  apps/hub/public/archive/<slug>/sheets/<set>.jpg   contact sheet, 4 columns, 320 px square cells, <= 48 cells, q72
  Paths inside the index are relative to apps/hub/public/archive/<slug>/ ("thumbs/abril-1-01.jpg").

Budgets (D-069 line: both collections together <= 25 MB served)
  - dedupe by md5: one render per content, duplicates point at the original (`duplicateOf`) and share its render paths
  - photo caps: a set with more than PHOTO_CAP (24) renderable files gets one contact sheet (<= 48 cells sampled evenly
    across its subfolders) and at most FEATURED (12) thumbs; the rest are index-only rows
  - pages only for documents with more than one page; never for internal, third-party, RAW or broken files
  - --max-pages / --page-px / --page-q / --sheet-q lower a collection's page and sheet cost (D-069 style, recorded in
    index.json `renderSettings`); the run prints served bytes per set and per collection

Redaction rules ported from scripts/archive/build-index.mjs (D-059; matching on the accent-stripped lower-cased name)
  | # | Rule | Effect here |
  |---|------|-------------|
  | R1 | file name matches NAME_RE (rut, seguridad social, planilla, cedula, contrato, comprobante, cuenta de cobro, factura, cotizaci, invoice, whatsapp image, pago, ...) | name -> "<Tipo> (redactado).<ext>", `redacted: true`, no render / excerpt / palette; ext, bytes, md5 kept. Template folders (02_MODELO ..., 06_ BRIEF ...) keep their names: only the real documents named in the rules table are redacted |
  | R2 | folder is in the FOLDER_REDACT list (03_CONTABILIDAD, 09_CONTRATOS, 0_13_BASE DE DATOS, 017_TRABAJADORES, 0_12_DISEÑADORES) | one row for the whole folder ("<Label> (N archivos, redactado)"), no per-file rows at all |
  | R3 | text carries a currency amount or quotation wording (no. de cotización, facturar a nombre, total a pagar, forma de pago) in a price-checked set (presentations, company docs, website, methodology, articles) | document -> internal, no render, no excerpt (D-068 extended). Softer words (precio, cotización, valor total) or personal data (cédula, NIT, fecha de nacimiento) only drop the excerpt; phones / emails are stripped from every excerpt |
  | R4 | a file name that is a person's name (TESTIMONIO portraits) | renamed to its role ("Testimonio de cliente N"), no render; the founder's name is public (R7 exemption) |
  | R5 | company, client and project folder names (SODIME, COASSIST, JOE GALLINA, SHABELA, ...) | kept: they are the studio's identifiers |
  | R6 | share links | the collection has one link (the folder share); files carry no per-file href, so nothing to replace |
  | R7 | self-check before writing: no person name in any name / path / note / excerpt; no rendered or public row whose name matches NAME_RE unless it is the "(redactado)" form; no currency / ID / phone / email pattern in any excerpt or note; every served path referenced exists and nothing unreferenced is served | any hit exits 1 and nothing is written |
"""
import argparse, hashlib, io, json, mimetypes, os, re, shutil, subprocess, sys, time, unicodedata, zipfile
from collections import defaultdict

FFMPEG = os.environ.get('FFMPEG', '/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux')
SOFFICE = os.environ.get('SOFFICE', '/usr/bin/soffice')
THUMB_PX, THUMB_Q = 512, 72
PAGE_PX, PAGE_Q, MAX_PAGES, MAX_PAGES_BIG_AI, BIG_AI = 1200, 72, 6, 3, 100 * 1024 * 1024
SHEET_COLS, SHEET_CELL, SHEET_MAX, SHEET_Q = 4, 320, 48, 72
PHOTO_CAP, FEATURED = 24, 12
BUDGET_BYTES = 25 * 1024 * 1024

# ---------------------------------------------------------------------------------------------------------------------
# Name decoding, normalisation
# ---------------------------------------------------------------------------------------------------------------------
# Dropbox's zip stored non-ASCII names in a mixed encoding; unzip wrote `#Uxxxx`. Plain Latin-1 escapes decode to the code
# point; three Mac-Roman mis-decodings are mapped by hand (checked against DISEÑO, EFÍMERO, Medellín, ¡El diseño!).
MAC_ROMAN_FIX = {'2022': 'Ñ', '00a7': 'ñ', '00f7': 'Í', '00b0': 'í', '2260': '¡'}
def decode_name(s):
    return re.sub(r'#U([0-9a-fA-F]{4})', lambda m: MAC_ROMAN_FIX.get(m.group(1).lower(), chr(int(m.group(1), 16))), s)

def strip_accents(s): return unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
def norm(s): return re.sub(r'\s+', ' ', strip_accents(s).lower().replace('_', ' ')).strip()
def slugify(s):
    return re.sub(r'^-+|-+$', '', re.sub(r'[^a-z0-9]+', '-', strip_accents(s).lower()))
def strip_prefix(name):
    stripped = re.sub(r'^\s*\d+(?:[_.\-]\d+)*[_.\-\s]+\s*', '', name).strip()
    return stripped or name.strip()
def ext_of(name):
    m = re.search(r'\.([A-Za-z0-9]{1,6})$', name)
    return m.group(1).lower() if m else ''
def repath(dec, newname):
    return (dec.rsplit('/', 1)[0] + '/' + newname) if '/' in dec else newname
def human(n):
    for u in ('B', 'KB', 'MB', 'GB'):
        if n < 1024 or u == 'GB': return f'{n:.1f} {u}' if u != 'B' else f'{n} B'
        n /= 1024

# ---------------------------------------------------------------------------------------------------------------------
# Privacy (D-059 R1 / R3 / R7)
# ---------------------------------------------------------------------------------------------------------------------
NAME_RE = re.compile(r'\brut\b|seguridad social|seg soc|planilla|autoliquidacion|\barus\b|cedula|tarjeta profesional|contrato|contract|agree?ment|comprobante|cuenta ?de ?cobro|cuentadecobro|factura|\bfv-|\bfra\b|\bcxc\b|pedido|cotizaci|quotation|invoice|whatsapp image|\bpagos?\b|payment|\bcash\b|asana|\.xml$|c\.m ')
TYPE_RULES = [
    (re.compile(r'\brut\b'), 'RUT'),
    (re.compile(r'seguridad social|seg soc|planilla|autoliquidacion|\barus\b'), 'Seguridad social'),
    (re.compile(r'cedula|tarjeta profesional'), 'Documento personal'),
    (re.compile(r'contrato|contract|agree?ment'), 'Contrato'),
    (re.compile(r'comprobante|\bpagos?\b|payment|\bcash\b'), 'Comprobante de pago'),
    (re.compile(r'cuenta ?de ?cobro|cuentadecobro|\bcxc\b'), 'Cuenta de cobro'),
    (re.compile(r'factura|\bfv-|\bfra\b|invoice|\.xml$'), 'Factura'),
    (re.compile(r'cotizaci|quotation'), 'Cotización'),
    (re.compile(r'pedido'), 'Pedido'),
    (re.compile(r'whatsapp image'), 'Imagen de WhatsApp'),
    (re.compile(r'asana|c\.m |cobro'), 'Documento financiero'),
]
def type_of(name):
    n = norm(name)
    for rx, t in TYPE_RULES:
        if rx.search(n): return t
    return 'Documento financiero'
CURRENCY_RE = re.compile(r'\$\s?\d[\d.,]*|\d[\d.,]*\s?(?:cop|usd|eur|€|pesos|d[oó]lares|euros)\b|(?:\bcop|\busd|\beur|€)\s?\d', re.I)
FIN_CONTENT_RE = re.compile(r'no\.? de cotizaci[oó]n|facturar a nombre|v/r unit|total a pagar|forma de pago|valor total|\bprecios?\b|\bcotizaci[oó]n\b|\binversi[oó]n\b.{0,20}\d', re.I)
FIN_STRICT_RE = re.compile(r'no\.? de cotizaci[oó]n|facturar a nombre|v/r unit|total a pagar|forma de pago', re.I)  # reads as a quotation / invoice (R3 render decision)
PERSONAL_RE = re.compile(r'fecha (de )?nacimiento|\bc[eé]dula\b|\bc\.?c\.?\s*\d|\bnit\b|\bcc\s?\d', re.I)
EMAIL_RE = re.compile(r'[\w.+-]+@[\w-]+\.[\w.-]+')
PHONE_RE = re.compile(r'(?<![\d.])(?:\+?\d[\d\s().-]{7,}\d)(?![\d.])')
def phone_hits(text):
    return [m.group(0) for m in PHONE_RE.finditer(text) if sum(c.isdigit() for c in m.group(0)) >= 9]
# People whose names appear in file names outside the redacted folders (R4 renames) and in the redacted folders (R7 check).
PERSON_NAMES = ['DIEGO CHALARCA', 'LILA MAYA', 'CAROLINA RESTREPO', 'ALEJANDRO CUERVO', 'CATALINA', 'DIANA SUAREZ']
# R3, explicit: files whose rendered pages were reviewed and carry another person's data (name kept, no render / excerpt).
SENSITIVE_FILES = {'tarjetas FINALES 2.ai': 'Business-card artwork naming a team member next to the founder: not rendered (R3).'}
# R3 exemption, explicit: the methodology-by-phases document ends with commercial terms (forma de pago, cotización) but
# carries no amount; the rules of prompt 0022 name it public, so the price check is skipped and only the excerpt is dropped.
PUBLIC_OVERRIDE = {'00_METODOLOGIA POR FASES small  copy.pdf', 'DISEÑO ALUZINA.pdf', '00_ METODOLOGIA POR FASES INTERIORISMO COMERCIAL .ai'}
PUBLIC_NAMES = ['ALEJANDRA GUERRA', 'ALEJA GUERRA', 'ALEJANDRA_GUERRA']  # the founder (R7 exemption)
SENSITIVE_DIRS = ['PAGINA web  2022/TESTIMONIO']  # R3/R4: client testimonials (portraits + quotes naming clients): internal, never rendered or excerpted
RENAME_FILES = {  # R4: decoded file name -> role name (the TESTIMONIO portraits of the 2022 website)
    'DIEGO CHALARCA .jpg': 'Testimonio de cliente 1.jpg',
    'LILA MAYA .jpg': 'Testimonio de cliente 2.jpg',
    'carolina restrepo.jpg': 'Testimonio de cliente 3.jpg',
}

def clean_excerpt(text):
    """R3 on excerpts: prices / quotation wording / personal data -> no excerpt at all; phones and emails stripped."""
    if not text: return '', None
    if CURRENCY_RE.search(text) or FIN_CONTENT_RE.search(text): return '', 'prices'
    if PERSONAL_RE.search(text): return '', 'personal data'
    t = EMAIL_RE.sub('[correo omitido]', text)
    for h in phone_hits(t): t = t.replace(h, '[teléfono omitido]')
    return t, None

# ---------------------------------------------------------------------------------------------------------------------
# Rules tables (one per collection). Each rule: prefix (decoded folder path, `/`-separated, no trailing slash) ->
# set id, kind, mode. Modes: render (public, renders), index (public row, no render), internal (per-file rows, no
# render), folder (one redacted row for the folder), templates (internal, names kept, only REAL_DOCS redacted).
# The first matching prefix (longest first) wins. `per_child` creates one set per direct subfolder of the prefix.
# ---------------------------------------------------------------------------------------------------------------------
BROKEN_EXTS = {'icloud', 'bak', 'dwl2', 'dwl'}
RAW_EXTS = {'cr2', 'xmp', 'nef', 'arw', 'dng'}
IMAGE_EXTS = {'jpg', 'jpeg', 'jfif', 'png', 'webp', 'gif', 'tif', 'tiff', 'bmp', 'heic', 'jpf', 'jp2'}
DOC_EXTS = {'pdf', 'ai', 'eps'}
OFFICE_RENDER_EXTS = {'pptx'}
VIDEO_EXTS = {'mp4', 'mov', 'm4v'}
TEXT_ONLY_EXTS = {'docx', 'txt'}
SOURCE_EXTS = {'psd', 'dwg', 'dotx', 'skp', '3dm', 'iff'}
FONT_EXTS = {'otf', 'ttf'}
THIRD_PARTY_FILES = {  # decoded file name -> note (D-068: indexed, never served)
    '8_Conceptos_basicos_Diseno_de_iluminacion_interior.pdf': 'Third-party lighting textbook kept as reference; indexed only (D-068).',
    '2021_09_Foscarini-—-Spokes_-2021.pdf': 'Foscarini product catalogue (third party); indexed only (D-068).',
    '2021_09_Foscarini-—-Spokes_-2021 (1).pdf': 'Foscarini product catalogue (third party, duplicate); indexed only (D-068).',
    'Morosopoli-it-en-Moroso-0-cat57041403 (1).pdf': 'Moroso furniture catalogue (third party); indexed only (D-068).',
    'MyLight.pdf': 'MyLight lighting catalogue (third party); indexed only (D-068).',
    'Orange Pink Pastel Minimalist Tender Sunset Desktop Wallpaper.pdf.pdf': 'Canva template export, not the studio\'s own work (guess); indexed only.',
}
PRICE_NAME_RE = re.compile(r'cotizaci|\bprecio|\beuros?\b|\bcobros?\b|presupuesto', re.I)

RULES = {
  'campaign-2021': {
    'default_kind': 'social-posts', 'year': 2021,
    'rules': [
      {'prefix': '', 'set': 'root', 'kind': 'social-posts', 'mode': 'render', 'title': 'Loose files (campaign root)', 'titleEs': 'Archivos sueltos (raíz de la campaña)'},
      {'prefix': 'ABRIL', 'set': 'abril', 'kind': 'social-posts', 'mode': 'render', 'title': 'April posts and San Fernando print ads', 'titleEs': 'Publicaciones de abril y publicidad impresa San Fernando'},
      {'prefix': 'ANUNCIOS FACEBOOK', 'set': 'anuncios-facebook', 'kind': 'ads', 'mode': 'render', 'title': 'Facebook ads, banners and web project boards', 'titleEs': 'Anuncios de Facebook, banners y tableros de proyectos web'},
      {'prefix': 'IMAGENES CAMPAÑA DIGITAL', 'set': 'imagenes-campana-digital', 'kind': 'banners', 'mode': 'render', 'title': 'Digital campaign banners (JPG, standard ad sizes)', 'titleEs': 'Banners de campaña digital (JPG, tamaños estándar)'},
      {'prefix': 'IMAGENES CAMPANA 2021', 'set': 'imagenes-campana-2021', 'kind': 'banners', 'mode': 'render', 'title': 'Campaign 2021 banner sources (AI, standard ad sizes)', 'titleEs': 'Fuentes de banners campaña 2021 (AI, tamaños estándar)'},
      {'prefix': 'IMAGENES CLUB UNION', 'set': 'imagenes-club-union', 'kind': 'photo-shoot', 'mode': 'render', 'title': 'Club Unión photo shoot (JPG + RAW)', 'titleEs': 'Sesión fotográfica Club Unión (JPG + RAW)'},
      {'prefix': 'IMAGENES LUMINARIAS', 'set': 'imagenes-luminarias', 'kind': 'renders', 'mode': 'render', 'title': 'Luminaire renders (screen captures)', 'titleEs': 'Renders de luminarias (capturas de pantalla)'},
      {'prefix': 'OCTUBRE', 'set': 'octubre', 'kind': 'social-posts', 'mode': 'render', 'title': 'October Instagram posts', 'titleEs': 'Publicaciones de Instagram de octubre'},
      {'prefix': 'fotografia', 'set': 'fotografia', 'kind': 'photo-shoot', 'mode': 'render', 'title': 'Luminaire photography (Metatron, Vesica)', 'titleEs': 'Fotografía de luminarias (Metatron, Vesica)'},
    ],
  },
  'studio-assets': {
    'default_kind': 'internal', 'year': None,
    'rules': [
      {'prefix': 'ALUZINA', 'set': 'aluzina-root', 'kind': 'company-docs', 'mode': 'render', 'price_check': True, 'title': 'Loose files (ALUZINA root)', 'titleEs': 'Archivos sueltos (raíz de ALUZINA)'},
      {'prefix': 'ALUZINA/00_ PRESENTACIONES', 'set': 'presentaciones', 'kind': 'presentations', 'mode': 'render', 'price_check': True, 'title': 'Studio presentations and their editable sources', 'titleEs': 'Presentaciones del estudio y sus editables'},
      {'prefix': 'ALUZINA/017_TRABAJADORES', 'set': 'trabajadores', 'kind': 'internal', 'mode': 'folder', 'label': 'Trabajadores', 'title': 'Staff documents (redacted folder)', 'titleEs': 'Documentos de trabajadores (carpeta redactada)'},
      {'prefix': 'ALUZINA/01_ ARTES', 'set': 'artes', 'kind': 'merch', 'mode': 'render', 'title': 'Brand artwork: logos, stationery, shirts, masks, invitations', 'titleEs': 'Artes de marca: logos, papelería, camisas, tapabocas, invitaciones'},
      {'prefix': 'ALUZINA/02_MODELO COTIZACION Y CUENTA COBRO', 'set': 'plantillas-cotizacion-y-cuenta-de-cobro', 'kind': 'templates', 'mode': 'templates', 'title': 'Quotation, invoice and site-report templates', 'titleEs': 'Plantillas de cotización, cuenta de cobro y corte de obra',
       'real_docs': {'06_CUENTA DE COBRO SODIME  (1) (1).xlsx': 'Cuenta de cobro', '06_CUENTA DE COBRO SODIME  (1).xlsx': 'Cuenta de cobro', '04_FACTURA DE VENTA  copy.xlsx': 'Factura', 'INTERGASTRO.xlsx': 'Cuenta de cobro'}},
      {'prefix': 'ALUZINA/03_CONTABILIDAD', 'set': 'contabilidad', 'kind': 'internal', 'mode': 'folder', 'label': 'Contabilidad 2017-2025', 'title': 'Accounting 2017-2025 (redacted folder)', 'titleEs': 'Contabilidad 2017-2025 (carpeta redactada)'},
      {'prefix': 'ALUZINA/04_ MODELO AUTOCAD', 'set': 'modelo-autocad', 'kind': 'sources', 'mode': 'index', 'title': 'AutoCAD templates (blocks, title block)', 'titleEs': 'Plantillas de AutoCAD (bloques, rótulo, cajetín)'},
      {'prefix': 'ALUZINA/05_DOCUMENTACION ALUZINA', 'set': 'documentacion-aluzina', 'kind': 'company-docs', 'mode': 'internal', 'title': 'Company documents (brand, ideology, processes)', 'titleEs': 'Documentación de la empresa (marca, ideología, procesos)',
       'redact_re': r'acuerdo de socios|carta de intenci|contra\w*tos|responsabilidades junior|que empleados necesita|acta de reunion', 'redact_type': 'Documento societario/laboral'},
      {'prefix': 'ALUZINA/06_ BRIEF PARA CLIENTES', 'set': 'brief-para-clientes', 'kind': 'templates', 'mode': 'templates', 'title': 'Client brief templates', 'titleEs': 'Plantillas de brief para clientes', 'real_docs': {}},
      {'prefix': 'ALUZINA/09_CONTRATOS', 'set': 'contratos', 'kind': 'internal', 'mode': 'folder', 'label': 'Contratos', 'title': 'Contracts (redacted folder)', 'titleEs': 'Contratos (carpeta redactada)'},
      {'prefix': 'ALUZINA/0_10_PROVEEDORES', 'set': 'proveedores', 'kind': 'internal', 'mode': 'internal', 'no_excerpt': True, 'title': 'Supplier list', 'titleEs': 'Lista de proveedores'},
      {'prefix': 'ALUZINA/0_11_ARTICULOS', 'set': 'articulos', 'kind': 'articles', 'mode': 'render', 'price_check': True, 'title': 'Articles written by the studio (drafts)', 'titleEs': 'Artículos escritos por el estudio (borradores)'},
      {'prefix': 'ALUZINA/0_12_DISEÑADORES', 'set': 'disenadores', 'kind': 'internal', 'mode': 'folder', 'label': 'Diseñadores', 'title': 'Designers / intern role (redacted folder)', 'titleEs': 'Diseñadores / cargo del practicante (carpeta redactada)'},
      {'prefix': 'ALUZINA/0_13_BASE DE DATOS  ALUZINA', 'set': 'base-de-datos', 'kind': 'internal', 'mode': 'folder', 'label': 'Base de datos de contactos', 'title': 'Contact database (redacted folder)', 'titleEs': 'Base de datos de contactos (carpeta redactada)'},
      {'prefix': 'ALUZINA/0_14_PAGINA WEB Aluzina', 'set': 'web-root', 'kind': 'website', 'mode': 'render', 'price_check': True, 'title': 'Website 2022: loose files (folder root)', 'titleEs': 'Página web 2022: archivos sueltos (raíz de la carpeta)'},
      {'prefix': 'ALUZINA/0_14_PAGINA WEB Aluzina', 'per_child': True, 'set_prefix': 'web-', 'kind': 'website', 'mode': 'render', 'price_check': True, 'title_prefix': 'Website 2022: ', 'titleEs_prefix': 'Página web 2022: '},
      {'prefix': 'ALUZINA/0_15_CODIGOS QR', 'set': 'codigos-qr', 'kind': 'qr', 'mode': 'render', 'title': 'QR codes for luminaires and print', 'titleEs': 'Códigos QR de luminarias e impresión'},
      {'prefix': 'ALUZINA/0_16_MODELOS DE PHOTOSHOP', 'set': 'modelos-de-photoshop', 'kind': 'sources', 'mode': 'index', 'title': 'Photoshop mockups', 'titleEs': 'Modelos de Photoshop'},
      {'prefix': 'ALUZINA/0_METODOLOGIA ALUZINA', 'set': 'metodologia', 'kind': 'methodology', 'mode': 'render', 'price_check': True, 'title': 'Methodology by phases (PDF) and costing sheets', 'titleEs': 'Metodología por fases (PDF) y hojas de costeo', 'redact_exts': {'xlsx': 'Cotización'}},
      {'prefix': 'ALUZINA/2026 INFORMACION', 'set': 'informacion-2026', 'kind': 'internal', 'mode': 'internal', 'title': '2026 framework chapters (drafts)', 'titleEs': 'Capítulos del marco 2026 (borradores)', 'year': 2026},
      {'prefix': 'ALUZINA/HAPPY NEW YEAR', 'set': 'happy-new-year', 'kind': 'social-posts', 'mode': 'render', 'title': 'Happy New Year greeting (GIF, MP4, PSD)', 'titleEs': 'Saludo de Feliz Año (GIF, MP4, PSD)'},
      {'prefix': 'ALUZINA/LETRERO EXTERIOR ALUZINA', 'set': 'letrero-exterior', 'kind': 'merch', 'mode': 'render', 'title': 'Exterior sign artwork', 'titleEs': 'Arte del letrero exterior'},
      {'prefix': 'ICONOS 2024', 'set': 'iconos-2024', 'kind': 'icons', 'mode': 'render', 'png_alpha': True, 'title': 'Icon set 2024', 'titleEs': 'Iconos 2024', 'year': 2024},
      {'prefix': 'IMAGENES DE PROYECTOS ALUZINA', 'set': 'imagenes-de-proyectos-root', 'kind': 'project-photos', 'mode': 'render', 'title': 'Loose files (IMAGENES DE PROYECTOS root)', 'titleEs': 'Archivos sueltos (raíz de IMAGENES DE PROYECTOS)'},
      {'prefix': 'IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload', 'per_child': True, 'set_prefix': 'reload-', 'kind': 'project-photos', 'mode': 'render', 'title_prefix': 'Reload: ', 'titleEs_prefix': 'Reload: '},
      {'prefix': 'INSTAGRAM LU7', 'set': 'instagram-lu7', 'kind': 'video', 'mode': 'render', 'title': 'LU7 Instagram videos (chakras, circular luminaire)', 'titleEs': 'Videos de Instagram LU7 (chakras, luminaria circular)'},
      {'prefix': 'LUMINARIAS', 'set': 'luminarias', 'kind': 'renders', 'mode': 'render', 'title': 'Luminaire product photos', 'titleEs': 'Fotos de producto de luminarias'},
      {'prefix': 'PRESENTACIONES', 'set': 'lighting-presentation', 'kind': 'presentations', 'mode': 'render', 'price_check': True, 'title': 'Lighting presentation images', 'titleEs': 'Imágenes de la presentación de iluminación'},
      {'prefix': 'SERVICIOS ALUZINA', 'set': 'servicios-aluzina', 'kind': 'internal', 'mode': 'internal', 'empty_ok': True, 'title': 'SERVICIOS ALUZINA (empty folder)', 'titleEs': 'SERVICIOS ALUZINA (carpeta vacía)'},
      {'prefix': 'TODOS LOS ESPACIOS', 'set': 'todos-los-espacios-root', 'kind': 'project-photos', 'mode': 'render', 'title': 'Loose files (TODOS LOS ESPACIOS root)', 'titleEs': 'Archivos sueltos (raíz de TODOS LOS ESPACIOS)'},
      {'prefix': 'TODOS LOS ESPACIOS', 'per_child': True, 'set_prefix': 'espacios-', 'kind': 'project-photos', 'mode': 'render', 'title_prefix': 'Space: ', 'titleEs_prefix': 'Espacio: '},
    ],
  },
}
# Set-level year hints from folder names (studio-assets); campaign sets are all 2021.
YEAR_HINTS = {'web-pagina-web-2022': 2022, 'iconos-2024': 2024, 'informacion-2026': 2026}
# Project linking (D-060 style, inferred from explicit name tokens; every id is checked against the seed before use).
LINKS = [
    (re.compile(r'\bsha[bv]ela\b|\bnecocli\b'), ['prj-ar-shabela-charcuteria-necocli-2021', 'prj-ar-shabela-fotos', 'prj-ar-shavela']),
    (re.compile(r'casa de noham|glamour airbnb'), ['prj-ar-noam-house']),
    (re.compile(r'\bel encanto\b'), ['prj-ar-el-encanto', 'prj-ar-el-encanto-2024']),
    (re.compile(r'\bnew york\b'), ['prj-ar-new-york-house']),
    (re.compile(r'\bmiami\b'), ['prj-ar-casa-miami-ovy']),
    (re.compile(r'\bunion\b'), ['prj-pf-club-union-sala-de-masajes']),
    (re.compile(r'\bcoassist\b'), ['prj-ar-coassist-2021', 'prj-ar-coassist-termial-de-el-sur-2020', 'prj-pf-coassist-aseguradora']),
    (re.compile(r'\bsodime\b'), ['prj-ar-sodime', 'prj-ar-sodime-producciom', 'prj-pf-sodime-consultorio-medico']),
    (re.compile(r'\bbrew ?house\b'), ['prj-pf-brewhouse-bar-cerveza-artesanal']),
    (re.compile(r'\bbonny\b'), ['prj-ar-proyectos-bonny', 'prj-ar-bonny-juego-nube', 'prj-ar-parque-bonny-noriega']),
    (re.compile(r'\bjoe gallina\b'), ['prj-ar-joe-gallina-interior']),
    (re.compile(r'\bintergastro\b'), ['prj-ar-intergastro']),
    (re.compile(r'\bbrookling\b'), ['prj-ar-brookling-pizza']),
    (re.compile(r'\bdans bar\b'), ['prj-ar-dans-bar']),
    (re.compile(r'\bbiotectura\b'), ['prj-ar-modulos-biotectura-para-interiorismo']),
]
# Tokens that name a project without a seed row (recorded, never invented): brochure-only names and unknowns.
UNLINKED_TOKENS = re.compile(r'terrazino|terrasino|mantix|mantyx|semana de la juventud|lu7|polaris|wabi|espiritual|eclectico|vintage|simon apartamento|rincon alicante', re.I)

# ---------------------------------------------------------------------------------------------------------------------
# Rendering helpers (render-previews.py lineage)
# ---------------------------------------------------------------------------------------------------------------------
def save_jpg(img, path, maxside, q):
    from PIL import Image
    im = img.convert('RGB'); im.thumbnail((maxside, maxside), Image.LANCZOS); im.save(path, 'JPEG', quality=q, optimize=True, progressive=True)
    return os.path.getsize(path)
def save_png_alpha(img, path, maxside):
    from PIL import Image
    im = img.convert('RGBA'); im.thumbnail((maxside, maxside), Image.LANCZOS)
    im = im.quantize(colors=256, method=Image.Quantize.FASTOCTREE)  # palette PNG keeps alpha and stays small
    im.save(path, 'PNG', optimize=True)
    return os.path.getsize(path)
def palette_of(img, n=6):
    from PIL import Image
    im = img.convert('RGB'); im.thumbnail((120, 120))
    q = im.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()[: n * 3]; counts = sorted(q.getcolors(), reverse=True)
    return ['#%02x%02x%02x' % tuple(pal[idx * 3: idx * 3 + 3]) for _, idx in counts[:n]]
def pix_to_img(pix):
    from PIL import Image
    return Image.frombytes('RGB', (pix.width, pix.height), pix.samples) if pix.n == 3 else Image.open(io.BytesIO(pix.tobytes('png')))

class Renderer:
    """Opens a source once per file: `preview()` (first page / frame / image), `page(i)`, `text()`, `page_count`."""
    def __init__(self, local, ext, workdir):
        self.local, self.ext, self.workdir = local, ext, workdir
        self.doc = None; self.page_count = None; self.error = None; self._img = None
        try:
            if ext in DOC_EXTS:
                import pymupdf; self.doc = pymupdf.open(local); self.page_count = self.doc.page_count
            elif ext in OFFICE_RENDER_EXTS:
                import pymupdf
                outdir = os.path.join(workdir, 'lo-pdf'); os.makedirs(outdir, exist_ok=True)
                pdf = os.path.join(outdir, os.path.splitext(os.path.basename(local))[0] + '.pdf')
                if not os.path.exists(pdf): subprocess.run([SOFFICE, '--headless', '--convert-to', 'pdf', '--outdir', outdir, local], capture_output=True, timeout=300)
                if os.path.exists(pdf): self.doc = pymupdf.open(pdf); self.page_count = self.doc.page_count
                else: self.error = 'libreoffice produced no pdf'
            elif ext in IMAGE_EXTS:
                from PIL import Image
                if ext == 'heic':
                    import pillow_heif; pillow_heif.register_heif_opener()
                im = Image.open(local)
                if getattr(im, 'n_frames', 1) > 1: im.seek(0)
                im.load(); self._img = im
            elif ext in VIDEO_EXTS:
                from PIL import Image
                tmp = os.path.join(workdir, 'frame-' + hashlib.md5(local.encode()).hexdigest()[:8] + '.png')
                subprocess.run([FFMPEG, '-y', '-loglevel', 'error', '-ss', '1', '-i', local, '-frames:v', '1', tmp], capture_output=True, timeout=120)
                if os.path.exists(tmp): self._img = Image.open(tmp); self._img.load(); os.remove(tmp)
                else: self.error = 'no poster frame (the bundled ffmpeg cannot decode this mp4)'
            else: self.error = 'no renderer'
        except Exception as ex:
            self.error = f'{type(ex).__name__}: {str(ex)[:100]}'
    def page(self, i, px):
        import pymupdf
        pg = self.doc[i]; z = px / max(pg.rect.width, 1)
        return pix_to_img(pg.get_pixmap(matrix=pymupdf.Matrix(z, z), alpha=False))
    def preview(self, px):
        if self._img is not None: return self._img
        if self.doc is not None and self.page_count: return self.page(0, px)
        return None
    def text(self, max_pages=60, limit=20000):
        if self.doc is None: return ''
        out = ''
        for i in range(min(max_pages, self.page_count or 0)):
            out += self.doc[i].get_text() + '\n'
            if len(out) > limit: break
        return re.sub(r'\s+', ' ', out).strip()
    def has_alpha(self):
        return self._img is not None and self._img.mode in ('RGBA', 'LA', 'P') and ('transparency' in self._img.info or self._img.mode in ('RGBA', 'LA'))
    def close(self):
        if self.doc is not None: self.doc.close()

def docx_text(local, limit=4000):
    try:
        with zipfile.ZipFile(local) as z: xml = z.read('word/document.xml').decode('utf8', 'ignore')
        txt = re.sub(r'<w:p[ >]', '\n<w:p ', xml); txt = re.sub(r'<[^>]+>', '', txt)
        return re.sub(r'\s+', ' ', txt).strip()[:limit]
    except Exception: return ''

def md5_of(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(4 << 20), b''): h.update(chunk)
    return h.hexdigest()

def image_dims(local, ext):
    try:
        from PIL import Image
        if ext == 'heic':
            import pillow_heif; pillow_heif.register_heif_opener()
        with Image.open(local) as im: return im.size
    except Exception: return (None, None)

# ---------------------------------------------------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True); ap.add_argument('--slug', required=True); ap.add_argument('--rules')
    ap.add_argument('--repo', default=os.getcwd()); ap.add_argument('--title', default=''); ap.add_argument('--title-es', default='')
    ap.add_argument('--caption', default=''); ap.add_argument('--source-url', default=''); ap.add_argument('--shared-by', default='Aleja Guerra (via Justin Massion, Slack #all-aluzina)')
    ap.add_argument('--shared-at', default='2026-09-21'); ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--force', action='store_true')
    ap.add_argument('--cache', default=None, help='md5 cache json (default: next to --src)')
    ap.add_argument('--max-pages', type=int, default=6); ap.add_argument('--page-px', type=int, default=1200); ap.add_argument('--page-q', type=int, default=72); ap.add_argument('--sheet-q', type=int, default=72)
    a = ap.parse_args()
    globals().update(MAX_PAGES=a.max_pages, PAGE_PX=a.page_px, PAGE_Q=a.page_q, SHEET_Q=a.sheet_q)
    MAX_PAGES, PAGE_PX, PAGE_Q, SHEET_Q = a.max_pages, a.page_px, a.page_q, a.sheet_q
    render_settings = {'thumbPx': THUMB_PX, 'thumbQ': THUMB_Q, 'pagePx': PAGE_PX, 'pageQ': PAGE_Q, 'maxPages': MAX_PAGES, 'maxPagesBigAi': MAX_PAGES_BIG_AI, 'sheetCols': SHEET_COLS, 'sheetCell': SHEET_CELL, 'sheetMax': SHEET_MAX, 'sheetQ': SHEET_Q, 'photoCap': PHOTO_CAP, 'featured': FEATURED}
    slug, src = a.slug, os.path.abspath(a.src)
    table = RULES[a.rules or slug]
    repo = os.path.abspath(a.repo)
    served_dir = os.path.join(repo, 'apps', 'hub', 'public', 'archive', slug)
    docs_dir = os.path.join(repo, 'docs', 'archive', 'collections', slug)
    workdir = os.path.join(os.path.dirname(src), f'.work-{slug}'); os.makedirs(workdir, exist_ok=True)
    cache_path = a.cache or os.path.join(os.path.dirname(src), f'{slug}.md5.json')
    cache = json.load(open(cache_path)) if os.path.exists(cache_path) else {}

    # ---- known project ids (never invent one) ----
    known = set()
    try:
        for p in json.load(open(os.path.join(repo, 'docs/archive/index.json')))['projects']: known.add('prj-ar-' + p['id'])
        for p in json.load(open(os.path.join(repo, 'docs/brand/portfolio/index.json'))).get('projects', []): known.add('prj-pf-' + p['slug'])
    except Exception as ex: print('warning: could not read project ids:', ex)

    # ---- walk ----
    rules = sorted(table['rules'], key=lambda r: (-len(r['prefix']), 0 if r.get('per_child') else 1))
    entries = []
    for root, dirs, files in os.walk(src):
        dirs.sort(); files.sort()
        for fn in files:
            local = os.path.join(root, fn); raw_rel = os.path.relpath(local, src).replace(os.sep, '/')
            entries.append((raw_rel, local))
    empty_dirs = [os.path.relpath(r, src).replace(os.sep, '/') for r, d, f in os.walk(src) if not d and not f and r != src]

    def rule_for(dec_path):
        folder = dec_path.rsplit('/', 1)[0] if '/' in dec_path else ''
        for r in rules:
            pre = r['prefix']
            if r.get('per_child'):
                if folder.startswith(pre + '/'):
                    child = folder[len(pre) + 1:].split('/')[0]
                    return dict(r, set=r['set_prefix'] + slugify(strip_prefix(child)), folder=pre + '/' + child, child=child, title=r['title_prefix'] + child, titleEs=r['titleEs_prefix'] + child)
            elif folder == pre or (pre and folder.startswith(pre + '/')) or (pre == '' and '/' not in dec_path and folder == ''):
                if pre == '' and folder != '': continue
                return dict(r, folder=pre)
        return None

    sets = {}; files = []; guesses = []
    seen_ids = set(); folder_rows = defaultdict(lambda: {'n': 0, 'bytes': 0})
    testimonial_n = 0
    t0 = time.time(); hashed = 0
    for raw_rel, local in entries:
        dec = decode_name(raw_rel); name = dec.rsplit('/', 1)[-1]; ext = ext_of(name)
        size = os.path.getsize(local)
        r = rule_for(dec)
        if r is None:
            guesses.append(f'no rule for {dec}; filed under root as internal'); r = {'set': 'root', 'kind': table['default_kind'], 'mode': 'internal', 'folder': '', 'title': 'Loose files', 'titleEs': 'Archivos sueltos'}
        sid = r['set']
        if sid not in sets:
            sets[sid] = {'id': sid, 'folder': r.get('folder', ''), 'title': r.get('title', sid), 'titleEs': r.get('titleEs', sid), 'kind': r.get('kind'), 'visibility': 'internal', 'fileCount': 0, 'bytes': 0, 'redactedCount': 0, 'cover': None, 'contactSheet': None, 'projectIds': [], 'year': r.get('year', table.get('year')) or YEAR_HINTS.get(sid), 'note': '', 'noteEs': '', '_rule': r, '_files': [], '_tokens': set()}
        s = sets[sid]; s['fileCount'] += 1; s['bytes'] += size
        s['_tokens'].add(norm(dec))
        if r['mode'] == 'folder':
            folder_rows[sid]['n'] += 1; folder_rows[sid]['bytes'] += size
            for pn in PERSON_NAMES:  # R7 evidence: person names inside redacted folders stay out of the index entirely
                pass
            continue
        # md5 (cached by raw path + size + mtime)
        key = f'{raw_rel}|{size}|{int(os.path.getmtime(local))}'
        if key not in cache: cache[key] = md5_of(local); hashed += 1
        md5 = cache[key]
        f = {'path': dec, 'name': name, 'setId': sid, 'ext': ext, 'mimeType': mimetypes.guess_type(name)[0] or ('application/postscript' if ext == 'ai' else 'application/octet-stream'), 'bytes': size, 'width': None, 'height': None, 'pageCount': None, 'md5': md5, 'thumb': None, 'pages': [], 'textExcerpt': '', 'palette': [], 'redacted': False, 'visibility': 'internal', 'owner': 'aluzina', 'tags': [], 'duplicateOf': None, 'note': '', '_local': local, '_render': False, '_excerpt': False, '_png_alpha': bool(r.get('png_alpha'))}
        mode = r['mode']; n = norm(name)
        # ---- broken / non-asset files ----
        if ext in BROKEN_EXTS or name.endswith(' alias') or name.endswith(' alias 2') or (size < 200 and ext in IMAGE_EXTS):
            f['tags'] = ['roto']; f['visibility'] = 'internal'
            f['note'] = {'icloud': 'iCloud placeholder: the file was never downloaded to this copy.', 'bak': 'AutoCAD backup file.', 'dwl2': 'AutoCAD lock file.', 'dwl': 'AutoCAD lock file.'}.get(ext, 'macOS alias / truncated file (a few bytes).' if size < 1100 else 'Non-asset file.')
            if ext == 'icloud': f['name'] = name  # keeps the stub's own name (".X.ext.icloud")
            files.append(f); continue
        if ext in FONT_EXTS:
            f['tags'] = ['fuente']; f['visibility'] = 'internal'; f['owner'] = 'third-party'; f['note'] = 'Font file (DIN Round Pro); licence unknown, not shipped.'; files.append(f); continue
        if name in SENSITIVE_FILES:
            f['visibility'] = 'internal'; f['tags'] = ['sensible']; f['note'] = SENSITIVE_FILES[name]; files.append(f); continue
        if name in THIRD_PARTY_FILES:
            f['owner'] = 'third-party'; f['visibility'] = 'internal'; f['tags'] = ['terceros']; f['note'] = THIRD_PARTY_FILES[name]; files.append(f); continue
        if any(sd in dec for sd in SENSITIVE_DIRS):
            if name in RENAME_FILES: f['name'] = RENAME_FILES[name]; f['path'] = repath(dec, RENAME_FILES[name]); f['tags'] = ['retrato', 'testimonio']
            else: f['tags'] = ['testimonio']
            f['visibility'] = 'internal'
            f['note'] = 'Client testimonial (portrait or quote naming the client): internal, not rendered or excerpted; a person\'s file name is replaced by the role (R3/R4).'; files.append(f); continue
        # ---- explicit redactions of the rules table ----
        real = r.get('real_docs', {})
        if name in real:
            f['redacted'] = True; f['name'] = f'{real[name]} (redactado).{ext}'; f['path'] = repath(dec, f['name']); f['tags'] = ['confidencial']; f['note'] = 'Real document, not a template (D-059).'; files.append(f); continue
        if r.get('redact_re') and re.search(r['redact_re'], n):
            f['redacted'] = True; f['name'] = f"{r['redact_type']} (redactado).{ext}"; f['path'] = repath(dec, f['name']); f['tags'] = ['confidencial']; f['note'] = 'Corporate / employment document (D-059).'; files.append(f); continue
        if r.get('redact_exts') and ext in r['redact_exts']:
            f['redacted'] = True; f['name'] = f"{r['redact_exts'][ext]} (redactado).{ext}"; f['path'] = repath(dec, f['name']); f['tags'] = ['confidencial']; f['note'] = 'Costing / quotation spreadsheet (D-059).'; files.append(f); continue
        # ---- R1 by name (templates keep their names) ----
        if mode != 'templates' and NAME_RE.search(n):
            t = type_of(name)
            f['redacted'] = True; f['name'] = f'{t} (redactado).{ext}'; f['path'] = repath(dec, f['name']); f['tags'] = ['confidencial']; f['note'] = 'File name matches the D-059 pattern (R1).'; files.append(f); continue
        if mode == 'render' and PRICE_NAME_RE.search(n) and ext not in IMAGE_EXTS:
            f['visibility'] = 'internal'; f['tags'] = ['precios']; f['note'] = 'Name says quotation / price: internal, never rendered or excerpted (D-068).'
            if re.search(r'cobros?', n): f['redacted'] = True; f['name'] = f'Documento financiero (redactado).{ext}'; f['path'] = repath(dec, f['name']); f['tags'] = ['confidencial']
            files.append(f); continue
        # ---- kind-specific handling ----
        if ext in RAW_EXTS:
            f['visibility'] = 'public' if mode == 'render' else 'internal'; f['tags'] = ['raw']; f['note'] = 'RAW original' + (' (XMP sidecar)' if ext == 'xmp' else '') + '; indexed only.'; files.append(f); continue
        if ext in SOURCE_EXTS or ext in ('xlsx', 'xls', 'doc', 'dotx'):
            f['visibility'] = 'public' if mode in ('render', 'index') and ext in SOURCE_EXTS else 'internal'
            f['tags'] = ['fuente-editable'] if ext in SOURCE_EXTS else ['documento']
            f['note'] = {'psd': 'Photoshop source; indexed only (no renderer).', 'dwg': 'AutoCAD drawing; indexed only (no renderer).', 'iff': 'IFF image; indexed only (no renderer).', 'dotx': 'Word template; indexed only.', 'xlsx': 'Spreadsheet; indexed only, no excerpt.', 'doc': 'Legacy Word file; indexed only.'}.get(ext, 'Indexed only.')
            files.append(f); continue
        if ext in TEXT_ONLY_EXTS:
            f['visibility'] = 'public' if mode == 'render' else 'internal'; f['_excerpt'] = not r.get('no_excerpt'); f['tags'] = ['texto']; f['note'] = 'Text document; excerpt only, no render.'; files.append(f); continue
        if mode in ('render',):
            if ext in IMAGE_EXTS or ext in DOC_EXTS or ext in VIDEO_EXTS or ext in OFFICE_RENDER_EXTS:
                f['visibility'] = 'public'; f['_render'] = True; f['_excerpt'] = ext in DOC_EXTS or ext in OFFICE_RENDER_EXTS
            else:
                f['visibility'] = 'public'; f['note'] = f'No renderer for .{ext}; indexed only.'
        elif mode == 'index':
            f['visibility'] = 'public'; f['note'] = 'Indexed only (source format).'
        else:  # internal / templates
            f['visibility'] = 'internal'; f['_excerpt'] = (ext in DOC_EXTS or ext in TEXT_ONLY_EXTS) and not r.get('no_excerpt')
            if mode == 'templates':
                f['tags'] = ['plantilla']
                if NAME_RE.search(n): f['_excerpt'] = False
        files.append(f)
    json.dump(cache, open(cache_path, 'w'))
    print(f'walked {len(entries)} files, hashed {hashed} new, {time.time() - t0:.0f}s')

    # ---- folder-level redacted rows (R2) ----
    for sid, agg in folder_rows.items():
        s = sets[sid]; r = s['_rule']
        files.append({'path': r['prefix'], 'name': f"{r['label']} ({agg['n']} archivos, redactado)", 'setId': sid, 'ext': '', 'mimeType': 'inode/directory', 'bytes': agg['bytes'], 'width': None, 'height': None, 'pageCount': None, 'md5': None, 'thumb': None, 'pages': [], 'textExcerpt': '', 'palette': [], 'redacted': True, 'visibility': 'internal', 'owner': 'aluzina', 'tags': ['confidencial', 'carpeta'], 'duplicateOf': None, 'note': f"Whole folder redacted (D-059 R2): {agg['n']} files, {human(agg['bytes'])}; no per-file rows.", '_local': None, '_render': False, '_excerpt': False, '_png_alpha': False})
        s['note'] = f"Whole folder redacted: {agg['n']} files, {human(agg['bytes'])}; personal, contractual or financial documents (D-059)."; s['noteEs'] = f"Carpeta redactada completa: {agg['n']} archivos, {human(agg['bytes'])}; documentos personales, contractuales o financieros (D-059)."
    # ---- empty folders that the rules name (SERVICIOS ALUZINA, BANCO DE IMAGEN) ----
    for r in table['rules']:
        if r.get('empty_ok') and r['set'] not in sets:
            sets[r['set']] = {'id': r['set'], 'folder': r['prefix'], 'title': r['title'], 'titleEs': r['titleEs'], 'kind': r['kind'], 'visibility': 'internal', 'fileCount': 0, 'bytes': 0, 'redactedCount': 0, 'cover': None, 'contactSheet': None, 'projectIds': [], 'year': None, 'note': 'Empty folder in the shared copy.', 'noteEs': 'Carpeta vacía en la copia compartida.', '_rule': r, '_files': [], '_tokens': set()}
    for d in empty_dirs:
        dd = decode_name(d)
        for r in table['rules']:
            if r.get('per_child') and dd.startswith(r['prefix'] + '/') and '/' not in dd[len(r['prefix']) + 1:]:
                child = dd[len(r['prefix']) + 1:]; sid = r['set_prefix'] + slugify(strip_prefix(child))
                if sid not in sets:
                    sets[sid] = {'id': sid, 'folder': dd, 'title': r['title_prefix'] + child, 'titleEs': r['titleEs_prefix'] + child, 'kind': r['kind'], 'visibility': 'internal', 'fileCount': 0, 'bytes': 0, 'redactedCount': 0, 'cover': None, 'contactSheet': None, 'projectIds': [], 'year': YEAR_HINTS.get(sid), 'note': 'Empty folder in the shared copy.', 'noteEs': 'Carpeta vacía en la copia compartida.', '_rule': r, '_files': [], '_tokens': set()}

    # ---- dedupe by md5: the original is the first public renderable copy (path order), duplicates share its renders ----
    by_md5 = defaultdict(list)
    for f in files:
        if f['md5'] and f['bytes'] > 0: by_md5[f['md5']].append(f)
    for m, group in by_md5.items():
        if len(group) < 2: continue
        group.sort(key=lambda f: (0 if f['_render'] else 1, f['path']))
        orig = group[0]
        for d in group[1:]:
            d['duplicateOf'] = orig['path']; d['_dup_of'] = orig; d['_render'] = False; d['_excerpt'] = False
            d['note'] = (d['note'] + ' ' if d['note'] else '') + 'Byte-identical duplicate; renders are the original\'s.'

    # ---- render plan: per set, cap photo sets ----
    for f in files: sets[f['setId']]['_files'].append(f)
    used_slugs = set()
    def served_slug(f):
        base = slugify(re.sub(r'\.[A-Za-z0-9]{1,6}$', '', f['name'])) or 'file'
        s = base; i = 2
        while s in used_slugs: s = f'{base}-{i}'; i += 1
        used_slugs.add(s); return s
    def sample_even(items, k):
        if k <= 0: return []
        if len(items) <= k: return list(items)
        step = len(items) / k
        return [items[int(i * step)] for i in range(k)]
    plan = {}  # set id -> {'thumbs': [files], 'sheet': [files]}
    for sid, s in sets.items():
        renderable = [f for f in s['_files'] if f['_render']]
        # order: documents first, then images grouped by subfolder for even sampling
        renderable.sort(key=lambda f: (0 if f['ext'] in DOC_EXTS | OFFICE_RENDER_EXTS else 1, f['path']))
        if len(renderable) > PHOTO_CAP:
            docs = [f for f in renderable if f['ext'] in DOC_EXTS | OFFICE_RENDER_EXTS]
            imgs = [f for f in renderable if f not in docs]
            feat = docs[:FEATURED] + sample_even(imgs, max(0, FEATURED - min(len(docs), FEATURED)))
            plan[sid] = {'thumbs': feat, 'sheet': sample_even(renderable, SHEET_MAX)}
            for f in renderable:
                if f not in feat: f['_render'] = False; f['_sheet_only'] = True; f['note'] = (f['note'] + ' ' if f['note'] else '') + 'Shown on the set\'s contact sheet only (photo cap).'
        else:
            plan[sid] = {'thumbs': renderable, 'sheet': []}

    # ---- render ----
    thumbs_dir, pages_dir, sheets_dir = (os.path.join(served_dir, d) for d in ('thumbs', 'pages', 'sheets'))
    if not a.dry_run:
        for d in (thumbs_dir, pages_dir, sheets_dir): os.makedirs(d, exist_ok=True)
    served = {}  # rel path -> bytes
    from PIL import Image
    def want(rel):  # idempotence: reuse an existing render unless --force
        p = os.path.join(served_dir, rel)
        return (not a.force) and os.path.exists(p)
    price_flags = []
    for sid, s in sets.items():
        pc = bool(s['_rule'].get('price_check'))
        for f in s['_files']:
            if f.get('_dup_of') is not None: continue
            if not (f['_render'] or f['_excerpt']): continue
            local = f['_local']; ext = f['ext']
            if a.dry_run and f['_render']:
                f['thumb'] = f'thumbs/{served_slug(f)}.jpg'; continue
            if ext in TEXT_ONLY_EXTS:
                txt = docx_text(local) if ext == 'docx' else open(local, errors='ignore').read(4000)
                exc, why = clean_excerpt(txt[:600])
                if why: f['note'] = (f['note'] + ' ' if f['note'] else '') + f'Excerpt withheld ({why}).'
                f['textExcerpt'] = exc; continue
            R = Renderer(local, ext, workdir)
            if R.error:
                f['note'] = (f['note'] + ' ' if f['note'] else '') + (f'{R.error}; indexed only.' if ext in VIDEO_EXTS else f'Render failed: {R.error}.'); R.close(); continue
            if f['_excerpt'] and R.doc is not None:
                f['pageCount'] = R.page_count
                full = R.text()
                exc, why = clean_excerpt(full[:600])
                if pc and f['visibility'] == 'public' and f['name'] not in PUBLIC_OVERRIDE and (CURRENCY_RE.search(full) or FIN_STRICT_RE.search(full)):
                    f['visibility'] = 'internal'; f['_render'] = False; f['textExcerpt'] = ''; f['tags'] = sorted(set(f['tags'] + ['precios']))
                    f['note'] = (f['note'] + ' ' if f['note'] else '') + 'Text carries prices or quotation wording: internal, not rendered (R3, D-068).'
                    price_flags.append(f['path']); R.close(); continue
                if why: f['note'] = (f['note'] + ' ' if f['note'] else '') + f'Excerpt withheld ({why}).'
                if f['visibility'] == 'internal' and PERSONAL_RE.search(full): exc = ''
                f['textExcerpt'] = exc
            if not f['_render']: R.close(); continue
            try:
                img = R.preview(PAGE_PX)
                if img is None: raise RuntimeError('no preview')
                if R._img is not None: f['width'], f['height'] = img.size
                sl = served_slug(f)
                if f['_png_alpha'] and R.has_alpha():
                    rel = f'thumbs/{sl}.png'
                    if not want(rel): save_png_alpha(img, os.path.join(served_dir, rel), THUMB_PX)
                else:
                    rel = f'thumbs/{sl}.jpg'
                    if not want(rel): save_jpg(img, os.path.join(served_dir, rel), THUMB_PX, THUMB_Q)
                f['thumb'] = rel; served[rel] = os.path.getsize(os.path.join(served_dir, rel))
                f['palette'] = palette_of(img)
                if R.doc is not None and (R.page_count or 0) > 1:
                    n = min(R.page_count, MAX_PAGES_BIG_AI if (ext == 'ai' and f['bytes'] > BIG_AI) else MAX_PAGES)
                    for i in range(n):
                        rel = f'pages/{sl}-p{i + 1:02d}.jpg'
                        if not want(rel): save_jpg(R.page(i, PAGE_PX), os.path.join(served_dir, rel), PAGE_PX, PAGE_Q)
                        f['pages'].append(rel); served[rel] = os.path.getsize(os.path.join(served_dir, rel))
                f['_preview'] = img.copy(); f['_preview'].thumbnail((SHEET_CELL, SHEET_CELL))
            except Exception as ex:
                f['note'] = (f['note'] + ' ' if f['note'] else '') + f'Render failed: {type(ex).__name__}: {str(ex)[:80]}.'
            R.close()
        # contact sheet
        if plan[sid]['sheet'] and not a.dry_run:
            cells = []
            for f in plan[sid]['sheet']:
                img = f.get('_preview')
                if img is None:
                    R = Renderer(f['_local'], f['ext'], workdir)
                    try:
                        pv = R.preview(SHEET_CELL * 2)
                        if pv is not None:
                            img = pv.copy(); img.thumbnail((SHEET_CELL * 2, SHEET_CELL * 2))
                            if R._img is not None: f['width'], f['height'] = pv.size
                    except Exception: img = None
                    R.close()
                if img is not None: cells.append(img.convert('RGB'))
            if cells:
                rows = (len(cells) + SHEET_COLS - 1) // SHEET_COLS
                sheet = Image.new('RGB', (SHEET_COLS * SHEET_CELL, rows * SHEET_CELL), (245, 245, 245))
                for i, im in enumerate(cells):
                    w, h = im.size; side = min(w, h)
                    im = im.crop(((w - side) // 2, (h - side) // 2, (w - side) // 2 + side, (h - side) // 2 + side)).resize((SHEET_CELL, SHEET_CELL), Image.LANCZOS)
                    sheet.paste(im, ((i % SHEET_COLS) * SHEET_CELL, (i // SHEET_COLS) * SHEET_CELL))
                rel = f'sheets/{sid}.jpg'
                if not want(rel): sheet.save(os.path.join(served_dir, rel), 'JPEG', quality=SHEET_Q, optimize=True, progressive=True)
                s['contactSheet'] = rel; served[rel] = os.path.getsize(os.path.join(served_dir, rel))
    # duplicates inherit the original's renders and excerpt
    for f in files:
        o = f.get('_dup_of')
        if o is not None:
            f['thumb'], f['pages'], f['palette'], f['pageCount'] = o['thumb'], list(o['pages']), list(o['palette']), o['pageCount']
            f['width'], f['height'] = o['width'], o['height']
            if f['visibility'] == 'public' and o['visibility'] == 'internal': f['visibility'] = 'internal'
    # dimensions for public images that were not rendered (cheap header read)
    for f in files:
        if f['width'] is None and f['ext'] in IMAGE_EXTS and f['bytes'] > 1100 and f['_local'] and not f['redacted']:
            f['width'], f['height'] = image_dims(f['_local'], f['ext'])

    # ---- set aggregation ----
    for sid, s in sets.items():
        fs = s['_files']
        s['redactedCount'] = sum(1 for f in fs if f['redacted'])
        pub = [f for f in fs if f['visibility'] == 'public']
        s['visibility'] = 'public' if pub else 'internal'
        s['thumbs'] = sum(1 for f in fs if f['thumb'] and f['duplicateOf'] is None)
        covers = [f for f in fs if f['thumb'] and f['visibility'] == 'public']
        covers.sort(key=lambda f: (0 if f['ext'] in DOC_EXTS else 1, 0 if (f['width'] or 0) >= (f['height'] or 0) else 1, f['path']))
        s['cover'] = covers[0]['thumb'] if covers else None
        # project links from folder / file name tokens (public sets only)
        ids = []; unlinked = set()
        if s['visibility'] == 'public':
            toks = ' | '.join(sorted(s['_tokens']))
            for rx, pids in LINKS:
                if rx.search(toks):
                    for p in pids:
                        if p in known and p not in ids: ids.append(p)
                        elif p not in known: guesses.append(f'{sid}: token for {p} but no such project row; skipped')
            for m in UNLINKED_TOKENS.finditer(toks): unlinked.add(m.group(0).lower())
        s['projectIds'] = ids
        if not s['note']:
            if ids: s['note'] = f"Project link inferred from folder / file names (D-060); {len(ids)} project row(s) matched."; s['noteEs'] = f"Vínculo a proyecto inferido de nombres de carpeta / archivo (D-060); {len(ids)} fila(s) de proyecto."
            elif s['kind'] in ('project-photos', 'website', 'photo-shoot'): s['note'] = 'Project attribution unknown (no matching project row).' + (f" Names without a row: {', '.join(sorted(unlinked))}." if unlinked else ''); s['noteEs'] = 'Atribución desconocida (sin fila de proyecto que coincida).' + (f" Nombres sin fila: {', '.join(sorted(unlinked))}." if unlinked else '')
            else: s['note'] = ''; s['noteEs'] = ''
        if unlinked and ids: s['note'] += f" Names without a row: {', '.join(sorted(unlinked))}."; s['noteEs'] += f" Nombres sin fila: {', '.join(sorted(unlinked))}."
        if s['fileCount'] == 0 and not s['note']: s['note'] = 'Empty folder in the shared copy.'; s['noteEs'] = 'Carpeta vacía en la copia compartida.'
        if s['_rule']['mode'] == 'render' and len([f for f in fs if f.get('_sheet_only') or f['thumb']]) > PHOTO_CAP:
            s['note'] += f" Photo cap: {len(plan[sid]['thumbs'])} thumbnails plus a {min(SHEET_MAX, len(plan[sid]['sheet']))}-cell contact sheet; the other files are index-only."; s['noteEs'] += f" Tope de fotos: {len(plan[sid]['thumbs'])} miniaturas más una hoja de contactos de {min(SHEET_MAX, len(plan[sid]['sheet']))} celdas; el resto solo indexado."
        s['note'] = s['note'].strip(); s['noteEs'] = s['noteEs'].strip()

    # ---- served bytes / prune ----
    if not a.dry_run:
        for d in (thumbs_dir, pages_dir, sheets_dir):
            for fn in os.listdir(d):
                rel = os.path.relpath(os.path.join(d, fn), served_dir).replace(os.sep, '/')
                if rel not in served: os.remove(os.path.join(d, fn))
    per_set_bytes = defaultdict(int)
    for sid, s in sets.items():
        for f in s['_files']:
            if f['duplicateOf'] is None:
                for rel in ([f['thumb']] if f['thumb'] else []) + f['pages']: per_set_bytes[sid] += served.get(rel, 0)
        if s['contactSheet']: per_set_bytes[sid] += served.get(s['contactSheet'], 0)
    total_served = sum(served.values())

    # ---- R7 self-check ----
    problems = []
    all_names = [(f['path'], f['name'], f['note'], f['textExcerpt']) for f in files] + [(s['folder'], s['title'], s['note'], s['titleEs']) for s in sets.values()]
    for path, name, note, exc in all_names:
        hay = strip_accents(' '.join([path, name, note, exc])).upper()
        for pn in PERSON_NAMES:
            if pn in hay and not any(pub in hay for pub in PUBLIC_NAMES if pn in pub): problems.append(f'person name "{pn}" in: {path}')
        for label, txt in (('note', note), ('excerpt', exc)):
            if CURRENCY_RE.search(txt): problems.append(f'currency in {label}: {path}')
            if PERSONAL_RE.search(txt): problems.append(f'personal-id pattern in {label}: {path}')
            if EMAIL_RE.search(txt): problems.append(f'email in {label}: {path}')
            if phone_hits(txt): problems.append(f'phone in {label}: {path}')
    kept_pattern_names = []
    for f in files:
        if NAME_RE.search(norm(f['name'])) and '(redactado)' not in f['name']:
            if f['visibility'] == 'public' or f['thumb'] or f['pages'] or f['textExcerpt']: problems.append(f'unredacted pattern name on a public / rendered row: {f["path"]}')
            else: kept_pattern_names.append(f['path'])
        for rel in ([f['thumb']] if f['thumb'] else []) + f['pages']:
            if not a.dry_run and not os.path.exists(os.path.join(served_dir, rel)): problems.append(f'missing served file {rel}')
        if f['redacted'] and (f['thumb'] or f['pages'] or f['textExcerpt']): problems.append(f'redacted row with render / excerpt: {f["path"]}')
        if f['owner'] == 'third-party' and (f['thumb'] or f['pages'] or f['textExcerpt']): problems.append(f'third-party row with render / excerpt: {f["path"]}')
    privacy = {'ok': not problems, 'checkedFiles': len(files), 'checkedSets': len(sets), 'personNames': len(PERSON_NAMES), 'templateNamesKept': len(kept_pattern_names), 'problems': problems[:50]}

    # ---- tables ----
    print(f'\n{slug}: {len(files)} rows, {len(sets)} sets, served {human(total_served)} ({total_served} B); render settings {render_settings}')
    print(f"{'set':44} {'kind':15} {'vis':8} {'files':>5} {'red':>4} {'thumbs':>6} {'pages':>5} {'sheet':>5} {'served':>10}")
    for sid in sorted(sets):
        s = sets[sid]; fs = s['_files']
        pages = sum(len(f['pages']) for f in fs if f['duplicateOf'] is None)
        print(f"{sid:44} {s['kind']:15} {s['visibility']:8} {s['fileCount']:5} {s['redactedCount']:4} {s['thumbs']:6} {pages:5} {'yes' if s['contactSheet'] else '-':>5} {human(per_set_bytes[sid]):>10}")
    print('price flags (text -> internal):', price_flags)
    print('template names kept (pattern hit, internal, no render):', len(kept_pattern_names))
    print('guesses:', *guesses, sep='\n  ')
    print('privacy self-check:', 'PASSED' if privacy['ok'] else 'FAILED', json.dumps(privacy['problems'][:20], ensure_ascii=False))
    if a.dry_run: return 0
    if not privacy['ok']: print('R7 failed: nothing written'); return 1

    # ---- write ----
    order = {sid: i for i, sid in enumerate(sets)}
    set_rows = []
    for sid in sorted(sets, key=lambda x: order[x]):
        s = sets[sid]
        set_rows.append({k: s[k] for k in ('id', 'folder', 'title', 'titleEs', 'kind', 'visibility', 'fileCount', 'bytes', 'redactedCount', 'cover', 'contactSheet', 'projectIds', 'year', 'note', 'noteEs')})
    file_rows = []
    keys = ('path', 'name', 'setId', 'ext', 'mimeType', 'bytes', 'width', 'height', 'pageCount', 'md5', 'thumb', 'pages', 'textExcerpt', 'palette', 'redacted', 'visibility', 'owner', 'tags', 'duplicateOf', 'note')
    for f in sorted(files, key=lambda f: (order[f['setId']], f['path'])):
        file_rows.append({k: f[k] for k in keys})
    totals = {'files': sum(s['fileCount'] for s in sets.values()), 'bytes': sum(s['bytes'] for s in sets.values()), 'redacted': sum(1 for f in files if f['redacted']),
              'served': {'thumbs': sum(1 for k in served if k.startswith('thumbs/')), 'pages': sum(1 for k in served if k.startswith('pages/')), 'sheets': sum(1 for k in served if k.startswith('sheets/')), 'bytes': total_served}}
    header = {'collection': slug, 'title': a.title, 'titleEs': a.title_es, 'caption': a.caption, 'sourceUrl': a.source_url, 'sharedBy': a.shared_by, 'sharedAt': a.shared_at, 'indexedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'totals': totals}
    os.makedirs(docs_dir, exist_ok=True)
    json.dump({**header, 'renderSettings': render_settings, 'privacyCheck': privacy, 'sets': set_rows, 'files': file_rows}, open(os.path.join(docs_dir, 'index.json'), 'w'), indent=1, ensure_ascii=False)
    json.dump({**header, 'sets': set_rows}, open(os.path.join(docs_dir, 'sets.json'), 'w'), indent=1, ensure_ascii=False)
    print(f'wrote {docs_dir}/index.json ({os.path.getsize(os.path.join(docs_dir, "index.json"))} B) and sets.json; served {human(total_served)} in {served_dir}')
    return 0

if __name__ == '__main__':
    sys.exit(main())
