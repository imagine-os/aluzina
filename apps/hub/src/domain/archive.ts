import type { ProjectType } from '../data/schema/projects';
import type { PipelineGroup, PipelineStatusId, Text } from './playbook';

/**
 * The project archive as domain data (prompt 0017, S-12): how a folder full of files from Dropbox (2019-2026)
 * becomes browsable in the hub. Pure data and pure functions, no React. Three vocabularies live here:
 *
 * - `Lifecycle` folds the 15 pipeline statuses into the three shelves Justin asked for (prospects / in progress /
 *   past) so the browser can separate them and still offer "see everything".
 * - `DeliveryStage` is the order in which a project produces its files (brief -> survey -> ... -> delivery, then
 *   admin and marketing). `stageFor()` classifies a folder path + file name by Spanish and English keywords;
 *   `assets.stage` stores the result and the project view groups by it.
 * - `FileType` is the icon vocabulary (`FileIcon`, `Thumb`): one glyph per family, from the extension.
 */

const T = (en: string, es?: string): Text => (es ? { en, es } : { en });

// ---------------------------------------------------------------------------------------------
// Lifecycle: prospects / in progress / past
// ---------------------------------------------------------------------------------------------

export type Lifecycle = 'prospect' | 'active' | 'past';

export interface LifecycleDef {
  id: Lifecycle;
  label: Text;
  glyph: string;
}

export const LIFECYCLES: readonly LifecycleDef[] = [
  { id: 'prospect', label: T('Prospects', 'Prospectos'), glyph: '◌' },
  { id: 'active', label: T('In progress', 'En curso'), glyph: '◐' },
  { id: 'past', label: T('Past', 'Pasados'), glyph: '●' },
];

export const LIFECYCLE_IDS: readonly Lifecycle[] = LIFECYCLES.map((l) => l.id);

/** lead-new .. proposal-sent -> prospect; contracted .. punch-list -> active; delivered, closed, follow-up -> past. */
export function lifecycleOf(status: PipelineStatusId): Lifecycle {
  switch (status) {
    case 'lead-new':
    case 'lead-qualified':
    case 'proposal-sent':
      return 'prospect';
    case 'delivered':
    case 'closed':
    case 'follow-up':
      return 'past';
    default:
      return 'active';
  }
}

export function lifecycle(id: string | null | undefined): LifecycleDef | undefined {
  return LIFECYCLES.find((l) => l.id === id);
}

// ---------------------------------------------------------------------------------------------
// Delivery stages: the order a project produces its files in
// ---------------------------------------------------------------------------------------------

export type DeliveryStage =
  | 'brief'
  | 'survey'
  | 'references'
  | 'concept'
  | 'design-development'
  | 'technical'
  | 'quotation'
  | 'procurement'
  | 'production'
  | 'execution'
  | 'delivery'
  | 'admin'
  | 'marketing'
  | 'other';

export interface DeliveryStageDef {
  id: DeliveryStage;
  /** Sort key (10, 20, … 140); lower comes first in the delivery order. */
  order: number;
  label: Text;
  /** Pipeline group the stage belongs to (`PIPELINE_STATUSES` tones and grouping reuse it). */
  pipelineGroup: PipelineGroup;
  glyph: string;
}

export const DELIVERY_STAGES: readonly DeliveryStageDef[] = [
  { id: 'brief', order: 10, label: T('Brief', 'Brief'), pipelineGroup: 'design', glyph: '✎' },
  { id: 'survey', order: 20, label: T('Survey', 'Levantamiento'), pipelineGroup: 'design', glyph: '⌖' },
  { id: 'references', order: 30, label: T('References', 'Referentes'), pipelineGroup: 'design', glyph: '❖' },
  { id: 'concept', order: 40, label: T('Concept', 'Concepto'), pipelineGroup: 'design', glyph: '◐' },
  { id: 'design-development', order: 50, label: T('Design development', 'Desarrollo de diseño'), pipelineGroup: 'design', glyph: '◈' },
  { id: 'technical', order: 60, label: T('Technical drawings', 'Planos técnicos'), pipelineGroup: 'design', glyph: '⊞' },
  { id: 'quotation', order: 70, label: T('Quotation', 'Cotización'), pipelineGroup: 'sale', glyph: '$' },
  { id: 'procurement', order: 80, label: T('Procurement', 'Compras'), pipelineGroup: 'build', glyph: '⛟' },
  { id: 'production', order: 90, label: T('Production', 'Producción'), pipelineGroup: 'build', glyph: '⚒' },
  { id: 'execution', order: 100, label: T('Execution', 'Obra'), pipelineGroup: 'build', glyph: '▲' },
  { id: 'delivery', order: 110, label: T('Delivery', 'Entrega'), pipelineGroup: 'close', glyph: '✓' },
  { id: 'admin', order: 120, label: T('Administration', 'Administración'), pipelineGroup: 'close', glyph: '§' },
  { id: 'marketing', order: 130, label: T('Marketing', 'Marketing'), pipelineGroup: 'close', glyph: '◎' },
  { id: 'other', order: 140, label: T('Other', 'Otros'), pipelineGroup: 'close', glyph: '·' },
];

export const DELIVERY_STAGE_IDS: readonly DeliveryStage[] = DELIVERY_STAGES.map((s) => s.id);

export function deliveryStage(id: string | null | undefined): DeliveryStageDef | undefined {
  return DELIVERY_STAGES.find((s) => s.id === id);
}

export function isDeliveryStage(v: unknown): v is DeliveryStage {
  return typeof v === 'string' && (DELIVERY_STAGE_IDS as readonly string[]).includes(v);
}

/** Lowercase, accents stripped, `_`/`-`/`.` turned into spaces, so keyword tests work on Spanish folder names. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_\-.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Keyword classifier, one rule per stage in evaluation order. A rule matches when any keyword appears in the
 * normalized text; `concept` also takes "render" when the same text says "propuesta" (a render inside a proposal
 * folder is concept material, a render on its own is design development).
 */
const STAGE_RULES: readonly { stage: DeliveryStage; keywords: readonly string[] }[] = [
  { stage: 'brief', keywords: ['brief', 'briefing', 'cuestionario', 'necesidades'] },
  { stage: 'survey', keywords: ['medidas', 'levantamiento', 'planimetria existente', 'fotos del espacio', 'fotografia y video del espacio', 'estado actual', 'site'] },
  { stage: 'references', keywords: ['referente', 'referentes', 'moodboard', 'mood board', 'inspiracion', 'paleta'] },
  { stage: 'concept', keywords: ['concepto', 'propuesta', 'presentacion', 'idea', 'boceto', 'sketch'] },
  { stage: 'technical', keywords: ['plano', 'planos', 'planta', 'corte', 'detalle', 'tecnico', 'ficha tecnica', 'molderia', 'medidas rectificadas', 'dwg', 'skp'] },
  { stage: 'design-development', keywords: ['desarrollo', 'render', '3d', 'vista', 'perspectiva', 'iluminacion'] },
  { stage: 'quotation', keywords: ['cotizacion', 'presupuesto', 'precio', 'propuesta economica'] },
  { stage: 'procurement', keywords: ['compra', 'compras', 'proveedor', 'proveedores', 'orden', 'pedido'] },
  { stage: 'production', keywords: ['produccion', 'taller', 'fabricacion', 'molde'] },
  { stage: 'execution', keywords: ['obra', 'instalacion', 'montaje', 'avance'] },
  { stage: 'delivery', keywords: ['entrega', 'final', 'acta', 'fotos finales'] },
  { stage: 'admin', keywords: ['factura', 'cuenta de cobro', 'contrato', 'pago', 'contable', 'rut', 'camara'] },
  { stage: 'marketing', keywords: ['instagram', 'post', 'portafolio', 'brochure'] },
];

function hasWord(text: string, keyword: string): boolean {
  // Whole-word match so "corte" does not fire on "recorte" and "site" not on "visite"; multi-word keywords match as phrases.
  const re = new RegExp(`(^|[^a-z0-9])${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^a-z0-9])`);
  return re.test(text);
}

/**
 * Multi-word phrases the studio uses as folder names (featured project, prompt 0017), tested before the generic
 * keywords because a word inside them would misfire alone ("3D OBRA CON DEMOLICIONES" is design development,
 * not `execution`; "INGENIERIA DE OBRA" is an admin folder; "FOTOGRAFIAS DE ESPACIO" is the survey).
 */
const STAGE_PHRASES: readonly { stage: DeliveryStage; phrases: readonly string[] }[] = [
  // --- The 2026 folder template (ar-22) -----------------------------------------------------------
  // Every PROYECTOS 2026 folder is numbered from the same template (`00_PRIMERA PROPUESTA` ..
  // `09 CONSIGNACIONES`), which the keyword rules alone read badly: 180 of HOY's 206 files landed in
  // `other` (changelog 0021 H). These run first because each one is a whole folder name whose parts
  // would misfire on their own.
  // "03 PLANOS DEL ESPACIO" and "05 DETALLES TECNICOS DE ILUMINACION": before the `iluminacion` phrase
  // below, which would otherwise read a lighting-detail drawing as design development.
  { stage: 'technical', phrases: ['planos del espacio', 'detalles tecnicos', 'artes de corte'] },
  // "01 FOTOGRAFIA Y VIDEO DEL ESPACIO" (template), HOY's plural "FOTOS Y VIDEOS DEL ESPACIO",
  // SPORTI's "VIDEOS DEL ESPACIO" and HOY's "FOTOS DE LAS SALAS": the photographic survey of what is
  // there today - before the generic `videos` / `imagenes` phrases at the end of this list.
  { stage: 'survey', phrases: ['fotografia y video del espacio', 'fotos y videos del espacio', 'fotos y video del espacio', 'videos del espacio', 'video del espacio', 'fotos de las salas'] },
  // "00_PRIMERA PROPUESTA", "02 PRESENTACION DE DISENO DEL ESPACIO", HOY's "propuestas" (the plural
  // the singular keyword misses).
  { stage: 'concept', phrases: ['primera propuesta', 'presentacion de diseno del espacio', 'propuestas'] },
  // "04_COTIZACION DEL ESPACIO" and its "COTIZACIONES PARA CLIENTE" child.
  { stage: 'quotation', phrases: ['cotizacion del espacio'] },
  // "05 CRONOGRAMA DE OBRA" and "07_ FOTOGRAFIAS DE OBRA Y AVANCE": the build, not the drawings.
  { stage: 'execution', phrases: ['cronograma de obra', 'fotografias de obra y avance'] },
  // "08 DOCUMENTACION IMPORTANTE", "09 CONSIGNACIONES", and the plurals the singular keywords miss
  // ("PAGOS", "FACTURAS"). "informes" is CARTAGENA's and SPORTI's folder of conciliation notices,
  // extra-cost reports and handover reports: paperwork, so admin.
  { stage: 'admin', phrases: ['documentacion importante', 'consignaciones', 'pagos', 'facturas', 'informes', 'informe'] },
  // "CERTIFICADOS Y GARANTIAS": what the client is handed at the end.
  { stage: 'delivery', phrases: ['certificados y garantias', 'garantias', 'certificados'] },
  // --- Folders of the featured project (prompt 0017) ----------------------------------------------
  { stage: 'quotation', phrases: ['propuesta economica', 'cotizacion', 'cotizaciones', 'presupuesto'] },
  { stage: 'procurement', phrases: ['suppliers', 'supplier', 'proveedores', 'proveedor'] },
  { stage: 'admin', phrases: ['control financiero', 'contabilidad', 'documentos de aluzina', 'ingenieria de obra', 'financial status', 'cuentas de cobro', 'cuenta de cobro', 'contratos'] },
  { stage: 'survey', phrases: ['fotografias de espacio', 'fotografias del espacio', 'fotografia y video del espacio', 'fotos del espacio', 'planimetria existente', 'estado actual'] },
  { stage: 'execution', phrases: ['fotografias de obra', 'fotos de obra'] },
  { stage: 'design-development', phrases: ['3d obra', 'diseno interior imagenes', 'mobiliario', 'botanica', 'arte', 'domotica', 'modelos', 'iluminacion'] },
  { stage: 'concept', phrases: ['feng shui', 'presentation'] },
  { stage: 'delivery', phrases: ['cierre de proyecto', 'cierre', 'fotos finales'] },
  // --- What the rest of HOY's and SODIME's trees use (ar-22) --------------------------------------
  // HOY's "MANUAL DE MARCA" (BrandBook, logo, fuente) and "INFORMACION DISENO INTERIOR" are design
  // output; SODIME's "ARTES RIONEGRO" (logos, mailing, .ai artwork) is too. "RENOVACION" was left out
  // on purpose: it would have swallowed the quotation sitting in SODIME's renovation folder.
  // After `artes de corte` above, which stays technical.
  { stage: 'design-development', phrases: ['manual de marca', 'informacion diseno interior', 'artes'] },
  // Last of all: a folder that is only an image or video library is what the project publishes from -
  // HOY's "IMAGENES HOY" (105 files) and "IMAGENES DE ECOSISTEMA VIRTUAL", SODIME's "IMAGENES DE
  // SODIME", HOY's "VIDEOS". Everything more specific ("diseno interior imagenes", the survey photos,
  // the brand manual) has already matched above. Marketing is the honest bucket for an image library;
  // whether HOY's 105 dated photos are marketing or the final-photo record is a question for Justin.
  { stage: 'marketing', phrases: ['imagenes', 'imagen', 'videos', 'ecosistema virtual'] },
];

function classify(text: string): DeliveryStage | null {
  if (!text) return null;
  for (const rule of STAGE_PHRASES) if (rule.phrases.some((k) => hasWord(text, k))) return rule.stage;
  for (const rule of STAGE_RULES) {
    if (rule.stage === 'concept' && hasWord(text, 'render') && hasWord(text, 'propuesta')) return 'concept';
    if (rule.keywords.some((k) => hasWord(text, k))) return rule.stage;
  }
  return null;
}

/**
 * Stage of a file from its folder path (`"/"`-separated, without the file name) and its name.
 * Precedence: the deepest folder segment that classifies wins, then shallower segments, then the file name;
 * a folder called "PLANOS" files every render inside it under `technical`, because the studio's folders are
 * the founder's own ordering and the file name is only a hint. `other` when nothing matches.
 */
export function stageFor(relPath: string, name: string): DeliveryStage {
  const segments = relPath.split('/').map(normalize).filter(Boolean).reverse();
  for (const seg of segments) {
    const s = classify(seg);
    if (s) return s;
  }
  const fromName = classify(normalize(name.replace(/\.[a-z0-9]{1,5}$/i, '')));
  return fromName ?? 'other';
}

/**
 * The studio numbers its folders ("00_FENG SHUI", "03_PLANOS", "010_DOMOTICA", "1O_ARTE" with a letter O typo).
 * Leading number of one segment, parsed leniently: `1O` -> 10, `010` -> 10, `0_74` -> 0; no number -> 999.
 */
export function folderNumber(segment: string): number {
  const m = segment.trim().match(/^([0-9][0-9oO]*)(?=[_.\-\s]|$)/);
  if (!m) return 999;
  const n = Number(m[1].replace(/[oO]/g, '0'));
  return Number.isFinite(n) ? n : 999;
}

/** Sort key of a `folderPath` ("DISEÑO/03_PLANOS" -> [999, 3]); compare element by element, shorter first when equal. */
export function folderOrderKey(folderPath: string): number[] {
  return folderPath.split('/').filter(Boolean).map(folderNumber);
}

export function compareFolderPaths(a: string, b: string): number {
  const ka = folderOrderKey(a);
  const kb = folderOrderKey(b);
  for (let i = 0; i < Math.max(ka.length, kb.length); i++) {
    if (ka[i] === undefined) return -1;
    if (kb[i] === undefined) return 1;
    if (ka[i] !== kb[i]) return ka[i] - kb[i];
  }
  return a.localeCompare(b);
}

/** "03_PLANOS" -> "PLANOS", "1O_ARTE" -> "ARTE", "01 FOTOGRAFIA" -> "FOTOGRAFIA": strips the number prefix only, words stay as written. */
export function folderLabel(segment: string): string {
  const stripped = segment.trim().replace(/^[0-9][0-9oO]*[_.\-\s]+\s*/, '').trim();
  return stripped || segment.trim();
}

// ---------------------------------------------------------------------------------------------
// File types: the icon vocabulary
// ---------------------------------------------------------------------------------------------

export type FileType = 'pdf' | 'image' | 'vector' | 'presentation' | 'spreadsheet' | 'document' | 'cad' | 'model3d' | 'video' | 'audio' | 'archive' | 'folder' | 'other';

export const FILE_TYPES: readonly FileType[] = ['pdf', 'image', 'vector', 'presentation', 'spreadsheet', 'document', 'cad', 'model3d', 'video', 'audio', 'archive', 'folder', 'other'];

const EXT_TO_TYPE: Record<string, FileType> = {
  pdf: 'pdf',
  jpg: 'image', jpeg: 'image', png: 'image', webp: 'image', gif: 'image', tif: 'image', tiff: 'image', heic: 'image', bmp: 'image',
  ai: 'vector', eps: 'vector', svg: 'vector', psd: 'vector', indd: 'vector',
  pptx: 'presentation', ppt: 'presentation', key: 'presentation',
  xlsx: 'spreadsheet', xls: 'spreadsheet', csv: 'spreadsheet', numbers: 'spreadsheet',
  docx: 'document', doc: 'document', pages: 'document', txt: 'document', md: 'document',
  dwg: 'cad', dxf: 'cad',
  skp: 'model3d', '3dm': 'model3d', max: 'model3d', blend: 'model3d', obj: 'model3d', fbx: 'model3d', rvt: 'model3d',
  mp4: 'video', mov: 'video', avi: 'video', mkv: 'video', webm: 'video',
  mp3: 'audio', wav: 'audio', m4a: 'audio',
  zip: 'archive', rar: 'archive', '7z': 'archive',
};

/** Extension (`pdf`, `.PDF`) or file name (`planta.dwg`) -> family; `folder` never comes from a name (callers pass it). */
export function fileTypeOf(extOrName: string): FileType {
  const raw = extOrName.trim().toLowerCase();
  const ext = raw.includes('.') ? raw.slice(raw.lastIndexOf('.') + 1) : raw;
  return EXT_TO_TYPE[ext] ?? 'other';
}

export const FILE_TYPE_LABELS: Record<FileType, Text> = {
  pdf: T('PDF', 'PDF'),
  image: T('Image', 'Imagen'),
  vector: T('Vector / layout', 'Vector / maquetación'),
  presentation: T('Presentation', 'Presentación'),
  spreadsheet: T('Spreadsheet', 'Hoja de cálculo'),
  document: T('Document', 'Documento'),
  cad: T('CAD drawing', 'Plano CAD'),
  model3d: T('3D model', 'Modelo 3D'),
  video: T('Video', 'Video'),
  audio: T('Audio', 'Audio'),
  archive: T('Compressed archive', 'Archivo comprimido'),
  folder: T('Folder', 'Carpeta'),
  other: T('File', 'Archivo'),
};

/** Which families the `DocumentViewer` can show in the page (the rest open at the source or download). */
export function isPreviewable(fileType: FileType): boolean {
  return fileType === 'pdf' || fileType === 'image' || fileType === 'video';
}

/** MIME type by extension for the families we store; `application/octet-stream` when unknown. */
export function mimeTypeOf(extOrName: string): string {
  const raw = extOrName.trim().toLowerCase();
  const ext = raw.includes('.') ? raw.slice(raw.lastIndexOf('.') + 1) : raw;
  const known: Record<string, string> = {
    pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', tif: 'image/tiff', tiff: 'image/tiff', heic: 'image/heic', bmp: 'image/bmp',
    svg: 'image/svg+xml', ai: 'application/postscript', eps: 'application/postscript', psd: 'image/vnd.adobe.photoshop', indd: 'application/x-indesign',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ppt: 'application/vnd.ms-powerpoint', key: 'application/vnd.apple.keynote',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', xls: 'application/vnd.ms-excel', csv: 'text/csv', numbers: 'application/vnd.apple.numbers',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', doc: 'application/msword', pages: 'application/vnd.apple.pages', txt: 'text/plain', md: 'text/markdown',
    dwg: 'image/vnd.dwg', dxf: 'image/vnd.dxf', skp: 'application/vnd.sketchup.skp', '3dm': 'model/vnd.3dm', obj: 'model/obj', fbx: 'application/octet-stream', max: 'application/octet-stream', blend: 'application/x-blender', rvt: 'application/octet-stream',
    mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo', mkv: 'video/x-matroska', webm: 'video/webm', mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4',
    zip: 'application/zip', rar: 'application/vnd.rar', '7z': 'application/x-7z-compressed',
  };
  return known[ext] ?? 'application/octet-stream';
}

// ---------------------------------------------------------------------------------------------
// Project heuristics from folder names
// ---------------------------------------------------------------------------------------------

const TYPE_RULES: readonly { type: ProjectType; keywords: readonly string[] }[] = [
  { type: 'lighting-product', keywords: ['iluminacion', 'luminaria', 'luminarias', 'lighting', 'lampara', 'lamparas'] },
  { type: 'hospitality', keywords: ['hotel', 'bar', 'pizza', 'pizzeria', 'cafe', 'heladeria', 'restaurante', 'airbnb', 'suites', 'spa', 'hostal', 'cocteleria'] },
  { type: 'residential', keywords: ['casa', 'apto', 'apartamento', 'apartaestudio', 'habitacion', 'finca', 'cabana', 'villa', 'residencia', 'penthouse'] },
  { type: 'wellness', keywords: ['consultorio', 'clinica', 'dental', 'camaras hiperbaricas', 'wellness', 'odontologia', 'estetica'] },
];

/** Heuristic project type from a folder name; `commercial` when nothing matches. The seed says so in the summary (inferred, to confirm). */
export function projectTypeFromName(name: string): ProjectType {
  const text = normalize(name);
  for (const rule of TYPE_RULES) if (rule.keywords.some((k) => hasWord(text, k))) return rule.type;
  return 'commercial';
}

/** Spanish tag for a project type (`tags[]` on archived projects; the tag registry carries the same names). */
export const PROJECT_TYPE_TAGS: Record<ProjectType, string> = {
  residential: 'residencial',
  commercial: 'comercial',
  hospitality: 'hospitalidad',
  wellness: 'bienestar',
  'lighting-product': 'iluminación',
};

/** "01_ CARTAGENA COPETRAN" -> "CARTAGENA COPETRAN"; "0_74 HOTEL" -> "HOTEL"; "010 CASA" -> "CASA". Leaves names that are only a number alone. */
export function stripNumberPrefix(name: string): string {
  const stripped = name.replace(/^\s*\d+(?:[_.\-]\d+)*[_.\-\s]+\s*/, '').trim();
  return stripped || name.trim();
}

/** ASCII kebab-case (`joe-gallina-interior`); with `stripPrefix` the leading number prefix goes first. */
export function slugify(s: string, stripPrefix = false): string {
  const base = stripPrefix ? stripNumberPrefix(s) : s;
  return base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * "JOE GALLINA INTERIOR" -> "Joe Gallina Interior". Connectors stay lower; a word stays in caps when it reads as an
 * acronym (no vowel, <= 4 letters: "KFC", "MDR"), carries digits or "&", or is a brand written in caps (`CAPS_WORDS`).
 */
const CAPS_WORDS = new Set(['HOY', 'SODIME', 'COASSIST', 'SPORTI']);
export function titleCase(name: string): string {
  const lower = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'en', 'para', 'por', 'con', 'a', 'the', 'of', 'and']);
  return name
    .trim()
    .split(/\s+/)
    .map((w, i) => {
      const l = w.toLowerCase();
      if (i > 0 && lower.has(l)) return l;
      if (CAPS_WORDS.has(w.toUpperCase()) && w === w.toUpperCase()) return w;
      if (/[0-9&]/.test(w)) return w;
      if (/^[A-Z]{2,4}$/.test(w) && !/[AEIOU]/.test(w)) return w;
      return l.charAt(0).toUpperCase() + l.slice(1);
    })
    .join(' ');
}

/** The year a folder or file name implies ("PROYECTOS 2024", "2019-2023" -> null: a range is not a year). */
export function yearOf(label: string): number | null {
  const m = label.match(/(?<![0-9-])((?:19|20)\d{2})(?![0-9-])/);
  return m ? Number(m[1]) : null;
}
