import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { demoUserById } from '../../auth/demoUsers';
import { useCan } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Kanban, type KanbanCard } from '../../components/organism/Kanban/Kanban';
import { useData, useTable } from '../../data/DataContext';
import type { Lead, Project, ProjectPhase } from '../../data/schema';
import { PIPELINE_STATUSES, nextPipelineStatus, pick, pipelineStatus, serviceByCode, type PipelineGroup, type PipelineStatusId } from '../../domain';
import { formatCop, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import './founder.css';
import {
  DEFAULT_COLLAPSED,
  PHASES,
  PIPELINE_BANDS,
  PROJECT_TYPES,
  checkLeadMove,
  checkProjectMove,
  leadEntry,
  phaseTone,
  pipelineIndex,
  prevPipelineStatus,
  projectEntry,
  type PipelineEntry,
} from './pipelineData';
import { pipelineSpec } from './specs';

const APPROVALS = ['draft', 'in-check', 'awaiting-founder', 'changes-requested', 'approved', 'client-approved'] as const;

/** `lead:<id>` / `project:<id>` — a board card id that says which table the row came from. */
const cardId = (e: PipelineEntry) => `${e.kind}:${e.id}`;

/**
 * A-03 Pipeline, reworked onto the playbook's 15-status architecture (D-033). One board for the whole
 * commercial-to-delivery flow: `leads` rows fill the first four statuses, `projects` rows the rest, and the
 * construction gate (G-06 / G-12) disables any move into procurement or construction while the design
 * package is not approved. The legacy seven-`phase` vocabulary still drives the Work views, so it stays
 * editable in the project drawer until those migrate.
 */
export function PipelinePage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const navigate = useNavigate();
  const { rows: projects, loading } = useTable('projects', { orderBy: 'name' });
  const { rows: leads } = useTable('leads', { orderBy: 'name' });
  const write = can('projects.write');
  const manageLeads = can('leads.manage');

  const [tab, setTab] = useState('board');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [approval, setApproval] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<PipelineGroup[]>([...DEFAULT_COLLAPSED]);

  /** Leads that have not become a project yet, plus every project, as one list of board entries. */
  const entries = useMemo<PipelineEntry[]>(
    () => [...leads.filter((l) => l.projectId === null).map(leadEntry), ...projects.map(projectEntry)],
    [leads, projects],
  );

  const filtered = useMemo(
    () =>
      entries.filter((e) => {
        const needle = q.trim().toLowerCase();
        if (needle && !`${e.name} ${e.client}`.toLowerCase().includes(needle)) return false;
        if (type || approval) {
          const p = e.kind === 'project' ? projects.find((x) => x.id === e.id) : undefined;
          if (!p) return false;
          if (type && p.type !== type) return false;
          if (approval && p.approval !== approval) return false;
        }
        return true;
      }),
    [entries, q, type, approval, projects],
  );

  const open = useMemo(() => {
    if (!openId) return null;
    const [kind, id] = openId.split(':');
    if (kind === 'lead') return { kind: 'lead' as const, lead: leads.find((l) => l.id === id) ?? null, project: null };
    return { kind: 'project' as const, lead: null, project: projects.find((p) => p.id === id) ?? null };
  }, [openId, leads, projects]);

  const openProject = open?.project ?? null;
  const openLead = open?.lead ?? null;
  const openEntry = openProject ? projectEntry(openProject) : openLead ? leadEntry(openLead) : null;

  // ------------------------------------------------------------------ moves

  /** Why a status is not reachable for this entry, already translated; null when it is. */
  const blocked = (entry: PipelineEntry, to: string): string | null => {
    if (entry.kind === 'lead') {
      const check = checkLeadMove(to);
      return check.ok ? null : t('founder.pipeline.leadRange');
    }
    const project = projects.find((p) => p.id === entry.id);
    if (!project) return t('founder.pipeline.notFound');
    const check = checkProjectMove(project, to);
    return check.ok ? null : t('founder.pipeline.gate', { rule: check.rule ?? 'G-06' });
  };

  /**
   * Writes the move. The gate is re-checked against the **stored** row, not the one this render was built
   * from, so a stale card (or a second call through the actions bus) can never slip past G-06 / G-12.
   * `basedOn` stays the row the person was looking at when there is one, so D-024 still reports a conflict.
   */
  const move = async (entry: PipelineEntry, to: string): Promise<string> => {
    const label = t(`core.status.${to}`);
    if (entry.kind === 'lead') {
      const stored = await data.get('leads', entry.id);
      if (!stored) return t('founder.pipeline.notFound');
      if (!checkLeadMove(to).ok) {
        toast(t('founder.pipeline.leadRange'));
        return t('founder.pipeline.leadRange');
      }
      const seen = leads.find((l) => l.id === entry.id) ?? stored;
      await data.update('leads', stored.id, { status: to as PipelineStatusId }, { basedOn: seen.updated_at });
    } else {
      const stored = await data.get('projects', entry.id);
      if (!stored) return t('founder.pipeline.notFound');
      const check = checkProjectMove(stored, to);
      if (!check.ok) {
        const why = t('founder.pipeline.gate', { rule: check.rule ?? 'G-06' });
        toast(why);
        return why;
      }
      const seen = projects.find((p) => p.id === entry.id) ?? stored;
      await data.update('projects', stored.id, { pipelineStatus: to as PipelineStatusId }, { basedOn: seen.updated_at });
    }
    toast(t('founder.pipeline.moved', { project: entry.name, phase: label }));
    return label;
  };

  /** Legacy seven-phase move, kept working for the Work views (`founder.moveProject`). */
  const movePhase = async (project: Project, phase: string) => {
    await data.update('projects', project.id, { phase: phase as ProjectPhase }, { basedOn: project.updated_at });
    toast(t('founder.pipeline.phaseMoved', { project: project.name, phase: t(`founder.phase.${phase}`) }));
  };

  const setDirection = async (project: Project) => {
    await data.update('projects', project.id, { creativeDirection: 'set' }, { basedOn: project.updated_at });
    toast(t('founder.pipeline.directionSet', { project: project.name }));
  };

  const toggleGroup = (group: PipelineGroup): boolean => {
    const next = collapsed.includes(group) ? collapsed.filter((g) => g !== group) : [...collapsed, group];
    setCollapsed(next);
    return !next.includes(group);
  };

  const clear = () => {
    setQ('');
    setType('');
    setApproval('');
  };

  // ------------------------------------------------------------------ actions (P-05, D-036)

  const entryById = (v: unknown): PipelineEntry | undefined => {
    const raw = String(v ?? '');
    return entries.find((e) => e.id === raw || cardId(e) === raw);
  };

  useRegisterActions({
    'founder.moveProject': write
      ? async (p) => {
          const project = await data.get('projects', String(p?.project ?? ''));
          if (!project) return t('founder.pipeline.notFound');
          const phase = String(p?.phase ?? project.phase);
          await movePhase(project, phase);
          return phase;
        }
      : false,
    'founder.movePipelineStatus': write || manageLeads
      ? async (p) => {
          const entry = entryById(p?.project ?? p?.entry);
          if (!entry) return t('founder.pipeline.notFound');
          return move(entry, String(p?.status ?? nextPipelineStatus(entry.status)?.id ?? entry.status));
        }
      : false,
    'founder.openProject': (p) => {
      const entry = entryById(p?.project);
      if (!entry) return t('founder.pipeline.notFound');
      setOpenId(cardId(entry));
      return entry.name;
    },
    'founder.setCreativeDirection': write
      ? async (p) => {
          const project = await data.get('projects', String(p?.project ?? ''));
          if (!project) return t('founder.pipeline.notFound');
          await setDirection(project);
          return 'set';
        }
      : false,
    'founder.toggleGroup': (p) => {
      const group = String(p?.group ?? '') as PipelineGroup;
      if (!PIPELINE_BANDS.some((b) => b.id === group)) return t('founder.pipeline.notFound');
      return toggleGroup(group) ? 'expanded' : 'collapsed';
    },
    'founder.openLeads': () => {
      navigate('/founder/leads');
      return '/founder/leads';
    },
  });

  // ------------------------------------------------------------------ render helpers

  const canMove = (entry: PipelineEntry) => (entry.kind === 'lead' ? manageLeads : write);

  const moveControls = (entry: PipelineEntry, withSelect = false) => {
    const prev = prevPipelineStatus(entry.status);
    const next = nextPipelineStatus(entry.status);
    const prevBlocked = prev ? blocked(entry, prev.id) : t('founder.pipeline.firstStatus');
    const nextBlocked = next ? blocked(entry, next.id) : t('founder.pipeline.lastStatus');
    return (
      <span className="founder-move">
        <StatusPill status={entry.status} />
        {canMove(entry) && (
          <>
            <span className="founder-move__btns">
              <Button
                size="sm"
                variant="ghost"
                icon="◀"
                aria-label={prev ? t('founder.pipeline.moveTo', { name: entry.name, status: t(`core.status.${prev.id}`) }) : t('founder.pipeline.firstStatus')}
                title={prevBlocked ?? undefined}
                disabled={!prev || prevBlocked !== null}
                onClick={() => prev && void move(entry, prev.id)}
              />
              <Button
                size="sm"
                variant="ghost"
                icon="▶"
                aria-label={next ? t('founder.pipeline.moveTo', { name: entry.name, status: t(`core.status.${next.id}`) }) : t('founder.pipeline.lastStatus')}
                title={nextBlocked ?? undefined}
                disabled={!next || nextBlocked !== null}
                onClick={() => next && void move(entry, next.id)}
              />
            </span>
            {withSelect && (
            <Select
              className="founder-move__select"
              label={t('founder.pipeline.moveLabel', { name: entry.name })}
              hideLabel
              value={entry.status}
              onChange={(e) => void move(entry, e.target.value)}
              options={PIPELINE_STATUSES.map((s) => {
                const check = entry.kind === 'lead' ? checkLeadMove(s.id) : checkProjectMove(projects.find((p) => p.id === entry.id) as Project, s.id);
                const off = !check.ok && s.id !== entry.status;
                // Short reason tag only: a long option label sets the <select>'s intrinsic width and
                // stretches the card. The full sentence is on the prev / next buttons and in the toast.
                return { value: s.id, label: off ? `${pick(s.label, lang)} · ${check.rule === 'G-06' ? 'G-06' : t('founder.pipeline.leadOnly')}` : pick(s.label, lang), disabled: off };
              })}
            />
            )}
          </>
        )}
      </span>
    );
  };

  const cardsFor = (statusIds: readonly PipelineStatusId[]): KanbanCard[] =>
    filtered
      .filter((e) => statusIds.includes(e.status))
      .map((e) => ({
        id: cardId(e),
        columnId: e.status,
        title: e.name,
        subtitle: `${e.kind === 'lead' ? t('founder.pipeline.lead') : e.client} · ${e.valueCop === null ? '—' : formatCop(e.valueCop, lang)}`,
        meta: moveControls(e),
      }));

  return (
    <div className="founder-page">
      <PageHeader
        code={pipelineSpec.code}
        title={t('founder.pipeline.title')}
        subtitle={t('founder.pipeline.desc')}
        breadcrumb={[{ label: t('founder.nav.home'), to: '/founder' }, { label: t('founder.pipeline.title') }]}
        actions={
          <Button variant="primary" onClick={() => navigate('/founder/leads')}>
            {t('founder.pipeline.openLeads')}
          </Button>
        }
      />

      <FilterBar onClear={clear} summary={t('founder.pipeline.summary', { n: filtered.length, total: entries.length })}>
        <SearchField value={q} onChange={setQ} />
        <Select
          label={t('founder.pipeline.filterType')}
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder={t('founder.common.all')}
          options={PROJECT_TYPES.map((v) => ({ value: v, label: t(`founder.type.${v}`) }))}
        />
        <Select
          label={t('founder.pipeline.filterApproval')}
          value={approval}
          onChange={(e) => setApproval(e.target.value)}
          placeholder={t('founder.common.all')}
          options={APPROVALS.map((v) => ({ value: v, label: t(`core.status.${v}`) }))}
        />
      </FilterBar>

      <Tabs
        label={t('founder.pipeline.views')}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'board', label: t('founder.pipeline.tab.board'), count: filtered.length },
          { id: 'list', label: t('founder.pipeline.tab.list'), count: filtered.length },
        ]}
      >
        {tab === 'board' ? (
          <div className="founder-bands">
            {PIPELINE_BANDS.map((band) => {
              const statusIds = band.statuses.map((s) => s.id);
              const cards = cardsFor(statusIds);
              const isCollapsed = collapsed.includes(band.id);
              return (
                <section key={band.id} className="founder-band" aria-labelledby={`band-${band.id}`}>
                  <header className="founder-band__head">
                    <Button
                      variant="ghost"
                      icon={isCollapsed ? '▸' : '▾'}
                      aria-expanded={!isCollapsed}
                      onClick={() => toggleGroup(band.id)}
                    >
                      <span id={`band-${band.id}`}>{t(`founder.pipeline.band.${band.id}`)}</span>
                    </Button>
                    <Badge tone="neutral">{cards.length}</Badge>
                  </header>
                  {!isCollapsed && (
                    <Kanban
                      label={t('founder.pipeline.bandBoard', { band: t(`founder.pipeline.band.${band.id}`) })}
                      columns={band.statuses.map((s) => ({ id: s.id, title: pick(s.label, lang), tone: s.tone }))}
                      cards={cards}
                      onActivate={(card) => setOpenId(card.id)}
                    />
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <DataTable<PipelineEntry>
            caption={t('founder.pipeline.tab.list')}
            rows={filtered}
            rowKey={cardId}
            loading={loading}
            onRowActivate={(e) => setOpenId(cardId(e))}
            emptyTitle={t('founder.pipeline.empty')}
            initialSort={{ key: 'status', dir: 'asc' }}
            columns={[
              { key: 'name', header: t('founder.common.title'), sortable: true, render: (e) => e.name },
              { key: 'kind', header: t('founder.pipeline.col.kind'), render: (e) => <Badge tone={e.kind === 'lead' ? 'info' : 'accent'}>{t(`founder.pipeline.kind.${e.kind}`)}</Badge> },
              { key: 'client', header: t('founder.common.client'), render: (e) => e.client },
              { key: 'serviceCode', header: t('founder.leads.service'), render: (e) => (e.serviceCode ? `${e.serviceCode} · ${pick(serviceByCode(e.serviceCode)?.name ?? { en: e.serviceCode }, lang)}` : '—') },
              { key: 'valueCop', header: t('founder.common.budget'), align: 'end', sortable: true, sortValue: (e) => e.valueCop ?? 0, render: (e) => (e.valueCop === null ? '—' : formatCop(e.valueCop, lang)) },
              { key: 'ownerId', header: t('founder.common.owner'), render: (e) => (e.ownerId ? demoUserById(e.ownerId)?.name ?? e.ownerId : t('founder.leads.unassigned')) },
              { key: 'status', header: t('founder.common.status'), sortable: true, sortValue: (e) => pipelineIndex(e.status), render: (e) => <StatusPill status={e.status} /> },
            ]}
          />
        )}
      </Tabs>

      <Drawer
        open={openEntry !== null}
        onClose={() => setOpenId(null)}
        title={openEntry?.name ?? ''}
        footer={
          <div className="founder-actions">
            {openProject && write && openProject.creativeDirection !== 'set' && (
              <Button variant="primary" onClick={() => void setDirection(openProject)}>
                {t('founder.pipeline.setDirection')}
              </Button>
            )}
            {openProject && (
              <Button variant="secondary" onClick={() => navigate(`/founder/work/${openProject.id}`)}>
                {t('founder.leads.openWork')}
              </Button>
            )}
            {openLead && (
              <Button variant="secondary" onClick={() => navigate('/founder/leads')}>
                {t('founder.pipeline.openLeads')}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setOpenId(null)}>
              {t('founder.common.close')}
            </Button>
          </div>
        }
      >
        {openEntry && (
          <div className="founder-stack">
            <div className="founder-badges">
              <StatusPill status={openEntry.status} />
              <Badge tone={openEntry.kind === 'lead' ? 'info' : 'accent'}>{t(`founder.pipeline.kind.${openEntry.kind}`)}</Badge>
            </div>

            <section className="founder-section">
              <h3>{t('founder.pipeline.moveSection')}</h3>
              {moveControls(openEntry, true)}
              {nextPipelineStatus(openEntry.status) && blocked(openEntry, nextPipelineStatus(openEntry.status)!.id) && (
                <p className="founder-note">{blocked(openEntry, nextPipelineStatus(openEntry.status)!.id)}</p>
              )}
            </section>

            {openProject && (
              <>
                <KeyValue
                  columns={1}
                  items={[
                    { key: t('founder.common.client'), value: openProject.client },
                    { key: t('founder.common.type'), value: <Badge tone="neutral">{t(`founder.type.${openProject.type}`)}</Badge> },
                    { key: t('founder.leads.service'), value: openProject.serviceCode ? `${openProject.serviceCode} · ${pick(serviceByCode(openProject.serviceCode)?.name ?? { en: '' }, lang)}` : '—' },
                    { key: t('founder.common.creativeDirection'), value: t(`founder.cd.${openProject.creativeDirection}`) },
                    { key: t('founder.common.approval'), value: <StatusPill status={openProject.approval} /> },
                    { key: t('founder.common.leadDesigner'), value: demoUserById(openProject.leadDesignerId)?.name ?? openProject.leadDesignerId },
                    { key: t('founder.common.budget'), value: formatCop(openProject.budgetCop, lang) },
                    { key: t('founder.common.due'), value: formatDate(openProject.dueDate, lang) },
                    { key: t('founder.common.location'), value: openProject.location },
                    { key: t('founder.common.summary'), value: openProject.summary },
                  ]}
                />
                {/* Legacy seven-phase vocabulary: the Work views still read `projects.phase` (D-033). */}
                <section className="founder-section">
                  <h3>{t('founder.pipeline.legacyPhase')}</h3>
                  <p className="founder-note">{t('founder.pipeline.legacyPhaseNote')}</p>
                  <Select
                    label={t('founder.common.phase')}
                    value={openProject.phase}
                    disabled={!write}
                    onChange={(e) => void movePhase(openProject, e.target.value)}
                    options={PHASES.map((p) => ({ value: p, label: t(`founder.phase.${p}`) }))}
                  />
                  <Badge tone={phaseTone(openProject.phase)}>{t(`founder.phase.${openProject.phase}`)}</Badge>
                </section>
              </>
            )}

            {openLead && <LeadSummary lead={openLead} />}
          </div>
        )}
      </Drawer>
    </div>
  );
}

/** Read-only lead facts on the board drawer: the editing of a lead lives on A-08. */
function LeadSummary({ lead }: { lead: Lead }) {
  const { t, lang } = useT();
  return (
    <KeyValue
      columns={1}
      items={[
        { key: t('founder.leads.f.city'), value: lead.city },
        { key: t('founder.common.type'), value: t(`founder.type.${lead.projectType}`) },
        { key: t('founder.leads.f.requestedService'), value: lead.requestedService ?? '—' },
        { key: t('founder.leads.suggestedService'), value: lead.suggestedService ?? '—' },
        { key: t('founder.common.budget'), value: lead.budgetCop === null ? '—' : formatCop(lead.budgetCop, lang) },
        { key: t('founder.leads.f.desiredStart'), value: formatDate(lead.desiredStart, lang) },
        { key: t('founder.common.owner'), value: lead.ownerId ? demoUserById(lead.ownerId)?.name ?? lead.ownerId : t('founder.leads.unassigned') },
        { key: t('founder.common.notes'), value: lead.notes || '—' },
        { key: t('founder.common.status'), value: pipelineStatus(lead.status)?.playbook ?? lead.status },
      ]}
    />
  );
}
