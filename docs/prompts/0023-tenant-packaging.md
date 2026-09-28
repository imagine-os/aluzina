# 0023 - Package the aluzina repo as one tenant of a multitenant system

- source: Slack #merge-repos
- date: 2026-09-28
- requester: Justin Massion
- context: the repo at `7628f96` (version 0.15.0, changelog 0024, prompt 0022, D-087). Justin is assembling a multitenant system that will hold several client repos (this one, between-gigs, others) and tooling that brings each deliverable and sub-project to life. Outcome of pass 1: `docs/tenant/` (seven files), step 15 in `build-plan.md`, tasks tp-01..tp-13 in `plan/plan.json` and `kanban.md`, decisions D-088..D-096, changelog 0025. Docs only; no app code changed in this pass.

## Prompt (verbatim)

```
please prepare and package up and organize the aluzina repo to the best of your ability so it can be merged as one tenant with its various sub projects into a multitenant system. that system will have all kinds of tools for bringing all the individual delvierables and sub projects to life. SO i need you to get things super organized. do as many passes as needed to get it great
```

## Response

Pass 1 is on main as 9fac18d, build green, docs only. Start at docs/tenant/README.md.

The plan makes aluzina a self-describing tenant package:
- One root manifest tells the host who the tenant is, which modules and sub-projects it has, and what each needs from the host to come alive.
- Tenant-owned code will move into its own folder inside the hub; platform code stays put until the host exists.
- Storage keys and channels will derive from the tenant id with unchanged values, so tenants stop colliding.
- Every data row will carry a tenant id and version, and a CI gate plus manifest validator will land.
- The 13 tasks are in the build plan as step 15 and show up in the in-app plan viewer.

I'm continuing into pass 2 now. Defaults unless you object: binaries stay in git (no LFS or history rewrite) and the default language stays English.

Should the host route tenants by path or subdomain? I'll default to path.
Can you grant this channel the between-gigs repo, or name its owner, so I can slot it in as tenant two?

Model: Fable 5.1.

_Pass 2 (tp-02 + tp-04) followed in changelog 0026._
