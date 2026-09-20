// Deploy-time thumbnails for the hub cards (D-011): serves dist/ locally, screenshots every
// linked surface with Playwright Chromium at 1280x800 (device scale 1), downsizes to 640x400
// JPEG (quality 80) and writes dist/thumbs/<code>.jpg + dist/thumbs/manifest.json.
// Never commit the output: CI runs `npm run thumbs` after `npm run build` on every deploy so the
// thumbnails always match the live pages.
//
// Usage: node scripts/thumbnails.mjs [--dist=dist] [--port=4180] [--skip-external] [--only=HUB-01,BOS-01]
// Env:   PW_EXECUTABLE / PLAYWRIGHT_CHROMIUM_EXECUTABLE override the browser binary
//        (default: /opt/pw-browsers/chromium when it exists, otherwise Playwright's own install).
//        HTTPS_PROXY is honoured for the external captures only; localhost bypasses it.
// Chromium is preinstalled at /opt/pw-browsers in our containers; never run `playwright install` there.
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const eq = a.indexOf('=');
    const k = a.replace(/^--/, '').split('=')[0];
    return [k, eq === -1 ? 'true' : a.slice(eq + 1)];
  }),
);

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = resolve(root, args.dist ?? 'dist');
const port = Number(args.port ?? 4180);
const skipExternal = args['skip-external'] === 'true';
const only = args.only ? new Set(args.only.split(',')) : null;
const outDir = join(dist, 'thumbs');

const CAPTURE = { width: 1280, height: 800 };
const THUMB = { width: 640, height: 400, quality: 80 };
const DC_ROOT = '#dc-root';

/**
 * Every surface the hub links to (mirrors SURFACES + PROTOTYPE_PAGES in apps/hub/src/modules/hub/HubPage.tsx).
 * `wait`: selector that must render before the shot; `dc: true` waits for the Claude Design runtime
 * to fill #dc-root; `external: true` is best effort (falls back to a placeholder tile).
 * HUB-01 is captured last so its own thumbnail shows the freshly written thumbnails.
 */
const SURFACES = [
  { code: 'BOS-01', path: 'business-os/', dc: true },
  { code: 'BOS-02', path: 'business-os/home.html', dc: true },
  { code: 'BOS-03', path: 'business-os/cyber-bridge.html', dc: true },
  { code: 'BOS-04', path: 'business-os/cyber-bridge-deck.html', dc: true },
  { code: 'BOS-05', path: 'business-os/image-generation-plan.html', dc: true },
  { code: 'BOS-06', path: 'business-os/lod-ladder.html', dc: true },
  { code: 'P-00', url: 'https://aluzinaa.com/', external: true, wait: 'body' },
  { code: 'D-06', url: 'https://github.com/imagine-os/aluzina/tree/main/docs', external: true, wait: 'main' },
  { code: 'HUB-01', path: '#/', wait: '.surface-card__thumb', hub: true },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.pdf': 'application/pdf',
};

/** Tiny static server over dist/ (dot-files included, like Pages with .nojekyll). */
function serveDist() {
  const server = createServer((req, res) => {
    try {
      const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
      let file = normalize(join(dist, urlPath));
      if (!file.startsWith(dist + sep) && file !== dist) {
        res.writeHead(403).end();
        return;
      }
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
      if (!existsSync(file) || !statSync(file).isFile()) {
        res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
        return;
      }
      res.writeHead(200, {
        'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
        'content-length': statSync(file).size,
        'cache-control': 'no-store',
      });
      createReadStream(file).pipe(res);
    } catch (err) {
      res.writeHead(500, { 'content-type': 'text/plain' }).end(String(err));
    }
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}

/** Downsizes a PNG screenshot to the card ratio with a canvas in a blank page; returns a JPEG buffer. */
async function toThumb(context, png) {
  const page = await context.newPage();
  const dataUrl = await page.evaluate(
    async ([b64, w, h, q]) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      return canvas.toDataURL('image/jpeg', q);
    },
    [png.toString('base64'), THUMB.width, THUMB.height, THUMB.quality / 100],
  );
  await page.close();
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

/** Bilingual placeholder tile (P-09 spirit): used when an external capture is not reachable. */
async function placeholderTile(context, code) {
  const page = await context.newPage();
  await page.setViewportSize({ width: THUMB.width, height: THUMB.height });
  await page.setContent(`<!doctype html><html><body style="margin:0">
    <svg xmlns="http://www.w3.org/2000/svg" width="${THUMB.width}" height="${THUMB.height}" viewBox="0 0 640 400">
      <rect width="640" height="400" fill="#fff7e6"/>
      <rect x="1" y="1" width="638" height="398" fill="none" stroke="#e7e2d9" stroke-width="2" stroke-dasharray="10 8"/>
      <circle cx="320" cy="150" r="46" fill="#d97706"/><circle cx="306" cy="136" r="20" fill="#fde68a"/>
      <text x="320" y="248" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="30" font-weight="500" fill="#3b3128">No preview yet</text>
      <text x="320" y="286" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="24" fill="#7a6a58">Sin vista previa aún</text>
      <text x="320" y="356" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="20" fill="#7a6a58" letter-spacing="1">${code}</text>
    </svg></body></html>`);
  const jpg = await page.screenshot({ type: 'jpeg', quality: THUMB.quality, clip: { x: 0, y: 0, ...THUMB } });
  await page.close();
  return jpg;
}

const PER_PAGE_TIMEOUT = 45_000;

/** Rejects after `ms`; every capture runs under this so one stuck page never hangs the deploy. */
function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label}: capture exceeded ${ms / 1000}s`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function capture(context, base, s) {
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(30_000);
  // The Home page and the deck autoplay mp4 loops: never wait for the network to idle, and do not fetch video at all.
  await page.route('**/*.{mp4,webm}', (r) => r.abort());
  const target = s.url ?? `${base}${s.path}`;
  try {
    await page.goto(target, { waitUntil: 'domcontentloaded' });
    if (s.dc) {
      await page.waitForSelector(DC_ROOT, { timeout: 20_000 });
      await page.waitForFunction((sel) => (document.querySelector(sel)?.textContent ?? '').trim().length > 50, DC_ROOT, { timeout: 20_000 });
    } else if (s.wait) {
      await page.waitForSelector(s.wait, { timeout: 20_000 });
    }
    if (s.hub) {
      // Let the lazy-loaded thumbnails inside the hub settle before the hub's own shot.
      await page
        .evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => (i.onload = i.onerror = r))))))
        .catch(() => {});
    }
    await page.evaluate(() => document.fonts?.ready).catch(() => {});
    await page.waitForTimeout(2_000);
    const png = await page.screenshot({ type: 'png', fullPage: false });
    return { buffer: await toThumb(context, png), source: target };
  } finally {
    await page.close().catch(() => {});
  }
}

const server = await serveDist();
const base = `http://127.0.0.1:${port}/`;
mkdirSync(outDir, { recursive: true });

const launchOpts = { headless: true };
const preinstalled = process.env.PW_EXECUTABLE ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? '/opt/pw-browsers/chromium';
if (existsSync(preinstalled)) launchOpts.executablePath = preinstalled;

// Local captures never touch a proxy (Playwright's launch-level proxy would route 127.0.0.1 through it);
// external captures get their own browser with HTTPS_PROXY when the environment sets one (our containers).
const proxy = process.env.HTTPS_PROXY ?? process.env.https_proxy;
const browser = await chromium.launch(launchOpts);
const externalBrowser = proxy && !skipExternal ? await chromium.launch({ ...launchOpts, proxy: { server: proxy } }) : browser;

const contextOpts = { viewport: CAPTURE, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce' };
const context = await browser.newContext(contextOpts);
const externalContext = externalBrowser === browser ? context : await externalBrowser.newContext(contextOpts);
await context.addInitScript(() => {
  try {
    localStorage.setItem('aluzina.lang', 'en');
    localStorage.setItem('aluzina.theme', 'light');
    localStorage.setItem('aluzina.devMode', 'off');
  } catch {}
});

const items = [];
let placeholders = 0;
for (const s of SURFACES) {
  if (only && !only.has(s.code)) continue;
  const file = join(outDir, `${s.code}.jpg`);
  const ctx = s.external ? externalContext : context;
  let result;
  if (s.external && skipExternal) {
    result = { buffer: await placeholderTile(context, s.code), source: 'placeholder' };
  } else {
    try {
      result = await withTimeout(capture(ctx, base, s), PER_PAGE_TIMEOUT, s.code);
    } catch (err) {
      const msg = err instanceof Error ? err.message.split('\n')[0] : String(err);
      console.warn(`thumbs: ${s.code} not captured (${msg}); writing the placeholder tile`);
      result = { buffer: await placeholderTile(context, s.code), source: 'placeholder', error: msg };
      placeholders++;
    }
  }
  writeFileSync(file, result.buffer);
  items.push({ code: s.code, path: `thumbs/${s.code}.jpg`, generatedAt: new Date().toISOString(), source: result.source, ...(result.error ? { error: result.error } : {}) });
  console.log(`thumb ${file} (${result.buffer.length} B, ${result.source})`);
}

writeFileSync(
  join(outDir, 'manifest.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), capture: CAPTURE, thumb: THUMB, items }, null, 2) + '\n',
);
await context.close().catch(() => {});
if (externalContext !== context) await externalContext.close().catch(() => {});
await browser.close();
if (externalBrowser !== browser) await externalBrowser.close();
server.close();
console.log(`thumbs: ${items.length} written (${placeholders} placeholder tiles) -> ${join(outDir, 'manifest.json')}`);
