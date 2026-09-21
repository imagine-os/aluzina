import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRoutes } from '../../app/RoutesContext';
import { demoUserForRole } from '../../auth/demoUsers';
import { ROLE_META, ROLES, type RoleId } from '../../auth/roles';
import { ROLE_PERMISSIONS } from '../../auth/permissions';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { useTable } from '../../data/DataContext';
import type { Client, Deliverable, Relation, Tool } from '../../data/schema';
import { useT } from '../../i18n/I18nProvider';
import type { Surface } from '../../specs/PageSpec';
import { catalogSpec } from './specs';
import './spaces.css';

type Tab = 'deliverables' | 'clients' | 'tools' | 'roles';
const TABS: Tab[] = ['deliverables', 'clients', 'tools', 'roles'];
const CODE_RE = /^([A-Z]+-\d{2})/;

function relationCount(relations: Relation[], type: string, id: string): number {
  return relations.filter((r) => (r.fromType === type && r.fromId === id) || (r.toType === type && r.toId === id)).length;
}

interface RoleRow {
  role: RoleId;
}

/** K-05: deliverables, clients, tools and roles as tables over the catalog entities (D-029). */
export function CatalogPage({ surface }: { surface: Surface }) {
  const { t } = useT();
  const navigate = useNavigate();
  const routes = useRoutes();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.includes(params.get('tab') as Tab) ? params.get('tab') : 'deliverables') as Tab;
  const deliverables = useTable('deliverables');
  const clients = useTable('clients');
  const tools = useTable('tools');
  const relations = useTable('relations');
  const spaces = useTable('spaces');
  const projects = useTable('projects');
  const base = `/${surface}/spaces`;
  const spec = catalogSpec(surface);
  const workSurface = surface === 'dev' ? 'founder' : surface;

  const routeByCode = useMemo(() => new Map(routes.filter((r) => r.surface !== 'dev' || surface === 'dev').map((r) => [r.code, r.path])), [routes, surface]);
  const pathForCode = (code: string): string | null => {
    // prefer the route on this surface (Work / Spaces mount everywhere), then any surface
    const own = routes.find((r) => r.code === code && r.surface === surface && !r.path.includes(':'));
    if (own) return own.path;
    const any = routes.find((r) => r.code === code && !r.path.includes(':'));
    return any?.path ?? routeByCode.get(code) ?? null;
  };
  const spaceAbout = (type: string, id: string) => spaces.rows.find((s) => s.aboutType === type && s.aboutId === id);

  const deliverableCols: Column<Deliverable>[] = [
    { key: 'name', header: t('spaces.cat.name'), sortable: true, render: (d) => <strong>{d.name}</strong> },
    { key: 'phase', header: t('spaces.cat.phase'), sortable: true, render: (d) => <Badge>{t(`spaces.phase.${d.phase}`)}</Badge> },
    { key: 'ownerRole', header: t('spaces.cat.owner'), sortable: true, render: (d) => t(`core.role.${d.ownerRole}`) },
    { key: 'typicalDays', header: t('spaces.cat.typicalDays'), sortable: true, align: 'end', render: (d) => (d.typicalDays === null ? t('spaces.unknown') : String(d.typicalDays)) },
    { key: 'status', header: t('spaces.cat.status'), sortable: true, render: (d) => <StatusPill status={d.status} /> },
    { key: 'relations', header: t('spaces.relations'), align: 'end', sortValue: (d) => relationCount(relations.rows, 'deliverables', d.id), render: (d) => String(relationCount(relations.rows, 'deliverables', d.id)) },
    {
      key: 'template',
      header: t('spaces.cat.template'),
      render: (d) => {
        const code = d.templateDocKind && CODE_RE.test(d.templateDocKind) ? d.templateDocKind : null;
        const path = code ? pathForCode(code) : null;
        if (path) return <Button size="sm" href={`#${path}`} iconEnd="›">{t('spaces.cat.openPage', { code: code ?? '' })}</Button>;
        return (
          <Placeholder what={t('spaces.cat.templateWhat', { name: d.name })}>
            <Button size="sm">{t('spaces.cat.openTemplate')}</Button>
          </Placeholder>
        );
      },
    },
  ];

  const clientCols: Column<Client>[] = [
    { key: 'name', header: t('spaces.cat.name'), sortable: true, render: (c) => <strong>{c.name}</strong> },
    { key: 'kind', header: t('spaces.cat.kind'), sortable: true, render: (c) => <StatusPill status={c.kind} /> },
    { key: 'sector', header: t('spaces.cat.sector'), sortable: true, render: (c) => c.sector ?? <span className="spaces-muted">{t('spaces.unknown')}</span> },
    { key: 'city', header: t('spaces.cat.city'), sortable: true, render: (c) => c.city ?? <span className="spaces-muted">{t('spaces.unknown')}</span> },
    { key: 'contactName', header: t('spaces.cat.contact'), render: (c) => c.contactName ?? <span className="spaces-muted">{t('spaces.unknown')}</span> },
    {
      key: 'projects',
      header: t('spaces.cat.projects'),
      render: (c) =>
        c.projectIds.length === 0 ? (
          <span className="spaces-muted">{t('spaces.unknown')}</span>
        ) : (
          <span className="spaces-inline-links">
            {c.projectIds.map((pid) => (
              <Button key={pid} size="sm" variant="ghost" href={`#/${workSurface}/work/${pid}`} iconEnd="›">{projects.rows.find((p) => p.id === pid)?.name ?? pid}</Button>
            ))}
          </span>
        ),
    },
    { key: 'relations', header: t('spaces.relations'), align: 'end', sortValue: (c) => relationCount(relations.rows, 'clients', c.id), render: (c) => String(relationCount(relations.rows, 'clients', c.id)) },
    {
      key: 'space',
      header: t('spaces.cat.space'),
      render: (c) => {
        const s = spaceAbout('clients', c.id);
        return s ? <Button size="sm" variant="ghost" href={`#${base}/${s.id}`} icon={s.glyph}>{s.name}</Button> : <span className="spaces-muted">—</span>;
      },
    },
  ];

  const toolCols: Column<Tool>[] = [
    { key: 'name', header: t('spaces.cat.name'), sortable: true, render: (x) => <strong>{x.name}</strong> },
    { key: 'vendor', header: t('spaces.cat.vendor'), sortable: true },
    { key: 'category', header: t('spaces.cat.category'), sortable: true, render: (x) => <Badge>{t(`spaces.toolCategory.${x.category}`)}</Badge> },
    { key: 'usedFor', header: t('spaces.cat.usedFor') },
    { key: 'status', header: t('spaces.cat.status'), sortable: true, render: (x) => <StatusPill status={x.status} /> },
    {
      key: 'replacedByModule',
      header: t('spaces.cat.replacedBy'),
      render: (x) => {
        if (!x.replacedByModule) return <span className="spaces-muted">{t('spaces.cat.noReplacement')}</span>;
        const m = CODE_RE.exec(x.replacedByModule);
        const path = m ? pathForCode(m[1]) : null;
        return path ? <Button size="sm" href={`#${path}`} iconEnd="›">{x.replacedByModule}</Button> : <span>{x.replacedByModule}</span>;
      },
    },
    { key: 'notes', header: t('spaces.cat.notes'), render: (x) => <span className="spaces-muted">{x.notes}</span> },
  ];

  const roleRows: RoleRow[] = ROLES.map((role) => ({ role }));
  const roleCols: Column<RoleRow>[] = [
    { key: 'role', header: t('spaces.cat.role'), render: ({ role }) => <strong>{t(ROLE_META[role].labelKey)}</strong> },
    { key: 'portal', header: t('spaces.cat.portal'), render: ({ role }) => <Button size="sm" variant="ghost" href={`#${ROLE_META[role].homePath}`} iconEnd="›">{t(ROLE_META[role].portalKey)}</Button> },
    { key: 'code', header: t('spaces.cat.dashboard'), render: ({ role }) => <Badge>{ROLE_META[role].homeCode}</Badge> },
    { key: 'permissions', header: t('spaces.cat.permissions'), align: 'end', render: ({ role }) => (ROLE_PERMISSIONS[role]?.includes('*') ? t('spaces.cat.allPermissions') : String(ROLE_PERMISSIONS[role]?.length ?? 0)) },
    { key: 'user', header: t('spaces.cat.demoUser'), render: ({ role }) => demoUserForRole(role)?.name ?? <span className="spaces-muted">—</span> },
    {
      key: 'space',
      header: t('spaces.cat.space'),
      render: ({ role }) => {
        const s = spaceAbout('roles', role);
        return s ? <Button size="sm" variant="ghost" href={`#${base}/${s.id}`} icon={s.glyph}>{s.name}</Button> : <span className="spaces-muted">—</span>;
      },
    },
  ];

  const toolCount = (status: Tool['status']) => tools.rows.filter((x) => x.status === status).length;

  return (
    <div className="spaces-page">
      <PageHeader code={spec.code} title={t('spaces.catalog')} subtitle={t('spaces.catalogSubtitle')} breadcrumb={[{ label: t(`core.portal.${surface}`), to: `/${surface}` }, { label: t('spaces.title'), to: base }, { label: t('spaces.catalog') }]} />
      <Tabs
        label={t('spaces.catalog')}
        value={tab}
        onChange={(id) => setParams({ tab: id }, { replace: true })}
        tabs={[
          { id: 'deliverables', label: t('spaces.deliverables'), count: deliverables.rows.length },
          { id: 'clients', label: t('spaces.clients'), count: clients.rows.length },
          { id: 'tools', label: t('spaces.tools'), count: tools.rows.length },
          { id: 'roles', label: t('spaces.roles'), count: ROLES.length },
        ]}
      >
        {tab === 'deliverables' && (
          <div className="spaces-catalog">
            <p className="spaces-muted">{t('spaces.deliverablesHint')}</p>
            <DataTable caption={t('spaces.deliverables')} columns={deliverableCols} rows={deliverables.rows} rowKey={(d) => d.id} loading={deliverables.loading} initialSort={{ key: 'phase', dir: 'asc' }} dense />
          </div>
        )}
        {tab === 'clients' && (
          <div className="spaces-catalog">
            <p className="spaces-muted">{t('spaces.clientsHint')}</p>
            <DataTable caption={t('spaces.clients')} columns={clientCols} rows={clients.rows} rowKey={(c) => c.id} loading={clients.loading} initialSort={{ key: 'kind', dir: 'asc' }} dense />
          </div>
        )}
        {tab === 'tools' && (
          <div className="spaces-catalog">
            <div className="spaces-stats" role="group" aria-label={t('spaces.dependencyMap')}>
              <StatTile label={t('core.status.in-use')} value={toolCount('in-use')} tone="accent" glyph="◌" />
              <StatTile label={t('core.status.to-replace')} value={toolCount('to-replace')} tone="warning" glyph="⇥" />
              <StatTile label={t('core.status.replaced')} value={toolCount('replaced')} tone="success" glyph="✓" />
              <StatTile label={t('core.status.planned')} value={toolCount('planned') + toolCount('evaluating')} tone="neutral" glyph="◇" />
            </div>
            <p className="spaces-muted">{t('spaces.toolsHint')}</p>
            <DataTable caption={t('spaces.tools')} columns={toolCols} rows={tools.rows} rowKey={(x) => x.id} loading={tools.loading} initialSort={{ key: 'status', dir: 'asc' }} dense />
          </div>
        )}
        {tab === 'roles' && (
          <div className="spaces-catalog">
            <p className="spaces-muted">{t('spaces.rolesHint')}</p>
            <DataTable caption={t('spaces.roles')} columns={roleCols} rows={roleRows} rowKey={(r) => r.role} onRowActivate={(r) => navigate(ROLE_META[r.role].homePath)} dense />
          </div>
        )}
      </Tabs>
    </div>
  );
}
