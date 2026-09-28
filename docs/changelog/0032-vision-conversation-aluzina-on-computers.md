version: 0.19.0 (unchanged: docs-only, no code, no app behaviour change; `SEED_VERSION` stays 13)
date: 2026-09-28
prompt: 0025
intent: Log a product-vision conversation turn from Slack #all-aluzina in which Justin, not yet ready to transfer the repo into the multitenant host, described what Aluzina does on computers (phases, customizable templates and procedures at every stage, effective human communication, routing to new and existing people, money, "all light") and the reply mapped those five things onto the Hub (phases strong, communication middle, routing and money thin) and asked three open questions.
decision: none — the conversation took no decision; the transfer / tenant hand-off is explicitly deferred by Justin, and the three questions (routing hard case, money focus, single event log as design principle) are open with him
rejected: creating a decisions row or a plan / kanban card for a single event log, routing rules or a payment record (nothing was agreed; they wait for Justin's answers); bumping the app version (no code changed)
files: docs/prompts/0025-what-aluzina-does-on-computers.md (new), docs/changelog/0032-vision-conversation-aluzina-on-computers.md (new), tenant.json (docs.counters prompts 25 / changelog 32), docs/README.md (latest counters line), docs/tenant/README.md (change log line)
codes: none (no page or UI change)
model: Fable 5.1 (conversation and reply); Sonnet 5 (logging)

# 0032 - Vision conversation: what Aluzina does on computers (docs only)

## What was logged

Prompt 0025 (`docs/prompts/0025-what-aluzina-does-on-computers.md`): Justin's channel-level mention in #all-aluzina on 2026-09-28 (thread started 23:20 UTC), verbatim, with the reply recorded under `## Response`. He said he is not ready to transfer yet and asked to talk about what Aluzina does on computers: a process in phases with customizable templates and procedures at every stage, effective human communication, routing to new and existing people, money, and "it is all light".

## What the reply said (summary)

- Phases: strong today (one client journey, 15 statuses, per-service stages, playbook templates).
- Helping humans communicate: middle. Roles, presence, annotations and EN / ES exist; the message text per stage (client update after concept, "your quote is ready", site report) is mostly unwritten.
- Routing and money: thin. Routing is one field (the assigned Aluzina owner on the lead); nothing decides who hears what when a status flips. Money is a status list with no payment record, payment link or margin view, on mock data.
- "All light" read as a design principle: a message, a payment and a status change are one event moving through phases, arguing for a single event log under everything (which the requested multiplayer design needs anyway).

## Open questions to Justin

1. Routing: is the harder case the client who has never heard of Aluzina or the contractor already on three projects?
2. Money: client-side (deposits, milestones, change orders), supplier-side (purchasing, margins), or one number flowing through both without being retyped?
3. Is "all light" the single-event-log design principle?

## Not changed

No code, seed, route, action, decision, plan task or kanban card. No decisions file (no decision was made). The app version stays 0.19.0. Only the counters (`tenant.json` `docs.counters`, `docs/README.md`) and the `docs/tenant/README.md` change log moved, so `npm run tenant:validate` keeps agreeing with the highest numbered files.
