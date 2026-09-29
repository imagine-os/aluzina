import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { Button } from '../../components/atom/Button/Button';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { useTheme } from '../../design/ThemeProvider';
import { DeskStage } from '../../desk/DeskStage';
import type { DeskModel, Mat, PlacedItem } from '../../desk/types';
import { useDesk } from '../../desk/useDesk';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { pick } from '../../tenant/domain';
import { useHubMap } from './hubMap.load';
import { HUB_LENS_IDS, type HubLensId, type HubMap } from './hubMap.types';
import { buildLens, toolsDefault } from './lenses';
import { clientHub } from './registry';
import { LENSES_CODE } from './specs';
import './clienthub.css';

const EMPTY: DeskModel = { code: LENSES_CODE, mats: [], items: [] };

/** One lens as a small desk: the host's framing, counts, the fitted desk (size S), Open this view (W-05). */
function LensDesk({ map, lens, facesLang, clientId }: { map: HubMap | null; lens: HubLensId; facesLang: 'es' | 'en'; clientId: string }) {
  const { t, lang } = useT();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const built = useMemo(() => (map ? buildLens(map, lens, { facesLang, theme, showTools: toolsDefault(map, lens) }) : null), [map, lens, facesLang, theme]);
  const model = built ? { ...built.model, code: `${LENSES_CODE}-${lens}` } : EMPTY;
  const hubPath = `/founder/clients/${clientId}/hub`;
  const open = (id?: string) => navigate(`${hubPath}?${new URLSearchParams({ ...(lens === 'aluzina' ? {} : { lens }), faces: facesLang, ...(id ? { open: id } : {}) }).toString()}`);
  const desk = useDesk({ code: model.code, model, defaultSize: 's', compactOpenByDefault: true, onOpenItem: (id) => open(id), actions: false });
  const hint = map?.lenses[lens];
  const b = (x: { es: string; en: string } | undefined) => (x ? x[lang] ?? x.en : '');
  const matName = (m: Mat) => pick(m.label, lang);
  const subName = (group: string, m: Mat) => {
    const def = model.mats.find((x) => x.id === m.id);
    return def?.subLabels?.[group] ? pick(def.subLabels[group], lang) : group;
  };
  const label = (i: PlacedItem) => `${t(`desk.kind.${i.kind}`)}: ${i.code ?? ''} ${pick(i.title, lang)}. ${t('clienthub.lenses.openWhat')}`;
  return (
    <Card
      className="ch-lens"
      title={t(`clienthub.lens.${lens}`)}
      subtitle={t(`clienthub.lens.hint.${lens}`)}
      actions={
        <Button size="sm" variant="primary" title={t('clienthub.lenses.openWhat')} onClick={() => open()}>
          {t('clienthub.lenses.open')}
        </Button>
      }
    >
      {hint && (
        <p className="ch-lens__framing">
          <strong>{b(hint.title)}.</strong> {b(hint.framing)}
        </p>
      )}
      <p className="ch-muted">{t('clienthub.lenses.count', { objects: desk.layout.items.length, mats: desk.layout.mats.length })}</p>
      <DeskStage
        desk={desk}
        stageLabel={t('clienthub.lenses.stage', { lens: t(`clienthub.lens.${lens}`) })}
        hint={t('clienthub.lenses.hint')}
        matName={matName}
        matAria={(m) => t('clienthub.matLabel', { name: matName(m), n: m.count })}
        matCount={(m) => t('clienthub.screens', { n: m.count })}
        matSelectPlaceholder={t('clienthub.goToMat')}
        subLabel={(s, m) => subName(s.group, m)}
        itemLabel={label}
        tipOf={(i) => ({ title: `${i.code ? `${i.code} · ` : ''}${pick(i.title, lang)}`, meta: t(`desk.kind.${i.kind}`) })}
        selected={null}
        personLabel={(p, m) => t('clienthub.personLabel', { role: pick(p.caption ?? p.role.playbookRole, lang), name: p.firstName ? ` (${p.firstName})` : '', mat: matName(m) })}
        onActivatePerson={() => open()}
        compactSummary={t('clienthub.lenses.count', { objects: desk.layout.items.length, mats: desk.layout.mats.length })}
        grouping={pick(model.grouping ?? { en: '' }, lang)}
      />
    </Card>
  );
}

/** D-16 Hub lenses (prompt 0030): the three points of view on a client hub side by side. */
export function LensesPage({ clientId }: { clientId: string }) {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const hub = clientHub(clientId);
  const hm = useHubMap(clientId);
  const [facesLang, setFacesLang] = useState<'es' | 'en'>(lang);
  const name = hub?.name ?? clientId.toUpperCase();

  useRegisterActions({
    'clienthub.openLens': ({ lens }) => {
      if (!HUB_LENS_IDS.includes(lens as HubLensId)) return `lens must be aluzina, between-gigs or standalone, not "${String(lens)}"`;
      const path = `/founder/clients/${clientId}/hub${lens === 'aluzina' ? '' : `?lens=${String(lens)}`}`;
      navigate(path);
      return `opened #${path}`;
    },
    'clienthub.setFacesLang': ({ lang: l }) => {
      if (l !== 'es' && l !== 'en') return `lang must be es or en, not "${String(l)}"`;
      setFacesLang(l);
      return `screens in ${l === 'es' ? 'Spanish' : 'English'}`;
    },
    'clienthub.reloadMap': () => hm.reload(),
  });

  const pill = hm.loading ? (
    <StatusPill status="loading" tone="neutral" label={t('clienthub.map.loading')} />
  ) : hm.source === 'live' ? (
    <StatusPill status="live" tone="success" label={t('clienthub.map.live', { date: formatDate(hm.asOf ?? '', lang) })} />
  ) : (
    <StatusPill status="snapshot" tone="warning" label={t('clienthub.map.snapshot', { date: formatDate(hm.asOf ?? '', lang) })} />
  );

  return (
    <div className="desk-page ch-page">
      <PageHeader code={LENSES_CODE} title={t('clienthub.lenses.title', { name })} subtitle={t('clienthub.lenses.subtitle')} breadcrumb={[{ label: t('core.portal.dev'), to: '/dev/components' }, { label: t('clienthub.nav.lenses') }]} />
      <div className="ch-strip" role="toolbar" aria-label={t('clienthub.toolbar')}>
        <div className="ch-strip__map">
          {pill}
          <Button size="sm" variant="ghost" icon="↻" onClick={() => void hm.reload().then((r) => toast(t('clienthub.map.reloaded', { result: r })))}>
            {t('clienthub.map.reload')}
          </Button>
        </div>
        <div className="ch-strip__faces" role="group" aria-label={t('clienthub.faces')}>
          <span className="ch-muted" aria-hidden="true">
            {t('clienthub.faces')}
          </span>
          {(['es', 'en'] as const).map((l) => (
            <Button key={l} size="sm" variant={facesLang === l ? 'primary' : 'secondary'} aria-pressed={facesLang === l} aria-label={t(`clienthub.faces.${l}`)} title={t(`clienthub.faces.${l}`)} onClick={() => setFacesLang(l)}>
              {l.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
      <div className="ch-lenses">
        {HUB_LENS_IDS.map((lens) => (
          <LensDesk key={lens} map={hm.map} lens={lens} facesLang={facesLang} clientId={clientId} />
        ))}
      </div>
    </div>
  );
}
