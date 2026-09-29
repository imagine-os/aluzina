#!/usr/bin/env node
/**
 * Desk layout check (the desk system, `apps/hub/src/desk/layout.ts`): lays out every registered desk model at seven
 * stage widths and fails (exit 1) on any overlap — object / object, object outside its sub-mat, sub-mat / sub-mat,
 * sub-mat outside its mat, a person's station on a sub-mat, mat / mat — or an object off the half-square grid.
 * Plain Node + esbuild (already installed with Vite): the TS sources are bundled in memory, nothing is written.
 *
 *   node scripts/desk-check.mjs            # every model, seven widths
 *   node scripts/desk-check.mjs --verbose  # one line per model and width
 *
 * Models: a synthetic desk with every object kind (multi-row devices mixed with 1x1 / 2x1 papers), W-04's playbook
 * desk and the client hub desks (every lens). Runs inside `npm run build` after `tenant:validate`.
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'apps/hub/src');
const verbose = process.argv.includes('--verbose');

/** Models checked: add a line when a module builds its own desk model. */
const entry = `
export { layoutDesk } from './desk/layout';
export { defaultPerRow } from './desk/types';
import { syntheticDesk } from './desk/checkModels';
import { playbookDeskModel } from './modules/desk/playbookDesk';
export const deskCheckModels = () => [
  { name: 'synthetic (every kind)', model: syntheticDesk() },
  { name: 'W-04 playbook', model: playbookDeskModel() },
];
`;

const out = await build({
  stdin: { contents: entry, resolveDir: src, loader: 'ts' },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  logLevel: 'silent',
  loader: { '.json': 'json', '.md': 'text', '.css': 'empty' },
  alias: { '@docs': resolve(root, 'docs') },
  define: { __APP_VERSION__: '"check"', __BUILD_ID__: '"check"', 'import.meta.env.DEV': 'false', 'import.meta.env.BASE_URL': '"./"' },
  jsx: 'automatic',
}).catch((e) => {
  console.error(`desk-check: bundling failed\n${e.message}`);
  process.exit(1);
});
const mod = await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);
const { layoutDesk, defaultPerRow, deskCheckModels } = mod;

// Stage sizes (css px): the seven matrix widths at a typical viewport height, the stage at ~60 % of it.
const STAGES = [
  [360, 780], [390, 844], [768, 1024], [1280, 800], [1920, 1080], [2560, 1440], [3840, 2160],
].map(([w, h]) => ({ w, h: Math.round(h * 0.6) }));

const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const inside = (a, b) => a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
const failures = [];
let checks = 0;

for (const { name, model } of deskCheckModels()) {
  for (const stage of STAGES) {
    const perRow = (model.perRow ?? defaultPerRow)(stage.w / stage.h, model.mats.length);
    const people = new Set((model.people ?? []).map((p) => p.phase));
    const l = layoutDesk(model, perRow, people);
    const where = `${name} @ ${stage.w}px (${perRow}/row)`;
    const fail = (msg) => failures.push(`${where}: ${msg}`);
    for (let i = 0; i < l.mats.length; i++) {
      const m = l.mats[i];
      const mr = { x: m.x, y: m.y, w: m.w, h: m.h };
      for (let j = i + 1; j < l.mats.length; j++) if (overlap(mr, l.mats[j])) fail(`mats ${m.id} and ${l.mats[j].id} overlap`);
      const subs = m.subs.map((s) => ({ id: s.id, x: s.x, y: s.y, w: s.w, h: s.h, items: s.items }));
      for (let a = 0; a < subs.length; a++) {
        const s = subs[a];
        if (!inside(s, { x: 0, y: 0, w: m.w, h: m.h })) fail(`sub-mat ${s.id} outside its mat`);
        for (let b = a + 1; b < subs.length; b++) if (overlap(s, subs[b])) fail(`sub-mats ${s.id} and ${subs[b].id} overlap`);
        if (m.person && overlap(s, m.person)) fail(`the person on ${m.id} sits on sub-mat ${s.id}`);
        for (const it of s.items) {
          checks++;
          if (!inside({ x: it.x, y: it.y, w: it.cw, h: it.ch }, { x: 0, y: 0, w: s.w, h: s.h })) fail(`${it.id} (${it.kind}) outside sub-mat ${s.id}`);
          if (it.x % 32 !== 0 || (it.y - 24) % 32 !== 0) fail(`${it.id} off the grid (${it.x}, ${it.y})`);
        }
      }
      if (m.person && !inside(m.person, { x: 0, y: 0, w: m.w, h: m.h })) fail(`the person on ${m.id} is outside its mat`);
    }
    const items = l.items;
    for (let a = 0; a < items.length; a++) {
      const A = { x: items[a].x, y: items[a].y, w: items[a].cw, h: items[a].ch };
      for (let b = a + 1; b < items.length; b++) {
        const B = items[b];
        if (overlap(A, { x: B.x, y: B.y, w: B.cw, h: B.ch })) fail(`${items[a].id} and ${B.id} overlap`);
      }
    }
    if (verbose) console.log(`${where}: ${items.length} objects, ${l.mats.length} mats, ${l.width} x ${l.height}`);
  }
}

if (failures.length) {
  for (const f of failures.slice(0, 50)) console.error(`desk-check: ${f}`);
  console.error(`desk-check: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log(`OK desk-check — ${deskCheckModels().length} models x ${STAGES.length} widths, ${checks} object placements, no overlaps`);
