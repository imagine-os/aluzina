# 0031 - Render quality and lead dossiers: crisp text and no clipping, lead photos and logos, dossier stacks that fan, work mats

- source: Slack #all-aluzina, 2026-09-29 06:07 UTC (thread reply)
- date: 2026-09-29
- requester: Justin Massion
- context: the repo at `52136c0` (version 0.22.0, changelog 0036, prompt 0029, D-106), during the Sonnet QA pass of the desk system. Prompt 0030 and changelog 0037 were taken by the parallel hoy-hub pass (`508da71`) while this one ran, so this prompt is 0031. It caused changelog 0038 (render quality, D-107, version 0.22.1) and changelog 0039 (lead dossiers and work mats, D-108, version 0.23.0).

## Prompt (verbatim)

```
make sure everyhting renders clean and smooth, text, no clipping when 3d objects oerlap, etc. Also, leads should have a photo and sometimes a logo.  maybe even a stack of info like cards with their social media profiles embeded as the interactive card, stacked and sortable or fanned out or wahteer. You can even have seperate mats for where you fan out and arrange different leads and info and stuff, from the regular stacks of where they are in the process and stuff.
```

## Response

Posted in Slack #all-aluzina 2026-09-29 ~07:25 UTC with three screenshots (docs/screenshots/A-08/en-1280-dossier-fan.jpg, docs/screenshots/A-08/en-1280-workmat.jpg, docs/screenshots/W-04/en-1280-crisp-300.jpg).

Both done and live. Leads: https://imagine-os.github.io/aluzina/#/founder/leads (select a lead, then Fan out).

Rendering: the whole desk now has one depth order, so glows, rings and overlapping objects sit on their own layers and nothing clips. Text is rasterised at the final size after each zoom and hairlines never drop below one device pixel. Pan on the Method desk while following a project went from a 50 ms worst frame to 17 ms, and the compositor layer count roughly halved. The six polish defects from the QA pass (Spanish ability labels, legend line breaks, cut-off sub-mat labels, focus tooltip, object counts, toolbar wrap at 4K) are fixed too.

Leads: every lead card carries a portrait, companies carry a logo, and a row of network glyphs. Selecting a lead turns it into a dossier: Contact, Company, one card per social profile (flips to notes, Visit opens the site), Qualification, Commercial, Notes and messages. Fan out, Stack, Sort by kind / date / network, Flip. Work mats sit below the process stacks: add, rename, arrange leads by drag or arrow keys, and the arrangement is remembered per person. The process stacks stay the source of truth, so a lead on a work mat keeps updating.

The portraits and logos on the mock leads are generated art, not real people, and the social cards are drawn from mock handles rather than embedded from the networks (privacy, third-party scripts and the network policy). Real leads will carry uploaded photos and real handles.

Logged as prompt 0031, changelogs 0038 (render) and 0041 (dossiers), decisions D-107 and D-114, QA 0009, version 0.24.0. Another session pushed to the repo in between, so the numbers moved.

_Fable 5.1 wrote the brief, Opus 5.5 built both passes, Sonnet 5 will log the reply._

## Numbering (appended with changelog 0041)

The context line above predicted changelog 0039 / D-108 / 0.23.0 for the dossiers; the parallel hoy-hub pass took changelogs 0039 and 0040 and D-108..D-113 first, so the lead dossiers and work mats are changelog 0041, D-114, version 0.24.0.
