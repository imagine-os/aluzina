import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { demoUserById } from '../../auth/demoUsers';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Skeleton } from '../../components/atom/Skeleton/Skeleton';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { useTable } from '../../data/DataContext';
import type { DocumentStatus } from '../../data/schema';
import { checkKey, phaseItems, pick } from '../../domain';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { Progress } from './ClientHome';
import './client.css';
import { projectSpec } from './specs';
import { useMyProjects } from './useMyProjects';

/** Only finalised paperwork reaches the client; drafts belong to the studio (there is no documents.clientVisible field yet). */
const CLIENT_VISIBLE: readonly DocumentStatus[] = ['final', 'sent', 'signed'];

/** C-02: one project as the client sees it — the service, the playbook phases as read-only ticks, documents, dates, team. */
export function ProjectPage() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const { projectId = '' } = useParams();
  const { byId, loading } = useMyProjects();
  const { rows: documents } = useTable('documents', { where: { projectId } });

  const my = byId.get(projectId);
  const visibleDocs = useMemo(() => documents.filter((d) => CLIENT_VISIBLE.includes(d.status)), [documents]);
  const lead = my ? demoUserById(my.project.leadDesignerId) : undefined;

  useRegisterActions({
    'client.openApprovals': () => {
      navigate('/client/approvals');
      return 'opened approvals';
    },
    'client.openMessages': () => {
      navigate('/client/messages');
      return 'opened messages';
    },
  });

  if (loading) return <Skeleton lines={5} />;

  if (!my) {
    return (
      <div className="client-page">
        <EmptyState title={t('client.project.notFound')} description={t('client.project.notFoundDesc')} glyph="◌">
          <Button variant="secondary" onClick={() => navigate('/client')}>
            {t('client.project.back')}
          </Button>
        </EmptyState>
      </div>
    );
  }

  const { project, engagement, service, currentPhase } = my;
  const checks = engagement?.checks ?? {};
  const labelKey = service?.phaseLabel === 'stage' ? 'client.project.stageLabel' : 'client.project.phaseLabel';

  return (
    <div className="client-page">
      <PageHeader
        code={projectSpec.code}
        breadcrumb={[{ label: t('client.home.title'), to: '/client' }, { label: project.name }]}
        title={project.name}
        subtitle={service ? pick(service.name, lang) : undefined}
        actions={
          <Button variant="primary" onClick={() => navigate('/client/messages')}>
            {t('client.project.message')}
          </Button>
        }
      />

      <Card title={service ? pick(service.name, lang) : project.name} subtitle={service ? pick(service.outcome, lang) : undefined}>
        <div className="client-stack">
          <div className="client-row">
            <StatusPill status={project.pipelineStatus} />
            {currentPhase && <Badge tone="neutral">{pick(currentPhase.title, lang)}</Badge>}
          </div>
          <Progress done={my.done} total={my.total} percent={my.percent} label={t('client.home.progressLabel')} />
        </div>
      </Card>

      {project.pipelineStatus === 'client-review' && (
        <Card raised title={t('client.project.reviewTitle')}>
          <div className="client-stack">
            <p className="client-note">{t('client.project.reviewDesc')}</p>
            <div className="client-row">
              <Button variant="primary" onClick={() => navigate('/client/approvals')}>
                {t('client.project.reviewOpen')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card title={t('client.project.phases')} subtitle={t('client.project.phasesDesc')}>
        {service ? (
          service.phases.map((phase) => {
            const items = phaseItems(phase);
            const done = items.filter((_, i) => checks[checkKey(phase.id, i)]).length;
            return (
              <details key={phase.id} className="client-phase" open={phase.id === currentPhase?.id}>
                <summary className="client-phase__summary">
                  <span className="client-phase__title">{t(labelKey, { number: phase.number, title: pick(phase.title, lang) })}</span>
                  <Badge tone={done === items.length ? 'success' : 'neutral'}>{t('client.project.phaseCount', { done, total: items.length })}</Badge>
                </summary>
                <div className="client-phase__body">
                  <ul className="client-items">
                    {items.map((item, i) => {
                      const ticked = Boolean(checks[checkKey(phase.id, i)]);
                      return (
                        <li key={checkKey(phase.id, i)} data-done={ticked}>
                          <span className="client-tick" aria-hidden="true">
                            {ticked ? '✓' : '○'}
                          </span>
                          <span>{pick(item, lang)}</span>
                          <span className="visually-hidden">{t(ticked ? 'client.project.itemDone' : 'client.project.itemPending')}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </details>
            );
          })
        ) : (
          <p className="client-note">{t('client.home.noService')}</p>
        )}
      </Card>

      <Card title={t('client.project.deliverables')}>
        {visibleDocs.length === 0 ? (
          <EmptyState title={t('client.project.deliverablesEmpty')} description={t('client.project.deliverablesEmptyDesc')} glyph="▤" />
        ) : (
          <ul className="client-list">
            {visibleDocs.map((doc) => (
              <li key={doc.id}>
                <div className="client-row">
                  <strong>{doc.title}</strong>
                  <StatusPill status={doc.status} />
                </div>
                <p className="client-note">{formatDate(doc.updated_at, lang)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={t('client.project.dates')}>
        <KeyValue
          items={[
            { key: t('client.project.start'), value: formatDate(project.startDate, lang) },
            { key: t('client.project.due'), value: formatDate(project.dueDate, lang) },
            { key: t('client.project.serviceStart'), value: formatDate(engagement?.startedAt, lang) },
          ]}
        />
      </Card>

      <Card title={t('client.project.team')}>
        {lead ? (
          <div className="client-person">
            <Avatar name={lead.name} initials={lead.initials} />
            <div>
              <div>{lead.name}</div>
              <p className="client-note">{t('client.project.leadDesigner')}</p>
            </div>
          </div>
        ) : (
          <p className="client-note">{t('client.home.noService')}</p>
        )}
      </Card>

      <p className="client-note">{t('client.common.notMineDesc')}</p>
    </div>
  );
}
