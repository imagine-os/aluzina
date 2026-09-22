import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
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
import { Thumb } from '../../components/molecule/Thumb/Thumb';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { DocumentViewer } from '../../components/organism/DocumentViewer/DocumentViewer';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useTable } from '../../data/DataContext';
import type { Asset, Client, Deliverable, Relation, Tool } from '../../data/schema';
import { FILE_TYPE_LABELS, fileTypeOf, isPreviewable, pick } from '../../domain';
import { useT } from '../../i18n/I18nProvider';
import type { Surface } from '../../specs/PageSpec';
import { catalogSpec } from './specs';
import './spaces.css';

type Tab = 'deliverables' | 'clients' | 'tools' | 'roles' | 'assets';
const TABS: Tab[] = ['deliverables', 'clients', 'tools', 'roles', 'assets'];
const CODE_RE = /^([A-Z]+-\d{2})/;

/** ar-17: the file family of an asset row, from the original file name when there is one. */
function typeOfAsset(a: Asset): ReturnType<typeof fileTypeOf> {
  return fileTypeOf(a.sourceName ?? a.title);
}

/** A row the shared viewer can show in place: served page renders, or a served PDF / image / video. */
function assetPreviewable(a: Asset): boolean {
  return a.previewUrls.length > 0 || Boolean(a.url && isPreviewable(typeOfAsset(a)));
}

function relationCount(relations: Relation[], type: string, id: string): number {
  return relations.filter((r) => (r.fromType === type && r.fromId === id) || (r.toType === type && r.toId === id)).length;
}

interface RoleRow {
  role: RoleId;
}

/** K-05: deliverables, clients, tools and roles as tables over the catalog entities (D-029). */
export function CatalogPage({ surface }: { surface: Surface }) {
  const { t, lang } = useT();
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
  const assets = useTable('assets');
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

  // ---- Assets (ar-17): the studio's published and company files as a catalog, with the shared viewer ----
  // `page` rows are the renders inside a document, not files of their own, so the list skips them.
  const assetRows = useMemo(() => assets.rows.filter((a) => a.kind !== 'page').sort((a, b) => a.title.localeCompare(b.title)), [assets.rows]);
  const [openAssetId, setOpenAssetId] = useState<string | null>(null);
  const openAsset = assetRows.find((a) => a.id === openAssetId) ?? null;
  const openType = openAsset ? typeOfAsset(openAsset) : 'other';
  const assetTitle = (a: Asset) => (lang === 'es' && a.titleEs ? a.titleEs : a.title);
  const preview = (a: Asset): string => {
    if (!assetPreviewable(a)) return 'not previewable: this asset has no served render; its source link opens it';
    setOpenAssetId(a.id);
    return a.id;
  };
  const closePreview = (): string => {
    setOpenAssetId(null);
    return 'closed';
  };
  useRegisterActions({
    'spaces.previewAsset': ({ asset }) => {
      const found = assetRows.find((a) => a.id === asset || a.slug === asset || a.title === asset);
      return found ? preview(found) : 'unknown asset';
    },
    'spaces.closeAssetPreview': () => closePreview(),
  });

  const assetCols: Column<Asset>[] = [
    {
      key: 'thumb',
      header: t('spaces.cat.preview'),
      width: '5.5rem',
      render: (a) => <Thumb className="spaces-cat__thumb" src={a.thumbnailUrl} alt={assetTitle(a)} type={typeOfAsset(a)} ratio="4:3" size="sm" iconLabel={pick(FILE_TYPE_LABELS[typeOfAsset(a)], lang)} />,
    },
    { key: 'title', header: t('spaces.cat.name'), sortable: true, sortValue: (a) => assetTitle(a), render: (a) => <strong>{assetTitle(a)}</strong> },
    { key: 'kind', header: t('spaces.cat.kind'), sortable: true, render: (a) => <Badge>{t(`spaces.assetKind.${a.kind}`)}</Badge> },
    { key: 'type', header: t('spaces.cat.fileType'), sortable: true, sortValue: (a) => typeOfAsset(a), render: (a) => pick(FILE_TYPE_LABELS[typeOfAsset(a)], lang) },
    { key: 'pageCount', header: t('spaces.cat.pages'), align: 'end', sortable: true, render: (a) => (a.pageCount ? String(a.pageCount) : <span className="spaces-muted">{t('spaces.unknown')}</span>) },
    { key: 'source', header: t('spaces.cat.source'), sortable: true, render: (a) => (a.source ? t(`spaces.assetSource.${a.source}`) : <span className="spaces-muted">{t('spaces.unknown')}</span>) },
    { key: 'relations', header: t('spaces.relations'), align: 'end', sortValue: (a) => relationCount(relations.rows, 'assets', a.id), render: (a) => String(relationCount(relations.rows, 'assets', a.id)) },
    {
      key: 'open',
      header: t('spaces.cat.open'),
      render: (a) => (
        <span className="spaces-inline-links">
          {assetPreviewable(a) && (
            <Button size="sm" icon="images" onClick={() => preview(a)} aria-label={t('spaces.previewAria', { title: assetTitle(a) })}>
              {t('spaces.preview')}
            </Button>
          )}
          {a.kind === 'document' && <Button size="sm" variant="ghost" href={`#/brand/documents?doc=${a.slug}`} iconEnd="›">{t('spaces.cat.openPage', { code: 'G-08' })}</Button>}
          {a.sourceUrl && <Button size="sm" variant="ghost" href={a.sourceUrl} external iconEnd="↗">{t('spaces.openSource')}</Button>}
          {!assetPreviewable(a) && !a.sourceUrl && a.kind !== 'document' && <span className="spaces-muted">{t('spaces.noFilePreview')}</span>}
        </span>
      ),
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
          { id: 'assets', label: t('spaces.assets'), count: assetRows.length },
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
        {tab === 'assets' && (
          <div className="spaces-catalog">
            <p className="spaces-muted">{t('spaces.assetsHint')}</p>
            <DataTable caption={t('spaces.assets')} columns={assetCols} rows={assetRows} rowKey={(a) => a.id} loading={assets.loading} onRowActivate={(a) => preview(a)} initialSort={{ key: 'kind', dir: 'asc' }} dense />
          </div>
        )}
      </Tabs>

      {/* ar-17: a previewable asset opens in the shared viewer here, not as a bare link out. */}
      <Drawer open={openAsset !== null} onClose={closePreview} title={openAsset ? assetTitle(openAsset) : ''}>
        {openAsset && (
          <>
            <DocumentViewer
              asset={{ title: assetTitle(openAsset), titleEs: openAsset.titleEs, url: openAsset.url, sourceUrl: openAsset.sourceUrl, mimeType: openAsset.mimeType, previewUrls: openAsset.previewUrls, pageCount: openAsset.pageCount, thumbnailUrl: openAsset.thumbnailUrl, fileType: openType }}
              downloadName={openAsset.sourceName ?? openAsset.title}
              controls={false}
              labels={{
                fallback: t('spaces.noFilePreview'),
                download: t('spaces.download'),
                openSource: t('spaces.openSource'),
                page: (n, total) => t('spaces.viewerPosition', { index: n, total }),
                prev: t('spaces.viewerPrev'),
                next: t('spaces.viewerNext'),
                thumbnails: t('spaces.viewerThumbnails'),
                fileType: pick(FILE_TYPE_LABELS[openType], lang),
              }}
            />
            <div className="spaces-actions">
              {openAsset.url && <Button href={openAsset.url} download={openAsset.sourceName ?? openAsset.title}>{t('spaces.download')}</Button>}
              {openAsset.sourceUrl && <Button variant="ghost" href={openAsset.sourceUrl} external>{t('spaces.openSource')}</Button>}
              <Button variant="ghost" onClick={closePreview}>{t('spaces.close')}</Button>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
