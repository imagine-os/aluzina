// Playwright captures of the hub into docs/screenshots/<CODE>/<lang>-<width>.jpg plus routes.json.
// Usage: node scripts/screenshots.mjs [--base=https://imagine-os.github.io/aluzina/] [--out=docs/screenshots] [--shots=en-390,en-1280,en-3840,es-390]
// Chromium is preinstalled at /opt/pw-browsers in our containers; never run `playwright install`.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  }),
);

const base = (args.base ?? 'http://localhost:4173/').replace(/\/?$/, '/');
const outRoot = args.out ?? 'docs/screenshots';
const code = args.code ?? 'HUB-01';
const route = args.route ?? '/';
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
  await page.goto(`${base}#${route}`, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForSelector('h1', { timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.evaluate(() => document.fonts?.ready);
  const file = join(outDir, `${shot}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 80, fullPage: false });
  manifest ??= await page.evaluate(() => window.__aluzina ?? null);
  console.log(`shot ${file} (${width}x${height}, ${lang})`);
  await context.close();
}

writeFileSync(join(outDir, 'routes.json'), JSON.stringify({ capturedAt: new Date().toISOString(), base, code, shots, manifest }, null, 2) + '\n');
await browser.close();
console.log(`wrote ${join(outDir, 'routes.json')}`);
