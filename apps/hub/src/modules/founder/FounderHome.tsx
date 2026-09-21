import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Card } from '../../components/molecule/Card/Card';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { ApprovalQueue, type ApprovalItem } from '../../components/organism/ApprovalQueue/ApprovalQueue';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { useTable } from '../../data/DataContext';
import type { Alert, Meeting, ProjectPhase } from '../../data/schema';
import { daysUntil, formatCop, formatDate, formatDateTime } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import './founder.css';
import { PHASES, phaseTone } from './pipelineData';
import { homeSpec } from './specs';
import { checkSummary, useApprovals } from './useApprovals';

const SEVERITY_ORDER: Record<string, number> = { urgent: 0, warning: 1, info: 2 };

export function FounderHome() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const { projects, waiting, loading, approve, requestChanges, comment } = useApprovals();
  const { rows: alerts } = useTable('alerts');
  const { rows: meetings } = useTable('meetings', { orderBy: 'startsAt' });
  const { rows: payments } = useTable('payments');

  const live = useMemo(() => projects.filter((p) => p.phase !== 'delivered'), [projects]);

  const openAlerts = useMemo(
    () => alerts.filter((a) => a.status !== 'resolved').sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3) || a.dueDate.localeCompare(b.dueDate)),
    [alerts],
  );
  const urgentCount = openAlerts.filter((a) => a.severity === 'urgent').length;

  const week = useMemo(() => meetings.filter((m) => daysUntil(m.startsAt) >= 0 && daysUntil(m.startsAt) <= 7), [meetings]);

  const money = useMemo(() => {
    let owedIn = 0;
    let owedOut = 0;
    let overdue = 0;
    for (const p of payments) {
      const left = Math.max(0, p.amountCop - p.paidCop);
      if (p.status !== 'paid') {
        if (p.direction === 'in') owedIn += left;
        else owedOut += left;
      }
      if (p.status === 'overdue') overdue += 1;
    }
    return { owedIn, owedOut, overdue, budget: live.reduce((n, p) => n + p.budgetCop, 0) };
  }, [payments, live]);

  const phaseCounts = useMemo(() => {
    const counts = new Map<ProjectPhase, number>();
    for (const p of projects) counts.set(p.phase, (counts.get(p.phase) ?? 0) + 1);
    return counts;
  }, [projects]);

  const queueItems: ApprovalItem[] = waiting.slice(0, 3).map(({ project, check }) => ({
    id: project.id,
    title: project.name,
    subtitle: checkSummary(t, check),
    meta: t('founder.approvals.meta', { client: project.client, phase: t(`founder.phase.${project.phase}`), due: formatDate(project.dueDate, lang) }),
    status: project.approval,
  }));

  const relativeDay = (iso: string) => {
    const n = daysUntil(iso);
    if (n <= 0) return t('founder.meeting.today');
    if (n === 1) return t('founder.meeting.tomorrow');
    return t('founder.meeting.inDays', { n });
  };

  return (
    <div className="founder-page">
      <PageHeader
        code={homeSpec.code}
        title={t('founder.home.title')}
        subtitle={t('founder.home.desc')}
        actions={
          <Button variant="primary" onClick={() => navigate('/founder/approvals')}>
            {t('founder.home.waitingAll')}
          </Button>
        }
      />

      <ul className="founder-stats">
        <li>
          <StatTile label={t('founder.home.stat.waiting')} value={waiting.length} hint={t('founder.home.stat.waitingHint')} tone={waiting.length > 0 ? 'warning' : 'success'} glyph="✓" onActivate={() => navigate('/founder/approvals')} />
        </li>
        <li>
          <StatTile label={t('founder.home.stat.projects')} value={live.length} hint={t('founder.home.stat.projectsHint')} tone="accent" glyph="▤" onActivate={() => navigate('/founder/pipeline')} />
        </li>
        <li>
          <StatTile label={t('founder.home.stat.alerts')} value={openAlerts.length} hint={t('founder.home.stat.alertsHint', { n: urgentCount })} tone={urgentCount > 0 ? 'danger' : 'neutral'} glyph="▲" />
        </li>
        <li>
          <StatTile label={t('founder.home.stat.owed')} value={formatCop(money.owedIn, lang)} hint={t('founder.home.stat.owedHint', { n: money.overdue })} tone={money.overdue > 0 ? 'warning' : 'neutral'} glyph="◆" />
        </li>
      </ul>

      <div className="founder-cols">
        <Card
          title={t('founder.home.waiting')}
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/founder/approvals')}>
              {t('founder.home.waitingAll')}
            </Button>
          }
        >
          <ApprovalQueue
            items={queueItems}
            label={t('founder.approvals.queueLabel')}
            emptyTitle={t('founder.approvals.empty')}
            onApprove={approve}
            onReject={requestChanges}
            onComment={comment}
          />
        </Card>

        <Card
          title={t('founder.home.pipeline')}
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/founder/pipeline')}>
              {t('founder.home.pipelineOpen')}
            </Button>
          }
        >
          <ul className="founder-stats founder-stats--compact">
            {PHASES.map((phase) => (
              <li key={phase}>
                <StatTile label={t(`founder.phase.${phase}`)} value={phaseCounts.get(phase) ?? 0} tone={phaseTone(phase)} onActivate={() => navigate('/founder/pipeline')} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="founder-cols">
        <Card title={t('founder.home.week')}>
          <DataTable<Meeting>
            caption={t('founder.home.week')}
            rows={week}
            rowKey={(m) => m.id}
            loading={loading}
            emptyTitle={t('founder.home.weekEmpty')}
            dense
            columns={[
              { key: 'title', header: t('founder.common.title') },
              { key: 'startsAt', header: t('founder.common.date'), render: (m) => `${formatDateTime(m.startsAt, lang)} · ${relativeDay(m.startsAt)}` },
              { key: 'kind', header: t('founder.common.type'), render: (m) => <Badge tone="neutral">{t(`founder.meeting.kind.${m.kind}`)}</Badge> },
            ]}
          />
        </Card>

        <Card title={t('founder.home.alerts')} footer={<p className="founder-note">{t('founder.home.alertsNote')}</p>}>
          <DataTable<Alert>
            caption={t('founder.home.alerts')}
            rows={openAlerts.slice(0, 6)}
            rowKey={(a) => a.id}
            emptyTitle={t('founder.home.alertsEmpty')}
            dense
            columns={[
              { key: 'title', header: t('founder.common.title') },
              { key: 'severity', header: t('founder.team.col.severity'), render: (a) => <StatusPill status={a.severity} /> },
              { key: 'dueDate', header: t('founder.common.due'), render: (a) => formatDate(a.dueDate, lang) },
            ]}
          />
        </Card>
      </div>

      <Card title={t('founder.home.money')} footer={<p className="founder-note">{t('founder.home.moneyNote')}</p>}>
        <KeyValue
          columns={2}
          items={[
            { key: t('founder.home.money.in'), value: formatCop(money.owedIn, lang) },
            { key: t('founder.home.money.out'), value: formatCop(money.owedOut, lang) },
            { key: t('founder.home.money.overdue'), value: money.overdue },
            { key: t('founder.home.money.budget'), value: formatCop(money.budget, lang) },
          ]}
        />
      </Card>
    </div>
  );
}
