import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { useSession } from '../../auth/SessionProvider';
import type { RoleId } from '../../auth/roles';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { useData, useTable } from '../../data/DataContext';
import type { ProjectType } from '../../data/schema';
import { pick, SERVICES, type ServiceCode } from '../../domain';
import { expandTemplate, TEMPLATES, templateCounts, ZONES, type Zone } from '../../domain/templates';
import { useT } from '../../i18n/I18nProvider';
import type { Surface } from '../../specs/PageSpec';
import { todayIso } from '../../work/model';
import { newProjectSpec } from './specs';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import './work.css';

const STEPS = ['template', 'project', 'phases', 'zones', 'review'] as const;
type Step = (typeof STEPS)[number];

const PROJECT_TYPES: ProjectType[] = ['residential', 'commercial', 'hospitality', 'wellness', 'lighting-product'];
/** Who a template owner role becomes on a real task (`seed/index.ts` demo users). */
const USER_BY_ROLE: Record<RoleId, string> = { founder: 'u-alejandra', studio: 'u-sarai', ops: 'u-miguel', brand: 'u-angelica', marketing: 'u-valentina', client: 'u-client', dev: 'u-dev' };
const LEAD_ROLES: RoleId[] = ['founder', 'studio', 'ops'];

/**
 * W-03: create a project from a template (D-062). Five steps over one `ProjectTemplate`
 * (`src/domain/templates`): template, project, phases, zones, review. "Create" writes the `projects` row,
 * one `sections` row per chosen phase and the whole task tree through the DataProvider — every task with
 * its `templateTaskId`, `deliverableId`, `ownerRole`, assignee, `order` and `parentTaskId` — and then
 * opens the new project in W-02.
 */
export function NewProjectPage({ surface }: { surface: Surface }) {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const data = useData();
  const { can } = useSession();
  const { rows: clients } = useTable('clients', { orderBy: 'name' });
  const spec = newProjectSpec(surface);
  const home = `/${surface}`;

  const [step, setStep] = useState<Step>('template');
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const template = TEMPLATES.find((x) => x.id === templateId) ?? TEMPLATES[0];
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [type, setType] = useState<ProjectType>('residential');
  const [leadRole, setLeadRole] = useState<RoleId>('studio');
  const [serviceCode, setServiceCode] = useState<ServiceCode>(template.serviceCode ?? '03');
  const [phaseIds, setPhaseIds] = useState<string[]>(() => template.phases.map((p) => p.id));
  const [zoneIds, setZoneIds] = useState<string[]>(() => ZONES.map((z) => z.id));
  const [extraZones, setExtraZones] = useState<Zone[]>([]);
  const [newZone, setNewZone] = useState('');
  const [creating, setCreating] = useState(false);

  const canWrite = can('projects.write');
  const allZones = useMemo(() => [...ZONES, ...extraZones], [extraZones]);
  const zones = useMemo(() => allZones.filter((z) => zoneIds.includes(z.id)), [allZones, zoneIds]);
  const counts = useMemo(() => templateCounts(template, phaseIds, zones.length), [template, phaseIds, zones.length]);
  const client = clients.find((c) => c.id === clientId);
  const ready = Boolean(name.trim() && client && phaseIds.length > 0);

  const togglePhase = (id: string) => setPhaseIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...template.phases.map((p) => p.id)].filter((x) => s.includes(x) || x === id)));
  const toggleZone = (id: string) => setZoneIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const addZone = (label: string) => {
    const value = label.trim();
    if (!value) return 'empty zone name';
    const zone: Zone = { id: `zone-custom-${value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name: { en: value, es: value } };
    if (allZones.some((z) => z.id === zone.id)) return `zone already there: ${value}`;
    setExtraZones((s) => [...s, zone]);
    setZoneIds((s) => [...s, zone.id]);
    setNewZone('');
    return `zone added: ${value}`;
  };

  /** Writes the project, its sections and the whole task tree, then opens W-02. */
  const create = async () => {
    if (!ready || !client || creating) return 'not ready: give the project a name and a client, and keep at least one phase';
    setCreating(true);
    try {
      const today = todayIso();
      const project = await data.create('projects', {
        name: name.trim(),
        client: client.name,
        clientUserId: null,
        type,
        phase: 'concept',
        serviceCode,
        pipelineStatus: 'briefing',
        creativeDirection: 'pending',
        approval: 'draft',
        leadDesignerId: USER_BY_ROLE[leadRole],
        budgetCop: 0,
        startDate: today,
        dueDate: null,
        location: client.city ?? '',
        summary: t('work.new.summary', { template: pick(template.name, lang), zones: String(zones.length), tasks: String(counts.generated) }),
        // Archive fields (D-055, changelog 0019): a project created here has no archived folder behind it.
        tags: [],
        coverAssetId: null,
        year: new Date(today).getFullYear(),
        sourceFolderUrl: null,
      });

      const expanded = expandTemplate(template, { phaseIds, zones });
      const sectionIdByPhase = new Map<string, string>();
      for (const [i, phase] of expanded.phases.entries()) {
        const row = await data.create('sections', { projectId: project.id, name: pick(phase.name, lang), order: i });
        sectionIdByPhase.set(phase.id, row.id);
      }

      const idByKey = new Map<string, string>();
      for (const task of expanded.tasks) {
        const row = await data.create('tasks', {
          projectId: project.id,
          sectionId: sectionIdByPhase.get(task.phaseId) ?? null,
          parentTaskId: task.parentKey ? idByKey.get(task.parentKey) ?? null : null,
          title: pick(task.title, lang),
          description: '',
          ownerRole: task.ownerRole,
          assigneeId: USER_BY_ROLE[task.ownerRole],
          createdById: null,
          status: 'todo',
          priority: 'normal',
          startDate: null,
          dueDate: null,
          dependsOn: [],
          tags: ['plantilla'],
          subtasks: [],
          completedAt: null,
          order: task.order,
          deliverableId: task.deliverableId,
          externalId: null,
          templateTaskId: task.templateTaskId,
        });
        idByKey.set(task.key, row.id);
      }

      toast(t('work.new.created', { n: expanded.tasks.length, sections: expanded.phases.length }));
      navigate(`${home}/work/${project.id}`);
      return `created ${project.id} with ${expanded.phases.length} sections and ${expanded.tasks.length} tasks`;
    } finally {
      setCreating(false);
    }
  };

  useRegisterActions({
    'work.selectTemplate': ({ template: id }) => {
      const found = TEMPLATES.find((x) => x.id === String(id));
      if (!found) return `unknown template: ${String(id)}`;
      setTemplateId(found.id);
      setPhaseIds(found.phases.map((p) => p.id));
      return `template: ${found.id}`;
    },
    'work.setTemplateStep': ({ step: s }) => {
      const next = STEPS.find((x) => x === String(s));
      if (!next) return `unknown step: ${String(s)}`;
      setStep(next);
      return `step: ${next}`;
    },
    'work.setProjectName': ({ name: v }) => {
      setName(String(v));
      return `name: ${String(v)}`;
    },
    'work.selectClient': ({ client: id }) => {
      const found = clients.find((c) => c.id === String(id) || c.name.toLowerCase() === String(id).toLowerCase());
      if (!found) return `unknown client: ${String(id)}`;
      setClientId(found.id);
      return `client: ${found.name}`;
    },
    'work.selectTemplatePhases': ({ phases }) => {
      const wanted = String(phases).split(',').map((x) => x.trim()).filter(Boolean);
      const valid = template.phases.filter((p) => wanted.includes(p.id)).map((p) => p.id);
      if (valid.length === 0) return `no phase of ${template.id} matched: ${String(phases)}`;
      setPhaseIds(valid);
      return `phases: ${valid.join(', ')}`;
    },
    'work.selectTemplateZones': ({ zones: z }) => {
      const wanted = String(z).split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
      const valid = allZones.filter((zone) => wanted.includes(zone.id) || wanted.includes((zone.name.en ?? '').toLowerCase()) || wanted.includes((zone.name.es ?? '').toLowerCase())).map((zone) => zone.id);
      setZoneIds(valid);
      return `zones: ${valid.length}`;
    },
    'work.addZone': ({ zone }) => addZone(String(zone)),
    'work.createProjectFromTemplate': canWrite ? () => create() : false,
  });

  const stepTabs = STEPS.map((s, i) => ({ id: s, label: `${i + 1}. ${t(`work.new.step.${s}`)}` }));

  return (
    <div className="work-page work-new">
      <PageHeader
        code={spec.code}
        title={t('work.new.title')}
        subtitle={t('work.new.subtitle')}
        breadcrumb={[{ label: t(`core.portal.${surface}`), to: home }, { label: t('work.title'), to: `${home}/work` }, { label: t('work.new.title') }]}
        actions={<Button href={`#${home}/work`} icon="‹">{t('work.allWork')}</Button>}
      />

      <Tabs label={t('work.new.steps')} value={step} onChange={(v) => setStep(v as Step)} tabs={stepTabs} />

      {step === 'template' && (
        <Card title={t('work.new.step.template')} subtitle={t('work.new.templateHint')}>
          <Select
            label={t('work.new.template')}
            value={templateId}
            onChange={(e) => {
              setTemplateId(e.target.value);
              const found = TEMPLATES.find((x) => x.id === e.target.value);
              if (found) setPhaseIds(found.phases.map((p) => p.id));
            }}
            options={TEMPLATES.map((x) => ({ value: x.id, label: pick(x.name, lang) }))}
          />
          <p className="work-new__prose">{pick(template.source, lang)}</p>
          <KeyValue
            items={[
              { key: t('work.new.count.phases'), value: String(template.phases.length) },
              { key: t('work.new.count.templateTasks'), value: String(counts.tasks) },
              { key: t('work.new.count.zoneScoped'), value: String(counts.zoneScoped) },
              { key: t('work.new.count.deliverables'), value: String(counts.deliverables) },
            ]}
          />
        </Card>
      )}

      {step === 'project' && (
        <Card title={t('work.new.step.project')} subtitle={t('work.new.projectHint')}>
          <div className="work-new__grid">
            <Input label={t('work.new.name')} value={name} onChange={(e) => setName(e.target.value)} required />
            <Select label={t('work.new.client')} value={clientId} onChange={(e) => setClientId(e.target.value)} required options={[{ value: '', label: t('work.new.pickClient') }, ...clients.map((c) => ({ value: c.id, label: c.name }))]} />
            <Select label={t('work.new.type')} value={type} onChange={(e) => setType(e.target.value as ProjectType)} options={PROJECT_TYPES.map((x) => ({ value: x, label: t(`work.new.type.${x}`) }))} />
            <Select label={t('work.new.lead')} value={leadRole} onChange={(e) => setLeadRole(e.target.value as RoleId)} options={LEAD_ROLES.map((r) => ({ value: r, label: t(`core.role.${r}`) }))} />
            <Select label={t('work.new.service')} value={serviceCode} onChange={(e) => setServiceCode(e.target.value as ServiceCode)} options={SERVICES.map((sv) => ({ value: sv.code, label: `${sv.code} · ${pick(sv.name, lang)}` }))} />
          </div>
        </Card>
      )}

      {step === 'phases' && (
        <Card title={t('work.new.step.phases')} subtitle={t('work.new.phasesHint')}>
          <ul className="work-new__list">
            {template.phases.map((phase) => {
              const phaseCounts = templateCounts(template, [phase.id], zones.length);
              return (
                <li key={phase.id}>
                  <Checkbox label={pick(phase.name, lang)} hint={t('work.new.phaseHint', { tasks: phaseCounts.generated, owner: t(`core.role.${phase.ownerRole}`) })} checked={phaseIds.includes(phase.id)} onChange={() => togglePhase(phase.id)} />
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {step === 'zones' && (
        <Card title={t('work.new.step.zones')} subtitle={t('work.new.zonesHint')}>
          <ul className="work-new__list work-new__list--zones">
            {allZones.map((zone) => (
              <li key={zone.id}>
                <Checkbox label={pick(zone.name, lang)} checked={zoneIds.includes(zone.id)} onChange={() => toggleZone(zone.id)} />
              </li>
            ))}
          </ul>
          <form
            className="work-new__add"
            onSubmit={(e) => {
              e.preventDefault();
              addZone(newZone);
            }}
          >
            <Input label={t('work.new.addZone')} value={newZone} onChange={(e) => setNewZone(e.target.value)} />
            <Button type="submit" disabled={!newZone.trim()}>{t('core.work.add')}</Button>
          </form>
          <p className="work-new__prose">{t('work.new.zonesCount', { zones: zones.length, tasks: counts.generated })}</p>
        </Card>
      )}

      {step === 'review' && (
        <Card title={t('work.new.step.review')} subtitle={t('work.new.reviewHint')}>
          <div className="work-new__stats">
            <StatTile label={t('work.new.count.sections')} value={counts.phases} glyph="▤" />
            <StatTile label={t('work.new.count.tasks')} value={counts.generated} glyph="▥" tone="accent" />
            <StatTile label={t('work.new.count.zones')} value={zones.length} glyph="◈" />
            <StatTile label={t('work.new.count.deliverables')} value={counts.deliverables} glyph="▣" tone="success" />
          </div>
          <KeyValue
            columns={2}
            items={[
              { key: t('work.new.name'), value: name.trim() || <Badge tone="warning">{t('work.new.missing')}</Badge> },
              { key: t('work.new.client'), value: client?.name ?? <Badge tone="warning">{t('work.new.missing')}</Badge> },
              { key: t('work.new.type'), value: t(`work.new.type.${type}`) },
              { key: t('work.new.lead'), value: t(`core.role.${leadRole}`) },
              { key: t('work.new.service'), value: `${serviceCode} · ${pick(SERVICES.find((sv) => sv.code === serviceCode)?.name ?? { en: serviceCode }, lang)}` },
              { key: t('work.new.count.owners'), value: counts.owners.map((r) => t(`core.role.${r}`)).join(', ') },
              { key: t('work.new.step.phases'), value: template.phases.filter((p) => phaseIds.includes(p.id)).map((p) => pick(p.name, lang)).join(' · ') },
              { key: t('work.new.step.zones'), value: zones.length ? zones.map((z) => pick(z.name, lang)).join(', ') : t('work.new.noZones') },
            ]}
          />
          {!canWrite && <p className="work-new__prose">{t('work.new.noPermission')}</p>}
        </Card>
      )}

      <div className="work-new__nav">
        <Button variant="ghost" icon="‹" disabled={STEPS.indexOf(step) === 0} onClick={() => setStep(STEPS[Math.max(0, STEPS.indexOf(step) - 1)])}>
          {t('work.new.back')}
        </Button>
        {step === 'review' ? (
          <Button variant="primary" icon="✓" disabled={!ready || !canWrite || creating} onClick={() => create()}>
            {creating ? t('work.new.creating') : t('work.new.create')}
          </Button>
        ) : (
          <Button variant="primary" icon="›" onClick={() => setStep(STEPS[Math.min(STEPS.length - 1, STEPS.indexOf(step) + 1)])}>
            {t('work.new.next')}
          </Button>
        )}
      </div>
    </div>
  );
}
