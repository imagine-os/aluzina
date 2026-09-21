# Social channels

```
status: draft
since: 2026-09-21
source: Slack #social-scraping 2026-09-21 (Justin Massion) + public web capture (docs/source/social/instagram/2026-09-21-aluzina.espacios/)
```

What we know about Aluzina's public social presence and the public pages around it. Everything here is `draft` until the founder or Justin confirms the handle; figures taken from search-engine snippets are marked as such and are not observed data. The capture evidence (HTTP responses, route by route) lives in `../source/social/instagram/2026-09-21-aluzina.espacios/README.md`; the intake rule is D-032. The website itself is documented canonically in `public-sites.md` (prompt 0007, changelog 0011); the homepage snapshot below is kept as this capture's own evidence.

## Instagram

```
status: draft
since: 2026-09-21
source: Slack #social-scraping 2026-09-21 03:20 UTC (Justin Massion, prompt 0008); capture 2026-09-21 04:00-04:14 UTC; Marketing > marketing-channels seed post (prompt 0005)
```

- **Channel purpose** (from the existing `marketing-channels` seed post, Spanish, as written): "mostrar proceso y luz; conversación con arquitectos y clientes residenciales". Metrics per channel: `_unknown_` ("pendiente de definir").
- **Handle requested: `aluzina.espacios`** (https://www.instagram.com/aluzina.espacios/). Status **unresolved**. Evidence that it is not a live handle is **circumstantial only**: no search engine indexes `instagram.com/aluzina.espacios`, and the company website links a different handle (below); the one mirror that rendered anything showed 0 / 0 / 0 and "An account with this login does not exist" (generic string, weak). ~~Instagram's own unauthenticated HTML shell for `/aluzina.espacios/` is the error route (`polarisRouteConfig.pageID = "httpErrorPage"`, root `PolarisErrorRoot`, `show_lox_redesigned_404_page: true`).~~ **Withdrawn 2026-09-21 04:40 UTC**: the certainly-live `/aluzinaa/` returned the identical shell (HTTP 200, 04:36:09Z), so Instagram serves it to every anonymous datacenter client here and it is not diagnostic (D-038). A renamed, misspelled or private account is not excluded. Full name, bio, counts, category, privacy: `_unknown_`.
- **Handle linked from the website: `@aluzinaa`** (https://www.instagram.com/aluzinaa/). aluzinaa.com's "Síguenos" and "Ver Instagram" buttons and its footer icon all link here; a public Facebook post of facebook.com/aluzinaa references it too. **Not captured**: three curl probes ten minutes apart (04:15 302 login wall, 04:26 302, 04:36 200 shell without profile data), then the one permitted headless-browser attempt at 04:36:32Z got HTTP 429 + login redirect (`is_from_rle`); stopped, no retry (`../source/social/instagram/2026-09-21-aluzinaa/`). Search-snippet figures, **unverified and possibly stale**: name "ALUZINA", ~450 posts, ~21K followers, 2,903 following. Do not quote these as observed.
- **Access from the agent environment** (2026-09-21): web API 400 / 401 (`require_login`), profile HTML = a data-less shell for live and unknown handles alike, headless Chromium / curl / WebFetch 429 with redirect to `/accounts/login/?next=...&is_from_rle` for control handles too; all public mirror viewers Cloudflare-challenged (403), blocked (451, `/blocked`), 404, proxy CONNECT 502 or WebSocket-only. No login, no credentials, no wall bypass was attempted (D-032).

## Other public pages

```
status: draft
since: 2026-09-21
source: public web capture 2026-09-21 (search results + aluzinaa.com homepage); nothing confirmed by the founder yet
```

| Page | URL | Notes |
| --- | --- | --- |
| Website | https://aluzinaa.com/ | Owner-built Lovable site (project brief); rendered 2026-09-21 04:09 UTC, see snapshot below |
| Sub-site | https://direccion.aluzinaa.com/ | Linked from the site header as "Dirección de espacio"; not fetched |
| Facebook | https://www.facebook.com/aluzinaa/ | Search-result title "Aluzina Espacios | Medellín"; direct fetch redirected to Facebook login, not pursued |
| LinkedIn | company page `aluzina-universo-del-diseño` | From search results; not fetched |
| Instagram | https://www.instagram.com/aluzinaa/ | See above; unverified |
| Email (website footer) | espacio@aluzinaa.com | As published on the homepage |
| Phone (website footer) | +57 310 390 6773 | As published on the homepage |
| TikTok, YouTube, Pinterest, WhatsApp Business | `_unknown_` | A Pinterest pin repeats the `@aluzinaa` handle; no owned board confirmed |

## Website snapshot 2026-09-21

```
status: draft
since: 2026-09-21
source: https://aluzinaa.com/ public homepage rendered in headless Chromium 2026-09-21 04:09 UTC (docs/source/social/instagram/2026-09-21-aluzina.espacios/bio_link_site.json); captured, not confirmed with the founder
```

Captured from the public homepage only (Spanish); inner pages (`/servicios`, `/framework`, `/luminarias`, `/portafolio`, `/blog`, `/contacto`) were not fetched. Title: "Diseño Interior Medellín | Interiorismo Emocional y Neurointeriorismo — Aluzina". Tagline: "Diseñamos espacios que se sienten, no solo se ven. Neurointeriorismo e iluminación emocional en Medellín."

**Luminaire catalog (homepage section "Luminarias para Diseño de Hoteles Medellín", prices in COP as shown):**

| Luminaire | Price | Type | Tags shown | Rating shown |
| --- | --- | --- | --- | --- |
| Luminaria Onion | $850,000 | De Mesa | Nuevo Diseño | 5.0 |
| Luminaria Madera Plenitud | $960,000 | Híbridos | Artesanal; madera natural, LED 10W, luz cálida | 4.8 |
| Luminaria Plenitud Circular | $850,000 | Colgantes | Nuevo Diseño; negro / blanco, LED 18W | 5.0 |
| Luminaria Pequeña Plenitud | $700,000 | Colgantes | Bestseller; negro / blanco / azul, LED 12W | 4.9 |
| Luminaria Union de Mesa | $700,000 | De Mesa | Exclusivo; estructura metálica y espejos | 4.8 |
| Luminaria Pequeña Unión | desde $800,000 | De Mesa | Exclusivo; versión metálica / con espejos, LED 12W | 5.0 |

Catalog filters: Todas, De Mesa, Híbridos, Colgantes, Sistemas. All six marked "Disponible". "Ver catálogo completo" links to `/luminarias` (not fetched).

**Services (footer "Servicios de Diseño"):** Diseño de Interiores Medellín; Diseño Hoteles Boutique Medellín; Diseño de Apartamentos Medellín; Interiorismo Comercial Antioquia; Consultoría Neurointeriorismo Medellín; Framework ALUZINA. Problem framing on the homepage: "Espacios Desaprovechados", "Ambientes Monótonos", "Falta de Personalización". Hotel focus: "Experiencias Lumínicas Memorables", "Diseño Interior que Detona Comportamientos".

**Process ("Nuestro Proceso de Diseño Interior en Medellín"):** 1. Análisis y Conceptualización; 2. Diseño y Planificación; 3. Implementación y Ejecución; 4. Entrega y Seguimiento.

**Stats shown:** 50+ proyectos completados; 6 ciudades atendidas; 100% clientes satisfechos; 5+ años de experiencia.

**Service areas:** El Poblado, Envigado, Laureles, Sabaneta, Rionegro, Llanogrande (footer "Atendemos en"); landing pages `/diseno-interior-el-poblado`, `/remodelaciones-envigado`, `/interiorismo-llanogrande`, `/diseno-lujo-rionegro`, `/remodelacion-sabaneta-laureles`.

**Blog and guides:** "Diseño de Hoteles Medellín — Convierte tu Hotel en un Destino Inolvidable" (`/blog/1`); "Guía Completa de Precios de Diseño de Interiores en Medellín 2026" (`/blog/precios-diseno-interiores-medellin-2026`; teaser "Asesorías desde $500.000 COP • Diseño $80k-$150k/m² • Premium hasta $6M/m²"); "¿Cuánto Tiempo Tarda una Remodelación en Medellín? Tiempos Reales 2026" (`/blog/tiempo-remodelacion-apartamento-medellin`; teaser "Baño 6-8 sem • Apartamento 4-5 meses • Casa 7-9 meses • Trámites curaduría"); lead magnet "Los 5 Errores de Diseño que Están Matando las Reservas de tu Hotel" (form: nombre, email, WhatsApp).

**FAQ headings (11):** ¿Cuánto cuesta un diseño de interiores en Medellín?; ¿Cuáles son los mejores diseñadores de interiores en Antioquia?; ¿Cuál es la mejor empresa de diseño interior en Medellín para proyectos de lujo?; ¿Qué es el neurointeriorismo y cómo lo aplica Aluzina en Medellín?; ¿Cuánto cuesta remodelar un apartamento en El Poblado Medellín?; ¿Cuánto tiempo tarda una remodelación en Medellín?; ¿Aluzina trabaja con remodelación de apartamentos en El Poblado?; ¿Qué tendencias de diseño biofílico aplican en Antioquia?; ¿Diseñan cocinas y acabados de lujo en Antioquia?; ¿Cómo diseñar espacios frescos para el clima de Medellín?; ¿Trabajan con hoteles boutique y alojamientos turísticos?

## Open questions

- Which Instagram handle is Aluzina's: `@aluzinaa` (linked from the website), or does `aluzina.espacios` exist under another spelling or as a private account? Asked in #social-scraping 2026-09-21. The only evidence either way is the website link and the search index (the Instagram error-shell reading was withdrawn, D-038).
- Access route for the intake: Instagram's own data export (Accounts Center > Download your information, JSON) uploaded to the thread, or a Graph API token for the account (D-032). Public scraping from the agent egress is rate-limited to a login wall.
- Whether the other channels (Facebook, LinkedIn, Pinterest, TikTok, YouTube, WhatsApp Business) are owned and active: `_unknown_`.
- Whether the luminaire prices and stats on the homepage are current: captured, not confirmed.

## Change log

- 2026-09-21: file created as `draft` after the first #social-scraping intake (Justin Massion, prompt 0008; changelog 0012, D-032): Instagram handle unresolved (`aluzina.espacios` vs `@aluzinaa`), other public pages, homepage snapshot, open questions.
- 2026-09-21 04:40 UTC: Instagram error-shell evidence withdrawn (the live `@aluzinaa` returns the same shell); `@aluzinaa` attempt recorded (probes 302 / 302 / 200, browser 429); handle question rests on the website link and search index only (capture worker control fetch; changelog 0012 correction, D-038).
