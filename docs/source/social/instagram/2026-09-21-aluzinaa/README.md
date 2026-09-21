# Instagram capture: @aluzinaa (second target, per coordinator)

- Target: https://www.instagram.com/aluzinaa/ (the handle the company website aluzinaa.com links to)
- Window (UTC): 2026-09-21T04:15:45Z to 2026-09-21T04:37:15Z. Public, unauthenticated only; no login, no wall bypass, TLS verification on.
- Worker model: Claude Fable 5.1.

## Result

**0 posts captured, 0 media, no profile fields.** `profile.json` is null-filled; `posts.json` is `[]`; `media/` is empty. `profile.png` is a full-page screenshot of what the browser showed after the 429 navigation: the blank login-redirect page, **not** the profile grid.

## Probe cadence (curl GET of the profile URL, one per 10 minutes, `raw/probe_log.txt`)

| Probe | Time (UTC) | Result |
| --- | --- | --- |
| 1 | 04:15:45 | 302 -> `/accounts/login/?next=%2Faluzinaa%2F&is_from_rle` (rate-limit login wall) |
| 2 | 04:26:04 | 302 -> same login wall |
| 3 | 04:36:09 | **200**, 626 KB HTML (`raw/control_aluzinaa_shell.html`) |

## The one Playwright attempt (`raw/pw_capture.mjs`, `raw/pw_log.txt`)

Launched at 04:36:32Z, 23 seconds after probe 3 returned 200. Headless Chromium's navigation to `https://www.instagram.com/aluzinaa/` was answered **HTTP 429** with a redirect to `https://www.instagram.com/accounts/login/?next=https%3A%2F%2Fwww.instagram.com%2Faluzinaa%2F&is_from_rle`. The script stopped at once (exit code 2), made no further request, and did not retry, as instructed. The curl probe and the browser navigation evidently hit different rate-limit buckets (the browser sends the full Chrome header set and immediately triggers the app's XHR/GraphQL calls); the 200 seen by curl was therefore not a usable signal that a browser session would be admitted.

## What the 200 shell for @aluzinaa shows (control comparison, important)

The 626 KB HTML that curl received for `/aluzinaa/`, a profile that is certainly live, contains **no** og: tags, biography, counts or post edges, and its embedded route config is `"polarisRouteConfig":{"pageID":"httpErrorPage"}` with root `PolarisErrorRoot`, exactly like the shell captured earlier for `/aluzina.espacios/`. So that marker is what Instagram serves to any unauthenticated datacenter client here and is **not** evidence about whether a username exists. The parent `../README.md` and `../profile.json` were corrected accordingly.

## Files

- `profile.json`, `posts.json` (empty), `media/` (empty), `README.md`
- `raw/probe.sh`, `raw/probe_log.txt`, `raw/probe_last.html` / `raw/control_aluzinaa_shell.html` (the 200 shell), `raw/pw_capture.mjs`, `raw/pw_log.txt`, `raw/pw_statuses.txt`; `raw/node_modules/playwright` is a symlink to the preinstalled global Playwright.

## Not done, by instruction

No second browser attempt, no login, no GraphQL replay with harvested doc_ids, no residential proxy. If the client owns the account, the Instagram Graph API with their own token is the dependable path.
