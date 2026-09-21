import { useMemo, useState } from 'react';
import { Badge } from '../../components/atom/Badge/Badge';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { library, TIERS } from '../../design/library';
import type { Tier } from '../../design/meta';
import { useT } from '../../i18n/I18nProvider';
import { componentsSpec } from './specs';
import './dev.css';

type TierFilter = 'all' | Tier;

export function ComponentsPage() {
  const { t } = useT();
  const [q, setQ] = useState('');
  const [tier, setTier] = useState<TierFilter>('all');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return library.filter((e) => (tier === 'all' || e.meta.tier === tier) && (!needle || [e.meta.name, e.meta.purpose, ...e.meta.usages].join(' ').toLowerCase().includes(needle)));
  }, [q, tier]);

  const tabs = [{ id: 'all', label: t('dev.components.all'), count: library.length }, ...TIERS.map((tr) => ({ id: tr, label: t(`dev.tier.${tr}`), count: library.filter((e) => e.meta.tier === tr).length }))];

  return (
    <>
      <PageHeader code={componentsSpec.code} title={t('dev.components.title')} subtitle={t('dev.components.subtitle', { count: library.length })} breadcrumb={[{ label: t('core.portal.dev'), to: '/dev/components' }, { label: t('dev.components.title') }]} />
      <FilterBar onClear={q || tier !== 'all' ? () => { setQ(''); setTier('all'); } : undefined} summary={t('dev.summary', { shown: filtered.length, total: library.length })}>
        <SearchField value={q} onChange={setQ} placeholder={t('dev.components.search')} />
      </FilterBar>
      <Tabs label={t('dev.components.tiers')} tabs={tabs} value={tier} onChange={(id) => setTier(id as TierFilter)} />
      {filtered.length === 0 ? (
        <EmptyState title={t('dev.components.none')} />
      ) : (
        <ul className="dev-components">
          {filtered.map(({ meta, path, Example }) => (
            <li key={meta.name} id={`c-${meta.name}`}>
              <Card
                title={meta.name}
                subtitle={meta.purpose}
                actions={
                  <>
                    <Badge tone="accent">{t(`dev.tier.${meta.tier}`)}</Badge>
                    {!Example && <Badge tone="warning">{t('dev.components.noExample')}</Badge>}
                  </>
                }
                footer={<code className="dev-path">src/{path}</code>}
              >
                {Example && (
                  <div className="dev-stage" data-example={meta.name}>
                    <Example />
                  </div>
                )}
                <div className="dev-component__details">
                  <div>
                    <h4 className="dev-h4">{t('dev.components.props')}</h4>
                    {Object.keys(meta.props).length === 0 ? <p className="dev-muted">{t('dev.components.noProps')}</p> : <KeyValue columns={1} items={Object.entries(meta.props).map(([k, v]) => ({ key: k, value: <code>{v}</code> }))} />}
                  </div>
                  <div>
                    <h4 className="dev-h4">{t('dev.components.a11y')}</h4>
                    <ul className="dev-list">
                      {meta.a11y.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                    <h4 className="dev-h4">{t('dev.components.usages')}</h4>
                    <ul className="dev-list">
                      {meta.usages.map((u) => (
                        <li key={u}>{u}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
