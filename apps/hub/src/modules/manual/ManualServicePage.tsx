import { useNavigate } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { isGrouped, pick, SERVICES, serviceByCode, type ServiceCode, type ServicePhase } from '../../domain';
import { useT } from '../../i18n/I18nProvider';
import './manual.css';
import { Checklist, focusSection, PrintButton, SectionHeading } from './parts';
import { serviceSpec } from './specs';

const phaseDomId = (phase: ServicePhase) => `manual-phase-${phase.id}`;

/** M-03..M-07: one service of the playbook, phase by phase. One component, five routes (one spec and page doc each). */
export function ManualServicePage({ code, pageCode }: { code: ServiceCode; pageCode: string }) {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const service = serviceByCode(code);
  const spec = serviceSpec(pageCode);

  const index = SERVICES.findIndex((s) => s.code === code);
  const prev = index > 0 ? SERVICES[index - 1] : undefined;
  const next = index >= 0 && index < SERVICES.length - 1 ? SERVICES[index + 1] : undefined;

  useRegisterActions({
    'manual.jumpToPhase': ({ phase }) => {
      const wanted = String(phase);
      const target = service?.phases.find((p) => p.id === wanted || p.number === wanted || `${code}-${wanted}` === p.id);
      if (!target || !focusSection(phaseDomId(target))) throw new Error(`no phase ${wanted}`);
      return target.id;
    },
    'manual.openService': ({ service: wanted }) => {
      const s = SERVICES.find((x) => x.code === String(wanted));
      if (!s) throw new Error(`no service ${String(wanted)}`);
      navigate(`/manual/services/${s.slug}`);
      return s.slug;
    },
  });

  if (!service) {
    return (
      <div className="manual-page">
        <PageHeader code={pageCode} title={t('manual.title')} />
        <EmptyState title={t('manual.service.notFound')} glyph="◇">
          <Button variant="primary" href="#/manual">
            {t('manual.title')}
          </Button>
        </EmptyState>
      </div>
    );
  }

  const unitKey = service.phaseLabel === 'phase' ? 'manual.service.phase' : 'manual.service.stage';
  const unitsKey = service.phaseLabel === 'phase' ? 'manual.service.phases' : 'manual.service.stages';

  return (
    <div className="manual-page">
      <PageHeader
        code={spec.code}
        title={pick(service.name, lang)}
        subtitle={pick(service.outcome, lang)}
        breadcrumb={[{ label: t('manual.title'), to: '/manual' }, { label: pick(service.name, lang) }]}
        actions={<PrintButton />}
      />

      <Card raised title={t('manual.service', { code: service.code })} subtitle={pick(service.ladderWord, lang)}>
        <dl className="manual-def">
          <dt>{t('manual.service.outcome')}</dt>
          <dd>{pick(service.outcome, lang)}</dd>
          {service.centralQuestion && (
            <>
              <dt>{t('manual.service.centralQuestion')}</dt>
              <dd className="manual-quoteline">{pick(service.centralQuestion, lang)}</dd>
            </>
          )}
          {service.promise && (
            <>
              <dt>{t('manual.service.promise')}</dt>
              <dd className="manual-quoteline">{pick(service.promise, lang)}</dd>
            </>
          )}
          <dt>{t('manual.service.idealFor')}</dt>
          <dd>{pick(service.idealFor, lang)}</dd>
          <dt>{t('manual.service.ladderWord')}</dt>
          <dd>{pick(service.ladderWord, lang)}</dd>
        </dl>
      </Card>

      <div className="manual-service">
        <nav className="manual-index manual-noprint" aria-label={t('manual.service.indexLabel')}>
          <h2 className="manual-h3">{t('manual.service.index')}</h2>
          <ul>
            {service.phases.map((phase) => (
              <li key={phase.id}>
                <Button variant="ghost" size="sm" fullWidth onClick={() => focusSection(phaseDomId(phase))}>
                  <span className="manual-index__n">{phase.number}</span>
                  <span className="manual-index__label">{pick(phase.title, lang)}</span>
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="manual-phases">
          <SectionHeading id="manual-phases">
            {t(unitsKey)} <Badge tone="neutral">{service.phases.length}</Badge>
          </SectionHeading>
          <p className="manual-muted">{t('manual.service.readOnly')}</p>

          {service.phases.map((phase) => {
            const title = `${t(unitKey, { n: phase.number })} · ${pick(phase.title, lang)}`;
            return (
              <Card key={phase.id} title={<span id={phaseDomId(phase)} tabIndex={-1}>{title}</span>}>
                {isGrouped(phase.items) ? (
                  phase.items.map((group) => (
                    <div className="manual-group" key={group.group.en}>
                      <h4 className="manual-h4">{pick(group.group, lang)}</h4>
                      <Checklist items={group.items} label={pick(group.group, lang)} lang={lang} />
                    </div>
                  ))
                ) : (
                  <Checklist items={phase.items} label={t('manual.service.checklist', { title: pick(phase.title, lang) })} lang={lang} />
                )}
                {phase.notes?.map((note) => (
                  <p className="manual-note" key={note.en}>
                    {pick(note, lang)}
                  </p>
                ))}
              </Card>
            );
          })}

          <Card title={t('manual.service.delivery')}>
            <Checklist items={service.deliveryContents} label={t('manual.service.delivery')} lang={lang} />
          </Card>

          {service.notIncluded && service.notIncluded.length > 0 && (
            <Card title={t('manual.service.notIncluded')}>
              <ul className="manual-excluded">
                {service.notIncluded.map((x) => (
                  <li key={x.en}>
                    <span className="manual-excluded__mark" aria-hidden="true">
                      ✕
                    </span>
                    <span>{pick(x, lang)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {service.nextStep && (
            <Card raised title={t('manual.service.nextStep')}>
              <p className="manual-body">{pick(service.nextStep, lang)}</p>
            </Card>
          )}

          <nav className="manual-prevnext manual-noprint" aria-label={t('manual.services.title')}>
            {prev ? (
              <Button variant="secondary" href={`#/manual/services/${prev.slug}`}>
                ← {t('manual.service.prev')}: {pick(prev.name, lang)}
              </Button>
            ) : (
              <span />
            )}
            {next && (
              <Button variant="secondary" href={`#/manual/services/${next.slug}`}>
                {t('manual.service.next')}: {pick(next.name, lang)} →
              </Button>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
