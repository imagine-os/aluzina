import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/atom/Badge/Badge';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { useTheme } from '../../design/ThemeProvider';
import { tokens, type ColorSet, type MetalName } from '../../design/tokens';
import { useT } from '../../i18n/I18nProvider';
import { contrast, ratioLabel } from './contrast';
import { currentMetal, METAL_NAMES } from './metal';
import { CopyButton, Plate } from './parts';
import { tokensSpec } from './specs';
import './design.css';

type Kind = 'text' | 'ui' | 'surface' | 'onFill' | 'edge';

/** Every colour token with how it is judged: text 4.5:1, interface 3:1, backgrounds and on-fill reported only. */
const COLOR_ROWS: { key: keyof ColorSet; kind: Kind }[] = [
  { key: 'bg', kind: 'surface' },
  { key: 'surface', kind: 'surface' },
  { key: 'surfaceRaised', kind: 'surface' },
  { key: 'text', kind: 'text' },
  { key: 'textMuted', kind: 'text' },
  { key: 'border', kind: 'edge' },
  { key: 'hairline', kind: 'edge' },
  { key: 'primary', kind: 'ui' },
  { key: 'primaryText', kind: 'onFill' },
  { key: 'accent', kind: 'ui' },
  { key: 'accentSoft', kind: 'surface' },
  { key: 'accentText', kind: 'text' },
  { key: 'focus', kind: 'ui' },
  { key: 'success', kind: 'text' },
  { key: 'successSoft', kind: 'surface' },
  { key: 'warning', kind: 'text' },
  { key: 'warningSoft', kind: 'surface' },
  { key: 'danger', kind: 'text' },
  { key: 'dangerSoft', kind: 'surface' },
  { key: 'info', kind: 'text' },
  { key: 'infoSoft', kind: 'surface' },
  { key: 'tintPeriwinkle', kind: 'surface' },
  { key: 'tintAqua', kind: 'surface' },
  { key: 'tintLime', kind: 'surface' },
  { key: 'metalText', kind: 'text' },
  { key: 'overlay', kind: 'surface' },
  { key: 'shadow', kind: 'surface' },
];

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
const colorVar = (key: string) => `--color-${kebab(key)}`;

interface ColorRow {
  key: string;
  cssVar: string;
  kind: Kind;
  light: string;
  dark: string;
}

/** Ratio + verdict of one colour against the theme's bg and surface. */
function Ratios({ value, theme, kind }: { value: string; theme: 'light' | 'dark'; kind: Kind }) {
  const { t } = useT();
  const set = tokens.color[theme];
  const vsBg = contrast(value, set.bg);
  const vsSurface = contrast(value, set.surface);
  const min = kind === 'text' ? 4.5 : kind === 'ui' ? 3 : null;
  const worst = vsBg !== null && vsSurface !== null ? Math.min(vsBg, vsSurface) : null;
  const pass = min !== null && worst !== null ? worst >= min : null;
  return (
    <span className="ds-ratios">
      <span className="ds-ratios__row">
        <span className="ds-muted">{t('design.tokens.vsBg')}</span> <code>{ratioLabel(vsBg)}</code>
      </span>
      <span className="ds-ratios__row">
        <span className="ds-muted">{t('design.tokens.vsSurface')}</span> <code>{ratioLabel(vsSurface)}</code>
      </span>
      {pass !== null ? (
        <Badge tone={pass ? 'success' : 'danger'} dot>
          {t(pass ? 'design.tokens.pass' : 'design.tokens.fail')} {min}:1
        </Badge>
      ) : (
        <Badge tone="neutral">{t('design.tokens.reportedOnly')}</Badge>
      )}
    </span>
  );
}

function Swatch({ value, theme }: { value: string; theme?: 'light' | 'dark' }) {
  return <span className="ds-chip" data-theme={theme} style={{ background: value }} aria-hidden="true" />;
}

/** getComputedStyle on <html>: what the browser is really using, re-read on resize and on a theme / metal change. */
function useLive() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((n) => n + 1);
    window.addEventListener('resize', on);
    const mo = new MutationObserver(on);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-metal'] });
    return () => {
      window.removeEventListener('resize', on);
      mo.disconnect();
    };
  }, []);
  return useMemo(() => {
    const cs = getComputedStyle(document.documentElement);
    const read = (n: string) => cs.getPropertyValue(n).trim();
    return {
      tick,
      width: window.innerWidth,
      scale: read('--scale') || '1',
      rootSize: cs.fontSize,
      target: read('--target'),
      focusRing: read('--focus-ring'),
      metalBase: read('--metal-base'),
      metalHighlight: read('--metal-highlight'),
      metalShade: read('--metal-shade'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);
}

export function TokensPage() {
  const { t } = useT();
  const { theme } = useTheme();
  const [q, setQ] = useState('');
  const live = useLive();
  const metal = currentMetal();

  const needle = q.trim().toLowerCase();
  const keep = (...parts: (string | number | undefined)[]) => !needle || parts.filter(Boolean).join(' ').toLowerCase().includes(needle);

  const colorRows: ColorRow[] = COLOR_ROWS.map((r) => ({
    key: String(r.key),
    cssVar: colorVar(String(r.key)),
    kind: r.kind,
    light: tokens.color.light[r.key],
    dark: tokens.color.dark[r.key],
  })).filter((r) => keep(r.key, r.cssVar, r.light, r.dark));

  const brandRows = Object.entries(tokens.brand).filter(([k, v]) => keep(k, `--brand-${kebab(k)}`, v));
  const gradientRows = Object.entries(tokens.gradient).filter(([k]) => keep(k, `--gradient-${kebab(k)}`));
  const fontRows = Object.entries(tokens.font).filter(([k, v]) => keep(k, `--font-${k}`, v));
  const weightRows = Object.entries(tokens.weight).filter(([k, v]) => keep(k, `--weight-${k}`, v));
  const trackingRows = Object.entries(tokens.tracking).filter(([k, v]) => keep(k, `--tracking-${k}`, v));
  const radiusRows = Object.entries(tokens.radius).filter(([k, v]) => keep(k, `--radius-${k}`, v));
  const spaceRows = Object.entries(tokens.space).filter(([k, v]) => keep(k, `--space-${k}`, v));
  const shadowRows = Object.entries(tokens.shadow).filter(([k, v]) => keep(k, `--shadow-${k}`, v));
  const miscRows = [
    ['--hairline', tokens.hairline],
    ['--target', tokens.target],
    ['--focus-ring', tokens.focusRing],
  ].filter(([k, v]) => keep(k, v));
  const metalRows = METAL_NAMES.filter((m) => keep(m, tokens.metal[m].base, tokens.metal[m].highlight, tokens.metal[m].shade));
  const bandRows = tokens.scale.filter((b) => keep(`${b.minWidth}`, `${b.scale}`));

  const total =
    COLOR_ROWS.length +
    Object.keys(tokens.brand).length +
    METAL_NAMES.length +
    Object.keys(tokens.gradient).length +
    Object.keys(tokens.font).length +
    Object.keys(tokens.weight).length +
    Object.keys(tokens.tracking).length +
    Object.keys(tokens.radius).length +
    Object.keys(tokens.space).length +
    Object.keys(tokens.shadow).length +
    3 +
    tokens.scale.length;
  const shown =
    colorRows.length + brandRows.length + metalRows.length + gradientRows.length + fontRows.length + weightRows.length + trackingRows.length + radiusRows.length + spaceRows.length + shadowRows.length + miscRows.length + bandRows.length;

  const activeBand = [...tokens.scale].reverse().find((b) => live.width >= b.minWidth) ?? tokens.scale[0];

  const colorColumns: Column<ColorRow>[] = [
    {
      key: 'key',
      header: t('design.tokens.col.token'),
      render: (r) => (
        <span className="ds-token">
          <strong>{r.key}</strong>
          <Badge tone="neutral">{t(`design.tokens.kind.${r.kind}`)}</Badge>
        </span>
      ),
    },
    {
      key: 'cssVar',
      header: t('design.tokens.col.var'),
      render: (r) => (
        <span className="ds-token">
          <code>{r.cssVar}</code>
          <CopyButton value={r.cssVar} what={r.cssVar} />
        </span>
      ),
    },
    {
      key: 'light',
      header: t('design.tokens.col.light'),
      render: (r) => (
        <span className="ds-cell">
          <Swatch value={r.light} theme="light" />
          <code>{r.light}</code>
          <Ratios value={r.light} theme="light" kind={r.kind} />
        </span>
      ),
    },
    {
      key: 'dark',
      header: t('design.tokens.col.dark'),
      render: (r) => (
        <span className="ds-cell">
          <Swatch value={r.dark} theme="dark" />
          <code>{r.dark}</code>
          <Ratios value={r.dark} theme="dark" kind={r.kind} />
        </span>
      ),
    },
  ];

  const bandColumns: Column<(typeof tokens.scale)[number]>[] = [
    { key: 'minWidth', header: t('design.tokens.col.token'), render: (b) => t('design.tokens.bandFrom', { width: b.minWidth }) },
    { key: 'scale', header: t('design.tokens.scale'), render: (b) => <code>{b.scale}</code> },
    { key: 'size', header: t('design.tokens.rootSize'), render: (b) => <code>{(16 * b.scale).toFixed(0)} px</code> },
    { key: 'active', header: t('design.tokens.bandActive'), render: (b) => (b.minWidth === activeBand.minWidth ? <Badge tone="success" dot>{t('design.tokens.bandActive')}</Badge> : null) },
  ];

  /** Each metal's own gradient as decoded from its manual edition (emitted as --gradient-metal inside :root[data-metal]). */
  const gradientOf = (m: MetalName) => tokens.metal[m].gradient;

  return (
    <>
      <PageHeader
        code={tokensSpec.code}
        title={t('design.tokens.title')}
        subtitle={t('design.tokens.subtitle')}
        breadcrumb={[{ label: t('core.portal.design'), to: '/design' }, { label: t('design.tokens.title') }]}
      />

      <div className="ds-page">
        <Card title={t('design.tokens.live')} subtitle={t('design.tokens.liveDesc')}>
          <KeyValue
            columns={3}
            items={[
              { key: t('design.tokens.theme'), value: <code>{theme}</code> },
              { key: t('design.tokens.metal'), value: <code>{metal}</code> },
              { key: t('design.tokens.scale'), value: <code>{live.scale}</code> },
              { key: t('design.tokens.viewport'), value: <code>{live.width} px</code> },
              { key: t('design.tokens.band'), value: <code>{t('design.tokens.bandFrom', { width: activeBand.minWidth })}</code> },
              { key: t('design.tokens.rootSize'), value: <code>{live.rootSize}</code> },
              { key: '--target', value: <code>{live.target}</code> },
              { key: '--focus-ring', value: <code>{live.focusRing}</code> },
              { key: '--metal-base', value: <code>{live.metalBase}</code> },
              { key: '--metal-highlight', value: <code>{live.metalHighlight}</code> },
              { key: '--metal-shade', value: <code>{live.metalShade}</code> },
            ]}
          />
        </Card>

        <FilterBar onClear={q ? () => setQ('') : undefined} summary={t('design.tokens.summary', { shown, total })}>
          <SearchField value={q} onChange={setQ} placeholder={t('design.tokens.search')} />
        </FilterBar>

        {shown === 0 && <EmptyState title={t('design.tokens.none')} />}

        {colorRows.length > 0 && (
          <Card title={t('design.tokens.colors')} subtitle={t('design.tokens.colorsDesc')} padding="sm">
            <DataTable caption={t('design.tokens.colors')} columns={colorColumns} rows={colorRows} rowKey={(r) => r.key} />
          </Card>
        )}

        {brandRows.length > 0 && (
          <Card title={t('design.tokens.brand')} subtitle={t('design.tokens.brandDesc')}>
            <ul className="ds-chips">
              {brandRows.map(([k, v]) => (
                <li key={k}>
                  <Swatch value={v} />
                  <span>
                    <strong>{k}</strong>
                    <code>--brand-{kebab(k)}</code>
                    <code>{v}</code>
                  </span>
                  <CopyButton value={v} what={v} />
                </li>
              ))}
            </ul>
          </Card>
        )}

        {metalRows.length > 0 && (
          <Card title={t('design.tokens.metalSets')} subtitle={t('design.tokens.metalSetsDesc')}>
            <div className="ds-grid ds-grid--2">
              {metalRows.map((m) => (
                <Plate
                  key={m}
                  caption={
                    <>
                      <strong>{m}</strong>{' '}
                      {m === tokens.metalDefault ? <Badge tone="accent">{t('design.tokens.default')}</Badge> : <Badge tone="neutral">{t('design.tokens.previous')}</Badge>} <code>{tokens.metal[m].base}</code>{' '}
                      <code>{tokens.metal[m].highlight}</code> <code>{tokens.metal[m].shade}</code>
                    </>
                  }
                >
                  <span className="ds-gradient" style={{ background: gradientOf(m) }} aria-hidden="true" />
                </Plate>
              ))}
            </div>
          </Card>
        )}

        {gradientRows.length > 0 && (
          <Card title={t('design.tokens.gradients')}>
            <div className="ds-grid ds-grid--2">
              {gradientRows.map(([k]) => (
                <Plate
                  key={k}
                  caption={
                    <>
                      <code>--gradient-{kebab(k)}</code> <CopyButton value={`var(--gradient-${kebab(k)})`} what={`--gradient-${kebab(k)}`} />
                    </>
                  }
                >
                  <span className="ds-gradient" style={{ background: `var(--gradient-${kebab(k)})` }} aria-hidden="true" />
                </Plate>
              ))}
            </div>
          </Card>
        )}

        {(fontRows.length > 0 || weightRows.length > 0 || trackingRows.length > 0) && (
          <Card title={t('design.tokens.type')}>
            {fontRows.length > 0 && (
              <KeyValue columns={1} items={fontRows.map(([k, v]) => ({ key: `--font-${k}`, value: <code>{v}</code> }))} />
            )}
            {weightRows.length > 0 && (
              <>
                <p className="eyebrow">{t('design.tokens.weights')}</p>
                <ul className="ds-weights">
                  {weightRows.map(([k, v]) => (
                    <li key={k} style={{ fontWeight: v }}>
                      <span className="ds-weights__num">--weight-{k}</span> {v} · Aluzina
                    </li>
                  ))}
                </ul>
              </>
            )}
            {trackingRows.length > 0 && (
              <>
                <p className="eyebrow">{t('design.tokens.tracking')}</p>
                <ul className="ds-weights">
                  {trackingRows.map(([k, v]) => (
                    <li key={k} style={{ letterSpacing: v, textTransform: 'uppercase' }}>
                      <span className="ds-weights__num" style={{ letterSpacing: 'normal' }}>--tracking-{k} ({v})</span> ALUZINA
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        )}

        {radiusRows.length > 0 && (
          <Card title={t('design.tokens.radius')}>
            <ul className="ds-boxes">
              {radiusRows.map(([k, v]) => (
                <li key={k}>
                  <span className="ds-box" style={{ borderRadius: v }} aria-hidden="true" />
                  <code>--radius-{k}</code>
                  <code>{v}</code>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {spaceRows.length > 0 && (
          <Card title={t('design.tokens.space')}>
            <ul className="ds-bars">
              {spaceRows.map(([k, v]) => (
                <li key={k}>
                  <code>--space-{k}</code>
                  <span className="ds-bar" style={{ width: v }} aria-hidden="true" />
                  <code>{v}</code>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {(shadowRows.length > 0 || miscRows.length > 0) && (
          <Card title={t('design.tokens.shadow')}>
            {shadowRows.length > 0 && (
              <ul className="ds-boxes">
                {shadowRows.map(([k, v]) => (
                  <li key={k}>
                    <span className="ds-box ds-box--shadow" style={{ boxShadow: v }} aria-hidden="true" />
                    <code>--shadow-{k}</code>
                  </li>
                ))}
              </ul>
            )}
            {miscRows.length > 0 && (
              <>
                <p className="eyebrow">{t('design.tokens.misc')}</p>
                <KeyValue columns={3} items={miscRows.map(([k, v]) => ({ key: k, value: <code>{v}</code> }))} />
              </>
            )}
          </Card>
        )}

        {bandRows.length > 0 && (
          <Card title={t('design.tokens.bands')} subtitle={t('design.tokens.bandsDesc')} padding="sm">
            <DataTable caption={t('design.tokens.bands')} columns={bandColumns} rows={bandRows} rowKey={(b) => String(b.minWidth)} />
          </Card>
        )}
      </div>
    </>
  );
}
