import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rootPkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string };

// The hub is the root of the GitHub Pages site (D-001, D-002): it builds into repo-root dist/.
// apps/business-os will build into dist/business-os/ next to it (D-003).
export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(rootPkg.version),
    __BUILD_ID__: JSON.stringify(Date.now().toString(36)),
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
});
