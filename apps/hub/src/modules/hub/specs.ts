import { defineSpec } from '../../specs/PageSpec';

export const SURFACE_IDS = ['business-os', 'website', 'customer', 'staff', 'docs', 'manual', 'dev'] as const;
export type SurfaceId = (typeof SURFACE_IDS)[number];

export const hubSpec = defineSpec({
  code: 'HUB-01',
  name: 'Hub',
  purpose: 'Entry point to every surface of the Aluzina system; language, theme and dev-mode controls.',
  surface: 'hub',
  layout: ['HubHeader', 'Title + subtitle', 'Surface card grid (7 cards)', 'Footer (version, repo link, dev hint)'],
  data: [],
  roles: ['public'],
  logic: [
    'Live surfaces render as links; planned surfaces render through Placeholder (P-09).',
    'Language, theme and dev mode persist in localStorage (aluzina.lang / aluzina.theme / aluzina.devMode).',
    'Ctrl+. toggles the dev panel when dev mode is on.',
  ],
  components: ['HubHeader', 'ToggleButton', 'SurfaceCard', 'Placeholder', 'Toast'],
  actions: [
    {
      id: 'hub.openSurface',
      label: 'Open surface',
      intent: 'open the {surface}',
      params: { surface: `enum:${SURFACE_IDS.join('|')}` },
    },
    { id: 'hub.setLang', label: 'Set language', intent: 'switch the language to {lang}', params: { lang: 'enum:en|es' } },
    { id: 'hub.toggleTheme', label: 'Toggle theme', intent: 'switch between light and dark' },
    { id: 'hub.toggleDevMode', label: 'Toggle developer mode', intent: 'turn developer mode on or off', permission: 'dev.tools' },
  ],
  checkedAt: [390, 1280, 3840],
  notes: ['Role switcher, demo simulator, canvas and plan viewer arrive in build plan step 4 (Dev tools card).'],
});
