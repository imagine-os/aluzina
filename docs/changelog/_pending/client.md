# Draft for changelog 0013: client app (Opus 5)

Merged into `docs/changelog/0013-*.md` by the integrator. Module worker: the `client` module, surface `client`, `PhoneShell`.

- model: Opus 5 (every page, spec, string and doc in this draft)
- prompt: 0009 (the Service Delivery Playbook), pass 0013 module split
- codes: C-01 client home, C-02 project detail, C-03 approvals and revision matrix, C-04 messages, C-05 payments, C-06 strategic brief. `C-01` makes the HUB-01 "client app" card go live; next free client code is now **C-07**.

## Files

New, all inside the module folder and the docs:

- `apps/hub/src/modules/client/index.ts` (6 routes; nav orders 0 / 10 / 20 / 30 / 40 give the five bottom-nav entries, C-02 has no nav)
- `apps/hub/src/modules/client/specs.ts` (`homeSpec`, `projectSpec`, `approvalsSpec`, `messagesSpec`, `paymentsSpec`, `briefSpec`)
- `apps/hub/src/modules/client/strings.ts` (`client.*`, EN + ES complete)
- `apps/hub/src/modules/client/useMyProjects.ts` (the data scope + journey mapping)
- `apps/hub/src/modules/client/ClientHome.tsx`, `ProjectPage.tsx`, `ApprovalsPage.tsx`, `MessagesPage.tsx`, `PaymentsPage.tsx`, `BriefPage.tsx`, `client.css`
- `docs/pages/C-01.md` … `docs/pages/C-06.md`, this draft

Nothing outside the module folder and these docs was touched; no git was run.

## What is real

- **Data scope.** `useMyProjects()` reads `projects` with `where: { clientUserId: session user }` and every other query filters on those project ids. A URL pointing at someone else's project renders an EmptyState (C-02).
- **Progress and phases** come from the playbook: `serviceByCode`, `phaseItems`, `checkKey` over `engagements.checks`. Read only for the client (G-03).
- **Revision matrix (C-03).** Adding a comment creates a `revisionItems` row (`source: 'client'`, `status: 'revision'`, `decidedAt: null`); deciding writes `status` + `decidedAt` with `basedOn` (D-024). G-05 is stated on the page ("All comments are collected here, not in WhatsApp").
- **Approval gate (G-06).** Real logic: `projects.approval = 'client-approved'` only when the project has revision items and none is still in `revision`; otherwise the button is disabled and the card says how many are left. The action refuses with the same rule. Verified in the browser: deciding the three open items enabled the gate and the write landed.
- **Messages (C-04).** Create with `readBy: [me]`, auto mark-read of the shown thread (one update per row, ref-guarded) plus an explicit button; lists re-render from `subscribe`, so a second tab sees a new message without a reload.
- **Payments (C-05).** Read-only list of `direction: 'in'` payments of my projects with totals in COP; supplier payments are never shown to the client.
- **Brief (C-06).** Writes `engagements.brief` keyed `checkKey('01-2', index)`, merging (never dropping) keys the studio wrote. Verified it survives a reload.
- **Actions.** All eleven declared ids are registered while mounted; write actions register only when the permission is held. `window.__aluzina.actions.run('client.openMessages')` navigates (verified).

## What is a Placeholder

- **"Pay online" (C-05)** — the only `Placeholder` in the module (D-035, Stripe later). The declared action `client.payOnline` is still registered and answers "not wired yet: online payment arrives with Stripe (D-035)" rather than `not-live`.

## Requests for shared code (for the integration pass)

1. **`StatTile` bug, affects A-01 too (please fix in the library).** An interactive `StatTile` renders a `<button>`, and `container-type: inline-size` makes a shrink-to-fit button collapse to its padding: the tile is **55 px wide** inside a grid cell at every width. Measured on `/#/founder` as well as here. Fix: `inline-size: 100%` (or `width: -webkit-fill-available` / `justify-self: stretch`) on `.stat`. This module ships a scoped workaround (`.client-grid > li > .stat { inline-size: 100% }`) that should be deleted once the library is fixed.
2. **`Accordion`** (disclosure list) for the phase list of C-02 — today a native `<details>` / `<summary>` styled with tokens.
3. **`Stepper`** for the ten-step client journey of C-01 — today an `<ol>` with a dot rail.
4. **`ProgressBar`** (label + track + accessible value) used on C-01 and C-02 — today a `role="progressbar"` div.
5. **`MessageBubble` / `Thread`** for C-04 — today `li.client-bubble` over tokens.
6. **`documents.clientVisible: boolean`** (or a `deliverables` view) so C-02 does not have to infer "the client may see this" from `status in (final, sent, signed)`.
7. **Permission `own.brief.write`** for the client's own brief; C-06 currently guards the save with `own.projects.read` because writing `engagements.brief` has no client-side permission (`engagements.write` is staff-only, correctly).
8. **Unread count in the shell** — the client app computes "unread messages" on C-01; a badge on the bottom-nav Messages entry needs it at shell level.

## Decisions proposed

- **D-0xx (client data scope).** The client app's scope is `projects.clientUserId`; every client-facing query derives from those ids. No client page ever filters by role or by name.
- **D-0xx (client sees finalised paperwork only).** Until `documents.clientVisible` exists, C-02 shows `documents` with status `final`, `sent` or `signed`; drafts stay with the studio.
- **D-0xx (money direction).** The client app shows only `payments.direction === 'in'`; supplier payments never cross into a client surface.
- **D-0xx (journey mapping).** `CLIENT_JOURNEY` is the client-facing vocabulary and the 15 pipeline statuses map onto it (`contracted` -> Diagnosis, `client-review` and `approved` -> Validation, procurement / in-construction / punch-list / delivered -> Delivery). The map lives in `useMyProjects.ts`; if it belongs in `domain/playbook.ts`, move it in the integration pass.

## Verification

- `cd apps/hub && npx tsc --noEmit` — clean (no `npm run build`: the integrator builds).
- Playwright against `vite --port 5184`, opened as `?as=client`: all six routes render, **no console errors and no missing-i18n warnings**, exactly one `[data-placeholder]` in the module (C-05).
- Flows exercised for real against the MockProvider: add a revision comment (4 -> 5 rows, toast), decide three open items, gate enabled -> `client-approved` written, send a message (10 -> 11 bubbles), save the brief and reload (persisted), `actions.run('client.openMessages')` -> `{ ok: true }`.
- **Widths verified 360 / 390 / 768 / 1280 / 1920** on all six pages, light and dark, EN and ES: no horizontal overflow anywhere, no interactive element under 44 px tall, 3 px focus ring on every focusable, tab order top to bottom, nothing hover-only. Recorded in every `spec.checkedAt`. (2560 / 3840 not captured: the PhoneShell centres a 30 rem column that scales through the `--scale` bands.)
- Dev mode verified: the "Pay online" Placeholder badge shows.

## Known issues / notes for the integrator

- The disabled approval-gate button is out of the tab order while disabled; the reason is in the bold line beside it. If we prefer `aria-disabled` + an explanation on activation, that is a library-level decision for `Button`.
- Screenshots are **not** in the repo yet: `npm run screenshots -- --code=C-01 --route=/client --shots=en-390,en-1280` (and `es-390` for C-01) needs a preview build, which is the integrator's step. Working captures were taken at 390 / 1280 against the dev server.
- `docs/reference/surfaces.md` needs the six new routes and the eleven `client.*` actions (this worker may not edit it).
- `docs/kanban.md` / `docs/plan/plan.json`: the pass-0013 client task can move to done.
- The seeded client `u-client` owns only Casa Laureles, so the multi-project paths (Tabs on C-04, the Selects on C-01 / C-03 / C-06) are coded and type-checked but exercised only with one project.
