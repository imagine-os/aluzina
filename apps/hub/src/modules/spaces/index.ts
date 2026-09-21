import { createElement } from 'react';
import type { RouteDef, Surface } from '../../specs/PageSpec';
import { CatalogPage } from './CatalogPage';
import { GraphPage } from './GraphPage';
import { ImportPage } from './ImportPage';
import { PostPage } from './PostPage';
import { catalogSpec, graphSpec, importSpec, postSpec, spaceViewSpec, spacesHomeSpec } from './specs';
import { SpacesPage } from './SpacesPage';

export { strings } from './strings';

/**
 * Spaces (K-01..K-06, prompt 0005, D-026 / D-027): like Work (D-021) the same pages mount on every portal
 * surface and on the dev surface, each in its shell. Nav order 6 puts Spaces right after Work in every
 * sidebar; the `spaces` group sits after `projects`. `spaces.read` guards every route; writes are decided
 * inside the pages with `can()`.
 */
const SURFACES: Surface[] = ['founder', 'ops', 'studio', 'brand', 'dev'];

export const routes: RouteDef[] = SURFACES.flatMap((surface) => {
  const home = spacesHomeSpec(surface);
  const view = spaceViewSpec(surface);
  const post = postSpec(surface);
  const graph = graphSpec(surface);
  const catalog = catalogSpec(surface);
  const imp = importSpec(surface);
  const common = { surface, status: 'built' as const, permission: 'spaces.read', shell: 'desktop' as const };
  return [
    { path: `/${surface}/spaces`, code: home.code, ...common, spec: home, element: createElement(SpacesPage, { surface }), nav: { labelKey: 'spaces.nav.spaces', order: 6, glyph: '◈' } },
    { path: `/${surface}/spaces/graph`, code: graph.code, ...common, spec: graph, element: createElement(GraphPage, { surface }), nav: { labelKey: 'spaces.nav.graph', order: 61, glyph: '⟡' } },
    { path: `/${surface}/spaces/catalog`, code: catalog.code, ...common, spec: catalog, element: createElement(CatalogPage, { surface }), nav: { labelKey: 'spaces.nav.catalog', order: 62, glyph: '▤' } },
    { path: `/${surface}/spaces/import`, code: imp.code, ...common, spec: imp, element: createElement(ImportPage, { surface }), nav: { labelKey: 'spaces.nav.import', order: 63, glyph: '⇥' } },
    { path: `/${surface}/spaces/post/:postId`, code: post.code, ...common, spec: post, element: createElement(PostPage, { surface }) },
    { path: `/${surface}/spaces/:spaceId`, code: view.code, ...common, spec: view, element: createElement(SpacesPage, { surface }) },
  ] satisfies RouteDef[];
});
