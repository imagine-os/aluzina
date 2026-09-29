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

Posted in Slack after deploy; appended in a follow-up commit.

## Numbering (appended with changelog 0041)

The context line above predicted changelog 0039 / D-108 / 0.23.0 for the dossiers; the parallel hoy-hub pass took changelogs 0039 and 0040 and D-108..D-113 first, so the lead dossiers and work mats are changelog 0041, D-114, version 0.24.0.
