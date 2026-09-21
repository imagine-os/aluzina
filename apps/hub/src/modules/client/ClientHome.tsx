import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { useSession } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Select } from '../../components/atom/Select/Select';
import { Skeleton } from '../../components/atom/Skeleton/Skeleton';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { useTable } from '../../data/DataContext';
import { CLIENT_JOURNEY, pick } from '../../domain';
import { formatCop } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import './client.css';
import { homeSpec } from './specs';
import { useMyProjects, type MyProject } from './useMyProjects';

/** Checklist progress of one project: the number is always written out, the bar only repeats it (P-01). */
export function Progress({ done, total, percent, label }: { done: number; total: number; percent: number; label: string }) {
  const { t } = useT();
  return (
    <div className="client-progress">
      <div className="client-progress__track" role="progressbar" aria-label={label} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <span className="client-progress__fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="client-progress__text">{t('client.home.progress', { done, total, percent })}</p>
    </div>
  );
}

/** The ten steps of `CLIENT_JOURNEY`, the current one highlighted from the project's pipeline status. */
function Journey({ current }: { current: number }) {
  const { t, lang } = useT();
  return (
    <ol className="client-journey" aria-label={t('client.home.journeyLabel')}>
      {CLIENT_JOURNEY.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        return (
          <li key={step.id} className={`client-journey__item client-journey__item--${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="client-journey__dot" aria-hidden="true">
              {state === 'done' ? '✓' : ''}
            </span>
            <span>{pick(step.label, lang)}</span>
            {state === 'current' && <Badge tone="accent">{t('client.home.step.current')}</Badge>}
            <span className="visually-hidden">{t(`client.home.step.${state}`)}</span>
          </li>
        );
      })}
    </ol>
  );
}

function nextStepText(t: (k: string, v?: Record<string, string | number>) => string, lang: 'en' | 'es', my: MyProject): string {
  if (!my.service) return t('client.home.noService');
  if (my.nextItem) return pick(my.nextItem, lang);
  if (my.nextPhase) return t('client.home.nextPhase', { phase: pick(my.nextPhase.title, lang) });
  return t('client.home.allDone');
}

/** C-01: the client app's home. Greeting, one card per project, what waits for the client, the journey. */
export function ClientHome() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const { user } = useSession();
  const { mine, projectIds, loading } = useMyProjects();
  const { rows: revisionItems } = useTable('revisionItems', { where: { projectId: projectIds } });
  const { rows: messages } = useTable('messages', { where: { projectId: projectIds } });
  const { rows: payments } = useTable('payments', { where: { projectId: projectIds } });
  const [focusId, setFocusId] = useState<string | null>(null);

  const focused = mine.find((m) => m.project.id === focusId) ?? mine[0];

  const waiting = useMemo(() => revisionItems.filter((r) => r.decidedAt === null).length, [revisionItems]);
  const unread = useMemo(() => messages.filter((m) => m.authorId !== user.id && !m.readBy.includes(user.id)).length, [messages, user.id]);
  const money = useMemo(() => {
    const open = payments.filter((p) => p.direction === 'in' && p.status !== 'paid');
    return { count: open.length, amount: open.reduce((n, p) => n + Math.max(0, p.amountCop - p.paidCop), 0) };
  }, [payments]);

  useRegisterActions({
    'client.openProject': ({ project }) => {
      const id = String(project ?? focused?.project.id ?? '');
      if (!mine.some((m) => m.project.id === id)) return `unknown project ${id}`;
      navigate(`/client/projects/${id}`);
      return `opened ${id}`;
    },
    'client.openApprovals': () => {
      navigate('/client/approvals');
      return 'opened approvals';
    },
    'client.openMessages': () => {
      navigate('/client/messages');
      return 'opened messages';
    },
    'client.selectProject': ({ project }) => {
      const id = String(project ?? '');
      if (!mine.some((m) => m.project.id === id)) return `unknown project ${id}`;
      setFocusId(id);
      return `focused ${id}`;
    },
  });

  return (
    <div className="client-page">
      <PageHeader code={homeSpec.code} title={t('client.home.greeting', { name: user.name })} subtitle={t('client.home.desc')} />

      {loading && <Skeleton lines={4} />}

      {!loading && mine.length === 0 && <EmptyState title={t('client.common.empty')} description={t('client.common.emptyDesc')} glyph="◇" />}

      {mine.map((my) => (
        <Card
          key={my.project.id}
          title={my.project.name}
          subtitle={my.service ? pick(my.service.name, lang) : undefined}
          onActivate={() => navigate(`/client/projects/${my.project.id}`)}
          aria-label={t('client.home.projectAria', { name: my.project.name })}
        >
          <div className="client-stack">
            <div className="client-row">
              <StatusPill status={my.project.pipelineStatus} />
              {my.currentPhase && <Badge tone="neutral">{pick(my.currentPhase.title, lang)}</Badge>}
            </div>
            <Progress done={my.done} total={my.total} percent={my.percent} label={t('client.home.progressLabel')} />
            <p className="client-note">
              <strong>{t('client.home.nextStep')}: </strong>
              {nextStepText(t, lang, my)}
            </p>
          </div>
        </Card>
      ))}

      {mine.length > 0 && (
        <Card title={t('client.home.openItems')}>
          <ul className="client-grid">
            <li>
              <StatTile
                label={t('client.home.stat.revisions')}
                value={waiting}
                hint={t('client.home.stat.revisionsHint')}
                tone={waiting > 0 ? 'warning' : 'success'}
                glyph="✓"
                onActivate={() => navigate('/client/approvals')}
              />
            </li>
            <li>
              <StatTile
                label={t('client.home.stat.unread')}
                value={unread}
                hint={t('client.home.stat.unreadHint')}
                tone={unread > 0 ? 'accent' : 'neutral'}
                glyph="✉"
                onActivate={() => navigate('/client/messages')}
              />
            </li>
            <li>
              <StatTile
                label={t('client.home.stat.payments')}
                value={money.count}
                hint={t('client.home.stat.paymentsHint', { amount: formatCop(money.amount, lang) })}
                tone={money.count > 0 ? 'warning' : 'success'}
                glyph="◆"
                onActivate={() => navigate('/client/payments')}
              />
            </li>
          </ul>
        </Card>
      )}

      {focused && (
        <Card title={t('client.home.journey')} subtitle={t('client.home.journeyDesc')}>
          <div className="client-stack">
            {mine.length > 1 && (
              <Select
                label={t('client.common.selectProject')}
                value={focused.project.id}
                onChange={(e) => setFocusId(e.target.value)}
                options={mine.map((m) => ({ value: m.project.id, label: m.project.name }))}
              />
            )}
            <Journey current={focused.journeyIndex} />
          </div>
        </Card>
      )}

      {mine.length > 0 && (
        <Card title={t('client.common.notMine')}>
          <p className="client-note">{t('client.common.notMineDesc')}</p>
          <div className="client-row">
            <Button variant="ghost" onClick={() => navigate('/client/messages')}>
              {t('client.project.message')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
