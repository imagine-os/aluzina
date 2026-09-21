const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = __dirname;
const ORIGIN = 'https://direccion.aluzinaa.com';

function slugify(u) {
  try {
    const url = new URL(u);
    let s = (url.pathname + url.hash).replace(/^\//, '').replace(/\/$/, '');
    s = s.replace(/[^a-zA-Z0-9\-#]+/g, '-').replace(/^-+|-+$/g, '');
    return s || 'home';
  } catch (e) {
    return 'home';
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message));

  console.log('Navigating to homepage...');
  const resp = await page.goto(ORIGIN, { waitUntil: 'networkidle', timeout: 45000 });
  const finalUrl = page.url();
  console.log('Status:', resp.status(), 'Final URL:', finalUrl);

  // Check for login / redirect
  const bodyTextEarly = await page.innerText('body').catch(() => '');
  const loginLike = /log ?in|sign ?in|password|contraseñ/i.test(bodyTextEarly.slice(0, 500));
  if (finalUrl.replace(/\/$/, '') !== ORIGIN.replace(/\/$/, '') && !finalUrl.startsWith(ORIGIN)) {
    console.log('REDIRECTED to different origin:', finalUrl);
  }
  if (loginLike) {
    console.log('POSSIBLE LOGIN SCREEN DETECTED');
  }

  // Discover same-origin internal links
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]')).map(a => ({
      text: a.innerText.trim(),
      href: a.href
    }));
  });
  const originHost = new URL(ORIGIN).host;
  const internalLinks = links.filter(l => {
    try { return new URL(l.href).host === originHost; } catch (e) { return false; }
  });
  const uniqueInternal = [...new Set(internalLinks.map(l => l.href))];
  console.log('All links found:', links.length, 'Internal (same host):', uniqueInternal.length);
  fs.writeFileSync(path.join(OUT, 'links-discovered.json'), JSON.stringify({ all: links, internal: uniqueInternal }, null, 2));

  // Design tokens extraction
  const tokens = await page.evaluate(() => {
    const colorCounts = {};
    function normColor(c) {
      if (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') return null;
      return c;
    }
    document.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      [cs.color, cs.backgroundColor].forEach(c => {
        const n = normColor(c);
        if (n) colorCounts[n] = (colorCounts[n] || 0) + 1;
      });
    });
    const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
    const bodyFont = getComputedStyle(document.body).fontFamily;
    const btn = document.querySelector('.btn');
    const btnStyles = btn ? {
      background: getComputedStyle(btn).backgroundColor,
      color: getComputedStyle(btn).color,
      fontFamily: getComputedStyle(btn).fontFamily
    } : null;
    const logo = document.querySelector('nav .logo img, .logo img');
    const logoSrc = logo ? logo.src : null;
    const h1 = document.querySelector('h1');
    const h1Font = h1 ? getComputedStyle(h1).fontFamily : null;
    // CSS custom properties on :root
    const rootStyles = getComputedStyle(document.documentElement);
    const cssVars = {};
    ['--paper', '--ink', '--ink-soft', '--gray', '--line', '--font'].forEach(v => {
      const val = rootStyles.getPropertyValue(v);
      if (val) cssVars[v] = val.trim();
    });
    return {
      topColors: sortedColors,
      bodyFontFamily: bodyFont,
      h1FontFamily: h1Font,
      primaryButton: btnStyles,
      logoUrl: logo ? logo.getAttribute('src') : null,
      logoResolvedUrl: logoSrc,
      cssCustomProperties: cssVars
    };
  });

  // Meta / tech stack signals
  const meta = await page.evaluate(() => {
    const getMeta = (name) => {
      const el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      return el ? el.getAttribute('content') : null;
    };
    return {
      title: document.title,
      description: getMeta('description'),
      generator: getMeta('generator'),
      ogTitle: getMeta('og:title'),
      ogDescription: getMeta('og:description'),
      lang: document.documentElement.getAttribute('lang'),
      viewport: getMeta('viewport'),
      scripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src),
      stylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(s => s.href),
      hasReactRoot: !!document.getElementById('root') || !!document.getElementById('__next'),
      bodyClasses: document.body.className,
      htmlSize: document.documentElement.outerHTML.length
    };
  });

  fs.writeFileSync(path.join(OUT, 'design-tokens.json'), JSON.stringify({ tokens, meta, consoleErrors }, null, 2));
  console.log('Design tokens written.');

  // Function to extract page content and save text/html
  async function extractAndSave(pg, url, slug) {
    const html = await pg.content();
    fs.writeFileSync(path.join(OUT, 'html', slug + '.html'), html);

    const data = await pg.evaluate(() => {
      const title = document.title;
      const desc = (document.querySelector('meta[name="description"]') || {}).content || '';
      const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map(h => ({
        level: h.tagName,
        text: h.innerText.trim()
      }));
      const linksOut = Array.from(document.querySelectorAll('a[href]')).map(a => ({
        text: a.innerText.trim().replace(/\s+/g, ' '),
        href: a.getAttribute('href')
      }));
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || ''
      }));
      const forms = Array.from(document.querySelectorAll('form')).map(f => ({
        action: f.getAttribute('action'),
        method: f.getAttribute('method'),
        fields: Array.from(f.querySelectorAll('input,textarea,select')).map(i => i.name || i.type)
      }));
      const ctaButtons = Array.from(document.querySelectorAll('a.btn, a.btn-w, button')).map(b => b.innerText.trim());
      const bodyText = document.body.innerText;
      return { title, desc, headings, linksOut, images, forms, ctaButtons, bodyText };
    });

    let md = `# ${data.title}\n\n`;
    md += `**URL:** ${url}\n\n`;
    md += `**Meta description:** ${data.desc || '(none)'}\n\n`;
    md += `## Heading outline\n\n`;
    data.headings.forEach(h => { md += `- **${h.level}**: ${h.text}\n`; });
    md += `\n## CTAs / Buttons\n\n`;
    data.ctaButtons.forEach(c => { if (c) md += `- ${c}\n`; });
    md += `\n## Forms\n\n`;
    if (data.forms.length === 0) md += `(none found)\n`;
    data.forms.forEach(f => { md += `- action=${f.action} method=${f.method} fields=[${f.fields.join(', ')}]\n`; });
    md += `\n## Links (text -> href)\n\n`;
    data.linksOut.forEach(l => { md += `- ${l.text || '(no text)'} -> ${l.href}\n`; });
    md += `\n## Images (src / alt)\n\n`;
    data.images.forEach(i => { md += `- ${i.src} | alt="${i.alt}"\n`; });
    md += `\n## Full rendered body text (innerText)\n\n`;
    md += '```\n' + data.bodyText + '\n```\n';

    fs.writeFileSync(path.join(OUT, 'text', slug + '.md'), md);
    return data;
  }

  // Homepage extraction
  await extractAndSave(page, finalUrl, 'home');

  // Homepage screenshots at multiple widths
  const widths = [390, 768, 1280, 1920, 3840];
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(500); // allow responsive reflow / marquee settle
    await page.screenshot({ path: path.join(OUT, 'shots', `home-${w}.png`), fullPage: true });
    console.log('Saved screenshot home-' + w + '.png');
  }
  await page.setViewportSize({ width: 1280, height: 900 });

  // Since this is a single-page site with anchor links (#agenda, #direccion, #metodo)
  // and only external links otherwise, there are no other same-origin subpages to crawl.
  // We still visit each anchor to document scroll state / confirm no separate route.
  const anchors = uniqueInternal.filter(u => u.includes('#') && u.split('#')[0].replace(/\/$/, '') === ORIGIN);
  console.log('Anchor-only internal links (same page):', anchors);

  const visitedPages = [{ url: finalUrl, slug: 'home', note: 'homepage (single-page site)' }];

  fs.writeFileSync(path.join(OUT, 'crawl-log.json'), JSON.stringify({
    finalUrl, status: resp.status(), loginLike, uniqueInternal, anchors, visitedPages, consoleErrors
  }, null, 2));

  await browser.close();
  console.log('DONE');
})().catch(e => {
  console.error('FATAL', e);
  process.exit(1);
});
