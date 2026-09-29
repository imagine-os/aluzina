# 0027 - Desk people: a seated professional at a desk on every mat

- source: Slack #all-aluzina, 2026-09-29 00:38 UTC (thread reply)
- date: 2026-09-29
- requester: Justin Massion
- context: the repo at `3bf33c0` (version 0.20.0, changelog 0033, prompt 0026, D-103), right after the Method desk (W-04) was posted in the thread. Nature: build request on W-04. Built as changelog 0034 (D-104), version 0.20.1.

## Prompt (verbatim)

```
can you please place some nice character models , professional charactres at a desk for each mat
```

## Response

Posted in Slack #all-aluzina 2026-09-29 ~01:07 UTC with three screenshots (docs/screenshots/W-04/en-1280.jpg, en-1280-people.jpg, en-1280-person-drawer.jpg).

Every mat now has its owner seated at a small desk: https://imagine-os.github.io/aluzina/#/founder/desk

Each figure is the role that owns that phase, with a nameplate (role plus the demo person of that role: Alejandra, Sarai, Miguel, Angélica) and two props for the phase, a laptop and phone on Lead, tape measure and clipboard on Diagnosis, sketchbook on Concept, a sample box on Development, a hard hat on Delivery, and so on. Clicking a person opens a drawer with the role's responsibilities, why they sit on that phase, and an Open portal button that is marked not wired yet.

Figures are layered vector art in the brand palette, one consistent look per role, no downloaded 3D models, so the page stays light and dependency-free. If you want real 3D character models later, that's a separate decision (it means adding a 3D runtime and model files to the repo).

One thing for you or Alejandra to confirm: six of the ten phase owners are inferred (Lead, Diagnosis, Analysis, Validation, Closure, Follow-up). The playbook only names owners for Brief, Concept, Development and Delivery. The mapping is data, so changing an owner is a one-line edit.

Logged as prompt 0027, changelog 0034, decision D-104, version 0.20.1.

_Fable 5.1 wrote the brief, Opus 5.5 built it, Sonnet 5 will log the reply._
