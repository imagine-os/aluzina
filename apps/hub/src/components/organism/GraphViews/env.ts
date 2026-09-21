import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';

/**
 * Environment the graph views adapt to: is WebGL usable at all, does the person want less motion, and what
 * do the design tokens currently resolve to (the 3D scene cannot read CSS variables, so it reads them once
 * per theme and rebuilds its materials).
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

/** True while the document is hidden, so the 3D render loop can stop instead of burning the battery. */
export function useDocumentHidden(): boolean {
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  useEffect(() => {
    const on = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return hidden;
}

export interface GraphPalette {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  /** Tone per node kind, same mapping as the legend dots in `spaces.css`. */
  kind: Record<string, string>;
  edge: Record<'child' | 'filed' | 'relation', string>;
  focus: string;
}

const KIND_VAR: Record<string, string> = {
  area: '--color-primary',
  topic: '--color-accent',
  role: '--color-success',
  client: '--color-warning',
  deliverable: '--color-danger',
  tool: '--color-text-muted',
  project: '--color-accent',
  archive: '--color-border',
  post: '--color-accent-soft',
  other: '--color-text-muted',
};

const FALLBACK = '#888888';

function readPalette(el: Element | null): GraphPalette {
  const cs = el && typeof getComputedStyle === 'function' ? getComputedStyle(el) : null;
  const v = (name: string, fallback = FALLBACK) => (cs?.getPropertyValue(name) || '').trim() || fallback;
  return {
    bg: v('--color-bg', '#ffffff'),
    surface: v('--color-surface', '#ffffff'),
    text: v('--color-text', '#111111'),
    muted: v('--color-text-muted', '#777777'),
    border: v('--color-border', '#cccccc'),
    focus: v('--color-accent', '#d97706'),
    kind: Object.fromEntries(Object.entries(KIND_VAR).map(([k, name]) => [k, v(name)])),
    edge: { child: v('--color-border', '#cccccc'), filed: v('--color-accent', '#d97706'), relation: v('--color-text-muted', '#777777') },
  };
}

/**
 * Token colours resolved against `ref`, re-read whenever the theme attribute changes (ThemeProvider sets
 * `data-theme` on `<html>`), so the 3D scene follows light / dark like every other page.
 */
export function useGraphPalette(ref: RefObject<Element>): GraphPalette {
  const [theme, setTheme] = useState(() => (typeof document === 'undefined' ? 'light' : document.documentElement.getAttribute('data-theme') ?? 'light'));
  const [ready, setReady] = useState(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    setReady(true);
    const obs = new MutationObserver(() => setTheme(document.documentElement.getAttribute('data-theme') ?? 'light'));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  // `ready` and `theme` are the only reasons to re-read; the ref itself never changes identity.
  return useMemo(() => readPalette(ref.current), [ref, theme, ready]);
}
