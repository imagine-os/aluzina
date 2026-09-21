import { useMemo, useState } from 'react';
import { useRegisterActions } from '../../actions';
import { useCan, useSession } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Modal } from '../../components/organism/Modal/Modal';
import { useData, useTable } from '../../data/DataContext';
import type { SiteReport } from '../../data/schema';
import { daysUntil, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { dueLabel, dueTone, todayIso, useLookups } from './helpers';
import './ops.css';
import { siteReportsSpec } from './specs';

interface ReportDraft {
  projectId: string;
  date: string;
  progress: string;
  notes: string;
  decisions: string;
  problems: string;
  resolutionDue: string;
}

const clampPct = (v: string): number => {
  const n = Number(v.replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? 0 : Math.min(100, Math.max(0, Math.round(n)));
};

/** A resolution date in the past with the report still on the board is an overdue problem. */
const isOverdue = (r: SiteReport): boolean => r.resolutionDue !== null && daysUntil(r.resolutionDue) < 0;

/**
 * O-13 Site reports (service E stage 7, G-08): every visit produces a written and photographic record —
 * date, progress, notes, decisions, problems, responsible person and a resolution date. Photographs are
 * `photoUrls` strings today and render as links; uploading one waits for a file-storage seam.
 */
export function SiteReportsPage() {
  const { t, lang } = useT();
  const can = useCan();
  const { user } = useSession();
  const data = useData();
  const { projects, projectName, userName } = useLookups();
  const { rows: reports, loading } = useTable('siteReports', { orderBy: 'date', dir: 'desc' });
  const write = can('siteReports.write');

  const emptyDraft: ReportDraft = { projectId: '', date: todayIso(), progress: '0', notes: '', decisions: '', problems: '', resolutionDue: '' };

  const [project, setProject] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<ReportDraft>(emptyDraft);

  const filtered = useMemo(() => reports.filter((r) => !project || r.projectId === project), [reports, project]);
  const open = openId ? reports.find((r) => r.id === openId) ?? null : null;

  const summary = useMemo(() => {
    const latest = [...filtered].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
    return {
      visits: filtered.length,
      latest,
      overdue: filtered.filter(isOverdue).length,
      photos: filtered.reduce((n, r) => n + r.photoUrls.length, 0),
    };
  }, [filtered]);

  const create = async (d: ReportDraft) => {
    if (!d.projectId) {
      toast(t('ops.siteReports.required'));
      return null;
    }
    const row = await data.create('siteReports', {
      projectId: d.projectId,
      date: d.date || todayIso(),
      progress: clampPct(d.progress),
      notes: d.notes.trim(),
      decisions: d.decisions.trim(),
      problems: d.problems.trim(),
      responsibleId: user.id,
      resolutionDue: d.resolutionDue || null,
      photoUrls: [],
    });
    toast(t('ops.siteReports.created', { date: formatDate(row.date, lang) }));
    return row.id;
  };

  const submit = async () => {
    const id = await create(draft);
    if (!id) return;
    setFormOpen(false);
    setDraft(emptyDraft);
    setOpenId(id);
  };

  useRegisterActions({
    'ops.newSiteReport': write
      ? async (p) => {
          if (!p?.project) {
            setFormOpen(true);
            return t('ops.siteReports.formOpened');
          }
          return (
            (await create({
              projectId: String(p.project),
              date: String(p?.date ?? todayIso()),
              progress: String(p?.progress ?? '0'),
              notes: String(p?.notes ?? ''),
              decisions: String(p?.decisions ?? ''),
              problems: String(p?.problems ?? ''),
              resolutionDue: String(p?.resolutionDue ?? ''),
            })) ?? t('ops.siteReports.required')
          );
        }
      : false,
    'ops.openSiteReport': async (p) => {
      const row = await data.get('siteReports', String(p?.report ?? ''));
      if (!row) return t('ops.siteReports.notFound');
      setOpenId(row.id);
      return formatDate(row.date, lang);
    },
    'ops.filterSiteReportsProject': (p) => {
      setProject(String(p?.project ?? ''));
      return filtered.length;
    },
    // Declared and answerable, but not wired: uploading a photograph waits for a file-storage seam (P-09).
    'ops.addSitePhoto': () => {
      toast(t('core.placeholder.toast'));
      return t('ops.siteReports.addPhotoWhat');
    },
  });

  /** Progress as a StatTile plus a text bar: the library has no meter atom yet (request filed). */
  const progressTile = (r: SiteReport) => (
    <StatTile
      label={t('ops.siteReports.progress')}
      value={`${r.progress}%`}
      hint={`${'█'.repeat(Math.round(r.progress / 10))}${'░'.repeat(10 - Math.round(r.progress / 10))}`}
      tone={r.progress >= 90 ? 'success' : r.progress >= 50 ? 'accent' : 'neutral'}
    />
  );

  return (
    <div className="ops-stack">
      <PageHeader
        code={siteReportsSpec.code}
        title={t('ops.siteReports.title')}
        subtitle={t('ops.siteReports.subtitle')}
        breadcrumb={[{ label: t('ops.nav.home'), to: '/ops' }, { label: t('ops.siteReports.title') }]}
        actions={
          write ? (
            <Button variant="primary" onClick={() => setFormOpen(true)}>
              {t('ops.siteReports.new')}
            </Button>
          ) : undefined
        }
      />

      <p className="ops-note">{t('ops.siteReports.rule')}</p>

      <div className="ops-tiles">
        <StatTile glyph="◉" label={t('ops.siteReports.tile.visits')} value={summary.visits} />
        <StatTile glyph="↗" label={t('ops.siteReports.tile.latest')} value={summary.latest ? `${summary.latest.progress}%` : '—'} hint={summary.latest ? formatDate(summary.latest.date, lang) : t('ops.siteReports.empty')} tone="accent" />
        <StatTile glyph="!" label={t('ops.siteReports.tile.overdue')} value={summary.overdue} tone={summary.overdue > 0 ? 'danger' : 'success'} />
        <StatTile glyph="▣" label={t('ops.siteReports.tile.photos')} value={summary.photos} hint={t('ops.siteReports.tile.photosHint')} />
      </div>

      <FilterBar onClear={() => setProject('')} summary={t('ops.common.count', { n: filtered.length, total: reports.length })}>
        <Select
          className="ops-filter-field"
          label={t('ops.common.project')}
          value={project}
          onChange={(e) => setProject(e.target.value)}
          options={[{ value: '', label: t('ops.common.allProjects') }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
        />
      </FilterBar>

      {!loading && filtered.length === 0 && <EmptyState title={t('ops.siteReports.empty')} description={t('ops.siteReports.emptyDesc')} glyph="◉" />}

      <div className="ops-cards ops-cards--wide">
        {filtered.map((r) => (
          <Card
            key={r.id}
            title={formatDate(r.date, lang)}
            subtitle={`${projectName(r.projectId) ?? '—'} · ${userName(r.responsibleId)}`}
            padding="sm"
            actions={
              <Button size="sm" variant="ghost" onClick={() => setOpenId(r.id)}>
                {t('ops.common.open')}
              </Button>
            }
          >
            <div className="ops-report">
              {progressTile(r)}
              <KeyValue
                columns={1}
                items={[
                  { key: t('ops.siteReports.notes'), value: r.notes || '—' },
                  { key: t('ops.siteReports.decisions'), value: r.decisions || '—' },
                  { key: t('ops.siteReports.problems'), value: r.problems || '—' },
                  {
                    key: t('ops.siteReports.resolutionDue'),
                    value: r.resolutionDue ? (
                      <Badge tone={dueTone(r.resolutionDue)}>{`${formatDate(r.resolutionDue, lang)} · ${dueLabel(r.resolutionDue, t)}`}</Badge>
                    ) : (
                      t('ops.common.noDate')
                    ),
                  },
                ]}
              />
              <div className="ops-badges">
                {r.photoUrls.length === 0 && <Badge tone="warning">{t('ops.siteReports.noPhotos')}</Badge>}
                {r.photoUrls.map((url, i) => (
                  <Button key={url} size="sm" variant="ghost" href={url} external>
                    {t('ops.siteReports.photoN', { n: i + 1 })}
                  </Button>
                ))}
                {write && (
                  <Placeholder what={t('ops.siteReports.addPhotoWhat')}>
                    <Button size="sm" variant="secondary">
                      {t('ops.siteReports.addPhoto')}
                    </Button>
                  </Placeholder>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={t('ops.siteReports.new')}
        size="lg"
        footer={
          <div className="ops-row">
            <Button variant="primary" onClick={() => void submit()}>
              {t('ops.siteReports.save')}
            </Button>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              {t('ops.common.close')}
            </Button>
          </div>
        }
      >
        <form className="ops-form" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
          <div className="ops-grid">
            <Select
              label={t('ops.common.project')}
              required
              value={draft.projectId}
              onChange={(e) => setDraft({ ...draft, projectId: e.target.value })}
              placeholder={t('ops.siteReports.pickProject')}
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
            />
            <Input label={t('ops.common.date')} type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            <Input label={t('ops.siteReports.progress')} type="number" min={0} max={100} value={draft.progress} onChange={(e) => setDraft({ ...draft, progress: e.target.value })} />
            <Input label={t('ops.siteReports.resolutionDue')} type="date" value={draft.resolutionDue} onChange={(e) => setDraft({ ...draft, resolutionDue: e.target.value })} />
          </div>
          <Textarea label={t('ops.siteReports.notes')} rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          <Textarea label={t('ops.siteReports.decisions')} rows={2} value={draft.decisions} onChange={(e) => setDraft({ ...draft, decisions: e.target.value })} />
          <Textarea label={t('ops.siteReports.problems')} rows={2} value={draft.problems} onChange={(e) => setDraft({ ...draft, problems: e.target.value })} />
          <p className="ops-note">{t('ops.siteReports.photoNote', { name: user.name })}</p>
        </form>
      </Modal>

      <Drawer
        open={open !== null}
        onClose={() => setOpenId(null)}
        title={open ? `${projectName(open.projectId) ?? ''} · ${formatDate(open.date, lang)}` : t('ops.common.detail')}
        footer={
          <Button variant="secondary" onClick={() => setOpenId(null)}>
            {t('ops.common.close')}
          </Button>
        }
      >
        {open && (
          <>
            {progressTile(open)}
            <KeyValue
              columns={1}
              items={[
                { key: t('ops.common.project'), value: projectName(open.projectId) ?? '—' },
                { key: t('ops.common.date'), value: formatDate(open.date, lang) },
                { key: t('ops.common.owner'), value: userName(open.responsibleId) },
                { key: t('ops.siteReports.notes'), value: open.notes || '—' },
                { key: t('ops.siteReports.decisions'), value: open.decisions || '—' },
                { key: t('ops.siteReports.problems'), value: open.problems || '—' },
                {
                  key: t('ops.siteReports.resolutionDue'),
                  value: open.resolutionDue ? <Badge tone={dueTone(open.resolutionDue)}>{`${formatDate(open.resolutionDue, lang)} · ${dueLabel(open.resolutionDue, t)}`}</Badge> : t('ops.common.noDate'),
                },
              ]}
            />
            <div className="ops-drawer-section">
              <h3>{t('ops.siteReports.photos')}</h3>
              {open.photoUrls.length === 0 && <p className="ops-note">{t('ops.siteReports.noPhotos')}</p>}
              <div className="ops-badges">
                {open.photoUrls.map((url, i) => (
                  <Button key={url} size="sm" variant="ghost" href={url} external>
                    {t('ops.siteReports.photoN', { n: i + 1 })}
                  </Button>
                ))}
                {write && (
                  <Placeholder what={t('ops.siteReports.addPhotoWhat')}>
                    <Button size="sm" variant="secondary">
                      {t('ops.siteReports.addPhoto')}
                    </Button>
                  </Placeholder>
                )}
              </div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
