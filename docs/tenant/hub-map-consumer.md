# Consuming a client hub map (any host)

A client OS (HOY first) publishes `hub-map.json` (schema `hoy.hub-map/1`) so that every host that carries the client can see into its hub its own way: ALUZINA (the studio that built it), Between Gigs (Justin's company OS, where HOY is one gig) and the client's own hub. This is the checklist for a host; ALUZINA's implementation is `apps/hub/src/modules/clienthub/` (W-05, D-108..D-112).

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
| `between-gigs` | experience | one gig: mats by what it ships (website, apps, back office, build, tools), the role owning most of each; condensed |
| `standalone` | surface | the client's own hub: the hub first, one screen per experience by band, then the tools |

Every page has exactly one `experienceId`; every experience one `roleId` (a role may own none: skip it).

## 3. Faces from shots

URLs in `shots` are relative to `product.baseUrl`. Pick by device: phone / tablet -> `thumbs['<lang>-phone']`; desktop -> `thumbs['<lang>-desktop']`, else `full['<lang>-1280']`; website page -> `full['<lang>-390-full']` (tall, show from the top), else `full['<lang>-390']`. Prefer the `-dark` thumb in a dark UI, fall back to the other language. Load lazily and keep a drawn fallback: a key is present only when the file is published, but a tester can be offline.

## 4. Embed as a role

Substitute `embed.pattern` = `{baseUrl}#{route}?as={role}&lang={lang}&theme={theme}&dev=0&live=0` (`route` as in the map, `:id` segments resolve against the client's demo data; `role` an id of `roles[]`; `lang` es | en; `theme` light | dark) and load it in an iframe at the device's real size (phone 390 x 844, tablet 768 x 1024, desktop 1280 x 800, website 390 wide scrolling), scaled to fit. The page runs as that role's demo user without touching the viewer's own session. Create the iframe only on demand and remove it when closed.

## 5. Checklist

- [ ] fetch + schema check + memory cache + bundled snapshot, state shown
- [ ] lens hint title and framing shown
- [ ] grouping by the hint (or your documented reading of it)
- [ ] roles with no experience skipped
- [ ] every page reachable (caps with a "+N" list when condensing)
- [ ] faces lazy with a drawn fallback, faces' language and theme
- [ ] Open live via the embed pattern, iframe on demand, device-sized
- [ ] "open in the client" link: `baseUrl + '#' + route` in a new tab
- [ ] your own actions declared for every control (voice / WebMCP)
- [ ] the snapshot swap documented (one file)
