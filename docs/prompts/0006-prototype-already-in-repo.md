# 0006 - Prototype already in the repo: nothing to install

- source: Slack #content-production, thread https://aluzinaworkspace.slack.com/archives/C0C2X1FV5GB/p1789963191986619
- date: 2026-09-21 03:59 UTC (22:59 local, 2026-09-20)
- requester: Justin Massion
- context: refers to Justin's earlier channel message (2026-09-20 22:09 UTC) posting `ALUZINA Business OS prototype.zip` from Claude Design and asking to load it into GitHub. That export had already been ingested as `apps/business-os/` (prompt 0001, changelog 0003, D-007..D-010), so the install instructions were moot.
- work: read-only survey of the repo (Fable 5.1); no code changes, no changelog. Kanban gained one "Awaiting Justin" card.

## Prompt (verbatim)

```
I already added this to the repo. You dont need to worry about the above insturctions of installing it.
```

## Survey notes

Key findings from the read-only pass (full notes stayed in the agent scratchpad; the durable facts are already in `docs/reference/business-os-export.md`, `build-plan.md` and `kanban.md`):

- `apps/business-os/` is the Claude Design export committed unzipped: seven `.dc.html` pages whose React is compiled by Babel in the browser via `support.js`; no package.json, no build. The root build copies it verbatim into `dist/business-os/` (96 files) and Pages serves it at https://imagine-os.github.io/aluzina/business-os/.
- The hub (`apps/hub/`, Vite 5 + React 18 + TS) already carries the role switcher, dev mode, actions registry (47 page specs published as `window.__aluzina`), EN/ES strings layer, tokens and component library. `npm run build` green in about 9 s (tokens, `tsc --noEmit`, `vite build`, `copy-static`).
- `apps/business-os/assets/` is 136 MB of the 155 MB repo (31 `world/*.png` at ~2.5 MB each = 93 MB, six mp4 = 43 MB) and ships to Pages on every deploy; the webp / downscale pass is already a Backlog card.
- Build plan step 2 (audit the export against P-01..P-15, `docs/reference/business-os-audit.md`) is still marked "next" while steps 9-12 were built past it.
- Drift noted, not fixed: root `README.md` status line still says 0.2.0 / changelog 0003 (package.json is 0.7.0, changelog 0010); `package-lock.json` still records 0.6.1 for root and `@aluzina/hub`; the hub ships one 856 kB JS chunk.

## Response

Reply posted to the Slack thread (verbatim, 2026-09-21 04:05 UTC):

> The prototype is in the repo and the hub builds green, so there's nothing to install. Fable 5.1 did this pass.
>
> The Claude Design export sits unzipped at `apps/business-os/` as static pages that compile their React in the browser. The hub serves it and already has the role switcher, dev mode, actions registry and EN/ES.
>
> Two things stood out. Prototype images and videos make up 136 of the repo's 155 MB and ship to Pages on every deploy. And the build plan's audit of the export, the step that decides how it gets ported into hub modules, is still open even though later steps were built past it.
>
> 1. Run that audit: a screen-by-screen inventory of the prototype against the hub modules with a port order, landed as the plan doc plus kanban move.
> 2. Convert the assets to webp and downscaled variants so deploys stop shipping 136 MB. Sonnet 5 would do this mechanical pass.
>
> Start with 1, or would you rather 2?

Status: awaiting Justin's pick between 1 (step 2 audit, Fable 5.1) and 2 (media budget pass, Sonnet 5). No changelog entry: nothing in the product changed.
