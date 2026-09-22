import { useMemo, useState } from 'react';
import { useRegisterActions } from '../../actions';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Thumb } from '../../components/molecule/Thumb/Thumb';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useData, useTable } from '../../data/DataContext';
import type { ClientKind, Project, ProjectType } from '../../data/schema';
import { PIPELINE_STATUSES, lifecycle, lifecycleOf, pick, type PipelineStatusId, type Text } from '../../domain';
import { useT } from '../../i18n/I18nProvider';
import './archiveReview.css';
import './founder.css';
import { PROJECT_TYPES } from './pipelineData';
import { archiveReviewSpec } from './specs';

/**
 * The sentence `seed/archive.ts` writes into every archived project's summary (D-060). Confirming a row
 * removes exactly this sentence and keeps the rest of the summary (the folder line and its notes).
 */
const INFERRED_SENTENCE = 'Tipo y estado inferidos de la carpeta; confirmar con la fundadora.';
const ARCHIVE_TAG = 'archive';
const CONFIRMED_TAG = 'confirmado';
const DUPLICATE_TAG = 'duplicado';
const UNKNOWN_CLIENT = 'unknown';
/** `Select` value that opens the "new client" drawer instead of writing a name. */
const NEW_CLIENT = '__new__';
const CLIENT_KINDS: readonly ClientKind[] = ['past', 'current', 'prospect'];

const T = (en: string, es: string): Text => ({ en, es });

interface Filters {
  q: string;
  year: string;
  type: string;
  status: string;
  pendingOnly: boolean;
  duplicatesOnly: boolean;
}

const DEFAULT_FILTERS: Filters = { q: '', year: '', type: '', status: '', pendingOnly: true, duplicatesOnly: false };

/**
 * The eleven things the intake inferred and could not decide (changelog 0019 section H, D-060). They live
 * here as a constant, not read from the changelog file: the numbered changelog is history and never changes,
 * while this list shrinks as Alejandra answers. `apply` points each question at the rows it is about.
 */
const OPEN_QUESTIONS: readonly { n: number; text: Text; apply?: Partial<Filters>; applyLabel?: Text }[] = [
  {
    n: 1,
    text: T(
      'Project type per folder (residential / commercial / hospitality / wellness / lighting): inferred from words in the folder name; 137 folders landed on "commercial" as the default.',
      'Tipo de proyecto por carpeta (residencial / comercial / hospitalidad / bienestar / iluminación): inferido de las palabras del nombre; 137 carpetas quedaron en "comercial" por defecto.',
    ),
    apply: { type: 'commercial' },
    applyLabel: T('Show the commercial folders', 'Ver las carpetas comerciales'),
  },
  {
    n: 2,
    text: T(
      'Status: are the 18 folders of PROYECTOS 2026 really in progress (contracted)? Are the 166 older folders closed, or are some still open (BROOKLING PIZZA 2022 has files from Aug 2025, PAMPAS ROOM STARTER from May 2024)?',
      'Estado: ¿las 18 carpetas de PROYECTOS 2026 están de verdad en curso (contratadas)? ¿Las 166 carpetas anteriores están cerradas, o algunas siguen abiertas (BROOKLING PIZZA 2022 tiene archivos de agosto 2025, PAMPAS ROOM STARTER de mayo 2024)?',
    ),
    apply: { status: 'contracted' },
    applyLabel: T('Show the folders marked in progress', 'Ver las carpetas marcadas en curso'),
  },
  {
    n: 3,
    text: T(
      'Quotation-only folders as prospects: COTIZACION HELADERIA (2022) and 011 COTIZACION LUMINARIA CORAZON (2025) — were they won, lost or are they still open?',
      'Carpetas que son solo cotización, tratadas como prospectos: COTIZACION HELADERIA (2022) y 011 COTIZACION LUMINARIA CORAZON (2025): ¿se ganaron, se perdieron o siguen abiertas?',
    ),
    apply: { status: 'proposal-sent' },
    applyLabel: T('Show the quotation folders', 'Ver las carpetas de cotización'),
  },
  {
    n: 4,
    text: T(
      'Clients: only SODIME, COASSIST, HOY and SPORTI matched an existing client row; 180 projects carry "unknown". Which folder names are client names to create, and which are locations or internal work (0_76 OFICINA ALUZINA, Proteccion Anticontagio ALUZINA, 026 CURSOS DE INTELIGENCIA ARTIFICIAL)?',
      'Clientes: solo SODIME, COASSIST, HOY y SPORTI coincidieron con un cliente existente; 180 proyectos quedaron en "unknown". ¿Qué nombres de carpeta son clientes por crear y cuáles son ubicaciones o trabajo interno (0_76 OFICINA ALUZINA, Proteccion Anticontagio ALUZINA, 026 CURSOS DE INTELIGENCIA ARTIFICIAL)?',
    ),
    apply: { q: 'unknown' },
    applyLabel: T('Show the projects without a client', 'Ver los proyectos sin cliente'),
  },
  {
    n: 5,
    text: T(
      'Duplicates and continuations across year folders: SODIME 2020 / 2026, COASSIST 2020 / 2021, EL ENCANTO 2024 / 2025, SANTIAGO AGUIRRE root / 2025, SIMON CALERA 2024 / 2026, ALMA PRANA 2025 / 2026, UPPER TRIP 2021 / 2024, VILLA VERDE 2021 / 2024, SHABELA 2021 / 2022, BONNY 2019-2023 / 2021 / 2025, NATHALY KENEDY 2024 / 2025, CASA JORGE Y LIGIA / LIGIA Y JORGE, EL SILENCIO DE LOS PAJAROS 2024 / 2025, APTO PAOLA 2021 / 2022, HONEY VALLEY 2026 / DESARROLLO DE ILUMINACION 2024.',
      'Duplicados y continuaciones entre carpetas de año: SODIME 2020 / 2026, COASSIST 2020 / 2021, EL ENCANTO 2024 / 2025, SANTIAGO AGUIRRE raíz / 2025, SIMON CALERA 2024 / 2026, ALMA PRANA 2025 / 2026, UPPER TRIP 2021 / 2024, VILLA VERDE 2021 / 2024, SHABELA 2021 / 2022, BONNY 2019-2023 / 2021 / 2025, NATHALY KENEDY 2024 / 2025, CASA JORGE Y LIGIA / LIGIA Y JORGE, EL SILENCIO DE LOS PAJAROS 2024 / 2025, APTO PAOLA 2021 / 2022, HONEY VALLEY 2026 / DESARROLLO DE ILUMINACION 2024.',
    ),
    apply: { duplicatesOnly: true },
    applyLabel: T('Show the flagged folders', 'Ver las carpetas señaladas'),
  },
  {
    n: 6,
    text: T(
      'Years: the 14 projects of the 2019-2023 folder have no year (their files are dated 2023-2024); LIFE VIOLETA VILLA was inferred as 2019 from its oldest file. Is JOE GALLINA INTERIOR a 2023 project?',
      'Años: los 14 proyectos de la carpeta 2019-2023 no tienen año (sus archivos son de 2023-2024); LIFE VIOLETA VILLA se infirió 2019 por su archivo más antiguo. ¿JOE GALLINA INTERIOR es un proyecto de 2023?',
    ),
    apply: { year: 'none' },
    applyLabel: T('Show the projects without a year', 'Ver los proyectos sin año'),
  },
  {
    n: 7,
    text: T(
      'Container folders: PROYECTOS ALUZINA 2020 GRAFICOS and PROYECTOS 2021 SEGUNDO SEMESTRE look like groupings, not projects.',
      'Carpetas contenedoras: PROYECTOS ALUZINA 2020 GRAFICOS y PROYECTOS 2021 SEGUNDO SEMESTRE parecen agrupaciones, no proyectos.',
    ),
    apply: { q: 'PROYECTOS' },
    applyLabel: T('Show those folders', 'Ver esas carpetas'),
  },
  {
    n: 8,
    text: T(
      'Empty folders (3 after the re-crawl): work kept elsewhere, or folders opened ahead of the project?',
      'Carpetas vacías (3 tras volver a recorrer el Dropbox): ¿el trabajo está en otro lado o son carpetas abiertas antes del proyecto?',
    ),
  },
  {
    n: 9,
    text: T(
      'Featured project: PRESENTACION TRONCAL (1).pptx (a 2024 university presentation) looks misfiled, and the two 52-page presentations look like the same document re-exported. Is "Altos de la Toja 402" the name to use in the portfolio?',
      'Proyecto destacado: PRESENTACION TRONCAL (1).pptx (una presentación universitaria de 2024) parece mal archivada, y las dos presentaciones de 52 páginas parecen el mismo documento reexportado. ¿"Altos de la Toja 402" es el nombre para el portafolio?',
    ),
    apply: { q: 'JOE GALLINA' },
    applyLabel: T('Show the featured project', 'Ver el proyecto destacado'),
  },
  {
    n: 10,
    text: T(
      'Redaction choices (D-059): folder names with people\'s names stay as identifiers (MARTA OVIEDO BAÑO SOCIAL, 03_ANDRES Y ANDREA) and supplier company names stay. Anything else to redact, or to show again (the delivery form, the feng shui report) once the site is behind sign-in?',
      'Decisiones de redacción (D-059): los nombres de carpeta con nombres de personas se mantienen como identificadores (MARTA OVIEDO BAÑO SOCIAL, 03_ANDRES Y ANDREA) y los nombres de empresas proveedoras también. ¿Hay algo más para ocultar, o para volver a mostrar (el acta de entrega, el informe de feng shui) cuando el sitio tenga ingreso con clave?',
    ),
  },
  {
    n: 11,
    text: T(
      'Link D (00 INFORMACION RELEVANTE ALUZINA 2023): price lists, catalogues, brochures and presentations, kept as company assets for G-08. Which of them are current?',
      'Enlace D (00 INFORMACION RELEVANTE ALUZINA 2023): listas de precios, catálogos, brochures y presentaciones, guardados como material de la empresa para G-08. ¿Cuáles siguen vigentes?',
    ),
  },
];

/** Every sentence of the summary except the folder line and the inferred sentence: the intake's notes. */
function noteOf(project: Project): string {
  return project.summary
    .split(/(?<=\.)\s+/)
    .slice(1)
    .filter((s) => s.trim() !== INFERRED_SENTENCE)
    .join(' ')
    .trim();
}

/** Removes the inferred sentence and keeps the rest of the summary (no schema change: confirmation is a tag + this edit). */
function stripInferred(summary: string): string {
  return summary.split(INFERRED_SENTENCE).join(' ').replace(/\s{2,}/g, ' ').trim();
}

const isConfirmed = (p: Project) => p.tags.includes(CONFIRMED_TAG);
/** A row the founder should look at twice: the crawler saw the same name in another year, or it left a note. */
const isFlagged = (p: Project) => /posible duplicado|duplicado de/i.test(p.summary) || noteOf(p) !== '';

/**
 * A-09 Archive review: the inferred facts of the project archive (D-060, changelog 0019 section H) are
 * confirmed or corrected here, in the product, one row at a time or in bulk — never in a chat. Type,
 * status, client and year are inline edits on the archived `projects` rows; "Confirm" adds the tag
 * `confirmado` and removes the "inferido" sentence from the summary; "Mark as duplicate of…" records a
 * `replaces` relation. Every write carries `basedOn` (D-024).
 */
export function ArchiveReviewPage() {
  const { t, lang } = useT();
  const data = useData();
  const { rows: projects, loading } = useTable('projects', { orderBy: 'name' });
  const { rows: clients } = useTable('clients', { orderBy: 'name' });
  const { rows: relations } = useTable('relations');

  const [f, setF] = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<string[]>([]);
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [clientFor, setClientFor] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: '', kind: 'past' as ClientKind, sector: '' });

  const archived = useMemo(() => projects.filter((p) => p.tags.includes(ARCHIVE_TAG)), [projects]);

  const years = useMemo(
    () => [...new Set(archived.map((p) => p.year).filter((y): y is number => y !== null))].sort((a, b) => b - a),
    [archived],
  );

  const rows = useMemo(
    () =>
      archived.filter((p) => {
        const needle = f.q.trim().toLowerCase();
        if (needle && !`${p.name} ${p.client} ${p.summary}`.toLowerCase().includes(needle)) return false;
        if (f.year === 'none' ? p.year !== null : f.year && String(p.year) !== f.year) return false;
        if (f.type && p.type !== f.type) return false;
        if (f.status && p.pipelineStatus !== f.status) return false;
        if (f.pendingOnly && isConfirmed(p)) return false;
        if (f.duplicatesOnly && !isFlagged(p)) return false;
        return true;
      }),
    [archived, f],
  );

  const counts = useMemo(() => {
    const confirmed = archived.filter(isConfirmed).length;
    return { total: archived.length, confirmed, pending: archived.length - confirmed, flagged: archived.filter(isFlagged).length };
  }, [archived]);

  const shownIds = rows.map((p) => p.id);
  const allShownSelected = shownIds.length > 0 && shownIds.every((id) => selected.includes(id));
  const toggleRow = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAllShown = () => setSelected((s) => (allShownSelected ? s.filter((id) => !shownIds.includes(id)) : [...new Set([...s, ...shownIds])]));

  const typeOptions = PROJECT_TYPES.map((v) => ({ value: v, label: t(`founder.type.${v}`) }));
  const statusOptions = PIPELINE_STATUSES.map((s) => ({ value: s.id, label: pick(s.label, lang) }));
  const clientOptions = [
    { value: UNKNOWN_CLIENT, label: t('founder.review.unknownClient') },
    ...clients.map((c) => ({ value: c.name, label: c.name })),
    { value: NEW_CLIENT, label: t('founder.review.newClient') },
  ];

  // ------------------------------------------------------------------ writes (every one carries basedOn, D-024)

  /** The stored row, never the copy this render was built from (a voice call or another tab may be ahead). */
  const stored = async (v: unknown): Promise<Project | null> => {
    const id = String(v ?? '');
    return id ? data.get('projects', id) : null;
  };

  const setType = async (p: Project, type: string) => {
    await data.update('projects', p.id, { type: type as ProjectType }, { basedOn: p.updated_at });
    toast(t('founder.review.typeSet', { name: p.name, type: t(`founder.type.${type}`) }));
    return type;
  };

  const setStatus = async (p: Project, status: string) => {
    await data.update('projects', p.id, { pipelineStatus: status as PipelineStatusId }, { basedOn: p.updated_at });
    toast(t('founder.review.statusSet', { name: p.name, status: t(`core.status.${status}`) }));
    return status;
  };

  const setYear = async (p: Project, value: string) => {
    const n = Number(value);
    const year = value.trim() === '' || Number.isNaN(n) ? null : Math.trunc(n);
    await data.update('projects', p.id, { year }, { basedOn: p.updated_at });
    return year;
  };

  /** One `for-client` relation per project (D-026): the name on the row stays the display value. */
  const linkClient = async (project: Project, clientId: string) => {
    const already = relations.some((r) => r.fromType === 'projects' && r.fromId === project.id && r.toType === 'clients' && r.toId === clientId && r.kind === 'for-client');
    if (already) return;
    await data.create('relations', { fromType: 'projects', fromId: project.id, toType: 'clients', toId: clientId, kind: 'for-client', note: '' });
  };

  const setClient = async (p: Project, name: string) => {
    await data.update('projects', p.id, { client: name }, { basedOn: p.updated_at });
    const match = clients.find((c) => c.name === name);
    if (match) await linkClient(p, match.id);
    toast(t('founder.review.clientSet', { name: p.name, client: name }));
    return name;
  };

  const createClient = async (project: Project, name: string, kind: ClientKind, sector: string) => {
    const row = await data.create('clients', {
      name: name.trim(),
      kind,
      sector: sector.trim() || null,
      city: null,
      contactName: null,
      notes: '',
      projectIds: [project.id],
    });
    await data.update('projects', project.id, { client: row.name }, { basedOn: project.updated_at });
    await linkClient(project, row.id);
    toast(t('founder.review.clientCreated', { client: row.name }));
    return row;
  };

  const confirmOne = async (p: Project) => {
    const tags = p.tags.includes(CONFIRMED_TAG) ? p.tags : [...p.tags, CONFIRMED_TAG];
    await data.update('projects', p.id, { tags, summary: stripInferred(p.summary) }, { basedOn: p.updated_at });
    return p.name;
  };

  const confirmRow = async (p: Project) => {
    const name = await confirmOne(p);
    setSelected((s) => s.filter((id) => id !== p.id));
    toast(t('founder.review.confirmed', { name }));
    return name;
  };

  const confirmSelected = async () => {
    if (selected.length === 0) {
      toast(t('founder.review.nothingSelected'));
      return 0;
    }
    let n = 0;
    for (const id of selected) {
      const row = await data.get('projects', id);
      if (!row) continue;
      await confirmOne(row);
      n += 1;
    }
    setSelected([]);
    toast(t('founder.review.confirmedN', { n }));
    return n;
  };

  /** The kept project `replaces` the duplicate (D-026 relation kind), and the duplicate says so in its summary. */
  const markDuplicate = async (p: Project, ofId: string) => {
    const of = archived.find((x) => x.id === ofId) ?? (await data.get('projects', ofId));
    if (!of || of.id === p.id) return t('founder.review.notFound');
    const line = `Duplicado de ${of.name} (${of.id}).`;
    const tags = p.tags.includes(DUPLICATE_TAG) ? p.tags : [...p.tags, DUPLICATE_TAG];
    const summary = p.summary.includes(line) ? p.summary : `${p.summary} ${line}`.trim();
    await data.update('projects', p.id, { tags, summary }, { basedOn: p.updated_at });
    const already = relations.some((r) => r.fromType === 'projects' && r.fromId === of.id && r.toType === 'projects' && r.toId === p.id && r.kind === 'replaces');
    if (!already) await data.create('relations', { fromType: 'projects', fromId: of.id, toType: 'projects', toId: p.id, kind: 'replaces', note: line });
    toast(t('founder.review.markedDuplicate', { name: p.name, of: of.name }));
    return { project: p.id, of: of.id };
  };

  const openClientForm = (p: Project) => {
    setClientFor(p.id);
    setDraft({ name: p.name, kind: 'past', sector: '' });
  };

  const submitClient = async () => {
    const project = clientFor ? await data.get('projects', clientFor) : null;
    if (!project || !draft.name.trim()) {
      toast(t('founder.review.nameRequired'));
      return;
    }
    await createClient(project, draft.name, draft.kind, draft.sector);
    setClientFor(null);
  };

  // ------------------------------------------------------------------ actions (P-05, D-036)

  useRegisterActions({
    'founder.confirmProject': async (p) => {
      const row = await stored(p?.project);
      return row ? confirmRow(row) : t('founder.review.notFound');
    },
    'founder.setProjectType': async (p) => {
      const row = await stored(p?.project);
      return row ? setType(row, String(p?.type ?? row.type)) : t('founder.review.notFound');
    },
    'founder.setProjectStatus': async (p) => {
      const row = await stored(p?.project);
      return row ? setStatus(row, String(p?.status ?? row.pipelineStatus)) : t('founder.review.notFound');
    },
    'founder.setProjectClient': async (p) => {
      const row = await stored(p?.project);
      return row ? setClient(row, String(p?.client ?? UNKNOWN_CLIENT)) : t('founder.review.notFound');
    },
    'founder.setProjectYear': async (p) => {
      const row = await stored(p?.project);
      return row ? setYear(row, String(p?.year ?? '')) : t('founder.review.notFound');
    },
    'founder.markDuplicate': async (p) => {
      const row = await stored(p?.project);
      return row ? markDuplicate(row, String(p?.of ?? '')) : t('founder.review.notFound');
    },
    'founder.createClient': async (p) => {
      const row = clientFor ? await data.get('projects', clientFor) : null;
      const name = String(p?.name ?? draft.name);
      if (!row || !name.trim()) return t('founder.review.nameRequired');
      const created = await createClient(row, name, (String(p?.kind ?? draft.kind) as ClientKind) || 'past', draft.sector);
      setClientFor(null);
      return created.name;
    },
    'founder.confirmSelected': () => confirmSelected(),
  });

  // ------------------------------------------------------------------ render

  const clientForRow = clientFor ? archived.find((p) => p.id === clientFor) ?? null : null;

  return (
    <div className="founder-page">
      <PageHeader
        code={archiveReviewSpec.code}
        title={t('founder.review.title')}
        subtitle={t('founder.review.desc')}
        breadcrumb={[{ label: t('founder.nav.home'), to: '/founder' }, { label: t('founder.review.title') }]}
        actions={
          <Button variant="secondary" onClick={() => setQuestionsOpen((v) => !v)} aria-expanded={questionsOpen}>
            {questionsOpen ? t('founder.review.hideQuestions') : t('founder.review.showQuestions')}
          </Button>
        }
      />

      <ul className="founder-stats founder-stats--compact">
        <li>
          <StatTile label={t('founder.review.stat.total')} value={counts.total} glyph="▤" />
        </li>
        <li>
          <StatTile label={t('founder.review.stat.confirmed')} value={counts.confirmed} glyph="✓" tone="success" />
        </li>
        <li>
          <StatTile label={t('founder.review.stat.pending')} value={counts.pending} glyph="◌" tone={counts.pending > 0 ? 'warning' : 'neutral'} />
        </li>
        <li>
          <StatTile label={t('founder.review.stat.flagged')} value={counts.flagged} hint={t('founder.review.stat.flaggedHint')} glyph="⧉" tone="info" />
        </li>
      </ul>

      {questionsOpen && (
        <Card title={t('founder.review.questions')} subtitle={t('founder.review.questionsDesc')}>
          <ol className="arev-questions">
            {OPEN_QUESTIONS.map((q) => (
              <li key={q.n}>
                <p className="arev-questions__text">{pick(q.text, lang)}</p>
                {q.apply && q.applyLabel && (
                  <Button variant="ghost" size="sm" onClick={() => setF({ ...DEFAULT_FILTERS, ...q.apply })}>
                    {pick(q.applyLabel, lang)}
                  </Button>
                )}
              </li>
            ))}
          </ol>
        </Card>
      )}

      <FilterBar onClear={() => setF(DEFAULT_FILTERS)} summary={t('founder.review.summary', { n: rows.length, total: counts.total })}>
        <SearchField value={f.q} onChange={(q) => setF({ ...f, q })} />
        <Select
          label={t('founder.review.year')}
          value={f.year}
          onChange={(e) => setF({ ...f, year: e.target.value })}
          placeholder={t('founder.common.all')}
          options={[{ value: 'none', label: t('founder.review.noYear') }, ...years.map((y) => ({ value: String(y), label: String(y) }))]}
        />
        <Select label={t('founder.common.type')} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} placeholder={t('founder.common.all')} options={typeOptions} />
        <Select label={t('founder.common.status')} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} placeholder={t('founder.common.all')} options={statusOptions} />
        <Checkbox label={t('founder.review.pendingOnly')} checked={f.pendingOnly} onChange={(e) => setF({ ...f, pendingOnly: e.target.checked })} />
        <Checkbox label={t('founder.review.duplicatesOnly')} checked={f.duplicatesOnly} onChange={(e) => setF({ ...f, duplicatesOnly: e.target.checked })} />
      </FilterBar>

      <div className="arev-bulk">
        <Checkbox label={t('founder.review.selectAll')} checked={allShownSelected} onChange={toggleAllShown} disabled={shownIds.length === 0} />
        <Button variant="primary" onClick={() => void confirmSelected()} disabled={selected.length === 0}>
          {t('founder.review.confirmSelected', { n: selected.length })}
        </Button>
      </div>

      <div className="arev-table">
        <DataTable<Project>
          caption={t('founder.review.title')}
          rows={rows}
          rowKey={(p) => p.id}
          loading={loading}
          emptyTitle={t('founder.review.empty')}
          emptyDescription={t('founder.review.emptyDesc')}
          columns={[
            {
              key: 'name',
              header: t('founder.common.project'),
              sortable: true,
              render: (p) => (
                <span className="arev-project">
                  <Checkbox className="arev-check" label={t('founder.review.selectRow', { name: p.name })} checked={selected.includes(p.id)} onChange={() => toggleRow(p.id)} />
                  <Thumb className="arev-project__thumb" src={p.coverUrl} alt={p.name} type={p.fileTypes[0] ?? 'folder'} ratio="4:3" size="sm" />
                  <span className="arev-project__text">
                    <span className="arev-project__name">{p.name}</span>
                    <span className="arev-project__meta">
                      {p.year ?? t('founder.review.noYear')} · {p.fileCount ?? 0} {t('founder.review.files')}
                    </span>
                    <span className="arev-project__row">
                      {isConfirmed(p) && <Badge tone="success">{t('founder.review.confirmedTag')}</Badge>}
                      {p.sourceFolderUrl && (
                        <Button variant="ghost" size="sm" href={p.sourceFolderUrl} external>
                          {t('founder.review.openDropbox')}
                        </Button>
                      )}
                    </span>
                  </span>
                </span>
              ),
            },
            {
              key: 'type',
              header: t('founder.review.col.type'),
              sortable: true,
              render: (p) => (
                <Select
                  className="arev-field"
                  hideLabel
                  label={t('founder.review.typeFor', { name: p.name })}
                  value={p.type}
                  onChange={(e) => void setType(p, e.target.value)}
                  options={typeOptions}
                />
              ),
            },
            {
              key: 'pipelineStatus',
              header: t('founder.common.status'),
              sortable: true,
              render: (p) => (
                <span className="arev-status">
                  <Select
                    className="arev-field"
                    hideLabel
                    label={t('founder.review.statusFor', { name: p.name })}
                    value={p.pipelineStatus}
                    onChange={(e) => void setStatus(p, e.target.value)}
                    options={statusOptions}
                  />
                  <Badge tone="neutral">{pick(lifecycle(lifecycleOf(p.pipelineStatus))?.label ?? { en: '' }, lang)}</Badge>
                </span>
              ),
            },
            {
              key: 'client',
              header: t('founder.common.client'),
              sortable: true,
              render: (p) => (
                <Select
                  className="arev-field"
                  hideLabel
                  label={t('founder.review.clientFor', { name: p.name })}
                  value={clients.some((c) => c.name === p.client) ? p.client : UNKNOWN_CLIENT}
                  onChange={(e) => (e.target.value === NEW_CLIENT ? openClientForm(p) : void setClient(p, e.target.value))}
                  options={clientOptions}
                />
              ),
            },
            {
              key: 'year',
              header: t('founder.review.year'),
              sortable: true,
              sortValue: (p) => p.year ?? 0,
              width: '6rem',
              render: (p) => (
                <Input
                  className="arev-field arev-field--year"
                  hideLabel
                  label={t('founder.review.yearFor', { name: p.name })}
                  type="number"
                  inputMode="numeric"
                  min={2000}
                  max={2100}
                  defaultValue={p.year ?? ''}
                  key={`${p.id}-${p.year ?? ''}`}
                  onBlur={(e) => void setYear(p, e.target.value)}
                />
              ),
            },
            {
              key: 'note',
              header: t('founder.review.col.note'),
              render: (p) => <span className="arev-note">{noteOf(p) || '—'}</span>,
            },
            {
              key: 'actions',
              header: t('founder.review.col.actions'),
              render: (p) => (
                <span className="arev-rowactions">
                  <Button variant="primary" size="sm" onClick={() => void confirmRow(p)} disabled={isConfirmed(p)}>
                    {t('founder.review.confirm')}
                  </Button>
                  <Select
                    className="arev-field"
                    hideLabel
                    label={t('founder.review.duplicateFor', { name: p.name })}
                    value=""
                    onChange={(e) => e.target.value && void markDuplicate(p, e.target.value)}
                    placeholder={t('founder.review.markDuplicate')}
                    options={archived.filter((o) => o.id !== p.id).map((o) => ({ value: o.id, label: `${o.name}${o.year ? ` (${o.year})` : ''}` }))}
                  />
                </span>
              ),
            },
          ]}
        />
      </div>

      <Drawer open={clientFor !== null} onClose={() => setClientFor(null)} title={t('founder.review.newClientTitle')}>
        <form
          className="founder-stack"
          onSubmit={(e) => {
            e.preventDefault();
            void submitClient();
          }}
        >
          <p className="founder-note">{t('founder.review.newClientHint', { name: clientForRow?.name ?? '' })}</p>
          <Input label={t('founder.review.f.clientName')} value={draft.name} required onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <Select
            label={t('founder.review.f.clientKind')}
            value={draft.kind}
            onChange={(e) => setDraft({ ...draft, kind: e.target.value as ClientKind })}
            options={CLIENT_KINDS.map((k) => ({ value: k, label: t(`founder.review.kind.${k}`) }))}
          />
          <Input label={t('founder.review.f.clientSector')} value={draft.sector} hint={t('founder.review.f.sectorHint')} onChange={(e) => setDraft({ ...draft, sector: e.target.value })} />
          <div className="founder-actions">
            <Button variant="primary" type="submit">
              {t('founder.review.createClient')}
            </Button>
            <Button variant="secondary" onClick={() => setClientFor(null)}>
              {t('founder.common.close')}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
