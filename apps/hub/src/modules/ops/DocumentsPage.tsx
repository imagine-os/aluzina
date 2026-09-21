import { useMemo, useState } from 'react';
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
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useData, useTable } from '../../data/DataContext';
import type { Document as Doc, DocumentKind, DocumentStatus } from '../../data/schema';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { useLookups } from './helpers';
import './ops.css';
import { documentsSpec } from './specs';

const KINDS: DocumentKind[] = ['contract', 'invoice', 'plan', 'project-pdf', 'report', 'spec', 'brief', 'quote'];
const STATUSES: DocumentStatus[] = ['draft', 'final', 'sent', 'signed'];

function nextStatus(status: DocumentStatus): DocumentStatus | null {
  const i = STATUSES.indexOf(status);
  return i >= 0 && i < STATUSES.length - 1 ? STATUSES[i + 1] : null;
}

export function DocumentsPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { projectName } = useLookups();
  const { rows: documents, loading } = useTable('documents', { orderBy: 'title' });
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      documents.filter((d) => {
        if (query && !d.title.toLowerCase().includes(query.toLowerCase())) return false;
        if (kind && d.kind !== kind) return false;
        if (status && d.status !== status) return false;
        return true;
      }),
    [documents, query, kind, status],
  );

  const open = openId ? documents.find((d) => d.id === openId) ?? null : null;

  const advance = async (d: Doc) => {
    const next = nextStatus(d.status);
    if (!next) return;
    await data.update('documents', d.id, { status: next });
    toast(t('ops.documents.advanced'));
  };

  return (
    <div className="ops-stack">
      <PageHeader
        code={documentsSpec.code}
        title={t('ops.documents.title')}
        subtitle={t('ops.documents.subtitle')}
        breadcrumb={[{ label: t('ops.nav.home'), to: '/ops' }, { label: t('ops.documents.title') }]}
        actions={
          <Placeholder what={t('ops.documents.uploadWhat')}>
            <Button variant="primary">{t('ops.documents.upload')}</Button>
          </Placeholder>
        }
      />

      <FilterBar
        onClear={() => {
          setQuery('');
          setKind('');
          setStatus('');
        }}
        summary={t('ops.common.count', { n: filtered.length, total: documents.length })}
      >
        <SearchField value={query} onChange={setQuery} placeholder={t('ops.documents.searchPlaceholder')} />
        <Select
          className="ops-filter-field"
          label={t('ops.documents.kind')}
          hideLabel
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          options={[{ value: '', label: t('ops.documents.allKinds') }, ...KINDS.map((k) => ({ value: k, label: t(`ops.documents.kind.${k}`) }))]}
        />
        <Select
          className="ops-filter-field"
          label={t('ops.common.status')}
          hideLabel
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[{ value: '', label: t('ops.common.allStatuses') }, ...STATUSES.map((s) => ({ value: s, label: t(`core.status.${s}`) }))]}
        />
      </FilterBar>

      <DataTable<Doc>
        caption={t('ops.documents.table')}
        rows={filtered}
        rowKey={(d) => d.id}
        loading={loading}
        emptyTitle={t('ops.common.empty')}
        initialSort={{ key: 'title', dir: 'asc' }}
        onRowActivate={(d) => setOpenId(d.id)}
        columns={[
          { key: 'title', header: t('ops.documents.col.title'), sortable: true },
          { key: 'kind', header: t('ops.documents.col.kind'), render: (d) => t(`ops.documents.kind.${d.kind}`) },
          { key: 'projectId', header: t('ops.common.project'), render: (d) => projectName(d.projectId) ?? t('ops.common.internal') },
          { key: 'ownerRole', header: t('ops.common.owner'), render: (d) => t(`core.role.${d.ownerRole}`) },
          { key: 'version', header: t('ops.documents.col.version'), align: 'end', sortable: true, render: (d) => `v${d.version}` },
          { key: 'status', header: t('ops.common.status'), render: (d) => <StatusPill status={d.status} /> },
        ]}
        rowActions={
          can('documents.manage')
            ? [{ id: 'advance', label: t('ops.documents.advance'), onClick: advance, when: (d: Doc) => nextStatus(d.status) !== null }]
            : undefined
        }
      />

      <Drawer open={open !== null} onClose={() => setOpenId(null)} title={open?.title ?? t('ops.common.detail')}>
        {open && (
          <>
            <div className="ops-badges">
              <StatusPill status={open.status} />
              <Badge tone="neutral">{t(`ops.documents.kind.${open.kind}`)}</Badge>
              <Badge tone="info">{`v${open.version}`}</Badge>
            </div>
            <KeyValue
              columns={1}
              items={[
                { key: t('ops.common.project'), value: projectName(open.projectId) ?? t('ops.common.internal') },
                { key: t('ops.common.owner'), value: t(`core.role.${open.ownerRole}`) },
                { key: t('ops.documents.col.version'), value: `v${open.version}` },
                { key: t('ops.common.due'), value: formatDate(open.updated_at, lang) },
              ]}
            />
            <div className="ops-drawer-section">
              <div className="ops-row">
                <Placeholder what={t('ops.documents.openFileWhat')}>
                  <Button>{t('ops.documents.openFile')}</Button>
                </Placeholder>
                {can('documents.manage') && nextStatus(open.status) && (
                  <Button variant="primary" onClick={() => advance(open)}>
                    {t('ops.documents.advance')}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
