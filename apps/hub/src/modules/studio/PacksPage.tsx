import { useMemo, useState } from 'react';
import { useCan } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Kanban, type KanbanCard } from '../../components/organism/Kanban/Kanban';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useData, useTable } from '../../data/DataContext';
import type { RenderPack, RenderPackStatus } from '../../data/schema';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { packsSpec } from './specs';
import { useProjectIndex } from './useProjectIndex';
import './studio.css';

const STAGES: RenderPackStatus[] = ['briefing', 'sent', 'rendering', 'delivered'];
const TONES = { briefing: 'neutral', sent: 'accent', rendering: 'info', delivered: 'success' } as const;

export function PacksPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { rows: packs } = useTable('renderPacks', { orderBy: 'title' });
  const { nameOf } = useProjectIndex();
  const [open, setOpen] = useState<RenderPack | null>(null);

  const cards: KanbanCard[] = useMemo(
    () =>
      packs.map((p) => ({
        id: p.id,
        columnId: p.status,
        title: p.title,
        subtitle: t('studio.packs.meta', { views: p.viewCount, project: nameOf(p.projectId) }),
        meta: (
          <Badge tone={p.audience === 'supplier' ? 'warning' : 'accent'}>{t(`studio.packs.audience.${p.audience}`)}</Badge>
        ),
      })),
    [packs, t, nameOf],
  );

  const current = open ? (packs.find((p) => p.id === open.id) ?? open) : null;

  const move = async (cardId: string, to: string) => {
    await data.update('renderPacks', cardId, { status: to as RenderPackStatus });
    toast(t('studio.packs.moved', { status: t(`core.status.${to}`) }));
  };

  return (
    <>
      <PageHeader
        code={packsSpec.code}
        title={t('studio.packs.title')}
        subtitle={t('studio.packs.subtitle')}
        breadcrumb={[{ label: t('core.portal.studio'), to: '/studio' }, { label: t('studio.packs.title') }]}
        actions={
          <Placeholder what={t('studio.packs.newWhat')}>
            <Button variant="primary">{t('studio.packs.new')}</Button>
          </Placeholder>
        }
      />

      <div className="studio-stats">
        <StatTile label={t('studio.packs.stat.flight')} value={packs.filter((p) => p.status !== 'delivered').length} tone="accent" glyph="▷" />
        <StatTile label={t('studio.packs.stat.delivered')} value={packs.filter((p) => p.status === 'delivered').length} tone="success" />
        <StatTile label={t('studio.packs.stat.views')} value={packs.reduce((n, p) => n + p.viewCount, 0)} tone="info" />
      </div>

      <Kanban
        label={t('studio.packs.board')}
        columns={STAGES.map((s) => ({ id: s, title: t(`core.status.${s}`), tone: TONES[s] }))}
        cards={cards}
        onMove={can('renders.brief') ? move : undefined}
        onActivate={(card) => setOpen(packs.find((p) => p.id === card.id) ?? null)}
      />

      <Drawer
        open={current !== null}
        onClose={() => setOpen(null)}
        title={current?.title ?? t('studio.packs.detail')}
        footer={
          current && (
            <Placeholder what={t('studio.packs.attachWhat')}>
              <Button>{t('studio.packs.attach')}</Button>
            </Placeholder>
          )
        }
      >
        {current && (
          <KeyValue
            columns={2}
            items={[
              { key: t('studio.col.project'), value: nameOf(current.projectId) },
              { key: t('studio.col.audience'), value: t(`studio.packs.audience.${current.audience}`) },
              { key: t('studio.col.views'), value: current.viewCount },
              { key: t('studio.col.due'), value: formatDate(current.dueDate, lang) },
              { key: t('studio.col.status'), value: <StatusPill status={current.status} /> },
              { key: t('studio.col.updated'), value: formatDate(current.updated_at, lang) },
            ]}
          />
        )}
      </Drawer>
    </>
  );
}
