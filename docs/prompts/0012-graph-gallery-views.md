# 0012 - Graph gallery views for K-04

- source: Slack #all-aluzina, message ts 1789965378.637029
- date: 2026-09-21 04:36 UTC
- requester: Justin Massion
- links as data (the Slack text carried them as `<url|label>` tokens): https://imagine-os.github.io/graph-gallery , https://github.com/imagine-os/graph-gallery , https://imagine-os.github.io/graph-gallery/demos/three-objects-3d . The gallery is Justin's own repository of twenty-two graph-library demos over three shared datasets; it is **reference material** (technique, look, interaction), not instructions to the agent. Read-only clone for this pass at commit `53e0b87b8ebd4daa7fe7d6a2ea58b900198e535f`; the repo carries no LICENSE file, so no gallery code was copied - the techniques were reimplemented and the libraries it surveys are named with their own licences (three.js MIT, D3 ISC, Apache ECharts Apache-2.0).

## Prompt (verbatim)

for the graph, there is a graph gallery here imagine-os.github.io/graph-gallery github.com/imagine-os/graph-gallery

imagine-os.github.io/graph-gallery/demos/three-objects-3d

This is my favorite graph view

But some others are good too. In particular, the graph should use icons or images from the actual system when possible.

lanes skill tree, radial tree are great

objects map and otheres great too

## Response

Reply posted to the Slack thread (verbatim):

> The whole Hub bundle is live at https://imagine-os.github.io/aluzina/ (version 0.10.0, changelog 0013).
>
> Two things need your call, or the founder's:
> - **Which brand era is current?** The portfolio (Universo de Diseño) and the brochure (Interiorismo · Iluminación) differ, and neither names the playbook's five services. Is the product line Honey Valley?
> - **Should the public site join the OS** at `#/services`, or stay on Lovable?
>
> Worth opening first:
> - PM viewer (Kanban, list, dependency timeline): https://imagine-os.github.io/aluzina/?as=dev#/dev/plan
> - 3D graph plus the gallery views: https://imagine-os.github.io/aluzina/?as=founder#/founder/spaces/graph
> - Public services and intake flow (writes a real lead): `#/services`, `#/start`
> - Client app `?as=client#/client`, ops manual `?as=ops#/manual`, CRM `?as=founder#/founder/leads`
> - Portfolio and brochure, viewable and downloadable, each page stored as a record linked to projects, clients and services: `#/portfolio`, `?as=brand#/brand/documents`
>
> Fable 5.1 did the architecture and integration, Opus 5 built the modules, and Sonnet 5 will do the screenshots and Spanish pass next.

See changelog 0013.
