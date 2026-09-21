const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = __dirname;
const BASE = 'https://aluzinaa.com';
const CAP = 25;

function slugify(u) {
  const url = new URL(u);
  let p = url.pathname.replace(/\/+$/, '');
  if (p === '' || p === '/') return 'home';
  return p.replace(/^\//, '').replace(/\//g, '_');
}

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }

(async () => {
  ensureDir(path.join(OUT, 'text'));
  ensureDir(path.join(OUT, 'html'));
  ensureDir(path.join(OUT, 'shots'));

  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-features=ChromeRootStoreUsed'],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  console.log('Loading homepage...');
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);

  // Discover internal links
  const origin = new URL(BASE).origin;
  const hrefs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href'));
  });
  const internal = new Set(['/']);
  for (const h of hrefs) {
    if (!h) continue;
    if (h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('javascript:')) continue;
    let abs;
    try { abs = new URL(h, BASE).toString(); } catch (e) { continue; }
    const u = new URL(abs);
    if (u.origin !== origin) continue;
    u.hash = '';
    internal.add(u.pathname + (u.search || ''));
  }
  const pages = Array.from(internal).slice(0, CAP);
  console.log('Internal pages found:', pages);

  const results = [];
  const colorFreq = {}; // global across pages, mainly homepage
  let fontFamilies = new Set();
  let logoUrl = null;
  let buttonColor = null;

  for (const p of pages) {
    const url = new URL(p, BASE).toString();
    const slug = slugify(url);
    console.log('Visiting', url, '->', slug);
    try {
      if (url !== BASE + '/' || pages.indexOf(p) !== 0) {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(1200);
      }
    } catch (e) {
      console.log('  nav error', e.message);
      results.push({ url, slug, error: e.message });
      continue;
    }

    const data = await page.evaluate(() => {
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map(h => ({
        tag: h.tagName.toLowerCase(), text: h.innerText.trim()
      })).filter(h => h.text);
      const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
        text: a.innerText.trim().replace(/\s+/g, ' '),
        href: a.getAttribute('href')
      }));
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        alt: img.getAttribute('alt') || '',
        src: img.getAttribute('src') || img.currentSrc || ''
      }));
      const forms = Array.from(document.querySelectorAll('form')).map(f => ({
        action: f.getAttribute('action') || '',
        method: f.getAttribute('method') || '',
        fields: Array.from(f.querySelectorAll('input,textarea,select')).map(el => ({
          name: el.getAttribute('name') || '', type: el.getAttribute('type') || el.tagName.toLowerCase(),
          placeholder: el.getAttribute('placeholder') || ''
        }))
      }));
      const ctaButtons = Array.from(document.querySelectorAll('button, a.btn, a[class*="button"], a[role="button"]'))
        .map(el => el.innerText.trim()).filter(Boolean).slice(0, 30);
      const bodyText = document.body.innerText;
      const htmlLang = document.documentElement.getAttribute('lang') || '';
      return { title, metaDesc, headings, links, images, forms, ctaButtons, bodyText, htmlLang };
    });

    // Save markdown
    let md = `# ${data.title}\n\n`;
    md += `URL: ${url}\n\n`;
    md += `Lang: ${data.htmlLang}\n\n`;
    md += `Meta description: ${data.metaDesc}\n\n`;
    md += `## Heading outline\n\n`;
    for (const h of data.headings) md += `${'  '.repeat(h.tag === 'h1' ? 0 : h.tag === 'h2' ? 1 : 2)}- (${h.tag}) ${h.text}\n`;
    md += `\n## Links (${data.links.length})\n\n`;
    for (const l of data.links) md += `- [${l.text || '(no text)'}](${l.href})\n`;
    md += `\n## Images (${data.images.length})\n\n`;
    for (const im of data.images) md += `- alt="${im.alt}" src=${im.src}\n`;
    md += `\n## Forms/CTAs\n\n`;
    if (data.forms.length) {
      for (const f of data.forms) {
        md += `- Form action=${f.action} method=${f.method}\n`;
        for (const fl of f.fields) md += `  - field: name=${fl.name} type=${fl.type} placeholder="${fl.placeholder}"\n`;
      }
    } else {
      md += `(no <form> elements found)\n`;
    }
    md += `\nCTA/buttons text found: ${JSON.stringify(data.ctaButtons)}\n`;
    md += `\n## Full body text (innerText)\n\n\`\`\`\n${data.bodyText}\n\`\`\`\n`;

    fs.writeFileSync(path.join(OUT, 'text', slug + '.md'), md, 'utf8');

    const html = await page.content();
    fs.writeFileSync(path.join(OUT, 'html', slug + '.html'), html, 'utf8');

    results.push({ url, slug, title: data.title });

    // Screenshot: homepage gets multiple widths, others get 1280 only
    if (slug === 'home') {
      const widths = [390, 768, 1280, 1920, 3840];
      for (const w of widths) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(OUT, 'shots', `home-${w}.png`), fullPage: true });
      }
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.waitForTimeout(300);

      // Design tokens extraction on homepage
      const tokens = await page.evaluate(() => {
        function rgbToHex(rgb) {
          const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (!m) return null;
          const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
          if (a === 0) return null;
          const toHex = n => parseInt(n).toString(16).padStart(2, '0');
          return '#' + toHex(m[1]) + toHex(m[2]) + toHex(m[3]);
        }
        const freq = {};
        const fonts = {};
        const els = Array.from(document.querySelectorAll('body *')).filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });
        for (const el of els) {
          const cs = getComputedStyle(el);
          const bg = rgbToHex(cs.backgroundColor);
          const col = rgbToHex(cs.color);
          if (bg) freq[bg] = (freq[bg] || 0) + 1;
          if (col) freq[col] = (freq[col] || 0) + 1;
          const ff = cs.fontFamily;
          if (ff) fonts[ff] = (fonts[ff] || 0) + 1;
        }
        const topColors = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10)
          .map(([color, count]) => ({ color, count }));
        const topFonts = Object.entries(fonts).sort((a, b) => b[1] - a[1]).slice(0, 5)
          .map(([font, count]) => ({ font, count }));

        // logo
        let logo = null;
        const logoEl = document.querySelector('header img, nav img, a[href="/"] img, img[alt*="logo" i], img[src*="logo" i]');
        if (logoEl) logo = logoEl.src;

        // primary button color
        let btnColor = null;
        const btn = document.querySelector('button, a[class*="btn"], a[class*="button"]');
        if (btn) {
          const cs = getComputedStyle(btn);
          btnColor = { backgroundColor: rgbToHex(cs.backgroundColor) || cs.backgroundColor, color: rgbToHex(cs.color) || cs.color, text: btn.innerText.trim() };
        }

        return { topColors, topFonts, logo, btnColor };
      });
      fs.writeFileSync(path.join(OUT, 'design-tokens-raw.json'), JSON.stringify(tokens, null, 2), 'utf8');
    } else {
      await page.screenshot({ path: path.join(OUT, 'shots', `${slug}-1280.png`), fullPage: true });
    }
  }

  fs.writeFileSync(path.join(OUT, 'crawl-results.json'), JSON.stringify(results, null, 2), 'utf8');

  await browser.close();
  console.log('DONE');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
