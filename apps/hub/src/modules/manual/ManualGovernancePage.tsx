import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { useRoutes } from '../../app/RoutesContext';
import { ROLE_META } from '../../auth/roles';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Card } from '../../components/molecule/Card/Card';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { useTable } from '../../data/DataContext';
import { ENTITIES } from '../../data/schema';
import {
  FINAL_PRINCIPLE,
  GOVERNANCE_RULES,
  KPIS,
  OPERATIONAL_ASSETS,
  PIPELINE_STATUSES,
  PURCHASE_STATUSES,
  ROLE_RESPONSIBILITIES,
  VALIDATION_STATUSES,
  pick,
  type GovernanceKind,
  type PipelineGroup,
} from '../../domain';
import { useT } from '../../i18n/I18nProvider';
import './manual.css';
import { focusSection, PrintButton, SectionHeading } from './parts';
import { governanceSpec } from './specs';

const CODE_IN_TEXT = /\b(?:HUB|BOS|[PCAOSGMDWK])-\d{2}\b/g;
const GROUPS: PipelineGroup[] = ['lead', 'sale', 'design', 'build', 'close'];
const KIND_KEY: Record<GovernanceKind, string> = {
  mandatory: 'manual.kind.mandatory',
  commercial: 'manual.kind.commercial',
  method: 'manual.kind.method',
  gate: 'manual.kind.gate',
  principle: 'manual.kind.principle',
  'change-control': 'manual.kind.changeControl',
};
const KIND_TONE: Record<GovernanceKind, 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'> = {
  mandatory: 'danger',
  commercial: 'accent',
  method: 'info',
  gate: 'warning',
  principle: 'neutral',
  'change-control': 'warning',
};

/**
 * Playbook operational asset -> the `deliverables` row that already holds its template. A UI-only lookup
 * (exact deliverable name): the request to carry it as a `playbookAssetId` column is in the changelog draft.
 */
const ASSET_DELIVERABLE: Record<string, string> = {
  'brief-forms': 'brief and intake form',
  'approval-forms': 'client approval record',
  'budget-tracker': 'budget and quote comparison',
  'procurement-tracker': 'purchase orders',
  'handover-checklist': 'handover package',
};

/** M-08: the rules, the status architecture, the roles, the operational assets and the KPI layer. */
export function ManualGovernancePage() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const routes = useRoutes();
  const [params] = useSearchParams();
  const deliverables = useTable('deliverables');

  const section = params.get('s');
  useEffect(() => {
    if (!section) return;
    const id = window.setTimeout(() => focusSection(`manual-${section}`), 0);
    return () => window.clearTimeout(id);
  }, [section]);

  /**
   * Where the product enforces a rule: the page codes the rule names in `enforcedBy`, plus the built pages
   * whose spec declares one of the entities it names (`spec.dataTables`). Derived from the live route
   * manifest, so a page that disappears stops being claimed here.
   */
  const enforcingCodes = (enforcedBy: string | undefined) => {
    if (!enforcedBy) return [];
    const named = [...new Set(enforcedBy.match(CODE_IN_TEXT) ?? [])].map((code) => ({ code, route: routes.find((r) => r.code === code && r.status === 'built') }));
    const entities = ENTITIES.filter((e) => new RegExp(`\\b${e}\\b`).test(enforcedBy));
    const byEntity = routes
      .filter((r) => r.status === 'built' && r.surface !== 'manual' && r.surface !== 'docs' && r.nav && entities.some((e) => r.spec.dataTables.includes(e)))
      .filter((r, i, all) => all.findIndex((x) => x.code === r.code) === i)
      .filter((r) => !named.some((n) => n.code === r.code))
      .slice(0, 3)
      .map((route) => ({ code: route.code, route }));
    return [...named, ...byEntity];
  };

  useRegisterActions({
    'manual.openEnforcingPage': ({ rule }) => {
      const wanted = String(rule).toUpperCase();
      const found = GOVERNANCE_RULES.find((r) => r.id.toUpperCase() === wanted);
      if (!found) throw new Error(`no rule ${wanted}`);
      const target = enforcingCodes(found.enforcedBy).find((c) => c.route);
      if (!target?.route) throw new Error(`${found.id} has no page in the product yet`);
      navigate(target.route.path);
      return target.code;
    },
    // Declared but deliberately not wired (P-09): there is no KPI dashboard yet.
    'manual.openKpiDashboard': () => {
      throw new Error('not wired yet: the KPI dashboard does not exist');
    },
    'manual.openSection': ({ section: wanted }) => {
      const key = String(wanted);
      if (key === 'overview') {
        navigate('/manual');
        return '/manual';
      }
      if (key === 'commercial') {
        navigate('/manual/commercial');
        return '/manual/commercial';
      }
      if (!focusSection(`manual-${key}`)) throw new Error(`no section ${key}`);
      return key;
    },
  });

  return (
    <div className="manual-page">
      <PageHeader
        code={governanceSpec.code}
        title={t('manual.governance.title')}
        subtitle={t('manual.governance.subtitle')}
        breadcrumb={[{ label: t('manual.title'), to: '/manual' }, { label: t('manual.governance.title') }]}
        actions={<PrintButton />}
      />

      <section className="manual-section" aria-labelledby="manual-rules">
        <SectionHeading id="manual-rules">
          {t('manual.governance.rules')} <Badge tone="neutral">{GOVERNANCE_RULES.length}</Badge>
        </SectionHeading>
        <div className="manual-rules">
          {GOVERNANCE_RULES.map((rule) => {
            const codes = enforcingCodes(rule.enforcedBy);
            return (
              <Card
                key={rule.id}
                title={rule.id}
                subtitle={t('manual.governance.playbookPage', { n: rule.page })}
                actions={<Badge tone={KIND_TONE[rule.kind]}>{t(KIND_KEY[rule.kind])}</Badge>}
              >
                <p className="manual-body manual-rule">{pick(rule.rule, lang)}</p>
                {rule.enforcedBy && (
                  <p className="manual-enforced">
                    <span className="manual-enforced__label">{t('manual.governance.enforcedBy')}: </span>
                    <code className="manual-code">{rule.enforcedBy}</code>
                  </p>
                )}
                <div className="manual-actions manual-noprint">
                  {codes.length === 0 ? (
                    <Placeholder what={t('manual.governance.noPage', { rule: rule.id })}>
                      <Button variant="ghost" size="sm">
                        {t('manual.governance.noPageShort')}
                      </Button>
                    </Placeholder>
                  ) : (
                    codes.map(({ code, route }) =>
                      route ? (
                        <Button key={code} variant="ghost" size="sm" href={`#${route.path}`}>
                          {t('manual.governance.openPage', { code })}
                        </Button>
                      ) : (
                        <Placeholder key={code} what={t('manual.governance.noPage', { rule: rule.id })}>
                          <Button variant="ghost" size="sm">
                            {t('manual.governance.openPage', { code })}
                          </Button>
                        </Placeholder>
                      ),
                    )
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="manual-section" aria-labelledby="manual-statuses">
        <SectionHeading id="manual-statuses">
          {t('manual.statuses.title')} <Badge tone="neutral">{PIPELINE_STATUSES.length}</Badge>
        </SectionHeading>
        <p className="manual-muted">{t('manual.statuses.hint')}</p>
        <div className="manual-statusgroups">
          {GROUPS.map((group) => (
            <div className="manual-statusgroup" key={group}>
              <h3 className="manual-h3">{t(`manual.statuses.group.${group}`)}</h3>
              <ul className="manual-pills">
                {PIPELINE_STATUSES.filter((s) => s.group === group).map((s) => (
                  <li key={s.id}>
                    <StatusPill status={s.id} label={pick(s.label, lang)} tone={s.tone} />
                    <span className="manual-pills__playbook">{s.playbook}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="manual-section" aria-labelledby="manual-validation">
        <SectionHeading id="manual-validation">{t('manual.validation.title')}</SectionHeading>
        <ul className="manual-pills manual-pills--row">
          {VALIDATION_STATUSES.map((s) => (
            <li key={s.id}>
              <StatusPill status={s.id} label={pick(s.label, lang)} tone={s.tone} />
              <span className="manual-pills__playbook">{s.playbook}</span>
            </li>
          ))}
        </ul>
        <h3 className="manual-h3" id="manual-purchases" tabIndex={-1}>
          {t('manual.purchase.title')}
        </h3>
        <ul className="manual-pills manual-pills--row">
          {PURCHASE_STATUSES.map((s) => (
            <li key={s.id}>
              <StatusPill status={s.id} label={pick(s.label, lang)} tone={s.tone} />
              <span className="manual-pills__playbook">{s.playbook}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="manual-section" aria-labelledby="manual-roles">
        <SectionHeading id="manual-roles">{t('manual.roles.title')}</SectionHeading>
        <ul className="manual-rows">
          {ROLE_RESPONSIBILITIES.map((r) => {
            const meta = r.roleId ? ROLE_META[r.roleId] : undefined;
            return (
              <li className="manual-rows__row" key={r.id}>
                <span className="manual-rows__name">{pick(r.playbookRole, lang)}</span>
                <span className="manual-rows__note">{pick(r.note, lang)}</span>
                {meta ? (
                  <Button className="manual-noprint" variant="ghost" size="sm" href={`#${meta.homePath}`}>
                    {t(meta.portalKey)}
                  </Button>
                ) : (
                  <Badge tone="neutral">{t('manual.roles.noPortal')}</Badge>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="manual-section" aria-labelledby="manual-assets">
        <SectionHeading id="manual-assets">
          {t('manual.assets.title')} <Badge tone="neutral">{OPERATIONAL_ASSETS.length}</Badge>
        </SectionHeading>
        <ul className="manual-rows">
          {OPERATIONAL_ASSETS.map((asset) => {
            const wanted = ASSET_DELIVERABLE[asset.id];
            const deliverable = wanted ? deliverables.rows.find((d) => d.name.toLowerCase() === wanted) : undefined;
            return (
              <li className="manual-rows__row" key={asset.id}>
                <span className="manual-rows__name">{pick(asset.label, lang)}</span>
                <span className="manual-rows__note">
                  {asset.productMapping ? <code className="manual-code">{asset.productMapping}</code> : <span className="manual-muted">{t('manual.assets.none')}</span>}
                </span>
                {deliverable ? (
                  <span className="manual-rows__end">
                    <span className="manual-muted">{t('manual.assets.template')}: </span>
                    <StatusPill status={deliverable.status} />
                  </span>
                ) : (
                  <span />
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="manual-section" aria-labelledby="manual-kpis">
        <SectionHeading id="manual-kpis">
          {t('manual.kpis.title')} <Badge tone="neutral">{KPIS.length}</Badge>
        </SectionHeading>
        <ul className="manual-rows">
          {KPIS.map((kpi) => (
            <li className="manual-rows__row" key={kpi.key}>
              <span className="manual-rows__name">{pick(kpi.label, lang)}</span>
              <span className="manual-rows__note">
                <code className="manual-code">{kpi.key}</code>
              </span>
              <Badge tone="info">{kpi.unit}</Badge>
            </li>
          ))}
        </ul>
        <div className="manual-actions manual-noprint">
          <Placeholder what={t('manual.kpis.openWhat')}>
            <Button variant="primary">{t('manual.kpis.open')}</Button>
          </Placeholder>
        </div>
      </section>

      <section className="manual-section" aria-labelledby="manual-principle">
        <SectionHeading id="manual-principle">{t('manual.principle.title')}</SectionHeading>
        <blockquote className="manual-quote">{pick(FINAL_PRINCIPLE, lang)}</blockquote>
      </section>
    </div>
  );
}
