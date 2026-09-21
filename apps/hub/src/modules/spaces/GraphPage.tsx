import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { useSession } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Select } from '../../components/atom/Select/Select';
import { Skeleton } from '../../components/atom/Skeleton/Skeleton';
import { toast } from '../../components/atom/Toast/Toast';
import { ToggleButton } from '../../components/atom/ToggleButton/ToggleButton';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import {
  GRAPH_VIEW_IDS,
  LanesView,
  Objects3DView,
  ObjectsMapView,
  RadialView,
  hopsFrom,
  isGraphViewId,
  usePrefersReducedMotion,
  useWebGLAvailable,
  type GraphViewHandle,
  type GraphViewId,
  type GraphViewLabels,
  type GraphViewProps,
} from '../../components/organism/GraphViews/GraphViews';
import { GRAPH_W, RelationGraph, type GraphEdge, type GraphNode } from '../../components/organism/RelationGraph/RelationGraph';
import { useTable } from '../../data/DataContext';
import { SPACE_KINDS } from '../../data/schema';
import { useT } from '../../i18n/I18nProvider';
import type { Surface } from '../../specs/PageSpec';
import { useEntityIndex } from './entities';
import { useViewNodes } from './graphImages';
import { buildGraph, graphKey, parseKey } from './model';
import { graphSpec } from './specs';
import './spaces.css';

const NODE_KINDS = [...SPACE_KINDS, 'post', 'other'] as const;
const ZOOMS = [0.5, 0.65, 0.8, 1, 1.25, 1.5, 2, 2.5, 3];
/** Where the chosen view is remembered between visits. */
const VIEW_STORAGE_KEY = 'aluzina.graphView';
/** Nodes drawn before "Show all" is on; the rest are the ones furthest from the focus. */
const MAX_NODES = 140;

function storedView(): GraphViewId {
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY);
    if (isGraphViewId(raw)) return raw;
  } catch {
    // private mode / blocked storage: the default view is fine
  }
  return 'objects3d';
}

/** Keep the nodes closest to the focus so a big graph still draws fast (and the 3D scene stays light). */
function capGraph(nodes: GraphNode[], edges: GraphEdge[], focusKey: string | null, max: number): { nodes: GraphNode[]; edges: GraphEdge[]; hidden: number } {
  if (nodes.length <= max) return { nodes, edges, hidden: 0 };
  const hops = hopsFrom(nodes, edges, focusKey);
  const kept = [...nodes].sort((a, b) => (hops.get(a.key) ?? 99) - (hops.get(b.key) ?? 99) || a.label.localeCompare(b.label)).slice(0, max);
  const keys = new Set(kept.map((n) => n.key));
  return { nodes: kept, edges: edges.filter((e) => keys.has(e.from) && keys.has(e.to)), hidden: nodes.length - kept.length };
}

/**
 * K-04: the same spaces, posts and relations in five views (prompt 0012, rebuilt on the imagine-os graph
 * gallery): 3D objects (default), Lanes skill tree, Radial tree, Objects map and the dependency-free
 * Force 2D `RelationGraph`, which is also what a device without WebGL gets. Focus, depth, kind filters and
 * archived come from the query as before; the view choice is remembered in localStorage.
 */
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
  const [showAll, setShowAll] = useState(false);
  const [view, setViewState] = useState<GraphViewId>(storedView);
  const [autoRotate, setAutoRotate] = useState(false);
  const [force3d, setForce3d] = useState(false);
  const [zoom, setZoom] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<GraphViewHandle>(null);
  const webgl = useWebGLAvailable();
  const reducedMotion = usePrefersReducedMotion();

  const setView = useCallback((next: GraphViewId) => {
    setViewState(next);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // storage can be unavailable; the choice just does not survive the visit
    }
  }, []);

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
  const drawn = useMemo(() => capGraph(graph.nodes, graph.edges, focusKey, showAll ? Number.POSITIVE_INFINITY : MAX_NODES), [graph, focusKey, showAll]);
  const viewNodes = useViewNodes(drawn.nodes);

  const labels: GraphViewLabels = useMemo(
    () => ({
      help: t('spaces.graph.help'),
      node: t('spaces.graph.node'),
      links: t('spaces.graph.links'),
      hops: t('spaces.graph.hops'),
      nodeList: t('spaces.graph.nodeList'),
      noPreview: t('spaces.graph.noPreview'),
      capped: t('spaces.graph.capped'),
      otherLane: t('spaces.kind.other'),
    }),
    [t],
  );

  // Force 2D keeps its own scroll-and-scale zoom (D-026); the gallery views use the imperative handle.
  const fit2d = useCallback(() => {
    const el = wrapRef.current?.querySelector<HTMLElement>('.rgraph');
    if (!el) return;
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const z = (el.clientWidth - 4) / ((GRAPH_W / 16) * rootPx);
    setZoom(Math.min(3, Math.max(0.5, Math.round(z * 100) / 100)));
  }, []);
  const fitted = useRef(false);
  const hasNodes = drawn.nodes.length > 0;
  useEffect(() => {
    if (hasNodes && !fitted.current) {
      fitted.current = true;
      fit2d();
    }
  }, [hasNodes, fit2d]);

  const zoom2d = (dir: 1 | -1) => {
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

  const open = useCallback(
    (key: string) => {
      const { type, id } = parseKey(key);
      if (type === 'spaces') navigate(`${base}/${id}`);
      else if (type === 'posts') navigate(`${base}/post/${id}`);
      else {
        const r = index.resolve(type, id);
        if (r?.route) navigate(r.route);
        else toast(t('spaces.noRoute'));
      }
    },
    [base, index, navigate, t],
  );

  // Force 2D is what a device without WebGL gets, and what reduced motion gets until it is overridden.
  const fallback3d = view === 'objects3d' && (!webgl || (reducedMotion && !force3d));
  const effective: GraphViewId = fallback3d ? 'force2d' : view;
  const is2dFallbackView = effective === 'force2d';

  const zoomIn = useCallback(() => (is2dFallbackView ? zoom2d(1) : viewRef.current?.zoomIn()), [is2dFallbackView, zoom]);
  const zoomOut = useCallback(() => (is2dFallbackView ? zoom2d(-1) : viewRef.current?.zoomOut()), [is2dFallbackView, zoom]);
  const fit = useCallback(() => (is2dFallbackView ? fit2d() : viewRef.current?.fit()), [is2dFallbackView, fit2d]);
  const reset = useCallback(() => {
    if (is2dFallbackView) {
      setZoom(1);
      fit2d();
    } else viewRef.current?.reset();
  }, [is2dFallbackView, fit2d]);

  useRegisterActions({
    'spaces.switchGraphView': ({ view: v }) => {
      const next = String(v ?? '');
      if (!isGraphViewId(next)) return `unknown view ${next}`;
      setView(next);
      return `graph view: ${next}`;
    },
    'spaces.autoRotate': () => {
      setAutoRotate((on) => !on);
      return 'auto-rotate toggled';
    },
    'spaces.resetCamera': () => {
      reset();
      return 'camera reset';
    },
    'spaces.showAllNodes': () => {
      setShowAll((on) => !on);
      return 'node cap toggled';
    },
    'spaces.focusGraph': ({ node }) => {
      setParam('focus', String(node ?? ''));
      return `focus: ${String(node ?? '')}`;
    },
    'spaces.setDepth': ({ depth: d }) => {
      setParam('depth', String(d ?? '2'));
      return `depth: ${String(d ?? '2')}`;
    },
    'spaces.filterGraphKind': ({ kind }) => {
      toggleKind(String(kind ?? ''));
      return `toggled ${String(kind ?? '')}`;
    },
    'spaces.zoom': ({ direction }) => {
      const d = String(direction ?? 'in');
      if (d === 'out') zoomOut();
      else if (d === 'fit') fit();
      else zoomIn();
      return `zoom ${d}`;
    },
    'spaces.openNode': ({ node }) => {
      open(String(node ?? ''));
      return `opened ${String(node ?? '')}`;
    },
    'spaces.showArchived': () => {
      setShowArchived((on) => !on);
      return 'archived toggled';
    },
  });

  const focusOptions = useMemo(
    () => [
      ...[...spaces.rows].filter((s) => showArchived || !s.archived).sort((a, b) => a.name.localeCompare(b.name)).map((s) => ({ value: graphKey('spaces', s.id), label: `${t('spaces.type.spaces')}: ${s.name}` })),
      ...[...posts.rows].sort((a, b) => a.title.localeCompare(b.title)).map((p) => ({ value: graphKey('posts', p.id), label: `${t('spaces.type.posts')}: ${p.title}` })),
    ],
    [spaces.rows, posts.rows, showArchived, t],
  );
  const focusLabel = focusKey ? graph.nodes.find((n) => n.key === focusKey)?.label ?? index.resolve(parseKey(focusKey).type, parseKey(focusKey).id)?.label : null;
  const regionLabel = t('spaces.graphLabel', { focus: focusLabel ?? '' });

  const viewProps: GraphViewProps = {
    nodes: viewNodes,
    edges: drawn.edges,
    focusKey,
    onFocus: (k) => setParam('focus', k),
    onOpen: open,
    label: regionLabel,
    labels,
    autoRotate,
    reducedMotion,
  };

  return (
    <div className="spaces-page" ref={wrapRef}>
      <PageHeader code={spec.code} title={t('spaces.graph')} subtitle={t('spaces.graphSubtitle')} breadcrumb={[{ label: t(`core.portal.${surface}`), to: `/${surface}` }, { label: t('spaces.title'), to: base }, { label: t('spaces.graph') }]} />

      <Tabs
        label={t('spaces.graph.view')}
        value={view}
        onChange={(id) => isGraphViewId(id) && setView(id)}
        tabs={GRAPH_VIEW_IDS.map((id) => ({ id, label: t(`spaces.graph.view.${id}`) }))}
      />

      <div className="spaces-graph-controls" role="group" aria-label={t('spaces.graphControls')}>
        <Select className="spaces-graph-focus" label={t('spaces.focus')} value={focusKey ?? ''} onChange={(e) => setParam('focus', e.target.value)} options={focusOptions} />
        <Select label={t('spaces.depth')} value={depth === null ? 'all' : String(depth)} onChange={(e) => setParam('depth', e.target.value)} options={[{ value: '1', label: t('spaces.depthN', { n: 1 }) }, { value: '2', label: t('spaces.depthN', { n: 2 }) }, { value: '3', label: t('spaces.depthN', { n: 3 }) }, { value: 'all', label: t('spaces.depthAll') }]} />
        <div className="spaces-graph-zoom" role="group" aria-label={t('spaces.graph.camera')}>
          <Button icon="−" aria-label={t('spaces.zoomOut')} onClick={zoomOut} disabled={is2dFallbackView && zoom <= ZOOMS[0]} />
          {is2dFallbackView && <span className="spaces-graph-zoom__value" aria-live="polite">{Math.round(zoom * 100)}%</span>}
          <Button icon="+" aria-label={t('spaces.zoomIn')} onClick={zoomIn} disabled={is2dFallbackView && zoom >= ZOOMS[ZOOMS.length - 1]} />
          <Button onClick={fit}>{t('spaces.zoomFit')}</Button>
          <Button onClick={reset}>{t('spaces.graph.reset')}</Button>
          {effective === 'objects3d' && (
            <ToggleButton label={t('spaces.graph.autoRotate')} pressed={autoRotate} onClick={() => setAutoRotate((on) => !on)}>
              ⟳
            </ToggleButton>
          )}
        </div>
        <Checkbox label={t('spaces.showArchived')} checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
        <Checkbox label={t('spaces.graph.showAll')} checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
      </div>

      <div className="spaces-graph-kinds" role="group" aria-label={t('spaces.filterKinds')}>
        {NODE_KINDS.map((k) => (
          <ToggleButton key={k} label={t('spaces.toggleKind', { kind: t(k === 'post' ? 'spaces.type.posts' : k === 'other' ? 'spaces.kind.other' : `spaces.kind.${k}`) })} pressed={kinds.has(k)} onClick={() => toggleKind(k)}>
            <span className={`spaces-legend__dot spaces-legend__dot--${k}`} aria-hidden="true" /> {t(k === 'post' ? 'spaces.type.posts' : k === 'other' ? 'spaces.kind.other' : `spaces.kind.${k}`)}
          </ToggleButton>
        ))}
      </div>

      {fallback3d && (
        <p className="spaces-graph-note" role="status">
          {webgl ? t('spaces.graph.reducedMotion') : t('spaces.graph.noWebgl')}{' '}
          {webgl && (
            <Button size="sm" variant="ghost" onClick={() => setForce3d(true)}>
              {t('spaces.graph.show3d')}
            </Button>
          )}
        </p>
      )}
      {drawn.hidden > 0 && (
        <p className="spaces-graph-note" role="status">{t('spaces.graph.capped', { n: drawn.nodes.length })}</p>
      )}

      {drawn.nodes.length === 0 ? (
        <EmptyState title={t('spaces.graphEmpty')} description={t('spaces.graphEmptyHint')} glyph="⟡" />
      ) : effective === 'objects3d' ? (
        <Suspense fallback={<Skeleton height="22rem" />}>
          <Objects3DView {...viewProps} ref={viewRef} />
        </Suspense>
      ) : effective === 'lanes' ? (
        <LanesView {...viewProps} ref={viewRef} />
      ) : effective === 'radial' ? (
        <RadialView {...viewProps} ref={viewRef} />
      ) : effective === 'map' ? (
        <ObjectsMapView {...viewProps} ref={viewRef} />
      ) : (
        <RelationGraph nodes={drawn.nodes} edges={drawn.edges} focusKey={focusKey} onFocus={(k) => setParam('focus', k)} onOpen={open} zoom={zoom} label={regionLabel} />
      )}

      <div className="spaces-legend" aria-label={t('spaces.legend')}>
        <Badge>{t('spaces.nodes', { n: drawn.nodes.length })}</Badge>
        <Badge>{t('spaces.edges', { n: drawn.edges.length })}</Badge>
        <span className="spaces-legend__item"><span className="spaces-legend__line spaces-legend__line--child" aria-hidden="true" /> {t('spaces.edge.child')}</span>
        <span className="spaces-legend__item"><span className="spaces-legend__line spaces-legend__line--filed" aria-hidden="true" /> {t('spaces.edge.filed')}</span>
        <span className="spaces-legend__item"><span className="spaces-legend__line spaces-legend__line--relation" aria-hidden="true" /> {t('spaces.edge.relation')}</span>
        <span className="spaces-legend__item spaces-muted">{t('spaces.graphKeys')}</span>
        <span className="spaces-legend__item spaces-muted">{t('spaces.graph.legendPictures')}</span>
        <span className="spaces-legend__item spaces-muted">{t('spaces.graph.source')}</span>
      </div>
    </div>
  );
}
