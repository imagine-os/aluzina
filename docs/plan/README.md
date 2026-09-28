# docs/plan

`plan.json` (D-037): the machine-readable development plan — one row per step and per tenant-packaging
task (`tp-01..tp-13`), each with `status`, `model`, `codes`, `dependsOn` and, once done, `changelog`.
Rendered by the in-app plan viewer (D-05, `#/dev/plan`) as Kanban / list / timeline with dependencies;
`docs/kanban.md` and `docs/build-plan.md` must agree with it (same statuses, same next changelog number).
Never edit `plan.json` by hand without updating the other two the same turn.

## Tenant package

This file is part of the `docs-and-plan` sub-project in `tenant.json` `subProjects[]` (kind `docs`,
status `live`; code D-05). `tenant-validate.mjs` (tp-03) parses this folder's `plan.json`, checks every
`dependsOn` id resolves and that each step has a `docs/build-plan.md` row; keep this file's `version`
field in step with root `package.json` by convention even though the validator does not check it yet.
Full entry: `docs/tenant/sub-projects.md`.
