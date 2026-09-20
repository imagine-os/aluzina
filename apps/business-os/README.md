# apps/business-os

The **ALUZINA Business OS prototype** (Claude Design export) lands here. Nothing else lives in this folder until then; do not create a package here by hand.

When the export arrives (decision D-003, build plan step 1):

1. Unzip the source (no `node_modules`, `dist` or `.next`) into this folder.
2. Give it a `package.json` named `@aluzina/business-os` whose `build` script emits into `../../dist/business-os/` with a relative `base` (`./`), so the hub at the Pages root can link to `/business-os/`.
3. Append its build to the root `package.json` `build` script (see the `//` note there) and add the surface to the hub's card grid (flip the card from `Placeholder` to a live link) and to `docs/reference/surfaces.md`.
4. Audit it against `docs/platform-principles.md` (build plan step 2) before splitting it into modules.

Transfer of the 288 MB zip is pending (D-006).
