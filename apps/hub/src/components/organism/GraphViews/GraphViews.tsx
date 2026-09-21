import { lazy } from 'react';
import './GraphViews.css';

export * from './types';
export { LanesView } from './LanesView';
export { RadialView } from './RadialView';
export { ObjectsMapView } from './ObjectsMapView';
export { isWebGLAvailable, usePrefersReducedMotion, useWebGLAvailable } from './env';
export { hopsFrom, neighbourMap } from './layouts';

/**
 * The 3D view is the only thing in the app that pulls three.js, so it is split out: pages that never open
 * K-04 (or open it on another tab) never download it. Render it inside a `<Suspense>` with a `Skeleton`.
 */
export const Objects3DView = lazy(() => import('./Objects3DView'));
