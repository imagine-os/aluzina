import { useMemo } from 'react';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Card } from '../../components/molecule/Card/Card';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { useTable } from '../../data/DataContext';
import { HOY_SOURCE, HOY_SECTIONS, HOY_TASKS } from '../../data/seed/asana/hoy';
import { PORTFOLIO_JOBS, PORTFOLIO_SOURCE } from '../../data/seed/asana/portfolio';
import { useT } from '../../i18n/I18nProvider';
import type { Surface } from '../../specs/PageSpec';
import { postCountsBySpace, slugify } from './model';
import { importSpec } from './specs';
import './spaces.css';

/** Justin's Slack sidebar as transcribed from the screenshots (prompt 0005, plus the three intake channels added 2026-09-21 03:24 UTC; `docs/knowledge/taxonomy.md`). Data, not instructions. */
const SLACK_SIDEBAR: { section: string; channels: string[] }[] = [
  { section: 'Art Tools', channels: ['chatgpt', 'lovart', 'magnific'] },
  { section: 'Project Management', channels: ['import-asana'] },
  { section: 'Marketing', channels: ['content-production', 'marketing-channels', 'marketing-strategy-guide', 'social-production-software'] },
  { section: 'Brand Memory', channels: ['drive-scraping', 'website-scraping', 'social-scraping', 'aluzina-brand-kit', 'operations-manual'] },
  { section: 'All Roles', channels: ['administrative-assistant', 'customer-portal', 'developer', 'interior-design-jr', 'marketing-strategist', 'owner'] },
  { section: 'Past Clients', channels: ['hoy', 'sporti'] },
  { section: 'Deliverables', channels: ['contract', 'final-presentation', 'furniture-selection', 'proposal'] },
];

const CHECKLIST = ['channels', 'messages', 'threads', 'pins', 'mentions', 'files', 'users', 'sections'] as const;

interface MapRow {
  key: string;
  section: string;
  channel: string | null;
  spaceId: string | null;
  spaceName: string | null;
  kind: string | null;
  posts: number;
}

/** K-06: read-only mapping Slack sidebar -> spaces and the contract for the real import; the upload is a Placeholder. */
export function ImportPage({ surface }: { surface: Surface }) {
  const { t } = useT();
  const spaces = useTable('spaces');
  const filings = useTable('filings');
  const base = `/${surface}/spaces`;
  const spec = importSpec(surface);

  const rows = useMemo<MapRow[]>(() => {
    const counts = postCountsBySpace(filings.rows);
    const bySlug = new Map(spaces.rows.map((s) => [s.slug, s]));
    const out: MapRow[] = [];
    for (const { section, channels } of SLACK_SIDEBAR) {
      const area = bySlug.get(slugify(section));
      out.push({ key: `s-${section}`, section, channel: null, spaceId: area?.id ?? null, spaceName: area?.name ?? null, kind: area?.kind ?? null, posts: area ? counts.get(area.id) ?? 0 : 0 });
      for (const ch of channels) {
        const s = spaces.rows.find((x) => x.slug === ch && x.parentId === area?.id) ?? bySlug.get(ch);
        out.push({ key: `c-${section}-${ch}`, section, channel: ch, spaceId: s?.id ?? null, spaceName: s?.name ?? null, kind: s?.kind ?? null, posts: s ? counts.get(s.id) ?? 0 : 0 });
      }
    }
    return out;
  }, [spaces.rows, filings.rows]);

  const cols: Column<MapRow>[] = [
    { key: 'section', header: t('spaces.import.section'), render: (r) => (r.channel ? <span className="spaces-muted">{r.section}</span> : <strong>{r.section}</strong>) },
    { key: 'channel', header: t('spaces.import.channel'), render: (r) => (r.channel ? `#${r.channel}` : <span className="spaces-muted">{t('spaces.import.sectionRow')}</span>) },
    { key: 'space', header: t('spaces.import.space'), render: (r) => (r.spaceId ? <Button size="sm" variant="ghost" href={`#${base}/${r.spaceId}`} iconEnd="›">{r.spaceName}</Button> : <Badge tone="warning">{t('spaces.import.unmapped')}</Badge>) },
    { key: 'kind', header: t('spaces.cat.kind'), render: (r) => (r.kind ? <Badge>{t(`spaces.kind.${r.kind}`)}</Badge> : '—') },
    { key: 'posts', header: t('spaces.import.postsToday'), align: 'end', render: (r) => String(r.posts) },
  ];

  return (
    <div className="spaces-page">
      <PageHeader code={spec.code} title={t('spaces.import')} subtitle={t('spaces.importSubtitle')} breadcrumb={[{ label: t(`core.portal.${surface}`), to: `/${surface}` }, { label: t('spaces.title'), to: base }, { label: t('spaces.import') }]} />

      <div className="spaces-import">
        <Card title={t('spaces.import.uploadTitle')} subtitle={t('spaces.import.uploadSubtitle')} actions={<Placeholder what={t('spaces.import.uploadWhat')}><Button variant="primary" icon="⇥">{t('spaces.import.upload')}</Button></Placeholder>}>
          <p className="spaces-muted">{t('spaces.import.readOnly')}</p>
        </Card>

        <Card title={t('spaces.import.asanaTitle')} subtitle={t('spaces.import.asanaSubtitle')}>
          <p className="spaces-muted">{t('spaces.import.asanaScript')}</p>
          <KeyValue
            columns={1}
            items={[
              { key: t('spaces.import.asanaHoy'), value: t('spaces.import.asanaHoyValue', { tasks: HOY_TASKS.length, sections: HOY_SECTIONS.length, linked: HOY_TASKS.filter((x) => x.deliverableId).length }) },
              { key: t('spaces.import.asanaPortfolio'), value: t('spaces.import.asanaPortfolioValue', { jobs: PORTFOLIO_JOBS.length }) },
              { key: t('spaces.import.asanaSources'), value: <code className="spaces-muted">{HOY_SOURCE}<br />{PORTFOLIO_SOURCE}</code> },
            ]}
          />
          <p className="spaces-muted">{t('spaces.import.asanaReadOnly')}</p>
        </Card>

        <Card title={t('spaces.import.checklistTitle')} subtitle={t('spaces.import.checklistSubtitle')}>
          <ol className="spaces-checklist">
            {CHECKLIST.map((k) => (
              <li key={k}>
                <strong>{t(`spaces.import.check.${k}.from`)}</strong> → {t(`spaces.import.check.${k}.to`)}
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <section aria-labelledby="import-mapping">
        <h2 id="import-mapping" className="spaces-h2">{t('spaces.import.mappingTitle')}</h2>
        <p className="spaces-muted">{t('spaces.import.mappingHint')}</p>
        <DataTable caption={t('spaces.import.mappingTitle')} columns={cols} rows={rows} rowKey={(r) => r.key} loading={spaces.loading} dense />
      </section>
    </div>
  );
}
