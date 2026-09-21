# Aluzina (aluzinaa.com) — Scrape Summary

## Site purpose
Aluzina is a Medellín, Colombia interior-design and lighting studio selling "neurointeriorismo" (emotional/lighting-driven design) for luxury apartments, boutique hotels, restaurants and commercial spaces in Medellín, El Poblado, Envigado, Sabaneta/Laureles, Rionegro and Llanogrande. It also sells its own decorative luminaire line and runs a lead-gen blog with pricing/timeline guides, funneling visitors to WhatsApp/a contact form.

## Pages (18 captured)
`/` home (hero, value props, lighting showcase, luminaire teaser, process, guides, FAQ) · `/servicios` (service lines) · `/framework` (methodology) · `/luminarias` (product catalog) · `/portafolio` (projects) · `/blog` (index) · `/contacto` (form) · `/blog/1`, `/blog/precios-diseno-interiores-medellin-2026`, `/blog/tiempo-remodelacion-apartamento-medellin` (articles) · `/diseno-de-interiores-medellin`, `/diseno-interior-el-poblado`, `/remodelaciones-envigado`, `/interiorismo-llanogrande`, `/diseno-lujo-rionegro`, `/remodelacion-sabaneta-laureles` (geo SEO landing pages) · `/terminos`, `/privacidad` (legal). (`/blog/7` is referenced inside articles but not linked from nav, so it fell outside discovery.)

## Nav
Header: Inicio, Servicios, Framework, Luminarias, Portafolio, Blog, Contacto + external "Dirección de espacio" (direccion.aluzinaa.com, sister site). Footer: service links, 5 geo pages, social icons, Términos/Privacidad.

## Languages
Spanish only (`lang="es"`, es-CO locale/hreflang). No English version.

## Main CTAs
"Agenda tu consultoría / Hablemos →" (→ `/contacto`); WhatsApp click-to-chat buttons site-wide; "Enviar Mensaje" form submit; free-guide magnet; blog "Ver guía completa" links.

## Contact info
Phone/WhatsApp **+57 310 390 6773**; email **espacio@aluzinaa.com**; address **Carrera 37 a # 2 sur 83**; Instagram instagram.com/aluzinaa (two URL variants used); Facebook link is a bare unwired placeholder `https://facebook.com`.

## Tech stack signals
Built with **Lovable** (React+Vite SPA) — confirmed via `/lovable-uploads/...` paths and vendor chunks (react-vendor, ui-vendor/shadcn, query/TanStack). Server HTML is a near-empty `<div id="root">` + spinner; content renders client-side. Fronted by **Cloudflare** (HSTS, `__cf_bm` cookie). Custom analytics proxy `/~flock.js` → `/~api/analytics`. Heavy JSON-LD/OG/hreflang/geo SEO. Curiosity: a body comment `<!-- IMPORTANT: DO NOT REMOVE THIS SCRIPT TAG OR THIS VERY COMMENT! -->` with no script nearby — reads like a leftover prompt-injection-style artifact aimed at AI tools; not acted on.

## Design tokens (see design-tokens.json)
Fonts: **DINRoundPro** (primary, ~778 uses) + Playfair Display serif (headings, ~10 uses). Palette: dark zinc/near-black `#09090b`/`#18181b` + white, grays (`#9ca3af`,`#71717a`,`#111827`,`#374151`), light `#f3f4f6`/`#fafafa`; accent yellow `#facc15`, occasional teal `#2dd4bf` chip. Logo: `aluzinaa.com/lovable-uploads/eba5b5fe-7b92-4ae7-bda5-c4273b064afe.png`. Primary button style: dark-filled `#18181b` bg / white text (also a white-filled outline variant and a teal chip).

## Notable
No Lorem Ipsum/placeholder copy found; all 18 pages returned HTTP 200 with no dead internal links. Only rough edges: the bare Facebook link and the odd body comment above.

## Homepage hero (raw text)
> Expertos en Diseño Interior en Medellín | Aluzina
>
> Diseñamos espacios que se sienten, no solo se ven. Neurointeriorismo e iluminación emocional en Medellín.
