import { useMemo } from 'react';
import { useCan } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { useData, useTable } from '../../data/DataContext';
import type { BrandAsset, BrandAssetKind } from '../../data/schema';
import { useT } from '../../i18n/I18nProvider';
import { identitySpec } from './specs';
import './brand.css';

/** Display order of the identity kinds; the manual (guideline) has its own card above. */
const KIND_ORDER: BrandAssetKind[] = ['logo', 'typography', 'palette', 'template', 'icon', 'photo'];

/** G-04: the identity files, grouped by kind, with superseded versions kept visible. */
export function IdentityPage() {
  const { t } = useT();
  const can = useCan();
  const data = useData();
  const { rows, loading } = useTable('brandAssets');

  const byKind = useMemo(() => {
    const map = new Map<BrandAssetKind, BrandAsset[]>();
    for (const a of rows) {
      const list = map.get(a.kind) ?? [];
      list.push(a);
      map.set(a.kind, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.name.localeCompare(b.name));
    return map;
  }, [rows]);

  const guidelines = byKind.get('guideline') ?? [];
  const current = rows.filter((a) => a.status === 'current');
  const drafts = rows.filter((a) => a.status === 'draft');
  const superseded = rows.filter((a) => a.status === 'superseded');
  const manualOutdated = guidelines.length > 0 && guidelines.every((g) => g.status !== 'current');

  const setStatus = async (a: BrandAsset, status: BrandAsset['status']) => {
    await data.update('brandAssets', a.id, { status });
    toast(t('brand.identity.marked', { name: a.name, status: t(`core.status.${status}`) }));
  };

  const columns = (kindLabel: string) => [
    { key: 'name', header: t('brand.identity.col.name'), sortable: true },
    { key: 'format', header: t('brand.identity.col.format'), render: (a: BrandAsset) => a.format.toUpperCase() },
    { key: 'version', header: t('brand.identity.col.version'), sortable: true },
    { key: 'path', header: t('brand.identity.col.path'), render: (a: BrandAsset) => <span className="brand-path">{a.path}</span> },
    {
      key: 'status',
      header: t('brand.col.status'),
      render: (a: BrandAsset) => (
        <>
          <StatusPill status={a.status} />
          {a.status === 'superseded' && <Badge tone="warning">{t('brand.identity.doNotUse')}</Badge>}
        </>
      ),
    },
    { key: 'kind', header: t('brand.col.kind'), render: () => kindLabel },
  ];

  const rowActions = can('assets.manage')
    ? [
        { id: 'supersede', label: t('brand.identity.supersede'), onClick: (a: BrandAsset) => void setStatus(a, 'superseded'), when: (a: BrandAsset) => a.status !== 'superseded' },
        { id: 'restore', label: t('brand.identity.restore'), onClick: (a: BrandAsset) => void setStatus(a, 'current'), when: (a: BrandAsset) => a.status !== 'current' },
      ]
    : undefined;

  return (
    <>
      <PageHeader
        code={identitySpec.code}
        title={t('brand.identity.title')}
        subtitle={t('brand.identity.subtitle')}
        breadcrumb={[{ label: t('core.portal.brand'), to: '/brand' }, { label: t('brand.identity.title') }]}
        actions={
          <Placeholder what={t('brand.identity.uploadWhat')}>
            <Button variant="primary">{t('brand.identity.upload')}</Button>
          </Placeholder>
        }
      />

      <div className="brand-stats">
        <StatTile label={t('brand.identity.stat.current')} value={current.length} tone="success" glyph="✓" />
        <StatTile label={t('brand.identity.stat.draft')} value={drafts.length} tone={drafts.length ? 'warning' : 'neutral'} glyph="◇" />
        <StatTile label={t('brand.identity.stat.superseded')} value={superseded.length} hint={t('brand.identity.stat.supersededHint')} tone={superseded.length ? 'warning' : 'neutral'} glyph="▣" />
      </div>

      <div className="brand-stack">
        <Card
          title={t('brand.identity.manual')}
          subtitle={manualOutdated ? t('brand.identity.manualOutdated') : t('brand.identity.manualSub')}
          raised
          actions={
            <Placeholder what={t('brand.identity.openManualWhat')}>
              <Button variant="secondary">{t('brand.identity.openManual')}</Button>
            </Placeholder>
          }
        >
          {guidelines.length === 0 ? (
            <EmptyState title={t('brand.identity.noManual')} description={t('brand.identity.noManualDesc')} glyph="▤" />
          ) : (
            <DataTable<BrandAsset>
              caption={t('brand.identity.manual')}
              rows={guidelines}
              rowKey={(a) => a.id}
              loading={loading}
              columns={columns(t('brand.assetKind.guideline'))}
              rowActions={rowActions}
              dense
            />
          )}
        </Card>

        {KIND_ORDER.filter((k) => (byKind.get(k) ?? []).length > 0).map((k) => (
          <Card key={k} title={t(`brand.assetKind.${k}`)} subtitle={t('brand.identity.kindCount', { n: (byKind.get(k) ?? []).length })}>
            <DataTable<BrandAsset>
              caption={t(`brand.assetKind.${k}`)}
              rows={byKind.get(k) ?? []}
              rowKey={(a) => a.id}
              loading={loading}
              columns={columns(t(`brand.assetKind.${k}`))}
              rowActions={rowActions}
              dense
            />
          </Card>
        ))}

        <Card title={t('brand.identity.applying')} subtitle={t('brand.identity.applyingSub')}>
          <div className="brand-actions-row">
            <Placeholder what={t('brand.identity.checkWhat')}>
              <Button variant="secondary">{t('brand.identity.check')}</Button>
            </Placeholder>
            <Placeholder what={t('brand.identity.tokensWhat')}>
              <Button variant="ghost">{t('brand.identity.tokens')}</Button>
            </Placeholder>
          </div>
        </Card>
      </div>
    </>
  );
}
