# HUB-01 - Hub

- route: `/#/`
- surface: hub
- status: built
- spec: `apps/hub/src/modules/hub/specs.ts`
- model: Fable 5.1

## Purpose

Entry point to every surface of the Aluzina Business OS for Justin, the owner, testers and agents. Since changelog 0006 it opens the **portals**: one card per role (Founder A-01, Administration and Operations O-01, Interior Design S-01, Graphic Design and Communication G-01; Client C-01 planned) that switches the demo user and enters that portal (D-014, D-015), plus a "Viewing as" role switcher in the header. It still links the live surfaces (the Business OS prototype and its five pages, the owner's Lovable site, the repo docs, the dev tools) and announces the planned ones; every card carries a thumbnail of the page it opens, regenerated on each deploy (D-011). Later it gains the demo simulator, canvas and plan viewer (build plan step 4).

## Screenshots

`docs/screenshots/HUB-01/en-390.jpg`, `en-1280.jpg`, `en-1920.jpg`, `en-3840.jpg`, `es-390.jpg` (light) and `en-390-dark.jpg`, `en-1280-dark.jpg` (dark), all recaptured from the local 0.9.0 preview with the silver edition (neutral greys, iridescent wordmark in both themes, silver hero band; changelog 0015; dev mode off, Rubik unreachable in the sandbox so text renders in the system fallback), plus `routes.json` (manifest at capture time, 78 routes, 689 action entries).

## Layout (top to bottom)

1. `HubHeader`: `BrandMark` wordmark (iridescent in both themes since the silver edition, changelog 0015, D-050); `RoleSwitcher` ("Viewing as", native select of the six demo users); controls: language (shows the *other* language, EN/ES), theme (Light / Dark, `aria-pressed`), dev mode (Dev on / Dev off, `aria-pressed`).
2. Hero: a decorative `aria-hidden` `Shimmer` metal band (silver, intensity 0.35, veiled 48% by the theme bg in light / 30% in dark) carrying the iridescent wordmark (D-034, D-050), then h1 "Aluzina Business OS" and the one-line subtitle in theme text below it.
2b. **Portals** grid: A-01 Founder (Alejandra Guerra), O-01 Administration and Operations (Miguel), S-01 Interior Design (Sarai), G-01 Graphic Design and Communication (Angélica) as cards whose status (Live / Stub) is read from the registered dashboard route (button: "Enter as <name> →"), C-01 Client portal (planned, Placeholder). Each with its deploy-time thumbnail.
3. Product surfaces grid (`auto-fill, minmax(18rem, 1fr)`, pass 0013): P-00 Public website (external), P-01 Services and intake, C-01 Client app, M-01 Ops manual, D-06 Docs (GitHub link while no route), K-01 Spaces, BOS-01 prototype; status derived from the route manifest by code (built -> Live, stub -> Stub, no route -> Planned). Each card starts with a 16 / 10 thumbnail (`./thumbs/<code>.jpg`, 640 x 400) or the bilingual "No preview yet" tile.
3a. Builder and dev tools grid: D-12 Design system (live, `#/design`, changelog 0014), D-05 plan viewer, D-07 canvas, D-08 demo simulator, D-09 actions, D-10 Tokens (live, `#/design/tokens`), D-11 testing hub, D-02 components, D-03 specs, D-04 multiuser; same route-derived status.
3b. **Product surfaces** grid also carries `G-08` **Portfolio & brochure** (pass 0013): route-derived status like the other cards; it opens `#/brand/documents`, and because that route is guarded by `brand.manage` the card switches to the brand demo user first when the current role does not have it (`enterUnless` on the surface entry), so the card never lands on a permission wall.
3b. Prototype pages grid (`minmax(15rem, 1fr)`): BOS-02 ALUZINA Home, BOS-03 Cyber Bridge, BOS-04 Cyber Bridge Deck, BOS-05 Image Generation Plan, BOS-06 LOD Ladder, each with its thumbnail.
4. Footer: version, "Source on GitHub", dev-mode hint.
5. Dev mode only: SpecChip `HUB-01` bottom-right; panel (Ctrl+. or chip) listing actions, permission, params, verified widths.

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

No actions bus yet: the manifest declares them; nothing runs them by id (step 7).

## Components

`HubHeader`, `RoleSwitcher` (organisms), `SurfaceCard` (molecule, `image` thumbnail slot, `onActivate` button variant, `stub` status), `ToggleButton`, `Select`, `Avatar`, `Placeholder`, `Toast` (atoms); `DevTools` (SpecChip + panel, `src/dev/`).

## Real vs mock / placeholder

Real: language, theme, dev mode, the role switcher and the four portal entries (they switch the session and open guarded routes; the dashboards themselves are stubs until 9b), the nine live links (BOS-01..06, P-00, D-06, D-02), the manifest, the thumbnails (real screenshots of the deployed build; P-00 and D-06 are captured from the internet and fall back to the tile when unreachable). Placeholder: Client portal, Ops manual (2 `data-placeholder` elements, each with the tile).

## Responsive and input check (P-01, P-03)

Verified on the live site at 390, 1280, 3840; local smoke with thumbnails at 360, 768, 1920, 2560 (`spec.checkedAt` = full matrix). The thumbnail box has a fixed aspect ratio so cards never shift while images load; `object-fit: cover` keeps the top of the page visible at every card width; images are `loading="lazy"`. Header wraps at phone width, no horizontal scroll. Every control is one focusable element >= 44 px; global 3 px focus ring sits on the card, not the image; tooltip shows on focus; nothing drag-only.

## Strings (P-13)

Namespace `hub.*` (+ `core.*`, incl. `core.thumb.*`, `core.role.*`, `core.session.*`). EN complete, ES complete.

## Open questions

- Default language en vs es (D-004).
- Dark-theme thumbnails (`<code>-dark.jpg`) and 2x tiles for 4K: kanban backlog.
- Should the hub default to the founder's view instead of the developer's (`DEFAULT_USER_ID`)? Justin decides.
