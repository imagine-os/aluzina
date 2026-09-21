# Instagram capture: @aluzina.espacios

- Target: https://www.instagram.com/aluzina.espacios/
- Capture window (UTC): 2026-09-21T04:00:45Z to 2026-09-21T04:14:00Z
- Method: public, unauthenticated access only. No login, no credentials, no auth-wall bypass, TLS verification kept on throughout (the proxy CA was added to Chromium's NSS store, which is the sanctioned fix).
- Worker model: Claude Fable 5.1.

## Result in one line

**0 posts captured of an unknown post_count; 0 media files; no profile fields obtained.** Nothing in `profile.json` / `posts.json` is invented: every field that was not observed is `null` or empty.

## Completeness

| Artifact | Status |
| --- | --- |
| `profile.json` | Written. All profile fields `null`; contains the evidence about the username and the unverified snippet data for the likely real handle `@aluzinaa`. |
| `posts.json` | `[]` (no posts observed). |
| `media/` | Empty. |
| `profile_pic.jpg` | Not downloaded (no URL was ever observed). |
| `profile.png` | Full-page screenshot taken by headless Chromium of what Instagram actually served: the HTTP 429 login redirect (`/accounts/login/?next=...&is_from_rle`), a blank page. It is **not** the profile grid. |
| `highlights.json`, `reels.json` | Written as "not reachable" notes. |
| `bio_link_site.json` | Route 5 substitute: the company website https://aluzinaa.com/ (from the repo README and search results, since no bio link could be read) rendered in Chromium; full text plus 39 links. Screenshot at `raw/site_aluzinaa_com.png`. |
| `raw/` | Every HTTP response body and header set used for the statements below, plus the Playwright scripts. `raw/node_modules/playwright` is a symlink to the preinstalled global Playwright. |

## Routes tried, in order, with exact outcomes

| # | Route | Outcome |
| --- | --- | --- |
| 1 | `GET https://www.instagram.com/api/v1/users/web_profile_info/?username=aluzina.espacios` with `x-ig-app-id: 936619743392459` (browser UA, Referer) | **HTTP 400** `{"message":"Asset asset://laser.provider/ig_business_category_subvertical has been deleted. You cannot use this schema","status":"fail"}` (`raw/route1_web_profile_info.json`). Same call via `i.instagram.com`: **HTTP 401** `{"message":"Please wait a few minutes before you try again.","require_login":true,...}` (`raw/route1b_web_profile_info.json`). Not retried further. |
| 2 | `GET https://www.instagram.com/aluzina.espacios/` (HTML) | **HTTP 200**, 626 KB, but a JS shell with no profile data: no `og:` meta tags, no `edge_owner_to_timeline_media`, no biography/follower fields. The server-side route config embedded in the shell is `"polarisRouteConfig":{"pageID":"httpErrorPage"}` with root `PolarisErrorRoot`, `page_type: "PROFILE"`, `show_lox_redesigned_404_page: true` (`raw/route2_profile.html`). `?__a=1&__d=dis`: **HTTP 201, empty body** (`raw/route2b_a1.json`). `/aluzina.espacios/embed/`: **HTTP 200**, same error shell (`raw/route3b_profile_embed.html`). |
| 3 | Playwright + preinstalled Chromium (`/opt/pw-browsers/chromium-1194`, Playwright 1.56.1) | First runs failed with `net::ERR_CERT_AUTHORITY_INVALID` because the proxy CA was not in Chromium's NSS store; fixed by `certutil -A` of `/root/.ccr/agent-proxy-ca.crt` into `/root/.pki/nssdb` (verification stayed on). With TLS working, Instagram answered the browser navigation with **HTTP 429** and redirected to `https://www.instagram.com/accounts/login/?next=%2Faluzina.espacios%2F&is_from_rle` (rate-limit login wall). Grid links found: 0. Per the rules this was not hammered; after a pause of several minutes all further instagram.com requests (curl controls for `/aluzinaa/` and `/instagram/`, and Anthropic's WebFetch fetcher for both `/aluzina.espacios/` and `/aluzinaa/`) also returned **HTTP 429**. A final control pair after a further 4-minute pause (04:13:46Z) still returned **429** + login redirect for both `/aluzinaa/` and `/aluzina.espacios/` (`raw/control2_result.txt`), so the shell comparison that would settle whether the username exists could not be completed in this session. Total instagram.com requests this session: 13 (1 API + 1 API retry, 1 HTML, 1 `?__a=1`, 1 embed, 3 headless-browser navigations, 4 curl controls, 2 WebFetch), all spaced out and none repeated after a 429 beyond the two delayed controls. |
| 4 | Public mirror viewers | imginn.com **403** (Cloudflare "Just a moment..." challenge); picuki.com **403** (Cloudflare); pixwox.com -> pixnoy.com **403** (Cloudflare); picnob.com **403** (Cloudflare); imgsed.com **403** (Cloudflare); snapinsta.to **403** (Cloudflare); anonyig.com **451** -> `/blocked`; instasupersave.com and storiesig.info **200 -> `/blocked`** page; inflact.com **404**; gramhir.pro **404** (site repurposed); iganony.io and instanavigation.com **CONNECT 502 from the egress proxy** (`connect_rejected`, "policy denial or upstream failure", logged in the proxy status); dumpor.io / greatfon.com / smihub.com **200** but the page is a Phoenix LiveView shell that loads all content over a WebSocket, and the `wss://dumpor.io/live/websocket` handshake failed through the proxy with **429, 429, 429, 400** (WebSocket upgrades are unsupported through this proxy per `/root/.ccr/README.md`), so it only ever showed "@aluzina.espacios Verifying..." (`raw/pw_dumpor.png`, `raw/pw_dumpor_net.txt`); insta-stories-viewer.com **200** but rendered "0 Posts 0 Followers 0 Following" and its generic error strings including "An account with this login does not exist" (`raw/route4_mirror_10.html`). **No mirror yielded any post or profile data.** |
| 5 | Link in bio | The bio could not be read, so there was no bio link to follow. As the nearest public substitute, the company website named in the repo README (`/workspace/aluzina/README.md`) and in search results, https://aluzinaa.com/, was rendered and saved to `bio_link_site.json`. |
| extra | Search engines for `"aluzina.espacios"` | WebSearch (two queries): no `instagram.com/aluzina.espacios` result. Bing `"aluzina.espacios" site:instagram.com` (curl, `raw/search_bing.html`): HTTP 200, 7 results, none of them on instagram.com (Bing fell back to unrelated pages), i.e. nothing indexed under that path. DuckDuckGo HTML endpoint: HTTP 202 bot-challenge page, no results (`raw/search_ddg.html`). Every Instagram result WebSearch did return for the company for the company is `https://www.instagram.com/aluzinaa/` ("ALUZINA (@aluzinaa)"; snippet text "21K followers, 2,903 following, 450 posts"; unverified, snippet only). Facebook page https://www.facebook.com/aluzinaa/ is titled "Aluzina Espacios | Medellín" in search results, and a public Facebook post of that page references `instagram.com/aluzinaa`; a direct fetch of the Facebook page redirected to Facebook login (not pursued). |

## Caveat that matters most

**Correction (04:40Z, after the follow-up capture in `aluzinaa/`):** the `httpErrorPage` / `PolarisErrorRoot` shell is what Instagram serves to any unauthenticated datacenter client here. The identical shell came back for the certainly-live profile `/aluzinaa/` (`aluzinaa/raw/control_aluzinaa_shell.html`, HTTP 200, 04:36:09Z), so point 1 below is **withdrawn** as evidence. What remains is circumstantial but consistent: **`aluzina.espacios` is probably not the live handle** and the business account is **`@aluzinaa`**:

1. ~~Instagram's shell for `/aluzina.espacios/` is the error route (`httpErrorPage`, `PolarisErrorRoot`).~~ Withdrawn: the live `/aluzinaa/` profile returned the same shell (see correction above). This marker says nothing about whether the username exists.
2. The company website https://aluzinaa.com/ links only to `instagram.com/aluzinaa` ("Síguenos", "Ver Instagram").
3. WebSearch and Bing return no `instagram.com/aluzina.espacios` page at all (DuckDuckGo could not be queried, bot challenge), and WebSearch returns `instagram.com/aluzinaa` for the company.
4. The one mirror that rendered anything for `aluzina.espacios` showed zero counts and "An account with this login does not exist" (weak on its own).

The account `@aluzinaa` was **not** captured either (429 on every route as well), so the follower/post figures for it above are search-engine snippet text, not observed data.

## Blockers summary

- instagram.com: 400 (API schema error), 401 (`require_login`, "wait a few minutes"), 429 + login redirect (`is_from_rle`) for both headless Chromium and curl, and 429 for Anthropic's WebFetch fetcher. The 429 applied to control usernames too, so it is egress-level rate limiting, not specific to this profile.
- Mirrors: Cloudflare JS challenges (403), blocked pages (451 / `/blocked`), proxy CONNECT 502 for two hosts, WebSocket-only rendering (dumpor family) which this proxy cannot carry.
- Environment: Chromium initially distrusted the proxy CA; fixed properly via NSS (`certutil`, installed with `apt-get install libnss3-tools`).

## Follow-up capture of @aluzinaa

See `aluzinaa/README.md`: three 10-minute probes (302, 302, then 200 at 04:36:09Z), then the one permitted headless-browser attempt at 04:36:32Z, which Instagram answered with 429 + login redirect. Nothing captured for that handle either.

## Suggested next steps (not done, out of scope)

- Confirm with the client which handle is theirs; `@aluzinaa` is the one their website links to.
- Re-run this capture from a residential/other egress or later, once the rate limit lifts; the scripts in `raw/pw_profile.mjs` are reusable (set the username).
- If the client owns the account, the Instagram Graph API with their own token is the reliable path and does not depend on public scraping.
