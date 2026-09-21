import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { useCan } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useData, useTable } from '../../data/DataContext';
import type { Engagement, Project } from '../../data/schema';
import { type Service, type ServicePhase, checkKey, phaseItems, PIPELINE_STATUS_IDS, pick, serviceByCode } from '../../domain';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { todayIso } from '../../work/model';
import { checklistSpec } from './specs';
import './studio.css';

/**
 * Stages of service 03 that already have a page in the OS: the checklist links to the page that owns the
 * work instead of duplicating it. Keys are `ServicePhase.id`, labels are the studio nav strings.
 */
const STAGE_PAGES: Record<string, { to: string; code: string; labelKey: string }> = {
  '03-10': { to: '/studio/revisions', code: 'S-11', labelKey: 'studio.nav.revisions' },
  '03-12': { to: '/studio/materials', code: 'S-04', labelKey: 'studio.nav.materials' },
  '03-13': { to: '/studio/materials', code: 'S-04', labelKey: 'studio.nav.materials' },
  '03-15': { to: '/studio/schedules', code: 'S-06', labelKey: 'studio.nav.schedules' },
  '03-16': { to: '/studio/packs', code: 'S-07', labelKey: 'studio.nav.packs' },
  '03-17': { to: '/studio/plans', code: 'S-05', labelKey: 'studio.nav.plans' },
};

/** The stage that the approval gate (G-06 / G-12) guards: final design delivery, then construction. */
const GATE_PHASE_ID = '03-19';

function isBeyond(status: string, marker: string): boolean {
  const a = PIPELINE_STATUS_IDS.indexOf(status as (typeof PIPELINE_STATUS_IDS)[number]);
  const b = PIPELINE_STATUS_IDS.indexOf(marker as (typeof PIPELINE_STATUS_IDS)[number]);
  return a >= 0 && b >= 0 && a >= b;
}

/**
 * S-10 Service checklist (`/studio/checklist`, `/studio/checklist/:projectId`): the per-project tracker over
 * `engagements`. One phase per Card, one real Checkbox per playbook item, the approval gate of service 03
 * before construction (G-06 / G-12) and the strategic brief in a Drawer.
 */
export function ServiceChecklistPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const navigate = useNavigate();
  const { projectId: routeProjectId } = useParams();

  const { rows: projects, loading: loadingProjects } = useTable('projects', { orderBy: 'name' });
  const { rows: engagements, loading: loadingEngagements } = useTable('engagements', { orderBy: 'startedAt' });
  const loading = loadingProjects || loadingEngagements;
  const writable = can('engagements.write');

  /** Projects that have at least one engagement, in name order. */
  const tracked = useMemo(
    () => projects.filter((p) => engagements.some((e) => e.projectId === p.id)),
    [projects, engagements],
  );

  const fallbackId = useMemo(() => {
    const inDesign = tracked.find((p) => p.pipelineStatus === 'design-development');
    return (inDesign ?? tracked[0])?.id ?? null;
  }, [tracked]);

  const projectId = routeProjectId && tracked.some((p) => p.id === routeProjectId) ? routeProjectId : fallbackId;
  const project: Project | undefined = tracked.find((p) => p.id === projectId);

  /** A project can carry more than one engagement (Noam: design delivered, execution running): the open one wins. */
  const engagement: Engagement | undefined = useMemo(() => {
    const mine = engagements.filter((e) => e.projectId === projectId);
    return mine.find((e) => e.status === 'started' || e.status === 'in-progress') ?? mine[mine.length - 1];
  }, [engagements, projectId]);

  const service: Service | undefined = serviceByCode(engagement?.serviceCode);
  const phases = service?.phases ?? [];
  const currentIndex = phases.findIndex((p) => p.id === engagement?.currentPhaseId);
  const currentPhase: ServicePhase | undefined = currentIndex >= 0 ? phases[currentIndex] : phases[0];

  const [openPhases, setOpenPhases] = useState<string[]>([]);
  const [briefOpen, setBriefOpen] = useState(false);

  // The current phase opens by itself whenever the engagement (or the phase it is on) changes.
  useEffect(() => {
    setOpenPhases(currentPhase ? [currentPhase.id] : []);
    setBriefOpen(false);
  }, [engagement?.id, currentPhase?.id]);

  const selectProject = useCallback(
    (id: string) => {
      if (!tracked.some((p) => p.id === id)) return t('studio.checklist.unknownProject');
      navigate(`/studio/checklist/${id}`);
      return tracked.find((p) => p.id === id)?.name ?? id;
    },
    [navigate, tracked, t],
  );

  const togglePhase = useCallback(
    (id: string) => {
      setOpenPhases((open) => (open.includes(id) ? open.filter((x) => x !== id) : [...open, id]));
      return id;
    },
    [],
  );

  const ticked = useCallback((phase: ServicePhase) => phaseItems(phase).filter((_, i) => engagement?.checks[checkKey(phase.id, i)]).length, [engagement]);

  const totals = useMemo(() => {
    let done = 0;
    let all = 0;
    for (const phase of phases) {
      const items = phaseItems(phase);
      all += items.length;
      done += items.filter((_, i) => engagement?.checks[checkKey(phase.id, i)]).length;
    }
    return { done, all };
  }, [phases, engagement]);

  const tickItem = useCallback(
    async (phaseId: string, index: number, ok: boolean) => {
      if (!engagement) return t('studio.checklist.noEngagement');
      await data.update('engagements', engagement.id, { checks: { ...engagement.checks, [checkKey(phaseId, index)]: ok } }, { basedOn: engagement.updated_at });
      return `${phaseId}:${index} = ${ok}`;
    },
    [data, engagement, t],
  );

  const completePhase = useCallback(
    async (phaseId: string) => {
      if (!engagement || !service) return t('studio.checklist.noEngagement');
      const phase = service.phases.find((p) => p.id === phaseId);
      if (!phase) return t('studio.checklist.unknownPhase');
      const checks = { ...engagement.checks };
      phaseItems(phase).forEach((_, i) => {
        checks[checkKey(phase.id, i)] = true;
      });
      const last = service.phases[service.phases.length - 1]?.id === phase.id;
      await data.update(
        'engagements',
        engagement.id,
        last ? { checks, status: 'delivered', completedAt: todayIso() } : { checks },
        { basedOn: engagement.updated_at },
      );
      toast(last ? t('studio.checklist.delivered') : t('studio.saved'));
      return phaseId;
    },
    [data, engagement, service, t],
  );

  const advancePhase = useCallback(async () => {
    if (!engagement || !service) return t('studio.checklist.noEngagement');
    const i = service.phases.findIndex((p) => p.id === engagement.currentPhaseId);
    const next = service.phases[i + 1];
    if (!next) return t('studio.checklist.lastPhase');
    await data.update('engagements', engagement.id, { currentPhaseId: next.id, status: 'in-progress' }, { basedOn: engagement.updated_at });
    toast(t('studio.checklist.advanced', { phase: pick(next.title, lang) }));
    return next.id;
  }, [data, engagement, service, lang, t]);

  const sendToProcurement = useCallback(async () => {
    if (!project) return t('studio.checklist.noProject');
    if (project.approval !== 'client-approved') return t('studio.checklist.gateBlocked');
    await data.update('projects', project.id, { pipelineStatus: 'procurement' }, { basedOn: project.updated_at });
    toast(t('studio.checklist.sentToProcurement'));
    return project.id;
  }, [data, project, t]);

  const openStagePage = useCallback(
    (phaseId: string) => {
      const target = STAGE_PAGES[phaseId];
      if (!target) return t('studio.checklist.noStagePage');
      navigate(target.to);
      return target.code;
    },
    [navigate, t],
  );

  useRegisterActions({
    'studio.selectChecklistProject': ({ project: p }) => selectProject(String(p)),
    'studio.togglePhase': ({ phase }) => togglePhase(String(phase)),
    'studio.tickItem': writable ? ({ phase, item, ok }) => tickItem(String(phase), Number(item), ok === undefined ? true : Boolean(ok)) : false,
    'studio.completePhase': writable ? ({ phase }) => completePhase(String(phase)) : false,
    'studio.advancePhase': writable ? () => advancePhase() : false,
    'studio.openBrief': () => {
      setBriefOpen(true);
      return t('studio.checklist.brief');
    },
    'studio.openStagePage': ({ stage }) => openStagePage(String(stage)),
    'studio.sendToProcurement': writable ? () => sendToProcurement() : false,
  });

  const briefEntries = Object.entries(engagement?.brief ?? {});
  const gateService = service?.code === '03';
  const sentToProcurement = project ? isBeyond(project.pipelineStatus, 'procurement') : false;
  const gateOpen = project?.approval === 'client-approved' && !sentToProcurement;

  return (
    <>
      <PageHeader
        code={checklistSpec.code}
        title={t('studio.checklist.title')}
        subtitle={t('studio.checklist.subtitle')}
        breadcrumb={[{ label: t('core.portal.studio'), to: '/studio' }, { label: t('studio.checklist.title') }]}
        actions={
          <Button onClick={() => setBriefOpen(true)} disabled={briefEntries.length === 0}>
            {t('studio.checklist.brief')}
          </Button>
        }
      />

      <div className="studio-filters">
        <Select
          label={t('studio.col.project')}
          value={projectId ?? ''}
          onChange={(e) => selectProject(e.target.value)}
          options={tracked.map((p) => ({ value: p.id, label: p.name }))}
          hint={t('studio.checklist.projectHint')}
        />
      </div>

      {!loading && !engagement && <EmptyState title={t('studio.checklist.empty')} description={t('studio.checklist.emptyDesc')} glyph="✓" />}

      {engagement && service && project && (
        <>
          <Card
            title={pick(service.name, lang)}
            subtitle={`${project.name} · ${pick(service.outcome, lang)}`}
            actions={<StatusPill status={engagement.status} />}
          >
            <KeyValue
              columns={2}
              items={[
                { key: t('studio.checklist.ladderWord'), value: <Badge tone="accent">{pick(service.ladderWord, lang)}</Badge> },
                {
                  key: t('studio.checklist.currentPhase'),
                  value: currentPhase ? `${currentPhase.number}. ${pick(currentPhase.title, lang)}` : '—',
                },
                { key: t('studio.checklist.pipeline'), value: <StatusPill status={project.pipelineStatus} /> },
                { key: t('studio.checklist.startedAt'), value: formatDate(engagement.startedAt, lang) },
                { key: t('studio.checklist.completedAt'), value: engagement.completedAt ? formatDate(engagement.completedAt, lang) : t('studio.checklist.notDelivered') },
                { key: t('studio.col.approval'), value: <StatusPill status={project.approval} /> },
              ]}
            />
          </Card>

          <div className="studio-stats studio-stats--top">
            <StatTile
              label={t('studio.checklist.stat.phase')}
              value={currentPhase ? `${ticked(currentPhase)} / ${phaseItems(currentPhase).length}` : '—'}
              hint={currentPhase ? `${currentPhase.number}. ${pick(currentPhase.title, lang)}` : undefined}
              tone="accent"
              glyph="✓"
            />
            <StatTile
              label={t('studio.checklist.stat.overall')}
              value={`${totals.done} / ${totals.all}`}
              hint={t('studio.checklist.stat.overallHint', { label: t(`studio.checklist.label.${service.phaseLabel}`), n: phases.length })}
              tone="neutral"
              glyph="▤"
            />
            <StatTile
              label={t('studio.checklist.stat.position')}
              value={`${currentIndex >= 0 ? currentIndex + 1 : 1} / ${phases.length}`}
              hint={t('studio.checklist.stat.positionHint')}
              tone="info"
              glyph="▷"
            />
          </div>

          <div className="studio-stack">
            {phases.map((phase, i) => {
              const items = phaseItems(phase);
              const done = ticked(phase);
              const isCurrent = phase.id === currentPhase?.id;
              const isOpen = openPhases.includes(phase.id);
              const isLast = i === phases.length - 1;
              const stagePage = STAGE_PAGES[phase.id];
              return (
                <div key={phase.id} className="studio-stack">
                  {gateService && phase.id === GATE_PHASE_ID && (
                    <Card
                      raised
                      title={t('studio.checklist.gate')}
                      subtitle={t('studio.checklist.gateRule')}
                      actions={<Badge tone="warning">G-06 / G-12</Badge>}
                      footer={
                        <div className="studio-foot">
                          <p className="studio-hint">
                            {sentToProcurement ? t('studio.checklist.gateSent') : gateOpen ? t('studio.checklist.gateReady') : t('studio.checklist.gateBlocked')}
                          </p>
                          {writable && (
                            <Button variant="primary" onClick={sendToProcurement} disabled={!gateOpen}>
                              {t('studio.checklist.sendToProcurement')}
                            </Button>
                          )}
                        </div>
                      }
                    >
                      <KeyValue
                        columns={2}
                        items={[
                          { key: t('studio.col.approval'), value: <StatusPill status={project.approval} /> },
                          { key: t('studio.checklist.pipeline'), value: <StatusPill status={project.pipelineStatus} /> },
                        ]}
                      />
                    </Card>
                  )}

                  <Card
                    title={
                      <span className="studio-phase__title">
                        <span className="studio-phase__number">{phase.number}</span>
                        {pick(phase.title, lang)}
                        {isCurrent && <Badge tone="accent">{t('studio.checklist.current')}</Badge>}
                      </span>
                    }
                    subtitle={t('studio.checks.progress', { ok: done, total: items.length })}
                    actions={
                      <Button
                        size="sm"
                        aria-expanded={isOpen}
                        aria-controls={`phase-${phase.id}`}
                        onClick={() => togglePhase(phase.id)}
                      >
                        {isOpen ? t('studio.checklist.collapse') : t('studio.checklist.expand')}
                      </Button>
                    }
                    footer={
                      isOpen ? (
                        <div className="studio-foot">
                          {stagePage && (
                            <Button size="sm" onClick={() => openStagePage(phase.id)}>
                              {t('studio.checklist.openIn', { page: t(stagePage.labelKey) })}
                            </Button>
                          )}
                          <span className="studio-foot__spacer" />
                          {writable && (
                            <>
                              <Button size="sm" onClick={() => completePhase(phase.id)} disabled={done === items.length}>
                                {t('studio.checklist.completePhase')}
                              </Button>
                              {isCurrent && (
                                <Button size="sm" variant="primary" onClick={advancePhase} disabled={isLast}>
                                  {t('studio.checklist.advance')}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      ) : undefined
                    }
                  >
                    {isOpen && (
                      <div id={`phase-${phase.id}`}>
                        <ul className="studio-items">
                          {items.map((item, index) => (
                            <li key={`${phase.id}:${index}`}>
                              <Checkbox
                                label={pick(item, lang)}
                                checked={Boolean(engagement.checks[checkKey(phase.id, index)])}
                                disabled={!writable}
                                onChange={(e) => tickItem(phase.id, index, e.target.checked)}
                              />
                            </li>
                          ))}
                        </ul>
                        {phase.notes?.map((note) => (
                          <p key={note.en} className="studio-note studio-note--quiet">
                            {pick(note, lang)}
                          </p>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Drawer open={briefOpen} onClose={() => setBriefOpen(false)} title={t('studio.checklist.brief')}>
        {briefEntries.length === 0 ? (
          <p className="studio-muted">{t('studio.checklist.briefEmpty')}</p>
        ) : (
          <KeyValue columns={1} items={briefEntries.map(([key, value]) => ({ key, value }))} />
        )}
      </Drawer>
    </>
  );
}
