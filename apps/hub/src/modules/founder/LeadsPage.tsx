import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { DEMO_USERS, demoUserById } from '../../auth/demoUsers';
import { useCan } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { toast } from '../../components/atom/Toast/Toast';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Modal } from '../../components/organism/Modal/Modal';
import { useData, useTable } from '../../data/DataContext';
import type { Lead, LeadProjectStatus, LeadProjectType } from '../../data/schema';
import {
  LEAD_CHANNELS,
  LEAD_STATUS_IDS,
  QUALIFICATION_QUESTIONS,
  SERVICES,
  pick,
  pipelineStatus,
  routeService,
  serviceByCode,
  type LeadChannelId,
  type PipelineStatusId,
  type QualificationKey,
  type ServiceCode,
} from '../../domain';
import { formatCop, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import './founder.css';
import { PROJECT_TYPES, projectTypeOf, todayIso } from './pipelineData';
import { leadsSpec } from './specs';

/** Staff who can own a lead (everybody but the client and the developer demo identities). */
const OWNER_ROLES = ['founder', 'ops', 'studio', 'brand', 'marketing'];

const LEAD_PROJECT_STATUSES: readonly LeadProjectStatus[] = ['built', 'under-construction', 'conceptual'];

interface LeadDraft {
  name: string;
  phone: string;
  email: string;
  city: string;
  projectType: LeadProjectType;
  areaM2: string;
  projectStatus: string;
  requestedService: string;
  budgetCop: string;
  desiredStart: string;
  channel: LeadChannelId;
  ownerId: string;
  notes: string;
}

const EMPTY_DRAFT: LeadDraft = {
  name: '',
  phone: '',
  email: '',
  city: 'Medellín',
  projectType: 'residential',
  areaM2: '',
  projectStatus: '',
  requestedService: '',
  budgetCop: '',
  desiredStart: '',
  channel: 'instagram',
  ownerId: '',
  notes: '',
};

const num = (v: string): number | null => {
  const n = Number(v.replace(/[^0-9.-]/g, ''));
  return v.trim() === '' || Number.isNaN(n) ? null : n;
};

/**
 * A-08 Leads: the single traceable pipeline entry of the playbook (p. 3). Every inquiry is a `leads`
 * row here — registered, qualified with the ten questions, routed to a service (`routeService()`
 * suggests, the founder decides: G-10) and, once contracted, converted into a project plus its
 * engagement, which is where A-03 and the Work views pick it up.
 */
export function LeadsPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const navigate = useNavigate();
  const { rows: leads, loading } = useTable('leads', { orderBy: 'created_at', dir: 'desc' });
  const manage = can('leads.manage');

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [channel, setChannel] = useState('');
  const [service, setService] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<LeadDraft>(EMPTY_DRAFT);
  const [answers, setAnswers] = useState<Partial<Record<QualificationKey, string>>>({});
  const [note, setNote] = useState('');
  const [reason, setReason] = useState<string | null>(null);

  const serviceLabel = (code: string | null | undefined): string => {
    const s = serviceByCode(code);
    return s ? `${s.code} · ${pick(s.name, lang)}` : t('founder.common.none');
  };
  const serviceOptions = SERVICES.map((s) => ({ value: s.code, label: `${s.code} · ${pick(s.name, lang)}` }));
  const ownerOptions = DEMO_USERS.filter((u) => OWNER_ROLES.includes(u.role)).map((u) => ({ value: u.id, label: u.name }));
  const statusOptions = LEAD_STATUS_IDS.map((id) => ({ value: id, label: t(`core.status.${id}`) }));
  const channelOptions = LEAD_CHANNELS.map((c) => ({ value: c.id, label: pick(c.label, lang) }));
  const ownerName = (id: string | null) => (id ? demoUserById(id)?.name ?? id : t('founder.leads.unassigned'));

  const filtered = useMemo(
    () =>
      leads.filter((l) => {
        const needle = query.trim().toLowerCase();
        if (needle && !`${l.name} ${l.city} ${l.email} ${l.notes}`.toLowerCase().includes(needle)) return false;
        if (status && l.status !== status) return false;
        if (channel && l.channel !== channel) return false;
        if (service && l.requestedService !== service && l.suggestedService !== service) return false;
        return true;
      }),
    [leads, query, status, channel, service],
  );

  const counts = useMemo(() => {
    const by = (id: PipelineStatusId) => leads.filter((l) => l.status === id).length;
    const contracted = by('contracted');
    return {
      new: by('lead-new'),
      qualified: by('lead-qualified'),
      proposal: by('proposal-sent'),
      contracted,
      conversion: leads.length === 0 ? 0 : Math.round((contracted / leads.length) * 100),
    };
  }, [leads]);

  const open = openId ? leads.find((l) => l.id === openId) ?? null : null;

  const openLead = (lead: Lead) => {
    setOpenId(lead.id);
    setAnswers(lead.qualification);
    setNote(lead.notes);
    setReason(null);
    return lead.name;
  };

  const closeLead = () => {
    setOpenId(null);
    setReason(null);
  };

  const clear = () => {
    setQuery('');
    setStatus('');
    setChannel('');
    setService('');
  };

  // ------------------------------------------------------------------ writes

  const createLead = async (d: LeadDraft): Promise<string> => {
    const row = await data.create('leads', {
      name: d.name.trim(),
      phone: d.phone.trim() || null,
      email: d.email.trim(),
      city: d.city.trim(),
      projectType: d.projectType,
      areaM2: num(d.areaM2),
      projectStatus: (d.projectStatus || null) as LeadProjectStatus | null,
      requestedService: (d.requestedService || null) as ServiceCode | null,
      suggestedService: null,
      budgetCop: num(d.budgetCop),
      desiredStart: d.desiredStart || null,
      channel: d.channel,
      ownerId: d.ownerId || null,
      status: 'lead-new',
      qualification: {},
      notes: d.notes.trim(),
      projectId: null,
      source: 'manual',
    });
    toast(t('founder.leads.created', { name: row.name }));
    return row.id;
  };

  const submitForm = async () => {
    if (!draft.name.trim()) {
      toast(t('founder.leads.nameRequired'));
      return;
    }
    const id = await createLead(draft);
    setFormOpen(false);
    setDraft(EMPTY_DRAFT);
    const created = await data.get('leads', id);
    if (created) openLead(created);
  };

  const saveQualification = async (lead: Lead, next = answers, notes = note) => {
    await data.update('leads', lead.id, { qualification: next, notes }, { basedOn: lead.updated_at });
    toast(t('founder.common.saved'));
  };

  const suggest = async (lead: Lead) => {
    const route = routeService(answers);
    setReason(pick(route.reason, lang));
    await data.update('leads', lead.id, { suggestedService: route.code }, { basedOn: lead.updated_at });
    toast(t('founder.leads.suggested', { service: serviceLabel(route.code) }));
    return { service: route.code, reason: pick(route.reason, lang), then: route.then ?? null };
  };

  const setLeadService = async (lead: Lead, code: string) => {
    await data.update('leads', lead.id, { requestedService: (code || null) as ServiceCode | null }, { basedOn: lead.updated_at });
    toast(t('founder.leads.serviceSet', { service: serviceLabel(code) }));
  };

  const assignOwner = async (lead: Lead, ownerId: string) => {
    await data.update('leads', lead.id, { ownerId: ownerId || null }, { basedOn: lead.updated_at });
    toast(t('founder.leads.ownerSet', { owner: ownerName(ownerId || null) }));
  };

  const advance = async (lead: Lead, to: string): Promise<string> => {
    if (!LEAD_STATUS_IDS.includes(to as PipelineStatusId)) {
      toast(t('founder.leads.statusOutOfRange'));
      return t('founder.leads.statusOutOfRange');
    }
    await data.update('leads', lead.id, { status: to as PipelineStatusId }, { basedOn: lead.updated_at });
    toast(t('founder.leads.statusSet', { status: t(`core.status.${to}`) }));
    return to;
  };

  /** Contract -> project + engagement (the playbook's hand-off from commerce to delivery). */
  const convert = async (leadRow: Lead) => {
    // Re-read first: the guard must see the stored row, not the one this render was built from,
    // so a second call (button, voice, another tab) can never create a second project.
    const lead = (await data.get('leads', leadRow.id)) ?? leadRow;
    if (lead.status !== 'contracted' || lead.projectId) return null;
    const code = (lead.requestedService ?? lead.suggestedService ?? '01') as ServiceCode;
    const service = serviceByCode(code);
    const today = todayIso();
    const studio = DEMO_USERS.find((u) => u.role === 'studio');
    const project = await data.create('projects', {
      name: lead.name,
      client: lead.name,
      clientUserId: null,
      type: projectTypeOf(lead),
      phase: 'lead',
      serviceCode: code,
      pipelineStatus: 'contracted',
      creativeDirection: 'pending',
      approval: 'draft',
      leadDesignerId: studio?.id ?? 'u-sarai',
      budgetCop: lead.budgetCop ?? 0,
      startDate: lead.desiredStart ?? today,
      dueDate: null,
      location: lead.city,
      summary: lead.notes,
    });
    await data.create('engagements', {
      projectId: project.id,
      serviceCode: code,
      currentPhaseId: service?.phases[0]?.id ?? `${code}-1`,
      checks: {},
      brief: {},
      startedAt: today,
      completedAt: null,
      status: 'started',
    });
    await data.update('leads', lead.id, { projectId: project.id }, { basedOn: lead.updated_at });
    toast(t('founder.leads.converted', { project: project.name }));
    return { project: project.id, work: `/founder/work/${project.id}` };
  };

  // ------------------------------------------------------------------ actions (P-05, D-036)

  /** The stored row for an action's `lead` param (falls back to the open drawer), never a stale render copy. */
  const byId = async (v: unknown): Promise<Lead | null> => {
    const id = String(v ?? '');
    if (id) return data.get('leads', id);
    return open ? data.get('leads', open.id) : null;
  };

  useRegisterActions({
    'founder.newLead': manage
      ? (p) => {
          const name = String(p?.name ?? '').trim();
          if (!name) {
            setFormOpen(true);
            return t('founder.leads.formOpened');
          }
          return createLead({
            ...EMPTY_DRAFT,
            name,
            city: String(p?.city ?? EMPTY_DRAFT.city),
            email: String(p?.email ?? ''),
            channel: (String(p?.channel ?? '') || EMPTY_DRAFT.channel) as LeadChannelId,
            projectType: (String(p?.projectType ?? '') || 'residential') as LeadProjectType,
          });
        }
      : false,
    'founder.openLead': async (p) => {
      const lead = await byId(p?.lead);
      return lead ? openLead(lead) : t('founder.leads.notFound');
    },
    'founder.qualifyLead': manage
      ? async (p) => {
          const lead = await byId(p?.lead);
          if (!lead) return t('founder.leads.notFound');
          const key = p?.question ? (String(p.question) as QualificationKey) : null;
          const next = key ? { ...lead.qualification, ...answers, [key]: String(p?.answer ?? '') } : answers;
          if (key) setAnswers(next);
          await saveQualification(lead, next);
          return t('founder.common.saved');
        }
      : false,
    'founder.suggestService': manage
      ? async (p) => {
          const lead = await byId(p?.lead);
          return lead ? suggest(lead) : t('founder.leads.notFound');
        }
      : false,
    'founder.setLeadService': manage
      ? async (p) => {
          const lead = await byId(p?.lead);
          if (!lead) return t('founder.leads.notFound');
          await setLeadService(lead, String(p?.service ?? ''));
          return serviceLabel(String(p?.service ?? ''));
        }
      : false,
    'founder.assignLeadOwner': manage
      ? async (p) => {
          const lead = await byId(p?.lead);
          if (!lead) return t('founder.leads.notFound');
          await assignOwner(lead, String(p?.owner ?? ''));
          return ownerName(String(p?.owner ?? '') || null);
        }
      : false,
    'founder.advanceLead': manage
      ? async (p) => {
          const lead = await byId(p?.lead);
          if (!lead) return t('founder.leads.notFound');
          const to = String(p?.status ?? '') || pipelineStatus(lead.status)?.id;
          return advance(lead, String(to));
        }
      : false,
    'founder.convertLead': manage
      ? async (p) => {
          const lead = await byId(p?.lead);
          if (!lead) return t('founder.leads.notFound');
          return (await convert(lead)) ?? t('founder.leads.cannotConvert');
        }
      : false,
    'founder.filterLeads': (p) => {
      if (p?.status !== undefined) setStatus(String(p.status));
      if (p?.channel !== undefined) setChannel(String(p.channel));
      if (p?.service !== undefined) setService(String(p.service));
      return { status, channel, service };
    },
    'founder.searchLeads': (p) => {
      setQuery(String(p?.query ?? ''));
      return filtered.length;
    },
  });

  // ------------------------------------------------------------------ render

  const prev = open ? LEAD_STATUS_IDS[LEAD_STATUS_IDS.indexOf(open.status) - 1] : undefined;
  const next = open ? LEAD_STATUS_IDS[LEAD_STATUS_IDS.indexOf(open.status) + 1] : undefined;

  return (
    <div className="founder-page">
      <PageHeader
        code={leadsSpec.code}
        title={t('founder.leads.title')}
        subtitle={t('founder.leads.desc')}
        breadcrumb={[{ label: t('founder.nav.home'), to: '/founder' }, { label: t('founder.leads.title') }]}
        actions={
          manage ? (
            <Button variant="primary" onClick={() => setFormOpen(true)}>
              {t('founder.leads.new')}
            </Button>
          ) : undefined
        }
      />

      <ul className="founder-stats founder-stats--compact">
        <li>
          <StatTile label={t('core.status.lead-new')} value={counts.new} glyph="◦" />
        </li>
        <li>
          <StatTile label={t('core.status.lead-qualified')} value={counts.qualified} glyph="◎" tone="info" />
        </li>
        <li>
          <StatTile label={t('core.status.proposal-sent')} value={counts.proposal} glyph="▤" tone="accent" />
        </li>
        <li>
          <StatTile label={t('core.status.contracted')} value={counts.contracted} glyph="✓" tone="success" />
        </li>
        <li>
          <StatTile label={t('founder.leads.conversion')} value={`${counts.conversion}%`} hint={t('founder.leads.conversionHint')} glyph="↗" tone={counts.conversion >= 20 ? 'success' : 'neutral'} />
        </li>
      </ul>

      <FilterBar onClear={clear} summary={t('founder.leads.summary', { n: filtered.length, total: leads.length })}>
        <SearchField value={query} onChange={setQuery} />
        <Select label={t('founder.common.status')} value={status} onChange={(e) => setStatus(e.target.value)} placeholder={t('founder.common.all')} options={statusOptions} />
        <Select label={t('founder.leads.channel')} value={channel} onChange={(e) => setChannel(e.target.value)} placeholder={t('founder.common.all')} options={channelOptions} />
        <Select label={t('founder.leads.service')} value={service} onChange={(e) => setService(e.target.value)} placeholder={t('founder.common.all')} options={serviceOptions} />
      </FilterBar>

      <DataTable<Lead>
        caption={t('founder.leads.title')}
        rows={filtered}
        rowKey={(l) => l.id}
        loading={loading}
        onRowActivate={openLead}
        emptyTitle={t('founder.leads.empty')}
        emptyDescription={t('founder.leads.emptyDesc')}
        columns={[
          { key: 'name', header: t('founder.leads.col.name'), sortable: true, render: (l) => l.name },
          { key: 'city', header: t('founder.leads.col.city'), sortable: true, render: (l) => l.city },
          { key: 'projectType', header: t('founder.common.type'), render: (l) => t(`founder.type.${l.projectType}`) },
          {
            key: 'requestedService',
            header: t('founder.leads.col.service'),
            render: (l) => (
              <span className="founder-badges">
                <Badge tone="neutral">{l.requestedService ?? '—'}</Badge>
                {l.suggestedService && l.suggestedService !== l.requestedService && <Badge tone="info">{t('founder.leads.suggests', { service: l.suggestedService })}</Badge>}
              </span>
            ),
          },
          { key: 'channel', header: t('founder.leads.channel'), render: (l) => pick(LEAD_CHANNELS.find((c) => c.id === l.channel)?.label ?? { en: l.channel }, lang) },
          { key: 'budgetCop', header: t('founder.common.budget'), align: 'end', sortable: true, sortValue: (l) => l.budgetCop ?? 0, render: (l) => (l.budgetCop === null ? '—' : formatCop(l.budgetCop, lang)) },
          { key: 'desiredStart', header: t('founder.leads.col.start'), render: (l) => formatDate(l.desiredStart, lang) },
          { key: 'ownerId', header: t('founder.common.owner'), render: (l) => ownerName(l.ownerId) },
          { key: 'status', header: t('founder.common.status'), render: (l) => <StatusPill status={l.status} /> },
          { key: 'source', header: t('founder.leads.col.source'), render: (l) => <Badge tone="neutral">{t(`core.status.${l.source}`)}</Badge> },
        ]}
      />

      {/* ------------------------------------------------------------- new lead */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={t('founder.leads.new')}
        size="lg"
        footer={
          <div className="founder-actions">
            <Button variant="primary" onClick={submitForm}>
              {t('founder.leads.save')}
            </Button>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              {t('founder.common.close')}
            </Button>
          </div>
        }
      >
        <form className="founder-form" onSubmit={(e) => { e.preventDefault(); void submitForm(); }}>
          <h3 className="founder-form__legend">{t('founder.leads.record')}</h3>
          <div className="founder-grid">
            <Input label={t('founder.leads.f.name')} value={draft.name} required onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <Input label={t('founder.leads.f.phone')} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            <Input label={t('founder.leads.f.email')} type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            <Input label={t('founder.leads.f.city')} value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
            <Select
              label={t('founder.leads.f.projectType')}
              value={draft.projectType}
              onChange={(e) => setDraft({ ...draft, projectType: e.target.value as LeadProjectType })}
              options={[...PROJECT_TYPES.map((v) => ({ value: v, label: t(`founder.type.${v}`) })), { value: 'other', label: t('founder.type.other') }]}
            />
            <Input label={t('founder.leads.f.areaM2')} inputMode="numeric" value={draft.areaM2} onChange={(e) => setDraft({ ...draft, areaM2: e.target.value })} />
            <Select
              label={t('founder.leads.f.projectStatus')}
              value={draft.projectStatus}
              onChange={(e) => setDraft({ ...draft, projectStatus: e.target.value })}
              placeholder={t('founder.common.none')}
              options={LEAD_PROJECT_STATUSES.map((v) => ({ value: v, label: t(`founder.leads.ps.${v}`) }))}
            />
          </div>

          <h3 className="founder-form__legend">{t('founder.leads.commercial')}</h3>
          <div className="founder-grid">
            <Select label={t('founder.leads.f.requestedService')} value={draft.requestedService} onChange={(e) => setDraft({ ...draft, requestedService: e.target.value })} placeholder={t('founder.common.none')} options={serviceOptions} />
            <Input label={t('founder.leads.f.budgetCop')} inputMode="numeric" hint={t('founder.leads.copHint')} value={draft.budgetCop} onChange={(e) => setDraft({ ...draft, budgetCop: e.target.value })} />
            <Input label={t('founder.leads.f.desiredStart')} type="date" value={draft.desiredStart} onChange={(e) => setDraft({ ...draft, desiredStart: e.target.value })} />
            <Select label={t('founder.leads.f.channel')} value={draft.channel} onChange={(e) => setDraft({ ...draft, channel: e.target.value as LeadChannelId })} options={channelOptions} />
            <Select label={t('founder.leads.f.ownerId')} value={draft.ownerId} onChange={(e) => setDraft({ ...draft, ownerId: e.target.value })} placeholder={t('founder.leads.unassigned')} options={ownerOptions} />
          </div>
          <Textarea label={t('founder.common.notes')} value={draft.notes} rows={3} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          <p className="founder-note">{t('founder.leads.sourceNote')}</p>
        </form>
      </Modal>

      {/* ------------------------------------------------------------- detail */}
      <Drawer
        open={open !== null}
        onClose={closeLead}
        title={open?.name ?? ''}
        footer={
          <div className="founder-actions">
            {open && manage && open.status === 'contracted' && open.projectId === null && (
              <Button variant="primary" onClick={() => void convert(open)}>
                {t('founder.leads.convert')}
              </Button>
            )}
            {open?.projectId && (
              <Button variant="secondary" onClick={() => navigate(`/founder/work/${open.projectId}`)}>
                {t('founder.leads.openWork')}
              </Button>
            )}
            <Button variant="secondary" onClick={closeLead}>
              {t('founder.common.close')}
            </Button>
          </div>
        }
      >
        {open && (
          <div className="founder-stack">
            <div className="founder-badges">
              <StatusPill status={open.status} />
              <Badge tone="neutral">{t(`core.status.${open.source}`)}</Badge>
              {open.projectId && <Badge tone="success">{t('founder.leads.hasProject')}</Badge>}
            </div>

            <KeyValue
              columns={1}
              items={[
                { key: t('founder.leads.f.phone'), value: open.phone ?? '—' },
                { key: t('founder.leads.f.email'), value: open.email || '—' },
                { key: t('founder.leads.f.city'), value: open.city },
                { key: t('founder.common.type'), value: t(`founder.type.${open.projectType}`) },
                { key: t('founder.leads.f.areaM2'), value: open.areaM2 === null ? '—' : `${open.areaM2} m²` },
                { key: t('founder.leads.f.projectStatus'), value: open.projectStatus ? t(`founder.leads.ps.${open.projectStatus}`) : '—' },
                { key: t('founder.leads.f.budgetCop'), value: open.budgetCop === null ? '—' : formatCop(open.budgetCop, lang) },
                { key: t('founder.leads.f.desiredStart'), value: formatDate(open.desiredStart, lang) },
                { key: t('founder.leads.f.channel'), value: pick(LEAD_CHANNELS.find((c) => c.id === open.channel)?.label ?? { en: open.channel }, lang) },
                { key: t('founder.leads.suggestedService'), value: serviceLabel(open.suggestedService) },
              ]}
            />

            {/* Service routing: routeService() suggests, the founder decides (G-10). */}
            <section className="founder-section">
              <h3>{t('founder.leads.routing')}</h3>
              <p className="founder-note">{t('founder.leads.routingNote')}</p>
              <div className="founder-actions">
                <Button variant="secondary" disabled={!manage} onClick={() => void suggest(open)}>
                  {t('founder.leads.suggest')}
                </Button>
              </div>
              {reason && <p className="founder-note">{t('founder.leads.reason', { reason })}</p>}
              <Select
                label={t('founder.leads.f.requestedService')}
                value={open.requestedService ?? ''}
                disabled={!manage}
                placeholder={t('founder.common.none')}
                options={serviceOptions}
                onChange={(e) => void setLeadService(open, e.target.value)}
              />
            </section>

            {/* Owner (G-01: every lead has one owner inside ALUZINA). */}
            <section className="founder-section">
              <h3>{t('founder.common.owner')}</h3>
              <Select
                label={t('founder.leads.f.ownerId')}
                hideLabel
                value={open.ownerId ?? ''}
                disabled={!manage}
                placeholder={t('founder.leads.unassigned')}
                options={ownerOptions}
                onChange={(e) => void assignOwner(open, e.target.value)}
              />
            </section>

            {/* Status: the first four of the 15-status architecture. */}
            <section className="founder-section">
              <h3>{t('founder.leads.status')}</h3>
              <Select
                label={t('founder.common.status')}
                hideLabel
                value={open.status}
                disabled={!manage}
                options={statusOptions}
                onChange={(e) => void advance(open, e.target.value)}
              />
              <div className="founder-actions">
                <Button variant="secondary" icon="◀" disabled={!manage || !prev} onClick={() => prev && void advance(open, prev)}>
                  {prev ? t(`core.status.${prev}`) : t('founder.leads.firstStatus')}
                </Button>
                <Button variant="secondary" iconEnd="▶" disabled={!manage || !next} onClick={() => next && void advance(open, next)}>
                  {next ? t(`core.status.${next}`) : t('founder.leads.lastStatus')}
                </Button>
              </div>
            </section>

            {/* The ten qualification questions (playbook p. 3). */}
            <section className="founder-section">
              <h3>{t('founder.leads.qualification')}</h3>
              {QUALIFICATION_QUESTIONS.map((q) =>
                q.options ? (
                  <Select
                    key={q.key}
                    label={pick(q.question, lang)}
                    value={answers[q.key] ?? ''}
                    disabled={!manage}
                    placeholder={t('founder.common.none')}
                    options={q.options.map((o) => ({ value: o.value, label: pick(o.label, lang) }))}
                    onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                  />
                ) : (
                  <Textarea
                    key={q.key}
                    label={pick(q.question, lang)}
                    rows={2}
                    value={answers[q.key] ?? ''}
                    disabled={!manage}
                    onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                  />
                ),
              )}
              <Textarea label={t('founder.common.notes')} rows={3} value={note} disabled={!manage} onChange={(e) => setNote(e.target.value)} />
              <div className="founder-actions">
                <Button variant="primary" disabled={!manage} onClick={() => void saveQualification(open)}>
                  {t('founder.leads.saveQualification')}
                </Button>
              </div>
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}
