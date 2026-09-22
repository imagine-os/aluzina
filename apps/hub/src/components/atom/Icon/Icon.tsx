import type { ReactNode } from 'react';
import { cx } from '../../../design/cx';
import './Icon.css';

/**
 * Every icon in the system. One inline SVG each, drawn on the same 24 x 24 grid at stroke 1.75 with round
 * caps and joins, `currentColor`, no fills except the tiny dots (docs/design/icons.md). Names are what the
 * thing *is* in the OS (`approvals`, `deliveries`, `purchases`), not what it looks like, so a redraw never
 * renames a call site.
 */
export const ICON_NAMES = [
  'dashboard', 'approvals', 'projects', 'work', 'spaces', 'graph', 'catalog', 'import',
  'documents', 'plans', 'design', 'references', 'palette', 'brand', 'competitions', 'presentations',
  'images', 'revisions', 'assets', 'communication', 'messages', 'alerts', 'reports', 'quality',
  'settings', 'manual', 'developer', 'docs', 'archive', 'sales', 'leads', 'intake',
  'schedule', 'calendar', 'suppliers', 'quotes', 'deliveries', 'payments', 'execution', 'purchases',
  'site', 'money', 'clients', 'team', 'tools', 'plan', 'canvas', 'simulator',
  'actions', 'tokens', 'testing', 'folder', 'search', 'filter', 'close', 'chevron-right',
  'chevron-down', 'external', 'download', 'copy', 'plus', 'minus', 'check', 'warning',
  'info', 'user', 'home', 'back', 'note', 'dot', 'more',
  // ar-21: the glyphs the modules printed in their own bodies (theme toggle, pins, print, bug flag, the
  // back chevron) needed drawn names of their own; same 24-grid, 1.75 stroke as the rest.
  'chevron-left', 'moon', 'sun', 'pin', 'print', 'flag', 'menu',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

const NAME_SET: ReadonlySet<string> = new Set(ICON_NAMES);

/** True when `value` is a drawn icon name (guards data that carries an icon id, P-07). */
export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && NAME_SET.has(value);
}

/** sm 1rem (16) inline with text, md 1.25rem (20) nav rows, lg 1.5rem (24) headers, xl 2rem (32) tiles. */
export type IconSize = 'sm' | 'md' | 'lg' | 'xl';
export type IconTone = 'default' | 'muted' | 'accent';

export interface IconProps {
  name: IconName;
  size?: IconSize;
  /** Accessible name. With it the svg is `role="img"` + `aria-label`; without it it is `aria-hidden` (decorative next to a text label). */
  label?: string;
  tone?: IconTone;
  className?: string;
}

/** A filled dot: the one place the set fills instead of strokes (a 1 pt stroke cannot draw a 2 px dot). */
function Dot({ cx: x, cy, r = 0.95 }: { cx: number; cy: number; r?: number }) {
  return <circle cx={x} cy={cy} r={r} fill="currentColor" stroke="none" />;
}

/* eslint-disable react/jsx-key */
const PATHS: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <path d="M3.5 17.5a8.5 8.5 0 0 1 17 0" />
      <path d="m12 12.8 3.9-3.4" />
      <Dot cx={12} cy={17.5} r={1.2} />
    </>
  ),
  approvals: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.2 12.2 2.8 2.8 5-5.6" />
    </>
  ),
  projects: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M9 4.5v15M15 4.5v15" />
    </>
  ),
  work: (
    <>
      <path d="m3.8 7.4 1.5 1.5 2.6-3.1" />
      <path d="m3.8 16.6 1.5 1.5 2.6-3.1" />
      <path d="M11.5 7.5h8.7M11.5 16.5h8.7" />
    </>
  ),
  spaces: (
    <>
      <path d="M12 3.5 20.5 8 12 12.5 3.5 8 12 3.5Z" />
      <path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5L20.5 16" />
    </>
  ),
  graph: (
    <>
      <circle cx="6" cy="17.5" r="2.5" />
      <circle cx="12" cy="6.5" r="2.5" />
      <circle cx="18" cy="15.5" r="2.5" />
      <path d="m7.6 15.5 3-6.6M13.8 8.2l2.9 5.1" />
    </>
  ),
  catalog: (
    <>
      <rect x="3.5" y="4.5" width="7" height="6.5" rx="1.5" />
      <rect x="13.5" y="4.5" width="7" height="6.5" rx="1.5" />
      <rect x="3.5" y="13" width="7" height="6.5" rx="1.5" />
      <rect x="13.5" y="13" width="7" height="6.5" rx="1.5" />
    </>
  ),
  import: (
    <>
      <path d="M3.5 12h10.5" />
      <path d="m10.5 8.5 3.5 3.5-3.5 3.5" />
      <path d="M13.5 4.5h5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-5" />
    </>
  ),
  documents: (
    <>
      <path d="M6.5 3.5h7l5 5V20a.5.5 0 0 1-.5.5H6.5a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z" />
      <path d="M13.5 3.5v5h5" />
      <path d="M9 13h6M9 16.5h4" />
    </>
  ),
  plans: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path d="M8.5 5.5v13M8.5 11h5.5M14 5.5v5.5M14 14h6.5" />
    </>
  ),
  design: (
    <>
      <circle cx="12" cy="6" r="1.6" />
      <path d="m11.2 7.5-4.7 12M12.8 7.5l4.7 12" />
      <path d="M8.7 14.2c2.1 1.3 4.5 1.3 6.6 0" />
    </>
  ),
  references: <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4-6.5 4v-16a1 1 0 0 1 1-1Z" />,
  palette: (
    <>
      <path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.4 0 2.1-.9 2.1-1.9 0-1.4-1.2-1.6-1.2-2.7 0-.9.7-1.6 1.7-1.6h1.6a4.3 4.3 0 0 0 4.3-4.3c0-3.6-3.8-6.5-8.5-6.5Z" />
      <Dot cx={8.2} cy={10.2} />
      <Dot cx={12} cy={7.8} />
      <Dot cx={15.8} cy={10.2} />
    </>
  ),
  brand: (
    <>
      <path d="m12 3.5 8.5 8.5-8.5 8.5L3.5 12 12 3.5Z" />
      <path d="M12 8.5 15.5 12 12 15.5 8.5 12 12 8.5Z" />
    </>
  ),
  competitions: (
    <>
      <path d="M8 4h8v4.2a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5.8H5.5v1.4a3 3 0 0 0 2.6 3M16 5.8h2.5v1.4a3 3 0 0 1-2.6 3" />
      <path d="M12 12.4v4.1M9 20h6" />
    </>
  ),
  presentations: (
    <>
      <rect x="3.5" y="4.5" width="17" height="11" rx="1.5" />
      <path d="M12 15.5v4.5M9.2 20h5.6" />
      <path d="m7.8 12 2.7-3 2.4 2 3.3-4" />
    </>
  ),
  images: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="m3.8 16.6 5-4.9 3.9 3.4 2.8-2.4 4.7 4" />
      <circle cx="8.6" cy="9.2" r="1.5" />
    </>
  ),
  revisions: (
    <>
      <path d="M20 12a8 8 0 1 1-2.7-6" />
      <path d="M20.5 4v4.5H16" />
    </>
  ),
  assets: (
    <>
      <path d="M12 3.5 20 7.8v8.4L12 20.5 4 16.2V7.8L12 3.5Z" />
      <path d="M4 7.8 12 12l8-4.2M12 12v8.5" />
    </>
  ),
  communication: (
    <>
      <path d="M20.5 13.8a2 2 0 0 1-2 2H9.2L4.5 19.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7.8Z" />
      <path d="M8.5 8.5h7M8.5 11.5h4.5" />
    </>
  ),
  messages: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.2 7.2 7.8 5.4 7.8-5.4" />
    </>
  ),
  alerts: (
    <>
      <path d="M12 3.8A5.6 5.6 0 0 0 6.4 9.4c0 4-1.6 5.6-1.6 5.6h14.4s-1.6-1.6-1.6-5.6A5.6 5.6 0 0 0 12 3.8Z" />
      <path d="M10.1 18.2a2.1 2.1 0 0 0 3.8 0" />
    </>
  ),
  reports: (
    <>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
      <path d="M8.6 16.2v-3.4M12 16.2V8.6M15.4 16.2v-5.4" />
    </>
  ),
  quality: (
    <>
      <path d="M12 3.5 19.5 6v5.9c0 4.3-3 7.2-7.5 8.6-4.5-1.4-7.5-4.3-7.5-8.6V6L12 3.5Z" />
      <path d="m9 11.9 2.2 2.2 3.9-4.2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
    </>
  ),
  manual: (
    <>
      <path d="M12 6.6S10.1 4.5 4.8 4.5v12.8c5.3 0 7.2 2.2 7.2 2.2s1.9-2.2 7.2-2.2V4.5C13.9 4.5 12 6.6 12 6.6Z" />
      <path d="M12 6.6v12.9" />
    </>
  ),
  developer: (
    <>
      <path d="M8.8 7.5 4.5 12l4.3 4.5M15.2 7.5 19.5 12l-4.3 4.5" />
      <path d="m13.4 5-2.8 14" />
    </>
  ),
  docs: (
    <>
      <path d="M5.5 5.8A2.3 2.3 0 0 1 7.8 3.5h10.7v13H7.8a2.3 2.3 0 0 0-2.3 2.3V5.8Z" />
      <path d="M5.5 18.8a2.3 2.3 0 0 0 2.3 2.3h10.7" />
      <path d="M9 8h6" />
    </>
  ),
  archive: (
    <>
      <rect x="3.5" y="4.5" width="17" height="4.2" rx="1" />
      <path d="M5.2 8.7V19a1.5 1.5 0 0 0 1.5 1.5h10.6a1.5 1.5 0 0 0 1.5-1.5V8.7" />
      <path d="M10 12.5h4" />
    </>
  ),
  sales: (
    <>
      <path d="m4 16.8 5.6-5.6 3.5 3.5L20 7.8" />
      <path d="M15.4 7.8H20v4.6" />
    </>
  ),
  leads: <path d="M4.2 5.5h15.6l-6 7.2v5.6l-3.6 2v-7.6l-6-7.2Z" />,
  intake: (
    <>
      <path d="M9 5.5H7a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V7A1.5 1.5 0 0 0 17 5.5h-2" />
      <rect x="9" y="3.5" width="6" height="3.4" rx="1" />
      <path d="M9 12h6M9 15.5h4" />
    </>
  ),
  schedule: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M6.6 9h6M9.2 12h8.2M6.6 15h4.8" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
    </>
  ),
  suppliers: (
    <>
      <rect x="3.5" y="4.5" width="7" height="6" rx="1" />
      <rect x="13.5" y="4.5" width="7" height="6" rx="1" />
      <rect x="8.5" y="13.5" width="7" height="6" rx="1" />
    </>
  ),
  quotes: (
    <>
      <rect x="5.5" y="3.5" width="13" height="17" rx="1.5" />
      <path d="M12 6.8v10.4" />
      <path d="M14.4 9.4c0-1.1-1.1-1.8-2.4-1.8s-2.4.7-2.4 1.8c0 2.4 4.8 1.4 4.8 3.9 0 1.1-1.1 1.8-2.4 1.8s-2.4-.7-2.4-1.8" />
    </>
  ),
  deliveries: (
    <>
      <path d="M3.5 7.5a1 1 0 0 1 1-1h8v10h-9v-9Z" />
      <path d="M12.5 9.5h3.7l3.3 3.4v3.6h-7" />
      <circle cx="7.2" cy="18.4" r="1.8" />
      <circle cx="16.8" cy="18.4" r="1.8" />
    </>
  ),
  payments: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M3.5 10h17M7 14.6h3.5" />
    </>
  ),
  execution: (
    <>
      <path d="M4.5 16.5a7.5 7.5 0 0 1 15 0" />
      <path d="M9.6 16.5V7.3a1.7 1.7 0 0 1 1.7-1.7h1.4a1.7 1.7 0 0 1 1.7 1.7v9.2" />
      <path d="M3.5 16.5h17" />
    </>
  ),
  purchases: (
    <>
      <path d="M7.2 8.5h9.6l1 11.2a.8.8 0 0 1-.8.8H7a.8.8 0 0 1-.8-.8L7.2 8.5Z" />
      <path d="M9.4 10.5V7.2a2.6 2.6 0 0 1 5.2 0v3.3" />
    </>
  ),
  site: (
    <>
      <path d="M12 20.5s6.4-5.4 6.4-9.9a6.4 6.4 0 1 0-12.8 0c0 4.5 6.4 9.9 6.4 9.9Z" />
      <circle cx="12" cy="10.4" r="2.3" />
    </>
  ),
  money: (
    <>
      <rect x="3.5" y="6.5" width="17" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <Dot cx={6.9} cy={12} />
      <Dot cx={17.1} cy={12} />
    </>
  ),
  clients: (
    <>
      <circle cx="9.2" cy="8.6" r="3.1" />
      <path d="M3.5 19.5a5.7 5.7 0 0 1 11.4 0" />
      <path d="M15.4 6.1a3.1 3.1 0 0 1 0 5.6M16.6 14.2a5.7 5.7 0 0 1 3.9 5.3" />
    </>
  ),
  team: (
    <>
      <circle cx="8" cy="9" r="2.6" />
      <circle cx="16" cy="9" r="2.6" />
      <path d="M3.5 18.8a4.5 4.5 0 0 1 9 0M11.5 18.8a4.5 4.5 0 0 1 9 0" />
    </>
  ),
  tools: (
    <>
      <path d="M19.3 5.1 16.5 8l-2.5-2.5 2.9-2.8a5.6 5.6 0 0 0-7.1 6.8l-6 6a2 2 0 1 0 2.8 2.8l6-6a5.6 5.6 0 0 0 6.7-7.2Z" />
    </>
  ),
  plan: (
    <>
      <path d="M5 4.5v15" />
      <circle cx="5" cy="8.2" r="1.8" />
      <circle cx="5" cy="15.8" r="1.8" />
      <path d="M8.6 8.2h11.4M8.6 15.8h7.4" />
    </>
  ),
  canvas: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <rect x="6.6" y="8" width="5" height="4.4" rx="0.8" />
      <rect x="13" y="11.6" width="4.6" height="4.4" rx="0.8" />
    </>
  ),
  simulator: (
    <>
      <rect x="3.5" y="5.5" width="11" height="9" rx="1.5" />
      <path d="M9 14.5v4M6.4 18.5h5.2" />
      <rect x="16" y="9.5" width="4.5" height="9" rx="1.5" />
    </>
  ),
  actions: <path d="M13.6 3.5 6 13.4h5l-.6 7.1 7.6-9.9h-5l.6-7.1Z" />,
  tokens: (
    <>
      <circle cx="9.2" cy="9.2" r="4.7" />
      <circle cx="14.8" cy="14.8" r="4.7" />
    </>
  ),
  testing: (
    <>
      <path d="M10 3.5v6.2l-4.8 8.1a1.6 1.6 0 0 0 1.4 2.7h10.8a1.6 1.6 0 0 0 1.4-2.7L14 9.7V3.5" />
      <path d="M8.5 3.5h7M7.5 14.6h9" />
    </>
  ),
  folder: <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4.2l2 2.5H19A1.5 1.5 0 0 1 20.5 9v9a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V6.5Z" />,
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m15.4 15.4 4.6 4.6" />
    </>
  ),
  filter: (
    <>
      <path d="M4 7.5h16M4 12h16M4 16.5h16" />
      <circle cx="9" cy="7.5" r="1.9" />
      <circle cx="15" cy="12" r="1.9" />
      <circle cx="7.5" cy="16.5" r="1.9" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  'chevron-right': <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  'chevron-left': <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />,
  'chevron-down': <path d="m5.5 9.5 6.5 6.5 6.5-6.5" />,
  external: (
    <>
      <path d="M14 3.8h6.2V10" />
      <path d="M20.2 3.8 11.4 12.6" />
      <path d="M18 14.2V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7.5A1.5 1.5 0 0 1 5 6h4.8" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.8v10" />
      <path d="m8.3 10.1 3.7 3.7 3.7-3.7" />
      <path d="M4.5 16v3a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
      <path d="M15.5 5.6V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v9A1.5 1.5 0 0 0 5 15.5h.6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12.6 4.8 4.8L19 6.6" />,
  warning: (
    <>
      <path d="M12 4.2 20.8 19.5H3.2L12 4.2Z" />
      <path d="M12 10v4.2" />
      <Dot cx={12} cy={17.2} />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11.2v5.4" />
      <Dot cx={12} cy={8.1} />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.4" r="3.5" />
      <path d="M5 20.4a7 7 0 0 1 14 0" />
    </>
  ),
  home: (
    <>
      <path d="M4 10.4 12 4l8 6.4v9.1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.1Z" />
      <path d="M9.4 20.5v-6h5.2v6" />
    </>
  ),
  back: (
    <>
      <path d="M20 12H4.5" />
      <path d="m10.2 6-5.7 6 5.7 6" />
    </>
  ),
  note: (
    <>
      <path d="M5.5 5a1.5 1.5 0 0 1 1.5-1.5h10A1.5 1.5 0 0 1 18.5 5v10.5l-5 5H7A1.5 1.5 0 0 1 5.5 19V5Z" />
      <path d="M18.5 15.5h-3.5a1.5 1.5 0 0 0-1.5 1.5v3.5" />
      <path d="M9 8.6h6M9 12h4" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="3.2" />,
  more: (
    <>
      <Dot cx={6} cy={12} r={1.3} />
      <Dot cx={12} cy={12} r={1.3} />
      <Dot cx={18} cy={12} r={1.3} />
    </>
  ),
  menu: <path d="M4 6.8h16M4 12h16M4 17.2h16" />,
  moon: <path d="M20.3 14.6A8.6 8.6 0 1 1 9.4 3.7a6.9 6.9 0 0 0 10.9 10.9Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.3" />
      <path d="M12 2.6v2.4M12 19v2.4M2.6 12H5M19 12h2.4M5.3 5.3 7 7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7" />
    </>
  ),
  pin: (
    <>
      <path d="M9 3.6h6l-1 4.9 3.3 3.3H6.7L10 8.5l-1-4.9Z" />
      <path d="M12 11.8v8.6" />
    </>
  ),
  print: (
    <>
      <path d="M7.5 8.5V3.8h9v4.7" />
      <path d="M7.5 15.5H5.2A1.7 1.7 0 0 1 3.5 13.8v-3.6A1.7 1.7 0 0 1 5.2 8.5h13.6a1.7 1.7 0 0 1 1.7 1.7v3.6a1.7 1.7 0 0 1-1.7 1.7h-2.3" />
      <path d="M7.5 13.4h9v6.8h-9z" />
      <Dot cx={17.2} cy={11.1} />
    </>
  ),
  flag: (
    <>
      <path d="M6 20.8V3.8" />
      <path d="M6 4.6h11.6l-2.4 4 2.4 4H6" />
    </>
  ),
};
/* eslint-enable react/jsx-key */

/**
 * One glyph of the system's icon set (P-07). Geometric and calm to sit next to the silver brand: 24 x 24
 * grid, 1.75 stroke, round caps and joins, `currentColor` so light, dark and the metal switch all apply.
 * Sized from the `--icon-*` tokens, which follow `--scale`, so an icon grows with its text up to 4K (P-01).
 * Decorative by default: nav rows, cards and tree rows keep their text label, and the icon is `aria-hidden`
 * so it is never the only signal (P-03). Pass `label` only when the icon stands alone.
 */
export function Icon({ name, size = 'md', label, tone = 'default', className }: IconProps) {
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const };
  return (
    <svg
      className={cx('icon', `icon--${size}`, tone !== 'default' && `icon--${tone}`, className)}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      data-icon={name}
      {...a11y}
    >
      {PATHS[name]}
    </svg>
  );
}
