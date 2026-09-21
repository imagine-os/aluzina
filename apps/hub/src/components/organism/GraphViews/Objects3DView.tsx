import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDocumentHidden, useGraphPalette, type GraphPalette } from './env';
import { bandLayout3d, hopsFrom, neighbourMap, type Point, type Point3 } from './layouts';
import { NodeLayer } from './NodeLayer';
import type { GraphViewHandle, GraphViewProps, NodeImage, ViewNode } from './types';

/**
 * 3D objects (K-04's primary view), rebuilt on the imagine-os graph gallery's `demos/three-objects-3d`
 * (three.js 0.186.0, MIT; https://imagine-os.github.io/graph-gallery/demos/three-objects-3d). The technique
 * is the gallery's - a ground grid, depth bands per type, every node drawn as an object carrying its own
 * picture, curved relation edges, always-visible labels - reimplemented here against our data and tokens;
 * no gallery code is copied and no glTF models or addons are loaded (the bodies are three primitives and
 * the pictures are canvas textures, so the chunk stays small and there is nothing to fetch at runtime).
 *
 * Everything interactive lives in the `NodeLayer` overlay, so the scene is reachable by keyboard and by
 * touch exactly like the 2D views (P-03, P-04): the camera follows the focused node, − / + / fit / reset /
 * auto-rotate are buttons on the page. The render loop stops when the tab is hidden and when nothing moves,
 * and every geometry, material and texture is disposed on unmount.
 */

const CAM = { fov: 42, minR: 4, maxR: 120, phiMin: 0.12, phiMax: Math.PI / 2.1 };
const BODY_Y = 0.45;
const PIC_Y = 1.95;
const LABEL_Y = 1.05;

interface Disposables {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/**
 * The node's own picture as a canvas texture: a page thumbnail (drawn as soon as it loads, with the glyph
 * tile underneath while it does not), a person's initials, or a system glyph.
 */
function pictureTexture(image: NodeImage, tone: string, palette: GraphPalette, onLoaded: () => void): THREE.CanvasTexture {
  const W = 192;
  const H = image.kind === 'thumb' ? 128 : 192;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d')!;
  const paintBase = () => {
    g.clearRect(0, 0, W, H);
    g.fillStyle = palette.surface;
    roundRect(g, 4, 4, W - 8, H - 8, 18);
    g.fill();
    g.lineWidth = 6;
    g.strokeStyle = tone;
    g.stroke();
  };
  const font = (size: number, weight = '600') => `${weight} ${size}px Inter, "Segoe UI", Helvetica, Arial, sans-serif`;
  paintBase();
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  if (image.kind === 'initials') {
    g.fillStyle = tone;
    g.beginPath();
    g.arc(W / 2, H / 2, W / 2 - 22, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = palette.surface;
    g.font = font(64);
    g.fillText(image.text.slice(0, 2), W / 2, H / 2 + 2);
  } else {
    g.fillStyle = image.kind === 'thumb' ? palette.muted : tone;
    g.font = font(image.kind === 'thumb' ? 34 : 88);
    g.fillText(image.text.slice(0, 2), W / 2, H / 2 - (image.kind === 'thumb' ? 10 : 0));
    if (image.kind === 'thumb') {
      g.font = font(24, '500');
      g.fillStyle = palette.muted;
      g.fillText(image.code ?? '', W / 2, H / 2 + 28);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (image.kind === 'thumb' && image.src) {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      paintBase();
      g.save();
      roundRect(g, 8, 8, W - 16, H - 16, 14);
      g.clip();
      const s = Math.max((W - 16) / img.width, (H - 16) / img.height);
      g.drawImage(img, W / 2 - (img.width * s) / 2, H / 2 - (img.height * s) / 2, img.width * s, img.height * s);
      g.restore();
      texture.needsUpdate = true;
      onLoaded();
    };
    img.src = image.src;
  }
  return texture;
}

function labelTexture(node: ViewNode, palette: GraphPalette): { texture: THREE.CanvasTexture; aspect: number } {
  const title = node.label.length > 26 ? `${node.label.slice(0, 25)}…` : node.label;
  const sub = node.sub ?? '';
  const canvas = document.createElement('canvas');
  const g = canvas.getContext('2d')!;
  const f1 = '600 40px Inter, "Segoe UI", Helvetica, Arial, sans-serif';
  const f2 = '400 30px Inter, "Segoe UI", Helvetica, Arial, sans-serif';
  g.font = f1;
  const w1 = g.measureText(title).width;
  g.font = f2;
  const w2 = sub ? g.measureText(sub).width : 0;
  canvas.width = Math.ceil(Math.max(w1, w2)) + 40;
  canvas.height = sub ? 100 : 62;
  const c = canvas.getContext('2d')!;
  c.fillStyle = palette.surface;
  roundRect(c, 0, 0, canvas.width, canvas.height, 16);
  c.fill();
  c.textBaseline = 'middle';
  c.font = f1;
  c.fillStyle = palette.text;
  c.fillText(title, 20, sub ? 30 : 31);
  if (sub) {
    c.font = f2;
    c.fillStyle = palette.muted;
    c.fillText(sub, 20, 72);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, aspect: canvas.width / canvas.height };
}

/** One primitive per node kind: areas are plinths, posts pages, people spheres, tools cylinders. */
function bodyGeometry(kind: string, store: Disposables): THREE.BufferGeometry {
  const make = (g: THREE.BufferGeometry) => {
    store.geometries.push(g);
    return g;
  };
  switch (kind) {
    case 'area':
      return make(new THREE.BoxGeometry(1.5, 0.9, 1.5));
    case 'topic':
      return make(new THREE.BoxGeometry(1.05, 0.7, 1.05));
    case 'post':
      return make(new THREE.BoxGeometry(0.9, 1.2, 0.12));
    case 'role':
      return make(new THREE.SphereGeometry(0.55, 20, 14));
    case 'client':
      return make(new THREE.CylinderGeometry(0.55, 0.62, 0.8, 18));
    case 'deliverable':
      return make(new THREE.ConeGeometry(0.6, 1, 4));
    case 'tool':
      return make(new THREE.CylinderGeometry(0.42, 0.42, 0.9, 14));
    case 'project':
      return make(new THREE.BoxGeometry(1.2, 0.6, 0.9));
    default:
      return make(new THREE.OctahedronGeometry(0.52));
  }
}

export const Objects3DView = forwardRef<GraphViewHandle, GraphViewProps>(function Objects3DView(
  { nodes, edges, focusKey, onFocus, onOpen, label, labels, autoRotate, reducedMotion },
  ref,
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const hidden = useDocumentHidden();
  const palette = useGraphPalette(wrapRef);
  const positions = useMemo(() => bandLayout3d(nodes, edges, focusKey), [nodes, edges, focusKey]);
  const hops = useMemo(() => hopsFrom(nodes, edges, focusKey), [nodes, edges, focusKey]);
  const neighbours = useMemo(() => neighbourMap(nodes, edges), [nodes, edges]);
  /** Mutated in place every frame; NodeLayer reads it when it renders the hover / focus card. */
  const screen = useRef(new Map<string, Point>()).current;
  const layerEl = useRef<HTMLUListElement | null>(null);
  const autoRotateRef = useRef(Boolean(autoRotate));
  const ringsRef = useRef<{ focusRing: THREE.Mesh; activeRing: THREE.Mesh; holders: Map<string, THREE.Object3D>; invalidate: () => void } | null>(null);

  const api = useRef<{
    zoomBy: (f: number) => void;
    fit: () => void;
    reset: () => void;
    centreOn: (key: string) => void;
    setAutoRotate: (on: boolean) => void;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    zoomIn: () => api.current?.zoomBy(1 / 1.3),
    zoomOut: () => api.current?.zoomBy(1.3),
    fit: () => api.current?.fit(),
    reset: () => {
      setActive(null);
      api.current?.reset();
    },
    centreOn: (key: string) => api.current?.centreOn(key),
  }), []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !nodes.length) return;
    const store: Disposables = { geometries: [], materials: [], textures: [] };
    const keep = <T extends THREE.Material>(m: T) => {
      store.materials.push(m);
      return m;
    };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(wrap.clientWidth || 800, wrap.clientHeight || 520, false);
    renderer.domElement.className = 'gview__canvas';
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAM.fov, (wrap.clientWidth || 800) / (wrap.clientHeight || 520), 0.1, 600);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x404050, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(6, 14, 8);
    scene.add(key);

    const grid = new THREE.GridHelper(70, 35, new THREE.Color(palette.border), new THREE.Color(palette.border));
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    grid.position.y = -0.02;
    store.geometries.push(grid.geometry);
    store.materials.push(grid.material as THREE.Material);
    scene.add(grid);

    // ---- nodes: body + picture sprite + label sprite underneath -------------------------------------
    const pictureGeom = new THREE.PlaneGeometry(1, 1);
    store.geometries.push(pictureGeom);
    const holders = new Map<string, THREE.Object3D>();
    let dirty = true;
    let raf = 0;
    let running = false;
    let last = performance.now();
    const invalidate = () => {
      dirty = true;
      start();
    };
    for (const n of nodes) {
      const p = positions.get(n.key) as Point3 | undefined;
      if (!p) continue;
      const tone = palette.kind[n.kind] ?? palette.muted;
      const group = new THREE.Group();
      group.position.set(p.x, 0, p.z);
      const body = new THREE.Mesh(bodyGeometry(n.kind, store), keep(new THREE.MeshStandardMaterial({ color: new THREE.Color(tone), roughness: 0.55, metalness: 0.05 })));
      body.position.y = BODY_Y;
      group.add(body);

      const pic = pictureTexture(n.image, tone, palette, invalidate);
      store.textures.push(pic);
      const picSprite = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: pic, transparent: true, depthWrite: false })));
      const picAspect = n.image.kind === 'thumb' ? 1.5 : 1;
      const picH = n.size === 'lg' ? 1.9 : 1.5;
      picSprite.scale.set(picH * picAspect, picH, 1);
      picSprite.position.y = PIC_Y;
      group.add(picSprite);

      const lab = labelTexture(n, palette);
      store.textures.push(lab.texture);
      const labSprite = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: lab.texture, transparent: true, depthWrite: false })));
      const labH = 0.5;
      labSprite.scale.set(labH * lab.aspect, labH, 1);
      labSprite.position.y = LABEL_Y;
      group.add(labSprite);

      scene.add(group);
      holders.set(n.key, group);
    }

    // ---- focus / active rings ------------------------------------------------------------------------
    const ringGeom = new THREE.RingGeometry(0.95, 1.15, 40);
    store.geometries.push(ringGeom);
    const focusRing = new THREE.Mesh(ringGeom, keep(new THREE.MeshBasicMaterial({ color: new THREE.Color(palette.focus), transparent: true, opacity: 0.9, side: THREE.DoubleSide })));
    focusRing.rotation.x = -Math.PI / 2;
    focusRing.visible = false;
    scene.add(focusRing);
    const activeRing = new THREE.Mesh(ringGeom, keep(new THREE.MeshBasicMaterial({ color: new THREE.Color(palette.text), transparent: true, opacity: 0.55, side: THREE.DoubleSide })));
    activeRing.rotation.x = -Math.PI / 2;
    activeRing.visible = false;
    scene.add(activeRing);

    // ---- edges: one line object per edge class, curved through a raised mid point ---------------------
    const byClass: Record<string, number[]> = { child: [], filed: [], relation: [] };
    for (const e of edges) {
      const a = positions.get(e.from);
      const b = positions.get(e.to);
      if (!a || !b) continue;
      const cls = e.kind === 'child' || e.kind === 'filed' ? e.kind : 'relation';
      const from = new THREE.Vector3(a.x, BODY_Y + 0.3, a.z);
      const to = new THREE.Vector3(b.x, BODY_Y + 0.3, b.z);
      const mid = from.clone().lerp(to, 0.5);
      mid.y += 0.5 + from.distanceTo(to) * 0.12;
      const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
      const pts = curve.getPoints(14);
      for (let i = 0; i < pts.length - 1; i++) byClass[cls].push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
    }
    for (const [cls, list] of Object.entries(byClass)) {
      if (!list.length) continue;
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(list, 3));
      store.geometries.push(geom);
      const colour = new THREE.Color(palette.edge[cls as 'child' | 'filed' | 'relation']);
      const mat = keep(new THREE.LineBasicMaterial({ color: colour, transparent: true, opacity: cls === 'relation' ? 0.75 : 0.5 }));
      scene.add(new THREE.LineSegments(geom, mat));
    }

    // ---- camera: spherical around a target, driven by the page buttons and by drag / pinch ------------
    const target = new THREE.Vector3(0, 1, 0);
    const home = { theta: Math.PI * 0.25, phi: Math.PI * 0.32, radius: 30 };
    const cam = { ...home };
    const tween = { active: false, from: new THREE.Vector3(), to: new THREE.Vector3(), t: 0 };
    const place = () => {
      camera.position.set(
        target.x + cam.radius * Math.sin(cam.phi) * Math.sin(cam.theta),
        target.y + cam.radius * Math.cos(cam.phi),
        target.z + cam.radius * Math.sin(cam.phi) * Math.cos(cam.theta),
      );
      camera.lookAt(target);
      dirty = true;
    };
    const fit = () => {
      const pts = [...positions.values()];
      const xs = pts.map((p) => p.x);
      const zs = pts.map((p) => p.z);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
      const rx = (Math.max(...xs) - Math.min(...xs)) / 2 + 2.5;
      const rz = (Math.max(...zs) - Math.min(...zs)) / 2 + 2.5;
      const tan = Math.tan((camera.fov * Math.PI) / 360);
      target.set(cx, 1, cz);
      // frame the ground disc: the wider of "fits across" and "fits in depth", then a small margin
      cam.radius = Math.min(CAM.maxR, Math.max(CAM.minR, Math.max(rx / (tan * camera.aspect), rz / tan * 0.62) * 1.3));
      place();
      start();
    };
    fit();

    api.current = {
      zoomBy: (f) => {
        cam.radius = Math.min(CAM.maxR, Math.max(CAM.minR, cam.radius * f));
        place();
        start();
      },
      fit,
      reset: () => {
        cam.theta = home.theta;
        cam.phi = home.phi;
        fit();
      },
      centreOn: (nodeKey) => {
        const p = positions.get(nodeKey);
        if (!p) return;
        const to = new THREE.Vector3(p.x, 1, p.z);
        if (reducedMotion) {
          target.copy(to);
          place();
        } else {
          tween.from.copy(target);
          tween.to.copy(to);
          tween.t = 0;
          tween.active = true;
        }
        start();
      },
      setAutoRotate: () => start(),
    };

    // ---- pointer: drag orbits, two fingers pinch (buttons do the same job without a pointer) ----------
    const pointers = new Map<number, { x: number; y: number }>();
    let drag: { x: number; y: number; theta: number; phi: number } | null = null;
    let pinch: { dist: number; radius: number } | null = null;
    const canvas = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      canvas.setPointerCapture(e.pointerId);
      if (pointers.size === 1) drag = { x: e.clientX, y: e.clientY, theta: cam.theta, phi: cam.phi };
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, radius: cam.radius };
        drag = null;
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        cam.radius = Math.min(CAM.maxR, Math.max(CAM.minR, (pinch.radius * pinch.dist) / d));
        place();
        start();
        return;
      }
      if (!drag) return;
      cam.theta = drag.theta - (e.clientX - drag.x) * 0.006;
      cam.phi = Math.min(CAM.phiMax, Math.max(CAM.phiMin, drag.phi - (e.clientY - drag.y) * 0.005));
      place();
      start();
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (!pointers.size) drag = null;
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    // ---- overlay projection: the keyboard / touch buttons sit exactly over their object ---------------
    const projected = new THREE.Vector3();
    const syncOverlay = () => {
      const list = layerEl.current;
      if (!list) return;
      const w = renderer.domElement.clientWidth;
      const h = renderer.domElement.clientHeight;
      for (const [nodeKey, group] of holders) {
        const el = list.querySelector<HTMLElement>(`[data-node-key="${CSS.escape(nodeKey)}"]`);
        if (!el) continue;
        projected.set(group.position.x, PIC_Y, group.position.z).project(camera);
        const behind = projected.z > 1;
        const x = (projected.x * 0.5 + 0.5) * w;
        const y = (-projected.y * 0.5 + 0.5) * h;
        screen.set(nodeKey, { x, y });
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        el.style.visibility = behind ? 'hidden' : 'visible';
      }
    };

    // ---- render loop: runs only while something moves, never while the tab is hidden -----------------
    function loop() {
      raf = 0;
      running = false;
      if (document.hidden) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let moving = false;
      if (tween.active) {
        tween.t = Math.min(1, tween.t + dt * 2.2);
        const e = 1 - Math.pow(1 - tween.t, 3);
        target.lerpVectors(tween.from, tween.to, e);
        if (tween.t >= 1) tween.active = false;
        place();
        moving = true;
      }
      if (autoRotateRef.current && !reducedMotion) {
        cam.theta += dt * 0.22;
        place();
        moving = true;
      }
      if (dirty || moving) {
        renderer.render(scene, camera);
        syncOverlay();
        dirty = false;
      }
      if (moving || dirty) start();
    }
    function start() {
      if (running || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth || 800;
      const h = wrap.clientHeight || 520;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      dirty = true;
      start();
    });
    ro.observe(wrap);

    ringsRef.current = { focusRing, activeRing, holders, invalidate };
    start();

    return () => {
      ringsRef.current = null;
      api.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      scene.clear();
      for (const g of store.geometries) g.dispose();
      for (const m of store.materials) m.dispose();
      for (const t of store.textures) t.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      screen.clear();
    };
    // `autoRotate` is read through a ref so toggling it never rebuilds the scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, positions, palette, reducedMotion, screen]);


  useEffect(() => {
    autoRotateRef.current = Boolean(autoRotate) && !reducedMotion;
    api.current?.setAutoRotate(autoRotateRef.current);
  }, [autoRotate, reducedMotion]);

  useEffect(() => {
    if (hidden) return;
    ringsRef.current?.invalidate();
  }, [hidden]);

  // Move the two rings without touching the scene graph.
  useEffect(() => {
    const r = ringsRef.current;
    if (!r) return;
    const put = (mesh: THREE.Mesh, nodeKey: string | null) => {
      const group = nodeKey ? r.holders.get(nodeKey) : null;
      mesh.visible = Boolean(group);
      if (group) mesh.position.set(group.position.x, 0.03, group.position.z);
    };
    put(r.focusRing, focusKey);
    put(r.activeRing, active);
    r.invalidate();
  }, [focusKey, active, nodes]);

  return (
    <div className="gview gview--objects3d" ref={wrapRef} role="region" aria-label={label} aria-describedby="gview-help-objects3d">
      <p id="gview-help-objects3d" className="visually-hidden">{labels.help}</p>
      <NodeLayer
        nodes={nodes}
        positions={screen}
        neighbours={neighbours}
        hops={hops}
        focusKey={focusKey}
        active={active}
        onActive={setActive}
        onFocus={onFocus}
        onOpen={onOpen}
        onCentre={(k) => api.current?.centreOn(k)}
        labels={labels}
        manualPositions
        layerRef={(el) => {
          layerEl.current = el;
        }}
      />
    </div>
  );
});

export default Objects3DView;
