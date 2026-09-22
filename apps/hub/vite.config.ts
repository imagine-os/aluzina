import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const docsDir = fileURLToPath(new URL('../../docs', import.meta.url));

const rootPkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string };

// The hub is the root of the GitHub Pages site (D-001, D-002): it builds into repo-root dist/.
// apps/business-os will build into dist/business-os/ next to it (D-003).
export default defineConfig({
  plugins: [react()],
  base: './',
  // `@docs/*` imports repo docs into the app (docs/plan/plan.json for the PM viewer, D-037); mirrored in tsconfig `paths`.
  resolve: { alias: { '@docs': docsDir } },
  server: { fs: { allow: [repoRoot] } },
  define: {
    __APP_VERSION__: JSON.stringify(rootPkg.version),
    __BUILD_ID__: JSON.stringify(Date.now().toString(36)),
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Every lazy archive chunk is an `index.json` (docs/archive/projects/<slug>/index.json, D-071), so Rollup would name them
        // all `index-<hash>.js`; name them by the project slug instead so the network panel and the Pages deploy read.
        chunkFileNames: (chunk) => {
          const m = /[\\/]docs[\\/]archive[\\/]projects[\\/]([^\\/]+)[\\/]index\.json$/.exec(chunk.facadeModuleId ?? '');
          return m ? `assets/archive-${m[1]}-[hash].js` : 'assets/[name]-[hash].js';
        },
      },
    },
  },
});
