import { tokens, type MetalName } from '../../design/tokens';

/** Reserved by the design system for the gold / silver preview (docs/design/brand-system.md section 2). */
export const METAL_STORAGE_KEY = 'aluzina.metal';

export const METAL_NAMES = Object.keys(tokens.metal) as MetalName[];

export function isMetalName(v: string | null | undefined): v is MetalName {
  return !!v && (METAL_NAMES as string[]).includes(v);
}

/** The finish the document is painted with right now (the attribute wins, then the token default). */
export function currentMetal(): MetalName {
  if (typeof document === 'undefined') return tokens.metalDefault;
  const attr = document.documentElement.dataset.metal;
  return isMetalName(attr) ? attr : tokens.metalDefault;
}

/** Preview a finish: sets <html data-metal> and remembers it on this device. The real switch is tokens.metalDefault. */
export function applyMetal(metal: MetalName): void {
  document.documentElement.dataset.metal = metal;
  try {
    localStorage.setItem(METAL_STORAGE_KEY, metal);
  } catch {
    /* storage unavailable */
  }
}

/** Re-applies a stored preview on boot (the module is imported eagerly by the route registry). */
export function applyStoredMetal(): void {
  if (typeof document === 'undefined') return;
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(METAL_STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
  if (isMetalName(stored)) document.documentElement.dataset.metal = stored;
}
