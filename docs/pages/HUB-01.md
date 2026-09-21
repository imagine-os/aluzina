# HUB-01 - Hub

- route: `/#/`
- surface: hub
- status: built
- spec: `apps/hub/src/modules/hub/specs.ts`
- model: Fable 5.1

## Purpose

Entry point to every surface of the Aluzina Business OS for Justin, the owner, testers and agents. Since changelog 0006 it opens the **portals**: one card per role (Founder A-01, Administration and Operations O-01, Interior Design S-01, Graphic Design and Communication G-01; Client C-01 planned) that switches the demo user and enters that portal (D-014, D-015), plus a "Viewing as" role switcher in the header. It still links the live surfaces (the Business OS prototype and its five pages, the owner's Lovable site, the repo docs, the dev tools) and announces the planned ones; every card carries a thumbnail of the page it opens, regenerated on each deploy (D-011). Since changelog 0013 every card in the three sections (Portals, Product surfaces, Builder and dev tools) is live, its status derived from the route manifest by page code.

## Screenshots

`docs/screenshots/HUB-01/` — `en-390.jpg`, `en-1280.jpg`, `es-1280.jpg`, `en-1920.jpg`, `en-3840.jpg` captured live against `/`. Captured against a local production build (`npm run preview`, same commit as the deploy, version 0.10.0) rather than the live `https://imagine-os.github.io/aluzina/` URL directly: the sandbox's TLS-weakening guard refused the Chromium launch flag needed to make headless Chromium trust the outbound proxy's certificate for that external host. Content is identical (GitHub Pages serves this same build); only the deploy-time hub-card thumbnails (`npm run thumbs`, a separate CI step not run here) are missing locally, so HUB-01 and D-07 show the "No preview yet" placeholder tile instead of real thumbnails in these captures. No overflow or blank-render defects found at the widths captured.

## Layout (top to bottom)

1. `HubHeader`: `BrandMark` wordmark (iridescent in both themes since the silver edition, changelog 0015, D-050); `RoleSwitcher` ("Viewing as", native select of the six demo users); controls: language (shows the *other* language, EN/ES), theme (Light / Dark, `aria-pressed`), dev mode (Dev on / Dev off, `aria-pressed`).
2. Hero: a decorative `aria-hidden` `Shimmer` metal band (silver, intensity 0.35, veiled 48% by the theme bg in light / 30% in dark) carrying the iridescent wordmark (D-034, D-050), then h1 "Aluzina Business OS" and the one-line subtitle in theme text below it.
3. **Portals** grid: A-01 Founder (Alejandra Guerra), O-01 Administration and Operations (Miguel), S-01 Interior Design (Sarai), G-01 Graphic Design and Communication (Angélica) as cards whose status (Live / Stub) is read from the registered dashboard route (button: "Enter as <name> →"), C-01 Client app (live since 0013, opens `#/client` as the demo client). Each with its deploy-time thumbnail.
4. **Product surfaces** grid (`auto-fill, minmax(18rem, 1fr)`; status derived from the route manifest by code: built -> Live, stub -> Stub, no route -> Planned): P-00 Public website (external, aluzinaa.com), P-01 Services and intake (`#/services`, 0013), G-08 Portfolio & brochure (`#/brand/documents`; switches to the brand demo user when the current role lacks `brand.manage`, `enterUnless`, so the card never lands on a permission wall), C-01 Client app (`#/client`), M-01 Ops manual (`#/manual`), D-06 Docs (`#/docs`, the in-app viewer since 0013; GitHub link while no route), K-01 Spaces (opens on the current role's surface; founder when the role has none), BOS-01 Business OS prototype. Each card starts with a 16 / 10 thumbnail (`./thumbs/<code>.jpg`, 640 x 400) or the bilingual "No preview yet" tile.
5. **Builder and dev tools** grid (same route-derived status): D-12 Design system (`#/design`, 0014), D-05 Plan viewer, D-07 Canvas, D-08 Demo simulator, D-09 Actions, D-10 Tokens (`#/design/tokens`; the dev contrast view is D-14 `#/dev/tokens`, reached from the dev sidebar), D-11 Testing hub, D-02 Components, D-03 Specs, D-04 Multiuser; every card opens as the dev demo user.
6. Prototype pages grid (`minmax(15rem, 1fr)`): BOS-02 ALUZINA Home, BOS-03 Cyber Bridge, BOS-04 Cyber Bridge Deck, BOS-05 Image Generation Plan, BOS-06 LOD Ladder, each with its thumbnail.
7. Footer: version, "Source on GitHub", dev-mode hint.
8. Dev mode only: SpecChip `HUB-01` bottom-right; panel (Ctrl+. or chip) listing actions, permission, params, verified widths.

## Data

None (static). Preferences in localStorage: `aluzina.lang`, `aluzina.theme`, `aluzina.session` (user, viewAs, devMode; `aluzina.devMode` mirrored).

## Rules

None.

## Logic

- Portal cards are `<button>`s: `switchUser(role)` then `navigate('/<portal>')` (action `hub.enterAs`); the header select calls `switchUser` in place (`hub.switchRole`). `?as=<role>` on first load pre-selects a demo user (surfaces.md 1.1a).
- Live cards render as `<a>` (external: new tab, `rel=noreferrer`); planned cards render through `Placeholder` (a `<button>`): tooltip "Not wired yet – <what it will do>" on hover and focus, toast on click / Enter / Space, dashed outline + badge when `data-dev="on"`.
- `index.html` applies stored theme / lang / dev mode before first paint; providers take over on mount.
- Unknown routes redirect to `/`.
- Thumbnails: `scripts/thumbnails.mjs` writes `dist/thumbs/<code>.jpg` + `manifest.json` in CI after the build (`npm run thumbs`, D-011); the card requests `./thumbs/<code>.jpg?v=<buildId>` lazily, `onError` swaps in the tile; planned cards never request an image. `data-thumb="image" | "placeholder"` on the slot for QA.

## Actions (P-05)

| id | label | intent | permission | params |
| --- | --- | --- | --- | --- |
| `hub.enterAs` | Enter portal as role | open the {role} portal as its demo user | – | `role: enum:founder\|ops\|studio\|brand` |
| `hub.switchRole` | Switch role | view the system as {role} | – | `role: enum:founder\|ops\|studio\|brand\|client\|dev` |
| `hub.openSurface` | Open surface | open the {surface} | – | `surface: enum:website\|services\|client\|manual\|docs\|spaces\|business-os\|design\|plan\|canvas\|simulator\|actions\|tokens\|testing\|components\|specs\|multiuser` |
| `hub.openPrototypePage` | Open prototype page | open the prototype page {page} | – | `page: enum:home\|cyber-bridge\|cyber-bridge-deck\|image-generation-plan\|lod-ladder` |
| `hub.setLang` | Set language | switch the language to {lang} | – | `lang: enum:en\|es` |
| `hub.toggleTheme` | Toggle theme | switch between light and dark | – | – |
| `hub.toggleDevMode` | Toggle developer mode | turn developer mode on or off | `dev.tools` | – |

Every hub action is registered on the actions bus while the page is mounted (D-036); `window.__aluzina.actions.run('hub.enterAs', { role: 'ops' })` enters the ops portal.

## Components

`HubHeader`, `RoleSwitcher` (organisms), `SurfaceCard` (molecule, `image` thumbnail slot, `onActivate` button variant, `stub` status), `ToggleButton`, `Select`, `Avatar`, `Placeholder`, `Toast` (atoms); `DevTools` (SpecChip + panel, `src/dev/`).

## Real vs mock / placeholder

Real (0013): language, theme, dev mode, the role switcher, the five portal entries (four dashboards + the client app), every product-surface card (P-01, G-08, C-01, M-01, D-06, K-01, BOS-01 are built routes) and every builder-tool card (D-12, D-05, D-07, D-08, D-09, D-10, D-11, D-02, D-03, D-04), the manifest, the thumbnails (real screenshots of the deployed build; P-00 is captured from the internet and falls back to the tile when unreachable). Placeholder: none left on the hub; a card returns to Planned automatically if its route disappears.

## Responsive and input check (P-01, P-03)

Verified on the live site at 390, 1280, 3840; local smoke with thumbnails at 360, 768, 1920, 2560 (`spec.checkedAt` = full matrix). The thumbnail box has a fixed aspect ratio so cards never shift while images load; `object-fit: cover` keeps the top of the page visible at every card width; images are `loading="lazy"`. Header wraps at phone width, no horizontal scroll. Every control is one focusable element >= 44 px; global 3 px focus ring sits on the card, not the image; tooltip shows on focus; nothing drag-only.

## Strings (P-13)

Namespace `hub.*` (+ `core.*`, incl. `core.thumb.*`, `core.role.*`, `core.session.*`). EN complete, ES complete.

## Open questions

- Default language en vs es (D-004).
- Dark-theme thumbnails (`<code>-dark.jpg`) and 2x tiles for 4K: kanban backlog.
- Should the hub default to the founder's view instead of the developer's (`DEFAULT_USER_ID`)? Justin decides.
