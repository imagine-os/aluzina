import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../../design/cx';
import './Shimmer.css';

export type ShimmerFinish = 'metal' | 'iridescent';

export interface ShimmerProps {
  /** `metal` = anisotropic brushed metal from the --metal-* vars; `iridescent` = thin-film pastel shift. */
  finish?: ShimmerFinish;
  /** 0..1, how strong the streaks / interference read. Default 0.6. */
  intensity?: number;
  /** Override the motion decision; defaults to `prefers-reduced-motion` (static frame when reduced). */
  motion?: boolean;
  /** Accessible name; without it the canvas is decorative (aria-hidden). */
  label?: string;
  className?: string;
  /** Overlaid content. Always ink text: the finish is a light surface in both themes. */
  children?: ReactNode;
}

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

/** Brushed metal (two specular streaks on a 135deg axis) and thin-film iridescence, both driven by uPointer. */
const FRAG = `#version 300 es
precision mediump float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uPointer; uniform float uInt; uniform float uMode;
uniform vec3 uBase; uniform vec3 uHigh; uniform vec3 uShade;
out vec4 frag;
float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453123); }
float vn(float x) { float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(hash(i), hash(i + 1.0), f); }
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 pt = uPointer;
  vec3 col;
  if (uMode < 0.5) {
    float axis = (uv.x + (1.0 - uv.y)) * 0.5;
    float across = (uv.x - (1.0 - uv.y)) * 0.5;
    float grain = vn(across * 520.0) * 0.6 + vn(across * 130.0) * 0.4 - 0.5;
    float t = clamp(axis + grain * 0.06 * uInt, 0.0, 1.0);
    col = mix(uShade, uBase, smoothstep(0.0, 1.0, t + 0.35));
    float d1 = axis - (0.24 + pt.x * 0.34 + pt.y * 0.06 + sin(uTime * 0.09) * 0.05);
    float d2 = axis - (0.70 + pt.x * 0.26 - pt.y * 0.08 + cos(uTime * 0.07) * 0.05);
    float spec = exp(-d1 * d1 / 0.0090) + 0.8 * exp(-d2 * d2 / 0.0045);
    col = mix(col, uHigh, clamp(spec * (0.30 + 0.70 * uInt), 0.0, 1.0));
    col += grain * 0.03 * uInt;
  } else {
    float ph = clamp(uv.y * 0.85 + uv.x * 0.18 + (pt.y - 0.5) * 0.22 + sin(uTime * 0.05 + uv.x * 3.0) * 0.05, 0.0, 1.0);
    vec3 peri = vec3(0.761, 0.820, 0.969), aqua = vec3(0.510, 0.996, 0.906), lime = vec3(0.867, 1.0, 0.475);
    col = ph < 0.5 ? mix(peri, aqua, smoothstep(0.0, 0.5, ph)) : mix(aqua, lime, smoothstep(0.5, 1.0, ph));
    float film = 0.5 + 0.5 * sin(ph * 18.85 + uTime * 0.15 + pt.x * 2.0);
    col = mix(col, vec3(1.0), film * 0.18 * uInt);
  }
  frag = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return null;
  return sh;
}

function hexToRgb(value: string): [number, number, number] {
  const m = /#?([0-9a-f]{6})/i.exec(value.trim());
  if (!m) return [0.6, 0.53, 0.43];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/**
 * Shader surface for the brand finishes (docs/design/brand-system.md section 3): a WebGL2 canvas with no
 * dependencies, painted from the live `--metal-*` vars so it follows theme and the gold / silver switch.
 * Decorative only (P-03): it never carries information, it renders a single static frame under
 * `prefers-reduced-motion`, it pauses off-screen and on a hidden tab, and it falls back to the CSS
 * gradient (`.surface-metal` / `.surface-iridescent`) when WebGL2 is missing or the program fails.
 */
export function Shimmer({ finish = 'metal', intensity = 0.6, motion, label, className, children }: ShimmerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const reduced = usePrefersReducedMotion();
  const animate = motion ?? !reduced;
  const intensityRef = useRef(intensity);
  intensityRef.current = Math.min(1, Math.max(0, intensity));

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas || failed) return;
    // alpha: true keeps the CSS gradient visible under a canvas that has not drawn yet (off-screen tiles).
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: true, powerPreference: 'low-power' });
    const vs = gl && compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = gl && compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl && vs && fs ? gl.createProgram() : null;
    if (!gl || !vs || !fs || !prog) {
      setFailed(true);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u('uRes'), uTime = u('uTime'), uPointer = u('uPointer'), uInt = u('uInt'), uMode = u('uMode');
    const uBase = u('uBase'), uHigh = u('uHigh'), uShade = u('uShade');
    gl.uniform1f(uMode, finish === 'metal' ? 0 : 1);

    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let visible = true;
    let raf = 0;
    const t0 = performance.now();

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      gl.useProgram(prog);
      gl.uniform3fv(uBase, hexToRgb(cs.getPropertyValue('--metal-base') || '#98876D'));
      gl.uniform3fv(uHigh, hexToRgb(cs.getPropertyValue('--metal-highlight') || '#F1D7AA'));
      gl.uniform3fv(uShade, hexToRgb(cs.getPropertyValue('--metal-shade') || '#6F6250'));
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(host.clientWidth * dpr));
      const h = Math.max(1, Math.round(host.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
      }
    };

    const draw = (ms: number) => {
      resize();
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      gl.useProgram(prog);
      gl.uniform1f(uTime, animate ? (ms - t0) / 1000 : 0);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uInt, intensityRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const tick = (ms: number) => {
      draw(ms);
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      const on = visible && !document.hidden;
      if (on && animate) {
        if (!raf) raf = requestAnimationFrame(tick);
      } else {
        stop();
        if (on) draw(performance.now());
      }
    };

    const onPointer = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      pointer.tx = Math.min(1, Math.max(0, (e.clientX - r.left) / Math.max(1, r.width)));
      pointer.ty = Math.min(1, Math.max(0, (e.clientY - r.top) / Math.max(1, r.height)));
      if (!animate) draw(performance.now());
    };
    const onLeave = () => {
      pointer.tx = 0.5;
      pointer.ty = 0.5;
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      pointer.tx = Math.min(1, Math.max(0, 0.5 + e.gamma / 90));
      pointer.ty = Math.min(1, Math.max(0, 0.5 + (e.beta - 45) / 90));
    };

    readColors();
    resize();
    draw(performance.now());
    const themes = new MutationObserver(() => {
      readColors();
      if (!animate) draw(performance.now());
    });
    themes.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-metal'] });
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((en) => en.isIntersecting);
      sync();
    });
    io.observe(host);
    const ro = new ResizeObserver(() => {
      if (!animate) draw(performance.now());
      else resize();
    });
    ro.observe(host);
    document.addEventListener('visibilitychange', sync);
    if (animate) {
      host.addEventListener('pointermove', onPointer);
      host.addEventListener('pointerleave', onLeave);
      window.addEventListener('deviceorientation', onTilt);
    } else {
      host.addEventListener('pointermove', onPointer);
    }
    sync();

    return () => {
      stop();
      themes.disconnect();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', sync);
      host.removeEventListener('pointermove', onPointer);
      host.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('deviceorientation', onTilt);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [finish, animate, failed]);

  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const };
  return (
    <div ref={hostRef} className={cx('shimmer', `shimmer--${finish}`, className)} data-shimmer={finish} data-fallback={failed ? '' : undefined}>
      {!failed && <canvas ref={canvasRef} className="shimmer__canvas" {...a11y} />}
      {children !== undefined && <div className="shimmer__content">{children}</div>}
    </div>
  );
}
