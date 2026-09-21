import { useNavigate } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { CLIENT_JOURNEY, FINAL_PRINCIPLE, GOVERNANCE_RULES, pick, SERVICE_LADDER_LOGIC, SERVICES } from '../../domain';
import { useT } from '../../i18n/I18nProvider';
import './manual.css';
import { focusSection, PrintButton, SectionHeading } from './parts';
import { overviewSpec } from './specs';

/** `manual.openSection` targets: a section of this page, or a section of another manual page (`?s=` scrolls it into view). */
const SECTION_PATHS: Record<string, string> = {
  overview: '/manual',
  commercial: '/manual/commercial',
  governance: '/manual/governance',
  rules: '/manual/governance?s=rules',
  statuses: '/manual/governance?s=statuses',
  validation: '/manual/governance?s=validation',
  purchases: '/manual/governance?s=purchases',
  roles: '/manual/governance?s=roles',
  assets: '/manual/governance?s=assets',
  kpis: '/manual/governance?s=kpis',
};

/** M-01: what the manual is, the client journey, the service ladder and the way into everything else. */
export function ManualOverviewPage() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const mandatory = GOVERNANCE_RULES.filter((r) => r.kind === 'mandatory').length;

  useRegisterActions({
    'manual.openService': ({ service }) => {
      const s = SERVICES.find((x) => x.code === String(service));
      if (!s) throw new Error(`no service ${String(service)}`);
      navigate(`/manual/services/${s.slug}`);
      return s.slug;
    },
    'manual.openSection': ({ section }) => {
      const key = String(section);
      const path = SECTION_PATHS[key];
      if (!path) throw new Error(`no section ${key}`);
      if (path === '/manual') {
        focusSection(`manual-${key}`);
        return key;
      }
      navigate(path);
      return path;
    },
  });

  return (
    <div className="manual-page">
      <PageHeader code={overviewSpec.code} title={t('manual.title')} subtitle={t('manual.subtitle')} actions={<PrintButton />} />

      <p className="manual-motto">{t('manual.motto')}</p>

      <section className="manual-section" aria-labelledby="manual-overview">
        <SectionHeading id="manual-overview">{t('manual.purpose.title')}</SectionHeading>
        <p className="manual-body">{t('manual.purpose.body')}</p>
        <p className="manual-muted">{t('manual.source')}</p>
      </section>

      <section className="manual-section" aria-labelledby="manual-journey">
        <SectionHeading id="manual-journey">{t('manual.journey.title')}</SectionHeading>
        <p className="manual-muted">{t('manual.journey.hint')}</p>
        <ol className="manual-stepper">
          {CLIENT_JOURNEY.map((step, i) => (
            <li className="manual-stepper__step" key={step.id}>
              <span className="manual-stepper__n" aria-hidden="true">
                {i + 1}
              </span>
              <span className="manual-stepper__label">
                <span className="visually-hidden">{t('manual.journey.step', { n: i + 1 })}: </span>
                {pick(step.label, lang)}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="manual-section" aria-labelledby="manual-ladder">
        <SectionHeading id="manual-ladder">{t('manual.ladder.title')}</SectionHeading>
        <p className="manual-body">{pick(SERVICE_LADDER_LOGIC, lang)}</p>
        <ul className="manual-ladder">
          {SERVICES.map((s) => (
            <li className="manual-ladder__row" key={s.code}>
              <Badge tone="accent">{t('manual.service', { code: s.code })}</Badge>
              <span className="manual-ladder__name">{pick(s.name, lang)}</span>
              <span className="manual-ladder__arrow" aria-hidden="true">
                →
              </span>
              <span className="manual-ladder__word">{pick(s.ladderWord, lang)}</span>
              <Button className="manual-noprint" variant="ghost" size="sm" href={`#/manual/services/${s.slug}`}>
                {t('manual.ladder.open', { name: pick(s.name, lang) })}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <div className="manual-cards">
        <Card title={t('manual.governance.summary')} subtitle={t('manual.governance.count', { n: GOVERNANCE_RULES.length })}>
          <p className="manual-body">{t('manual.governance.summaryBody', { n: GOVERNANCE_RULES.length, mandatory })}</p>
          <div className="manual-actions manual-noprint">
            <Button variant="secondary" href="#/manual/governance?s=rules">
              {t('manual.link.governance')}
            </Button>
          </div>
        </Card>

        <Card title={t('manual.quickLinks')}>
          <div className="manual-actions manual-noprint">
            <Button variant="secondary" href="#/manual/commercial">
              {t('manual.link.commercial')}
            </Button>
            <Button variant="secondary" href="#/manual/governance?s=statuses">
              {t('manual.link.statuses')}
            </Button>
            <Button variant="secondary" href="#/manual/governance?s=kpis">
              {t('manual.link.kpis')}
            </Button>
          </div>
        </Card>
      </div>

      <section className="manual-section" aria-labelledby="manual-principle">
        <SectionHeading id="manual-principle">{t('manual.principle.title')}</SectionHeading>
        <blockquote className="manual-quote">{pick(FINAL_PRINCIPLE, lang)}</blockquote>
      </section>
    </div>
  );
}
