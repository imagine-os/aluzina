/** English primary, Spanish optional and falling back to English (P-13, D-004). */
export type Lang = 'en' | 'es';
export type StringEntry = string | { en: string; es?: string };
export type StringTable = Record<string, StringEntry>;
export const LANGS: readonly Lang[] = ['en', 'es'];
