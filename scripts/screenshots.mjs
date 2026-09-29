// Playwright captures of the hub into docs/screenshots/<CODE>/<lang>-<width>.jpg plus routes.json.
// Usage: node scripts/screenshots.mjs [--base=https://imagine-os.github.io/aluzina/] [--out=docs/screenshots] [--shots=en-390,en-1280,en-3840,es-390]
//        Portal page as a demo user: --as=ops (founder | ops | studio | brand | client | dev) seeds <id>.session before load (same as ?as=, section 1.1a of surfaces.md).
//        Wait for the page to settle: --settle=<ms> after the selector appears (Work views: 800).
//        Dark theme: --theme=dark seeds <id>.theme=dark and emulates prefers-color-scheme: dark; files are written as <lang>-<width>-dark.jpg (light is the default and keeps <lang>-<width>.jpg).
//        Several captures of one code: --name=board writes <lang>-<width>-board.jpg (e.g. the four Work views of W-02); routes.json keeps the union of the shots captured for the code.
//        Deeper in the page: --scroll=900 scrolls that many pixels before the shot (use with --name so the top-of-page capture is kept).
//        Extra page state: --storage='{"<id>.views.u-miguel":"{...}"}' seeds those localStorage entries before load (the Work views remember view, filters and grouping per user, D-025).
//        Static page (Business OS bundle): --static=business-os/ --code=BOS-01 [--lang-toggle="button:text-is('EN')"] [--wait=#dc-root]
//        For static pages `es-*` shots click --lang-toggle after render (the bundle keeps its own language state).
// Chromium is preinstalled at /opt/pw-browsers in our containers; never run `playwright install`.
// Storage keys and the window global derive from the tenant id in tenant.json (D-090): `<id>.lang`, `window.__<id>`.
//        --use-gl=swiftshader --enable-unsafe-swiftshader: software GL for headless captures of WebGL views (K-04 3D).
//        External bases (not http://localhost) launch with --disable-features=ChromeRootStoreUsed so Chromium trusts the
//        sandbox's CA-terminating outbound proxy via the OS/NSS store instead of the bundled Chrome Root Store.
//        --mount=<url-prefix>=<dir> (repeatable, comma-separated): answer requests under that URL prefix from a local folder
//        (longest prefix wins), e.g. a client hub map and its captures from the client's checkout when the sandbox cannot
//        reach them (W-05 / D-16: --mount=https://imagine-os.github.io/hoy/hub-map/shots/=../hoy/docs/screenshots/,https://imagine-os.github.io/hoy/=../hoy/public/).
//        --list prints the resolved --as role -> demo user id (from tenant/auth/demoUsers.ts) and exits, no browser (tp-07).
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';
// Demo identities as tenant data (tp-07, D-089): one user id per role, instead of a hand-duplicated map here.
import { demoUserForRole } from '../apps/hub/src/tenant/auth/demoUsers.ts';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const eq = a.indexOf('=');
    const k = a.replace(/^--/, '').split('=')[0];
    return [k, eq === -1 ? 'true' : a.slice(eq + 1)];
  }),
);

const tenant = JSON.parse(readFileSync(new URL('../tenant.json', import.meta.url), 'utf8'));
const base = (args.base ?? 'http://localhost:4173/').replace(/\/?$/, '/');
const outRoot = args.out ?? 'docs/screenshots';
const code = args.code ?? 'HUB-01';
const route = args.route ?? '/';
const staticPath = args.static; // e.g. business-os/ -> captures base + staticPath instead of a hub hash route
const langToggle = args['lang-toggle'];
const waitFor = args.wait ?? (staticPath ? '#dc-root' : 'h1');
const shots = (args.shots ?? 'en-390,en-1280,en-3840,es-390').split(',');
const asRole = args.as; // demo user id per role (apps/hub/src/tenant/auth/demoUsers.ts)

if (args.list) {
  const ROLES = ['founder', 'ops', 'studio', 'brand', 'client', 'dev'];
  console.log(JSON.stringify(Object.fromEntries(ROLES.map((r) => [r, demoUserForRole(r)?.id ?? null])), null, 2));
  process.exit(0);
}

const settle = Number(args.settle ?? 0);
const theme = args.theme === 'dark' ? 'dark' : 'light'; // --theme=dark -> <lang>-<width>-dark.jpg
const name = args.name ? `-${args.name}` : ''; // --name=board -> <lang>-<width>-board.jpg
const suffix = `${name}${theme === 'dark' ? '-dark' : ''}`;
const storage = args.storage ? JSON.parse(args.storage) : {};
const scroll = Number(args.scroll ?? 0);
const heights = { 390: 900, 1280: 900, 1920: 1080, 2560: 1440, 3840: 2160 };

// Prefer the preinstalled Chromium when present; override with PW_EXECUTABLE.
const launchOpts = { headless: true };
const preinstalled = process.env.PW_EXECUTABLE ?? '/opt/pw-browsers/chromium';
if (existsSync(preinstalled)) launchOpts.executablePath = preinstalled;
// Containers route outbound HTTPS through a proxy; Chromium does not read the env on its own.
const proxy = process.env.HTTPS_PROXY ?? process.env.https_proxy;
if (proxy && !base.startsWith('http://localhost')) launchOpts.proxy = { server: proxy };
if (args['use-gl']) {
  launchOpts.args = [...(launchOpts.args ?? []), `--use-gl=${args['use-gl']}`];
  if (args['enable-unsafe-swiftshader'] !== undefined) launchOpts.args.push('--enable-unsafe-swiftshader');
}

// --mount: URL prefix -> local folder, longest prefix first.
const mounts = (args.mount && args.mount !== 'true' ? args.mount.split(',') : [])
  .map((m) => {
    const at = m.lastIndexOf('=');
    return { prefix: m.slice(0, at), dir: resolve(m.slice(at + 1)) };
  })
  .sort((a, b) => b.prefix.length - a.prefix.length);
const MIME = { '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

const browser = await chromium.launch(launchOpts);
const outDir = join(outRoot, code);
mkdirSync(outDir, { recursive: true });

let manifest = null;
for (const shot of shots) {
  const [lang, w] = shot.split('-');
  const width = Number(w);
  const height = heights[width] ?? 900;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, colorScheme: theme });
  await context.addInitScript(
    ([id, l, userId, t, extra]) => {
      localStorage.setItem(`${id}.lang`, l);
      localStorage.setItem(`${id}.theme`, t);
      localStorage.setItem(`${id}.devMode`, 'off');
      if (userId) localStorage.setItem(`${id}.session`, JSON.stringify({ userId, viewAs: null, devMode: false }));
      for (const [k, v] of Object.entries(extra)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
    },
    [tenant.id, lang, asRole ? demoUserForRole(asRole)?.id ?? null : null, theme, storage],
  );
  for (const { prefix, dir } of mounts) {
    await context.route(`${prefix}**`, (r) => {
      const url = new URL(r.request().url());
      const mount = mounts.find((m) => url.href.startsWith(m.prefix));
      const file = join(mount.dir, decodeURIComponent(url.href.slice(mount.prefix.length).split(/[?#]/)[0]));
      if (!file.startsWith(mount.dir) || !existsSync(file) || statSync(file).isDirectory()) return r.fulfill({ status: 404, body: 'not mounted' });
      return r.fulfill({ status: 200, contentType: MIME[extname(file).toLowerCase()] ?? 'application/octet-stream', body: readFileSync(file) });
    });
  }
  const page = await context.newPage();
  const target = staticPath ? `${base}${staticPath}` : `${base}#${route}`;
  await page.goto(target, { waitUntil: 'load', timeout: 90_000 });
  await page.waitForSelector(waitFor, { timeout: 60_000 });
  if (staticPath) {
    await page.waitForFunction((sel) => (document.querySelector(sel)?.textContent ?? '').trim().length > 50, waitFor, { timeout: 60_000 });
  }
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  if (staticPath && lang === 'es' && langToggle) {
    await page.locator(langToggle).first().click();
    await page.waitForTimeout(600);
  }
  await page.evaluate(() => document.fonts?.ready);
  if (settle > 0) await page.waitForTimeout(settle);
  if (scroll > 0) {
    await page.evaluate((y) => window.scrollTo(0, y), scroll);
    await page.waitForTimeout(400);
  }
  const file = join(outDir, `${shot}${suffix}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 80, fullPage: false });
  manifest ??= await page.evaluate((g) => window[g] ?? null, `__${tenant.id}`);
  if (staticPath) manifest ??= { static: true, url: page.url() };
  console.log(`shot ${file} (${width}x${height}, ${lang}, ${theme})`);
  await context.close();
}

// Keep the union of every shot captured for this code, so a second run with --name does not hide the first.
const routesFile = join(outDir, 'routes.json');
let previous = [];
try {
  if (existsSync(routesFile)) previous = JSON.parse(readFileSync(routesFile, 'utf8')).shots ?? [];
} catch {
  previous = [];
}
const allShots = [...new Set([...previous, ...shots.map((s) => `${s}${suffix}`)])].sort();
writeFileSync(routesFile, JSON.stringify({ capturedAt: new Date().toISOString(), base, code, route: staticPath ?? route, shots: allShots, theme, manifest }, null, 2) + '\n');
await browser.close();
console.log(`wrote ${join(outDir, 'routes.json')}`);
