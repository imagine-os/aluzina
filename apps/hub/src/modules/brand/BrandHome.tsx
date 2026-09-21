import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { useTable } from '../../data/DataContext';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { dueTone } from './helpers';
import { homeSpec } from './specs';
import './brand.css';

interface Deadline {
  id: string;
  title: string;
  date: string;
  status: string;
  kindLabel: string;
  to: string;
}

const SECTIONS = [
  { key: 'competitions', to: '/brand/competitions' },
  { key: 'presentations', to: '/brand/presentations' },
  { key: 'identity', to: '/brand/identity' },
  { key: 'images', to: '/brand/images' },
  { key: 'revisions', to: '/brand/revisions' },
  { key: 'assets', to: '/brand/assets' },
] as const;

/** G-01: what Angélica owes and what owes her, in one screen. */
export function BrandHome() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const { rows: competitions } = useTable('competitions');
  const { rows: presentations } = useTable('presentations');
  const { rows: revisions } = useTable('revisions');
  const { rows: assets } = useTable('brandAssets');
  const { rows: alerts } = useTable('alerts', { where: { forRole: 'brand', status: 'open' } });

  const dated = competitions.filter((c) => c.submissionDate !== null);
  const openPresentations = presentations.filter((p) => p.status !== 'final');
  const queue = revisions.filter((r) => r.status === 'requested' || r.status === 'in-progress');
  const currentAssets = assets.filter((a) => a.status === 'current');
  const superseded = assets.filter((a) => a.status === 'superseded');

  const deadlines = useMemo<Deadline[]>(() => {
    const items: Deadline[] = [];
    for (const c of competitions) {
      if (!c.submissionDate) continue;
      items.push({
        id: c.id,
        title: c.name ?? t('brand.competitions.slotN', { n: c.slot }),
        date: c.submissionDate,
        status: c.status,
        kindLabel: t('brand.home.deadline.competition'),
        to: '/brand/competitions',
      });
    }
    for (const p of presentations) {
      if (!p.dueDate || p.status === 'final') continue;
      items.push({ id: p.id, title: p.title, date: p.dueDate, status: p.status, kindLabel: t('brand.home.deadline.presentation'), to: '/brand/presentations' });
    }
    for (const r of revisions) {
      if (!r.dueDate || r.status === 'approved') continue;
      items.push({ id: r.id, title: r.title, date: r.dueDate, status: r.status, kindLabel: t('brand.home.deadline.revision'), to: r.kind === 'image' ? '/brand/images' : '/brand/revisions' });
    }
    return items.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)).slice(0, 8);
  }, [competitions, presentations, revisions, t]);

  return (
    <>
      <PageHeader code={homeSpec.code} title={t('brand.home.title')} subtitle={t('brand.home.desc')} breadcrumb={[{ label: t('core.portal.brand') }]} />

      <div className="brand-stats">
        <StatTile
          label={t('brand.home.stat.competitions')}
          value={competitions.length}
          hint={t('brand.home.stat.competitionsHint', { dated: dated.length, undated: competitions.length - dated.length })}
          tone={dated.length === 0 ? 'warning' : 'accent'}
          glyph="◆"
          onActivate={() => navigate('/brand/competitions')}
        />
        <StatTile
          label={t('brand.home.stat.presentations')}
          value={openPresentations.length}
          hint={t('brand.home.stat.presentationsHint', { n: presentations.length })}
          tone="info"
          glyph="▤"
          onActivate={() => navigate('/brand/presentations')}
        />
        <StatTile
          label={t('brand.home.stat.revisions')}
          value={queue.length}
          hint={t('brand.home.stat.revisionsHint', { n: revisions.filter((r) => r.status === 'delivered').length })}
          tone={queue.length > 0 ? 'warning' : 'success'}
          glyph="▷"
          onActivate={() => navigate('/brand/revisions')}
        />
        <StatTile
          label={t('brand.home.stat.assets')}
          value={currentAssets.length}
          hint={t('brand.home.stat.assetsHint', { n: superseded.length })}
          tone="neutral"
          glyph="☷"
          onActivate={() => navigate('/brand/identity')}
        />
      </div>

      <div className="brand-stack">
        <Card title={t('brand.home.deadlines')} subtitle={t('brand.home.deadlinesSub')}>
          {deadlines.length === 0 ? (
            <EmptyState title={t('brand.home.noDeadlines')} description={t('brand.home.noDeadlinesDesc')} glyph="◇" />
          ) : (
            <ul className="brand-list">
              {deadlines.map((d) => (
                <li key={`${d.kindLabel}-${d.id}`}>
                  <div className="brand-list__row">
                    <div className="brand-list__main">
                      <span className="brand-list__title">{d.title}</span>
                      <span className="brand-list__meta">{d.kindLabel}</span>
                    </div>
                    <StatusPill status={d.status} />
                    <StatusPill status={dueTone(d.date) === 'danger' ? 'overdue' : dueTone(d.date) === 'warning' ? 'due' : 'open'} label={formatDate(d.date, lang)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={t('brand.home.alerts')} subtitle={t('brand.home.alertsSub')}>
          {alerts.length === 0 ? (
            <EmptyState title={t('brand.home.noAlerts')} glyph="✓" />
          ) : (
            <ul className="brand-list">
              {alerts.map((a) => (
                <li key={a.id}>
                  <div className="brand-list__row">
                    <div className="brand-list__main">
                      <span className="brand-list__title">{a.title}</span>
                      <span className="brand-list__meta">{t('brand.home.alertLead', { date: formatDate(a.dueDate, lang), days: a.leadDays })}</span>
                    </div>
                    <StatusPill status={a.severity} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <ul className="brand-grid">
          {SECTIONS.map((s) => (
            <li key={s.key}>
              <Card title={t(`brand.home.section.${s.key}`)} subtitle={t(`brand.home.sectionDesc.${s.key}`)} onActivate={() => navigate(s.to)} aria-label={t('brand.home.open', { section: t(`brand.home.section.${s.key}`) })} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
