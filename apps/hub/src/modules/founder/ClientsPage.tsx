import { useMemo, useState } from 'react';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useTable } from '../../data/DataContext';
import type { Document, Meeting, Payment, Project } from '../../data/schema';
import { daysUntil, formatCop, formatDate, formatDateTime } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import './founder.css';
import { phaseTone } from './pipelineData';
import { clientsSpec } from './specs';

interface ClientRow {
  name: string;
  projects: Project[];
  budgetCop: number;
  outstandingCop: number;
  nextMeeting: Meeting | null;
}

export function ClientsPage() {
  const { t, lang } = useT();
  const { rows: projects, loading } = useTable('projects', { orderBy: 'name' });
  const { rows: payments } = useTable('payments');
  const { rows: meetings } = useTable('meetings', { orderBy: 'startsAt' });
  const { rows: documents } = useTable('documents');
  const [q, setQ] = useState('');
  const [openName, setOpenName] = useState<string | null>(null);

  const clients = useMemo<ClientRow[]>(() => {
    const byClient = new Map<string, Project[]>();
    for (const p of projects) byClient.set(p.client, [...(byClient.get(p.client) ?? []), p]);
    return [...byClient.entries()]
      .map(([name, list]) => {
        const ids = new Set(list.map((p) => p.id));
        const outstandingCop = payments
          .filter((pay) => pay.direction === 'in' && pay.status !== 'paid' && ((pay.projectId && ids.has(pay.projectId)) || pay.counterparty === name))
          .reduce((n, pay) => n + Math.max(0, pay.amountCop - pay.paidCop), 0);
        const nextMeeting = meetings.find((m) => m.projectId !== null && ids.has(m.projectId) && daysUntil(m.startsAt) >= 0) ?? null;
        return { name, projects: list, budgetCop: list.reduce((n, p) => n + p.budgetCop, 0), outstandingCop, nextMeeting };
      })
      .sort((a, b) => b.budgetCop - a.budgetCop);
  }, [projects, payments, meetings]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return clients;
    return clients.filter((c) => `${c.name} ${c.projects.map((p) => p.name).join(' ')}`.toLowerCase().includes(needle));
  }, [clients, q]);

  const open = useMemo(() => clients.find((c) => c.name === openName) ?? null, [clients, openName]);
  const openIds = useMemo(() => new Set(open?.projects.map((p) => p.id) ?? []), [open]);

  const openPayments = payments.filter((p) => (p.projectId && openIds.has(p.projectId)) || (open && p.counterparty === open.name));
  const openMeetings = meetings.filter((m) => m.projectId !== null && openIds.has(m.projectId));
  const openDocs = documents.filter((d: Document) => d.projectId !== null && openIds.has(d.projectId));

  const totals = useMemo(
    () => ({ budget: clients.reduce((n, c) => n + c.budgetCop, 0), outstanding: clients.reduce((n, c) => n + c.outstandingCop, 0) }),
    [clients],
  );

  return (
    <div className="founder-page">
      <PageHeader
        code={clientsSpec.code}
        title={t('founder.clients.title')}
        subtitle={t('founder.clients.desc')}
        breadcrumb={[{ label: t('founder.nav.home'), to: '/founder' }, { label: t('founder.clients.title') }]}
        actions={
          <Placeholder what={t('founder.pipeline.newLeadWhat')}>
            <Button variant="primary">{t('founder.pipeline.newLead')}</Button>
          </Placeholder>
        }
      />

      <ul className="founder-stats">
        <li>
          <StatTile label={t('founder.clients.stat.clients')} value={clients.length} glyph="◆" />
        </li>
        <li>
          <StatTile label={t('founder.clients.stat.budget')} value={formatCop(totals.budget, lang)} tone="accent" glyph="▦" />
        </li>
        <li>
          <StatTile label={t('founder.clients.stat.outstanding')} value={formatCop(totals.outstanding, lang)} tone={totals.outstanding > 0 ? 'warning' : 'success'} glyph="▣" />
        </li>
      </ul>

      <FilterBar onClear={() => setQ('')}>
        <SearchField value={q} onChange={setQ} />
      </FilterBar>

      <DataTable<ClientRow>
        caption={t('founder.clients.caption')}
        rows={filtered}
        rowKey={(c) => c.name}
        loading={loading}
        emptyTitle={t('founder.clients.empty')}
        onRowActivate={(c) => setOpenName(c.name)}
        initialSort={{ key: 'budgetCop', dir: 'desc' }}
        columns={[
          { key: 'name', header: t('founder.common.client'), sortable: true },
          { key: 'projects', header: t('founder.clients.col.projects'), render: (c) => c.projects.map((p) => p.name).join(', ') },
          { key: 'budgetCop', header: t('founder.common.budget'), align: 'end', sortable: true, render: (c) => formatCop(c.budgetCop, lang) },
          { key: 'outstandingCop', header: t('founder.clients.col.outstanding'), align: 'end', sortable: true, render: (c) => formatCop(c.outstandingCop, lang) },
          { key: 'nextMeeting', header: t('founder.clients.col.next'), render: (c) => (c.nextMeeting ? formatDateTime(c.nextMeeting.startsAt, lang) : t('founder.clients.noneScheduled')) },
        ]}
        rowActions={[{ id: 'open', label: t('founder.approvals.open'), onClick: (c) => setOpenName(c.name), variant: 'secondary' }]}
      />

      <Drawer
        open={open !== null}
        onClose={() => setOpenName(null)}
        title={open?.name ?? ''}
        footer={
          <div className="founder-actions">
            <Placeholder what={t('founder.clients.noteWhat')}>
              <Button variant="primary">{t('founder.clients.note')}</Button>
            </Placeholder>
            <Button variant="secondary" onClick={() => setOpenName(null)}>
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
                { key: t('founder.common.budget'), value: formatCop(open.budgetCop, lang) },
                { key: t('founder.clients.col.outstanding'), value: formatCop(open.outstandingCop, lang) },
              ]}
            />
            <DataTable<Project>
              caption={t('founder.clients.drawerProjects')}
              rows={open.projects}
              rowKey={(p) => p.id}
              dense
              columns={[
                { key: 'name', header: t('founder.common.project') },
                { key: 'phase', header: t('founder.common.phase'), render: (p) => <Badge tone={phaseTone(p.phase)}>{t(`founder.phase.${p.phase}`)}</Badge> },
                { key: 'approval', header: t('founder.common.approval'), render: (p) => <StatusPill status={p.approval} /> },
              ]}
            />
            <DataTable<Payment>
              caption={t('founder.clients.drawerPayments')}
              rows={openPayments}
              rowKey={(p) => p.id}
              dense
              columns={[
                { key: 'concept', header: t('founder.common.title') },
                { key: 'amountCop', header: t('founder.common.amount'), align: 'end', render: (p) => formatCop(p.amountCop, lang) },
                { key: 'dueDate', header: t('founder.common.due'), render: (p) => formatDate(p.dueDate, lang) },
                { key: 'status', header: t('founder.common.status'), render: (p) => <StatusPill status={p.status} /> },
              ]}
            />
            <DataTable<Meeting>
              caption={t('founder.clients.drawerMeetings')}
              rows={openMeetings}
              rowKey={(m) => m.id}
              dense
              emptyTitle={t('founder.clients.noneScheduled')}
              columns={[
                { key: 'title', header: t('founder.common.title') },
                { key: 'startsAt', header: t('founder.common.date'), render: (m) => formatDateTime(m.startsAt, lang) },
                { key: 'kind', header: t('founder.common.type'), render: (m) => t(`founder.meeting.kind.${m.kind}`) },
              ]}
            />
            <DataTable<Document>
              caption={t('founder.clients.drawerDocs')}
              rows={openDocs}
              rowKey={(d) => d.id}
              dense
              columns={[
                { key: 'title', header: t('founder.common.title') },
                { key: 'status', header: t('founder.common.status'), render: (d) => <StatusPill status={d.status} /> },
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
