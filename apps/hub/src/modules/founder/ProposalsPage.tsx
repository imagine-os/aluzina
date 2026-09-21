import { useMemo, useState } from 'react';
import { demoUserById } from '../../auth/demoUsers';
import { useCan } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { useData, useTable } from '../../data/DataContext';
import type { Document, Presentation, Project, Quote } from '../../data/schema';
import { formatCop, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import './founder.css';
import { proposalsSpec } from './specs';

/** Documents the founder writes herself (team.md: quotes, graphic proposals, project PDFs). */
const FOUNDER_DOC_KINDS = ['quote', 'project-pdf', 'brief'];
/** Supplier quotes worth a founder look before a negotiation. */
const REVIEWABLE_QUOTES = ['received', 'shortlisted', 'selected'];

type TabId = 'documents' | 'presentations' | 'quotes';

export function ProposalsPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { rows: documents, loading } = useTable('documents', { orderBy: 'title' });
  const { rows: presentations } = useTable('presentations', { orderBy: 'dueDate' });
  const { rows: quotes } = useTable('quotes', { orderBy: 'comparisonGroup' });
  const { rows: projects } = useTable('projects');
  const [tab, setTab] = useState<TabId>('documents');

  const projectName = useMemo(() => new Map(projects.map((p: Project) => [p.id, p.name])), [projects]);
  const nameOf = (id: string | null) => (id ? (projectName.get(id) ?? id) : t('founder.common.noProject'));

  const docs = useMemo(() => documents.filter((d) => FOUNDER_DOC_KINDS.includes(d.kind)), [documents]);
  const decks = useMemo(() => presentations.filter((p) => p.kind === 'proposal' || p.kind === 'sales'), [presentations]);
  const supplierQuotes = useMemo(() => quotes.filter((q) => REVIEWABLE_QUOTES.includes(q.status)), [quotes]);

  const finalise = async (d: Document) => {
    await data.update('documents', d.id, { status: 'final' });
    toast(t('founder.proposals.finalised', { title: d.title }));
  };
  const send = async (d: Document) => {
    await data.update('documents', d.id, { status: 'sent' });
    toast(t('founder.proposals.sent', { title: d.title }));
  };
  const signOff = async (p: Presentation) => {
    await data.update('presentations', p.id, { status: 'final' });
    toast(t('founder.proposals.signedOff', { title: p.title }));
  };
  const shortlist = async (q: Quote) => {
    await data.update('quotes', q.id, { status: 'shortlisted' });
    toast(t('founder.proposals.shortlisted'));
  };

  const mayWrite = can('proposals.write');
  const mayReview = can('quotes.review');

  return (
    <div className="founder-page">
      <PageHeader
        code={proposalsSpec.code}
        title={t('founder.proposals.title')}
        subtitle={t('founder.proposals.desc')}
        breadcrumb={[{ label: t('founder.nav.home'), to: '/founder' }, { label: t('founder.proposals.title') }]}
        actions={
          <Placeholder what={t('founder.proposals.newWhat')}>
            <Button variant="primary">{t('founder.proposals.new')}</Button>
          </Placeholder>
        }
      />

      <Tabs
        label={t('founder.proposals.tabs')}
        value={tab}
        onChange={(id) => setTab(id as TabId)}
        tabs={[
          { id: 'documents', label: t('founder.proposals.tab.documents'), count: docs.length },
          { id: 'presentations', label: t('founder.proposals.tab.presentations'), count: decks.length },
          { id: 'quotes', label: t('founder.proposals.tab.quotes'), count: supplierQuotes.length },
        ]}
      >
        {tab === 'documents' && (
          <Card>
            <DataTable<Document>
              caption={t('founder.proposals.docsCaption')}
              rows={docs}
              rowKey={(d) => d.id}
              loading={loading}
              emptyTitle={t('founder.proposals.emptyDocs')}
              columns={[
                { key: 'title', header: t('founder.common.title') },
                { key: 'kind', header: t('founder.proposals.col.kind'), render: (d) => <Badge tone="neutral">{t(`founder.proposals.kind.${d.kind}`)}</Badge> },
                { key: 'projectId', header: t('founder.common.project'), render: (d) => nameOf(d.projectId) },
                { key: 'version', header: t('founder.common.version'), align: 'end', sortable: true },
                { key: 'status', header: t('founder.common.status'), render: (d) => <StatusPill status={d.status} /> },
              ]}
              rowActions={
                mayWrite
                  ? [
                      { id: 'finalise', label: t('founder.proposals.finalise'), onClick: finalise, when: (d) => d.status === 'draft' },
                      { id: 'send', label: t('founder.proposals.send'), onClick: send, variant: 'primary', when: (d) => d.status === 'final' },
                    ]
                  : undefined
              }
            />
          </Card>
        )}

        {tab === 'presentations' && (
          <Card>
            <DataTable<Presentation>
              caption={t('founder.proposals.presCaption')}
              rows={decks}
              rowKey={(p) => p.id}
              emptyTitle={t('founder.proposals.emptyPres')}
              columns={[
                { key: 'title', header: t('founder.common.title') },
                { key: 'projectId', header: t('founder.common.project'), render: (p) => nameOf(p.projectId) },
                { key: 'ownerId', header: t('founder.common.owner'), render: (p) => demoUserById(p.ownerId)?.name ?? p.ownerId },
                { key: 'slideCount', header: t('founder.proposals.col.slides'), align: 'end', sortable: true },
                { key: 'dueDate', header: t('founder.common.due'), render: (p) => formatDate(p.dueDate, lang) },
                { key: 'status', header: t('founder.common.status'), render: (p) => <StatusPill status={p.status} /> },
              ]}
              rowActions={mayWrite ? [{ id: 'signOff', label: t('founder.proposals.signOff'), onClick: signOff, variant: 'primary', when: (p) => p.status === 'review' }] : undefined}
            />
          </Card>
        )}

        {tab === 'quotes' && (
          <Card footer={<p className="founder-note">{t('founder.proposals.quotesNote')}</p>}>
            <DataTable<Quote>
              caption={t('founder.proposals.quotesCaption')}
              rows={supplierQuotes}
              rowKey={(q) => q.id}
              emptyTitle={t('founder.proposals.emptyQuotes')}
              columns={[
                { key: 'comparisonGroup', header: t('founder.proposals.col.group'), sortable: true },
                { key: 'item', header: t('founder.proposals.col.item') },
                { key: 'projectId', header: t('founder.common.project'), render: (q) => nameOf(q.projectId) },
                { key: 'amountCop', header: t('founder.common.amount'), align: 'end', sortable: true, render: (q) => formatCop(q.amountCop, lang) },
                { key: 'leadTimeDays', header: t('founder.proposals.col.lead'), align: 'end', sortable: true },
                { key: 'validUntil', header: t('founder.proposals.col.valid'), render: (q) => formatDate(q.validUntil, lang) },
                { key: 'status', header: t('founder.common.status'), render: (q) => <StatusPill status={q.status} /> },
              ]}
              rowActions={mayReview ? [{ id: 'shortlist', label: t('founder.proposals.shortlist'), onClick: shortlist, when: (q) => q.status === 'received' }] : undefined}
            />
          </Card>
        )}
      </Tabs>
    </div>
  );
}
