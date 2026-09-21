import { useNavigate } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { CLIENT_JOURNEY, SERVICES, SERVICE_LADDER_LOGIC, pick, type Service } from '../../domain';
import { useT } from '../../i18n/I18nProvider';
import { PublicLayout } from './PublicLayout';
import { startHref, startPath } from './startHref';

/** P-01 `/services`: the studio, the five services as a ladder, how a project unfolds, and the way into the intake. */
export function ServicesPage() {
  const { t, lang } = useT();
  const navigate = useNavigate();

  const openService = (slug: string): string => {
    const service = SERVICES.find((s) => s.slug === slug);
    if (!service) throw new Error(`unknown service "${slug}"`);
    navigate(`/services/${service.slug}`);
    return pick(service.name, lang);
  };

  useRegisterActions({
    'public.openService': ({ service }) => openService(String(service ?? '')),
    'public.startProject': ({ service }) => {
      navigate(startPath(service === undefined || service === null ? null : String(service)));
      return 'start';
    },
  });

  const serviceCard = (service: Service) => {
    const question = service.centralQuestion ?? service.promise;
    return (
      <li key={service.code}>
        <Card
          title={pick(service.name, lang)}
          subtitle={pick(service.outcome, lang)}
          actions={<Badge tone="accent">{pick(service.ladderWord, lang)}</Badge>}
          footer={
            <Button variant="secondary" href={`#/services/${service.slug}`}>
              {t('public.services.card.open')}
            </Button>
          }
        >
          <div className="pub-def">
            <span className="pub-def__key">{t('public.services.card.idealFor')}</span>
            <p className="pub-def__value">{pick(service.idealFor, lang)}</p>
          </div>
          {question && (
            <div className="pub-def">
              <span className="pub-def__key">{service.centralQuestion ? t('public.services.card.question') : t('public.services.card.promise')}</span>
              <p className="pub-def__value">{pick(question, lang)}</p>
            </div>
          )}
        </Card>
      </li>
    );
  };

  return (
    <PublicLayout>
      <section className="pub-hero">
        <p className="pub-eyebrow">{t('public.tagline')}</p>
        <h1 className="pub-hero__title">{t('public.services.title')}</h1>
        <p className="pub-hero__lead">{t('public.services.lead')}</p>
        <p className="pub-eyebrow">{t('public.services.founder')}</p>
        <div className="pub-ctas">
          <Button variant="primary" size="lg" href={startHref(null)}>
            {t('public.cta.start')}
          </Button>
          <Button variant="secondary" size="lg" href="#/method">
            {t('public.services.cta.method')}
          </Button>
        </div>
      </section>

      <section className="pub-section" aria-labelledby="pub-ladder">
        <h2 id="pub-ladder" className="pub-section__title">
          {t('public.services.ladder.title')}
        </h2>
        <p className="pub-section__desc">{t('public.services.ladder.desc')}</p>
        <ul className="pub-grid" aria-label={t('public.services.ladder.listLabel')}>
          {SERVICES.map(serviceCard)}
        </ul>
      </section>

      <section className="pub-section" aria-labelledby="pub-journey">
        <h2 id="pub-journey" className="pub-section__title">
          {t('public.services.journey.title')}
        </h2>
        <p className="pub-section__desc">{t('public.services.journey.desc')}</p>
        <ol className="pub-steps" aria-label={t('public.services.journey.listLabel')}>
          {CLIENT_JOURNEY.map((step, i) => (
            <li key={step.id} className="pub-steps__item">
              <span className="pub-steps__n" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{pick(step.label, lang)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="pub-section" aria-labelledby="pub-logic">
        <h2 id="pub-logic" className="pub-section__title">
          {t('public.services.logic.title')}
        </h2>
        <p className="pub-prose">{pick(SERVICE_LADDER_LOGIC, lang)}</p>
      </section>

      <Card title={t('public.services.cta.title')} raised>
        <p className="pub-prose">{t('public.services.cta.body')}</p>
        <div className="pub-ctas">
          <Button variant="primary" size="lg" href={startHref(null)}>
            {t('public.cta.start')}
          </Button>
        </div>
      </Card>
    </PublicLayout>
  );
}
