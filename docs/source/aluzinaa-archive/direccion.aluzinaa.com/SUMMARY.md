# Site Summary: direccion.aluzinaa.com

## What it is
A single-page Spanish landing page selling **"Dirección de Espacio"** ("Space Direction"), a paid 60-min interior-design consultation (**$880.000 COP**) from **Alejandra Guerra**, founder of **Aluzina**, a Medellín interior-design/lighting studio. Relates to aluzinaa.com as a dedicated offer/funnel subdomain: nav logo, a "Conoce aluzinaa.com" button, and the footer all link to `https://www.aluzinaa.com/`, and Instagram `@aluzinaa` confirms the same brand. Purpose: convert visitors into booked consults via Calendly/WhatsApp.

## Pages
Only **one page** exists (well under the 25-page cap). It's a true single-pager: nav items `Método`, `Dirección de Espacio`, `Contacto` are in-page anchors (`#metodo`, `#direccion`, `#agenda`), not routes. No other same-origin URLs found.
- **Home** (`/`) — hero, before/after problem section, 4-photo method showcase, service breakdown (A/B/C/D: Análisis funcional, Dirección estética, Hoja de ruta, Claridad de acción), scrolling testimonial marquee (6 clients), Alejandra bio, closing pricing/booking section.

## Nav & Languages
Logo (→aluzinaa.com) · Método · Dirección de Espacio · Contacto · "Conoce aluzinaa.com". Spanish only (`lang="es"`), no toggle.

## CTAs
"AGENDA UNA ASESORÍA" / "AGENDA TU DIRECCIÓN DE ESPACIO" / "RESERVA TU SESIÓN" → Calendly popup (`calendly.com/alejaguerra/30min`); "ESCRÍBEME POR WHATSAPP" + floating WA button → `wa.me/573103906773`; footer email `espacio@aluzinaa.com`, IG `@aluzinaa`.

## Auth behavior
None — public static page, 200 response, no redirect/login wall.

## Tech stack signals
Not Vite/React/Lovable/Next (no `#root`/`#__next`, no bundler tags, no generator meta). Plain hand-authored **static HTML + inline `<style>` + one inline `<script>`** (hero slideshow). Only externals: Calendly widget JS/CSS and Google Fonts (`M PLUS Rounded 1c`, fallback for non-embedded "DIN Round Pro"). No Supabase/backend calls. **Hosting: Vercel** (`server: Vercel`, `x-vercel-cache: HIT` via `curl -I`), static blob (`content-disposition: inline`). Images at relative `/Fotos/web/...`.

## Design tokens
Colors by frequency: ink `#141414` (dominant), white `#FFFFFF`, ink-soft `rgb(95,95,95)`, black, gray `rgb(138,138,138)`, WhatsApp green `rgb(37,211,102)`, cream `rgb(242,236,226)`. Font: `'DIN Round Pro','M PLUS Rounded 1c',-apple-system,sans-serif` (rounded sans; DIN Round Pro not embedded, renders as fallback). Primary button: translucent white on hero, solid dark `#141414` elsewhere. Logo: `Fotos/web/logo-aluzina-blanco.png`.

## Notable
One transient 502/console-404 on `Fotos/web/antes-1.jpg` during first crawl; direct `curl` re-check returned 200 — looks like a momentary Vercel cold-start blip, not a persistent broken image. No forms, no placeholders, otherwise error-free; polished production funnel page, not an app.
