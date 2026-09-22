import type { ReactNode } from 'react';
import { Icon, isIconName, type IconName, type IconSize } from './Icon';
import { GLYPH_ICONS } from './iconMap';

/**
 * D-064 one level lower: a string `icon` / `glyph` prop resolves as an icon name first, then through `GLYPH_ICONS`
 * (the Unicode glyph the data still carries), and renders as the text itself last, so nothing ever renders blank.
 * Shared by `Button` (ar-21) and by `StatTile` / `EmptyState` (step 14 pass 3); anything that is not a string passes through.
 */
export function glyphNode(value: IconName | ReactNode, size?: IconSize): ReactNode {
  if (typeof value !== 'string') return value;
  if (isIconName(value)) return <Icon name={value} size={size} />;
  const mapped: IconName | undefined = GLYPH_ICONS[value];
  return mapped ? <Icon name={mapped} size={size} /> : value;
}
