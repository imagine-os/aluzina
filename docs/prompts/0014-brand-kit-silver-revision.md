# 0014 - Brand kit: silver revision of the manual, PDF download from the hub

- source: Slack #aluzina-brand-kit, two top-level posts by Justin Massion relayed into the thread of prompt 0010
- date: 2026-09-21 05:03 UTC (00:03 local, 2026-09-21)
- requester: Justin Massion
- attachments: `MANUAL DE MARCA ALUZINA -1.pdf` (496 KB), the silver edition of the brand manual; stored at `docs/source/brand-kit/MANUAL-DE-MARCA-ALUZINA-silver-2026-09-21.pdf` (the gold edition of prompt 0010 renamed to `MANUAL-DE-MARCA-ALUZINA-gold-2026-09-21.pdf`), extraction diff at `docs/source/brand-kit/extraction-silver.md`; served by the hub at `apps/hub/public/brand/MANUAL-DE-MARCA-ALUZINA.pdf`
- context: follows prompt 0010 ("we will likely change the gold to silver") and changelog 0014, where the metal was built as a switchable token group for exactly this change

## Prompt (verbatim)

```
Here is the updated brand manual with the silver instead of gold. Make sure we can download this p. D. F from the hub.
```

```
And please make sure that the design system is updated according to this
```

### Attachment

`MANUAL DE MARCA ALUZINA -1.pdf`: Illustrator 29.8 export saved 2026-09-20, the same single tall vector page (736 x 4753 pt) and the same seven sections at the same positions as the gold edition. Decoded differences (data, `extraction-silver.md`): primary Pantone 875 C gold -> **877 C silver**, RGB 192,192,192, CMYK 0/0/0/25, every silver fill / stroke / text `#C0C0C0` (the printed hex line still reads `#98876D`, a leftover); the only metallic shading is a smooth ramp `#FFFFFF -> #E0E0E0 -> #999999 -> #4D4D4D`; the primary LOGO is now the iridescent wordmark on white with a new periwinkle lockup "INTERIORISMO / ILUMINACIÓN" while DESCRIPTOR and footer keep "UNIVERSO DE DISEÑO"; the footer band is flat black; four texture discs (iridescent, black, metallic silver, flat silver); all outlines 1 pt silver. Export defects (invisible zero-width rules and slashes, stale hex, gold PRODUCTOS / ESPACIOS / ARTE labels) are reported, not reproduced (D-052).

## Response

Reply posted to the Slack thread (verbatim):

> Silver is live: https://imagine-os.github.io/aluzina/#/design (after the Pages deploy). The metal switched to Pantone 877 C silver in one token change, the greys were re-derived neutral for both themes, and the primary wordmark is now the iridescent version on white as in the new manual, with the new "INTERIORISMO / ILUMINACIÓN" lockup. The manual PDF downloads from the Brand guidelines page. Three things in the PDF export to pass to Angélica: the hex printed under the silver swatch still reads #98876D (RGB 192,192,192 is right), the PRODUCTOS / ESPACIOS / ARTE labels are still gold, and the section rules and descriptor slashes are invisible zero-width fills. Fable 5.1 did this pass. Changelog 0015.

See changelog 0015 (D-050, D-051, D-052).
