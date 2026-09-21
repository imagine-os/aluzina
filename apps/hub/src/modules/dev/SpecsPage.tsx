import { useMemo, useState } from 'react';
import { useRoutes } from '../../app/RoutesContext';
import { Badge } from '../../components/atom/Badge/Badge';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useT } from '../../i18n/I18nProvider';
import { specCompleteness, SURFACES, type RouteDef } from '../../specs/PageSpec';
import { specsSpec } from './specs';
import './dev.css';

export function SpecsPage() {
  const { t } = useT();
  const routes = useRoutes();
  const [q, setQ] = useState('');
  const [surface, setSurface] = useState('');
  const [open, setOpen] = useState<RouteDef | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return routes
      .filter((r) => (!surface || r.surface === surface) && (!needle || `${r.code} ${r.spec.name} ${r.path} ${r.spec.roles.join(' ')}`.toLowerCase().includes(needle)))
      .map((r) => ({ ...r, completeness: specCompleteness(r) }));
  }, [routes, q, surface]);

  const built = routes.filter((r) => r.status === 'built').length;
  const actions = routes.reduce((n, r) => n + r.spec.actions.length, 0);
  const sel = open ? specCompleteness(open) : null;

  return (
    <>
      <PageHeader code={specsSpec.code} title={t('dev.specs.title')} subtitle={t('dev.specs.subtitle')} breadcrumb={[{ label: t('core.portal.dev'), to: '/dev/components' }, { label: t('dev.specs.title') }]} />
      <div className="dev-stats">
        <StatTile label={t('dev.specs.routes')} value={routes.length} tone="accent" />
        <StatTile label={t('dev.specs.built')} value={built} tone="success" />
        <StatTile label={t('dev.specs.stubs')} value={routes.length - built} tone="warning" />
        <StatTile label={t('dev.specs.actions')} value={actions} tone="info" />
      </div>
      <FilterBar onClear={q || surface ? () => { setQ(''); setSurface(''); } : undefined} summary={t('dev.summary', { shown: rows.length, total: routes.length })}>
        <SearchField value={q} onChange={setQ} placeholder={t('dev.specs.search')} />
        <Select label={t('dev.specs.surface')} hideLabel value={surface} onChange={(e) => setSurface(e.target.value)} placeholder={t('dev.specs.allSurfaces')} options={SURFACES.map((s) => ({ value: s, label: s }))} />
      </FilterBar>
      <DataTable
        caption={t('dev.specs.title')}
        rows={rows}
        rowKey={(r) => r.path}
        initialSort={{ key: 'code', dir: 'asc' }}
        onRowActivate={(r) => setOpen(r)}
        columns={[
          { key: 'code', header: t('dev.specs.col.code'), sortable: true, render: (r) => <code>{r.code}</code> },
          { key: 'name', header: t('dev.specs.col.name'), sortable: true, sortValue: (r) => r.spec.name, render: (r) => r.spec.name },
          { key: 'path', header: t('dev.specs.col.path'), render: (r) => <code>#{r.path}</code> },
          { key: 'surface', header: t('dev.specs.col.surface'), sortable: true },
          { key: 'status', header: t('dev.specs.col.status'), sortable: true, render: (r) => <StatusPill status={r.status} /> },
          { key: 'roles', header: t('dev.specs.col.roles'), render: (r) => r.spec.roles.join(', ') },
          { key: 'actions', header: t('dev.specs.col.actions'), sortable: true, align: 'end', sortValue: (r) => r.spec.actions.length, render: (r) => r.spec.actions.length },
          { key: 'completeness', header: t('dev.specs.col.completeness'), sortable: true, sortValue: (r) => r.completeness.score, render: (r) => <Badge tone={r.completeness.missing.length === 0 ? 'success' : r.completeness.score >= 6 ? 'accent' : 'warning'}>{r.completeness.score}/{r.completeness.total}</Badge> },
        ]}
      />
      <Drawer open={open !== null} onClose={() => setOpen(null)} title={open ? `${open.code} · ${open.spec.name}` : ''}>
        {open && sel && (
          <div className="dev-spec">
            <p>{open.spec.purpose}</p>
            <KeyValue
              columns={1}
              items={[
                { key: t('dev.specs.col.path'), value: <code>#{open.path}</code> },
                { key: t('dev.specs.col.surface'), value: open.surface },
                { key: t('dev.specs.col.status'), value: <StatusPill status={open.status} /> },
                { key: t('dev.specs.shell'), value: open.shell },
                { key: t('dev.specs.permission'), value: open.permission ? <code>{open.permission}</code> : '—' },
                { key: t('dev.specs.col.roles'), value: open.spec.roles.join(', ') },
                { key: t('dev.specs.navGroup'), value: open.spec.navGroup ?? '—' },
                { key: t('dev.specs.dataTables'), value: open.spec.dataTables.length ? open.spec.dataTables.join(', ') : '—' },
                { key: t('dev.specs.components'), value: open.spec.components.join(', ') },
                { key: t('core.dev.checkedAt'), value: open.spec.checkedAt.join(', ') || '—' },
                { key: t('dev.specs.col.completeness'), value: sel.missing.length ? t('dev.specs.missing', { items: sel.missing.join(', ') }) : t('dev.specs.complete') },
              ]}
            />
            <h4 className="dev-h4">{t('dev.specs.layout')}</h4>
            <ol className="dev-list">
              {open.spec.layout.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ol>
            <h4 className="dev-h4">{t('dev.specs.logic')}</h4>
            <ul className="dev-list">
              {open.spec.logic.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <h4 className="dev-h4">{t('core.dev.actions')}</h4>
            {open.spec.actions.length === 0 ? (
              <p className="dev-muted">{t('core.dev.noActions')}</p>
            ) : (
              <ul className="dev-actions">
                {open.spec.actions.map((a) => (
                  <li key={a.id}>
                    <code>{a.id}</code> · {a.label}
                    <div className="dev-muted">“{a.intent}”</div>
                    {a.permission && <div className="dev-muted">{t('core.dev.permission')}: <code>{a.permission}</code></div>}
                    {a.params && <div className="dev-muted">{t('core.dev.params')}: {Object.entries(a.params).map(([k, v]) => <code key={k}>{k}: {v} </code>)}</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
