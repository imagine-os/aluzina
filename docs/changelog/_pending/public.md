# Pending changelog - `public` module (pass 0013)

```
model: Opus 5
module: public
codes: P-01, P-02, P-03, P-04
surface: public (shell `bare`, no permission)
```

## What landed

The public site inside the OS (D-035): the services ladder, one page per service, the intake flow ("purchase flow") and the studio method. All four routes are `status: 'built'`, so the hub card **P-01 Services and intake** goes live automatically. Every string is EN + ES (P-13) - this is the surface Aluzina's Spanish-speaking clients read, so nothing falls back to English.

## Files (all new, all inside `apps/hub/src/modules/public/`)

| File | What |
| --- | --- |
| `index.ts` | 4 routes: `/services` (P-01, nav 0), `/services/:slug` (P-02, no nav), `/start` (P-03, nav 10), `/method` (P-04, nav 20). Surface `public`, shell `bare`, **no `permission`**. |
| `specs.ts` | `servicesSpec`, `serviceDetailSpec`, `startSpec`, `methodSpec`; the shared `public.openWebsite` / `public.openHub` layout actions and the `enum:` vocabularies built from `SERVICES`. |
| `strings.ts` | ~130 `public.*` keys, EN + ES complete. |
| `PublicLayout.tsx` | Header (wordmark, tagline, manifest-driven nav, `GlobalControls`, "Staff: open the Hub") + footer (aluzinaa.com, Instagram / WhatsApp `Placeholder`s). Registers `public.openWebsite` / `public.openHub`. |
| `public.css` | Tokens only; large calm typography, no images. |
| `ServicesPage.tsx` | P-01. |
| `ServiceDetailPage.tsx` | P-02. |
| `StartPage.tsx` | P-03. |
| `MethodPage.tsx` | P-04. |
| `startHref.ts` | `toServiceCode()` / `startPath()` / `startHref()` - `?service=` accepts a code or a slug. |

Docs written in the same turn: `docs/pages/P-01.md` … `P-04.md`.

## Real vs Placeholder

**Real**
- All four pages render from `src/domain/playbook.ts` (`SERVICES`, `CLIENT_JOURNEY`, `SERVICE_LADDER_LOGIC`, `GOVERNANCE_RULES`, `ROLE_RESPONSIBILITIES`, `FINAL_PRINCIPLE`, `QUALIFICATION_QUESTIONS`, `LEAD_CHANNELS`, `routeService()`) through `pick(text, lang)`. No service copy is duplicated in the module.
- P-03 writes a real `leads` row through `useData().create` (`status: 'lead-new'`, `source: 'public-intake'`, `ownerId: null`, `projectId: null`, `suggestedService` from `routeService()`), shows the row id as the visitor's reference, and clears its `sessionStorage` draft. Verified end to end in the browser: a submitted form produced a row with the full ten-key `qualification` map, `desiredStart` parsed from an ISO answer, `channel: 'referral'`, `requestedService: '03'`, `suggestedService: '03'`.
- Per-step validation with inline, announced errors and focus moved to the first invalid control; draft answers survive a reload (`sessionStorage` `aluzina.public.intake`).
- Phase disclosures on P-02 are real `Button`s with `aria-expanded` / `aria-controls`.

**Placeholder (P-09)**
- Footer **Instagram** and **WhatsApp** on every public page: the studio has not given a handle or a number.
- **Reserve with a deposit** on the P-03 confirmation for the paths 01 / 02 / 04 (payments arrive with Stripe, D-035). For 03 / E the page says a proposal follows the consultation instead of showing a payment control.
- The action `public.reserveDeposit` is registered while that button is visible but returns `"not wired yet: online deposits arrive with the payments integration (D-035)"` rather than pretending to charge - so D-09 shows it live and honest instead of `not-live` with a visible button.

**Mock**: `MockProvider` (localStorage) is the data provider; the lead is real in the app, not yet in a database.

## Requests for shared code (integration pass)

1. **`leads` write policy for anonymous visitors.** `useData().create` is unguarded on the MockProvider, which is fine for the demo but is the security hole of this module. The Supabase adapter needs a row-level policy: an anonymous visitor may `insert` one `leads` row with `source = 'public-intake'`, `status = 'lead-new'`, `ownerId = null`, `projectId = null` and nothing else, and may `select` nothing. Rate limiting / spam protection (captcha or a server-side function) is not designed yet. Until then, `/start` should probably not be deployed on a public domain.
2. **A `Stepper` / `FormStep` component in the library (P-07).** P-03 hand-rolls its stepper out of `Button`s and a list because there is no component for it; the client app (C-01) and any wizard in the portals will want the same. Proposed API: `<Stepper steps={[{id,label}]} current={id} onGoTo={(id)=>…} />` with `aria-current="step"`, visited steps focusable, future steps inert, plus a `progressLabel` slot.
3. **`Select` and `Textarea` should mark required fields like `Input` does.** `Input` renders a ` *` after the label when `required`; `Select` and `Textarea` do not, so P-03's required Select ("How far do you want to take it?") and required Textarea ("What do you want to transform?") look optional until you press Next. One-line change in each component, but it is library code.
4. **A `public` shell in `app/shells.tsx`** (optional). `PublicLayout` is the module's own chrome, which the contract allows for `bare`. If a second public-facing module ever appears (a supplier portal, a campaign landing page), promote it: `shell: 'public'` rendering wordmark + manifest nav + `GlobalControls` + footer. Not needed while `public` is the only bare-with-chrome surface besides the hub.
5. **`Placeholder` inside a `Card`'s `actions` slot** works, but a `Placeholder` around a link with an external target still renders as a live-looking control; no change requested, just noted.
6. **Screenshots**: `docs/screenshots/P-01..P-04/` are not populated - the screenshot script runs against `npm run preview`, and module workers must not build. Please capture `en-390`, `en-1280`, `es-390` for P-01 and P-03 in the integration pass (`npm run screenshots -- --code=P-01 --route=/services --shots=en-390,en-1280`; the routes need no `?as=` because they are public).

## Decisions proposed

- **D-0xx (proposed): the public site addresses services by slug, never by code.** `01 / 02 / 03 / E / 04`, pipeline statuses and phase ids are internal vocabulary. The public URL and the `public.openService` action take `creative-digital-consultation`, `in-person-consultation`, `comprehensive-interior-design`, `execution-construction`, `interior-styling`; `?service=` accepts either, so voice / WebMCP can pass a code. Rationale: the codes are the studio's operating shorthand and mean nothing to a client; slugs also survive a renumbering.
- **D-0xx (proposed): an intake answer that is not a fact stays free text.** `leads.budgetCop` is only set when the investment answer carries exactly one amount of at least six digits; a range ("between 120 and 150 million") stays `null` and the sentence lives in `qualification.investment`. Likewise `desiredStart` is only set from an ISO date. Consistent with "unknown facts are `null`, never guessed" in the schema.
- **D-0xx (proposed): a declared action behind a `Placeholder` registers and says so.** `public.reserveDeposit` returns a "not wired yet" string instead of skipping registration, so the actions page shows the same truth the tooltip does. If the integrator prefers `not-live` for placeholder controls, this is a one-line change - but the rule should be written down once for every module.
- **Confirmed, not re-decided**: no response-time promise on the confirmation screen ("the studio will contact you to schedule the diagnosis"), because the playbook does not state one. Prices are not published anywhere.

## Verified widths and checks (P-01, P-02, P-03)

- Playwright against the dev server at **360, 390, 768, 1280, 1920, 2560, 3840** on all four pages: **no horizontal overflow at any width**, EN and ES, light and dark. `spec.checkedAt` records the full matrix on all four specs.
- Targets: every focusable measured at 390 px is >= 44 x 44 px (P-01 20 focusables, P-02 23, P-03 17, P-04 15; none under 44).
- Focus order on every page: skip link -> brand -> nav -> EN/ES -> theme -> dev -> staff hub -> page content in reading order. Nothing hover-only or drag-only.
- No console errors or missing-i18n warnings in either language (the only console noise is the sandbox blocking Google Fonts over TLS).
- `npx tsc --noEmit` clean.

## Known issues / follow-ups

- Service 03 renders 19 stages; the page is long. A grouped view would read better but needs the founder's own grouping, not an invented one.
- No photography anywhere: the pages are typographic. Once the studio supplies images, P-01's hero and the service cards have obvious slots.
- No confirmation email or WhatsApp to the visitor (no messaging provider).
- The intake does not accept photos or a floor plan upload, although services 01 and 02 both start with a digital survey; needs file storage.
- The public pages are reachable from the hub card P-01; there is no link from the portals' sidebars (the `public` surface has no DesktopShell), which is correct but means staff reach them through the hub only.
