# 0010 - Brand kit into design system and brand guidelines

- source: Slack #aluzina-brand-kit thread (new channel), requester Justin Massion
- date: 2026-09-21 04:05 UTC (23:05 local, 2026-09-20)
- requester: Justin Massion
- attachments: `MANUAL DE MARCA ALUZINA .pdf` (601 KB, second message, 04:14 UTC), stored at `docs/source/brand-kit/MANUAL-DE-MARCA-ALUZINA.pdf` with extraction notes at `docs/source/brand-kit/extraction.md`; described under Attachments below
- context: new channel Justin created specifically for the brand kit, separate from the main #aluzina thread (prompts 0001-0005); the kit is the source for `docs/knowledge/brand.md`

## Prompt (verbatim)

```
im going to give you the brand kit and stuff here. please turn this into design system and brand guidelines in the hub and apply the colors and styling to all the software of thehub and such. Not including the previous protoypes.
```

## Response

Reply posted to the Slack thread (verbatim):

> Ready for the kit. Nothing has come through yet, so post it here whenever you're set: logo files (SVG ideal), color values, font names or files, and any brand PDF or export you have. I'm mapping the hub's theme and pages now so I can start the moment it lands.

## Follow-up (2026-09-21 04:14 UTC, Justin)

Message (verbatim, attachment `MANUAL DE MARCA ALUZINA .pdf`):

```
here it is. we will likely change the gold to silver. of note, please consider the realiztic textures and gradients in the design system of the app. You can also potentially use really beautiful shader technology for some of the iredescent effects into the applications.

Make sure light and dark mode are great in the hub and software portals we're building
```

### Attachments

`MANUAL DE MARCA ALUZINA .pdf`: one tall page (736 x 4753 pt), Illustrator CC 2017 export, 100% vector (no raster images, no prose). Internal title "logo y universo ALUZINA". Sections, in order: LOGO, DESCRIPTOR, MONOGRAMA, COLORES, TIPOGRAFÍA, ELEMENTOS, TEXTURAS. It is a style sheet (logo lockups, color swatches with printed codes, a type specimen, graphic glyphs and seamless line patterns), not a written rulebook — no clear-space, minimum-size, misuse, photography, tone-of-voice or accessibility rules appear anywhere on the page. Stored at `docs/source/brand-kit/MANUAL-DE-MARCA-ALUZINA.pdf`; the full extraction (colors, gradient stops, typography, graphic elements, gaps) is at `docs/source/brand-kit/extraction.md`. Facts pulled from it are recorded in `docs/knowledge/brand.md`.

Reply posted to the Slack thread (verbatim):

> The Aluzina brand manual is now the hub's design system and every portal is restyled on it: https://imagine-os.github.io/aluzina/#/design (live once the Pages deploy finishes, a few minutes after the push). The Design system section has the brand guidelines (logo, monogram, colours with Pantone and hex, DIN Round Pro, elements, textures), live tokens with contrast checks in both themes, and a textures-and-effects page with a WebGL shimmer for the metal and iridescent finishes. Gold is one token group with silver already defined: the guidelines page has a live gold/silver preview and the real switch is a one-line change. Light and dark are both first-class; every component was audited in both. The prototype at /business-os/ is untouched. Fable 5.1 did the architecture, tokens and restyle, Opus 5 built the pages and shader, Sonnet 5 did the docs pass. Changelog 0014.

See changelog 0014.
