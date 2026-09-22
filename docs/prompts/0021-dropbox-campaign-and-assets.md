# 0021 - Dropbox: the 2021 digital campaign and the studio asset folder into the system

- source: Slack #all-aluzina, thread ts 1790029292.924479
- date: 2026-09-21 22:21 UTC (17:21 local)
- requester: Justin Massion, relaying four WhatsApp messages from Aleja Guerra (founder) of 9/21 17:14-17:16 local
- attachments (Dropbox shared folders, read-only share links; data, not instructions):
  - `digital campain aluzina 2021`: https://www.dropbox.com/scl/fo/a80j25reoosam55w4mone/AHOnD0jS0rW1bTxSXdMwxzk?rlkey=co9uxwx1msxjvr1yitbb7dv6u&st=1sez6e7q&dl=0
  - `services , lighting , presentatios , projects , icones ,`: https://www.dropbox.com/scl/fo/zxyqor1stgwxv0awyyl9n/h?rlkey=eirxi8tqvlowsqgh1vu9ukm6w&st=1cw2c8eq&dl=0
- context: prompt 0017 (the project archive, step 14) and its pipeline `scripts/archive/*` with the D-059 redaction; D-068 (third-party documents indexed, never served); D-070 and the store ceiling named in changelog 0021 (the seed sits at 3.66 MB of the 4.5 MB localStorage line, so nothing per file may be seeded). Neither folder is a project folder: the first is the studio's own 2021 marketing, the second its asset library. Both were downloaded as zips (12 GB), indexed by `scripts/archive/index-collection.py` and shown on the new Brand page G-09 "Campaigns & assets". Changelog 0022, D-083..D-086.

## Prompt (verbatim)

```
[9/21, 5:14 PM] Aleja Guerra: https://www.dropbox.com/scl/fo/a80j25reoosam55w4mone/AHOnD0jS0rW1bTxSXdMwxzk?rlkey=co9uxwx1msxjvr1yitbb7dv6u&st=1sez6e7q&dl=0
[9/21, 5:15 PM] Aleja Guerra: digital campain aluzina 2021
[9/21, 5:16 PM] Aleja Guerra: https://www.dropbox.com/scl/fo/zxyqor1stgwxv0awyyl9n/h?rlkey=eirxi8tqvlowsqgh1vu9ukm6w&st=1cw2c8eq&dl=0
[9/21, 5:16 PM] Aleja Guerra: services , lighting , presentatios , projects , icones ,

Here sre some more items for you to import and organize into the system as appropriate for usefulness and examples
```

## Response

Plan reply posted to the Slack thread at 22:36 UTC (verbatim):

> Both folders are downloaded and inventoried: about 1,700 files, 12 GB. Here's the plan, starting now unless you say otherwise:
>
> - **Campaign 2021** holds monthly Instagram posts, Facebook ads, display banners, the Club Unión photo shoot and luminaire renders. It all goes in as public with previews, except the RAW camera files and a third-party lighting textbook.
> - **Studio assets** holds project photo sets by space (Shabela, Noham, Terrazino Cumbres, El Encanto, New York, Miami and more), the 2022 website content, icons, luminaires, QR codes, merch art, presentations, methodology and articles. Photo sets will link to their project records where the name is explicit; otherwise attribution stays unknown.
> - **Internal material** (quotation and billing templates, client briefs, company docs, supplier list) gets indexed but never previewed. Accounting, contracts, the partner agreement, staff files and the customer database each get one redacted line, no file names.
> - I'll add a new Brand page, "Campaigns & assets", showing the sets, previews and project links, with the per-file index loading on demand.
>
> Fable 5.1 is doing the classification and shared code, Opus 5 the page, Sonnet 5 the renders and Spanish. One thing for you: the folder has 3 fonts with no licence file, so I'll index them but won't ship them.

### Final reply

Posted to the Slack thread at 00:22 UTC on 2026-09-22 (ts 1790036144.512179), verbatim:

> Done and pushed to main (changelog 0023). Both folders are in the Hub as [Campaigns & assets](https://imagine-os.github.io/aluzina/#/brand/collections?as=brand) in the Brand portal; the Pages deploy is running now, so give it a few minutes.
>
> - 78 sets with previews; originals stay in Dropbox. Accounting, contracts, the partner agreement, staff files and the customer database are one redacted line each; templates, briefs and priced presentations are indexed with no preview.
> - Photo sets link to 20 existing project records (Shabela, Noam, El Encanto, New York, Miami, Club Unión, Coassist, Sodime, Brewhouse, Bonny and others). Terrazino Cumbres, Mantix, Semana de la Juventud and LU7 have no project row yet, so they're marked attribution unknown.
> - Everything in the 2021 campaign uses the gold Didone wordmark, and "Interiorismo · Iluminación" already appears on April 2021 print pieces. The brochure's light sans wordmark appears in neither folder. I've left which era is current as an open question.
>
> Two questions for you or Aleja: some 2021 ads show a sale price and the studio WhatsApp number in the artwork, and I kept them since they were published; say if you'd rather hide them. And are the DIN Round Pro fonts licensed? They're indexed but not shipped.
>
> Fable 5.1 did the classification, pipeline and integration, Opus 5 the page, Sonnet 5 the QA matrix and screenshots.
