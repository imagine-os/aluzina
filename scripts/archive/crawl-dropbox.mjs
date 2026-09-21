#!/usr/bin/env node
// Crawl a public Dropbox shared-folder viewer (the `dl=0` web page) with headless Chromium and write its entries as JSON.
// Intake step 1 of the project archive (prompt 0017, changelog 0019, D-058). Promoted from the two crawlers the pass-0019
// workers ran from the scratchpad (`inventory/crawl_projects.js`, depth 1 per project folder; `joe-gallina/crawl.js` and
// `dropbox/crawl2.js`, BFS to a depth): same DOM selectors, same gentle pacing, same gate / rate-limit detection.
//
// Usage
//   node scripts/archive/crawl-dropbox.mjs --url=<share url> [--depth=0] [--out=entries.json] [--label=A] [--shot=top.png]
//       BFS from one shared folder down to --depth (0 = only the folder itself). Output: entries.json shape
//       { label, folderName, rootUrl, maxDepth, crawledAt, entries[{ path, name, ext, size, size_text, modified, is_dir, depth, href }], folders[], errors[] }
//   node scripts/archive/crawl-dropbox.mjs --targets=<targets.json> [--depth=0] [--out=projects_raw.json] [--start=0] [--end=N]
//       One page per target ({ id, folderName, yearFolder, numberPrefix, sourceHref, path, ... }), immediate children only when depth is 0.
//       Output: the targets with `listed`, `reason` (login_gate | rate_limited | <error>) and `children[]` appended; resumable
//       (targets already in --out are skipped), so a rate-limited run can be re-run later for the rest.
//   Options: --delay=1500 (ms between pages) --retry-wait=30000 (ms before the single retry after a gate / 429 / error)
//            --headless=true  env PW_EXECUTABLE (default: Playwright's own Chromium), HTTPS_PROXY (passed to Chromium as --proxy-server)
//
// Rules: read-only (no login, no downloads here; downloads and renders are render-previews.py); one browser, one page,
// >= 1.5 s between navigations, at most one retry per folder after a 30 s pause; never disables TLS verification
// (the sandbox proxy's CA has to be trusted by the Chromium profile, which is an environment step, not a flag here).
// Sizes are Dropbox display values (KB / MB) parsed to bytes, so byte counts are approximate.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
    return m ? [m[1], m[2] ?? 'true'] : [a, 'true'];
  }),
);
const maxDepth = parseInt(args.depth ?? '0', 10);
const delay = parseInt(args.delay ?? '1500', 10);
const retryWait = parseInt(args['retry-wait'] ?? '30000', 10);
const label = args.label ?? 'crawl';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

if (!args.url && !args.targets) {
  console.error('usage: crawl-dropbox.mjs --url=<share url> | --targets=<targets.json> [--depth=0] [--out=<file>]');
  process.exit(2);
}

const SIZE_RE = /^([\d.,]+)\s*(B|KB|MB|GB|TB)$/i;
function parseSize(s) {
  const m = SIZE_RE.exec((s || '').trim());
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ''));
  const k = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }[m[2].toUpperCase()];
  return Math.round(n * k);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Open one folder page, scroll until the list stops growing, return its rows (list or grid view) or a gate / rate-limit flag. */
async function listOnce(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('[data-testid="ROW_TEST_ID"], [data-testid="sl-grid-body"], [data-testid="sl-body"], [data-testid="sl-list-column--name"]', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const countItems = () => page.evaluate(() => document.querySelectorAll('[data-testid="ROW_TEST_ID"], [data-testid="sl-grid-body"] a[href*="/scl/f"]').length);
  let last = -1;
  let stable = 0;
  for (let i = 0; i < 60 && stable < 2; i++) {
    const n = await countItems();
    if (n === last) stable++;
    else stable = 0;
    last = n;
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
      const items = document.querySelectorAll('[data-testid="ROW_TEST_ID"], [data-testid="sl-grid-body"] a[href*="/scl/f"]');
      if (items.length) items[items.length - 1].scrollIntoView();
    });
    const more = await page.$('button:has-text("Load more"), button:has-text("Show more")');
    if (more) {
      await more.click().catch(() => {});
      await page.waitForTimeout(1500);
    }
    await page.waitForTimeout(900);
  }
  const hasRows = () => page.evaluate(() => Boolean(document.querySelector('[data-testid="ROW_TEST_ID"], [data-testid="sl-grid-body"] a[href*="/scl/f"]')));
  const bodyText = await page.evaluate(() => document.body.innerText);
  if (/confirm your identity|Log in to Dropbox/.test(bodyText) && !(await hasRows())) return { gated: true };
  if (/Too many requests|try again later|429/i.test(bodyText) && !(await hasRows())) return { rateLimited: true };
  const items = await page.evaluate(() => {
    const out = [];
    const rows = [...document.querySelectorAll('[data-testid="ROW_TEST_ID"]')];
    if (rows.length) {
      for (const r of rows) {
        const a = r.querySelector('a[data-testid="sl-list-column--name"]') || r.querySelector('a[href*="/scl/f"]');
        const cells = [...r.querySelectorAll('[role="cell"]')].map((c) => c.innerText.trim());
        out.push({ view: 'list', name: a ? a.getAttribute('aria-label') || a.innerText.trim() : cells[0], href: a ? a.href : null, modified: cells[1] || '', size: cells[2] || '' });
      }
      return out;
    }
    const links = [...document.querySelectorAll('[data-testid="sl-grid-body"] a[href*="/scl/f"]')];
    const seen = new Set();
    for (const a of links) {
      const name = a.getAttribute('aria-label') || a.innerText.trim();
      if (!name || seen.has(a.href)) continue;
      seen.add(a.href);
      let card = a;
      for (let i = 0; i < 8 && card.parentElement && !/(B|KB|MB|GB)\b/.test(card.innerText.replace(name, '')); i++) card = card.parentElement;
      const m = /([\d.,]+\s*(?:B|KB|MB|GB|TB))\b/.exec(card.innerText.replace(name, ''));
      out.push({ view: 'grid', name, href: a.href, modified: '', size: m ? m[1] : '' });
    }
    return out;
  });
  const emptyMsg = /folder is empty|No files/i.test(bodyText);
  const title = (await page.title()).replace(/ - Dropbox$/, '');
  const children = items.map((r) => {
    const is_dir = r.view === 'list' ? r.size === '--' || r.size === '' : r.size === '' && !/\.[A-Za-z0-9]{1,5}$/.test(r.name);
    const ext = is_dir ? '' : r.name.includes('.') ? r.name.split('.').pop().toLowerCase() : '';
    return { name: r.name, is_dir, ext, size: is_dir ? null : parseSize(r.size), size_text: is_dir ? null : r.size || null, modified: !r.modified || r.modified === '--' ? null : r.modified, href: r.href };
  });
  return { children, view: items[0] ? items[0].view : emptyMsg ? 'empty' : 'unknown', title };
}

/** listOnce with the one permitted retry after a gate, a 429 or a navigation error. */
async function listWithRetry(page, url, what) {
  let out;
  try {
    out = await listOnce(page, url);
    if (out.gated || out.rateLimited) {
      console.error(`${what}: ${out.gated ? 'login gate' : 'rate limited'} -> backing off ${retryWait / 1000}s, retrying once`);
      await sleep(retryWait);
      out = await listOnce(page, url);
    }
  } catch (e) {
    console.error(`${what}: ERROR ${e.message.split('\n')[0]} -> backing off ${retryWait / 1000}s, retrying once`);
    await sleep(retryWait);
    try {
      out = await listOnce(page, url);
    } catch (e2) {
      out = { error: e2.message.split('\n')[0] };
    }
  }
  return out;
}

async function launch() {
  const launchArgs = ['--no-sandbox'];
  if (process.env.HTTPS_PROXY) launchArgs.push('--proxy-server=' + process.env.HTTPS_PROXY);
  const browser = await chromium.launch({ headless: args.headless !== 'false', executablePath: process.env.PW_EXECUTABLE || undefined, args: launchArgs });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1400 }, userAgent: UA });
  return { browser, page: await ctx.newPage() };
}

async function crawlUrl() {
  const out = args.out ?? `${label}.entries.json`;
  const { browser, page } = await launch();
  const entries = [];
  const errors = [];
  const folders = [];
  const queue = [{ url: args.url, path: '', depth: 0 }];
  let folderName = null;
  while (queue.length) {
    const { url, path: p, depth } = queue.shift();
    await sleep(delay);
    const res = await listWithRetry(page, url, `${label} ${p || '/'}`);
    if (res.gated || res.rateLimited || res.error) {
      errors.push({ path: p, url, error: res.gated ? 'login_gate' : res.rateLimited ? 'rate_limited' : res.error });
      console.error(`${label} UNLISTED ${p || '/'} (${errors[errors.length - 1].error})`);
      continue;
    }
    if (folderName === null) {
      folderName = res.title;
      if (args.shot) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: args.shot, fullPage: true });
      }
    }
    folders.push({ path: p || '/', depth, count: res.children.length, url, view: res.view });
    for (const c of res.children) {
      const full = p ? `${p}/${c.name}` : c.name;
      entries.push({ path: full, ...c, depth });
      if (c.is_dir && depth < maxDepth && c.href) queue.push({ url: c.href, path: full, depth: depth + 1 });
    }
    console.error(`${label} [${depth}] ${p || '/'} -> ${res.children.length} items (${res.view}) queue=${queue.length}`);
  }
  fs.writeFileSync(out, JSON.stringify({ label, folderName, rootUrl: args.url, maxDepth, crawledAt: new Date().toISOString(), entries, folders, errors }, null, 1));
  console.log(`${label} done: ${entries.length} entries, ${folders.length} folders visited, ${errors.length} errors -> ${out}`);
  await browser.close();
}

async function crawlTargets() {
  const targets = JSON.parse(fs.readFileSync(args.targets, 'utf8'));
  const out = args.out ?? path.join(path.dirname(args.targets), 'projects_raw.json');
  const slice = targets.slice(parseInt(args.start ?? '0', 10), parseInt(args.end ?? '999999', 10));
  const results = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : [];
  const doneKeys = new Set(results.map((r) => `${r.label}|${r.path}`));
  const { browser, page } = await launch();
  for (const t of slice) {
    const key = `${t.label}|${t.path}`;
    if (doneKeys.has(key)) {
      console.error(`SKIP (already done) ${t.path}`);
      continue;
    }
    await sleep(delay);
    // Depth 0 lists the folder itself; deeper targets BFS like crawlUrl but keep the flat children shape with `path`.
    const children = [];
    const queue = [{ url: t.sourceHref, path: '', depth: 0 }];
    let failure = null;
    while (queue.length) {
      const { url, path: p, depth } = queue.shift();
      if (p) await sleep(delay);
      const res = await listWithRetry(page, url, t.path + (p ? `/${p}` : ''));
      if (res.gated || res.rateLimited || res.error) {
        failure = res.gated ? 'login_gate' : res.rateLimited ? 'rate_limited' : res.error;
        if (!p) break;
        continue;
      }
      for (const c of res.children) {
        const full = p ? `${p}/${c.name}` : c.name;
        children.push(p ? { ...c, path: full, depth } : c);
        if (c.is_dir && depth < maxDepth && c.href) queue.push({ url: c.href, path: full, depth: depth + 1 });
      }
    }
    const rec = failure && children.length === 0 ? { ...t, listed: false, reason: failure, children: [] } : { ...t, listed: true, children };
    console.error(rec.listed ? `OK ${t.path} -> ${children.length} children` : `UNLISTED ${t.path} (${rec.reason})`);
    results.push(rec);
    fs.writeFileSync(out, JSON.stringify(results, null, 1));
  }
  await browser.close();
  console.log(`done: ${results.length} total results in ${out}`);
}

(args.url ? crawlUrl() : crawlTargets()).catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
