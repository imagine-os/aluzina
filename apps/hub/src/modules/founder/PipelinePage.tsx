import { useMemo, useState } from 'react';
import { demoUserById } from '../../auth/demoUsers';
import { useCan } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Kanban, type KanbanCard } from '../../components/organism/Kanban/Kanban';
import { useData, useTable } from '../../data/DataContext';
import type { Project, ProjectPhase } from '../../data/schema';
import { formatCop, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import './founder.css';
import { PHASES, PROJECT_TYPES, phaseTone } from './pipelineData';
import { pipelineSpec } from './specs';

const APPROVALS = ['draft', 'in-check', 'awaiting-founder', 'changes-requested', 'approved', 'client-approved'] as const;

export function PipelinePage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { rows: projects } = useTable('projects', { orderBy: 'name' });
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [approval, setApproval] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const needle = q.trim().toLowerCase();
        if (needle && !`${p.name} ${p.client} ${p.location}`.toLowerCase().includes(needle)) return false;
        if (type && p.type !== type) return false;
        if (approval && p.approval !== approval) return false;
        return true;
      }),
    [projects, q, type, approval],
  );

  const open = useMemo(() => projects.find((p) => p.id === openId) ?? null, [projects, openId]);

  const cards: KanbanCard[] = filtered.map((p) => ({
    id: p.id,
    columnId: p.phase,
    title: p.name,
    subtitle: `${p.client} · ${formatCop(p.budgetCop, lang)}`,
    meta: <StatusPill status={p.approval} />,
  }));

  const move = async (cardId: string, toColumnId: string) => {
    const project = projects.find((p) => p.id === cardId);
    if (!project) return;
    await data.update('projects', cardId, { phase: toColumnId as ProjectPhase });
    toast(t('founder.pipeline.moved', { project: project.name, phase: t(`founder.phase.${toColumnId}`) }));
  };

  const setDirection = async (project: Project) => {
    await data.update('projects', project.id, { creativeDirection: 'set' });
    toast(t('founder.pipeline.directionSet', { project: project.name }));
  };

  const clear = () => {
    setQ('');
    setType('');
    setApproval('');
  };

  return (
    <div className="founder-page">
      <PageHeader
        code={pipelineSpec.code}
        title={t('founder.pipeline.title')}
        subtitle={t('founder.pipeline.desc')}
        breadcrumb={[{ label: t('founder.nav.home'), to: '/founder' }, { label: t('founder.pipeline.title') }]}
        actions={
          <Placeholder what={t('founder.pipeline.newLeadWhat')}>
            <Button variant="primary">{t('founder.pipeline.newLead')}</Button>
          </Placeholder>
        }
      />

      <FilterBar onClear={clear} summary={t('founder.pipeline.summary', { n: filtered.length, total: projects.length })}>
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

      <Kanban
        label={t('founder.pipeline.board')}
        columns={PHASES.map((p) => ({ id: p, title: t(`founder.phase.${p}`), tone: phaseTone(p) }))}
        cards={cards}
        onMove={can('projects.write') ? move : undefined}
        onActivate={(card) => setOpenId(card.id)}
      />

      <Drawer
        open={open !== null}
        onClose={() => setOpenId(null)}
        title={open?.name ?? ''}
        footer={
          <div className="founder-actions">
            {open && can('projects.write') && open.creativeDirection !== 'set' && (
              <Button variant="primary" onClick={() => setDirection(open)}>
                {t('founder.pipeline.setDirection')}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setOpenId(null)}>
              {t('founder.common.close')}
            </Button>
          </div>
        }
      >
        {open && (
          <div className="founder-stack">
            <KeyValue
              columns={1}
              items={[
                { key: t('founder.common.client'), value: open.client },
                { key: t('founder.common.type'), value: <Badge tone="neutral">{t(`founder.type.${open.type}`)}</Badge> },
                { key: t('founder.common.phase'), value: <Badge tone={phaseTone(open.phase)}>{t(`founder.phase.${open.phase}`)}</Badge> },
                { key: t('founder.common.creativeDirection'), value: t(`founder.cd.${open.creativeDirection}`) },
                { key: t('founder.common.approval'), value: <StatusPill status={open.approval} /> },
                { key: t('founder.common.leadDesigner'), value: demoUserById(open.leadDesignerId)?.name ?? open.leadDesignerId },
                { key: t('founder.common.budget'), value: formatCop(open.budgetCop, lang) },
                { key: t('founder.common.due'), value: formatDate(open.dueDate, lang) },
                { key: t('founder.common.location'), value: open.location },
                { key: t('founder.common.summary'), value: open.summary },
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
