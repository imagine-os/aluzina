import { demoUserById } from '../../auth/demoUsers';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { PresenceBar } from '../../components/molecule/PresenceBar/PresenceBar';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { useData, useTable } from '../../data/DataContext';
import { DATA_CHANNEL } from '../../data/MockProvider';
import { useT } from '../../i18n/I18nProvider';
import { EXPIRE_MS, HEARTBEAT_MS, PRESENCE_CHANNEL, usePresence } from '../../presence/PresenceProvider';
import { useWorkLabels } from '../../work/labels';
import './dev.css';
import { multiuserSpec } from './specs';

const TABS = [
  { as: 'ops', route: '/ops/work' },
  { as: 'studio', route: '/studio/work' },
  { as: 'founder', route: '/founder/work' },
  { as: 'brand', route: '/brand/work' },
];

/** D-04: how to try the multiuser seam with two tabs, who is here right now and the last 20 activity rows. */
export function MultiuserPage() {
  const { t } = useT();
  const data = useData();
  const { people, tabId } = usePresence();
  const labels = useWorkLabels();
  const { rows: activity } = useTable('activity', { orderBy: 'at', dir: 'desc', limit: 20 });
  const { rows: tasks } = useTable('tasks');
  const base = `${window.location.pathname}`;

  return (
    <div className="dev-stack">
      <PageHeader code={multiuserSpec.code} title={t('dev.multiuser.title')} subtitle={t('dev.multiuser.subtitle')} breadcrumb={[{ label: t('core.portal.dev'), to: '/dev/components' }, { label: t('dev.nav.multiuser') }]} />

      <Card title={t('dev.multiuser.howTitle')}>
        <ol className="dev-steps">
          <li>{t('dev.multiuser.step1')}</li>
          <li>{t('dev.multiuser.step2')}</li>
          <li>{t('dev.multiuser.step3')}</li>
        </ol>
        <div className="dev-actions">
          {TABS.map((x) => (
            <Button key={x.as} href={`${base}?as=${x.as}#${x.route}`} external icon="↗">
              {t('dev.multiuser.openAs', { role: t(`core.role.${x.as}`) })}
            </Button>
          ))}
          <Button
            variant="danger"
            onClick={async () => {
              await data.reset();
              toast(t('dev.multiuser.resetDone'));
            }}
          >
            {t('dev.multiuser.reset')}
          </Button>
        </div>
        <KeyValue
          columns={2}
          items={[
            { key: t('dev.multiuser.dataChannel'), value: <code>{DATA_CHANNEL}</code> },
            { key: t('dev.multiuser.presenceChannel'), value: <code>{PRESENCE_CHANNEL}</code> },
            { key: t('dev.multiuser.heartbeat'), value: `${HEARTBEAT_MS / 1000} s / ${EXPIRE_MS / 1000} s` },
            { key: t('dev.multiuser.thisTab'), value: <code>{tabId}</code> },
          ]}
        />
      </Card>

      <Card title={t('dev.multiuser.presenceTitle')} subtitle={t('dev.multiuser.presenceSub', { n: people.length })}>
        <PresenceBar people={people} />
        <DataTable
          caption={t('dev.multiuser.presenceTitle')}
          rows={people}
          rowKey={(p) => p.id}
          dense
          columns={[
            { key: 'name', header: t('dev.multiuser.col.person'), render: (p) => (p.self ? `${p.name} (${t('core.presence.you')})` : p.name) },
            { key: 'route', header: t('dev.multiuser.col.route'), render: (p) => <code>{p.route ?? '—'}</code> },
            { key: 'tabs', header: t('dev.multiuser.col.tabs') },
            { key: 'at', header: t('dev.multiuser.col.seen'), render: (p) => (p.self ? t('core.work.ago.now') : labels.ago(new Date(p.at).toISOString())) },
          ]}
        />
      </Card>

      <Card title={t('dev.multiuser.activityTitle')} subtitle={t('dev.multiuser.activitySub')}>
        <DataTable
          caption={t('dev.multiuser.activityTitle')}
          rows={activity}
          rowKey={(a) => a.id}
          dense
          columns={[
            { key: 'at', header: t('dev.multiuser.col.when'), render: (a) => labels.ago(a.at) },
            { key: 'actorId', header: t('dev.multiuser.col.actor'), render: (a) => (a.actorId && demoUserById(a.actorId)?.name) ?? '—' },
            { key: 'entityId', header: t('dev.multiuser.col.row'), render: (a) => <span>{a.entity === 'tasks' ? tasks.find((x) => x.id === a.entityId)?.title ?? a.entityId : `${a.entity}/${a.entityId}`}</span> },
            { key: 'field', header: t('dev.multiuser.col.field'), render: (a) => <Badge>{a.field}</Badge> },
            { key: 'to', header: t('dev.multiuser.col.change'), render: (a) => `${a.from ?? '—'} → ${a.to ?? '—'}` },
          ]}
        />
      </Card>
    </div>
  );
}
