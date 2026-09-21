// Playwright captures of the hub into docs/screenshots/<CODE>/<lang>-<width>.jpg plus routes.json.
// Usage: node scripts/screenshots.mjs [--base=https://imagine-os.github.io/aluzina/] [--out=docs/screenshots] [--shots=en-390,en-1280,en-3840,es-390]
//        Portal page as a demo user: --as=ops (founder | ops | studio | brand | client | dev) seeds aluzina.session before load (same as ?as=, section 1.1a of surfaces.md).
//        Wait for the page to settle: --settle=<ms> after the selector appears (Work views: 800).
//        Dark theme: --theme=dark seeds aluzina.theme=dark and emulates prefers-color-scheme: dark; files are written as <lang>-<width>-dark.jpg (light is the default and keeps <lang>-<width>.jpg).
//        Several captures of one code: --name=board writes <lang>-<width>-board.jpg (e.g. the four Work views of W-02); routes.json keeps the union of the shots captured for the code.
//        Deeper in the page: --scroll=900 scrolls that many pixels before the shot (use with --name so the top-of-page capture is kept).
//        Extra page state: --storage='{"aluzina.views.u-miguel":"{...}"}' seeds those localStorage entries before load (the Work views remember view, filters and grouping per user, D-025).
//        Static page (Business OS bundle): --static=business-os/ --code=BOS-01 [--lang-toggle="button:text-is('EN')"] [--wait=#dc-root]
//        For static pages `es-*` shots click --lang-toggle after render (the bundle keeps its own language state).
// Chromium is preinstalled at /opt/pw-browsers in our containers; never run `playwright install`.
//        --use-gl=swiftshader --enable-unsafe-swiftshader: software GL for headless captures of WebGL views (K-04 3D).
//        External bases (not http://localhost) launch with --disable-features=ChromeRootStoreUsed so Chromium trusts the
//        sandbox's CA-terminating outbound proxy via the OS/NSS store instead of the bundled Chrome Root Store.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const eq = a.indexOf('=');
    const k = a.replace(/^--/, '').split('=')[0];
    return [k, eq === -1 ? 'true' : a.slice(eq + 1)];
  }),
);

const base = (args.base ?? 'http://localhost:4173/').replace(/\/?$/, '/');
const outRoot = args.out ?? 'docs/screenshots';
const code = args.code ?? 'HUB-01';
const route = args.route ?? '/';
const staticPath = args.static; // e.g. business-os/ -> captures base + staticPath instead of a hub hash route
const langToggle = args['lang-toggle'];
const waitFor = args.wait ?? (staticPath ? '#dc-root' : 'h1');
const shots = (args.shots ?? 'en-390,en-1280,en-3840,es-390').split(',');
const asRole = args.as; // demo user id per role (apps/hub/src/auth/demoUsers.ts)
const USER_BY_ROLE = { founder: 'u-alejandra', ops: 'u-miguel', studio: 'u-sarai', brand: 'u-angelica', client: 'u-client', dev: 'u-dev' };
const settle = Number(args.settle ?? 0);
const theme = args.theme === 'dark' ? 'dark' : 'light'; // --theme=dark -> <lang>-<width>-dark.jpg
const name = args.name ? `-${args.name}` : ''; // --name=board -> <lang>-<width>-board.jpg
const suffix = `${name}${theme === 'dark' ? '-dark' : ''}`;
const storage = args.storage ? JSON.parse(args.storage) : {};
const scroll = Number(args.scroll ?? 0);
const heights = { 390: 900, 1280: 900, 3840: 2160 };

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
    ([l, userId, t, extra]) => {
      localStorage.setItem('aluzina.lang', l);
      localStorage.setItem('aluzina.theme', t);
      localStorage.setItem('aluzina.devMode', 'off');
      if (userId) localStorage.setItem('aluzina.session', JSON.stringify({ userId, viewAs: null, devMode: false }));
      for (const [k, v] of Object.entries(extra)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
    },
    [lang, asRole ? USER_BY_ROLE[asRole] ?? null : null, theme, storage],
  );
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
  manifest ??= await page.evaluate(() => window.__aluzina ?? null);
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
