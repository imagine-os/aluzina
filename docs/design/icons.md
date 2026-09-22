# Icons

- component: `apps/hub/src/components/atom/Icon/Icon.tsx` (+ `iconMap.ts`, `Icon.css`, `Icon.meta.ts`, `Icon.example.tsx`)
- sheet: `/#/dev/components` -> Icon (every name, drawn)
- tokens: `--icon-sm` 1rem / `--icon-md` 1.25rem / `--icon-lg` 1.5rem / `--icon-xl` 2rem (`design/tokens.ts` -> `styles/tokens.css`)
- model: Fable 5.1 (set and mapping), Opus 5 (build, and the ar-21 pass below)

Navigating the OS used to mean reading Unicode glyphs (`◈ ▤ ◇ ▦ ◆ ✓ ☷ ▣ ◉ ▷ ✦ ▩ ▥ ◦ …`): they render differently on every platform, several routes share one shape, and none of them says what the page is. This pass draws one icon per thing the OS actually has, and resolves it from data that already exists, so **no module changed**.

## Principles

1. **One grid, one stroke.** 24 x 24 viewBox, stroke 1.75, round caps and joins, `currentColor`, no fills except a tiny dot (a 1.75 stroke cannot draw a 2 px dot). Nothing is drawn tighter than ~3.5 units from the edge.
2. **Geometric and calm.** The brand is silver, editorial and quiet (`docs/design/brand-system.md`); icons are straight lines, circles and a few arcs. No playful shapes, no perspective tricks, no colour inside the icon.
3. **Named for the thing, not the drawing.** `approvals`, `deliveries`, `purchases`, `site` - never `thumbs-up`, `truck`, `bag`, `pin`. A redraw never renames a call site.
4. **Never the only signal (P-03).** Every place an icon appears keeps its text: nav label, tree row name, card code and title. Icons are `aria-hidden` unless they stand alone, and then they take `label` (`role="img"` + `aria-label`).
5. **Tokens, not pixels (P-07, P-01).** Sizes come from `--icon-*` in rem, so an icon grows with its text through the `--scale` bands up to 4K. Ink is `currentColor`, so light, dark and the metal switch all apply for free.
6. **The Unicode glyphs stay.** They remain in each module's `nav.glyph` and in the seeded spaces as data and as the last fallback. A module that invents a new glyph keeps working without touching this file.

## Sizes

| token | value | used for |
| --- | --- | --- |
| `--icon-sm` | 1rem (16) | inline with text, the code line of a SurfaceCard, the SpaceTree chevron |
| `--icon-md` | 1.25rem (20) | nav rows (sidebar, bottom nav, drawer), SpaceTree rows |
| `--icon-lg` | 1.5rem (24) | section headers, the icon sheet |
| `--icon-xl` | 2rem (32) | the empty thumbnail tile (drawn at 1.6x the token there) |

## Resolution order

`resolveIcon(code, glyph)` in `components/atom/Icon/iconMap.ts` - the one order in the OS:

1. **`ROUTE_ICONS[code]`** - by page code (`S-12` archive, `K-01` spaces, `K-04` graph, `K-05` catalog, `K-06` import, `W-01` work, `A-03` sales, `O-05` quotes...). This is how one shared glyph becomes several meanings.
2. **`GLYPH_ICONS[glyph]`** - the generic reading of the Unicode glyph, for anything with no code (seeded spaces, a new route that has not been listed yet).
3. **the glyph text itself** - rendered by the caller, so nothing ever renders blank.

Space kinds have their own map, `SPACE_KIND_ICONS`: `area` spaces, `topic` note, `role` user, `client` clients, `deliverable` assets, `tool` tools, `project` projects, `archive` archive. An unknown kind keeps the seeded glyph.

## Glyph -> icon

| glyph | icon | glyph | icon | glyph | icon |
| --- | --- | --- | --- | --- | --- |
| `◈` | dashboard | `▤` | documents | `◇` | references |
| `▦` | catalog | `◆` | money | `✓` | approvals |
| `☷` | team | `▣` | reports | `◉` | quality |
| `▷` | deliveries | `✦` | palette | `▩` | images |
| `▥` | work | `◦ · ▪ ▫ ●` | dot | `◌` | note |
| `▸` | chevron-right | `▾` | chevron-down | `§` | docs |
| `⌖` | site | `❖` | brand | `✎` | intake |
| `⊞ ⇄` | revisions | `$ ◎` | money | `⚒` | tools |
| `▲` | execution | `☑` | check | `✉` | messages |
| `⛟` | deliveries | `⇥` | import | `⟡` | graph |
| `◱` | plan | `◫` | spaces | `▭` | simulator |
| `▧` | purchases | `⌗` | testing | `⌁` | actions |
| `◐` | tokens | `!` | alerts | `☰ …` | more |

UI glyphs added in ar-21, for the marks modules typed inside their own bodies rather than in a `nav.glyph`:

| glyph | icon | glyph | icon | glyph | icon |
| --- | --- | --- | --- | --- | --- |
| `× ✕` | close | `›` | chevron-right | `‹` | chevron-left |
| `▶` | chevron-right | `◀` | chevron-left | `→` | chevron-right |
| `←` | back | `↓` | download | `↗` | external |
| `−` | minus | `+` | plus | `⧉` | copy |
| `⌕` | search | `⚲` | pin | `⚑` | flag |
| `⎙` | print | `☾` | moon | `☼` | sun |
| `↺` | revisions | | | | |

`POST_KIND_ICONS` maps a post kind to its mark on a `PostCard` (K-01 / K-02): `note` note, `link` external, `file` documents, `decision` approvals, `procedure` manual, `brief` intake, `announcement` alerts. An unknown kind falls back to `note`.

Per-route overrides (`ROUTE_ICONS`) cover every nav route of every surface; the interesting ones are the four portal homes, which would otherwise all read as one gauge: `A-01` dashboard, `O-01` execution, `S-01` design, `G-01` brand, `C-01` home.

## The set

78 names, grouped by what they mark:

- **surfaces and sections**: dashboard, approvals, projects, work, spaces, graph, catalog, import, documents, plans, design, references, palette, brand, competitions, presentations, images, revisions, assets, communication, messages, alerts, reports, quality, settings, manual, developer, docs, archive
- **business**: sales, leads, intake, schedule, calendar, suppliers, quotes, deliveries, payments, execution, purchases, site, money, clients, team
- **builder and dev tools**: tools, plan, canvas, simulator, actions, tokens, testing
- **interface**: folder, search, filter, close, chevron-right, chevron-left, chevron-down, external, download, copy, plus, minus, check, warning, info, user, home, back, note, dot, more, menu
- **added in ar-21**: chevron-left, moon, sun, pin, print, flag, menu (the theme toggle, pinned posts, the print button, the bug flag, the menu button and the back chevron had no drawn name)

## Where they are used

| place | file | how |
| --- | --- | --- |
| DesktopShell sidebar, bottom nav, More drawer | `app/shells.tsx` (`NavIcon`) | `size="md"`, `aria-hidden`, label unchanged; the 1.5rem glyph slot is unchanged, so the 16rem sidebar does not move |
| PhoneShell bottom nav | `app/shells.tsx` | same, one icon above each label |
| SpaceTree rows and chevron | `components/organism/SpaceTree/SpaceTree.tsx` | kind icon at `md`, chevron `chevron-right` / `chevron-down` at `sm` inside the existing 44 px button |
| SurfaceCard | `components/molecule/SurfaceCard/SurfaceCard.tsx` | `sm` next to the code, `xl` (x1.6) inside the "No preview yet" tile in place of the monogram |
| Hub cards (HUB-01) | `modules/hub/HubPage.tsx` | `icon={resolveIcon(code)}` for portals, product surfaces, dev tools and prototype pages |
| Every `Button` (ar-21) | `components/atom/Button/Button.tsx` | a string `icon` / `iconEnd` resolves as an icon name first, then through `GLYPH_ICONS`, then renders as text: one change drew the close, chevron, zoom, copy and download marks on every page, with no module edited |
| K-01 space heading and child rows | `modules/spaces/SpacesPage.tsx` (`SpaceGlyph`) | `SPACE_KIND_ICONS[kind]`, then the seeded glyph through `resolveIcon`, then the glyph text |
| PostCard kind mark and pin | `components/molecule/PostCard/PostCard.tsx` | `POST_KIND_ICONS[kind]` at `sm` beside the kind badge; the pin is the `pin` icon |
| Theme toggle and the menu button | `app/shells.tsx` | `moon` / `sun` when compact; the menu button is `menu` |

## Adding one

0. Ask first whether the mark is a *thing* the OS has (then it is a name) or a Unicode glyph a module already prints (then a `GLYPH_ICONS` row draws it everywhere without touching the module).
1. Add the name to `ICON_NAMES` (alphabetical inside its group is not required; keep the row grouping readable).
2. Draw it in `PATHS` on the 24 grid: no `fill` except `<Dot />`, no `stroke-width` of its own, no hard-coded colour.
3. Point at it: a page code in `ROUTE_ICONS`, a glyph in `GLYPH_ICONS`, or a space kind in `SPACE_KIND_ICONS`. Never change a module's `nav.glyph`.
4. `npm run tokens` is only needed when a *size* changes; otherwise `npm run typecheck && npm run build`, then look at the sheet on `/#/dev/components`.
5. Keep the icon decorative where a label exists; give it `label` only when it stands alone.
