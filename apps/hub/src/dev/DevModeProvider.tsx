import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export const DEV_MODE_STORAGE_KEY = 'aluzina.devMode';

interface DevModeCtx {
  devMode: boolean;
  setDevMode: (on: boolean) => void;
  toggleDevMode: () => void;
}

const Ctx = createContext<DevModeCtx | null>(null);

function readInitial(): boolean {
  try {
    return localStorage.getItem(DEV_MODE_STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

/**
 * Dev mode reveals the SpecChip, the actions panel and always-visible placeholder
 * markers (P-09). Until real auth exists it is a plain toggle; later it is gated
 * by the `dev.tools` permission (P-12).
 */
export function DevModeProvider({ children }: { children: ReactNode }) {
  const [devMode, setState] = useState<boolean>(readInitial);

  const setDevMode = useCallback((on: boolean) => {
    setState(on);
    try {
      localStorage.setItem(DEV_MODE_STORAGE_KEY, on ? 'on' : 'off');
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggleDevMode = useCallback(() => setDevMode(!devMode), [devMode, setDevMode]);

  useEffect(() => {
    if (devMode) document.documentElement.setAttribute('data-dev', 'on');
    else document.documentElement.removeAttribute('data-dev');
  }, [devMode]);

  const value = useMemo(() => ({ devMode, setDevMode, toggleDevMode }), [devMode, setDevMode, toggleDevMode]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDevMode(): DevModeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDevMode must be used inside <DevModeProvider>');
  return ctx;
}
