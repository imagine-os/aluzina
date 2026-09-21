import { createElement } from 'react';
import type { RouteDef, Surface } from '../../specs/PageSpec';
import { ArchiveBrowserPage } from './ArchiveBrowserPage';
import { ProjectPortalPage } from './ProjectPortalPage';
import { archiveBrowserSpec, archivePortalSpec } from './specs';

export { strings } from './strings';

/**
 * Project archive (S-12 browser, S-13 portal view), prompt 0017. Like `modules/work` (D-021) the same
 * pages mount on more than one portal: the studio owns the archive, but Alejandra reviews past work from
 * the founder portal and Angélica builds portfolio sets from the brand portal, so all three get the same
 * element, code and spec with their own shell and guard. Nav order 8 puts it after Work and Spaces.
 */
const SURFACES: readonly Surface[] = ['studio', 'founder', 'brand'];
const PERMISSION = 'projects.read';

export const routes: RouteDef[] = SURFACES.flatMap((surface) => {
  const browser = archiveBrowserSpec(surface);
  const portal = archivePortalSpec(surface);
  return [
    {
      path: `/${surface}/archive`,
      code: browser.code,
      surface,
      status: 'built',
      permission: PERMISSION,
      shell: 'desktop',
      spec: browser,
      element: createElement(ArchiveBrowserPage, { surface }),
      nav: { labelKey: 'archive.nav.archive', order: 8, glyph: '▤' },
    },
    {
      path: `/${surface}/archive/:projectId`,
      code: portal.code,
      surface,
      status: 'built',
      permission: PERMISSION,
      shell: 'desktop',
      spec: portal,
      element: createElement(ProjectPortalPage, { surface }),
    },
  ] satisfies RouteDef[];
});
