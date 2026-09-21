import { useMemo, useState } from 'react';
import { useRegisterActions } from '../../actions';
import { useRoutes } from '../../app/RoutesContext';
import { isRoleId, roleForSurface } from '../../auth/roles';
import { useSession } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useT } from '../../i18n/I18nProvider';
import { specCompleteness, SURFACES, type RouteDef } from '../../specs/PageSpec';
import { testingSpec } from './specs';
import './qa.css';

/** The responsive matrix the quality bar names (P-01). */
export const MATRIX = [360, 390, 768, 1280, 1920, 2560, 3840];

/** Window heights that make a given width feel like the real device / screen. */
const HEIGHTS: Record<number, number> = { 360: 800, 390: 844, 768: 1024, 1280: 800, 1920: 1080, 2560: 1440, 3840: 2160 };

const OPEN_WIDTHS = [390, 1280, 1920];

const SIMULATOR_PATH = '/dev/simulator';

interface Row {
  route: RouteDef;
  code: string;
  name: string;
  path: string;
  surface: string;
  checked: number[];
  score: number;
  total: number;
  missing: string[];
}

/** D-11: every route against the responsive matrix and the spec checklist (P-01, P-02, P-08). */
export function TestingPage() {
  const { t } = useT();
  const routes = useRoutes();
  const { role } = useSession();
  const [q, setQ] = useState('');
  const [surface, setSurface] = useState('');
  const [incompleteOnly, setIncompleteOnly] = useState(false);
  const [openCode, setOpenCode] = useState<string | null>(null);

  const hasSimulator = routes.some((r) => r.path === SIMULATOR_PATH);

  const all = useMemo<Row[]>(
    () =>
      routes.map((r) => {
        const c = specCompleteness(r);
        return { route: r, code: r.code, name: r.spec.name, path: r.path, surface: r.surface, checked: [...r.spec.checkedAt], score: c.score, total: c.total, missing: c.missing };
      }),
    [routes],
  );

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter(
      (r) =>
        (!surface || r.surface === surface) &&
        (!incompleteOnly || r.missing.length > 0) &&
        (!needle || `${r.code} ${r.name} ${r.path} ${r.surface}`.toLowerCase().includes(needle)),
    );
  }, [all, q, surface, incompleteOnly]);

  const fully = all.filter((r) => MATRIX.every((w) => r.checked.includes(w))).length;
  const cells = all.reduce((n, r) => n + MATRIX.filter((w) => r.checked.includes(w)).length, 0);
  const avg = all.length ? Math.floor((all.reduce((n, r) => n + r.score / r.total, 0) / all.length) * 100) : 0;

  const sel = openCode ? all.find((r) => r.code === openCode) ?? null : null;
  const selHasParams = sel ? sel.path.includes(':') : false;

  const roleFor = (r: Row): string => r.route.spec.roles.find((x) => isRoleId(x)) ?? roleForSurface(r.route.surface) ?? role;

  const openAt = (r: Row, width: number): string => {
    if (r.path.includes(':')) return t('qa.testing.drawer.paramRoute');
    const as = roleFor(r);
    const url = `${window.location.pathname}?as=${as}#${r.path}`;
    const height = HEIGHTS[width] ?? Math.round((width * 9) / 16);
    const win = window.open(url, `aluzina-${r.code}-${width}`, `width=${width},height=${height},noopener`);
    if (!win) {
      toast(t('qa.testing.drawer.popupBlocked'));
      return t('qa.testing.drawer.popupBlocked');
    }
    return `${r.code} @ ${width} (${as})`;
  };

  const byCode = (code: string): Row | undefined => all.find((r) => r.code.toLowerCase() === code.toLowerCase() || r.path.toLowerCase() === code.toLowerCase());

  useRegisterActions({
    'qa.filterMatrixSurface': ({ surface: s }) => {
      const next = String(s ?? '');
      setSurface(next === 'all' ? '' : next);
      return next;
    },
    'qa.filterIncomplete': ({ incomplete }) => {
      const on = incomplete === undefined ? true : incomplete === true || incomplete === 'true';
      setIncompleteOnly(on);
      return on;
    },
    'qa.openMatrixRow': ({ page }) => {
      const hit = byCode(String(page ?? ''));
      if (!hit) return t('qa.testing.rowNotFound', { code: String(page ?? '') });
      setOpenCode(hit.code);
      return `${hit.code} · ${hit.name}`;
    },
    'qa.openAtWidth': ({ page, width }) => {
      const hit = byCode(String(page ?? ''));
      if (!hit) return t('qa.testing.rowNotFound', { code: String(page ?? '') });
      return openAt(hit, Number(width) || 1280);
    },
    'qa.fileBug': () => {
      toast(t('core.placeholder.toast'));
      return t('qa.testing.fileBugWhat');
    },
  });

  const widthColumns: Column<Row>[] = MATRIX.map((w) => ({
    key: `w${w}`,
    header: String(w),
    align: 'end',
    sortable: true,
    sortValue: (r) => (r.checked.includes(w) ? 1 : 0),
    render: (r) =>
      r.checked.includes(w) ? (
        <span className="qa-tick qa-tick--on" role="img" aria-label={t('qa.testing.checkedAt', { width: w })}>
          ✓
        </span>
      ) : (
        <span className="qa-tick" role="img" aria-label={t('qa.testing.notCheckedAt', { width: w })}>
          ○
        </span>
      ),
  }));

  return (
    <div className="qa-stack">
      <PageHeader
        code={testingSpec.code}
        title={t('qa.testing.title')}
        subtitle={t('qa.testing.subtitle')}
        breadcrumb={[{ label: t('core.portal.dev'), to: '/dev/components' }, { label: t('qa.nav.testing') }]}
      />

      <div className="qa-stats">
        <StatTile label={t('qa.testing.routes')} value={all.length} tone="accent" />
        <StatTile label={t('qa.testing.fully')} value={fully} hint={t('qa.testing.fullyHint')} tone={fully === all.length ? 'success' : 'warning'} />
        <StatTile label={t('qa.testing.avg')} value={`${avg}%`} tone="info" />
        <StatTile label={t('qa.testing.cells')} value={`${cells} / ${all.length * MATRIX.length}`} />
      </div>

      <FilterBar
        summary={t('qa.summary', { shown: rows.length, total: all.length })}
        onClear={q || surface || incompleteOnly ? () => { setQ(''); setSurface(''); setIncompleteOnly(false); } : undefined}
      >
        <SearchField value={q} onChange={setQ} placeholder={t('qa.testing.search')} />
        <Select label={t('qa.testing.surface')} hideLabel value={surface} onChange={(e) => setSurface(e.target.value)} placeholder={t('qa.testing.allSurfaces')} options={SURFACES.map((s) => ({ value: s, label: s }))} />
        <Checkbox label={t('qa.testing.incompleteOnly')} checked={incompleteOnly} onChange={(e) => setIncompleteOnly(e.target.checked)} />
        <Placeholder what={t('qa.testing.shotsWhat')}>
          <Button size="sm">{t('qa.testing.shotsButton')}</Button>
        </Placeholder>
      </FilterBar>

      <DataTable
        caption={t('qa.testing.caption')}
        rows={rows}
        rowKey={(r) => r.path}
        dense
        initialSort={{ key: 'code', dir: 'asc' }}
        onRowActivate={(r) => setOpenCode(r.code)}
        emptyTitle={t('qa.none')}
        emptyDescription={t('qa.noneDesc')}
        columns={[
          { key: 'code', header: t('qa.testing.col.code'), sortable: true, render: (r) => <code>{r.code}</code> },
          { key: 'name', header: t('qa.testing.col.page'), sortable: true, render: (r) => (<span className="qa-pagecell">{r.name}<span className="qa-muted">#{r.path}</span></span>) },
          ...widthColumns,
          { key: 'lang', header: t('qa.testing.col.lang'), render: () => <span title={t('qa.testing.langHint')}>✓ / —</span> },
          { key: 'score', header: t('qa.testing.col.spec'), sortable: true, align: 'end', sortValue: (r) => r.score, render: (r) => <Badge tone={r.missing.length === 0 ? 'success' : r.score >= 6 ? 'accent' : 'warning'}>{r.score}/{r.total}</Badge> },
          { key: 'placeholders', header: t('qa.testing.col.placeholders'), align: 'end', render: () => <span title={t('qa.testing.placeholdersHint')}>—</span> },
          { key: 'shots', header: t('qa.testing.col.shots'), align: 'end', render: () => <span title={t('qa.testing.shotsNote')}>—</span> },
        ]}
      />

      <p className="qa-note">{t('qa.testing.shotsNote')} {t('qa.testing.langHint')}</p>

      <Card title={t('qa.testing.feedback')}>
        <p>{t('qa.testing.feedbackBody')}</p>
        <p className="qa-note">{t('qa.testing.feedbackBlocked')}</p>
        <Placeholder what={t('qa.testing.fileBugWhat')}>
          <Button variant="primary" icon="⚑">{t('qa.testing.fileBug')}</Button>
        </Placeholder>
      </Card>

      <Drawer open={sel !== null} onClose={() => setOpenCode(null)} title={sel ? `${sel.code} · ${sel.name}` : ''}>
        {sel && (
          <div className="qa-detail">
            <KeyValue
              columns={1}
              items={[
                { key: t('qa.testing.col.page'), value: <code>#{sel.path}</code> },
                { key: t('qa.testing.surface'), value: sel.surface },
                { key: t('qa.testing.col.spec'), value: `${sel.score}/${sel.total}` },
                { key: t('qa.testing.drawer.recorded'), value: sel.checked.length ? sel.checked.join(', ') : '—' },
                { key: t('qa.testing.drawer.missingWidths'), value: MATRIX.filter((w) => !sel.checked.includes(w)).join(', ') || '—' },
              ]}
            />

            <h3 className="qa-h4">{t('qa.testing.drawer.missing')}</h3>
            {sel.missing.length === 0 ? (
              <p className="qa-muted">{t('qa.testing.drawer.complete')}</p>
            ) : (
              <ul className="qa-list">
                {sel.missing.map((m) => (
                  <li key={m}>
                    <code>{m}</code>
                  </li>
                ))}
              </ul>
            )}

            <h3 className="qa-h4">{t('qa.testing.drawer.widths')}</h3>
            {selHasParams && <p className="qa-note">{t('qa.testing.drawer.paramRoute')}</p>}
            <div className="qa-buttons">
              {OPEN_WIDTHS.map((w) => (
                <Button key={w} icon="↗" disabled={selHasParams} title={t('qa.testing.drawer.openHint', { width: w, role: roleFor(sel) })} onClick={() => openAt(sel, w)}>
                  {t('qa.testing.drawer.open', { width: `${w} px` })}
                </Button>
              ))}
              {hasSimulator ? (
                <Button href={`#${SIMULATOR_PATH}`} icon="▣">
                  {t('qa.testing.drawer.simulator')}
                </Button>
              ) : (
                <Placeholder what={t('qa.testing.drawer.simulatorWhat')}>
                  <Button icon="▣">{t('qa.testing.drawer.simulator')}</Button>
                </Placeholder>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
