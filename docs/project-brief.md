# Project brief: Aluzina Business OS

## Client

**Aluzina** is an interior design studio in Medellín, Colombia (El Poblado, Envigado, Laureles, Sabaneta, Rionegro, Llanogrande). Its positioning, from the public site (data, fetched 2026-09-20): "Diseñamos espacios que se sienten, no solo se ven. Neurointeriorismo e iluminación emocional en Medellín." Services: interior design for homes, hotels and commercial spaces; emotional lighting design; neurointeriorism consulting; custom decorative luminaires; space direction. Tone: professional and warm, sensory, transformation-focused. Visual cues: near-black neutral base with warm amber accents, Playfair Display headings, Roboto body, nature and product photography.

## What exists

- **Public website** at [aluzinaa.com](https://aluzinaa.com), built by the owner in Lovable (React + Tailwind/shadcn bundle, Spanish only). It stays hers; the hub links to it.
- **ALUZINA Business OS prototype**: a Claude Design export (`ALUZINA Business OS prototype.zip`, 288,159,182 bytes) shared by Justin in Slack #aluzina on 2026-09-20. Not yet in the repo: it exceeds the 50 MB cap on files the agent can pull from Slack (D-006). Transfer path pending.
- **This repo** (`imagine-os/aluzina`): GitHub Pages enabled by Justin; intended as the monorepo for everything Aluzina.

## Requirements stated so far

1. Load the Claude Design export into the repo properly and host it live (GitHub Pages).
2. **English / Spanish toggle is important.** The hub ships with it; the export gets it in the audit step. English is the primary key with Spanish fallback per house rules (D-004), but the business and its customers are Spanish-first, so the default language is an open question for Justin.
3. Use the repo as a monorepo for Aluzina "stuff": hub, prototype, future surfaces, docs.

## Scope (house-rule deliverable batch, P-12)

Hub (HUB-01) with role switcher, dev mode, demo simulator, canvas, plan viewer; public website (linked); customer app; staff / admin dashboard; docs; ops manual; dev tools. The Business OS prototype is the seed for the customer and staff surfaces; what it contains is unknown until the export is opened.

## Data and integrations

None yet. Assume Supabase (DB + Auth) and Stripe later behind provider seams. Playset-LLC/Company-OS is the eventual backend, **reference only**, never copied, never wired until Justin says so (P-15).

## Reference repos

- `imagine-os/petrock` (newest, most complete expression of the rules; P-01..P-15, hub pattern, module contract). Live: https://imagine-os.github.io/petrock/
- `imagine-os/hoy` (HOY OS, Medellín wellness center; Spanish-primary i18n variant, ops manual chapters). Live: https://imagine-os.github.io/hoy/
- `imagine-os/graph-gallery` (static demos; legacy Pages from `main` root). Live: https://imagine-os.github.io/empty7/
- `imagine-os.github.io/claude-tag-portfolio` (portfolio hub linking the above)
- `Playset-LLC/Company-OS` (reference only)

## Org rules that apply

Git only (commit + push to `main`; no PRs, no Slack posts, no Contents-API); build green before push; docs in the same turn; model named in every reply; phone-to-4K quality bar; all input modalities; actions registry on every page; placeholders announce themselves; surfaces recorded every pass. Full text: `platform-principles.md`.
