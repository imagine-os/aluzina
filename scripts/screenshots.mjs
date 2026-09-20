// Playwright captures of the hub into docs/screenshots/<CODE>/<lang>-<width>.jpg plus routes.json.
// Usage: node scripts/screenshots.mjs [--base=https://imagine-os.github.io/aluzina/] [--out=docs/screenshots] [--shots=en-390,en-1280,en-3840,es-390]
//        Static page (Business OS bundle): --static=business-os/ --code=BOS-01 [--lang-toggle="button:text-is('EN')"] [--wait=#dc-root]
//        For static pages `es-*` shots click --lang-toggle after render (the bundle keeps its own language state).
// Chromium is preinstalled at /opt/pw-browsers in our containers; never run `playwright install`.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
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
const heights = { 390: 900, 1280: 900, 3840: 2160 };

// Prefer the preinstalled Chromium when present; override with PW_EXECUTABLE.
const launchOpts = { headless: true };
const preinstalled = process.env.PW_EXECUTABLE ?? '/opt/pw-browsers/chromium';
if (existsSync(preinstalled)) launchOpts.executablePath = preinstalled;
// Containers route outbound HTTPS through a proxy; Chromium does not read the env on its own.
const proxy = process.env.HTTPS_PROXY ?? process.env.https_proxy;
if (proxy && !base.startsWith('http://localhost')) launchOpts.proxy = { server: proxy };

const browser = await chromium.launch(launchOpts);
const outDir = join(outRoot, code);
mkdirSync(outDir, { recursive: true });

let manifest = null;
for (const shot of shots) {
  const [lang, w] = shot.split('-');
  const width = Number(w);
  const height = heights[width] ?? 900;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, colorScheme: 'light' });
  await context.addInitScript(
    ([l]) => {
      localStorage.setItem('aluzina.lang', l);
      localStorage.setItem('aluzina.theme', 'light');
      localStorage.setItem('aluzina.devMode', 'off');
    },
    [lang],
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
  const file = join(outDir, `${shot}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 80, fullPage: false });
  manifest ??= await page.evaluate(() => window.__aluzina ?? null);
  if (staticPath) manifest ??= { static: true, url: page.url() };
  console.log(`shot ${file} (${width}x${height}, ${lang})`);
  await context.close();
}

writeFileSync(join(outDir, 'routes.json'), JSON.stringify({ capturedAt: new Date().toISOString(), base, code, route: staticPath ?? route, shots, manifest }, null, 2) + '\n');
await browser.close();
console.log(`wrote ${join(outDir, 'routes.json')}`);
