import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Card } from '../../components/molecule/Card/Card';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import {
  COMMERCIAL_FIELDS,
  GOVERNANCE_RULES,
  LEAD_CHANNELS,
  LEAD_RECORD_FIELDS,
  pick,
  pipelineStatus,
  QUALIFICATION_QUESTIONS,
  routeService,
  SERVICES,
  type QualificationAnswers,
  type QualificationKey,
} from '../../domain';
import { useT } from '../../i18n/I18nProvider';
import './manual.css';
import { focusSection, PrintButton, SectionHeading } from './parts';
import { commercialSpec } from './specs';

/** The qualification keys the routing reads as closed answers, plus the on-site visit question. */
const CLOSED_KEYS: QualificationKey[] = ['typology', 'floorPlan', 'projectStatus', 'depth', 'execute'];
const ROUTE_KEYS = [...CLOSED_KEYS, 'visit'] as const;

/** M-02: how a lead enters, what we register, what we ask, and how the answers route to a service. */
export function ManualCommercialPage() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<QualificationAnswers>({});

  const newLead = pipelineStatus('lead-new');
  const commercialRule = GOVERNANCE_RULES.find((r) => r.kind === 'commercial');
  const answered = ROUTE_KEYS.some((k) => answers[k]);
  const route = useMemo(() => routeService(answers), [answers]);
  const routedService = SERVICES.find((s) => s.code === route.code);
  const thenService = route.then ? SERVICES.find((s) => s.code === route.then) : undefined;

  const set = (key: QualificationKey | 'visit', value: string) =>
    setAnswers((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });

  useRegisterActions({
    'manual.routeClient': (params) => {
      const next: QualificationAnswers = {};
      for (const key of ROUTE_KEYS) {
        const v = params[key];
        if (v !== undefined && v !== null && String(v) !== '') next[key] = String(v);
      }
      setAnswers(next);
      const r = routeService(next);
      return { code: r.code, then: r.then ?? null, reason: pick(r.reason, lang) };
    },
    // Declared but deliberately not wired (P-09): the lead is created on the founder / ops leads page A-08.
    'manual.createLead': () => {
      throw new Error('not wired yet: create the lead on the leads page (A-08)');
    },
    'manual.openService': ({ service }) => {
      const s = SERVICES.find((x) => x.code === String(service));
      if (!s) throw new Error(`no service ${String(service)}`);
      navigate(`/manual/services/${s.slug}`);
      return s.slug;
    },
    'manual.openSection': ({ section }) => {
      const key = String(section);
      if (key === 'overview') {
        navigate('/manual');
        return '/manual';
      }
      if (key === 'governance') {
        navigate('/manual/governance');
        return '/manual/governance';
      }
      if (!focusSection(`manual-${key}`)) throw new Error(`no section ${key}`);
      return key;
    },
  });

  return (
    <div className="manual-page">
      <PageHeader
        code={commercialSpec.code}
        title={t('manual.commercial.title')}
        subtitle={t('manual.commercial.subtitle')}
        breadcrumb={[{ label: t('manual.title'), to: '/manual' }, { label: t('manual.commercial.title') }]}
        actions={<PrintButton />}
      />

      <section className="manual-section" aria-labelledby="manual-channels">
        <SectionHeading id="manual-channels">{t('manual.commercial.channels')}</SectionHeading>
        <p className="manual-muted">{t('manual.commercial.channelsHint')}</p>
        <ul className="manual-chips">
          {LEAD_CHANNELS.map((c) => (
            <li key={c.id}>
              <Badge tone="neutral">{pick(c.label, lang)}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="manual-section" aria-labelledby="manual-record">
        <SectionHeading id="manual-record">{t('manual.commercial.record')}</SectionHeading>
        <KeyValue
          columns={3}
          items={LEAD_RECORD_FIELDS.map((f) => ({ key: pick(f.label, lang), value: <code className="manual-code">leads.{f.key}</code> }))}
        />
        <h3 className="manual-h3">{t('manual.commercial.commercialData')}</h3>
        <KeyValue
          columns={3}
          items={COMMERCIAL_FIELDS.map((f) => ({ key: pick(f.label, lang), value: <code className="manual-code">leads.{f.key}</code> }))}
        />
        <p className="manual-body">
          {t('manual.commercial.firstStatus')} {newLead && <StatusPill status={newLead.id} />}{' '}
          {newLead && <span className="manual-muted">({newLead.playbook})</span>}
        </p>
      </section>

      <section className="manual-section" aria-labelledby="manual-questions">
        <SectionHeading id="manual-questions">{t('manual.commercial.questions')}</SectionHeading>
        <p className="manual-muted">{t('manual.commercial.questionsHint')}</p>
        <ol className="manual-questions">
          {QUALIFICATION_QUESTIONS.map((q) => (
            <li key={q.key} className="manual-questions__item">
              <span className="manual-questions__text">{pick(q.question, lang)}</span>
              {q.options && (
                <span className="manual-questions__options">
                  {q.options.map((o) => (
                    <Badge key={o.value} tone="neutral">
                      {pick(o.label, lang)}
                    </Badge>
                  ))}
                </span>
              )}
              <code className="manual-code">qualification.{q.key}</code>
            </li>
          ))}
        </ol>
      </section>

      <section className="manual-section" aria-labelledby="manual-routing">
        <SectionHeading id="manual-routing">{t('manual.commercial.routing')}</SectionHeading>
        {commercialRule && (
          <Card raised title={`${t('manual.commercial.rule')} · ${commercialRule.id}`} subtitle={t('manual.governance.playbookPage', { n: commercialRule.page })}>
            <p className="manual-body manual-rule">{pick(commercialRule.rule, lang)}</p>
          </Card>
        )}
        <ul className="manual-routes">
          {SERVICES.map((s) => (
            <li className="manual-routes__row" key={s.code}>
              <Badge tone="accent">{t('manual.service', { code: s.code })}</Badge>
              <span className="manual-routes__name">{pick(s.name, lang)}</span>
              <span className="manual-routes__q">{pick(s.centralQuestion ?? s.promise ?? s.outcome, lang)}</span>
              <Button className="manual-noprint" variant="ghost" size="sm" href={`#/manual/services/${s.slug}`}>
                {t('manual.commercial.openService', { code: s.code })}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="manual-section manual-noprint" aria-labelledby="manual-widget">
        <SectionHeading id="manual-widget">{t('manual.commercial.widget')}</SectionHeading>
        <p className="manual-muted">{t('manual.commercial.widgetHint')}</p>
        <div className="manual-widget">
          <div className="manual-widget__form">
            {CLOSED_KEYS.map((key) => {
              const q = QUALIFICATION_QUESTIONS.find((x) => x.key === key);
              if (!q?.options) return null;
              return (
                <Select
                  key={key}
                  label={pick(q.question, lang)}
                  placeholder={t('manual.commercial.unanswered')}
                  value={answers[key] ?? ''}
                  onChange={(e) => set(key, e.target.value)}
                  options={q.options.map((o) => ({ value: o.value, label: pick(o.label, lang) }))}
                />
              );
            })}
            <Select
              label={t('manual.commercial.visit')}
              placeholder={t('manual.commercial.unanswered')}
              value={answers.visit ?? ''}
              onChange={(e) => set('visit', e.target.value)}
              options={[
                { value: 'yes', label: t('manual.commercial.yes') },
                { value: 'no', label: t('manual.commercial.no') },
              ]}
            />
          </div>
          <Card
            className="manual-widget__result"
            title={t('manual.commercial.suggestion')}
            subtitle={routedService ? pick(routedService.name, lang) : undefined}
          >
            <p className="manual-widget__code">
              <Badge tone="accent">{t('manual.service', { code: route.code })}</Badge>
              {thenService && (
                <>
                  <span className="manual-muted">{t('manual.commercial.then')}</span>
                  <Badge tone="info">{t('manual.service', { code: thenService.code })}</Badge>
                </>
              )}
            </p>
            <p className="manual-body">
              <strong>{t('manual.commercial.reason')}: </strong>
              {pick(route.reason, lang)}
            </p>
            <div className="manual-actions">
              <Button variant="ghost" onClick={() => setAnswers({})} disabled={!answered}>
                {t('manual.commercial.reset')}
              </Button>
              <Placeholder what={t('manual.commercial.createLeadWhat')}>
                <Button variant="primary">{t('manual.commercial.createLead')}</Button>
              </Placeholder>
              {routedService && (
                <Button variant="secondary" href={`#/manual/services/${routedService.slug}`}>
                  {t('manual.commercial.openService', { code: routedService.code })}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
