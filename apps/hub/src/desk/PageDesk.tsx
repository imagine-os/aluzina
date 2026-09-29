import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { matchPath, useLocation, useNavigate, useParams } from 'react-router-dom';
import { runAction, useRegisterActions } from '../actions';
import { useRoutes } from '../app/RoutesContext';
import { useSession } from '../auth/SessionProvider';
import { Button } from '../components/atom/Button/Button';
import { Select } from '../components/atom/Select/Select';
import { STATUS_TONES } from '../components/atom/StatusPill/StatusPill';
import { toast } from '../components/atom/Toast/Toast';
import { KeyValue } from '../components/molecule/KeyValue/KeyValue';
import { Drawer } from '../components/organism/Drawer/Drawer';
import { useData } from '../data/DataContext';
import { ENTITIES, type EntityName } from '../data/schema';
import { formatCop, formatDate } from '../i18n/format';
import { useT } from '../i18n/I18nProvider';
import type { ActionDef, RouteDef } from '../specs/PageSpec';
import { pick, type StatusTone, type Text } from '../tenant/domain';
import { DeskFace } from './DeskObject';
import { DeskStage } from './DeskStage';
import { ENTITY_RULES, PILL_FIELDS, titleOfRow, type EntityRule } from './entities';
import { fieldLabel, rowFields, valueLabel } from './fields';
import { findItem } from './layout';
import { deskStrings } from './strings';
import type { DeskItem, DeskModel, PlacedItem } from './types';
import { useDesk } from './useDesk';

type Row = Record<string, unknown> & { id: string };
type Rows = Record<string, Row[]>;

/** At most this many mats on a page desk (largest tables first, after the page's own). */
export const MAX_MATS = 6;
/** Objects shown per sub-mat before the "+N more" stack, and per mat. */
export const CAP_PER_SUB = 12;
export const CAP_PER_MAT = 40;
/** Face font per kind on page desks: a row carries 3-5 short lines, so its face text is larger than a playbook form's. */
const ROW_FONT: Partial<Record<DeskItem['kind'], number>> = { card: 3.3, sheet: 3, document: 3, checklist: 3, folder: 3.7, box: 3.7, token: 3.6 };
/** Full faces per desk; objects past it render a plain tile (D-106, performance). */
export const FACE_BUDGET = 200;

const txt = (key: string): Text => {
  const e = deskStrings[key];
  return typeof e === 'string' ? { en: e, es: e } : { en: e?.en ?? key, es: e?.es ?? e?.en ?? key };
};
const both = (f: (l: 'en' | 'es') => string): Text => ({ en: f('en'), es: f('es') });

/** The entities a page desk lays out: known, not a log or join table, in the spec's order. */
export function deskEntities(dataTables: readonly string[]): EntityName[] {
  return dataTables.filter((e): e is EntityName => (ENTITIES as readonly string[]).includes(e) && !ENTITY_RULES[e as EntityName].meta);
}

/** URL params -> which rows belong to the page (`/work/:projectId`, `/spaces/:spaceId`, `/spaces/post/:postId`). */
export function scopeRows(rows: Rows, params: Record<string, string | undefined>): Rows {
  const out: Rows = {};
  const { projectId, spaceId, postId } = params;
  for (const [entity, list] of Object.entries(rows)) {
    let l = list;
    if (projectId) {
      if (entity === 'projects') l = l.filter((r) => r.id === projectId);
      else if (l.some((r) => 'projectId' in r)) l = l.filter((r) => r.projectId === projectId);
    }
    if (spaceId && entity === 'spaces') l = l.filter((r) => r.id === spaceId || r.parentId === spaceId);
    if (postId && entity === 'posts') l = l.filter((r) => r.id === postId);
    out[entity] = l;
  }
  return out;
}

/** Status-like value of a row for its entity's grouping field ('' when unset). */
const groupValue = (row: Row, rule: EntityRule) => (rule.group ? String(row[rule.group] ?? '') : '');

/**
 * The generic page desk model (D-106): one mat per entity of `spec.dataTables` with rows (the page's own entity first,
 * then the largest; at most 6), sub-mats by the entity's grouping field (`ENTITY_RULES`), objects = rows with real
 * fields on their faces, capped per sub-mat with a "+N more" stack, plain tiles past the face budget.
 */
export function buildPageDesk(route: RouteDef, rows: Rows, openFor: (entity: EntityName, row: Row) => string): DeskModel {
  const candidates = deskEntities(route.spec.dataTables).filter((e) => (rows[e]?.length ?? 0) > 0);
  const [own, ...rest] = candidates;
  const chosen = own ? [own, ...rest.sort((a, b) => (rows[b]?.length ?? 0) - (rows[a]?.length ?? 0))].slice(0, MAX_MATS) : [];
  const items: DeskItem[] = [];
  const mats: DeskModel['mats'] = [];
  const fields = new Set<string>();
  let faces = 0;
  for (const entity of chosen) {
    const rule = ENTITY_RULES[entity];
    const list = [...(rows[entity] ?? [])].sort((a, b) => String(b.updated_at ?? '').localeCompare(String(a.updated_at ?? '')));
    const counts = new Map<string, number>();
    for (const r of list) counts.set(groupValue(r, rule), (counts.get(groupValue(r, rule)) ?? 0) + 1);
    const order = rule.order ?? [];
    const groups = [...counts.keys()].sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) || (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b);
    });
    if (rule.group) fields.add(rule.group);
    const subLabels: Record<string, Text> = {};
    let onMat = 0;
    for (const g of groups) {
      // Prefixed so a value never collides with W-04's own sub-mat classes (`project`, `rules`).
      const key = `v-${g || 'none'}`;
      subLabels[key] = !rule.group ? txt('desk.grouped.all') : g ? (rule.group === 'board' ? { en: g, es: g } : valueLabel(g)) : txt('desk.value.none');
      const inGroup = list.filter((r) => groupValue(r, rule) === g);
      const room = Math.max(1, Math.min(CAP_PER_SUB, CAP_PER_MAT - onMat));
      const shown = inGroup.length > room ? inGroup.slice(0, room - 1) : inGroup;
      for (const row of shown) {
        items.push(rowItem(entity, rule, row, key, openFor(entity, row), faces >= FACE_BUDGET));
        faces++;
      }
      onMat += shown.length;
      const hidden = inGroup.length - shown.length;
      if (hidden > 0) {
        items.push({
          id: `${entity}:more:${key}`,
          kind: 'stack',
          phase: entity,
          group: key,
          source: 'row',
          title: both((l) => (l === 'es' ? `${pick(rule.many, l).toLowerCase()} más` : `more ${pick(rule.many, l).toLowerCase()}`)),
          lines: [],
          more: hidden,
          openAt: { path: '' },
          ref: { entity, id: '' },
        });
        onMat++;
      }
    }
    mats.push({ id: entity, label: rule.many, subLabels });
  }
  const fieldList = [...fields];
  const grouping: Text =
    fieldList.length === 0
      ? txt('desk.grouped.none')
      : fieldList.every((f) => f === 'status' || f === 'pipelineStatus')
        ? txt('desk.grouped.status')
        : both((l) => pick(txt('desk.grouped.mixed'), l).replace('{fields}', [...new Set(fieldList.map((f) => (f === 'pipelineStatus' || f === 'status' ? (l === 'es' ? 'estado' : 'status') : fieldLabel(f, l).toLowerCase())))].join(' / ')));
  return { code: route.code, mats, items, grouping };
}

function rowItem(entity: EntityName, rule: EntityRule, row: Row, group: string, openAt: string, plain: boolean): DeskItem {
  const lines: Text[] = [];
  const amount = rule.amount ? row[rule.amount] : undefined;
  if (typeof amount === 'number') lines.push(both((l) => formatCop(amount, l)));
  const date = rule.date ? row[rule.date] : undefined;
  if (typeof date === 'string' && date) lines.push(both((l) => formatDate(date, l)));
  for (const f of rule.lines ?? []) {
    const v = row[f];
    if (v === null || v === undefined || v === '') continue;
    if (typeof v === 'string') lines.push(/^(kind|status|priority|severity|phase|audience|channel)$/.test(f) ? valueLabel(v) : { en: v.length > 60 ? `${v.slice(0, 59)}…` : v, es: v.length > 60 ? `${v.slice(0, 59)}…` : v });
    else if (typeof v === 'number') lines.push({ en: String(v), es: String(v) });
  }
  const pillField = PILL_FIELDS.find((f) => typeof row[f] === 'string' && row[f]);
  const pillValue = pillField ? String(row[pillField]) : '';
  const tone = (STATUS_TONES[pillValue] ?? 'neutral') as StatusTone;
  const code = rule.kind === 'folder' ? String(row.serviceCode ?? row.glyph ?? '') || undefined : undefined;
  return {
    id: `${entity}:${row.id}`,
    kind: rule.kind,
    phase: entity,
    group,
    source: 'row',
    code,
    title: both((l) => titleOfRow(row, rule, l)),
    subtitle: rule.one,
    lines,
    pill: pillValue ? { label: valueLabel(pillValue), tone } : undefined,
    tone: entity === 'tags' ? ((row.tone as StatusTone) ?? 'neutral') : tone,
    openAt: { path: openAt },
    ref: { entity, id: row.id },
    plain,
    font: ROW_FONT[rule.kind],
  };
}

/** Actions of the page that act on one row of this entity: an id param named after it, or its noun in the action id. */
export function abilitiesFor(actions: readonly ActionDef[], entity: EntityName): { action: ActionDef; param: string }[] {
  const rule = ENTITY_RULES[entity];
  const noun = rule.noun.toLowerCase();
  const names = new Set([noun, `${noun}id`, entity.toLowerCase(), entity.toLowerCase().replace(/s$/, '')]);
  return actions
    .filter((a) => !a.id.startsWith('desk.'))
    .flatMap((a) => {
      const params = Object.entries(a.params ?? {});
      const byParam = params.find(([k, type]) => type === 'id' && names.has(k.toLowerCase()));
      if (byParam) return [{ action: a, param: byParam[0] }];
      // The noun in the verb counts only when the action takes an id (`ops.advancePurchase {purchase}`); without one
      // it acts on the page, not on a row (`founder.newLead`).
      const verb = a.id.split('.')[1]?.toLowerCase() ?? '';
      const idParam = params.find(([, type]) => type === 'id');
      if (verb.includes(noun) && idParam) return [{ action: a, param: idParam[0] }];
      return [];
    });
}

/** Live rows of several entities in one subscription (a page desk reads up to six tables). */
function useEntityRows(entities: readonly EntityName[]): { rows: Rows; loading: boolean } {
  const data = useData();
  const [rows, setRows] = useState<Rows>({});
  const [loading, setLoading] = useState(true);
  const key = entities.join('|');
  useEffect(() => {
    let alive = true;
    let timer = 0;
    const list = key ? (key.split('|') as EntityName[]) : [];
    const load = () =>
      Promise.all(list.map((e) => data.list(e))).then((lists) => {
        if (!alive) return;
        const next: Rows = {};
        list.forEach((e, i) => (next[e] = lists[i] as unknown as Row[]));
        setRows(next);
        setLoading(false);
      });
    void load();
    const offs = list.map((e) =>
      data.subscribe(e, () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => void load(), 60);
      }),
    );
    return () => {
      alive = false;
      window.clearTimeout(timer);
      offs.forEach((off) => off());
    };
  }, [data, key]);
  return { rows, loading };
}

/**
 * The desk above every portal page (D-106), mounted by the DesktopShell: the page's tables as mats, their rows as
 * objects grouped by status, each object's drawer listing its fields and the page's own actions on it (its
 * abilities). The page itself renders unchanged below.
 */
export function PageDesk({ route }: { route: RouteDef }) {
  const { t, lang } = useT();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const routes = useRoutes();
  const { can } = useSession();
  const entities = useMemo(() => deskEntities(route.spec.dataTables), [route.spec.dataTables]);
  const { rows, loading } = useEntityRows(entities);
  const scoped = useMemo(() => scopeRows(rows, params), [rows, params]);

  /** The page's own detail route for a row (`/founder/work/:projectId` from W-01), else the page itself. */
  const detailFor = useMemo(() => {
    const prefix = `${route.path.replace(/\/:.*$/, '')}/`;
    const candidates = routes.filter((r) => r.surface === route.surface && r.path !== route.path && r.path.startsWith(prefix) && (r.path.match(/:/g) ?? []).length === 1);
    const PARAM_ENTITY: Record<string, EntityName> = { projectId: 'projects', spaceId: 'spaces', postId: 'posts' };
    return (entity: EntityName, row: Row): string => {
      const hit = candidates
        .filter((r) => {
          const p = r.path.match(/:(\w+)/)?.[1] ?? '';
          return PARAM_ENTITY[p] === entity;
        })
        .sort((a, b) => a.path.length - b.path.length)[0];
      return hit ? hit.path.replace(/:\w+/, row.id) : location.pathname;
    };
  }, [routes, route.path, route.surface, location.pathname]);

  const model = useMemo(() => (route.desk?.build ? route.desk.build({ route, params, rows: scoped }) : buildPageDesk(route, scoped, detailFor)), [route, params, scoped, detailFor]);

  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const desk = useDesk({
    code: route.code,
    model,
    defaultSize: 's',
    compactOpenByDefault: false,
    onOpenItem: (id) => openItem(id),
    onReset: () => setSelected(null),
  });
  const { layout, byId, api } = desk;

  const openItem = useCallback(
    (id: string) => {
      const item = byId.get(id);
      if (!item) return undefined;
      if (item.kind === 'stack') {
        // The pile stands for the rows this sub-mat does not show: they are on the page below.
        showBelow();
        return item;
      }
      setSelected(id);
      api.flyToItem(item, 'open');
      return item;
    },
    [byId, api],
  );

  const showBelow = () => {
    setSelected(null);
    const el = document.getElementById('desk-after');
    el?.scrollIntoView({ behavior: desk.reduced ? 'auto' : 'smooth', block: 'start' });
    el?.focus({ preventScroll: true });
  };

  const rowOf = (item: PlacedItem | undefined): Row | undefined => (item?.ref ? scoped[item.ref.entity]?.find((r) => r.id === item.ref?.id) : undefined);
  const kindLabel = (k: string) => t(`desk.kind.${k}`);
  const entityOf = (i: DeskItem) => (i.ref ? ENTITY_RULES[i.ref.entity as EntityName] : undefined);
  const subName = (matId: string, group: string) => {
    const def = model.mats.find((m) => m.id === matId);
    const l = def?.subLabels?.[group];
    return l ? pick(l, lang) : group;
  };
  const itemLabel = (i: PlacedItem) => {
    if (i.kind === 'stack') return `${t('desk.more', { n: i.more ?? 0 })} ${pick(i.title, lang)}: ${t('desk.drawer.showBelow')}`;
    const e = entityOf(i);
    return t('desk.object.label', { kind: kindLabel(i.kind), title: pick(i.title, lang), entity: e ? pick(e.one, lang) : '', status: i.pill ? ` · ${pick(i.pill.label, lang)}` : '' });
  };
  const tipOf = (i: PlacedItem) => {
    const e = entityOf(i);
    if (i.kind === 'stack') return { title: t('desk.more', { n: i.more ?? 0 }), meta: `${kindLabel('stack')} · ${pick(i.title, lang)}` };
    return { title: pick(i.title, lang), meta: t('desk.tip', { kind: kindLabel(i.kind), entity: `${e ? pick(e.one, lang) : ''}${i.pill ? ` · ${pick(i.pill.label, lang)}` : ''}` }) };
  };

  const selectedItem = selected ? byId.get(selected) : undefined;
  const selectedRow = rowOf(selectedItem);
  const selectedEntity = selectedItem?.ref?.entity as EntityName | undefined;
  const abilities = selectedEntity ? abilitiesFor(route.spec.actions, selectedEntity) : [];
  const pageOf = (path: string) => {
    const r = routes.find((x) => x.path === path) ?? routes.find((x) => x.path.includes(':') && matchPath({ path: x.path, end: true }, path));
    return r ? `${r.code} ${r.spec.name}` : `#${path}`;
  };

  // The object verbs of the page desk (the camera verbs are registered by useDesk).
  useRegisterActions({
    'desk.focusMat': ({ mat }) => {
      const q = String(mat ?? '').trim().toLowerCase();
      const m = layout.mats.find((x) => x.id.toLowerCase() === q || pick(x.label, 'en').toLowerCase() === q || pick(x.label, 'es').toLowerCase() === q || String(x.index + 1) === q) ?? layout.mats.find((x) => pick(x.label, 'en').toLowerCase().includes(q));
      if (!m) return `no mat "${String(mat ?? '')}" (${layout.mats.map((x) => x.id).join(', ') || 'this desk is empty'})`;
      api.fitMat(m.id);
      return `showing the ${m.label.en} mat (${m.count} objects)`;
    },
    'desk.focusObject': ({ object }) => {
      const it = findItem(layout.items, String(object ?? ''));
      if (!it) return `no object "${String(object ?? '')}" on the desk`;
      api.flyToItem(it, 'zoom');
      return `showing the ${it.kind} ${it.title.en} (${it.ref?.entity ?? ''} ${it.ref?.id ?? ''})`;
    },
    'desk.openObject': ({ object }) => {
      const it = findItem(layout.items, String(object ?? ''));
      if (!it) return `no object "${String(object ?? '')}" on the desk`;
      openItem(it.id);
      const n = it.ref ? abilitiesFor(route.spec.actions, it.ref.entity as EntityName).length : 0;
      return it.kind === 'stack' ? `${it.more} more rows are on the page below` : `opened the ${it.kind} ${it.title.en}: ${n} abilities`;
    },
  });

  const objects = layout.items.reduce((n, i) => n + (i.kind === 'stack' ? i.more ?? 0 : 1), 0);
  const grouping = pick(model.grouping ?? txt('desk.grouped.none'), lang);
  const summary = t('desk.page.summary', { objects, mats: layout.mats.length, grouping: grouping.charAt(0).toLowerCase() + grouping.slice(1) });

  if (!loading && layout.mats.length === 0) {
    return (
      <section className="desk-pagedesk desk-pagedesk--empty" aria-label={t('desk.page.stage', { page: route.spec.name })}>
        <p className="desk-compact__text">{t('desk.page.empty')}</p>
      </section>
    );
  }

  return (
    <section className="desk-pagedesk" aria-label={t('desk.page.stage', { page: route.spec.name })} data-page-desk={route.code}>
      <DeskStage
        desk={desk}
        title={
          <>
            <span className="desk-toolbar__name">{t('desk.page.title')}</span>
            <span className="desk-toolbar__summary">{loading ? t('desk.page.loading') : summary}</span>
          </>
        }
        stageLabel={t('desk.page.stage', { page: route.spec.name })}
        hint={t('desk.hint.page')}
        matName={(m) => pick(m.label, lang)}
        matAria={(m) => t('desk.matLabel.generic', { name: pick(m.label, lang), n: m.count })}
        matCount={(m) => t('desk.objects', { n: m.count })}
        matSelectPlaceholder={t('desk.goToMat')}
        subLabel={(s, m) => subName(m.id, s.group)}
        itemLabel={itemLabel}
        tipOf={tipOf}
        selected={selected}
        compactSummary={t('desk.compact', { objects, mats: layout.mats.length })}
        grouping={grouping}
      />
      <Drawer
        open={Boolean(selectedItem)}
        onClose={() => setSelected(null)}
        side={desk.size.w >= 768 || window.innerWidth >= 768 ? 'right' : 'bottom'}
        title={selectedItem ? pick(selectedItem.title, lang) : ''}
        footer={
          selectedItem && (
            <>
              {selectedItem.openAt.path && selectedItem.openAt.path !== location.pathname ? (
                <Button variant="primary" icon="↗" title={t('desk.drawer.pageOpen', { where: pageOf(selectedItem.openAt.path) })} onClick={() => navigate(selectedItem.openAt.path)}>
                  {t('desk.drawer.open')}
                </Button>
              ) : (
                <Button variant="primary" icon="↓" title={t('desk.drawer.showBelowWhat')} onClick={showBelow}>
                  {t('desk.drawer.showBelow')}
                </Button>
              )}
            </>
          )
        }
      >
        {selectedItem && (
          <div className="desk-drawer">
            <DeskFace item={{ ...selectedItem, plain: false }} lang={lang} box={320} moreLabel={(n) => t('desk.more', { n })} />
            <KeyValue
              columns={1}
              items={[
                { key: t('desk.drawer.kind'), value: kindLabel(selectedItem.kind) },
                { key: t('desk.drawer.entity'), value: selectedEntity ? pick(ENTITY_RULES[selectedEntity].one, lang) : '' },
                { key: t('desk.drawer.mat'), value: pick(layout.mats.find((m) => m.id === selectedItem.phase)?.label ?? { en: selectedItem.phase }, lang) },
                { key: t('desk.drawer.sub'), value: subName(selectedItem.phase, selectedItem.group) },
                { key: t('desk.drawer.page'), value: pageOf(selectedItem.openAt.path || location.pathname) },
              ]}
            />
            <h3 className="desk-drawer__h">{t('desk.abilities')}</h3>
            {selectedEntity && abilities.length > 0 ? (
              <>
                <p className="desk-drawer__why">{t('desk.abilities.intro', { entity: pick(ENTITY_RULES[selectedEntity].one, lang).toLowerCase() })}</p>
                <ul className="desk-abilities">
                  {abilities.map(({ action, param }) => (
                    <AbilityRow key={action.id} action={action} param={param} rowId={selectedRow?.id} title={pick(selectedItem.title, lang)} allowed={!action.permission || can(action.permission)} />
                  ))}
                </ul>
              </>
            ) : (
              <p className="desk-drawer__why">{t('desk.abilities.none', { entity: selectedEntity ? pick(ENTITY_RULES[selectedEntity].one, lang).toLowerCase() : '' })}</p>
            )}
            <h3 className="desk-drawer__h">{t('desk.drawer.fields', { n: selectedRow ? rowFields(selectedRow, lang).length : 0 })}</h3>
            {selectedRow ? <KeyValue columns={1} items={rowFields(selectedRow, lang).map((f) => ({ key: f.key, value: f.value }))} /> : <p className="desk-drawer__why">{t('desk.drawer.gone')}</p>}
          </div>
        )}
      </Drawer>
    </section>
  );
}

/**
 * One ability of an object (D-106): the page's own action on this row. The row's id fills the action's id param;
 * an enum param gets a Select (first value preselected); an action that needs free text or another id says so and
 * points to the page below instead of running half-filled.
 */
function AbilityRow({ action, param, rowId, title, allowed }: { action: ActionDef; param: string; rowId?: string; title: string; allowed: boolean }) {
  const { t, lang } = useT();
  const extra = Object.entries(action.params ?? {}).filter(([k]) => k !== param);
  const enums = extra.filter(([, type]) => type.startsWith('enum:'));
  const open = extra.filter(([, type]) => !type.startsWith('enum:') && type !== 'boolean');
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(enums.map(([k, type]) => [k, type.slice(5).split('|')[0] ?? ''])));
  const needs = open.map(([k]) => k);
  const run = async () => {
    if (!rowId) return;
    const res = await runAction(action.id, { [param]: rowId, ...values });
    toast(res.ok ? t('desk.abilities.done', { label: action.label, result: res.result === undefined ? t('desk.abilities.ok') : String(res.result) }) : t('desk.abilities.failed', { label: action.label, error: res.error ?? '' }));
  };
  const why = !allowed ? t('desk.abilities.denied', { permission: action.permission ?? '' }) : needs.length ? t('desk.abilities.needs', { fields: needs.map((k) => fieldLabel(k, lang).toLowerCase()).join(', ') }) : action.intent.replace(/\{(\w+)\}/g, (_, k: string) => (k === param ? title : values[k] ?? `{${k}}`));
  return (
    <li className="desk-ability">
      {enums.map(([k, type]) => (
        <Select
          key={k}
          label={fieldLabel(k, lang)}
          hideLabel
          className="desk-ability__select"
          value={values[k] ?? ''}
          onChange={(e) => setValues((v) => ({ ...v, [k]: e.target.value }))}
          options={type.slice(5).split('|').map((v) => ({ value: v, label: pick(valueLabel(v), lang) }))}
        />
      ))}
      <Button size="sm" disabled={!allowed || !rowId || needs.length > 0} title={why} onClick={() => void run()} data-ability={action.id}>
        {action.label}
      </Button>
      {needs.length > 0 && allowed && <span className="desk-ability__note">{why}</span>}
    </li>
  );
}
