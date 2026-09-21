import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SERVICES, phaseItems, pick, type Service, type ServicePhase } from '../../domain';
import { useT } from '../../i18n/I18nProvider';
import { PublicLayout } from './PublicLayout';
import { startHref, startPath } from './startHref';

/**
 * P-02 `/services/:slug`: one service in full. Phase titles are always visible; the checklist items behind
 * each phase are the studio's working method, so they sit behind a disclosure button rather than a wall of
 * text. Internal vocabulary (service codes, phase ids, pipeline statuses) never reaches the page.
 */
export function ServiceDetailPage() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const { slug } = useParams();
  const index = SERVICES.findIndex((s) => s.slug === slug);
  const service: Service | undefined = index === -1 ? undefined : SERVICES[index];
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useRegisterActions({
    'public.openService': ({ service: target }) => {
      const next = SERVICES.find((s) => s.slug === String(target ?? '')) ?? SERVICES.find((s) => s.code === String(target ?? ''));
      if (!next) throw new Error(`unknown service "${String(target)}"`);
      navigate(`/services/${next.slug}`);
      return pick(next.name, lang);
    },
    'public.startProject': ({ service: target }) => {
      navigate(startPath(target === undefined || target === null ? (service?.code ?? null) : String(target)));
      return 'start';
    },
  });

  if (!service) {
    return (
      <PublicLayout>
        <EmptyState title={t('public.detail.notFound.title')} description={t('public.detail.notFound.desc')}>
          <Button variant="primary" href="#/services">
            {t('public.detail.notFound.cta')}
          </Button>
        </EmptyState>
      </PublicLayout>
    );
  }

  const prev = index > 0 ? SERVICES[index - 1] : undefined;
  const next = index < SERVICES.length - 1 ? SERVICES[index + 1] : undefined;

  const phaseCard = (phase: ServicePhase, i: number) => {
    const items = phaseItems(phase);
    const title = pick(phase.title, lang);
    const isOpen = open[phase.id] === true;
    const panelId = `pub-phase-${phase.id}`;
    return (
      <li key={phase.id} className="pub-phase">
        <div className="pub-phase__head">
          <div className="pub-phase__heading">
            <span className="pub-phase__n">{t('public.detail.step', { n: i + 1 })}</span>
            <h3 className="pub-phase__title">{title}</h3>
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              aria-expanded={isOpen}
              aria-controls={panelId}
              aria-label={t(isOpen ? 'public.detail.stepHide' : 'public.detail.stepShow', { title })}
              iconEnd={isOpen ? '▴' : '▾'}
              onClick={() => setOpen((o) => ({ ...o, [phase.id]: !isOpen }))}
            >
              {t(isOpen ? 'public.detail.stepClose' : 'public.detail.stepOpen')}
            </Button>
          )}
        </div>
        {items.length > 0 && (
          <div id={panelId} hidden={!isOpen}>
            <ul className="pub-list">
              {items.map((item, j) => (
                <li key={`${phase.id}-${j}`}>{pick(item, lang)}</li>
              ))}
            </ul>
          </div>
        )}
        {phase.notes?.map((note, j) => (
          <p key={`note-${j}`} className="pub-phase__notes">
            {pick(note, lang)}
          </p>
        ))}
      </li>
    );
  };

  return (
    <PublicLayout>
      <PageHeader
        code="P-02"
        title={pick(service.name, lang)}
        subtitle={pick(service.outcome, lang)}
        breadcrumb={[
          { label: t('public.detail.crumbServices'), to: '/services' },
          { label: pick(service.name, lang) },
        ]}
        actions={<Badge tone="accent">{pick(service.ladderWord, lang)}</Badge>}
      />

      <Card raised>
        <div className="pub-def">
          <span className="pub-def__key">{t('public.detail.idealFor')}</span>
          <p className="pub-def__value">{pick(service.idealFor, lang)}</p>
        </div>
        {service.centralQuestion && (
          <div className="pub-def">
            <span className="pub-def__key">{t('public.detail.question')}</span>
            <p className="pub-def__value">{pick(service.centralQuestion, lang)}</p>
          </div>
        )}
        {service.promise && (
          <div className="pub-def">
            <span className="pub-def__key">{t('public.detail.promise')}</span>
            <p className="pub-def__value">{pick(service.promise, lang)}</p>
          </div>
        )}
      </Card>

      <section className="pub-section" aria-labelledby="pub-get">
        <h2 id="pub-get" className="pub-section__title">
          {t('public.detail.get.title')}
        </h2>
        <p className="pub-section__desc">{t('public.detail.get.desc')}</p>
        <ul className="pub-list">
          {service.deliveryContents.map((item, i) => (
            <li key={`get-${i}`}>{pick(item, lang)}</li>
          ))}
        </ul>
      </section>

      <section className="pub-section" aria-labelledby="pub-how">
        <h2 id="pub-how" className="pub-section__title">
          {t('public.detail.how.title')}
        </h2>
        <p className="pub-section__desc">{t('public.detail.how.desc')}</p>
        <ol className="pub-phases">{service.phases.map(phaseCard)}</ol>
      </section>

      {service.notIncluded && service.notIncluded.length > 0 && (
        <section className="pub-section" aria-labelledby="pub-not">
          <h2 id="pub-not" className="pub-section__title">
            {t('public.detail.notIncluded.title')}
          </h2>
          <p className="pub-section__desc">{t('public.detail.notIncluded.desc')}</p>
          <ul className="pub-list">
            {service.notIncluded.map((item, i) => (
              <li key={`not-${i}`}>{pick(item, lang)}</li>
            ))}
          </ul>
        </section>
      )}

      {service.nextStep && (
        <section className="pub-section" aria-labelledby="pub-next-step">
          <h2 id="pub-next-step" className="pub-section__title">
            {t('public.detail.next.title')}
          </h2>
          <p className="pub-quote">{pick(service.nextStep, lang)}</p>
        </section>
      )}

      <Card title={t('public.services.cta.title')} raised>
        <p className="pub-prose">{t('public.services.cta.body')}</p>
        <div className="pub-ctas">
          <Button variant="primary" size="lg" href={startHref(service.code)}>
            {t('public.detail.cta')}
          </Button>
        </div>
      </Card>

      <nav className="pub-pager" aria-label={t('public.detail.moreLabel')}>
        {prev ? (
          <Button variant="ghost" icon="←" href={`#/services/${prev.slug}`}>
            {`${t('public.detail.prev')}: ${pick(prev.name, lang)}`}
          </Button>
        ) : (
          <span />
        )}
        {next && (
          <Button variant="ghost" iconEnd="→" href={`#/services/${next.slug}`}>
            {`${t('public.detail.next')}: ${pick(next.name, lang)}`}
          </Button>
        )}
      </nav>
    </PublicLayout>
  );
}
