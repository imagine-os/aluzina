// Copies the static Claude Design bundle apps/business-os/ into dist/business-os/ (D-003, D-007)
// and writes dist/.nojekyll so Pages serves the dot-files the runtime needs
// (.image-slots.state.json, .thumbnail). No bundling: the export is served as-is.
import { cpSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = join(root, 'apps', 'business-os');
const dist = join(root, 'dist');
const out = join(dist, 'business-os');

if (!existsSync(join(dist, 'index.html'))) {
  console.error('copy-static: dist/index.html missing; run the hub build first');
  process.exit(1);
}
mkdirSync(out, { recursive: true });
let files = 0;
cpSync(src, out, {
  recursive: true,
  filter: (p) => {
    const base = p.slice(src.length).replace(/\\/g, '/');
    if (base === '/README.md' || base === '/vendor/README.md') return false;
    if (statSync(p).isFile()) files++;
    return true;
  },
});
writeFileSync(join(dist, '.nojekyll'), '');
console.log(`copy-static: ${files} files -> dist/business-os/, wrote dist/.nojekyll`);
