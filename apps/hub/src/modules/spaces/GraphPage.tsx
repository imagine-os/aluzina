import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Select } from '../../components/atom/Select/Select';
import { toast } from '../../components/atom/Toast/Toast';
import { ToggleButton } from '../../components/atom/ToggleButton/ToggleButton';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { GRAPH_W, RelationGraph } from '../../components/organism/RelationGraph/RelationGraph';
import { useTable } from '../../data/DataContext';
import { SPACE_KINDS } from '../../data/schema';
import { useT } from '../../i18n/I18nProvider';
import type { Surface } from '../../specs/PageSpec';
import { useEntityIndex } from './entities';
import { buildGraph, graphKey, parseKey } from './model';
import { graphSpec } from './specs';
import './spaces.css';

const NODE_KINDS = [...SPACE_KINDS, 'post', 'other'] as const;
const ZOOMS = [0.5, 0.65, 0.8, 1, 1.25, 1.5, 2, 2.5, 3];

/** K-04: spaces, posts and relations as a graph with focus, depth, kind filters and button zoom. */
export function GraphPage({ surface }: { surface: Surface }) {
  const { t } = useT();
  const navigate = useNavigate();
  const { role } = useSession();
  const [params, setParams] = useSearchParams();
  const spaces = useTable('spaces');
  const posts = useTable('posts');
  const filings = useTable('filings');
  const relations = useTable('relations');
  const index = useEntityIndex(surface);
  const base = `/${surface}/spaces`;
  const spec = graphSpec(surface);

  const [kinds, setKinds] = useState<Set<string>>(() => new Set(NODE_KINDS));
  const [showArchived, setShowArchived] = useState(false);
  const [zoom, setZoom] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const roleSpace = spaces.rows.find((s) => s.aboutType === 'roles' && s.aboutId === role);
  const defaultFocus = roleSpace ? graphKey('spaces', roleSpace.id) : spaces.rows[0] ? graphKey('spaces', spaces.rows[0].id) : null;
  const focusKey = params.get('focus') ?? defaultFocus;
  const depthParam = params.get('depth') ?? '2';
  const depth = depthParam === 'all' ? null : Math.min(3, Math.max(1, Number(depthParam) || 2));

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params);
      next.set(key, value);
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const resolve = useCallback((type: string, id: string) => index.resolve(type, id), [index]);
  const graph = useMemo(() => buildGraph({ spaces: spaces.rows, posts: posts.rows, filings: filings.rows, relations: relations.rows, resolve, kinds, focusKey, depth, includeArchived: showArchived }), [spaces.rows, posts.rows, filings.rows, relations.rows, resolve, kinds, focusKey, depth, showArchived]);

  const fit = useCallback(() => {
    const el = wrapRef.current?.querySelector<HTMLElement>('.rgraph');
    if (!el) return;
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const z = (el.clientWidth - 4) / ((GRAPH_W / 16) * rootPx);
    setZoom(Math.min(3, Math.max(0.5, Math.round(z * 100) / 100)));
  }, []);
  // fit once the graph has something to draw (the tables load after the first render)
  const fitted = useRef(false);
  const hasNodes = graph.nodes.length > 0;
  useEffect(() => {
    if (hasNodes && !fitted.current) {
      fitted.current = true;
      fit();
    }
  }, [hasNodes, fit]);

  const zoomStep = (dir: 1 | -1) => {
    const i = ZOOMS.findIndex((z) => z >= zoom - 0.001);
    const next = ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, (i === -1 ? ZOOMS.length - 1 : i) + dir))];
    setZoom(next);
  };
  const toggleKind = (k: string) =>
    setKinds((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const open = (key: string) => {
    const { type, id } = parseKey(key);
    if (type === 'spaces') navigate(`${base}/${id}`);
    else if (type === 'posts') navigate(`${base}/post/${id}`);
    else {
      const r = index.resolve(type, id);
      if (r?.route) navigate(r.route);
      else toast(t('spaces.noRoute'));
    }
  };

  const focusOptions = useMemo(
    () => [
      ...[...spaces.rows].filter((s) => showArchived || !s.archived).sort((a, b) => a.name.localeCompare(b.name)).map((s) => ({ value: graphKey('spaces', s.id), label: `${t('spaces.type.spaces')}: ${s.name}` })),
      ...[...posts.rows].sort((a, b) => a.title.localeCompare(b.title)).map((p) => ({ value: graphKey('posts', p.id), label: `${t('spaces.type.posts')}: ${p.title}` })),
    ],
    [spaces.rows, posts.rows, showArchived, t],
  );
  const focusLabel = focusKey ? graph.nodes.find((n) => n.key === focusKey)?.label ?? index.resolve(parseKey(focusKey).type, parseKey(focusKey).id)?.label : null;

  return (
    <div className="spaces-page" ref={wrapRef}>
      <PageHeader code={spec.code} title={t('spaces.graph')} subtitle={t('spaces.graphSubtitle')} breadcrumb={[{ label: t(`core.portal.${surface}`), to: `/${surface}` }, { label: t('spaces.title'), to: base }, { label: t('spaces.graph') }]} />

      <div className="spaces-graph-controls" role="group" aria-label={t('spaces.graphControls')}>
        <Select className="spaces-graph-focus" label={t('spaces.focus')} value={focusKey ?? ''} onChange={(e) => setParam('focus', e.target.value)} options={focusOptions} />
        <Select label={t('spaces.depth')} value={depth === null ? 'all' : String(depth)} onChange={(e) => setParam('depth', e.target.value)} options={[{ value: '1', label: t('spaces.depthN', { n: 1 }) }, { value: '2', label: t('spaces.depthN', { n: 2 }) }, { value: '3', label: t('spaces.depthN', { n: 3 }) }, { value: 'all', label: t('spaces.depthAll') }]} />
        <div className="spaces-graph-zoom" role="group" aria-label={t('spaces.zoom')}>
          <Button icon="−" aria-label={t('spaces.zoomOut')} onClick={() => zoomStep(-1)} disabled={zoom <= ZOOMS[0]} />
          <span className="spaces-graph-zoom__value" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <Button icon="+" aria-label={t('spaces.zoomIn')} onClick={() => zoomStep(1)} disabled={zoom >= ZOOMS[ZOOMS.length - 1]} />
          <Button onClick={fit}>{t('spaces.zoomFit')}</Button>
        </div>
        <Checkbox label={t('spaces.showArchived')} checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
      </div>

      <div className="spaces-graph-kinds" role="group" aria-label={t('spaces.filterKinds')}>
        {NODE_KINDS.map((k) => (
          <ToggleButton key={k} label={t('spaces.toggleKind', { kind: t(k === 'post' ? 'spaces.type.posts' : k === 'other' ? 'spaces.kind.other' : `spaces.kind.${k}`) })} pressed={kinds.has(k)} onClick={() => toggleKind(k)}>
            <span className={`spaces-legend__dot spaces-legend__dot--${k}`} aria-hidden="true" /> {t(k === 'post' ? 'spaces.type.posts' : k === 'other' ? 'spaces.kind.other' : `spaces.kind.${k}`)}
          </ToggleButton>
        ))}
      </div>

      {graph.nodes.length === 0 ? (
        <EmptyState title={t('spaces.graphEmpty')} description={t('spaces.graphEmptyHint')} glyph="⟡" />
      ) : (
        <RelationGraph nodes={graph.nodes} edges={graph.edges} focusKey={focusKey} onFocus={(k) => setParam('focus', k)} onOpen={open} zoom={zoom} label={t('spaces.graphLabel', { focus: focusLabel ?? '' })} />
      )}

      <div className="spaces-legend" aria-label={t('spaces.legend')}>
        <Badge>{t('spaces.nodes', { n: graph.nodes.length })}</Badge>
        <Badge>{t('spaces.edges', { n: graph.edges.length })}</Badge>
        <span className="spaces-legend__item"><span className="spaces-legend__line spaces-legend__line--child" aria-hidden="true" /> {t('spaces.edge.child')}</span>
        <span className="spaces-legend__item"><span className="spaces-legend__line spaces-legend__line--filed" aria-hidden="true" /> {t('spaces.edge.filed')}</span>
        <span className="spaces-legend__item"><span className="spaces-legend__line spaces-legend__line--relation" aria-hidden="true" /> {t('spaces.edge.relation')}</span>
        <span className="spaces-legend__item spaces-muted">{t('spaces.graphKeys')}</span>
      </div>
    </div>
  );
}
