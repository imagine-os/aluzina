import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { matchPath, useNavigate } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { useRoutes } from '../../app/RoutesContext';
import { useSession } from '../../auth/SessionProvider';
import { Button } from '../../components/atom/Button/Button';
import { Select } from '../../components/atom/Select/Select';
import { toast } from '../../components/atom/Toast/Toast';
import { useData, useTable } from '../../data/DataContext';
import type { EntityName } from '../../data/schema';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { DeskFace } from '../../desk/DeskObject';
import { PersonPortrait } from '../../desk/DeskPerson';
import { DeskStage } from '../../desk/DeskStage';
import { findItem } from '../../desk/layout';
import type { DeskModel } from '../../desk/types';
import { useDesk } from '../../desk/useDesk';
import { leadRef, loadWorkMats, sendToOtherDesk } from '../../desk/workmats';
import { coreStrings } from '../../i18n/core';
import { formatCop, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import type { RouteDef, Surface } from '../../specs/PageSpec';
import { demoUserById, demoUserForRole } from '../../tenant/auth/demoUsers';
import { hasPermission, rolesWith } from '../../tenant/auth/permissions';
import { roleForSurface } from '../../tenant/auth/roles';
import { lifecycleOf, pick } from '../../tenant/domain';
import { FLOW_ENTITIES, FLOW_RULES, buildLights, buildTrail, commsOf, moneyOf, phaseOfStatus, pipelineLabel, rowFields, shortName, type FlowCtx, type FlowEntity } from './deskFlow';
import type { DeskPerson } from './deskPeople';
import { findPhase, type DeskItem, type Mat, type PlacedItem } from './model';
import { playbookDeskModel } from './playbookDesk';
import { useProjectFlow } from './useProjectFlow';
import { DESK_CODE } from './specs';

/** One trail hop (the pulse's travel) and the pause on each stop while playing (D-105). */
const HOP_MS = 700;
const DWELL_MS = 650;
const LIFECYCLE_RANK = { active: 0, prospect: 1, past: 2 } as const;

/**
 * W-04 Method desk (prompt 0026, D-103). The client journey as ten felt mats on a desk; on each mat, sub-mats group
 * the phase's objects (statuses, forms, procedures, deliverables...), and every object is a small physical thing
 * (sheet, form, checklist, document, folder, box, token, card) whose top face previews its real content. Zoom and pan
 * are one transform on the world element, written through a ref and requestAnimationFrame while a gesture runs and
 * committed to React state when it ends (the percentage, `--desk-zoom`).
 */
export function DeskPage({ surface }: { surface: Surface }) {
  const { t, lang } = useT();
  const routes = useRoutes();
  const [selected, setSelected] = useState<string | null>(null);
  /** The phase whose person's drawer is open (people and objects share the one drawer). */
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const navigate = useNavigate();
  const data = useData();
  const { can, switchUser, user } = useSession();
  /** The followed project (light layer, D-105), the trail's current stop and whether it is playing. */
  const [follow, setFollow] = useState<string | null>(null);
  const [trailIdx, setTrailIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);

  const { rows: projects } = useTable('projects');
  const projectOptions = useMemo(
    () => [...projects].sort((a, b) => LIFECYCLE_RANK[lifecycleOf(a.pipelineStatus)] - LIFECYCLE_RANK[lifecycleOf(b.pipelineStatus)] || b.updated_at.localeCompare(a.updated_at) || a.name.localeCompare(b.name)),
    [projects],
  );
  const project = follow ? projects.find((p) => p.id === follow) : undefined;
  const flow = useProjectFlow(project ? project.id : null);
  const flowCtx = useMemo<FlowCtx | null>(() => {
    if (!project) return null;
    const suppliers = new Map(flow.suppliers.map((x) => [x.id, x.name]));
    return {
      project,
      current: phaseOfStatus(project.pipelineStatus),
      supplierName: (id) => (id ? suppliers.get(id) ?? id : '—'),
      personName: (id) => (id ? demoUserById(id)?.name.split(' ')[0] ?? id : '—'),
    };
  }, [project, flow.suppliers]);
  const lights = useMemo(() => (flowCtx ? buildLights(flow.rows, flowCtx) : []), [flow.rows, flowCtx]);
  const trail = useMemo(() => (flowCtx ? buildTrail(flow.rows, flow.activity, flowCtx, lights) : []), [flow.rows, flow.activity, flowCtx, lights]);
  const money = useMemo(() => moneyOf(flow.rows), [flow.rows]);
  const comms = useMemo(() => commsOf(flow.rows, project?.clientUserId ?? null), [flow.rows, project?.clientUserId]);
  const trailRef = useRef(trail);
  trailRef.current = trail;

  // The playbook desk (the module's desk model, D-106) plus the followed project's light tiles (D-105).
  const base = useMemo(() => playbookDeskModel(), []);
  const model = useMemo<DeskModel>(() => (lights.length ? { ...base, items: [...base.items, ...lights] } : base), [base, lights]);
  const people = base.people ?? [];
  const personByPhase = useMemo(() => new Map(people.map((p) => [p.phase as string, p])), [people]);

  const desk = useDesk({
    code: DESK_CODE,
    model,
    defaultSize: 'm',
    compactOpenByDefault: true,
    onOpenItem: (id) => openItem(id),
    onReset: () => {
      setSelected(null);
      setSelectedPerson(null);
    },
    onSpacePress: () => {
      if (project) togglePlay();
    },
    onKey: (e: KeyboardEvent<HTMLDivElement>) => {
      // The trail (D-105): [ and ] step when a project is followed (Space plays / pauses on release, see useDesk).
      if (!project || (e.key !== '[' && e.key !== ']')) return false;
      e.preventDefault();
      stepTrail(e.key === '[' ? -1 : 1);
      return true;
    },
  });
  const { layout, byId, api } = desk;

  const openItem = useCallback(
    (id: string) => {
      const item = byId.get(id);
      if (!item) return;
      setSelectedPerson(null);
      setSelected(id);
      api.flyToItem(item, 'open');
    },
    [byId, api],
  );

  const openPerson = useCallback(
    (phaseId: string) => {
      const m = api.flyToPerson(phaseId, 'open');
      if (!m) return undefined;
      setSelected(null);
      setSelectedPerson(phaseId);
      return m;
    },
    [api],
  );

  // ---------------------------------------------------------------- labels and actions

  const kindLabel = (k: string) => t(`desk.kind.${k}`);
  const phaseName = (m: Mat) => `${String(m.index + 1).padStart(2, '0')} ${pick(m.label, lang)}`;
  const itemLabel = (i: DeskItem) =>
    i.kind === 'light' && project
      ? t('desk.light.label', { kind: i.subtitle ? pick(i.subtitle, lang) : kindLabel(i.kind), title: pick(i.title, lang), project: project.name, facts: i.lines.map((l) => pick(l, lang)).join(', ') })
      : `${kindLabel(i.kind)}: ${pick(i.title, lang)}${i.code ? ` (${i.code})` : ''}`;
  const subLabel = (group: string) => (project && group === 'project' ? shortName(project.name) : project && group === 'projectComms' ? t('desk.group.projectComms', { name: shortName(project.name) }) : t(`desk.group.${group}`));
  const moreLabel = useCallback((n: number) => t('desk.more', { n }), [t]);
  const roleName = (p: DeskPerson) => pick(p.role.playbookRole, lang);
  const personLabel = (p: DeskPerson, m: Mat) => t('desk.person.label', { role: roleName(p), name: p.firstName ? ` (${p.firstName})` : '', phase: phaseName(m) });
  /** The portal a role works in, in the page language, or in English for the action answers (like `desk.openItem`). */
  const portalOf = useCallback(
    (p: DeskPerson, en = false) => {
      if (!p.portal) return en ? 'no portal role yet' : t('desk.person.noPortalRole');
      const entry = coreStrings[p.portal.portalKey];
      const name = en ? (typeof entry === 'string' ? entry : entry?.en ?? p.portal.portalKey) : t(p.portal.portalKey);
      return `${name} (#${p.portal.path})`;
    },
    [t],
  );
  /** The route that serves a path: the exact path first, then the patterns (`/studio/checklist/:projectId`). */
  const routeOf = useCallback((path: string): RouteDef | undefined => routes.find((x) => x.path === path) ?? routes.find((x) => x.path.includes(':') && matchPath({ path: x.path, end: true }, path)), [routes]);
  const whereOf = useCallback(
    (i: DeskItem) => {
      const r = routeOf(i.openAt.path);
      return r ? `${r.code} ${r.spec.name} (#${i.openAt.path})` : `#${i.openAt.path}`;
    },
    [routeOf],
  );

  /**
   * Opens a hub page for real (Part 1 of changelog 0035). When the current role lacks the route's permission, the
   * session switches to the demo user of the route's surface first, with the D-07 canvas toast (D-015).
   */
  const openPath = useCallback(
    (path: string) => {
      const route = routeOf(path);
      if (route?.permission && !can(route.permission)) {
        const own = roleForSurface(route.surface);
        const role = own && hasPermission(own, route.permission) ? own : rolesWith(route.permission)[0] ?? 'founder';
        switchUser(role);
        toast(t('desk.enterAs', { code: route.code, role: demoUserForRole(role)?.name ?? role }));
      }
      navigate(path);
      return route ? `opened ${route.code} (#${path})` : `opened #${path}`;
    },
    [routeOf, can, switchUser, navigate, t],
  );

  // ---------------------------------------------------------------- the light layer: follow, trail (D-105)

  const followProject = useCallback((id: string | null) => {
    setPlaying(false);
    setTrailIdx(-1);
    setSelected(null);
    setSelectedPerson(null);
    api.refitOnNextLayout();
    setFollow(id);
  }, [api]);

  const trailIdxRef = useRef(trailIdx);
  trailIdxRef.current = trailIdx;
  const playingRef = useRef(playing);
  playingRef.current = playing;

  const stepTrail = useCallback((dir: 1 | -1) => {
    const n = trailRef.current.length;
    if (n === 0) return -1;
    const i = trailIdxRef.current;
    const next = Math.max(0, Math.min(n - 1, i < 0 ? (dir === 1 ? 0 : n - 1) : i + dir));
    trailIdxRef.current = next;
    setTrailIdx(next);
    return next;
  }, []);

  const togglePlay = useCallback((force?: boolean) => {
    const n = trailRef.current.length;
    if (n === 0) return false;
    const now = force ?? !playingRef.current;
    playingRef.current = now;
    setPlaying(now);
    // Play from the start when the trail is over (or not started).
    const i = trailIdxRef.current;
    if (now && (i < 0 || i >= n - 1)) {
      trailIdxRef.current = 0;
      setTrailIdx(0);
    }
    return now;
  }, []);

  // Playing: one stop per hop + dwell; stops at the end. The pulse's travel is a CSS transform transition (700 ms).
  useEffect(() => {
    if (!playing) return;
    if (trailIdx >= trail.length - 1) {
      const done = window.setTimeout(() => setPlaying(false), HOP_MS);
      return () => window.clearTimeout(done);
    }
    const timer = window.setTimeout(() => setTrailIdx((i) => Math.min(trail.length - 1, i + 1)), desk.reduced ? DWELL_MS + 300 : HOP_MS + DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [playing, trailIdx, trail.length, desk.reduced]);

  // A trail that shrank (a row removed elsewhere) keeps a valid stop.
  useEffect(() => {
    if (trailIdx > trail.length - 1) setTrailIdx(trail.length - 1);
  }, [trail.length, trailIdx]);

  const findProject = useCallback(
    (q: string) => {
      const needle = q.trim().toLowerCase();
      if (!needle) return undefined;
      return projects.find((p) => p.id.toLowerCase() === needle) ?? projects.find((p) => p.name.toLowerCase() === needle) ?? projects.find((p) => p.name.toLowerCase().includes(needle) || p.client.toLowerCase().includes(needle));
    },
    [projects],
  );
  const eventText = useCallback((i: number) => {
    const e = trailRef.current[i];
    return e ? `event ${i + 1}/${trailRef.current.length} (${e.at.slice(0, 10)}, ${e.phase}): ${e.caption.en}` : 'no event';
  }, []);

  useRegisterActions({
    'desk.focusPhase': ({ phase: q }) => {
      const id = findPhase(String(q ?? ''));
      const m = id && api.fitMat(id);
      return m ? `showing the ${m.label.en} mat (${m.count} objects)` : `no phase "${String(q ?? '')}" (1-10 or ${layout.mats.map((x) => x.id).join(', ')})`;
    },
    'desk.focusItem': ({ item: q }) => {
      const found = findItem(layout.items, String(q ?? ''));
      const item = found && byId.get(found.id);
      if (!item) return `no object "${String(q ?? '')}" on the desk`;
      openItem(item.id);
      return `showing the ${item.kind} ${item.title.en} (${item.id}) on the ${item.phase} mat`;
    },
    'desk.focusPerson': ({ phase: q }) => {
      const id = findPhase(String(q ?? ''));
      const p = id && personByPhase.get(id);
      const m = p && openPerson(p.phase);
      if (!p || !m) return `no person on "${String(q ?? '')}" (1-10 or ${[...personByPhase.keys()].join(', ')})`;
      return `showing the ${p.role.playbookRole.en}${p.firstName ? ` (${p.firstName})` : ''} at the ${m.label.en} mat${p.inferred ? ' (inferred owner)' : ''}`;
    },
    'desk.openPersonPortal': ({ phase: q }) => {
      const id = findPhase(String(q ?? ''));
      const p = id && personByPhase.get(id);
      if (!p) return `no person on "${String(q ?? '')}"`;
      if (!p.portal) return `the ${p.role.playbookRole.en} has no portal role yet`;
      return openPath(p.portal.path);
    },
    'desk.openItem': ({ item: q }) => {
      const found = findItem(layout.items, String(q ?? ''));
      if (!found) return `no object "${String(q ?? '')}" on the desk`;
      return openPath(found.openAt.path);
    },
    'desk.followProject': ({ project: q }) => {
      const p = findProject(String(q ?? ''));
      if (!p) return `no project "${String(q ?? '')}" (ids: ${projectOptions.slice(0, 6).map((x) => x.id).join(', ')}…)`;
      followProject(p.id);
      return `following ${p.name} (${p.id}): status ${pipelineLabel(p.pipelineStatus).en} on the ${phaseOfStatus(p.pipelineStatus)} mat`;
    },
    'desk.clearProject': () => {
      if (!project) return 'no project followed';
      followProject(null);
      return `stopped following ${project.name}`;
    },
    'desk.playTrail': () => {
      if (!project) return 'follow a project first (desk.followProject)';
      if (!trailRef.current.length) return `no events for ${project.name}`;
      togglePlay(true);
      return `playing the trail of ${project.name} (${trailRef.current.length} events)`;
    },
    'desk.pauseTrail': () => {
      if (!project) return 'no project followed';
      togglePlay(false);
      return `trail paused at ${eventText(trailIdx)}`;
    },
    'desk.stepTrail': ({ dir }) => {
      if (!project) return 'follow a project first (desk.followProject)';
      if (dir !== 'prev' && dir !== 'next') return `dir must be prev or next, not "${String(dir)}"`;
      togglePlay(false);
      return eventText(stepTrail(dir === 'prev' ? -1 : 1));
    },
    'desk.sendToWorkMat': ({ object, mat }) => {
      // A lead of the followed project (its light tile, or the lead id) onto a work mat of the Leads desk (A-08, D-114).
      const q = String(object ?? '').trim();
      const tile = findItem(layout.items, q);
      const leadId = tile?.ref?.entity === 'leads' ? tile.ref.id : flow.rows.leads.find((l) => l.id === q || l.name.toLowerCase() === q.toLowerCase())?.id;
      if (!leadId) return `no lead "${q}" on the desk (follow its project first; lead tiles are on the Lead mat)`;
      return sendLead(leadId, mat ? String(mat) : undefined);
    },
    'desk.openRow': async ({ entity, id }) => {
      const name = String(entity ?? '') as FlowEntity;
      if (!(FLOW_ENTITIES as readonly string[]).includes(name)) return `no page for "${String(entity)}" (one of ${FLOW_ENTITIES.join(', ')})`;
      const row = (await data.get(name as EntityName, String(id ?? ''))) as { projectId?: string | null } | null;
      if (!row) return `no ${name} row "${String(id)}"`;
      return openPath(FLOW_RULES[name].openAt.replace(':projectId', row.projectId ?? project?.id ?? ''));
    },
  });

  const selectedItem = selected ? byId.get(selected) : undefined;
  /** The row behind a selected light tile (live: the drawer follows writes from other tabs). */
  const selectedRow = selectedItem?.ref ? (flow.rows[selectedItem.ref.entity as FlowEntity] as { id: string }[] | undefined)?.find((r) => r.id === selectedItem.ref?.id) : undefined;
  const currentPhase = project ? phaseOfStatus(project.pipelineStatus) : null;
  const currentIndex = currentPhase ? layout.mats.findIndex((m) => m.id === currentPhase) : -1;
  const glowToken = project ? `tok-pipeline-${project.pipelineStatus}` : null;
  const stop = trailIdx >= 0 ? trail[trailIdx] : undefined;
  /** Where the pulse is: the centre of the stop's object (world px), or of its mat when the object is not on the desk. */
  const pulseAt = useMemo(() => {
    if (!stop) return null;
    const it = byId.get(stop.target);
    if (it) return { x: it.x + it.cw / 2, y: it.y + it.ch / 2 };
    const m = layout.mats.find((x) => x.id === stop.phase);
    return m ? { x: m.x + m.w / 2, y: m.y + m.h / 2 } : null;
  }, [stop, byId, layout.mats]);
  const resolveField = (key: string, value: unknown): string | undefined => {
    if (typeof value !== 'string' || !flowCtx) return undefined;
    if (key === 'supplierId') return flowCtx.supplierName(value);
    if (/^(author|responsible|requestedBy|owner|actor|leadDesigner|clientUser)Id$/.test(key)) return flowCtx.personName(value);
    if (key === 'projectId') return project?.name;
    return undefined;
  };
  /** W-04's "Send to work mat" (D-114): the lead goes onto a work mat of A-08 for this person. */
  const sendLead = (leadId: string, matQ?: string) => {
    const lead = flow.rows.leads.find((l) => l.id === leadId);
    const mats = loadWorkMats('A-08', user.id).mats;
    const q = (matQ ?? '').trim().toLowerCase();
    const target = q ? mats.find((m, i) => m.id === q || m.name.toLowerCase() === q || String(i + 1) === q) : mats[0];
    if (q && !target) return `no work mat "${matQ}" on A-08 (${mats.map((m) => m.id).join(', ')})`;
    const r = sendToOtherDesk('A-08', user.id, leadRef(leadId), target?.id);
    const idx = mats.findIndex((m) => m.id === r.mat.id);
    const matName = r.mat.name || t('desk.workmat.default', { n: idx + 1 });
    toast(t(r.already ? 'desk.workmat.already' : 'desk.workmat.sentOther', { what: lead?.name ?? leadId, mat: matName, code: 'A-08' }));
    return `${r.already ? 'already on' : 'sent to'} ${matName} of A-08 at square ${r.col + 1}, ${r.row + 1}: ${lead?.name ?? leadId}`;
  };

  const lightDrawer = (i: PlacedItem) => {
    const entity = i.ref?.entity as FlowEntity | undefined;
    const rule = entity ? FLOW_RULES[entity] : undefined;
    const m = api.matById(i.phase);
    const fields = selectedRow ? rowFields(selectedRow as unknown as Record<string, unknown>, lang).map((f) => ({ key: f.key, value: resolveField(f.field, (selectedRow as unknown as Record<string, unknown>)[f.field]) ?? f.value })) : [];
    const route = routeOf(i.openAt.path);
    return (
      <div className="desk-drawer">
        {preview(i)}
        <KeyValue
          columns={1}
          items={[
            { key: t('desk.drawer.entity'), value: rule ? pick(rule.label, lang) : entity ?? '' },
            { key: t('desk.drawer.project'), value: project?.name ?? '' },
            { key: t('desk.drawer.phase'), value: m ? phaseName(m) : i.phase },
            { key: t('desk.drawer.page'), value: route ? `${route.code} ${route.spec.name}` : `#${i.openAt.path}` },
          ]}
        />
        {rule && (
          <>
            <h3 className="desk-drawer__h">{t('desk.drawer.rule')}</h3>
            <p className="desk-drawer__why">{pick(rule.rationale, lang)}</p>
          </>
        )}
        {entity === 'leads' && selectedRow && (
          <>
            <h3 className="desk-drawer__h">{t('desk.workmat.title')}</h3>
            <p className="desk-drawer__why">{t('desk.workmat.fromW04')}</p>
            <div className="desk-dossier-drawer">
              <Button size="sm" onClick={() => sendLead(selectedRow.id)} data-ability="desk.sendToWorkMat">
                {t('desk.workmat.sendHere')}
              </Button>
            </div>
          </>
        )}
        <h3 className="desk-drawer__h">{t('desk.drawer.fields', { n: fields.length })}</h3>
        {selectedRow ? <KeyValue columns={1} items={fields} /> : <p className="desk-drawer__why">{t('desk.drawer.gone')}</p>}
      </div>
    );
  };
  const selectedPersonData = selectedPerson ? personByPhase.get(selectedPerson) : undefined;
  const drawerSide = desk.size.w >= 768 || window.innerWidth >= 768 ? 'right' : 'bottom';
  const kv = (i: PlacedItem) => {
    const m = api.matById(i.phase);
    return [
      { key: t('desk.drawer.kind'), value: kindLabel(i.kind) },
      { key: t('desk.drawer.phase'), value: m ? phaseName(m) : i.phase },
      { key: t('desk.drawer.group'), value: t(`desk.group.${i.group}`) },
      { key: t('desk.drawer.source'), value: t(`desk.source.${i.source}`) },
      ...(i.code ? [{ key: t('desk.drawer.code'), value: i.code }] : []),
      { key: t('desk.drawer.id'), value: i.id },
    ];
  };

  /** The drawer's large preview: the same face markup at a larger base font size (every inner size is em). */
  const preview = (i: PlacedItem) => <DeskFace item={i} lang={lang} box={380} moreLabel={moreLabel} />;

  /** The person's drawer: portrait, role facts, responsibilities, why this phase, and every phase the role owns. */
  const personDrawer = (p: DeskPerson) => {
    const owned = people.filter((x) => x.role.id === p.role.id);
    const m = api.matById(p.phase);
    return (
      <div className="desk-drawer">
        <PersonPortrait person={p} lang={lang} />
        <KeyValue
          columns={1}
          items={[
            { key: t('desk.person.role'), value: roleName(p) },
            { key: t('desk.person.portalRole'), value: p.roleId ? t(`core.role.${p.roleId}`) : t('desk.person.noPortalRole') },
            ...(p.firstName ? [{ key: t('desk.person.person'), value: p.firstName }] : []),
            { key: t('desk.drawer.phase'), value: m ? phaseName(m) : p.phase },
            { key: t('desk.person.basis'), value: t(`desk.person.basis.${p.basis}`) },
          ]}
        />
        <h3 className="desk-drawer__h">{t('desk.person.why')}</h3>
        <p className="desk-drawer__why">{pick(p.rationale, lang)}</p>
        <h3 className="desk-drawer__h">{t('desk.person.responsibilities')}</h3>
        <p className="desk-drawer__why">{pick(p.role.note, lang)}</p>
        <h3 className="desk-drawer__h">{t('desk.person.phases', { n: owned.length })}</h3>
        <ol className="desk-drawer__list">
          {owned.map((x) => {
            const xm = api.matById(x.phase);
            return (
              <li key={x.phase}>
                {xm ? phaseName(xm) : x.phase}
                {x.inferred ? ` (${t('desk.person.inferred')})` : ''}
              </li>
            );
          })}
        </ol>
      </div>
    );
  };

  const home = `/${surface}`;
  const lightToolbar = (
    <div className="desk-toolbar desk-toolbar--light" role="toolbar" aria-label={t('desk.lightToolbar')}>
      <Select
        label={t('desk.followLabel')}
        hideLabel
        className="desk-toolbar__project"
        value={follow ?? ''}
        placeholder={t('desk.follow')}
        onChange={(e) => followProject(e.target.value || null)}
        options={projectOptions.map((p) => ({ value: p.id, label: t('desk.followOption', { name: p.name, status: pick(pipelineLabel(p.pipelineStatus), lang) }) }))}
      />
      {project && (
        <>
          <Button size="sm" variant="ghost" onClick={() => followProject(null)}>
            {t('desk.clear')}
          </Button>
          <span className="desk-toolbar__trail">
            <Button size="sm" icon="‹" aria-label={t('desk.prev')} disabled={trail.length === 0} onClick={() => (togglePlay(false), stepTrail(-1))} />
            <Button size="sm" variant="primary" aria-pressed={playing} disabled={trail.length === 0} onClick={() => togglePlay()}>
              {playing ? t('desk.pause') : t('desk.play')}
            </Button>
            <Button size="sm" icon="›" aria-label={t('desk.next')} disabled={trail.length === 0} onClick={() => (togglePlay(false), stepTrail(1))} />
          </span>
        </>
      )}
    </div>
  );
  const trailCaption = project && (
    <p className="desk-trail" aria-live="polite">
      {stop
        ? t('desk.trail.step', { i: trailIdx + 1, n: trail.length, date: formatDate(stop.at, lang), phase: (() => { const m = api.matById(stop.phase); return m ? phaseName(m) : stop.phase; })(), caption: pick(stop.caption, lang) })
        : trail.length
          ? t('desk.trail.idle', { n: trail.length, name: project.name, lights: lights.length })
          : t('desk.trail.empty', { name: project.name })}
    </p>
  );
  const rail = project && (
    <section className={`desk-strip${desk.tilt ? ' is-tilted' : ''}`} aria-label={t('desk.strip.label', { name: project.name })} data-desk-strip="">
      <div className="desk-strip__cell desk-strip__cell--name">
        <span className="desk-strip__k">{t('desk.strip.following')}</span>
        <span className="desk-strip__v">{project.name}</span>
        <span className="desk-strip__s">{t('desk.strip.status', { status: pick(pipelineLabel(project.pipelineStatus), lang), phase: currentIndex >= 0 ? phaseName(layout.mats[currentIndex]) : '' })}</span>
      </div>
      <div className="desk-strip__cell">
        <span className="desk-strip__k">{t('desk.money.quoted')}</span>
        <span className="desk-strip__v">{formatCop(money.quoted, lang)}</span>
        <span className="desk-strip__s">{t('desk.money.quotedSub', { n: flow.rows.quotes.length, g: new Set(flow.rows.quotes.map((q) => q.comparisonGroup)).size })}</span>
      </div>
      <div className="desk-strip__cell">
        <span className="desk-strip__k">{t('desk.money.approved')}</span>
        <span className="desk-strip__v">{formatCop(money.approved, lang)}</span>
        <span className="desk-strip__s">{t('desk.money.approvedSub', { p: flow.rows.purchases.filter((x) => x.status !== 'quoted').length, c: flow.rows.changeOrders.filter((x) => x.status === 'approved' || x.status === 'executed').length })}</span>
      </div>
      <div className="desk-strip__cell">
        <span className="desk-strip__k">{t('desk.money.paid')}</span>
        <span className="desk-strip__v">{formatCop(money.paid, lang)}</span>
        <span className="desk-strip__s">{t('desk.money.split', { in: formatCop(money.paidIn, lang), out: formatCop(money.paidOut, lang) })}</span>
      </div>
      <div className="desk-strip__cell">
        <span className="desk-strip__k">{t('desk.money.outstanding')}</span>
        <span className="desk-strip__v">{formatCop(money.outstanding, lang)}</span>
        <span className="desk-strip__s">{t('desk.money.split', { in: formatCop(money.outstandingIn, lang), out: formatCop(money.outstandingOut, lang) })}</span>
      </div>
      <div className="desk-strip__cell desk-strip__cell--comms">
        <span className="desk-strip__k">{t('desk.comms.title')}</span>
        <span className="desk-strip__v">{t(comms.messages === 1 ? 'desk.comms.messages.one' : 'desk.comms.messages', { n: comms.messages })}</span>
        <span className="desk-strip__s">
          {t('desk.comms.sub', { c: comms.fromClient, t: comms.fromTeam, m: comms.meetings })}
          {comms.leadChannels.length > 0 && t('desk.comms.lead', { ch: comms.leadChannels.map((c) => pick(c, lang)).join(', ') })}
        </span>
      </div>
    </section>
  );
  const groupName = (g: string) => (g === 'project' || g === 'projectComms' ? subLabel(g) : t(`desk.group.${g}`));

  return (
    <div className="desk-page">
      <PageHeader
        code={DESK_CODE}
        title={t('desk.title')}
        subtitle={t('desk.subtitle', { items: layout.items.length - lights.length, people: layout.mats.filter((m) => m.person).length, mats: layout.mats.length })}
        breadcrumb={[{ label: t(`core.portal.${surface}`), to: surface === 'dev' ? '/dev/components' : home }, { label: t('desk.title') }]}
      />

      <DeskStage
        desk={desk}
        stageLabel={t('desk.stage')}
        hint={t('desk.hint')}
        matName={phaseName}
        matAria={(m) => t('desk.matLabel', { name: phaseName(m), n: m.count })}
        matCount={(m) => (m.lights ? t('desk.objectsLights', { n: m.count, l: m.lights }) : t('desk.objects', { n: m.count }))}
        matClass={(m) => (currentIndex >= 0 ? (m.index === currentIndex ? ' is-now' : m.index < currentIndex ? ' is-done' : '') : '')}
        matSelectPlaceholder={t('desk.goToPhase')}
        subLabel={(s) => subLabel(s.group)}
        itemLabel={itemLabel}
        tipOf={(i) => ({ title: pick(i.title, lang), meta: t('desk.tip', { kind: i.kind === 'light' && i.subtitle ? pick(i.subtitle, lang) : kindLabel(i.kind), entity: groupName(i.group) }) })}
        glowId={glowToken}
        litId={stop?.target ?? null}
        selected={selected}
        personLabel={personLabel}
        selectedPerson={selectedPerson}
        onActivatePerson={openPerson}
        toolbarExtra={lightToolbar}
        aboveStage={trailCaption}
        belowStage={rail}
        worldOverlay={project && pulseAt ? <span className="desk-pulse" aria-hidden="true" style={{ transform: `translate3d(${pulseAt.x}px, ${pulseAt.y}px, var(--z-pulse))` }} /> : null}
        stageClass={project ? 'has-rail' : ''}
        compactSummary={t('desk.compact', { objects: layout.items.length - lights.length, mats: layout.mats.length })}
        grouping={pick(model.grouping ?? { en: '' }, lang)}
      />

      <Drawer
        open={Boolean(selectedItem ?? selectedPersonData)}
        onClose={() => {
          setSelected(null);
          setSelectedPerson(null);
        }}
        side={drawerSide}
        title={selectedItem ? pick(selectedItem.title, lang) : selectedPersonData ? roleName(selectedPersonData) : ''}
        footer={
          selectedPersonData && !selectedItem ? (
            selectedPersonData.portal && (
              <Button variant="primary" icon="↗" title={t('desk.person.openPortalWhat', { where: portalOf(selectedPersonData) })} onClick={() => selectedPersonData.portal && openPath(selectedPersonData.portal.path)}>
                {t('desk.person.openPortal')}
              </Button>
            )
          ) : (
            selectedItem && (
              <Button variant="primary" icon="↗" title={t('desk.drawer.openWhat', { where: whereOf(selectedItem) })} onClick={() => openPath(selectedItem.openAt.path)}>
                {t('desk.drawer.open')}
              </Button>
            )
          )
        }
      >
        {selectedPersonData && !selectedItem && personDrawer(selectedPersonData)}
        {selectedItem?.kind === 'light' && lightDrawer(selectedItem)}
        {selectedItem && selectedItem.kind !== 'light' && (
          <div className="desk-drawer">
            {preview(selectedItem)}
            <KeyValue columns={1} items={kv(selectedItem)} />
            {selectedItem.lines.length > 0 && (
              <>
                <h3 className="desk-drawer__h">{t('desk.drawer.contents', { n: selectedItem.lines.length })}</h3>
                <ol className="desk-drawer__list">
                  {selectedItem.lines.map((line, i) => (
                    <li key={i}>{pick(line, lang)}</li>
                  ))}
                </ol>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

