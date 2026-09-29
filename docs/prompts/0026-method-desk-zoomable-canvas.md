# 0026 - Method desk: the method as physical objects on a zoomable canvas

- source: Slack #all-aluzina, 2026-09-28 23:29 UTC (thread reply)
- date: 2026-09-28
- requester: Justin Massion
- context: the repo at `1ce3a36` (version 0.19.0, changelog 0032, prompt 0025, D-102), right after the product-vision conversation of prompt 0025 (phases, templates and procedures at every stage). Nature: build request, "a working prototype and give me the link". Built as W-04 Method desk (changelog 0033, D-103), version 0.20.0.

## Prompt (verbatim)

```
Show me a very simple beautiful visual page. Consider every template and item needs to have a preview of what that item is. The UI can be on a zoomable canvas, so we can zoom in and out of things easy, as if they're physical objects. Consider that each phase can have a mat, and each mat can have different mats on top to organize things on a giant physical desk or floor. Assume every document, sheet, folder, box, etc. is small, like printed or physical items that fit the size of chess squares. You have the internet to get images of textures or even shaders and things like that. You have the ability to do xyz and make images thicker with basic geometry as needed. Very clean plain simple but impressive please. Make me a working prototype and give me the link.
```

## Response

Posted in Slack #all-aluzina 2026-09-29 ~00:18 UTC with three screenshots (docs/screenshots/W-04/en-1280.jpg, en-1280-lead.jpg, en-1280-drawer.jpg).

The desk is live: https://imagine-os.github.io/aluzina/#/founder/desk (also under ops, studio, brand and dev, and a "Method desk" card on the hub).

10 mats, one per phase of the client journey, each with sub-mats (Statuses, Templates & procedures, Forms, Rules, Money, Communication) holding 146 objects: folders for the services, checklists for every service phase, forms for the lead record, commercial data and the 10 qualification questions, tokens for the pipeline, purchase and validation statuses, cards for rules, roles and KPIs, kit boxes for the deliveries. Every face is drawn from the real playbook data, so zooming in reads the actual contents.

Scroll or pinch to zoom, drag to pan, arrows and + / − on the keyboard, Tab walks the objects, and a Tilted / flat toggle. Clicking an object opens it in a drawer. Its Open button is the one thing not wired yet, and it names the page it will lead to.

Textures are procedural (SVG noise over the brand tokens), no downloaded images. Logged as prompt 0026, changelog 0033, decision D-103, version 0.20.0.

_Fable 5.1 did the architecture and brief, Opus 5 built it, Sonnet 5 logged the reply._
