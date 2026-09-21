import { useState } from 'react';
import { useRegisterActions } from '../../actions/useRegisterAction';
import { GLYPH_NAMES } from '../../brand/paths';
import { Badge } from '../../components/atom/Badge/Badge';
import { BrandMark } from '../../components/atom/BrandMark/BrandMark';
import { Button } from '../../components/atom/Button/Button';
import { Shimmer } from '../../components/atom/Shimmer/Shimmer';
import { ToggleButton } from '../../components/atom/ToggleButton/ToggleButton';
import { Card } from '../../components/molecule/Card/Card';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { tokens, type MetalName, type ThemeName } from '../../design/tokens';
import { useT } from '../../i18n/I18nProvider';
import { applyMetal, currentMetal, isMetalName, METAL_NAMES } from './metal';
import { CopyButton, Plate, Section } from './parts';
import { brandSpec, MANUAL_URL } from './specs';
import './design.css';

/** The manual's four printed colours, with the print data it prints beside each diamond (silver edition). */
const PALETTE = [
  { key: 'silver', nameKey: 'design.brand.colors.silver', hex: tokens.brand.silver, pantone: '877 C', rgb: '192, 192, 192', cmyk: '0, 0, 0, 25', roleKey: 'design.brand.colors.rolePrimary' },
  { key: 'periwinkle', nameKey: 'design.brand.tone.periwinkle', hex: tokens.brand.periwinkle, pantone: '270 C', rgb: '194, 209, 247', cmyk: '21, 12, 0, 0', roleKey: 'design.brand.colors.roleSecondary' },
  { key: 'aqua', nameKey: 'design.brand.tone.aqua', hex: tokens.brand.aqua, pantone: '3245 C', rgb: '130, 254, 231', cmyk: '38, 0, 20, 0', roleKey: 'design.brand.colors.roleSecondary' },
  { key: 'lime', nameKey: 'design.brand.tone.lime', hex: tokens.brand.lime, pantone: '379 C', rgb: '221, 255, 121', cmyk: '16, 0, 67, 0', roleKey: 'design.brand.colors.roleSecondary' },
] as const;

const GRADIENTS = [
  { var: '--gradient-metal', key: 'metal' },
  { var: '--gradient-metal-soft', key: 'metalSoft' },
  { var: '--gradient-iridescent', key: 'iridescent' },
  { var: '--gradient-iridescent-x', key: 'iridescentX' },
  { var: '--gradient-iridescent-soft', key: 'iridescentSoft' },
] as const;

const TEXTURES = ['lattice', 'chevron', 'circles', 'stars'] as const;
const WEIGHTS = [
  ['light', 300],
  ['regular', 400],
  ['medium', 500],
  ['bold', 700],
  ['black', 900],
] as const;
const GAPS = ['clearSpace', 'misuse', 'photo', 'voice', 'icons', 'grid', 'a11y', 'dark'] as const;
const DEFECTS = ['hex', 'labels', 'rules'] as const;

/** One sample card rendered inside a forced theme, so both themes are visible whatever the header says. */
function ThemeSample({ theme }: { theme: ThemeName }) {
  const { t } = useT();
  return (
    <div className="ds-theme" data-theme={theme}>
      <div className="ds-theme__inner">
        <p className="eyebrow">{t(`design.brand.themes.${theme}`)}</p>
        <Card title={t('design.brand.themes.sampleTitle')} subtitle={t('design.brand.themes.sampleMuted')} actions={<Badge tone="accent">{t('design.brand.themes.sampleBadge')}</Badge>}>
          <BrandMark kind="wordmark" size="md" />
          <p className="ds-theme__body">{t('design.brand.themes.sampleBody')}</p>
          <hr className="hairline" />
          <p className="ds-muted">{t('design.brand.themes.sampleMuted')}</p>
        </Card>
      </div>
    </div>
  );
}

/** Action design.downloadManual: the same file the header button links to. */
function downloadManual() {
  const a = document.createElement('a');
  a.href = MANUAL_URL;
  a.download = '';
  a.rel = 'noreferrer';
  document.body.append(a);
  a.click();
  a.remove();
  return { url: MANUAL_URL };
}

export function BrandPage() {
  const { t } = useT();
  const [metal, setMetal] = useState<MetalName>(() => currentMetal());

  /** Action design.previewMetal: <html data-metal> + aluzina.metal. A preview, not the switch. */
  const preview = (name: MetalName) => {
    applyMetal(name);
    setMetal(name);
  };

  useRegisterActions({
    'design.downloadManual': downloadManual,
    'design.previewMetal': (p) => {
      const name = String(p.metal ?? '');
      if (!isMetalName(name)) throw new Error(`unknown metal: ${name}`);
      preview(name);
      return { metal: name };
    },
  });

  return (
    <>
      <PageHeader
        code={brandSpec.code}
        title={t('design.brand.title')}
        subtitle={t('design.brand.subtitle')}
        breadcrumb={[{ label: t('core.portal.design'), to: '/design' }, { label: t('design.brand.title') }]}
        actions={
          <Button variant="primary" size="lg" icon="↓" href={MANUAL_URL} download="MANUAL-DE-MARCA-ALUZINA.pdf" className="ds-download">
            {t('design.brand.manual.download')}
          </Button>
        }
      />

      <div className="ds-page">
        <Card title={t('design.brand.manual.title')} subtitle={t('design.brand.manual.subtitle')}>
          <KeyValue
            columns={3}
            items={[
              { key: t('design.brand.manual.edition'), value: t('design.brand.manual.editionValue') },
              { key: t('design.brand.manual.previous'), value: t('design.brand.manual.previousValue') },
              { key: t('design.brand.manual.file'), value: <code>brand/MANUAL-DE-MARCA-ALUZINA.pdf · 496 KB</code> },
            ]}
          />
        </Card>

        <Section eyebrow={t('design.brand.logo.eyebrow')} desc={t('design.brand.logo.desc')}>
          <div className="ds-grid ds-grid--2">
            <Plate caption={t('design.brand.logo.primary')}>
              <div className="ds-tile ds-tile--stack" data-theme="light">
                <BrandMark kind="wordmark" size="lg" label="Aluzina" />
                <BrandMark kind="descriptor" variant="interiorismo" size="md" />
              </div>
            </Plate>
            <Plate caption={t('design.brand.logo.band')}>
              <div className="ds-tile ds-tile--wide surface-ink">
                <BrandMark kind="wordmark" size="lg" label="Aluzina" />
                <BrandMark kind="descriptor" size="md" label="Universo de diseño" />
              </div>
            </Plate>
          </div>
          <div className="ds-grid ds-grid--2">
            <Plate caption={t('design.brand.logo.light')}>
              <div className="ds-tile" data-theme="light">
                <BrandMark kind="wordmark" size="lg" label="Aluzina" />
              </div>
            </Plate>
            <Plate caption={t('design.brand.logo.dark')}>
              <div className="ds-tile" data-theme="dark">
                <BrandMark kind="wordmark" size="lg" label="Aluzina" />
              </div>
            </Plate>
          </div>
          <div className="ds-grid ds-grid--2">
            <Plate caption={t('design.brand.logo.descriptorUniverso')}>
              <div className="ds-tile ds-tile--wide">
                <BrandMark kind="wordmark" finish="metal" size="md" label="Aluzina" />
                <BrandMark kind="descriptor" size="md" label="Universo de diseño" />
              </div>
            </Plate>
            <Plate caption={t('design.brand.logo.descriptorInteriorismo')}>
              <div className="ds-tile ds-tile--wide" data-theme="light">
                <BrandMark kind="wordmark" size="md" label="Aluzina" />
                <BrandMark kind="descriptor" variant="interiorismo" size="md" />
              </div>
            </Plate>
          </div>
          <p className="ds-note">{t('design.brand.logo.descriptorNote')}</p>
          <Card title={t('design.brand.logo.rules')}>
            <ul className="ds-list">
              <li>{t('design.brand.logo.rulePrimary')}</li>
              <li>{t('design.brand.logo.ruleFinish')}</li>
              <li>
                {t('design.brand.logo.ruleLockup')} <em className="ds-house">{t('design.houseRule')}</em>
              </li>
              <li>
                {t('design.brand.logo.ruleMin')} <em className="ds-house">{t('design.houseRule')}</em>
              </li>
              <li>
                {t('design.brand.logo.ruleClear')} <em className="ds-house">{t('design.houseRule')}</em>
              </li>
            </ul>
          </Card>
        </Section>

        <Section eyebrow={t('design.brand.monogram.eyebrow')} desc={t('design.brand.monogram.desc')}>
          <div className="ds-row">
            {(['periwinkle', 'aqua', 'lime'] as const).map((tone) => (
              <Plate key={tone} caption={t(`design.brand.tone.${tone}`)}>
                <BrandMark kind="monogram" tone={tone} size="xl" label={t(`design.brand.tone.${tone}`)} />
              </Plate>
            ))}
            <Plate caption={t('design.brand.tone.metal')}>
              <BrandMark kind="monogram" size="xl" label={t('design.brand.tone.metal')} />
            </Plate>
            <Plate caption={t('design.brand.tone.outline')}>
              <BrandMark kind="monogram" finish="outline" size="xl" label={t('design.brand.tone.outline')} />
            </Plate>
          </div>
        </Section>

        <Section eyebrow={t('design.brand.colors.eyebrow')} desc={t('design.brand.colors.desc')}>
          <div className="ds-grid ds-grid--4">
            {PALETTE.map((c) => (
              <Card key={c.key} className="ds-swatch" title={t(c.nameKey)} actions={<CopyButton value={c.hex} what={c.hex} />}>
                <span className="ds-diamond" style={{ background: c.hex }} aria-hidden="true" />
                <KeyValue
                  columns={1}
                  items={[
                    { key: 'PANTONE', value: <code>{c.pantone}</code> },
                    { key: t('design.brand.colors.hex'), value: <code>{c.hex}</code> },
                    { key: 'RGB', value: <code>{c.rgb}</code> },
                    { key: 'CMYK', value: <code>{c.cmyk}</code> },
                    { key: t('design.brand.colors.role'), value: t(c.roleKey) },
                  ]}
                />
              </Card>
            ))}
          </div>
          <ul className="ds-list ds-notes">
            <li>
              <span className="ds-dot" style={{ background: tokens.brand.silver }} aria-hidden="true" />
              {t('design.brand.colors.noteStaleHex')}
            </li>
            <li>
              <span className="ds-dot" style={{ background: tokens.metal.silver.shade }} aria-hidden="true" />
              {t('design.brand.colors.noteRamp')}
            </li>
            <li>
              <span className="ds-dot" style={{ background: tokens.brand.black }} aria-hidden="true" />
              {t('design.brand.colors.noteBlack')}
            </li>
            <li>
              <span className="ds-dot" style={{ background: tokens.brand.ink }} aria-hidden="true" />
              {t('design.brand.colors.noteInk')}
            </li>
            <li>{t('design.brand.colors.noteContrast')}</li>
          </ul>
        </Section>

        <Section eyebrow={t('design.brand.metal.eyebrow')} desc={t('design.brand.metal.desc')}>
          <div className="ds-controls" role="group" aria-label={t('design.brand.metal.preview')}>
            <span className="ds-controls__label">{t('design.brand.metal.preview')}</span>
            {METAL_NAMES.map((name) => (
              <ToggleButton key={name} label={t(`design.brand.metal.${name}`)} pressed={metal === name} onClick={() => preview(name)}>
                {t(`design.brand.metal.${name}`)}
              </ToggleButton>
            ))}
            <Badge tone={metal === tokens.metalDefault ? 'success' : 'warning'}>
              {t(metal === tokens.metalDefault ? 'design.brand.metal.current' : 'design.brand.metal.previous')}
            </Badge>
          </div>
          <Shimmer finish="metal" intensity={0.4} className="ds-band">
            <div className="ds-band__inner">
              <BrandMark kind="wordmark" size="lg" label="Aluzina" />
              <BrandMark kind="descriptor" size="md" label="Universo de diseño" />
            </div>
          </Shimmer>
          <p className="ds-note">{t('design.brand.metal.note')}</p>
        </Section>

        <Section eyebrow={t('design.brand.gradients.eyebrow')} desc={t('design.brand.gradients.desc')}>
          <div className="ds-grid ds-grid--2">
            {GRADIENTS.map((g) => (
              <Plate key={g.var} caption={<><span>{t(`design.brand.gradients.${g.key}`)}</span> <code>{g.var}</code></>}>
                <span className="ds-gradient" style={{ background: `var(${g.var})` }} aria-hidden="true" />
              </Plate>
            ))}
          </div>
        </Section>

        <Section eyebrow={t('design.brand.type.eyebrow')} desc={t('design.brand.type.desc')}>
          <Card title="DIN Round Pro" subtitle={t('design.brand.type.samples')}>
            <p className="eyebrow">{t('design.brand.type.lower')}</p>
            <p className="ds-specimen">abcdefghijklmnopqrstuvwxyz</p>
            <p className="eyebrow">{t('design.brand.type.upper')}</p>
            <p className="ds-specimen">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
            <p className="eyebrow">{t('design.brand.type.digits')}</p>
            <p className="ds-specimen">0123456789 &amp; ? ! / — .</p>
            <hr className="hairline" />
            <p className="eyebrow">{t('design.brand.type.weights')}</p>
            <ul className="ds-weights">
              {WEIGHTS.map(([name, w]) => (
                <li key={name} style={{ fontWeight: w }}>
                  <span className="ds-weights__num">{w}</span> Aluzina · {name}
                </li>
              ))}
            </ul>
            <hr className="hairline" />
            <p className="eyebrow eyebrow--wide">{t('design.brand.type.sampleEyebrow')}</p>
            <h3 className="ds-sample-heading">{t('design.brand.type.sampleHeading')}</h3>
            <p>{t('design.brand.type.sampleBody')}</p>
          </Card>
          <p className="ds-note">{t('design.brand.type.note')}</p>
        </Section>

        <Section eyebrow={t('design.brand.elements.eyebrow')} desc={t('design.brand.elements.desc')}>
          <div className="ds-row ds-row--glyphs">
            {GLYPH_NAMES.map((g) => (
              <Plate key={g} caption={<span className="ds-glyph-name">{g.toUpperCase()}</span>}>
                <BrandMark kind="glyph" glyph={g} finish="outline" size="lg" label={g} />
              </Plate>
            ))}
          </div>
        </Section>

        <Section eyebrow={t('design.brand.textures.eyebrow')} desc={t('design.brand.textures.desc')}>
          <div className="ds-grid ds-grid--4">
            {TEXTURES.map((name) => (
              <Plate key={name} caption={t(`design.brand.textures.${name}`)}>
                <span className={`ds-texture texture-${name}`} aria-hidden="true" />
              </Plate>
            ))}
          </div>
          <div className="ds-grid ds-grid--4">
            <Plate caption={t('design.brand.textures.circleIridescent')}>
              <span className="ds-circle surface-iridescent" aria-hidden="true" />
            </Plate>
            <Plate caption={t('design.brand.textures.circleBlack')}>
              <span className="ds-circle" style={{ background: 'var(--brand-black)' }} aria-hidden="true" />
            </Plate>
            <Plate caption={t('design.brand.textures.circleMetal')}>
              <span className="ds-circle ds-circle--disc" aria-hidden="true" />
            </Plate>
            <Plate caption={t('design.brand.textures.circleFlat')}>
              <span className="ds-circle" style={{ background: 'var(--metal-base)' }} aria-hidden="true" />
            </Plate>
          </div>
          <p className="ds-note">{t('design.brand.textures.more')}</p>
        </Section>

        <Section eyebrow={t('design.brand.themes.eyebrow')} desc={t('design.brand.themes.desc')}>
          <div className="ds-grid ds-grid--2">
            <ThemeSample theme="light" />
            <ThemeSample theme="dark" />
          </div>
        </Section>

        <Section eyebrow={t('design.brand.defects.eyebrow')} desc={t('design.brand.defects.desc')}>
          <Card title={t('design.brand.defects.title')} subtitle={t('design.brand.defects.owner')}>
            <ol className="ds-list">
              {DEFECTS.map((d) => (
                <li key={d}>{t(`design.brand.defects.${d}`)}</li>
              ))}
            </ol>
            <hr className="hairline" />
            <p className="ds-note">{t('design.brand.defects.open')}</p>
          </Card>
        </Section>

        <Section eyebrow={t('design.brand.gaps.eyebrow')} desc={t('design.brand.gaps.desc')}>
          <Card>
            <ul className="ds-list ds-list--gaps">
              {GAPS.map((g) => (
                <li key={g}>{t(`design.brand.gaps.${g}`)}</li>
              ))}
            </ul>
          </Card>
        </Section>

        <hr className="hairline" />
        <p className="ds-source">{t('design.brand.source')}</p>
      </div>
    </>
  );
}
