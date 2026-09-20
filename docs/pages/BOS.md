# BOS-02..BOS-06 - Other pages of the Claude Design export

All served as-is from `/business-os/` through URL-safe forwarders (D-010); originals keep their names. English-only; no `PageSpec` yet. Fonts and runtime vendored (D-008). Model: Claude Design (original); Fable 5.1 (ingest).

| Code | Page | Entry | Original file | What it is | Screenshots |
| --- | --- | --- | --- | --- | --- |
| BOS-02 | ALUZINA Home | `/business-os/home.html` | `ALUZINA Home.dc.html` | Marketing home concept: fixed header, hero with the three Seedance loop videos and three transition mp4s (`assets/*.mp4`, 43 MB), marble-and-brass language, `[data-rise]` reveal on scroll. | `docs/screenshots/BOS-02/en-1280.jpg` |
| BOS-03 | Cyber Bridge | `/business-os/cyber-bridge.html` | `Cyber Bridge.dc.html` | Dark concept page: the bridge metaphor (stations, menu, bible as windows onto the OS), `image-slot` elements fed by `.image-slots.state.json`, in-page `#stations` / `#menu` / `#bible` anchors. | step 2 |
| BOS-04 | Cyber Bridge Deck | `/business-os/cyber-bridge-deck.html` | `Cyber Bridge Deck.dc.html` | 1920x1080 slide deck via `<x-import from="./deck-stage.js">` (`deck-stage.js`, 136 KB): sections with `data-speaker-notes`, keyboard navigation. | step 2 |
| BOS-05 | Image Generation Plan | `/business-os/image-generation-plan.html` | `Image Generation Plan.dc.html` | Printable document (`doc-page.js`): how the world renders (`assets/os-*.webp`) and the 31 station / menu shots (`assets/world/*.png`) are produced. | step 2 |
| BOS-06 | LOD Ladder | `/business-os/lod-ladder.html` | `LOD Ladder.dc.html` | Concept page: levels of detail from the world map down to a station close-up. | step 2 |
| - | Canvas | (none) | `Canvas.dc.html` | Empty `<x-dc>` (206 bytes); kept for fidelity, not linked from the hub. | - |

Audit items (step 2): English-only copy (P-13), video weight on phones (P-01), keyboard access to the deck and anchors (P-03), placeholders for links that go nowhere (P-09).
