# Consuming a client hub map (any host)

A client OS (HOY first) publishes `hub-map.json` (schema `hoy.hub-map/1`) so that every host that carries the client can see into its hub its own way: ALUZINA (the studio that built it), Between Gigs (Justin's own multi-company OS, a Next.js app on Cloudflare Workers at between-gigs.com that holds HOY as the company `hoy-human-club`) and the client's own hub. Every one of them is a **host** of the map; none is packaged into another (D-116). This is the checklist for a host; ALUZINA's implementation is `apps/hub/src/modules/clienthub/` (W-05, D-108..D-112).

## 1. Fetch

- URL: `<client baseUrl>hub-map.json` (HOY: `https://imagine-os.github.io/hoy/hub-map.json`).
- Use the default HTTP cache; keep the parsed map in memory about 10 minutes and revalidate in the background.
- Check `schema === 'hoy.hub-map/1'` and that `roles`, `experiences`, `pages`, `tools` are arrays and `lenses` exists. Another schema id is a breaking change: keep your last good copy.
- Bundle a snapshot (one JSON file, the generated map copied whole) and render it first; say in the UI which one is shown ("Live map · date" / "Bundled snapshot · date").

## 2. Group by your lens hint

`map.lenses[<your host id>]` gives `title`, `framing` (show it: it is the client's sentence for your point of view), `groupBy` (`role` | `experience` | `surface`), `showTools` and `entry`. Hints, not rules:

| Host | groupBy | ALUZINA's reading |
| --- | --- | --- |
| `aluzina` | role | one mat per role, outside-in, the role's figure seated; sub-mats = the role's experiences; every page an object |
| `between-gigs` | experience | one gig: mats by what it ships (website, apps, back office, build, tools), the role owning most of each; condensed. Its own reading is a page in the Between Gigs repo (see "Between Gigs, the real host" below), not ALUZINA's W-05 tab |
| `standalone` | surface | the client's own hub: the hub first, one screen per experience by band, then the tools |

Every page has exactly one `experienceId`; every experience one `roleId` (a role may own none: skip it).

## 3. Faces from shots

URLs in `shots` are relative to `product.baseUrl`. Pick by device: phone / tablet -> `thumbs['<lang>-phone']`; desktop -> `thumbs['<lang>-desktop']`, else `full['<lang>-1280']`; website page -> `full['<lang>-390-full']` (tall, show from the top), else `full['<lang>-390']`. Prefer the `-dark` thumb in a dark UI, fall back to the other language. Load lazily and keep a drawn fallback: a key is present only when the file is published, but a tester can be offline.

## 4. Embed as a role

Substitute `embed.pattern` = `{baseUrl}#{route}?as={role}&lang={lang}&theme={theme}&dev=0&live=0` (`route` as in the map; for a page use `sampleRoute ?? route`, since a `:id` segment is a template and `sampleRoute` (additive since HOY 0.11.2) already opens a real record; `role` an id of `roles[]`; `lang` es | en; `theme` light | dark) and load it in an iframe at the device's real size (phone 390 x 844, tablet 768 x 1024, desktop 1280 x 800, website 390 wide scrolling), scaled to fit. The page runs as that role's demo user without touching the viewer's own session. Create the iframe only on demand and remove it when closed.

## 5. Between Gigs, the real host

Surveyed 2026-09-29 (`imagine-os/between-gigs` @ `b191350`, see `between-gigs.md`). Between Gigs is a Next.js 16 app router build (vinext, Cloudflare Workers, pnpm, Tailwind 4 + shadcn) at https://between-gigs.com with D1 and Supabase auth. HOY is a company row there (`hoy-human-club`, group Clients, under `sergio-campus`). How each rule above lands in it:

| Rule | In Between Gigs |
| --- | --- |
| Page | `/builder/companies/hoy-human-club/hub`, a server page gated by `isPortfolioOwner` (the whole `/builder/*` tree needs a Supabase session), rendering a client component; added in release 3.71 (GitHub `main`; the Sites deploy is pending). Private by design, unlike ALUZINA's public hub. |
| Fetch | Client-side `fetch` of `https://imagine-os.github.io/hoy/hub-map.json`: GitHub Pages sends `access-control-allow-origin: *`, so no proxy or server route is needed. Same schema check and in-memory cache as section 1. |
| Snapshot | A bundled copy imported as JSON (`lib/hoy/hub-map.snapshot.json`, the way `lib/campus/files.json` is), rendered first and whenever the live map fails; the page says which one it shows. |
| Lens | `lenses['between-gigs']`, `groupBy: 'experience'`, condensed, as the table in section 2. |
| Theme | Dark by default (`html[data-theme]`, `localStorage bg-theme`): ask for the `-dark` thumbs (`en-phone-dark`, `es-desktop-dark`, ...) and fall back to the light ones and the other language. Company accent is HOY's terracotta (`data-company-profile="hoy-human-club"`). |
| Language | Between Gigs has **no i18n** (English only). The `lang` of the embed and of the faces is a **page-local control** (es / en), not a site setting. |
| Embed | An `iframe` with `sandbox="allow-scripts allow-same-origin"` and `loading="lazy"` (the attributes its live page previews already use), src from `embed.pattern` with `route = page.sampleRoute ?? page.route`, `as` a role of `roles[]`, `lang` from the page control, `theme=dark`, `dev=0`, `live=0`; created on demand, removed on close. |
| Actions | It has no per-page actions registry; its closest surface is the MCP tool catalogue (`lib/tool-system/catalog.ts`). Declaring `clienthub.*`-style actions there is a later choice of that repo, not a requirement of this checklist for that host. |
| Records | Its own process, same turn: a new top entry in `lib/releases.ts` and `docs/development-memory.json`, a `lib/version-catalog.ts` page entry, an `ACTIVE_WORK.md` row. Nothing is written in aluzina's numbered docs for it. |

## 6. Checklist

- [ ] fetch + schema check + memory cache + bundled snapshot, state shown
- [ ] lens hint title and framing shown
- [ ] grouping by the hint (or your documented reading of it)
- [ ] roles with no experience skipped
- [ ] every page reachable (caps with a "+N" list when condensing)
- [ ] faces lazy with a drawn fallback, faces' language and theme (a dark host asks for `-dark`; a host without i18n keeps `lang` page-local)
- [ ] Open live via the embed pattern, iframe on demand, device-sized
- [ ] "open in the client" link: `baseUrl + '#' + route` in a new tab
- [ ] your own actions declared for every control (voice / WebMCP)
- [ ] the snapshot swap documented (one file)
