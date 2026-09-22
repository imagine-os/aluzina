import type { IconName } from './Icon';

/**
 * Unicode glyph -> icon. The glyphs stay exactly as they are in every module's `nav.glyph` and in the
 * seeded spaces: they are data, this file is the reading of that data (docs/design/icons.md). One glyph
 * serves several meanings across modules, so this map holds the *generic* reading; a page that needs a
 * sharper one is listed in ROUTE_ICONS, which wins.
 */
export const GLYPH_ICONS: Record<string, IconName> = {
  '◈': 'dashboard',
  '▤': 'documents',
  '◇': 'references',
  '▦': 'catalog',
  '◆': 'money',
  '✓': 'approvals',
  '☷': 'team',
  '▣': 'reports',
  '◉': 'quality',
  '▷': 'deliveries',
  '✦': 'palette',
  '▩': 'images',
  '▥': 'work',
  '◦': 'dot',
  '·': 'dot',
  '▪': 'dot',
  '▫': 'dot',
  '●': 'dot',
  '◌': 'note',
  '▸': 'chevron-right',
  '▾': 'chevron-down',
  '§': 'docs',
  '⌖': 'site',
  '❖': 'brand',
  '✎': 'intake',
  '⊞': 'revisions',
  '⇄': 'revisions',
  '$': 'money',
  '◎': 'money',
  '⚒': 'tools',
  '▲': 'execution',
  '☑': 'check',
  '✉': 'messages',
  '⛟': 'deliveries',
  '⇥': 'import',
  '⟡': 'graph',
  '◱': 'plan',
  '◫': 'spaces',
  '▭': 'simulator',
  '▧': 'purchases',
  '⌗': 'testing',
  '⌁': 'actions',
  '◐': 'tokens',
  '!': 'alerts',
  '☰': 'more',
  '…': 'more',

  // ar-21: the UI glyphs modules typed inside their own bodies (close buttons, chevrons, zoom, copy,
  // the theme toggle). `Button` reads this map for a string `icon` / `iconEnd`, so a module keeps its
  // glyph and still renders a drawn icon (D-064: code, then glyph, then the glyph text itself).
  '×': 'close',
  '✕': 'close',
  '›': 'chevron-right',
  '‹': 'chevron-left',
  '▶': 'chevron-right',
  '◀': 'chevron-left',
  '→': 'chevron-right',
  '←': 'back',
  '↓': 'download',
  '↗': 'external',
  '−': 'minus',
  '+': 'plus',
  '⧉': 'copy',
  '⌕': 'search',
  '⚲': 'pin',
  '⚑': 'flag',
  '⎙': 'print',
  '☾': 'moon',
  '☼': 'sun',
  '↺': 'revisions',
};

/**
 * Page code -> icon, consulted before the glyph map so a page reads as what it *is* rather than as the
 * shape someone typed. Every nav route of every surface is listed; a code that is not here falls through
 * to its glyph.
 */
export const ROUTE_ICONS: Record<string, IconName> = {
  'HUB-01': 'home',

  // Founder (A)
  'A-01': 'dashboard', // the founder overview keeps the gauge; the other portals carry the icon of their craft, so the four portal cards never read alike 'A-02': 'approvals', 'A-03': 'sales', 'A-04': 'quotes',
  'A-05': 'catalog', 'A-06': 'clients', 'A-07': 'team', 'A-08': 'leads',

  // Client app (C)
  'C-01': 'home', 'C-02': 'projects', 'C-03': 'approvals', 'C-04': 'messages',
  'C-05': 'payments', 'C-06': 'intake',

  // Interior design studio (S)
  'S-01': 'design', 'S-02': 'projects', 'S-03': 'references', 'S-04': 'catalog',
  'S-05': 'plans', 'S-06': 'schedule', 'S-07': 'assets', 'S-08': 'quality',
  'S-09': 'site', 'S-10': 'check', 'S-11': 'revisions', 'S-12': 'archive', 'S-13': 'documents',

  // Graphic design and communication (G)
  'G-01': 'brand', 'G-02': 'competitions', 'G-03': 'presentations', 'G-04': 'brand',
  'G-05': 'images', 'G-06': 'revisions', 'G-07': 'assets', 'G-08': 'documents',

  // Administration and operations (O)
  'O-01': 'execution', 'O-02': 'schedule', 'O-03': 'work', 'O-04': 'suppliers',
  'O-05': 'quotes', 'O-06': 'deliveries', 'O-07': 'payments', 'O-08': 'documents',
  'O-09': 'alerts', 'O-10': 'reports', 'O-11': 'revisions', 'O-12': 'purchases', 'O-13': 'site',

  // Public site (P)
  'P-00': 'external', 'P-01': 'catalog', 'P-02': 'catalog', 'P-03': 'intake',
  'P-04': 'plan', 'P-05': 'images',

  // Ops manual (M)
  'M-01': 'manual', 'M-02': 'money', 'M-03': 'manual', 'M-04': 'manual',
  'M-05': 'manual', 'M-06': 'execution', 'M-07': 'manual', 'M-08': 'quality',

  // Spaces (K)
  'K-01': 'spaces', 'K-02': 'folder', 'K-03': 'documents', 'K-04': 'graph',
  'K-05': 'catalog', 'K-06': 'import',

  // Work (W)
  'W-01': 'work', 'W-02': 'work', 'W-03': 'work',

  // Builder and dev tools (D)
  'D-02': 'catalog', 'D-03': 'docs', 'D-04': 'team', 'D-05': 'plan',
  'D-06': 'docs', 'D-07': 'canvas', 'D-08': 'simulator', 'D-09': 'actions',
  'D-10': 'tokens', 'D-11': 'testing', 'D-12': 'design', 'D-13': 'palette',
  'D-14': 'tokens', 'D-15': 'documents',

  // Claude Design prototype (BOS)
  'BOS-01': 'canvas', 'BOS-02': 'home', 'BOS-03': 'presentations', 'BOS-04': 'presentations',
  'BOS-05': 'images', 'BOS-06': 'plans',
};

/** Space kind (data/schema/spaces.ts) -> icon. Unknown kinds keep the seeded glyph. */
export const SPACE_KIND_ICONS: Record<string, IconName> = {
  area: 'spaces',
  topic: 'note',
  role: 'user',
  client: 'clients',
  deliverable: 'assets',
  tool: 'tools',
  project: 'projects',
  archive: 'archive',
};

/**
 * Post kind (data/schema/spaces.ts) -> icon: the mark a `PostCard` shows beside its kind label (ar-21).
 * An unknown kind falls back to `note`, which is what an untyped post is.
 */
export const POST_KIND_ICONS: Record<string, IconName> = {
  note: 'note',
  link: 'external',
  file: 'documents',
  decision: 'approvals',
  procedure: 'manual',
  brief: 'intake',
  announcement: 'alerts',
};

/**
 * The one resolution order in the OS: page code, then the Unicode glyph, then nothing - and the caller
 * renders the glyph text itself as the last fallback, so a module that invents a new glyph still shows
 * something and no module ever has to change (D-064).
 */
export function resolveIcon(code?: string, glyph?: string): IconName | undefined {
  if (code && ROUTE_ICONS[code]) return ROUTE_ICONS[code];
  if (glyph && GLYPH_ICONS[glyph]) return GLYPH_ICONS[glyph];
  return undefined;
}
