import { useNavigate } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { CLIENT_JOURNEY, FINAL_PRINCIPLE, GOVERNANCE_RULES, ROLE_RESPONSIBILITIES, pick, serviceByCode } from '../../domain';
import { useT } from '../../i18n/I18nProvider';
import { PublicLayout, WEBSITE_URL } from './PublicLayout';
import { startHref, startPath } from './startHref';

const rule = (id: string) => GOVERNANCE_RULES.find((r) => r.id === id);

/**
 * P-04 `/method`: the studio's operating logic for a visitor. The governance rules are quoted as promises
 * to the client, without their ids or the entities that enforce them; roles are published generically and
 * only the founder is named (she is the studio's public face).
 */
export function MethodPage() {
  const { t, lang } = useT();
  const navigate = useNavigate();

  useRegisterActions({
    'public.startProject': ({ service }) => {
      navigate(startPath(service === undefined || service === null ? null : String(service)));
      return 'start';
    },
  });

  const observe = rule('G-11');
  const gate = rule('G-13');
  const comprehensive = serviceByCode('03');

  return (
    <PublicLayout>
      <PageHeader code="P-04" title={t('public.method.title')} subtitle={t('public.method.subtitle')} />

      <section className="pub-section" aria-labelledby="pub-method-journey">
        <h2 id="pub-method-journey" className="pub-section__title">
          {t('public.method.journey.title')}
        </h2>
        <p className="pub-section__desc">{t('public.method.journey.desc')}</p>
        <ol className="pub-steps">
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

      {observe && (
        <section className="pub-section" aria-labelledby="pub-method-principle">
          <h2 id="pub-method-principle" className="pub-section__title">
            {t('public.method.principle.title')}
          </h2>
          <p className="pub-quote">{pick(observe.rule, lang)}</p>
        </section>
      )}

      {comprehensive?.promise && (
        <section className="pub-section" aria-labelledby="pub-method-promise">
          <h2 id="pub-method-promise" className="pub-section__title">
            {t('public.method.promise.title')}
          </h2>
          <p className="pub-quote">{pick(comprehensive.promise, lang)}</p>
          <div className="pub-ctas">
            <Button variant="secondary" href={`#/services/${comprehensive.slug}`}>
              {pick(comprehensive.name, lang)}
            </Button>
          </div>
        </section>
      )}

      {gate && (
        <section className="pub-section" aria-labelledby="pub-method-gate">
          <h2 id="pub-method-gate" className="pub-section__title">
            {t('public.method.gate.title')}
          </h2>
          <p className="pub-quote">{pick(gate.rule, lang)}</p>
        </section>
      )}

      <section className="pub-section" aria-labelledby="pub-method-team">
        <h2 id="pub-method-team" className="pub-section__title">
          {t('public.method.team.title')}
        </h2>
        <p className="pub-section__desc">{t('public.method.team.desc')}</p>
        <ul className="pub-steps">
          {ROLE_RESPONSIBILITIES.map((role) => (
            <li key={role.id} className="pub-steps__item">
              <span className="pub-steps__n" aria-hidden="true">
                ◦
              </span>
              <span>{pick(role.playbookRole, lang)}</span>
            </li>
          ))}
        </ul>
        <p className="pub-prose">{t('public.method.team.founder')}</p>
      </section>

      <section className="pub-section" aria-labelledby="pub-method-final">
        <h2 id="pub-method-final" className="pub-section__title">
          {t('public.method.final.title')}
        </h2>
        <p className="pub-prose">{pick(FINAL_PRINCIPLE, lang)}</p>
      </section>

      <Card title={t('public.method.portfolio.title')}>
        <p className="pub-prose">{t('public.method.portfolio.body')}</p>
        <div className="pub-ctas">
          <Button variant="secondary" href={WEBSITE_URL} external>
            {t('public.method.portfolio.cta')}
          </Button>
        </div>
      </Card>

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
