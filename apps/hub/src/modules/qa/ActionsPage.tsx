import { useEffect, useMemo, useState } from 'react';
import { declaredActions, runAction, useLiveActions, useRegisterActions, type ActionParams, type ActionResult, type DeclaredAction } from '../../actions';
import { useCan } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { toast } from '../../components/atom/Toast/Toast';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useRoutes } from '../../app/RoutesContext';
import { useT } from '../../i18n/I18nProvider';
import { SURFACES, type ParamType, type Surface } from '../../specs/PageSpec';
import { copyText, downloadText } from './copy';
import { actionsSpec } from './specs';
import './qa.css';

/** A declared action with the surface of the route that declares it (declaredActions() drops it). */
interface Row extends DeclaredAction {
  surface: Surface;
  pageName: string;
  live: boolean;
  key: string;
}

interface JsonSchema {
  type: string;
  description?: string;
  format?: string;
  enum?: string[];
}

/** ParamType -> JSON Schema property, the same mapping the WebMCP generator will use (P-05). */
export function paramSchema(type: ParamType): JsonSchema {
  if (type.startsWith('enum:')) return { type: 'string', enum: type.slice(5).split('|') };
  switch (type) {
    case 'number':
      return { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    case 'date':
      return { type: 'string', format: 'date' };
    case 'id':
      return { type: 'string', description: 'row id' };
    default:
      return { type: 'string' };
  }
}

/** `{ name, description, inputSchema }`: one WebMCP tool per action id. */
export function toolJson(a: DeclaredAction): unknown {
  const properties: Record<string, JsonSchema> = {};
  for (const [k, v] of Object.entries(a.params ?? {})) properties[k] = paramSchema(v);
  return { name: a.id, description: a.intent, inputSchema: { type: 'object', properties } };
}

function coerce(type: ParamType, raw: string): unknown {
  if (type === 'number') return raw === '' ? undefined : Number(raw);
  if (type === 'boolean') return raw === 'true';
  return raw;
}

/** D-09: the actions bus as a page — what is declared, what is live, and a form that runs it. */
export function ActionsPage() {
  const { t } = useT();
  const can = useCan();
  const routes = useRoutes();
  const live = useLiveActions();

  const [q, setQ] = useState('');
  const [surface, setSurface] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [permission, setPermission] = useState('');
  const [liveOnly, setLiveOnly] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ActionResult | null>(null);
  const [running, setRunning] = useState(false);

  const all = useMemo<Row[]>(() => {
    const byPath = new Map(routes.map((r) => [r.path, r]));
    return declaredActions(routes).map((a) => {
      const route = byPath.get(a.path);
      return {
        ...a,
        surface: route?.surface ?? 'dev',
        pageName: route?.spec.name ?? a.code,
        live: live.includes(a.id),
        key: `${a.path}::${a.id}`,
      };
    });
  }, [routes, live]);

  const modules = useMemo(() => [...new Set(all.map((a) => a.id.split('.')[0]))].sort(), [all]);
  const permissions = useMemo(() => [...new Set(all.map((a) => a.permission).filter((p): p is string => Boolean(p)))].sort(), [all]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter(
      (a) =>
        (!surface || a.surface === surface) &&
        (!moduleId || a.id.startsWith(`${moduleId}.`)) &&
        (!permission || (permission === 'none' ? !a.permission : a.permission === permission)) &&
        (!liveOnly || a.live) &&
        (!needle || `${a.id} ${a.label} ${a.intent} ${a.code} ${a.path} ${a.pageName}`.toLowerCase().includes(needle)),
    );
  }, [all, q, surface, moduleId, permission, liveOnly]);

  const sel = openKey ? all.find((a) => a.key === openKey) ?? null : null;
  const selParams = useMemo(() => Object.entries(sel?.params ?? {}) as [string, ParamType][], [sel]);
  const alsoOn = sel ? all.filter((a) => a.id === sel.id && a.key !== sel.key) : [];
  const allowed = sel ? !sel.permission || can(sel.permission) : false;

  // A new selection starts with an empty form and no stale result.
  useEffect(() => {
    if (!sel) return;
    const init: Record<string, string> = {};
    for (const [k, type] of Object.entries(sel.params ?? {}) as [string, ParamType][]) init[k] = type === 'boolean' ? 'false' : '';
    setValues(init);
    setResult(null);
  }, [sel?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const openById = (id: string): string => {
    const hit = all.find((a) => a.id === id);
    if (!hit) return t('qa.actions.notFound', { id });
    setOpenKey(hit.key);
    return `${hit.id} · ${hit.code}`;
  };

  const copyTool = async (a: DeclaredAction): Promise<string> => {
    const text = JSON.stringify(toolJson(a), null, 2);
    toast(t((await copyText(text)) ? 'qa.copied' : 'qa.copyFailed'));
    return text;
  };

  const exportAll = (): string => {
    const file = `aluzina-actions-${new Date().toISOString().slice(0, 10)}.json`;
    const payload = {
      generatedAt: new Date().toISOString(),
      count: all.length,
      actions: all.map((a) => ({ id: a.id, code: a.code, path: a.path, surface: a.surface, label: a.label, intent: a.intent, permission: a.permission ?? null, params: a.params ?? null, live: a.live })),
      tools: [...new Map(all.map((a) => [a.id, toolJson(a)])).values()],
    };
    downloadText(file, JSON.stringify(payload, null, 2));
    toast(t('qa.actions.exported', { file }));
    return file;
  };

  const run = async (id: string, params: ActionParams): Promise<ActionResult> => {
    setRunning(true);
    const res = await runAction(id, params);
    setRunning(false);
    setResult(res);
    return res;
  };

  const runSelected = async () => {
    if (!sel) return;
    const params: ActionParams = {};
    for (const [k, type] of selParams) {
      const raw = values[k] ?? '';
      if (raw === '' && type !== 'boolean') continue;
      const v = coerce(type, raw);
      if (v !== undefined) params[k] = v;
    }
    await run(sel.id, params);
  };

  useRegisterActions({
    'qa.searchActions': ({ query }) => {
      setQ(String(query ?? ''));
      return t('qa.summary', { shown: rows.length, total: all.length });
    },
    'qa.filterActionsSurface': ({ surface: s }) => {
      const next = String(s ?? '');
      setSurface(next === 'all' ? '' : next);
      return next;
    },
    'qa.filterActionsLive': ({ live: only }) => {
      const on = only === undefined ? true : only === true || only === 'true';
      setLiveOnly(on);
      return on;
    },
    'qa.openAction': ({ action }) => openById(String(action ?? '')),
    'qa.runAction': async ({ action, ...params }) => {
      const id = String(action ?? '');
      if (id === 'qa.runAction') return t('qa.actions.selfRun');
      const hit = all.find((a) => a.id === id);
      if (!hit) return t('qa.actions.notFound', { id });
      setOpenKey(hit.key);
      const res = await run(id, params);
      return res.ok ? t('qa.actions.ran', { id }) : `${t('qa.actions.drawer.error')}: ${res.error ?? ''}`;
    },
    'qa.copyActionTool': async ({ action }) => {
      const id = String(action ?? '');
      const hit = all.find((a) => a.id === id);
      if (!hit) return t('qa.actions.notFound', { id });
      return copyTool(hit);
    },
    'qa.exportActions': () => exportAll(),
  });

  return (
    <div className="qa-stack">
      <PageHeader
        code={actionsSpec.code}
        title={t('qa.actions.title')}
        subtitle={t('qa.actions.subtitle')}
        breadcrumb={[{ label: t('core.portal.dev'), to: '/dev/components' }, { label: t('qa.nav.actions') }]}
        actions={
          <Button variant="primary" icon="↓" onClick={exportAll}>
            {t('qa.actions.export')}
          </Button>
        }
      />

      <div className="qa-stats">
        <StatTile label={t('qa.actions.declared')} value={all.length} tone="accent" />
        <StatTile label={t('qa.actions.distinct')} value={new Set(all.map((a) => a.id)).size} tone="info" />
        <StatTile label={t('qa.actions.liveNow')} value={all.filter((a) => a.live).length} tone="success" />
        <StatTile label={t('qa.actions.withPermission')} value={all.filter((a) => a.permission).length} />
        <StatTile label={t('qa.actions.withParams')} value={all.filter((a) => a.params && Object.keys(a.params).length > 0).length} />
      </div>

      <FilterBar
        summary={t('qa.summary', { shown: rows.length, total: all.length })}
        onClear={q || surface || moduleId || permission || liveOnly ? () => { setQ(''); setSurface(''); setModuleId(''); setPermission(''); setLiveOnly(false); } : undefined}
      >
        <SearchField value={q} onChange={setQ} placeholder={t('qa.actions.search')} />
        <Select label={t('qa.actions.surface')} hideLabel value={surface} onChange={(e) => setSurface(e.target.value)} placeholder={t('qa.actions.allSurfaces')} options={SURFACES.map((s) => ({ value: s, label: s }))} />
        <Select label={t('qa.actions.module')} hideLabel value={moduleId} onChange={(e) => setModuleId(e.target.value)} placeholder={t('qa.actions.allModules')} options={modules.map((m) => ({ value: m, label: m }))} />
        <Select
          label={t('qa.actions.permission')}
          hideLabel
          value={permission}
          onChange={(e) => setPermission(e.target.value)}
          placeholder={t('qa.actions.allPermissions')}
          options={[{ value: 'none', label: t('qa.actions.noPermission') }, ...permissions.map((p) => ({ value: p, label: p }))]}
        />
        <Checkbox label={t('qa.actions.liveOnly')} checked={liveOnly} onChange={(e) => setLiveOnly(e.target.checked)} />
      </FilterBar>

      <DataTable
        caption={t('qa.actions.caption')}
        rows={rows}
        rowKey={(a) => a.key}
        initialSort={{ key: 'id', dir: 'asc' }}
        onRowActivate={(a) => setOpenKey(a.key)}
        emptyTitle={t('qa.none')}
        emptyDescription={t('qa.noneDesc')}
        columns={[
          { key: 'id', header: t('qa.actions.col.id'), sortable: true, render: (a) => <code>{a.id}</code> },
          { key: 'code', header: t('qa.actions.col.page'), sortable: true, render: (a) => (<span className="qa-cell"><code>{a.code}</code> <span className="qa-muted">#{a.path}</span></span>) },
          { key: 'label', header: t('qa.actions.col.label'), sortable: true },
          { key: 'intent', header: t('qa.actions.col.intent'), render: (a) => <span className="qa-muted">“{a.intent}”</span> },
          { key: 'permission', header: t('qa.actions.col.permission'), sortable: true, render: (a) => (a.permission ? <code>{a.permission}</code> : '—') },
          { key: 'params', header: t('qa.actions.col.params'), render: (a) => (a.params ? <span className="qa-muted">{Object.entries(a.params).map(([k, v]) => `${k}: ${v}`).join(', ')}</span> : '—') },
          { key: 'live', header: t('qa.actions.col.live'), sortable: true, sortValue: (a) => (a.live ? 1 : 0), render: (a) => <Badge tone={a.live ? 'success' : 'neutral'} dot>{t(a.live ? 'qa.actions.live' : 'qa.actions.notLive')}</Badge> },
        ]}
      />

      <Drawer
        open={sel !== null}
        onClose={() => setOpenKey(null)}
        title={sel ? sel.id : ''}
        footer={
          sel && (
            <div className="qa-drawer__foot">
              <Button variant="primary" disabled={!sel.live || !allowed || running} onClick={runSelected}>
                {t(running ? 'qa.actions.drawer.running' : 'qa.actions.drawer.run')}
              </Button>
              <Button icon="⧉" onClick={() => void copyTool(sel)}>
                {t('qa.actions.drawer.copyTool')}
              </Button>
              <Button href={`#${sel.path}`} icon="→">
                {t('qa.actions.drawer.openPage')}
              </Button>
            </div>
          )
        }
      >
        {sel && (
          <div className="qa-detail">
            <p>{sel.label} — “{sel.intent}”</p>
            <KeyValue
              columns={1}
              items={[
                { key: t('qa.actions.col.page'), value: <span><code>{sel.code}</code> {sel.pageName}</span> },
                { key: t('qa.actions.col.path'), value: <code>#{sel.path}</code> },
                { key: t('qa.actions.surface'), value: sel.surface },
                { key: t('qa.actions.col.permission'), value: sel.permission ? <code>{sel.permission}</code> : '—' },
                { key: t('qa.actions.col.live'), value: <Badge tone={sel.live ? 'success' : 'neutral'} dot>{t(sel.live ? 'qa.actions.live' : 'qa.actions.notLive')}</Badge> },
                ...(alsoOn.length ? [{ key: t('qa.actions.drawer.alsoOn'), value: alsoOn.map((a) => a.code).join(', ') }] : []),
              ]}
            />

            <h3 className="qa-h4">{t('qa.actions.drawer.params')}</h3>
            {selParams.length === 0 ? (
              <p className="qa-muted">{t('qa.actions.drawer.noParams')}</p>
            ) : (
              <div className="qa-form">
                {selParams.map(([name, type]) =>
                  type === 'boolean' ? (
                    <Checkbox key={name} label={`${name} (${type})`} checked={values[name] === 'true'} onChange={(e) => setValues((v) => ({ ...v, [name]: String(e.target.checked) }))} />
                  ) : type.startsWith('enum:') ? (
                    <Select key={name} label={`${name} (${type})`} value={values[name] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))} placeholder="—" options={type.slice(5).split('|').map((o) => ({ value: o, label: o }))} />
                  ) : (
                    <Input
                      key={name}
                      label={`${name} (${type})`}
                      type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
                      inputMode={type === 'number' ? 'numeric' : undefined}
                      value={values[name] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
                    />
                  ),
                )}
              </div>
            )}

            {!sel.live && <p className="qa-note">{t('qa.actions.drawer.notLiveHint')}</p>}
            {sel.live && !allowed && <p className="qa-note">{t('qa.actions.drawer.deniedHint', { permission: sel.permission ?? '' })}</p>}

            {result && (
              <>
                <h3 className="qa-h4">{t(result.ok ? 'qa.actions.drawer.result' : 'qa.actions.drawer.error')}</h3>
                <pre className="qa-pre">{result.ok ? JSON.stringify(result.result ?? null, null, 2) : result.error}</pre>
              </>
            )}

            <h3 className="qa-h4">{t('qa.actions.drawer.copyTool')}</h3>
            <pre className="qa-pre">{JSON.stringify(toolJson(sel), null, 2)}</pre>
          </div>
        )}
      </Drawer>
    </div>
  );
}
