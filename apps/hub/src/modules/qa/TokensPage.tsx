import { useEffect, useMemo, useState } from 'react';
import { useRegisterActions } from '../../actions';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { tokens, type ColorSet } from '../../design/tokens';
import { useT } from '../../i18n/I18nProvider';
import { copyText } from '../../design/clipboard';
import { tokensSpec } from './specs';
import './qa.css';

/** Same camelCase -> kebab-case rule the token generator uses, so the names here are the real variables. */
const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

const COLOR_KEYS = Object.keys(tokens.color.light) as (keyof ColorSet)[];

/** Text-on-surface pairs worth a contrast number; the rest of the palette is decoration, not reading. */
const PAIRS: [keyof ColorSet, keyof ColorSet][] = [
  ['text', 'bg'],
  ['text', 'surface'],
  ['text', 'surfaceRaised'],
  ['textMuted', 'bg'],
  ['textMuted', 'surface'],
  ['textMuted', 'surfaceRaised'],
  ['primaryText', 'primary'],
  ['accentText', 'accent'],
  ['accentText', 'accentSoft'],
  ['accent', 'surface'],
  ['success', 'surface'],
  ['warning', 'surface'],
  ['danger', 'surface'],
  ['focus', 'bg'],
];

/** The rem ladder the library actually uses; sizes live in components, the ladder is the shared vocabulary. */
const TYPE_LADDER = [0.75, 0.8125, 0.875, 0.9375, 1, 1.125, 1.25, 1.5, 2, 2.5];

/** Elevations that are still hard-coded in component CSS (no shadow token exists yet). */
const SHADOWS = [
  { where: 'Toast', value: '0 0.5rem 1.5rem rgb(0 0 0 / 0.25)' },
  { where: 'Modal', value: '0 1rem 3rem rgb(0 0 0 / 0.3)' },
  { where: 'Drawer', value: '0 0 3rem rgb(0 0 0 / 0.3)' },
  { where: 'HubHeader', value: '0 0 1.25rem color-mix(in srgb, var(--color-accent) 55%, transparent)' },
  { where: 'DevTools (panel)', value: '0 0.25rem 1rem rgb(0 0 0 / 0.15)' },
  { where: 'DevTools (menu)', value: '0 0.5rem 2rem rgb(0 0 0 / 0.2)' },
];

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.1 relative luminance of a #rrggbb colour. */
function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

function scaleFor(width: number): number {
  let scale = tokens.scale[0].scale;
  for (const band of tokens.scale) if (width >= band.minWidth) scale = band.scale;
  return scale;
}

const px = (rem: string | number, scale: number) => Math.round(parseFloat(String(rem)) * 16 * scale * 100) / 100;

interface Flat {
  name: string;
  variable: string;
  value: string;
}

/** D-14: the design system as data, straight from src/design/tokens.ts. */
export function TokensPage() {
  const { t } = useT();
  const [q, setQ] = useState('');
  const [band, setBand] = useState<number | null>(null);
  const [viewport, setViewport] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth));
  const [rootPx, setRootPx] = useState(16);

  useEffect(() => {
    const onResize = () => {
      setViewport(window.innerWidth);
      setRootPx(parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const width = band ?? viewport;
  const scale = scaleFor(width);
  const activeBand = [...tokens.scale].reverse().find((b) => width >= b.minWidth)?.minWidth ?? 0;
  const needle = q.trim().toLowerCase();
  const keep = (name: string, variable: string) => !needle || `${name} ${variable}`.toLowerCase().includes(needle);

  const flat = useMemo<Flat[]>(() => {
    const out: Flat[] = COLOR_KEYS.map((k) => ({ name: `color.${k}`, variable: `--color-${kebab(k)}`, value: tokens.color.light[k] }));
    for (const [k, v] of Object.entries(tokens.font)) out.push({ name: `font.${k}`, variable: `--font-${k}`, value: v });
    for (const [k, v] of Object.entries(tokens.radius)) out.push({ name: `radius.${k}`, variable: `--radius-${k}`, value: v });
    for (const [k, v] of Object.entries(tokens.space)) out.push({ name: `space.${k}`, variable: `--space-${k}`, value: v });
    out.push({ name: 'target', variable: '--target', value: tokens.target });
    out.push({ name: 'focusRing', variable: '--focus-ring', value: tokens.focusRing });
    out.push({ name: 'scale', variable: '--scale', value: String(scale) });
    return out;
  }, [scale]);

  const copy = async (variable: string): Promise<string> => {
    const text = `var(${variable})`;
    toast(t((await copyText(text)) ? 'qa.copied' : 'qa.copyFailed'));
    return text;
  };

  const colors = COLOR_KEYS.filter((k) => keep(`color.${k}`, `--color-${kebab(k)}`));
  const fonts = Object.entries(tokens.font).filter(([k]) => keep(`font.${k}`, `--font-${k}`));
  const spaces = Object.entries(tokens.space).filter(([k]) => keep(`space.${k}`, `--space-${k}`));
  const radii = Object.entries(tokens.radius).filter(([k]) => keep(`radius.${k}`, `--radius-${k}`));
  const showType = fonts.length > 0 || keep('type scale', '--scale');
  const showShadows = keep('shadow', '--shadow');
  const showScale = keep('scale', '--scale');
  const showTarget = keep('target focusRing', '--target --focus-ring');
  const nothing = colors.length === 0 && fonts.length === 0 && spaces.length === 0 && radii.length === 0 && !showShadows && !showScale && !showTarget;

  const contrastRows = useMemo(
    () =>
      (['light', 'dark'] as const).flatMap((theme) =>
        PAIRS.map(([fg, bg]) => {
          const ratio = contrast(tokens.color[theme][fg], tokens.color[theme][bg]);
          return { id: `${theme}-${fg}-${bg}`, theme, fg, bg, ratio: Math.round(ratio * 100) / 100 };
        }),
      ),
    [],
  );

  useRegisterActions({
    'qa.searchTokens': ({ query }) => {
      setQ(String(query ?? ''));
      return String(query ?? '');
    },
    'qa.copyToken': ({ token }) => {
      const name = String(token ?? '').toLowerCase();
      const hit = flat.find((f) => f.name.toLowerCase() === name || f.variable.toLowerCase() === name || f.name.toLowerCase().endsWith(`.${name}`));
      if (!hit) return t('qa.actions.notFound', { id: String(token ?? '') });
      return copy(hit.variable);
    },
    'qa.previewScale': ({ width: w }) => {
      const n = Number(w);
      if (!Number.isFinite(n)) return t('qa.unknown');
      setBand(n);
      return t('qa.tokens.previewedScale', { width: n, scale: scaleFor(n) });
    },
    'qa.editToken': () => {
      toast(t('core.placeholder.toast'));
      return t('qa.tokens.editWhat');
    },
  });

  return (
    <div className="qa-stack">
      <PageHeader
        code={tokensSpec.code}
        title={t('qa.tokens.title')}
        subtitle={t('qa.tokens.subtitle')}
        breadcrumb={[{ label: t('core.portal.dev'), to: '/dev/components' }, { label: t('qa.nav.tokens') }]}
        actions={
          <Placeholder what={t('qa.tokens.editWhat')}>
            <Button icon="✎">{t('qa.tokens.edit')}</Button>
          </Placeholder>
        }
      />

      <div className="qa-toolbar">
        <SearchField value={q} onChange={setQ} placeholder={t('qa.tokens.search')} />
        <Select
          label={t('qa.tokens.preview')}
          value={band === null ? '' : String(band)}
          onChange={(e) => setBand(e.target.value === '' ? null : Number(e.target.value))}
          placeholder={t('qa.tokens.previewCurrent', { width: viewport })}
          options={tokens.scale.filter((b) => b.minWidth > 0).map((b) => ({ value: String(b.minWidth), label: `${b.minWidth} px · ×${b.scale}` }))}
        />
      </div>

      {nothing && <EmptyState title={t('qa.none')} description={t('qa.noneDesc')} />}

      {colors.length > 0 && (
        <Card title={t('qa.tokens.colors')} subtitle={t('qa.tokens.colorsSub')}>
          <ul className="qa-swatches">
            {colors.map((k) => (
              <li key={k} className="qa-swatch">
                <div className="qa-swatch__pair" aria-hidden="true">
                  <span className="qa-swatch__chip" style={{ background: tokens.color.light[k] }} />
                  <span className="qa-swatch__chip" style={{ background: tokens.color.dark[k] }} />
                </div>
                <div className="qa-swatch__text">
                  <code className="qa-swatch__var">--color-{kebab(k)}</code>
                  <span className="qa-muted">
                    {t('qa.tokens.light')} {tokens.color.light[k]} · {t('qa.tokens.dark')} {tokens.color.dark[k]}
                  </span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => void copy(`--color-${kebab(k)}`)}>
                  {t('qa.tokens.copy')}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {colors.length > 0 && (
        <Card title={t('qa.tokens.contrast')} subtitle={t('qa.tokens.contrastSub')}>
          <DataTable
            caption={t('qa.tokens.contrast')}
            rows={contrastRows}
            rowKey={(r) => r.id}
            dense
            initialSort={{ key: 'ratio', dir: 'asc' }}
            columns={[
              { key: 'pair', header: t('qa.tokens.col.pair'), render: (r) => (<span className="qa-cell"><span className="qa-chip" style={{ background: tokens.color[r.theme][r.bg], color: tokens.color[r.theme][r.fg] }}>Aa</span> <code>{r.fg}</code> / <code>{r.bg}</code></span>) },
              { key: 'theme', header: t('qa.tokens.col.theme'), sortable: true, render: (r) => t(r.theme === 'light' ? 'qa.tokens.light' : 'qa.tokens.dark') },
              { key: 'ratio', header: t('qa.tokens.col.ratio'), sortable: true, align: 'end', render: (r) => `${r.ratio.toFixed(2)}:1` },
              { key: 'verdict', header: t('qa.tokens.col.verdict'), sortValue: (r) => r.ratio, render: (r) => <Badge tone={r.ratio >= 4.5 ? 'success' : r.ratio >= 3 ? 'warning' : 'danger'} dot>{t(r.ratio >= 4.5 ? 'qa.tokens.pass' : r.ratio >= 3 ? 'qa.tokens.largeOnly' : 'qa.tokens.fail')}</Badge> },
            ]}
          />
        </Card>
      )}

      {showType && (
        <Card title={t('qa.tokens.type')} subtitle={t('qa.tokens.typeSub')}>
          <ul className="qa-fonts">
            {fonts.map(([k, v]) => (
              <li key={k}>
                <div className="qa-cell">
                  <code>--font-{k}</code>
                  <Button size="sm" variant="ghost" onClick={() => void copy(`--font-${k}`)}>
                    {t('qa.tokens.copy')}
                  </Button>
                </div>
                <p className="qa-fontsample" style={{ fontFamily: v }}>
                  {t('qa.tokens.sample')}
                </p>
                <span className="qa-muted">{v}</span>
              </li>
            ))}
          </ul>
          <DataTable
            caption={t('qa.tokens.type')}
            rows={TYPE_LADDER.map((rem) => ({ id: String(rem), rem }))}
            rowKey={(r) => r.id}
            dense
            columns={[
              { key: 'rem', header: t('qa.tokens.col.rem'), render: (r) => <code>{r.rem}rem</code> },
              { key: 'px', header: t('qa.tokens.col.px'), align: 'end', render: (r) => `${px(r.rem, scale)} px` },
              { key: 'used', header: t('qa.tokens.col.used'), render: (r) => t(`qa.tokens.use.${r.rem}`) },
            ]}
          />
        </Card>
      )}

      {spaces.length > 0 && (
        <Card title={t('qa.tokens.spacing')} subtitle={t('qa.tokens.spacingSub')}>
          <ul className="qa-bars">
            {spaces.map(([k, v]) => (
              <li key={k}>
                <code>--space-{k}</code>
                <span className="qa-bar" style={{ width: v }} aria-hidden="true" />
                <span className="qa-muted">{v} · {px(v, scale)} px</span>
                <Button size="sm" variant="ghost" onClick={() => void copy(`--space-${k}`)}>
                  {t('qa.tokens.copy')}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {radii.length > 0 && (
        <Card title={t('qa.tokens.radii')} subtitle={t('qa.tokens.radiiSub')}>
          <ul className="qa-radii">
            {radii.map(([k, v]) => (
              <li key={k}>
                <span className="qa-radius" style={{ borderRadius: v }} aria-hidden="true" />
                <code>--radius-{k}</code>
                <span className="qa-muted">{v}</span>
                <Button size="sm" variant="ghost" onClick={() => void copy(`--radius-${k}`)}>
                  {t('qa.tokens.copy')}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {showShadows && (
        <Card title={t('qa.tokens.shadows')} subtitle={t('qa.tokens.shadowsSub')}>
          <DataTable
            caption={t('qa.tokens.shadows')}
            rows={SHADOWS.map((s) => ({ id: s.where, ...s }))}
            rowKey={(r) => r.id}
            dense
            columns={[
              { key: 'where', header: t('qa.tokens.col.where') },
              { key: 'value', header: t('qa.tokens.col.value'), render: (r) => <code>{r.value}</code> },
            ]}
          />
        </Card>
      )}

      {showScale && (
        <Card title={t('qa.tokens.scale')} subtitle={t('qa.tokens.scaleSub')}>
          <DataTable
            caption={t('qa.tokens.scale')}
            rows={tokens.scale.map((b) => ({ id: String(b.minWidth), ...b }))}
            rowKey={(r) => r.id}
            dense
            columns={[
              { key: 'minWidth', header: t('qa.tokens.col.band'), render: (r) => (<span className="qa-cell">{r.minWidth} px {r.minWidth === activeBand && <Badge tone="accent">{t('qa.tokens.here')}</Badge>}</span>) },
              { key: 'scale', header: t('qa.tokens.col.scale'), align: 'end', render: (r) => `×${r.scale}` },
              { key: 'root', header: t('qa.tokens.col.root'), align: 'end', render: (r) => `${16 * r.scale} px` },
              { key: 'target', header: t('qa.tokens.col.target'), align: 'end', render: (r) => `${px(tokens.target, r.scale)} px` },
            ]}
          />
          <KeyValue
            columns={2}
            items={[
              { key: t('qa.tokens.preview'), value: t('qa.tokens.previewedScale', { width, scale }) },
              { key: t('qa.tokens.measured'), value: `${viewport} px` },
              { key: t('qa.tokens.rootMeasured'), value: `${rootPx} px` },
              { key: t('qa.tokens.targetMeasured'), value: `${Math.round(rootPx * parseFloat(tokens.target) * 100) / 100} px` },
            ]}
          />
        </Card>
      )}

      {showTarget && (
        <Card title={t('qa.tokens.targetTitle')} subtitle={t('qa.tokens.targetSub')}>
          <div className="qa-targetdemo">
            <Button variant="secondary">{t('qa.tokens.targetDemo')}</Button>
            <KeyValue
              columns={2}
              items={[
                { key: '--target', value: <code>{tokens.target}</code> },
                { key: '--focus-ring', value: <code>{tokens.focusRing}</code> },
              ]}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
