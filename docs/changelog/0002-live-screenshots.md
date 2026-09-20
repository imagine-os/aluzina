version: 0.1.0
date: 2026-09-20
prompt: 0001
intent: Confirm the first GitHub Pages deploy of the hub and record live screenshots of HUB-01 at phone, desktop and 4K widths in EN and ES.
decision: D-002
rejected: screenshotting the local preview instead of the live site (the point is to verify the deployed artifact and the Pages URL)
files: package.json (playwright pinned 1.56.1 to match the preinstalled Chromium 1194), package-lock.json, scripts/screenshots.mjs (proxy + PW_EXECUTABLE), docs/reference/surfaces.md, docs/screenshots/HUB-01/{en-390,en-1280,en-3840,es-390}.jpg, docs/screenshots/HUB-01/routes.json, docs/changelog/0002-live-screenshots.md, docs/prompts/0001-load-claude-design-export.md (Reply 2), docs/kanban.md, apps/hub/src/modules/hub/specs.ts (checkedAt)
codes: HUB-01
model: Fable 5.1

# 0002 - First deploy verified, live screenshots

## What changed

- Pages deploy: workflow run [35542778592](https://github.com/imagine-os/aluzina/actions/runs/35542778592) on commit 168a79b, `build` and `deploy` both **success** (configure-pages with `enablement: true` succeeded; Pages source was already GitHub Actions).
- Live URL: https://imagine-os.github.io/aluzina/ -> HTTP 200 with the hub HTML (`<title>Aluzina Business OS</title>`)
- Playwright captures of the live hub (light theme, dev mode off): `docs/screenshots/HUB-01/en-390.jpg` (390x900), `en-1280.jpg` (1280x900), `en-3840.jpg` (3840x2160), `es-390.jpg` (390x900), plus `routes.json` with the `window.__aluzina` manifest at capture time.
- `spec.checkedAt` for HUB-01 set to `[390, 1280, 3840]`.
- Kanban: step 0 "watch the first deploy" moved to Done.
- Prompt 0001 gains Reply 2 (the scaffold result posted back to the thread).

## Notes

Chromium from `/opt/pw-browsers` via `npm run screenshots -- --base=https://imagine-os.github.io/aluzina/`. The script routes Chromium through `HTTPS_PROXY` when set and prefers the preinstalled `/opt/pw-browsers/chromium` (override with `PW_EXECUTABLE`); `playwright` is pinned to 1.56.1 because the container's Chromium build is 1194. In the build container the proxy CA had to be added to Chromium's NSS store (`certutil -d sql:$HOME/.pki/nssdb -A -t C,,`) for the browser to reach the live site with TLS verification on.
