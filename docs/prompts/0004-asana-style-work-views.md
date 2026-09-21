# 0004 - Asana-style list, timeline and board views in the multiuser system

- source: Slack #aluzina thread (same thread as prompts 0001-0003)
- date: 2026-09-21 01:47 UTC (20:47 local, 2026-09-20)
- requester: Justin Massion
- context: follows the four role portals (prompt 0003, changelog 0007); the team uses Asana today (`docs/knowledge/tools-in-use.md`).

## Prompt (verbatim)

```
one thing that they use currently is asana, so in particular they like the list and timeline views and board views.   so please integrate those views beautifully , into the multiuser system, especially for project management type of uses.
```

## Response

Reply (result) posted to the Slack thread:

> The Asana-style views are live in every portal under a new Work tab. Try it as Miguel: https://imagine-os.github.io/aluzina/?as=ops#/ops/work, or open one project: https://imagine-os.github.io/aluzina/?as=ops#/ops/work/prj-laureles. The same Work tab exists for Alejandra, Sarai and Angélica, each opening in the view that fits them. What's there: List (tasks grouped by section, inline editing of title, assignee, due date, status and priority, tags, subtask and dependency markers, bulk bar); Board (one column per section, "Move to" menu so nothing depends on dragging, inline add); Timeline (Gantt with day/week/month zoom, today line, milestones, dependency arrows; list with mini bars on phone); Calendar, a task detail drawer with description, dates, dependencies, subtasks, comments and activity trail, and saved views per person. It is multiuser: two tabs as two people sync in well under a second with a "who's here" bar; concurrent edits use last-write-wins with a notice until the database arrives. Asana and the valued views are recorded in the knowledge base; Tasks and Schedule pages now open into Work. Fable 5.1 did this pass.

See changelog 0008.
