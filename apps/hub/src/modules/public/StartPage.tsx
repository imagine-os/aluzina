import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Input } from '../../components/atom/Input/Input';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select, type SelectOption } from '../../components/atom/Select/Select';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Card } from '../../components/molecule/Card/Card';
import { KeyValue, type KeyValueItem } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { useData } from '../../data/DataContext';
import type { LeadProjectStatus, LeadProjectType } from '../../data/schema/services';
import {
  LEAD_CHANNELS,
  QUALIFICATION_QUESTIONS,
  SERVICES,
  pick,
  routeService,
  serviceByCode,
  type LeadChannelId,
  type QualificationKey,
  type Text,
} from '../../domain';
import { useT } from '../../i18n/I18nProvider';
import { PublicLayout } from './PublicLayout';
import { startPath, toServiceCode } from './startHref';

/** A reload, a language switch or a wrong Back must never cost the visitor their answers (P-03). */
const STORE_KEY = 'aluzina.public.intake';
const STEP_COUNT = 4;

/** Form fields; the ten playbook keys keep their `QualificationKey` names so the answer map builds itself. */
type FieldKey =
  | 'name'
  | 'phone'
  | 'email'
  | 'city'
  | QualificationKey
  | 'channel'
  | 'requestedService'
  | 'consent';

type Values = Partial<Record<FieldKey, string>>;

interface Stored {
  step: number;
  values: Values;
}

/** Answers collected in step 2 (the space) and step 3 (what you need); both feed `routeService()`. */
const SPACE_KEYS: QualificationKey[] = ['typology', 'areaM2', 'projectStatus', 'floorPlan'];
const NEED_KEYS: QualificationKey[] = ['transform', 'why', 'depth', 'execute', 'investment', 'start'];
const QUAL_KEYS: QualificationKey[] = [...SPACE_KEYS, ...NEED_KEYS];

function load(): Stored {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Stored;
      const step = Number.isInteger(parsed.step) ? Math.min(Math.max(parsed.step, 1), STEP_COUNT) : 1;
      return { step, values: parsed.values ?? {} };
    }
  } catch {
    /* storage unavailable or corrupt: start clean */
  }
  return { step: 1, values: {} };
}

function question(key: QualificationKey) {
  return QUALIFICATION_QUESTIONS.find((q) => q.key === key);
}

/**
 * COP whole pesos when the free-text investment answer carries exactly one amount ("120.000.000",
 * "$120,000,000 COP"). A range ("between 120 and 150 million") or a vague answer stays `null` and the
 * sentence keeps living in `qualification.investment`: an unknown fact is never guessed.
 */
function parseBudget(raw: string | undefined): number | null {
  const groups = (raw ?? '').match(/\d[\d.,\s]*\d|\d/g) ?? [];
  const amounts = groups.map((g) => g.replace(/[^\d]/g, '')).filter((d) => d.length >= 6);
  if (amounts.length !== 1) return null;
  const n = Number(amounts[0]);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

function parseArea(raw: string | undefined): number | null {
  const n = Number((raw ?? '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** `leads.desiredStart` is a date column; the playbook question is free text, so only an ISO date lands there. */
function parseIsoDate(raw: string | undefined): string | null {
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw.trim()) ? raw.trim() : null;
}

/**
 * P-03 `/start`: the public intake. Four steps, answers kept in sessionStorage, the studio's suggested path
 * shown before sending, and one `leads` row created on submit (status lead-new, source public-intake). The
 * deposit step is a Placeholder until Stripe (D-035).
 */
export function StartPage() {
  const { t, lang } = useT();
  const data = useData();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const paramService = toServiceCode(params.get('service'));

  const [state, setState] = useState<Stored>(load);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [sentSuggestion, setSentSuggestion] = useState<string | null>(null);
  const fieldsRef = useRef<HTMLDivElement>(null);

  const { step, values } = state;
  const setValue = (key: FieldKey, value: string) =>
    setState((s) => ({ ...s, values: { ...s.values, [key]: value } }));

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable: the form still works, it just does not survive a reload */
    }
  }, [state]);

  useEffect(() => {
    if (paramService) setState((s) => (s.values.requestedService ? s : { ...s, values: { ...s.values, requestedService: paramService } }));
  }, [paramService]);

  const label = (text: Text) => pick(text, lang);
  const optionsOf = (key: QualificationKey): SelectOption[] =>
    (question(key)?.options ?? []).map((o) => ({ value: o.value, label: label(o.label) }));

  /** The playbook answer map: what `routeService()` reads and what lands in `leads.qualification`. */
  const qualification = useMemo(() => {
    const out: Partial<Record<QualificationKey, string>> = {};
    for (const key of QUAL_KEYS) {
      const v = values[key];
      if (v && v.trim()) out[key] = v.trim();
    }
    return out;
  }, [values]);

  const suggestion = useMemo(() => routeService(qualification), [qualification]);

  const validate = (target: number): Partial<Record<FieldKey, string>> => {
    const next: Partial<Record<FieldKey, string>> = {};
    const required = (key: FieldKey) => {
      if (!values[key]?.trim()) next[key] = t('public.start.err.required');
    };
    if (target === 1) {
      required('name');
      if (!values.email?.trim()) next.email = t('public.start.err.required');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = t('public.start.err.email');
      required('city');
    }
    if (target === 2) {
      required('typology');
      if (values.areaM2?.trim() && parseArea(values.areaM2) === null) next.areaM2 = t('public.start.err.number');
    }
    if (target === 3) {
      required('transform');
      required('depth');
      required('channel');
    }
    if (target === 4 && values.consent !== 'yes') next.consent = t('public.start.err.consent');
    return next;
  };

  const focusFirstError = () => {
    window.requestAnimationFrame(() => {
      const el = fieldsRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]');
      el?.focus();
    });
  };

  const goTo = (target: number) => {
    setErrors({});
    setShowSummary(false);
    setState((s) => ({ ...s, step: Math.min(Math.max(target, 1), STEP_COUNT) }));
    return target;
  };

  const goNext = (): string => {
    const found = validate(step);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setShowSummary(true);
      focusFirstError();
      throw new Error(t('public.start.errorSummary'));
    }
    const target = Math.min(step + 1, STEP_COUNT);
    goTo(target);
    return t('public.start.progress', { n: target, total: STEP_COUNT });
  };

  const goPrev = (): string => {
    const target = Math.max(step - 1, 1);
    goTo(target);
    return t('public.start.progress', { n: target, total: STEP_COUNT });
  };

  const submit = async (): Promise<string> => {
    const found = validate(4);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setShowSummary(true);
      focusFirstError();
      throw new Error(t('public.start.errorSummary'));
    }
    setSending(true);
    setSendError(false);
    try {
      const row = await data.create('leads', {
        name: (values.name ?? '').trim(),
        phone: values.phone?.trim() ? values.phone.trim() : null,
        email: (values.email ?? '').trim(),
        city: (values.city ?? '').trim(),
        projectType: ((values.typology as LeadProjectType | undefined) ?? 'other') as LeadProjectType,
        areaM2: parseArea(values.areaM2),
        projectStatus: (values.projectStatus as LeadProjectStatus | undefined) ?? null,
        requestedService: toServiceCode(values.requestedService ?? null),
        suggestedService: suggestion.code,
        budgetCop: parseBudget(values.investment),
        desiredStart: parseIsoDate(values.start),
        channel: (values.channel as LeadChannelId | undefined) ?? 'website',
        ownerId: null,
        status: 'lead-new',
        qualification,
        notes: '',
        projectId: null,
        source: 'public-intake',
      });
      setReference(row.id);
      setSentSuggestion(suggestion.code);
      try {
        sessionStorage.removeItem(STORE_KEY);
      } catch {
        /* nothing to clear */
      }
      return row.id;
    } catch {
      setSendError(true);
      throw new Error(t('public.start.err.submit'));
    } finally {
      setSending(false);
    }
  };

  const done = reference !== null;
  const doneService = serviceByCode(sentSuggestion);
  const depositPath = sentSuggestion === '01' || sentSuggestion === '02' || sentSuggestion === '04';

  useRegisterActions({
    'public.nextStep': !done && step < STEP_COUNT ? () => goNext() : false,
    'public.prevStep': !done && step > 1 ? () => goPrev() : false,
    'public.submitIntake': !done && step === STEP_COUNT ? () => submit() : false,
    'public.reserveDeposit': done && depositPath ? () => 'not wired yet: online deposits arrive with the payments integration (D-035)' : false,
    'public.startProject': ({ service }) => {
      const code = toServiceCode(service === undefined || service === null ? null : String(service));
      if (code) setValue('requestedService', code);
      navigate(startPath(code));
      return code ?? 'start';
    },
  });

  const stepTitles = [t('public.start.step1'), t('public.start.step2'), t('public.start.step3'), t('public.start.step4')];

  const reviewItems: KeyValueItem[] = [
    { key: t('public.start.field.name'), value: values.name || t('public.start.review.empty') },
    { key: t('public.start.field.email'), value: values.email || t('public.start.review.empty') },
    { key: t('public.start.field.phone'), value: values.phone || t('public.start.review.empty') },
    { key: t('public.start.field.city'), value: values.city || t('public.start.review.empty') },
    {
      key: t('public.start.field.projectType'),
      value: optionsOf('typology').find((o) => o.value === values.typology)?.label ?? t('public.start.review.empty'),
    },
    { key: t('public.start.field.areaM2'), value: values.areaM2 || t('public.start.review.empty') },
    {
      key: t('public.start.field.projectStatus'),
      value: optionsOf('projectStatus').find((o) => o.value === values.projectStatus)?.label ?? t('public.start.review.empty'),
    },
    {
      key: t('public.start.field.floorPlan'),
      value: optionsOf('floorPlan').find((o) => o.value === values.floorPlan)?.label ?? t('public.start.review.empty'),
    },
    ...NEED_KEYS.map((key) => ({
      key: t(`public.start.q.${key}`),
      value: optionsOf(key).find((o) => o.value === values[key])?.label ?? values[key] ?? t('public.start.review.empty'),
    })),
    {
      key: t('public.start.field.channel'),
      value: LEAD_CHANNELS.find((c) => c.id === values.channel) ? label(LEAD_CHANNELS.find((c) => c.id === values.channel)!.label) : t('public.start.review.empty'),
    },
    {
      key: t('public.start.field.requestedService'),
      value: serviceByCode(values.requestedService) ? label(serviceByCode(values.requestedService)!.name) : t('public.start.undecided'),
    },
  ];

  const suggested = serviceByCode(suggestion.code);
  const thenService = suggestion.then ? serviceByCode(suggestion.then) : undefined;

  if (done) {
    return (
      <PublicLayout>
        <PageHeader code="P-03" title={t('public.start.done.title')} />
        <Card raised title={t('public.start.done.reference')}>
          <p className="pub-ref">{reference}</p>
          <p className="pub-prose">{t('public.start.done.referenceHint')}</p>
        </Card>
        <section className="pub-section" aria-labelledby="pub-done-next">
          <h2 id="pub-done-next" className="pub-section__title">
            {t('public.start.done.next.title')}
          </h2>
          <ol className="pub-list">
            <li>{t('public.start.done.next1')}</li>
            <li>{t('public.start.done.next2')}</li>
            <li>{t('public.start.done.next3')}</li>
          </ol>
          {doneService && (
            <p className="pub-prose">
              <Badge tone="accent">{label(doneService.ladderWord)}</Badge> {label(doneService.name)} — {label(doneService.outcome)}
            </p>
          )}
          <p className="pub-prose">{t('public.start.review.confirm')}</p>
        </section>
        {depositPath ? (
          <Card title={t('public.start.done.reserve.title')}>
            <p className="pub-prose">{t('public.start.done.reserve.body')}</p>
            <div className="pub-ctas">
              <Placeholder what={t('public.start.done.reserve.what')}>
                <Button variant="primary" size="lg">
                  {t('public.start.done.reserve.cta')}
                </Button>
              </Placeholder>
            </div>
          </Card>
        ) : (
          <Card title={t('public.start.done.proposal.title')}>
            <p className="pub-prose">{t('public.start.done.proposal.body')}</p>
          </Card>
        )}
        <div className="pub-ctas">
          <Button variant="secondary" href="#/services">
            {t('public.start.done.services')}
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <PageHeader code="P-03" title={t('public.start.title')} subtitle={t('public.start.subtitle')} />

      <div className="pub-stepper">
        <ol className="pub-stepper__list" aria-label={t('public.start.stepsLabel')}>
          {stepTitles.map((title, i) => {
            const n = i + 1;
            if (n === step) {
              return (
                <li key={title} className="pub-stepper__current" aria-current="step">
                  <span aria-hidden="true">{n}</span>
                  <span>{title}</span>
                </li>
              );
            }
            if (n < step) {
              return (
                <li key={title}>
                  <Button variant="ghost" onClick={() => goTo(n)} aria-label={t('public.start.goToStep', { n, title })}>
                    {`${n}. ${title}`}
                  </Button>
                </li>
              );
            }
            return (
              <li key={title} className="pub-stepper__todo">
                <span aria-hidden="true">{n}</span>
                <span>{title}</span>
              </li>
            );
          })}
        </ol>
        <p className="pub-progress">{t('public.start.progress', { n: step, total: STEP_COUNT })}</p>
      </div>

      <form
        className="pub-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step < STEP_COUNT) {
            try {
              goNext();
            } catch {
              /* the invalid fields carry the message */
            }
          } else {
            void submit().catch(() => {
              /* sendError / errors carry the message */
            });
          }
        }}
      >
        {showSummary && Object.keys(errors).length > 0 && (
          <p className="pub-form__error" role="alert">
            {t('public.start.errorSummary')}
          </p>
        )}
        {sendError && (
          <p className="pub-form__error" role="alert">
            {t('public.start.err.submit')}
          </p>
        )}

        <div ref={fieldsRef} className="pub-form__fields">
          {step === 1 && (
            <>
              <Input label={t('public.start.field.name')} required value={values.name ?? ''} error={errors.name} autoComplete="name" onChange={(e) => setValue('name', e.target.value)} />
              <Input label={t('public.start.field.email')} required type="email" value={values.email ?? ''} error={errors.email} autoComplete="email" onChange={(e) => setValue('email', e.target.value)} />
              <Input label={t('public.start.field.phone')} type="tel" value={values.phone ?? ''} hint={t('public.start.optional')} autoComplete="tel" onChange={(e) => setValue('phone', e.target.value)} />
              <Input label={t('public.start.field.city')} required value={values.city ?? ''} error={errors.city} hint={t('public.start.field.cityHint')} autoComplete="address-level2" onChange={(e) => setValue('city', e.target.value)} />
            </>
          )}

          {step === 2 && (
            <>
              <Select
                label={t('public.start.field.projectType')}
                required
                placeholder={t('public.start.choose')}
                options={optionsOf('typology')}
                value={values.typology ?? ''}
                error={errors.typology}
                onChange={(e) => setValue('typology', e.target.value)}
              />
              <Input
                label={t('public.start.field.areaM2')}
                inputMode="decimal"
                value={values.areaM2 ?? ''}
                error={errors.areaM2}
                hint={t('public.start.field.areaHint')}
                onChange={(e) => setValue('areaM2', e.target.value)}
              />
              <Select
                label={t('public.start.field.projectStatus')}
                placeholder={t('public.start.choose')}
                options={optionsOf('projectStatus')}
                value={values.projectStatus ?? ''}
                onChange={(e) => setValue('projectStatus', e.target.value)}
              />
              <Select
                label={t('public.start.field.floorPlan')}
                placeholder={t('public.start.choose')}
                options={optionsOf('floorPlan')}
                value={values.floorPlan ?? ''}
                onChange={(e) => setValue('floorPlan', e.target.value)}
              />
            </>
          )}

          {step === 3 && (
            <>
              {NEED_KEYS.map((key) => {
                const opts = optionsOf(key);
                const hintKey = `public.start.q.${key}Hint`;
                const hint = key === 'transform' || key === 'investment' ? t(hintKey) : undefined;
                return opts.length > 0 ? (
                  <Select
                    key={key}
                    label={t(`public.start.q.${key}`)}
                    required={key === 'depth'}
                    placeholder={t('public.start.choose')}
                    options={opts}
                    value={values[key] ?? ''}
                    error={errors[key]}
                    onChange={(e) => setValue(key, e.target.value)}
                  />
                ) : (
                  <Textarea
                    key={key}
                    label={t(`public.start.q.${key}`)}
                    required={key === 'transform'}
                    hint={hint}
                    value={values[key] ?? ''}
                    error={errors[key]}
                    onChange={(e) => setValue(key, e.target.value)}
                  />
                );
              })}
              <Select
                label={t('public.start.field.channel')}
                required
                placeholder={t('public.start.choose')}
                options={LEAD_CHANNELS.map((c) => ({ value: c.id, label: label(c.label) }))}
                value={values.channel ?? ''}
                error={errors.channel}
                onChange={(e) => setValue('channel', e.target.value)}
              />
              <Select
                label={t('public.start.field.requestedService')}
                placeholder={t('public.start.undecided')}
                hint={t('public.start.field.requestedServiceHint')}
                options={SERVICES.map((s) => ({ value: s.code, label: label(s.name) }))}
                value={values.requestedService ?? ''}
                onChange={(e) => setValue('requestedService', e.target.value)}
              />
            </>
          )}

          {step === 4 && (
            <>
              <Card title={t('public.start.review.title')}>
                <KeyValue items={reviewItems} />
              </Card>
              <Card raised title={t('public.start.review.suggestion')} actions={suggested ? <Badge tone="accent">{label(suggested.ladderWord)}</Badge> : undefined}>
                {suggested && (
                  <p className="pub-prose">
                    <strong>{label(suggested.name)}</strong> — {label(suggested.outcome)}
                  </p>
                )}
                <p className="pub-prose">{label(suggestion.reason)}</p>
                {thenService && <p className="pub-prose">{t('public.start.review.then', { service: label(thenService.name) })}</p>}
                <p className="pub-prose">{t('public.start.review.confirm')}</p>
              </Card>
              <Checkbox
                label={t('public.start.review.consent')}
                checked={values.consent === 'yes'}
                data-invalid={errors.consent ? 'true' : undefined}
                onChange={(e) => setValue('consent', e.target.checked ? 'yes' : '')}
              />
              {errors.consent && (
                <p className="pub-form__error" role="alert">
                  {errors.consent}
                </p>
              )}
            </>
          )}
        </div>

        <div className="pub-form__actions">
          {step > 1 && (
            <Button variant="secondary" size="lg" icon="←" onClick={() => goPrev()}>
              {t('public.start.back')}
            </Button>
          )}
          <Button variant="primary" size="lg" type="submit" disabled={sending}>
            {step < STEP_COUNT ? t('public.start.next') : sending ? t('public.start.sending') : t('public.start.submit')}
          </Button>
        </div>
      </form>
    </PublicLayout>
  );
}
