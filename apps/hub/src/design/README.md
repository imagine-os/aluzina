# apps/hub/src/design

The platform half of the design system: `tokens.ts` (the token *schema* — types, `--scale` bands,
`target`, focus ring, icon sizes, `composeTokens()`), `clipboard.ts`, `env.ts`. The tenant's *values*
(colours, metal ramps, fonts) live in `../tenant/brand/tokens.values.ts`, not here (tp-06, D-096).
`apps/hub/scripts/gen-tokens.mjs` composes the two into the committed `src/styles/tokens.css`
(`npm run tokens`); never hand-edit that file.

## Tenant package

This folder anchors the `design-system` sub-project in `tenant.json` `subProjects[]`
(kind `platform-candidate`, status `done`; paths also cover `src/components`, `src/styles`,
`scripts/gen-tokens.mjs`, `docs/design`; codes D-02, D-10, D-12, D-13, D-14). Brief and change log:
`docs/design/brand-system.md`. Full manifest entry: `docs/tenant/sub-projects.md`.
