# Tools the team uses today

What Aluzina runs its work on right now, so the OS matches or beats each tool before it replaces it (P-15: the OS is the operations system that could replace every tool the company pays for). Entry convention: `knowledge/README.md`.

## Asana (project management)

```
status: current
since: 2026-09-21
source: Slack #aluzina, 2026-09-21 01:47 UTC, Justin Massion (prompt 0004)
```

- The team uses **Asana** today for project management.
- They particularly like its **List**, **Timeline** and **Board** views.
- Justin's instruction: integrate those views "beautifully" into the multiuser system, "especially for project management type of uses".
- Consequence for the OS: the Work views (W-01 / W-02, changelog 0008, D-021) must **match or beat** Asana's List, Timeline and Board for the team's daily use: sections, assignee, due dates, dependencies, subtasks, comments, saved views, keyboard, live updates. Calendar is added because the schedule (O-02) already had one.
- Unknown: which Asana plan, whether projects / sections / custom fields exist there that should be imported, and whether Asana stays for anything once the OS covers it (`_unknown_`, ask Justin before an import).

## Other tools

```
status: superseded
since: 2026-09-21
superseded-by: "Tools named by Justin" below (prompt 0005)
```

_unknown_ per category until the founder or Justin names them.

## Tools named by Justin (Slack sidebar, prompt 0005)

```
status: current
since: 2026-09-21
source: Slack #aluzina 2026-09-21 02:51 UTC, Justin Massion (sidebar sections "Art Tools", "Project Management", plus the tools already on record); catalog rows `tools` in apps/hub/src/data/seed/spaces.ts, rendered on K-05 (D-029, D-030)
```

| Tool | Category | Used for | Status | Replaced by |
| --- | --- | --- | --- | --- |
| ChatGPT (OpenAI) | AI text | briefs, research, drafting texts and prompts for image tools (Slack `chatgpt`) | in use | Research assistant in the Hub (planned; replaces the usage, not the model) |
| Lovart | AI image | concept imagery and mood images before renders (Slack `lovart`) | in use | none planned: likely an integration (D-030) |
| Magnific | AI image | upscaling and detail passes on renders (Slack `magnific`) | in use | Render pipeline (planned) where feasible, integration otherwise |
| Asana | project management | list, timeline and board views (see above) | to replace | W-01 Work views; import through K-06 |
| Slack | chat | team chat and, until prompt 0005, the sidebar as the organizing structure | to replace | K-01 Spaces (the sidebar, now) + Comms module (the chat, planned; D-027) |
| Lovable | website builder | the public site aluzinaa.com | in use | P-xx public site module (planned; awaiting Justin's decision) |
| Claude Design | design | the Business OS prototype | replaced | BOS-01 (served at ./business-os/, being modularised) |
| Supabase | infrastructure | DB, auth, realtime, storage behind the DataProvider | planned | – |
| Stripe | finance | payments, payroll | planned | – |

Unknown: plans and costs per tool, who holds each account, what else the team pays for (calls, video, email, SMS, WhatsApp, e-sign, drafting) — `_unknown_` until named.

## Change log

- 2026-09-21: file created with the Asana entry (Slack #aluzina 2026-09-21 01:47 UTC, Justin Massion; prompt 0004, changelog 0008).
- 2026-09-21: ChatGPT, Lovart, Magnific, Slack, Lovable, Claude Design, Supabase, Stripe added with status and replaced-by (Slack sidebar, prompt 0005, changelog 0009, D-029, D-030); the "Other tools" draft is superseded.
