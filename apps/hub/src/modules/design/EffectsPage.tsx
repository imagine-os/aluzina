import { useEffect, useState } from 'react';
import { Badge } from '../../components/atom/Badge/Badge';
import { BrandMark } from '../../components/atom/BrandMark/BrandMark';
import { Select } from '../../components/atom/Select/Select';
import { Shimmer } from '../../components/atom/Shimmer/Shimmer';
import { ToggleButton } from '../../components/atom/ToggleButton/ToggleButton';
import { Card } from '../../components/molecule/Card/Card';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { useT } from '../../i18n/I18nProvider';
import { Plate, Section } from './parts';
import { effectsSpec } from './specs';
import './design.css';

const INTENSITIES = ['0.2', '0.4', '0.6', '0.8', '1'];
const TEXTURE_SIZES = ['1.5rem', '2.5rem', '4rem', '6rem'];
const TEXTURES = ['lattice', 'chevron', 'circles', 'stars'] as const;
const RULES = ['rule1', 'rule2', 'rule3', 'rule4', 'rule5', 'rule6'] as const;

export function EffectsPage() {
  const { t } = useT();
  const [intensity, setIntensity] = useState('0.6');
  const [reduced, setReduced] = useState(false);
  const [motion, setMotion] = useState(true);
  const [size, setSize] = useState('2.5rem');
  const [sheen, setSheen] = useState(true);

  /** Motion starts from the system preference and the control says which way it went. */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => {
      setReduced(mq.matches);
      setMotion(!mq.matches);
    };
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const value = Number(intensity);

  return (
    <>
      <PageHeader
        code={effectsSpec.code}
        title={t('design.effects.title')}
        subtitle={t('design.effects.subtitle')}
        breadcrumb={[{ label: t('core.portal.design'), to: '/design' }, { label: t('design.effects.title') }]}
      />

      <div className="ds-page">
        <Card title={t('design.effects.controls')}>
          <div className="ds-controls">
            <Select
              label={t('design.effects.intensity')}
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              options={INTENSITIES.map((v) => ({ value: v, label: v }))}
            />
            <ToggleButton label={t('design.effects.motion')} pressed={motion} onClick={() => setMotion((m) => !m)}>
              {t(motion ? 'design.effects.motionOn' : 'design.effects.motionOff')}
            </ToggleButton>
            {reduced && <Badge tone="info">prefers-reduced-motion</Badge>}
          </div>
          <p className="ds-note">{t('design.effects.motionNote')}</p>
        </Card>

        <Section eyebrow={t('design.effects.shimmer')} desc={t('design.effects.shimmerDesc')}>
          <Shimmer finish="metal" intensity={value} motion={motion} className="ds-band">
            <div className="ds-band__inner">
              <BrandMark kind="wordmark" finish="iridescent" size="lg" label="Aluzina" />
              <span className="eyebrow eyebrow--wide ds-on-ink">{t('design.effects.bandMetal')}</span>
            </div>
          </Shimmer>
          <Shimmer finish="iridescent" intensity={value} motion={motion} className="ds-band">
            <div className="ds-band__inner">
              <BrandMark kind="wordmark" finish="flat" size="lg" label="Aluzina" />
              <span className="eyebrow eyebrow--wide ds-on-ink">{t('design.effects.bandIridescent')}</span>
            </div>
          </Shimmer>
          <div className="ds-grid ds-grid--4">
            <Plate caption={`${t('design.effects.tile')} · metal`}>
              <Shimmer finish="metal" intensity={value} motion={motion} className="ds-square" />
            </Plate>
            <Plate caption={`${t('design.effects.tile')} · iridescent`}>
              <Shimmer finish="iridescent" intensity={value} motion={motion} className="ds-square" />
            </Plate>
            <Plate caption={`${t('design.effects.chip')} · metal`}>
              <Shimmer finish="metal" intensity={value} motion={motion} className="ds-pill">
                <span className="ds-pill__label">ALUZINA</span>
              </Shimmer>
            </Plate>
            <Plate caption={`${t('design.effects.chip')} · iridescent`}>
              <Shimmer finish="iridescent" intensity={value} motion={motion} className="ds-pill">
                <span className="ds-pill__label">ALUZINA</span>
              </Shimmer>
            </Plate>
          </div>
          <div className="ds-grid ds-grid--2">
            <Plate caption={`${t('design.effects.fallback')} · .surface-metal`}>
              <span className="ds-gradient surface-metal" aria-hidden="true" />
            </Plate>
            <Plate caption={`${t('design.effects.fallback')} · .surface-iridescent`}>
              <span className="ds-gradient surface-iridescent" aria-hidden="true" />
            </Plate>
          </div>
          <p className="ds-note">{t('design.effects.fallbackDesc')}</p>
        </Section>

        <Section eyebrow={t('design.effects.textures')} desc={t('design.effects.texturesDesc')}>
          <div className="ds-controls">
            <Select
              label={t('design.effects.textureSize')}
              value={size}
              onChange={(e) => setSize(e.target.value)}
              options={TEXTURE_SIZES.map((v) => ({ value: v, label: v }))}
            />
          </div>
          <div className="ds-grid ds-grid--4" style={{ ['--texture-size' as string]: size }}>
            {TEXTURES.map((name) => (
              <Plate key={name} caption={<code>.texture-{name}</code>}>
                <span className={`ds-texture texture-${name}`} aria-hidden="true" />
              </Plate>
            ))}
          </div>
        </Section>

        <Section eyebrow={t('design.effects.finishes')} desc={t('design.effects.sheenDesc')}>
          <div className={`ds-band ds-band--css surface-metal${sheen ? ' sheen' : ''}`}>
            <div className="ds-band__inner">
              <span className="eyebrow eyebrow--wide ds-on-ink">{t('design.effects.sheen')}</span>
              <ToggleButton label={t('design.effects.sheen')} pressed={sheen} onClick={() => setSheen((s) => !s)}>
                {t(sheen ? 'design.effects.sheenOn' : 'design.effects.sheenOff')}
              </ToggleButton>
            </div>
          </div>
          <p className="ds-note">{t('design.effects.sheenHint')}</p>
          <div className="ds-grid ds-grid--2">
            <Plate caption={<code>.text-metal</code>}>
              <h3 className="ds-display text-metal">{t('design.effects.textMetal')}</h3>
            </Plate>
            <Plate caption={<code>.text-iridescent</code>}>
              <h3 className="ds-display text-iridescent">{t('design.effects.textIridescent')}</h3>
            </Plate>
          </div>
          <p className="ds-note">{t('design.effects.textDesc')}</p>
        </Section>

        <Card title={t('design.effects.rules')}>
          <ul className="ds-list">
            {RULES.map((r) => (
              <li key={r}>{t(`design.effects.${r}`)}</li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
