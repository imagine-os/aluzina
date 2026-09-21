import { useEffect, useState } from 'react';

/**
 * Environment hooks any page or organism may need (moved here from GraphViews/env.ts in 0013): is WebGL
 * usable at all, does the person want less motion, is the document hidden. The graph views, the canvas
 * (D-07), the simulator (D-08) and the Shimmer finish are the callers today.
 */

let webglProbe: boolean | null = null;

/** One probe per session: a throwaway context, released immediately. */
export function isWebGLAvailable(): boolean {
  if (webglProbe !== null) return webglProbe;
  if (typeof document === 'undefined') return (webglProbe = false);
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | null;
    webglProbe = Boolean(gl);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglProbe = false;
  }
  return webglProbe;
}

export function useWebGLAvailable(): boolean {
  const [ok] = useState(isWebGLAvailable);
  return ok;
}

/** `prefers-reduced-motion: reduce`, live: an animation must stop when the setting changes, not on the next reload. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** True while the document is hidden, so a render loop can stop instead of burning the battery. */
export function useDocumentHidden(): boolean {
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  useEffect(() => {
    const on = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return hidden;
}
