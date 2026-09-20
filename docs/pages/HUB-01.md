# HUB-01 - Hub

- route: `/#/`
- surface: hub
- status: built
- spec: `apps/hub/src/modules/hub/specs.ts`
- model: Fable 5.1

## Purpose

Entry point to every surface of the Aluzina Business OS for Justin, the owner, testers and agents. Today it links the two live surfaces (the owner's Lovable site and the repo docs) and announces the five planned ones. Later it gains the role switcher, demo simulator, canvas and plan viewer (build plan step 4).

## Screenshots

`docs/screenshots/HUB-01/en-390.jpg`, `en-1280.jpg`, `en-3840.jpg`, `es-390.jpg` (live site, light theme, dev mode off), plus `routes.json` (manifest at capture time).

## Layout (top to bottom)

1. `HubHeader`: brand mark + "Aluzina"; controls: language (shows the *other* language, EN/ES), theme (Light / Dark, `aria-pressed`), dev mode (Dev on / Dev off, `aria-pressed`).
2. Hero: h1 "Aluzina Business OS", one-line subtitle.
3. Surface grid (`auto-fill, minmax(18rem, 1fr)`): BOS Business OS prototype (planned), P-00 Public website (live, aluzinaa.com), C-xx Customer app (planned), A-xx Staff / admin dashboard (planned), D-06 Docs (live, GitHub `docs/`), M-xx Ops manual (planned), D-xx Dev tools (planned).
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

## Actions (P-05)

| id | label | intent | permission | params |
| --- | --- | --- | --- | --- |
| `hub.openSurface` | Open surface | open the {surface} | – | `surface: enum:business-os\|website\|customer\|staff\|docs\|manual\|dev` |
| `hub.setLang` | Set language | switch the language to {lang} | – | `lang: enum:en\|es` |
| `hub.toggleTheme` | Toggle theme | switch between light and dark | – | – |
| `hub.toggleDevMode` | Toggle developer mode | turn developer mode on or off | `dev.tools` | – |

No actions bus yet: the manifest declares them; nothing runs them by id (step 7).

## Components

`HubHeader` (organism), `SurfaceCard` (molecule), `ToggleButton`, `Placeholder`, `Toast` (atoms); `DevTools` (SpecChip + panel, `src/dev/`).

## Real vs mock / placeholder

Real: language, theme, dev mode, the two live links, the manifest. Placeholder: Business OS prototype, Customer app, Staff / admin dashboard, Ops manual, Dev tools (5 `data-placeholder` elements).

## Responsive and input check (P-01, P-03)

Verified on the live site at 390, 1280, 3840 (`spec.checkedAt`); local smoke at 1920 (body 18 px) and 3840 (body 32 px, h1 96 px). Header wraps at phone width, no horizontal scroll. Every control is one focusable element >= 44 px; global 3 px focus ring; tooltip shows on focus; nothing drag-only. 360 / 768 / 2560 not yet captured.

## Strings (P-13)

Namespace `hub.*` (+ `core.*`). EN complete, ES complete.

## Open questions

- Default language en vs es (D-004).
- Card codes for the Business OS pages once the export is audited (BOS-xx).
