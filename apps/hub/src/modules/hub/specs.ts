import { defineSpec } from '../../specs/PageSpec';

export const SURFACE_IDS = ['business-os', 'website', 'customer', 'staff', 'docs', 'manual', 'dev'] as const;
export type SurfaceId = (typeof SURFACE_IDS)[number];

/** Pages of the Claude Design export served under ./business-os/ (BOS-02..BOS-06, D-010). */
export const PROTOTYPE_PAGE_IDS = ['home', 'cyber-bridge', 'cyber-bridge-deck', 'image-generation-plan', 'lod-ladder'] as const;
export type PrototypePageId = (typeof PROTOTYPE_PAGE_IDS)[number];

export const hubSpec = defineSpec({
  code: 'HUB-01',
  name: 'Hub',
  purpose: 'Entry point to every surface of the Aluzina system; language, theme and dev-mode controls.',
  surface: 'hub',
  layout: ['HubHeader', 'Title + subtitle', 'Surface card grid (7 cards, each with a deploy-time thumbnail or a "No preview yet" tile)', 'Prototype pages grid (5 cards with thumbnails)', 'Footer (version, repo link, dev hint)'],
  data: [],
  roles: ['public'],
  logic: [
    'Live surfaces render as links; planned surfaces render through Placeholder (P-09).',
    'Language, theme and dev mode persist in localStorage (aluzina.lang / aluzina.theme / aluzina.devMode).',
    'Ctrl+. toggles the dev panel when dev mode is on.',
    'Card thumbnails load lazily from ./thumbs/<code>.jpg?v=<buildId>, written by scripts/thumbnails.mjs after every CI build (D-011); a missing file falls back to the bilingual tile, planned cards always show the tile.',
  ],
  components: ['HubHeader', 'ToggleButton', 'SurfaceCard', 'Placeholder', 'Toast'],
  actions: [
    {
      id: 'hub.openSurface',
      label: 'Open surface',
      intent: 'open the {surface}',
      params: { surface: `enum:${SURFACE_IDS.join('|')}` },
    },
    {
      id: 'hub.openPrototypePage',
      label: 'Open prototype page',
      intent: 'open the prototype page {page}',
      params: { page: `enum:${PROTOTYPE_PAGE_IDS.join('|')}` },
    },
    { id: 'hub.setLang', label: 'Set language', intent: 'switch the language to {lang}', params: { lang: 'enum:en|es' } },
    { id: 'hub.toggleTheme', label: 'Toggle theme', intent: 'switch between light and dark' },
    { id: 'hub.toggleDevMode', label: 'Toggle developer mode', intent: 'turn developer mode on or off', permission: 'dev.tools' },
  ],
  checkedAt: [360, 390, 768, 1280, 1920, 2560, 3840],
  notes: [
    'Role switcher, demo simulator, canvas and plan viewer arrive in build plan step 4 (Dev tools card).',
    'Business OS prototype (BOS-01) and its pages (BOS-02..06) are the static Claude Design bundle at ./business-os/ (D-007).',
  ],
});
