// Asana CSV -> checked-in seed files (D-062). `npm run import:asana [-- --date=2026-09-21]`.
//
// Reads the de-identified exports in docs/source/asana/<date>/ and writes
//   apps/hub/src/data/seed/asana/hoy.ts        PROYECTO HOY: sections + the whole task tree
//   apps/hub/src/data/seed/asana/portfolio.ts  the Sep-Dec 2026 board as typed vendor jobs
// Shapes: apps/hub/src/data/seed/asana/types.ts. Rows are added to the project by seed/asana.ts.
//
// Asana's export has no stable parent key: `Parent task` is a NAME, names repeat, most carry trailing
// spaces and one parent's name is a single space. Resolution therefore follows the founder's own file:
// trimmed name -> the candidates in file order, consumed left to right (conventions §2, §8).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const i = a.indexOf('=');
  return [a.replace(/^--/, '').split('=')[0], i === -1 ? 'true' : a.slice(i + 1)];
}));
const srcRoot = join(root, 'docs/source/asana');
const date = args.date ?? readdirSync(srcRoot).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().pop();
const srcDir = join(srcRoot, date);
const outDir = join(root, 'apps/hub/src/data/seed/asana');
if (!existsSync(srcDir)) throw new Error(`no export folder at ${srcDir}`);
mkdirSync(outDir, { recursive: true });

// ---------------------------------------------------------------------------------------------
// RFC 4180 parser (quoted fields with embedded commas, newlines and doubled quotes). No dependency.
// ---------------------------------------------------------------------------------------------
function parseCsv(text) {
  const src = text.replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < src.length; i += 1) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i += 1; } else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === ',') { row.push(field); field = ''; continue; }
    if (c === '\r') continue;
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  // Asana repeats column names (eleven `SEMANA n`); the first wins, the rest are unused here.
  return body
    .filter((r) => r.some((v) => v !== ''))
    .map((r) => {
      const o = {};
      header.forEach((h, i) => {
        const key = h.trim();
        if (!(key in o)) o[key] = r[i] ?? '';
      });
      return o;
    });
}

const read = (file) => parseCsv(readFileSync(join(srcDir, file), 'utf8'));

// ---------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------
const norm = (s) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const iso = (s) => (/^\d{4}-\d{2}-\d{2}/.test(s ?? '') ? s.slice(0, 10) : null);
/**
 * COP from a note value. The founder writes dot thousands and sometimes shows her arithmetic
 * (`17.500M2=3.500.000`, `520 Dolares- 1.820.000`), so the largest number in the value is the total.
 * `0` is a real value (pass-through coordination) and must not read as "no value".
 */
const cop = (s) => {
  const text = (s ?? '').replace(/\s/g, '');
  if (/^0$/.test(text)) return 0;
  const found = [...text.matchAll(/\d[\d.,]{3,}/g)].map((m) => Number(m[0].replace(/[.,]/g, ''))).filter((n) => Number.isFinite(n) && n > 0);
  return found.length ? Math.max(...found) : null;
};
const ddmmyyyy = (s) => {
  const m = (s ?? '').match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : null;
};

/**
 * Resolve `Parent task` by trimmed name in file order (see the header note). Asana writes a parent's
 * children contiguously, so a run of rows naming the same parent belongs to one candidate and the next
 * run of that name moves on to the next candidate with it (`ROCSANA BOTÁNICA` appears four times).
 */
function buildTree(rows) {
  const byName = new Map();
  for (const r of rows) {
    const key = (r.Name ?? '').trim();
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(r);
  }
  const cursor = new Map();
  const parentOf = new Map();
  const childrenOf = new Map();
  let lastKey = null;
  for (const r of rows) {
    const raw = r['Parent task'] ?? '';
    // A truly empty cell is a root; a cell holding a single space names the blank-named task.
    if (raw === '') { lastKey = null; continue; }
    const key = raw.trim();
    if (key !== lastKey) {
      cursor.set(key, (cursor.get(key) ?? -1) + 1);
      lastKey = key;
    }
    const candidates = byName.get(key) ?? [];
    if (candidates.length === 0) continue;
    const parent = candidates[Math.min(cursor.get(key), candidates.length - 1)];
    if (parent['Task ID'] === r['Task ID']) continue;
    parentOf.set(r['Task ID'], parent['Task ID']);
    if (!childrenOf.has(parent['Task ID'])) childrenOf.set(parent['Task ID'], []);
    childrenOf.get(parent['Task ID']).push(r);
  }
  return { parentOf, childrenOf };
}

const ts = (obj) => JSON.stringify(obj);
const banner = (file) => `// GENERATED by scripts/import-asana.mjs (npm run import:asana) from\n// docs/source/asana/${date}/${file}\n// Do not edit by hand: re-run the script. Shapes: ./types.ts. Rows: ../asana.ts (D-062).\n`;

// ---------------------------------------------------------------------------------------------
// 1. PROYECTO HOY -> hoy.ts
// ---------------------------------------------------------------------------------------------
const HOY_FILE = 'PROYECTO_HOY.csv';
const hoyRows = read(HOY_FILE);
const { parentOf: hoyParent, childrenOf: hoyKids } = buildTree(hoyRows);

/** Team accounts seen in the exports (`docs/knowledge/team.md`; the Asana account spells Sarai "Saray"). */
const ASSIGNEES = { 'aleja guerra lotero': 'u-alejandra', saray: 'u-sarai' };
/** Who owns a section's unassigned tasks (the founder's own pattern, conventions §3). */
const SECTION_DEFAULT = [
  ['cierre de cliente', 'u-miguel'],
  ['diseno', 'u-alejandra'],
  ['cotizacion', 'u-miguel'],
  ['production', 'u-miguel'],
  ['produccion', 'u-miguel'],
];
/** Two PRODUCTION tasks the founder keeps for herself. */
const OWNER_OVERRIDE = { '21 arte': 'u-alejandra', '22 detalles de casa': 'u-alejandra' };
const ROLE_OF = { 'u-alejandra': 'founder', 'u-sarai': 'studio', 'u-miguel': 'ops', 'u-angelica': 'brand' };

/**
 * Deliverable links, matched on the normalized title — the same mapping the template carries
 * (`apps/hub/src/domain/templates/aluzina-workflow.ts`), so an imported project and a generated one
 * point at the same `deliverables` rows.
 */
const DELIVERABLE_BY_TITLE = new Map(Object.entries({
  'contrato': 'del-contract',
  'facturacion': 'del-invoice',
  'last payment of the design': 'del-invoice',
  '3 2d acad model': 'del-site-survey',
  '8 mood board': 'del-mood-board',
  '6 primera reunion de diseno con el cliente': 'del-concept-presentation',
  '12 segunda reunion de diseno con el cliente': 'del-concept-presentation',
  'envio de presentacion': 'del-final-presentation',
  '10 esquema de referencia de la intencion de iluminacion': 'del-lighting-concept',
  '15 diseno luminico': 'del-lighting-plan',
  '13 modelado tridimencional del diseno': 'del-render-pack',
  '14 migrar las imagenes 3d con nuestro diseno a la presentacion remplazando los referentes por las creaciones del estudio': 'del-render-pack',
  '13 2 2d planos del espacio con todo especificado': 'del-technical-drawings',
  '13 3 diseno de mobiliario que se va a fabrir modelo 3d para aprobacion': 'del-furniture-schedule',
  '13 4 especificacion de mobilairio y detalles que se van a comprar': 'del-furniture-schedule',
  '1 todos los elementos de diseno migrados a excel a la cotizacion formal': 'del-budget-quote-comparison',
  '2 contactar los proveedores de cada elemento de obra con las especificaciones de diseno para que hagan sus cotizaciones': 'del-rfq-packet',
  'cronograma de trabajo': 'del-project-schedule',
  '23 final details': 'del-punch-list',
  '25 client deliver': 'del-handover-package',
  '26 client correction in space': 'del-punch-list',
}));

const taskId = (r) => `tsk-asana-${r['Task ID']}`;
const slug = (s) => norm(s).replace(/ /g, '-').slice(0, 40) || 'sin-seccion';

// Sections in first-appearance order, taken from the root tasks.
const hoySections = [];
const sectionIdByName = new Map();
for (const r of hoyRows) {
  if ((r['Parent task'] ?? '') !== '') continue;
  const name = (r['Section/Column'] ?? '').trim();
  if (!name || sectionIdByName.has(name)) continue;
  const id = `sec-hoy-${slug(name)}`;
  sectionIdByName.set(name, id);
  hoySections.push({ id, name, order: hoySections.length });
}

// Section of a task = the section of the root of its subtree.
const rowById = new Map(hoyRows.map((r) => [r['Task ID'], r]));
function sectionOf(r) {
  let cur = r;
  const seen = new Set();
  while (cur && !seen.has(cur['Task ID'])) {
    seen.add(cur['Task ID']);
    const name = (cur['Section/Column'] ?? '').trim();
    if (name && sectionIdByName.has(name)) return sectionIdByName.get(name);
    const p = hoyParent.get(cur['Task ID']);
    cur = p ? rowById.get(p) : undefined;
  }
  return null;
}

function assigneeOf(r, sectionId) {
  const mapped = ASSIGNEES[norm(r.Assignee)];
  if (mapped) return mapped;
  const override = OWNER_OVERRIDE[norm(r.Name)];
  if (override) return override;
  const section = hoySections.find((s) => s.id === sectionId);
  const hit = SECTION_DEFAULT.find(([prefix]) => norm(section?.name).startsWith(prefix));
  return hit ? hit[1] : 'u-miguel';
}

// Order: file order within the parent (roots: within the section).
const orderCursor = new Map();
const hoyTasks = hoyRows.map((r) => {
  const sectionId = sectionOf(r);
  const parent = hoyParent.get(r['Task ID']) ?? null;
  const bucket = parent ?? `section:${sectionId}`;
  const order = orderCursor.get(bucket) ?? 0;
  orderCursor.set(bucket, order + 1);
  const assigneeId = assigneeOf(r, sectionId);
  const completedAt = iso(r['Completed At']);
  return {
    id: taskId(r),
    sectionId,
    parentTaskId: parent ? `tsk-asana-${parent}` : null,
    title: (r.Name ?? '').trim(),
    externalId: `asana:${r['Task ID']}`,
    description: (r.Notes ?? '').trim(),
    assigneeId,
    ownerRole: ROLE_OF[assigneeId] ?? 'ops',
    status: completedAt ? 'done' : 'todo',
    completedAt,
    startDate: iso(r['Start Date']),
    dueDate: iso(r['Due Date']),
    deliverableId: DELIVERABLE_BY_TITLE.get(norm(r.Name)) ?? null,
    order,
  };
});

writeFileSync(
  join(outDir, 'hoy.ts'),
  `${banner(HOY_FILE)}import type { AsanaSectionRow, AsanaTaskRow } from './types';\n\n` +
    `export const HOY_SOURCE = 'docs/source/asana/${date}/${HOY_FILE}';\n\n` +
    `export const HOY_SECTIONS: AsanaSectionRow[] = [\n${hoySections.map((s) => `  ${ts(s)},`).join('\n')}\n];\n\n` +
    `export const HOY_TASKS: AsanaTaskRow[] = [\n${hoyTasks.map((t) => `  ${ts(t)},`).join('\n')}\n];\n`,
);

// ---------------------------------------------------------------------------------------------
// 2. The Sep-Dec 2026 board -> portfolio.ts (vendor jobs; data for a later purchasing pass)
// ---------------------------------------------------------------------------------------------
const PF_FILE = 'PROYECTOS_ALUZINA_SEPTIEMBRE-DICIEMBRE_2026.csv';
const pfRows = read(PF_FILE);
const { parentOf: pfParent } = buildTree(pfRows);

/** The prose fields of the form, the only ones a following line without a key continues. */
const PROSE_KEYS = ['descripcion', 'responsabilidad de aluzina'];

/** `KEY: value` lines of the note form; a key may repeat (two payment lines). */
function formOf(note) {
  const out = [];
  for (const line of note.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{2,40}?)\s*:\s*(.*)$/);
    if (m) {
      out.push([m[1].trim(), m[2].trim(), line.trim()]);
      continue;
    }
    // A bare line continues a prose field (the Lovable link under RESPONSABILIDAD) and is otherwise a
    // stray remark (`ENTREGADO Y DESARROLLADO`) that belongs to the note, never to the field above it.
    const last = out[out.length - 1];
    if (last && line.trim() && PROSE_KEYS.includes(norm(last[0]))) last[1] += ` ${line.trim()}`;
  }
  return out;
}
const pick = (form, key) => form.find(([k]) => norm(k) === norm(key))?.[1] || null;

// A subtask carries no section: it belongs to the board column of the root of its subtree.
const pfById = new Map(pfRows.map((r) => [r['Task ID'], r]));
function boardColumn(r) {
  let cur = r;
  const seen = new Set();
  while (cur && !seen.has(cur['Task ID'])) {
    seen.add(cur['Task ID']);
    const name = (cur['Section/Column'] ?? '').trim();
    if (name) return name;
    const p = pfParent.get(cur['Task ID']);
    cur = p ? pfById.get(p) : undefined;
  }
  return '';
}

const jobs = pfRows.map((r) => {
  const note = (r.Notes ?? '').trim();
  const form = formOf(note);
  const rawStart = pick(form, 'FECHA DE COMIENZO');
  const rawDelivery = pick(form, 'FECHA DE ENTREGA');
  const payments = form
    .filter(([k]) => /pago/.test(norm(k)))
    .map(([k, v, raw]) => {
      const due = ddmmyyyy(v);
      // `PRIMER PAGO: 03/09/2026 1.300.000` — the date is not part of the amount.
      return { label: k, amountCop: cop(v.replace(/\d{1,2}[/-]\d{1,2}[/-]\d{4}/g, ' ')), due, raw };
    });
  return {
    id: `job-asana-${r['Task ID']}`,
    externalId: `asana:${r['Task ID']}`,
    client: boardColumn(r),
    title: (r.Name ?? '').trim(),
    parentExternalId: pfParent.get(r['Task ID']) ? `asana:${pfParent.get(r['Task ID'])}` : null,
    encargado: pick(form, 'ENCARGADO'),
    empresa: pick(form, 'EMPRESA'),
    valorCop: cop(form.find(([k]) => norm(k).startsWith('valor'))?.[1] ?? ''),
    profitCop: cop(pick(form, 'PROFIT ALUZINA') ?? ''),
    payments,
    startDate: ddmmyyyy(rawStart ?? ''),
    rawStartDate: rawStart,
    deliveryDate: ddmmyyyy(rawDelivery ?? ''),
    rawDeliveryDate: rawDelivery,
    description: pick(form, 'DESCRIPCION'),
    responsibility: pick(form, 'RESPONSABILIDAD DE ALUZINA'),
    note,
  };
});

writeFileSync(
  join(outDir, 'portfolio.ts'),
  `${banner(PF_FILE)}import type { AsanaVendorJob } from './types';\n\n` +
    `export const PORTFOLIO_SOURCE = 'docs/source/asana/${date}/${PF_FILE}';\n\n` +
    `/** Not rendered yet: the purchasing pass (O-12) turns these into \`purchases\` + \`payments\` rows. */\n` +
    `export const PORTFOLIO_JOBS: AsanaVendorJob[] = [\n${jobs.map((j) => `  ${ts(j)},`).join('\n')}\n];\n`,
);

// ---------------------------------------------------------------------------------------------
const linked = hoyTasks.filter((t) => t.deliverableId).length;
const nested = hoyTasks.filter((t) => t.parentTaskId).length;
const assignedByDefault = hoyTasks.filter((t) => !ASSIGNEES[norm(rowById.get(t.externalId.slice(6))?.Assignee)]).length;
console.log(`import:asana  source ${date}`);
console.log(`  PROYECTO HOY        ${hoyTasks.length} tasks in ${hoySections.length} sections; ${nested} nested, ${linked} linked to a deliverable, ${hoyTasks.length - assignedByDefault} assigned in Asana`);
console.log(`  portfolio board     ${jobs.length} vendor jobs; ${jobs.filter((j) => j.encargado).length} with ENCARGADO, ${jobs.filter((j) => j.valorCop).length} with VALOR, ${jobs.reduce((n, j) => n + j.payments.length, 0)} payment lines`);
console.log(`  wrote apps/hub/src/data/seed/asana/{hoy,portfolio}.ts`);
