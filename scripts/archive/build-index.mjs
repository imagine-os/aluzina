#!/usr/bin/env node
// Build the project-archive index files from crawler output, applying the privacy redaction (prompt 0017, changelog 0019,
// D-055 data model, D-058 intake, D-059 privacy). Node >= 18, no dependencies. Intake step 2 (crawl -> **index** -> renders -> build).
//
// Usage
//   node scripts/archive/build-index.mjs --inventory=<projects.json> [--raw=<projects_raw.json>[,<more_raw.json>]]
//        [--entries=<B.entries.json>,<C.entries.json>] [--deep=<slug>=<index.json>] [--deep-entries=<slug>=<entries.json>]
//        [--out=docs/archive] [--max-pages=8]
//   --inventory   depth-1 inventory: one entry per project folder with its direct children (crawl-dropbox.mjs --targets, then
//                 the report step of the pass-0019 inventory crawl). Children may lack `href`; --raw files restore them and
//                 add folders crawled later (a raw record with `listed: true` replaces an unlisted inventory entry).
//   --entries     root listings (depth 1) of the shared folders, for the roots table and the top-level folders that are not
//                 inside a year folder (LIFE VIOLETA VILLA, SANTIAGO AGUIRRE ILUMINACION).
//   --deep        a featured project's full-depth index (render-previews.py output); written redacted to
//                 docs/archive/projects/<slug>/index.json and added to the inventory as one entry.
//   --deep-entries the crawl entries.json of the same folder, only to give its top-level folders their own share links.
// Output: <out>/index.json (shape `Inventory` in apps/hub/src/data/seed/archive.ts), <out>/projects/<slug>/index.json (shape
// `DeepIndex`), <out>/README.md. Counts and every distinct folder segment that was rewritten are printed for review.
//
// Classification (inferred, marked as such for the founder, D-060)
//   kind   'admin' when the folder name matches /cuentas? de cobro|facturas?|contables/i; 'quote' when it starts (after the
//          studio's number prefix) with /cotizaci/i; otherwise 'project'. Quote folders become prospect rows in the seed.
//   year   the year folder when it is one year ("2026" -> 2026); null for "2019-2023" and for root-level folders, except the
//          inference noted in `note` (LIFE VIOLETA VILLA: 2019, the year of its oldest file, `yearInferred: true`).
//   note   duplicates across year folders (table DUPLICATE_GROUPS), empty folders, container folders, unlisted folders.
//
// Redaction rules (D-059). The hub is a public GitHub Pages site, so the committed data must not identify a personal or
// financial document. Applied to every inventory child and every deep-index file; matching is on the accent-stripped,
// lower-cased name with `_` read as a space.
// | # | Rule | Effect |
// |---|------|--------|
// | R1 | file name matches NAME_RE (rut, seguridad social, seg soc, planilla, autoliquidacion, arus, cedula, tarjeta profesional, contrato / contract / agreement, comprobante, cuenta de cobro, factura, fv-, fra, cxc, pedido, cotizaci, quotation, invoice, whatsapp image, pago, payment, cash, asana, .xml, "c.m ") | name -> "<Tipo> (redactado).<ext>", `redacted: true`, no thumb / pages / excerpt / palette; ext, size, modified, href kept |
// | R2 | any folder segment of the file's path matches FOLDER_RE (administrativo y financiero, suppliers and financial status, cierre de proyecto, contables, cuentas de cobro, facturas) | same as R1; Tipo from the name when R1 also matches, else "Documento financiero" ("Documento de cierre" under cierre de proyecto). Exception: a file named "logo" keeps its name |
// | R3 | text excerpt carries personal data (fecha de nacimiento, cédula / C.C., NIT), the name says "feng shui" (the report is the owner's birth chart), or the file is on the explicit SENSITIVE_CONTENT list (delivery form naming the client and apartment with an internal process review; contractor-dispute letters) | name kept, `redacted: true`, no thumb / pages / excerpt / palette (`redactedReason`) |
// | R4 | folder segments that are person names (table SEGMENT_MAP, explicit, no guessing): suppliers and financial status/04_ALUZINA/<NN NAME ROLE> -> "NN EQUIPO <ROLE>"; 10_MERY & SONS/<NN NAME> -> "NN CONTRATISTA"; 01_AJOTA ANDREA JIMENEZ ARTISTA -> 01_ARTISTA; 02_ALEX DAVID BEDOYA ELECTRICO -> 02_ELECTRICISTA; 06_DOMOTICA YAKO DAVID -> 06_DOMOTICA; unknown segments under 04_ALUZINA -> "NN EQUIPO" | path rewritten; `folderPath` in the app shows the rewritten segments |
// | R5 | company folder names (ALFA, DECORCERAMICA, INDURAL, J.F.S.R INGENIEROS CONSTRUCTORES, MERY & SONS, MOSAGRES ACABADOS, NEBULA, PISENDE, SEMCO, TECHOS Y ESTRUCTURAS HERREÑO, TECNICOCINA, AMAZON, PERFIL LED, LED LIGHT, ILUMINACION ANTIOQUIA) and project folder names (the studio's identifiers) | kept as they are; Justin can ask for any of them to be redacted |
// | R6 | share links embed the full path URL-encoded, so a redacted file's `href` / `sourceHref` (and a person-named folder's `href`) is replaced by the link of the nearest SAFE ancestor folder: the company-level supplier folder, or the project root when the parent is a person folder or the file sits under ADMINISTRATIVO Y FINANCIERO / CIERRE DE PROYECTO / CONTABLES / CUENTAS DE COBRO / FACTURAS | the link opens the folder at Dropbox, never names the document |
// | R7 | self-check before writing: no redacted entry's href (URL-decoded, beyond the project root) matches the pattern or a replaced person segment; no `name` / `path` / excerpt anywhere contains a replaced person segment or a person's full name (the founder's name is public and exempt); no file `name` matches the pattern unless it is the "(redactado)" form. Any hit exits 1 and nothing is written | `privacyCheck` in index.json records the result |
// Tipo: RUT | Seguridad social | Documento personal | Contrato | Comprobante de pago | Cuenta de cobro | Factura | Cotización | Pedido | Imagen de WhatsApp | Documento financiero | Documento de cierre.
// Short tokens (rut, arus, cash, cxc, fra, pago) match as whole words so "ruta" or "estructura" are not redacted.
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
  return m ? [m[1], m[2] ?? 'true'] : [a, 'true'];
}));
if (!args.inventory) {
  console.error('usage: build-index.mjs --inventory=<projects.json> [--raw=...] [--entries=...] [--deep=<slug>=<index.json>] [--out=docs/archive]');
  process.exit(2);
}
const OUT = args.out ?? 'docs/archive';
const MAX_PAGES = parseInt(args['max-pages'] ?? '8', 10);
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const list = (v) => (v ? String(v).split(',').filter(Boolean) : []);
const pairs = (v) => list(v).map((s) => { const i = s.indexOf('='); return [s.slice(0, i), s.slice(i + 1)]; });

// ---------------------------------------------------------------------------------------------------------------------
// Normalisation and classification
// ---------------------------------------------------------------------------------------------------------------------
const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const norm = (s) => strip(s).toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
const stripPrefix = (name) => { let rest = name.replace(/^\s*[0-9][0-9_. ]*[_\s]/, ''); if (rest === name) rest = name.replace(/^\d+_?\s*/, ''); return rest.trim(); };
const slug = (name) => strip(stripPrefix(name)).toLowerCase().replace(/&/g, ' y ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const numberPrefix = (name) => { const m = /^(\d+(?:\.\d+)?)[_\s]/.exec(name) || /^(\d+)/.exec(name); return m ? m[1] : null; };
const extOf = (name) => (name.includes('.') ? name.split('.').pop().toLowerCase() : '');

function kindOf(folderName) {
  if (/cuentas? de cobro|facturas?|contables/i.test(strip(folderName))) return 'admin';
  if (/^cotizaci/i.test(strip(stripPrefix(folderName)))) return 'quote';
  return 'project';
}
const yearOf = (yearFolder) => (/^\d{4}$/.test(yearFolder) ? parseInt(yearFolder, 10) : null);

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const NOW = new Date('2026-09-21T00:00:00Z');
/** Days before NOW for a Dropbox "modified" text ("Apr 29, 2023", "4 months ago", "Last month"); Infinity when unknown. */
function approxDays(t) {
  if (!t) return Infinity;
  t = t.trim();
  if (/^Jan 1, 1970$/.test(t)) return Infinity;
  if (/^today$/i.test(t)) return 0;
  if (/^yesterday$/i.test(t)) return 1;
  if (/^last month$/i.test(t)) return 30;
  if (/^last week$/i.test(t)) return 7;
  const rel = /^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/i.exec(t);
  if (rel) return parseInt(rel[1], 10) * { second: 1 / 86400, minute: 1 / 1440, hour: 1 / 24, day: 1, week: 7, month: 30.44, year: 365.25 }[rel[2].toLowerCase()];
  const abs = /^([A-Za-z]{3}) (\d{1,2}), (\d{4})$/.exec(t);
  if (abs) return (NOW - Date.UTC(parseInt(abs[3], 10), MONTHS[abs[1].toLowerCase()] ?? 0, parseInt(abs[2], 10))) / 86400000;
  return Infinity;
}
function yearOfModified(t) { const m = /(\d{4})$/.exec((t || '').trim()); const y = m ? parseInt(m[1], 10) : null; return y && y >= 2000 ? y : null; } // "Jan 1, 1970" is Dropbox's unknown-date placeholder

// ---------------------------------------------------------------------------------------------------------------------
// Redaction (D-059)
// ---------------------------------------------------------------------------------------------------------------------
const NAME_RE = /\brut\b|seguridad social|seg soc|planilla|autoliquidacion|\barus\b|cedula|tarjeta profesional|contrato|contract|agree?ment|comprobante|cuenta ?de ?cobro|cuentadecobro|factura|\bfv-|\bfra\b|\bcxc\b|pedido|cotizaci|quotation|invoice|whatsapp image|\bpagos?\b|payment|\bcash\b|asana|\.xml$|c\.m /;
const FOLDER_RE = /administrativo y financiero|suppliers and financial status|cierre de proyecto|contables|cuentas de cobro|facturas/;
const CONTENT_RE = /fecha (de )?nacimiento|\bcedula\b|\bc\.?c\.?\s*\d|\bnit\b/;
/** R3, explicit: files whose rendered pages were reviewed and carry personal or dispute content (name kept, previews dropped). */
const SENSITIVE_CONTENT = new Map([
  ['Design and Construction Project Delivery JOE MATHEW GALLINA.docx', 'formulario de entrega con nombre del cliente, apartamento y revisión interna del proceso'],
  ['INFORME GENERAL NEBULOSA ,ALTOS DE LA TOJA,CARPINTERIA.pdf', 'correspondencia sobre una disputa con un contratista'],
  ['Subject CARPENTRY.pdf', 'correspondencia sobre una disputa con un contratista'],
]);
const TYPE_RULES = [
  [/\brut\b/, 'RUT'],
  [/seguridad social|seg soc|planilla|autoliquidacion|\barus\b/, 'Seguridad social'],
  [/cedula|tarjeta profesional/, 'Documento personal'],
  [/contrato|contract|agree?ment/, 'Contrato'],
  [/comprobante|\bpagos?\b|payment|\bcash\b/, 'Comprobante de pago'],
  [/cuenta ?de ?cobro|cuentadecobro|\bcxc\b/, 'Cuenta de cobro'],
  [/factura|\bfv-|\bfra\b|invoice|\.xml$/, 'Factura'],
  [/cotizaci|quotation/, 'Cotización'],
  [/pedido/, 'Pedido'],
  [/whatsapp image/, 'Imagen de WhatsApp'],
  [/asana|c\.m /, 'Documento financiero'],
];
const SEGMENT_MAP = {
  'suppliers and financial status/04_ALUZINA': {
    '01 ALEJANDRA GUERRA LOTERO': '01 EQUIPO',
    '02 CARMENSA YEPES ENCARGADA OBRA': '02 EQUIPO ENCARGADA OBRA',
    '03 DANIEL YEPES DISENADORA JUNION': '03 EQUIPO DISEÑADORA JUNIOR',
    '04 DIEGO HOLLY trabajos varios': '04 EQUIPO trabajos varios',
    '05 MARTA OVIEDO CONTABILIDAD Y COMPRAS': '05 EQUIPO CONTABILIDAD Y COMPRAS',
    '06 MARYURI CONTADORA': '06 EQUIPO CONTADORA',
    '08 ALEXANDER plamtilla de excel': '08 EQUIPO plantilla de excel',
  },
  'suppliers and financial status/10_MERY & SONS': {
    '01 ALEJANDRO ESTRADA': '01 CONTRATISTA',
    '05 OSCAR URREGO': '05 CONTRATISTA',
    '06 RODRIGO CAMARGO QUIROZ': '06 CONTRATISTA',
  },
  'suppliers and financial status': {
    '01_AJOTA ANDREA JIMENEZ ARTISTA': '01_ARTISTA',
    '02_ALEX DAVID BEDOYA ELECTRICO': '02_ELECTRICISTA',
    '06_DOMOTICA YAKO DAVID': '06_DOMOTICA',
  },
};
/** Original folder path -> its share link, from the deep-entries files (dirs) and the inventory (project roots and dir children). */
const folderHrefs = new Map();
/** Segments (original spelling) that name a person, for R6 / R7; filled from SEGMENT_MAP. */
const PERSON_SEGMENTS = new Set(Object.values(SEGMENT_MAP).flatMap((t) => Object.keys(t)));
/** The founder is the studio's public face (aluzinaa.com, the brand manual): her name is not private data (R7 exemption). */
const PUBLIC_NAMES = new Set(['ALEJANDRA GUERRA LOTERO']);
const PERSON_NAMES = [...PERSON_SEGMENTS].map((seg) => seg.replace(/^\d+[_ ]+/, '').replace(/\b(ENCARGADA OBRA|DISENADORA JUNION|trabajos varios|CONTABILIDAD Y COMPRAS|CONTADORA|plamtilla de excel|ARTISTA|ELECTRICO|DOMOTICA|AJOTA)\b/g, '').trim()).filter((n) => n.split(' ').length >= 2 && !PUBLIC_NAMES.has(n));
const PRIVATE_TOP_RE = /administrativo y financiero|cierre de proyecto|contables|cuentas de cobro|facturas/;
/**
 * R6: link of the nearest ancestor folder that carries no person segment and no private folder: under
 * "suppliers and financial status" at most the company folder (depth 1, unless that segment is a person); under an
 * administrative / closing / accounting folder the project root; elsewhere the deepest ancestor without a person segment.
 */
function safeAncestorHref(folderPath, rootHref, scope = '') {
  const segs = folderPath ? folderPath.split('/') : [];
  if (!segs.length) return rootHref;
  let depth = segs.length;
  if (PRIVATE_TOP_RE.test(norm(segs[0]))) depth = 0;
  else if (/suppliers and financial status/.test(norm(segs[0]))) depth = Math.min(depth, 2);
  for (let i = 0; i < depth; i++) if (PERSON_SEGMENTS.has(segs[i]) || FOLDER_RE.test(norm(segs[i])) && i > 0) { depth = i; break; }
  for (let d = depth; d > 0; d--) {
    const href = folderHrefs.get(`${scope}::${segs.slice(0, d).join('/')}`);
    if (href) return href;
  }
  return rootHref;
}
const stats = { inventoryFiles: 0, inventoryRedacted: 0, hrefsReplaced: 0, deepFiles: 0, deepRedacted: 0, deepContentRedacted: 0, segmentsRewritten: new Map(), previewsKept: 0, pagesKept: 0 };

function typeFor(nameNorm, folderNorm) {
  for (const [re, tipo] of TYPE_RULES) if (re.test(nameNorm)) return tipo;
  if (/cierre de proyecto/.test(folderNorm)) return 'Documento de cierre';
  return 'Documento financiero';
}
/** Returns null when the file keeps its name, else the redacted display name. */
function redactedName(name, folderPath) {
  const n = norm(name);
  const f = norm(folderPath || '');
  const byName = NAME_RE.test(n);
  const byFolder = FOLDER_RE.test(f) && !/\blogo\b/.test(n);
  if (!byName && !byFolder) return null;
  const ext = extOf(name);
  return `${typeFor(n, f)} (redactado)${ext ? `.${ext}` : ''}`;
}
function rewriteSegments(folderPath) {
  const segs = folderPath ? folderPath.split('/') : [];
  const out = [];
  for (let i = 0; i < segs.length; i++) {
    const parent = segs.slice(0, i).join('/');
    const table = SEGMENT_MAP[parent];
    let seg = segs[i];
    if (table) {
      if (table[seg]) seg = table[seg];
      else if (parent === 'suppliers and financial status/04_ALUZINA') seg = `${(/^\d+/.exec(seg) || ['00'])[0]} EQUIPO`;
    }
    if (seg !== segs[i]) stats.segmentsRewritten.set(`${parent}/${segs[i]}`, `${parent}/${seg}`);
    out.push(seg);
  }
  return out.join('/');
}
/** Inventory child (shallow): name, is_dir, ext, size, modified, href (+ redacted). `folderPath` is only used for R2. */
function redactChild(c, folderPath = '', rootHref = null, scope = '') {
  const child = { name: c.name, is_dir: Boolean(c.is_dir), ext: c.ext || (c.is_dir ? '' : extOf(c.name)), size: c.size ?? null, modified: c.modified ?? null, href: c.href ?? null };
  if (child.is_dir) {
    if (PERSON_SEGMENTS.has(c.name)) { stats.hrefsReplaced++; return { ...child, name: rewriteSegments(c.name), href: rootHref, redacted: true }; }
    return child;
  }
  stats.inventoryFiles++;
  const r = redactedName(c.name, folderPath);
  if (r) { stats.inventoryRedacted++; stats.hrefsReplaced++; return { ...child, name: r, href: safeAncestorHref(folderPath, rootHref, scope), redacted: true }; }
  return child;
}

// ---------------------------------------------------------------------------------------------------------------------
// Inventory entries
// ---------------------------------------------------------------------------------------------------------------------
function summarize(children) {
  const extensions = {};
  let totalBytesKnown = 0;
  let best = { days: Infinity, text: null };
  for (const c of children) {
    if (!c.is_dir) {
      const e = c.ext || '(none)';
      extensions[e] = (extensions[e] || 0) + 1;
      if (typeof c.size === 'number') totalBytesKnown += c.size;
    }
    if (c.modified) { const d = approxDays(c.modified); if (d < best.days) best = { days: d, text: c.modified }; }
  }
  return { childCount: children.length, fileCount: children.filter((c) => !c.is_dir).length, dirCount: children.filter((c) => c.is_dir).length, extensions, totalBytesKnown, latestModified: best.text };
}
/** A raw crawl record ({ ...target, listed, reason, children[] }) to an inventory-shaped entry (children with href). */
function fromRaw(r) {
  const children = (r.children || []).map((c) => ({ name: c.name, is_dir: c.is_dir, ext: c.ext || '', size: c.size, modified: c.modified, href: c.href }));
  return { id: r.id, folderName: r.folderName, yearFolder: r.yearFolder, numberPrefix: r.numberPrefix, sourceHref: r.sourceHref, ...summarize(children), children, listed: Boolean(r.listed), reason: r.listed ? undefined : r.reason };
}

const inventory = readJson(args.inventory);
const rawRecords = list(args.raw).flatMap((p) => readJson(p));
const rawByKey = new Map(rawRecords.map((r) => [`${r.yearFolder}/${r.folderName}`, r]));
const entriesFiles = list(args.entries).map((p) => readJson(p));

// 1. Inventory entries, hrefs restored from raw; a later listed raw record replaces an unlisted entry.
const byKey = new Map();
for (const p of inventory) {
  const key = `${p.yearFolder}/${p.folderName}`;
  const raw = rawByKey.get(key);
  let entry = { ...p };
  if (raw && raw.listed && !p.listed) entry = fromRaw(raw);
  else if (raw && raw.children) {
    const hrefs = new Map(raw.children.map((c) => [c.name, c.href]));
    entry.children = p.children.map((c) => ({ ...c, href: c.href ?? hrefs.get(c.name) ?? null }));
  }
  byKey.set(key, entry);
}
// 2. Raw records for folders the inventory never had (the retry / completion crawl).
for (const r of rawRecords) {
  const key = `${r.yearFolder}/${r.folderName}`;
  if (!byKey.has(key)) byKey.set(key, fromRaw(r));
  else if (r.listed && !byKey.get(key).listed) byKey.set(key, fromRaw(r));
}
// 3. Year folders listed in the root entries but never crawled at all -> unlisted entries, so the browser still knows they exist.
const rootEntries = entriesFiles.flatMap((d) => d.entries || []);
const yearFolderFor = (top) => { const m = /^PROYECTOS ALUZINA (\d{4})( (\d{4}))?$/.exec(top); if (m) return m[3] ? `${m[1]}-${m[3]}` : m[1]; if (top === 'PROYECTOS 2026') return '2026'; return null; };
for (const e of rootEntries) {
  if (e.depth !== 1 || !e.is_dir) continue;
  const yf = yearFolderFor(e.path.split('/')[0]);
  if (!yf || e.name === 'JOE GALLINA INTERIOR') continue;
  const key = `${yf}/${e.name}`;
  if (!byKey.has(key)) byKey.set(key, { id: slug(e.name), folderName: e.name, yearFolder: yf, numberPrefix: numberPrefix(e.name), sourceHref: e.href, ...summarize([]), children: [], listed: false, reason: 'not_crawled' });
}

// 4. LIFE VIOLETA VILLA: its eight root-level subfolders are one project. SANTIAGO AGUIRRE ILUMINACION (root) is a project of its own.
const LVV = ['CONTABLES', 'ESTRUCTURA CIRCULAR', 'Exploracion', 'LIFE VIOLETA', 'PRIMER AVANCE DISEÑO', 'referentes  ESCENOGRAFIA', 'REFERENTES DE CONTRUCCION ESTRUCTURA', 'set'];
const lvvParts = LVV.map((n) => byKey.get(`root/${n}`)).filter(Boolean);
for (const n of LVV) byKey.delete(`root/${n}`);
const lvvRoot = rootEntries.find((e) => e.depth === 0 && e.name === 'LIFE VIOLETA VILLA');
if (lvvParts.length) {
  const dirChildren = lvvParts.map((p) => ({ name: p.folderName, is_dir: true, ext: '', size: null, modified: p.latestModified, href: p.sourceHref }));
  const fileChildren = lvvParts.flatMap((p) => p.children.filter((c) => !c.is_dir).map((c) => ({ ...c, _folder: p.folderName })));
  for (const p of lvvParts) folderHrefs.set(`life-violeta-villa::${p.folderName}`, p.sourceHref);
  const children = [...dirChildren, ...fileChildren];
  const oldest = fileChildren.map((c) => yearOfModified(c.modified)).filter(Boolean).sort((a, b) => a - b)[0] ?? null;
  const summary = summarize(children);
  byKey.set('root/LIFE VIOLETA VILLA', {
    id: 'life-violeta-villa', folderName: 'LIFE VIOLETA VILLA', yearFolder: 'root', numberPrefix: null, sourceHref: lvvRoot?.href ?? lvvParts[0].sourceHref.replace(/\/[^/]+\?/, '?'),
    ...summary, dirCount: lvvParts.length, children, listed: true,
    _yearInferred: oldest, _noteExtra: `Carpeta de nivel raíz con ${lvvParts.length} subcarpetas (${LVV.join(', ')}) leídas como un solo proyecto; año ${oldest ?? 'desconocido'} inferido (inferred) del archivo más antiguo (${fileChildren.map((c) => c.modified).filter((m) => m && yearOfModified(m)).sort((a, b) => approxDays(b) - approxDays(a))[0] ?? '—'}); archivos hasta ${summary.latestModified ?? '—'}.`,
  });
}
const saRoot = rootEntries.find((e) => e.depth === 0 && e.name === 'SANTIAGO AGUIRRE ILUMINACION');
if (saRoot && !byKey.has('root/SANTIAGO AGUIRRE ILUMINACION')) {
  byKey.set('root/SANTIAGO AGUIRRE ILUMINACION', { id: 'santiago-aguirre-iluminacion-root', folderName: saRoot.name, yearFolder: 'root', numberPrefix: null, sourceHref: saRoot.href, ...summarize([]), children: [], listed: false, reason: 'not_crawled' });
} else if (saRoot) {
  const e = byKey.get('root/SANTIAGO AGUIRRE ILUMINACION');
  if (e.id === 'santiago-aguirre-iluminacion') e.id = 'santiago-aguirre-iluminacion-root';
}

// 5. Featured projects from their deep indexes.
const deepOut = [];
for (const [slugId, file] of pairs(args.deep)) {
  const deep = readJson(file);
  const entriesFor = Object.fromEntries(pairs(args['deep-entries']))[slugId];
  const deepEntries = entriesFor ? readJson(entriesFor).entries || [] : [];
  for (const e of deepEntries) if (e.is_dir && e.href) folderHrefs.set(`${slugId}::${e.path}`, e.href);
  const topLevel = deepEntries.filter((e) => e.depth === 0);
  const hrefOf = (name) => topLevel.find((e) => e.name === name)?.href ?? deep.sourceUrl;
  const dirNames = [...new Set(deep.files.map((f) => f.path.split('/')[0]).filter((s, _, __) => deep.files.some((f) => f.path.startsWith(`${s}/`))))];
  const dirChildren = dirNames.sort().map((n) => ({ name: n, is_dir: true, ext: '', size: null, modified: null, href: hrefOf(n) }));
  const rootFiles = deep.files.filter((f) => !f.path.includes('/')).map((f) => ({ name: f.name, is_dir: false, ext: f.ext, size: f.bytes, modified: f.modified, href: f.sourceHref }));
  const children = [...dirChildren, ...rootFiles];
  const allFolders = new Set(deep.files.map((f) => f.path.split('/').slice(0, -1)).flatMap((segs) => segs.map((_, i) => segs.slice(0, i + 1).join('/'))));
  const extensions = {};
  for (const f of deep.files) extensions[f.ext || '(none)'] = (extensions[f.ext || '(none)'] || 0) + 1;
  const newest = deep.files.map((f) => f.modified).filter(Boolean).sort((a, b) => approxDays(a) - approxDays(b))[0] ?? null;
  const yearFolder = /PROYECTOS%20ALUZINA%20(\d{4})%20(\d{4})/.exec(deep.sourceUrl) ? deep.sourceUrl.match(/PROYECTOS%20ALUZINA%20(\d{4})%20(\d{4})/).slice(1).join('-') : '2019-2023';
  byKey.set(`${yearFolder}/${deep.folderName}`, {
    id: slugId, folderName: deep.folderName, yearFolder, numberPrefix: numberPrefix(deep.folderName), sourceHref: deep.sourceUrl,
    childCount: children.length, fileCount: deep.files.length, dirCount: dirChildren.length, extensions, totalBytesKnown: deep.totalBytes, latestModified: newest,
    children, listed: true, deepIndex: `docs/archive/projects/${slugId}/index.json`, _featured: true,
    _noteExtra: `Proyecto destacado con índice completo: ${deep.files.length} archivos en ${allFolders.size} carpetas (${dirChildren.length} de primer nivel), rastreado ${String(deep.crawledAt).slice(0, 10)}; archivos fechados hasta ${newest ?? '—'}.`,
  });
  deepOut.push([slugId, redactDeep(deep, slugId)]);
}

function redactDeep(deep, slugId) {
  const files = deep.files.map((f) => {
    stats.deepFiles++;
    const folder = f.path.includes('/') ? f.path.slice(0, f.path.lastIndexOf('/')) : '';
    const newFolder = rewriteSegments(folder);
    const r = redactedName(f.name, folder);
    const contentHit = !r && (CONTENT_RE.test(norm(f.textExcerpt || '')) || /feng shui/.test(norm(f.name)) || SENSITIVE_CONTENT.has(f.name));
    const pathTouched = newFolder !== folder;
    const safeHref = r || contentHit || pathTouched ? safeAncestorHref(folder, deep.sourceUrl, slugId) : f.sourceHref;
    if (safeHref !== f.sourceHref) stats.hrefsReplaced++;
    const base = { path: newFolder ? `${newFolder}/${r ?? f.name}` : r ?? f.name, name: r ?? f.name, ext: f.ext, mimeType: f.mimeType || null, bytes: f.bytes ?? null, modified: f.modified ?? null, sourceHref: safeHref, downloaded: Boolean(f.downloaded), slug: f.slug };
    if (r || contentHit) {
      if (r) stats.deepRedacted++; else stats.deepContentRedacted++;
      return { ...base, thumb: null, pages: [], pageCount: f.pageCount ?? null, textExcerpt: '', palette: [], renderer: null, redacted: true, redactedReason: r ? (NAME_RE.test(norm(f.name)) ? 'nombre de archivo' : 'carpeta administrativa o financiera') : SENSITIVE_CONTENT.get(f.name) ?? (/feng shui/.test(norm(f.name)) ? 'informe feng shui (carta natal del propietario)' : 'contenido con datos personales') };
    }
    const pages = (f.pages || []).slice(0, MAX_PAGES).map((p) => `pages/${path.basename(p)}`);
    if (f.thumb) stats.previewsKept++;
    stats.pagesKept += pages.length;
    return { ...base, thumb: f.thumb ? `thumbs/${path.basename(f.thumb)}` : null, pages, pageCount: f.pageCount ?? null, textExcerpt: (f.textExcerpt || '').slice(0, 600), palette: f.palette || [], renderer: f.renderer ?? null };
  });
  return { folderName: deep.folderName, sourceUrl: deep.sourceUrl, crawledAt: deep.crawledAt, indexedAt: new Date().toISOString(), fileCount: files.length, totalBytes: deep.totalBytes, maxPages: MAX_PAGES, redaction: 'D-059: see scripts/archive/build-index.mjs header', servedFrom: `apps/hub/public/archive/${slugId}/`, files };
}

// ---------------------------------------------------------------------------------------------------------------------
// Notes: duplicates, empties, containers. Keys are `<yearFolder>/<folderName>`.
// ---------------------------------------------------------------------------------------------------------------------
const DUPLICATE_GROUPS = [
  ['2020/0_79 SODIME producciom', '2026/05_SODIME'],
  ['2020/0_73 COASSIST TERMIAL DE EL SUR 2020', '2021/0_103 COASSIST 2021'],
  ['2024/EL ENCANTO', '2025/014 EL ENCANTO'],
  ['2025/05 SANTIAGO AGUIRRE ILUMINACION', 'root/SANTIAGO AGUIRRE ILUMINACION'],
  ['2024/SIMON CALERA', '2026/019_ SIMON CALERA'],
  ['2025/034 ALMA PRANA', '2026/18_ALMA PRANA 2026'],
  ['2021/0_108 PUNTO COMERCIAL UPPER TRIP', '2024/UPPERTRIP', '2024/UPPERTRIP TUBO 2024'],
  ['2021/0_112 VILLA VERDE', '2024/SEGUNDO PROCESO DE VILLA VERDE'],
  ['2021/SHABELA CHARCUTERÍA NECOCLI 2021', '2022/SHABELA FOTOS', '2022/SHAVELA'],
  ['2019-2023/BONNY JUEGO NUBE', '2021/0_107 PROYECTOS BONNY', '2025/037 PARQUE BONNY NORIEGA'],
  ['2024/PORTAL DEL VALLE NATHALY KENEDY', '2025/028 NATALIE KENEDY OFFICE AND TERRACE'],
  ['2024/CASA JORGE Y LIGIA', '2024/LIGIA Y JORGE'],
  ['2024/CALERA EL SILENCIO DE LOS PAJAROS', '2025/07 IMAGENES EL SILENCIO DE LOS PAJAROS'],
  ['2021/0_95 APTO PAOLA', '2022/0_ APARTAMEMTO PAOLA JIMENA'],
  ['2026/08_HONEY VALLEY LUMINARIA', '2024/DESARROLLO DE ILUMINACION'],
];
const CONTAINER_RE = /^PROYECTOS (ALUZINA )?\d{4}/i;
function noteFor(key, e) {
  const notes = [];
  if (e._noteExtra) notes.push(e._noteExtra);
  for (const g of DUPLICATE_GROUPS) {
    if (!g.includes(key)) continue;
    const others = g.filter((k) => k !== key && byKey.has(k)).map((k) => { const [yf, ...rest] = k.split('/'); return `${rest.join('/')} (${yf})`; });
    if (others.length) notes.push(`También aparece como ${others.join(' y ')}; posible duplicado o continuación, confirmar con la fundadora.`);
  }
  if (CONTAINER_RE.test(e.folderName)) notes.push('Carpeta contenedora (agrupa proyectos), probablemente no es un proyecto; confirmar.');
  if (e.listed && e.childCount === 0) notes.push('Carpeta vacía en el rastreo.');
  if (!e.listed) notes.push(e.reason === 'not_crawled' ? 'Carpeta detectada en la raíz pero no rastreada todavía (ar-16).' : `No se pudo listar (${e.reason}); reintentar (ar-16).`);
  return notes.join(' ') || undefined;
}

// ---------------------------------------------------------------------------------------------------------------------
// Assemble, redact children, sort, write
// ---------------------------------------------------------------------------------------------------------------------
const YEAR_ORDER = ['2026', '2025', '2024', '2022', '2021', '2020', '2019-2023', 'root'];
const natural = (a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });
const projects = [...byKey.entries()].map(([key, e]) => {
  const children = e.children.map((c) => redactChild(c, c._folder ?? '', e.sourceHref, e.id));
  const out = {
    id: e.id, folderName: e.folderName, yearFolder: e.yearFolder, year: e._yearInferred ?? yearOf(e.yearFolder), numberPrefix: e.numberPrefix ?? numberPrefix(e.folderName),
    sourceHref: e.sourceHref, childCount: children.length, fileCount: e.fileCount, dirCount: e.dirCount, extensions: e.extensions, totalBytesKnown: e.totalBytesKnown,
    latestModified: e.latestModified, children, listed: Boolean(e.listed), deepIndex: e.deepIndex ?? null, kind: kindOf(e.folderName),
  };
  const note = noteFor(key, e);
  if (note) out.note = note;
  if (e._yearInferred) out.yearInferred = true;
  return out;
}).sort((a, b) => YEAR_ORDER.indexOf(a.yearFolder) - YEAR_ORDER.indexOf(b.yearFolder) || natural(a.folderName, b.folderName));

// Unique ids (two folders can share a slug across years, e.g. EL ENCANTO 2024 / 2025).
const seen = new Map();
for (const p of projects) {
  const n = (seen.get(p.id) ?? 0) + 1;
  seen.set(p.id, n);
  if (n > 1) p.id = `${p.id}-${p.yearFolder.toLowerCase()}`;
}

const roots = [
  { label: 'A', name: 'JOE GALLINA INTERIOR', url: 'https://www.dropbox.com/scl/fo/xg5yoe6qo29bhr574q5ns/AOyD6MfpnUDe9JQK6yliIXY?rlkey=djfb5faa8o7tyfy1ljqvfvi87&st=31ko6hst&dl=0', note: 'The direct link asks for a Dropbox sign-in; the folder was read through its copy inside link C (PROYECTOS ALUZINA 2019 2023/JOE GALLINA INTERIOR).' },
  { label: 'B', name: '2026 (PROYECTOS 2026)', url: 'https://www.dropbox.com/scl/fo/3emfxpbratvegn0256zk8/ABtCCw9qOi_fTm0ryx4826U?rlkey=db3828bqezrux1nomqwl3xupy&st=8lhagpot&dl=0' },
  { label: 'C', name: 'PROYECTOS ALUZINA 2019 2023 (holds the 2020, 2021, 2022, 2024 and 2025 year folders too)', url: 'https://www.dropbox.com/scl/fo/fufb968sqwatycuu0oj5q/ABghNW63tJYXzKer4cOEY1Q?rlkey=3abou8zagwodzjc2u2pi4buv8&st=ugttgj4n&dl=0' },
  { label: 'D', name: '00 INFORMACION RELEVANTE ALUZINA 2023 (company documents, not project folders: intake task ar-15)', url: 'https://www.dropbox.com/scl/fo/aakz1kqtsw6poj3ay2ipr/AAcyG9ZoLQiTrnoPkjlJJds?rlkey=tp6stvztcp5r4cyy1ftz19mp0&st=rmm8dih7&e=1&dl=0' },
];
const counts = {
  projects: projects.length,
  byKind: Object.fromEntries(['project', 'quote', 'admin'].map((k) => [k, projects.filter((p) => p.kind === k).length])),
  byYearFolder: Object.fromEntries(YEAR_ORDER.map((y) => [y, projects.filter((p) => p.yearFolder === y).length])),
  listed: projects.filter((p) => p.listed).length,
  unlisted: projects.filter((p) => !p.listed).map((p) => `${p.yearFolder}/${p.folderName}`),
  empty: projects.filter((p) => p.listed && p.childCount === 0).length,
  childFiles: projects.reduce((n, p) => n + p.children.filter((c) => !c.is_dir).length, 0),
  childDirs: projects.reduce((n, p) => n + p.children.filter((c) => c.is_dir).length, 0),
  totalBytesKnown: projects.reduce((n, p) => n + (p.totalBytesKnown || 0), 0),
  deep: Object.fromEntries(deepOut.map(([s, d]) => [s, { files: d.fileCount, totalBytes: d.totalBytes, redacted: d.files.filter((f) => f.redacted).length, withThumb: d.files.filter((f) => f.thumb).length, withPages: d.files.filter((f) => f.pages.length).length, pages: d.files.reduce((n, f) => n + f.pages.length, 0) }])),
};
const redaction = { inventoryFiles: stats.inventoryFiles, inventoryRedacted: stats.inventoryRedacted, hrefsReplaced: stats.hrefsReplaced, deepFiles: stats.deepFiles, deepRedactedByName: stats.deepRedacted, deepRedactedByContent: stats.deepContentRedacted, folderSegmentsRewritten: stats.segmentsRewritten.size, rules: 'scripts/archive/build-index.mjs header (R1..R5), decision D-059' };

// ---------------------------------------------------------------------------------------------------------------------
// R7 self-check: nothing personal or financial survives in names, paths or links. Fails the run before writing.
// ---------------------------------------------------------------------------------------------------------------------
const problems = [];
const dec = (u) => { try { return decodeURIComponent(u); } catch { return u; } };
const rootPathOf = (href) => { const m = /\/scl\/fo\/[^/]+\/[^/]+\/([^?]*)/.exec(dec(href || '')); return m ? m[1] : ''; };
function checkHref(where, href, rootHref, originalName) {
  if (!href) return;
  const full = dec(href);
  const rootPath = rootPathOf(rootHref);
  const rel = rootPathOf(href).startsWith(rootPath) ? rootPathOf(href).slice(rootPath.length) : rootPathOf(href);
  if (originalName && full.includes(originalName)) problems.push(`${where}: href still names the file`);
  if (NAME_RE.test(norm(rel))) problems.push(`${where}: href path "${rel}" matches the pattern`);
  // Beyond the project root only: a project folder name is the studio's identifier and stays (R5), even when it names a person.
  for (const seg of PERSON_SEGMENTS) if (rel.includes(seg)) problems.push(`${where}: href contains person segment "${seg}"`);
  for (const nm of PERSON_NAMES) if (norm(rel).includes(norm(nm))) problems.push(`${where}: href contains "${nm}"`);
}
function checkText(where, text) {
  for (const seg of PERSON_SEGMENTS) if (text.includes(seg)) problems.push(`${where}: contains person segment "${seg}"`);
  for (const nm of PERSON_NAMES) if (norm(text).includes(norm(nm))) problems.push(`${where}: contains "${nm}"`);
}
for (const p of projects) {
  p.children.forEach((c, i) => {
    const where = `${p.yearFolder}/${p.folderName} child ${i} (${c.name})`;
    checkText(where, c.name);
    if (!c.is_dir && !c.redacted && NAME_RE.test(norm(c.name))) problems.push(`${where}: unredacted file name matches the pattern`);
    if (c.redacted) checkHref(where, c.href, p.sourceHref, null);
    else if (c.is_dir) for (const seg of PERSON_SEGMENTS) if (dec(c.href || '').includes(seg)) problems.push(`${where}: dir href contains "${seg}"`);
  });
}
const originalNames = new Map(deepOut.map(([s]) => [s, new Map(readJson(pairs(args.deep).find(([k]) => k === s)[1]).files.map((f) => [f.slug, f.name]))]));
for (const [s, d] of deepOut) {
  d.files.forEach((f) => {
    const where = `${s}: ${f.path}`;
    checkText(where, f.path);
    checkText(`${where} (excerpt)`, f.textExcerpt || '');
    if (!f.redacted && NAME_RE.test(norm(f.name))) problems.push(`${where}: unredacted file name matches the pattern`);
    if (f.redacted) checkHref(where, f.sourceHref, d.sourceUrl, originalNames.get(s)?.get(f.slug) ?? null);
    else for (const seg of PERSON_SEGMENTS) if (dec(f.sourceHref || '').includes(seg)) problems.push(`${where}: href contains "${seg}"`);
  });
}
// Whole-output grep, URL-encoded too.
const serialized = JSON.stringify(projects) + JSON.stringify(deepOut);
for (const seg of PERSON_SEGMENTS) for (const v of [seg, encodeURIComponent(seg), seg.replace(/ /g, '%20')]) if (serialized.includes(v)) problems.push(`output contains "${v}"`);
const privacyCheck = { ok: problems.length === 0, checkedInventoryEntries: projects.reduce((n, p) => n + p.children.length, 0), checkedDeepFiles: deepOut.reduce((n, [, d]) => n + d.files.length, 0), personSegments: PERSON_SEGMENTS.size, problems: [...new Set(problems)].slice(0, 50) };
if (!privacyCheck.ok) {
  console.error('PRIVACY CHECK FAILED (nothing written):');
  for (const pr of privacyCheck.problems) console.error('  - ' + pr);
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });
const index = { source: 'Dropbox shared folders shared by Justin Massion in Slack #past-projects, 2026-09-21 (prompt 0017); crawled with scripts/archive/crawl-dropbox.mjs, indexed and redacted with scripts/archive/build-index.mjs', crawledAt: rawRecords.length ? '2026-09-21T17:10:00Z' : new Date().toISOString(), indexedAt: new Date().toISOString(), roots, counts, redaction, privacyCheck, projects };
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1) + '\n');
for (const [s, d] of deepOut) {
  fs.mkdirSync(path.join(OUT, 'projects', s), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'projects', s, 'index.json'), JSON.stringify(d, null, 1) + '\n');
}

// README
const gb = (n) => `${(n / 1024 ** 3).toFixed(1)} GB`;
const readme = `# docs/archive/ — the project archive as data

status: current · since: 2026-09-21 · source: Dropbox shared folders from Justin Massion (Slack #past-projects, prompt 0017); generated by \`scripts/archive/build-index.mjs\` on ${new Date().toISOString().slice(0, 10)}

What this folder holds (changelog 0019, D-055, D-058, D-059):

- \`index.json\` — the **inventory**: one entry per project folder of Aluzina's Dropbox (${projects.length} folders across ${YEAR_ORDER.filter((y) => counts.byYearFolder[y]).length} year folders: ${YEAR_ORDER.filter((y) => counts.byYearFolder[y]).map((y) => `${y} (${counts.byYearFolder[y]})`).join(', ')}), with its direct children (${counts.childFiles} files, ${counts.childDirs} subfolders, ${gb(counts.totalBytesKnown)} of listed sizes), inferred \`kind\` (${counts.byKind.project} project, ${counts.byKind.quote} quotation-only = prospect, ${counts.byKind.admin} admin), \`year\`, notes on duplicates / empty / unlisted folders (${counts.unlisted.length} unlisted, ${counts.empty} empty). Read by \`apps/hub/src/data/seed/archive.ts\` through \`@docs\`.
- \`projects/<slug>/index.json\` — the **deep index** of a featured project: every file with its folder path, size, date, share link, and for design deliverables the served thumbnail and page renders (\`apps/hub/public/archive/<slug>/{thumbs,pages}/\`, <= 640 px / <= 1200 px, <= ${MAX_PAGES} pages). ${deepOut.map(([s, d]) => `\`${s}\`: ${d.fileCount} files, ${counts.deep[s].withThumb} with a thumbnail, ${counts.deep[s].pages} page renders, ${counts.deep[s].redacted} redacted`).join('; ')}.
- No renders are stored here (D-058): the served copies under \`apps/hub/public/archive/\` are the visual memory; the crawl output and downloaded originals stay outside the repo.

## Re-running the pipeline

1. **Crawl** — \`npm run archive:crawl -- --url=<share url> --depth=1 --out=<label>.entries.json\` lists a shared folder (headless Chromium, read-only); \`--targets=<targets.json>\` lists one page per project folder (resumable). Gentle pacing, one retry after a gate / 429.
2. **Index + redact** — \`npm run archive:index -- --inventory=<projects.json> --raw=<projects_raw.json> --entries=<B.entries.json>,<C.entries.json> --deep=<slug>=<index.json> --deep-entries=<slug>=<entries.json>\` writes this folder.
3. **Renders** — \`npm run archive:previews -- render --entries=<entries.json> --files=<dir> --out=<dir>\` downloads the allow-listed design files and renders thumbnails / pages (PyMuPDF, Pillow, LibreOffice for Office files); \`npm run archive:previews -- serve --index=docs/archive/projects/<slug>/index.json --src=<thumbs dir> --dest=apps/hub/public/archive/<slug>\` re-encodes the kept renders into the served folder (thumbs 640 px q80, pages 1200 px q72, max ${MAX_PAGES} pages).
4. **Build** — \`npm run build\`; the seed derives projects, assets, spaces, posts, relations and tags from the JSON (\`SEED_VERSION\` bumps when the data shape changes).

## Redaction (D-059)

The hub deploys as a public GitHub Pages site, so no personal or financial document may be identifiable in the committed data. Rules R1..R5 are the table in the header of \`scripts/archive/build-index.mjs\`; in short: a file whose name says RUT, seguridad social, planilla, cédula, contrato, comprobante, cuenta de cobro, factura, cotización, pedido, invoice, payment, WhatsApp image, etc., or that sits under an administrative / supplier / closing folder, keeps only its type, size, date and link (\`"<Tipo> (redactado).<ext>"\`, \`redacted: true\`, no preview or excerpt); a file whose text carries personal data (birth date, cédula, NIT) or a feng shui report keeps its name but loses preview and excerpt; folder segments that are person names become their role (EQUIPO, CONTRATISTA, ARTISTA, ELECTRICISTA); company and project folder names stay as the studio's identifiers (Justin can ask for any to be redacted).

Counts this run: ${redaction.inventoryRedacted} of ${redaction.inventoryFiles} inventory files redacted; ${redaction.deepRedactedByName} of ${redaction.deepFiles} deep-index files redacted by name / folder and ${redaction.deepRedactedByContent} by content; ${redaction.folderSegmentsRewritten} folder segments rewritten; ${redaction.hrefsReplaced} share links replaced by the link of a safe ancestor folder (R6: Dropbox links embed the file path, so a redacted file links to its folder, never to itself). Self-check R7 (names, paths, links, URL-encoded too): ${privacyCheck.ok ? 'passed' : 'FAILED'} over ${privacyCheck.checkedInventoryEntries} inventory entries and ${privacyCheck.checkedDeepFiles} deep-index files.

## Inferred, to confirm with the founder (D-060)

Project type (from the folder name), status (from the year folder: 2026 = in progress, quotation folders = prospect, else past), client (only when a folder name matches an existing client row), year (from the year folder; LIFE VIOLETA VILLA inferred from its newest file), and every duplicate note. Each seeded row's summary says so.
`;
fs.writeFileSync(path.join(OUT, 'README.md'), readme);

console.log(JSON.stringify({ counts, redaction, privacyCheck }, null, 1));
console.log('Folder segments rewritten (review):');
for (const [from, to] of stats.segmentsRewritten) console.log(`  ${from}  ->  ${to}`);
console.log(`wrote ${path.join(OUT, 'index.json')}${deepOut.map(([s]) => `, ${path.join(OUT, 'projects', s, 'index.json')}`).join('')}, ${path.join(OUT, 'README.md')}`);
