import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang, StringTable } from './types';

export const LANG_STORAGE_KEY = 'aluzina.lang';

type Vars = Record<string, string | number>;

export interface I18n {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Vars) => string;
}

const I18nContext = createContext<I18n | null>(null);

function readStoredLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_STORAGE_KEY);
    if (v === 'en' || v === 'es') return v;
  } catch {
    /* storage unavailable */
  }
  return 'en';
}

export function I18nProvider({ strings, children }: { strings: StringTable; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: string, vars?: Vars): string => {
      const entry = strings[key];
      let text: string;
      if (entry === undefined) {
        if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${key}`);
        text = `<${key}>`;
      } else if (typeof entry === 'string') {
        text = entry;
      } else {
        text = (lang === 'es' && entry.es) || entry.en;
      }
      if (vars) {
        for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
      }
      return text;
    },
    [strings, lang],
  );

  const value = useMemo<I18n>(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Every visible string goes through this hook (P-13). */
export function useT(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used inside <I18nProvider>');
  return ctx;
}
