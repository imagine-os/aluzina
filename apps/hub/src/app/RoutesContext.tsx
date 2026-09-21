import { createContext, useContext, type ReactNode } from 'react';
import type { RouteDef } from '../specs/PageSpec';

const Ctx = createContext<RouteDef[] | null>(null);

/** Gives shells and dev pages the registered routes without importing the registry (no import cycles through modules). */
export function RoutesProvider({ routes, children }: { routes: RouteDef[]; children: ReactNode }) {
  return <Ctx.Provider value={routes}>{children}</Ctx.Provider>;
}

export function useRoutes(): RouteDef[] {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useRoutes must be used inside <RoutesProvider>');
  return ctx;
}
