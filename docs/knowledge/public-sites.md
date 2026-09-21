# Public sites: aluzinaa.com and direccion.aluzinaa.com

What the two public websites are, how they are built and hosted, what they say and where their source lives, so the Hub links to them correctly, the P-xx public-site work starts from facts, and the archive intake is reproducible. Evidence: `docs/source/aluzinaa-archive/` (text per page, rendered HTML, screenshots 390-3840, design tokens, scraper scripts). Entry convention: `knowledge/README.md`.

## aluzinaa.com (main site)

```
status: current
since: 2026-09-21
source: prompt 0007 / docs/source/aluzinaa-archive (captured 2026-09-21 03:59-04:12 UTC from Slack #website-scraping, Justin Massion)
```

- **What**: the studio's public website. Medellín interior design and lighting, "neurointeriorismo", luminaire line, lead-gen blog, geo SEO landing pages. Hub code `P-xx` (public site, external; the hub card links out, D-031).
- **Build**: a **Lovable-built React + Vite + shadcn/ui SPA** (`/lovable-uploads/...` asset paths, `react-vendor` / `ui-vendor` / TanStack Query chunks). The server sends an empty `<div id="root">` plus a spinner and the SEO head; every page renders client-side.
- **Language**: **Spanish only** (`lang="es"`, hreflang `es-co` / `es` / `x-default`). No English version, no toggle.
- **Hosting**: served by **Lovable behind Cloudflare** (`server: cloudflare`, `x-deployment-id` header, HSTS, `__cf_bm` cookie); analytics proxy `/~flock.js` -> `/~api/analytics`.
- **Pages (18)**:
  - `/` home: hero, value props, lighting showcase, luminaire teaser, process, guides, FAQ.
  - `/servicios`: the service lines.
  - `/framework`: the studio's methodology.
  - `/luminarias`: the decorative luminaire catalog (Onion, Madera Plenitud, Plenitud Circular, Pequeña Plenitud, ...).
  - `/portafolio`: projects.
  - `/blog`: article index (guides on pricing, timelines, remodelling).
  - `/blog/1`: article (guide).
  - `/blog/precios-diseno-interiores-medellin-2026`: article, 2026 interior-design pricing in Medellín.
  - `/blog/tiempo-remodelacion-apartamento-medellin`: article, how long an apartment remodel takes in Medellín.
  - `/contacto`: contact form (name, message, "Enviar Mensaje") plus phone, email, address.
  - `/diseno-de-interiores-medellin`: geo SEO landing, Medellín.
  - `/diseno-interior-el-poblado`: geo SEO landing, El Poblado.
  - `/remodelaciones-envigado`: geo SEO landing, Envigado.
  - `/interiorismo-llanogrande`: geo SEO landing, Llanogrande.
  - `/diseno-lujo-rionegro`: geo SEO landing, Rionegro.
  - `/remodelacion-sabaneta-laureles`: geo SEO landing, Sabaneta / Laureles.
  - `/terminos`: terms of service.
  - `/privacidad`: privacy policy.
  - `/blog/7` is referenced inside articles but not linked from nav (not captured).
- **Nav**: header Inicio, Servicios, Framework, Luminarias, Portafolio, Blog, Contacto, plus an external "Dirección de espacio" link to direccion.aluzinaa.com. Footer: service links, five geo pages, social icons, Términos / Privacidad.
- **CTAs and contact**: contact form on `/contacto` ("Agenda tu consultoría / Hablemos" leads there); WhatsApp click-to-chat site-wide at **+57 310 390 6773**; email **espacio@aluzinaa.com**; address **Carrera 37 a # 2 sur 83** (Medellín); Instagram **@aluzinaa** (`instagram.com/aluzinaa`, two URL variants in use); the **Facebook link is an unwired placeholder** (`https://facebook.com`); free-guide lead magnet; blog "Ver guía completa" links.
- **Design**: fonts **DINRoundPro** (primary UI / body) + **Playfair Display** (a few display headings). Palette: near-black **`#09090b` / `#18181b`** surfaces and text, white, grays `#9ca3af` `#71717a` `#111827` `#374151`, light `#f3f4f6` / `#fafafa`, accent yellow **`#facc15`**, teal chip **`#2dd4bf`** (used for the "Dirección de espacio" link). Primary button dark-filled `#18181b` with white text; white outline variant. Logo `/lovable-uploads/eba5b5fe-7b92-4ae7-bda5-c4273b064afe.png`. Full counts: `docs/source/aluzinaa-archive/aluzinaa.com/design-tokens.json`.
- **Quality at capture**: all 18 pages HTTP 200, no dead internal links, no placeholder copy. Rough edges: the bare Facebook link; a body comment `<!-- IMPORTANT: DO NOT REMOVE THIS SCRIPT TAG OR THIS VERY COMMENT! -->` with no script nearby (recorded as data, not acted on).
- **Source**: the React source is **not in any repo we hold yet**. Lovable holds it; getting it onto GitHub follows the entry below (D-031: it gets its own Lovable-created repo under imagine-os, this monorepo links to it and archives it). What we hold: rendered text of every page, the rendered home DOM, screenshots and tokens in `docs/source/aluzinaa-archive/aluzinaa.com/`.

## direccion.aluzinaa.com (consultation funnel)

```
status: current
since: 2026-09-21
source: prompt 0007 / docs/source/aluzinaa-archive (captured 2026-09-21 03:59-04:12 UTC from Slack #website-scraping, Justin Massion)
```

- **What**: a **single hand-written static HTML page** selling **"Dirección de Espacio"**, a 60-minute interior-design consultation at **$880.000 COP**, by **Alejandra Guerra** (founder, `knowledge/team.md`). A dedicated offer subdomain of aluzinaa.com; the main site's header links to it and it links back to `https://www.aluzinaa.com/`.
- **Language**: Spanish only, no toggle. No auth, no forms, no backend.
- **Hosting**: **Vercel** (`server: Vercel`, `x-vercel-cache: HIT`), static; images at relative `/Fotos/web/...`.
- **Page**: one route; nav items Método / Dirección de Espacio / Contacto are anchors `#metodo` / `#direccion` / `#agenda`. Sections: hero (slideshow), before / after problem statement, four-photo method showcase, service breakdown A-D (Análisis funcional, Dirección estética, Hoja de ruta, Claridad de acción), testimonial marquee (six clients), Alejandra's bio, pricing and booking.
- **CTAs**: **Calendly** popup `calendly.com/alejaguerra/30min` ("AGENDA UNA ASESORÍA", "AGENDA TU DIRECCIÓN DE ESPACIO", "RESERVA TU SESIÓN"); **WhatsApp** `wa.me/573103906773` ("ESCRÍBEME POR WHATSAPP" + floating button); footer espacio@aluzinaa.com and Instagram @aluzinaa.
- **Design**: font stack `'DIN Round Pro', 'M PLUS Rounded 1c', -apple-system, sans-serif` (DIN Round Pro is not embedded, so the Google Fonts fallback M PLUS Rounded 1c renders). Ink **`#141414`** dominant, white, ink-soft `rgb(95,95,95)`, gray `rgb(138,138,138)`, WhatsApp green `rgb(37,211,102)`, cream **`rgb(242,236,226)`**. Primary button translucent white on the hero, solid `#141414` elsewhere. Logo `Fotos/web/logo-aluzina-blanco.png`.
- **Source**: the **complete source is archived in the repo** at `docs/source/aluzinaa-archive/direccion.aluzinaa.com/html/home.html` (inline style, one inline script for the slideshow; externals are only Calendly and Google Fonts). With the `/Fotos/web/` images it is re-hostable from the repo, so this site is already backed up and editable from here (D-031).
- **Quality at capture**: polished production funnel page; one transient 502 / 404 on `Fotos/web/antes-1.jpg` that returned 200 on re-check.

## How Lovable's GitHub sync works (verified 2026-09-21 against docs.lovable.dev)

```
status: current
since: 2026-09-21
source: prompt 0007; docs.lovable.dev (GitHub integration pages), read 2026-09-21 by Opus 5; applies to aluzinaa.com
```

- **Two-way sync on one branch.** Lovable pushes every edit made in its editor to the connected GitHub repo and pulls every push to that branch back into the editor. Sync follows a single default branch (`main`).
- **Lovable always creates a new private repo.** It cannot import or adopt an existing repository, so the aluzinaa.com code cannot be synced into `imagine-os/aluzina`; it gets a repo of its own (D-031).
- **Install the Lovable GitHub App on the imagine-os organization before connecting.** In Lovable: Workspace settings -> Git -> GitHub -> Add connection -> Add account, pick the **imagine-os** organization (not a personal account), Install & Authorize; then Project settings -> Git -> GitHub -> Connect next to imagine-os. If the repo lands under a personal account, **transferring it later breaks the sync**, and only Lovable support can reattach it.
- **Protected or diverged branches push to `lovable-sync`.** If the default branch is protected, or the histories have diverged, Lovable pushes to a `lovable-sync` branch that someone must merge by hand. Rule for shared editing: leave `main` unprotected and never edit the same branch in Lovable and here at the same time.
- **A GitHub push updates the editor, never the live site.** Publishing stays a manual step: someone presses **Publish** in Lovable, or we host the site from the repo ourselves later (GitHub Pages / Vercel).
- **Git is not the whole backup.** Database data, secrets and uploaded storage files live in Lovable Cloud (Supabase) outside the repo and need their own export.
- **Code zip download** exists on paid plans: Project settings -> Git -> Download codebase.
- Unknown: whether aluzinaa.com uses Lovable Cloud at all (the contact form's backend is `_unknown_`; no Supabase calls were seen in the crawl), and which Lovable plan the owner is on (`_unknown_`).

## Change log

- 2026-09-21: file created with the two site entries and the Lovable GitHub-sync entry (Slack #website-scraping, prompt 0007, changelog 0011, D-031; scrapes by Sonnet 5, Lovable docs by Opus 5, integration by Fable 5.1).
