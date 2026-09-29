import { coreStrings } from '../i18n/core';
import { formatCop, formatDate } from '../i18n/format';
import { LEAD_CHANNELS, PIPELINE_STATUSES, PURCHASE_STATUSES, VALIDATION_STATUSES, type Text } from '../tenant/domain';
import { deskStrings } from './strings';

/**
 * Field and value labels of the desk drawers (moved from W-04's `deskFlow.ts` in D-106 so every desk shares them):
 * `rowFields()` turns a row into KeyValue items (amounts in `formatCop`, dates in `formatDate`, statuses in the
 * StatusPill vocabulary), `valueLabel()` names a status-like value in both languages.
 */

const T = (en: string, es: string): Text => ({ en, es });

/** `core.status.<id>` as Text (the StatusPill vocabulary); the id itself when there is no string. */
export function statusText(id: string): Text {
  const entry = coreStrings[`core.status.${id}`];
  if (!entry) return T(id, id);
  return typeof entry === 'string' ? T(entry, entry) : { en: entry.en, es: entry.es ?? entry.en };
}
export const purchaseStatus = (id: string) => PURCHASE_STATUSES.find((s) => s.id === id)?.label ?? statusText(id);
export const validationStatus = (id: string) => VALIDATION_STATUSES.find((s) => s.id === id)?.label ?? statusText(id);
export const pipelineLabel = (id: string) => PIPELINE_STATUSES.find((s) => s.id === id)?.label ?? statusText(id);
export const tx = (x: Text, lang: 'en' | 'es') => (lang === 'es' ? x.es ?? x.en : x.en);


/** Drawer labels for the schema's field names (the rest are humanised from camelCase). */
const FIELD_LABELS: Record<string, Text> = {
  projectId: T('Project', 'Proyecto'),
  supplierId: T('Supplier', 'Proveedor'),
  authorId: T('Author', 'Autor'),
  responsibleId: T('Responsible', 'Responsable'),
  requestedById: T('Requested by', 'Solicitado por'),
  ownerId: T('Owner', 'Responsable'),
  engagementId: T('Engagement', 'Servicio'),
  status: T('Status', 'Estado'),
  severity: T('Severity', 'Severidad'),
  reference: T('Reference', 'Referencia'),
  item: T('Item', 'Ítem'),
  quantity: T('Quantity', 'Cantidad'),
  priceCop: T('Price (COP)', 'Precio (COP)'),
  amountCop: T('Amount (COP)', 'Monto (COP)'),
  paidCop: T('Paid (COP)', 'Pagado (COP)'),
  extraCostCop: T('Extra cost (COP)', 'Costo adicional (COP)'),
  budgetCop: T('Budget (COP)', 'Presupuesto (COP)'),
  extraDays: T('Extra days', 'Días adicionales'),
  date: T('Date', 'Fecha'),
  at: T('At', 'Fecha'),
  dueDate: T('Due date', 'Vence'),
  paidDate: T('Paid on', 'Pagado el'),
  expectedDate: T('Expected', 'Esperada'),
  confirmedDate: T('Confirmed', 'Confirmada'),
  decidedAt: T('Decided', 'Decidido'),
  approvedAt: T('Approved', 'Aprobado'),
  startedAt: T('Started', 'Iniciado'),
  completedAt: T('Completed', 'Terminado'),
  startsAt: T('Starts', 'Empieza'),
  endsAt: T('Ends', 'Termina'),
  validUntil: T('Valid until', 'Válida hasta'),
  counterparty: T('Counterparty', 'Contraparte'),
  direction: T('Direction', 'Dirección'),
  concept: T('Concept', 'Concepto'),
  description: T('Description', 'Descripción'),
  reason: T('Reason', 'Motivo'),
  body: T('Message', 'Mensaje'),
  readBy: T('Read by', 'Leído por'),
  title: T('Title', 'Título'),
  kind: T('Kind', 'Tipo'),
  notes: T('Notes', 'Notas'),
  comment: T('Comment', 'Comentario'),
  stage: T('Stage', 'Etapa'),
  source: T('Source', 'Fuente'),
  progress: T('Progress (%)', 'Avance (%)'),
  decisions: T('Decisions', 'Decisiones'),
  problems: T('Problems', 'Problemas'),
  name: T('Name', 'Nombre'),
  client: T('Client', 'Cliente'),
  location: T('Location', 'Ubicación'),
  email: T('Email', 'Correo'),
  phone: T('Phone', 'Teléfono'),
  city: T('City', 'Ciudad'),
  category: T('Category', 'Categoría'),
  contactName: T('Contact', 'Contacto'),
  leadTimeDays: T('Lead time (days)', 'Tiempo de entrega (días)'),
  rating: T('Rating', 'Calificación'),
  comparisonGroup: T('Comparison group', 'Grupo de comparación'),
  forRole: T('For role', 'Para el rol'),
  leadDays: T('Days before', 'Días antes'),
  entity: T('Entity', 'Entidad'),
  entityId: T('Record', 'Registro'),
  board: T('Board', 'Tablero'),
  tags: T('Tags', 'Etiquetas'),
  palette: T('Palette', 'Paleta'),
  finish: T('Finish', 'Acabado'),
  color: T('Colour', 'Color'),
  unitCop: T('Unit price (COP)', 'Precio unitario (COP)'),
  itemCount: T('Items', 'Ítems'),
  audience: T('Audience', 'Destinatario'),
  viewCount: T('Views', 'Vistas'),
  slot: T('Slot', 'Cupo'),
  organiser: T('Organiser', 'Organizador'),
  submissionDate: T('Submission', 'Entrega'),
  project: T('Project', 'Proyecto'),
  result: T('Result', 'Resultado'),
  slideCount: T('Slides', 'Diapositivas'),
  format: T('Format', 'Formato'),
  assetVersion: T('Edition', 'Edición'),
  path: T('Path', 'Ruta'),
  ownerRole: T('Owner role', 'Rol responsable'),
  docVersion: T('Revision', 'Revisión'),
  url: T('Link', 'Enlace'),
  type: T('Type', 'Tipo'),
  phase: T('Phase', 'Fase'),
  serviceCode: T('Service', 'Servicio'),
  pipelineStatus: T('Pipeline status', 'Estado del pipeline'),
  creativeDirection: T('Creative direction', 'Dirección creativa'),
  approval: T('Approval', 'Aprobación'),
  leadDesignerId: T('Lead designer', 'Diseñadora líder'),
  startDate: T('Start', 'Inicio'),
  summary: T('Summary', 'Resumen'),
  fileCount: T('Files', 'Archivos'),
  year: T('Year', 'Año'),
  priority: T('Priority', 'Prioridad'),
  assigneeId: T('Assignee', 'Asignado a'),
  createdById: T('Created by', 'Creado por'),
  subtasks: T('Subtasks', 'Subtareas'),
  dependsOn: T('Depends on', 'Depende de'),
  sectionId: T('Section', 'Sección'),
  order: T('Order', 'Orden'),
  attendeeIds: T('Attendees', 'Asistentes'),
  requestedService: T('Requested service', 'Servicio solicitado'),
  suggestedService: T('Suggested service', 'Servicio sugerido'),
  channel: T('Channel', 'Canal'),
  areaM2: T('Area (m²)', 'Área (m²)'),
  projectStatus: T('Project status', 'Estado de la obra'),
  desiredStart: T('Desired start', 'Inicio deseado'),
  qualification: T('Qualification', 'Calificación'),
  currentPhaseId: T('Current phase', 'Fase actual'),
  checks: T('Checklist', 'Lista de verificación'),
  brief: T('Brief', 'Brief'),
  sector: T('Sector', 'Sector'),
  projectIds: T('Projects', 'Proyectos'),
  typicalDays: T('Typical days', 'Días típicos'),
  requiredFor: T('Required for', 'Requerido para'),
  vendor: T('Vendor', 'Proveedor'),
  usedFor: T('Used for', 'Se usa para'),
  replacedByModule: T('Replaced by', 'Reemplazado por'),
  slug: T('Slug', 'Slug'),
  parentId: T('Parent', 'Padre'),
  visibility: T('Visibility', 'Visibilidad'),
  archived: T('Archived', 'Archivado'),
  pinned: T('Pinned', 'Fijado'),
  titleEs: T('Title (Spanish)', 'Título (español)'),
  mimeType: T('File type', 'Tipo de archivo'),
  bytes: T('Size (bytes)', 'Tamaño (bytes)'),
  pageCount: T('Pages', 'Páginas'),
  pageNumber: T('Page', 'Página'),
  publishedAt: T('Published', 'Publicado'),
  language: T('Language', 'Idioma'),
  textExcerpt: T('Excerpt', 'Extracto'),
  folderPath: T('Folder', 'Carpeta'),
  checkedById: T('Checked by', 'Revisado por'),
  items: T('Items', 'Ítems'),
  note: T('Note', 'Nota'),
  summaryEs: T('Summary (Spanish)', 'Resumen (español)'),
  // Added in changelog 0038 (QA 0008 D1): the columns and action params that fell back to English in Spanish.
  projectType: T('Project type', 'Tipo de proyecto'),
  aboutType: T('About (kind)', 'Sobre (tipo)'),
  aboutId: T('About (record)', 'Sobre (registro)'),
  actorId: T('By', 'Por'),
  archiveSlug: T('Archive folder', 'Carpeta del archivo'),
  clientUserId: T('Client user', 'Usuario cliente'),
  coverAssetId: T('Cover', 'Portada'),
  coverUrl: T('Cover', 'Portada'),
  deliverableId: T('Deliverable', 'Entregable'),
  done: T('Done', 'Hecho'),
  externalId: T('External id', 'Id externo'),
  field: T('Field', 'Campo'),
  fileTypes: T('File types', 'Tipos de archivo'),
  fonts: T('Fonts', 'Tipografías'),
  from: T('From', 'De'),
  fromId: T('From (record)', 'De (registro)'),
  fromType: T('From (kind)', 'De (tipo)'),
  to: T('To', 'A'),
  toId: T('To (record)', 'A (registro)'),
  toType: T('To (kind)', 'A (tipo)'),
  glyph: T('Glyph', 'Glifo'),
  imageUrl: T('Image', 'Imagen'),
  label: T('Label', 'Etiqueta'),
  materialsFolder: T('Materials folder', 'Carpeta de materiales'),
  ok: T('OK', 'Correcto'),
  parentTaskId: T('Parent task', 'Tarea padre'),
  photoUrls: T('Photos', 'Fotos'),
  postId: T('Post', 'Publicación'),
  previewUrls: T('Previews', 'Vistas previas'),
  repoPath: T('Repository path', 'Ruta en el repositorio'),
  resolutionDue: T('Resolve by', 'Resolver antes de'),
  sourceFileId: T('Source file', 'Archivo de origen'),
  sourceFolderUrl: T('Source folder', 'Carpeta de origen'),
  sourceName: T('Source', 'Origen'),
  sourceUrl: T('Source link', 'Enlace de origen'),
  spaceId: T('Space', 'Espacio'),
  supersedesId: T('Replaces', 'Reemplaza'),
  templateDocKind: T('Template kind', 'Tipo de plantilla'),
  templateTaskId: T('Template task', 'Tarea de plantilla'),
  thumbnailUrl: T('Thumbnail', 'Miniatura'),
  tone: T('Tone', 'Tono'),
  // Lead dossier fields (D-108).
  portraitUrl: T('Photo', 'Foto'),
  logoUrl: T('Logo', 'Logo'),
  company: T('Company', 'Empresa'),
  socials: T('Social profiles', 'Perfiles sociales'),
  // Params of page actions an ability may still need (the refusal line names them).
  question: T('Question', 'Pregunta'),
  answer: T('Answer', 'Respuesta'),
  owner: T('Owner', 'Responsable'),
  of: T('Of', 'De'),
  cost: T('Cost', 'Costo'),
  days: T('Days', 'Días'),
  supplier: T('Supplier', 'Proveedor'),
  price: T('Price', 'Precio'),
  amount: T('Amount', 'Monto'),
  text: T('Text', 'Texto'),
  space: T('Space', 'Espacio'),
  target: T('Target', 'Destino'),
  post: T('Post', 'Publicación'),
  person: T('Person', 'Persona'),
  start: T('Start', 'Inicio'),
  due: T('Due', 'Vence'),
  group: T('Group', 'Grupo'),
  deliverable: T('Deliverable', 'Entregable'),
  created_at: T('Created', 'Creado'),
  updated_at: T('Updated', 'Actualizado'),
};
const humanise = (key: string) => {
  const words = key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};
export const fieldLabel = (key: string, lang: 'en' | 'es') => (FIELD_LABELS[key] ? tx(FIELD_LABELS[key], lang) : humanise(key));

/** Fields of a row for the drawer's KeyValue list (base columns other than the dates are left out). */
export function rowFields(row: Record<string, unknown>, lang: 'en' | 'es'): { field: string; key: string; value: string }[] {
  const skip = new Set(['tenant_id', 'version', 'updated_by', 'id']);
  return Object.entries(row)
    .filter(([k]) => !skip.has(k))
    .map(([k, v]) => {
      let value: string;
      if (v === null || v === undefined || v === '') value = '—';
      else if (typeof v === 'number' && /Cop$/.test(k)) value = formatCop(v, lang);
      else if ((k === 'status' || k === 'severity') && typeof v === 'string') value = tx(k === 'status' && PURCHASE_STATUSES.some((x) => x.id === v) && 'priceCop' in row ? purchaseStatus(v) : VALIDATION_STATUSES.some((x) => x.id === v) ? validationStatus(v) : valueLabel(v), lang);
      else if (/^(pipelineStatus|kind|type|phase|priority|projectType|projectStatus|source|channel|aboutType|fromType|toType|direction|visibility)$/.test(k) && typeof v === 'string') value = tx(valueLabel(v), lang);
      else if (typeof v === 'boolean') value = tx(v ? T('Yes', 'Sí') : T('No', 'No'), lang);
      else if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) value = /T/.test(v) ? `${formatDate(v, lang)} ${v.slice(11, 16)}` : formatDate(v, lang);
      else if (Array.isArray(v)) value = v.length ? (v.every((x) => typeof x !== 'object') ? v.map(String).join(', ') : String(v.length)) : '—';
      else if (typeof v === 'object') {
        const entries = Object.entries(v as Record<string, unknown>);
        if (entries.length === 0) value = '—';
        else if (entries.every(([, x]) => typeof x === 'boolean')) value = `${entries.filter(([, x]) => x).length} / ${entries.length}`;
        else {
          const text = entries.map(([ek, x]) => `${ek}: ${String(x)}`).join(' · ');
          value = text.length > 220 ? `${text.slice(0, 219)}…` : text;
        }
      }
      else value = String(v);
      return { field: k, key: fieldLabel(k, lang), value };
    });
}

/** A status-like value (a status, a kind, a stage) in both languages: the StatusPill strings, the playbook status sets, the desk's own value table, else the value as data. */
export function valueLabel(value: string): Text {
  const core = coreStrings[`core.status.${value}`];
  if (core) return typeof core === 'string' ? T(core, core) : { en: core.en, es: core.es ?? core.en };
  const set = PIPELINE_STATUSES.find((s) => s.id === value) ?? PURCHASE_STATUSES.find((s) => s.id === value) ?? VALIDATION_STATUSES.find((s) => s.id === value);
  if (set) return set.label;
  const channel = LEAD_CHANNELS.find((c) => c.id === value);
  if (channel) return channel.label;
  const own = deskStrings[`desk.value.${value}`];
  if (own) return typeof own === 'string' ? T(own, own) : { en: own.en, es: own.es ?? own.en };
  return T(value, value);
}
