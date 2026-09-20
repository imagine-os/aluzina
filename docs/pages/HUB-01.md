# HUB-01 - Hub

- route: `/#/`
- surface: hub
- status: built
- spec: `apps/hub/src/modules/hub/specs.ts`
- model: Fable 5.1

## Purpose

Entry point to every surface of the Aluzina Business OS for Justin, the owner, testers and agents. It links the live surfaces (the Business OS prototype and its five pages, the owner's Lovable site, the repo docs) and announces the planned ones; every card carries a thumbnail of the page it opens, regenerated on each deploy (D-011) so Justin can tell what is what at a glance. Later it gains the role switcher, demo simulator, canvas and plan viewer (build plan step 4).

## Screenshots

`docs/screenshots/HUB-01/en-390.jpg`, `en-1280.jpg` (live site with thumbnails, changelog 0005), `en-3840.jpg`, `es-390.jpg` (changelog 0002; light theme, dev mode off), plus `routes.json` (manifest at capture time).

## Layout (top to bottom)

1. `HubHeader`: brand mark + "Aluzina"; controls: language (shows the *other* language, EN/ES), theme (Light / Dark, `aria-pressed`), dev mode (Dev on / Dev off, `aria-pressed`).
2. Hero: h1 "Aluzina Business OS", one-line subtitle.
3. Surface grid (`auto-fill, minmax(18rem, 1fr)`): BOS-01 Business OS prototype (live), P-00 Public website (live, aluzinaa.com), C-xx Customer app (planned), A-xx Staff / admin dashboard (planned), D-06 Docs (live, GitHub `docs/`), M-xx Ops manual (planned), D-xx Dev tools (planned). Each card starts with a 16 / 10 thumbnail (`./thumbs/<code>.jpg`, 640 x 400) or the bilingual "No preview yet" tile.
3b. Prototype pages grid (`minmax(15rem, 1fr)`): BOS-02 ALUZINA Home, BOS-03 Cyber Bridge, BOS-04 Cyber Bridge Deck, BOS-05 Image Generation Plan, BOS-06 LOD Ladder, each with its thumbnail.
4. Footer: version, "Source on GitHub", dev-mode hint.
5. Dev mode only: SpecChip `HUB-01` bottom-right; panel (Ctrl+. or chip) listing actions, permission, params, verified widths.

## Data

None (static). Preferences in localStorage: `aluzina.lang`, `aluzina.theme`, `aluzina.devMode`.

## Rules

None.

## Logic

- Live cards render as `<a>` (external: new tab, `rel=noreferrer`); planned cards render through `Placeholder` (a `<button>`): tooltip "Not wired yet – <what it will do>" on hover and focus, toast on click / Enter / Space, dashed outline + badge when `data-dev="on"`.
- `index.html` applies stored theme / lang / dev mode before first paint; providers take over on mount.
- Unknown routes redirect to `/`.
- Thumbnails: `scripts/thumbnails.mjs` writes `dist/thumbs/<code>.jpg` + `manifest.json` in CI after the build (`npm run thumbs`, D-011); the card requests `./thumbs/<code>.jpg?v=<buildId>` lazily, `onError` swaps in the tile; planned cards never request an image. `data-thumb="image" | "placeholder"` on the slot for QA.

## Actions (P-05)

| id | label | intent | permission | params |
| --- | --- | --- | --- | --- |
| `hub.openSurface` | Open surface | open the {surface} | – | `surface: enum:business-os\|website\|customer\|staff\|docs\|manual\|dev` |
| `hub.openPrototypePage` | Open prototype page | open the prototype page {page} | – | `page: enum:home\|cyber-bridge\|cyber-bridge-deck\|image-generation-plan\|lod-ladder` |
| `hub.setLang` | Set language | switch the language to {lang} | – | `lang: enum:en\|es` |
| `hub.toggleTheme` | Toggle theme | switch between light and dark | – | – |
| `hub.toggleDevMode` | Toggle developer mode | turn developer mode on or off | `dev.tools` | – |

No actions bus yet: the manifest declares them; nothing runs them by id (step 7).

## Components

`HubHeader` (organism), `SurfaceCard` (molecule, with the `image` thumbnail slot), `ToggleButton`, `Placeholder`, `Toast` (atoms); `DevTools` (SpecChip + panel, `src/dev/`).

## Real vs mock / placeholder

Real: language, theme, dev mode, the eight live links (BOS-01..06, P-00, D-06), the manifest, the thumbnails (real screenshots of the deployed build; P-00 and D-06 are captured from the internet and fall back to the tile when unreachable). Placeholder: Customer app, Staff / admin dashboard, Ops manual, Dev tools (4 `data-placeholder` elements, each with the tile).

## Responsive and input check (P-01, P-03)

Verified on the live site at 390, 1280, 3840; local smoke with thumbnails at 360, 768, 1920, 2560 (`spec.checkedAt` = full matrix). The thumbnail box has a fixed aspect ratio so cards never shift while images load; `object-fit: cover` keeps the top of the page visible at every card width; images are `loading="lazy"`. Header wraps at phone width, no horizontal scroll. Every control is one focusable element >= 44 px; global 3 px focus ring sits on the card, not the image; tooltip shows on focus; nothing drag-only.

## Strings (P-13)

Namespace `hub.*` (+ `core.*`, incl. `core.thumb.none` / `core.thumb.alt`). EN complete, ES complete.

## Open questions

- Default language en vs es (D-004).
- Dark-theme thumbnails (`<code>-dark.jpg`) and 2x tiles for 4K: kanban backlog.
